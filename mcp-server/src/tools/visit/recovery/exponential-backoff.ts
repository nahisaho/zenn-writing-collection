/**
 * Exponential Backoff - HTTPリトライ機構
 *
 * REQ-HTTP-001: HTTPエラーのインテリジェント・リトライ
 * DES-SHIKIGAMI-014 Section 3.2
 * TSK-TS-002
 *
 * @version 1.14.0
 */

/**
 * Exponential Backoff設定
 */
export interface ExponentialBackoffConfig {
  /** 初期遅延（ms、デフォルト: 1000） */
  initialDelayMs?: number;
  /** 最大遅延（ms、デフォルト: 30000） */
  maxDelayMs?: number;
  /** 乗数（デフォルト: 2） */
  multiplier?: number;
  /** ジッター（0-1、デフォルト: 0.1） */
  jitter?: number;
  /** 最大リトライ回数（デフォルト: 3） */
  maxRetries?: number;
  /** リトライ可能なHTTPステータスコード */
  retryableStatusCodes?: number[];
}

/**
 * Exponential Backoff設定（エイリアス）
 */
export type BackoffConfig = ExponentialBackoffConfig;

/**
 * リトライコンテキスト
 */
export interface RetryContext {
  /** 試行番号 */
  attempt: number;
  /** HTTPステータスコード */
  statusCode?: number;
  /** エラー */
  error?: Error;
}

/**
 * デフォルト設定
 */
export const DEFAULT_BACKOFF_CONFIG: Required<ExponentialBackoffConfig> = {
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  multiplier: 2,
  jitter: 0.1,
  maxRetries: 3,
  retryableStatusCodes: [
    408, // Request Timeout
    429, // Too Many Requests
    500, // Internal Server Error
    502, // Bad Gateway
    503, // Service Unavailable
    504, // Gateway Timeout
  ],
};

/**
 * リトライ結果
 */
export interface RetryResult<T> {
  /** 成功したかどうか */
  success: boolean;
  /** 結果（成功時） */
  result?: T;
  /** エラー（失敗時） */
  error?: Error;
  /** 試行回数 */
  attempts: number;
  /** 総遅延時間（ms） */
  totalDelayMs: number;
  /** 各試行の詳細 */
  attemptDetails: AttemptDetail[];
}

/**
 * 試行詳細
 */
export interface AttemptDetail {
  /** 試行番号 */
  attempt: number;
  /** 遅延時間（ms） */
  delayMs: number;
  /** HTTPステータスコード */
  statusCode?: number;
  /** エラーメッセージ */
  error?: string;
  /** タイムスタンプ */
  timestamp: Date;
}

/**
 * HTTP操作関数の型
 */
export type HttpOperation<T> = () => Promise<{
  result: T;
  statusCode: number;
}>;

/**
 * 遅延時間を計算（ジッター付き）
 */
export function calculateDelay(
  attempt: number,
  config: Required<ExponentialBackoffConfig>
): number {
  // 指数関数的に増加
  const baseDelay = config.initialDelayMs * Math.pow(config.multiplier, attempt);

  // 最大値を超えないようにクリップ
  const clippedDelay = Math.min(baseDelay, config.maxDelayMs);

  // ジッターを追加（±jitter%のランダム変動）
  const jitterRange = clippedDelay * config.jitter;
  const jitterOffset = (Math.random() * 2 - 1) * jitterRange;

  return Math.round(clippedDelay + jitterOffset);
}

/**
 * HTTPステータスコードがリトライ可能かどうかを判定
 */
export function isRetryableStatusCode(
  statusCode: number,
  retryableCodes: number[] = DEFAULT_BACKOFF_CONFIG.retryableStatusCodes
): boolean {
  return retryableCodes.includes(statusCode);
}

/**
 * エラーがリトライ可能かどうかを判定
 */
export function isRetryableError(error: Error): boolean {
  const retryableMessages = [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNREFUSED',
    'socket hang up',
    'EPIPE',
    'EAI_AGAIN',
  ];

  // メッセージベースの判定
  if (retryableMessages.some((msg) => error.message.includes(msg))) {
    return true;
  }

  // statusCodeプロパティベースの判定
  const statusCode = (error as any).statusCode;
  if (typeof statusCode === 'number') {
    return isRetryableStatusCode(statusCode);
  }

  return false;
}

/**
 * HTTPステータスコードの説明を取得
 */
export function getStatusCodeDescription(statusCode: number): string {
  const descriptions: Record<number, string> = {
    408: 'Request Timeout - サーバーがリクエストを待ちきれなかった',
    429: 'Too Many Requests - レート制限に達した',
    500: 'Internal Server Error - サーバー内部エラー',
    502: 'Bad Gateway - ゲートウェイエラー',
    503: 'Service Unavailable - サービス一時利用不可',
    504: 'Gateway Timeout - ゲートウェイタイムアウト',
  };

  return descriptions[statusCode] ?? `HTTP ${statusCode}`;
}

