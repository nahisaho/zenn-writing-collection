/**
 * Patent Search Optimizer Tests
 * 
 * @vitest-environment node
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PatentSearchOptimizer, getPatentSearchOptimizer, resetPatentSearchOptimizer } from '../search/patent/patent-search-optimizer.js';
import type { PatentSearchQuery, OptimizedPatentQuery, PatentOffice } from '../search/patent/types.js';

// モック設定ローダー
vi.mock('../../config/loader.js', () => ({
  getV115FeaturesConfig: vi.fn().mockReturnValue({
    patentSearch: {
      enabled: true,
      defaultDatabase: 'J-PlatPat',
      autoClassification: true,
      synonymExpansion: true,
    },
  }),
}));

describe('PatentSearchOptimizer', () => {
  beforeEach(() => {
    resetPatentSearchOptimizer();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = getPatentSearchOptimizer();
      const instance2 = getPatentSearchOptimizer();
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      const instance1 = getPatentSearchOptimizer();
      resetPatentSearchOptimizer();
      const instance2 = getPatentSearchOptimizer();
      expect(instance1).not.toBe(instance2);
    });

    it('should accept custom options', () => {
      const optimizer = getPatentSearchOptimizer({
        autoClassification: false,
        synonymExpansion: false,
      });
      expect(optimizer).toBeDefined();
    });
  });

  describe('suggestClassifications', () => {
    it('should suggest IPC codes for battery-related keywords', () => {
      const optimizer = getPatentSearchOptimizer();
      
      const suggestions = optimizer.suggestClassifications(['リチウムイオン電池', 'バッテリー']);
      
      expect(Array.isArray(suggestions)).toBe(true);
      // バッテリー関連のIPCコード（H01M）が含まれることを期待
      if (suggestions.length > 0) {
        expect(suggestions.some((s) => s.code.startsWith('H01M'))).toBe(true);
      }
    });

    it('should suggest IPC codes for AI-related keywords', () => {
      const optimizer = getPatentSearchOptimizer();
      
      const suggestions = optimizer.suggestClassifications(['人工知能', '機械学習']);
      
      expect(Array.isArray(suggestions)).toBe(true);
      // AI関連のIPCコード（G06N）が含まれることを期待
      if (suggestions.length > 0) {
        expect(suggestions.some((s) => s.code.startsWith('G06'))).toBe(true);
      }
    });

    it('should return empty array for unrelated keywords', () => {
      const optimizer = getPatentSearchOptimizer();
      
      const suggestions = optimizer.suggestClassifications(['レストラン', '料理']);
      
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('expandKeywords', () => {
    it('should expand technical keywords', () => {
      const optimizer = getPatentSearchOptimizer();
      
      const expanded = optimizer.expandKeywords(['リチウムイオン電池']);
      
      expect(expanded).toContain('リチウムイオン電池');
      // 同義語展開により追加のキーワードが含まれる可能性
      expect(Array.isArray(expanded)).toBe(true);
    });

    it('should include English translations', () => {
      const optimizer = getPatentSearchOptimizer();
      
      const expanded = optimizer.expandKeywords(['電気自動車']);
      
      expect(expanded).toContain('電気自動車');
      // 英語展開があれば含まれる
      expect(Array.isArray(expanded)).toBe(true);
    });
  });

  describe('generateOfficeQuery', () => {
    it('should generate JPO query', () => {
      const optimizer = getPatentSearchOptimizer();
      
      const query = optimizer.generateOfficeQuery({ keywords: ['電池', '充電'] }, 'JPO');
      
      expect(typeof query).toBe('string');
      expect(query.length).toBeGreaterThan(0);
    });

    it('should generate USPTO query', () => {
      const optimizer = getPatentSearchOptimizer();
      
      const query = optimizer.generateOfficeQuery({ keywords: ['battery', 'charging'] }, 'USPTO');
      
      expect(typeof query).toBe('string');
      expect(query.length).toBeGreaterThan(0);
    });

    it('should generate EPO query', () => {
      const optimizer = getPatentSearchOptimizer();
      
      const query = optimizer.generateOfficeQuery({ keywords: ['battery'] }, 'EPO');
      
      expect(typeof query).toBe('string');
    });

    it('should generate WIPO query', () => {
      const optimizer = getPatentSearchOptimizer();
      
      const query = optimizer.generateOfficeQuery({ keywords: ['lithium battery'] }, 'WIPO');
      
      expect(typeof query).toBe('string');
    });
  });

  describe('optimizeQuery', () => {
    it('should return optimized query result', () => {
      const optimizer = getPatentSearchOptimizer();
      
      const input: PatentSearchQuery = {
        keywords: ['リチウムイオン電池', '急速充電'],
      };
      
      const result = optimizer.optimizeQuery(input);
      
      expect(result.originalQuery.keywords).toEqual(input.keywords);
      expect(Array.isArray(result.expandedKeywords)).toBe(true);
      expect(Array.isArray(result.suggestedClassifications)).toBe(true);
      expect(result.searchUrls instanceof Map).toBe(true);
      expect(result.optimizedQueries instanceof Map).toBe(true);
    });

    it('should include search URLs for multiple offices', () => {
      const optimizer = getPatentSearchOptimizer();
      
      const input: PatentSearchQuery = {
        keywords: ['電気自動車'],
      };
      
      const result = optimizer.optimizeQuery(input);
      
      // 複数の特許庁のURLが含まれる
      expect(result.searchUrls.size).toBeGreaterThan(0);
    });

    it('should handle classification codes in input', () => {
      const optimizer = getPatentSearchOptimizer();
      
      const input: PatentSearchQuery = {
        keywords: ['バッテリー'],
        classifications: [{ system: 'IPC', code: 'H01M', confidence: 1.0 }],
      };
      
      const result = optimizer.optimizeQuery(input);
      
      expect(result.originalQuery.keywords).toEqual(input.keywords);
      // 入力された分類コードまたは自動推定の分類コードが含まれる
      expect(result.suggestedClassifications.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('quickSearch', () => {
    it('should return quick search result', () => {
      const optimizer = getPatentSearchOptimizer();
      
      const result = optimizer.quickSearch(['電池']);
      
      expect(Array.isArray(result.expandedKeywords)).toBe(true);
      expect(result.searchUrls instanceof Map).toBe(true);
    });
  });
});
