/**
 * Patent Search Optimizer
 * REQ-PAT-001: 特許検索最適化機能
 *
 * @remarks
 * - 特許検索クエリを最適化
 * - IPC/CPC分類コードを自動推定
 * - 各特許庁に最適化されたクエリ生成
 * - TSK-010 実装
 */

import type {
  ClassificationMapping,
  ClassificationSystem,
  OptimizedPatentQuery,
  PatentClassification,
  PatentOffice,
  PatentSearchConfig,
  PatentSearchQuery,
} from './types.js';

/**
 * 特許検索最適化クラス
 */
export class PatentSearchOptimizer {
  private config: PatentSearchConfig;
  private classificationMappings: ClassificationMapping[] = [];

  constructor(config?: Partial<PatentSearchConfig>) {
    this.config = {
      defaultOffices: ['JPO', 'USPTO', 'EPO'],
      autoClassification: true,
      synonymExpansion: true,
      multilingualSearch: true,
      maxResults: 100,
      ...config,
    };
    this.loadBuiltInMappings();
  }

  /**
   * ビルトインの分類コードマッピングを読み込み
   */
  private loadBuiltInMappings(): void {
    // 主要な技術分野のIPC/CPCマッピング
    this.classificationMappings = [
      // AI/機械学習
      {
        ipc: 'G06N',
        cpc: ['G06N3/00', 'G06N5/00', 'G06N7/00', 'G06N20/00'],
        fi: ['G06N3/00', 'G06N5/00'],
        description: 'Computer systems based on specific computational models (AI, ML, Neural Networks)',
        keywords: ['machine learning', 'neural network', 'deep learning', 'AI', '機械学習', 'ニューラルネットワーク'],
      },
      {
        ipc: 'G06N3/02',
        cpc: ['G06N3/02', 'G06N3/04', 'G06N3/08'],
        description: 'Neural network architectures and learning methods',
        keywords: ['neural network', 'deep learning', 'backpropagation', 'CNN', 'RNN', 'transformer'],
      },
      // 自然言語処理
      {
        ipc: 'G06F40',
        cpc: ['G06F40/00', 'G06F40/20', 'G06F40/30'],
        fi: ['G06F40/00'],
        description: 'Natural language processing',
        keywords: ['NLP', 'natural language', '自然言語処理', 'text analysis', 'language model'],
      },
      // バイオテクノロジー
      {
        ipc: 'C12N15',
        cpc: ['C12N15/00', 'C12N15/09', 'C12N15/10'],
        description: 'Mutation or genetic engineering',
        keywords: ['CRISPR', 'gene editing', 'genetic engineering', '遺伝子編集', 'genome'],
      },
      {
        ipc: 'C12Q1',
        cpc: ['C12Q1/00', 'C12Q1/68'],
        description: 'Measuring or testing processes involving enzymes or micro-organisms',
        keywords: ['PCR', 'DNA sequencing', 'biomarker', 'バイオマーカー'],
      },
      // 医薬品
      {
        ipc: 'A61K',
        cpc: ['A61K31/00', 'A61K39/00', 'A61K47/00'],
        description: 'Preparations for medical purposes',
        keywords: ['drug', 'pharmaceutical', '医薬品', 'therapy', 'treatment'],
      },
      {
        ipc: 'A61P',
        cpc: ['A61P1/00', 'A61P35/00'],
        description: 'Therapeutic activity of chemical compounds',
        keywords: ['anticancer', '抗がん剤', 'therapeutic', 'treatment'],
      },
      // 半導体
      {
        ipc: 'H01L',
        cpc: ['H01L21/00', 'H01L27/00', 'H01L29/00'],
        fi: ['H01L21/00', 'H01L27/00'],
        description: 'Semiconductor devices',
        keywords: ['semiconductor', 'transistor', 'integrated circuit', '半導体', 'IC'],
      },
      // 電気自動車
      {
        ipc: 'B60L',
        cpc: ['B60L50/00', 'B60L53/00', 'B60L58/00'],
        description: 'Electric propulsion for vehicles',
        keywords: ['EV', 'electric vehicle', '電気自動車', 'battery', 'charging'],
      },
      // 再生可能エネルギー
      {
        ipc: 'H02S',
        cpc: ['H02S10/00', 'H02S20/00', 'H02S40/00'],
        description: 'Solar electric power generation',
        keywords: ['solar', 'photovoltaic', 'PV', '太陽光発電', 'renewable'],
      },
      {
        ipc: 'F03D',
        cpc: ['F03D1/00', 'F03D7/00', 'F03D9/00'],
        description: 'Wind motors',
        keywords: ['wind turbine', 'wind power', '風力発電', 'wind energy'],
      },
      // ブロックチェーン
      {
        ipc: 'G06Q20',
        cpc: ['G06Q20/00', 'G06Q20/38', 'H04L9/00'],
        description: 'Payment architectures',
        keywords: ['blockchain', 'cryptocurrency', 'distributed ledger', 'ブロックチェーン'],
      },
    ];
  }

