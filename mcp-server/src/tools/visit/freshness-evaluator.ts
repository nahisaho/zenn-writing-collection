/**
 * FreshnessEvaluator - コンテンツ鮮度評価
 *
 * REQ-FRESH-001: 情報鮮度自動評価
 * DES-SHIKIGAMI-014 Section 3.6
 * TSK-TS-006
 *
 * @version 1.14.0
 */

/**
 * 鮮度レベル
 */
export type FreshnessLevel = 'fresh' | 'recent' | 'stale' | 'outdated' | 'unknown';

/**
 * 鮮度評価結果
 */
export interface FreshnessResult {
  /** 鮮度レベル */
  level: FreshnessLevel;
  /** 公開日（検出できた場合） */
  publishDate?: Date;
  /** 更新日（検出できた場合） */
  updateDate?: Date;
  /** 信頼度（0-1） */
  confidence: number;
  /** 経過日数 */
  daysOld?: number;
  /** 鮮度スコア（0-100） */
  score: number;
  /** 検出方法 */
  detectionMethod?: string;
  /** 警告メッセージ */
  warnings?: string[];
  /** メタデータ */
  metadata?: {
    source: string;
    rawDate?: string;
  };
}

/**
 * 鮮度評価オプション
 */
export interface FreshnessOptions {
  /** 「fresh」とみなす日数閾値 */
  freshThresholdDays?: number;
  /** 「recent」とみなす日数閾値 */
  recentThresholdDays?: number;
  /** 「stale」とみなす日数閾値 */
  staleThresholdDays?: number;
  /** 基準日（デフォルト: 現在） */
  referenceDate?: Date;
  /** トピック別の閾値を使用するか */
  topicAware?: boolean;
}

/**
 * デフォルトオプション
 */
export const DEFAULT_FRESHNESS_OPTIONS: Required<FreshnessOptions> = {
  freshThresholdDays: 30,
  recentThresholdDays: 90,
  staleThresholdDays: 365,
  referenceDate: new Date(),
  topicAware: false,
};

/**
 * トピック別の鮮度閾値
 */
export const TOPIC_FRESHNESS_THRESHOLDS: Record<
  string,
  { fresh: number; recent: number; stale: number }
> = {
  // 急速に変化するトピック
  news: { fresh: 1, recent: 7, stale: 30 },
  cryptocurrency: { fresh: 1, recent: 7, stale: 30 },
  stock_market: { fresh: 1, recent: 7, stale: 30 },
  ai_ml: { fresh: 7, recent: 30, stale: 90 },
  technology: { fresh: 14, recent: 60, stale: 180 },
  startup: { fresh: 14, recent: 60, stale: 180 },

  // 中程度の変化
  business: { fresh: 30, recent: 90, stale: 365 },
  market_research: { fresh: 30, recent: 90, stale: 365 },
  regulation: { fresh: 30, recent: 90, stale: 365 },

  // 安定したトピック
  academic: { fresh: 365, recent: 730, stale: 1825 },
  medical: { fresh: 180, recent: 365, stale: 730 },
  legal: { fresh: 180, recent: 365, stale: 730 },
  history: { fresh: 730, recent: 1825, stale: 3650 },
};

/**
 * 日付検出パターン
 */
