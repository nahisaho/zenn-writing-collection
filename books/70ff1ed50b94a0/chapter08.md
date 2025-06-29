---
title: "第8章：トラブルシューティングとデバッグ"
---

# 第8章：トラブルシューティングとデバッグ

本章では、Microsoft Entra IDとのSSO連携で発生する一般的なエラーと、その効果的な診断・解決方法について詳しく解説します。実際の開発・運用現場で遭遇するトラブルパターンを整理し、体系的なデバッグアプローチを提供します。

## 8.1 一般的なエラーとその対処法

### SAML 関連エラー

**1. SAML Response Validation Failed**

```xml
<!-- 問題のあるSAMLレスポンス例 -->
<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                ID="_8e8dc5f69a98cc4c1ff3427e5ce34606fd672f91e6"
                Version="2.0"
                IssueInstant="2024-01-15T09:30:10.123Z">
  <saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
    https://login.microsoftonline.com/wrong-tenant-id/
  </saml:Issuer>
  <!-- ... -->
</samlp:Response>
```

**診断手順**

```javascript
class SAMLResponseValidator {
  constructor(expectedIssuer, expectedAudience) {
    this.expectedIssuer = expectedIssuer;
    this.expectedAudience = expectedAudience;
  }

  async validateResponse(samlResponse, certificate) {
    const diagnostics = {
      validationErrors: [],
      warnings: [],
      details: {}
    };

    try {
      // 1. XML構造の検証
      const doc = this.parseXML(samlResponse);
      if (!doc) {
        diagnostics.validationErrors.push('Invalid XML format');
        return diagnostics;
      }

      // 2. 署名検証
      const signatureValid = await this.verifySignature(doc, certificate);
      if (!signatureValid) {
        diagnostics.validationErrors.push('Digital signature verification failed');
      }
      diagnostics.details.signatureValid = signatureValid;

      // 3. 発行者（Issuer）の検証
      const issuer = this.extractIssuer(doc);
      diagnostics.details.actualIssuer = issuer;
      if (issuer !== this.expectedIssuer) {
        diagnostics.validationErrors.push(
          `Invalid issuer: expected '${this.expectedIssuer}', got '${issuer}'`
        );
      }

      // 4. オーディエンス（Audience）の検証
      const audience = this.extractAudience(doc);
      diagnostics.details.actualAudience = audience;
      if (audience !== this.expectedAudience) {
        diagnostics.validationErrors.push(
          `Invalid audience: expected '${this.expectedAudience}', got '${audience}'`
        );
      }

      // 5. 時刻検証
      const timeValidation = this.validateTimestamps(doc);
      diagnostics.details.timeValidation = timeValidation;
      if (!timeValidation.valid) {
        diagnostics.validationErrors.push(timeValidation.error);
      }

      // 6. 属性検証
      const attributes = this.extractAttributes(doc);
      diagnostics.details.attributes = attributes;
      
      // 必須属性の確認
      const requiredAttributes = ['email', 'name'];
      const missingAttributes = requiredAttributes.filter(attr => !attributes[attr]);
      if (missingAttributes.length > 0) {
        diagnostics.warnings.push(`Missing attributes: ${missingAttributes.join(', ')}`);
      }

    } catch (error) {
      diagnostics.validationErrors.push(`Validation error: ${error.message}`);
    }

    return diagnostics;
  }

  parseXML(samlResponse) {
    try {
      const xmlDoc = new DOMParser().parseFromString(samlResponse, 'application/xml');
      const errorNode = xmlDoc.querySelector('parsererror');
      if (errorNode) {
        throw new Error(`XML parsing error: ${errorNode.textContent}`);
      }
      return xmlDoc;
    } catch (error) {
      console.error('XML parsing failed:', error);
      return null;
    }
  }

  extractIssuer(doc) {
    const issuerElement = doc.querySelector('saml\\:Issuer, Issuer');
    return issuerElement ? issuerElement.textContent.trim() : null;
  }

  extractAudience(doc) {
    const audienceElement = doc.querySelector('saml\\:Audience, Audience');
    return audienceElement ? audienceElement.textContent.trim() : null;
  }

  validateTimestamps(doc) {
    const now = new Date();
    const clockSkew = 5 * 60 * 1000; // 5分の時刻ずれを許容

    // NotBefore チェック
    const notBeforeElement = doc.querySelector('[NotBefore]');
    if (notBeforeElement) {
      const notBefore = new Date(notBeforeElement.getAttribute('NotBefore'));
      if (now < notBefore - clockSkew) {
        return {
          valid: false,
          error: `Assertion not yet valid: NotBefore ${notBefore.toISOString()}`
        };
      }
    }

    // NotOnOrAfter チェック
    const notOnOrAfterElement = doc.querySelector('[NotOnOrAfter]');
    if (notOnOrAfterElement) {
      const notOnOrAfter = new Date(notOnOrAfterElement.getAttribute('NotOnOrAfter'));
      if (now >= notOnOrAfter + clockSkew) {
        return {
          valid: false,
          error: `Assertion expired: NotOnOrAfter ${notOnOrAfter.toISOString()}`
        };
      }
    }

    return { valid: true };
  }

  extractAttributes(doc) {
    const attributes = {};
    const attributeElements = doc.querySelectorAll('saml\\:Attribute, Attribute');
    
    attributeElements.forEach(attr => {
      const name = attr.getAttribute('Name');
      const valueElement = attr.querySelector('saml\\:AttributeValue, AttributeValue');
      if (name && valueElement) {
        // よく使用される属性名のマッピング
        const attributeMap = {
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'email',
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'name',
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname': 'firstName',
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname': 'lastName'
        };
        
        const mappedName = attributeMap[name] || name;
        attributes[mappedName] = valueElement.textContent;
      }
    });

    return attributes;
  }

  // 診断レポートの生成
  generateDiagnosticReport(diagnostics) {
    let report = '## SAML Response Validation Report\n\n';
    
    if (diagnostics.validationErrors.length === 0) {
      report += '✅ **Validation Status**: PASSED\n\n';
    } else {
      report += '❌ **Validation Status**: FAILED\n\n';
      report += '### Errors:\n';
      diagnostics.validationErrors.forEach((error, index) => {
        report += `${index + 1}. ${error}\n`;
      });
      report += '\n';
    }

    if (diagnostics.warnings.length > 0) {
      report += '### Warnings:\n';
      diagnostics.warnings.forEach((warning, index) => {
        report += `${index + 1}. ${warning}\n`;
      });
      report += '\n';
    }

    report += '### Details:\n';
    report += `- **Issuer**: ${diagnostics.details.actualIssuer || 'Not found'}\n`;
    report += `- **Audience**: ${diagnostics.details.actualAudience || 'Not found'}\n`;
    report += `- **Signature Valid**: ${diagnostics.details.signatureValid ? 'Yes' : 'No'}\n`;
    
    if (diagnostics.details.attributes) {
      report += '- **Attributes**:\n';
      Object.entries(diagnostics.details.attributes).forEach(([key, value]) => {
        report += `  - ${key}: ${value}\n`;
      });
    }

    return report;
  }
}

// 使用例
async function troubleshootSAMLResponse(samlResponse, certificate) {
  const validator = new SAMLResponseValidator(
    'https://login.microsoftonline.com/your-tenant-id/',
    'https://yourapp.example.com'
  );

  const diagnostics = await validator.validateResponse(samlResponse, certificate);
  const report = validator.generateDiagnosticReport(diagnostics);
  
  console.log(report);
  
  // 問題がある場合の修正提案
  if (diagnostics.validationErrors.length > 0) {
    console.log('\n## Recommended Actions:');
    diagnostics.validationErrors.forEach(error => {
      if (error.includes('Invalid issuer')) {
        console.log('- Check Azure AD Enterprise Application configuration');
        console.log('- Verify the correct Tenant ID is used');
      }
      if (error.includes('Digital signature')) {
        console.log('- Verify the signing certificate in Azure AD');
        console.log('- Check certificate expiration date');
        console.log('- Ensure certificate is properly imported in your application');
      }
      if (error.includes('Assertion expired')) {
        console.log('- Check system time synchronization');
        console.log('- Adjust clock skew tolerance');
      }
    });
  }
}
```

