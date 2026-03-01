/**
 * Keyword Detection Utility
 * 
 * v1.15.0: 共通キーワード検出ユーティリティ
 * REQ-SHIKIGAMI-015: ワークフロー統合のためのキーワードベース分岐制御
 */

/**
 * 分析タイプ
 */
export type AnalysisType = 
  | 'case-study'      // ケーススタディ抽出
  | 'skill-salary'    // スキル・給与データ抽出
  | 'geopolitical'    // 地政学リスク分析
  | 'scenario'        // シナリオ分析
  | 'supply-chain'    // サプライチェーン分析
  | 'patent'          // 特許検索
  | 'dd-checklist'    // デューデリジェンスチェックリスト
  ;

/**
 * ドメインタイプ
 */
export type DomainType = 'it' | 'business' | 'finance' | 'legal' | 'healthcare';

/**
 * キーワード検出設定
 */
interface KeywordConfig {
  /** キーワードリスト（部分一致） */
  keywords: string[];
  /** 正規表現パターン（より精密なマッチ） */
  patterns?: RegExp[];
}

/**
 * 分析タイプ別キーワード設定
 */
const ANALYSIS_TYPE_KEYWORDS: Record<AnalysisType, KeywordConfig> = {
  'case-study': {
    keywords: [
      '事例', 'ケーススタディ', 'case study', '導入事例', '成功事例',
      '活用事例', '適用事例', 'ユースケース', 'use case', '実績',
    ],
    patterns: [
      /ケース\s*スタディ/i,
      /case\s*stud(y|ies)/i,
    ],
  },
  'skill-salary': {
    keywords: [
      'スキル', '給与', '年収', 'salary', 'skill', '報酬', '賃金',
      '求人', 'job', '職種', 'キャリア', '転職', '採用',
    ],
    patterns: [
      /年収[\d,]+万/,
      /\$[\d,]+k/i,
      /salary\s*range/i,
    ],
  },
  'geopolitical': {
    keywords: [
      '地政学', 'カントリーリスク', '制裁', '輸出規制', 'サプライチェーンリスク',
      '地政学的', 'geopolitical', 'country risk', 'sanctions', '関税',
      '貿易戦争', 'trade war', 'デカップリング', 'decoupling',
    ],
    patterns: [
      /地政学(的)?(\s*リスク)?/,
      /geopolitic(al|s)/i,
    ],
  },
  'scenario': {
    keywords: [
      'シナリオ', '将来予測', '中長期', '不確実性', 'scenario',
      '2025年', '2030年', '2035年', '2040年', '予測', 'forecast',
      'ロードマップ', 'roadmap', '展望', 'outlook',
    ],
    patterns: [
      /20[23]\d年/,
      /scenario\s*(analysis|planning)/i,
      /\d+年後/,
    ],
  },
  'supply-chain': {
    keywords: [
      'サプライチェーン', 'supply chain', 'サプライヤー', 'supplier',
      '調達', 'procurement', '物流', 'logistics', 'バリューチェーン',
      'value chain', 'ティア', 'tier', '部品', 'component',
    ],
    patterns: [
      /supply\s*chain/i,
      /value\s*chain/i,
      /tier\s*[123]/i,
    ],
  },
  'patent': {
    keywords: [
      '特許', 'patent', '知財', '知的財産', 'IP', '出願', '公開',
      '発明', 'invention', 'IPC', 'クレーム', 'claim',
    ],
    patterns: [
      /特許(出願|公開|登録)?/,
      /patent\s*(application|number)/i,
      /[A-H]\d{2}[A-Z]/i, // IPC分類コード
    ],
  },
  'dd-checklist': {
    keywords: [
      'DD', 'デューデリジェンス', 'due diligence', 'チェックリスト',
      'checklist', '検証', 'verification', '評価', 'evaluation',
      '監査', 'audit', '精査', 'レビュー', 'review',
    ],
    patterns: [
      /due\s*diligence/i,
      /check\s*list/i,
    ],
  },
};

/**
 * ドメイン別キーワード設定
 */