/**
 * 指定時間待機
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Exponential Backoffでリトライを実行
 */
export async function retryWithBackoff<T>(
  operation: HttpOperation<T>,
  config?: ExponentialBackoffConfig
): Promise<RetryResult<T>> {
  const effectiveConfig: Required<ExponentialBackoffConfig> = {
    ...DEFAULT_BACKOFF_CONFIG,
    ...config,
  };

  const attemptDetails: AttemptDetail[] = [];
  let totalDelayMs = 0;

  for (let attempt = 0; attempt <= effectiveConfig.maxRetries; attempt++) {
    const attemptStart = new Date();

    try {
      const { result, statusCode } = await operation();

      // 成功
      attemptDetails.push({
        attempt,
        delayMs: 0,
        statusCode,
        timestamp: attemptStart,
      });

      return {
        success: true,
        result,
        attempts: attempt + 1,
        totalDelayMs,
        attemptDetails,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // HTTPステータスコードを抽出（エラーメッセージから）
      const statusMatch = err.message.match(/status[:\s]+(\d{3})/i);
      const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : undefined;

      const attemptDetail: AttemptDetail = {
        attempt,
        delayMs: 0,
        statusCode,
        error: err.message,
        timestamp: attemptStart,
      };

      // リトライ可能かどうかを判定
      const shouldRetry =
        attempt < effectiveConfig.maxRetries &&
        (!statusCode || isRetryableStatusCode(statusCode, effectiveConfig.retryableStatusCodes));

      if (shouldRetry) {
        // 遅延時間を計算して待機
        const delayMs = calculateDelay(attempt, effectiveConfig);
        attemptDetail.delayMs = delayMs;
        totalDelayMs += delayMs;

        console.error(
          `[ExponentialBackoff] Attempt ${attempt + 1} failed (${statusCode ? `HTTP ${statusCode}` : err.message}), retrying in ${delayMs}ms...`
        );

        await delay(delayMs);
      }

      attemptDetails.push(attemptDetail);

      // 最後の試行でも失敗した場合、またはリトライ不可能な場合
      if (!shouldRetry) {
        return {
          success: false,
          error: err,
          attempts: attempt + 1,
          totalDelayMs,
          attemptDetails,
        };
      }
    }
  }

  // ここには到達しないはず
  return {
    success: false,
    error: new Error('Max retries exceeded'),
    attempts: effectiveConfig.maxRetries + 1,
    totalDelayMs,
    attemptDetails,
  };
}

/**
 * ExponentialBackoffManager - HTTP操作のリトライを管理
 */
export class ExponentialBackoffManager {
  private readonly config: Required<ExponentialBackoffConfig>;

  constructor(config?: ExponentialBackoffConfig) {
    this.config = { ...DEFAULT_BACKOFF_CONFIG, ...config };
  }

  /**
   * リトライを実行
   */
  async retry<T>(operation: HttpOperation<T>): Promise<RetryResult<T>> {
    return retryWithBackoff(operation, this.config);
  }

  /**
   * 過延時間を計算
   */
  calculateDelay(attempt: number): number {
    return calculateDelay(attempt, this.config);
  }

  /**
   * リトライすべきかを判定
   */
  shouldRetry(context: RetryContext): boolean {
    if (context.attempt >= this.config.maxRetries) return false;
    if (context.statusCode !== undefined) {
      return isRetryableStatusCode(context.statusCode, this.config.retryableStatusCodes);
    }
    if (context.error) {
      return isRetryableError(context.error);
    }
    return true;
  }

  /**
   * 関数をリトライ付きで実行
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const statusCode = (lastError as any).statusCode as number | undefined;

        const context: RetryContext = { attempt, statusCode, error: lastError };

        if (!this.shouldRetry(context)) {
          throw lastError;
        }

        if (attempt < this.config.maxRetries) {
          const delayMs = this.calculateDelay(attempt);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError ?? new Error('Max retries exceeded');
  }

  /**
   * 設定を取得
   */
  getConfig(): Required<ExponentialBackoffConfig> {
    return { ...this.config };
  }

  /**
   * リトライ可能なステータスコードを追加
   */
  addRetryableStatusCode(statusCode: number): void {
    if (!this.config.retryableStatusCodes.includes(statusCode)) {
      this.config.retryableStatusCodes.push(statusCode);
    }
  }

  /**
   * リトライ可能なステータスコードを削除
   */
  removeRetryableStatusCode(statusCode: number): void {
    const index = this.config.retryableStatusCodes.indexOf(statusCode);
    if (index !== -1) {
      this.config.retryableStatusCodes.splice(index, 1);
    }
  }
}
