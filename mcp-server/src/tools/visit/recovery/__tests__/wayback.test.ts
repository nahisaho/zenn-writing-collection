/**
 * WaybackClient テスト
 *
 * TSK-1-003: WaybackClient実装
 * REQ-SRCH-004-01: visit失敗時フォールバック
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  WaybackClient,
  createWaybackClient,
  DEFAULT_WAYBACK_CONFIG,
  type WaybackApiResponse,
  type WaybackSnapshot,
} from '../wayback.js';

// globalThis.fetch をモック
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('WaybackClient', () => {
  let client: WaybackClient;

  beforeEach(() => {
    client = new WaybackClient();
    mockFetch.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should use default config when no config provided', () => {
      const client = new WaybackClient();
      expect(client).toBeInstanceOf(WaybackClient);
    });

    it('should merge custom config with defaults', () => {
      const client = new WaybackClient({ timeoutMs: 5000 });
      expect(client).toBeInstanceOf(WaybackClient);
    });
  });

  describe('getSnapshot', () => {
    it('should return snapshot when archive is available', async () => {
      const mockResponse: WaybackApiResponse = {
        url: 'https://example.com',
        archived_snapshots: {
          closest: {
            url: 'https://web.archive.org/web/20240101120000/https://example.com',
            timestamp: '20240101120000',
            available: true,
            status: '200',
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.getSnapshot('https://example.com');

      expect(result).not.toBeNull();
      expect(result?.url).toBe('https://web.archive.org/web/20240101120000/https://example.com');
      expect(result?.originalUrl).toBe('https://example.com');
      expect(result?.available).toBe(true);
      expect(result?.timestamp).toBe('2024-01-01T12:00:00Z');
      expect(result?.status).toBe(200);
    });

    it('should return null when no archive is available', async () => {
      const mockResponse: WaybackApiResponse = {
        url: 'https://example.com',
        archived_snapshots: {},
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.getSnapshot('https://example.com');

      expect(result).toBeNull();
    });

    it('should retry on failure', async () => {
      const mockResponse: WaybackApiResponse = {
        url: 'https://example.com',
        archived_snapshots: {
          closest: {
            url: 'https://web.archive.org/web/20240101120000/https://example.com',
            timestamp: '20240101120000',
            available: true,
          },
        },
      };

      // 最初の2回は失敗、3回目で成功
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

      // リトライ間隔を短くして高速化
      const fastClient = new WaybackClient({ retryDelayMs: 10 });
      const result = await fastClient.getSnapshot('https://example.com');

      expect(result).not.toBeNull();
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should return null after all retries fail', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const fastClient = new WaybackClient({ retryDelayMs: 10, maxRetries: 2 });
      const result = await fastClient.getSnapshot('https://example.com');

      expect(result).toBeNull();
      expect(mockFetch).toHaveBeenCalledTimes(3); // 初回 + 2回リトライ
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });

      const fastClient = new WaybackClient({ retryDelayMs: 10, maxRetries: 0 });
      const result = await fastClient.getSnapshot('https://example.com');

      expect(result).toBeNull();
    });

    it('should handle timeout', async () => {
      // タイムアウトをシミュレート
      mockFetch.mockImplementation(
        () =>
          new Promise((_, reject) => {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            reject(error);
          })
      );

      const fastClient = new WaybackClient({ timeoutMs: 100, maxRetries: 0 });
      const result = await fastClient.getSnapshot('https://example.com');

      expect(result).toBeNull();
    });
  });

  describe('isArchived', () => {
    it('should return true when archive is available', async () => {
      const mockResponse: WaybackApiResponse = {
        url: 'https://example.com',
        archived_snapshots: {
          closest: {
            url: 'https://web.archive.org/web/20240101120000/https://example.com',
            timestamp: '20240101120000',
            available: true,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.isArchived('https://example.com');

      expect(result).toBe(true);
    });

    it('should return false when no archive is available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          url: 'https://example.com',
          archived_snapshots: {},
        }),
      });

      const result = await client.isArchived('https://example.com');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const fastClient = new WaybackClient({ retryDelayMs: 10, maxRetries: 0 });
      const result = await fastClient.isArchived('https://example.com');

      expect(result).toBe(false);
    });
  });

  describe('getArchiveUrl', () => {
    it('should return archive URL when available', async () => {
      const mockResponse: WaybackApiResponse = {
        url: 'https://example.com',
        archived_snapshots: {
          closest: {
            url: 'https://web.archive.org/web/20240101120000/https://example.com',
            timestamp: '20240101120000',
            available: true,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.getArchiveUrl('https://example.com');

      expect(result).toBe('https://web.archive.org/web/20240101120000/https://example.com');
    });

    it('should return null when not available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          url: 'https://example.com',
          archived_snapshots: {},
        }),
      });

      const result = await client.getArchiveUrl('https://example.com');

      expect(result).toBeNull();
    });

    it('should return null when available is false', async () => {
      const mockResponse: WaybackApiResponse = {
        url: 'https://example.com',
        archived_snapshots: {
          closest: {
            url: 'https://web.archive.org/web/20240101120000/https://example.com',
            timestamp: '20240101120000',
            available: false,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.getArchiveUrl('https://example.com');

      expect(result).toBeNull();
    });
  });

  describe('createWaybackClient', () => {
    it('should create a WaybackClient instance', () => {
      const client = createWaybackClient();
      expect(client).toBeInstanceOf(WaybackClient);
    });

    it('should create a WaybackClient with custom config', () => {
      const client = createWaybackClient({ timeoutMs: 5000 });
      expect(client).toBeInstanceOf(WaybackClient);
    });
  });

  describe('timestamp formatting', () => {
    it('should format valid timestamp to ISO 8601', async () => {
      const mockResponse: WaybackApiResponse = {
        url: 'https://example.com',
        archived_snapshots: {
          closest: {
            url: 'https://web.archive.org/web/20231215143025/https://example.com',
            timestamp: '20231215143025',
            available: true,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.getSnapshot('https://example.com');

      expect(result?.timestamp).toBe('2023-12-15T14:30:25Z');
    });

    it('should return invalid timestamp as-is', async () => {
      const mockResponse: WaybackApiResponse = {
        url: 'https://example.com',
        archived_snapshots: {
          closest: {
            url: 'https://web.archive.org/web/invalid/https://example.com',
            timestamp: 'invalid',
            available: true,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.getSnapshot('https://example.com');

      expect(result?.timestamp).toBe('invalid');
    });
  });

  describe('API URL encoding', () => {
    it('should properly encode URL with special characters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          url: 'https://example.com/path?query=value&foo=bar',
          archived_snapshots: {},
        }),
      });

      await client.getSnapshot('https://example.com/path?query=value&foo=bar');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent('https://example.com/path?query=value&foo=bar')),
        expect.any(Object)
      );
    });
  });
});
