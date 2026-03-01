/**
 * Domain Dictionary Types
 * 
 * v1.15.0: REQ-DICT-001 専門用語辞書・同義語展開
 */

/**
 * ドメインタイプ
 */
export type DomainType = 'it' | 'business' | 'finance' | 'legal' | 'healthcare';

/**
 * 同義語グループ
 */
export interface SynonymGroup {
  /** 正規形（代表語） */
  canonical: string;
  /** 同義語リスト */
  synonyms: string[];
  /** 英語訳（多言語展開用） */
  english?: string;
  /** 日本語訳（多言語展開用） */
  japanese?: string;
}

/**
 * ドメイン辞書定義
 */
export interface DomainDictionary {
  /** ドメイン識別子 */
  domain: DomainType;
  /** ドメイン名（表示用） */
  name: string;
  /** ドメイン説明 */
  description?: string;
  /** ドメイン検出キーワード */
  detectionKeywords: string[];
  /** 同義語グループリスト */
  synonymGroups: SynonymGroup[];
}

/**
 * YAML辞書ファイル形式
 */
export interface DomainDictionariesYaml {
  version: string;
  domains: DomainDictionary[];
}

/**
 * クエリ展開結果
 */
export interface QueryExpansionResult {
  /** 元のクエリ */
  originalQuery: string;
  /** 検出されたドメイン */
  detectedDomain: DomainType | null;
  /** 展開されたクエリリスト */
  expandedQueries: string[];
  /** マッチした同義語グループ */
  matchedGroups: SynonymGroup[];
  /** 多言語展開が行われたか */
  multilingualExpanded: boolean;
}

/**
 * 新語提案
 */
export interface TermSuggestion {
  /** 提案された用語 */
  term: string;
  /** 推定ドメイン */
  suggestedDomain: DomainType;
  /** 類似する既存用語 */
  similarTerms: string[];
  /** 提案日時 */
  suggestedAt: string;
}
