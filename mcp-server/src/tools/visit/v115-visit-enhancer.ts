/**
 * Visit Enhancer - v1.15.0 Feature Integration
 * REQ-ALT-001: 代替情報源管理
 * REQ-EXT-001: 構造化データ抽出
 * REQ-PAY-001: ペイウォール検知
 *
 * @remarks
 * - AlternativeSourceManagerをvisit.tsワークフローに統合
 * - ExtractorPipelineをvisit.tsワークフローに統合
 * - PaywallDetectorをvisit.tsワークフローに統合
 * - TSK-021 実装
 */

import { getV115FeaturesConfig, isV115FeatureEnabled } from '../../config/loader.js';
import { getAlternativeSourceManager, type AlternativeSourceResult, type ContentType } from '../visit/alternative/index.js';
import { getExtractorPipeline, getPaywallDetector, type ExtractionResult, type PaywallDetectionResult } from '../visit/extractor/index.js';

/**
 * ページ訪問拡張結果
 */
export interface VisitEnhancementResult {
  /** 元のURL */
  originalUrl: string;
  /** ペイウォール検知結果 */
  paywallDetection?: PaywallDetectionResult;
  /** 代替情報源 */
  alternativeSources?: AlternativeSourceResult;
  /** 構造化データ抽出結果 */
  structuredData?: ExtractionResult;
  /** 拡張が行われたか */
  wasEnhanced: boolean;
  /** 拡張の説明 */
  enhancementNotes: string[];
}

/**
 * コンテンツタイプヒント
 */
export interface ContentTypeHint {
  type?: ContentType;
  isPaper?: boolean;
  isPatent?: boolean;
  isNews?: boolean;
  isTechnicalDoc?: boolean;
}

/**
 * ページ訪問前の分析（ペイウォール検知・代替情報源提案）
 *
 * @param url 訪問予定のURL
 * @param html HTMLコンテンツ（取得済みの場合）
 * @param contentHint コンテンツタイプのヒント
 * @returns 分析結果
 */
export async function analyzeBeforeVisit(
  url: string,
  html?: string,
  contentHint?: ContentTypeHint
): Promise<VisitEnhancementResult> {
  const config = getV115FeaturesConfig();
  const notes: string[] = [];
  let paywallDetection: PaywallDetectionResult | undefined;
  let alternativeSources: AlternativeSourceResult | undefined;
  let wasEnhanced = false;

  // 1. ペイウォール検知（HTMLがある場合）
  if (html && isV115FeatureEnabled('paywallDetection')) {
    const detector = getPaywallDetector();
    paywallDetection = detector.detect(html, url);

    if (paywallDetection.isPaywalled) {
      wasEnhanced = true;
      notes.push(`Paywall detected: ${paywallDetection.paywallType} (confidence: ${(paywallDetection.confidence * 100).toFixed(0)}%)`);
      notes.push(`Accessible content: ~${paywallDetection.accessiblePercentage}%`);
    }
  }

  // 2. 代替情報源の提案
  if (isV115FeatureEnabled('alternativeSources')) {
    const manager = getAlternativeSourceManager();
    await manager.loadSources();
    const altConfig = config.alternativeSources;

    // コンテンツタイプのヒントを設定
    let contentTypeHint: ContentType | undefined;
    if (contentHint?.isPatent) contentTypeHint = 'patent';
    else if (contentHint?.isPaper) contentTypeHint = 'scientific_paper';
    else if (contentHint?.isNews) contentTypeHint = 'news';
    else if (contentHint?.isTechnicalDoc) contentTypeHint = 'technical_doc';

    alternativeSources = await manager.findAlternatives(url, html, {
      maxResults: altConfig?.maxResults ?? 5,
      contentTypeHint,
    });

    if (alternativeSources.alternatives.length > 0) {
      wasEnhanced = true;
      notes.push(`Found ${alternativeSources.alternatives.length} alternative sources`);

      // 識別子が検出された場合
      if (alternativeSources.identifiers.length > 0) {
        const ids = alternativeSources.identifiers.map((id) => `${id.type}: ${id.value}`).join(', ');
        notes.push(`Detected identifiers: ${ids}`);
      }
    }
  }

  return {
    originalUrl: url,
    paywallDetection,
    alternativeSources,
    wasEnhanced,
    enhancementNotes: notes,
  };
}

/**
 * ページ訪問後の構造化データ抽出
 *
 * @param url 訪問したURL
 * @param html 取得したHTMLコンテンツ
 * @param contentHint コンテンツタイプのヒント
 * @returns 抽出結果
 */
