/**
 * SHIKIGAMI Multi-Pop: Branch Detector
 *
 * Thinkフェーズの出力テキストから分岐シグナルを検出
 * REQ-MP-001: 分岐点検出
 *
 * @since v1.51.0
 */

import type {
  BranchPoint,
  BranchCandidate,
  BranchTrigger,
  MultiPopConfig,
} from './types.js';
import { canBranch, type BudgetManagerState } from './budget-manager.js';

// ============================================================
// 分岐シグナルパターン
// ============================================================

interface SignalPattern {
  trigger: BranchTrigger;
  /** 検出パターン（正規表現） */
  patterns: RegExp[];
  /** 最低マッチ数（いくつ以上マッチしたら分岐と判定） */
  minMatches: number;
}

const SIGNAL_PATTERNS: SignalPattern[] = [
  {
    trigger: 'conflicting_hypotheses',
    patterns: [
      /一方で|他方/,
      /しかし|ただし|だが/,
      /対立|矛盾|相反/,
      /however|on the other hand|conversely/i,
      /conflicting|contradictory/i,
      /(?:仮説[A-Zα-ω]|hypothesis\s*[A-Z])/i,
      /賛否|pros?\s*(?:and|&)\s*cons?/i,
    ],
    minMatches: 2,
  },
  {
    trigger: 'multiple_interpretations',
    patterns: [
      /可能性としては|別の解釈/,
      /複数の(?:解釈|見方|読み)/,
      /another\s+(?:possibility|interpretation|explanation)/i,
      /alternatively|or\s+perhaps/i,
      /(?:二|三|複数)通り/,
      /いくつかの(?:仮説|説明)/,
    ],
    minMatches: 1,
  },
  {
    trigger: 'divergent_paths',
    patterns: [
      /技術的には.*ビジネス的には/,
      /深掘りすべき(?:方向|テーマ)が複数/,
      /(?:技術|市場|財務|法規制)(?:面|側面)(?:から|で)/,
      /two\s+(?:directions|approaches|paths)/i,
      /分岐点|選択肢が(?:複数|いくつか)/,
      /(?:approach\s*[A-Z]|方向性[A-Zα-ω])/i,
    ],
    minMatches: 2,
  },
  {
    trigger: 'multi_faceted_gaps',
    patterns: [
      /未解決の疑問.*(?:複数|いくつか)/,
      /情報(?:が|の)不足(?:している|が).*(?:複数|多い)/,
      /ギャップ.*(?:複数|多面的)/,
      /multiple\s+(?:gaps|unknowns|open\s+questions)/i,
      /さらに調査(?:が|を)必要.*(?:複数|いくつか)/,
    ],
    minMatches: 1,
  },
];

// ============================================================
// ブランチ候補抽出パターン
// ============================================================

/**
 * テキストからブランチ候補を抽出するためのパターン
 */
const CANDIDATE_EXTRACTION_PATTERNS = [
  // 「〜 vs 〜」形式
  /(?:「|")([^」"]+)(?:」|")\s*(?:vs\.?|対|versus)\s*(?:「|")([^」"]+)(?:」|")/g,
  // 箇条書きの仮説
  /(?:仮説|hypothesis)\s*[A-Zα-ω①-⑩1-9][:：]\s*(.+)/gi,
  // 方向性の列挙
  /(?:方向性|approach|path)\s*[A-Zα-ω①-⑩1-9][:：]\s*(.+)/gi,
];

// ============================================================
// 公開関数
// ============================================================

/**
 * Thinkフェーズの出力から分岐点を検出する
 *
 * @param thinkOutput - Thinkフェーズの出力テキスト
 * @param currentRound - 現在のラウンド番号
 * @param parentBranchId - 親ブランチID（デフォルト: 'main'）
 * @param currentDepth - 現在の分岐深度（デフォルト: 0）
 * @param config - マルチポップ設定
 * @param budget - 予算状態（分岐可能かチェック用）
 * @returns 検出された分岐点、または null（分岐不要の場合）
 */
export function detectBranchPoint(
  thinkOutput: string,
  currentRound: number,
  parentBranchId: string = 'main',
  currentDepth: number = 0,
  config: MultiPopConfig,
  budget?: BudgetManagerState,
): BranchPoint | null {
  // マルチポップが無効の場合
  if (!config.enabled) {
    return null;
  }

  // 深度チェック
  if (currentDepth >= config.maxDepth) {
    return null;
  }

  // 予算チェック
  if (budget && !canBranch(budget, 2, currentDepth, config)) {
    return null;
  }

  // シグナル検出
  const detectedTrigger = detectSignals(thinkOutput);
  if (!detectedTrigger) {
    return null;
  }

  // ブランチ候補抽出
  const candidates = extractCandidates(thinkOutput, config.maxBranches);
  if (candidates.length < 2) {
    return null; // 最低2候補必要
  }

  const branchPointId = `bp-${parentBranchId}-r${currentRound}`;

  return {
    id: branchPointId,
    round: currentRound,
    trigger: detectedTrigger,
    reason: generateReason(detectedTrigger, thinkOutput),
    parentBranchId,
    depth: currentDepth,
    candidates,
  };
}

