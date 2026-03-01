/**
 * RecoveryLogger - フォールバックログ統計・警告機能
 *
 * TSK-1-001: RecoveryLogger実装
 * REQ-SRCH-005-03: フォールバックログ
 * DES-SRCH-005-03: RecoveryLogger設計
 */

import type { RecoveryLogEntry } from './types.js';

/**
 * 戦略別統計
 */
export interface StrategyStats {
  /** 戦略名 */
  strategy: string;
  /** 試行回数 */
  attempts: number;
  /** 成功回数 */
  successCount: number;
  /** 成功率 */
  successRate: number;
  /** 平均処理時間（ms） */
  avgDurationMs: number;
}

/**
 * クエリ失敗情報
 */
export interface QueryFailureInfo {
  /** クエリ文字列 */
  query: string;
  /** 失敗回数 */
  failureCount: number;
  /** 最後の失敗日時 */
  lastFailure: Date;
  /** 試行した戦略一覧 */
  strategies: string[];
}

/**
 * リカバリー統計
 */
export interface RecoveryStats {
  /** 総試行回数 */
  totalAttempts: number;
  /** 成功回数 */
  successCount: number;
  /** 失敗回数 */
  failureCount: number;
  /** 成功率 */
  successRate: number;
  /** 平均処理時間（ms） */
  avgDurationMs: number;
  /** 戦略別統計 */
  byStrategy: Record<string, StrategyStats>;
  /** 高頻度失敗クエリ */
  highFrequencyFailures: QueryFailureInfo[];
  /** 統計期間開始 */
  periodStart: Date;
  /** 統計期間終了 */
  periodEnd: Date;
}

/**
 * 拡張ログエントリ（処理時間を含む）
 */
export interface ExtendedLogEntry extends RecoveryLogEntry {
  /** 一意のID */
  id: string;
  /** リカバリータイプ */
  type?: 'search' | 'visit';
  /** 処理時間（ms） */
  durationMs: number;
  /** エラーメッセージ（失敗時） */
  error?: string;
  /** 代替クエリの信頼度 */
  confidence?: number;
}

/**
 * ロガー設定
 */
export interface RecoveryLoggerConfig {
  /** 統計出力間隔（試行回数） */
  statsInterval: number;
  /** 高頻度失敗警告閾値 */
  warnThreshold: number;
  /** 最大ログエントリ保持数 */
  maxEntries: number;
  /** 統計集計期間（ms） */
  statsPeriodMs: number;
}

/**
 * デフォルト設定
 */
export const DEFAULT_LOGGER_CONFIG: RecoveryLoggerConfig = {
  statsInterval: 100,
  warnThreshold: 5,
  maxEntries: 1000,
  statsPeriodMs: 24 * 60 * 60 * 1000, // 24時間
};

/**
 * リカバリーログ管理クラス
 *
 * フォールバック試行のログ記録、統計計算、高頻度失敗クエリの検出を行う
 */
export class RecoveryLogger {
  private readonly entries: ExtendedLogEntry[] = [];
  private readonly config: RecoveryLoggerConfig;
  private readonly queryFailureMap: Map<string, QueryFailureInfo> = new Map();
  private attemptCount = 0;
  private idCounter = 0;

  constructor(config?: Partial<RecoveryLoggerConfig>) {
    this.config = { ...DEFAULT_LOGGER_CONFIG, ...config };
  }

  /**
   * UUIDライクなIDを生成
   */
  private generateId(): string {
    this.idCounter++;
    const timestamp = Date.now().toString(36);
    const counter = this.idCounter.toString(36).padStart(4, '0');
    return `${timestamp}-${counter}`;
  }

  /**
   * ログエントリを記録
   */
  log(entry: Omit<ExtendedLogEntry, 'id'>): void {
    const fullEntry: ExtendedLogEntry = {
      ...entry,
      id: this.generateId(),
    };

    this.entries.push(fullEntry);
    this.attemptCount++;

    // 最大エントリ数を超えたら古いものを削除
    if (this.entries.length > this.config.maxEntries) {
      this.entries.shift();
    }

    // 失敗マップを更新
    if (!entry.success) {
      this.updateFailureMap(entry);
    }

    // 定期的に統計を出力
    if (this.attemptCount % this.config.statsInterval === 0) {
      this.outputStats();
    }

    // 高頻度失敗をチェック
    this.checkHighFrequencyFailures(entry.originalQuery);
  }

  /**
   * 失敗マップを更新
   */
  private updateFailureMap(entry: Omit<ExtendedLogEntry, 'id'>): void {
    const existing = this.queryFailureMap.get(entry.originalQuery);

    if (existing) {
      existing.failureCount++;
      existing.lastFailure = entry.timestamp;
      if (!existing.strategies.includes(entry.strategy)) {
        existing.strategies.push(entry.strategy);
      }
    } else {
      this.queryFailureMap.set(entry.originalQuery, {
        query: entry.originalQuery,
        failureCount: 1,
        lastFailure: entry.timestamp,
        strategies: [entry.strategy],
      });
    }
  }

