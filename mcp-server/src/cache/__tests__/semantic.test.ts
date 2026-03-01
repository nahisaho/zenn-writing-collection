/**
 * SemanticCacheMatcher Unit Tests
 * v1.0.0 - REQ-CACHE-001-02
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import { FileCacheStore } from '../store.js';
import {
  SemanticCacheMatcher,
  SimpleEmbeddingService,
  cosineSimilarity,
  DEFAULT_SEMANTIC_CONFIG,
  createSemanticCacheMatcher,
  IEmbeddingService,
  EmbeddingVector,
} from '../semantic.js';

// テスト用一時ディレクトリ（各テスト毎にユニーク）
let TEST_CACHE_DIR: string;

describe('SemanticCacheMatcher', () => {
  let store: FileCacheStore;
  let matcher: SemanticCacheMatcher;

  beforeEach(async () => {
    TEST_CACHE_DIR =
      '/tmp/shikigami-semantic-test-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    store = new FileCacheStore({
      cacheDir: TEST_CACHE_DIR,
      maxEntries: 100,
      defaultTtlSeconds: 3600,
    });
    matcher = new SemanticCacheMatcher(store);
  });

  afterEach(async () => {
    try {
      await fs.rm(TEST_CACHE_DIR, { recursive: true, force: true });
    } catch {
      // 無視
    }
  });

  describe('cosineSimilarity', () => {
    it('should return 1 for identical vectors', () => {
      const v1 = [1, 0, 0];
      const v2 = [1, 0, 0];
      expect(cosineSimilarity(v1, v2)).toBeCloseTo(1, 5);
    });

    it('should return 0 for orthogonal vectors', () => {
      const v1 = [1, 0];
      const v2 = [0, 1];
      expect(cosineSimilarity(v1, v2)).toBeCloseTo(0, 5);
    });

    it('should return -1 for opposite vectors', () => {
      const v1 = [1, 0];
      const v2 = [-1, 0];
      expect(cosineSimilarity(v1, v2)).toBeCloseTo(-1, 5);
    });

    it('should handle normalized vectors', () => {
      const v1 = [0.6, 0.8];
      const v2 = [0.6, 0.8];
      expect(cosineSimilarity(v1, v2)).toBeCloseTo(1, 5);
    });

    it('should throw for dimension mismatch', () => {
      const v1 = [1, 0, 0];
      const v2 = [1, 0];
      expect(() => cosineSimilarity(v1, v2)).toThrow('dimension mismatch');
    });

    it('should return 0 for zero vectors', () => {
      const v1 = [0, 0, 0];
      const v2 = [1, 0, 0];
      expect(cosineSimilarity(v1, v2)).toBe(0);
    });
  });

  describe('SimpleEmbeddingService', () => {
    let embeddingService: SimpleEmbeddingService;

    beforeEach(() => {
      embeddingService = new SimpleEmbeddingService(64);
    });

    it('should generate embedding vector', async () => {
      const embedding = await embeddingService.embed('test query');
      expect(embedding).toHaveLength(64);
    });

    it('should generate normalized vectors', async () => {
      const embedding = await embeddingService.embed('test query');
      const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
      expect(magnitude).toBeCloseTo(1, 5);
    });

    it('should generate similar embeddings for similar text', async () => {
      const e1 = await embeddingService.embed('Microsoft Teams pricing');
      const e2 = await embeddingService.embed('Microsoft Teams price');
      const similarity = cosineSimilarity(e1, e2);
      expect(similarity).toBeGreaterThan(0.5);
    });

    it('should batch embed multiple texts', async () => {
      const texts = ['query 1', 'query 2', 'query 3'];
      const embeddings = await embeddingService.embedBatch(texts);
      expect(embeddings).toHaveLength(3);
      embeddings.forEach((e) => expect(e).toHaveLength(64));
    });

    it('should return model name', () => {
      expect(embeddingService.getModelName()).toBe('simple-hash');
    });

    it('should return dimension', () => {
      expect(embeddingService.getDimension()).toBe(64);
    });
  });

  describe('indexQuery', () => {
    it('should index a query', async () => {
      await matcher.indexQuery('test query', 'search:test', 'search');
      expect(matcher.getIndexSize()).toBe(1);
    });

    it('should index multiple queries', async () => {
      await matcher.indexQuery('query 1', 'search:q1', 'search');
      await matcher.indexQuery('query 2', 'search:q2', 'search');
      await matcher.indexQuery('query 3', 'visit:q3', 'visit');
      expect(matcher.getIndexSize()).toBe(3);
    });

    it('should persist embedding to cache store', async () => {
      await matcher.indexQuery('test query', 'search:test', 'search');
      const result = await store.get('embedding:search:test');
      expect(result.hit).toBe(true);
    });

    it('should not index when disabled', async () => {
      matcher.setEnabled(false);
      await matcher.indexQuery('test query', 'search:test', 'search');
      expect(matcher.getIndexSize()).toBe(0);
    });
  });

  describe('findSimilar', () => {
    beforeEach(async () => {
      await matcher.indexQuery('Microsoft Teams pricing', 'search:teams-price', 'search');
      await matcher.indexQuery('Microsoft 365 license cost', 'search:m365-cost', 'search');
      await matcher.indexQuery('Zoom video conferencing', 'visit:zoom', 'visit');
    });

    it('should find similar queries', async () => {
      // 同じクエリは類似度1
      const candidates = await matcher.findSimilar('Microsoft Teams pricing');
      expect(candidates.length).toBeGreaterThanOrEqual(1);
      expect(candidates[0].similarity).toBeGreaterThan(0.9);
    });

    it('should filter by source', async () => {
      const candidates = await matcher.findSimilar('Microsoft Teams', 'search');
      // visitソースは除外される
      const visitCandidates = candidates.filter((c) => c.cacheKey.startsWith('visit:'));
      expect(visitCandidates.length).toBe(0);
    });

    it('should return empty when disabled', async () => {
      matcher.setEnabled(false);
      const candidates = await matcher.findSimilar('Microsoft Teams');
      expect(candidates.length).toBe(0);
    });

    it('should sort by similarity', async () => {
      const candidates = await matcher.findSimilar('Microsoft Teams pricing');
      if (candidates.length >= 2) {
        expect(candidates[0].similarity).toBeGreaterThanOrEqual(candidates[1].similarity);
      }
    });

    it('should respect maxCandidates', async () => {
      // 閾値を低くして多くの候補が見つかるようにする
      matcher.setSimilarityThreshold(0.1);
      await matcher.indexQuery('query 4', 'search:q4', 'search');
      await matcher.indexQuery('query 5', 'search:q5', 'search');
      await matcher.indexQuery('query 6', 'search:q6', 'search');

      const matcherWithLimit = new SemanticCacheMatcher(store, { maxCandidates: 2 });
      matcherWithLimit.setSimilarityThreshold(0.1);
      // 同じインデックスをコピー（手動）
      await matcherWithLimit.indexQuery('Microsoft Teams pricing', 'search:teams-price', 'search');
      await matcherWithLimit.indexQuery('Microsoft 365 license cost', 'search:m365-cost', 'search');
      await matcherWithLimit.indexQuery('query 4', 'search:q4', 'search');

      const candidates = await matcherWithLimit.findSimilar('some query');
      expect(candidates.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getBestMatch', () => {
    it('should return best matching cache entry', async () => {
      // キャッシュにデータを保存
      await store.set('search:teams-price', { results: ['result1', 'result2'] }, { source: 'search' });
      await matcher.indexQuery('Microsoft Teams pricing', 'search:teams-price', 'search');

      const match = await matcher.getBestMatch<{ results: string[] }>('Microsoft Teams pricing');
      expect(match).not.toBeNull();
      expect(match?.entry.value.results).toEqual(['result1', 'result2']);
      expect(match?.similarity).toBeCloseTo(1, 1);
    });

    it('should return null when no similar query found', async () => {
      await matcher.indexQuery('completely different query', 'search:different', 'search');
      // 閾値を高く保って類似性がないことを確認
      matcher.setSimilarityThreshold(0.99);

      const match = await matcher.getBestMatch('some random unique string xyz123');
      expect(match).toBeNull();
    });

    it('should return null when cache entry is missing', async () => {
      // インデックスにのみ追加（キャッシュには保存しない）
      await matcher.indexQuery('test query', 'search:missing', 'search');
      // キャッシュからは削除
      await store.delete('search:missing');

      const match = await matcher.getBestMatch('test query');
      expect(match).toBeNull();
    });
  });

  describe('removeFromIndex', () => {
    it('should remove entry from index', async () => {
      await matcher.indexQuery('test query', 'search:test', 'search');
      expect(matcher.getIndexSize()).toBe(1);

      matcher.removeFromIndex('search:test');
      expect(matcher.getIndexSize()).toBe(0);
    });
  });

  describe('clearIndex', () => {
    it('should clear all entries from index', async () => {
      await matcher.indexQuery('query 1', 'search:q1', 'search');
      await matcher.indexQuery('query 2', 'search:q2', 'search');
      expect(matcher.getIndexSize()).toBe(2);

      matcher.clearIndex();
      expect(matcher.getIndexSize()).toBe(0);
    });
  });

  describe('loadIndex', () => {
    it('should load persisted embeddings', async () => {
      // 埋め込みを保存
      await matcher.indexQuery('query 1', 'search:q1', 'search');
      await matcher.indexQuery('query 2', 'search:q2', 'search');

      // 新しいMatcherを作成してロード
      const newMatcher = new SemanticCacheMatcher(store);
      const loadedCount = await newMatcher.loadIndex();

      expect(loadedCount).toBe(2);
      expect(newMatcher.getIndexSize()).toBe(2);
    });
  });

  describe('configuration', () => {
    it('should return config', () => {
      const config = matcher.getConfig();
      expect(config.similarityThreshold).toBe(DEFAULT_SEMANTIC_CONFIG.similarityThreshold);
      expect(config.maxCandidates).toBe(DEFAULT_SEMANTIC_CONFIG.maxCandidates);
    });

    it('should update similarity threshold', () => {
      matcher.setSimilarityThreshold(0.85);
      expect(matcher.getConfig().similarityThreshold).toBe(0.85);
    });

    it('should throw for invalid threshold', () => {
      expect(() => matcher.setSimilarityThreshold(-0.1)).toThrow();
      expect(() => matcher.setSimilarityThreshold(1.5)).toThrow();
    });

    it('should toggle enabled state', () => {
      matcher.setEnabled(false);
      expect(matcher.getConfig().enabled).toBe(false);
      matcher.setEnabled(true);
      expect(matcher.getConfig().enabled).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return stats', async () => {
      await matcher.indexQuery('test', 'search:test', 'search');

      const stats = matcher.getStats();
      expect(stats.indexSize).toBe(1);
      expect(stats.threshold).toBe(0.9);
      expect(stats.enabled).toBe(true);
      expect(stats.model).toBeDefined();
      expect(stats.dimension).toBe(1536);
    });
  });

  describe('createSemanticCacheMatcher', () => {
    it('should create matcher with default config', () => {
      const newMatcher = createSemanticCacheMatcher(store);
      expect(newMatcher).toBeInstanceOf(SemanticCacheMatcher);
    });

    it('should create matcher with custom config', () => {
      const newMatcher = createSemanticCacheMatcher(store, { similarityThreshold: 0.8 });
      expect(newMatcher.getConfig().similarityThreshold).toBe(0.8);
    });

    it('should create matcher with custom embedding service', () => {
      const customService: IEmbeddingService = {
        embed: async (text: string) => new Array(128).fill(0).map(() => Math.random()),
        getModelName: () => 'custom',
        getDimension: () => 128,
      };

      const newMatcher = createSemanticCacheMatcher(store, {}, customService);
      expect(newMatcher.getStats().model).toBe('custom');
    });
  });
});
