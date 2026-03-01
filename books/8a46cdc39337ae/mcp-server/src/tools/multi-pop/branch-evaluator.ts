/**
 * SHIKIGAMI Multi-Pop: Branch Evaluator
 *
 * 各ブランチの探索成果を評価・スコアリング
 * REQ-MP-004: ブランチ評価, REQ-MP-005: ブランチ選択
 *
 * @since v1.51.0
 */

import type {
  Branch,
  BranchContext,
  BranchEvaluation,
  EvaluationScores,
  EvaluationWeights,
  MultiPopConfig,
} from './types.js';

// ============================================================
// 公開関数
// ============================================================

/**
 * 単一ブランチを評価する
 */
export function evaluateBranch(
  branch: Branch,
  parentContext: BranchContext,
  config: MultiPopConfig,
): BranchEvaluation {
  const scores = calculateScores(branch, parentContext);
  const totalScore = calculateWeightedScore(scores, config.evaluation.weights);
  const recommendation = determineRecommendation(totalScore, config);
  const reasoning = generateReasoning(branch, scores, recommendation);

  return {
    branchId: branch.id,
    totalScore,
    scores,
    recommendation,
    reasoning,
  };
}

/**
 * 全ブランチを評価する
 */
export function evaluateAllBranches(
  branches: Branch[],
  parentContext: BranchContext,
  config: MultiPopConfig,
): BranchEvaluation[] {
  return branches.map((branch) => evaluateBranch(branch, parentContext, config));
}

/**
 * 評価結果に基づきブランチを選択する
 *
 * @returns 選択されたブランチID、マージ候補ID、打ち切りID
 */
export function selectBranch(
  evaluations: BranchEvaluation[],
  config: MultiPopConfig,
): {
  selected: string;
  mergeCandidates: string[];
  pruned: string[];
} {
  if (evaluations.length === 0) {
    throw new Error('No evaluations to select from');
  }

  // スコア降順にソート
  const sorted = [...evaluations].sort((a, b) => b.totalScore - a.totalScore);

  const best = sorted[0];
  const selected = best.branchId;

  const mergeCandidates: string[] = [];
  const pruned: string[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const evaluation = sorted[i];
    const scoreDiff = best.totalScore - evaluation.totalScore;

    if (scoreDiff <= config.mergeThreshold) {
      // スコア差がmergeThreshold以内 → マージ候補
      mergeCandidates.push(evaluation.branchId);
    } else if (evaluation.totalScore < config.pruneThreshold) {
      // pruneThreshold未満 → 打ち切り
      pruned.push(evaluation.branchId);
    } else {
      // それ以外もマージ候補に（有用情報がある可能性）
      mergeCandidates.push(evaluation.branchId);
    }
  }

  return { selected, mergeCandidates, pruned };
}

// ============================================================
// 内部関数
// ============================================================

/**
 * 各評価基準のスコアを計算する
 */
function calculateScores(branch: Branch, parentContext: BranchContext): EvaluationScores {
  return {
    confidence: calculateConfidence(branch),
    information: calculateInformation(branch),
    novelty: calculateNovelty(branch, parentContext),
    relevance: calculateRelevance(branch),
    potential: calculatePotential(branch),
  };
}

/**
 * 信頼度スコア: 発見事項の平均信頼度 × 交差検証ボーナス
 */
function calculateConfidence(branch: Branch): number {
  if (branch.findings.length === 0) return 0;

  const avgConfidence =
    branch.findings.reduce((sum, f) => sum + f.confidence, 0) / branch.findings.length;

  // 複数ソースを持つ発見事項の割合をボーナスとして加算
  const multiSourceRatio =
    branch.findings.filter((f) => f.sources.length >= 2).length / branch.findings.length;
  const bonus = multiSourceRatio * 0.2;

  return Math.min(1, avgConfidence + bonus);
}

/**
 * 情報量スコア: 情報密度（発見数/ラウンド数）を正規化
 */
function calculateInformation(branch: Branch): number {
  if (branch.allocatedRounds === 0) return 0;

  // 1ラウンドあたりの発見数を計算
  const density = branch.findings.length / branch.allocatedRounds;

  // 正規化（1ラウンドあたり2件を最大とする）
  return Math.min(1, density / 2);
}

/**
 * 新規性スコア: 親コンテキストにない情報の割合
 */
