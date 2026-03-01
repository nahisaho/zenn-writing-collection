/**
 * Archive.today クライアント
 *
 * @requirements REQ-VISIT-004, REQ-VISIT-004-01
 * @design DES-VISIT-004-01
 * @version 1.11.0
 */

/**
 * Archive.today スナップショット情報
 */
export interface ArchiveTodaySnapshot {
  /** アーカイブURL */
  url: string;
  /** 元のURL */
  originalUrl: string;
  /** アーカイブ日時（ISO 8601形式） */
  timestamp: string;
  /** 利用可能かどうか */
  available: boolean;
}

/**
 * Archive.today クライアント設定
 */
export interface ArchiveTodayClientConfig {
  /** APIベースURL */
  baseUrl?: string;
  /** タイムアウト（ms） */
  timeoutMs?: number;
  /** 最大リトライ回数 */
  maxRetries?: number;
  /** リトライ間隔（ms） */
  retryDelayMs?: number;
  /** User-Agent */
  userAgent?: string;
}

/**
 * デフォルト設定
 */
export const DEFAULT_ARCHIVE_TODAY_CONFIG: Required<ArchiveTodayClientConfig> = {
  baseUrl: 'https://archive.today',
  timeoutMs: 15000,
  maxRetries: 2,
  retryDelayMs: 1000,
  userAgent: 'SHIKIGAMI/1.11.0',
};

/**
 * Archive.today クライアント
 * Archive.today（旧 archive.is）からアーカイブを取得
 */
export class ArchiveTodayClient {
  private readonly config: Required<ArchiveTodayClientConfig>;

  constructor(config?: Partial<ArchiveTodayClientConfig>) {
    this.config = { ...DEFAULT_ARCHIVE_TODAY_CONFIG, ...config };
  }

  /**
   * 指定URLの最新アーカイブスナップショットを取得
   * @param url 検索対象のURL
   * @returns スナップショット情報（見つからない場合はnull）
   */
  async getSnapshot(url: string): Promise<ArchiveTodaySnapshot | null> {
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
      `[ArchiveTodayClient] Failed to get snapshot for "${url}" after ${this.config.maxRetries + 1} attempts: ${lastError?.message}`
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
   * アーカイブされたコンテンツのURLを取得
   * @param url 元のURL
   * @returns アーカイブURL（見つからない場合はnull）
   */
  async getArchiveUrl(url: string): Promise<string | null> {
    const snapshot = await this.getSnapshot(url);
    return snapshot?.available ? snapshot.url : null;
  }

  /**
   * Archive.today からスナップショットを取得
   * Archive.todayは直接的なAPIを提供していないため、
   * timemap形式でのアクセスを試みる
   */
  private async fetchSnapshot(url: string): Promise<ArchiveTodaySnapshot | null> {
    // Archive.today の timemap エンドポイント
    // 形式: https://archive.today/timemap/https://example.com
    const timemapUrl = `${this.config.baseUrl}/timemap/${url}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(timemapUrl, {
        method: 'GET',
        headers: {
          'User-Agent': this.config.userAgent,
          Accept: 'text/html, application/link-format',
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      // Archive.today が見つからない場合は404を返す
      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // timemapレスポンスをパース
      const body = await response.text();
      const parsed = this.parseTimemapResponse(body, url);

      // パースで見つかればそれを返す
      if (parsed) {
        return parsed;
      }

      // パースで見つからない場合は newest エンドポイントを試す
      return this.fetchNewestArchive(url);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${this.config.timeoutMs}ms`);
      }
      throw error;
    }
  }

  /**
   * Timemap形式のレスポンスをパース
   * Link-Format (RFC 5988) または HTML形式をサポート
   */
  private parseTimemapResponse(
    body: string,
    originalUrl: string
  ): ArchiveTodaySnapshot | null {
    // Link-Format形式の場合
    // <https://archive.today/20240101120000/https://example.com>; rel="memento"; datetime="..."
    const linkFormatMatch = body.match(
      /<(https?:\/\/archive\.today\/\d{14}\/[^>]+)>;\s*rel="memento";\s*datetime="([^"]+)"/
    );

    if (linkFormatMatch) {
      return {
        url: linkFormatMatch[1],
        originalUrl,
        timestamp: new Date(linkFormatMatch[2]).toISOString(),
        available: true,
      };
    }

    // HTML形式の場合（アーカイブ一覧ページ）
    // アーカイブURLパターン: https://archive.today/XXXXXX
    const htmlMatch = body.match(/href="(https?:\/\/archive\.today\/[a-zA-Z0-9]+)"/);

    if (htmlMatch) {
      // タイムスタンプはURLから取得できない場合は現在時刻
      return {
        url: htmlMatch[1],
        originalUrl,
        timestamp: new Date().toISOString(),
        available: true,
      };
    }

    // パースで見つからない場合はnullを返す（fetchNewestArchiveは呼び出し元で試行）
    return null;
  }

  /**
   * 最新アーカイブを取得（newest エンドポイント）
   */
  private async fetchNewestArchive(url: string): Promise<ArchiveTodaySnapshot | null> {
    const newestUrl = `${this.config.baseUrl}/newest/${url}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(newestUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': this.config.userAgent,
        },
        signal: controller.signal,
        redirect: 'manual', // リダイレクトを手動処理
      });

      clearTimeout(timeoutId);

      // 302リダイレクトで実際のアーカイブURLが返される
      if (response.status === 302) {
        const location = response.headers.get('location');
        if (location && location.includes('archive.today')) {
          return {
            url: location,
            originalUrl: url,
            timestamp: new Date().toISOString(),
            available: true,
          };
        }
      }

      // 200の場合は直接アーカイブが返されている
      if (response.ok) {
        return {
          url: newestUrl,
          originalUrl: url,
          timestamp: new Date().toISOString(),
          available: true,
        };
      }

      return null;
    } catch (error) {
      clearTimeout(timeoutId);
      return null;
    }
  }

  /**
   * 指定時間待機
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * ArchiveTodayClientのインスタンスを作成
 */
export function createArchiveTodayClient(
  config?: Partial<ArchiveTodayClientConfig>
): ArchiveTodayClient {
  return new ArchiveTodayClient(config);
}
