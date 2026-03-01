/**
 * SHIKIGAMI Multi-Pop: Branch Merger Tests
 *
 * REQ-MP-006: ブランチマージのテスト
 *
 * @since v1.51.0
 */

import { describe, it, expect } from 'vitest';
import { mergeBranches, applyMergeResult } from '../branch-merger.js';
import { DEFAULT_MULTI_POP_CONFIG } from '../types.js';
import type { Branch, BranchContext } from '../types.js';

describe('BranchMerger', () => {
  const config = DEFAULT_MULTI_POP_CONFIG;

  const parentContext: BranchContext = {
    confirmedFacts: [],
    sources: [{ url: 'https://example.com/base', title: 'Base', trustLevel: 'high' }],
    evolvingReport: '',
  };

  function createBranch(id: string, overrides: Partial<Branch> = {}): Branch {
    return {
      id,
      parentId: 'main',
      label: 'α',
      hypothesis: 'テスト仮説',
      status: 'active',
      depth: 1,
      allocatedRounds: 3,
      consumedRounds: 3,
      inheritedContext: parentContext,
      findings: [],
      ...overrides,
    };
  }

  describe('mergeBranches', () => {
    it('高信頼度の新規発見事項をマージする', () => {
      const target = createBranch('main-α', {
        findings: [
          {
            round: 1,
            content: 'ターゲットの発見',
            sources: [{ url: 'https://example.com/target', title: 'Target', trustLevel: 'high' }],
            confidence: 0.8,
            isNovel: true,
          },
        ],
      });

      const source = createBranch('main-β', {
        findings: [
          {
            round: 1,
            content: 'ソースの有用な発見',
            sources: [{ url: 'https://example.com/source', title: 'Source', trustLevel: 'high' }],
            confidence: 0.7,
            isNovel: true,
          },
        ],
      });

      const result = mergeBranches(target, [source], config);

      expect(result.targetBranchId).toBe('main-α');
      expect(result.sourceBranchIds).toContain('main-β');
      expect(result.mergedFindings).toHaveLength(1);
      expect(result.mergedFindings[0].content).toBe('ソースの有用な発見');
      expect(result.mergedSources).toHaveLength(1);
    });

    it('低信頼度の発見事項を除外する', () => {
      const target = createBranch('main-α');
      const source = createBranch('main-β', {
        findings: [
          {
            round: 1,
            content: '低信頼情報',
            sources: [{ url: 'https://blog.example.com', title: 'Blog', trustLevel: 'low' }],
            confidence: 0.2,
            isNovel: true,
          },
        ],
      });

      const result = mergeBranches(target, [source], config);

      expect(result.mergedFindings).toHaveLength(0);
      expect(result.excluded).toHaveLength(1);
      expect(result.excluded[0].reason).toContain('信頼度が低い');
    });

    it('重複コンテンツを除外する', () => {
      const target = createBranch('main-α', {
        findings: [
          {
            round: 1,
            content: '同じ内容の発見事項です。これは重複テスト用のテキストです。',
            sources: [{ url: 'https://example.com/dup', title: 'Dup', trustLevel: 'high' }],
            confidence: 0.8,
            isNovel: true,
          },
        ],
      });

      const source = createBranch('main-β', {
        findings: [
          {
            round: 1,
            content: '同じ内容の発見事項です。これは重複テスト用のテキストです。追加情報あり。',
            sources: [{ url: 'https://example.com/dup', title: 'Dup', trustLevel: 'high' }],
            confidence: 0.8,
            isNovel: true,
          },
        ],
      });

      const result = mergeBranches(target, [source], config);

      expect(result.mergedFindings).toHaveLength(0);
    });

    it('複数ソースブランチからマージする', () => {
      const target = createBranch('main-α');
      const source1 = createBranch('main-β', {
        findings: [
          {
            round: 1,
            content: 'ソース1の発見',
            sources: [{ url: 'https://example.com/s1', title: 'Source 1', trustLevel: 'medium' }],
            confidence: 0.7,
            isNovel: true,
          },
        ],
      });
      const source2 = createBranch('main-γ', {
        findings: [
          {
            round: 1,
            content: 'ソース2の発見',
            sources: [{ url: 'https://example.com/s2', title: 'Source 2', trustLevel: 'medium' }],
            confidence: 0.8,
            isNovel: true,
          },
        ],
      });

      const result = mergeBranches(target, [source1, source2], config);

      expect(result.mergedFindings).toHaveLength(2);
      expect(result.mergedSources).toHaveLength(2);
    });

    it('ソースなしの低信頼情報を除外する', () => {
      const target = createBranch('main-α');
      const source = createBranch('main-β', {
        findings: [
          {
            round: 1,
            content: 'ソースなし中信頼',
            sources: [],
            confidence: 0.5,
            isNovel: true,
          },
        ],
      });

      const result = mergeBranches(target, [source], config);

      expect(result.mergedFindings).toHaveLength(0);
      expect(result.excluded[0].reason).toContain('ソースなし');
    });
  });

  describe('applyMergeResult', () => {
    it('マージ結果をブランチに正しく適用する', () => {
      const branch = createBranch('main-α', {
        findings: [
          { round: 1, content: '元の発見', sources: [], confidence: 0.8, isNovel: true },
        ],
      });

      const mergeResult = {
        targetBranchId: 'main-α',
        sourceBranchIds: ['main-β'],
        mergedFindings: [
          {
            round: 1,
            content: 'マージされた発見',
            sources: [{ url: 'https://merged.com', title: 'Merged', trustLevel: 'high' as const }],
            confidence: 0.7,
            isNovel: true,
          },
        ],
        mergedSources: [{ url: 'https://merged.com', title: 'Merged', trustLevel: 'high' as const }],
        excluded: [],
      };

      const result = applyMergeResult(branch, mergeResult);

      expect(result.findings).toHaveLength(2);
      expect(result.inheritedContext.sources).toHaveLength(2);
    });
  });
});
