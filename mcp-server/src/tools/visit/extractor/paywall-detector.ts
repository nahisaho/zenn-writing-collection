/**
 * Paywall Detector
 * REQ-PAY-001: ペイウォール検知機能
 *
 * @remarks
 * - ペイウォールの種類を検出
 * - 代替アクセス方法を提案
 * - 部分コンテンツの割合を推定
 * - TSK-013 実装
 */

import type { PaywallDetectionResult, PaywallType } from './types.js';

/**
 * ペイウォール検知クラス
 */
export class PaywallDetector {
  // ペイウォールを示すキーワードパターン
  private readonly paywallIndicators = {
    hard: [
      'subscribe to continue',
      'subscription required',
      'premium content',
      'members only',
      'subscribers only',
      'buy this article',
      'purchase access',
      '購読が必要',
      '有料会員限定',
      '会員限定記事',
    ],
    soft: [
      'free articles remaining',
      'articles left this month',
      'reached your limit',
      'metered paywall',
      '無料記事の上限',
      '今月の閲覧上限',
    ],
    freemium: [
      'read more with subscription',
      'continue reading',
      'unlock full article',
      'see full content',
      '続きを読む',
      '全文を読む',
    ],
    registration: [
      'sign up to read',
      'create account',
      'register to continue',
      'log in to read',
      '無料会員登録',
      'ログインして続きを読む',
    ],
    subscription: [
      'digital subscription',
      'monthly subscription',
      'annual subscription',
      '月額プラン',
      '年間購読',
    ],
    institutional: [
      'institutional access',
      'campus access',
      'library access',
      'university access',
      '機関購読',
      '大学アクセス',
    ],
  };

  // ペイウォール関連のCSSクラス
  private readonly paywallClasses = [
    'paywall',
    'premium-wall',
    'subscription-wall',
    'member-wall',
    'restricted-content',
    'locked-content',
    'blur-content',
    'fade-content',
  ];

  // ペイウォールを示すDOM構造
  private readonly paywallElements = [
    'paywall',
    'subscription-prompt',
    'premium-prompt',
    'login-wall',
    'registration-wall',
  ];

