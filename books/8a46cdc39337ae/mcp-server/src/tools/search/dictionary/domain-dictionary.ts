/**
 * Domain Dictionary Manager
 * 
 * v1.15.0: REQ-DICT-001 専門用語辞書・同義語展開
 * 
 * 機能:
 * - YAML辞書の読み込み
 * - ドメイン自動検出
 * - 同義語展開（日英対応）
 * - 新語提案
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { getV115FeaturesConfig } from '../../../config/loader.js';
import type {
  DomainType,
  DomainDictionary,
  DomainDictionariesYaml,
  SynonymGroup,
  QueryExpansionResult,
  TermSuggestion,
} from './types.js';

/**
 * デフォルトの辞書ファイルパス
 */
const DEFAULT_DICTIONARY_PATH = 'configs/domain-dictionaries.yaml';

/**
 * ドメイン辞書管理クラス
 */
export class DomainDictionaryManager {
  private dictionaries: Map<DomainType, DomainDictionary> = new Map();
  private loaded = false;
  private configPath: string;
  private suggestions: TermSuggestion[] = [];

  constructor(configPath?: string) {
    this.configPath = configPath ?? this.resolveDefaultPath();
  }

  /**
   * デフォルトパスを解決
   */
  private resolveDefaultPath(): string {
    const config = getV115FeaturesConfig();
    if (config.domainDictionary?.customPath) {
      return config.domainDictionary.customPath;
    }
    
    // パッケージルートからの相対パス
    const possiblePaths = [
      path.join(process.cwd(), DEFAULT_DICTIONARY_PATH),
      path.join(process.cwd(), 'shikigami', DEFAULT_DICTIONARY_PATH),
      path.join(__dirname, '../../../../..', DEFAULT_DICTIONARY_PATH),
    ];
    
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    
    return path.join(process.cwd(), DEFAULT_DICTIONARY_PATH);
  }

  /**
   * 辞書を読み込む
   */
  async loadDictionaries(): Promise<void> {
    if (this.loaded) return;

    try {
      if (!fs.existsSync(this.configPath)) {
        console.error(`[SHIKIGAMI] Dictionary file not found: ${this.configPath}, using built-in defaults`);
        this.loadBuiltInDictionaries();
        this.loaded = true;
        return;
      }

      const content = fs.readFileSync(this.configPath, 'utf-8');
      const parsed = yaml.parse(content) as DomainDictionariesYaml;

      if (!parsed.domains || !Array.isArray(parsed.domains)) {
        throw new Error('Invalid dictionary format: missing domains array');
      }

      for (const dict of parsed.domains) {
        this.dictionaries.set(dict.domain, dict);
      }

      console.error(`[SHIKIGAMI] Loaded ${this.dictionaries.size} domain dictionaries`);
      this.loaded = true;
    } catch (error) {
      console.error(`[SHIKIGAMI] Failed to load dictionaries: ${error}`);
      this.loadBuiltInDictionaries();
      this.loaded = true;
    }
  }

