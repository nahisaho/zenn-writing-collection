/**
 * Page Visit Tool
 * 
 * Implements REQ-DR-002: Web検索 (page fetching)
 * Implements REQ-NF-007: プロバイダー設定ファイル対応
 * Implements REQ-PARSE-001: PDFコンテンツ抽出 (v1.7.0)
 * Implements REQ-SRCH-004: ページ訪問リカバリー (v1.10.0)
 * Implements REQ-HTTP-001: Exponential Backoff リトライ (v1.14.0)
 * Implements REQ-CONT-001: コンテンツ有効性検証 (v1.14.0)
 * Implements REQ-FRESH-001: 情報鮮度自動評価 (v1.14.0)
 * Uses Jina AI Reader for LLM-optimized text extraction
 */

import { getConfig } from '../config/loader.js';
import { PdfParser } from './pdf-parser/index.js';
import type { PdfParsingConfig, VisitRecoveryConfig } from '../config/types.js';
import { DEFAULT_PDF_PARSING_CONFIG, DEFAULT_VISIT_RECOVERY_CONFIG } from '../config/types.js';
import {
  VisitRecoveryManager,
  type PageFetchResult,
  type VisitRecoveryResult,
} from './visit/recovery/index.js';
// v1.14.0: 新機能インポート
import { ContentValidator, type ContentValidationResult } from './visit/content-validator.js';
import { FreshnessEvaluator, type FreshnessResult } from './visit/freshness-evaluator.js';
import { retryWithBackoff, type ExponentialBackoffConfig } from './visit/recovery/exponential-backoff.js';

export interface PageContent {
  url: string;
  title: string;
  content: string;
  fetchedAt: string;
  error?: string;
  /** v1.7.0: PDFから抽出されたコンテンツかどうか */
  isPdf?: boolean;
  /** v1.7.0: PDFメタデータ */
  pdfMetadata?: {
    pageCount: number;
    author?: string;
    creationDate?: string;
  };
  /** v1.10.0: リカバリー情報 */
  recovery?: {
    /** Wayback Machine を使用したかどうか */
    usedWayback: boolean;
    /** 実際に取得したURL */
    usedUrl: string;
    /** 試行回数 */
    attempts: number;
    /** Waybackスナップショット日時（使用時） */
    waybackTimestamp?: string;
  };
  /** v1.14.0: コンテンツ検証結果 */
  validation?: {
    /** 検証ステータス */
    status: 'valid' | 'warning' | 'empty' | 'blocked' | 'too_short';
    /** 意味のある文字比率 */
    meaningfulRatio?: number;
    /** 警告メッセージ */
    warnings?: string[];
  };
  /** v1.14.0: 鮮度評価結果 */
  freshness?: {
    /** 鮮度レベル */
    level: 'fresh' | 'recent' | 'stale' | 'outdated' | 'unknown';
    /** 公開日 */
    publishDate?: string;
    /** 経過日数 */
    daysOld?: number;
    /** 鮮度スコア */
    score: number;
  };
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Rate limiting (will be initialized from config)
let lastRequestTime = 0;

/**
 * Get rate limit interval from config
 */
function getMinRequestInterval(): number {
  const config = getConfig();
  return config.pageFetcher?.options?.rateLimitMs ?? 1000;
}

/**
 * Get Jina API key from config
 */
function getJinaApiKey(): string | undefined {
  const config = getConfig();
  return config.pageFetcher?.options?.apiKey;
}

/**
 * v1.7.0: Get PDF parsing config
 */
function getPdfConfig(): PdfParsingConfig {
  const config = getConfig();
  return config.pdfParsing ?? DEFAULT_PDF_PARSING_CONFIG;
}

/**
 * v1.10.0: Get visit recovery config
 */
function getVisitRecoveryConfig(): VisitRecoveryConfig {
  const config = getConfig();
  return config.visitRecovery ?? DEFAULT_VISIT_RECOVERY_CONFIG;
}

// v1.7.0: PDF parser instance (lazy initialized)
let pdfParser: PdfParser | null = null;

function getPdfParser(): PdfParser {
  if (!pdfParser) {
    pdfParser = new PdfParser(getPdfConfig());
  }
  return pdfParser;
}

// v1.10.0: Visit recovery manager instance (lazy initialized)
let visitRecoveryManager: VisitRecoveryManager | null = null;

function getVisitRecoveryManager(): VisitRecoveryManager {
  if (!visitRecoveryManager) {
    const config = getVisitRecoveryConfig();
    visitRecoveryManager = new VisitRecoveryManager({
      maxRetries: config.maxRetries,
      retryDelayMs: config.retryDelayMs,
      timeoutMs: config.timeoutMs,
      enableWayback: config.enableWayback,
    });
  }
  return visitRecoveryManager;
}

// v1.14.0: Content validator and freshness evaluator (lazy initialized)
let contentValidator: ContentValidator | null = null;
let freshnessEvaluator: FreshnessEvaluator | null = null;

function getContentValidator(): ContentValidator {
  if (!contentValidator) {
    contentValidator = new ContentValidator();
  }
  return contentValidator;
}

function getFreshnessEvaluator(): FreshnessEvaluator {
  if (!freshnessEvaluator) {
    freshnessEvaluator = new FreshnessEvaluator();
  }
  return freshnessEvaluator;
}

async function rateLimit(): Promise<void> {
  const now = Date.now();
  const minInterval = getMinRequestInterval();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < minInterval) {
    await new Promise((resolve) =>
      setTimeout(resolve, minInterval - timeSinceLastRequest)
    );
  }
  
