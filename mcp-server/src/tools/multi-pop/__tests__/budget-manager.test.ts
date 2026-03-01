/**
 * SHIKIGAMI Multi-Pop: Budget Manager Tests
 *
 * REQ-MP-008: ラウンド予算管理のテスト
 *
 * @since v1.51.0
 */

import { describe, it, expect } from 'vitest';
import {
  initBudget,
  allocateBranchBudget,
  consumeRound,
  canBranch,
  releaseReserved,
} from '../budget-manager.js';
import { DEFAULT_MULTI_POP_CONFIG } from '../types.js';

describe('BudgetManager', () => {
  const config = DEFAULT_MULTI_POP_CONFIG;

  describe('initBudget', () => {
    it('設定に基づいて予算を初期化する', () => {
      const budget = initBudget(config);

      expect(budget.totalBudget).toBe(20);
      expect(budget.consumed).toBe(0);
      expect(budget.reserved).toBe(0);
      expect(budget.remaining).toBe(20);
    });
  });

  describe('allocateBranchBudget', () => {
    it('3ブランチに深度0で正しく配分する', () => {
      const budget = initBudget(config);
      const result = allocateBranchBudget(budget, 3, 0, config);

      expect(result.perBranch).toBe(3); // branchRounds = 3
      expect(result.budget.reserved).toBe(9); // 3 * 3
      expect(result.budget.remaining).toBe(11); // 20 - 9
    });

    it('深度が増すとラウンド数が減少する', () => {
      const budget = initBudget(config);
      const depth0 = allocateBranchBudget(budget, 2, 0, config);
      const depth1 = allocateBranchBudget(budget, 2, 1, config);

      expect(depth0.perBranch).toBe(3); // branchRounds - 0
      expect(depth1.perBranch).toBe(2); // branchRounds - 1
    });

    it('予算不足時は利用可能な分で調整する', () => {
      const budget = { totalBudget: 20, consumed: 14, reserved: 0, remaining: 6 };
      // remaining=6, reserveForMain=2, available=4
      // 3 branches * 3 rounds = 9 > 4 → adjust
      const result = allocateBranchBudget(budget, 3, 0, config);

      expect(result.perBranch).toBe(1); // floor(4/3) = 1
    });

    it('残り予算が極小の場合は最低1ラウンド', () => {
      const budget = { totalBudget: 20, consumed: 16, reserved: 0, remaining: 4 };
      const result = allocateBranchBudget(budget, 2, 0, config);

      expect(result.perBranch).toBeGreaterThanOrEqual(1);
    });
  });

  describe('consumeRound', () => {
    it('予約分から消費する', () => {
      const budget = { totalBudget: 20, consumed: 5, reserved: 9, remaining: 6 };
      const result = consumeRound(budget);

      expect(result.consumed).toBe(6);
      expect(result.reserved).toBe(8); // 9 - 1
      expect(result.remaining).toBe(6); // 予約分から消費なのでremainingは変わらない
    });

    it('予約分がない場合はremainingから消費する', () => {
      const budget = { totalBudget: 20, consumed: 5, reserved: 0, remaining: 15 };
      const result = consumeRound(budget);

      expect(result.consumed).toBe(6);
      expect(result.remaining).toBe(14);
    });

    it('remainingが0以下にならない', () => {
      const budget = { totalBudget: 20, consumed: 20, reserved: 0, remaining: 0 };
      const result = consumeRound(budget);

      expect(result.remaining).toBe(0);
    });
  });

  describe('canBranch', () => {
    it('十分な予算があれば分岐可能', () => {
      const budget = initBudget(config);
      expect(canBranch(budget, 3, 0, config)).toBe(true);
    });

    it('予算不足で分岐不可', () => {
      const budget = { totalBudget: 20, consumed: 18, reserved: 0, remaining: 2 };
      expect(canBranch(budget, 3, 0, config)).toBe(false);
    });

    it('最大深度を超えると分岐不可', () => {
      const budget = initBudget(config);
      expect(canBranch(budget, 2, 2, config)).toBe(false); // maxDepth = 2
    });

    it('最小必要ラウンド（ブランチ数+2）を検証', () => {
      const budget = { totalBudget: 20, consumed: 15, reserved: 0, remaining: 5 };
      // 3 branches + 2 main = 5, remaining = 5 → ギリギリOK
      expect(canBranch(budget, 3, 0, config)).toBe(true);

      const budget2 = { totalBudget: 20, consumed: 16, reserved: 0, remaining: 4 };
      // 3 branches + 2 main = 5 > 4 → NG
      expect(canBranch(budget2, 3, 0, config)).toBe(false);
    });
  });

  describe('releaseReserved', () => {
    it('予約分を正しく解放する', () => {
      const budget = { totalBudget: 20, consumed: 5, reserved: 6, remaining: 9 };
      const result = releaseReserved(budget, 3);

      expect(result.reserved).toBe(3); // 6 - 3
      expect(result.remaining).toBe(12); // 9 + 3
    });

    it('解放量が予約分を超えない', () => {
      const budget = { totalBudget: 20, consumed: 5, reserved: 2, remaining: 13 };
      const result = releaseReserved(budget, 5);

      expect(result.reserved).toBe(0); // min(5, 2) = 2 → 2-2=0
      expect(result.remaining).toBe(15); // 13 + 2
    });
  });
});
