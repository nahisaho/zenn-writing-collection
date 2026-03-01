/**
 * エンコーディング変換器
 *
 * @requirements REQ-VISIT-003, REQ-VISIT-003-01
 * @design DES-VISIT-003
 * @version 1.11.0
 */

import * as iconv from 'iconv-lite';
import {
  SupportedEncoding,
  EncodingConversionResult,
  MojibakeDetectionResult,
  MOJIBAKE_PATTERNS,
} from './types.js';

/**
 * エンコーディング変換器
 * iconv-liteを使用してエンコーディング変換を行う
 */
export class EncodingConverter {
  /**
   * コンテンツをUTF-8に変換
   * @param content - 変換対象のバッファ
   * @param sourceEncoding - 元のエンコーディング
   */
  convertToUtf8(
    content: Buffer,
    sourceEncoding: SupportedEncoding
  ): EncodingConversionResult {
    const startTime = Date.now();

    try {
      // 既にUTF-8の場合はそのまま返す
      if (sourceEncoding === 'utf-8') {
        return {
          success: true,
          originalEncoding: sourceEncoding,
          targetEncoding: 'utf-8',
          convertedContent: content.toString('utf-8'),
          conversionTimeMs: Date.now() - startTime,
        };
      }

      // iconv-liteでエンコーディング名をマッピング
      const iconvEncoding = this.mapToIconvEncoding(sourceEncoding);

      // エンコーディングがサポートされているか確認
      if (!iconv.encodingExists(iconvEncoding)) {
        return {
          success: false,
          originalEncoding: sourceEncoding,
          targetEncoding: 'utf-8',
          convertedContent: content.toString('utf-8'),
          error: `Unsupported encoding: ${sourceEncoding}`,
          conversionTimeMs: Date.now() - startTime,
        };
      }

      // 変換実行
      const decoded = iconv.decode(content, iconvEncoding);

      return {
        success: true,
        originalEncoding: sourceEncoding,
        targetEncoding: 'utf-8',
        convertedContent: decoded,
        conversionTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        originalEncoding: sourceEncoding,
        targetEncoding: 'utf-8',
        convertedContent: content.toString('utf-8'),
        error: `Conversion failed: ${errorMessage}`,
        conversionTimeMs: Date.now() - startTime,
      };
    }
  }

  /**
   * 文字化けを検出
   * @param content - 検査対象の文字列
   */
  detectMojibake(content: string): MojibakeDetectionResult {
    const detectedPatterns = MOJIBAKE_PATTERNS.filter((pattern) =>
      content.includes(pattern.pattern)
    );

    if (detectedPatterns.length === 0) {
      return {
        hasMojibake: false,
        patterns: [],
        confidence: 0,
      };
    }

    // 最も多く検出されたエンコーディングを推奨
    const encodingCounts = new Map<SupportedEncoding, number>();
    for (const pattern of detectedPatterns) {
      const count = encodingCounts.get(pattern.suggestedEncoding) || 0;
      encodingCounts.set(pattern.suggestedEncoding, count + 1);
    }

    let maxCount = 0;
    let suggestedEncoding: SupportedEncoding | undefined;
    for (const [encoding, count] of encodingCounts) {
      if (count > maxCount) {
        maxCount = count;
        suggestedEncoding = encoding;
      }
    }

    // 信頼度計算（検出パターン数に基づく）
    const confidence = Math.min(0.95, 0.5 + detectedPatterns.length * 0.1);

    return {
      hasMojibake: true,
      patterns: detectedPatterns,
      suggestedEncoding,
      confidence,
    };
  }

  /**
   * 文字化けを修正（再変換）
   * @param content - 修正対象のバッファ
   * @param suggestedEncoding - 推奨されるエンコーディング
   */
  fixMojibake(
    content: Buffer,
    suggestedEncoding: SupportedEncoding
  ): EncodingConversionResult {
    return this.convertToUtf8(content, suggestedEncoding);
  }

  /**
   * SupportedEncodingをiconv-liteのエンコーディング名にマッピング
   */
  private mapToIconvEncoding(encoding: SupportedEncoding): string {
    switch (encoding) {
      case 'utf-8':
        return 'utf-8';
      case 'shift_jis':
        return 'Shift_JIS';
      case 'windows-31j':
        return 'CP932';
      case 'euc-jp':
        return 'EUC-JP';
      case 'iso-2022-jp':
        return 'ISO-2022-JP';
      default:
        return 'utf-8';
    }
  }
}