  /**
   * キーワードから分類コードを推定
   */
  suggestClassifications(keywords: string[]): PatentClassification[] {
    const results: PatentClassification[] = [];
    const keywordsLower = keywords.map((k) => k.toLowerCase());

    for (const mapping of this.classificationMappings) {
      const matchCount = mapping.keywords.filter((kw) =>
        keywordsLower.some((k) => k.includes(kw.toLowerCase()) || kw.toLowerCase().includes(k))
      ).length;

      if (matchCount > 0) {
        const confidence = Math.min(matchCount / mapping.keywords.length + 0.3, 0.95);

        // IPCを追加
        results.push({
          system: 'IPC',
          code: mapping.ipc,
          description: mapping.description,
          confidence,
        });

        // CPCも追加
        for (const cpc of mapping.cpc) {
          results.push({
            system: 'CPC',
            code: cpc,
            description: mapping.description,
            confidence: confidence * 0.9,
          });
        }

        // FIがあれば追加（日本向け）
        if (mapping.fi) {
          for (const fi of mapping.fi) {
            results.push({
              system: 'FI',
              code: fi,
              description: mapping.description,
              confidence: confidence * 0.85,
            });
          }
        }
      }
    }

    // 信頼度でソートして重複を除去
    return results
      .sort((a, b) => b.confidence - a.confidence)
      .filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.system === item.system && t.code === item.code)
      )
      .slice(0, 10);
  }

  /**
   * キーワードを特許検索用に展開
   */
  expandKeywords(keywords: string[]): string[] {
    const expanded = new Set<string>(keywords);

    const synonymMap: Record<string, string[]> = {
      // AI/ML
      'machine learning': ['ML', 'artificial intelligence', 'AI', '機械学習'],
      'deep learning': ['DL', 'neural network', 'ディープラーニング'],
      'neural network': ['NN', 'artificial neural network', 'ANN', 'ニューラルネットワーク'],
      // バイオ
      'CRISPR': ['gene editing', 'genome editing', 'Cas9', 'ゲノム編集'],
      'PCR': ['polymerase chain reaction', 'DNA amplification', 'ポリメラーゼ連鎖反応'],
      // 医薬
      'drug': ['pharmaceutical', 'medicine', 'compound', '医薬品'],
      'antibody': ['immunoglobulin', 'Ab', '抗体'],
      // 技術
      'semiconductor': ['IC', 'integrated circuit', '半導体', 'chip'],
      'electric vehicle': ['EV', 'BEV', '電気自動車', 'electric car'],
      'battery': ['cell', 'accumulator', '電池', 'energy storage'],
    };

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      for (const [term, synonyms] of Object.entries(synonymMap)) {
        if (keywordLower.includes(term.toLowerCase()) || term.toLowerCase().includes(keywordLower)) {
          synonyms.forEach((s) => expanded.add(s));
        }
      }
    }

    return Array.from(expanded);
  }

  /**
   * 特許庁ごとの検索クエリを生成
   */
  generateOfficeQuery(query: PatentSearchQuery, office: PatentOffice): string {
    const keywords = query.keywords.join(' OR ');
    const classifications = query.classifications || [];

    switch (office) {
      case 'JPO':
        return this.generateJPOQuery(query, classifications);
      case 'USPTO':
        return this.generateUSPTOQuery(query, classifications);
      case 'EPO':
        return this.generateEPOQuery(query, classifications);
      case 'WIPO':
        return this.generateWIPOQuery(query, classifications);
      default:
        return keywords;
    }
  }

  /**
   * JPO向けクエリ生成
   */
  private generateJPOQuery(query: PatentSearchQuery, classifications: PatentClassification[]): string {
    const parts: string[] = [];

    // キーワード
    if (query.keywords.length > 0) {
      parts.push(`(${query.keywords.join(' OR ')})/TX`);
    }

    // FIコード
    const fiCodes = classifications.filter((c) => c.system === 'FI' || c.system === 'IPC');
    if (fiCodes.length > 0) {
      parts.push(`(${fiCodes.map((c) => c.code).join(' OR ')})/FI`);
    }

    // 出願人
    if (query.applicant) {
      parts.push(`${query.applicant}/AP`);
    }

    return parts.join(' AND ');
  }

  /**
   * USPTO向けクエリ生成
   */
  private generateUSPTOQuery(query: PatentSearchQuery, classifications: PatentClassification[]): string {
    const parts: string[] = [];

    // キーワード
    if (query.keywords.length > 0) {
      parts.push(`(${query.keywords.join(' OR ')})`);
    }

    // CPCコード
    const cpcCodes = classifications.filter((c) => c.system === 'CPC' || c.system === 'IPC');
    if (cpcCodes.length > 0) {
      parts.push(`CPC/(${cpcCodes.map((c) => c.code).join(' OR ')})`);
    }

    // 出願人
    if (query.applicant) {
      parts.push(`AN/${query.applicant}`);
    }

    return parts.join(' AND ');
  }

  /**
   * EPO向けクエリ生成
   */
  private generateEPOQuery(query: PatentSearchQuery, classifications: PatentClassification[]): string {
    const parts: string[] = [];

    // キーワード
    if (query.keywords.length > 0) {
      parts.push(`txt = (${query.keywords.join(' OR ')})`);
    }

    // CPCコード
    const cpcCodes = classifications.filter((c) => c.system === 'CPC' || c.system === 'IPC');
    if (cpcCodes.length > 0) {
      parts.push(`cpc = (${cpcCodes.map((c) => c.code).join(' OR ')})`);
    }

    // 出願人
    if (query.applicant) {
      parts.push(`pa = "${query.applicant}"`);
    }

    return parts.join(' AND ');
  }

  /**
   * WIPO向けクエリ生成
   */
  private generateWIPOQuery(query: PatentSearchQuery, classifications: PatentClassification[]): string {
    const parts: string[] = [];

    // キーワード
    if (query.keywords.length > 0) {
      parts.push(`FP:(${query.keywords.join(' OR ')})`);
    }

    // IPCコード
    const ipcCodes = classifications.filter((c) => c.system === 'IPC');
    if (ipcCodes.length > 0) {
      parts.push(`IC:(${ipcCodes.map((c) => c.code).join(' OR ')})`);
    }

    return parts.join(' AND ');
  }

  /**
   * 検索URLを生成
   */
  generateSearchUrl(query: string, office: PatentOffice): string {
    const encodedQuery = encodeURIComponent(query);

    switch (office) {
      case 'JPO':
        return `https://www.j-platpat.inpit.go.jp/c1800/PU/JP-${encodedQuery}/15/ja`;
      case 'USPTO':
        return `https://patft.uspto.gov/netacgi/nph-Parser?Sect1=PTO2&Sect2=HITOFF&u=%2Fnetahtml%2FPTO%2Fsearch-adv.htm&r=0&f=S&l=50&d=PTXT&Query=${encodedQuery}`;
      case 'EPO':
        return `https://worldwide.espacenet.com/patent/search?q=${encodedQuery}`;
      case 'WIPO':
        return `https://patentscope.wipo.int/search/en/search.jsf?query=${encodedQuery}`;
      case 'CNIPA':
        return `https://pss-system.cponline.cnipa.gov.cn/conventionalSearch?searchType=1&searchKey=${encodedQuery}`;
      case 'KIPO':
        return `https://doi.kipris.or.kr/patent/search.do?searchKey=${encodedQuery}`;
      default:
        return `https://patents.google.com/?q=${encodedQuery}`;
    }
  }

  /**
   * 特許検索クエリを最適化
   */
  optimizeQuery(query: PatentSearchQuery): OptimizedPatentQuery {
    const notes: string[] = [];

    // キーワード展開
    let expandedKeywords = query.keywords;
    if (this.config.synonymExpansion) {
      expandedKeywords = this.expandKeywords(query.keywords);
      notes.push(`Expanded keywords from ${query.keywords.length} to ${expandedKeywords.length}`);
    }

    // 分類コード推定
    let suggestedClassifications: PatentClassification[] = [];
    if (this.config.autoClassification) {
      suggestedClassifications = this.suggestClassifications(expandedKeywords);
      if (suggestedClassifications.length > 0) {
        notes.push(`Suggested ${suggestedClassifications.length} classification codes`);
      }
    }

    // 既存の分類コードとマージ
    const allClassifications = [
      ...(query.classifications || []),
      ...suggestedClassifications.filter(
        (sc) => !query.classifications?.some((qc) => qc.code === sc.code)
      ),
    ];

    // 各特許庁向けクエリ生成
    const offices = query.offices || this.config.defaultOffices;
    const optimizedQueries = new Map<PatentOffice, string>();
    const searchUrls = new Map<PatentOffice, string>();

    const optimizedQueryObj: PatentSearchQuery = {
      ...query,
      keywords: expandedKeywords,
      classifications: allClassifications,
    };

    for (const office of offices) {
      const officeQuery = this.generateOfficeQuery(optimizedQueryObj, office);
      optimizedQueries.set(office, officeQuery);
      searchUrls.set(office, this.generateSearchUrl(officeQuery, office));
    }

    notes.push(`Generated queries for ${offices.length} patent offices`);

    return {
      originalQuery: query,
      optimizedQueries,
      suggestedClassifications,
      expandedKeywords,
      searchUrls,
      optimizationNotes: notes,
    };
  }

  /**
   * 簡易検索（キーワードのみ）
   */
  quickSearch(keywords: string[]): OptimizedPatentQuery {
    return this.optimizeQuery({ keywords });
  }
}

// シングルトンインスタンス
let patentSearchOptimizerInstance: PatentSearchOptimizer | null = null;

/**
 * PatentSearchOptimizerのシングルトンインスタンスを取得
 */
export function getPatentSearchOptimizer(config?: Partial<PatentSearchConfig>): PatentSearchOptimizer {
  if (!patentSearchOptimizerInstance) {
    patentSearchOptimizerInstance = new PatentSearchOptimizer(config);
  }
  return patentSearchOptimizerInstance;
}

/**
 * シングルトンインスタンスをリセット（テスト用）
 */
export function resetPatentSearchOptimizer(): void {
  patentSearchOptimizerInstance = null;
}
