/**
 * VisitRecoveryManager - ページ訪問リカバリーマネージャー
 *
 * TSK-1-004: VisitRecoveryManager実装
 * REQ-SRCH-004-01: visit失敗時フォールバック
 * REQ-SRCH-004-02: 自動リトライ
 * REQ-SRCH-004-03: 結果マージ
 * REQ-VISIT-004: アーカイブフォールバック（v1.11.0）
 * DES-SRCH-004: VisitRecoveryManager設計
 * DES-VISIT-004: Archive.today統合（v1.11.0）
 */

import { WaybackClient, type WaybackSnapshot, type WaybackClientConfig } from './wayback.js';
import { ArchiveTodayClient, type ArchiveTodaySnapshot, type ArchiveTodayClientConfig } from './archive-today.js';
import { RecoveryLogger, type RecoveryLoggerConfig, type ExtendedLogEntry } from '../../search/recovery/logger.js';

/**
 * ページ取得関数の型
 */
export type FetchFunction = (url: string) => Promise<PageFetchResult>;

/**
 * ページ取得結果
 */
export interface PageFetchResult {
  /** 取得に成功したかどうか */
  success: boolean;
  /** コンテンツ（成功時） */
  content?: string;
  /** タイトル（成功時） */
  title?: string;
  /** エラーメッセージ（失敗時） */
  error?: string;
  /** HTTPステータスコード */
  statusCode?: number;
}

/**
 * リカバリー結果
 */
export interface VisitRecoveryResult {
  /** 最終的に成功したかどうか */
  success: boolean;
  /** 元のURL */
  originalUrl: string;
  /** 実際に取得したURL（Wayback URLの可能性あり） */
  usedUrl: string;
  /** コンテンツ（成功時） */
  content?: string;
  /** タイトル（成功時） */
  title?: string;
  /** エラーメッセージ（失敗時） */
  error?: string;
  /** Wayback Machineを使用したかどうか */
  usedWayback: boolean;
  /** Archive.todayを使用したかどうか（v1.11.0） */
  usedArchiveToday?: boolean;
  /** Waybackスナップショット情報 */
  waybackSnapshot?: WaybackSnapshot;
  /** Archive.todayスナップショット情報（v1.11.0） */
  archiveTodaySnapshot?: ArchiveTodaySnapshot;
  /** 試行回数 */
  attempts: number;
  /** 処理時間（ms） */
  durationMs: number;
}

/**
 * VisitRecoveryManager 設定
 */
export interface VisitRecoveryConfig {
  /** 最大リトライ回数（デフォルト: 2） */
  maxRetries?: number;
  /** リトライ間隔（ms、デフォルト: 1000） */
  retryDelayMs?: number;
  /** タイムアウト（ms、デフォルト: 30000） */
  timeoutMs?: number;
  /** Wayback Machineを使用するかどうか（デフォルト: true） */
  enableWayback?: boolean;
  /** Archive.todayを使用するかどうか（デフォルト: true、v1.11.0） */
  enableArchiveToday?: boolean;
  /** WaybackClient設定 */
  waybackConfig?: Partial<WaybackClientConfig>;
  /** ArchiveTodayClient設定（v1.11.0） */
  archiveTodayConfig?: Partial<ArchiveTodayClientConfig>;
  /** RecoveryLogger設定 */
  loggerConfig?: Partial<RecoveryLoggerConfig>;
  /** RecoveryLoggerインスタンス（省略時は新規作成） */
  logger?: RecoveryLogger;
}

/**
 * デフォルト設定
 */
export const DEFAULT_VISIT_RECOVERY_CONFIG: Required<Omit<VisitRecoveryConfig, 'waybackConfig' | 'archiveTodayConfig' | 'loggerConfig' | 'logger'>> = {
  maxRetries: 2,
  retryDelayMs: 1000,
  timeoutMs: 30000,
  enableWayback: true,
  enableArchiveToday: true,
};

/**
 * VisitRecoveryManager - ページ訪問失敗時の自動リカバリー
 */
