/**
 * DirectVisitStrategy テスト
 *
 * TSK-TEST-001
 * REQ-SRCH-010: 検索結果0件時の自動回復
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  DirectVisitStrategy,
  type TopicRepresentativeUrlsConfig,
  type DirectVisitResult,
  type DirectVisitFunction,
  type TopicMapping,
} from '../direct-visit.js';

// fs をモックして設定ファイル読み込みを制御
vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof fs>('fs');
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  };
});

const mockConfig: TopicRepresentativeUrlsConfig = {
  version: '1.0.0',
  priority_order: ['official', 'wiki', 'market_research'],
  max_urls: 3,
  topics: {
    ai: {
      keywords: {
        ja: ['人工知能', '機械学習', 'ChatGPT'],
        en: ['AI', 'artificial intelligence', 'machine learning'],
      },
      urls: [
        { type: 'official', url: 'https://openai.com/', name: 'OpenAI' },
        { type: 'wiki', url: 'https://ja.wikipedia.org/wiki/人工知能', name: 'Wikipedia AI' },
        { type: 'market_research', url: 'https://example.com/ai-market', name: 'AI Market Research' },
      ],
    },
    quantum: {
      keywords: {
        ja: ['量子コンピュータ', '量子計算'],
        en: ['quantum', 'quantum computing'],
      },
      urls: [
        { type: 'official', url: 'https://research.ibm.com/quantum-computing', name: 'IBM Quantum' },
        { type: 'wiki', url: 'https://ja.wikipedia.org/wiki/量子コンピュータ', name: 'Wikipedia Quantum' },
      ],
    },
  },
  fallback: {
    default_urls: [
      { type: 'wiki', url: 'https://ja.wikipedia.org/wiki/', name: 'Wikipedia' },
    ],
  },
};

describe('DirectVisitStrategy', () => {
  let strategy: DirectVisitStrategy;

  beforeEach(async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const yamlModule = await import('yaml');
    vi.mocked(fs.readFileSync).mockReturnValue(yamlModule.default.stringify(mockConfig));
    strategy = new DirectVisitStrategy('/mock/config.yaml');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isApplicable', () => {
    it('マッチするクエリでtrueを返す', () => {
      expect(strategy.isApplicable('人工知能の最新動向')).toBe(true);
    });

    it('マッチしないクエリでfalseを返す', () => {
      expect(strategy.isApplicable('料理レシピ')).toBe(false);
    });

    it('空のクエリでfalseを返す', () => {
      expect(strategy.isApplicable('')).toBe(false);
    });
  });

  describe('findMatchingTopics', () => {
    it('キーワードにマッチするトピックを検出する', () => {
      const topics = strategy.findMatchingTopics('人工知能の最新動向');
      expect(topics).toContain('ai');
    });

    it('複数のトピックにマッチする場合、すべて返す', () => {
      const topics = strategy.findMatchingTopics('量子コンピュータとAIの融合');
      expect(topics).toContain('ai');
      expect(topics).toContain('quantum');
    });

    it('マッチするトピックがない場合、空配列を返す', () => {
      const topics = strategy.findMatchingTopics('料理レシピ');
      expect(topics).toHaveLength(0);
    });

    it('大文字小文字を区別しない', () => {
      const topics = strategy.findMatchingTopics('chatgpt の使い方');
      expect(topics).toContain('ai');
    });
  });

  describe('generateAlternatives', () => {
    it('マッチするトピックの代替クエリを生成する', () => {
      const alternatives = strategy.generateAlternatives('人工知能 市場規模');

      expect(alternatives.length).toBeGreaterThan(0);
      expect(alternatives[0].strategy).toBe('direct_visit');
      expect(alternatives[0].query).toBe('https://openai.com/');
      expect(alternatives[0].confidence).toBeGreaterThan(0);
    });

    it('マッチしない場合、空配列を返す', () => {
      const alternatives = strategy.generateAlternatives('料理レシピ');
      expect(alternatives).toHaveLength(0);
    });

    it('max_urls の制限を守る', () => {
      const alternatives = strategy.generateAlternatives('人工知能');
      expect(alternatives.length).toBeLessThanOrEqual(mockConfig.max_urls);
    });

    it('メタデータにトピック情報を含める', () => {
      const alternatives = strategy.generateAlternatives('人工知能');

      expect(alternatives[0].metadata).toBeDefined();
      expect(alternatives[0].metadata?.topicKey).toBe('ai');
      expect(alternatives[0].metadata?.isDirectVisit).toBe(true);
    });
  });

  describe('executeDirectVisit', () => {
    it('マッチするトピックのURLを訪問する', async () => {
      const visitFn: DirectVisitFunction = vi.fn().mockResolvedValue({
        title: 'Test Page',
        content: 'A'.repeat(200),
        url: 'https://openai.com/',
      });

      const result = await strategy.executeDirectVisit('人工知能 市場規模', visitFn);

      expect(result.success).toBe(true);
      expect(result.matchedTopic).toBe('ai');
      expect(result.visitedUrls.length).toBeGreaterThan(0);
      expect(result.totalContent.length).toBeGreaterThan(0);
    });

    it('コンテンツが短すぎる場合は失敗として記録する', async () => {
      const visitFn: DirectVisitFunction = vi.fn().mockResolvedValue({
        title: 'Test Page',
        content: 'short',
        url: 'https://openai.com/',
      });

      const result = await strategy.executeDirectVisit('人工知能', visitFn);

      expect(result.visitedUrls.some((v) => !v.success)).toBe(true);
    });

    it('マッチしない場合は失敗を返す', async () => {
      const visitFn: DirectVisitFunction = vi.fn();

      const result = await strategy.executeDirectVisit('料理レシピ', visitFn);

      expect(result.success).toBe(false);
      expect(result.visitedUrls).toHaveLength(0);
    });

    it('訪問エラーを適切に処理する', async () => {
      const visitFn: DirectVisitFunction = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await strategy.executeDirectVisit('人工知能', visitFn);

      expect(result.visitedUrls.some((v) => v.error === 'Network error')).toBe(true);
    });
  });

  describe('name / priority', () => {
    it('戦略名を返す', () => {
      expect(strategy.name).toBe('direct_visit');
    });

    it('優先度を返す', () => {
      expect(typeof strategy.priority).toBe('number');
      expect(strategy.priority).toBe(3);
    });
  });

  describe('getConfig / reloadConfig', () => {
    it('設定を取得する', () => {
      const config = strategy.getConfig();
      expect(config).not.toBeNull();
      expect(config?.topics.ai).toBeDefined();
    });

    it('設定を再読み込みする', () => {
      strategy.reloadConfig();
      const config = strategy.getConfig();
      expect(config).not.toBeNull();
    });
  });
});

describe('DirectVisitStrategy - エッジケース', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('設定ファイルが存在しない場合でもインスタンス化できる', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const strategy = new DirectVisitStrategy('/nonexistent/config.yaml');
    expect(strategy).toBeDefined();
    expect(strategy.name).toBe('direct_visit');
  });

  it('設定がない場合 isApplicable は false を返す', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const strategy = new DirectVisitStrategy('/nonexistent/config.yaml');

    expect(strategy.isApplicable('人工知能')).toBe(false);
  });

  it('設定がない場合 generateAlternatives は空配列を返す', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const strategy = new DirectVisitStrategy('/nonexistent/config.yaml');

    expect(strategy.generateAlternatives('人工知能')).toHaveLength(0);
  });

  it('設定がない場合 executeDirectVisit は失敗を返す', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const strategy = new DirectVisitStrategy('/nonexistent/config.yaml');
    const visitFn: DirectVisitFunction = vi.fn();

    const result = await strategy.executeDirectVisit('人工知能', visitFn);

    expect(result.success).toBe(false);
    expect(result.visitedUrls).toHaveLength(0);
  });
});
