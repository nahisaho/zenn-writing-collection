/**
 * QueryCacheManager Unit Tests
 * v1.0.0 - REQ-CACHE-001-01
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import {
  QueryCacheManager,
  createCacheManager,
  getDefaultCacheManager,
  SearchCacheKeyParams,
  VisitCacheKeyParams,
  EmbeddingCacheKeyParams,
} from '../manager.js';

// テスト用一時ディレクトリ
const TEST_CACHE_DIR = '/tmp/shikigami-manager-test-' + Date.now();

describe('QueryCacheManager', () => {
  let manager: QueryCacheManager;

  beforeEach(async () => {
    manager = new QueryCacheManager({
      cacheDir: TEST_CACHE_DIR,
      maxEntries: 100,
      defaultTtlSeconds: 3600,
    });
  });

  afterEach(async () => {
    manager.stopMaintenanceTasks();
    try {
      await fs.rm(TEST_CACHE_DIR, { recursive: true, force: true });
    } catch {
      // 無視
    }
  });

  describe('generateSearchKey', () => {
    it('should generate key with query only', () => {
      const key = QueryCacheManager.generateSearchKey({ query: 'test query' });
      expect(key).toBe('search:default:test query');
    });

    it('should generate key with engine', () => {
      const key = QueryCacheManager.generateSearchKey({
        query: 'test query',
        engine: 'google',
      });
      expect(key).toBe('search:google:test query');
    });

    it('should generate key with options', () => {
      const key = QueryCacheManager.generateSearchKey({
        query: 'test query',
        engine: 'google',
        options: { lang: 'ja', safe: true },
      });
      expect(key).toContain('search:google:test query');
      expect(key).toContain('lang');
    });
  });

  describe('generateVisitKey', () => {
    it('should generate key with URL only', () => {
      const key = QueryCacheManager.generateVisitKey({
        url: 'https://example.com/page',
      });
      expect(key).toBe('visit:https://example.com/page');
    });

    it('should generate key with options', () => {
      const key = QueryCacheManager.generateVisitKey({
        url: 'https://example.com/page',
        options: { extractImages: true },
      });
      expect(key).toContain('visit:https://example.com/page');
      expect(key).toContain('extractImages');
    });
  });

  describe('generateEmbeddingKey', () => {
    it('should generate key with short text', () => {
      const key = QueryCacheManager.generateEmbeddingKey({
        text: 'short text',
      });
      expect(key).toBe('embedding:default:short text');
    });

    it('should generate key with model', () => {
      const key = QueryCacheManager.generateEmbeddingKey({
        text: 'test',
        model: 'ada-002',
      });
      expect(key).toBe('embedding:ada-002:test');
    });

    it('should hash long text', () => {
      const longText = 'a'.repeat(200);
      const key = QueryCacheManager.generateEmbeddingKey({ text: longText });
      expect(key).toContain('embedding:default:');
      expect(key.length).toBeLessThan(50); // ハッシュ化されている
    });
  });

  describe('search cache', () => {
    it('should cache and retrieve search results', async () => {
      const params: SearchCacheKeyParams = {
        query: 'AI trends 2026',
        engine: 'google',
      };
      const value = {
        results: [
          { title: 'AI in 2026', url: 'https://example.com/ai' },
        ],
      };

      await manager.setSearchResult(params, value);
      const result = await manager.getSearchResult(params);

      expect(result.hit).toBe(true);
      expect(result.value).toEqual(value);
    });

    it('should return miss for uncached search', async () => {
      const result = await manager.getSearchResult({
        query: 'uncached query',
      });
      expect(result.hit).toBe(false);
    });

    it('should set source to search', async () => {
      const params: SearchCacheKeyParams = { query: 'test' };
      await manager.setSearchResult(params, { data: 'test' });
      const result = await manager.getSearchResult(params);

      expect(result.meta?.source).toBe('search');
    });
  });

  describe('visit cache', () => {
    it('should cache and retrieve visit results', async () => {
      const params: VisitCacheKeyParams = {
        url: 'https://example.com/article',
      };
      const value = {
        title: 'Article Title',
        content: 'Article content...',
      };

      await manager.setVisitResult(params, value);
      const result = await manager.getVisitResult(params);

      expect(result.hit).toBe(true);
      expect(result.value).toEqual(value);
    });

    it('should return miss for uncached visit', async () => {
      const result = await manager.getVisitResult({
        url: 'https://uncached.com/page',
      });
      expect(result.hit).toBe(false);
    });

    it('should set source to visit', async () => {
      const params: VisitCacheKeyParams = { url: 'https://example.com' };
      await manager.setVisitResult(params, { data: 'test' });
      const result = await manager.getVisitResult(params);

      expect(result.meta?.source).toBe('visit');
    });
  });

  describe('embedding cache', () => {
    it('should cache and retrieve embeddings', async () => {
      const params: EmbeddingCacheKeyParams = {
        text: 'Hello world',
        model: 'ada-002',
      };
      const value = {
        embedding: [0.1, 0.2, 0.3, 0.4],
      };

      await manager.setEmbedding(params, value);
      const result = await manager.getEmbedding(params);

      expect(result.hit).toBe(true);
      expect(result.value).toEqual(value);
    });

    it('should return miss for uncached embedding', async () => {
      const result = await manager.getEmbedding({
        text: 'uncached text',
      });
      expect(result.hit).toBe(false);
    });

    it('should set source to embedding', async () => {
      const params: EmbeddingCacheKeyParams = { text: 'test' };
      await manager.setEmbedding(params, { vector: [0.1] });
      const result = await manager.getEmbedding(params);

      expect(result.meta?.source).toBe('embedding');
    });
  });

  describe('generic cache', () => {
    it('should cache and retrieve generic data', async () => {
      const key = 'custom:analysis:report-001';
      const value = { score: 85, details: 'Good' };

      await manager.set(key, value, { source: 'analysis' });
      const result = await manager.get(key);

      expect(result.hit).toBe(true);
      expect(result.value).toEqual(value);
    });
  });

  describe('delete', () => {
    it('should delete a cached entry', async () => {
      const params: SearchCacheKeyParams = { query: 'to delete' };
      await manager.setSearchResult(params, { data: 'test' });

      const key = QueryCacheManager.generateSearchKey(params);
      const deleted = await manager.delete(key);

      expect(deleted).toBe(true);

      const result = await manager.getSearchResult(params);
      expect(result.hit).toBe(false);
    });
  });

  describe('invalidateUrl', () => {
    it('should invalidate URL-related caches', async () => {
      const url = 'https://example.com/page';
      await manager.setVisitResult({ url }, { content: 'test' });

      const deletedCount = await manager.invalidateUrl(url);

      expect(deletedCount).toBeGreaterThanOrEqual(1);

      const result = await manager.getVisitResult({ url });
      expect(result.hit).toBe(false);
    });
  });

  describe('invalidateBySource', () => {
    it('should invalidate all entries of a source', async () => {
      await manager.setSearchResult({ query: 'q1' }, { data: '1' });
      await manager.setSearchResult({ query: 'q2' }, { data: '2' });
      await manager.setVisitResult({ url: 'https://example.com' }, { data: '3' });

      const deletedCount = await manager.invalidateBySource('search');

      expect(deletedCount).toBe(2);

      const r1 = await manager.getSearchResult({ query: 'q1' });
      const r2 = await manager.getSearchResult({ query: 'q2' });
      const r3 = await manager.getVisitResult({ url: 'https://example.com' });

      expect(r1.hit).toBe(false);
      expect(r2.hit).toBe(false);
      expect(r3.hit).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all cached entries', async () => {
      await manager.setSearchResult({ query: 'q1' }, { data: '1' });
      await manager.setVisitResult({ url: 'https://example.com' }, { data: '2' });
      await manager.setEmbedding({ text: 'test' }, { vector: [0.1] });

      await manager.clear();

      const r1 = await manager.getSearchResult({ query: 'q1' });
      const r2 = await manager.getVisitResult({ url: 'https://example.com' });
      const r3 = await manager.getEmbedding({ text: 'test' });

      expect(r1.hit).toBe(false);
      expect(r2.hit).toBe(false);
      expect(r3.hit).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      await manager.setSearchResult({ query: 'q1' }, { data: '1' });
      await manager.getSearchResult({ query: 'q1' }); // hit
      await manager.getSearchResult({ query: 'q2' }); // miss

      const stats = await manager.getStats();

      expect(stats.totalEntries).toBe(1);
      expect(stats.hits).toBeGreaterThanOrEqual(1);
      expect(stats.misses).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getSummary', () => {
    it('should return formatted summary string', async () => {
      await manager.setSearchResult({ query: 'test' }, { data: 'value' });
      await manager.getSearchResult({ query: 'test' });

      const summary = await manager.getSummary();

      expect(summary).toContain('Cache Summary:');
      expect(summary).toContain('Entries:');
      expect(summary).toContain('Size:');
      expect(summary).toContain('Hit Rate:');
    });
  });

  describe('maintenance tasks', () => {
    it('should start and stop maintenance tasks', () => {
      manager.startMaintenanceTasks();
      // タイマーが設定されていることを確認
      expect(() => manager.stopMaintenanceTasks()).not.toThrow();
    });
  });

  describe('getStore', () => {
    it('should return the underlying store', () => {
      const store = manager.getStore();
      expect(store).toBeDefined();
    });
  });
});

describe('createCacheManager', () => {
  it('should create a new QueryCacheManager instance', () => {
    const manager = createCacheManager();
    expect(manager).toBeInstanceOf(QueryCacheManager);
  });

  it('should accept custom config', () => {
    const manager = createCacheManager({
      maxEntries: 500,
      defaultTtlSeconds: 7200,
    });
    expect(manager).toBeInstanceOf(QueryCacheManager);
  });
});

describe('getDefaultCacheManager', () => {
  it('should return a singleton instance', () => {
    const manager1 = getDefaultCacheManager();
    const manager2 = getDefaultCacheManager();
    expect(manager1).toBe(manager2);
  });
});