  /**
   * 組み込み辞書を読み込む（フォールバック用）
   */
  private loadBuiltInDictionaries(): void {
    const builtIn: DomainDictionary[] = [
      {
        domain: 'it',
        name: 'IT・テクノロジー',
        detectionKeywords: ['IT', 'システム', 'ソフトウェア', 'クラウド', 'AI', 'API'],
        synonymGroups: [
          { canonical: 'AI', synonyms: ['人工知能', 'Artificial Intelligence', '機械学習', 'ML'], english: 'Artificial Intelligence', japanese: '人工知能' },
          { canonical: 'クラウド', synonyms: ['Cloud', 'クラウドコンピューティング', 'cloud computing'], english: 'Cloud', japanese: 'クラウド' },
          { canonical: 'API', synonyms: ['Application Programming Interface', 'インターフェース', 'エンドポイント'], english: 'API', japanese: 'API' },
        ],
      },
      {
        domain: 'business',
        name: 'ビジネス・経営',
        detectionKeywords: ['ビジネス', '経営', '戦略', 'マーケティング', '市場'],
        synonymGroups: [
          { canonical: 'M&A', synonyms: ['合併買収', 'Merger and Acquisition', '企業買収'], english: 'M&A', japanese: '合併買収' },
          { canonical: 'ROI', synonyms: ['投資対効果', 'Return on Investment', '投資収益率'], english: 'ROI', japanese: '投資対効果' },
        ],
      },
      {
        domain: 'finance',
        name: '金融・財務',
        detectionKeywords: ['金融', '財務', '投資', '株式', '債券'],
        synonymGroups: [
          { canonical: 'IPO', synonyms: ['新規株式公開', 'Initial Public Offering', '上場'], english: 'IPO', japanese: '新規株式公開' },
          { canonical: 'ESG', synonyms: ['環境社会ガバナンス', 'ESG投資', 'サステナブル投資'], english: 'ESG', japanese: '環境社会ガバナンス' },
        ],
      },
      {
        domain: 'legal',
        name: '法務・規制',
        detectionKeywords: ['法律', '法務', '規制', 'コンプライアンス', '契約'],
        synonymGroups: [
          { canonical: 'GDPR', synonyms: ['一般データ保護規則', 'General Data Protection Regulation', 'EU個人情報保護法'], english: 'GDPR', japanese: '一般データ保護規則' },
          { canonical: 'NDA', synonyms: ['秘密保持契約', 'Non-Disclosure Agreement', '機密保持契約'], english: 'NDA', japanese: '秘密保持契約' },
        ],
      },
      {
        domain: 'healthcare',
        name: '医療・ヘルスケア',
        detectionKeywords: ['医療', 'ヘルスケア', '製薬', '病院', '臨床'],
        synonymGroups: [
          { canonical: 'FDA', synonyms: ['米国食品医薬品局', 'Food and Drug Administration', '米FDA'], english: 'FDA', japanese: '米国食品医薬品局' },
          { canonical: 'EHR', synonyms: ['電子健康記録', 'Electronic Health Record', '電子カルテ'], english: 'EHR', japanese: '電子健康記録' },
        ],
      },
    ];

    for (const dict of builtIn) {
      this.dictionaries.set(dict.domain, dict);
    }
  }