  lastRequestTime = Date.now();
}

/**
 * Visit a page and extract content using Jina AI Reader
 * v1.7.0: Auto-detect PDF and use PdfParser
 */
export async function visitPage(url: string, goal?: string): Promise<PageContent> {
  await rateLimit();

  const fetchedAt = new Date().toISOString();
  const apiKey = getJinaApiKey();
  
  // v1.7.0: Check if URL is a PDF
  const pdfConfig = getPdfConfig();
  if (pdfConfig.enabled) {
    const parser = getPdfParser();
    const detection = parser.isPdfUrl(url);
    
    if (detection.isPdf) {
      console.error(`[SHIKIGAMI] PDF detected: ${url}`);
      return await visitPdfPage(url, fetchedAt);
    }
  }
  
  try {
    // Use Jina AI Reader for clean text extraction
    const jinaUrl = `https://r.jina.ai/${url}`;
    
    const headers: Record<string, string> = {
      'User-Agent': USER_AGENT,
      'Accept': 'text/plain',
    };

    // Add API key if configured (for higher rate limits)
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    const response = await fetch(jinaUrl, { headers });

    if (!response.ok) {
      // Fallback to direct fetch if Jina fails
      return await directFetch(url, fetchedAt);
    }

    const content = await response.text();
    
    // Extract title from the first line (Jina format)
    const lines = content.split('\n');
    let title = '';
    let bodyContent = content;
    
    if (lines[0]?.startsWith('Title:')) {
      title = lines[0].replace('Title:', '').trim();
      bodyContent = lines.slice(1).join('\n').trim();
    }

    // Truncate if too long (for context management)
    const maxLength = 50000;
    if (bodyContent.length > maxLength) {
      bodyContent = bodyContent.slice(0, maxLength) + '\n\n[Content truncated...]';
    }

    // v1.14.0: コンテンツ検証
    const validator = getContentValidator();
    const validationResult = validator.validate(bodyContent);

    // v1.14.0: 鮮度評価
    const evaluator = getFreshnessEvaluator();
    const freshnessResult = evaluator.evaluate(content);

    return {
      url,
      title,
      content: bodyContent,
      fetchedAt,
      // v1.14.0: 検証結果を追加
      validation: {
        status: validationResult.status,
        meaningfulRatio: validationResult.meaningfulRatio,
        warnings: validationResult.details?.additionalWarnings,
      },
      // v1.14.0: 鮮度情報を追加
      freshness: {
        level: freshnessResult.level,
        publishDate: freshnessResult.publishDate?.toISOString(),
        daysOld: freshnessResult.daysOld,
        score: freshnessResult.score,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      url,
      title: '',
      content: '',
      fetchedAt,
      error: `Failed to fetch page: ${message}`,
    };
  }
}

/**
 * Direct fetch fallback (basic HTML text extraction)
 */
async function directFetch(url: string, fetchedAt: string): Promise<PageContent> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // v1.7.0: Check Content-Type for PDF
    const contentType = response.headers.get('content-type');
    const pdfConfig = getPdfConfig();
    if (pdfConfig.enabled && contentType) {
      const parser = getPdfParser();
      if (parser.isPdfContentType(contentType)) {
        console.error(`[SHIKIGAMI] PDF Content-Type detected: ${url}`);
        return await visitPdfPage(url, fetchedAt);
      }
    }

    const html = await response.text();
    
    // Basic HTML to text conversion
    const { load } = await import('cheerio');
    const $ = load(html);
    
    // Remove scripts and styles
    $('script, style, nav, header, footer, aside').remove();
    
    const title = $('title').text().trim() || $('h1').first().text().trim();
    const content = $('body').text()
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 50000);

    return {
      url,
      title,
      content,
      fetchedAt,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      url,
      title: '',
      content: '',
      fetchedAt,
      error: `Direct fetch failed: ${message}`,
    };
  }
}

