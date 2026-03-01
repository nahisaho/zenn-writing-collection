/**
 * SearchRecoveryManager
 *
 * TSK-006: SearchRecoveryManager
 * TSK-1-002: RecoveryLogger連携
 * REQ-SRCH-003: 検索失敗時の自動リカバリー
 * REQ-SRCH-005-03: フォールバックログ
 * DES-SRCH-003: 検索リカバリーシステム設計
 */

import type {
  AlternativeQuery,
  RecoveryResult,
  RecoveryAttempt,
  RecoveryStrategy,
  RecoveryLogEntry,
} from './types.js';
import type { SearchRecoveryConfig } from '../../../config/types.js';
import { SynonymStrategy, SimplifyStrategy, TranslateStrategy, DirectVisitStrategy } from './strategies/index.js';
import { DEFAULT_SEARCH_RECOVERY_CONFIG } from '../../../config/types.js';
import { RecoveryLogger, type ExtendedLogEntry, type RecoveryStats, type RecoveryLoggerConfig } from './logger.js';

/**
 * 検索関数の型
 */
export type SearchFunction = (query: string) => Promise<unknown[]>;

/**
 * SearchRecoveryManager拡張設定
 */
export interface SearchRecoveryManagerConfig extends Partial<SearchRecoveryConfig> {
  /** RecoveryLoggerインスタンス（省略時は新規作成） */
  logger?: RecoveryLogger;
  /** RecoveryLogger設定（loggerが指定されていない場合に使用） */
  loggerConfig?: Partial<RecoveryLoggerConfig>;
}

/**
 * 検索リカバリーマネージャー
 *
 * 検索結果が0件の場合に、自動的に代替クエリを生成してリトライする
 */
export class SearchRecoveryManager {
  private readonly strategies: RecoveryStrategy[];
  private readonly config: Required<Omit<SearchRecoveryConfig, 'strategies'>> & Pick<SearchRecoveryConfig, 'strategies'>;
  private readonly logEntries: RecoveryLogEntry[] = [];
  private readonly logger: RecoveryLogger;

  constructor(config?: SearchRecoveryManagerConfig) {
    const { logger, loggerConfig, ...recoveryConfig } = config ?? {};
    this.config = { ...DEFAULT_SEARCH_RECOVERY_CONFIG, ...recoveryConfig };
    this.strategies = this.initializeStrategies();
    this.logger = logger ?? new RecoveryLogger(loggerConfig);
  }

  /**
   * 戦略を初期化
   */
  private initializeStrategies(): RecoveryStrategy[] {
    const strategies: RecoveryStrategy[] = [];
    const strategyConfig = this.config.strategies;

    if (strategyConfig?.synonym?.enabled !== false) {
      strategies.push(new SynonymStrategy(strategyConfig?.synonym?.customDictionary));
    }

    if (strategyConfig?.simplify?.enabled !== false) {
      strategies.push(new SimplifyStrategy(strategyConfig?.simplify?.maxWords));
    }

    if (strategyConfig?.translate?.enabled !== false) {
      strategies.push(new TranslateStrategy(strategyConfig?.translate?.customDictionary));
    }

    // v1.14.0: DirectVisitStrategy (Level 3回復) を追加
    // 他の戦略で結果が得られない場合のフォールバック
    if ((strategyConfig as any)?.directVisit?.enabled !== false) {
      strategies.push(new DirectVisitStrategy());
    }

    // 優先度順にソート
    strategies.sort((a, b) => a.priority - b.priority);

    return strategies;
  }

