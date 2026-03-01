/**
 * エンコーディング検出器
 *
 * @requirements REQ-VISIT-003-01
 * @design DES-VISIT-003-01
 * @version 1.11.0
 */

import {
  SupportedEncoding,
  EncodingDetectionResult,
  EncodingDetectionSource,
  ENCODING_ALIASES,
  BOM_MAP,
} from './types.js';

/**
 * エンコーディング検出器
 * Content-Type、meta charset、BOM、ヒューリスティックの順で検出
 */
export class EncodingDetector {
  /**
   * エンコーディングを検出
   * @param content - コンテンツ（Buffer）
   * @param contentType - Content-Typeヘッダー値（オプション）
   * @param html - HTMLコンテンツ（meta charset検出用、オプション）
   */
  detect(
    content: Buffer,
    contentType?: string,
    html?: string
  ): EncodingDetectionResult {
    // 1. Content-Type charset から検出
    if (contentType) {
      const result = this.detectFromContentType(contentType);
      if (result) {
        return result;
      }
    }

    // 2. HTML meta charset から検出
    if (html) {
      const result = this.detectFromMetaCharset(html);
      if (result) {
        return result;
      }
    }

    // 3. BOM から検出
    const bomResult = this.detectFromBom(content);
    if (bomResult) {
      return bomResult;
    }

    // 4. ヒューリスティック検出
    return this.detectHeuristic(content);
  }

