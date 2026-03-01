/**
 * エンコーディング処理ハンドラ
 *
 * @requirements REQ-VISIT-003, REQ-VISIT-003-01, REQ-VISIT-003-02
 * @design DES-VISIT-003
 * @version 1.11.0
 */

import {
  SupportedEncoding,
  EncodingProcessResult,
  EncodingHandlerConfig,
  DEFAULT_ENCODING_CONFIG,
} from './types.js';
import { EncodingDetector } from './encoding-detector.js';
import { EncodingConverter } from './encoding-converter.js';

/**
 * エンコーディング処理ハンドラ
 * 検出、変換、文字化け修正を統合的に処理
 */
export class EncodingHandler {
  private readonly detector: EncodingDetector;
  private readonly converter: EncodingConverter;
  private readonly config: EncodingHandlerConfig;

  constructor(config?: Partial<EncodingHandlerConfig>) {
    this.config = { ...DEFAULT_ENCODING_CONFIG, ...config };
    this.detector = new EncodingDetector();
    this.converter = new EncodingConverter();
  }

  /**
   * コンテンツを処理（検出→変換→文字化け検出）
   * @param content - 処理対象のバッファ
   * @param contentType - Content-Typeヘッダー（オプション）
   * @param html - HTMLコンテンツ（meta charset検出用、オプション）
   */
  async process(
    content: Buffer,
    contentType?: string,
    html?: string
  ): Promise<EncodingProcessResult> {
    const logs: string[] = [];
    const startTime = Date.now();

    try {
      // タイムアウト付きで処理
      const result = await this.withTimeout(
        this.processInternal(content, contentType, html, logs),
        this.config.timeoutMs
      );

      logs.push(`[EncodingHandler] Processing completed in ${Date.now() - startTime}ms`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logs.push(`[EncodingHandler] Error: ${errorMessage}`);

      return {
        success: false,
        content: content.toString('utf-8'),
        detectedEncoding: this.config.fallbackEncoding,
        wasConverted: false,
        error: errorMessage,
        logs,
      };
    }
  }

  /**
   * 内部処理ロジック
   */
  private async processInternal(
    content: Buffer,
    contentType?: string,
    html?: string,
    logs: string[] = []
  ): Promise<EncodingProcessResult> {
    // 1. エンコーディング検出
    const detection = this.detector.detect(content, contentType, html);
    logs.push(
      `[EncodingHandler] Detected encoding: ${detection.detected} (confidence: ${detection.confidence}, source: ${detection.source})`
    );

    // 2. UTF-8以外の場合は変換
    let convertedContent: string;
    let wasConverted = false;

    if (detection.detected !== 'utf-8' && this.config.enableAutoConversion) {
      const conversionResult = this.converter.convertToUtf8(content, detection.detected);

      if (conversionResult.success) {
        convertedContent = conversionResult.convertedContent;
        wasConverted = true;
        logs.push(
          `[EncodingHandler] Converted from ${detection.detected} to UTF-8 in ${conversionResult.conversionTimeMs}ms`
        );
      } else {
        convertedContent = content.toString('utf-8');
        logs.push(`[EncodingHandler] Conversion failed: ${conversionResult.error}`);
      }
    } else {
      convertedContent = content.toString('utf-8');
      if (detection.detected === 'utf-8') {
        logs.push('[EncodingHandler] Content is already UTF-8, no conversion needed');
      }
    }

    // 3. 文字化け検出
    let mojibakeResult;
    if (this.config.enableMojibakeDetection) {
      mojibakeResult = this.converter.detectMojibake(convertedContent);

      if (mojibakeResult.hasMojibake) {
        logs.push(
          `[EncodingHandler] Mojibake detected: ${mojibakeResult.patterns.length} patterns found, suggested encoding: ${mojibakeResult.suggestedEncoding}`
        );

        // 文字化けが検出された場合、推奨エンコーディングで再変換を試みる
        if (mojibakeResult.suggestedEncoding && this.config.enableAutoConversion) {
          const fixResult = this.converter.fixMojibake(
            content,
            mojibakeResult.suggestedEncoding
          );

          if (fixResult.success) {
            // 再変換後も文字化けがあるかチェック
            const recheck = this.converter.detectMojibake(fixResult.convertedContent);
            if (!recheck.hasMojibake) {
              convertedContent = fixResult.convertedContent;
              wasConverted = true;
              logs.push(
                `[EncodingHandler] Mojibake fixed by re-decoding as ${mojibakeResult.suggestedEncoding}`
              );
              mojibakeResult = recheck;
            } else {
              logs.push('[EncodingHandler] Mojibake persists after re-decoding, keeping original');
            }
          }
        }
      } else {
        logs.push('[EncodingHandler] No mojibake detected');
      }
    }

    return {
      success: true,
      content: convertedContent,
      detectedEncoding: detection.detected,
      wasConverted,
      mojibakeResult,
      logs,
    };
  }

  /**
   * タイムアウト付きPromise実行
   */
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      promise
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * 設定を取得
   */
  getConfig(): EncodingHandlerConfig {
    return { ...this.config };
  }
}
