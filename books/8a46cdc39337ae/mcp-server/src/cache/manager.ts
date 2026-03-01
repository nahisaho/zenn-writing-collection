/**
 * Query Cache Manager
 * v1.0.0 - REQ-CACHE-001-01
 *
 * 検索・訪問クエリのキャッシュ管理
 */

import { FileCacheStore, createCacheStore } from './store.js';
import {
  CacheConfig,
  CacheResult,
  CacheStats,
  CacheSource,
  CacheSetOptions,
} from './types.js';

/**
 * 検索クエリのキャッシュキー生成パラメータ
 */
export interface SearchCacheKeyParams {
  query: string;
  engine?: string;
  options?: Record<string, unknown>;
}

/**
 * 訪問クエリのキャッシュキー生成パラメータ
 */
export interface VisitCacheKeyParams {
  url: string;
  options?: {
    extractImages?: boolean;
    extractLinks?: boolean;
  };
}

/**
 * 埋め込みキャッシュキー生成パラメータ
 */
export interface EmbeddingCacheKeyParams {
  text: string;
  model?: string;
}

/**
 * キャッシュマネージャー設定
 */
export interface QueryCacheManagerConfig extends Partial<CacheConfig> {
  /** 自動期限切れ削除の間隔 (秒) */
  evictionIntervalSeconds?: number;
  /** 統計保存の間隔 (秒) */
  statsSaveIntervalSeconds?: number;
}

/**
 * クエリキャッシュマネージャー
 * 検索、訪問、埋め込みなどのクエリ結果をキャッシュ
 */
export class QueryCacheManager {
  private store: FileCacheStore;
  private config: QueryCacheManagerConfig;
  private evictionTimer?: NodeJS.Timeout;
  private statsSaveTimer?: NodeJS.Timeout;

  constructor(config: QueryCacheManagerConfig = {}) {
    this.config = {
      evictionIntervalSeconds: 300, // 5分
      statsSaveIntervalSeconds: 60, // 1分
      ...config,
    };
    this.store = createCacheStore(config);
  }

  /**
   * 定期的なメンテナンスタスクを開始
   */
  startMaintenanceTasks(): void {
    // 期限切れ削除タイマー
    if (this.config.evictionIntervalSeconds && this.config.evictionIntervalSeconds > 0) {
      this.evictionTimer = setInterval(
        () => this.store.evictExpired(),
        this.config.evictionIntervalSeconds * 1000
      );
    }

    // 統計保存タイマー
    if (this.config.statsSaveIntervalSeconds && this.config.statsSaveIntervalSeconds > 0) {
      this.statsSaveTimer = setInterval(
        () => this.store.saveStats(),
        this.config.statsSaveIntervalSeconds * 1000
      );
    }
  }

  /**
   * メンテナンスタスクを停止
   */
  stopMaintenanceTasks(): void {
    if (this.evictionTimer) {
      clearInterval(this.evictionTimer);
      this.evictionTimer = undefined;
    }
    if (this.statsSaveTimer) {
      clearInterval(this.statsSaveTimer);
      this.statsSaveTimer = undefined;
    }
  }

  /**
   * 検索クエリのキャッシュキーを生成
   */
  static generateSearchKey(params: SearchCacheKeyParams): string {
    const { query, engine = 'default', options = {} } = params;
    const optionsStr = Object.keys(options).length > 0 ? JSON.stringify(options) : '';
    return `search:${engine}:${query}${optionsStr ? ':' + optionsStr : ''}`;
  }

  /**
   * 訪問クエリのキャッシュキーを生成
   */
  static generateVisitKey(params: VisitCacheKeyParams): string {
    const { url, options = {} } = params;
    const optionsStr = Object.keys(options).length > 0 ? JSON.stringify(options) : '';
    return `visit:${url}${optionsStr ? ':' + optionsStr : ''}`;
  }

  /**
   * 埋め込みキャッシュキーを生成
   */
  static generateEmbeddingKey(params: EmbeddingCacheKeyParams): string {
    const { text, model = 'default' } = params;
    // テキストが長い場合はハッシュ化
    const textKey = text.length > 100 ? FileCacheStore.generateQueryHash(text) : text;
    return `embedding:${model}:${textKey}`;
  }

  /**
   * 検索結果をキャッシュから取得
   */
  async getSearchResult<T = unknown>(params: SearchCacheKeyParams): Promise<CacheResult<T>> {
    const key = QueryCacheManager.generateSearchKey(params);
    return this.store.get<T>(key);
  }

