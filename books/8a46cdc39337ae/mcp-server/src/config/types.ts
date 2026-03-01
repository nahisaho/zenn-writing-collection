/**
 * SHIKIGAMI Configuration Types
 *
 * REQ-NF-007: プロバイダー設定ファイル対応
 * REQ-SRCH-001: 検索フォールバック機構（v1.5.0）
 * shikigami.config.yaml で設定をカスタマイズ可能
 */

/**
 * 検索プロバイダー名
 */
export type SearchProviderName = 'duckduckgo' | 'brave' | 'searxng';

/**
 * 単一検索プロバイダー設定（v1.5.0: 複数プロバイダー対応）
 */
export interface SingleSearchProviderConfig {
  /** プロバイダー名 */
  name: SearchProviderName;
  /** 優先度（1が最高） */
  priority: number;
  /** 有効/無効 */
  enabled?: boolean;
  /** API キー（Brave Search等） */
  apiKey?: string;
  /** カスタムエンドポイント（SearXNG等） */
  endpoint?: string;
  /** プロバイダー固有の設定 */
  options?: {
    /** リクエストタイムアウト（ms） */
    timeout?: number;
    /** 最大リトライ回数 */
    maxRetries?: number;
    /** レート制限間隔（ms） */
    rateLimitMs?: number;
  };
}

/**
 * フォールバック設定（v1.5.0）
 */
export interface SearchFallbackConfig {
  /** フォールバックを有効にするか */
  enabled: boolean;
  /** 各プロバイダーの最大リトライ回数 */
  maxRetries?: number;
  /** リトライ間隔（ms） */
  retryDelayMs?: number;
}

/**
 * 検索設定（v1.5.0: 複数プロバイダー・フォールバック対応）
 */
export interface SearchConfig {
  /** 検索プロバイダー一覧 */
  providers: SingleSearchProviderConfig[];
  /** フォールバック設定 */
  fallback?: SearchFallbackConfig;
  /** 共通オプション */
  options?: {
    /** リクエストタイムアウト（ms） */
    timeout?: number;
    /** レート制限間隔（ms） */
    rateLimitMs?: number;
    /** 言語/地域設定 */
    locale?: string;
  };
}

/**
 * 検索プロバイダー設定（後方互換性のため維持）
 * @deprecated v1.5.0以降は SearchConfig を使用
 */
export interface SearchProviderConfig {
  /** プロバイダー名 */
  provider: 'duckduckgo' | 'google' | 'bing' | 'tavily';
  /** プロバイダー固有の設定 */
  options?: {
    /** API キー（必要な場合） */
    apiKey?: string;
    /** カスタムエンドポイント */
    endpoint?: string;
    /** リクエストタイムアウト（ms） */
    timeout?: number;
    /** 最大リトライ回数 */
    maxRetries?: number;
    /** レート制限間隔（ms） */
    rateLimitMs?: number;
    /** 言語/地域設定 */
    locale?: string;
  };
}

/**
 * ページ取得プロバイダー設定
 */
export interface PageFetcherConfig {
  /** プロバイダー名 */
  provider: 'jina' | 'firecrawl' | 'browserbase';
  /** プロバイダー固有の設定 */
  options?: {
    /** API キー（必要な場合） */
    apiKey?: string;
    /** カスタムエンドポイント */
    endpoint?: string;
    /** リクエストタイムアウト（ms） */
    timeout?: number;
    /** レート制限間隔（ms） */
    rateLimitMs?: number;
    /** JavaScript 実行を待つか */
    waitForJS?: boolean;
    /** 返却形式 */
    format?: 'markdown' | 'text' | 'html';
  };
}

/**
 * LLM プロバイダー設定
 */
export interface LLMProviderConfig {
  /** プロバイダー名 */
  provider: 'ollama' | 'openai' | 'anthropic' | 'azure-openai';
  /** モデル名 */
  model: string;
  /** プロバイダー固有の設定 */
  options?: {
    /** API キー（必要な場合） */
    apiKey?: string;
    /** カスタムエンドポイント（Ollama等） */
    endpoint?: string;
    /** 生成時の温度パラメータ */
    temperature?: number;
    /** 最大トークン数 */
    maxTokens?: number;
    /** タイムアウト（ms） */
    timeout?: number;
  };
}

