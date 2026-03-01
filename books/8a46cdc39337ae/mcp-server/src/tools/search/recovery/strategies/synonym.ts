/**
 * 同義語置換戦略
 *
 * TSK-003: 同義語置換戦略
 * REQ-SRCH-003: 検索失敗時の自動リカバリー
 * DES-SRCH-003: 検索リカバリーシステム設計
 */

import type { AlternativeQuery, RecoveryStrategy } from '../types.js';
import type { SynonymEntry } from '../../../../config/types.js';

/**
 * ビルトイン同義語辞書
 * 一般的なビジネス・技術用語の同義語マッピング
 */
export const BUILTIN_SYNONYMS: SynonymEntry[] = [
  // 技術用語
  { term: 'AI', synonyms: ['人工知能', 'artificial intelligence', '機械学習'] },
  { term: '人工知能', synonyms: ['AI', 'artificial intelligence', '機械学習'] },
  { term: 'レアアース', synonyms: ['希土類', 'rare earth', 'REE'] },
  { term: '希土類', synonyms: ['レアアース', 'rare earth', 'REE'] },
  { term: 'EV', synonyms: ['電気自動車', 'electric vehicle', 'BEV'] },
  { term: '電気自動車', synonyms: ['EV', 'electric vehicle', 'BEV'] },
  { term: 'IoT', synonyms: ['モノのインターネット', 'Internet of Things'] },
  { term: 'DX', synonyms: ['デジタルトランスフォーメーション', 'digital transformation'] },
  { term: 'API', synonyms: ['アプリケーションインターフェース', 'application programming interface'] },
  { term: 'SaaS', synonyms: ['サービスとしてのソフトウェア', 'software as a service'] },
  { term: 'クラウド', synonyms: ['cloud', 'cloud computing', 'クラウドコンピューティング'] },
  
  // ビジネス用語
  { term: '市場', synonyms: ['マーケット', 'market', '業界'] },
  { term: 'サプライチェーン', synonyms: ['供給網', 'supply chain', 'サプライ・チェーン'] },
  { term: 'M&A', synonyms: ['合併買収', '企業買収', 'merger and acquisition'] },
  { term: 'IPO', synonyms: ['新規株式公開', 'initial public offering', '株式上場'] },
  { term: 'ROI', synonyms: ['投資収益率', 'return on investment', '投資利益率'] },
  
  // 地域・国名
  { term: '中国', synonyms: ['China', '中華人民共和国', 'PRC'] },
  { term: 'アメリカ', synonyms: ['USA', '米国', 'United States', 'US'] },
  { term: '日本', synonyms: ['Japan', 'JP', 'JPN'] },
  { term: 'EU', synonyms: ['欧州連合', 'European Union', 'ヨーロッパ'] },
  
  // 産業・業界
  { term: '半導体', synonyms: ['semiconductor', 'チップ', 'IC'] },
  { term: 'バッテリー', synonyms: ['蓄電池', 'battery', '電池', 'リチウムイオン電池'] },
  { term: '太陽光発電', synonyms: ['ソーラー', 'solar power', 'PV', '太陽電池'] },
];

/**
 * 同義語置換戦略クラス
 */
export class SynonymStrategy implements RecoveryStrategy {
  readonly name = 'synonym' as const;
  readonly priority = 1;

  private readonly synonymMap: Map<string, string[]>;

  constructor(customDictionary?: SynonymEntry[]) {
    this.synonymMap = this.buildSynonymMap(customDictionary);
  }

  /**
   * 同義語マップを構築
   */
  private buildSynonymMap(customDictionary?: SynonymEntry[]): Map<string, string[]> {
    const map = new Map<string, string[]>();

    // ビルトイン辞書を追加
    for (const entry of BUILTIN_SYNONYMS) {
      const normalizedTerm = entry.term.toLowerCase();
      map.set(normalizedTerm, entry.synonyms);
    }

    // カスタム辞書で上書き・追加
    if (customDictionary) {
      for (const entry of customDictionary) {
        const normalizedTerm = entry.term.toLowerCase();
        const existing = map.get(normalizedTerm) || [];
        // カスタム辞書の同義語を優先（既存の後ろに追加はしない）
        map.set(normalizedTerm, [...new Set([...entry.synonyms, ...existing])]);
      }
    }

    return map;
  }

  /**
   * この戦略が適用可能か判定
   */
  isApplicable(query: string): boolean {
    const words = this.tokenize(query);
    return words.some((word) => this.synonymMap.has(word.toLowerCase()));
  }

  /**
   * 代替クエリを生成
   */
  generateAlternatives(query: string): AlternativeQuery[] {
    const alternatives: AlternativeQuery[] = [];
    const words = this.tokenize(query);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const normalizedWord = word.toLowerCase();
      const synonyms = this.synonymMap.get(normalizedWord);

      if (synonyms) {
        for (const synonym of synonyms) {
          const newWords = [...words];
          newWords[i] = synonym;
          const newQuery = newWords.join(' ');

          alternatives.push({
            query: newQuery,
            strategy: 'synonym',
            confidence: 0.8,
            description: `「${word}」を「${synonym}」に置換`,
          });
        }
      }
    }

    // 重複除去
    const uniqueAlternatives = alternatives.filter(
      (alt, index, self) => self.findIndex((a) => a.query === alt.query) === index
    );

    return uniqueAlternatives;
  }

  /**
   * クエリをトークン化
   * 日本語と英語の両方に対応
   */
  private tokenize(query: string): string[] {
    // スペース区切りでまず分割
    const spaceTokens = query.split(/\s+/).filter((t) => t.length > 0);

    // 日本語が含まれる場合は、そのまま返す（形態素解析は将来対応）
    // 現時点ではスペース区切りを基本とする
    return spaceTokens;
  }
}