**2. Certificate Validation Error**

```javascript
class CertificateValidator {
  async validateCertificate(certificate) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      details: {}
    };

    try {
      // PEM形式の証明書をパース
      const cert = this.parsePEMCertificate(certificate);
      validation.details.subject = cert.subject;
      validation.details.issuer = cert.issuer;
      validation.details.validFrom = cert.validFrom;
      validation.details.validTo = cert.validTo;

      // 有効期限チェック
      const now = new Date();
      const validFrom = new Date(cert.validFrom);
      const validTo = new Date(cert.validTo);

      if (now < validFrom) {
        validation.errors.push('Certificate is not yet valid');
        validation.isValid = false;
      }

      if (now > validTo) {
        validation.errors.push('Certificate has expired');
        validation.isValid = false;
      }

      // 期限切れが近い場合の警告
      const daysUntilExpiry = Math.floor((validTo - now) / (24 * 60 * 60 * 1000));
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        validation.warnings.push(`Certificate expires in ${daysUntilExpiry} days`);
      }

      // 証明書チェーンの検証
      const chainValidation = await this.validateCertificateChain(certificate);
      if (!chainValidation.valid) {
        validation.errors.push('Certificate chain validation failed');
        validation.isValid = false;
      }

      validation.details.chainValidation = chainValidation;

    } catch (error) {
      validation.errors.push(`Certificate parsing error: ${error.message}`);
      validation.isValid = false;
    }

    return validation;
  }

  parsePEMCertificate(pemString) {
    // 実際の実装では、crypto ライブラリを使用
    const crypto = require('crypto');
    
    try {
      const cert = new crypto.X509Certificate(pemString);
      return {
        subject: cert.subject,
        issuer: cert.issuer,
        validFrom: cert.validFrom,
        validTo: cert.validTo,
        fingerprint: cert.fingerprint,
        publicKey: cert.publicKey
      };
    } catch (error) {
      throw new Error(`Invalid certificate format: ${error.message}`);
    }
  }

  async validateCertificateChain(certificate) {
    // 証明書チェーンの検証ロジック
    // 実際の実装では、ルート証明書との照合が必要
    return {
      valid: true,
      details: 'Certificate chain validation passed'
    };
  }
}
```

### OpenID Connect / OAuth 2.0 関連エラー

**3. Invalid Grant Error**

```javascript
class OAuthErrorHandler {
  static handleTokenError(error) {
    const errorCode = error.error;
    const errorDescription = error.error_description;
    
    const troubleshooting = {
      error: errorCode,
      description: errorDescription,
      possibleCauses: [],
      solutions: [],
      nextSteps: []
    };

    switch (errorCode) {
      case 'invalid_grant':
        troubleshooting.possibleCauses = [
          'Authorization code has expired (typically 10 minutes)',
          'Authorization code has already been used',
          'Code verifier does not match code challenge (PKCE)',
          'Redirect URI mismatch',
          'Client ID/Secret incorrect'
        ];
        
        troubleshooting.solutions = [
          'Regenerate authorization code and retry immediately',
          'Verify PKCE implementation (code_verifier and code_challenge)',
          'Check redirect URI exact match',
          'Validate client credentials'
        ];
        
        troubleshooting.nextSteps = [
          'Review authorization request parameters',
          'Check server logs for timing issues',
          'Implement proper error handling and retry logic'
        ];
        break;

      case 'invalid_client':
        troubleshooting.possibleCauses = [
          'Client ID is incorrect',
          'Client secret is incorrect or expired',
          'Client authentication method mismatch',
          'Application is not registered for the tenant'
        ];
        
        troubleshooting.solutions = [
          'Verify client ID in Azure portal',
          'Regenerate client secret',
          'Check client authentication method configuration',
          'Ensure application is registered in correct tenant'
        ];
        break;

      case 'invalid_scope':
        troubleshooting.possibleCauses = [
          'Requested scope is not configured for the application',
          'Scope name is misspelled',
          'User lacks permission for the requested scope'
        ];
        
        troubleshooting.solutions = [
          'Review API permissions in Azure portal',
          'Request admin consent for application permissions',
          'Check scope name spelling'
        ];
        break;

      case 'consent_required':
        troubleshooting.possibleCauses = [
          'User has not consented to the requested permissions',
          'Admin consent is required but not granted',
          'Consent has been revoked'
        ];
        
        troubleshooting.solutions = [
          'Redirect user to consent URL',
          'Request admin to grant tenant-wide consent',
          'Implement incremental consent flow'
        ];
        break;
    }

    return troubleshooting;
  }

  static generateErrorReport(error, context = {}) {
    const troubleshooting = this.handleTokenError(error);
    
    let report = `# OAuth/OIDC Error Analysis\n\n`;
    report += `**Error Code**: \`${troubleshooting.error}\`\n`;
    report += `**Description**: ${troubleshooting.description}\n\n`;
    
    if (context.timestamp) {
      report += `**Timestamp**: ${new Date(context.timestamp).toISOString()}\n`;
    }
    
    if (context.correlationId) {
      report += `**Correlation ID**: ${context.correlationId}\n`;
    }
    
    if (context.userAgent) {
      report += `**User Agent**: ${context.userAgent}\n`;
    }
    
    report += `\n## Possible Causes\n`;
    troubleshooting.possibleCauses.forEach((cause, index) => {
      report += `${index + 1}. ${cause}\n`;
    });
    
    report += `\n## Recommended Solutions\n`;
    troubleshooting.solutions.forEach((solution, index) => {
      report += `${index + 1}. ${solution}\n`;
    });
    
    report += `\n## Next Steps\n`;
    troubleshooting.nextSteps.forEach((step, index) => {
      report += `${index + 1}. ${step}\n`;
    });
    
    return report;
  }
}