/**
 * v1.7.0: Visit a PDF page and extract content (REQ-PARSE-001)
 */
async function visitPdfPage(url: string, fetchedAt: string): Promise<PageContent> {
  const parser = getPdfParser();
  const result = await parser.parse(url);
  
  if (!result.success) {
    return {
      url,
      title: '',
      content: '',
      fetchedAt,
      error: `PDF parsing failed: ${result.error.message} (${result.error.code})`,
      isPdf: true,
    };
  }
  
  const { content } = result;
  
  // Format PDF content as Markdown
  const formattedContent = formatPdfResult(content, url);
  
  return {
    url,
    title: content.metadata.title || extractTitleFromUrl(url),
    content: formattedContent,
    fetchedAt,
    isPdf: true,
    pdfMetadata: {
      pageCount: content.metadata.pageCount,
      author: content.metadata.author,
      creationDate: content.metadata.creationDate?.toISOString(),
    },
  };
}

/**
 * v1.7.0: Format PDF content as Markdown
 */
function formatPdfResult(content: import('./pdf-parser/types.js').PdfContent, url: string): string {
  const lines: string[] = [];
  
  // Header
  lines.push('# PDF Document');
  lines.push('');
  
  // Metadata section
  lines.push('## Metadata');
  lines.push('');
  if (content.metadata.title) {
    lines.push(`- **Title:** ${content.metadata.title}`);
  }
  if (content.metadata.author) {
    lines.push(`- **Author:** ${content.metadata.author}`);
  }
  lines.push(`- **Pages:** ${content.metadata.pageCount}`);
  if (content.metadata.creationDate) {
    lines.push(`- **Created:** ${content.metadata.creationDate.toISOString().split('T')[0]}`);
  }
  lines.push(`- **Source:** ${url}`);
  lines.push('');
  
  // Warnings
  if (content.warnings.length > 0) {
    lines.push('## ⚠️ Warnings');
    lines.push('');
    for (const warning of content.warnings) {
      lines.push(`- ${warning}`);
    }
    lines.push('');
  }
  
  // Content
  lines.push('## Content');
  lines.push('');
  
  // Truncate if too long
  const maxLength = 50000;
  let text = content.text;
  if (text.length > maxLength) {
    text = text.slice(0, maxLength) + '\n\n[Content truncated...]';
  }
  
  lines.push(text);
  
  // Footer
  if (content.truncated) {
    lines.push('');
    lines.push(`---`);
    lines.push(`*Note: PDF was truncated (${content.truncationReason}). Extracted ${content.extractedPages} of ${content.metadata.pageCount} pages.*`);
  }
  
  return lines.join('\n');
}