/**
 * Embedding プロバイダー設定
 */
export interface EmbeddingProviderConfig {
  /** プロバイダー名 */
  provider: 'ollama' | 'openai' | 'huggingface';
  /** モデル名 */
  model: string;
  /** プロバイダー固有の設定 */
  options?: {
    /** API キー（必要な場合） */
    apiKey?: string;
    /** カスタムエンドポイント */
    endpoint?: string;
    /** ベクトル次元数 */
    dimensions?: number;
  };
}

/**
 * キャッシュ設定
 */
export interface CacheConfig {
  /** キャッシュを有効にするか */
  enabled: boolean;
  /** TTL（秒） */
  ttlSeconds?: number;
  /** 最大キャッシュサイズ（エントリ数） */
  maxSize?: number;
  /** キャッシュ保存場所 */
  storage?: 'memory' | 'file';
  /** ファイルキャッシュのパス */
  filePath?: string;
}

/**
 * ログ設定
 */
export interface LogConfig {
  /** ログレベル */
  level: 'debug' | 'info' | 'warn' | 'error';
  /** 出力先 */
  output?: 'stderr' | 'file';
  /** ファイル出力時のパス */
  filePath?: string;
}

// ============================================================
// v1.7.0: 検索リカバリー設定 (REQ-SRCH-003)
// ============================================================

/**
 * 同義語辞書エントリ
 */
export interface SynonymEntry {
  /** 元の語句 */
  term: string;
  /** 同義語リスト */
  synonyms: string[];
}

/**
 * 検索リカバリー設定 (v1.7.0)
 * REQ-SRCH-003: 検索失敗時の自動リカバリー
 */
export interface SearchRecoveryConfig {
  /** リカバリー機能を有効にするか */
  enabled: boolean;
  /** 最大リトライ回数（デフォルト: 3） */
  maxRetries?: number;
  /** リカバリー全体のタイムアウト（ms）（デフォルト: 30000） */
  timeoutMs?: number;
  /** 戦略設定 */
  strategies?: {
    /** 同義語置換戦略 */
    synonym?: {
      enabled?: boolean;
      /** カスタム同義語辞書 */
      customDictionary?: SynonymEntry[];
    };
    /** クエリ簡略化戦略 */
    simplify?: {
      enabled?: boolean;
      /** 保持する最大語数（デフォルト: 3） */
      maxWords?: number;
    };
    /** 言語変換戦略 */
    translate?: {
      enabled?: boolean;
      /** カスタム翻訳辞書（日本語→英語） */
      customDictionary?: Record<string, string>;
    };
  };
}

// ============================================================
// v1.7.0: ナレッジ連携設定 (REQ-KM-003)
// ============================================================

/**
 * ナレッジ連携設定 (v1.7.0)
 * REQ-KM-003: 関連プロジェクトの自動検出
 */
export interface KnowledgeDiscoveryConfig {
  /** ナレッジ連携を有効にするか */
  enabled: boolean;
  /** プロジェクト検索パス（デフォルト: projects/） */
  searchPath?: string;
  /** 類似度閾値（0-1、デフォルト: 0.3） */
  similarityThreshold?: number;
  /** 表示する最大プロジェクト数（デフォルト: 5） */
  maxResults?: number;
  /** 鮮度警告の日数（デフォルト: 30） */
  freshnessWarningDays?: number;
  /** インデックスファイル名（デフォルト: .shikigami-index.json） */
  indexFileName?: string;
}

// ============================================================
// v1.7.0: PDF解析設定 (REQ-PARSE-001)
// ============================================================

/**
 * PDF解析設定 (v1.7.0)
 * REQ-PARSE-001: PDFコンテンツ抽出
 */
export interface PdfParsingConfig {
  /** PDF解析を有効にするか */
  enabled: boolean;
  /** 最大ファイルサイズ（バイト、デフォルト: 10MB） */
  maxFileSizeBytes?: number;
  /** 最大ページ数（デフォルト: 50） */
  maxPages?: number;
  /** 解析タイムアウト（ms）（デフォルト: 60000） */
  timeoutMs?: number;
  /** 一時ファイル保存ディレクトリ */
  tempDir?: string;
}

/**
 * SHIKIGAMI 設定全体
 */