export class VisitRecoveryManager {
  private readonly config: Required<Omit<VisitRecoveryConfig, 'waybackConfig' | 'archiveTodayConfig' | 'loggerConfig' | 'logger'>>;
  private readonly waybackClient: WaybackClient | null;
  private readonly archiveTodayClient: ArchiveTodayClient | null;
  private readonly logger: RecoveryLogger;

  constructor(config?: VisitRecoveryConfig) {
    const { waybackConfig, archiveTodayConfig, loggerConfig, logger, ...restConfig } = config ?? {};
    this.config = { ...DEFAULT_VISIT_RECOVERY_CONFIG, ...restConfig };
    this.waybackClient = this.config.enableWayback ? new WaybackClient(waybackConfig) : null;
    this.archiveTodayClient = this.config.enableArchiveToday ? new ArchiveTodayClient(archiveTodayConfig) : null;
    this.logger = logger ?? new RecoveryLogger(loggerConfig);
  }

  /**
   * リカバリー付きページ取得を実行
   * @param url 取得対象のURL
   * @param fetchFn ページ取得関数
   */
  async recover(url: string, fetchFn: FetchFunction): Promise<VisitRecoveryResult> {
    const startTime = Date.now();
    let attempts = 0;
    let lastError: string | undefined;

    // 1. 元のURLでリトライ
    for (let i = 0; i <= this.config.maxRetries; i++) {
      attempts++;
      const attemptStart = Date.now();

      try {
        const result = await this.fetchWithTimeout(fetchFn, url);
        const durationMs = Date.now() - attemptStart;

        if (result.success) {
          this.logAttempt(url, url, 'direct', true, durationMs);

          return {
            success: true,
            originalUrl: url,
            usedUrl: url,
            content: result.content,
            title: result.title,
            usedWayback: false,
            attempts,
            durationMs: Date.now() - startTime,
          };
        }

        lastError = result.error ?? 'Unknown error';
        this.logAttempt(url, url, 'direct', false, durationMs, lastError);
      } catch (error) {
        const durationMs = Date.now() - attemptStart;
        lastError = error instanceof Error ? error.message : String(error);
        this.logAttempt(url, url, 'direct', false, durationMs, lastError);
      }

      // リトライ前に待機
      if (i < this.config.maxRetries) {
        await this.delay(this.config.retryDelayMs);
      }
    }

    // 2. Wayback Machineを使用してリカバリー
    if (this.waybackClient) {
      const waybackResult = await this.tryWayback(url, fetchFn, startTime, attempts);
      if (waybackResult) {
        return waybackResult;
      }
      attempts++; // Waybackの試行をカウント
    }

    // 3. Archive.todayを使用してリカバリー（v1.11.0）
    if (this.archiveTodayClient) {
      const archiveTodayResult = await this.tryArchiveToday(url, fetchFn, startTime, attempts);
      if (archiveTodayResult) {
        return archiveTodayResult;
      }
      attempts++; // Archive.todayの試行をカウント
    }

    // 4. すべての試行が失敗
    return {
      success: false,
      originalUrl: url,
      usedUrl: url,
      error: lastError ?? 'All recovery attempts failed',
      usedWayback: false,
      attempts,
      durationMs: Date.now() - startTime,
    };
  }

  /**
   * Wayback Machineを使用してリカバリーを試行
   */
  private async tryWayback(
    originalUrl: string,
    fetchFn: FetchFunction,
    startTime: number,
    currentAttempts: number
  ): Promise<VisitRecoveryResult | null> {
    if (!this.waybackClient) {
      return null;
    }

    const waybackAttemptStart = Date.now();
    const snapshot = await this.waybackClient.getSnapshot(originalUrl);

    if (!snapshot?.available) {
      this.logAttempt(originalUrl, originalUrl, 'wayback-check', false, Date.now() - waybackAttemptStart, 'No archive available');
      return null;
    }

    const attemptStart = Date.now();
    try {
      const result = await this.fetchWithTimeout(fetchFn, snapshot.url);
      const durationMs = Date.now() - attemptStart;

      if (result.success) {
        this.logAttempt(originalUrl, snapshot.url, 'wayback', true, durationMs);

        return {
          success: true,
          originalUrl,
          usedUrl: snapshot.url,
          content: result.content,
          title: result.title,
          usedWayback: true,
          waybackSnapshot: snapshot,
          attempts: currentAttempts + 1,
          durationMs: Date.now() - startTime,
        };
      }

      this.logAttempt(originalUrl, snapshot.url, 'wayback', false, durationMs, result.error);
    } catch (error) {
      const durationMs = Date.now() - attemptStart;
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logAttempt(originalUrl, snapshot.url, 'wayback', false, durationMs, errorMsg);
    }

    return null;
  }

