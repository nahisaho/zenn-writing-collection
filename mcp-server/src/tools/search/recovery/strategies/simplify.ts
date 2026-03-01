/**
 * クエリ簡略化戦略
 *
 * TSK-004: クエリ簡略化戦略
 * REQ-SRCH-003: 検索失敗時の自動リカバリー
 * DES-SRCH-003: 検索リカバリーシステム設計
 */

import type { AlternativeQuery, RecoveryStrategy } from '../types.js';

/**
 * 日本語ストップワード
 */
const JAPANESE_STOPWORDS = new Set([
  // 助詞
  'の', 'に', 'は', 'を', 'が', 'で', 'と', 'へ', 'から', 'より', 'まで',
  // 助動詞・接続詞
  'について', 'における', 'として', 'による', 'に関する', 'に対する',
  'および', 'ならびに', 'または', 'もしくは',
  // 一般的な語
  '等', 'など', 'こと', 'もの', 'ため', 'よう',
  // 指示語
  'この', 'その', 'あの', 'どの',
]);

/**
 * 年号パターン（削除対象）
 */
const YEAR_PATTERNS = [
  /\d{4}年度?/g,    // 2024年、2024年度
  /令和\d+年度?/g,  // 令和6年、令和6年度
  /平成\d+年度?/g,  // 平成31年
  /\d{4}-\d{4}/g,   // 2020-2024
  /\d{4}\/\d{2}/g,  // 2024/01
];

/**
 * クエリ簡略化戦略クラス
 */
export class SimplifyStrategy implements RecoveryStrategy {
  readonly name = 'simplify' as const;
  readonly priority = 2;

  private readonly maxWords: number;

  constructor(maxWords: number = 3) {
    this.maxWords = maxWords;
  }

  /**
   * この戦略が適用可能か判定
   */
  isApplicable(query: string): boolean {
    const words = this.tokenize(query);
    // 2語以上あれば簡略化可能
    return words.length >= 2;
  }

  /**
   * 代替クエリを生成
   */
  generateAlternatives(query: string): AlternativeQuery[] {
    const alternatives: AlternativeQuery[] = [];

    // 1. 年号削除版
    const yearRemoved = this.removeYears(query);
    if (yearRemoved !== query && yearRemoved.trim().length > 0) {
      alternatives.push({
        query: yearRemoved,
        strategy: 'simplify',
        confidence: 0.7,
        description: '年号を削除',
      });
    }

    // 2. ストップワード削除版
    const stopwordsRemoved = this.removeStopwords(query);
    if (stopwordsRemoved !== query && stopwordsRemoved.trim().length > 0) {
      alternatives.push({
        query: stopwordsRemoved,
        strategy: 'simplify',
        confidence: 0.65,
        description: 'ストップワードを削除',
      });
    }

    // 3. 語数制限版
    const truncated = this.truncateToMaxWords(query);
    if (truncated !== query && truncated.trim().length > 0) {
      alternatives.push({
        query: truncated,
        strategy: 'simplify',
        confidence: 0.6,
        description: `${this.maxWords}語に制限`,
      });
    }

    // 4. 複合簡略化（年号削除 + ストップワード削除）
    const combined = this.removeStopwords(yearRemoved);
    if (combined !== query && combined !== yearRemoved && combined !== stopwordsRemoved && combined.trim().length > 0) {
      alternatives.push({
        query: combined,
        strategy: 'simplify',
        confidence: 0.55,
        description: '年号とストップワードを削除',
      });
    }

    // 重複除去
    const uniqueAlternatives = alternatives.filter(
      (alt, index, self) => self.findIndex((a) => a.query === alt.query) === index
    );

    return uniqueAlternatives;
  }

  /**
   * 年号を削除
   */
  private removeYears(query: string): string {
    let result = query;
    for (const pattern of YEAR_PATTERNS) {
      result = result.replace(pattern, '');
    }
    return this.normalizeSpaces(result);
  }

  /**
   * ストップワードを削除
   */
  private removeStopwords(query: string): string {
    const words = this.tokenize(query);
    const filtered = words.filter((word) => {
      // 単語自体がストップワードの場合
      if (JAPANESE_STOPWORDS.has(word)) {
        return false;
      }
      // 単語の末尾がストップワードの場合（部分マッチ）
      for (const stopword of JAPANESE_STOPWORDS) {
        if (word.endsWith(stopword) && word.length > stopword.length) {
          return true; // 末尾にストップワードがあっても、それ以外の部分があれば残す
        }
      }
      return true;
    });
    return filtered.join(' ');
  }

  /**
   * 語数を制限
   */
  private truncateToMaxWords(query: string): string {
    const words = this.tokenize(query);
    if (words.length <= this.maxWords) {
      return query;
    }
    // 重要そうな語を優先（長い語、英語、数字を含む語）
    const scoredWords = words.map((word, index) => ({
      word,
      index,
      score: this.calculateWordImportance(word),
    }));

    scoredWords.sort((a, b) => b.score - a.score);
    const topWords = scoredWords.slice(0, this.maxWords);
    topWords.sort((a, b) => a.index - b.index); // 元の順序を保持

    return topWords.map((w) => w.word).join(' ');
  }

  /**
   * 単語の重要度を計算
   */
  private calculateWordImportance(word: string): number {
    let score = 0;

    // 長さボーナス
    score += Math.min(word.length, 10);

    // 英語・数字を含む場合はボーナス
    if (/[a-zA-Z]/.test(word)) {
      score += 5;
    }
    if (/\d/.test(word)) {
      score += 3;
    }

    // 漢字を含む場合はボーナス（専門用語の可能性）
    if (/[\u4e00-\u9faf]/.test(word)) {
      score += 4;
    }

    return score;
  }

  /**
   * クエリをトークン化
   */
  private tokenize(query: string): string[] {
    return query.split(/\s+/).filter((t) => t.length > 0);
  }

  /**
   * 連続スペースを正規化
   */
  private normalizeSpaces(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }
}
