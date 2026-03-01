/**
 * PdfParser
 *
 * TSK-014: PdfParserクラス
 * REQ-PARSE-001: PDFコンテンツ抽出
 * DES-PARSE-001: PDF解析システム設計
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

import type {
  PdfContent,
  PdfMetadata,
  PdfDetectionResult,
  PdfParseError,
  PdfParseResult,
} from './types.js';
import type { PdfParsingConfig } from '../../config/types.js';
import { DEFAULT_PDF_PARSING_CONFIG } from '../../config/types.js';

// pdf-parse の型定義
type PdfParseFunction = (dataBuffer: Buffer, options?: { max?: number }) => Promise<{
  numpages: number;
  text: string;
  info?: {
    Title?: string;
    Author?: string;
    Creator?: string;
    CreationDate?: string;
    ModDate?: string;
    PDFFormatVersion?: string;
    Subject?: string;
    Keywords?: string;
  };
}>;

/**
 * PDF判定用の拡張子
 */
const PDF_EXTENSIONS = ['.pdf'];

/**
 * PDF判定用のContent-Type
 */
const PDF_CONTENT_TYPES = ['application/pdf', 'application/x-pdf'];

/**
 * PDF Magic Bytes (先頭4バイト)
 */
const PDF_MAGIC_BYTES = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF

/**
 * PdfParser クラス
 *
 * URLまたはローカルファイルからPDFを検出・解析する
 */
export class PdfParser {
  private readonly config: Required<PdfParsingConfig>;
  private pdfParseModule: PdfParseFunction | null = null;

  constructor(config?: Partial<PdfParsingConfig>) {
    this.config = { ...DEFAULT_PDF_PARSING_CONFIG, ...config };
  }

