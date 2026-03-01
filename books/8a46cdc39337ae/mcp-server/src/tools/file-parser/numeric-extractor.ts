/**
 * NumericDataExtractor - 数値データ自動抽出
 *
 * REQ-DATA-001: 数値データ自動抽出・整理
 * DES-SHIKIGAMI-014 Section 3.5
 * TSK-TS-005
 *
 * @version 1.14.0
 */

/**
 * 抽出された数値データ
 */
export interface NumericData {
  /** 元のテキスト */
  originalText: string;
  /** 抽出された値 */
  value: number;
  /** 単位（正規化済み） */
  unit: string;
  /** データタイプ */
  type: 'currency' | 'percentage' | 'count' | 'date' | 'measurement' | 'ratio';
  /** 通貨コード（currency の場合） */
  currency?: string;
  /** 信頼度（0-1） */
  confidence: number;
  /** コンテキスト（前後の文脈） */
  context?: string;
  /** 位置情報 */
  position?: {
    start: number;
    end: number;
  };
}

/**
 * 抽出オプション
 */
export interface ExtractionOptions {
  /** 抽出するタイプ */
  types?: NumericData['type'][];
  /** 最小信頼度 */
  minConfidence?: number;
  /** コンテキストを含めるか */
  includeContext?: boolean;
  /** コンテキストの文字数 */
  contextLength?: number;
}

/**
 * デフォルトオプション
 */
export const DEFAULT_EXTRACTION_OPTIONS: Required<ExtractionOptions> = {
  types: ['currency', 'percentage', 'count', 'date', 'measurement', 'ratio'],
  minConfidence: 0.5,
  includeContext: true,
  contextLength: 50,
};

/**
 * 正規表現パターン
 */
const PATTERNS = {
  // 金額（日本円）
  currencyJPY: /(?:約)?(?:¥|￥|円)?(\d{1,3}(?:,?\d{3})*(?:\.\d+)?)\s*(?:円|万円|億円|兆円)/g,
  // 金額（日本円、漢数字）
  currencyJPYKanji: /(?:約)?(\d+(?:\.\d+)?)\s*(?:万|億|兆)\s*円/g,
  // 金額（ドル）
  currencyUSD: /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:M|B|million|billion)?/gi,
  // 金額（ユーロ）
  currencyEUR: /€\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:M|B|million|billion)?/gi,
  // 割合（パーセント）
  percentage: /(\d+(?:\.\d+)?)\s*[%％]/g,
  // 日付（YYYY年MM月DD日）
  dateJP: /(\d{4})年(?:(\d{1,2})月)?(?:(\d{1,2})日)?/g,
  // 日付（YYYY-MM-DD）
  dateISO: /(\d{4})-(\d{2})-(\d{2})/g,
  // 日付（YYYY/MM/DD）
  dateSlash: /(\d{4})\/(\d{1,2})\/(\d{1,2})/g,
  // 件数・数量
  count: /(?:約)?(\d{1,3}(?:,\d{3})*)\s*(?:件|個|名|人|社|台|回|本|点|種|枚|冊)/g,
  // 測定値（長さ）
  lengthMetric: /(\d+(?:\.\d+)?)\s*(?:mm|cm|m|km)/gi,
  // 測定値（重さ）
  weightMetric: /(\d+(?:\.\d+)?)\s*(?:mg|g|kg|t)/gi,
  // 比率
  ratio: /(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)/g,
  // 倍数
  multiplier: /(\d+(?:\.\d+)?)\s*倍/g,
  // 成長率
  growthRate: /(?:前年比|YoY|年間成長率|CAGR)?\s*[+\-]?(\d+(?:\.\d+)?)\s*[%％]/gi,
};

/**
 * 単位の乗数マッピング
 */
const UNIT_MULTIPLIERS: Record<string, number> = {
  // 日本円
  '円': 1,
  '万円': 10000,
  '億円': 100000000,
  '兆円': 1000000000000,
  '万': 10000,
  '億': 100000000,
  '兆': 1000000000000,
  // ドル
  'M': 1000000,
  'B': 1000000000,
  'million': 1000000,
  'billion': 1000000000,
  // 長さ
  'mm': 0.001,
  'cm': 0.01,
  'm': 1,
  'km': 1000,
  // 重さ
  'mg': 0.001,
  'g': 1,
  'kg': 1000,
  't': 1000000,
};

/**
 * テキストから数値データを抽出
 */
