/**
 * ContentValidator - 空コンテンツ検出・警告
 *
 * REQ-CONT-001: 空コンテンツ検出・警告
 * DES-SHIKIGAMI-014 Section 3.3
 * TSK-TS-003
 *
 * @version 1.14.0
 */

/**
 * コンテンツ検証設定
 */
export interface ContentValidationConfig {
  /** 最小文字数（これ未満は空とみなす、デフォルト: 100） */
  minLength?: number;
  /** 警告文字数（これ未満は警告、デフォルト: 500） */
  warningLength?: number;
  /** 意味のあるコンテンツの最小割合（0-1、デフォルト: 0.3） */
  minMeaningfulRatio?: number;
  /** ブロックリスト（これらの文字列のみの場合は空とみなす） */
  blocklist?: string[];
}

/**
 * デフォルト設定
 */
export const DEFAULT_CONTENT_VALIDATION_CONFIG: Required<ContentValidationConfig> = {
  minLength: 100,
  warningLength: 500,
  minMeaningfulRatio: 0.3,
  blocklist: [
    'JavaScript is required',
    'Please enable JavaScript',
    'Loading...',
    'Access Denied',
    '403 Forbidden',
    '404 Not Found',
    'Page not found',
    'Error',
    'Something went wrong',
  ],
};

/**
 * コンテンツ検証結果
 */
export interface ContentValidationResult {
  /** 有効なコンテンツかどうか */
  isValid: boolean;
  /** 警告があるかどうか */
  hasWarning: boolean;
  /** 検証ステータス */
  status: 'valid' | 'warning' | 'empty' | 'blocked' | 'too_short';
  /** コンテンツ長 */
  contentLength: number;
  /** 意味のある文字の割合 */
  meaningfulRatio: number;
  /** メッセージ */
  message: string;
  /** 詳細情報 */
  details?: {
    /** マッチしたブロックリスト項目 */
    matchedBlocklist?: string;
    /** 推定されるコンテンツタイプ */
    estimatedContentType?: 'html' | 'text' | 'json' | 'error_page' | 'login_page';
    /** 追加の警告 */
    additionalWarnings?: string[];
  };
}

/**
 * コンテンツを検証
 */
export function validateContent(
  content: string | undefined | null,
  config?: ContentValidationConfig
): ContentValidationResult {
  const effectiveConfig: Required<ContentValidationConfig> = {
    ...DEFAULT_CONTENT_VALIDATION_CONFIG,
    ...config,
  };

  // null/undefined/空文字列チェック
  if (!content || content.trim().length === 0) {
    return {
      isValid: false,
      hasWarning: false,
      status: 'empty',
      contentLength: 0,
      meaningfulRatio: 0,
      message: 'コンテンツが空です。ページにアクセスできなかった可能性があります。',
    };
  }

  const trimmedContent = content.trim();
  const contentLength = trimmedContent.length;

  // ブロックリストチェック
  for (const blocked of effectiveConfig.blocklist) {
    if (trimmedContent.toLowerCase().includes(blocked.toLowerCase())) {
      // コンテンツの大部分がブロック項目の場合のみ
      if (trimmedContent.length < blocked.length * 3) {
        return {
          isValid: false,
          hasWarning: false,
          status: 'blocked',
          contentLength,
          meaningfulRatio: 0,
          message: `コンテンツがブロックされています: "${blocked}"`,
          details: {
            matchedBlocklist: blocked,
            estimatedContentType: detectContentType(trimmedContent),
          },
        };
      }
    }
  }

  // 最小文字数チェック
  if (contentLength < effectiveConfig.minLength) {
    return {
      isValid: false,
      hasWarning: false,
      status: 'too_short',
      contentLength,
      meaningfulRatio: calculateMeaningfulRatio(trimmedContent),
      message: `コンテンツが短すぎます（${contentLength}文字）。最小${effectiveConfig.minLength}文字必要です。`,
      details: {
        estimatedContentType: detectContentType(trimmedContent),
      },
    };
  }

  // 意味のある文字の割合を計算
  const meaningfulRatio = calculateMeaningfulRatio(trimmedContent);

  // 意味のある文字が少なすぎる場合
  if (meaningfulRatio < effectiveConfig.minMeaningfulRatio) {
    return {
      isValid: false,
      hasWarning: true,
      status: 'warning',
      contentLength,
      meaningfulRatio,
      message: `コンテンツの意味のある文字の割合が低いです（${(meaningfulRatio * 100).toFixed(1)}%）。HTMLタグやスクリプトが多い可能性があります。`,
      details: {
        estimatedContentType: detectContentType(trimmedContent),
        additionalWarnings: ['コンテンツの抽出が不完全な可能性があります'],
      },
    };
  }

  // 警告文字数チェック
  if (contentLength < effectiveConfig.warningLength) {
    const warnings: string[] = [];
    const contentType = detectContentType(trimmedContent);

    if (contentType === 'error_page') {
      warnings.push('エラーページの可能性があります');
    }
    if (contentType === 'login_page') {
      warnings.push('ログインページの可能性があります');
    }

    return {
      isValid: true,
      hasWarning: true,
      status: 'warning',
      contentLength,
      meaningfulRatio,
      message: `コンテンツが短めです（${contentLength}文字）。情報が不足している可能性があります。`,
      details: {
        estimatedContentType: contentType,
        additionalWarnings: warnings.length > 0 ? warnings : undefined,
      },
    };
  }

  // 有効なコンテンツ
  return {
    isValid: true,
    hasWarning: false,
    status: 'valid',
    contentLength,
    meaningfulRatio,
    message: `コンテンツは有効です（${contentLength}文字）。`,
    details: {
      estimatedContentType: detectContentType(trimmedContent),
    },
  };
}