  /**
   * ペイウォールを検知
   */
  detect(html: string, url: string): PaywallDetectionResult {
    const evidence: string[] = [];
    let paywallType: PaywallType | undefined;
    let confidence = 0;
    let hasPartialContent = false;
    let accessiblePercentage = 100;

    const htmlLower = html.toLowerCase();

    // 1. キーワードベースの検出
    for (const [type, indicators] of Object.entries(this.paywallIndicators)) {
      for (const indicator of indicators) {
        if (htmlLower.includes(indicator.toLowerCase())) {
          paywallType = type as PaywallType;
          confidence = Math.max(confidence, 0.7);
          evidence.push(`Keyword detected: "${indicator}"`);
        }
      }
    }

    // 2. CSSクラスベースの検出
    for (const className of this.paywallClasses) {
      if (htmlLower.includes(`class="${className}"`) || htmlLower.includes(`class='${className}'`) || htmlLower.includes(`class="${className} `) || htmlLower.includes(`class='${className} `)) {
        confidence = Math.max(confidence, 0.8);
        evidence.push(`CSS class detected: "${className}"`);
      }
    }

    // 3. DOM要素ベースの検出
    for (const element of this.paywallElements) {
      if (htmlLower.includes(`id="${element}"`) || htmlLower.includes(`id='${element}'`) || htmlLower.includes(`data-${element}`)) {
        confidence = Math.max(confidence, 0.85);
        evidence.push(`DOM element detected: "${element}"`);
      }
    }

    // 4. コンテンツの切り詰め検出
    const truncationPatterns = [
      /\.{3}\s*<\/p>\s*<div[^>]*class=["'][^"']*paywall/i,
      /続きを読む|read more|continue reading/i,
      /<div[^>]*style=["'][^"']*overflow:\s*hidden/i,
      /<div[^>]*style=["'][^"']*max-height:\s*\d+px/i,
    ];

    for (const pattern of truncationPatterns) {
      if (pattern.test(html)) {
        hasPartialContent = true;
        confidence = Math.max(confidence, 0.6);
        evidence.push('Content truncation detected');
        break;
      }
    }

    // 5. ブラー/フェード効果の検出
    if (
      htmlLower.includes('blur(') ||
      htmlLower.includes('opacity: 0') ||
      htmlLower.includes('gradient-mask') ||
      htmlLower.includes('fade-out')
    ) {
      hasPartialContent = true;
      confidence = Math.max(confidence, 0.65);
      evidence.push('Visual obscuring effect detected');
    }

    // 6. URL/ドメインベースの検出
    const paywallDomains = [
      'nytimes.com',
      'wsj.com',
      'ft.com',
      'economist.com',
      'washingtonpost.com',
      'bloomberg.com',
      'hbr.org',
      'nikkei.com',
      'asahi.com',
      'mainichi.jp',
    ];

    const urlLower = url.toLowerCase();
    for (const domain of paywallDomains) {
      if (urlLower.includes(domain)) {
        confidence = Math.max(confidence, 0.5);
        evidence.push(`Known paywall domain: ${domain}`);
        if (!paywallType) paywallType = 'subscription';
        break;
      }
    }

    // 7. アクセス可能コンテンツの割合を推定
    if (hasPartialContent || confidence > 0.5) {
      accessiblePercentage = this.estimateAccessibleContent(html);
    }

    // 8. 提案を生成
    const suggestions = this.generateSuggestions(paywallType, url, evidence);

    const isPaywalled = confidence >= 0.5;

    return {
      isPaywalled,
      paywallType: isPaywalled ? paywallType : undefined,
      confidence,
      evidence,
      suggestions,
      hasPartialContent,
      accessiblePercentage,
    };
  }

  /**
   * アクセス可能なコンテンツの割合を推定
   */
  private estimateAccessibleContent(html: string): number {
    // 全体のテキスト長
    const fullText = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const fullLength = fullText.length;

    if (fullLength === 0) return 0;

    // ペイウォール要素より前のコンテンツを探す
    const paywallPatterns = [
      /<div[^>]*class=["'][^"']*paywall[^"']*["']/i,
      /<div[^>]*id=["']paywall["']/i,
      /<!--\s*paywall\s*-->/i,
    ];

    for (const pattern of paywallPatterns) {
      const match = html.search(pattern);
      if (match !== -1) {
        const beforePaywall = html.substring(0, match).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        return Math.round((beforePaywall.length / fullLength) * 100);
      }
    }

    // 切り詰めパターンを探す
    const truncationMarkers = ['...', '続きを読む', 'Read more', 'Continue reading'];
    for (const marker of truncationMarkers) {
      const idx = fullText.indexOf(marker);
      if (idx !== -1 && idx < fullLength * 0.5) {
        return Math.round((idx / fullLength) * 100);
      }
    }

    // デフォルト推定
    return 30;
  }

  /**
   * 代替アクセス方法の提案を生成
   */
  private generateSuggestions(
    paywallType: PaywallType | undefined,
    url: string,
    _evidence: string[]
  ): string[] {
    const suggestions: string[] = [];

    // 共通の提案
    suggestions.push(`Archive版を確認: https://web.archive.org/web/*/${url}`);
    suggestions.push(`Googleキャッシュを確認: https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(url)}`);

    // ペイウォールタイプ別の提案
    switch (paywallType) {
      case 'soft':
        suggestions.push('シークレットモードまたはCookieクリアで閲覧可能な場合があります');
        suggestions.push('別のブラウザを試してください');
        break;
      case 'registration':
        suggestions.push('無料会員登録で全文閲覧可能です');
        suggestions.push('一時メールサービスでの登録を検討してください');
        break;
      case 'institutional':
        suggestions.push('大学・研究機関のVPNまたはプロキシ経由でアクセスしてください');
        suggestions.push('図書館のデータベースアクセスを確認してください');
        break;
      case 'hard':
      case 'subscription':
        suggestions.push('著者のプレプリント版がarXivやResearchGateで公開されている可能性があります');
        suggestions.push('著者に直接連絡して論文を請求することも一般的です');
        break;
    }

    // 学術コンテンツの場合
    if (url.includes('doi.org') || url.includes('journal') || url.includes('paper')) {
      suggestions.push('Unpaywall (ブラウザ拡張) でOA版を自動検索できます');
      suggestions.push('Semantic Scholarで関連論文を検索: https://www.semanticscholar.org/');
    }

    return suggestions;
  }
}

// シングルトンインスタンス
let paywallDetectorInstance: PaywallDetector | null = null;

/**
 * PaywallDetectorのシングルトンインスタンスを取得
 */
export function getPaywallDetector(): PaywallDetector {
  if (!paywallDetectorInstance) {
    paywallDetectorInstance = new PaywallDetector();
  }
  return paywallDetectorInstance;
}
