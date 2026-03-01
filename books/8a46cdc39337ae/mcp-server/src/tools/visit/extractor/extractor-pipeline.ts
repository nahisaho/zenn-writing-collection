/**
 * Extractor Pipeline
 * REQ-EXT-001: 構造化データ抽出パイプライン
 *
 * @remarks
 * - 複数の抽出器を連携
 * - コンテンツタイプ自動検出
 * - 構造化データ出力
 * - TSK-011 実装
 */

import type {
  ArticleData,
  ExtractableContentType,
  ExtractionMetadata,
  ExtractionResult,
  ExtractorPipelineConfig,
  PaperData,
  PatentData,
  ProductData,
  TableData,
} from './types.js';

/**
 * 抽出パイプラインクラス
 */
export class ExtractorPipeline {
  private config: ExtractorPipelineConfig;

  constructor(config?: Partial<ExtractorPipelineConfig>) {
    this.config = {
      timeout: 30000,
      maxRetries: 2,
      extractImages: true,
      extractTables: true,
      detectPaywall: true,
      outputFormat: 'json',
      ...config,
    };
  }

  /**
   * コンテンツタイプを検出
   */
  detectContentType(html: string, url: string): ExtractableContentType {
    const urlLower = url.toLowerCase();
    const htmlLower = html.toLowerCase();

    // 特許
    if (
      urlLower.includes('patent') ||
      urlLower.includes('espacenet') ||
      urlLower.includes('j-platpat') ||
      htmlLower.includes('claims') && htmlLower.includes('abstract') && htmlLower.includes('inventor')
    ) {
      return 'patent';
    }

    // 論文
    if (
      urlLower.includes('doi.org') ||
      urlLower.includes('arxiv') ||
      urlLower.includes('pubmed') ||
      urlLower.includes('sciencedirect') ||
      urlLower.includes('springer') ||
      htmlLower.includes('abstract') && htmlLower.includes('references') && htmlLower.includes('keywords')
    ) {
      return 'paper';
    }

    // 製品
    if (
      urlLower.includes('amazon') ||
      urlLower.includes('product') ||
      urlLower.includes('shop') ||
      htmlLower.includes('add to cart') ||
      htmlLower.includes('price') && htmlLower.includes('buy')
    ) {
      return 'product';
    }

    // コード
    if (
      urlLower.includes('github.com') && urlLower.includes('blob') ||
      urlLower.includes('gist.github') ||
      htmlLower.includes('<code>') && htmlLower.includes('</code>')
    ) {
      return 'code';
    }

    // 記事（デフォルト）
    if (
      htmlLower.includes('<article') ||
      htmlLower.includes('author') && htmlLower.includes('published')
    ) {
      return 'article';
    }

    return 'general';
  }

  /**
   * HTML から構造化データを抽出
   */
  async extract(
    html: string,
    url: string,
    contentTypeHint?: ExtractableContentType
  ): Promise<ExtractionResult> {
    const startTime = Date.now();
    const contentType = contentTypeHint || this.detectContentType(html, url);

    try {
      let data: unknown;
      let extractorUsed = '';

      switch (contentType) {
        case 'article':
          data = this.extractArticle(html, url);
          extractorUsed = 'ArticleExtractor';
          break;
        case 'paper':
          data = this.extractPaper(html, url);
          extractorUsed = 'PaperExtractor';
          break;
        case 'patent':
          data = this.extractPatent(html, url);
          extractorUsed = 'PatentExtractor';
          break;
        case 'product':
          data = this.extractProduct(html, url);
          extractorUsed = 'ProductExtractor';
          break;
        case 'table':
          data = this.extractTables(html);
          extractorUsed = 'TableExtractor';
          break;
        default:
          data = this.extractGeneral(html, url);
          extractorUsed = 'GeneralExtractor';
      }

      const metadata = this.createMetadata(startTime, extractorUsed, data, url);

      return {
        success: true,
        data,
        contentType,
        confidence: this.calculateConfidence(data, contentType),
        metadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        contentType,
        confidence: 0,
        metadata: this.createMetadata(startTime, 'failed', null, url),
      };
    }
  }

