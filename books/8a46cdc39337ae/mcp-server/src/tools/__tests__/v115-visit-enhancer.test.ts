/**
 * v1.15.0 Visit Enhancer Tests
 * 
 * @vitest-environment node
 */

import { describe, it, expect, vi } from 'vitest';
import { analyzeBeforeVisit, extractStructuredData, enhanceVisit, getAlternativeSources, canEnhanceVisit } from '../visit/v115-visit-enhancer.js';

// モック設定ローダー
vi.mock('../../config/loader.js', () => ({
  getV115FeaturesConfig: vi.fn().mockReturnValue({
    paywallDetection: {
      enabled: true,
      suggestAlternatives: true,
    },
    alternativeSources: {
      enabled: true,
      maxSuggestions: 3,
      maxResults: 5,
    },
    structuredExtraction: {
      enabled: true,
      extractImages: true,
      extractTables: true,
      outputFormat: 'json',
    },
  }),
  isV115FeatureEnabled: vi.fn().mockImplementation((feature: string) => {
    const enabled: Record<string, boolean> = {
      paywallDetection: true,
      alternativeSources: true,
      structuredExtraction: true,
    };
    return enabled[feature] ?? false;
  }),
}));

// モックAlternativeSourceManager
vi.mock('../visit/alternative/index.js', () => ({
  getAlternativeSourceManager: vi.fn().mockReturnValue({
    loadSources: vi.fn().mockResolvedValue(undefined),
    detectContentType: vi.fn().mockReturnValue('scientific_paper'),
    extractIdentifiers: vi.fn().mockReturnValue([
      { type: 'doi', value: '10.1234/test.example' }
    ]),
    findAlternatives: vi.fn().mockResolvedValue({
      contentType: 'scientific_paper',
      identifiers: [{ type: 'doi', value: '10.1234/test.example' }],
      alternatives: [
        {
          url: 'https://arxiv.org/abs/1234.5678',
          source: { name: 'arXiv', type: 'preprint' },
          confidence: 0.9,
          reason: 'DOI match',
        },
      ],
    }),
  }),
}));

// モックExtractorPipeline
vi.mock('../visit/extractor/index.js', () => ({
  getExtractorPipeline: vi.fn().mockReturnValue({
    extract: vi.fn().mockImplementation((html: string, url: string) => ({
      contentType: 'paper',
      data: {
        title: 'Test Paper Title',
        authors: ['Author 1', 'Author 2'],
        abstract: 'This is a test abstract.',
      },
      images: [],
      tables: [],
      metadata: {
        extractedAt: new Date().toISOString(),
        confidence: 0.85,
        fieldCount: 3,
      },
    })),
  }),
  getPaywallDetector: vi.fn().mockReturnValue({
    detect: vi.fn().mockImplementation((html: string, url: string) => {
      const isPaywalled = html.includes('paywall') || html.includes('subscribe');
      return {
        isPaywalled,
        paywallType: isPaywalled ? 'soft' : null,
        confidence: isPaywalled ? 0.87 : 0,
        accessiblePercentage: isPaywalled ? 30 : 100,
        signals: isPaywalled ? [{ type: 'text', match: 'subscribe', confidence: 0.9 }] : [],
      };
    }),
  }),
}));

