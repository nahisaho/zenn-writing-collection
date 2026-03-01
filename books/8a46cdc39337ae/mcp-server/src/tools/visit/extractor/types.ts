/**
 * Extractor Types
 * REQ-EXT-001: 構造化データ抽出パイプライン機能の型定義
 * REQ-MULTI-001: マルチモーダル抽出機能の型定義
 * REQ-PAY-001: ペイウォール検知機能の型定義
 *
 * @remarks
 * - 構造化データ抽出
 * - マルチモーダル対応
 * - ペイウォール検知
 * - TSK-011, TSK-012, TSK-013 実装の一部
 */

/**
 * 抽出対象のコンテンツタイプ
 */
export type ExtractableContentType =
  | 'article'
  | 'paper'
  | 'patent'
  | 'product'
  | 'event'
  | 'recipe'
  | 'code'
  | 'table'
  | 'list'
  | 'general';

/**
 * 抽出結果の基底インターフェース
 */
export interface ExtractionResult<T = unknown> {
  /** 抽出が成功したか */
  success: boolean;
  /** 抽出されたデータ */
  data?: T;
  /** エラーメッセージ */
  error?: string;
  /** 抽出元のコンテンツタイプ */
  contentType: ExtractableContentType;
  /** 信頼度（0-1） */
  confidence: number;
  /** メタデータ */
  metadata: ExtractionMetadata;
}

/**
 * 抽出メタデータ
 */
export interface ExtractionMetadata {
  /** 抽出にかかった時間（ms） */
  extractionTimeMs: number;
  /** 使用された抽出器 */
  extractorUsed: string;
  /** 抽出されたフィールド数 */
  fieldCount: number;
  /** 欠損フィールド */
  missingFields: string[];
  /** ソースURL */
  sourceUrl?: string;
  /** 抽出日時 */
  extractedAt: string;
}

/**
 * 記事データ
 */
export interface ArticleData {
  /** タイトル */
  title: string;
  /** 著者 */
  authors: string[];
  /** 公開日 */
  publishedDate?: string;
  /** 更新日 */
  modifiedDate?: string;
  /** 本文 */
  content: string;
  /** 要約 */
  summary?: string;
  /** カテゴリ */
  categories?: string[];
  /** タグ */
  tags?: string[];
  /** 画像URL */
  images?: ImageData[];
  /** ソース */
  source?: string;
}

/**
 * 論文データ
 */
export interface PaperData {
  /** タイトル */
  title: string;
  /** 著者 */
  authors: Author[];
  /** 要約（アブストラクト） */
  abstract: string;
  /** キーワード */
  keywords: string[];
  /** DOI */
  doi?: string;
  /** 出版日 */
  publicationDate?: string;
  /** ジャーナル/カンファレンス */
  venue?: string;
  /** 引用数 */
  citationCount?: number;
  /** 参考文献 */
  references?: Reference[];
  /** セクション */
  sections?: PaperSection[];
  /** 図表 */
  figures?: FigureData[];
}

/**
 * 著者情報
 */
export interface Author {
  /** 名前 */
  name: string;
  /** 所属 */
  affiliation?: string;
  /** メール */
  email?: string;
  /** ORCID */
  orcid?: string;
}

/**
 * 参考文献
 */
export interface Reference {
  /** 番号 */
  number: number;
  /** テキスト */
  text: string;
  /** DOI */
  doi?: string;
}

/**
 * 論文セクション
 */
export interface PaperSection {
  /** セクション名 */
  heading: string;
  /** 内容 */
  content: string;
  /** サブセクション */
  subsections?: PaperSection[];
}

/**
 * 特許データ
 */
export interface PatentData {
  /** 特許番号 */
  patentNumber: string;
  /** タイトル */
  title: string;
  /** 要約 */
  abstract: string;
  /** 出願人 */
  applicants: string[];
  /** 発明者 */
  inventors: string[];
  /** 出願日 */
  filingDate?: string;
  /** 公開日 */
  publicationDate?: string;
  /** 分類コード */
  classifications: string[];
  /** クレーム */
  claims: PatentClaim[];
  /** 図面 */
  drawings?: FigureData[];
  /** 優先権 */
  priorities?: Priority[];
}

/**
 * 特許クレーム
 */
export interface PatentClaim {
  /** クレーム番号 */
  number: number;
  /** 独立/従属 */
  type: 'independent' | 'dependent';
  /** 内容 */
  text: string;
  /** 依存先クレーム番号 */
  dependsOn?: number[];
}