export function extractNumericData(
  text: string,
  options?: ExtractionOptions
): NumericData[] {
  const effectiveOptions: Required<ExtractionOptions> = {
    ...DEFAULT_EXTRACTION_OPTIONS,
    ...options,
  };

  const results: NumericData[] = [];
  const types = effectiveOptions.types;

  // 金額（日本円）
  if (types.includes('currency')) {
    extractCurrencyJPY(text, results, effectiveOptions);
    extractCurrencyUSD(text, results, effectiveOptions);
    extractCurrencyEUR(text, results, effectiveOptions);
  }

  // 割合
  if (types.includes('percentage')) {
    extractPercentage(text, results, effectiveOptions);
  }

  // 日付
  if (types.includes('date')) {
    extractDates(text, results, effectiveOptions);
  }

  // 件数
  if (types.includes('count')) {
    extractCount(text, results, effectiveOptions);
  }

  // 測定値
  if (types.includes('measurement')) {
    extractMeasurement(text, results, effectiveOptions);
  }

  // 比率
  if (types.includes('ratio')) {
    extractRatio(text, results, effectiveOptions);
  }

  // 信頼度でフィルター
  const filtered = results.filter(
    (r) => r.confidence >= effectiveOptions.minConfidence
  );

  // 位置順でソート
  filtered.sort((a, b) => (a.position?.start ?? 0) - (b.position?.start ?? 0));

  return filtered;
}

/**
 * 日本円を抽出
 */
function extractCurrencyJPY(
  text: string,
  results: NumericData[],
  options: Required<ExtractionOptions>
): void {
  // 通常の円表記
  const pattern1 = new RegExp(PATTERNS.currencyJPY.source, 'g');
  let match: RegExpExecArray | null;

  while ((match = pattern1.exec(text)) !== null) {
    const originalText = match[0];
    const numStr = match[1].replace(/,/g, '');
    let value = parseFloat(numStr);

    // 単位に応じて乗算
    if (originalText.includes('兆円')) value *= UNIT_MULTIPLIERS['兆円'];
    else if (originalText.includes('億円')) value *= UNIT_MULTIPLIERS['億円'];
    else if (originalText.includes('万円')) value *= UNIT_MULTIPLIERS['万円'];

    results.push({
      originalText,
      value,
      unit: 'JPY',
      type: 'currency',
      currency: 'JPY',
      confidence: 0.9,
      context: options.includeContext
        ? getContext(text, match.index, options.contextLength)
        : undefined,
      position: { start: match.index, end: match.index + originalText.length },
    });
  }

  // 漢数字表記
  const pattern2 = new RegExp(PATTERNS.currencyJPYKanji.source, 'g');
  while ((match = pattern2.exec(text)) !== null) {
    const originalText = match[0];
    const numStr = match[1];
    let value = parseFloat(numStr);

    if (originalText.includes('兆')) value *= UNIT_MULTIPLIERS['兆'];
    else if (originalText.includes('億')) value *= UNIT_MULTIPLIERS['億'];
    else if (originalText.includes('万')) value *= UNIT_MULTIPLIERS['万'];

    results.push({
      originalText,
      value,
      unit: 'JPY',
      type: 'currency',
      currency: 'JPY',
      confidence: 0.85,
      context: options.includeContext
        ? getContext(text, match.index, options.contextLength)
        : undefined,
      position: { start: match.index, end: match.index + originalText.length },
    });
  }
}

/**
 * 米ドルを抽出
 */
function extractCurrencyUSD(
  text: string,
  results: NumericData[],
  options: Required<ExtractionOptions>
): void {
  const pattern = new RegExp(PATTERNS.currencyUSD.source, 'gi');
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const originalText = match[0];
    const numStr = match[1].replace(/,/g, '');
    let value = parseFloat(numStr);

    // 単位に応じて乗算
    const upperText = originalText.toUpperCase();
    if (upperText.includes('B') || upperText.includes('BILLION')) {
      value *= UNIT_MULTIPLIERS['billion'];
    } else if (upperText.includes('M') || upperText.includes('MILLION')) {
      value *= UNIT_MULTIPLIERS['million'];
    }

    results.push({
      originalText,
      value,
      unit: 'USD',
      type: 'currency',
      currency: 'USD',
      confidence: 0.9,
      context: options.includeContext
        ? getContext(text, match.index, options.contextLength)
        : undefined,
      position: { start: match.index, end: match.index + originalText.length },
    });
  }
}

/**
 * ユーロを抽出
 */