// 使用例
async function handleOAuthError(error, request) {
  const context = {
    timestamp: Date.now(),
    correlationId: request.correlationId,
    userAgent: request.get('User-Agent'),
    clientId: request.body.client_id,
    scopes: request.body.scope
  };

  const report = OAuthErrorHandler.generateErrorReport(error, context);
  console.log(report);

  // ログに記録
  logger.error('OAuth error occurred', {
    error: error,
    context: context,
    report: report
  });

  // 開発環境では詳細なエラー情報を返す
  if (process.env.NODE_ENV === 'development') {
    return {
      error: error.error,
      error_description: error.error_description,
      troubleshooting: OAuthErrorHandler.handleTokenError(error)
    };
  }

  // 本番環境では一般的なエラーメッセージのみ
  return {
    error: 'authentication_failed',
    error_description: 'Authentication failed. Please try again.'
  };
}
```

**4. Token Validation Failed**

```javascript
class TokenValidator {
  constructor(issuer, audience, signingKeys) {
    this.issuer = issuer;
    this.audience = audience;
    this.signingKeys = signingKeys;
  }

  async validateToken(token) {
    const validation = {
      isValid: false,
      errors: [],
      claims: null,
      details: {}
    };

    try {
      // JWTの構造検証
      const parts = token.split('.');
      if (parts.length !== 3) {
        validation.errors.push('Invalid JWT format');
        return validation;
      }

      // ヘッダーとペイロードのデコード
      const header = JSON.parse(this.base64UrlDecode(parts[0]));
      const payload = JSON.parse(this.base64UrlDecode(parts[1]));
      
      validation.details.header = header;
      validation.details.payload = payload;

      // アルゴリズム検証
      if (!['RS256', 'RS384', 'RS512'].includes(header.alg)) {
        validation.errors.push(`Unsupported algorithm: ${header.alg}`);
      }

      // 発行者検証
      if (payload.iss !== this.issuer) {
        validation.errors.push(`Invalid issuer: expected ${this.issuer}, got ${payload.iss}`);
      }

      // オーディエンス検証
      const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
      if (!audiences.includes(this.audience)) {
        validation.errors.push(`Invalid audience: expected ${this.audience}, got ${payload.aud}`);
      }

      // 有効期限検証
      const now = Math.floor(Date.now() / 1000);
      const clockSkew = 300; // 5分の時刻ずれを許容

      if (payload.exp && now > payload.exp + clockSkew) {
        validation.errors.push(`Token expired: exp ${payload.exp}, now ${now}`);
      }

      if (payload.nbf && now < payload.nbf - clockSkew) {
        validation.errors.push(`Token not yet valid: nbf ${payload.nbf}, now ${now}`);
      }

      // 署名検証
      const signatureValid = await this.verifySignature(token, header);
      if (!signatureValid) {
        validation.errors.push('Invalid signature');
      }

      validation.details.signatureValid = signatureValid;

      // 必須クレームの検証
      const requiredClaims = ['sub', 'iat'];
      const missingClaims = requiredClaims.filter(claim => !payload[claim]);
      if (missingClaims.length > 0) {
        validation.errors.push(`Missing required claims: ${missingClaims.join(', ')}`);
      }

      // トークンが有効な場合
      if (validation.errors.length === 0) {
        validation.isValid = true;
        validation.claims = payload;
      }

    } catch (error) {
      validation.errors.push(`Token validation error: ${error.message}`);
    }

    return validation;
  }

  base64UrlDecode(str) {
    str += '='.repeat((4 - str.length % 4) % 4);
    return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  }

