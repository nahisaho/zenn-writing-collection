/**
 * 検索リカバリー型定義
 *
 * TSK-002: リカバリー型定義
 * REQ-SRCH-003: 検索失敗時の自動リカバリー
 * DES-SRCH-003: 検索リカバリーシステム設計
 */

/**
 * 代替クエリ
 */
export interface AlternativeQuery {
  /** 変換後のクエリ文字列 */
  query: string;
  /** 使用した戦略名 */
  strategy: 'synonym' | 'simplify' | 'translate' | 'direct_visit';
  /** 変換の信頼度（0-1） */
  confidence: number;
  /** 変換の説明 */
  description: string;
  /** v1.14.0: 追加メタデータ（direct_visit戦略用） */
  metadata?: {
    topicKey?: string;
    urlType?: string;
    urlName?: string;
    isDirectVisit?: boolean;
    [key: string]: unknown;
  };
}

/**
 * リカバリー結果
 */
export interface RecoveryResult {
  /** リカバリー成功したか */
  success: boolean;
  /** 元のクエリ */
  originalQuery: string;
  /** 使用した代替クエリ（成功時） */
  usedQuery?: AlternativeQuery;
  /** 試行した代替クエリ一覧 */
  attempts: RecoveryAttempt[];
  /** 検索結果（成功時） */
  results?: unknown[];
  /** 総リトライ回数 */
  totalRetries: number;
  /** 処理時間（ms） */
  durationMs: number;
}

/**
 * リカバリー試行
 */
export interface RecoveryAttempt {
  /** 使用した代替クエリ */
  query: AlternativeQuery;
  /** 結果件数 */
  resultCount: number;
  /** 処理時間（ms） */
  durationMs: number;
  /** エラー（発生時） */
  error?: string;
  /** タイムスタンプ */
  timestamp: Date;
}

/**
 * リカバリー戦略インターフェース
 */
export interface RecoveryStrategy {
  /** 戦略名 */
  readonly name: 'synonym' | 'simplify' | 'translate' | 'direct_visit';

  /** 戦略の優先度（1が最高） */
  readonly priority: number;

  /**
   * 代替クエリを生成
   * @param query 元のクエリ
   * @returns 代替クエリの配列
   */
  generateAlternatives(query: string): AlternativeQuery[];

  /**
   * この戦略が指定クエリに適用可能か判定
   * @param query 元のクエリ
   * @returns 適用可能な場合 true
   */
  isApplicable(query: string): boolean;
}

/**
 * リカバリーログエントリ
 */
export interface RecoveryLogEntry {
  /** 元のクエリ */
  originalQuery: string;
  /** 試行した代替クエリ */
  alternativeQuery: string;
  /** 使用した戦略 */
  strategy: string;
  /** 結果件数 */
  resultCount: number;
  /** 成功したか */
  success: boolean;
  /** タイムスタンプ */
  timestamp: Date;
}
