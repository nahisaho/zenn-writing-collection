/**
 * SHIKIGAMI Multi-Pop: Branch Detector Tests
 *
 * REQ-MP-001: 分岐点検出のテスト
 *
 * @since v1.51.0
 */

import { describe, it, expect } from 'vitest';
import { detectBranchPoint } from '../branch-detector.js';
import { DEFAULT_MULTI_POP_CONFIG } from '../types.js';
import type { MultiPopConfig } from '../types.js';
import type { BudgetManagerState } from '../budget-manager.js';

describe('BranchDetector', () => {
  const config = DEFAULT_MULTI_POP_CONFIG;

  describe('detectBranchPoint', () => {
    it('対立仮説のシグナルを検出する', () => {
      const thinkOutput = `
## 🧠 Think - ラウンド 3

確定事実:
- 市場規模は1000億円

しかし、成長率については情報が対立しています。
仮説A: 市場は年10%成長している。一方で仮説B: 市場は縮小傾向にある。
これらの矛盾する情報を検証する必要があります。
      `;

      const result = detectBranchPoint(thinkOutput, 3, 'main', 0, config);

      expect(result).not.toBeNull();
      expect(result!.trigger).toBe('conflicting_hypotheses');
      expect(result!.round).toBe(3);
      expect(result!.parentBranchId).toBe('main');
      expect(result!.candidates.length).toBeGreaterThanOrEqual(2);
    });

    it('探索パス分岐のシグナルを検出する', () => {
      const thinkOutput = `
## 🧠 Think - ラウンド 2

技術的にはAIチップの性能分析が必要です。
ビジネス的には市場参入戦略の検討が必要です。
深掘りすべき方向が複数あり、選択肢が複数存在します。
- 技術面からの性能ベンチマーク分析
- 市場面からの競合ポジショニング分析
      `;

      const result = detectBranchPoint(thinkOutput, 2, 'main', 0, config);

      expect(result).not.toBeNull();
      expect(result!.trigger).toBe('divergent_paths');
    });

    it('多面的ギャップのシグナルを検出する', () => {
      const thinkOutput = `
## 🧠 Think - ラウンド 4

未解決の疑問が複数あります:
- 技術的な実現可能性
- 法規制の影響
- 市場の受容性
さらに調査が必要な項目がいくつかあります。
      `;

      const result = detectBranchPoint(thinkOutput, 4, 'main', 0, config);

      expect(result).not.toBeNull();
      expect(result!.trigger).toBe('multi_faceted_gaps');
    });

    it('シグナルがない場合はnullを返す', () => {
      const thinkOutput = `
## 🧠 Think - ラウンド 1

市場規模は1000億円です。
次はより詳細なデータを検索します。
      `;

      const result = detectBranchPoint(thinkOutput, 1, 'main', 0, config);

      expect(result).toBeNull();
    });

    it('マルチポップが無効の場合はnullを返す', () => {
      const disabledConfig: MultiPopConfig = { ...config, enabled: false };
      const thinkOutput = '対立する仮説が存在。一方で異なる見解もある。矛盾する情報。';

      const result = detectBranchPoint(thinkOutput, 3, 'main', 0, disabledConfig);

      expect(result).toBeNull();
    });

    it('最大深度を超える場合はnullを返す', () => {
      const thinkOutput = '対立する仮説が存在。一方で異なる見解もある。矛盾する情報。';

      const result = detectBranchPoint(thinkOutput, 3, 'main', 2, config);

      expect(result).toBeNull();
    });

    it('予算不足の場合はnullを返す', () => {
      const thinkOutput = '対立する仮説が存在。一方で異なる見解もある。矛盾する情報。';
      const budget: BudgetManagerState = {
        totalBudget: 20,
        consumed: 18,
        reserved: 0,
        remaining: 2,
      };

      const result = detectBranchPoint(thinkOutput, 18, 'main', 0, config, budget);

      expect(result).toBeNull();
    });

    it('ブランチ候補が正しい構造を持つ', () => {
      const thinkOutput = `
仮説A: 市場は拡大している
しかし仮説B: 市場は縮小傾向
一方で仮説C: 市場は横ばい
対立する見解があります。
      `;

      const result = detectBranchPoint(thinkOutput, 3, 'main', 0, config);

      if (result) {
        for (const candidate of result.candidates) {
          expect(candidate).toHaveProperty('label');
          expect(candidate).toHaveProperty('hypothesis');
          expect(candidate).toHaveProperty('expectedInfo');
          expect(candidate).toHaveProperty('suggestedQueries');
          expect(candidate).toHaveProperty('priorityEstimate');
          expect(Array.isArray(candidate.suggestedQueries)).toBe(true);
        }
      }
    });

    it('branchPointIdが正しいフォーマット', () => {
      const thinkOutput = '対立する仮説。一方で別の解釈もある。矛盾する情報が多い。';

      const result = detectBranchPoint(thinkOutput, 5, 'main-α', 1, config);

      if (result) {
        expect(result.id).toBe('bp-main-α-r5');
        expect(result.depth).toBe(1);
      }
    });
  });
});
