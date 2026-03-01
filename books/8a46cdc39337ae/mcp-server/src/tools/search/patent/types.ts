/**
 * Patent Search Types
 * REQ-PAT-001: 特許検索最適化機能の型定義
 *
 * @remarks
 * - 特許検索クエリの最適化
 * - IPC/CPC分類コードのサポート
 * - 日米欧特許庁対応
 * - TSK-010 実装の一部
 */

/**
 * 特許庁の種類
 */
export type PatentOffice =
  | 'JPO'   // Japan Patent Office
  | 'USPTO' // United States Patent and Trademark Office
  | 'EPO'   // European Patent Office
  | 'WIPO'  // World Intellectual Property Organization
  | 'CNIPA' // China National Intellectual Property Administration
  | 'KIPO'; // Korean Intellectual Property Office

/**
 * 特許分類システム
 */
export type ClassificationSystem =
  | 'IPC'   // International Patent Classification
  | 'CPC'   // Cooperative Patent Classification
  | 'FI'    // File Index (Japan)
  | 'USPC'  // US Patent Classification (deprecated but still used)
  | 'FT';   // F-terms (Japan)

/**
 * 特許分類コード
 */
export interface PatentClassification {
  /** 分類システム */
  system: ClassificationSystem;
  /** 分類コード */
  code: string;
  /** 説明（オプション） */
  description?: string;
  /** 信頼度（0-1） */
  confidence: number;
}

/**
 * 特許検索クエリ
 */
export interface PatentSearchQuery {
  /** 検索キーワード */
  keywords: string[];
  /** 分類コード */
  classifications?: PatentClassification[];
  /** 出願人/権利者 */
  applicant?: string;
  /** 発明者 */
  inventor?: string;
  /** 出願日範囲 */
  filingDateRange?: {
    from?: string; // YYYY-MM-DD
    to?: string;
  };
  /** 公開日範囲 */
  publicationDateRange?: {
    from?: string;
    to?: string;
  };
  /** 対象特許庁 */
  offices?: PatentOffice[];
  /** 言語 */
  languages?: string[];
}

/**
 * 最適化された特許検索クエリ
 */
export interface OptimizedPatentQuery {
  /** 元のクエリ */
  originalQuery: PatentSearchQuery;
  /** 最適化されたクエリ文字列（各特許庁形式） */
  optimizedQueries: Map<PatentOffice, string>;
  /** 提案された分類コード */
  suggestedClassifications: PatentClassification[];
  /** 同義語展開されたキーワード */
  expandedKeywords: string[];
  /** 検索URL（各特許庁） */
  searchUrls: Map<PatentOffice, string>;
  /** 最適化の説明 */
  optimizationNotes: string[];
}

/**
 * IPC/CPCコードのマッピング
 */
export interface ClassificationMapping {
  /** IPCコード */
  ipc: string;
  /** CPCコード（複数対応可能） */
  cpc: string[];
  /** FIコード（日本） */
  fi?: string[];
  /** 説明 */
  description: string;
  /** キーワード例 */
  keywords: string[];
}

/**
 * 特許検索最適化の設定
 */
export interface PatentSearchConfig {
  /** デフォルトの対象特許庁 */
  defaultOffices: PatentOffice[];
  /** 分類コードの自動推定を有効化 */
  autoClassification: boolean;
  /** 同義語展開を有効化 */
  synonymExpansion: boolean;
  /** 多言語検索を有効化 */
  multilingualSearch: boolean;
  /** 最大結果数 */
  maxResults: number;
  /** 分類コードマッピングのパス */
  classificationMappingPath?: string;
}

/**
 * 特許検索結果のメタデータ
 */
export interface PatentSearchMetadata {
  /** 検索にかかった時間（ms） */
  searchTimeMs: number;
  /** 推定結果数 */
  estimatedResults: number;
  /** 使用された分類コード */
  usedClassifications: PatentClassification[];
  /** 展開されたキーワード数 */
  expandedKeywordCount: number;
  /** 検索対象の特許庁 */
  targetOffices: PatentOffice[];
}
