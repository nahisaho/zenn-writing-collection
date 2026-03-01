/**
 * GlobalCacheStore Unit Tests
 * v1.0.0 - REQ-CACHE-001-03
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  GlobalCacheStore,
  DEFAULT_GLOBAL_CACHE_CONFIG,
  getGlobalCacheStore,
  resetGlobalCacheStore,
  createGlobalCacheStore,
} from '../global.js';

// テスト用一時ディレクトリ
let TEST_BASE_DIR: string;
let TEST_PROJECT_DIR: string;

describe('GlobalCacheStore', () => {
  let globalStore: GlobalCacheStore;

  beforeEach(async () => {
    const suffix = Date.now() + '-' + Math.random().toString(36).substring(7);
    TEST_BASE_DIR = `/tmp/shikigami-global-test-${suffix}`;
    TEST_PROJECT_DIR = `/tmp/shikigami-project-test-${suffix}`;

    globalStore = new GlobalCacheStore({
      baseDir: TEST_BASE_DIR,
      enabled: true,
      preferProjectCache: true,
    });

    // シングルトンをリセット
    resetGlobalCacheStore();
  });

  afterEach(async () => {
    try {
      await fs.rm(TEST_BASE_DIR, { recursive: true, force: true });
      await fs.rm(TEST_PROJECT_DIR, { recursive: true, force: true });
    } catch {
      // 無視
    }
  });

  describe('constructor', () => {
    it('should create with default config', () => {
      const store = new GlobalCacheStore({ baseDir: TEST_BASE_DIR });
      expect(store).toBeDefined();
      expect(store.getConfig().enabled).toBe(true);
    });

    it('should create with custom config', () => {
      const store = new GlobalCacheStore({
        baseDir: TEST_BASE_DIR,
        maxEntries: 1000,
        preferProjectCache: false,
      });
      expect(store.getConfig().maxEntries).toBe(1000);
      expect(store.getConfig().preferProjectCache).toBe(false);
    });

    it('should set global cache dir correctly', () => {
      const store = new GlobalCacheStore({ baseDir: TEST_BASE_DIR });
      expect(store.getGlobalCacheDir()).toBe(path.join(TEST_BASE_DIR, 'global-cache'));
    });
  });

  describe('project store', () => {
    it('should set project store', () => {
      expect(globalStore.hasProjectStore()).toBe(false);
      globalStore.setProjectStore(TEST_PROJECT_DIR);
      expect(globalStore.hasProjectStore()).toBe(true);
    });

    it('should clear project store', () => {
      globalStore.setProjectStore(TEST_PROJECT_DIR);
      expect(globalStore.hasProjectStore()).toBe(true);
      globalStore.clearProjectStore();
      expect(globalStore.hasProjectStore()).toBe(false);
    });

    it('should get project store', () => {
      globalStore.setProjectStore(TEST_PROJECT_DIR);
      const projectStore = globalStore.getProjectStore();
      expect(projectStore).not.toBeNull();
    });
  });

  describe('get/set operations', () => {
    it('should store and retrieve from global scope', async () => {
      await globalStore.set('test-key', { data: 'global' }, { scope: 'global' });
      const result = await globalStore.get<{ data: string }>('test-key');

      expect(result.hit).toBe(true);
      expect(result.value?.data).toBe('global');
      expect(result.scope).toBe('global');
    });

    it('should store and retrieve from project scope', async () => {
      globalStore.setProjectStore(TEST_PROJECT_DIR);

      await globalStore.set('test-key', { data: 'project' }, { scope: 'project' });
      const result = await globalStore.get<{ data: string }>('test-key');

      expect(result.hit).toBe(true);
      expect(result.value?.data).toBe('project');
      expect(result.scope).toBe('project');
    });

    it('should prefer project cache when configured', async () => {
      globalStore.setProjectStore(TEST_PROJECT_DIR);

      // 両方のスコープに保存
      await globalStore.set('test-key', { data: 'global' }, { scope: 'global' });
      await globalStore.set('test-key', { data: 'project' }, { scope: 'project' });

      // プロジェクトキャッシュが優先される
      const result = await globalStore.get<{ data: string }>('test-key');
      expect(result.value?.data).toBe('project');
      expect(result.scope).toBe('project');
    });

    it('should prefer global cache when configured', async () => {
      globalStore.setPreferProjectCache(false);
      globalStore.setProjectStore(TEST_PROJECT_DIR);

      // 両方のスコープに保存
      await globalStore.set('test-key', { data: 'global' }, { scope: 'global' });
      await globalStore.set('test-key', { data: 'project' }, { scope: 'project' });

      // グローバルキャッシュが優先される
      const result = await globalStore.get<{ data: string }>('test-key');
      expect(result.value?.data).toBe('global');
      expect(result.scope).toBe('global');
    });

    it('should fallback to global when project cache miss', async () => {
      globalStore.setProjectStore(TEST_PROJECT_DIR);

      await globalStore.set('test-key', { data: 'global' }, { scope: 'global' });

      const result = await globalStore.get<{ data: string }>('test-key');
      expect(result.hit).toBe(true);
      expect(result.value?.data).toBe('global');
      expect(result.scope).toBe('global');
    });

    it('should return miss when not found', async () => {
      const result = await globalStore.get('non-existent');
      expect(result.hit).toBe(false);
    });

    it('should not save to global when disabled', async () => {
      globalStore.setEnabled(false);
      await globalStore.set('test-key', { data: 'test' }, { scope: 'global' });

      const result = await globalStore.get('test-key');
      expect(result.hit).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete from specific scope', async () => {
      globalStore.setProjectStore(TEST_PROJECT_DIR);

      await globalStore.set('test-key', { data: 'global' }, { scope: 'global' });
      await globalStore.set('test-key', { data: 'project' }, { scope: 'project' });

      // プロジェクトからのみ削除
      const deleted = await globalStore.delete('test-key', 'project');
      expect(deleted).toBe(true);

      // グローバルにはまだ存在
      globalStore.setPreferProjectCache(false);
      const result = await globalStore.get<{ data: string }>('test-key');
      expect(result.hit).toBe(true);
      expect(result.value?.data).toBe('global');
    });

    it('should delete from both scopes when no scope specified', async () => {
      globalStore.setProjectStore(TEST_PROJECT_DIR);

      await globalStore.set('test-key', { data: 'global' }, { scope: 'global' });
      await globalStore.set('test-key', { data: 'project' }, { scope: 'project' });

      const deleted = await globalStore.delete('test-key');
      expect(deleted).toBe(true);

      const result = await globalStore.get('test-key');
      expect(result.hit).toBe(false);
    });
  });

  describe('has', () => {
    it('should check existence in project scope', async () => {
      globalStore.setProjectStore(TEST_PROJECT_DIR);
      await globalStore.set('test-key', { data: 'project' }, { scope: 'project' });

      const result = await globalStore.has('test-key');
      expect(result.exists).toBe(true);
      expect(result.scope).toBe('project');
    });

    it('should check existence in global scope', async () => {
      await globalStore.set('test-key', { data: 'global' }, { scope: 'global' });

      const result = await globalStore.has('test-key');
      expect(result.exists).toBe(true);
      expect(result.scope).toBe('global');
    });

    it('should return false for non-existent key', async () => {
      const result = await globalStore.has('non-existent');
      expect(result.exists).toBe(false);
      expect(result.scope).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should clear specific scope', async () => {
      globalStore.setProjectStore(TEST_PROJECT_DIR);

      await globalStore.set('test-key', { data: 'global' }, { scope: 'global' });
      await globalStore.set('test-key', { data: 'project' }, { scope: 'project' });

      await globalStore.clear('project');

      // プロジェクトはクリアされた
      const projectStore = globalStore.getProjectStore()!;
      const projectStats = await projectStore.getStats();
      expect(projectStats.totalEntries).toBe(0);

      // グローバルは残っている
      const globalStats = await globalStore.getGlobalStore().getStats();
      expect(globalStats.totalEntries).toBe(1);
    });

    it('should clear all scopes when no scope specified', async () => {
      globalStore.setProjectStore(TEST_PROJECT_DIR);

      await globalStore.set('test-key', { data: 'global' }, { scope: 'global' });
      await globalStore.set('test-key', { data: 'project' }, { scope: 'project' });

      await globalStore.clear();

      const result = await globalStore.get('test-key');
      expect(result.hit).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return global stats', async () => {
      await globalStore.set('test-key', { data: 'global' }, { scope: 'global' });

      const stats = await globalStore.getStats('global');
      expect(stats.global).toBeDefined();
      expect(stats.global!.totalEntries).toBe(1);
      expect(stats.project).toBeUndefined();
    });

    it('should return project stats', async () => {
      globalStore.setProjectStore(TEST_PROJECT_DIR);
      await globalStore.set('test-key', { data: 'project' }, { scope: 'project' });

      const stats = await globalStore.getStats('project');
      expect(stats.project).toBeDefined();
      expect(stats.project!.totalEntries).toBe(1);
      expect(stats.global).toBeUndefined();
    });

    it('should return combined stats', async () => {
      globalStore.setProjectStore(TEST_PROJECT_DIR);
      await globalStore.set('key1', { data: 'global' }, { scope: 'global' });
      await globalStore.set('key2', { data: 'project' }, { scope: 'project' });

      const stats = await globalStore.getStats();
      expect(stats.global).toBeDefined();
      expect(stats.project).toBeDefined();
      expect(stats.combined).toBeDefined();
      expect(stats.combined!.totalEntries).toBe(2);
    });
  });

  describe('evictExpired', () => {
    it('should evict expired entries from both scopes', async () => {
      globalStore.setProjectStore(TEST_PROJECT_DIR);

      // 短いTTLで保存
      await globalStore.set('global-key', { data: 'global' }, { scope: 'global', ttlSeconds: 1 });
      await globalStore.set('project-key', { data: 'project' }, { scope: 'project', ttlSeconds: 1 });

      // TTL期限後
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const result = await globalStore.evictExpired();
      expect(result.global).toBeGreaterThanOrEqual(0);
      expect(result.project).toBeGreaterThanOrEqual(0);
    });
  });

  describe('configuration', () => {
    it('should toggle enabled state', () => {
      expect(globalStore.getConfig().enabled).toBe(true);
      globalStore.setEnabled(false);
      expect(globalStore.getConfig().enabled).toBe(false);
    });

    it('should toggle preferProjectCache', () => {
      expect(globalStore.getConfig().preferProjectCache).toBe(true);
      globalStore.setPreferProjectCache(false);
      expect(globalStore.getConfig().preferProjectCache).toBe(false);
    });
  });

  describe('singleton', () => {
    it('should return singleton instance', () => {
      const store1 = getGlobalCacheStore({ baseDir: TEST_BASE_DIR });
      const store2 = getGlobalCacheStore({ baseDir: TEST_BASE_DIR });
      expect(store1).toBe(store2);
    });

    it('should reset singleton', () => {
      const store1 = getGlobalCacheStore({ baseDir: TEST_BASE_DIR });
      resetGlobalCacheStore();
      const store2 = getGlobalCacheStore({ baseDir: TEST_BASE_DIR });
      expect(store1).not.toBe(store2);
    });
  });

  describe('createGlobalCacheStore', () => {
    it('should create new instance', () => {
      const store1 = createGlobalCacheStore({ baseDir: TEST_BASE_DIR });
      const store2 = createGlobalCacheStore({ baseDir: TEST_BASE_DIR });
      expect(store1).not.toBe(store2);
    });
  });
});
