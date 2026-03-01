/**
 * Search Provider Manager
 * 
 * REQ-SRCH-001: 検索フォールバック機構
 * プロバイダーの初期化と管理を担当
 */

import type { SearchConfig, SingleSearchProviderConfig, SearchProviderConfig, isSearchConfig } from '../../config/types.js';
import type { SearchProvider, ProviderHealthStatus } from './providers/types.js';
import { DuckDuckGoProvider } from './providers/duckduckgo.js';
import { BraveSearchProvider } from './providers/brave.js';
import { SearXNGProvider } from './providers/searxng.js';

/**
 * プロバイダーファクトリー
 */
function createProvider(config: SingleSearchProviderConfig): SearchProvider | null {
  switch (config.name) {
    case 'duckduckgo':
      return new DuckDuckGoProvider(config);
    case 'brave':
      return new BraveSearchProvider(config);
    case 'searxng':
      return new SearXNGProvider(config);
    default:
      console.error(`[SHIKIGAMI] Unknown search provider: ${(config as SingleSearchProviderConfig).name}`);
      return null;
  }
}

/**
 * 検索プロバイダーマネージャー
 */
export class SearchProviderManager {
  private providers: Map<string, SearchProvider> = new Map();
  private sortedProviders: SearchProvider[] = [];
  
  constructor(config: SearchConfig) {
    this.initializeProviders(config);
  }
  
  /**
   * 設定からプロバイダーを初期化
   */
  private initializeProviders(config: SearchConfig): void {
    const providerConfigs = config.providers || [];
    
    for (const providerConfig of providerConfigs) {
      // 無効なプロバイダーはスキップ
      if (providerConfig.enabled === false) {
        console.error(`[SHIKIGAMI] Skipping disabled provider: ${providerConfig.name}`);
        continue;
      }
      
      const provider = createProvider(providerConfig);
      if (provider) {
        this.providers.set(provider.name, provider);
      }
    }
    
    // priority順にソート
    this.sortedProviders = Array.from(this.providers.values())
      .sort((a, b) => a.priority - b.priority);
    
    console.error(`[SHIKIGAMI] Initialized ${this.sortedProviders.length} search providers: ${
      this.sortedProviders.map(p => `${p.name}(${p.priority})`).join(', ')
    }`);
  }
  
  /**
   * priority順でプロバイダーを取得
   */
  getProvidersByPriority(): SearchProvider[] {
    return [...this.sortedProviders];
  }
  
  /**
   * 利用可能なプロバイダーのみを取得
   */
  async getAvailableProviders(): Promise<SearchProvider[]> {
    const available: SearchProvider[] = [];
    
    for (const provider of this.sortedProviders) {
      try {
        if (await provider.isAvailable()) {
          available.push(provider);
        } else {
          console.error(`[SHIKIGAMI] Provider ${provider.name} is not available`);
        }
      } catch (error) {
        console.error(`[SHIKIGAMI] Error checking availability for ${provider.name}:`, error);
      }
    }
    
    return available;
  }
  
  /**
   * 特定のプロバイダーを取得
   */
  getProvider(name: string): SearchProvider | undefined {
    return this.providers.get(name);
  }
  
  /**
   * 全プロバイダーのヘルスステータスを取得
   */
  getAllHealthStatus(): ProviderHealthStatus[] {
    return this.sortedProviders.map(p => p.getHealthStatus());
  }
  
  /**
   * プロバイダー数を取得
   */
  get count(): number {
    return this.providers.size;
  }
}

/**
 * レガシー設定（v1.4.0以前）を新形式に変換
 */
export function convertLegacySearchConfig(config: SearchProviderConfig): SearchConfig {
  return {
    providers: [
      {
        name: config.provider === 'duckduckgo' ? 'duckduckgo' : 'duckduckgo', // 互換性のため
        priority: 1,
        enabled: true,
        apiKey: config.options?.apiKey,
        endpoint: config.options?.endpoint,
        options: {
          timeout: config.options?.timeout,
          maxRetries: config.options?.maxRetries,
          rateLimitMs: config.options?.rateLimitMs,
        },
      },
    ],
    fallback: {
      enabled: false,
      maxRetries: 1,
    },
    options: {
      timeout: config.options?.timeout,
      rateLimitMs: config.options?.rateLimitMs,
      locale: config.options?.locale,
    },
  };
}