  /**
   * 高頻度失敗をチェックして警告
   */
  private checkHighFrequencyFailures(query: string): void {
    const failure = this.queryFailureMap.get(query);
    if (failure && failure.failureCount === this.config.warnThreshold) {
      console.error(
        `[RecoveryLogger] ⚠️ High frequency failure detected: "${query}" (${failure.failureCount} failures)`
      );
    }
  }

  /**
   * 統計をstderrに出力
   */
  private outputStats(): void {
    const stats = this.getStats();
    console.error(
      `[RecoveryLogger] 📊 Stats: ${stats.totalAttempts} attempts, ${(stats.successRate * 100).toFixed(1)}% success rate`
    );
  }

  /**
   * 統計情報を取得
   */
  getStats(): RecoveryStats {
    const now = new Date();
    const periodStart = new Date(now.getTime() - this.config.statsPeriodMs);

    // 期間内のエントリをフィルタ
    const recentEntries = this.entries.filter(
      (e) => e.timestamp >= periodStart
    );

    if (recentEntries.length === 0) {
      return {
        totalAttempts: 0,
        successCount: 0,
        failureCount: 0,
        successRate: 0,
        avgDurationMs: 0,
        byStrategy: {},
        highFrequencyFailures: [],
        periodStart,
        periodEnd: now,
      };
    }

    const successCount = recentEntries.filter((e) => e.success).length;
    const failureCount = recentEntries.length - successCount;
    const totalDurationMs = recentEntries.reduce(
      (sum, e) => sum + (e.durationMs || 0),
      0
    );

    // 戦略別統計
    const byStrategy: Record<string, StrategyStats> = {};
    for (const entry of recentEntries) {
      if (!byStrategy[entry.strategy]) {
        byStrategy[entry.strategy] = {
          strategy: entry.strategy,
          attempts: 0,
          successCount: 0,
          successRate: 0,
          avgDurationMs: 0,
        };
      }
      const stats = byStrategy[entry.strategy];
      stats.attempts++;
      if (entry.success) {
        stats.successCount++;
      }
    }

    // 戦略別の成功率と平均時間を計算
    for (const strategyName of Object.keys(byStrategy)) {
      const stats = byStrategy[strategyName];
      stats.successRate = stats.attempts > 0 ? stats.successCount / stats.attempts : 0;

      const strategyEntries = recentEntries.filter(
        (e) => e.strategy === strategyName
      );
      const strategyDuration = strategyEntries.reduce(
        (sum, e) => sum + (e.durationMs || 0),
        0
      );
      stats.avgDurationMs =
        strategyEntries.length > 0
          ? strategyDuration / strategyEntries.length
          : 0;
    }

    // 高頻度失敗クエリを取得
    const highFrequencyFailures = this.getHighFrequencyQueries(
      this.config.warnThreshold
    );

    return {
      totalAttempts: recentEntries.length,
      successCount,
      failureCount,
      successRate: recentEntries.length > 0 ? successCount / recentEntries.length : 0,
      avgDurationMs:
        recentEntries.length > 0 ? totalDurationMs / recentEntries.length : 0,
      byStrategy,
      highFrequencyFailures,
      periodStart,
      periodEnd: now,
    };
  }

  /**
   * 高頻度失敗クエリを取得
   */
  getHighFrequencyQueries(threshold?: number): QueryFailureInfo[] {
    const minFailures = threshold ?? this.config.warnThreshold;
    return Array.from(this.queryFailureMap.values())
      .filter((info) => info.failureCount >= minFailures)
      .sort((a, b) => b.failureCount - a.failureCount);
  }

  /**
   * ログをJSON形式でエクスポート
   */
  exportToJson(): string {
    const stats = this.getStats();
    return JSON.stringify(
      {
        period: `${stats.periodStart.toISOString()}/${stats.periodEnd.toISOString()}`,
        stats: {
          totalAttempts: stats.totalAttempts,
          successCount: stats.successCount,
          failureCount: stats.failureCount,
          successRate: stats.successRate,
          avgDurationMs: stats.avgDurationMs,
        },
        byStrategy: stats.byStrategy,
        highFrequencyFailures: stats.highFrequencyFailures,
        entries: this.entries.slice(-100), // 最新100件
      },
      null,
      2
    );
  }

  /**
   * ログエントリを取得
   */
  getEntries(): ExtendedLogEntry[] {
    return [...this.entries];
  }

  /**
   * ログをクリア
   */
  clear(): void {
    this.entries.length = 0;
    this.queryFailureMap.clear();
    this.attemptCount = 0;
  }

  /**
   * 試行回数を取得
   */
  getAttemptCount(): number {
    return this.attemptCount;
  }
}