function calculateNovelty(branch: Branch, parentContext: BranchContext): number {
  if (branch.findings.length === 0) return 0;

  const novelFindings = branch.findings.filter((f) => f.isNovel);
  const novelRatio = novelFindings.length / branch.findings.length;

  // 親コンテキストのソースにないURLの割合
  const parentUrls = new Set(parentContext.sources.map((s) => normalizeUrl(s.url)));
  const branchUrls = branch.findings.flatMap((f) => f.sources.map((s) => s.url));
  const newUrlCount = branchUrls.filter((url) => !parentUrls.has(normalizeUrl(url))).length;
  const urlNovelty = branchUrls.length > 0 ? newUrlCount / branchUrls.length : 0;

  return (novelRatio + urlNovelty) / 2;
}

/**
 * 関連性スコア: 仮説と発見事項の整合性（簡易的にキーワード一致率で計算）
 */
function calculateRelevance(branch: Branch): number {
  if (branch.findings.length === 0) return 0;

  // 仮説からキーワードを抽出
  const hypothesisKeywords = extractKeywords(branch.hypothesis);
  if (hypothesisKeywords.length === 0) return 0.5; // キーワードがない場合はデフォルト

  // 各発見事項にキーワードが含まれる割合
  let matchCount = 0;
  for (const finding of branch.findings) {
    const findingText = finding.content.toLowerCase();
    const hasKeyword = hypothesisKeywords.some((kw) => findingText.includes(kw));
    if (hasKeyword) matchCount++;
  }

  return matchCount / branch.findings.length;
}

/**
 * 発展性スコア: さらなる深掘りの可能性
 */
function calculatePotential(branch: Branch): number {
  if (branch.findings.length === 0) return 0;

  // 信頼度が中程度（0.3-0.7）の発見事項が多いほど発展性あり
  const mediumConfidenceCount = branch.findings.filter(
    (f) => f.confidence >= 0.3 && f.confidence <= 0.7,
  ).length;
  const mediumRatio = mediumConfidenceCount / branch.findings.length;

  // ラウンド残りがあるほど発展性あり
  const roundRemainingRatio = Math.max(
    0,
    (branch.allocatedRounds - branch.consumedRounds) / branch.allocatedRounds,
  );

  return (mediumRatio * 0.6 + roundRemainingRatio * 0.4);
}

/**
 * 重み付きスコアを計算する
 */
function calculateWeightedScore(
  scores: EvaluationScores,
  weights: EvaluationWeights,
): number {
  return (
    scores.confidence * (weights.confidence ?? 0.3) +
    scores.information * (weights.information ?? 0.25) +
    scores.novelty * (weights.novelty ?? 0.2) +
    scores.relevance * (weights.relevance ?? 0.15) +
    scores.potential * (weights.potential ?? 0.1)
  );
}

/**
 * 推奨アクションを決定する
 */
function determineRecommendation(
  totalScore: number,
  config: MultiPopConfig,
): 'select' | 'merge' | 'prune' {
  if (totalScore < config.pruneThreshold) {
    return 'prune';
  }
  return 'select'; // 個別評価では暫定的にselect、selectBranch()で最終決定
}

/**
 * 評価理由を生成する
 */
function generateReasoning(
  branch: Branch,
  scores: EvaluationScores,
  recommendation: string,
): string {
  const parts: string[] = [];

  // 最高スコアの基準を特定
  const scoreEntries = Object.entries(scores) as [keyof EvaluationScores, number][];
  const sorted = scoreEntries.sort((a, b) => b[1] - a[1]);

  const labels: Record<string, string> = {
    confidence: '信頼度',
    information: '情報量',
    novelty: '新規性',
    relevance: '関連性',
    potential: '発展性',
  };

  parts.push(`ブランチ「${branch.hypothesis}」:`);
  parts.push(
    `強み: ${labels[sorted[0][0]]}(${(sorted[0][1] * 100).toFixed(0)}%)`,
  );

  if (sorted[sorted.length - 1][1] < 0.3) {
    parts.push(
      `課題: ${labels[sorted[sorted.length - 1][0]]}が低い(${(sorted[sorted.length - 1][1] * 100).toFixed(0)}%)`,
    );
  }

  parts.push(`推奨: ${recommendation}`);

  return parts.join(' ');
}

/**
 * テキストからキーワードを抽出する（簡易版）
 */
function extractKeywords(text: string): string[] {
  // 短い語（助詞相当）を除外
  return text
    .toLowerCase()
    .replace(/[、。！？「」（）\[\]{}]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 2);
}

/**
 * URL正規化
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // クエリパラメータとフラグメントを除去
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(/\/$/, '');
  } catch {
    return url.toLowerCase().replace(/\/$/, '');
  }
}
