/**
 * Search Provider Interface Types
 * 
 * REQ-SRCH-001: 検索フォールバック機構
 * REQ-SRCH-002: 検索結果の健全性チェック
 */

import type { SingleSearchProviderConfig } from '../../../config/types.js';

/**
 * 検索結果
 */
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * プロバイダーのヘルスステータス
 */
export interface ProviderHealthStatus {
  /** プロバイダー名 */
  name: string;
  /** 利用可能か */
  available: boolean;
  /** 最後の成功時刻 */
  lastSuccessTime?: Date;
  /** 最後のエラー時刻 */
  lastErrorTime?: Date;
  /** エラー回数 */
  errorCount?: number;
  /** 成功率（0-1） */
  successRate: number;
  /** 最後のエラーメッセージ */
  lastError?: string;
}

/**
 * 検索試行結果
 */
export interface SearchAttemptResult {
  /** プロバイダー名 */
  provider: string;
  /** 成功したか */
  success: boolean;
  /** 検索結果 */
  results: SearchResult[];
  /** エラーメッセージ */
  error?: string;
  /** 所要時間（ms） */
  durationMs: number;
}

/**
 * フォールバック付き検索結果
 */
export interface SearchWithFallbackResult {
  /** 最終的に成功したか */
  success: boolean;
  /** 検索結果 */
  results: SearchResult[];
  /** 使用したプロバイダー（成功時） */
  usedProvider: string | null;
  /** 各プロバイダーの試行結果 */
  attempts: SearchAttemptResult[];
  /** エラーメッセージ（全失敗時） */
  error?: string;
}

/**
 * 検索結果の健全性チェック結果
 */
export interface SearchHealthCheckResult {
  /** 正常なプロバイダー数 */
  healthy: number;
  /** 低下中のプロバイダー数 */
  degraded: number;
  /** 利用不可のプロバイダー数 */
  unavailable: number;
  /** 総プロバイダー数 */
  total: number;
  /** 各プロバイダーのステータス */
  providers: ProviderHealthStatus[];
}

/**
 * 検索プロバイダーインターフェース
 */
export interface SearchProvider {
  /** プロバイダー名 */
  readonly name: string;
  /** 優先度 */
  readonly priority: number;
  
  /**
   * 検索を実行
   * @param query 検索クエリ
   * @param maxResults 最大結果数
   * @returns 検索結果
   */
  search(query: string, maxResults: number): Promise<SearchResult[]>;
  
  /**
   * プロバイダーが利用可能かチェック
   * @returns 利用可能か
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * ヘルスステータスを取得
   * @returns ヘルスステータス
   */
  getHealthStatus(): ProviderHealthStatus;
}

/**
 * 検索プロバイダーのベースクラス
 */
export abstract class BaseSearchProvider implements SearchProvider {
  abstract readonly name: string;
  readonly priority: number;
  
  protected successCount = 0;
  protected errorCount = 0;
  protected lastSuccessTime?: Date;
  protected lastErrorTime?: Date;
  
  constructor(protected config: SingleSearchProviderConfig) {
    this.priority = config.priority;
  }
  
  abstract search(query: string, maxResults: number): Promise<SearchResult[]>;
  abstract isAvailable(): Promise<boolean>;
  
  getHealthStatus(): ProviderHealthStatus {
    const totalAttempts = this.successCount + this.errorCount;
    return {
      name: this.name,
      available: true, // サブクラスで上書き
      lastSuccessTime: this.lastSuccessTime,
      lastErrorTime: this.lastErrorTime,
      errorCount: this.errorCount,
      successRate: totalAttempts > 0 ? this.successCount / totalAttempts : 1,
    };
  }
  
  protected recordSuccess(): void {
    this.successCount++;
    this.lastSuccessTime = new Date();
  }
  
  protected recordError(): void {
    this.errorCount++;
    this.lastErrorTime = new Date();
  }
}