/**
 * 意味のある文字の割合を計算
 *
 * HTMLタグ、スクリプト、スタイル、空白を除いた文字の割合
 */
export function calculateMeaningfulRatio(content: string): number {
  if (!content || content.length === 0) return 0;

  // HTMLタグを除去
  let cleaned = content.replace(/<[^>]*>/g, ' ');

  // スクリプト・スタイルブロックを除去
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');

  // 連続する空白を単一のスペースに
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // 意味のある文字（アルファベット、数字、日本語など）をカウント
  const meaningfulChars = cleaned.match(/[\p{L}\p{N}]/gu) ?? [];

  return meaningfulChars.length / content.length;
}

/**
 * コンテンツタイプを推定
 */
export function detectContentType(
  content: string
): 'html' | 'text' | 'json' | 'error_page' | 'login_page' {
  const lower = content.toLowerCase();

  // JSONの可能性
  if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
    try {
      JSON.parse(content);
      return 'json';
    } catch {
      // JSONではない
    }
  }

  // エラーページの検出
  const errorIndicators = [
    'error',
    '404',
    '500',
    'not found',
    'access denied',
    'forbidden',
    'something went wrong',
  ];
  const errorCount = errorIndicators.filter((indicator) =>
    lower.includes(indicator)
  ).length;
  if (errorCount >= 2) {
    return 'error_page';
  }

  // ログインページの検出
  const loginIndicators = [
    'login',
    'sign in',
    'password',
    'username',
    'email',
    'authenticate',
  ];
  const loginCount = loginIndicators.filter((indicator) =>
    lower.includes(indicator)
  ).length;
  if (loginCount >= 3) {
    return 'login_page';
  }

  // HTMLの検出
  if (lower.includes('<html') || lower.includes('<body') || lower.includes('<div')) {
    return 'html';
  }

  return 'text';
}

/**
 * ContentValidator - コンテンツ検証を管理
 */
export class ContentValidator {
  private readonly config: Required<ContentValidationConfig>;

  constructor(config?: ContentValidationConfig) {
    this.config = { ...DEFAULT_CONTENT_VALIDATION_CONFIG, ...config };
  }

  /**
   * コンテンツを検証
   */
  validate(content: string | undefined | null): ContentValidationResult {
    return validateContent(content, this.config);
  }

  /**
   * 設定を取得
   */
  getConfig(): Required<ContentValidationConfig> {
    return { ...this.config };
  }

  /**
   * ブロックリストに項目を追加
   */
  addBlocklistItem(item: string): void {
    if (!this.config.blocklist.includes(item)) {
      this.config.blocklist.push(item);
    }
  }

  /**
   * ブロックリストから項目を削除
   */
  removeBlocklistItem(item: string): void {
    const index = this.config.blocklist.indexOf(item);
    if (index !== -1) {
      this.config.blocklist.splice(index, 1);
    }
  }

  /**
   * 複数のコンテンツを一括検証
   */
  validateAll(
    contents: (string | undefined | null)[]
  ): ContentValidationResult[] {
    return contents.map((content) => this.validate(content));
  }

  /**
   * 検証サマリーを生成
   */
  generateSummary(results: ContentValidationResult[]): {
    total: number;
    valid: number;
    warning: number;
    invalid: number;
    validRate: number;
  } {
    const total = results.length;
    const valid = results.filter((r) => r.isValid && !r.hasWarning).length;
    const warning = results.filter((r) => r.hasWarning).length;
    const invalid = results.filter((r) => !r.isValid).length;

    return {
      total,
      valid,
      warning,
      invalid,
      validRate: total > 0 ? valid / total : 0,
    };
  }
}