/**
 * 優先権情報
 */
export interface Priority {
  /** 国 */
  country: string;
  /** 番号 */
  number: string;
  /** 日付 */
  date: string;
}

/**
 * 製品データ
 */
export interface ProductData {
  /** 製品名 */
  name: string;
  /** 説明 */
  description: string;
  /** 価格 */
  price?: {
    amount: number;
    currency: string;
  };
  /** ブランド */
  brand?: string;
  /** カテゴリ */
  category?: string;
  /** 画像 */
  images?: ImageData[];
  /** 評価 */
  rating?: {
    value: number;
    count: number;
  };
  /** 仕様 */
  specifications?: Record<string, string>;
  /** 在庫状況 */
  availability?: string;
}

/**
 * 画像データ
 */
export interface ImageData {
  /** URL */
  url: string;
  /** 代替テキスト */
  alt?: string;
  /** キャプション */
  caption?: string;
  /** 幅 */
  width?: number;
  /** 高さ */
  height?: number;
}

/**
 * 図表データ
 */
export interface FigureData {
  /** 番号 */
  number: number;
  /** 種類 */
  type: 'figure' | 'table' | 'chart' | 'diagram';
  /** キャプション */
  caption: string;
  /** URL（画像の場合） */
  url?: string;
  /** データ（テーブルの場合） */
  data?: string[][];
}

/**
 * テーブルデータ
 */
export interface TableData {
  /** ヘッダー */
  headers: string[];
  /** 行データ */
  rows: string[][];
  /** キャプション */
  caption?: string;
}

/**
 * 抽出パイプラインの設定
 */
export interface ExtractorPipelineConfig {
  /** タイムアウト（ms） */
  timeout: number;
  /** 最大リトライ回数 */
  maxRetries: number;
  /** 画像抽出を有効化 */
  extractImages: boolean;
  /** テーブル抽出を有効化 */
  extractTables: boolean;
  /** ペイウォール検知を有効化 */
  detectPaywall: boolean;
  /** 構造化データの出力形式 */
  outputFormat: 'json' | 'markdown' | 'both';
  /** カスタム抽出器 */
  customExtractors?: ExtractorDefinition[];
}

/**
 * 抽出器の定義
 */
export interface ExtractorDefinition {
  /** 抽出器名 */
  name: string;
  /** 対象コンテンツタイプ */
  contentType: ExtractableContentType;
  /** 抽出関数 */
  extract: (html: string, url: string) => Promise<unknown>;
  /** 優先度 */
  priority: number;
}

/**
 * ペイウォール検知結果
 */
export interface PaywallDetectionResult {
  /** ペイウォールが検出されたか */
  isPaywalled: boolean;
  /** ペイウォールの種類 */
  paywallType?: PaywallType;
  /** 信頼度（0-1） */
  confidence: number;
  /** 検出根拠 */
  evidence: string[];
  /** 代替アクセス方法の提案 */
  suggestions: string[];
  /** 部分的にアクセス可能なコンテンツがあるか */
  hasPartialContent: boolean;
  /** アクセス可能なコンテンツの割合（0-100） */
  accessiblePercentage: number;
}

/**
 * ペイウォールの種類
 */
export type PaywallType =
  | 'hard'        // 完全にブロック
  | 'soft'        // メーター制（一定数まで無料）
  | 'freemium'    // 一部無料
  | 'registration' // 登録必須
  | 'subscription' // 購読必須
  | 'institutional'; // 機関購読

/**
 * マルチモーダル抽出の設定
 */
export interface MultiModalExtractorConfig {
  /** 画像の最大数 */
  maxImages: number;
  /** 画像の最小サイズ（px） */
  minImageSize: number;
  /** OCRを有効化 */
  enableOcr: boolean;
  /** 図表のキャプション抽出を有効化 */
  extractCaptions: boolean;
  /** コードブロック抽出を有効化 */
  extractCodeBlocks: boolean;
}

/**
 * マルチモーダル抽出結果
 */
export interface MultiModalExtractionResult {
  /** テキストコンテンツ */
  text: string;
  /** 画像 */
  images: ImageData[];
  /** テーブル */
  tables: TableData[];
  /** コードブロック */
  codeBlocks: CodeBlock[];
  /** 図表 */
  figures: FigureData[];
}

/**
 * コードブロック
 */
export interface CodeBlock {
  /** 言語 */
  language?: string;
  /** コード */
  code: string;
  /** ファイル名（あれば） */
  filename?: string;
}
