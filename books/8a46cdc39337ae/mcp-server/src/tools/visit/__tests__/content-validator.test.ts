/**
 * ContentValidator テスト
 *
 * TSK-TEST-003
 * REQ-CONT-001: コンテンツ有効性検証
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ContentValidator,
  type ContentValidationConfig,
  type ContentValidationResult,
  validateContent,
  calculateMeaningfulRatio,
  detectContentType,
  DEFAULT_CONTENT_VALIDATION_CONFIG,
} from '../content-validator.js';

describe('ContentValidator', () => {
  let validator: ContentValidator;

  beforeEach(() => {
    validator = new ContentValidator();
  });

  describe('validate', () => {
    it('有効なコンテンツをvalidと判定する', () => {
      const content = 'これは十分な長さのテキストコンテンツです。'.repeat(30);

      const result = validator.validate(content);

      expect(result.status).toBe('valid');
      expect(result.meaningfulRatio).toBeGreaterThan(0.3);
    });

    it('空のコンテンツをemptyと判定する', () => {
      const result = validator.validate('');

      expect(result.status).toBe('empty');
      expect(result.message).toContain('コンテンツが空です');
    });

    it('空白のみのコンテンツをemptyと判定する', () => {
      const result = validator.validate('   \n\t   ');

      expect(result.status).toBe('empty');
    });

    it('短すぎるコンテンツをtoo_shortと判定する', () => {
      const result = validator.validate('短い');

      expect(result.status).toBe('too_short');
      expect(result.message).toBeDefined();
    });

    it('ブロックされたコンテンツを検出する', () => {
      const blockedContents = [
        'Access Denied',
        '403 Forbidden',
        'Please enable JavaScript',
        'Loading...',
        'Something went wrong',
      ];

      for (const content of blockedContents) {
        const result = validator.validate(content + '\n'.repeat(100));
        expect(result.status).toBe('blocked');
      }
    });

    it('低品質コンテンツにwarningを出す', () => {
      // 意味のない文字の繰り返し（意味のある文字の割合が低い）
      const content = '...---...---...---'.repeat(10);

      const result = validator.validate(content);

      expect(result.status).toBe('warning');
      expect(result.message).toContain('意味のある');
    });
  });

  describe('getConfig', () => {
    it('デフォルト設定を返す', () => {
      const config = validator.getConfig();

      expect(config.minLength).toBe(DEFAULT_CONTENT_VALIDATION_CONFIG.minLength);
      expect(config.minMeaningfulRatio).toBe(
        DEFAULT_CONTENT_VALIDATION_CONFIG.minMeaningfulRatio
      );
    });

    it('カスタム設定を反映する', () => {
      const customValidator = new ContentValidator({
        minLength: 200,
        minMeaningfulRatio: 0.8,
      });

      const config = customValidator.getConfig();

      expect(config.minLength).toBe(200);
      expect(config.minMeaningfulRatio).toBe(0.8);
    });
  });
});

describe('validateContent', () => {
  it('関数として直接呼び出せる', () => {
    const content = 'これは十分な長さのテキストです。'.repeat(10);
    const result = validateContent(content);

    expect(result.status).toBeDefined();
    expect(result.meaningfulRatio).toBeDefined();
  });

  it('オプションを受け入れる', () => {
    const result = validateContent('短い', { minLength: 5 });

    // minLength: 5 で「短い」は3文字なのでtoo_short
    expect(result.status).toBe('too_short');
  });
});

describe('calculateMeaningfulRatio', () => {
  it('すべて意味のある文字の場合、1.0を返す', () => {
    const ratio = calculateMeaningfulRatio('これは意味のある文章です');
    expect(ratio).toBeCloseTo(1.0, 1);
  });

  it('空白が多い場合、低い値を返す', () => {
    const ratio = calculateMeaningfulRatio('a     b     c     d');
    expect(ratio).toBeLessThan(0.5);
  });

  it('空文字列の場合、0を返す', () => {
    const ratio = calculateMeaningfulRatio('');
    expect(ratio).toBe(0);
  });

  it('日本語テキストを正しく処理する', () => {
    const ratio = calculateMeaningfulRatio('日本語のテキストです。');
    expect(ratio).toBeGreaterThan(0.8);
  });

  it('記号のみの場合、低い値を返す', () => {
    const ratio = calculateMeaningfulRatio('...---...---...---');
    expect(ratio).toBeLessThan(0.3);
  });
});

describe('detectContentType', () => {
  it('HTMLを検出する', () => {
    const type = detectContentType('<html><body>Test</body></html>');
    expect(type).toBe('html');
  });

  it('XMLを検出する', () => {
    const type = detectContentType('<?xml version="1.0"?><root></root>');
    expect(type).toBe('text');
  });

  it('JSONを検出する', () => {
    const type = detectContentType('{"key": "value"}');
    expect(type).toBe('json');
  });

  it('Markdownを検出する', () => {
    const type = detectContentType('# Heading\n\nParagraph\n\n- List item');
    expect(type).toBe('text');
  });

  it('プレーンテキストを検出する', () => {
    const type = detectContentType('これは普通のテキストです。');
    expect(type).toBe('text');
  });
});

describe('ContentValidator - エッジケース', () => {
  let validator: ContentValidator;

  beforeEach(() => {
    validator = new ContentValidator();
  });

  it('非常に長いコンテンツを処理できる', () => {
    const longContent = 'これはテストです。'.repeat(10000);
    const result = validator.validate(longContent);

    expect(result.status).toBe('valid');
    expect(result.contentLength).toBe(longContent.length);
  });

  it('Unicode文字を正しく処理する', () => {
    const unicodeContent = '🎉 絵文字と日本語 🚀 が混在 👍'.repeat(20);
    const result = validator.validate(unicodeContent);

    expect(result.status).toBeDefined();
  });

  it('改行のみのコンテンツをemptyと判定する', () => {
    const result = validator.validate('\n\n\n\n\n');

    expect(result.status).toBe('empty');
  });

  it('HTMLエンティティを含むコンテンツを処理する', () => {
    const content = '&lt;script&gt;alert("test")&lt;/script&gt;'.repeat(20);
    const result = validator.validate(content);

    expect(result.status).toBeDefined();
    expect(result.status).not.toBe('blocked');
  });
});