  /**
   * URLがPDFかどうか判定
   */
  isPdfUrl(url: string): PdfDetectionResult {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();

      // 拡張子で判定
      for (const ext of PDF_EXTENSIONS) {
        if (pathname.endsWith(ext)) {
          return {
            isPdf: true,
            detectionMethod: 'extension',
            url,
          };
        }
      }

      return {
        isPdf: false,
        detectionMethod: 'extension',
        url,
      };
    } catch {
      return {
        isPdf: false,
        detectionMethod: 'extension',
        url,
      };
    }
  }

  /**
   * Content-TypeがPDFかどうか判定
   */
  isPdfContentType(contentType: string | null): boolean {
    if (!contentType) return false;
    const lower = contentType.toLowerCase();
    return PDF_CONTENT_TYPES.some((type) => lower.includes(type));
  }

  /**
   * バッファがPDFかどうか判定（Magic Bytes）
   */
  isPdfBuffer(buffer: Buffer): PdfDetectionResult {
    if (buffer.length < 4) {
      return {
        isPdf: false,
        detectionMethod: 'magic-bytes',
      };
    }

    const header = buffer.subarray(0, 4);
    const isPdf = header.equals(PDF_MAGIC_BYTES);

    return {
      isPdf,
      detectionMethod: 'magic-bytes',
    };
  }

  /**
   * PDFを解析
   */
  async parse(source: string | Buffer): Promise<PdfParseResult> {
    const startTime = Date.now();

    try {
      let buffer: Buffer;
      let fileSize: number;

      if (typeof source === 'string') {
        // URLまたはファイルパス
        if (source.startsWith('http://') || source.startsWith('https://')) {
          const downloadResult = await this.downloadPdf(source);
          if (!downloadResult.success) {
            return downloadResult;
          }
          buffer = downloadResult.buffer;
          fileSize = buffer.length;
        } else {
          // ローカルファイル
          if (!fs.existsSync(source)) {
            return {
              success: false,
              error: {
                code: 'UNKNOWN',
                message: `File not found: ${source}`,
              },
            };
          }
          buffer = fs.readFileSync(source);
          fileSize = buffer.length;
        }
      } else {
        buffer = source;
        fileSize = buffer.length;
      }

      // サイズチェック
      if (fileSize > this.config.maxFileSizeBytes) {
        return {
          success: false,
          error: {
            code: 'TOO_LARGE',
            message: `PDF size (${Math.round(fileSize / 1024 / 1024)}MB) exceeds limit (${Math.round(this.config.maxFileSizeBytes / 1024 / 1024)}MB)`,
          },
        };
      }

      // Magic Bytesチェック
      const detection = this.isPdfBuffer(buffer);
      if (!detection.isPdf) {
        return {
          success: false,
          error: {
            code: 'UNSUPPORTED_FORMAT',
            message: 'Not a valid PDF file (invalid header)',
          },
        };
      }

      // タイムアウト付きで解析
      return await this.parseWithTimeout(buffer, fileSize, startTime);
    } catch (error) {
      return this.handleParseError(error);
    }
  }

  /**
   * タイムアウト付きでPDFを解析
   */
  private async parseWithTimeout(
    buffer: Buffer,
    fileSize: number,
    startTime: number
  ): Promise<PdfParseResult> {
    return new Promise<PdfParseResult>((resolve) => {
      const timer = setTimeout(() => {
        resolve({
          success: false,
          error: {
            code: 'TIMEOUT',
            message: `PDF parsing timeout (${this.config.timeoutMs}ms)`,
          },
        });
      }, this.config.timeoutMs);

      this.doParse(buffer, fileSize, startTime)
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          resolve(this.handleParseError(error));
        });
    });
  }

  /**
   * 実際のPDF解析処理
   */
  private async doParse(
    buffer: Buffer,
    fileSize: number,
    startTime: number
  ): Promise<PdfParseResult> {
    // pdf-parseを遅延読み込み
    if (!this.pdfParseModule) {
      const pdfParseImport = await import('pdf-parse');
      this.pdfParseModule = pdfParseImport.default as PdfParseFunction;
    }

    const pdfParse = this.pdfParseModule;

    // 解析オプション
    const options: { max?: number } = {};
    if (this.config.maxPages) {
      options.max = this.config.maxPages;
    }

    const data = await pdfParse(buffer, options);

    // メタデータ抽出
    const metadata: PdfMetadata = {
      title: data.info?.Title,
      author: data.info?.Author,
      creator: data.info?.Creator,
      creationDate: data.info?.CreationDate ? this.parseDate(data.info.CreationDate) : undefined,
      modificationDate: data.info?.ModDate ? this.parseDate(data.info.ModDate) : undefined,
      pageCount: data.numpages,
      fileSize,
      pdfVersion: data.info?.PDFFormatVersion,
      subject: data.info?.Subject,
      keywords: data.info?.Keywords ? data.info.Keywords.split(/[,;]\s*/) : undefined,
    };

    // 切り詰め判定
    const truncated = data.numpages > this.config.maxPages;
    const truncationReason = truncated ? 'max_pages' : undefined;

    // 警告生成
    const warnings: string[] = [];
    if (truncated) {
      warnings.push(`ページ数が上限(${this.config.maxPages})を超えたため、${this.config.maxPages}ページまで抽出しました`);
    }
    if (fileSize > this.config.maxFileSizeBytes * 0.8) {
      warnings.push(`ファイルサイズが上限に近づいています (${Math.round(fileSize / 1024 / 1024)}MB)`);
    }

    const content: PdfContent = {
      text: data.text,
      metadata,
      extractedPages: truncated ? this.config.maxPages : data.numpages,
      truncated,
      truncationReason,
      processingTimeMs: Date.now() - startTime,
      warnings,
    };

    return { success: true, content };
  }

  /**
   * PDFをダウンロード
   */
  private async downloadPdf(
    url: string
  ): Promise<{ success: true; buffer: Buffer } | { success: false; error: PdfParseError }> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SHIKIGAMI-PDF-Parser/1.7.0',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: 'DOWNLOAD_FAILED',
            message: `Failed to download PDF: HTTP ${response.status}`,
          },
        };
      }

      const contentType = response.headers.get('content-type');
      if (contentType && !this.isPdfContentType(contentType)) {
        // Content-Typeがpdfでなくても、Magic Bytesで確認するため続行
        console.error(`[PdfParser] Warning: Content-Type is ${contentType}, not application/pdf`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return { success: true, buffer };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DOWNLOAD_FAILED',
          message: `Failed to download PDF: ${error instanceof Error ? error.message : String(error)}`,
          cause: error instanceof Error ? error : undefined,
        },
      };
    }
  }

  /**
   * PDF日付文字列をDateに変換
   */
  private parseDate(dateStr: string): Date | undefined {
    try {
      // PDF日付形式: D:YYYYMMDDHHmmSS+HH'mm'
      const match = dateStr.match(/D:(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/);
      if (match) {
        const [, year, month, day, hour = '00', minute = '00', second = '00'] = match;
        return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * エラーハンドリング
   */
  private handleParseError(error: unknown): PdfParseResult {
    const message = error instanceof Error ? error.message : String(error);

    // パスワード保護の検出
    if (message.includes('password') || message.includes('encrypted')) {
      return {
        success: false,
        error: {
          code: 'PASSWORD_PROTECTED',
          message: 'PDF is password protected',
          cause: error instanceof Error ? error : undefined,
        },
      };
    }

    // 破損ファイルの検出
    if (message.includes('corrupt') || message.includes('invalid')) {
      return {
        success: false,
        error: {
          code: 'CORRUPTED',
          message: 'PDF file is corrupted or invalid',
          cause: error instanceof Error ? error : undefined,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN',
        message,
        cause: error instanceof Error ? error : undefined,
      },
    };
  }
}

// エクスポート
export * from './types.js';
