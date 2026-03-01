/**
 * Alternative Source Types
 * REQ-ALT-001: 代替情報源管理機能の型定義
 *
 * @remarks
 * - 有料コンテンツの代替情報源を管理
 * - 科学論文、特許、ニュース、技術ドキュメントに対応
 * - TSK-005 実装の一部
 */

/**
 * コンテンツ種別
 */
export type ContentType =
  | 'scientific_paper'
  | 'patent'
  | 'news'
  | 'technical_doc'
  | 'general';

/**
 * 代替情報源の種類
 */
export type AlternativeSourceType =
  | 'preprint'
  | 'open_access'
  | 'institutional_repository'
  | 'author_homepage'
  | 'archive'
  | 'related_source'
  | 'cache';

/**
 * 代替情報源の定義
 */
export interface AlternativeSource {
  /** 情報源の識別子 */
  id: string;
  /** 情報源の名前 */
  name: string;
  /** 情報源の種類 */
  type: AlternativeSourceType;
  /** 対応するコンテンツ種別 */
  contentTypes: ContentType[];
  /** URLパターン（正規表現） */
  urlPattern?: string;
  /** 検索URL生成テンプレート */
  searchUrlTemplate?: string;
  /** 優先度（低い値ほど高優先度） */
  priority: number;
  /** 説明 */
  description?: string;
  /** 有効/無効 */
  enabled: boolean;
}

/**
 * 代替情報源の設定ファイル構造
 */
export interface AlternativeSourcesConfig {
  /** バージョン */
  version: string;
  /** コンテンツ種別ごとの代替情報源 */
  sources: {
    [key in ContentType]?: AlternativeSource[];
  };
  /** カスタム情報源 */
  custom?: AlternativeSource[];
}

/**
 * 代替情報源の検索結果
 */
export interface AlternativeSourceResult {
  /** 元のURL */
  originalUrl: string;
  /** 検出されたコンテンツ種別 */
  contentType: ContentType;
  /** 代替情報源のリスト */
  alternatives: AlternativeSourceSuggestion[];
  /** 検出された識別子（DOI、論文IDなど） */
  identifiers: ExtractedIdentifier[];
}

/**
 * 代替情報源の提案
 */
export interface AlternativeSourceSuggestion {
  /** 情報源 */
  source: AlternativeSource;
  /** 生成されたURL */
  url: string;
  /** 信頼度スコア（0-1） */
  confidence: number;
  /** 理由 */
  reason: string;
}

/**
 * 抽出された識別子
 */
export interface ExtractedIdentifier {
  /** 識別子の種類 */
  type: IdentifierType;
  /** 識別子の値 */
  value: string;
  /** 抽出元（URL、テキスト等） */
  extractedFrom: 'url' | 'text' | 'metadata';
}

/**
 * 識別子の種類
 */
export type IdentifierType =
  | 'doi'
  | 'arxiv_id'
  | 'pmid'
  | 'pmcid'
  | 'isbn'
  | 'issn'
  | 'patent_number'
  | 'semantic_scholar_id'
  | 'unknown';

/**
 * コンテンツ検出結果
 */
export interface ContentDetectionResult {
  /** 検出されたコンテンツ種別 */
  contentType: ContentType;
  /** 信頼度（0-1） */
  confidence: number;
  /** 検出根拠 */
  evidence: string[];
}

/**
 * 識別子抽出器のインターフェース
 */
export interface IdentifierExtractor {
  /** 識別子の種類 */
  type: IdentifierType;
  /** URLから識別子を抽出 */
  extractFromUrl(url: string): string | null;
  /** テキストから識別子を抽出 */
  extractFromText(text: string): string[];
  /** 識別子の妥当性を検証 */
  validate(identifier: string): boolean;
}