  /**
   * 記事を抽出
   */
  private extractArticle(html: string, url: string): ArticleData {
    // メタタグから情報を抽出
    const title = this.extractMeta(html, ['og:title', 'title']) ||
                  this.extractTag(html, 'title') ||
                  'Unknown Title';
    const authors = this.extractAuthors(html);
    const publishedDate = this.extractMeta(html, ['article:published_time', 'datePublished']);
    const modifiedDate = this.extractMeta(html, ['article:modified_time', 'dateModified']);
    const summary = this.extractMeta(html, ['og:description', 'description']);
    const content = this.extractMainContent(html);
    const images = this.config.extractImages ? this.extractImages(html) : [];

    return {
      title,
      authors,
      publishedDate,
      modifiedDate,
      content,
      summary,
      images: images.map((img) => ({ url: img.url, alt: img.alt, caption: img.caption })),
      source: new URL(url).hostname,
    };
  }

  /**
   * 論文を抽出
   */
  private extractPaper(html: string, url: string): PaperData {
    const title = this.extractMeta(html, ['citation_title', 'og:title']) ||
                  this.extractTag(html, 'title') ||
                  'Unknown Title';
    const abstractText = this.extractAbstract(html);
    const keywords = this.extractKeywords(html);
    const doi = this.extractDOI(html, url);
    const authors = this.extractPaperAuthors(html);
    const venue = this.extractMeta(html, ['citation_journal_title', 'citation_conference_title']);
    const publicationDate = this.extractMeta(html, ['citation_publication_date', 'citation_date']);

    return {
      title,
      authors,
      abstract: abstractText,
      keywords,
      doi,
      publicationDate,
      venue,
    };
  }

  /**
   * 特許を抽出
   */
  private extractPatent(html: string, _url: string): PatentData {
    const patentNumber = this.extractPatentNumber(html);
    const title = this.extractMeta(html, ['citation_title']) ||
                  this.extractTag(html, 'title') ||
                  'Unknown Patent';
    const abstractText = this.extractAbstract(html);
    const applicants = this.extractPatentParties(html, 'applicant');
    const inventors = this.extractPatentParties(html, 'inventor');
    const classifications = this.extractClassifications(html);
    const claims = this.extractClaims(html);

    return {
      patentNumber,
      title,
      abstract: abstractText,
      applicants,
      inventors,
      classifications,
      claims,
    };
  }

  /**
   * 製品を抽出
   */
  private extractProduct(html: string, _url: string): ProductData {
    const name = this.extractMeta(html, ['og:title', 'product:title']) ||
                 this.extractTag(html, 'title') ||
                 'Unknown Product';
    const description = this.extractMeta(html, ['og:description', 'description']) || '';
    const priceText = this.extractMeta(html, ['product:price:amount', 'price']);
    const currency = this.extractMeta(html, ['product:price:currency']) || 'JPY';
    const brand = this.extractMeta(html, ['product:brand', 'brand']);
    const images = this.config.extractImages ? this.extractImages(html) : [];

    return {
      name,
      description,
      price: priceText ? { amount: parseFloat(priceText), currency } : undefined,
      brand,
      images: images.map((img) => ({ url: img.url, alt: img.alt })),
    };
  }

  /**
   * テーブルを抽出
   */
  private extractTables(html: string): TableData[] {
    const tables: TableData[] = [];
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    let match;

    while ((match = tableRegex.exec(html)) !== null) {
      const tableHtml = match[1];
      const headers = this.extractTableHeaders(tableHtml);
      const rows = this.extractTableRows(tableHtml);

      if (headers.length > 0 || rows.length > 0) {
        tables.push({ headers, rows });
      }
    }

    return tables;
  }

  /**
   * 汎用抽出
   */
  private extractGeneral(html: string, url: string): ArticleData {
    return this.extractArticle(html, url);
  }

  // ヘルパーメソッド

  private extractMeta(html: string, names: string[]): string | undefined {
    for (const name of names) {
      // property属性
      const propertyMatch = html.match(new RegExp(`<meta[^>]*property=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i'));
      if (propertyMatch) return propertyMatch[1];

      // name属性
      const nameMatch = html.match(new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i'));
      if (nameMatch) return nameMatch[1];

      // content先頭パターン
      const contentFirstMatch = html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${name}["']`, 'i'));
      if (contentFirstMatch) return contentFirstMatch[1];
    }
    return undefined;
  }