  async verifySignature(token, header) {
    try {
      const signingKey = this.getSigningKey(header.kid);
      if (!signingKey) {
        throw new Error(`No signing key found for kid: ${header.kid}`);
      }

      // 実際の署名検証はcryptoライブラリを使用
      const crypto = require('crypto');
      const [headerB64, payloadB64, signature] = token.split('.');
      const signedData = `${headerB64}.${payloadB64}`;
      
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(signedData);
      verify.end();
      
      const signatureBuffer = Buffer.from(signature.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
      return verify.verify(signingKey.publicKey, signatureBuffer);
      
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  getSigningKey(kid) {
    return this.signingKeys.find(key => key.kid === kid);
  }

  generateValidationReport(validation) {
    let report = '# Token Validation Report\n\n';
    
    if (validation.isValid) {
      report += '✅ **Status**: Valid\n\n';
      report += '## Token Claims\n';
      if (validation.claims) {
        Object.entries(validation.claims).forEach(([key, value]) => {
          report += `- **${key}**: ${typeof value === 'object' ? JSON.stringify(value) : value}\n`;
        });
      }
    } else {
      report += '❌ **Status**: Invalid\n\n';
      report += '## Validation Errors\n';
      validation.errors.forEach((error, index) => {
        report += `${index + 1}. ${error}\n`;
      });
    }

    if (validation.details.header) {
      report += '\n## Token Header\n';
      report += '```json\n';
      report += JSON.stringify(validation.details.header, null, 2);
      report += '\n```\n';
    }

    return report;
  }
}
```

## 8.2 認証フローのデバッグツール

### HTTP トラフィック監視ツール

```javascript
class AuthFlowDebugger {
  constructor() {
    this.requests = [];
    this.responses = [];
    this.timeline = [];
  }

  // HTTP リクエスト/レスポンスの記録
  logHttpExchange(request, response, timing) {
    const exchange = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      headers: this.sanitizeHeaders(request.headers),
      body: this.sanitizeBody(request.body),
      response: {
        status: response.status,
        headers: this.sanitizeHeaders(response.headers),
        body: this.sanitizeBody(response.body)
      },
      timing: timing,
      type: this.classifyRequest(request.url)
    };

    this.timeline.push(exchange);
    return exchange.id;
  }

  classifyRequest(url) {
    if (url.includes('/authorize')) return 'AUTHORIZATION_REQUEST';
    if (url.includes('/token')) return 'TOKEN_REQUEST';
    if (url.includes('/userinfo')) return 'USERINFO_REQUEST';
    if (url.includes('/.well-known/')) return 'DISCOVERY_REQUEST';
    if (url.includes('/logout')) return 'LOGOUT_REQUEST';
    return 'OTHER';
  }

  sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  sanitizeBody(body) {
    if (!body) return null;
    
    if (typeof body === 'string') {
      // URLエンコードされたフォームデータの処理
      if (body.includes('client_secret=') || body.includes('password=')) {
        return body.replace(/(client_secret|password)=[^&]*/g, '$1=[REDACTED]');
      }
    }

    if (typeof body === 'object') {
      const sanitized = { ...body };
      const sensitiveFields = ['client_secret', 'password', 'code_verifier'];
      
      sensitiveFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      });

      return sanitized;
    }

    return body;
  }

  // 認証フローの分析
  analyzeAuthFlow() {
    const analysis = {
      totalRequests: this.timeline.length,
      requestTypes: {},
      errors: [],
      warnings: [],
      timeline: this.timeline.map(entry => ({
        timestamp: entry.timestamp,
        type: entry.type,
        url: entry.url,
        status: entry.response.status,
        duration: entry.timing?.duration || 0
      }))
    };

    // リクエストタイプ別の集計
    this.timeline.forEach(entry => {
      if (!analysis.requestTypes[entry.type]) {
        analysis.requestTypes[entry.type] = 0;
      }
      analysis.requestTypes[entry.type]++;

      // エラーの検出
      if (entry.response.status >= 400) {
        analysis.errors.push({
          type: entry.type,
          url: entry.url,
          status: entry.response.status,
          timestamp: entry.timestamp
        });
      }

      // 警告の検出
      if (entry.timing?.duration > 5000) {
        analysis.warnings.push({
          type: 'SLOW_REQUEST',
          message: `Slow request detected: ${entry.url} took ${entry.timing.duration}ms`,
          timestamp: entry.timestamp
        });
      }
    });

    // 認証フローの完全性チェック
    const flowValidation = this.validateAuthFlow();
    analysis.flowValidation = flowValidation;

    return analysis;
  }

  validateAuthFlow() {
    const validation = {
      isComplete: false,
      missingSteps: [],
      recommendations: []
    };

    const requestTypes = this.timeline.map(entry => entry.type);
    
    // OAuth/OIDC フローの期待されるシーケンス
    const expectedSequence = [
      'DISCOVERY_REQUEST',
      'AUTHORIZATION_REQUEST',
      'TOKEN_REQUEST'
    ];

    expectedSequence.forEach(expectedType => {
      if (!requestTypes.includes(expectedType)) {
        validation.missingSteps.push(expectedType);
      }
    });

    // PKCE の使用チェック
    const tokenRequest = this.timeline.find(entry => entry.type === 'TOKEN_REQUEST');
    if (tokenRequest && !tokenRequest.body?.includes('code_verifier')) {
      validation.recommendations.push('Consider implementing PKCE for enhanced security');
    }

    // state パラメータの使用チェック
    const authRequest = this.timeline.find(entry => entry.type === 'AUTHORIZATION_REQUEST');
    if (authRequest && !authRequest.url.includes('state=')) {
      validation.recommendations.push('Include state parameter to prevent CSRF attacks');
    }

    validation.isComplete = validation.missingSteps.length === 0;
    return validation;
  }

  generateDebugReport() {
    const analysis = this.analyzeAuthFlow();
    
    let report = '# Authentication Flow Debug Report\n\n';
    report += `**Generated**: ${new Date().toISOString()}\n`;
    report += `**Total Requests**: ${analysis.totalRequests}\n\n`;

    // リクエストタイプの統計
    report += '## Request Summary\n';
    Object.entries(analysis.requestTypes).forEach(([type, count]) => {
      report += `- ${type}: ${count}\n`;
    });
    report += '\n';

    // エラーの詳細
    if (analysis.errors.length > 0) {
      report += '## Errors\n';
      analysis.errors.forEach((error, index) => {
        report += `${index + 1}. **${error.type}** - Status ${error.status}\n`;
        report += `   URL: ${error.url}\n`;
        report += `   Time: ${error.timestamp}\n\n`;
      });
    }

    // 警告
    if (analysis.warnings.length > 0) {
      report += '## Warnings\n';
      analysis.warnings.forEach((warning, index) => {
        report += `${index + 1}. ${warning.message}\n`;
      });
      report += '\n';
    }

    // フロー検証結果
    report += '## Flow Validation\n';
    if (analysis.flowValidation.isComplete) {
      report += '✅ Authentication flow appears complete\n';
    } else {
      report += '❌ Authentication flow incomplete\n';
      report += 'Missing steps:\n';
      analysis.flowValidation.missingSteps.forEach(step => {
        report += `- ${step}\n`;
      });
    }

    if (analysis.flowValidation.recommendations.length > 0) {
      report += '\n**Recommendations**:\n';
      analysis.flowValidation.recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
    }

    // タイムライン
    report += '\n## Request Timeline\n';
    analysis.timeline.forEach((entry, index) => {
      const status = entry.status >= 400 ? '❌' : '✅';
      report += `${index + 1}. ${status} ${entry.type} (${entry.status}) - ${entry.duration}ms\n`;
      report += `   ${entry.url}\n`;
    });

    return report;
  }

