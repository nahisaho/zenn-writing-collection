/**
 * VisitRecoveryManager テスト
 *
 * TSK-1-004: VisitRecoveryManager実装
 * REQ-SRCH-004-01: visit失敗時フォールバック
 * REQ-SRCH-004-02: 自動リトライ
 * REQ-SRCH-004-03: 結果マージ
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  VisitRecoveryManager,
  createVisitRecoveryManager,
  DEFAULT_VISIT_RECOVERY_CONFIG,
  type PageFetchResult,
} from '../index.js';
import { RecoveryLogger } from '../../../search/recovery/logger.js';

// globalThis.fetch をモック（WaybackClient用）
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('VisitRecoveryManager', () => {
  let manager: VisitRecoveryManager;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockFetch.mockReset();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    manager = new VisitRecoveryManager({
      retryDelayMs: 10, // テスト高速化
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('constructor', () => {
    it('should use default config when no config provided', () => {
      const manager = new VisitRecoveryManager();
      expect(manager).toBeInstanceOf(VisitRecoveryManager);
    });

    it('should merge custom config with defaults', () => {
      const manager = new VisitRecoveryManager({ maxRetries: 5 });
      expect(manager).toBeInstanceOf(VisitRecoveryManager);
    });

    it('should disable wayback when enableWayback is false', () => {
      const manager = new VisitRecoveryManager({ enableWayback: false });
      expect(manager.getWaybackClient()).toBeNull();
    });

    it('should use provided logger instance', () => {
      const customLogger = new RecoveryLogger({ warnThreshold: 100 });
      const manager = new VisitRecoveryManager({ logger: customLogger });
      expect(manager.getLogger()).toBe(customLogger);
    });
  });

  describe('recover', () => {
    it('should return success on first attempt when fetch succeeds', async () => {
      const mockFetchFn = vi.fn().mockResolvedValue({
        success: true,
        content: 'Test content',
        title: 'Test Title',
      });

      const result = await manager.recover('https://example.com', mockFetchFn);

      expect(result.success).toBe(true);
      expect(result.content).toBe('Test content');
      expect(result.title).toBe('Test Title');
      expect(result.usedWayback).toBe(false);
      expect(result.attempts).toBe(1);
      expect(mockFetchFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const mockFetchFn = vi
        .fn()
        .mockResolvedValueOnce({ success: false, error: 'Network error' })
        .mockResolvedValueOnce({ success: false, error: 'Network error' })
        .mockResolvedValueOnce({
          success: true,
          content: 'Test content',
          title: 'Test Title',
        });

      const result = await manager.recover('https://example.com', mockFetchFn);

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(3);
      expect(mockFetchFn).toHaveBeenCalledTimes(3);
    });

    it('should try wayback after all direct retries fail', async () => {
      const mockFetchFn = vi
        .fn()
        .mockResolvedValue({ success: false, error: 'Page not found' });

      // Wayback API mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          url: 'https://example.com',
          archived_snapshots: {
            closest: {
              url: 'https://web.archive.org/web/20240101/https://example.com',
              timestamp: '20240101120000',
              available: true,
            },
          },
        }),
      });

      // Wayback取得も失敗
      const result = await manager.recover('https://example.com', mockFetchFn);

      expect(result.success).toBe(false);
      expect(mockFetch).toHaveBeenCalled(); // Wayback APIが呼ばれた
    });

    it('should return wayback content on wayback success', async () => {
      const mockFetchFn = vi
        .fn()
        .mockImplementation((url: string) => {
          if (url.includes('web.archive.org')) {
            return Promise.resolve({
              success: true,
              content: 'Archived content',
              title: 'Archived Title',
            });
          }
          return Promise.resolve({ success: false, error: 'Page not found' });
        });

      // Wayback API mock
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          url: 'https://example.com',
          archived_snapshots: {
            closest: {
              url: 'https://web.archive.org/web/20240101/https://example.com',
              timestamp: '20240101120000',
              available: true,
            },
          },
        }),
      });

      const result = await manager.recover('https://example.com', mockFetchFn);

      expect(result.success).toBe(true);
      expect(result.usedWayback).toBe(true);
      expect(result.content).toBe('Archived content');
      expect(result.waybackSnapshot).toBeDefined();
    });

    it('should return failure when all attempts fail', async () => {
      const mockFetchFn = vi.fn().mockResolvedValue({
        success: false,
        error: 'Page not found',
      });

      // Wayback API mock - no archive available
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          url: 'https://example.com',
          archived_snapshots: {},
        }),
      });

      const result = await manager.recover('https://example.com', mockFetchFn);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.attempts).toBeGreaterThan(0);
    });

    it('should handle fetch function throwing errors', async () => {
      const mockFetchFn = vi.fn().mockRejectedValue(new Error('Network error'));

      // Wayback API mock - no archive
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          url: 'https://example.com',
          archived_snapshots: {},
        }),
      });

      const result = await manager.recover('https://example.com', mockFetchFn);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should skip wayback when enableWayback is false', async () => {
      const noWaybackManager = new VisitRecoveryManager({
        enableWayback: false,
        enableArchiveToday: false,
        maxRetries: 1,
        retryDelayMs: 10,
      });

      const mockFetchFn = vi.fn().mockResolvedValue({
        success: false,
        error: 'Page not found',
      });

      const result = await noWaybackManager.recover('https://example.com', mockFetchFn);

      expect(result.success).toBe(false);
      expect(result.usedWayback).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('logging', () => {
    it('should log attempts to RecoveryLogger', async () => {
      const mockFetchFn = vi.fn().mockResolvedValue({
        success: true,
        content: 'Test content',
        title: 'Test Title',
      });

      await manager.recover('https://example.com', mockFetchFn);

      const entries = manager.getLogger().getEntries();
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].type).toBe('visit');
    });

    it('should output to stderr', async () => {
      const mockFetchFn = vi.fn().mockResolvedValue({
        success: true,
        content: 'Test content',
        title: 'Test Title',
      });

      await manager.recover('https://example.com', mockFetchFn);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[VisitRecovery]')
      );
    });
  });

  describe('getStats', () => {
    it('should return stats from logger', async () => {
      const mockFetchFn = vi.fn().mockResolvedValue({
        success: true,
        content: 'Test content',
        title: 'Test Title',
      });

      await manager.recover('https://example.com', mockFetchFn);

      const stats = manager.getStats();
      expect(stats.totalAttempts).toBeGreaterThan(0);
    });
  });

  describe('createVisitRecoveryManager', () => {
    it('should create a VisitRecoveryManager instance', () => {
      const manager = createVisitRecoveryManager();
      expect(manager).toBeInstanceOf(VisitRecoveryManager);
    });

    it('should create with custom config', () => {
      const manager = createVisitRecoveryManager({ maxRetries: 5 });
      expect(manager).toBeInstanceOf(VisitRecoveryManager);
    });
  });

  describe('timeout handling', () => {
    it('should timeout long-running fetch', async () => {
      const slowManager = new VisitRecoveryManager({
        timeoutMs: 100,
        maxRetries: 0,
        enableWayback: false,
      });

      const mockFetchFn = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500))
      );

      const result = await slowManager.recover('https://example.com', mockFetchFn);

      expect(result.success).toBe(false);
      expect(result.error).toContain('timed out');
    });
  });
});