export async function extractStructuredData(
  url: string,
  html: string,
  contentHint?: ContentTypeHint
): Promise<ExtractionResult | undefined> {
  if (!isV115FeatureEnabled('structuredExtraction')) {
    return undefined;
  }

  const config = getV115FeaturesConfig();
  const extractConfig = config.structuredExtraction;
  const extractor = getExtractorPipeline({
    extractImages: extractConfig?.extractImages ?? true,
    extractTables: extractConfig?.extractTables ?? true,
    outputFormat: (extractConfig?.outputFormat as 'json' | 'markdown' | 'both') ?? 'json',
  });

  // コンテンツタイプのヒントを変換
  let contentTypeHint: 'article' | 'paper' | 'patent' | 'product' | 'general' | undefined;
  if (contentHint?.isPatent) contentTypeHint = 'patent';
  else if (contentHint?.isPaper) contentTypeHint = 'paper';

  return extractor.extract(html, url, contentTypeHint);
}

/**
 * 完全な訪問拡張（分析 + 抽出）
 *
 * @param url 訪問したURL
 * @param html 取得したHTMLコンテンツ
 * @param contentHint コンテンツタイプのヒント
 * @returns 拡張結果
 */
export async function enhanceVisit(
  url: string,
  html: string,
  contentHint?: ContentTypeHint
): Promise<VisitEnhancementResult> {
  // 訪問前分析
  const analysis = await analyzeBeforeVisit(url, html, contentHint);

  // 構造化データ抽出
  const structuredData = await extractStructuredData(url, html, contentHint);

  if (structuredData) {
    analysis.structuredData = structuredData;
    analysis.wasEnhanced = true;
    analysis.enhancementNotes.push(`Extracted structured data: ${structuredData.contentType}`);

    if (structuredData.metadata.fieldCount > 0) {
      analysis.enhancementNotes.push(`Extracted ${structuredData.metadata.fieldCount} fields`);
    }
  }

  return analysis;
}

/**
 * 代替情報源の提案を取得（ペイウォール検出時用）
 *
 * @param url 元のURL
 * @param html HTMLコンテンツ（オプション）
 * @returns 代替情報源リスト
 */
export async function getAlternativeSources(
  url: string,
  html?: string
): Promise<{ url: string; name: string; confidence: number; reason: string }[]> {
  if (!isV115FeatureEnabled('alternativeSources')) {
    return [];
  }

  const manager = getAlternativeSourceManager();
  await manager.loadSources();

  const result = await manager.findAlternatives(url, html);

  return result.alternatives.map((alt) => ({
    url: alt.url,
    name: alt.source.name,
    confidence: alt.confidence,
    reason: alt.reason,
  }));
}

/**
 * URLがv1.15.0機能の恩恵を受けられるか判定
 *
 * @param url URL
 * @returns 拡張可能かどうかと理由
 */
export function canEnhanceVisit(url: string): { canEnhance: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const urlLower = url.toLowerCase();

  // 学術論文サイト
  if (
    urlLower.includes('doi.org') ||
    urlLower.includes('arxiv') ||
    urlLower.includes('pubmed') ||
    urlLower.includes('sciencedirect') ||
    urlLower.includes('springer') ||
    urlLower.includes('ieee')
  ) {
    if (isV115FeatureEnabled('structuredExtraction')) {
      reasons.push('Scientific paper detected - structured extraction available');
    }
    if (isV115FeatureEnabled('alternativeSources')) {
      reasons.push('Alternative sources available (arXiv, PubMed Central, etc.)');
    }
  }

  // 特許サイト
  if (
    urlLower.includes('patent') ||
    urlLower.includes('espacenet') ||
    urlLower.includes('j-platpat')
  ) {
    if (isV115FeatureEnabled('structuredExtraction')) {
      reasons.push('Patent detected - structured extraction available');
    }
    if (isV115FeatureEnabled('alternativeSources')) {
      reasons.push('Alternative patent databases available');
    }
  }

  // ニュースサイト（ペイウォールの可能性）
  if (
    urlLower.includes('nytimes') ||
    urlLower.includes('wsj') ||
    urlLower.includes('bloomberg') ||
    urlLower.includes('nikkei')
  ) {
    if (isV115FeatureEnabled('paywallDetection')) {
      reasons.push('Known paywall site - detection available');
    }
    if (isV115FeatureEnabled('alternativeSources')) {
      reasons.push('Archive alternatives available');
    }
  }

  return {
    canEnhance: reasons.length > 0,
    reasons,
  };
}