/**
 * Extract title from URL
 */
function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || '';
    // Remove .pdf extension
    return filename.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
  } catch {
    return 'PDF Document';
  }
}

// ============================================================
// v1.10.0: リカバリー付きページ訪問 (REQ-SRCH-004)
// ============================================================

/**
 * v1.10.0: ページ取得関数をPageFetchResult形式にラップ
 */
async function fetchPageAsResult(url: string): Promise<PageFetchResult> {
  try {
    const result = await visitPage(url);
    
    if (result.error) {
      return {
        success: false,
        error: result.error,
      };
    }
    
    return {
      success: true,
      content: result.content,
      title: result.title,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * v1.10.0: リカバリー付きページ訪問
 * 
 * REQ-SRCH-004-01: visit失敗時フォールバック（Wayback Machine）
 * REQ-SRCH-004-02: 自動リトライ
 * REQ-SRCH-004-03: 結果マージ
 * 
 * @param url 訪問対象のURL
 * @param goal 訪問の目的（オプション）
 * @returns ページコンテンツ
 */
export async function visitPageWithRecovery(url: string, goal?: string): Promise<PageContent> {
  const fetchedAt = new Date().toISOString();
  const config = getVisitRecoveryConfig();
  
  // リカバリーが無効な場合は従来の処理
  if (!config.enabled) {
    return await visitPage(url, goal);
  }
  
  const manager = getVisitRecoveryManager();
  
  // v1.7.0: PDF検出は先に行う（リカバリー前）
  const pdfConfig = getPdfConfig();
  if (pdfConfig.enabled) {
    const parser = getPdfParser();
    const detection = parser.isPdfUrl(url);
    
    if (detection.isPdf) {
      console.error(`[SHIKIGAMI] PDF detected (before recovery): ${url}`);
      // PDFはそのまま従来処理（リカバリー対象外）
      return await visitPage(url, goal);
    }
  }
  
  // リカバリー付き取得を実行
  const result = await manager.recover(url, fetchPageAsResult);
  
  if (result.success) {
    return {
      url: result.originalUrl,
      title: result.title ?? '',
      content: result.content ?? '',
      fetchedAt,
      recovery: {
        usedWayback: result.usedWayback,
        usedUrl: result.usedUrl,
        attempts: result.attempts,
        waybackTimestamp: result.waybackSnapshot?.timestamp,
      },
    };
  }
  
  // 全リカバリー失敗
  return {
    url,
    title: '',
    content: '',
    fetchedAt,
    error: result.error ?? 'Page fetch failed after all recovery attempts',
    recovery: {
      usedWayback: result.usedWayback,
      usedUrl: result.usedUrl,
      attempts: result.attempts,
    },
  };
}

/**
 * v1.10.0: リカバリー統計を取得
 */
export function getVisitRecoveryStats(): ReturnType<VisitRecoveryManager['getStats']> | null {
  if (!visitRecoveryManager) {
    return null;
  }
  return visitRecoveryManager.getStats();
}

/**
 * v1.10.0: リカバリーマネージャーをリセット（テスト用）
 */
export function resetVisitRecoveryManager(): void {
  visitRecoveryManager = null;
}

// v1.15.0: Visit enhancer exports (REQ-ALT-001, REQ-EXT-001, REQ-PAY-001)
export {
  analyzeBeforeVisit,
  extractStructuredData,
  enhanceVisit,
  getAlternativeSources,
  canEnhanceVisit,
  type VisitEnhancementResult,
  type ContentTypeHint,
} from './visit/v115-visit-enhancer.js';