function extractCurrencyEUR(
  text: string,
  results: NumericData[],
  options: Required<ExtractionOptions>
): void {
  const pattern = new RegExp(PATTERNS.currencyEUR.source, 'gi');
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const originalText = match[0];
    const numStr = match[1].replace(/,/g, '');
    let value = parseFloat(numStr);

    const upperText = originalText.toUpperCase();
    if (upperText.includes('B') || upperText.includes('BILLION')) {
      value *= UNIT_MULTIPLIERS['billion'];
    } else if (upperText.includes('M') || upperText.includes('MILLION')) {
      value *= UNIT_MULTIPLIERS['million'];
    }

    results.push({
      originalText,
      value,
      unit: 'EUR',
      type: 'currency',
      currency: 'EUR',
      confidence: 0.9,
      context: options.includeContext
        ? getContext(text, match.index, options.contextLength)
        : undefined,
      position: { start: match.index, end: match.index + originalText.length },
    });
  }
}

/**
 * 割合を抽出
 */
function extractPercentage(
  text: string,
  results: NumericData[],
  options: Required<ExtractionOptions>
): void {
  const pattern = new RegExp(PATTERNS.percentage.source, 'g');
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const originalText = match[0];
    const value = parseFloat(match[1]);

    results.push({
      originalText,
      value,
      unit: '%',
      type: 'percentage',
      confidence: 0.95,
      context: options.includeContext
        ? getContext(text, match.index, options.contextLength)
        : undefined,
      position: { start: match.index, end: match.index + originalText.length },
    });
  }
}

/**
 * 日付を抽出
 */
function extractDates(
  text: string,
  results: NumericData[],
  options: Required<ExtractionOptions>
): void {
  // 日本語形式
  const patternJP = new RegExp(PATTERNS.dateJP.source, 'g');
  let match: RegExpExecArray | null;

  while ((match = patternJP.exec(text)) !== null) {
    const originalText = match[0];
    const year = parseInt(match[1], 10);
    const month = match[2] ? parseInt(match[2], 10) : 1;
    const day = match[3] ? parseInt(match[3], 10) : 1;

    // Date値をUNIXタイムスタンプとして保存
    const date = new Date(year, month - 1, day);
    const value = date.getTime();

    results.push({
      originalText,
      value,
      unit: 'timestamp',
      type: 'date',
      confidence: 0.9,
      context: options.includeContext
        ? getContext(text, match.index, options.contextLength)
        : undefined,
      position: { start: match.index, end: match.index + originalText.length },
    });
  }

  // ISO形式
  const patternISO = new RegExp(PATTERNS.dateISO.source, 'g');
  while ((match = patternISO.exec(text)) !== null) {
    const originalText = match[0];
    const date = new Date(originalText);
    const value = date.getTime();

    results.push({
      originalText,
      value,
      unit: 'timestamp',
      type: 'date',
      confidence: 0.95,
      context: options.includeContext
        ? getContext(text, match.index, options.contextLength)
        : undefined,
      position: { start: match.index, end: match.index + originalText.length },
    });
  }
}

/**
 * 件数を抽出
 */
function extractCount(
  text: string,
  results: NumericData[],
  options: Required<ExtractionOptions>
): void {
  const pattern = new RegExp(PATTERNS.count.source, 'g');
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const originalText = match[0];
    const numStr = match[1].replace(/,/g, '');
    const value = parseInt(numStr, 10);

    results.push({
      originalText,
      value,
      unit: 'count',
      type: 'count',
      confidence: 0.85,
      context: options.includeContext
        ? getContext(text, match.index, options.contextLength)
        : undefined,
      position: { start: match.index, end: match.index + originalText.length },
    });
  }
}

/**
 * 測定値を抽出
 */
function extractMeasurement(
  text: string,
  results: NumericData[],
  options: Required<ExtractionOptions>
): void {
  // 長さ
  const lengthPattern = new RegExp(PATTERNS.lengthMetric.source, 'gi');
  let match: RegExpExecArray | null;

  while ((match = lengthPattern.exec(text)) !== null) {
    const originalText = match[0];
    const value = parseFloat(match[1]);
    const unit = originalText.match(/[a-z]+$/i)?.[0]?.toLowerCase() ?? 'm';

    results.push({
      originalText,
      value,
      unit,
      type: 'measurement',
      confidence: 0.9,
      context: options.includeContext
        ? getContext(text, match.index, options.contextLength)
        : undefined,
      position: { start: match.index, end: match.index + originalText.length },
    });
  }

  // 重さ
  const weightPattern = new RegExp(PATTERNS.weightMetric.source, 'gi');
  while ((match = weightPattern.exec(text)) !== null) {
    const originalText = match[0];
    const value = parseFloat(match[1]);
    const unit = originalText.match(/[a-z]+$/i)?.[0]?.toLowerCase() ?? 'g';

    results.push({
      originalText,
      value,
      unit,
      type: 'measurement',
      confidence: 0.9,
      context: options.includeContext
        ? getContext(text, match.index, options.contextLength)
        : undefined,
      position: { start: match.index, end: match.index + originalText.length },
    });
  }
}

