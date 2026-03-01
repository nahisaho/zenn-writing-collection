/**
 * 言語変換戦略
 *
 * TSK-005: 言語変換戦略
 * REQ-SRCH-003: 検索失敗時の自動リカバリー
 * DES-SRCH-003: 検索リカバリーシステム設計
 */

import type { AlternativeQuery, RecoveryStrategy } from '../types.js';

/**
 * ビルトイン日英辞書
 */
export const BUILTIN_DICTIONARY: Record<string, string> = {
  // 技術用語
  'レアアース': 'rare earth',
  '希土類': 'rare earth',
  '希土類元素': 'rare earth elements',
  '人工知能': 'artificial intelligence',
  '機械学習': 'machine learning',
  '深層学習': 'deep learning',
  '電気自動車': 'electric vehicle',
  '自動運転': 'autonomous driving',
  '半導体': 'semiconductor',
  'バッテリー': 'battery',
  '蓄電池': 'battery',
  'リチウムイオン': 'lithium ion',
  '太陽光発電': 'solar power',
  '風力発電': 'wind power',
  '再生可能エネルギー': 'renewable energy',
  '水素': 'hydrogen',
  '燃料電池': 'fuel cell',
  
  // ビジネス用語
  '市場': 'market',
  '業界': 'industry',
  '企業': 'company',
  '需要': 'demand',
  '供給': 'supply',
  '価格': 'price',
  '動向': 'trend',
  '予測': 'forecast',
  '分析': 'analysis',
  'サプライチェーン': 'supply chain',
  '脱炭素': 'decarbonization',
  'カーボンニュートラル': 'carbon neutral',
  
  // 地域・国名
  '中国': 'China',
  '日本': 'Japan',
  'アメリカ': 'United States',
  '米国': 'United States',
  '欧州': 'Europe',
  'ヨーロッパ': 'Europe',
  'アジア': 'Asia',
  'インド': 'India',
  'オーストラリア': 'Australia',
  '韓国': 'South Korea',
  '台湾': 'Taiwan',
  
  // 産業・業界
  '製造業': 'manufacturing',
  '自動車': 'automotive',
  'エレクトロニクス': 'electronics',
  '電子機器': 'electronics',
  '医療': 'medical',
  'ヘルスケア': 'healthcare',
  '金融': 'finance',
  '物流': 'logistics',
  '農業': 'agriculture',
  'エネルギー': 'energy',
};

/**
 * 日本語検出パターン
 */
const JAPANESE_PATTERN = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/;

/**
 * 言語変換戦略クラス
 */
export class TranslateStrategy implements RecoveryStrategy {
  readonly name = 'translate' as const;
  readonly priority = 3;

  private readonly dictionary: Record<string, string>;

  constructor(customDictionary?: Record<string, string>) {
    this.dictionary = { ...BUILTIN_DICTIONARY, ...customDictionary };
  }

  /**
   * この戦略が適用可能か判定
   */
  isApplicable(query: string): boolean {
    // 日本語を含む場合に適用可能
    return JAPANESE_PATTERN.test(query);
  }

  /**
   * 代替クエリを生成
   */
  generateAlternatives(query: string): AlternativeQuery[] {
    const alternatives: AlternativeQuery[] = [];

    const translated = this.translateToEnglish(query);

    if (translated.result !== query) {
      alternatives.push({
        query: translated.result,
        strategy: 'translate',
        confidence: translated.confidence,
        description: translated.description,
      });
    }

    return alternatives;
  }

  /**
   * 日本語を英語に翻訳
   */
  private translateToEnglish(query: string): {
    result: string;
    confidence: number;
    description: string;
  } {
    let result = query;
    let translatedCount = 0;
    const translatedTerms: string[] = [];

    // 辞書を長い語句から順にマッチング（長いマッチを優先）
    const sortedTerms = Object.keys(this.dictionary).sort((a, b) => b.length - a.length);

    for (const term of sortedTerms) {
      if (result.includes(term)) {
        const english = this.dictionary[term];
        result = result.replace(new RegExp(this.escapeRegex(term), 'g'), english);
        translatedCount++;
        translatedTerms.push(`${term}→${english}`);
      }
    }

    // 残存する日本語をチェック
    const hasRemainingJapanese = JAPANESE_PATTERN.test(result);

    // 信頼度計算
    let confidence = 0.7;
    if (translatedCount === 0) {
      confidence = 0;
    } else if (hasRemainingJapanese) {
      // 部分翻訳の場合は信頼度低下
      confidence = 0.5;
    } else {
      // 完全翻訳の場合
      confidence = 0.75;
    }

    const description =
      translatedCount > 0
        ? `日英変換: ${translatedTerms.join(', ')}${hasRemainingJapanese ? ' (部分翻訳)' : ''}`
        : '翻訳対象なし';

    return { result, confidence, description };
  }

  /**
   * 正規表現エスケープ
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