  // Express.js ミドルウェアとしての使用
  createMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // レスポンスの記録
      const originalSend = res.send;
      res.send = function(body) {
        const endTime = Date.now();
        const timing = { duration: endTime - startTime };
        
        this.logHttpExchange(
          {
            method: req.method,
            url: req.originalUrl,
            headers: req.headers,
            body: req.body
          },
          {
            status: res.statusCode,
            headers: res.getHeaders(),
            body: body
          },
          timing
        );

        return originalSend.call(this, body);
      }.bind(this);

      next();
    };
  }
}

// 使用例
const debugger = new AuthFlowDebugger();

// Express.js での使用
app.use(debugger.createMiddleware());

// 認証完了後のデバッグレポート生成
app.get('/debug/auth-flow', (req, res) => {
  const report = debugger.generateDebugReport();
  res.set('Content-Type', 'text/plain');
  res.send(report);
});
```

### ブラウザ開発者ツールを活用したデバッグ

```javascript
// クライアントサイドでのデバッグユーティリティ
class ClientAuthDebugger {
  constructor() {
    this.events = [];
    this.isDebugMode = localStorage.getItem('auth_debug') === 'true';
  }

  log(event, data) {
    if (!this.isDebugMode) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      event: event,
      data: this.sanitizeData(data),
      stack: new Error().stack
    };

    this.events.push(logEntry);
    console.group(`🔐 Auth Debug: ${event}`);
    console.log('Data:', logEntry.data);
    console.log('Timestamp:', logEntry.timestamp);
    console.groupEnd();
  }

  sanitizeData(data) {
    if (!data) return data;
    
    const sanitized = JSON.parse(JSON.stringify(data));
    const sensitiveKeys = ['access_token', 'refresh_token', 'id_token', 'code', 'client_secret'];
    
    const sanitizeObject = (obj) => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      Object.keys(obj).forEach(key => {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          sanitizeObject(obj[key]);
        }
      });
    };

    sanitizeObject(sanitized);
    return sanitized;
  }

  // ローカルストレージの認証関連データを表示
  inspectStoredAuth() {
    if (!this.isDebugMode) return;

    console.group('🔍 Stored Authentication Data');
    
    // localStorage
    console.log('LocalStorage:');
    Object.keys(localStorage).forEach(key => {
      if (key.includes('auth') || key.includes('token')) {
        const value = localStorage.getItem(key);
        console.log(`  ${key}:`, this.sanitizeData(value));
      }
    });

    // sessionStorage
    console.log('SessionStorage:');
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('auth') || key.includes('token')) {
        const value = sessionStorage.getItem(key);
        console.log(`  ${key}:`, this.sanitizeData(value));
      }
    });

    // Cookies
    console.log('Cookies:');
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name.includes('auth') || name.includes('token')) {
        console.log(`  ${name}:`, '[REDACTED]');
      }
    });

    console.groupEnd();
  }

  // ネットワークリクエストの監視
  interceptFetch() {
    if (!this.isDebugMode) return;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, options = {}] = args;
      
      this.log('FETCH_REQUEST', {
        url: url,
        method: options.method || 'GET',
        headers: options.headers
      });

      try {
        const response = await originalFetch(...args);
        
        this.log('FETCH_RESPONSE', {
          url: url,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });

        return response;
      } catch (error) {
        this.log('FETCH_ERROR', {
          url: url,
          error: error.message
        });
        throw error;
      }
    };
  }

  // URL パラメータの分析
  analyzeURLParams() {
    if (!this.isDebugMode) return;

    const urlParams = new URLSearchParams(window.location.search);
    const authParams = {};
    
    ['code', 'state', 'error', 'error_description', 'id_token', 'access_token'].forEach(param => {
      if (urlParams.has(param)) {
        authParams[param] = param.includes('token') || param === 'code' 
          ? '[REDACTED]' 
          : urlParams.get(param);
      }
    });

    if (Object.keys(authParams).length > 0) {
      console.group('🔗 URL Authentication Parameters');
      console.table(authParams);
      console.groupEnd();
    }
  }

  // デバッグレポートの生成
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      events: this.events,
      storage: {
        localStorage: this.getAuthStorageData('localStorage'),
        sessionStorage: this.getAuthStorageData('sessionStorage')
      }
    };

    console.log('📋 Auth Debug Report:', report);
    return report;
  }

  getAuthStorageData(storageType) {
    const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
    const authData = {};
    
    Object.keys(storage).forEach(key => {
      if (key.includes('auth') || key.includes('token')) {
        authData[key] = '[REDACTED]';
      }
    });

    return authData;
  }

  // デバッグモードの切り替え
  static enableDebug() {
    localStorage.setItem('auth_debug', 'true');
    console.log('🔐 Authentication debugging enabled');
    window.location.reload();
  }

  static disableDebug() {
    localStorage.setItem('auth_debug', 'false');
    console.log('🔐 Authentication debugging disabled');
    window.location.reload();
  }
}

// グローバルでの使用
window.authDebugger = new ClientAuthDebugger();
window.authDebugger.interceptFetch();
window.authDebugger.analyzeURLParams();

// コンソールコマンド
window.enableAuthDebug = ClientAuthDebugger.enableDebug;
window.disableAuthDebug = ClientAuthDebugger.disableDebug;
```

## 8.3 ログ分析と問題診断

### 構造化ログの活用

```javascript
class AuthenticationLogger {
  constructor(logLevel = 'INFO') {
    this.logLevel = logLevel;
    this.correlationContext = new Map();
  }

  // 相関IDに基づくログのグループ化
  createCorrelationContext(correlationId, metadata = {}) {
    this.correlationContext.set(correlationId, {
      startTime: Date.now(),
      metadata: metadata,
      events: []
    });
  }

