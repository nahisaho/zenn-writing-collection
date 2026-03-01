/**
 * エンコーディング処理モジュール
 *
 * @module visit/encoding
 * @requirements REQ-VISIT-003, REQ-VISIT-003-01, REQ-VISIT-003-02
 * @design DES-VISIT-003
 * @version 1.11.0
 */

export * from './types.js';
export { EncodingDetector } from './encoding-detector.js';
export { EncodingConverter } from './encoding-converter.js';
export { EncodingHandler } from './encoding-handler.js';

import { EncodingHandler } from './encoding-handler.js';
import { EncodingHandlerConfig } from './types.js';

/**
 * エンコーディングハンドラのシングルトンインスタンス
 */
let defaultHandler: EncodingHandler | null = null;

/**
 * デフォルトのエンコーディングハンドラを取得
 */
export function getDefaultEncodingHandler(): EncodingHandler {
  if (!defaultHandler) {
    defaultHandler = new EncodingHandler();
  }
  return defaultHandler;
}

/**
 * カスタム設定でエンコーディングハンドラを作成
 */
export function createEncodingHandler(
  config?: Partial<EncodingHandlerConfig>
): EncodingHandler {
  return new EncodingHandler(config);
}

/**
 * コンテンツを処理する便利関数
 * @param content - 処理対象のバッファ
 * @param contentType - Content-Typeヘッダー（オプション）
 * @param html - HTMLコンテンツ（meta charset検出用、オプション）
 */
export async function processEncoding(
  content: Buffer,
  contentType?: string,
  html?: string
) {
  const handler = getDefaultEncodingHandler();
  return handler.process(content, contentType, html);
}
