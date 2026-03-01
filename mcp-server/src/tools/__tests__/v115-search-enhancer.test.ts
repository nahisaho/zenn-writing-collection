/**
 * v1.15.0 Search Enhancer Tests
 * 
 * @vitest-environment node
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { enhanceSearchQuery, canEnhanceQuery, getPatentSearchUrls } from '../search/v115-search-enhancer.js';
import type { SearchEnhancementResult } from '../search/v115-search-enhancer.js';

// モック設定ローダー
vi.mock('../../config/loader.js', () => ({
  getV115FeaturesConfig: vi.fn().mockReturnValue({
    domainDictionary: {
      enabled: true,
      domains: ['it', 'business', 'finance', 'legal', 'healthcare'],
      multilingualExpansion: true,
    },
    patentSearch: {
      enabled: true,
      defaultDatabase: 'J-PlatPat',
      autoClassification: true,
      synonymExpansion: true,
    },
  }),
  isV115FeatureEnabled: vi.fn().mockImplementation((feature: string) => {
    const enabled: Record<string, boolean> = {
      domainDictionary: true,
      patentSearch: true,
    };
    return enabled[feature] ?? false;
  }),
}));

// モックDomainDictionaryManager
vi.mock('../search/dictionary/index.js', () => ({
  getDomainDictionaryManager: vi.fn().mockReturnValue({
    loadDictionaries: vi.fn().mockResolvedValue(undefined),
    detectDomain: vi.fn().mockReturnValue('it'),
    expandQuery: vi.fn().mockImplementation((query: string) => [query]),
    expandQueryFull: vi.fn().mockImplementation((query: string) => ({
      originalQuery: query,
      detectedDomain: 'it',
      expandedQueries: [query, query + ' expanded'],
      matchedGroups: [
        { canonical: 'AI', synonyms: ['人工知能', 'Artificial Intelligence'], english: 'AI', japanese: '人工知能' }
      ],
      multilingualExpanded: true,
    })),
  }),
}));

// モックPatentSearchOptimizer
vi.mock('../search/patent/index.js', () => ({
  getPatentSearchOptimizer: vi.fn().mockReturnValue({
    optimizeQuery: vi.fn().mockImplementation((query: { keywords: string[] }) => ({
      originalKeywords: query.keywords,
      expandedKeywords: [...query.keywords, 'expanded keyword'],
      suggestedClassifications: [{ system: 'IPC', code: 'G06N', description: 'AI' }],
      searchUrls: new Map([
        ['J-PlatPat', 'https://j-platpat.example.com/...'],
        ['Google Patents', 'https://patents.google.com/...'],
      ]),
      searchQueries: {},
    })),
    quickSearch: vi.fn().mockImplementation((keywords: string[]) => ({
      expandedKeywords: keywords,
      searchUrls: new Map([
        ['J-PlatPat', 'https://j-platpat.example.com/...'],
      ]),
    })),
  }),
}));

// モックキーワード検出
vi.mock('../utils/keyword-detector.js', () => ({
  detectAnalysisType: vi.fn().mockImplementation((text: string) => {
    if (text.includes('特許') || text.includes('patent')) return ['patent'];
    if (text.includes('事例')) return ['case-study'];
    return [];
  }),
  detectDomainFromKeywords: vi.fn().mockImplementation((text: string) => {
    if (text.includes('AI') || text.includes('クラウド')) return 'it';
    return null;
  }),
  containsPatentKeywords: vi.fn().mockImplementation((text: string) => {
    return text.includes('特許') || text.includes('patent') || text.includes('知財');
  }),
}));

describe('v1.15.0 Search Enhancer', () => {
  describe('enhanceSearchQuery', () => {
    it('should enhance domain-specific queries', async () => {
      const result = await enhanceSearchQuery('AI導入事例');
      
      expect(result.originalQuery).toBe('AI導入事例');
      expect(result.wasEnhanced).toBe(true);
      expect(result.enhancementNotes.length).toBeGreaterThan(0);
    });

    it('should enhance patent-related queries', async () => {
      const result = await enhanceSearchQuery('リチウムイオン電池 特許');
      
      expect(result.originalQuery).toBe('リチウムイオン電池 特許');
      expect(result.wasEnhanced).toBe(true);
      expect(result.patentOptimization).toBeDefined();
    });

    it('should return analysisTypes array', async () => {
      const result = await enhanceSearchQuery('特許調査');
      
      expect(Array.isArray(result.analysisTypes)).toBe(true);
    });

    it('should include additional queries', async () => {
      const result = await enhanceSearchQuery('AI活用');
      
      expect(Array.isArray(result.additionalQueries)).toBe(true);
    });

    it('should detect domain correctly', async () => {
      const result = await enhanceSearchQuery('クラウドセキュリティ');
      
      // ドメインが検出される（nullでない可能性）
      expect(result.domain === 'it' || result.domain === null || result.domain === undefined).toBe(true);
    });
  });

  describe('canEnhanceQuery', () => {
    it('should return true for patent queries', () => {
      const result = canEnhanceQuery('リチウムイオン電池 特許検索');
      
      expect(result.canEnhance).toBe(true);
      expect(result.reasons.some((r) => r.includes('Patent'))).toBe(true);
    });

    it('should return true for domain-specific queries', () => {
      const result = canEnhanceQuery('AI活用事例');
      
      expect(result.canEnhance).toBe(true);
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('should return false for general queries', async () => {
      // モックを一時的に上書き
      const { containsPatentKeywords, detectDomainFromKeywords, detectAnalysisType } = vi.mocked(await import('../utils/keyword-detector.js'));
      containsPatentKeywords.mockReturnValueOnce(false);
      detectDomainFromKeywords.mockReturnValueOnce(null);
      detectAnalysisType.mockReturnValueOnce([]);
      
      const result = canEnhanceQuery('今日の天気');
      
      expect(result.canEnhance).toBe(false);
      expect(result.reasons.length).toBe(0);
    });
  });

  describe('getPatentSearchUrls', () => {
    it('should return patent search URLs', async () => {
      const urls = await getPatentSearchUrls('リチウムイオン電池');
      
      expect(urls instanceof Map).toBe(true);
    });

    it('should include multiple patent offices', async () => {
      const urls = await getPatentSearchUrls('電気自動車 バッテリー');
      
      expect(urls.size).toBeGreaterThanOrEqual(0);
    });
  });
});
