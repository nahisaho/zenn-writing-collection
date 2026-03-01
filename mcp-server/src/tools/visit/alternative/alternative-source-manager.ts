/**
 * Alternative Source Manager
 * REQ-ALT-001: 代替情報源管理機能
 *
 * @remarks
 * - 有料コンテンツの代替情報源を提案
 * - DOI、arXiv ID、特許番号等の識別子を自動検出
 * - 優先度ベースで代替情報源をランキング
 * - TSK-005 実装
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import type {
  AlternativeSource,
  AlternativeSourceResult,
  AlternativeSourceSuggestion,
  AlternativeSourcesConfig,
  ContentDetectionResult,
  ContentType,
  ExtractedIdentifier,
  IdentifierType,
} from './types.js';

/**
 * 代替情報源マネージャー
 */
export class AlternativeSourceManager {
  private sources: Map<ContentType, AlternativeSource[]> = new Map();
  private customSources: AlternativeSource[] = [];
  private loaded: boolean = false;
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || this.resolveDefaultPath();
  }

  /**
   * デフォルト設定パスを解決
   */
  private resolveDefaultPath(): string {
    // 1. 環境変数
    if (process.env.SHIKIGAMI_ALT_SOURCES_PATH) {
      return process.env.SHIKIGAMI_ALT_SOURCES_PATH;
    }
    // 2. プロジェクトルートの設定
    const projectPath = path.join(process.cwd(), 'shikigami.config.yaml');
    if (fs.existsSync(projectPath)) {
      return path.join(process.cwd(), 'configs', 'alternative-sources.yaml');
    }
    // 3. デフォルトパス
    return path.join(__dirname, '..', '..', '..', 'configs', 'alternative-sources.yaml');
  }

  /**
   * 設定ファイルを読み込み
   */
  async loadSources(): Promise<void> {
    if (this.loaded) return;

    // ビルトイン情報源を読み込み
    this.loadBuiltInSources();

    // カスタム設定ファイルがあれば読み込み
    if (fs.existsSync(this.configPath)) {
      try {
        const content = fs.readFileSync(this.configPath, 'utf-8');
        const config = yaml.load(content) as AlternativeSourcesConfig;

        if (config.sources) {
          for (const [contentType, sources] of Object.entries(config.sources)) {
            const existing = this.sources.get(contentType as ContentType) || [];
            this.sources.set(contentType as ContentType, [...existing, ...sources]);
          }
        }

        if (config.custom) {
          this.customSources = config.custom;
        }
      } catch (error) {
        console.warn(`Failed to load alternative sources config: ${error}`);
      }
    }

    this.loaded = true;
  }

  /**
   * ビルトイン代替情報源を読み込み
   */
  private loadBuiltInSources(): void {
    // 科学論文用の代替情報源
    const scientificPaperSources: AlternativeSource[] = [
      {
        id: 'arxiv',
        name: 'arXiv',
        type: 'preprint',
        contentTypes: ['scientific_paper'],
        urlPattern: 'arxiv\\.org',
        searchUrlTemplate: 'https://arxiv.org/search/?query={query}&searchtype=all',
        priority: 1,
        description: 'Open access preprint server for physics, mathematics, computer science, and more',
        enabled: true,
      },
      {
        id: 'pubmed_central',
        name: 'PubMed Central',
        type: 'open_access',
        contentTypes: ['scientific_paper'],
        urlPattern: 'ncbi\\.nlm\\.nih\\.gov/pmc',
        searchUrlTemplate: 'https://www.ncbi.nlm.nih.gov/pmc/?term={query}',
        priority: 2,
        description: 'Free full-text archive of biomedical and life sciences journal literature',
        enabled: true,
      },
      {
        id: 'semantic_scholar',
        name: 'Semantic Scholar',
        type: 'open_access',
        contentTypes: ['scientific_paper'],
        urlPattern: 'semanticscholar\\.org',
        searchUrlTemplate: 'https://www.semanticscholar.org/search?q={query}',
        priority: 3,
        description: 'AI-powered research tool for scientific literature',
        enabled: true,
      },
      {
        id: 'unpaywall',
        name: 'Unpaywall (via DOI)',
        type: 'open_access',
        contentTypes: ['scientific_paper'],
        searchUrlTemplate: 'https://api.unpaywall.org/v2/{doi}?email=user@example.com',
        priority: 4,
        description: 'Finds legal open access versions of research papers',
        enabled: true,
      },
      {
        id: 'google_scholar',
        name: 'Google Scholar',
        type: 'related_source',
        contentTypes: ['scientific_paper'],
        searchUrlTemplate: 'https://scholar.google.com/scholar?q={query}',
        priority: 5,
        description: 'Search across scholarly literature',
        enabled: true,
      },
      {
        id: 'core',
        name: 'CORE',
        type: 'open_access',
        contentTypes: ['scientific_paper'],
        urlPattern: 'core\\.ac\\.uk',
        searchUrlTemplate: 'https://core.ac.uk/search?q={query}',
        priority: 6,
        description: "World's largest collection of open access research papers",
        enabled: true,
      },
    ];

    // 特許用の代替情報源
    const patentSources: AlternativeSource[] = [
      {
        id: 'google_patents',
        name: 'Google Patents',
        type: 'open_access',
        contentTypes: ['patent'],
        urlPattern: 'patents\\.google\\.com',
        searchUrlTemplate: 'https://patents.google.com/?q={query}',
        priority: 1,
        description: 'Free patent search engine by Google',
        enabled: true,
      },
      {
        id: 'espacenet',
        name: 'Espacenet',
        type: 'open_access',
        contentTypes: ['patent'],
        urlPattern: 'espacenet\\.com',
        searchUrlTemplate: 'https://worldwide.espacenet.com/patent/search?q={query}',
        priority: 2,
        description: 'Free access to over 140 million patent documents',
        enabled: true,
      },
      {
        id: 'lens',
        name: 'The Lens',
        type: 'open_access',
        contentTypes: ['patent', 'scientific_paper'],
        urlPattern: 'lens\\.org',
        searchUrlTemplate: 'https://www.lens.org/lens/search/patent/list?q={query}',
        priority: 3,
        description: 'Open platform for patent and scholarly data',
        enabled: true,
      },
      {
        id: 'j_platpat',
        name: 'J-PlatPat',
        type: 'open_access',
        contentTypes: ['patent'],
        urlPattern: 'j-platpat\\.inpit\\.go\\.jp',
        searchUrlTemplate: 'https://www.j-platpat.inpit.go.jp/',
        priority: 4,
        description: 'Japanese Patent Office database (Japanese patents)',
        enabled: true,
      },
    ];

    // ニュース用の代替情報源
    const newsSources: AlternativeSource[] = [
      {
        id: 'archive_org',
        name: 'Internet Archive',
        type: 'archive',
        contentTypes: ['news', 'general'],
        urlPattern: 'web\\.archive\\.org',
        searchUrlTemplate: 'https://web.archive.org/web/*/{url}',
        priority: 1,
        description: 'Wayback Machine for archived versions of web pages',
        enabled: true,
      },
      {
        id: 'google_cache',
        name: 'Google Cache',
        type: 'cache',
        contentTypes: ['news', 'general'],
        searchUrlTemplate: 'https://webcache.googleusercontent.com/search?q=cache:{url}',
        priority: 2,
        description: 'Cached versions from Google',
        enabled: true,
      },
    ];

    // 技術ドキュメント用の代替情報源
    const technicalDocSources: AlternativeSource[] = [
      {
        id: 'github',
        name: 'GitHub',
        type: 'open_access',
        contentTypes: ['technical_doc'],
        urlPattern: 'github\\.com',
        searchUrlTemplate: 'https://github.com/search?q={query}&type=repositories',
        priority: 1,
        description: 'Source code and documentation on GitHub',
        enabled: true,
      },
      {
        id: 'stackoverflow',
        name: 'Stack Overflow',
        type: 'related_source',
        contentTypes: ['technical_doc'],
        urlPattern: 'stackoverflow\\.com',
        searchUrlTemplate: 'https://stackoverflow.com/search?q={query}',
        priority: 2,
        description: 'Q&A for programmers',
        enabled: true,
      },
      {
        id: 'devdocs',
        name: 'DevDocs',
        type: 'open_access',
        contentTypes: ['technical_doc'],
        searchUrlTemplate: 'https://devdocs.io/#q={query}',
        priority: 3,
        description: 'Aggregated API documentation',
        enabled: true,
      },
    ];

    this.sources.set('scientific_paper', scientificPaperSources);
    this.sources.set('patent', patentSources);
    this.sources.set('news', newsSources);
    this.sources.set('technical_doc', technicalDocSources);
    this.sources.set('general', [
      ...newsSources.filter((s) => s.type === 'archive' || s.type === 'cache'),
    ]);
  }

  /**
   * コンテンツ種別を検出
   */
  detectContentType(url: string, text?: string): ContentDetectionResult {
    const evidence: string[] = [];
    let contentType: ContentType = 'general';
    let confidence = 0.3;

    const urlLower = url.toLowerCase();
    const textLower = text?.toLowerCase() || '';

    // 科学論文の検出
    if (
      urlLower.includes('doi.org') ||
      urlLower.includes('pubmed') ||
      urlLower.includes('ncbi.nlm.nih.gov') ||
      urlLower.includes('sciencedirect') ||
      urlLower.includes('springer') ||
      urlLower.includes('wiley') ||
      urlLower.includes('nature.com') ||
      urlLower.includes('science.org') ||
      urlLower.includes('ieee.org') ||
      urlLower.includes('acm.org') ||
      urlLower.includes('arxiv.org')
    ) {
      contentType = 'scientific_paper';
      confidence = 0.9;
      evidence.push('URL matches scientific paper publisher pattern');
    }

    // 特許の検出
    if (
      urlLower.includes('patent') ||
      urlLower.includes('espacenet') ||
      urlLower.includes('j-platpat') ||
      urlLower.includes('wipo.int') ||
      urlLower.includes('uspto.gov')
    ) {
      contentType = 'patent';
      confidence = 0.95;
      evidence.push('URL matches patent database pattern');
    }

    // ニュースの検出
    if (
      urlLower.includes('news') ||
      urlLower.includes('article') ||
      urlLower.includes('nytimes') ||
      urlLower.includes('washingtonpost') ||
      urlLower.includes('bbc.') ||
      urlLower.includes('reuters') ||
      urlLower.includes('nikkei') ||
      urlLower.includes('asahi')
    ) {
      contentType = 'news';
      confidence = 0.8;
      evidence.push('URL matches news site pattern');
    }

    // 技術ドキュメントの検出
    if (
      urlLower.includes('docs.') ||
      urlLower.includes('documentation') ||
      urlLower.includes('readme') ||
      urlLower.includes('github.com') && urlLower.includes('blob')
    ) {
      contentType = 'technical_doc';
      confidence = 0.75;
      evidence.push('URL matches technical documentation pattern');
    }

    // テキストベースの追加検出
    if (textLower) {
      if (textLower.includes('doi:') || textLower.includes('abstract') && textLower.includes('keywords')) {
        if (contentType === 'general') {
          contentType = 'scientific_paper';
          confidence = 0.7;
        }
        evidence.push('Text contains scientific paper indicators');
      }

      if (textLower.includes('claims') && textLower.includes('patent')) {
        if (contentType === 'general') {
          contentType = 'patent';
          confidence = 0.8;
        }
        evidence.push('Text contains patent indicators');
      }
    }

    return { contentType, confidence, evidence };
  }

  /**
   * URLおよびテキストから識別子を抽出
   */
  extractIdentifiers(url: string, text?: string): ExtractedIdentifier[] {
    const identifiers: ExtractedIdentifier[] = [];

    // DOI抽出
    const doiPatterns = [
      /10\.\d{4,}\/[^\s"<>]+/g,
      /doi\.org\/(10\.\d{4,}\/[^\s"<>]+)/i,
    ];
    for (const pattern of doiPatterns) {
      const match = url.match(pattern);
      if (match) {
        identifiers.push({
          type: 'doi',
          value: match[1] || match[0],
          extractedFrom: 'url',
        });
      }
    }

    // arXiv ID抽出
    const arxivPattern = /arxiv\.org\/(?:abs|pdf)\/(\d{4}\.\d{4,5}(?:v\d+)?)/i;
    const arxivMatch = url.match(arxivPattern);
    if (arxivMatch) {
      identifiers.push({
        type: 'arxiv_id',
        value: arxivMatch[1],
        extractedFrom: 'url',
      });
    }

    // PMID抽出
    const pmidPattern = /pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/i;
    const pmidMatch = url.match(pmidPattern);
    if (pmidMatch) {
      identifiers.push({
        type: 'pmid',
        value: pmidMatch[1],
        extractedFrom: 'url',
      });
    }

    // PMCID抽出
    const pmcidPattern = /pmc\/articles\/(PMC\d+)/i;
    const pmcidMatch = url.match(pmcidPattern);
    if (pmcidMatch) {
      identifiers.push({
        type: 'pmcid',
        value: pmcidMatch[1],
        extractedFrom: 'url',
      });
    }

    // 特許番号抽出
    const patentPatterns = [
      // 日本特許: JP2020-123456A, 特願2020-123456
      /(?:JP|特願|特開|特許)[\s-]?(\d{4}[-\s]?\d{5,6}[A-Z]?)/gi,
      // 米国特許: US10,123,456, US 2020/0123456 A1
      /US\s?[\d,]+(?:\s?\/\s?\d+\s?[A-Z]\d?)?/gi,
      // 欧州特許: EP1234567A1
      /EP\d{7}[A-Z]\d?/gi,
      // PCT: WO2020/123456
      /WO\s?\d{4}\/\d{6}/gi,
    ];
    for (const pattern of patentPatterns) {
      const matches = url.match(pattern) || (text?.match(pattern)) || [];
      for (const match of matches) {
        identifiers.push({
          type: 'patent_number',
          value: match.replace(/\s/g, ''),
          extractedFrom: url.includes(match) ? 'url' : 'text',
        });
      }
    }

    // テキストからの追加抽出
    if (text) {
      // DOI from text
      const textDoiMatch = text.match(/doi:\s*(10\.\d{4,}\/[^\s"<>]+)/i);
      if (textDoiMatch && !identifiers.some((id) => id.type === 'doi')) {
        identifiers.push({
          type: 'doi',
          value: textDoiMatch[1],
          extractedFrom: 'text',
        });
      }

      // arXiv from text
      const textArxivMatch = text.match(/arXiv:\s*(\d{4}\.\d{4,5}(?:v\d+)?)/i);
      if (textArxivMatch && !identifiers.some((id) => id.type === 'arxiv_id')) {
        identifiers.push({
          type: 'arxiv_id',
          value: textArxivMatch[1],
          extractedFrom: 'text',
        });
      }
    }

    return identifiers;
  }

  /**
   * 代替情報源を検索して提案
   */
  async findAlternatives(
    url: string,
    text?: string,
    options?: {
      maxResults?: number;
      contentTypeHint?: ContentType;
    }
  ): Promise<AlternativeSourceResult> {
    await this.loadSources();

    const maxResults = options?.maxResults || 5;

    // コンテンツ種別を検出
    const detection = options?.contentTypeHint
      ? { contentType: options.contentTypeHint, confidence: 1, evidence: ['User specified'] }
      : this.detectContentType(url, text);

    // 識別子を抽出
    const identifiers = this.extractIdentifiers(url, text);

    // 代替情報源を取得
    const sources = [
      ...(this.sources.get(detection.contentType) || []),
      ...this.customSources.filter((s) =>
        s.contentTypes.includes(detection.contentType) && s.enabled
      ),
    ];

    // 提案を生成
    const suggestions: AlternativeSourceSuggestion[] = [];

    for (const source of sources) {
      if (!source.enabled) continue;

      // URLパターンがマッチした場合、同じソースはスキップ
      if (source.urlPattern && new RegExp(source.urlPattern, 'i').test(url)) {
        continue;
      }

      // 検索URLを生成
      let searchUrl = '';
      let confidence = 0.5;
      let reason = '';

      if (source.searchUrlTemplate) {
        // 識別子ベースのURL生成
        const doi = identifiers.find((id) => id.type === 'doi');
        const arxivId = identifiers.find((id) => id.type === 'arxiv_id');
        const patentNumber = identifiers.find((id) => id.type === 'patent_number');

        if (doi && source.id === 'unpaywall') {
          searchUrl = source.searchUrlTemplate.replace('{doi}', encodeURIComponent(doi.value));
          confidence = 0.9;
          reason = `DOI detected: ${doi.value}`;
        } else if (arxivId && source.id === 'arxiv') {
          searchUrl = `https://arxiv.org/abs/${arxivId.value}`;
          confidence = 0.95;
          reason = `arXiv ID detected: ${arxivId.value}`;
        } else if (patentNumber && source.contentTypes.includes('patent')) {
          searchUrl = source.searchUrlTemplate.replace('{query}', encodeURIComponent(patentNumber.value));
          confidence = 0.8;
          reason = `Patent number detected: ${patentNumber.value}`;
        } else if (source.searchUrlTemplate.includes('{url}')) {
          // Archive系
          searchUrl = source.searchUrlTemplate.replace('{url}', encodeURIComponent(url));
          confidence = 0.6;
          reason = 'Archive/cache lookup for original URL';
        } else {
          // 一般的なクエリベース検索
          const query = this.generateSearchQuery(url, text, identifiers);
          searchUrl = source.searchUrlTemplate.replace('{query}', encodeURIComponent(query));
          confidence = 0.4;
          reason = 'Query-based search';
        }
      }

      if (searchUrl) {
        suggestions.push({
          source,
          url: searchUrl,
          confidence: confidence * detection.confidence,
          reason,
        });
      }
    }

    // 優先度と信頼度でソートして上位を返す
    suggestions.sort((a, b) => {
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      return a.source.priority - b.source.priority;
    });

    return {
      originalUrl: url,
      contentType: detection.contentType,
      alternatives: suggestions.slice(0, maxResults),
      identifiers,
    };
  }

  /**
   * 検索クエリを生成
   */
  private generateSearchQuery(
    url: string,
    text?: string,
    identifiers?: ExtractedIdentifier[]
  ): string {
    // 識別子があれば優先
    if (identifiers && identifiers.length > 0) {
      const doi = identifiers.find((id) => id.type === 'doi');
      if (doi) return doi.value;

      const arxivId = identifiers.find((id) => id.type === 'arxiv_id');
      if (arxivId) return `arXiv:${arxivId.value}`;
    }

    // テキストからタイトルを抽出（最初の行をタイトルとして使用）
    if (text) {
      const firstLine = text.split('\n')[0].trim();
      if (firstLine.length > 10 && firstLine.length < 200) {
        return firstLine;
      }
    }

    // URLから推測
    const urlPath = new URL(url).pathname;
    const segments = urlPath.split('/').filter((s) => s.length > 3);
    if (segments.length > 0) {
      return segments[segments.length - 1].replace(/[-_]/g, ' ');
    }

    return url;
  }

  /**
   * カスタム代替情報源を追加
   */
  addCustomSource(source: AlternativeSource): void {
    this.customSources.push(source);
  }

  /**
   * 読み込み状態を確認
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * 代替情報源の数を取得
   */
  getSourceCount(): { byType: Map<ContentType, number>; custom: number } {
    const byType = new Map<ContentType, number>();
    for (const [type, sources] of this.sources) {
      byType.set(type, sources.length);
    }
    return { byType, custom: this.customSources.length };
  }
}

// シングルトンインスタンス
let alternativeSourceManagerInstance: AlternativeSourceManager | null = null;

/**
 * AlternativeSourceManagerのシングルトンインスタンスを取得
 */
export function getAlternativeSourceManager(configPath?: string): AlternativeSourceManager {
  if (!alternativeSourceManagerInstance) {
    alternativeSourceManagerInstance = new AlternativeSourceManager(configPath);
  }
  return alternativeSourceManagerInstance;
}