  logAuthEvent(correlationId, event, data, level = 'INFO') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      correlationId: correlationId,
      event: event,
      level: level,
      data: this.sanitizeLogData(data),
      duration: this.calculateDuration(correlationId)
    };

    // 相関コンテキストに追加
    const context = this.correlationContext.get(correlationId);
    if (context) {
      context.events.push(logEntry);
    }

    // 構造化ログとして出力
    console.log(JSON.stringify(logEntry));

    // エラーレベルの場合はアラート
    if (level === 'ERROR' || level === 'FATAL') {
      this.triggerAlert(logEntry);
    }
  }

  calculateDuration(correlationId) {
    const context = this.correlationContext.get(correlationId);
    return context ? Date.now() - context.startTime : 0;
  }

  sanitizeLogData(data) {
    const sanitized = JSON.parse(JSON.stringify(data));
    const sensitiveFields = [
      'password', 'secret', 'token', 'key', 'authorization',
      'client_secret', 'access_token', 'refresh_token', 'id_token'
    ];

    const sanitizeRecursive = (obj) => {
      if (typeof obj !== 'object' || obj === null) return;

      Object.keys(obj).forEach(key => {
        if (sensitiveFields.some(field => 
          key.toLowerCase().includes(field.toLowerCase()))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          sanitizeRecursive(obj[key]);
        }
      });
    };

    sanitizeRecursive(sanitized);
    return sanitized;
  }

  // 認証フロー全体の分析
  analyzeAuthSession(correlationId) {
    const context = this.correlationContext.get(correlationId);
    if (!context) {
      return { error: 'Correlation context not found' };
    }

    const analysis = {
      correlationId: correlationId,
      totalDuration: Date.now() - context.startTime,
      events: context.events,
      metadata: context.metadata,
      statistics: {
        totalEvents: context.events.length,
        errorCount: context.events.filter(e => e.level === 'ERROR').length,
        warningCount: context.events.filter(e => e.level === 'WARN').length
      },
      timeline: this.generateTimeline(context.events),
      patterns: this.detectPatterns(context.events)
    };

    return analysis;
  }

  generateTimeline(events) {
    return events.map(event => ({
      timestamp: event.timestamp,
      event: event.event,
      level: event.level,
      duration: event.duration
    })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  detectPatterns(events) {
    const patterns = {
      repeatedFailures: [],
      slowOperations: [],
      anomalies: []
    };

    // 繰り返し失敗の検出
    const failures = events.filter(e => e.level === 'ERROR');
    const failureTypes = {};
    
    failures.forEach(failure => {
      const type = failure.event;
      if (!failureTypes[type]) {
        failureTypes[type] = [];
      }
      failureTypes[type].push(failure);
    });

    Object.entries(failureTypes).forEach(([type, occurrences]) => {
      if (occurrences.length > 2) {
        patterns.repeatedFailures.push({
          type: type,
          count: occurrences.length,
          timestamps: occurrences.map(o => o.timestamp)
        });
      }
    });

    // 遅い操作の検出
    events.forEach(event => {
      if (event.duration > 5000) { // 5秒以上
        patterns.slowOperations.push({
          event: event.event,
          duration: event.duration,
          timestamp: event.timestamp
        });
      }
    });

    return patterns;
  }

  triggerAlert(logEntry) {
    // アラート通知の実装
    console.error('🚨 AUTHENTICATION ALERT:', {
      correlationId: logEntry.correlationId,
      event: logEntry.event,
      level: logEntry.level,
      timestamp: logEntry.timestamp
    });

    // 実際の実装では、Slack、Teams、メール等への通知
  }

  // ログ検索とフィルタリング
  searchLogs(criteria) {
    const results = [];
    
    this.correlationContext.forEach((context, correlationId) => {
      const matchingEvents = context.events.filter(event => {
        let matches = true;

        if (criteria.level && event.level !== criteria.level) {
          matches = false;
        }

        if (criteria.event && !event.event.includes(criteria.event)) {
          matches = false;
        }

        if (criteria.startTime && new Date(event.timestamp) < new Date(criteria.startTime)) {
          matches = false;
        }

        if (criteria.endTime && new Date(event.timestamp) > new Date(criteria.endTime)) {
          matches = false;
        }

        if (criteria.userId && event.data.userId !== criteria.userId) {
          matches = false;
        }

        return matches;
      });

      if (matchingEvents.length > 0) {
        results.push({
          correlationId: correlationId,
          events: matchingEvents,
          metadata: context.metadata
        });
      }
    });

    return results;
  }

  generateDiagnosticReport(correlationId) {
    const analysis = this.analyzeAuthSession(correlationId);
    
    let report = `# Authentication Diagnostic Report\n\n`;
    report += `**Correlation ID**: ${correlationId}\n`;
    report += `**Total Duration**: ${analysis.totalDuration}ms\n`;
    report += `**Events**: ${analysis.statistics.totalEvents}\n`;
    report += `**Errors**: ${analysis.statistics.errorCount}\n`;
    report += `**Warnings**: ${analysis.statistics.warningCount}\n\n`;

    if (analysis.patterns.repeatedFailures.length > 0) {
      report += `## Repeated Failures\n`;
      analysis.patterns.repeatedFailures.forEach(failure => {
        report += `- **${failure.type}**: ${failure.count} occurrences\n`;
      });
      report += '\n';
    }

    if (analysis.patterns.slowOperations.length > 0) {
      report += `## Slow Operations\n`;
      analysis.patterns.slowOperations.forEach(op => {
        report += `- **${op.event}**: ${op.duration}ms\n`;
      });
      report += '\n';
    }

    report += `## Event Timeline\n`;
    analysis.timeline.forEach((event, index) => {
      const icon = event.level === 'ERROR' ? '❌' : 
                   event.level === 'WARN' ? '⚠️' : '✅';
      report += `${index + 1}. ${icon} ${event.event} (${event.duration}ms)\n`;
    });

    return report;
  }
}

// 使用例
const authLogger = new AuthenticationLogger();

// Express.js ミドルウェア
function createAuthLoggingMiddleware(logger) {
  return (req, res, next) => {
    const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
    req.correlationId = correlationId;
    
    // 認証セッションの開始
    logger.createCorrelationContext(correlationId, {
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      path: req.path
    });

    logger.logAuthEvent(correlationId, 'REQUEST_STARTED', {
      method: req.method,
      path: req.path,
      query: req.query
    });

    // レスポンス完了時のログ
    res.on('finish', () => {
      logger.logAuthEvent(correlationId, 'REQUEST_COMPLETED', {
        statusCode: res.statusCode,
        duration: logger.calculateDuration(correlationId)
      });
    });

    next();
  };
}

// 認証エラーのログ記録例
app.use('/auth', createAuthLoggingMiddleware(authLogger));

app.post('/auth/token', async (req, res) => {
  try {
    authLogger.logAuthEvent(req.correlationId, 'TOKEN_REQUEST', {
      grantType: req.body.grant_type,
      clientId: req.body.client_id
    });

    const tokens = await exchangeCodeForTokens(req.body);
    
    authLogger.logAuthEvent(req.correlationId, 'TOKEN_ISSUED', {
      tokenType: tokens.token_type,
      expiresIn: tokens.expires_in
    });

    res.json(tokens);
  } catch (error) {
    authLogger.logAuthEvent(req.correlationId, 'TOKEN_ERROR', {
      error: error.message,
      errorCode: error.code
    }, 'ERROR');

    res.status(400).json({ error: 'invalid_grant' });
  }
});

// 診断レポートの生成エンドポイント
app.get('/debug/auth/:correlationId', (req, res) => {
  const report = authLogger.generateDiagnosticReport(req.params.correlationId);
  res.set('Content-Type', 'text/plain');
  res.send(report);
});
```

## 8.4 パフォーマンスの最適化

### レスポンス時間の監視と改善

```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.thresholds = {
      tokenRequest: 2000,    // 2秒
      userInfoRequest: 1000, // 1秒
      discoveryRequest: 500  // 0.5秒
    };
  }

  recordMetric(operation, duration, metadata = {}) {
    const metric = {
      operation: operation,
      duration: duration,
      timestamp: Date.now(),
      metadata: metadata
    };

    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }

    this.metrics.get(operation).push(metric);

    // 閾値チェック
    const threshold = this.thresholds[operation];
    if (threshold && duration > threshold) {
      this.alertSlowOperation(operation, duration, threshold);
    }
  }

  alertSlowOperation(operation, duration, threshold) {
    console.warn(`⚠️ Slow operation detected: ${operation} took ${duration}ms (threshold: ${threshold}ms)`);
  }

  getPerformanceStats(operation) {
    const metrics = this.metrics.get(operation) || [];
    if (metrics.length === 0) {
      return null;
    }

    const durations = metrics.map(m => m.duration);
    const sorted = durations.sort((a, b) => a - b);

    return {
      operation: operation,
      count: metrics.length,
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      min: Math.min(...durations),
      max: Math.max(...durations),
      recentMetrics: metrics.slice(-10) // 最新10件
    };
  }

  // キャッシュ戦略の実装
  createCacheMiddleware() {
    const cache = new Map();
    const cacheExpiry = new Map();

    return {
      get: (key) => {
        if (cacheExpiry.has(key) && Date.now() > cacheExpiry.get(key)) {
          cache.delete(key);
          cacheExpiry.delete(key);
          return null;
        }
        return cache.get(key);
      },

      set: (key, value, ttlMs = 300000) => { // デフォルト5分
        cache.set(key, value);
        cacheExpiry.set(key, Date.now() + ttlMs);
      },

      clear: () => {
        cache.clear();
        cacheExpiry.clear();
      }
    };
  }

  // Discovery document のキャッシュ実装
  async getDiscoveryDocument(issuer, cache) {
    const cacheKey = `discovery:${issuer}`;
    let document = cache.get(cacheKey);

    if (!document) {
      const startTime = Date.now();
      
      try {
        const response = await fetch(`${issuer}/.well-known/openid-configuration`);
        document = await response.json();
        
        // 24時間キャッシュ
        cache.set(cacheKey, document, 24 * 60 * 60 * 1000);
        
        const duration = Date.now() - startTime;
        this.recordMetric('discoveryRequest', duration, { issuer });
        
      } catch (error) {
        this.recordMetric('discoveryRequest', Date.now() - startTime, { 
          issuer, 
          error: error.message 
        });
        throw error;
      }
    }

    return document;
  }

  // JWK セットのキャッシュ実装
  async getJWKS(jwksUri, cache) {
    const cacheKey = `jwks:${jwksUri}`;
    let jwks = cache.get(cacheKey);

    if (!jwks) {
      const startTime = Date.now();
      
      try {
        const response = await fetch(jwksUri);
        jwks = await response.json();
        
        // 1時間キャッシュ
        cache.set(cacheKey, jwks, 60 * 60 * 1000);
        
        const duration = Date.now() - startTime;
        this.recordMetric('jwksRequest', duration, { jwksUri });
        
      } catch (error) {
        this.recordMetric('jwksRequest', Date.now() - startTime, { 
          jwksUri, 
          error: error.message 
        });
        throw error;
      }
    }

    return jwks;
  }

  // 最適化されたトークン検証
  async optimizedTokenValidation(token, issuer, audience) {
    const cache = this.createCacheMiddleware();
    const startTime = Date.now();

    try {
      // Discovery document の取得（キャッシュ付き）
      const discovery = await this.getDiscoveryDocument(issuer, cache);
      
      // JWKS の取得（キャッシュ付き）
      const jwks = await this.getJWKS(discovery.jwks_uri, cache);
      
      // トークンの検証
      const validation = await this.validateTokenWithJWKS(token, jwks, issuer, audience);
      
      const duration = Date.now() - startTime;
      this.recordMetric('tokenValidation', duration, {
        issuer,
        valid: validation.isValid
      });

      return validation;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordMetric('tokenValidation', duration, {
        issuer,
        error: error.message
      });
      throw error;
    }
  }

  generatePerformanceReport() {
    let report = '# Authentication Performance Report\n\n';
    report += `**Generated**: ${new Date().toISOString()}\n\n`;

    this.metrics.forEach((metrics, operation) => {
      const stats = this.getPerformanceStats(operation);
      if (stats) {
        report += `## ${operation}\n\n`;
        report += `- **Count**: ${stats.count}\n`;
        report += `- **Average**: ${Math.round(stats.average)}ms\n`;
        report += `- **Median**: ${Math.round(stats.median)}ms\n`;
        report += `- **95th Percentile**: ${Math.round(stats.p95)}ms\n`;
        report += `- **Min/Max**: ${stats.min}ms / ${stats.max}ms\n\n`;

        // 閾値との比較
        const threshold = this.thresholds[operation];
        if (threshold) {
          const exceedsThreshold = stats.average > threshold;
          const icon = exceedsThreshold ? '❌' : '✅';
          report += `${icon} **Threshold**: ${threshold}ms (Average: ${Math.round(stats.average)}ms)\n\n`;
        }
      }
    });

    return report;
  }
}

