/**
 * Search Enhancer - v1.15.0 Feature Integration
 * REQ-DICT-001: ドメイン辞書による検索クエリ拡張
 * REQ-PAT-001: 特許検索最適化
 *
 * @remarks
 * - DomainDictionaryManagerをsearch.tsワークフローに統合
 * - PatentSearchOptimizerをsearch.tsワークフローに統合
 * - キーワード検出による自動分岐
 * - TSK-020 実装
 */

import { getV115FeaturesConfig, isV115FeatureEnabled } from '../../config/loader.js';
import { getDomainDictionaryManager, type QueryExpansionResult } from '../search/dictionary/index.js';
import { getPatentSearchOptimizer, type OptimizedPatentQuery, type PatentSearchQuery } from '../search/patent/index.js';
import { detectAnalysisType, containsPatentKeywords, detectDomainFromKeywords } from '../utils/keyword-detector.js';
import type { AnalysisType, DomainType } from '../utils/keyword-detector.js';

/**
 * 検索拡張結果
 */
export interface SearchEnhancementResult {
  /** 元のクエリ */
  originalQuery: string;
  /** 拡張されたクエリ */
  enhancedQuery: string;
  /** 追加の検索クエリ（複数展開時） */
  additionalQueries: string[];
  /** 検出された分析タイプ（複数検出可） */
  analysisTypes: AnalysisType[];
  /** 検出されたドメイン */
  domain?: DomainType | null;
  /** 辞書展開結果（使用時） */
  dictionaryExpansion?: QueryExpansionResult;
  /** 特許検索最適化結果（使用時） */
  patentOptimization?: OptimizedPatentQuery;
  /** 拡張が行われたか */
  wasEnhanced: boolean;
  /** 拡張の説明 */
  enhancementNotes: string[];
}

/**
 * 検索クエリを拡張
 *
 * @param query 元のクエリ
 * @returns 拡張結果
 */
export async function enhanceSearchQuery(query: string): Promise<SearchEnhancementResult> {
  const config = getV115FeaturesConfig();
  const notes: string[] = [];
  let enhancedQuery = query;
  const additionalQueries: string[] = [];
  let dictionaryExpansion: QueryExpansionResult | undefined;
  let patentOptimization: OptimizedPatentQuery | undefined;
  let wasEnhanced = false;

  // キーワード分析
  const analysisTypes = detectAnalysisType(query);
  const domain = detectDomainFromKeywords(query);

  // 1. 特許検索の検出と最適化
  if (containsPatentKeywords(query) && isV115FeatureEnabled('patentSearch')) {
    const patentConfig = config.patentSearch;
    const optimizer = getPatentSearchOptimizer({
      autoClassification: patentConfig?.autoClassification ?? true,
      synonymExpansion: patentConfig?.synonymExpansion ?? true,
    });

    const patentQuery: PatentSearchQuery = {
      keywords: query.split(/\s+/).filter((k) => k.length > 1),
    };

    patentOptimization = optimizer.optimizeQuery(patentQuery);
    wasEnhanced = true;
    notes.push('Patent search optimization applied');

    // 展開されたキーワードを追加クエリとして追加
    if (patentOptimization.expandedKeywords.length > patentQuery.keywords.length) {
      const newKeywords = patentOptimization.expandedKeywords.filter(
        (k) => !patentQuery.keywords.some((pk) => pk.toLowerCase() === k.toLowerCase())
      );
      if (newKeywords.length > 0) {
        additionalQueries.push(newKeywords.slice(0, 5).join(' '));
        notes.push(`Added ${newKeywords.length} expanded keywords`);
      }
    }

    // 分類コードを追加クエリとして追加
    if (patentOptimization.suggestedClassifications.length > 0) {
      const topClassification = patentOptimization.suggestedClassifications[0];
      additionalQueries.push(`${query} ${topClassification.code}`);
      notes.push(`Suggested classification: ${topClassification.code} (${topClassification.system})`);
    }
  }

  // 2. ドメイン辞書によるクエリ展開
  if (isV115FeatureEnabled('domainDictionary')) {
    const dictManager = getDomainDictionaryManager();
    await dictManager.loadDictionaries();
    const dictConfig = config.domainDictionary;

    // ドメインが検出された場合、そのドメインを優先
    const targetDomain = domain !== null ? domain : undefined;

    // 常に完全なクエリ展開を使用（multilingualはconfig設定で制御される）
    dictionaryExpansion = await dictManager.expandQueryFull(query);

    if (dictionaryExpansion.expandedQueries.length > 0 || dictionaryExpansion.matchedGroups.length > 0) {
      wasEnhanced = true;

      // 展開クエリを追加
      for (const expanded of dictionaryExpansion.expandedQueries.slice(0, 3)) {
        if (expanded !== query) {
          additionalQueries.push(expanded);
        }
      }
      notes.push(`Added ${dictionaryExpansion.expandedQueries.length} expanded queries`);

      // マッチしたグループから同義語を追加
      for (const group of dictionaryExpansion.matchedGroups.slice(0, 2)) {
        if (group.synonyms && group.synonyms.length > 0) {
          additionalQueries.push(group.synonyms[0]);
          notes.push(`Added synonym: ${group.synonyms[0]}`);
        }
      }

      // 多言語展開
      if (dictionaryExpansion.multilingualExpanded) {
        for (const group of dictionaryExpansion.matchedGroups) {
          if (group.english && !additionalQueries.includes(group.english)) {
            additionalQueries.push(group.english);
            notes.push(`Added English: ${group.english}`);
          }
          if (group.japanese && !additionalQueries.includes(group.japanese)) {
            additionalQueries.push(group.japanese);
            notes.push(`Added Japanese: ${group.japanese}`);
          }
        }
      }
    }
  }

  // 拡張クエリを構築
  if (wasEnhanced && additionalQueries.length > 0) {
    // メインクエリは変更せず、追加クエリを提供
    enhancedQuery = query;
  }

  return {
    originalQuery: query,
    enhancedQuery,
    additionalQueries: [...new Set(additionalQueries)], // 重複除去
    analysisTypes,
    domain,
    dictionaryExpansion,
    patentOptimization,
    wasEnhanced,
    enhancementNotes: notes,
  };
}

/**
 * 特許検索URLを取得
 *
 * @param query クエリ
 * @returns 特許庁ごとの検索URL
 */
export async function getPatentSearchUrls(query: string): Promise<Map<string, string>> {
  if (!isV115FeatureEnabled('patentSearch')) {
    return new Map();
  }

  const optimizer = getPatentSearchOptimizer();
  const optimized = optimizer.quickSearch(query.split(/\s+/).filter((k) => k.length > 1));

  return optimized.searchUrls;
}

/**
 * クエリがv1.15.0機能の恩恵を受けられるか判定
 *
 * @param query クエリ
 * @returns 拡張可能かどうかと理由
 */
export function canEnhanceQuery(query: string): { canEnhance: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (containsPatentKeywords(query) && isV115FeatureEnabled('patentSearch')) {
    reasons.push('Patent-related keywords detected');
  }

  const domain = detectDomainFromKeywords(query);
  if (domain !== null && isV115FeatureEnabled('domainDictionary')) {
    reasons.push(`Domain-specific keywords detected: ${domain}`);
  }

  const analysisTypes = detectAnalysisType(query);
  if (analysisTypes.length > 0) {
    reasons.push(`Analysis types: ${analysisTypes.join(', ')}`);
  }

  return {
    canEnhance: reasons.length > 0,
    reasons,
  };
}