export interface ShikigamiConfig {
  /** 設定ファイルバージョン */
  version: '1.0';

  /** 検索設定（v1.5.0: 複数プロバイダー対応） */
  search?: SearchConfig | SearchProviderConfig;

  /** ページ取得プロバイダー設定 */
  pageFetcher?: PageFetcherConfig;

  /** LLM プロバイダー設定 */
  llm?: LLMProviderConfig;

  /** Embedding プロバイダー設定 */
  embedding?: EmbeddingProviderConfig;

  /** キャッシュ設定 */
  cache?: CacheConfig;

  /** ログ設定 */
  log?: LogConfig;

  // v1.7.0: 新機能設定
  /** 検索リカバリー設定 (v1.7.0) */
  searchRecovery?: SearchRecoveryConfig;

  /** ナレッジ連携設定 (v1.7.0) */
  knowledgeDiscovery?: KnowledgeDiscoveryConfig;

  /** PDF解析設定 (v1.7.0) */
  pdfParsing?: PdfParsingConfig;

  // v1.8.0: 新機能設定
  /** 多言語並列検索設定 (v1.8.0) */
  multilingualSearch?: MultilingualSearchConfig;

  /** ナレッジ継承設定 (v1.8.0) */
  knowledgeInheritance?: KnowledgeInheritanceConfig;

  /** ページ訪問リカバリー設定 (v1.10.0) */
  visitRecovery?: VisitRecoveryConfig;

  // v1.15.0: 新機能設定
  /** v1.15.0 機能設定 (REQ-SHIKIGAMI-015) */
  v1_15_features?: V115FeaturesConfig;

  // v1.51.0: マルチポップ設定
  /** マルチポップ（多段階分岐探索）設定 (v1.51.0, REQ-SHIKIGAMI-017) */
  multiPop?: {
    /** 有効/無効（デフォルト: true） */
    enabled?: boolean;
    /** 分岐点あたりの最大ブランチ数（デフォルト: 3） */
    maxBranches?: number;
    /** 各ブランチの最大ラウンド数（デフォルト: 3） */
    branchRounds?: number;
    /** 最大分岐深度（デフォルト: 2） */
    maxDepth?: number;
    /** 総ラウンド予算（デフォルト: 20） */
    maxTotalRounds?: number;
    /** マージ候補とするスコア差（デフォルト: 0.1） */
    mergeThreshold?: number;
    /** ブランチ打ち切りスコア閾値（デフォルト: 0.3） */
    pruneThreshold?: number;
    /** 評価重み設定 */
    evaluation?: {
      weights?: {
        confidence?: number;
        information?: number;
        novelty?: number;
        relevance?: number;
        potential?: number;
      };
    };
  };

  /** カスタム設定（拡張用） */
  custom?: Record<string, unknown>;
}

/**
 * 検索設定がv1.5.0形式かどうかを判定
 */
export function isSearchConfig(config: SearchConfig | SearchProviderConfig | undefined): config is SearchConfig {
  return config !== undefined && 'providers' in config && Array.isArray(config.providers);
}

/**
 * 検索設定がv1.4.0以前の形式かどうかを判定
 */
export function isLegacySearchConfig(config: SearchConfig | SearchProviderConfig | undefined): config is SearchProviderConfig {
  return config !== undefined && 'provider' in config && typeof config.provider === 'string';
}

/**
 * デフォルト設定
 */
export const DEFAULT_CONFIG: ShikigamiConfig = {
  version: '1.0',
  search: {
    providers: [
      {
        name: 'duckduckgo',
        priority: 1,
        enabled: true,
        options: {
          maxRetries: 2,
          rateLimitMs: 1500,
        },
      },
    ],
    fallback: {
      enabled: true,
      maxRetries: 2,
    },
    options: {
      timeout: 30000,
      rateLimitMs: 1500,
    },
  },
  pageFetcher: {
    provider: 'jina',
    options: {
      rateLimitMs: 1000,
      timeout: 30000,
      format: 'markdown',
    },
  },
  cache: {
    enabled: true,
    ttlSeconds: 3600,
    maxSize: 1000,
    storage: 'memory',
  },
  log: {
    level: 'info',
    output: 'stderr',
  },
};

