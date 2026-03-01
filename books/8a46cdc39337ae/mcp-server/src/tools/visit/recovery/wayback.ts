/**
 * WaybackClient - Wayback Machine API クライアント
 *
 * TSK-1-003: WaybackClient実装
 * REQ-SRCH-004-01: visit失敗時フォールバック
 * DES-SRCH-004: VisitRecoveryManager設計
 */

/**
 * Wayback Machine スナップショット情報
 */
export interface WaybackSnapshot {
  /** スナップショットURL */
  url: string;
  /** 元のURL */
  originalUrl: string;
  /** アーカイブ日時（ISO 8601形式） */
  timestamp: string;
  /** 利用可能かどうか */
  available: boolean;
  /** HTTPステータスコード */
  status?: number;
}

/**
 * Wayback Machine API レスポンス
 */
export interface WaybackApiResponse {
  archived_snapshots: {
    closest?: {
      url: string;
      timestamp: string;
      available: boolean;
      status?: string;
    };
  };
  url: string;
}

/**
 * WaybackClient 設定
 */
export interface WaybackClientConfig {
  /** APIベースURL（デフォルト: https://archive.org/wayback/available） */
  apiBaseUrl?: string;
  /** タイムアウト（ms、デフォルト: 10000） */
  timeoutMs?: number;
  /** 最大リトライ回数（デフォルト: 2） */
  maxRetries?: number;
  /** リトライ間隔（ms、デフォルト: 1000） */
  retryDelayMs?: number;
  /** User-Agent（デフォルト: SHIKIGAMI/1.10.0） */
  userAgent?: string;
}

/**
 * デフォルト設定
 */
export const DEFAULT_WAYBACK_CONFIG: Required<WaybackClientConfig> = {
  apiBaseUrl: 'https://archive.org/wayback/available',
  timeoutMs: 10000,
  maxRetries: 2,
  retryDelayMs: 1000,
  userAgent: 'SHIKIGAMI/1.10.0',
};

/**
 * WaybackClient - Wayback Machine APIを使ったページアーカイブ取得
 */
export class WaybackClient {
  private readonly config: Required<WaybackClientConfig>;

  constructor(config?: Partial<WaybackClientConfig>) {
    this.config = { ...DEFAULT_WAYBACK_CONFIG, ...config };
  }

  /**
   * 指定URLの最新アーカイブスナップショットを取得
   * @param url 検索対象のURL
   * @returns スナップショット情報（見つからない場合はnull）
   */
  async getSnapshot(url: string): Promise<WaybackSnapshot | null> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await this.fetchSnapshot(url);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.config.maxRetries) {
          await this.delay(this.config.retryDelayMs);
        }
      }
    }

    console.error(
      `[WaybackClient] Failed to get snapshot for "${url}" after ${this.config.maxRetries + 1} attempts: ${lastError?.message}`
    );
    return null;
  }

  /**
   * 指定URLの利用可能なアーカイブがあるかチェック
   * @param url チェック対象のURL
   * @returns 利用可能な場合true
   */
  async isArchived(url: string): Promise<boolean> {
    const snapshot = await this.getSnapshot(url);
    return snapshot?.available ?? false;
  }

  /**
   * アーカイブされたコンテンツのURLを取得（リダイレクト用）
   * @param url 元のURL
   * @returns アーカイブURL（見つからない場合はnull）
   */
  async getArchiveUrl(url: string): Promise<string | null> {
    const snapshot = await this.getSnapshot(url);
    return snapshot?.available ? snapshot.url : null;
  }

  /**
   * Wayback Machine APIを呼び出してスナップショットを取得
   */
  private async fetchSnapshot(url: string): Promise<WaybackSnapshot | null> {
    const apiUrl = `${this.config.apiBaseUrl}?url=${encodeURIComponent(url)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'User-Agent': this.config.userAgent,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as WaybackApiResponse;
      return this.parseApiResponse(data, url);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${this.config.timeoutMs}ms`);
      }
      throw error;
    }
  }

  /**
   * APIレスポンスをパース
   */
  private parseApiResponse(data: WaybackApiResponse, originalUrl: string): WaybackSnapshot | null {
    const closest = data.archived_snapshots?.closest;

    if (!closest) {
      return null;
    }

    return {
      url: closest.url,
      originalUrl,
      timestamp: this.formatTimestamp(closest.timestamp),
      available: closest.available,
      status: closest.status ? parseInt(closest.status, 10) : undefined,
    };
  }

  /**
   * Wayback Machine のタイムスタンプ（YYYYMMDDHHmmss）をISO 8601形式に変換
   */
  private formatTimestamp(timestamp: string): string {
    if (timestamp.length !== 14) {
      return timestamp;
    }

    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    const hour = timestamp.substring(8, 10);
    const minute = timestamp.substring(10, 12);
    const second = timestamp.substring(12, 14);

    return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
  }

  /**
   * 指定時間待機
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * WaybackClientのシングルトンインスタンスを作成
 */
export function createWaybackClient(config?: Partial<WaybackClientConfig>): WaybackClient {
  return new WaybackClient(config);
}
