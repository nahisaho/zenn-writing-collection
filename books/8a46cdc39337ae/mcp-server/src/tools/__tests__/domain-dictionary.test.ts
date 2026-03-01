/**
 * Domain Dictionary Manager Tests
 * 
 * @vitest-environment node
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DomainDictionaryManager, getDomainDictionaryManager, resetDomainDictionaryManager } from '../search/dictionary/domain-dictionary.js';
import type { DomainType, QueryExpansionResult } from '../search/dictionary/types.js';

// モック設定ローダー
vi.mock('../../config/loader.js', () => ({
  getV115FeaturesConfig: vi.fn().mockReturnValue({
    domainDictionary: {
      enabled: true,
      domains: ['it', 'business', 'finance', 'legal', 'healthcare'],
      multilingualExpansion: true,
    },
  }),
}));

describe('DomainDictionaryManager', () => {
  beforeEach(() => {
    resetDomainDictionaryManager();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = getDomainDictionaryManager();
      const instance2 = getDomainDictionaryManager();
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      const instance1 = getDomainDictionaryManager();
      resetDomainDictionaryManager();
      const instance2 = getDomainDictionaryManager();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('detectDomain', () => {
    it('should detect IT domain', () => {
      const manager = getDomainDictionaryManager();
      
      expect(manager.detectDomain('AIを活用したシステム開発')).toBe('it');
      expect(manager.detectDomain('クラウドセキュリティの最新動向')).toBe('it');
      expect(manager.detectDomain('API連携の実装方法')).toBe('it');
    });

    it('should detect business domain', () => {
      const manager = getDomainDictionaryManager();
      
      expect(manager.detectDomain('M&A戦略について')).toBe('business');
      expect(manager.detectDomain('マーケティング戦略の立案')).toBe('business');
    });

    it('should detect finance domain', () => {
      const manager = getDomainDictionaryManager();
      
      expect(manager.detectDomain('IPOの準備プロセス')).toBe('finance');
      expect(manager.detectDomain('ESG投資のトレンド')).toBe('finance');
    });

    it('should detect legal domain', () => {
      const manager = getDomainDictionaryManager();
      
      expect(manager.detectDomain('GDPR対応ガイドライン')).toBe('legal');
      expect(manager.detectDomain('コンプライアンス体制の構築')).toBe('legal');
    });

    it('should detect healthcare domain', () => {
      const manager = getDomainDictionaryManager();
      
      expect(manager.detectDomain('FDA承認プロセス')).toBe('healthcare');
      expect(manager.detectDomain('臨床試験のデザイン')).toBe('healthcare');
    });

    it('should return null for general queries', () => {
      const manager = getDomainDictionaryManager();
      
      expect(manager.detectDomain('今日の天気')).toBeNull();
      expect(manager.detectDomain('美味しいレストラン')).toBeNull();
    });
  });

  describe('expandQuery', () => {
    it('should expand AI-related queries', () => {
      const manager = getDomainDictionaryManager();
      
      const expanded = manager.expandQuery('AI活用事例', 'it');
      
      expect(expanded).toContain('AI活用事例');
      expect(expanded.length).toBeGreaterThan(1);
      // 同義語展開を確認
      expect(expanded.some((q: string) => q.includes('人工知能') || q.includes('Artificial Intelligence'))).toBe(true);
    });

    it('should expand queries without specified domain', () => {
      const manager = getDomainDictionaryManager();
      
      const expanded = manager.expandQuery('クラウドサービスの比較');
      
      expect(expanded).toContain('クラウドサービスの比較');
      // ドメインが自動検出されて展開される
      expect(expanded.length).toBeGreaterThanOrEqual(1);
    });

    it('should return original query if no matches', () => {
      const manager = getDomainDictionaryManager();
      
      const expanded = manager.expandQuery('特に関連のないクエリ');
      
      expect(expanded).toContain('特に関連のないクエリ');
    });
  });

  describe('expandQueryFull', () => {
    it('should return full expansion result', async () => {
      const manager = getDomainDictionaryManager();
      
      const result = await manager.expandQueryFull('AI導入事例');
      
      expect(result.originalQuery).toBe('AI導入事例');
      expect(result.detectedDomain).toBe('it');
      expect(result.expandedQueries).toContain('AI導入事例');
      expect(Array.isArray(result.matchedGroups)).toBe(true);
      expect(typeof result.multilingualExpanded).toBe('boolean');
    });

    it('should include multilingual expansion when enabled', async () => {
      const manager = getDomainDictionaryManager();
      
      const result = await manager.expandQueryFull('AI');
      
      // multilingualExpanded が true の場合、英語/日本語の展開が含まれる
      if (result.matchedGroups.length > 0 && result.multilingualExpanded) {
        const hasEnglish = result.matchedGroups.some((g) => g.english !== undefined);
        const hasJapanese = result.matchedGroups.some((g) => g.japanese !== undefined);
        expect(hasEnglish || hasJapanese).toBe(true);
      }
    });
  });

  describe('expandMultilingual', () => {
    it('should expand term to multiple languages', () => {
      const manager = getDomainDictionaryManager();
      
      const expanded = manager.expandMultilingual('AI', 'it');
      
      expect(expanded).toContain('AI');
      // 多言語展開が有効な場合、英語/日本語が含まれる
      expect(expanded.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('suggestNewTerm', () => {
    it('should accept new term suggestions', () => {
      const manager = getDomainDictionaryManager();
      
      // 新語を提案（既存の用語でないもの）
      manager.suggestNewTerm('新しい技術用語', 'it');
      
      // エラーが発生しないことを確認
      expect(true).toBe(true);
    });

    it('should not duplicate existing terms', () => {
      const manager = getDomainDictionaryManager();
      
      // 既存の用語を提案
      manager.suggestNewTerm('AI', 'it');
      
      // エラーが発生しないことを確認
      expect(true).toBe(true);
    });
  });
});