/**
 * 比率を抽出
 */
function extractRatio(
  text: string,
  results: NumericData[],
  options: Required<ExtractionOptions>
): void {
  // 比率（X:Y形式）
  const ratioPattern = new RegExp(PATTERNS.ratio.source, 'g');
  let match: RegExpExecArray | null;

  while ((match = ratioPattern.exec(text)) !== null) {
    const originalText = match[0];
    const left = parseFloat(match[1]);
    const right = parseFloat(match[2]);
    const value = left / right;

    results.push({
      originalText,
      value,
      unit: 'ratio',
      type: 'ratio',
      confidence: 0.85,
      context: options.includeContext
        ? getContext(text, match.index, options.contextLength)
        : undefined,
      position: { start: match.index, end: match.index + originalText.length },
    });
  }

  // 倍数
  const multiplierPattern = new RegExp(PATTERNS.multiplier.source, 'g');
  while ((match = multiplierPattern.exec(text)) !== null) {
    const originalText = match[0];
    const value = parseFloat(match[1]);

    results.push({
      originalText,
      value,
      unit: 'times',
      type: 'ratio',
      confidence: 0.9,
      context: options.includeContext
        ? getContext(text, match.index, options.contextLength)
        : undefined,
      position: { start: match.index, end: match.index + originalText.length },
    });
  }
}

/**
 * コンテキストを取得
 */
function getContext(text: string, position: number, length: number): string {
  const start = Math.max(0, position - length);
  const end = Math.min(text.length, position + length);
  const context = text.slice(start, end);

  // 前後に省略記号を追加
  let result = context;
  if (start > 0) result = '...' + result;
  if (end < text.length) result = result + '...';

  return result;
}

/**
 * NumericDataExtractor - 数値データ抽出クラス
 */
export class NumericDataExtractor {
  private readonly options: Required<ExtractionOptions>;

  constructor(options?: ExtractionOptions) {
    this.options = { ...DEFAULT_EXTRACTION_OPTIONS, ...options };
  }

  /**
   * テキストから数値データを抽出
   */
  extract(text: string): NumericData[] {
    return extractNumericData(text, this.options);
  }

  /**
   * オプションを取得
   */
  getOptions(): Required<ExtractionOptions> {
    return { ...this.options };
  }

  /**
   * 通貨のみを抽出
   */
  extractCurrency(text: string): NumericData[] {
    return extractNumericData(text, { ...this.options, types: ['currency'] });
  }

  /**
   * 割合のみを抽出
   */
  extractPercentages(text: string): NumericData[] {
    return extractNumericData(text, { ...this.options, types: ['percentage'] });
  }

  /**
   * 日付のみを抽出
   */
  extractDates(text: string): NumericData[] {
    return extractNumericData(text, { ...this.options, types: ['date'] });
  }

  /**
   * 抽出結果のサマリーを生成
   */
  generateSummary(results: NumericData[]): {
    total: number;
    byType: Record<NumericData['type'], number>;
    currencies: { currency: string; total: number }[];
    dateRange?: { earliest: Date; latest: Date };
  } {
    const byType: Record<NumericData['type'], number> = {
      currency: 0,
      percentage: 0,
      count: 0,
      date: 0,
      measurement: 0,
      ratio: 0,
    };

    const currencyTotals: Record<string, number> = {};
    const dates: number[] = [];

    for (const result of results) {
      byType[result.type]++;

      if (result.type === 'currency' && result.currency) {
        currencyTotals[result.currency] =
          (currencyTotals[result.currency] ?? 0) + result.value;
      }

      if (result.type === 'date') {
        dates.push(result.value);
      }
    }

    const currencies = Object.entries(currencyTotals).map(([currency, total]) => ({
      currency,
      total,
    }));

    let dateRange: { earliest: Date; latest: Date } | undefined;
    if (dates.length > 0) {
      dates.sort((a, b) => a - b);
      dateRange = {
        earliest: new Date(dates[0]),
        latest: new Date(dates[dates.length - 1]),
      };
    }

    return {
      total: results.length,
      byType,
      currencies,
      dateRange,
    };
  }
}
