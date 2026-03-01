/**
 * エンコーディング処理 型定義
 *
 * @requirements REQ-VISIT-003, REQ-VISIT-003-01, REQ-VISIT-003-02
 * @design DES-VISIT-003
 * @version 1.11.0
 */

/**
 * サポートするエンコーディング
 */
export type SupportedEncoding =
  | 'utf-8'
  | 'shift_jis'
  | 'euc-jp'
  | 'iso-2022-jp'
  | 'windows-31j';

/**
 * エンコーディング検出ソース
 */
export type EncodingDetectionSource =
  | 'content-type'
  | 'meta-charset'
  | 'bom'
  | 'heuristic';

/**
 * エンコーディング検出結果
 */
export interface EncodingDetectionResult {
  /** 検出されたエンコーディング */
  detected: SupportedEncoding;
  /** 信頼度 (0.0-1.0) */
  confidence: number;
  /** 検出ソース */
  source: EncodingDetectionSource;
  /** 検出の詳細情報 */
  details?: string;
}

/**
 * 文字化けパターン
 */
export interface MojibakePattern {
  /** パターン名 */
  name: string;
  /** 検出パターン（正規表現文字列） */
  pattern: string;
  /** 推定される元エンコーディング */
  suggestedEncoding: SupportedEncoding;
  /** 誤変換元 */
  fromEncoding: string;
  /** 誤変換先 */
  toEncoding: string;
}

/**
 * 文字化け検出結果
 */
export interface MojibakeDetectionResult {
  /** 文字化けが検出されたか */
  hasMojibake: boolean;
  /** 検出されたパターン */
  patterns: MojibakePattern[];
  /** 推奨される再変換エンコーディング */
  suggestedEncoding?: SupportedEncoding;
  /** 信頼度 (0.0-1.0) */
  confidence: number;
}

/**
 * エンコーディング変換結果
 */
export interface EncodingConversionResult {
  /** 変換成功フラグ */
  success: boolean;
  /** 元のエンコーディング */
  originalEncoding: SupportedEncoding;
  /** 変換先エンコーディング */
  targetEncoding: SupportedEncoding;
  /** 変換後のコンテンツ */
  convertedContent: string;
  /** エラーメッセージ（失敗時） */
  error?: string;
  /** 変換時間（ms） */
  conversionTimeMs?: number;
}

/**
 * エンコーディング処理結果
 */
export interface EncodingProcessResult {
  /** 処理成功フラグ */
  success: boolean;
  /** 処理後のコンテンツ */
  content: string;
  /** 検出されたエンコーディング */
  detectedEncoding: SupportedEncoding;
  /** 変換が行われたか */
  wasConverted: boolean;
  /** 文字化け検出結果 */
  mojibakeResult?: MojibakeDetectionResult;
  /** エラーメッセージ（失敗時） */
  error?: string;
  /** 処理ログ */
  logs: string[];
}

/**
 * エンコーディングハンドラ設定
 */
export interface EncodingHandlerConfig {
  /** 文字化け検出を有効にするか */
  enableMojibakeDetection: boolean;
  /** 自動変換を有効にするか */
  enableAutoConversion: boolean;
  /** フォールバックエンコーディング */
  fallbackEncoding: SupportedEncoding;
  /** タイムアウト（ms） */
  timeoutMs: number;
  /** 詳細ログを有効にするか */
  verboseLogging: boolean;
}

/**
 * デフォルト設定
 */
export const DEFAULT_ENCODING_CONFIG: EncodingHandlerConfig = {
  enableMojibakeDetection: true,
  enableAutoConversion: true,
  fallbackEncoding: 'utf-8',
  timeoutMs: 5000,
  verboseLogging: false,
};

/**
 * 文字化けパターン定義
 */
export const MOJIBAKE_PATTERNS: MojibakePattern[] = [
  // Shift_JIS → UTF-8 誤変換パターン
  {
    name: 'shift_jis_as_utf8_1',
    pattern: '縺',
    suggestedEncoding: 'shift_jis',
    fromEncoding: 'shift_jis',
    toEncoding: 'utf-8',
  },
  {
    name: 'shift_jis_as_utf8_2',
    pattern: '譁',
    suggestedEncoding: 'shift_jis',
    fromEncoding: 'shift_jis',
    toEncoding: 'utf-8',
  },
  {
    name: 'shift_jis_as_utf8_3',
    pattern: '繧',
    suggestedEncoding: 'shift_jis',
    fromEncoding: 'shift_jis',
    toEncoding: 'utf-8',
  },
  {
    name: 'shift_jis_as_utf8_4',
    pattern: '繝',
    suggestedEncoding: 'shift_jis',
    fromEncoding: 'shift_jis',
    toEncoding: 'utf-8',
  },
  {
    name: 'shift_jis_as_utf8_5',
    pattern: '蜀',
    suggestedEncoding: 'shift_jis',
    fromEncoding: 'shift_jis',
    toEncoding: 'utf-8',
  },
  // UTF-8 → Latin1 誤変換パターン
  {
    name: 'utf8_as_latin1_1',
    pattern: 'ã€',
    suggestedEncoding: 'utf-8',
    fromEncoding: 'utf-8',
    toEncoding: 'iso-8859-1',
  },
  {
    name: 'utf8_as_latin1_2',
    pattern: 'ã‚',
    suggestedEncoding: 'utf-8',
    fromEncoding: 'utf-8',
    toEncoding: 'iso-8859-1',
  },
  {
    name: 'utf8_as_latin1_3',
    pattern: 'ã',
    suggestedEncoding: 'utf-8',
    fromEncoding: 'utf-8',
    toEncoding: 'iso-8859-1',
  },
  // 置換文字（変換失敗の兆候）
  {
    name: 'replacement_character',
    pattern: '\uFFFD',
    suggestedEncoding: 'shift_jis',
    fromEncoding: 'unknown',
    toEncoding: 'utf-8',
  },
];

/**
 * BOMマッピング
 */
export const BOM_MAP: Record<string, SupportedEncoding> = {
  '\xEF\xBB\xBF': 'utf-8',
  '\xFE\xFF': 'utf-8', // UTF-16BE（UTF-8として扱う）
  '\xFF\xFE': 'utf-8', // UTF-16LE（UTF-8として扱う）
};

/**
 * エンコーディング名のエイリアスマップ
 */
export const ENCODING_ALIASES: Record<string, SupportedEncoding> = {
  // UTF-8
  'utf-8': 'utf-8',
  'utf8': 'utf-8',
  'UTF-8': 'utf-8',
  // Shift_JIS
  'shift_jis': 'shift_jis',
  'shift-jis': 'shift_jis',
  'sjis': 'shift_jis',
  'Shift_JIS': 'shift_jis',
  'x-sjis': 'shift_jis',
  // Windows-31J (CP932)
  'windows-31j': 'windows-31j',
  'cp932': 'windows-31j',
  'ms932': 'windows-31j',
  // EUC-JP
  'euc-jp': 'euc-jp',
  'eucjp': 'euc-jp',
  'EUC-JP': 'euc-jp',
  'x-euc-jp': 'euc-jp',
  // ISO-2022-JP
  'iso-2022-jp': 'iso-2022-jp',
  'ISO-2022-JP': 'iso-2022-jp',
  'jis': 'iso-2022-jp',
};