  /**
   * クエリからドメインを検出
   */
  detectDomain(query: string): DomainType | null {
    if (!this.loaded) {
      // 同期的にロードを試みる
      this.loadBuiltInDictionaries();
      this.loaded = true;
    }

    const lowerQuery = query.toLowerCase();
    
    // 各ドメインのマッチスコアを計算
    let bestMatch: DomainType | null = null;
    let bestScore = 0;

    for (const [domain, dict] of this.dictionaries) {
      let score = 0;
      
      // 検出キーワードのマッチ
      for (const keyword of dict.detectionKeywords) {
        if (lowerQuery.includes(keyword.toLowerCase())) {
          score += 2;
        }
      }
      
      // 同義語グループのマッチ
      for (const group of dict.synonymGroups) {
        if (lowerQuery.includes(group.canonical.toLowerCase())) {
          score += 1;
        }
        for (const syn of group.synonyms) {
          if (lowerQuery.includes(syn.toLowerCase())) {
            score += 1;
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = domain;
      }
    }

    return bestMatch;
  }

  /**
   * クエリを同義語で展開
   */
  expandQuery(query: string, domain?: DomainType): string[] {
    if (!this.loaded) {
      this.loadBuiltInDictionaries();
      this.loaded = true;
    }

    const config = getV115FeaturesConfig();
    const expanded = new Set<string>([query]);
    const detectedDomain = domain ?? this.detectDomain(query);

    // 有効なドメインの辞書を取得
    const enabledDomains = config.domainDictionary?.domains ?? ['it', 'business', 'finance', 'legal', 'healthcare'];
    
    const domainsToSearch: DomainType[] = detectedDomain 
      ? [detectedDomain] 
      : enabledDomains;

    for (const d of domainsToSearch) {
      const dict = this.dictionaries.get(d);
      if (!dict) continue;

      for (const group of dict.synonymGroups) {
        // クエリに正規形または同義語が含まれているかチェック
        const allTerms = [group.canonical, ...group.synonyms];
        const matchedTerm = allTerms.find(term => 
          query.toLowerCase().includes(term.toLowerCase())
        );

        if (matchedTerm) {
          // 他の同義語で置換したクエリを追加
          for (const synonym of allTerms) {
            if (synonym.toLowerCase() !== matchedTerm.toLowerCase()) {
              const expandedQuery = query.replace(
                new RegExp(matchedTerm, 'gi'),
                synonym
              );
              expanded.add(expandedQuery);
            }
          }
        }
      }
    }

    return Array.from(expanded);
  }

  /**
   * 多言語展開（日英）
   */
  expandMultilingual(term: string, domain: DomainType): string[] {
    const config = getV115FeaturesConfig();
    if (!config.domainDictionary?.multilingualExpansion) {
      return [term];
    }

    if (!this.loaded) {
      this.loadBuiltInDictionaries();
      this.loaded = true;
    }

    const expanded = new Set<string>([term]);
    const dict = this.dictionaries.get(domain);
    if (!dict) return [term];

    for (const group of dict.synonymGroups) {
      const allTerms = [group.canonical, ...group.synonyms];
      if (allTerms.some(t => t.toLowerCase() === term.toLowerCase())) {
        if (group.english) expanded.add(group.english);
        if (group.japanese) expanded.add(group.japanese);
        break;
      }
    }

    return Array.from(expanded);
  }

  /**
   * 完全なクエリ展開を実行
   */
  async expandQueryFull(query: string): Promise<QueryExpansionResult> {
    await this.loadDictionaries();

    const detectedDomain = this.detectDomain(query);
    const expandedQueries = new Set<string>([query]);
    const matchedGroups: SynonymGroup[] = [];

    // 同義語展開
    const synonymExpanded = this.expandQuery(query, detectedDomain ?? undefined);
    for (const q of synonymExpanded) {
      expandedQueries.add(q);
    }

    // 多言語展開
    let multilingualExpanded = false;
    if (detectedDomain) {
      const config = getV115FeaturesConfig();
      if (config.domainDictionary?.multilingualExpansion) {
        const dict = this.dictionaries.get(detectedDomain);
        if (dict) {
          for (const group of dict.synonymGroups) {
            const allTerms = [group.canonical, ...group.synonyms];
            if (allTerms.some(t => query.toLowerCase().includes(t.toLowerCase()))) {
              matchedGroups.push(group);
              if (group.english) {
                expandedQueries.add(query.replace(
                  new RegExp(group.canonical, 'gi'),
                  group.english
                ));
                multilingualExpanded = true;
              }
              if (group.japanese && group.canonical !== group.japanese) {
                expandedQueries.add(query.replace(
                  new RegExp(group.canonical, 'gi'),
                  group.japanese
                ));
                multilingualExpanded = true;
              }
            }
          }
        }
      }
    }

    return {
      originalQuery: query,
      detectedDomain,
      expandedQueries: Array.from(expandedQueries),
      matchedGroups,
      multilingualExpanded,
    };
  }

  /**
   * 新語を提案として記録
   */
  suggestNewTerm(term: string, domain: DomainType): void {
    // 既に辞書にある場合はスキップ
    const dict = this.dictionaries.get(domain);
    if (dict) {
      for (const group of dict.synonymGroups) {
        if (group.canonical.toLowerCase() === term.toLowerCase()) return;
        if (group.synonyms.some(s => s.toLowerCase() === term.toLowerCase())) return;
      }
    }

    // 類似用語を検索
    const similarTerms: string[] = [];
    if (dict) {
      for (const group of dict.synonymGroups) {
        if (this.isSimilar(term, group.canonical)) {
          similarTerms.push(group.canonical);
        }
      }
    }

    this.suggestions.push({
      term,
      suggestedDomain: domain,
      similarTerms,
      suggestedAt: new Date().toISOString(),
    });
  }

  /**
   * 2つの用語が類似しているかチェック（簡易実装）
   */
  private isSimilar(a: string, b: string): boolean {
    const la = a.toLowerCase();
    const lb = b.toLowerCase();
    return la.includes(lb) || lb.includes(la);
  }

  /**
   * 提案された新語を取得
   */
  getSuggestions(): TermSuggestion[] {
    return [...this.suggestions];
  }

  /**
   * 辞書がロード済みかどうか
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * 登録されているドメイン数
   */
  getDomainCount(): number {
    return this.dictionaries.size;
  }
}

/**
 * シングルトンインスタンス（lazy初期化）
 */
let _instance: DomainDictionaryManager | null = null;

/**
 * DomainDictionaryManager のシングルトンを取得
 */
export function getDomainDictionaryManager(): DomainDictionaryManager {
  if (!_instance) {
    _instance = new DomainDictionaryManager();
  }
  return _instance;
}

/**
 * シングルトンをリセット（テスト用）
 */
export function resetDomainDictionaryManager(): void {
  _instance = null;
}