describe('v1.15.0 Visit Enhancer', () => {
  const sampleHtml = `
    <html>
      <head><title>Test Paper</title></head>
      <body>
        <h1>Test Paper Title</h1>
        <p>Content here</p>
      </body>
    </html>
  `;

  const paywallHtml = `
    <html>
      <head><title>Premium Article</title></head>
      <body>
        <div class="paywall">
          <p>Subscribe to continue reading...</p>
        </div>
      </body>
    </html>
  `;

  describe('analyzeBeforeVisit', () => {
    it('should detect paywall', async () => {
      const result = await analyzeBeforeVisit('https://example.com/article', paywallHtml);
      
      expect(result.paywallDetection).toBeDefined();
      expect(result.paywallDetection?.isPaywalled).toBe(true);
    });

    it('should find alternative sources', async () => {
      const result = await analyzeBeforeVisit('https://doi.org/10.1234/test', sampleHtml, {
        isPaper: true,
      });
      
      expect(result.alternativeSources).toBeDefined();
      expect(result.alternativeSources?.alternatives.length).toBeGreaterThan(0);
    });

    it('should return wasEnhanced true when paywall detected', async () => {
      const result = await analyzeBeforeVisit('https://example.com/article', paywallHtml);
      
      expect(result.wasEnhanced).toBe(true);
    });

    it('should include enhancement notes', async () => {
      const result = await analyzeBeforeVisit('https://example.com/article', paywallHtml);
      
      expect(Array.isArray(result.enhancementNotes)).toBe(true);
    });
  });

  describe('extractStructuredData', () => {
    it('should extract paper data', async () => {
      const result = await extractStructuredData('https://arxiv.org/abs/1234.5678', sampleHtml, {
        isPaper: true,
      });
      
      expect(result).toBeDefined();
      expect(result?.contentType).toBe('paper');
      expect(result?.data.title).toBeDefined();
    });

    it('should extract with content type hint', async () => {
      const result = await extractStructuredData('https://patents.google.com/patent/US123', sampleHtml, {
        isPatent: true,
      });
      
      expect(result).toBeDefined();
    });

    it('should return metadata', async () => {
      const result = await extractStructuredData('https://example.com', sampleHtml);
      
      expect(result?.metadata).toBeDefined();
      expect(result?.metadata.confidence).toBeGreaterThan(0);
    });
  });

  describe('enhanceVisit', () => {
    it('should perform full enhancement', async () => {
      const result = await enhanceVisit('https://doi.org/10.1234/test', sampleHtml, {
        isPaper: true,
      });
      
      expect(result.originalUrl).toBe('https://doi.org/10.1234/test');
      expect(result.structuredData).toBeDefined();
    });

    it('should include all enhancement components', async () => {
      const result = await enhanceVisit('https://doi.org/10.1234/test', paywallHtml, {
        isPaper: true,
      });
      
      expect(result.paywallDetection).toBeDefined();
      expect(result.alternativeSources).toBeDefined();
    });

    it('should set wasEnhanced correctly', async () => {
      const result = await enhanceVisit('https://example.com', sampleHtml);
      
      expect(typeof result.wasEnhanced).toBe('boolean');
    });
  });

  describe('getAlternativeSources', () => {
    it('should return alternative sources', async () => {
      const alternatives = await getAlternativeSources('https://doi.org/10.1234/test', sampleHtml);
      
      expect(Array.isArray(alternatives)).toBe(true);
    });

    it('should include source metadata', async () => {
      const alternatives = await getAlternativeSources('https://doi.org/10.1234/test', sampleHtml);
      
      if (alternatives.length > 0) {
        expect(alternatives[0].url).toBeDefined();
        expect(alternatives[0].name).toBeDefined();
        expect(alternatives[0].confidence).toBeDefined();
      }
    });
  });

  describe('canEnhanceVisit', () => {
    it('should return true for academic URLs', () => {
      const result = canEnhanceVisit('https://doi.org/10.1234/test');
      
      expect(result.canEnhance).toBe(true);
      expect(result.reasons.some((r) => r.includes('Scientific paper'))).toBe(true);
    });

    it('should return true for patent URLs', () => {
      const result = canEnhanceVisit('https://patents.google.com/patent/US123');
      
      expect(result.canEnhance).toBe(true);
      expect(result.reasons.some((r) => r.includes('Patent'))).toBe(true);
    });

    it('should return true for news URLs with paywall', () => {
      const result = canEnhanceVisit('https://www.nytimes.com/article');
      
      expect(result.canEnhance).toBe(true);
      expect(result.reasons.some((r) => r.includes('paywall') || r.includes('Paywall'))).toBe(true);
    });

    it('should return false for general URLs', () => {
      const result = canEnhanceVisit('https://example.com/page');
      
      expect(result.canEnhance).toBe(false);
    });
  });
});
