/**
 * Cache Module Types
 * v1.0.0 - REQ-CACHE-001
 *
 * キャッシュシステムの型定義
 */

/**
 * キャッシュエントリのメタデータ
 */
export interface CacheEntryMeta {
  /** エントリ作成日時 (ISO 8601) */
  createdAt: string;
  /** 最終アクセス日時 (ISO 8601) */
  lastAccessedAt: string;
  /** 有効期限 (ISO 8601) */
  expiresAt: string;
  /** アクセス回数 */
  accessCount: number;
  /** データサイズ (bytes) */
  size: number;
  /** ソース識別子 (search, visit, embedding等) */
  source: CacheSource;
  /** クエリのハッシュ */
  queryHash: string;
  /** 元のキャッシュキー */
  originalKey: string;
  /** 関連タグ */
  tags?: string[];
}

/**
 * キャッシュエントリ
 */
export interface CacheEntry<T = unknown> {
  /** キャッシュキー */
  key: string;
  /** キャッシュされた値 */
  value: T;
  /** メタデータ */
  meta: CacheEntryMeta;
}

/**
 * キャッシュソース種別
 */
export type CacheSource = 'search' | 'visit' | 'embedding' | 'analysis' | 'other';

/**
 * キャッシュ設定
 */
export interface CacheConfig {
  /** キャッシュを有効にするか */
  enabled: boolean;
  /** 最大エントリ数 */
  maxEntries: number;
  /** デフォルトTTL (秒) */
  defaultTtlSeconds: number;
  /** 最大キャッシュサイズ (bytes) */
  maxSizeBytes: number;
  /** キャッシュディレクトリパス */
  cacheDir: string;
  /** ソース別TTL設定 */
  ttlBySource?: Partial<Record<CacheSource, number>>;
  /** グローバルキャッシュを使用するか */
  useGlobalCache?: boolean;
}

/**
 * キャッシュ統計情報
 */
export interface CacheStats {
  /** 総エントリ数 */
  totalEntries: number;
  /** 総サイズ (bytes) */
  totalSizeBytes: number;
  /** キャッシュヒット数 */
  hits: number;
  /** キャッシュミス数 */
  misses: number;
  /** ヒット率 (0-1) */
  hitRate: number;
  /** 削除されたエントリ数 (TTL期限切れ) */
  expiredEvictions: number;
  /** 削除されたエントリ数 (LRU) */
  lruEvictions: number;
  /** ソース別統計 */
  bySource: Partial<Record<CacheSource, SourceCacheStats>>;
  /** 統計開始日時 */
  statsStartedAt: string;
}

/**
 * ソース別キャッシュ統計
 */
export interface SourceCacheStats {
  /** エントリ数 */
  entries: number;
  /** サイズ (bytes) */
  sizeBytes: number;
  /** ヒット数 */
  hits: number;
  /** ミス数 */
  misses: number;
}

/**
 * キャッシュ操作結果
 */
export interface CacheResult<T = unknown> {
  /** キャッシュヒットしたか */
  hit: boolean;
  /** 取得した値 (hitの場合) */
  value?: T;
  /** メタデータ (hitの場合) */
  meta?: CacheEntryMeta;
  /** キャッシュキー */
  key: string;
}

/**
 * キャッシュ保存オプション
 */
export interface CacheSetOptions {
  /** TTL (秒)。省略時はデフォルトTTL */
  ttlSeconds?: number;
  /** タグ */
  tags?: string[];
  /** ソース */
  source?: CacheSource;
}

/**
 * キャッシュクエリオプション
 */
export interface CacheQueryOptions {
  /** ソースでフィルタ */
  source?: CacheSource;
  /** タグでフィルタ (AND条件) */
  tags?: string[];
  /** 期限切れを含むか */
  includeExpired?: boolean;
  /** 最大取得数 */
  limit?: number;
}

/**
 * LRU削除候補
 */
export interface LruCandidate {
  /** キャッシュキー */
  key: string;
  /** 最終アクセス日時 */
  lastAccessedAt: string;
  /** サイズ */
  size: number;
}

/**
 * キャッシュストアインターフェース
 */
export interface ICacheStore {
  /** エントリを取得 */
  get<T = unknown>(key: string): Promise<CacheResult<T>>;

  /** エントリを保存 */
  set<T = unknown>(key: string, value: T, options?: CacheSetOptions): Promise<void>;

  /** エントリを削除 */
  delete(key: string): Promise<boolean>;

  /** 全エントリを削除 */
  clear(): Promise<void>;

  /** キーが存在するか確認 */
  has(key: string): Promise<boolean>;

  /** 統計情報を取得 */
  getStats(): Promise<CacheStats>;

  /** 期限切れエントリを削除 */
  evictExpired(): Promise<number>;

  /** LRUポリシーでエントリを削除 */
  evictLru(targetSizeBytes: number): Promise<number>;

  /** エントリを検索 */
  query(options: CacheQueryOptions): Promise<CacheEntry[]>;
}
