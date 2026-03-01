/**
 * ExponentialBackoffManager テスト
 *
 * TSK-TEST-002
 * REQ-HTTP-001: Exponential Backoff リトライ
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  ExponentialBackoffManager,
  type BackoffConfig,
  type RetryContext,
  retryWithBackoff,
  isRetryableError,
  isRetryableStatusCode,
  DEFAULT_BACKOFF_CONFIG,
} from '../exponential-backoff.js';

describe('ExponentialBackoffManager', () => {
  let manager: ExponentialBackoffManager;

  beforeEach(() => {
    manager = new ExponentialBackoffManager();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('calculateDelay', () => {
    it('初回リトライの遅延を返す', () => {
      const delay = manager.calculateDelay(0);
      // attempt=0: initialDelayMs * multiplier^0 = initialDelayMs ± jitter
      expect(delay).toBeGreaterThanOrEqual(
        DEFAULT_BACKOFF_CONFIG.initialDelayMs * (1 - DEFAULT_BACKOFF_CONFIG.jitter)
      );
      expect(delay).toBeLessThanOrEqual(
        DEFAULT_BACKOFF_CONFIG.initialDelayMs * (1 + DEFAULT_BACKOFF_CONFIG.jitter)
      );
    });

    it('リトライ回数に応じて指数的に増加する', () => {
      // ジッターなしで比較するためカスタム設定
      const noJitterManager = new ExponentialBackoffManager({ jitter: 0 });
      const delay0 = noJitterManager.calculateDelay(0);
      const delay1 = noJitterManager.calculateDelay(1);
      const delay2 = noJitterManager.calculateDelay(2);

      expect(delay1).toBeGreaterThan(delay0);
      expect(delay2).toBeGreaterThan(delay1);
    });

    it('maxDelayMs を超えない', () => {
      const delay = manager.calculateDelay(100);
      expect(delay).toBeLessThanOrEqual(
        DEFAULT_BACKOFF_CONFIG.maxDelayMs * (1 + DEFAULT_BACKOFF_CONFIG.jitter)
      );
    });

    it('カスタム設定で動作する', () => {
      const customManager = new ExponentialBackoffManager({
        initialDelayMs: 500,
        maxDelayMs: 2000,
        multiplier: 3,
        jitter: 0,
      });

      expect(customManager.calculateDelay(0)).toBe(500);   // 500 * 3^0 = 500
      expect(customManager.calculateDelay(1)).toBe(1500);  // 500 * 3^1 = 1500
      expect(customManager.calculateDelay(2)).toBe(2000);  // 500 * 3^2 = 4500 → capped at 2000
    });
  });

  describe('shouldRetry', () => {
    it('最大リトライ回数未満であればtrueを返す', () => {
      const context: RetryContext = {
        attempt: 1,
        statusCode: 503,
        error: new Error('Service Unavailable'),
      };

      expect(manager.shouldRetry(context)).toBe(true);
    });

    it('最大リトライ回数に達したらfalseを返す', () => {
      const context: RetryContext = {
        attempt: DEFAULT_BACKOFF_CONFIG.maxRetries,
        statusCode: 503,
        error: new Error('Service Unavailable'),
      };

      expect(manager.shouldRetry(context)).toBe(false);
    });

    it('リトライ不可能なステータスコードではfalseを返す', () => {
      const context: RetryContext = {
        attempt: 1,
        statusCode: 404,
        error: new Error('Not Found'),
      };

      expect(manager.shouldRetry(context)).toBe(false);
    });

    it('リトライ可能なステータスコードではtrueを返す', () => {
      const retryableCodes = [408, 429, 500, 502, 503, 504];

      for (const code of retryableCodes) {
        const context: RetryContext = {
          attempt: 1,
          statusCode: code,
          error: new Error('Error'),
        };

        expect(manager.shouldRetry(context)).toBe(true);
      }
    });
  });

  describe('execute', () => {
    it('成功した場合、結果を返す', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await manager.execute(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('リトライ可能なエラーで再試行する', async () => {
      const error = new Error('Service Unavailable');
      (error as any).statusCode = 503;

      const fn = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');

      const executePromise = manager.execute(fn);

      // 1回目のリトライ待機
      await vi.advanceTimersByTimeAsync(DEFAULT_BACKOFF_CONFIG.initialDelayMs * 2);
      // 2回目のリトライ待機
      await vi.advanceTimersByTimeAsync(DEFAULT_BACKOFF_CONFIG.initialDelayMs * 4);

      const result = await executePromise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('最大リトライ回数を超えたらエラーをスローする', async () => {
      vi.useRealTimers();

      const shortManager = new ExponentialBackoffManager({
        maxRetries: 1,
        initialDelayMs: 1,
        maxDelayMs: 1,
      });

      const error = new Error('Service Unavailable');
      (error as any).statusCode = 503;

      const fn = vi.fn().mockRejectedValue(error);

      await expect(shortManager.execute(fn)).rejects.toThrow('Service Unavailable');
      expect(fn).toHaveBeenCalledTimes(2); // initial + 1 retry

      vi.useFakeTimers();
    });

    it('リトライ不可能なエラーは即座にスローする', async () => {
      const error = new Error('Not Found');
      (error as any).statusCode = 404;

      const fn = vi.fn().mockRejectedValue(error);

      await expect(manager.execute(fn)).rejects.toThrow('Not Found');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('関数をラップしてリトライ機能を提供する', async () => {
    const fn = vi.fn().mockResolvedValue({ result: 'success', statusCode: 200 });

    const result = await retryWithBackoff(fn);

    expect(result.success).toBe(true);
    expect(result.result).toBe('success');
  });

  it('カスタム設定を受け入れる', async () => {
    const fn = vi.fn().mockResolvedValue({ result: 'success', statusCode: 200 });

    const result = await retryWithBackoff(fn, {
      initialDelayMs: 100,
      maxRetries: 5,
    });

    expect(result.success).toBe(true);
  });
});

describe('isRetryableStatusCode', () => {
  it('408, 429, 500, 502, 503, 504 はリトライ可能', () => {
    expect(isRetryableStatusCode(408)).toBe(true);
    expect(isRetryableStatusCode(429)).toBe(true);
    expect(isRetryableStatusCode(500)).toBe(true);
    expect(isRetryableStatusCode(502)).toBe(true);
    expect(isRetryableStatusCode(503)).toBe(true);
    expect(isRetryableStatusCode(504)).toBe(true);
  });

  it('2xx, 3xx, 4xx（一部除く）はリトライ不可能', () => {
    expect(isRetryableStatusCode(200)).toBe(false);
    expect(isRetryableStatusCode(301)).toBe(false);
    expect(isRetryableStatusCode(400)).toBe(false);
    expect(isRetryableStatusCode(401)).toBe(false);
    expect(isRetryableStatusCode(403)).toBe(false);
    expect(isRetryableStatusCode(404)).toBe(false);
  });
});

describe('isRetryableError', () => {
  it('ネットワークエラーはリトライ可能', () => {
    const errors = [
      new Error('ECONNRESET'),
      new Error('ETIMEDOUT'),
      new Error('ENOTFOUND'),
      new Error('ECONNREFUSED'),
      new Error('socket hang up'),
    ];

    for (const error of errors) {
      expect(isRetryableError(error)).toBe(true);
    }
  });

  it('一般的なエラーはリトライ不可能', () => {
    expect(isRetryableError(new Error('Unknown error'))).toBe(false);
    expect(isRetryableError(new Error('Parse error'))).toBe(false);
  });

  it('statusCode プロパティを持つエラーを処理する', () => {
    const retryableError = new Error('Server Error');
    (retryableError as any).statusCode = 503;
    expect(isRetryableError(retryableError)).toBe(true);

    const nonRetryableError = new Error('Not Found');
    (nonRetryableError as any).statusCode = 404;
    expect(isRetryableError(nonRetryableError)).toBe(false);
  });
});