const DOMAIN_KEYWORDS: Record<DomainType, KeywordConfig> = {
  it: {
    keywords: [
      'IT', 'システム', 'ソフトウェア', 'クラウド', 'AI', '機械学習',
      'プログラミング', 'API', 'データベース', 'セキュリティ', 'インフラ',
      'software', 'cloud', 'machine learning', 'programming', 'infrastructure',
    ],
  },
  business: {
    keywords: [
      'ビジネス', '経営', '戦略', 'マーケティング', '営業', '事業',
      '市場', 'シェア', '競合', 'business', 'strategy', 'marketing',
    ],
  },
  finance: {
    keywords: [
      '金融', '財務', '投資', '株式', '債券', '融資', '銀行',
      '保険', '会計', 'finance', 'investment', 'banking', 'accounting',
    ],
  },
  legal: {
    keywords: [
      '法律', '法務', '規制', 'コンプライアンス', '契約', '訴訟',
      '法令', '条例', 'legal', 'compliance', 'regulation', 'contract',
    ],
  },
  healthcare: {
    keywords: [
      '医療', 'ヘルスケア', '製薬', '病院', '診断', '治療',
      '臨床', '薬事', 'healthcare', 'pharmaceutical', 'medical', 'clinical',
    ],
  },
};

/**
 * テキストにキーワードが含まれるかチェック
 * @param text 検索対象テキスト
 * @param keywords キーワードリスト
 * @returns いずれかのキーワードが含まれていればtrue
 */
export function containsKeywords(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * テキストからドメインを検出
 * @param text 検索対象テキスト
 * @returns 検出されたドメイン、または null
 */
export function detectDomainFromKeywords(text: string): DomainType | null {
  const lowerText = text.toLowerCase();
  
  // 各ドメインのマッチスコアを計算
  const scores: [DomainType, number][] = (Object.entries(DOMAIN_KEYWORDS) as [DomainType, KeywordConfig][])
    .map(([domain, config]) => {
      const matchCount = config.keywords.filter(kw => 
        lowerText.includes(kw.toLowerCase())
      ).length;
      return [domain, matchCount] as [DomainType, number];
    });
  
  // 最高スコアのドメインを返す（スコアが0なら null）
  const [bestDomain, bestScore] = scores.reduce((best, current) => 
    current[1] > best[1] ? current : best
  );
  
  return bestScore > 0 ? bestDomain : null;
}

/**
 * テキストから分析タイプを検出
 * @param text 検索対象テキスト（通常は goal パラメータ）
 * @returns 検出された分析タイプの配列
 */
export function detectAnalysisType(text: string): AnalysisType[] {
  const detected: AnalysisType[] = [];
  const lowerText = text.toLowerCase();
  
  for (const [type, config] of Object.entries(ANALYSIS_TYPE_KEYWORDS) as [AnalysisType, KeywordConfig][]) {
    // キーワードマッチ
    const keywordMatch = config.keywords.some(kw => 
      lowerText.includes(kw.toLowerCase())
    );
    
    // パターンマッチ
    const patternMatch = config.patterns?.some(pattern => 
      pattern.test(text)
    ) ?? false;
    
    if (keywordMatch || patternMatch) {
      detected.push(type);
    }
  }
  
  return detected;
}

/**
 * ケーススタディ関連のキーワードを含むかチェック
 * @param goal 目的文字列
 */
export function containsCaseStudyKeywords(goal: string): boolean {
  return detectAnalysisType(goal).includes('case-study');
}

/**
 * スキル・給与関連のキーワードを含むかチェック
 * @param goal 目的文字列
 */
export function containsSkillKeywords(goal: string): boolean {
  return detectAnalysisType(goal).includes('skill-salary');
}

/**
 * 地政学関連のキーワードを含むかチェック
 * @param text テキスト
 */
export function containsGeopoliticalKeywords(text: string): boolean {
  return detectAnalysisType(text).includes('geopolitical');
}

/**
 * シナリオ分析関連のキーワードを含むかチェック
 * @param text テキスト
 */
export function containsScenarioKeywords(text: string): boolean {
  return detectAnalysisType(text).includes('scenario');
}

/**
 * サプライチェーン関連のキーワードを含むかチェック
 * @param text テキスト
 */
export function containsSupplyChainKeywords(text: string): boolean {
  return detectAnalysisType(text).includes('supply-chain');
}

/**
 * 特許関連のキーワードを含むかチェック
 * @param text テキスト
 */
export function containsPatentKeywords(text: string): boolean {
  return detectAnalysisType(text).includes('patent');
}

/**
 * DD/チェックリスト関連のキーワードを含むかチェック
 * @param text テキスト
 */
export function containsDDKeywords(text: string): boolean {
  return detectAnalysisType(text).includes('dd-checklist');
}