// ============================================================
// v1.7.0: デフォルト設定定数
// ============================================================

/**
 * デフォルト検索リカバリー設定
 */
export const DEFAULT_SEARCH_RECOVERY_CONFIG: Required<Omit<SearchRecoveryConfig, 'strategies'>> & Pick<SearchRecoveryConfig, 'strategies'> = {
  enabled: true,
  maxRetries: 3,
  timeoutMs: 30000,
  strategies: {
    synonym: { enabled: true },
    simplify: { enabled: true, maxWords: 3 },
    translate: { enabled: true },
  },
};

/**
 * デフォルトナレッジ連携設定
 */
export const DEFAULT_KNOWLEDGE_DISCOVERY_CONFIG: Required<KnowledgeDiscoveryConfig> = {
  enabled: true,
  searchPath: 'projects/',
  similarityThreshold: 0.3,
  maxResults: 5,
  freshnessWarningDays: 30,
  indexFileName: '.shikigami-index.json',
};

/**
 * デフォルトPDF解析設定
 */
export const DEFAULT_PDF_PARSING_CONFIG: Required<PdfParsingConfig> = {
  enabled: true,
  maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
  maxPages: 50,
  timeoutMs: 60000,
  tempDir: '/tmp/shikigami-pdf',
};

// ============================================================
// v1.8.0: 多言語並列検索設定 (REQ-SRCH-004)
// ============================================================

/**
 * 多言語並列検索設定 (v1.8.0)
 * REQ-SRCH-004: 多言語並列検索
 */
export interface MultilingualSearchConfig {
  /** 多言語検索を有効にするか */
  enabled: boolean;
  /** 優先言語（結果マージ時の優先順位） */
  priorityLanguage?: 'ja' | 'en';
  /** 言語別最大結果数 */
  maxResults?: number;
  /** 検索タイムアウト（ms） */
  timeoutMs?: number;
  /** カスタム翻訳辞書（v1.7.0辞書に追加） */
  customDictionary?: Record<string, string>;
}

/**
 * デフォルト多言語検索設定
 */
export const DEFAULT_MULTILINGUAL_SEARCH_CONFIG: Required<MultilingualSearchConfig> = {
  enabled: true,
  priorityLanguage: 'ja',
  maxResults: 20,
  timeoutMs: 10000,
  customDictionary: {},
};

// ============================================================
// v1.8.0: ナレッジ継承設定 (REQ-KM-004)
// ============================================================

/**
 * ナレッジ継承設定 (v1.8.0)
 * REQ-KM-004: ナレッジ継承の自動実行
 */
export interface KnowledgeInheritanceConfig {
  /** ナレッジ継承を有効にするか */
  enabled: boolean;
  /** 鮮度閾値（日数、これを超えるとSTALE警告） */
  freshnessThresholdDays?: number;
  /** 関連プロジェクト自動検出を有効にするか */
  autoDetectRelated?: boolean;
  /** 継承対象ファイルパターン */
  includePatterns?: string[];
  /** 継承除外ファイルパターン */
  excludePatterns?: string[];
}

/**
 * デフォルトナレッジ継承設定
 */
export const DEFAULT_KNOWLEDGE_INHERITANCE_CONFIG: Required<KnowledgeInheritanceConfig> = {
  enabled: true,
  freshnessThresholdDays: 30,
  autoDetectRelated: true,
  includePatterns: ['research/**/*.md', 'reports/**/*.md'],
  excludePatterns: ['**/draft-*.md', '**/temp-*.md'],
};

// ============================================================
// v1.10.0: ページ訪問リカバリー設定 (REQ-SRCH-004)
// ============================================================

/**
 * ページ訪問リカバリー設定 (v1.10.0)
 * REQ-SRCH-004-01: visit失敗時フォールバック
 * REQ-SRCH-004-02: 自動リトライ
 */
export interface VisitRecoveryConfig {
  /** リカバリーを有効にするか */
  enabled: boolean;
  /** 最大リトライ回数 */
  maxRetries?: number;
  /** リトライ間隔（ms） */
  retryDelayMs?: number;
  /** タイムアウト（ms） */
  timeoutMs?: number;
  /** Wayback Machine を使用するか */
  enableWayback?: boolean;
}

