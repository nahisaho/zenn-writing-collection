/**
 * Semantic Cache Matcher
 * v1.0.0 - REQ-CACHE-001-02
 *
 * 意味的に類似したクエリのキャッシュマッチングを行う
 * 埋め込みベクトルとコサイン類似度を使用
 */

import { CacheEntry, CacheSource, CacheQueryOptions } from './types.js';
import { FileCacheStore } from './store.js';

/**
 * 埋め込みベクトル
 */
export type EmbeddingVector = number[];

/**
 * クエリ埋め込みエントリ
 */
export interface QueryEmbedding {
  /** 元のクエリ文字列 */
  query: string;
  /** 埋め込みベクトル */
  embedding: EmbeddingVector;
  /** キャッシュキー */
  cacheKey: string;
  /** 作成日時 */
  createdAt: string;
  /** ソース種別 */
  source: CacheSource;
}

/**
 * 類似クエリ候補
 */
export interface SimilarQueryCandidate {
  /** 類似したクエリのキャッシュキー */
  cacheKey: string;
  /** 元のクエリ */
  originalQuery: string;
  /** 類似度スコア (0-1) */
  similarity: number;
  /** 作成日時 */
  createdAt: string;
}

/**
 * SemanticCacheMatcher設定
 */
export interface SemanticCacheConfig {
  /** 類似度の閾値 (0-1, デフォルト: 0.90) */
  similarityThreshold: number;
  /** 最大類似クエリ数 */
  maxCandidates: number;
  /** 埋め込みキャッシュの有効化 */
  enabled: boolean;
  /** 埋め込みモデル名 */
  embeddingModel: string;
  /** 埋め込み次元数 */
  embeddingDimension: number;
}

/**
 * デフォルト設定
 */
export const DEFAULT_SEMANTIC_CONFIG: SemanticCacheConfig = {
  similarityThreshold: 0.90,
  maxCandidates: 5,
  enabled: true,
  embeddingModel: 'default',
  embeddingDimension: 1536,
};

/**
 * 埋め込みサービスインターフェース
 */
export interface IEmbeddingService {
  /** テキストから埋め込みベクトルを生成 */
  embed(text: string): Promise<EmbeddingVector>;
  /** 複数テキストの埋め込みベクトルをバッチ生成 */
  embedBatch?(texts: string[]): Promise<EmbeddingVector[]>;
  /** モデル名を取得 */
  getModelName(): string;
  /** 次元数を取得 */
  getDimension(): number;
}

/**
 * シンプルな埋め込みサービス（テスト/フォールバック用）
 * 実運用では外部APIを使用
 */
export class SimpleEmbeddingService implements IEmbeddingService {
  private dimension: number;
  private modelName: string;

  constructor(dimension = 64, modelName = 'simple-hash') {
    this.dimension = dimension;
    this.modelName = modelName;
  }

  /**
   * 簡易埋め込み生成（ハッシュベース）
   * 実運用では OpenAI, Anthropic 等の API を使用
   */
  async embed(text: string): Promise<EmbeddingVector> {
    const normalized = text.toLowerCase().trim();
    const vector: number[] = new Array(this.dimension).fill(0);

    // シンプルなハッシュベースの埋め込み
    for (let i = 0; i < normalized.length; i++) {
      const charCode = normalized.charCodeAt(i);
      const idx = (charCode * (i + 1)) % this.dimension;
      vector[idx] += charCode / 127; // normalize to ~1
    }

    // 正規化
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vector.map((v) => v / magnitude);
  }

  async embedBatch(texts: string[]): Promise<EmbeddingVector[]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }

  getModelName(): string {
    return this.modelName;
  }

  getDimension(): number {
    return this.dimension;
  }
}

/**
 * コサイン類似度を計算
 */
export function cosineSimilarity(a: EmbeddingVector, b: EmbeddingVector): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * SemanticCacheMatcher
 * 意味的に類似したクエリのキャッシュマッチングを行う
 */
export class SemanticCacheMatcher {
  private config: SemanticCacheConfig;
  private embeddingService: IEmbeddingService;
  private cacheStore: FileCacheStore;

  /** 埋め込みインデックス（メモリ上） */
  private embeddingIndex: Map<string, QueryEmbedding> = new Map();

  constructor(
    cacheStore: FileCacheStore,
    config: Partial<SemanticCacheConfig> = {},
    embeddingService?: IEmbeddingService
  ) {
    this.config = { ...DEFAULT_SEMANTIC_CONFIG, ...config };
    this.cacheStore = cacheStore;
    this.embeddingService =
      embeddingService || new SimpleEmbeddingService(this.config.embeddingDimension);
  }