const DATE_PATTERNS = {
  // メタタグ
  meta: {
    // 各種メタタグのname/property属性
    names: [
      'article:published_time',
      'article:modified_time',
      'datePublished',
      'dateModified',
      'date',
      'pubdate',
      'publish_date',
      'DC.date.issued',
      'og:article:published_time',
      'og:updated_time',
    ],
    // JSON-LD内のキー
    jsonLd: ['datePublished', 'dateModified', 'dateCreated', 'uploadDate'],
  },

  // テキスト内の日付パターン
  text: {
    // 日本語
    jpDate: /(\d{4})年(\d{1,2})月(\d{1,2})日/g,
    jpDateShort: /(\d{2,4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/g,
    // 英語
    enDateLong: /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/gi,
    enDateShort: /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/gi,
    // ISO形式
    isoDate: /(\d{4})-(\d{2})-(\d{2})(?:T[\d:]+)?/g,
    // 更新表記
    updated: /(?:更新日?|Updated|Modified|Revised)[:\s]*(\d{4})[\/\-\.]?(\d{1,2})[\/\-\.]?(\d{1,2})?/gi,
    published: /(?:公開日?|Published|Posted|Created)[:\s]*(\d{4})[\/\-\.]?(\d{1,2})[\/\-\.]?(\d{1,2})?/gi,
  },
};

/**
 * 月名のマッピング
 */
const MONTH_MAP: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

/**
 * HTMLから日付を抽出
 */
export function extractDateFromHTML(html: string): {
  publishDate?: Date;
  updateDate?: Date;
  confidence: number;
  method: string;
} {
  let publishDate: Date | undefined;
  let updateDate: Date | undefined;
  let confidence = 0;
  let method = 'none';

  // 1. JSON-LD から抽出（最も信頼性が高い）
  const jsonLdMatch = html.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  if (jsonLdMatch) {
    for (const match of jsonLdMatch) {
      try {
        const jsonContent = match.replace(/<\/?script[^>]*>/gi, '');
        const data = JSON.parse(jsonContent);

        for (const key of DATE_PATTERNS.meta.jsonLd) {
          const dateStr = findNestedValue(data, key);
          if (dateStr) {
            const parsed = new Date(dateStr);
            if (!isNaN(parsed.getTime())) {
              if (key.includes('Modified') || key.includes('updated')) {
                updateDate = parsed;
              } else {
                publishDate = parsed;
              }
              confidence = Math.max(confidence, 0.95);
              method = 'json-ld';
            }
          }
        }
      } catch {
        // JSON解析エラーは無視
      }
    }
  }

  // 2. メタタグから抽出
  if (!publishDate) {
    for (const name of DATE_PATTERNS.meta.names) {
      const metaMatch = html.match(
        new RegExp(
          `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`,
          'i'
        )
      );
      if (metaMatch) {
        const parsed = new Date(metaMatch[1]);
        if (!isNaN(parsed.getTime())) {
          if (name.includes('modified') || name.includes('updated')) {
            updateDate = parsed;
          } else {
            publishDate = parsed;
          }
          confidence = Math.max(confidence, 0.9);
          method = method === 'none' ? 'meta-tag' : method;
        }
      }
    }
  }

  // 3. <time> 要素から抽出
  if (!publishDate) {
    const timeMatch = html.match(/<time[^>]+datetime=["']([^"']+)["']/i);
    if (timeMatch) {
      const parsed = new Date(timeMatch[1]);
      if (!isNaN(parsed.getTime())) {
        publishDate = parsed;
        confidence = Math.max(confidence, 0.85);
        method = method === 'none' ? 'time-element' : method;
      }
    }
  }

  // 4. テキストから抽出（信頼度低め）
  if (!publishDate) {
    const textDate = extractDateFromText(html);
    if (textDate) {
      publishDate = textDate.date;
      confidence = Math.max(confidence, 0.6);
      method = method === 'none' ? 'text-extraction' : method;
    }
  }

  return { publishDate, updateDate, confidence, method };
}

/**
 * ネストされたオブジェクトから値を検索
 */
function findNestedValue(obj: unknown, key: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result = findNestedValue(item, key);
      if (result) return result;
    }
    return undefined;
  }

  const record = obj as Record<string, unknown>;
  if (key in record) {
    const value = record[key];
    return typeof value === 'string' ? value : undefined;
  }

  for (const value of Object.values(record)) {
    const result = findNestedValue(value, key);
    if (result) return result;
  }

  return undefined;
}

/**
 * テキストから日付を抽出
 */
export function extractDateFromText(
  text: string
): { date: Date; rawText: string } | null {
  // 更新日表記を優先
  const updatedMatch = text.match(DATE_PATTERNS.text.updated);
  if (updatedMatch) {
    const date = parseJapaneseDate(updatedMatch[0]);
    if (date) return { date, rawText: updatedMatch[0] };
  }

  // 公開日表記
  const publishedMatch = text.match(DATE_PATTERNS.text.published);
  if (publishedMatch) {
    const date = parseJapaneseDate(publishedMatch[0]);
    if (date) return { date, rawText: publishedMatch[0] };
  }

  // 日本語日付
  const jpMatch = text.match(DATE_PATTERNS.text.jpDate);
  if (jpMatch) {
    const date = parseJapaneseDate(jpMatch[0]);
    if (date) return { date, rawText: jpMatch[0] };
  }

  // ISO形式
  const isoMatch = text.match(DATE_PATTERNS.text.isoDate);
  if (isoMatch) {
    const date = new Date(isoMatch[0]);
    if (!isNaN(date.getTime())) return { date, rawText: isoMatch[0] };
  }

  // 英語日付
  const enMatch = text.match(DATE_PATTERNS.text.enDateLong);
  if (enMatch) {
    const date = parseEnglishDate(enMatch[0]);
    if (date) return { date, rawText: enMatch[0] };
  }

  return null;
}

