/**
 * SHIKIGAMI Configuration Loader
 *
 * REQ-NF-007: プロバイダー設定ファイル対応
 * REQ-SHIKIGAMI-015: v1.15.0機能設定対応
 * shikigami.config.yaml を読み込み、設定をマージ
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { ShikigamiConfig, DEFAULT_CONFIG, DEFAULT_V115_FEATURES_CONFIG, V115FeaturesConfig } from './types.js';

/** 設定ファイル名（優先順） */
const CONFIG_FILENAMES = [
  'shikigami.config.yaml',
  'shikigami.config.yml',
  '.shikigami.yaml',
  '.shikigami.yml',
];

/**
 * 設定ファイルのパスを探索
 * @param searchPaths 探索するディレクトリパス（デフォルト: カレント、ホーム）
 * @returns 見つかった設定ファイルパス、または null
 */
export function findConfigFile(searchPaths?: string[]): string | null {
  const paths = searchPaths ?? [
    process.cwd(),
    process.env.HOME ?? '',
  ].filter(Boolean);

  for (const dir of paths) {
    for (const filename of CONFIG_FILENAMES) {
      const filePath = path.join(dir, filename);
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }
  }

  return null;
}

/**
 * 深いマージを行う（配列は置換）
 */
function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target } as T;

  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue !== null &&
      sourceValue !== undefined &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      targetValue !== undefined &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      // 両方がオブジェクトの場合、再帰マージ
      result[key] = deepMerge(
        targetValue as object,
        sourceValue as object
      ) as T[keyof T];
    } else if (sourceValue !== undefined) {
      // それ以外は置換
      result[key] = sourceValue as T[keyof T];
    }
  }

  return result;
}

/**
 * YAML ファイルから設定を読み込み
 * @param filePath 設定ファイルパス
 * @returns パースされた設定
 */