  /**
   * Archive.todayを使用してリカバリーを試行（v1.11.0）
   */
  private async tryArchiveToday(
    originalUrl: string,
    fetchFn: FetchFunction,
    startTime: number,
    currentAttempts: number
  ): Promise<VisitRecoveryResult | null> {
    if (!this.archiveTodayClient) {
      return null;
    }

    const archiveTodayAttemptStart = Date.now();
    const snapshot = await this.archiveTodayClient.getSnapshot(originalUrl);

    if (!snapshot?.available) {
      this.logAttempt(originalUrl, originalUrl, 'archive-today-check', false, Date.now() - archiveTodayAttemptStart, 'No archive available');
      return null;
    }

    const attemptStart = Date.now();
    try {
      const result = await this.fetchWithTimeout(fetchFn, snapshot.url);
      const durationMs = Date.now() - attemptStart;

      if (result.success) {
        this.logAttempt(originalUrl, snapshot.url, 'archive-today', true, durationMs);

        return {
          success: true,
          originalUrl,
          usedUrl: snapshot.url,
          content: result.content,
          title: result.title,
          usedWayback: false,
          usedArchiveToday: true,
          archiveTodaySnapshot: snapshot,
          attempts: currentAttempts + 1,
          durationMs: Date.now() - startTime,
        };
      }

      this.logAttempt(originalUrl, snapshot.url, 'archive-today', false, durationMs, result.error);
    } catch (error) {
      const durationMs = Date.now() - attemptStart;
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logAttempt(originalUrl, snapshot.url, 'archive-today', false, durationMs, errorMsg);
    }

    return null;
  }

  /**
   * タイムアウト付きでページ取得を実行
   */
  private async fetchWithTimeout(fetchFn: FetchFunction, url: string): Promise<PageFetchResult> {
    return new Promise<PageFetchResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Request timed out after ${this.config.timeoutMs}ms`));
      }, this.config.timeoutMs);

      fetchFn(url)
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * リカバリー試行をログに記録
   */
  private logAttempt(
    originalUrl: string,
    usedUrl: string,
    strategy: 'direct' | 'wayback' | 'wayback-check' | 'archive-today' | 'archive-today-check',
    success: boolean,
    durationMs: number,
    error?: string
  ): void {
    const entry: Omit<ExtendedLogEntry, 'id'> = {
      originalQuery: originalUrl,
      alternativeQuery: usedUrl,
      strategy,
      resultCount: success ? 1 : 0,
      success,
      timestamp: new Date(),
      durationMs,
      type: 'visit',
      error,
    };

    this.logger.log(entry);

    // stderr にログ出力
    console.error(
      `[VisitRecovery] ${success ? '✓' : '✗'} "${originalUrl}" ${usedUrl !== originalUrl ? `→ "${usedUrl}"` : ''} (${strategy}) ${durationMs}ms`
    );
  }

  /**
   * 指定時間待機
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * RecoveryLoggerインスタンスを取得
   */
  getLogger(): RecoveryLogger {
    return this.logger;
  }

  /**
   * 統計情報を取得
   */
  getStats(): ReturnType<RecoveryLogger['getStats']> {
    return this.logger.getStats();
  }

  /**
   * WaybackClientインスタンスを取得
   */
  getWaybackClient(): WaybackClient | null {
    return this.waybackClient;
  }

  /**
   * ArchiveTodayClientインスタンスを取得（v1.11.0）
   */
  getArchiveTodayClient(): ArchiveTodayClient | null {
    return this.archiveTodayClient;
  }
}

/**
 * VisitRecoveryManagerのファクトリ関数
 */
export function createVisitRecoveryManager(config?: VisitRecoveryConfig): VisitRecoveryManager {
  return new VisitRecoveryManager(config);
}
