/**
 * Embedding Service
 *
 * Implements REQ-CS-002: セマンティック検索
 *
 * Supports:
 * - Ollama (local, default)
 * - OpenAI Embeddings API
 *
 * Used for semantic search, similarity matching, and context retrieval.
 */

import { getConfig } from '../config/loader.js';

export interface EmbeddingResult {
  /** 入力テキスト */
  text: string;
  /** 埋め込みベクトル */
  embedding: number[];
  /** モデル名 */
  model: string;
  /** ベクトル次元数 */
  dimensions: number;
}

export interface SimilarityResult {
  /** テキストA */
  textA: string;
  /** テキストB */
  textB: string;
  /** コサイン類似度 (0-1) */
  similarity: number;
}

export interface SearchResult {
  /** 検索対象テキスト */
  text: string;
  /** 類似度スコア */
  score: number;
  /** インデックス（元の配列での位置） */
  index: number;
  /** メタデータ（任意） */
  metadata?: Record<string, unknown>;
}

/**
 * コサイン類似度を計算
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}

/**
 * Ollama Embedding API を呼び出し
 */
async function embedWithOllama(
  text: string,
  model: string,
  endpoint: string
): Promise<number[]> {
  const response = await fetch(`${endpoint}/api/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama embedding failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as { embedding: number[] };
  return data.embedding;
}

/**
 * OpenAI Embedding API を呼び出し
 */
async function embedWithOpenAI(
  text: string,
  model: string,
  apiKey: string
): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI embedding failed: ${response.status} ${errorText}`);
  }

  const data = await response.json() as {
    data: Array<{ embedding: number[] }>;
  };

  return data.data[0].embedding;
}

/**
 * テキストの埋め込みベクトルを生成
 */
export async function embed(text: string): Promise<EmbeddingResult> {
  const config = getConfig();
  const embeddingConfig = config.embedding;

  const provider = embeddingConfig?.provider ?? 'ollama';
  const model = embeddingConfig?.model ?? 'nomic-embed-text';

  let embedding: number[];

  switch (provider) {
    case 'ollama': {
      const endpoint = embeddingConfig?.options?.endpoint ?? 'http://localhost:11434';
      embedding = await embedWithOllama(text, model, endpoint);
      break;
    }

    case 'openai': {
      const apiKey = embeddingConfig?.options?.apiKey ?? process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key is required for embedding');
      }
      embedding = await embedWithOpenAI(text, model, apiKey);
      break;
    }

    default:
      throw new Error(`Unsupported embedding provider: ${provider}`);
  }

  return {
    text,
    embedding,
    model,
    dimensions: embedding.length,
  };
}

/**
 * 複数テキストの埋め込みベクトルを生成
 */
export async function embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
  const results: EmbeddingResult[] = [];

  for (const text of texts) {
    const result = await embed(text);
    results.push(result);
  }

  return results;
}

/**
 * 2つのテキストの類似度を計算
 */
export async function similarity(textA: string, textB: string): Promise<SimilarityResult> {
  const [embA, embB] = await Promise.all([embed(textA), embed(textB)]);

  const sim = cosineSimilarity(embA.embedding, embB.embedding);

  return {
    textA,
    textB,
    similarity: sim,
  };
}

/**
 * クエリに最も類似したテキストを検索
 */
export async function semanticSearch(
  query: string,
  documents: Array<{ text: string; metadata?: Record<string, unknown> }>,
  options?: {
    /** 返却する最大件数 */
    topK?: number;
    /** 最小類似度閾値 */
    minScore?: number;
  }
): Promise<SearchResult[]> {
  const topK = options?.topK ?? 5;
  const minScore = options?.minScore ?? 0;

  // クエリの埋め込みを生成
  const queryEmbedding = await embed(query);

  // 各ドキュメントの埋め込みを生成して類似度を計算
  const results: SearchResult[] = [];

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    const docEmbedding = await embed(doc.text);
    const score = cosineSimilarity(queryEmbedding.embedding, docEmbedding.embedding);

    if (score >= minScore) {
      results.push({
        text: doc.text,
        score,
        index: i,
        metadata: doc.metadata,
      });
    }
  }

  // スコア降順でソートしてtopK件を返却
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, topK);
}

/**
 * ベクトルを使った高速セマンティック検索
 * （事前に埋め込みが計算済みの場合）
 */
export function semanticSearchWithVectors(
  queryEmbedding: number[],
  documentEmbeddings: Array<{
    embedding: number[];
    text: string;
    metadata?: Record<string, unknown>;
  }>,
  options?: {
    topK?: number;
    minScore?: number;
  }
): SearchResult[] {
  const topK = options?.topK ?? 5;
  const minScore = options?.minScore ?? 0;

  const results: SearchResult[] = [];

  for (let i = 0; i < documentEmbeddings.length; i++) {
    const doc = documentEmbeddings[i];
    const score = cosineSimilarity(queryEmbedding, doc.embedding);

    if (score >= minScore) {
      results.push({
        text: doc.text,
        score,
        index: i,
        metadata: doc.metadata,
      });
    }
  }

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, topK);
}