// ============================================================
// 内部関数
// ============================================================

/**
 * テキストから分岐シグナルを検出する
 */
function detectSignals(text: string): BranchTrigger | null {
  let bestTrigger: BranchTrigger | null = null;
  let bestMatchCount = 0;

  for (const signal of SIGNAL_PATTERNS) {
    let matchCount = 0;
    for (const pattern of signal.patterns) {
      if (pattern.test(text)) {
        matchCount++;
      }
    }

    if (matchCount >= signal.minMatches && matchCount > bestMatchCount) {
      bestTrigger = signal.trigger;
      bestMatchCount = matchCount;
    }
  }

  return bestTrigger;
}

/**
 * テキストからブランチ候補を抽出する
 */
function extractCandidates(text: string, maxBranches: number): BranchCandidate[] {
  const candidates: BranchCandidate[] = [];
  const labels = ['α', 'β', 'γ', 'δ', 'ε'];

  // パターンマッチで候補を抽出
  for (const pattern of CANDIDATE_EXTRACTION_PATTERNS) {
    // RegExpのlastIndexをリセット
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      for (let i = 1; i < match.length; i++) {
        if (match[i] && candidates.length < maxBranches) {
          candidates.push({
            label: labels[candidates.length] || `branch-${candidates.length + 1}`,
            hypothesis: match[i].trim(),
            expectedInfo: `${match[i].trim()}に関する詳細情報`,
            suggestedQueries: generateSuggestedQueries(match[i].trim()),
            priorityEstimate: candidates.length === 0 ? 'high' : 'medium',
          });
        }
      }
    }
  }

  // 候補が不足している場合、テキストの構造から推定
  if (candidates.length < 2) {
    const fallbackCandidates = extractFallbackCandidates(text, maxBranches);
    for (const fc of fallbackCandidates) {
      if (candidates.length < maxBranches) {
        candidates.push({
          ...fc,
          label: labels[candidates.length] || `branch-${candidates.length + 1}`,
        });
      }
    }
  }

  return candidates.slice(0, maxBranches);
}

/**
 * フォールバック候補抽出: テキストの箇条書きや段落構造から推定
 */
function extractFallbackCandidates(
  text: string,
  maxBranches: number,
): Omit<BranchCandidate, 'label'>[] {
  const candidates: Omit<BranchCandidate, 'label'>[] = [];

  // 箇条書き項目を抽出
  const bulletPattern = /^[\s]*[-*•]\s+(.{4,80})$/gm;
  let match: RegExpExecArray | null;
  while ((match = bulletPattern.exec(text)) !== null && candidates.length < maxBranches) {
    candidates.push({
      hypothesis: match[1].trim(),
      expectedInfo: `${match[1].trim()}の検証`,
      suggestedQueries: generateSuggestedQueries(match[1].trim()),
      priorityEstimate: candidates.length === 0 ? 'high' : 'medium',
    });
  }

  // 「未解決の疑問」セクションから
  const questionPattern = /(?:疑問|question|不明)[：:]\s*(.{4,100})/gi;
  while ((match = questionPattern.exec(text)) !== null && candidates.length < maxBranches) {
    candidates.push({
      hypothesis: match[1].trim(),
      expectedInfo: `${match[1].trim()}の解明`,
      suggestedQueries: generateSuggestedQueries(match[1].trim()),
      priorityEstimate: 'medium',
    });
  }

  return candidates;
}

/**
 * 仮説テキストから検索クエリを生成する
 */
function generateSuggestedQueries(hypothesis: string): string[] {
  // 長すぎる場合は最初の50文字に切り詰め
  const truncated = hypothesis.length > 50 ? hypothesis.slice(0, 50) : hypothesis;

  return [
    truncated,
    // 英語風に簡易変換（キーワード抽出）
    truncated.replace(/[、。]/g, ' ').trim(),
  ];
}

/**
 * 分岐理由を生成する
 */
function generateReason(trigger: BranchTrigger, _text: string): string {
  const reasons: Record<BranchTrigger, string> = {
    conflicting_hypotheses: '対立する仮説が検出されました。各仮説を独立に検証する必要があります。',
    multiple_interpretations: '同一データに対して複数の解釈が可能です。各解釈を並行して検証します。',
    divergent_paths: '調査を深掘りする方向性が複数存在します。各方向を並行して探索します。',
    multi_faceted_gaps: '複数の情報ギャップが検出されました。各ギャップを並行して埋めます。',
  };

  return reasons[trigger];
}
