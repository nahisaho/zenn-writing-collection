/**
 * PDF解析型定義
 *
 * TSK-013: PDF解析型定義
 * REQ-PARSE-001: PDFコンテンツ抽出
 * DES-PARSE-001: PDF解析システム設計
 */

/**
 * PDFメタデータ
 */
export interface PdfMetadata {
  /** タイトル */
  title?: string;
  /** 著者 */
  author?: string;
  /** 作成者 */
  creator?: string;
  /** 作成日 */
  creationDate?: Date;
  /** 更新日 */
  modificationDate?: Date;
  /** ページ数 */
  pageCount: number;
  /** ファイルサイズ（バイト） */
  fileSize: number;
  /** PDFバージョン */
  pdfVersion?: string;
  /** キーワード */
  keywords?: string[];
  /** 件名 */
  subject?: string;
}

/**
 * PDF抽出コンテンツ
 */
export interface PdfContent {
  /** 抽出されたテキスト */
  text: string;
  /** メタデータ */
  metadata: PdfMetadata;
  /** 抽出したページ数 */
  extractedPages: number;
  /** 切り詰められたか */
  truncated: boolean;
  /** 切り詰め理由（truncated時） */
  truncationReason?: 'max_pages' | 'max_size' | 'timeout';
  /** 処理時間（ms） */
  processingTimeMs: number;
  /** 警告メッセージ */
  warnings: string[];
}

/**
 * PDF検出結果
 */
export interface PdfDetectionResult {
  /** PDFかどうか */
  isPdf: boolean;
  /** 検出方法 */
  detectionMethod: 'extension' | 'content-type' | 'magic-bytes';
  /** URL（ダウンロード元） */
  url?: string;
  /** ファイルパス（ローカル） */
  filePath?: string;
  /** Content-Type（HTTP取得時） */
  contentType?: string;
}

/**
 * PDF解析エラー
 */
export interface PdfParseError {
  /** エラーコード */
  code:
    | 'PASSWORD_PROTECTED'
    | 'CORRUPTED'
    | 'TOO_LARGE'
    | 'TIMEOUT'
    | 'DOWNLOAD_FAILED'
    | 'UNSUPPORTED_FORMAT'
    | 'UNKNOWN';
  /** エラーメッセージ */
  message: string;
  /** 元のエラー */
  cause?: Error;
}

/**
 * PDF解析結果（成功 or エラー）
 */
export type PdfParseResult =
  | { success: true; content: PdfContent }
  | { success: false; error: PdfParseError };
