/**
 * SHIKIGAMI Multi-Pop: Branch Manager
 *
 * ブランチの生成・状態遷移・コンテキスト継承を管理
 * REQ-MP-002, REQ-MP-003, REQ-MP-009
 *
 * @since v1.51.0
 */

import type {
  Branch,
  BranchContext,
  BranchFinding,
  BranchPoint,
  BranchStatus,
  MultiPopConfig,
  MultiPopState,
} from './types.js';
import {
  allocateBranchBudget,
  initBudget,
  type BudgetManagerState,
} from './budget-manager.js';

// ============================================================
// 状態初期化
// ============================================================

/**
 * マルチポップ実行状態を初期化する
 */
export function initMultiPopState(config: MultiPopConfig): MultiPopState {
  const budget = initBudget(config);
  return {
    branches: [],
    branchPoints: [],
    totalConsumedRounds: 0,
    remainingBudget: budget.remaining,
    activeBranchId: 'main',
    mergeHistory: [],
  };
}

// ============================================================
// ブランチ生成
// ============================================================

/**
 * 分岐点からブランチを生成する
 *
 * @param branchPoint - 検出された分岐点
 * @param parentContext - 親ブランチのコンテキスト
 * @param budget - 予算管理状態
 * @param config - マルチポップ設定
 * @returns 生成されたブランチ配列と更新された予算
 */
export function createBranches(
  branchPoint: BranchPoint,
  parentContext: BranchContext,
  budget: BudgetManagerState,
  config: MultiPopConfig,
): { branches: Branch[]; budget: BudgetManagerState } {
  const branchCount = Math.min(branchPoint.candidates.length, config.maxBranches);

  // 予算配分
  const allocation = allocateBranchBudget(budget, branchCount, branchPoint.depth, config);

  const branches: Branch[] = branchPoint.candidates
    .slice(0, branchCount)
    .map((candidate) => ({
      id: `${branchPoint.parentBranchId}-${candidate.label}`,
      parentId: branchPoint.parentBranchId,
      label: candidate.label,
      hypothesis: candidate.hypothesis,
      status: 'active' as BranchStatus,
      depth: branchPoint.depth + 1,
      allocatedRounds: allocation.perBranch,
      consumedRounds: 0,
      inheritedContext: deepCopyContext(parentContext),
      findings: [],
    }));

  return {
    branches,
    budget: allocation.budget,
  };
}

// ============================================================
// 状態更新
// ============================================================

/**
 * ブランチの状態を更新する
 */
export function updateBranchStatus(
  state: MultiPopState,
  branchId: string,
  newStatus: BranchStatus,
): MultiPopState {
  return {
    ...state,
    branches: state.branches.map((branch) =>
      branch.id === branchId ? { ...branch, status: newStatus } : branch,
    ),
  };
}

/**
 * ブランチに発見事項を追加する
 */
export function addFinding(
  state: MultiPopState,
  branchId: string,
  finding: BranchFinding,
): MultiPopState {
  return {
    ...state,
    branches: state.branches.map((branch) =>
      branch.id === branchId
        ? {
            ...branch,
            findings: [...branch.findings, finding],
            consumedRounds: Math.max(branch.consumedRounds, finding.round),
          }
        : branch,
    ),
  };
}

/**
 * 分岐点とブランチをStateに追加する
 */
export function addBranchPoint(
  state: MultiPopState,
  branchPoint: BranchPoint,
  branches: Branch[],
  budget: BudgetManagerState,
): MultiPopState {
  return {
    ...state,
    branchPoints: [...state.branchPoints, branchPoint],
    branches: [...state.branches, ...branches],
    remainingBudget: budget.remaining,
  };
}

/**
 * ラウンド消費を記録する
 */
export function recordRoundConsumption(
  state: MultiPopState,
  branchId: string,
): MultiPopState {
  return {
    ...state,
    totalConsumedRounds: state.totalConsumedRounds + 1,
    remainingBudget: Math.max(0, state.remainingBudget - 1),
    branches: state.branches.map((branch) =>
      branch.id === branchId
        ? { ...branch, consumedRounds: branch.consumedRounds + 1 }
        : branch,
    ),
  };
}

/**
 * アクティブブランチを切り替える
 */
export function setActiveBranch(
  state: MultiPopState,
  branchId: string,
): MultiPopState {
  return {
    ...state,
    activeBranchId: branchId,
  };
}

/**
 * ブランチが割当ラウンドを使い切ったかチェック
 */
export function isBranchExhausted(branch: Branch): boolean {
  return branch.consumedRounds >= branch.allocatedRounds;
}

/**
 * 指定ブランチポイントの子ブランチ一覧を取得
 */
export function getChildBranches(state: MultiPopState, parentBranchId: string): Branch[] {
  return state.branches.filter((b) => b.parentId === parentBranchId);
}

// ============================================================
// 内部関数
// ============================================================

/**
 * コンテキストのディープコピー
 */
function deepCopyContext(context: BranchContext): BranchContext {
  return {
    confirmedFacts: context.confirmedFacts.map((f) => ({
      ...f,
      sourceRefs: [...f.sourceRefs],
    })),
    sources: context.sources.map((s) => ({ ...s })),
    evolvingReport: context.evolvingReport,
  };
}