// 使用例
const perfMonitor = new PerformanceMonitor();

// Express.js での使用
app.use((req, res, next) => {
  req.startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    perfMonitor.recordMetric('httpRequest', duration, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode
    });
  });

  next();
});

// パフォーマンスレポートエンドポイント
app.get('/debug/performance', (req, res) => {
  const report = perfMonitor.generatePerformanceReport();
  res.set('Content-Type', 'text/plain');
  res.send(report);
});
```

## 8.5 サポートリソースの活用

### Microsoft サポートリソース

```javascript
class SupportResourceGuide {
  static getResourceByError(errorCode) {
    const resources = {
      'AADSTS50001': {
        title: 'Application not found in tenant',
        description: 'The application was not found in the tenant',
        documentation: [
          'https://docs.microsoft.com/en-us/azure/active-directory/develop/reference-aadsts-error-codes',
          'https://docs.microsoft.com/en-us/azure/active-directory/develop/app-registrations-training-guide'
        ],
        troubleshooting: [
          'Verify the application ID in your configuration',
          'Check that the application is registered in the correct tenant',
          'Ensure the application has not been deleted'
        ]
      },

      'AADSTS50011': {
        title: 'Reply URL mismatch',
        description: 'The reply URL specified in the request does not match configured for the application',
        documentation: [
          'https://docs.microsoft.com/en-us/azure/active-directory/develop/reply-url'
        ],
        troubleshooting: [
          'Check redirect URIs in app registration',
          'Ensure exact match including protocol, domain, port, and path',
          'Verify URL encoding is correct'
        ]
      },

      'AADSTS700016': {
        title: 'Application not found',
        description: 'Application with identifier was not found in the directory',
        documentation: [
          'https://docs.microsoft.com/en-us/azure/active-directory/develop/reference-aadsts-error-codes'
        ],
        troubleshooting: [
          'Verify client ID is correct',
          'Check application registration status',
          'Ensure application is in the correct tenant'
        ]
      },

      'invalid_grant': {
        title: 'OAuth Invalid Grant Error',
        description: 'The provided authorization grant is invalid, expired, revoked, or was issued to another client',
        documentation: [
          'https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow',
          'https://tools.ietf.org/html/rfc6749#section-5.2'
        ],
        troubleshooting: [
          'Check authorization code expiration (10 minutes)',
          'Verify code has not been used already',
          'Validate PKCE code_verifier matches code_challenge',
          'Ensure redirect_uri matches exactly'
        ]
      }
    };

    return resources[errorCode] || this.getGenericGuidance();
  }

