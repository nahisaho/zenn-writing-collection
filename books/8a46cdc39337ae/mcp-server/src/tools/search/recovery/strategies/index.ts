/**
 * 戦略エクスポート
 *
 * TSK-007: 戦略エクスポート
 * TSK-TS-001: Direct Visit Strategy追加 (v1.14.0)
 */

export { SynonymStrategy, BUILTIN_SYNONYMS } from './synonym.js';
export { SimplifyStrategy } from './simplify.js';
export { TranslateStrategy, BUILTIN_DICTIONARY } from './translate.js';
export { DirectVisitStrategy } from './direct-visit.js';
export type {
  TopicUrlEntry,
  TopicMapping,
  TopicRepresentativeUrlsConfig,
  DirectVisitResult,
  PageContent,
  DirectVisitFunction,
} from './direct-visit.js';