/**
 * デフォルトページ訪問リカバリー設定
 */
export const DEFAULT_VISIT_RECOVERY_CONFIG: Required<VisitRecoveryConfig> = {
  enabled: true,
  maxRetries: 2,
  retryDelayMs: 1000,
  timeoutMs: 30000,
  enableWayback: true,
};

// ============================================================
// v1.15.0: 新機能設定 (REQ-SHIKIGAMI-015)
// ============================================================

/**
 * ドメイン辞書設定 (v1.15.0)
 * REQ-DICT-001: 専門用語辞書・同義語展開
 */
export interface DomainDictionaryConfig {
  /** 機能を有効にするか */
  enabled: boolean;
  /** 対象ドメインリスト */
  domains?: ('it' | 'business' | 'finance' | 'legal' | 'healthcare')[];
  /** 多言語展開を有効にするか */
  multilingualExpansion?: boolean;
  /** カスタム辞書パス */
  customPath?: string;
}

/**
 * 特許検索設定 (v1.15.0)
 * REQ-PATENT-001: 特許DB検索最適化モード
 */
export interface PatentSearchConfig {
  /** 機能を有効にするか */
  enabled: boolean;
  /** デフォルトデータベース */
  defaultDatabase?: 'J-PlatPat' | 'Google Patents' | 'USPTO' | 'EPO';
  /** カスタムIPCマッピングパス */
  ipcMappingPath?: string;
  /** 分類コード自動推定 */
  autoClassification?: boolean;
  /** 同義語展開 */
  synonymExpansion?: boolean;
}

/**
 * 代替ソース設定 (v1.15.0)
 * REQ-ALT-001: ドメイン別代替ソース自動提案
 */
export interface AlternativeSourcesConfig {
  /** 機能を有効にするか */
  enabled: boolean;
  /** 最大提案数 */
  maxSuggestions?: number;
  /** 最大結果数 */
  maxResults?: number;
  /** カスタム代替ソースパス */
  customPath?: string;
}

/**
 * 構造化データ抽出設定 (v1.15.0)
 * REQ-EXT-001: 構造化データ抽出パイプライン
 */
export interface StructuredExtractionConfig {
  /** 機能を有効にするか */
  enabled: boolean;
  /** 画像抽出を有効にするか */
  extractImages?: boolean;
  /** テーブル抽出を有効にするか */
  extractTables?: boolean;
  /** 出力形式 */
  outputFormat?: 'json' | 'markdown' | 'both';
}

/**
 * ペイウォール検知設定 (v1.15.0)
 * REQ-PAY-001: ペイウォール検知機能
 */
export interface PaywallDetectionConfig {
  /** 機能を有効にするか */
  enabled: boolean;
  /** 代替アクセス提案を有効にするか */
  suggestAlternatives?: boolean;
}

/**
 * ケーススタディ抽出設定 (v1.15.0)
 * REQ-CASE-001: ケーススタディ構造化抽出
 */
export interface CaseStudyExtractorConfig {
  /** 機能を有効にするか */
  enabled: boolean;
  /** 最小信頼度閾値 (0-1) */
  minConfidence?: number;
}

/**
 * スキル・給与データ抽出設定 (v1.15.0)
 * REQ-SKILL-001: スキルマッピング・給与データ抽出
 */
export interface SkillSalaryExtractorConfig {
  /** 機能を有効にするか */
  enabled: boolean;
  /** 対象通貨 */
  currencies?: ('JPY' | 'USD' | 'EUR')[];
}

/**
 * 複合フレームワーク設定 (v1.15.0)
 * REQ-FW-003: 複合フレームワーク統合テンプレート
 */
export interface CompositeFrameworkConfig {
  /** 機能を有効にするか */
  enabled: boolean;
  /** 自動発動閾値（推薦フレームワーク数） */
  autoTriggerThreshold?: number;
  /** カスタムテンプレートパス */
  customPath?: string;
}

/**
 * 地政学リスク分析設定 (v1.15.0)
 * REQ-GEO-001: 地政学リスク分析フレームワーク
 */
export interface GeopoliticalRiskConfig {
  /** 機能を有効にするか */
  enabled: boolean;
  /** デフォルト対象地域 */
  defaultRegions?: string[];
}