  static getGenericGuidance() {
    return {
      title: 'General Troubleshooting',
      description: 'Generic guidance for authentication issues',
      documentation: [
        'https://docs.microsoft.com/en-us/azure/active-directory/develop/',
        'https://docs.microsoft.com/en-us/azure/active-directory/develop/authentication-scenarios'
      ],
      troubleshooting: [
        'Enable detailed logging',
        'Check network connectivity',
        'Verify application configuration',
        'Review audit logs in Azure portal'
      ]
    };
  }

  static generateTroubleshootingGuide(error) {
    const resource = this.getResourceByError(error.error || error.message);
    
    let guide = `# Troubleshooting Guide\n\n`;
    guide += `**Error**: ${error.error || 'Unknown'}\n`;
    guide += `**Description**: ${error.error_description || error.message || 'No description available'}\n\n`;
    
    guide += `## ${resource.title}\n\n`;
    guide += `${resource.description}\n\n`;
    
    guide += `## Troubleshooting Steps\n\n`;
    resource.troubleshooting.forEach((step, index) => {
      guide += `${index + 1}. ${step}\n`;
    });
    
    guide += `\n## Documentation Links\n\n`;
    resource.documentation.forEach(link => {
      guide += `- [${link}](${link})\n`;
    });
    
    guide += `\n## Additional Support\n\n`;
    guide += `- **Azure Support**: https://azure.microsoft.com/support/\n`;
    guide += `- **Microsoft Q&A**: https://docs.microsoft.com/answers/\n`;
    guide += `- **Stack Overflow**: https://stackoverflow.com/questions/tagged/azure-active-directory\n`;
    guide += `- **GitHub Issues**: https://github.com/AzureAD/microsoft-authentication-library-for-js/issues\n`;
    
    return guide;
  }

  static getHealthCheckEndpoints() {
    return {
      microsoftLogin: 'https://login.microsoftonline.com/common/discovery/v2.0/metadata',
      graphAPI: 'https://graph.microsoft.com/v1.0/servicePrincipals',
      azureStatus: 'https://status.azure.com/api/v2/status.json'
    };
  }

  static async performHealthCheck() {
    const endpoints = this.getHealthCheckEndpoints();
    const results = {};

    for (const [name, url] of Object.entries(endpoints)) {
      const startTime = Date.now();
      
      try {
        const response = await fetch(url);
        results[name] = {
          status: response.status,
          responseTime: Date.now() - startTime,
          healthy: response.ok
        };
      } catch (error) {
        results[name] = {
          status: 'ERROR',
          responseTime: Date.now() - startTime,
          healthy: false,
          error: error.message
        };
      }
    }

    return results;
  }
}

// 使用例
async function handleAuthError(error, req, res) {
  // トラブルシューティングガイドの生成
  const guide = SupportResourceGuide.generateTroubleshootingGuide(error);
  
  // ヘルスチェックの実行
  const healthCheck = await SupportResourceGuide.performHealthCheck();
  
  // エラーレスポンス
  if (req.accepts('html')) {
    // HTMLレスポンス（開発環境）
    res.status(500).send(`
      <html>
        <body>
          <h1>Authentication Error</h1>
          <pre>${guide}</pre>
          <h2>Service Health</h2>
          <pre>${JSON.stringify(healthCheck, null, 2)}</pre>
        </body>
      </html>
    `);
  } else {
    // JSON レスポンス
    res.status(500).json({
      error: error.error || 'authentication_failed',
      error_description: error.error_description || error.message,
      troubleshooting_guide: guide,
      service_health: healthCheck
    });
  }
}
```

これで第8章「トラブルシューティングとデバッグ」が完成しました。本章では、一般的なエラーパターンの診断と対処法、デバッグツールの活用、ログ分析、パフォーマンス最適化、そしてサポートリソースの活用について詳しく解説しました。