/**
 * 日本語形式の日付をパース
 */
function parseJapaneseDate(text: string): Date | null {
  // YYYY年MM月DD日
  const match1 = text.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (match1) {
    return new Date(
      parseInt(match1[1]),
      parseInt(match1[2]) - 1,
      parseInt(match1[3])
    );
  }

  // YYYY/MM/DD or YYYY-MM-DD
  const match2 = text.match(/(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
  if (match2) {
    return new Date(
      parseInt(match2[1]),
      parseInt(match2[2]) - 1,
      parseInt(match2[3])
    );
  }

  return null;
}

/**
 * 英語形式の日付をパース
 */
function parseEnglishDate(text: string): Date | null {
  const match = text.match(
    /(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/i
  );

  if (match) {
    const monthName = match[1].toLowerCase().slice(0, 3);
    const month = MONTH_MAP[monthName];
    const day = parseInt(match[2]);
    const year = parseInt(match[3]);

    if (month) {
      return new Date(year, month - 1, day);
    }
  }

  return null;
}

/**
 * 鮮度レベルを計算
 */
export function calculateFreshnessLevel(
  daysOld: number,
  options: Required<FreshnessOptions>
): FreshnessLevel {
  if (daysOld < 0) return 'unknown';
  if (daysOld <= options.freshThresholdDays) return 'fresh';
  if (daysOld <= options.recentThresholdDays) return 'recent';
  if (daysOld <= options.staleThresholdDays) return 'stale';
  return 'outdated';
}

/**
 * 鮮度スコアを計算（0-100）
 */
export function calculateFreshnessScore(
  daysOld: number,
  options: Required<FreshnessOptions>
): number {
  if (daysOld < 0) return 0;
  if (daysOld === 0) return 100;

  // 指数減衰モデル
  // 半減期は staleThresholdDays の半分
  const halfLife = options.staleThresholdDays / 2;
  const score = 100 * Math.pow(0.5, daysOld / halfLife);

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 鮮度を評価
 */
export function evaluateFreshness(
  content: string,
  options?: FreshnessOptions
): FreshnessResult {
  const effectiveOptions: Required<FreshnessOptions> = {
    ...DEFAULT_FRESHNESS_OPTIONS,
    referenceDate: new Date(),
    ...options,
  };

  // HTML判定
  const isHTML = /<html|<head|<body/i.test(content);
  const dateInfo = isHTML
    ? extractDateFromHTML(content)
    : { ...extractDateFromText(content), method: 'text-extraction' };

  const warnings: string[] = [];
  let publishDate: Date | undefined;
  let updateDate: Date | undefined;
  let confidence = 0;
  let detectionMethod = 'none';

  if (isHTML) {
    const htmlInfo = dateInfo as ReturnType<typeof extractDateFromHTML>;
    publishDate = htmlInfo.publishDate;
    updateDate = htmlInfo.updateDate;
    confidence = htmlInfo.confidence;
    detectionMethod = htmlInfo.method;
  } else if (dateInfo && 'date' in dateInfo) {
    const textInfo = dateInfo as { date: Date; rawText: string };
    publishDate = textInfo.date;
    confidence = 0.6;
    detectionMethod = 'text-extraction';
  }

  // 日付が見つからない場合
  if (!publishDate) {
    return {
      level: 'unknown',
      confidence: 0,
      score: 0,
      warnings: ['日付情報が見つかりませんでした'],
    };
  }

  // 未来の日付をチェック
  if (publishDate > effectiveOptions.referenceDate) {
    warnings.push('公開日が未来の日付です');
    confidence *= 0.5;
  }

  // 経過日数を計算
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysOld = Math.floor(
    (effectiveOptions.referenceDate.getTime() - publishDate.getTime()) / msPerDay
  );

  // 鮮度レベルとスコアを計算
  const level = calculateFreshnessLevel(daysOld, effectiveOptions);
  const score = calculateFreshnessScore(daysOld, effectiveOptions);

  // 警告を追加
  if (level === 'stale') {
    warnings.push(`情報が${daysOld}日前のものです。最新情報を確認することを推奨します`);
  } else if (level === 'outdated') {
    warnings.push(`情報が${daysOld}日以上古いです。信頼性に注意が必要です`);
  }

  return {
    level,
    publishDate,
    updateDate,
    confidence,
    daysOld,
    score,
    detectionMethod,
    warnings: warnings.length > 0 ? warnings : undefined,
    metadata: {
      source: detectionMethod,
    },
  };
}

/**
 * FreshnessEvaluator - 鮮度評価クラス
 */
export class FreshnessEvaluator {
  private readonly options: Required<FreshnessOptions>;

  constructor(options?: FreshnessOptions) {
    this.options = {
      ...DEFAULT_FRESHNESS_OPTIONS,
      referenceDate: new Date(),
      ...options,
    };
  }

  /**
   * 鮮度を評価
   */
  evaluate(content: string): FreshnessResult {
    return evaluateFreshness(content, this.options);
  }

  /**
   * トピックに基づいた鮮度評価
   */
  evaluateWithTopic(content: string, topic: string): FreshnessResult {
    const thresholds = TOPIC_FRESHNESS_THRESHOLDS[topic.toLowerCase()];

    if (thresholds) {
      return evaluateFreshness(content, {
        ...this.options,
        freshThresholdDays: thresholds.fresh,
        recentThresholdDays: thresholds.recent,
        staleThresholdDays: thresholds.stale,
      });
    }

    return this.evaluate(content);
  }

  /**
   * オプションを取得
   */
  getOptions(): Required<FreshnessOptions> {
    return { ...this.options };
  }

  /**
   * 利用可能なトピック一覧を取得
   */
  static getAvailableTopics(): string[] {
    return Object.keys(TOPIC_FRESHNESS_THRESHOLDS);
  }

  /**
   * トピックの閾値を取得
   */
  static getTopicThresholds(
    topic: string
  ): { fresh: number; recent: number; stale: number } | undefined {
    return TOPIC_FRESHNESS_THRESHOLDS[topic.toLowerCase()];
  }

  /**
   * 鮮度レベルの説明を取得
   */
  static getLevelDescription(level: FreshnessLevel): string {
    const descriptions: Record<FreshnessLevel, string> = {
      fresh: '最新の情報です。信頼性が高いと考えられます。',
      recent: '比較的新しい情報です。ただし、最新情報を確認することを推奨します。',
      stale: '情報が古くなっている可能性があります。最新情報との照合が必要です。',
      outdated: '情報が古いです。現在の状況と異なる可能性が高いため、注意が必要です。',
      unknown: '日付情報が不明です。情報の鮮度を判断できません。',
    };
    return descriptions[level];
  }

  /**
   * 鮮度レベルの絵文字を取得
   */
  static getLevelEmoji(level: FreshnessLevel): string {
    const emojis: Record<FreshnessLevel, string> = {
      fresh: '🟢',
      recent: '🟡',
      stale: '🟠',
      outdated: '🔴',
      unknown: '⚪',
    };
    return emojis[level];
  }

  /**
   * 鮮度結果をフォーマット
   */
  formatResult(result: FreshnessResult): string {
    const emoji = FreshnessEvaluator.getLevelEmoji(result.level);
    const description = FreshnessEvaluator.getLevelDescription(result.level);

    let output = `${emoji} **鮮度評価: ${result.level.toUpperCase()}**\n`;
    output += `${description}\n\n`;

    if (result.publishDate) {
      output += `- 公開日: ${result.publishDate.toLocaleDateString('ja-JP')}\n`;
    }
    if (result.updateDate) {
      output += `- 更新日: ${result.updateDate.toLocaleDateString('ja-JP')}\n`;
    }
    if (result.daysOld !== undefined) {
      output += `- 経過日数: ${result.daysOld}日\n`;
    }
    output += `- スコア: ${result.score}/100\n`;
    output += `- 信頼度: ${Math.round(result.confidence * 100)}%\n`;

    if (result.warnings && result.warnings.length > 0) {
      output += `\n⚠️ 警告:\n`;
      for (const warning of result.warnings) {
        output += `- ${warning}\n`;
      }
    }

    return output;
  }
}
