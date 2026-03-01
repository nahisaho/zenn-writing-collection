/**
 * RecoveryLogger テスト
 *
 * TSK-1-001: RecoveryLogger実装
 * REQ-SRCH-005-03: フォールバックログ
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  RecoveryLogger,
  DEFAULT_LOGGER_CONFIG,
  type ExtendedLogEntry,
  type RecoveryStats,
} from '../logger.js';

describe('RecoveryLogger', () => {
  let logger: RecoveryLogger;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logger = new RecoveryLogger();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('constructor', () => {
    it('should use default config when no config provided', () => {
      const logger = new RecoveryLogger();
      expect(logger.getAttemptCount()).toBe(0);
    });

    it('should merge custom config with defaults', () => {
      vi.clearAllMocks();
      const customLogger = new RecoveryLogger({ warnThreshold: 10 });
      // 10回失敗するまで警告が出ないことを確認
      for (let i = 0; i < 9; i++) {
        customLogger.log(createFailureEntry('test-query'));
      }
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('High frequency failure')
      );
    });
  });

  describe('log', () => {
    it('should record log entry', () => {
      const entry = createSuccessEntry('test query');
      logger.log(entry);

      const entries = logger.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].originalQuery).toBe('test query');
      expect(entries[0].success).toBe(true);
    });

    it('should assign unique ID to each entry', () => {
      logger.log(createSuccessEntry('query1'));
      logger.log(createSuccessEntry('query2'));

      const entries = logger.getEntries();
      expect(entries[0].id).toBeDefined();
      expect(entries[1].id).toBeDefined();
      expect(entries[0].id).not.toBe(entries[1].id);
    });

    it('should increment attempt count', () => {
      logger.log(createSuccessEntry('query1'));
      logger.log(createSuccessEntry('query2'));
      logger.log(createFailureEntry('query3'));

      expect(logger.getAttemptCount()).toBe(3);
    });

    it('should respect maxEntries limit', () => {
      const smallLogger = new RecoveryLogger({ maxEntries: 5 });

      for (let i = 0; i < 10; i++) {
        smallLogger.log(createSuccessEntry(`query${i}`));
      }

      const entries = smallLogger.getEntries();
      expect(entries).toHaveLength(5);
      // 最新の5件が残っている
      expect(entries[0].originalQuery).toBe('query5');
      expect(entries[4].originalQuery).toBe('query9');
    });
  });

  describe('getStats', () => {
    it('should return empty stats when no entries', () => {
      const stats = logger.getStats();

      expect(stats.totalAttempts).toBe(0);
      expect(stats.successCount).toBe(0);
      expect(stats.failureCount).toBe(0);
      expect(stats.successRate).toBe(0);
    });

    it('should calculate success rate correctly', () => {
      logger.log(createSuccessEntry('q1'));
      logger.log(createSuccessEntry('q2'));
      logger.log(createSuccessEntry('q3'));
      logger.log(createFailureEntry('q4'));

      const stats = logger.getStats();

      expect(stats.totalAttempts).toBe(4);
      expect(stats.successCount).toBe(3);
      expect(stats.failureCount).toBe(1);
      expect(stats.successRate).toBe(0.75);
    });

    it('should calculate average duration', () => {
      logger.log({ ...createSuccessEntry('q1'), durationMs: 100 });
      logger.log({ ...createSuccessEntry('q2'), durationMs: 200 });
      logger.log({ ...createSuccessEntry('q3'), durationMs: 300 });

      const stats = logger.getStats();

      expect(stats.avgDurationMs).toBe(200);
    });

    it('should calculate stats by strategy', () => {
      logger.log({ ...createSuccessEntry('q1'), strategy: 'synonym' });
      logger.log({ ...createSuccessEntry('q2'), strategy: 'synonym' });
      logger.log({ ...createFailureEntry('q3'), strategy: 'synonym' });
      logger.log({ ...createSuccessEntry('q4'), strategy: 'simplify' });

      const stats = logger.getStats();

      expect(stats.byStrategy['synonym'].attempts).toBe(3);
      expect(stats.byStrategy['synonym'].successCount).toBe(2);
      expect(stats.byStrategy['synonym'].successRate).toBeCloseTo(0.667, 2);
      expect(stats.byStrategy['simplify'].attempts).toBe(1);
      expect(stats.byStrategy['simplify'].successRate).toBe(1);
    });

    it('should include period timestamps', () => {
      logger.log(createSuccessEntry('q1'));

      const stats = logger.getStats();

      expect(stats.periodStart).toBeInstanceOf(Date);
      expect(stats.periodEnd).toBeInstanceOf(Date);
      expect(stats.periodEnd.getTime()).toBeGreaterThanOrEqual(
        stats.periodStart.getTime()
      );
    });
  });

  describe('getHighFrequencyQueries', () => {
    it('should return empty array when no failures', () => {
      logger.log(createSuccessEntry('q1'));
      logger.log(createSuccessEntry('q2'));

      const failures = logger.getHighFrequencyQueries();

      expect(failures).toHaveLength(0);
    });

    it('should detect high frequency failures', () => {
      // 同じクエリで5回失敗
      for (let i = 0; i < 5; i++) {
        logger.log(createFailureEntry('problematic-query'));
      }

      const failures = logger.getHighFrequencyQueries();

      expect(failures).toHaveLength(1);
      expect(failures[0].query).toBe('problematic-query');
      expect(failures[0].failureCount).toBe(5);
    });

    it('should use custom threshold', () => {
      for (let i = 0; i < 3; i++) {
        logger.log(createFailureEntry('query'));
      }

      const defaultThreshold = logger.getHighFrequencyQueries(); // threshold: 5
      const customThreshold = logger.getHighFrequencyQueries(3);

      expect(defaultThreshold).toHaveLength(0);
      expect(customThreshold).toHaveLength(1);
    });

    it('should track strategies used for each failed query', () => {
      logger.log({ ...createFailureEntry('query'), strategy: 'synonym' });
      logger.log({ ...createFailureEntry('query'), strategy: 'simplify' });
      logger.log({ ...createFailureEntry('query'), strategy: 'translate' });

      const failures = logger.getHighFrequencyQueries(1);

      expect(failures[0].strategies).toContain('synonym');
      expect(failures[0].strategies).toContain('simplify');
      expect(failures[0].strategies).toContain('translate');
    });

    it('should sort by failure count descending', () => {
      for (let i = 0; i < 3; i++) {
        logger.log(createFailureEntry('low-fail'));
      }
      for (let i = 0; i < 7; i++) {
        logger.log(createFailureEntry('high-fail'));
      }
      for (let i = 0; i < 5; i++) {
        logger.log(createFailureEntry('mid-fail'));
      }

      const failures = logger.getHighFrequencyQueries(1);

      expect(failures[0].query).toBe('high-fail');
      expect(failures[1].query).toBe('mid-fail');
      expect(failures[2].query).toBe('low-fail');
    });
  });

  describe('exportToJson', () => {
    it('should export valid JSON', () => {
      logger.log(createSuccessEntry('q1'));
      logger.log(createFailureEntry('q2'));

      const json = logger.exportToJson();
      const parsed = JSON.parse(json);

      expect(parsed.period).toBeDefined();
      expect(parsed.stats).toBeDefined();
      expect(parsed.stats.totalAttempts).toBe(2);
    });

    it('should include stats and entries', () => {
      logger.log(createSuccessEntry('q1'));

      const json = logger.exportToJson();
      const parsed = JSON.parse(json);

      expect(parsed.stats.successRate).toBe(1);
      expect(parsed.entries).toHaveLength(1);
    });

    it('should limit entries to 100 in export', () => {
      for (let i = 0; i < 150; i++) {
        logger.log(createSuccessEntry(`q${i}`));
      }

      const json = logger.exportToJson();
      const parsed = JSON.parse(json);

      expect(parsed.entries).toHaveLength(100);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      logger.log(createSuccessEntry('q1'));
      logger.log(createFailureEntry('q2'));

      logger.clear();

      expect(logger.getEntries()).toHaveLength(0);
      expect(logger.getAttemptCount()).toBe(0);
      expect(logger.getHighFrequencyQueries(1)).toHaveLength(0);
    });
  });

  describe('warning output', () => {
    it('should output warning when threshold reached', () => {
      vi.clearAllMocks();
      const warnLogger = new RecoveryLogger({ warnThreshold: 3 });

      warnLogger.log(createFailureEntry('problem-query'));
      warnLogger.log(createFailureEntry('problem-query'));
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('High frequency failure')
      );

      warnLogger.log(createFailureEntry('problem-query'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('High frequency failure detected: "problem-query"')
      );
    });

    it('should output stats at interval', () => {
      vi.clearAllMocks();
      const intervalLogger = new RecoveryLogger({ statsInterval: 3 });

      intervalLogger.log(createSuccessEntry('q1'));
      intervalLogger.log(createSuccessEntry('q2'));
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Stats:')
      );

      intervalLogger.log(createSuccessEntry('q3'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('📊 Stats:')
      );
    });
  });
});

// テストヘルパー関数

function createSuccessEntry(
  query: string
): Omit<ExtendedLogEntry, 'id'> {
  return {
    type: 'search',
    originalQuery: query,
    alternativeQuery: `${query} (modified)`,
    strategy: 'synonym',
    resultCount: 10,
    success: true,
    durationMs: 150,
    timestamp: new Date(),
  };
}

function createFailureEntry(
  query: string
): Omit<ExtendedLogEntry, 'id'> {
  return {
    type: 'search',
    originalQuery: query,
    alternativeQuery: `${query} (modified)`,
    strategy: 'synonym',
    resultCount: 0,
    success: false,
    durationMs: 200,
    error: 'No results found',
    timestamp: new Date(),
  };
}
