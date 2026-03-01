/**
 * SHIKIGAMI Multi-Pop: Budget Manager
 *
 * 総ラウンド予算の追跡・配分を管理
 * REQ-MP-008: ラウンド予算管理
 *
 * @since v1.51.0
 */

import type { MultiPopConfig } from './types.js';

// ============================================================
// 予算状態
// ============================================================

/**
 * 予算管理の状態
 */
export interface BudgetManagerState {
  /** 総予算 */
  totalBudget: number;
  /** 消費済みラウンド */
  consumed: number;
  /** 分岐予約分 */
  reserved: number;
  /** 残り利用可能 */
  remaining: number;
}

// ============================================================
// 公開関数
// ============================================================

/**
 * 予算を初期化する
 */
export function initBudget(config: MultiPopConfig): BudgetManagerState {
  return {
    totalBudget: config.maxTotalRounds,
    consumed: 0,
    reserved: 0,
    remaining: config.maxTotalRounds,
  };
}

/**
 * ブランチ用の予算を配分する
 *
 * @param budget - 現在の予算状態
 * @param branchCount - 生成するブランチ数
 * @param depth - 分岐深度（深いほど割当を減らす）
 * @param config - マルチポップ設定
 * @returns 各ブランチへの割当数と更新された予算
 */
export function allocateBranchBudget(
  budget: BudgetManagerState,
  branchCount: number,
  depth: number,
  config: MultiPopConfig,
): { perBranch: number; budget: BudgetManagerState } {
  // 深度に応じてラウンド数を減少: depth=0 → branchRounds, depth=1 → branchRounds-1, ...
  const baseRounds = Math.max(1, config.branchRounds - depth);

  // 要求合計
  const totalRequested = branchCount * baseRounds;

  // 利用可能な予算（少なくとも主パス継続用に2ラウンド残す）
  const reserveForMain = 2;
  const available = Math.max(0, budget.remaining - reserveForMain);

  // 予算内に収まるよう調整
  let perBranch: number;
  if (totalRequested <= available) {
    perBranch = baseRounds;
  } else {
    // 均等に分配
    perBranch = Math.max(1, Math.floor(available / branchCount));
  }

  const totalAllocated = perBranch * branchCount;

  return {
    perBranch,
    budget: {
      ...budget,
      reserved: budget.reserved + totalAllocated,
      remaining: budget.remaining - totalAllocated,
    },
  };
}

/**
 * 1ラウンド消費する
 */
export function consumeRound(budget: BudgetManagerState): BudgetManagerState {
  return {
    ...budget,
    consumed: budget.consumed + 1,
    reserved: Math.max(0, budget.reserved - 1),
    remaining: Math.max(0, budget.remaining - (budget.reserved > 0 ? 0 : 1)),
  };
}

/**
 * 分岐が可能かチェックする
 *
 * @param budget - 現在の予算状態
 * @param requestedBranches - 要求ブランチ数
 * @param depth - 分岐深度
 * @param config - マルチポップ設定
 * @returns 分岐可能かどうか
 */
export function canBranch(
  budget: BudgetManagerState,
  requestedBranches: number,
  depth: number,
  config: MultiPopConfig,
): boolean {
  // 深度チェック
  if (depth >= config.maxDepth) {
    return false;
  }

  // 最低限必要なラウンド: 各ブランチ1ラウンド + 主パス継続2ラウンド
  const minimumRequired = requestedBranches + 2;

  return budget.remaining >= minimumRequired;
}

/**
 * 未使用の予約分を解放する（ブランチが早期完了した場合）
 */
export function releaseReserved(
  budget: BudgetManagerState,
  rounds: number,
): BudgetManagerState {
  const toRelease = Math.min(rounds, budget.reserved);
  return {
    ...budget,
    reserved: budget.reserved - toRelease,
    remaining: budget.remaining + toRelease,
  };
}