  /**
   * クエリの埋め込みを生成し、インデックスに追加
   */
  async indexQuery(query: string, cacheKey: string, source: CacheSource): Promise<void> {
    if (!this.config.enabled) return;

    const embedding = await this.embeddingService.embed(query);

    const entry: QueryEmbedding = {
      query,
      embedding,
      cacheKey,
      source,
      createdAt: new Date().toISOString(),
    };

    this.embeddingIndex.set(cacheKey, entry);

    // 埋め込みもキャッシュストアに保存（永続化）
    await this.cacheStore.set(`embedding:${cacheKey}`, entry, {
      source: 'embedding',
      ttlSeconds: 3600 * 24, // 24時間
    });
  }

  /**
   * 類似クエリを検索
   */
  async findSimilar(query: string, source?: CacheSource): Promise<SimilarQueryCandidate[]> {
    if (!this.config.enabled) return [];

    const queryEmbedding = await this.embeddingService.embed(query);
    const candidates: SimilarQueryCandidate[] = [];

    // メモリインデックスから検索
    for (const [_key, entry] of this.embeddingIndex) {
      // ソースフィルタ
      if (source && entry.source !== source) continue;

      const similarity = cosineSimilarity(queryEmbedding, entry.embedding);

      if (similarity >= this.config.similarityThreshold) {
        candidates.push({
          cacheKey: entry.cacheKey,
          originalQuery: entry.query,
          similarity,
          createdAt: entry.createdAt,
        });
      }
    }

    // 類似度でソートして上位を返す
    return candidates
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, this.config.maxCandidates);
  }

  /**
   * 最も類似したキャッシュエントリを取得
   */
  async getBestMatch<T = unknown>(
    query: string,
    source?: CacheSource
  ): Promise<{ entry: CacheEntry<T>; similarity: number } | null> {
    const candidates = await this.findSimilar(query, source);

    if (candidates.length === 0) {
      return null;
    }

    const best = candidates[0];
    const result = await this.cacheStore.get<T>(best.cacheKey);

    if (result.hit && result.value !== undefined) {
      return {
        entry: {
          key: best.cacheKey,
          value: result.value,
          meta: result.meta!,
        },
        similarity: best.similarity,
      };
    }

    return null;
  }

  /**
   * 埋め込みインデックスからエントリを削除
   */
  removeFromIndex(cacheKey: string): void {
    this.embeddingIndex.delete(cacheKey);
  }

  /**
   * インデックスをクリア
   */
  clearIndex(): void {
    this.embeddingIndex.clear();
  }

  /**
   * 永続化されたインデックスをロード
   */
  async loadIndex(): Promise<number> {
    const entries = await this.cacheStore.query({
      source: 'embedding',
      limit: 10000,
    });

    let loadedCount = 0;

    for (const entry of entries) {
      const queryEmbedding = entry.value as QueryEmbedding;
      if (queryEmbedding.cacheKey && queryEmbedding.embedding) {
        this.embeddingIndex.set(queryEmbedding.cacheKey, queryEmbedding);
        loadedCount++;
      }
    }

    return loadedCount;
  }

  /**
   * インデックスサイズを取得
   */
  getIndexSize(): number {
    return this.embeddingIndex.size;
  }

  /**
   * 設定を取得
   */
  getConfig(): SemanticCacheConfig {
    return { ...this.config };
  }

  /**
   * 類似度閾値を更新
   */
  setSimilarityThreshold(threshold: number): void {
    if (threshold < 0 || threshold > 1) {
      throw new Error('Threshold must be between 0 and 1');
    }
    this.config.similarityThreshold = threshold;
  }

  /**
   * 有効/無効を切り替え
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * 統計情報を取得
   */
  getStats(): {
    indexSize: number;
    threshold: number;
    enabled: boolean;
    model: string;
    dimension: number;
  } {
    return {
      indexSize: this.embeddingIndex.size,
      threshold: this.config.similarityThreshold,
      enabled: this.config.enabled,
      model: this.embeddingService.getModelName(),
      dimension: this.embeddingService.getDimension(),
    };
  }
}

/**
 * デフォルトインスタンス作成関数
 */
export function createSemanticCacheMatcher(
  cacheStore: FileCacheStore,
  config?: Partial<SemanticCacheConfig>,
  embeddingService?: IEmbeddingService
): SemanticCacheMatcher {
  return new SemanticCacheMatcher(cacheStore, config, embeddingService);
}