  /**
   * リカバリー付き検索を実行
   */
  async recover(
    originalQuery: string,
    searchFn: SearchFunction
  ): Promise<RecoveryResult> {
    const startTime = Date.now();
    const attempts: RecoveryAttempt[] = [];
    let totalRetries = 0;

    // タイムアウト制御用のAbortController
    const timeoutMs = this.config.timeoutMs;
    const deadline = startTime + timeoutMs;

    // 代替クエリを生成
    const alternatives = this.generateAlternatives(originalQuery);

    // 各代替クエリで検索を試行
    for (const alternative of alternatives) {
      if (totalRetries >= this.config.maxRetries) {
        break;
      }

      // タイムアウトチェック
      if (Date.now() >= deadline) {
        break;
      }

      totalRetries++;
      const attemptStart = Date.now();

      try {
        const results = await this.executeWithTimeout(
          () => searchFn(alternative.query),
          deadline - Date.now()
        );

        const attemptDurationMs = Date.now() - attemptStart;
        const attempt: RecoveryAttempt = {
          query: alternative,
          resultCount: results.length,
          durationMs: attemptDurationMs,
          timestamp: new Date(),
        };
        attempts.push(attempt);

        // ログ記録
        this.logRecoveryAttempt(originalQuery, alternative, results.length, results.length > 0, attemptDurationMs);

        // 結果がある場合は成功
        if (results.length > 0) {
          return {
            success: true,
            originalQuery,
            usedQuery: alternative,
            attempts,
            results,
            totalRetries,
            durationMs: Date.now() - startTime,
          };
        }
      } catch (error) {
        const attemptDurationMs = Date.now() - attemptStart;
        const attempt: RecoveryAttempt = {
          query: alternative,
          resultCount: 0,
          durationMs: attemptDurationMs,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        };
        attempts.push(attempt);

        // ログ記録
        this.logRecoveryAttempt(originalQuery, alternative, 0, false, attemptDurationMs);
      }
    }

    // すべての試行が失敗
    return {
      success: false,
      originalQuery,
      attempts,
      totalRetries,
      durationMs: Date.now() - startTime,
    };
  }

  /**
   * 代替クエリを生成
   */
  generateAlternatives(query: string): AlternativeQuery[] {
    const allAlternatives: AlternativeQuery[] = [];

    for (const strategy of this.strategies) {
      if (strategy.isApplicable(query)) {
        const alternatives = strategy.generateAlternatives(query);
        allAlternatives.push(...alternatives);
      }
    }

    // 信頼度でソート（高い順）
    allAlternatives.sort((a, b) => b.confidence - a.confidence);

    // 重複除去
    const uniqueAlternatives = allAlternatives.filter(
      (alt, index, self) => self.findIndex((a) => a.query === alt.query) === index
    );

    return uniqueAlternatives;
  }

  /**
   * タイムアウト付きで関数を実行
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    if (timeoutMs <= 0) {
      throw new Error('Recovery timeout exceeded');
    }

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Recovery timeout exceeded'));
      }, timeoutMs);

      fn()
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
  private logRecoveryAttempt(
    originalQuery: string,
    alternative: AlternativeQuery,
    resultCount: number,
    success: boolean,
    durationMs: number
  ): void {
    // 旧形式のログエントリ（後方互換性のため維持）
    const entry: RecoveryLogEntry = {
      originalQuery,
      alternativeQuery: alternative.query,
      strategy: alternative.strategy,
      resultCount,
      success,
      timestamp: new Date(),
    };
    this.logEntries.push(entry);

    // 新形式のRecoveryLoggerにも記録
    const extendedEntry: Omit<ExtendedLogEntry, 'id'> = {
      originalQuery,
      alternativeQuery: alternative.query,
      strategy: alternative.strategy,
      resultCount,
      success,
      timestamp: new Date(),
      durationMs,
      confidence: alternative.confidence,
    };
    this.logger.log(extendedEntry);

    // stderr にログ出力
    console.error(
      `[SearchRecovery] ${success ? '✓' : '✗'} "${originalQuery}" → "${alternative.query}" (${alternative.strategy}) = ${resultCount}件`
    );
  }

  /**
   * ログエントリを取得（旧形式）
   */
  getLogEntries(): RecoveryLogEntry[] {
    return [...this.logEntries];
  }

  /**
   * ログをクリア
   */
  clearLog(): void {
    this.logEntries.length = 0;
    this.logger.clear();
  }

  /**
   * 有効な戦略一覧を取得
   */
  getActiveStrategies(): string[] {
    return this.strategies.map((s) => s.name);
  }

  /**
   * 統計情報を取得
   * @returns RecoveryStats
   */
  getStats(): RecoveryStats {
    return this.logger.getStats();
  }

  /**
   * 高頻度失敗クエリを取得
   * @param minFailures 最小失敗回数（省略時はデフォルトの閾値を使用）
   */
  getHighFrequencyQueries(minFailures?: number): ReturnType<RecoveryLogger['getHighFrequencyQueries']> {
    return this.logger.getHighFrequencyQueries(minFailures);
  }

  /**
   * RecoveryLoggerインスタンスを取得
   * @returns RecoveryLogger
   */
  getLogger(): RecoveryLogger {
    return this.logger;
  }
}

// 型エクスポート
export * from './types.js';
export * from './strategies/index.js';
export { RecoveryLogger, type ExtendedLogEntry, type RecoveryStats, type RecoveryLoggerConfig } from './logger.js';