export function loadConfigFile(filePath: string): Partial<ShikigamiConfig> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed = yaml.parse(content);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Invalid config file: ${filePath}`);
  }

  return parsed as Partial<ShikigamiConfig>;
}

/**
 * 環境変数から設定を上書き
 * SHIKIGAMI_* 形式の環境変数を読み込み
 */
export function loadEnvOverrides(): Partial<ShikigamiConfig> {
  const overrides: Partial<ShikigamiConfig> = {};

  // 検索プロバイダー（レガシー形式で設定）
  if (process.env.SHIKIGAMI_SEARCH_PROVIDER) {
    const provider = process.env.SHIKIGAMI_SEARCH_PROVIDER as 'duckduckgo' | 'google' | 'bing' | 'tavily';
    overrides.search = {
      provider,
    };
  }

  // 検索 API キー（レガシー形式で設定）
  if (process.env.SHIKIGAMI_SEARCH_API_KEY) {
    const existingSearch = overrides.search as { provider?: string; options?: Record<string, unknown> } | undefined;
    overrides.search = {
      ...existingSearch,
      provider: (existingSearch?.provider ?? 'duckduckgo') as 'duckduckgo' | 'google' | 'bing' | 'tavily',
      options: {
        ...existingSearch?.options,
        apiKey: process.env.SHIKIGAMI_SEARCH_API_KEY,
      },
    };
  }

  // ページ取得プロバイダー
  if (process.env.SHIKIGAMI_PAGE_FETCHER_PROVIDER) {
    overrides.pageFetcher = {
      provider: process.env.SHIKIGAMI_PAGE_FETCHER_PROVIDER as 'jina' | 'firecrawl' | 'browserbase',
    };
  }

  // Jina API キー
  if (process.env.JINA_API_KEY || process.env.SHIKIGAMI_JINA_API_KEY) {
    overrides.pageFetcher = {
      ...overrides.pageFetcher,
      provider: overrides.pageFetcher?.provider ?? 'jina',
      options: {
        ...overrides.pageFetcher?.options,
        apiKey: process.env.JINA_API_KEY || process.env.SHIKIGAMI_JINA_API_KEY,
      },
    };
  }

  // LLM プロバイダー
  if (process.env.SHIKIGAMI_LLM_PROVIDER) {
    overrides.llm = {
      provider: process.env.SHIKIGAMI_LLM_PROVIDER as 'ollama' | 'openai' | 'anthropic' | 'azure-openai',
      model: process.env.SHIKIGAMI_LLM_MODEL ?? 'default',
    };
  }

  // OpenAI API キー
  if (process.env.OPENAI_API_KEY || process.env.SHIKIGAMI_OPENAI_API_KEY) {
    overrides.llm = {
      ...overrides.llm,
      provider: overrides.llm?.provider ?? 'openai',
      model: overrides.llm?.model ?? 'gpt-4o-mini',
      options: {
        ...overrides.llm?.options,
        apiKey: process.env.OPENAI_API_KEY || process.env.SHIKIGAMI_OPENAI_API_KEY,
      },
    };
  }

  // Ollama エンドポイント
  if (process.env.OLLAMA_HOST || process.env.SHIKIGAMI_OLLAMA_ENDPOINT) {
    overrides.llm = {
      ...overrides.llm,
      provider: 'ollama',
      model: overrides.llm?.model ?? 'llama3.2',
      options: {
        ...overrides.llm?.options,
        endpoint: process.env.OLLAMA_HOST || process.env.SHIKIGAMI_OLLAMA_ENDPOINT,
      },
    };
  }

  // Embedding プロバイダー
  if (process.env.SHIKIGAMI_EMBEDDING_PROVIDER) {
    overrides.embedding = {
      provider: process.env.SHIKIGAMI_EMBEDDING_PROVIDER as 'ollama' | 'openai' | 'huggingface',
      model: process.env.SHIKIGAMI_EMBEDDING_MODEL ?? 'default',
    };
  }

  // ログレベル
  if (process.env.SHIKIGAMI_LOG_LEVEL) {
    overrides.log = {
      level: process.env.SHIKIGAMI_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error',
    };
  }

  return overrides;
}

/**
 * 設定を読み込む（ファイル + 環境変数）
 * 優先順位: 環境変数 > 設定ファイル > デフォルト
 *
 * @param configPath 明示的な設定ファイルパス（省略時は自動探索）
 * @returns マージされた設定
 */
export function loadConfig(configPath?: string): ShikigamiConfig {
  let fileConfig: Partial<ShikigamiConfig> = {};

  // 設定ファイルを探索・読み込み
  const foundPath = configPath ?? findConfigFile();
  if (foundPath) {
    try {
      fileConfig = loadConfigFile(foundPath);
      console.error(`[SHIKIGAMI] Loaded config from: ${foundPath}`);
    } catch (error) {
      console.error(`[SHIKIGAMI] Failed to load config: ${error}`);
    }
  }

  // 環境変数の上書きを取得
  const envOverrides = loadEnvOverrides();

  // マージ: デフォルト < ファイル < 環境変数
  const merged = deepMerge(
    deepMerge(DEFAULT_CONFIG, fileConfig),
    envOverrides
  );

  // v1.15.0: v1_15_features のデフォルト適用
  merged.v1_15_features = mergeV115Features(
    fileConfig.v1_15_features,
    envOverrides.v1_15_features
  );

  return merged;
}

/**
 * v1.15.0 機能設定をマージ
 * 設定ファイルと環境変数の値をデフォルトにマージ
 */
function mergeV115Features(
  fileConfig?: Partial<V115FeaturesConfig>,
  envOverrides?: Partial<V115FeaturesConfig>
): V115FeaturesConfig {
  // デフォルト値をベースに、ファイル設定、環境変数の順でマージ
  const base = { ...DEFAULT_V115_FEATURES_CONFIG };
  
  if (fileConfig) {
    for (const key of Object.keys(fileConfig) as Array<keyof V115FeaturesConfig>) {
      if (fileConfig[key] !== undefined) {
        base[key] = { ...base[key], ...fileConfig[key] } as any;
      }
    }
  }
  
  if (envOverrides) {
    for (const key of Object.keys(envOverrides) as Array<keyof V115FeaturesConfig>) {
      if (envOverrides[key] !== undefined) {
        base[key] = { ...base[key], ...envOverrides[key] } as any;
      }
    }
  }
  
  return base;
}

/** グローバル設定インスタンス（遅延初期化） */
let _config: ShikigamiConfig | null = null;

/**
 * グローバル設定を取得
 * 初回呼び出し時に設定をロード
 */
export function getConfig(): ShikigamiConfig {
  if (!_config) {
    _config = loadConfig();
  }
  return _config;
}

/**
 * グローバル設定をリセット（テスト用）
 */
export function resetConfig(): void {
  _config = null;
}

/**
 * v1.15.0 機能設定を取得
 * デフォルト値が適用された完全な設定を返す
 */
export function getV115FeaturesConfig(): V115FeaturesConfig {
  const config = getConfig();
  return config.v1_15_features ?? DEFAULT_V115_FEATURES_CONFIG;
}

/**
 * 特定のv1.15.0機能が有効かどうかを判定
 */
export function isV115FeatureEnabled(
  feature: keyof V115FeaturesConfig
): boolean {
  const features = getV115FeaturesConfig();
  const featureConfig = features[feature];
  return featureConfig?.enabled ?? false;
}

// 型のエクスポート
export * from './types.js';
