/**
 * SHIKIGAMI Multi-Pop Types
 *
 * マルチポップ（多段階分岐探索）の型定義
 * REQ-SHIKIGAMI-017 / DES-SHIKIGAMI-017
 *
 * @since v1.51.0
 */

// ============================================================
// ブランチ状態・トリガー
// ============================================================

/**
 * ブランチの状態
 */
export type BranchStatus = 'active' | 'selected' | 'pruned' | 'merged';

/**
 * 分岐点のトリガー種別
 */
export type BranchTrigger =
  | 'conflicting_hypotheses'   // 対立仮説
  | 'multiple_interpretations' // 複数解釈
  | 'divergent_paths'          // 探索パス分岐
  | 'multi_faceted_gaps';      // 多面的情報ギャップ

// ============================================================
// 分岐点
// ============================================================

/**
 * 分岐点
 */
export interface BranchPoint {
  /** 分岐点ID */
  id: string;
  /** 検出ラウンド */
  round: number;
  /** トリガー種別 */
  trigger: BranchTrigger;
  /** 分岐理由 */
  reason: string;
  /** 親ブランチID（ルートの場合 'main'） */
  parentBranchId: string;
  /** 分岐深度 (0起点) */
  depth: number;
  /** 候補ブランチ */
  candidates: BranchCandidate[];
}

/**
 * ブランチ候補
 */
export interface BranchCandidate {
  /** ラベル（α, β, γ等） */
  label: string;
  /** 仮説・方向性 */
  hypothesis: string;
  /** 期待される情報 */
  expectedInfo: string;
  /** 推奨検索クエリ */
  suggestedQueries: string[];
  /** 優先度予測 */
  priorityEstimate: 'high' | 'medium' | 'low';
}

// ============================================================
// ブランチ
// ============================================================

/**
 * ブランチ
 */
export interface Branch {
  /** ブランチID（例: main-α, main-α-1） */
  id: string;
  /** 親ブランチID */
  parentId: string;
  /** ラベル */
  label: string;
  /** 仮説 */
  hypothesis: string;
  /** 状態 */
  status: BranchStatus;
  /** 分岐深度 */
  depth: number;
  /** 割当ラウンド数 */
  allocatedRounds: number;
  /** 消費ラウンド数 */
  consumedRounds: number;
  /** 継承コンテキスト */
  inheritedContext: BranchContext;
  /** 発見事項（探索中に蓄積） */
  findings: BranchFinding[];
  /** 評価結果（評価後に設定） */
  evaluation?: BranchEvaluation;
}

/**
 * ブランチコンテキスト（継承情報）
 */
export interface BranchContext {
  /** 確定事実リスト */
  confirmedFacts: ConfirmedFact[];
  /** 収集済みソース */
  sources: SourceInfo[];
  /** 現在の Evolving Report テキスト */
  evolvingReport: string;
}

/**
 * 確定事実
 */
export interface ConfirmedFact {
  /** 内容 */
  content: string;
  /** 信頼度 */
  confidence: 'high' | 'medium' | 'low';
  /** ソース参照 */
  sourceRefs: string[];
}

/**
 * ソース情報
 */
export interface SourceInfo {
  /** URL */
  url: string;
  /** タイトル */
  title: string;
  /** 信頼度 */
  trustLevel: 'high' | 'medium' | 'low';
}

// ============================================================
// 発見事項・評価
// ============================================================

/**
 * ブランチ探索の発見事項
 */
export interface BranchFinding {
  /** ラウンド番号 */
  round: number;
  /** 発見内容 */
  content: string;
  /** ソース */
  sources: SourceInfo[];
  /** 信頼度 (0-1) */
  confidence: number;
  /** 新規性フラグ（親コンテキストにない情報） */
  isNovel: boolean;
}

/**
 * ブランチ評価結果
 */
export interface BranchEvaluation {
  /** ブランチID */
  branchId: string;
  /** 総合スコア (0-1) */
  totalScore: number;
  /** 各基準のスコア */
  scores: EvaluationScores;
  /** 推奨アクション */
  recommendation: 'select' | 'merge' | 'prune';
  /** 推奨理由 */
  reasoning: string;
}

/**
 * 評価スコア内訳
 */
export interface EvaluationScores {
  /** 信頼度 (0-1) */
  confidence: number;
  /** 情報量 (0-1) */
  information: number;
  /** 新規性 (0-1) */
  novelty: number;
  /** 関連性 (0-1) */
  relevance: number;
  /** 発展性 (0-1) */
  potential: number;
}

// ============================================================
// マージ
// ============================================================

/**
 * ブランチマージ結果
 */
export interface BranchMergeResult {
  /** マージ先ブランチID */
  targetBranchId: string;
  /** マージ元ブランチID */
  sourceBranchIds: string[];
  /** 取り込んだ発見事項 */
  mergedFindings: BranchFinding[];
  /** 取り込んだソース */
  mergedSources: SourceInfo[];
  /** 除外した情報（理由付き） */
  excluded: Array<{ content: string; reason: string }>;
}

// ============================================================
// 設定
// ============================================================

/**
 * 評価重み設定
 */
export interface EvaluationWeights {
  confidence: number;
  information: number;
  novelty: number;
  relevance: number;
  potential: number;
}

/**
 * マルチポップ設定
 */
export interface MultiPopConfig {
  /** 有効/無効 */
  enabled: boolean;
  /** 分岐点あたりの最大ブランチ数 */
  maxBranches: number;
  /** 各ブランチの最大ラウンド数 */
  branchRounds: number;
  /** 最大分岐深度 */
  maxDepth: number;
  /** 総ラウンド予算 */
  maxTotalRounds: number;
  /** マージ候補とするスコア差 */
  mergeThreshold: number;
  /** ブランチ打ち切りスコア閾値 */
  pruneThreshold: number;
  /** 評価重み */
  evaluation: {
    weights: EvaluationWeights;
  };
}

// ============================================================
// 実行状態
// ============================================================

/**
 * マルチポップ実行状態
 */
export interface MultiPopState {
  /** 全ブランチ */
  branches: Branch[];
  /** 全分岐点 */
  branchPoints: BranchPoint[];
  /** 総消費ラウンド */
  totalConsumedRounds: number;
  /** 残りラウンド予算 */
  remainingBudget: number;
  /** 現在のアクティブブランチID */
  activeBranchId: string;
  /** マージ結果履歴 */
  mergeHistory: BranchMergeResult[];
}

// ============================================================
// デフォルト設定
// ============================================================

/**
 * デフォルト設定値
 */
export const DEFAULT_MULTI_POP_CONFIG: MultiPopConfig = {
  enabled: true,
  maxBranches: 3,
  branchRounds: 3,
  maxDepth: 2,
  maxTotalRounds: 20,
  mergeThreshold: 0.1,
  pruneThreshold: 0.3,
  evaluation: {
    weights: {
      confidence: 0.30,
      information: 0.25,
      novelty: 0.20,
      relevance: 0.15,
      potential: 0.10,
    },
  },
};