  private extractTag(html: string, tag: string): string | undefined {
    const match = html.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, 'i'));
    return match ? match[1].trim() : undefined;
  }

  private extractAuthors(html: string): string[] {
    const authors: string[] = [];

    // meta タグから
    const authorMeta = this.extractMeta(html, ['author', 'article:author']);
    if (authorMeta) authors.push(authorMeta);

    // JSON-LD から
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        const jsonLd = JSON.parse(jsonLdMatch[1]);
        if (jsonLd.author) {
          if (typeof jsonLd.author === 'string') {
            authors.push(jsonLd.author);
          } else if (Array.isArray(jsonLd.author)) {
            authors.push(...jsonLd.author.map((a: { name?: string }) => a.name || a).filter(Boolean));
          } else if (jsonLd.author.name) {
            authors.push(jsonLd.author.name);
          }
        }
      } catch {
        // JSON parse error - ignore
      }
    }

    return [...new Set(authors)];
  }

  private extractPaperAuthors(html: string): { name: string; affiliation?: string }[] {
    const authors: { name: string; affiliation?: string }[] = [];

    // citation_author メタタグから
    const authorMatches = html.matchAll(/<meta[^>]*name=["']citation_author["'][^>]*content=["']([^"']+)["']/gi);
    for (const match of authorMatches) {
      authors.push({ name: match[1] });
    }

    return authors;
  }

  private extractMainContent(html: string): string {
    // <article> タグ優先
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
      return this.stripTags(articleMatch[1]);
    }

    // main タグ
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) {
      return this.stripTags(mainMatch[1]);
    }

    // body タグ（フォールバック）
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      return this.stripTags(bodyMatch[1]).slice(0, 10000);
    }

    return '';
  }

  private extractAbstract(html: string): string {
    // 論文用 abstract
    const abstractPatterns = [
      /<div[^>]*class=["'][^"']*abstract[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      /<section[^>]*id=["']abstract["'][^>]*>([\s\S]*?)<\/section>/i,
      /<p[^>]*class=["'][^"']*abstract[^"']*["'][^>]*>([\s\S]*?)<\/p>/i,
    ];

    for (const pattern of abstractPatterns) {
      const match = html.match(pattern);
      if (match) {
        return this.stripTags(match[1]).trim();
      }
    }

    // meta description をフォールバック
    return this.extractMeta(html, ['description', 'og:description']) || '';
  }

  private extractKeywords(html: string): string[] {
    // meta keywords
    const keywordsMeta = this.extractMeta(html, ['keywords', 'citation_keywords']);
    if (keywordsMeta) {
      return keywordsMeta.split(/[,;]/).map((k) => k.trim()).filter(Boolean);
    }
    return [];
  }

  private extractDOI(html: string, url: string): string | undefined {
    // URL から
    const doiUrlMatch = url.match(/10\.\d{4,}\/[^\s"<>]+/);
    if (doiUrlMatch) return doiUrlMatch[0];

    // meta タグから
    const doiMeta = this.extractMeta(html, ['citation_doi', 'DC.identifier']);
    if (doiMeta) return doiMeta;

    // HTML 本文から
    const doiHtmlMatch = html.match(/doi[:\s]*(10\.\d{4,}\/[^\s"<>]+)/i);
    if (doiHtmlMatch) return doiHtmlMatch[1];

    return undefined;
  }

  private extractPatentNumber(html: string): string {
    // citation_patent_number
    const meta = this.extractMeta(html, ['citation_patent_number']);
    if (meta) return meta;

    // パターンマッチ
    const patterns = [
      /(?:JP|US|EP|WO)[\s-]?\d{4,}/i,
      /特[願開許][\s-]?\d{4}-\d{6}/,
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return match[0];
    }

    return 'Unknown';
  }

  private extractPatentParties(html: string, type: 'applicant' | 'inventor'): string[] {
    const parties: string[] = [];
    const metaName = type === 'applicant' ? 'citation_applicant' : 'citation_inventor';

    const matches = html.matchAll(new RegExp(`<meta[^>]*name=["']${metaName}["'][^>]*content=["']([^"']+)["']`, 'gi'));
    for (const match of matches) {
      parties.push(match[1]);
    }

    return parties;
  }

  private extractClassifications(html: string): string[] {
    const classifications: string[] = [];

    // IPC
    const ipcMatches = html.matchAll(/[A-H]\d{2}[A-Z]\s?\d{1,4}\/\d{2,}/g);
    for (const match of ipcMatches) {
      classifications.push(match[0]);
    }

    return [...new Set(classifications)];
  }

  private extractClaims(html: string): { number: number; type: 'independent' | 'dependent'; text: string }[] {
    const claims: { number: number; type: 'independent' | 'dependent'; text: string }[] = [];

    const claimPatterns = [
      /<div[^>]*class=["'][^"']*claim[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
      /<p[^>]*class=["'][^"']*claim[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi,
    ];

    let claimNumber = 1;
    for (const pattern of claimPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        const text = this.stripTags(match[1]).trim();
        if (text) {
          const type = text.toLowerCase().includes('claim') && /claim\s+\d+/i.test(text)
            ? 'dependent'
            : 'independent';
          claims.push({ number: claimNumber++, type, text });
        }
      }
    }

    return claims;
  }

  private extractImages(html: string): { url: string; alt?: string; caption?: string }[] {
    const images: { url: string; alt?: string; caption?: string }[] = [];
    const imgMatches = html.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?/gi);

    for (const match of imgMatches) {
      const url = match[1];
      // 小さいアイコンや追跡ピクセルを除外
      if (!url.includes('pixel') && !url.includes('tracking') && !url.includes('1x1')) {
        images.push({ url, alt: match[2] });
      }
    }

    return images;
  }

  private extractTableHeaders(tableHtml: string): string[] {
    const headers: string[] = [];
    const thMatches = tableHtml.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi);

    for (const match of thMatches) {
      headers.push(this.stripTags(match[1]).trim());
    }

    return headers;
  }

  private extractTableRows(tableHtml: string): string[][] {
    const rows: string[][] = [];
    const trMatches = tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);

    for (const trMatch of trMatches) {
      const row: string[] = [];
      const tdMatches = trMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi);

      for (const tdMatch of tdMatches) {
        row.push(this.stripTags(tdMatch[1]).trim());
      }

      if (row.length > 0) {
        rows.push(row);
      }
    }

    return rows;
  }

  private stripTags(html: string): string {
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private createMetadata(
    startTime: number,
    extractorUsed: string,
    data: unknown,
    url: string
  ): ExtractionMetadata {
    const fieldCount = data ? Object.keys(data as object).filter((k) => (data as Record<string, unknown>)[k] !== undefined).length : 0;
    const requiredFields = ['title', 'content', 'abstract', 'name'];
    const missingFields = data
      ? requiredFields.filter((f) => !(f in (data as object)) || (data as Record<string, unknown>)[f] === undefined)
      : requiredFields;

    return {
      extractionTimeMs: Date.now() - startTime,
      extractorUsed,
      fieldCount,
      missingFields,
      sourceUrl: url,
      extractedAt: new Date().toISOString(),
    };
  }

  private calculateConfidence(data: unknown, contentType: ExtractableContentType): number {
    if (!data) return 0;

    const obj = data as Record<string, unknown>;
    let score = 0.5;

    // タイトルがあれば加点
    if (obj.title && typeof obj.title === 'string' && obj.title.length > 5) {
      score += 0.2;
    }

    // コンテンツタイプ別の必須フィールド
    const requiredByType: Record<string, string[]> = {
      article: ['title', 'content'],
      paper: ['title', 'abstract', 'authors'],
      patent: ['patentNumber', 'title', 'abstract'],
      product: ['name', 'description'],
    };

    const required = requiredByType[contentType] || [];
    const presentCount = required.filter((f) => obj[f] !== undefined).length;
    score += (presentCount / Math.max(required.length, 1)) * 0.3;

    return Math.min(score, 1);
  }
}

// シングルトンインスタンス
let extractorPipelineInstance: ExtractorPipeline | null = null;

/**
 * ExtractorPipelineのシングルトンインスタンスを取得
 */
export function getExtractorPipeline(config?: Partial<ExtractorPipelineConfig>): ExtractorPipeline {
  if (!extractorPipelineInstance) {
    extractorPipelineInstance = new ExtractorPipeline(config);
  }
  return extractorPipelineInstance;
}
