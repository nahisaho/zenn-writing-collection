/**
 * SHIKIGAMI Multi-Pop: Branch Merger
 *
 * 選択されなかったブランチの有用情報を主パスに統合
 * REQ-MP-006: ブランチマージ
 *
 * @since v1.51.0
 */

import type {
  Branch,
  BranchFinding,
  BranchMergeResult,
  MultiPopConfig,
  SourceInfo,
} from './types.js';

// ============================================================
// 公開関数
// ============================================================

/**
 * ソースブランチの有用情報をターゲットブランチにマージする
 *
 * @param targetBranch - マージ先ブランチ
 * @param sourceBranches - マージ元ブランチ（マージ候補として選ばれたもの）
 * @param _config - マルチポップ設定
 * @returns マージ結果
 */
export function mergeBranches(
  targetBranch: Branch,
  sourceBranches: Branch[],
  _config: MultiPopConfig,
): BranchMergeResult {
  const mergedFindings: BranchFinding[] = [];
  const mergedSources: SourceInfo[] = [];
  const excluded: Array<{ content: string; reason: string }> = [];

  // ターゲットブランチの既存URLセット
  const targetUrls = new Set(
    targetBranch.findings.flatMap((f) => f.sources.map((s) => normalizeUrl(s.url))),
  );

  // ターゲットブランチの既存コンテンツ（重複検出用）
  const targetContents = new Set(
    targetBranch.findings.map((f) => f.content.slice(0, 100).toLowerCase()),
  );

  for (const source of sourceBranches) {
    for (const finding of source.findings) {
      const result = evaluateFindingForMerge(finding, targetUrls, targetContents);

      if (result.shouldMerge) {
        mergedFindings.push({
          ...finding,
          // マージされた情報であることを示す
          isNovel: true,
        });

        // 新規ソースを追加
        for (const src of finding.sources) {
          const normalizedUrl = normalizeUrl(src.url);
          if (!targetUrls.has(normalizedUrl)) {
            mergedSources.push(src);
            targetUrls.add(normalizedUrl);
          }
        }
      } else {
        excluded.push({
          content: finding.content.slice(0, 200),
          reason: result.reason,
        });
      }
    }
  }

  return {
    targetBranchId: targetBranch.id,
    sourceBranchIds: sourceBranches.map((b) => b.id),
    mergedFindings,
    mergedSources,
    excluded,
  };
}

/**
 * マージ結果をブランチに適用する
 */
export function applyMergeResult(branch: Branch, mergeResult: BranchMergeResult): Branch {
  return {
    ...branch,
    findings: [...branch.findings, ...mergeResult.mergedFindings],
    inheritedContext: {
      ...branch.inheritedContext,
      sources: [...branch.inheritedContext.sources, ...mergeResult.mergedSources],
    },
  };
}

// ============================================================
// 内部関数
// ============================================================

/**
 * 発見事項をマージすべきか評価する
 */
function evaluateFindingForMerge(
  finding: BranchFinding,
  targetUrls: Set<string>,
  targetContents: Set<string>,
): { shouldMerge: boolean; reason: string } {
  // 低信頼度は除外
  if (finding.confidence < 0.4) {
    return { shouldMerge: false, reason: '信頼度が低い（< 0.4）' };
  }

  // コンテンツ重複チェック
  const contentKey = finding.content.slice(0, 100).toLowerCase();
  if (targetContents.has(contentKey)) {
    return { shouldMerge: false, reason: 'ターゲットブランチと重複' };
  }

  // 全ソースが既存の場合は情報の重複とみなす
  const allUrlsExist = finding.sources.length > 0 &&
    finding.sources.every((s) => targetUrls.has(normalizeUrl(s.url)));
  if (allUrlsExist) {
    return { shouldMerge: false, reason: '全ソースが既にターゲットに存在' };
  }

  // ソースなしの低信頼情報は除外
  if (finding.sources.length === 0 && finding.confidence < 0.7) {
    return { shouldMerge: false, reason: 'ソースなし＆中信頼度' };
  }

  return { shouldMerge: true, reason: '' };
}

/**
 * URL正規化
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(/\/$/, '');
  } catch {
    return url.toLowerCase().replace(/\/$/, '');
  }
}
