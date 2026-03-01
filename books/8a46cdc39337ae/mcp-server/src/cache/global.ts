/**
 * Global Cache Store
 * v1.0.0 - REQ-CACHE-001-03
 *
 * ユーザー横断のグローバルキャッシュを管理
 * ~/.shikigami/global-cache/ に保存
 */

import * as os from 'os';
import * as path from 'path';
import { FileCacheStore } from './store.js';
import { CacheConfig, CacheStats, CacheSource, CacheSetOptions, CacheResult } from './types.js';

/**
 * グローバルキャッシュ設定
 */
export interface GlobalCacheConfig extends Partial<CacheConfig> {
  /** グローバルキャッシュの有効化 */
  enabled: boolean;
  /** プロジェクト固有キャッシュを優先するか */
  preferProjectCache: boolean;
  /** グローバルキャッシュのベースディレクトリ（デフォルト: ~/.shikigami） */
  baseDir?: string;
}

/**
 * デフォルトグローバルキャッシュ設定
 */
export const DEFAULT_GLOBAL_CACHE_CONFIG: GlobalCacheConfig = {
  enabled: true,
  preferProjectCache: true,
  maxEntries: 5000,
  defaultTtlSeconds: 3600 * 24 * 7, // 1週間
  maxSizeBytes: 500 * 1024 * 1024, // 500MB
};

/**
 * キャッシュスコープ
 */
export type CacheScope = 'global' | 'project';

/**
 * スコープ付きキャッシュ結果
 */
export interface ScopedCacheResult<T = unknown> extends CacheResult<T> {
  /** キャッシュが見つかったスコープ */
  scope?: CacheScope;
}

/**
 * GlobalCacheStore
 * ユーザー横断のグローバルキャッシュを管理
 */
export class GlobalCacheStore {
  private globalStore: FileCacheStore;
  private projectStore: FileCacheStore | null = null;
  private config: GlobalCacheConfig;
  private globalCacheDir: string;

  constructor(config: Partial<GlobalCacheConfig> = {}) {
    this.config = { ...DEFAULT_GLOBAL_CACHE_CONFIG, ...config };

    // グローバルキャッシュディレクトリを設定
    const baseDir = this.config.baseDir || path.join(os.homedir(), '.shikigami');
    this.globalCacheDir = path.join(baseDir, 'global-cache');

    // グローバルストアを初期化
    this.globalStore = new FileCacheStore({
      cacheDir: this.globalCacheDir,
      maxEntries: this.config.maxEntries,
      defaultTtlSeconds: this.config.defaultTtlSeconds,
      maxSizeBytes: this.config.maxSizeBytes,
    });
  }

  /**
   * プロジェクト固有のキャッシュストアを設定
   */
  setProjectStore(projectCacheDir: string): void {
    this.projectStore = new FileCacheStore({
      cacheDir: projectCacheDir,
      maxEntries: this.config.maxEntries,
      defaultTtlSeconds: this.config.defaultTtlSeconds,
      maxSizeBytes: this.config.maxSizeBytes,
    });
  }

  /**
   * プロジェクトストアをクリア
   */
  clearProjectStore(): void {
    this.projectStore = null;
  }

  /**
   * キャッシュエントリを取得（スコープ優先順位に従う）
   */
  async get<T = unknown>(key: string): Promise<ScopedCacheResult<T>> {
    // プロジェクトキャッシュを優先する場合
    if (this.config.preferProjectCache && this.projectStore) {
      const projectResult = await this.projectStore.get<T>(key);
      if (projectResult.hit) {
        return { ...projectResult, scope: 'project' };
      }
    }

    // グローバルキャッシュから取得
    if (this.config.enabled) {
      const globalResult = await this.globalStore.get<T>(key);
      if (globalResult.hit) {
        return { ...globalResult, scope: 'global' };
      }
    }

    // プロジェクトキャッシュを後で確認（優先しない場合）
    if (!this.config.preferProjectCache && this.projectStore) {
      const projectResult = await this.projectStore.get<T>(key);
      if (projectResult.hit) {
        return { ...projectResult, scope: 'project' };
      }
    }

    return { hit: false, key };
  }

  /**
   * キャッシュエントリを保存
   */
  async set<T = unknown>(
    key: string,
    value: T,
    options: CacheSetOptions & { scope?: CacheScope } = {}
  ): Promise<void> {
    const { scope = 'global', ...cacheOptions } = options;

    if (scope === 'project' && this.projectStore) {
      await this.projectStore.set(key, value, cacheOptions);
    } else if (scope === 'global' && this.config.enabled) {
      await this.globalStore.set(key, value, cacheOptions);
    }
  }

