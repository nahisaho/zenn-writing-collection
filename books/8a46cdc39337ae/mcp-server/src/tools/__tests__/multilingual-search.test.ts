/**
 * @file 多言語検索ユニットテスト
 * @description v1.8.0: REQ-SRCH-004 多言語並列検索のテスト
 * @requirement REQ-SRCH-004-01, REQ-SRCH-004-02, REQ-SRCH-004-04
 */

import { describe, it, expect } from 'vitest';
import {
  detectLanguage,
  translateQuery,
  normalizeUrl,
} from '../search.js';

describe('v1.8.0 多言語検索 (REQ-SRCH-004)', () => {
  describe('detectLanguage (TSK-002)', () => {
    it('日本語のみのクエリを検出', () => {
      expect(detectLanguage('ネオジム磁石')).toBe('ja');
      expect(detectLanguage('自動車業界')).toBe('ja');
      expect(detectLanguage('プロテリアル 磁石')).toBe('ja');
    });

    it('英語のみのクエリを検出', () => {
      expect(detectLanguage('neodymium magnet')).toBe('en');
      expect(detectLanguage('automotive industry')).toBe('en');
      expect(detectLanguage('Proterial')).toBe('en');
    });

    it('混合クエリを検出', () => {
      expect(detectLanguage('ネオジム magnet')).toBe('mixed');
      expect(detectLanguage('TDK 磁石')).toBe('mixed');
      expect(detectLanguage('Proterial ネオジム磁石')).toBe('mixed');
    });
  });

  describe('translateQuery (TSK-003)', () => {
    it('日本語用語を英語に翻訳', () => {
      const result = translateQuery('ネオジム磁石');
      expect(result).toBe('neodymium magnet');
    });

    it('複数用語を翻訳', () => {
      const result = translateQuery('プロテリアル ネオジム磁石');
      expect(result).toBe('Proterial neodymium magnet');
    });

    it('辞書にない語はそのまま', () => {
      const result = translateQuery('未知の用語');
      expect(result).toBeNull();  // 変換なし = null
    });

    it('カスタム辞書で拡張可能', () => {
      const customDict = { 'カスタム語': 'custom term' };
      const result = translateQuery('カスタム語', customDict);
      expect(result).toBe('custom term');
    });

    it('v1.7.0辞書も使用可能', () => {
      // BUILTIN_DICTIONARYの用語
      const result = translateQuery('自動車');
      expect(result).toBe('automotive');
    });
  });

  describe('normalizeUrl (TSK-004)', () => {
    it('末尾スラッシュを削除', () => {
      expect(normalizeUrl('https://example.com/page/')).toBe('https://example.com/page');
    });

    it('トラッキングパラメータを削除', () => {
      const url = 'https://example.com/page?utm_source=test&id=123';
      const normalized = normalizeUrl(url);
      expect(normalized).not.toContain('utm_source');
      expect(normalized).toContain('id=123');
    });

    it('大文字を小文字に正規化', () => {
      expect(normalizeUrl('https://Example.COM/Page')).toBe('https://example.com/page');
    });

    it('フラグメントを削除', () => {
      expect(normalizeUrl('https://example.com/page#section')).toBe('https://example.com/page');
    });

    it('不正なURLはそのまま小文字化', () => {
      expect(normalizeUrl('invalid-url')).toBe('invalid-url');
    });
  });
});
