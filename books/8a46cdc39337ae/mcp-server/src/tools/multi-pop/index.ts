/**
 * SHIKIGAMI Multi-Pop Module
 *
 * マルチポップ（多段階分岐探索）の統合エクスポート
 *
 * @since v1.51.0
 */

// Types
export type {
  BranchCandidate,
  BranchContext,
  BranchEvaluation,
  BranchFinding,
  BranchMergeResult,
  BranchPoint,
  BranchStatus,
  BranchTrigger,
  Branch,
  ConfirmedFact,
  EvaluationScores,
  EvaluationWeights,
  MultiPopConfig,
  MultiPopState,
  SourceInfo,
} from './types.js';

export { DEFAULT_MULTI_POP_CONFIG } from './types.js';

// Budget Manager
export {
  initBudget,
  allocateBranchBudget,
  consumeRound,
  canBranch,
  releaseReserved,
  type BudgetManagerState,
} from './budget-manager.js';

// Branch Detector
export { detectBranchPoint } from './branch-detector.js';

// Branch Manager
export {
  initMultiPopState,
  createBranches,
  updateBranchStatus,
  addFinding,
  addBranchPoint,
  recordRoundConsumption,
  setActiveBranch,
  isBranchExhausted,
  getChildBranches,
} from './branch-manager.js';

// Branch Evaluator
export {
  evaluateBranch,
  evaluateAllBranches,
  selectBranch,
} from './branch-evaluator.js';

// Branch Merger
export {
  mergeBranches,
  applyMergeResult,
} from './branch-merger.js';
