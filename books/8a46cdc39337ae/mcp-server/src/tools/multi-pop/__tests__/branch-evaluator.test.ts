/**
 * SHIKIGAMI Multi-Pop: Branch Evaluator Tests
 *
 * REQ-MP-004: ブランチ評価, REQ-MP-005: ブランチ選択のテスト
 *
 * @since v1.51.0
 */

import { describe, it, expect } from 'vitest';
import { evaluateBranch, evaluateAllBranches, selectBranch } from '../branch-evaluator.js';
import { DEFAULT_MULTI_POP_CONFIG } from '../types.js';
import type { Branch, BranchContext, BranchEvaluation } from '../types.js';

describe('BranchEvaluator', () => {
  const config = DEFAULT_MULTI_POP_CONFIG;

  const parentContext: BranchContext = {
    confirmedFacts: [
      { content: '市場規模は1000億円', confidence: 'high', sourceRefs: ['ref-1'] },
    ],
    sources: [
      { url: 'https://example.com/report', title: 'Market Report', trustLevel: 'high' },
    ],
    evolvingReport: '## レポート\n市場規模は1000億円',
  };

  function createBranch(id: string, overrides: Partial<Branch> = {}): Branch {
    return {
      id,
      parentId: 'main',
      label: 'α',
      hypothesis: 'AIチップ市場は拡大している',
      status: 'active',
      depth: 1,
      allocatedRounds: 3,
      consumedRounds: 3,
      inheritedContext: parentContext,
      findings: [
        {
          round: 1,
          content: 'AIチップの出荷数は前年比30%増',
          sources: [
            { url: 'https://example.com/ai-chips', title: 'AI Chip Report', trustLevel: 'high' },
          ],
          confidence: 0.8,
          isNovel: true,
        },
        {
          round: 2,
          content: 'NVIDIAがシェア80%を占める',
          sources: [
            { url: 'https://example.com/nvidia', title: 'NVIDIA Market', trustLevel: 'high' },
            { url: 'https://example.com/semicon', title: 'Semiconductor Analysis', trustLevel: 'medium' },
          ],
          confidence: 0.9,
          isNovel: true,
        },
      ],
      ...overrides,
    };
  }

  describe('evaluateBranch', () => {
    it('発見事項のあるブランチを正しく評価する', () => {
      const branch = createBranch('main-α');
      const result = evaluateBranch(branch, parentContext, config);

      expect(result.branchId).toBe('main-α');
      expect(result.totalScore).toBeGreaterThan(0);
      expect(result.totalScore).toBeLessThanOrEqual(1);
      expect(result.scores.confidence).toBeGreaterThan(0);
      expect(result.scores.information).toBeGreaterThan(0);
      expect(result.scores.novelty).toBeGreaterThan(0);
      expect(result.recommendation).toBeDefined();
      expect(result.reasoning).toBeDefined();
    });

    it('発見事項がないブランチはスコア0', () => {
      const branch = createBranch('main-β', { findings: [] });
      const result = evaluateBranch(branch, parentContext, config);

      expect(result.totalScore).toBe(0);
    });

    it('高信頼度・複数ソースのブランチは信頼度スコアが高い', () => {
      const highConfBranch = createBranch('main-α', {
        findings: [
          {
            round: 1,
            content: '高信頼データ',
            sources: [
              { url: 'https://gov.example.com/data', title: 'Gov Report', trustLevel: 'high' },
              { url: 'https://edu.example.com/data', title: 'Academic Paper', trustLevel: 'high' },
            ],
            confidence: 0.95,
            isNovel: true,
          },
          {
            round: 2,
            content: '別の高信頼データ',
            sources: [
              { url: 'https://research.example.com', title: 'Research', trustLevel: 'high' },
              { url: 'https://science.example.com', title: 'Science', trustLevel: 'high' },
            ],
            confidence: 0.9,
            isNovel: true,
          },
        ],
      });

      const lowConfBranch = createBranch('main-β', {
        findings: [
          {
            round: 1,
            content: '低信頼データ',
            sources: [],
            confidence: 0.2,
            isNovel: false,
          },
        ],
      });

      const highResult = evaluateBranch(highConfBranch, parentContext, config);
      const lowResult = evaluateBranch(lowConfBranch, parentContext, config);

      expect(highResult.scores.confidence).toBeGreaterThan(lowResult.scores.confidence);
    });

    it('新規性の高いブランチはnoveltyスコアが高い', () => {
      const novelBranch = createBranch('main-α', {
        findings: [
          { round: 1, content: '新発見1', sources: [{ url: 'https://new1.com', title: 'New 1', trustLevel: 'medium' }], confidence: 0.7, isNovel: true },
          { round: 2, content: '新発見2', sources: [{ url: 'https://new2.com', title: 'New 2', trustLevel: 'medium' }], confidence: 0.7, isNovel: true },
        ],
      });

      const oldBranch = createBranch('main-β', {
        findings: [
          { round: 1, content: '既知情報', sources: [{ url: 'https://example.com/report', title: 'Old', trustLevel: 'medium' }], confidence: 0.7, isNovel: false },
        ],
      });

      const novelResult = evaluateBranch(novelBranch, parentContext, config);
      const oldResult = evaluateBranch(oldBranch, parentContext, config);

      expect(novelResult.scores.novelty).toBeGreaterThan(oldResult.scores.novelty);
    });
  });

  describe('evaluateAllBranches', () => {
    it('全ブランチを正しく評価する', () => {
      const branches = [
        createBranch('main-α'),
        createBranch('main-β', { hypothesis: '市場は縮小している', findings: [] }),
      ];

      const results = evaluateAllBranches(branches, parentContext, config);

      expect(results).toHaveLength(2);
      expect(results[0].branchId).toBe('main-α');
      expect(results[1].branchId).toBe('main-β');
      expect(results[0].totalScore).toBeGreaterThan(results[1].totalScore);
    });
  });

  describe('selectBranch', () => {
    it('最高スコアのブランチを選択する', () => {
      const evaluations: BranchEvaluation[] = [
        { branchId: 'main-α', totalScore: 0.85, scores: { confidence: 0.9, information: 0.8, novelty: 0.8, relevance: 0.9, potential: 0.7 }, recommendation: 'select', reasoning: 'High quality' },
        { branchId: 'main-β', totalScore: 0.42, scores: { confidence: 0.4, information: 0.3, novelty: 0.5, relevance: 0.5, potential: 0.4 }, recommendation: 'merge', reasoning: 'Medium quality' },
        { branchId: 'main-γ', totalScore: 0.15, scores: { confidence: 0.1, information: 0.2, novelty: 0.1, relevance: 0.2, potential: 0.2 }, recommendation: 'prune', reasoning: 'Low quality' },
      ];

      const result = selectBranch(evaluations, config);

      expect(result.selected).toBe('main-α');
      expect(result.pruned).toContain('main-γ');
    });

    it('スコア差がmergeThreshold以内のブランチはマージ候補', () => {
      const evaluations: BranchEvaluation[] = [
        { branchId: 'main-α', totalScore: 0.80, scores: { confidence: 0.8, information: 0.8, novelty: 0.8, relevance: 0.8, potential: 0.8 }, recommendation: 'select', reasoning: '' },
        { branchId: 'main-β', totalScore: 0.75, scores: { confidence: 0.7, information: 0.8, novelty: 0.7, relevance: 0.8, potential: 0.8 }, recommendation: 'merge', reasoning: '' },
      ];

      const result = selectBranch(evaluations, config);

      expect(result.selected).toBe('main-α');
      expect(result.mergeCandidates).toContain('main-β');
      expect(result.pruned).toHaveLength(0);
    });

    it('空の評価配列でエラーを投げる', () => {
      expect(() => selectBranch([], config)).toThrow('No evaluations to select from');
    });

    it('pruneThreshold未満のブランチは打ち切り', () => {
      const evaluations: BranchEvaluation[] = [
        { branchId: 'main-α', totalScore: 0.9, scores: { confidence: 0.9, information: 0.9, novelty: 0.9, relevance: 0.9, potential: 0.9 }, recommendation: 'select', reasoning: '' },
        { branchId: 'main-β', totalScore: 0.2, scores: { confidence: 0.2, information: 0.2, novelty: 0.2, relevance: 0.2, potential: 0.2 }, recommendation: 'prune', reasoning: '' },
      ];

      const result = selectBranch(evaluations, config);

      expect(result.selected).toBe('main-α');
      expect(result.pruned).toContain('main-β');
    });
  });
});