  /**
   * キャッシュエントリを削除
   */
  async delete(key: string, scope?: CacheScope): Promise<boolean> {
    let deleted = false;

    if (scope === 'project' || scope === undefined) {
      if (this.projectStore) {
        deleted = (await this.projectStore.delete(key)) || deleted;
      }
    }

    if (scope === 'global' || scope === undefined) {
      if (this.config.enabled) {
        deleted = (await this.globalStore.delete(key)) || deleted;
      }
    }

    return deleted;
  }

  /**
   * キャッシュの存在確認
   */
  async has(key: string): Promise<{ exists: boolean; scope?: CacheScope }> {
    if (this.config.preferProjectCache && this.projectStore) {
      if (await this.projectStore.has(key)) {
        return { exists: true, scope: 'project' };
      }
    }

    if (this.config.enabled && (await this.globalStore.has(key))) {
      return { exists: true, scope: 'global' };
    }

    if (!this.config.preferProjectCache && this.projectStore) {
      if (await this.projectStore.has(key)) {
        return { exists: true, scope: 'project' };
      }
    }

    return { exists: false };
  }

  /**
   * 全エントリを削除
   */
  async clear(scope?: CacheScope): Promise<void> {
    if (scope === 'project' || scope === undefined) {
      if (this.projectStore) {
        await this.projectStore.clear();
      }
    }

    if (scope === 'global' || scope === undefined) {
      if (this.config.enabled) {
        await this.globalStore.clear();
      }
    }
  }

  /**
   * 統計情報を取得
   */
  async getStats(scope?: CacheScope): Promise<{
    global?: CacheStats;
    project?: CacheStats;
    combined?: {
      totalEntries: number;
      totalSizeBytes: number;
      globalHitRate: number;
      projectHitRate: number;
    };
  }> {
    const result: {
      global?: CacheStats;
      project?: CacheStats;
      combined?: {
        totalEntries: number;
        totalSizeBytes: number;
        globalHitRate: number;
        projectHitRate: number;
      };
    } = {};

    if (scope === 'global' || scope === undefined) {
      if (this.config.enabled) {
        result.global = await this.globalStore.getStats();
      }
    }

    if (scope === 'project' || scope === undefined) {
      if (this.projectStore) {
        result.project = await this.projectStore.getStats();
      }
    }

    // 結合統計
    if (scope === undefined && result.global) {
      result.combined = {
        totalEntries: (result.global?.totalEntries || 0) + (result.project?.totalEntries || 0),
        totalSizeBytes:
          (result.global?.totalSizeBytes || 0) + (result.project?.totalSizeBytes || 0),
        globalHitRate: result.global?.hitRate || 0,
        projectHitRate: result.project?.hitRate || 0,
      };
    }

    return result;
  }

  /**
   * 期限切れエントリを削除
   */
  async evictExpired(scope?: CacheScope): Promise<{ global: number; project: number }> {
    let globalEvicted = 0;
    let projectEvicted = 0;

    if (scope === 'global' || scope === undefined) {
      if (this.config.enabled) {
        globalEvicted = await this.globalStore.evictExpired();
      }
    }

    if (scope === 'project' || scope === undefined) {
      if (this.projectStore) {
        projectEvicted = await this.projectStore.evictExpired();
      }
    }

    return { global: globalEvicted, project: projectEvicted };
  }

  /**
   * グローバルキャッシュディレクトリを取得
   */
  getGlobalCacheDir(): string {
    return this.globalCacheDir;
  }

  /**
   * 設定を取得
   */
  getConfig(): GlobalCacheConfig {
    return { ...this.config };
  }

  /**
   * グローバルキャッシュの有効/無効を切り替え
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * プロジェクトキャッシュ優先設定を変更
   */
  setPreferProjectCache(prefer: boolean): void {
    this.config.preferProjectCache = prefer;
  }

  /**
   * プロジェクトストアが設定されているか確認
   */
  hasProjectStore(): boolean {
    return this.projectStore !== null;
  }

  /**
   * 基盤となるストアを取得
   */
  getGlobalStore(): FileCacheStore {
    return this.globalStore;
  }

  /**
   * プロジェクトストアを取得
   */
  getProjectStore(): FileCacheStore | null {
    return this.projectStore;
  }
}

// シングルトンインスタンス
let globalCacheInstance: GlobalCacheStore | null = null;

/**
 * デフォルトのグローバルキャッシュインスタンスを取得
 */
export function getGlobalCacheStore(config?: Partial<GlobalCacheConfig>): GlobalCacheStore {
  if (!globalCacheInstance) {
    globalCacheInstance = new GlobalCacheStore(config);
  }
  return globalCacheInstance;
}

/**
 * グローバルキャッシュインスタンスをリセット（テスト用）
 */
export function resetGlobalCacheStore(): void {
  globalCacheInstance = null;
}

/**
 * グローバルキャッシュストアを作成
 */
export function createGlobalCacheStore(config?: Partial<GlobalCacheConfig>): GlobalCacheStore {
  return new GlobalCacheStore(config);
}