  /**
   * Content-Type ヘッダーからエンコーディングを検出
   */
  detectFromContentType(contentType: string): EncodingDetectionResult | null {
    // charset=xxx を抽出
    const charsetMatch = contentType.match(/charset=([^\s;]+)/i);
    if (!charsetMatch) {
      return null;
    }

    const charset = charsetMatch[1].toLowerCase().replace(/['"]/g, '');
    const normalized = this.normalizeEncoding(charset);

    if (normalized) {
      return {
        detected: normalized,
        confidence: 0.95,
        source: 'content-type',
        details: `Content-Type header: ${charset}`,
      };
    }

    return null;
  }

  /**
   * HTML meta charset からエンコーディングを検出
   */
  detectFromMetaCharset(html: string): EncodingDetectionResult | null {
    // <meta charset="xxx"> パターン
    const metaCharsetMatch = html.match(/<meta\s+charset=["']?([^"'\s>]+)/i);
    if (metaCharsetMatch) {
      const charset = metaCharsetMatch[1].toLowerCase();
      const normalized = this.normalizeEncoding(charset);
      if (normalized) {
        return {
          detected: normalized,
          confidence: 0.9,
          source: 'meta-charset',
          details: `meta charset: ${charset}`,
        };
      }
    }

    // <meta http-equiv="Content-Type" content="text/html; charset=xxx"> パターン
    const httpEquivMatch = html.match(
      /<meta\s+http-equiv=["']?Content-Type["']?\s+content=["']?[^"']*charset=([^"'\s;>]+)/i
    );
    if (httpEquivMatch) {
      const charset = httpEquivMatch[1].toLowerCase();
      const normalized = this.normalizeEncoding(charset);
      if (normalized) {
        return {
          detected: normalized,
          confidence: 0.9,
          source: 'meta-charset',
          details: `meta http-equiv: ${charset}`,
        };
      }
    }

    // 逆順: content → http-equiv
    const httpEquivMatch2 = html.match(
      /<meta\s+content=["']?[^"']*charset=([^"'\s;>]+)["']?\s+http-equiv=["']?Content-Type/i
    );
    if (httpEquivMatch2) {
      const charset = httpEquivMatch2[1].toLowerCase();
      const normalized = this.normalizeEncoding(charset);
      if (normalized) {
        return {
          detected: normalized,
          confidence: 0.9,
          source: 'meta-charset',
          details: `meta http-equiv: ${charset}`,
        };
      }
    }

    return null;
  }

  /**
   * BOM (Byte Order Mark) からエンコーディングを検出
   */
  detectFromBom(content: Buffer): EncodingDetectionResult | null {
    // UTF-8 BOM: EF BB BF
    if (
      content.length >= 3 &&
      content[0] === 0xef &&
      content[1] === 0xbb &&
      content[2] === 0xbf
    ) {
      return {
        detected: 'utf-8',
        confidence: 1.0,
        source: 'bom',
        details: 'UTF-8 BOM detected',
      };
    }

    // UTF-16 BE BOM: FE FF
    if (content.length >= 2 && content[0] === 0xfe && content[1] === 0xff) {
      return {
        detected: 'utf-8', // UTF-16BEとして扱うがUTF-8で返す
        confidence: 0.8,
        source: 'bom',
        details: 'UTF-16BE BOM detected (treating as UTF-8)',
      };
    }

    // UTF-16 LE BOM: FF FE
    if (content.length >= 2 && content[0] === 0xff && content[1] === 0xfe) {
      return {
        detected: 'utf-8', // UTF-16LEとして扱うがUTF-8で返す
        confidence: 0.8,
        source: 'bom',
        details: 'UTF-16LE BOM detected (treating as UTF-8)',
      };
    }

    return null;
  }

  /**
   * ヒューリスティックにエンコーディングを検出
   */
  detectHeuristic(content: Buffer): EncodingDetectionResult {
    // サンプルサイズ（最大4KB）
    const sampleSize = Math.min(content.length, 4096);
    const sample = content.subarray(0, sampleSize);

    // UTF-8として有効かチェック
    if (this.isValidUtf8(sample)) {
      return {
        detected: 'utf-8',
        confidence: 0.7,
        source: 'heuristic',
        details: 'Valid UTF-8 sequence detected',
      };
    }

    // Shift_JISの特徴をチェック
    if (this.looksLikeShiftJis(sample)) {
      return {
        detected: 'shift_jis',
        confidence: 0.6,
        source: 'heuristic',
        details: 'Shift_JIS pattern detected',
      };
    }

    // EUC-JPの特徴をチェック
    if (this.looksLikeEucJp(sample)) {
      return {
        detected: 'euc-jp',
        confidence: 0.6,
        source: 'heuristic',
        details: 'EUC-JP pattern detected',
      };
    }

    // ISO-2022-JPの特徴をチェック（エスケープシーケンス）
    if (this.looksLikeIso2022Jp(sample)) {
      return {
        detected: 'iso-2022-jp',
        confidence: 0.7,
        source: 'heuristic',
        details: 'ISO-2022-JP escape sequence detected',
      };
    }

    // デフォルトはUTF-8
    return {
      detected: 'utf-8',
      confidence: 0.4,
      source: 'heuristic',
      details: 'Fallback to UTF-8',
    };
  }

  /**
   * 有効なUTF-8シーケンスかチェック
   */
  private isValidUtf8(buffer: Buffer): boolean {
    let i = 0;
    while (i < buffer.length) {
      const byte = buffer[i];

      if (byte < 0x80) {
        // ASCII
        i++;
      } else if ((byte & 0xe0) === 0xc0) {
        // 2バイト文字
        if (i + 1 >= buffer.length || (buffer[i + 1] & 0xc0) !== 0x80) {
          return false;
        }
        i += 2;
      } else if ((byte & 0xf0) === 0xe0) {
        // 3バイト文字
        if (
          i + 2 >= buffer.length ||
          (buffer[i + 1] & 0xc0) !== 0x80 ||
          (buffer[i + 2] & 0xc0) !== 0x80
        ) {
          return false;
        }
        i += 3;
      } else if ((byte & 0xf8) === 0xf0) {
        // 4バイト文字
        if (
          i + 3 >= buffer.length ||
          (buffer[i + 1] & 0xc0) !== 0x80 ||
          (buffer[i + 2] & 0xc0) !== 0x80 ||
          (buffer[i + 3] & 0xc0) !== 0x80
        ) {
          return false;
        }
        i += 4;
      } else {
        return false;
      }
    }
    return true;
  }

  /**
   * Shift_JISらしいかチェック
   * Shift_JISの2バイト文字: 0x81-0x9F, 0xE0-0xFC + 0x40-0xFC
   */
  private looksLikeShiftJis(buffer: Buffer): boolean {
    let shiftJisCount = 0;
    let i = 0;

    while (i < buffer.length - 1) {
      const byte1 = buffer[i];
      const byte2 = buffer[i + 1];

      // Shift_JISの第1バイト範囲
      if ((byte1 >= 0x81 && byte1 <= 0x9f) || (byte1 >= 0xe0 && byte1 <= 0xfc)) {
        // 第2バイト範囲
        if ((byte2 >= 0x40 && byte2 <= 0x7e) || (byte2 >= 0x80 && byte2 <= 0xfc)) {
          shiftJisCount++;
          i += 2;
          continue;
        }
      }
      i++;
    }

    // 2バイト文字が一定数以上あればShift_JISと判断
    return shiftJisCount >= 5;
  }

  /**
   * EUC-JPらしいかチェック
   * EUC-JPの2バイト文字: 0xA1-0xFE + 0xA1-0xFE
   */
  private looksLikeEucJp(buffer: Buffer): boolean {
    let eucJpCount = 0;
    let i = 0;

    while (i < buffer.length - 1) {
      const byte1 = buffer[i];
      const byte2 = buffer[i + 1];

      // EUC-JPの2バイト文字範囲
      if (byte1 >= 0xa1 && byte1 <= 0xfe && byte2 >= 0xa1 && byte2 <= 0xfe) {
        eucJpCount++;
        i += 2;
        continue;
      }
      i++;
    }

    // 2バイト文字が一定数以上あればEUC-JPと判断
    return eucJpCount >= 5;
  }

  /**
   * ISO-2022-JPらしいかチェック
   * ISO-2022-JPはエスケープシーケンスを使用
   */
  private looksLikeIso2022Jp(buffer: Buffer): boolean {
    // ESC $ B (JIS X 0208へ切り替え)
    // ESC ( B (ASCIIへ切り替え)
    const bufferStr = buffer.toString('binary');
    return (
      bufferStr.includes('\x1b$B') ||
      bufferStr.includes('\x1b(B') ||
      bufferStr.includes('\x1b$@') ||
      bufferStr.includes('\x1b(J')
    );
  }

  /**
   * エンコーディング名を正規化
   */
  normalizeEncoding(encoding: string): SupportedEncoding | null {
    const lower = encoding.toLowerCase().trim();
    return ENCODING_ALIASES[lower] || null;
  }
}
