/**
 * File-based Cache Store Implementation
 * v1.0.0 - REQ-CACHE-001-01
 *
 * ファイルベースのキャッシュストア実装
 * LRU削除ポリシー、TTL管理対応
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  ICacheStore,
  CacheEntry,
  CacheEntryMeta,
  CacheResult,
  CacheSetOptions,
  CacheQueryOptions,
  CacheStats,
  CacheConfig,
  CacheSource,
  SourceCacheStats,
  LruCandidate,
} from './types.js';

/**
 * デフォルトキャッシュ設定
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  maxEntries: 1000,
  defaultTtlSeconds: 3600, // 1時間
  maxSizeBytes: 100 * 1024 * 1024, // 100MB
  cacheDir: '.shikigami/cache',
  ttlBySource: {
    search: 3600, // 1時間
    visit: 86400, // 24時間
    embedding: 604800, // 7日
    analysis: 86400, // 24時間
    other: 3600, // 1時間
  },
  useGlobalCache: false,
};

/**
 * ファイルベースキャッシュストア
 */
export class FileCacheStore implements ICacheStore {
  private config: CacheConfig;
  private stats: CacheStats;
  private initialized: boolean = false;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    this.stats = this.initStats();
  }

  /**
   * 統計情報を初期化
   */
  private initStats(): CacheStats {
    return {
      totalEntries: 0,
      totalSizeBytes: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      expiredEvictions: 0,
      lruEvictions: 0,
      bySource: {},
      statsStartedAt: new Date().toISOString(),
    };
  }

  /**
   * キャッシュディレクトリを初期化
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    try {
      await fs.mkdir(this.config.cacheDir, { recursive: true });
      await fs.mkdir(path.join(this.config.cacheDir, 'data'), { recursive: true });
      await fs.mkdir(path.join(this.config.cacheDir, 'meta'), { recursive: true });
      this.initialized = true;

      // 既存の統計を読み込み
      await this.loadStats();
    } catch (error) {
      // ディレクトリ作成エラーは無視（すでに存在する場合）
      this.initialized = true;
    }
  }

  /**
   * キーからファイルパスを生成
   */
  private getFilePaths(key: string): { dataPath: string; metaPath: string } {
    const hash = crypto.createHash('sha256').update(key).digest('hex');
    const subDir = hash.substring(0, 2); // 最初の2文字でサブディレクトリ分割

    return {
      dataPath: path.join(this.config.cacheDir, 'data', subDir, `${hash}.json`),
      metaPath: path.join(this.config.cacheDir, 'meta', subDir, `${hash}.json`),
    };
  }

  /**
   * クエリからキャッシュキーを生成
   */
  static generateKey(query: string, source: CacheSource = 'other'): string {
    return `${source}:${query}`;
  }

  /**
   * クエリハッシュを生成
   */
  static generateQueryHash(query: string): string {
    return crypto.createHash('sha256').update(query).digest('hex').substring(0, 16);
  }

  /**
   * キャッシュエントリを取得
   */
  async get<T = unknown>(key: string): Promise<CacheResult<T>> {
    await this.ensureInitialized();

    const { dataPath, metaPath } = this.getFilePaths(key);

    try {
      // メタデータを読み込み
      const metaContent = await fs.readFile(metaPath, 'utf-8');
      const meta: CacheEntryMeta = JSON.parse(metaContent);

      // 期限切れチェック
      if (new Date(meta.expiresAt) < new Date()) {
        this.stats.misses++;
        this.updateHitRate();
        // 期限切れエントリを削除
        await this.delete(key);
        return { hit: false, key };
      }

      // データを読み込み
      const dataContent = await fs.readFile(dataPath, 'utf-8');
      const value = JSON.parse(dataContent) as T;

      // アクセス情報を更新
      meta.lastAccessedAt = new Date().toISOString();
      meta.accessCount++;
      await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));

      // 統計更新
      this.stats.hits++;
      this.updateSourceStats(meta.source, 'hit');
      this.updateHitRate();

      return { hit: true, value, meta, key };
    } catch (error) {
      // ファイルが存在しない場合
      this.stats.misses++;
      this.updateHitRate();
      return { hit: false, key };
    }
  }

  /**
   * キャッシュエントリを保存
   */
  async set<T = unknown>(key: string, value: T, options: CacheSetOptions = {}): Promise<void> {
    await this.ensureInitialized();

    const { dataPath, metaPath } = this.getFilePaths(key);
    const source = options.source || 'other';
    const ttlSeconds =
      options.ttlSeconds || this.config.ttlBySource?.[source] || this.config.defaultTtlSeconds;

    const now = new Date();
    const dataStr = JSON.stringify(value);
    const size = Buffer.byteLength(dataStr, 'utf-8');

    const meta: CacheEntryMeta = {
      createdAt: now.toISOString(),
      lastAccessedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + ttlSeconds * 1000).toISOString(),
      accessCount: 0,
      size,
      source,
      queryHash: FileCacheStore.generateQueryHash(key),
      originalKey: key,
      tags: options.tags,
    };

    // サイズ超過時はLRU削除
    if (this.stats.totalSizeBytes + size > this.config.maxSizeBytes) {
      await this.evictLru(size);
    }

    // エントリ数超過時はLRU削除
    if (this.stats.totalEntries >= this.config.maxEntries) {
      await this.evictLru(size);
    }

    // ディレクトリ作成
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.mkdir(path.dirname(metaPath), { recursive: true });

    // ファイル書き込み
    await fs.writeFile(dataPath, dataStr);
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));

    // 統計更新
    this.stats.totalEntries++;
    this.stats.totalSizeBytes += size;
    this.updateSourceStats(source, 'add', size);
  }

  /**
   * キャッシュエントリを削除
   */
  async delete(key: string): Promise<boolean> {
    await this.ensureInitialized();

    const { dataPath, metaPath } = this.getFilePaths(key);

    try {
      // メタデータを読んでサイズを取得
      const metaContent = await fs.readFile(metaPath, 'utf-8');
      const meta: CacheEntryMeta = JSON.parse(metaContent);

      // ファイル削除
      await fs.unlink(dataPath).catch(() => {});
      await fs.unlink(metaPath).catch(() => {});

      // 統計更新
      this.stats.totalEntries = Math.max(0, this.stats.totalEntries - 1);
      this.stats.totalSizeBytes = Math.max(0, this.stats.totalSizeBytes - meta.size);
      this.updateSourceStats(meta.source, 'remove', meta.size);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * 全エントリを削除
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();

    try {
      await fs.rm(path.join(this.config.cacheDir, 'data'), { recursive: true, force: true });
      await fs.rm(path.join(this.config.cacheDir, 'meta'), { recursive: true, force: true });
      await fs.mkdir(path.join(this.config.cacheDir, 'data'), { recursive: true });
      await fs.mkdir(path.join(this.config.cacheDir, 'meta'), { recursive: true });
    } catch {
      // 削除エラーは無視
    }

    // 統計リセット
    this.stats = this.initStats();
  }

  /**
   * キーが存在するか確認
   */
  async has(key: string): Promise<boolean> {
    const result = await this.get(key);
    return result.hit;
  }

  /**
   * 統計情報を取得
   */
  async getStats(): Promise<CacheStats> {
    return { ...this.stats };
  }

  /**
   * 期限切れエントリを削除
   */
  async evictExpired(): Promise<number> {
    await this.ensureInitialized();

    let evictedCount = 0;
    const metaDir = path.join(this.config.cacheDir, 'meta');

    try {
      const subDirs = await fs.readdir(metaDir);

      for (const subDir of subDirs) {
        const subDirPath = path.join(metaDir, subDir);
        const stat = await fs.stat(subDirPath);
        if (!stat.isDirectory()) continue;

        const files = await fs.readdir(subDirPath);

        for (const file of files) {
          if (!file.endsWith('.json')) continue;

          const metaPath = path.join(subDirPath, file);
          try {
            const metaContent = await fs.readFile(metaPath, 'utf-8');
            const meta: CacheEntryMeta = JSON.parse(metaContent);

            if (new Date(meta.expiresAt) < new Date()) {
              const hash = file.replace('.json', '');
              const dataPath = path.join(this.config.cacheDir, 'data', subDir, `${hash}.json`);

              await fs.unlink(dataPath).catch(() => {});
              await fs.unlink(metaPath).catch(() => {});

              this.stats.totalEntries = Math.max(0, this.stats.totalEntries - 1);
              this.stats.totalSizeBytes = Math.max(0, this.stats.totalSizeBytes - meta.size);
              this.stats.expiredEvictions++;
              evictedCount++;
            }
          } catch {
            // ファイル読み込みエラーは無視
          }
        }
      }
    } catch {
      // ディレクトリ読み込みエラーは無視
    }

    return evictedCount;
  }

  /**
   * LRUポリシーでエントリを削除
   */
  async evictLru(targetSizeBytes: number): Promise<number> {
    await this.ensureInitialized();

    // まず期限切れを削除
    await this.evictExpired();

    // まだサイズ超過なら古いものから削除
    if (this.stats.totalSizeBytes + targetSizeBytes <= this.config.maxSizeBytes) {
      return 0;
    }

    const candidates: LruCandidate[] = [];
    const metaDir = path.join(this.config.cacheDir, 'meta');

    try {
      const subDirs = await fs.readdir(metaDir);

      for (const subDir of subDirs) {
        const subDirPath = path.join(metaDir, subDir);
        const stat = await fs.stat(subDirPath);
        if (!stat.isDirectory()) continue;

        const files = await fs.readdir(subDirPath);

        for (const file of files) {
          if (!file.endsWith('.json')) continue;

          const metaPath = path.join(subDirPath, file);
          try {
            const metaContent = await fs.readFile(metaPath, 'utf-8');
            const meta: CacheEntryMeta = JSON.parse(metaContent);
            const hash = file.replace('.json', '');

            candidates.push({
              key: `${subDir}/${hash}`,
              lastAccessedAt: meta.lastAccessedAt,
              size: meta.size,
            });
          } catch {
            // ファイル読み込みエラーは無視
          }
        }
      }
    } catch {
      return 0;
    }

    // 古い順にソート
    candidates.sort(
      (a, b) => new Date(a.lastAccessedAt).getTime() - new Date(b.lastAccessedAt).getTime()
    );

    let evictedCount = 0;
    let freedBytes = 0;
    const targetFree = targetSizeBytes;

    for (const candidate of candidates) {
      if (freedBytes >= targetFree) break;

      const [subDir, hash] = candidate.key.split('/');
      const dataPath = path.join(this.config.cacheDir, 'data', subDir, `${hash}.json`);
      const metaPath = path.join(this.config.cacheDir, 'meta', subDir, `${hash}.json`);

      await fs.unlink(dataPath).catch(() => {});
      await fs.unlink(metaPath).catch(() => {});

      freedBytes += candidate.size;
      evictedCount++;
      this.stats.lruEvictions++;
      this.stats.totalEntries = Math.max(0, this.stats.totalEntries - 1);
      this.stats.totalSizeBytes = Math.max(0, this.stats.totalSizeBytes - candidate.size);
    }

    return evictedCount;
  }

  /**
   * エントリを検索
   */
  async query(options: CacheQueryOptions): Promise<CacheEntry[]> {
    await this.ensureInitialized();

    const entries: CacheEntry[] = [];
    const metaDir = path.join(this.config.cacheDir, 'meta');
    const limit = options.limit || 100;

    try {
      const subDirs = await fs.readdir(metaDir);

      for (const subDir of subDirs) {
        if (entries.length >= limit) break;

        const subDirPath = path.join(metaDir, subDir);
        const stat = await fs.stat(subDirPath);
        if (!stat.isDirectory()) continue;

        const files = await fs.readdir(subDirPath);

        for (const file of files) {
          if (entries.length >= limit) break;
          if (!file.endsWith('.json')) continue;

          const metaPath = path.join(subDirPath, file);
          try {
            const metaContent = await fs.readFile(metaPath, 'utf-8');
            const meta: CacheEntryMeta = JSON.parse(metaContent);

            // 期限切れフィルタ
            if (!options.includeExpired && new Date(meta.expiresAt) < new Date()) {
              continue;
            }

            // ソースフィルタ
            if (options.source && meta.source !== options.source) {
              continue;
            }

            // タグフィルタ
            if (options.tags && options.tags.length > 0) {
              const metaTags = meta.tags || [];
              const hasAllTags = options.tags.every((tag) => metaTags.includes(tag));
              if (!hasAllTags) continue;
            }

            // データを読み込み
            const hash = file.replace('.json', '');
            const dataPath = path.join(this.config.cacheDir, 'data', subDir, `${hash}.json`);
            const dataContent = await fs.readFile(dataPath, 'utf-8');
            const value = JSON.parse(dataContent);

            entries.push({
              key: meta.originalKey || `${meta.source}:${meta.queryHash}`,
              value,
              meta,
            });
          } catch {
            // ファイル読み込みエラーは無視
          }
        }
      }
    } catch {
      // ディレクトリ読み込みエラーは無視
    }

    return entries;
  }

  /**
   * ヒット率を更新
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * ソース別統計を更新
   */
  private updateSourceStats(
    source: CacheSource,
    action: 'hit' | 'miss' | 'add' | 'remove',
    size?: number
  ): void {
    if (!this.stats.bySource[source]) {
      this.stats.bySource[source] = {
        entries: 0,
        sizeBytes: 0,
        hits: 0,
        misses: 0,
      };
    }

    const sourceStats = this.stats.bySource[source] as SourceCacheStats;

    switch (action) {
      case 'hit':
        sourceStats.hits++;
        break;
      case 'miss':
        sourceStats.misses++;
        break;
      case 'add':
        sourceStats.entries++;
        sourceStats.sizeBytes += size || 0;
        break;
      case 'remove':
        sourceStats.entries = Math.max(0, sourceStats.entries - 1);
        sourceStats.sizeBytes = Math.max(0, sourceStats.sizeBytes - (size || 0));
        break;
    }
  }

  /**
   * 統計情報を読み込み
   */
  private async loadStats(): Promise<void> {
    const statsPath = path.join(this.config.cacheDir, 'stats.json');
    try {
      const content = await fs.readFile(statsPath, 'utf-8');
      const savedStats = JSON.parse(content);
      this.stats = { ...this.stats, ...savedStats };
    } catch {
      // ファイルがない場合は初期値を使用
    }
  }

  /**
   * 統計情報を保存
   */
  async saveStats(): Promise<void> {
    await this.ensureInitialized();
    const statsPath = path.join(this.config.cacheDir, 'stats.json');
    await fs.writeFile(statsPath, JSON.stringify(this.stats, null, 2));
  }
}

/**
 * デフォルトのキャッシュストアインスタンスを作成
 */
export function createCacheStore(config?: Partial<CacheConfig>): FileCacheStore {
  return new FileCacheStore(config);
}