  /**
   * 検索結果をキャッシュに保存
   */
  async setSearchResult<T = unknown>(
    params: SearchCacheKeyParams,
    value: T,
    options: Omit<CacheSetOptions, 'source'> = {}
  ): Promise<void> {
    const key = QueryCacheManager.generateSearchKey(params);
    await this.store.set(key, value, { ...options, source: 'search' });
  }

  /**
   * 訪問結果をキャッシュから取得
   */
  async getVisitResult<T = unknown>(params: VisitCacheKeyParams): Promise<CacheResult<T>> {
    const key = QueryCacheManager.generateVisitKey(params);
    return this.store.get<T>(key);
  }

  /**
   * 訪問結果をキャッシュに保存
   */
  async setVisitResult<T = unknown>(
    params: VisitCacheKeyParams,
    value: T,
    options: Omit<CacheSetOptions, 'source'> = {}
  ): Promise<void> {
    const key = QueryCacheManager.generateVisitKey(params);
    await this.store.set(key, value, { ...options, source: 'visit' });
  }

  /**
   * 埋め込みベクトルをキャッシュから取得
   */
  async getEmbedding<T = unknown>(params: EmbeddingCacheKeyParams): Promise<CacheResult<T>> {
    const key = QueryCacheManager.generateEmbeddingKey(params);
    return this.store.get<T>(key);
  }

  /**
   * 埋め込みベクトルをキャッシュに保存
   */
  async setEmbedding<T = unknown>(
    params: EmbeddingCacheKeyParams,
    value: T,
    options: Omit<CacheSetOptions, 'source'> = {}
  ): Promise<void> {
    const key = QueryCacheManager.generateEmbeddingKey(params);
    await this.store.set(key, value, { ...options, source: 'embedding' });
  }

  /**
   * 汎用的なキャッシュ取得
   */
  async get<T = unknown>(key: string): Promise<CacheResult<T>> {
    return this.store.get<T>(key);
  }

  /**
   * 汎用的なキャッシュ保存
   */
  async set<T = unknown>(key: string, value: T, options: CacheSetOptions = {}): Promise<void> {
    await this.store.set(key, value, options);
  }

  /**
   * キャッシュエントリを削除
   */
  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  /**
   * URLに関連するキャッシュを削除
   */
  async invalidateUrl(url: string): Promise<number> {
    let deletedCount = 0;

    // 訪問キャッシュを削除
    const visitKey = QueryCacheManager.generateVisitKey({ url });
    if (await this.store.delete(visitKey)) {
      deletedCount++;
    }

    // URL関連の検索キャッシュを検索・削除
    const entries = await this.store.query({ source: 'visit' });
    for (const entry of entries) {
      if (entry.key.includes(url)) {
        await this.store.delete(entry.key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * 特定のソースのキャッシュをすべて削除
   */
  async invalidateBySource(source: CacheSource): Promise<number> {
    const entries = await this.store.query({ source });
    let deletedCount = 0;

    for (const entry of entries) {
      if (await this.store.delete(entry.key)) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * すべてのキャッシュをクリア
   */
  async clear(): Promise<void> {
    await this.store.clear();
  }

  /**
   * 統計情報を取得
   */
  async getStats(): Promise<CacheStats> {
    return this.store.getStats();
  }

  /**
   * 期限切れエントリを削除
   */
  async evictExpired(): Promise<number> {
    return this.store.evictExpired();
  }

  /**
   * キャッシュサマリーを取得（ログ用）
   */
  async getSummary(): Promise<string> {
    const stats = await this.getStats();
    const hitRatePercent = (stats.hitRate * 100).toFixed(1);
    const sizeMB = (stats.totalSizeBytes / (1024 * 1024)).toFixed(2);

    return [
      `Cache Summary:`,
      `  Entries: ${stats.totalEntries}`,
      `  Size: ${sizeMB} MB`,
      `  Hit Rate: ${hitRatePercent}%`,
      `  Hits: ${stats.hits}, Misses: ${stats.misses}`,
      `  Evictions: ${stats.expiredEvictions} (expired), ${stats.lruEvictions} (LRU)`,
    ].join('\n');
  }

  /**
   * ストアインスタンスを取得（テスト用）
   */
  getStore(): FileCacheStore {
    return this.store;
  }
}

/**
 * シングルトンインスタンス
 */
let defaultManager: QueryCacheManager | null = null;

/**
 * デフォルトのキャッシュマネージャーを取得
 */
export function getDefaultCacheManager(config?: QueryCacheManagerConfig): QueryCacheManager {
  if (!defaultManager) {
    defaultManager = new QueryCacheManager(config);
  }
  return defaultManager;
}

/**
 * キャッシュマネージャーを作成
 */
export function createCacheManager(config?: QueryCacheManagerConfig): QueryCacheManager {
  return new QueryCacheManager(config);
}
