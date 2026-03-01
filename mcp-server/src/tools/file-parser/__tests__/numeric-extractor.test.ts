/**
 * NumericDataExtractor テスト
 *
 * TSK-TEST-005
 * REQ-DATA-001: 数値データ自動抽出・整理
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  NumericDataExtractor,
  type NumericData,
  type ExtractionOptions,
  extractNumericData,
  DEFAULT_EXTRACTION_OPTIONS,
} from '../numeric-extractor.js';

describe('NumericDataExtractor', () => {
  let extractor: NumericDataExtractor;

  beforeEach(() => {
    extractor = new NumericDataExtractor();
  });

  describe('extract', () => {
    it('日本円を抽出する', () => {
      const text = 'この製品は1,000円です。総額は10万円になります。';
      const results = extractor.extract(text);

      expect(results.some((r: NumericData) => r.value === 1000 && r.currency === 'JPY')).toBe(
        true
      );
      expect(
        results.some((r: NumericData) => r.value === 100000 && r.currency === 'JPY')
      ).toBe(true);
    });

    it('大きな金額（億円、兆円）を抽出する', () => {
      const text = '売上高は500億円で、市場規模は2兆円です。';
      const results = extractor.extract(text);

      expect(
        results.some((r: NumericData) => r.value === 50000000000 && r.currency === 'JPY')
      ).toBe(true);
      expect(
        results.some((r: NumericData) => r.value === 2000000000000 && r.currency === 'JPY')
      ).toBe(true);
    });

    it('米ドルを抽出する', () => {
      const text = 'The product costs $99.99. Total revenue is $5M.';
      const results = extractor.extract(text);

      expect(results.some((r) => r.value === 99.99 && r.currency === 'USD')).toBe(
        true
      );
      expect(
        results.some((r) => r.value === 5000000 && r.currency === 'USD')
      ).toBe(true);
    });

    it('パーセントを抽出する', () => {
      const text = '成長率は15.5%で、市場シェアは30％です。';
      const results = extractor.extract(text);

      const percentages = results.filter((r) => r.type === 'percentage');
      expect(percentages.some((r) => r.value === 15.5)).toBe(true);
      expect(percentages.some((r) => r.value === 30)).toBe(true);
    });

    it('日付を抽出する', () => {
      const text = '2024年3月15日に発表されました。更新日: 2024-04-01';
      const results = extractor.extract(text);

      const dates = results.filter((r) => r.type === 'date');
      expect(dates.length).toBeGreaterThanOrEqual(2);
    });

    it('件数を抽出する', () => {
      const text = '参加者は100名、出展企業は50社でした。';
      const results = extractor.extract(text);

      const counts = results.filter((r) => r.type === 'count');
      expect(counts.some((r) => r.value === 100)).toBe(true);
      expect(counts.some((r) => r.value === 50)).toBe(true);
    });

    it('測定値を抽出する', () => {
      const text = '重さ500g、長さ30cmの製品です。';
      const results = extractor.extract(text);

      const measurements = results.filter((r) => r.type === 'measurement');
      expect(measurements.some((r) => r.value === 500 && r.unit === 'g')).toBe(
        true
      );
      expect(measurements.some((r) => r.value === 30 && r.unit === 'cm')).toBe(
        true
      );
    });

    it('比率を抽出する', () => {
      const text = '男女比は3:2です。昨年比2倍の成長。';
      const results = extractor.extract(text);

      const ratios = results.filter((r) => r.type === 'ratio');
      expect(ratios.some((r) => r.value === 1.5)).toBe(true); // 3:2 = 1.5
      expect(ratios.some((r) => r.value === 2)).toBe(true); // 2倍
    });
  });

  describe('extractCurrency', () => {
    it('通貨のみを抽出する', () => {
      const text = '価格は5000円、成長率は10%です。';
      const results = extractor.extractCurrency(text);

      expect(results.every((r) => r.type === 'currency')).toBe(true);
      expect(results.some((r) => r.type === 'percentage')).toBe(false);
    });
  });

  describe('extractPercentages', () => {
    it('パーセントのみを抽出する', () => {
      const text = '価格は5000円、成長率は10%です。';
      const results = extractor.extractPercentages(text);

      expect(results.every((r) => r.type === 'percentage')).toBe(true);
      expect(results.length).toBe(1);
    });
  });

  describe('extractDates', () => {
    it('日付のみを抽出する', () => {
      const text = '2024年1月1日に開始、価格1000円。';
      const results = extractor.extractDates(text);

      expect(results.every((r) => r.type === 'date')).toBe(true);
      expect(results.length).toBe(1);
    });
  });

  describe('generateSummary', () => {
    it('抽出結果のサマリーを生成する', () => {
      const text = `
        売上: 100億円
        成長率: 15%
        従業員数: 500名
        設立: 2020年4月1日
      `;
      const results = extractor.extract(text);
      const summary = extractor.generateSummary(results);

      expect(summary.total).toBeGreaterThan(0);
      expect(summary.byType.currency).toBeGreaterThan(0);
      expect(summary.byType.percentage).toBeGreaterThan(0);
      expect(summary.currencies.length).toBeGreaterThan(0);
    });

    it('日付範囲を計算する', () => {
      const text = '2020年1月1日から2024年12月31日まで';
      const results = extractor.extract(text);
      const summary = extractor.generateSummary(results);

      expect(summary.dateRange).toBeDefined();
      if (summary.dateRange) {
        expect(summary.dateRange.earliest.getFullYear()).toBe(2020);
        expect(summary.dateRange.latest.getFullYear()).toBe(2024);
      }
    });
  });
});

describe('extractNumericData', () => {
  it('関数として直接呼び出せる', () => {
    const results = extractNumericData('価格は5000円です。');
    expect(results.length).toBeGreaterThan(0);
  });

  it('オプションでタイプをフィルターできる', () => {
    const results = extractNumericData('価格5000円、成長10%', {
      types: ['currency'],
    });

    expect(results.every((r) => r.type === 'currency')).toBe(true);
  });

  it('最小信頼度でフィルターできる', () => {
    const results = extractNumericData('価格5000円', {
      minConfidence: 0.9,
    });

    expect(results.every((r) => r.confidence >= 0.9)).toBe(true);
  });

  it('コンテキストを含める', () => {
    const results = extractNumericData('前文テキスト 5000円 後文テキスト', {
      includeContext: true,
      contextLength: 10,
    });

    if (results.length > 0) {
      expect(results[0].context).toBeDefined();
      expect(results[0].context).toContain('...');
    }
  });
});

describe('NumericDataExtractor - エッジケース', () => {
  let extractor: NumericDataExtractor;

  beforeEach(() => {
    extractor = new NumericDataExtractor();
  });

  it('空のテキストを処理する', () => {
    const results = extractor.extract('');
    expect(results).toHaveLength(0);
  });

  it('数値がないテキストを処理する', () => {
    const results = extractor.extract('これは数値を含まないテキストです。');
    expect(results).toHaveLength(0);
  });

  it('複雑な形式の金額を処理する', () => {
    const text = '約1,234,567円（税込）';
    const results = extractor.extract(text);

    expect(results.some((r) => r.value === 1234567)).toBe(true);
  });

  it('位置情報が正確である', () => {
    const text = 'ABC 1000円 DEF';
    const results = extractor.extract(text);

    if (results.length > 0 && results[0].position) {
      const { start, end } = results[0].position;
      expect(text.slice(start, end)).toContain('1000円');
    }
  });

  it('重複を避ける', () => {
    const text = '1000円';
    const results = extractor.extract(text);

    // 同じ位置の重複がないこと
    const positions = results.map((r) => r.position?.start);
    const uniquePositions = new Set(positions);
    expect(positions.length).toBe(uniquePositions.size);
  });

  it('ユーロを抽出する', () => {
    const text = 'Price is €99.99 or €5M';
    const results = extractor.extract(text);

    expect(results.some((r) => r.currency === 'EUR')).toBe(true);
  });
});
