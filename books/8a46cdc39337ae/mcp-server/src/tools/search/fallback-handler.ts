/**
 * Search Fallback Handler
 * 
 * REQ-SRCH-001: 検索フォールバック機構
 * プライマリプロバイダー失敗時に次のプロバイダーへフォールバック
 */

import type { SearchFallbackConfig } from '../../config/types.js';
import type {
  SearchProvider,
  SearchResult,
  SearchAttemptResult,
  SearchWithFallbackResult,
} from './providers/types.js';
import { SearchProviderManager } from './provider-manager.js';

/**
 * フォールバックハンドラー
 */
export class FallbackHandler {
  constructor(
    private manager: SearchProviderManager,
    private config: SearchFallbackConfig
  ) {}
  
  /**
   * フォールバック付きで検索を実行
   */
  async searchWithFallback(
    query: string,
    maxResults: number = 10
  ): Promise<SearchWithFallbackResult> {
    // フォールバックが無効な場合は最初のプロバイダーのみ使用
    if (!this.config.enabled) {
      const providers = this.manager.getProvidersByPriority();
      if (providers.length === 0) {
        return {
          success: false,
          results: [],
          usedProvider: null,
          attempts: [],
          error: 'No search providers configured',
        };
      }
      
      const attempt = await this.tryProvider(providers[0], query, maxResults);
      return {
        success: attempt.success,
        results: attempt.results,
        usedProvider: attempt.success ? providers[0].name : null,
        attempts: [attempt],
        error: attempt.success ? undefined : attempt.error,
      };
    }
    
    // フォールバック有効時は全プロバイダーを順番に試行
    const providers = await this.manager.getAvailableProviders();
    
    if (providers.length === 0) {
      return {
        success: false,
        results: [],
        usedProvider: null,
        attempts: [],
        error: 'No available search providers',
      };
    }
    
    const attempts: SearchAttemptResult[] = [];
    
    for (const provider of providers) {
      const attempt = await this.tryProvider(provider, query, maxResults);
      attempts.push(attempt);
      
      if (attempt.success && attempt.results.length > 0) {
        console.error(`[SHIKIGAMI] Search succeeded with provider: ${provider.name}`);
        return {
          success: true,
          results: attempt.results,
          usedProvider: provider.name,
          attempts,
        };
      }
      
      console.error(`[SHIKIGAMI] Provider ${provider.name} failed, trying next...`);
    }
    
    // 全プロバイダー失敗
    console.error(`[SHIKIGAMI] All ${providers.length} providers failed for query: "${query}"`);
    return {
      success: false,
      results: [],
      usedProvider: null,
      attempts,
      error: `All ${providers.length} search providers failed. Tried: ${
        attempts.map(a => a.provider).join(', ')
      }`,
    };
  }
  
  /**
   * 単一プロバイダーで検索を試行
   */
  private async tryProvider(
    provider: SearchProvider,
    query: string,
    maxResults: number
  ): Promise<SearchAttemptResult> {
    const startTime = Date.now();
    
    try {
      const results = await provider.search(query, maxResults);
      
      return {
        provider: provider.name,
        success: true,
        results,
        durationMs: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        provider: provider.name,
        success: false,
        results: [],
        error: errorMessage,
        durationMs: Date.now() - startTime,
      };
    }
  }
}