/**
 * シナリオ分析設定 (v1.15.0)
 * REQ-SCEN-001: シナリオ分析テンプレート
 */
export interface ScenarioAnalysisConfig {
  /** 機能を有効にするか */
  enabled: boolean;
  /** デフォルト時間軸 */
  defaultTimeframes?: number[];
}

/**
 * チェックリスト生成設定 (v1.15.0)
 * REQ-CHECK-001: チェックリスト自動生成
 */
export interface ChecklistGenerationConfig {
  /** 機能を有効にするか */
  enabled: boolean;
  /** デフォルトタイプ */
  defaultTypes?: ('dd' | 'verification' | 'evaluation' | 'audit' | 'implementation')[];
}

/**
 * サプライチェーン可視化設定 (v1.15.0)
 * REQ-SUPPLY-001: サプライチェーン可視化
 */
export interface SupplyChainVisualizationConfig {
  /** 機能を有効にするか */
  enabled: boolean;
  /** 最大ティア数 */
  maxTiers?: number;
}

/**
 * v1.15.0 機能設定
 * REQ-SHIKIGAMI-015: v1.15.0新機能統合設定
 */
export interface V115FeaturesConfig {
  /** ドメイン辞書 (REQ-DICT-001) */
  domainDictionary?: DomainDictionaryConfig;
  /** 特許検索 (REQ-PATENT-001) */
  patentSearch?: PatentSearchConfig;
  /** 代替ソース (REQ-ALT-001) */
  alternativeSources?: AlternativeSourcesConfig;
  /** 構造化データ抽出 (REQ-EXT-001) */
  structuredExtraction?: StructuredExtractionConfig;
  /** ペイウォール検知 (REQ-PAY-001) */
  paywallDetection?: PaywallDetectionConfig;
  /** ケーススタディ抽出 (REQ-CASE-001) */
  caseStudyExtractor?: CaseStudyExtractorConfig;
  /** スキル・給与抽出 (REQ-SKILL-001) */
  skillSalaryExtractor?: SkillSalaryExtractorConfig;
  /** 複合フレームワーク (REQ-FW-003) */
  compositeFramework?: CompositeFrameworkConfig;
  /** 地政学リスク (REQ-GEO-001) */
  geopoliticalRisk?: GeopoliticalRiskConfig;
  /** シナリオ分析 (REQ-SCEN-001) */
  scenarioAnalysis?: ScenarioAnalysisConfig;
  /** チェックリスト生成 (REQ-CHECK-001) */
  checklistGeneration?: ChecklistGenerationConfig;
  /** サプライチェーン可視化 (REQ-SUPPLY-001) */
  supplyChainVisualization?: SupplyChainVisualizationConfig;
}

/**
 * デフォルトv1.15.0機能設定
 */
export const DEFAULT_V115_FEATURES_CONFIG: Required<V115FeaturesConfig> = {
  domainDictionary: {
    enabled: true,
    domains: ['it', 'business', 'finance', 'legal', 'healthcare'],
    multilingualExpansion: true,
  },
  patentSearch: {
    enabled: true,
    defaultDatabase: 'J-PlatPat',
    autoClassification: true,
    synonymExpansion: true,
  },
  alternativeSources: {
    enabled: true,
    maxSuggestions: 3,
    maxResults: 5,
  },
  structuredExtraction: {
    enabled: true,
    extractImages: true,
    extractTables: true,
    outputFormat: 'json',
  },
  paywallDetection: {
    enabled: true,
    suggestAlternatives: true,
  },
  caseStudyExtractor: {
    enabled: true,
    minConfidence: 0.7,
  },
  skillSalaryExtractor: {
    enabled: true,
    currencies: ['JPY', 'USD'],
  },
  compositeFramework: {
    enabled: true,
    autoTriggerThreshold: 2,
  },
  geopoliticalRisk: {
    enabled: true,
    defaultRegions: ['china', 'us', 'eu', 'russia'],
  },
  scenarioAnalysis: {
    enabled: true,
    defaultTimeframes: [2025, 2030],
  },
  checklistGeneration: {
    enabled: true,
    defaultTypes: ['dd', 'verification', 'evaluation'],
  },
  supplyChainVisualization: {
    enabled: true,
    maxTiers: 3,
  },
};
