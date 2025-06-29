---
title: "付録B：参考資料とリンク集"
---

# 付録B：参考資料とリンク集

本書の学習をさらに深めるための公式ドキュメント、開発者リソース、コミュニティ、ツールなどを分野別に整理しています。

## Microsoft 公式ドキュメント

### Microsoft Entra ID（旧 Azure AD）

**概要・基礎**
- [Microsoft Entra ID とは](https://learn.microsoft.com/ja-jp/entra/identity/)
- [Microsoft Entra 管理センター](https://entra.microsoft.com/)
- [Microsoft Entra ID 価格](https://www.microsoft.com/ja-jp/security/business/identity-access/azure-active-directory-pricing)

**開発者向けガイド**
- [Microsoft Identity Platform](https://learn.microsoft.com/ja-jp/entra/identity-platform/)
- [アプリケーション登録クイックスタート](https://learn.microsoft.com/ja-jp/entra/identity-platform/quickstart-register-app)
- [認証と認可の基本概念](https://learn.microsoft.com/ja-jp/entra/identity-platform/authentication-vs-authorization)

**プロトコル仕様**
- [OAuth 2.0 と OpenID Connect](https://learn.microsoft.com/ja-jp/entra/identity-platform/v2-protocols)
- [SAML プロトコル リファレンス](https://learn.microsoft.com/ja-jp/entra/identity-platform/saml-protocol-reference)
- [Microsoft Graph API](https://learn.microsoft.com/ja-jp/graph/)

### 認証ライブラリ

**MSAL (Microsoft Authentication Library)**
- [MSAL 概要](https://learn.microsoft.com/ja-jp/entra/identity-platform/msal-overview)
- [MSAL for JavaScript](https://learn.microsoft.com/ja-jp/entra/identity-platform/tutorial-v2-javascript-auth-code)
- [MSAL for .NET](https://learn.microsoft.com/ja-jp/entra/identity-platform/tutorial-v2-asp-webapp)
- [MSAL for Java](https://learn.microsoft.com/ja-jp/entra/identity-platform/tutorial-v2-java-webapp)
- [MSAL for Python](https://learn.microsoft.com/ja-jp/entra/identity-platform/tutorial-v2-python-webapp)

**Microsoft Identity Web**
- [Microsoft.Identity.Web 概要](https://learn.microsoft.com/ja-jp/entra/identity-platform/microsoft-identity-web)
- [ASP.NET Core での実装](https://learn.microsoft.com/ja-jp/entra/identity-platform/tutorial-v2-asp-webapp)

## プロトコル・標準仕様

### OAuth 2.0

**RFC・標準文書**
- [RFC 6749: OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)
- [RFC 7636: PKCE](https://tools.ietf.org/html/rfc7636)
- [RFC 8252: OAuth 2.0 for Native Apps](https://tools.ietf.org/html/rfc8252)

**セキュリティベストプラクティス**
- [OAuth 2.0 Security Best Current Practice](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
- [OAuth 2.0 Threat Model](https://tools.ietf.org/html/rfc6819)

### OpenID Connect

**標準仕様**
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html)
- [OpenID Connect Front-Channel Logout 1.0](https://openid.net/specs/openid-connect-frontchannel-1_0.html)

**実装ガイド**
- [OpenID Connect 公式サイト](https://openid.net/connect/)
- [OpenID Foundation](https://openid.net/)

### SAML 2.0

**OASIS 仕様**
- [SAML 2.0 Specification Overview](https://wiki.oasis-open.org/security/FrontPage)
- [SAML 2.0 Core](http://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf)
- [SAML 2.0 Bindings](http://docs.oasis-open.org/security/saml/v2.0/saml-bindings-2.0-os.pdf)
- [SAML 2.0 Profiles](http://docs.oasis-open.org/security/saml/v2.0/saml-profiles-2.0-os.pdf)

### SCIM

**標準仕様**
- [RFC 7642: SCIM Concepts](https://tools.ietf.org/html/rfc7642)
- [RFC 7643: SCIM Core Schema](https://tools.ietf.org/html/rfc7643)
- [RFC 7644: SCIM Protocol](https://tools.ietf.org/html/rfc7644)

## 開発者リソース

### Microsoft 提供リソース

**開発者プログラム**
- [Microsoft 365 Developer Program](https://developer.microsoft.com/microsoft-365/dev-program)
  - 無料の開発者テナント
  - サンプルデータパック
  - 開発者向けドキュメント

**Azure リソース**
- [Azure 無料アカウント](https://azure.microsoft.com/ja-jp/free/)
- [Azure Samples GitHub](https://github.com/Azure-Samples)
- [Microsoft Graph SDK GitHub](https://github.com/microsoftgraph)

### サンプルコード・テンプレート

**Microsoft 公式サンプル**
- [Azure AD Code Samples](https://github.com/Azure-Samples?q=active-directory)
- [Microsoft Graph Samples](https://github.com/microsoftgraph?q=sample)
- [MSAL Samples](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/samples)

**言語別サンプル**
- [.NET Samples](https://github.com/Azure-Samples/active-directory-aspnetcore-webapp-openidconnect-v2)
- [Java Samples](https://github.com/Azure-Samples/ms-identity-java-webapp)
- [Node.js Samples](https://github.com/Azure-Samples/ms-identity-node)
- [Python Samples](https://github.com/Azure-Samples/ms-identity-python-webapp)
- [PHP Samples](https://github.com/Azure-Samples/ms-identity-php-webapp)

### 開発ツール

**IDE・エディター拡張**
- [Azure Account (VS Code)](https://marketplace.visualstudio.com/items?itemName=ms-vscode.azure-account)
- [Azure Resources (VS Code)](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azureresourcegroups)
- [REST Client (VS Code)](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

**CLI ツール**
- [Azure CLI](https://learn.microsoft.com/ja-jp/cli/azure/)
- [Microsoft Graph CLI](https://learn.microsoft.com/ja-jp/graph/cli/cli-overview)
- [PowerShell (Microsoft Graph)](https://learn.microsoft.com/ja-jp/powershell/microsoftgraph/)

**テスト・デバッグツール**
- [Microsoft Graph Explorer](https://developer.microsoft.com/graph/graph-explorer)
- [JWT.io](https://jwt.io/) - JWT デコーダー
- [SAML Decoder](https://www.samltool.com/decode.php) - SAML アサーション デコーダー

## ライブラリ・SDK

### JavaScript/Node.js

**Microsoft 提供**
- [@azure/msal-browser](https://www.npmjs.com/package/@azure/msal-browser)
- [@azure/msal-node](https://www.npmjs.com/package/@azure/msal-node)
- [@azure/microsoft-graph-client](https://www.npmjs.com/package/@azure/microsoft-graph-client)

**SAML ライブラリ**
- [passport-saml](https://www.npmjs.com/package/passport-saml)
- [saml2-js](https://www.npmjs.com/package/saml2-js)

### .NET

**Microsoft 提供**
- [Microsoft.Identity.Web](https://www.nuget.org/packages/Microsoft.Identity.Web)
- [Microsoft.Identity.Client](https://www.nuget.org/packages/Microsoft.Identity.Client)
- [Microsoft.Graph](https://www.nuget.org/packages/Microsoft.Graph)

**SAML ライブラリ**
- [ITfoxtec.Identity.Saml2](https://www.nuget.org/packages/ITfoxtec.Identity.Saml2)
- [ComponentSpace.Saml2](https://www.nuget.org/packages/ComponentSpace.Saml2)

### Java

**Microsoft 提供**
- [msal4j](https://mvnrepository.com/artifact/com.microsoft.azure/msal4j)
- [microsoft-graph](https://mvnrepository.com/artifact/com.microsoft.graph/microsoft-graph)

**Spring Security**
- [spring-security-saml2-service-provider](https://mvnrepository.com/artifact/org.springframework.security/spring-security-saml2-service-provider)
- [spring-security-oauth2-client](https://mvnrepository.com/artifact/org.springframework.security/spring-security-oauth2-client)

### Python

**Microsoft 提供**
- [msal](https://pypi.org/project/msal/)
- [msgraph-core](https://pypi.org/project/msgraph-core/)

**SAML ライブラリ**
- [python3-saml](https://pypi.org/project/python3-saml/)
- [djangosaml2](https://pypi.org/project/djangosaml2/)

### PHP

**OAuth/OpenID Connect**
- [league/oauth2-client](https://packagist.org/packages/league/oauth2-client)
- [steverhoades/oauth2-azure-provider](https://packagist.org/packages/steverhoades/oauth2-azure-provider)

**SAML ライブラリ**
- [onelogin/php-saml](https://packagist.org/packages/onelogin/php-saml)
- [simplesamlphp/simplesamlphp](https://packagist.org/packages/simplesamlphp/simplesamlphp)

## コミュニティ・フォーラム

### Microsoft コミュニティ

**公式フォーラム**
- [Microsoft Tech Community - Identity](https://techcommunity.microsoft.com/t5/azure-active-directory-identity/ct-p/Azure-Active-Directory)
- [Microsoft Q&A - Azure AD](https://learn.microsoft.com/ja-jp/answers/topics/azure-active-directory.html)
- [Stack Overflow - azure-active-directory](https://stackoverflow.com/questions/tagged/azure-active-directory)

**開発者コミュニティ**
- [Microsoft Identity Developer Blog](https://devblogs.microsoft.com/identity/)
- [Azure AD Developer GitHub](https://github.com/AzureAD)
- [Microsoft Graph Developer Blog](https://developer.microsoft.com/graph/blogs/)

### 外部コミュニティ

**一般技術コミュニティ**
- [Reddit - r/AZURE](https://www.reddit.com/r/AZURE/)
- [Dev.to - Azure AD](https://dev.to/t/azuread)

**日本語コミュニティ**
- [Azure User Group Japan](https://jazug.connpass.com/)
- [Microsoft Azure Japan Facebook Group](https://www.facebook.com/groups/MicrosoftAzureJapan/)

## 学習・トレーニングリソース

### Microsoft Learn

**学習パス**
- [Azure Active Directory の概要](https://learn.microsoft.com/ja-jp/training/paths/azure-active-directory/)
- [Microsoft Identity Platform でアプリを開発する](https://learn.microsoft.com/ja-jp/training/paths/m365-identity/)
- [Microsoft Graph の実装](https://learn.microsoft.com/ja-jp/training/paths/m365-msgraph-fundamentals/)

**モジュール**
- [Azure Active Directory でのアプリケーション管理](https://learn.microsoft.com/ja-jp/training/modules/manage-apps-azure-ad/)
- [条件付きアクセスを計画する](https://learn.microsoft.com/ja-jp/training/modules/plan-implement-conditional-access/)

### 認定資格

**Microsoft 認定資格**
- [Azure Fundamentals (AZ-900)](https://learn.microsoft.com/ja-jp/certifications/azure-fundamentals/)
- [Security, Compliance, and Identity Fundamentals (SC-900)](https://learn.microsoft.com/ja-jp/certifications/security-compliance-and-identity-fundamentals/)
- [Identity and Access Administrator Associate (SC-300)](https://learn.microsoft.com/ja-jp/certifications/identity-and-access-administrator/)
- [Azure Solutions Architect Expert (AZ-305)](https://learn.microsoft.com/ja-jp/certifications/azure-solutions-architect/)

### オンラインコース

**無料リソース**
- [Microsoft Virtual Training Days](https://www.microsoft.com/ja-jp/events/top/training-days)
- [Microsoft Reactor](https://developer.microsoft.com/reactor/)

**有料コース**
- [Pluralsight - Azure Active Directory](https://www.pluralsight.com/browse/cloud-computing/azure/azure-active-directory)
- [LinkedIn Learning - Azure AD](https://www.linkedin.com/learning/search?keywords=azure%20active%20directory)

## テスト・検証ツール

### オンラインツール

**プロトコル検証**
- [Microsoft Remote Connectivity Analyzer](https://testconnectivity.microsoft.com/)
- [SAML Tracer (Firefox Add-on)](https://addons.mozilla.org/ja/firefox/addon/saml-tracer/)
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools)

**証明書ツール**
- [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/)
- [Certificate Decoder](https://www.sslshopper.com/certificate-decoder.html)

### ローカルツール

**ネットワーク解析**
- [Fiddler](https://www.telerik.com/fiddler)
- [Wireshark](https://www.wireshark.org/)
- [Burp Suite](https://portswigger.net/burp)

**API テスト**
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [curl](https://curl.se/)

## セキュリティリソース

### セキュリティガイドライン

**Microsoft セキュリティ**
- [Microsoft Security Best Practices](https://learn.microsoft.com/ja-jp/security/)
- [Azure Security Benchmark](https://learn.microsoft.com/ja-jp/security/benchmark/azure/)
- [Identity Security Best Practices](https://learn.microsoft.com/ja-jp/security/fundamentals/identity-management-best-practices)

**業界標準**
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [ISO 27001](https://www.iso.org/isoiec-27001-information-security.html)
- [SOC 2](https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report.html)

### 脅威インテリジェンス

**Microsoft 提供**
- [Microsoft Security Intelligence Report](https://www.microsoft.com/security/sir)
- [Azure AD Identity Protection](https://learn.microsoft.com/ja-jp/entra/id-protection/)

**外部リソース**
- [OWASP](https://owasp.org/)
- [SANS Institute](https://www.sans.org/)

## 規制・コンプライアンス

### データ保護規制

**GDPR（一般データ保護規則）**
- [Microsoft GDPR コンプライアンス](https://learn.microsoft.com/ja-jp/compliance/regulatory/gdpr)
- [Azure AD GDPR ドキュメント](https://learn.microsoft.com/ja-jp/entra/identity/users/users-search-enhanced)

**その他の規制**
- [SOX法対応](https://learn.microsoft.com/ja-jp/compliance/regulatory/offering-sox)
- [HIPAA対応](https://learn.microsoft.com/ja-jp/compliance/regulatory/offering-hipaa-hitech)
- [日本の個人情報保護法](https://learn.microsoft.com/ja-jp/compliance/regulatory/offering-japan-privacy-act)

### 業界標準

**認証・認定**
- [FedRAMP](https://learn.microsoft.com/ja-jp/compliance/regulatory/offering-fedramp)
- [ISO 27018](https://learn.microsoft.com/ja-jp/compliance/regulatory/offering-iso-27018)
- [CSA STAR](https://learn.microsoft.com/ja-jp/compliance/regulatory/offering-csa-star-attestation)

## ニュース・アップデート

### 公式情報源

**Microsoft 公式**
- [Microsoft 365 Roadmap](https://www.microsoft.com/microsoft-365/roadmap)
- [Azure Updates](https://azure.microsoft.com/ja-jp/updates/)
- [Identity Division Blog](https://techcommunity.microsoft.com/t5/azure-active-directory-identity/bg-p/Identity)

**リリースノート**
- [Azure AD What's New](https://learn.microsoft.com/ja-jp/entra/identity/whats-new)
- [Microsoft Graph Changelog](https://developer.microsoft.com/graph/changelog)

### 技術ブログ・メディア

**個人ブログ・技術メディア**
- [Petri IT Knowledgebase](https://petri.com/category/azure-ad)
- [Practical 365](https://practical365.com/azure-ad/)

**YouTube チャンネル**
- [Microsoft Developer](https://www.youtube.com/channel/UCsMica-v34Irf9KVTh6xx4g)
- [Azure Friday](https://www.youtube.com/channel/UCkEp9E2eZFPaW9xpM8-LIcg)

## 書籍・出版物

### 技術書籍

**日本語書籍**
- 「Microsoft Azure解説書シリーズ」各種
- 「クラウド時代の認証基盤」関連書籍

**英語書籍**
- "Mastering Azure Active Directory" - Houssem Dellai
- "Azure Active Directory Cookbook" - Sasha Kranjac

### 技術雑誌

**日本語雑誌**
- 日経クラウドファースト
- Software Design
- WEB+DB PRESS

## 開発環境・インフラ

### 開発環境構築

**コンテナ・仮想化**
- [Docker](https://www.docker.com/)
- [Azure Container Instances](https://azure.microsoft.com/ja-jp/services/container-instances/)
- [GitHub Codespaces](https://github.com/features/codespaces)

**CI/CD**
- [GitHub Actions](https://github.com/features/actions)
- [Azure DevOps](https://azure.microsoft.com/ja-jp/services/devops/)
- [Azure Pipelines](https://azure.microsoft.com/ja-jp/services/devops/pipelines/)

### モニタリング・ログ

**Azure 監視サービス**
- [Azure Monitor](https://azure.microsoft.com/ja-jp/services/monitor/)
- [Application Insights](https://azure.microsoft.com/ja-jp/services/application-insights/)
- [Azure AD Sign-in Logs](https://learn.microsoft.com/ja-jp/entra/identity/monitoring-health/concept-sign-ins)

**サードパーティツール**
- [Splunk](https://www.splunk.com/)
- [Elastic Stack](https://www.elastic.co/jp/elastic-stack/)

## まとめ

これらのリソースは、Microsoft Entra IDとSSO実装の学習・開発・運用において非常に有用です。公式ドキュメントから始めて、実際のプロジェクトで使用する技術スタックに応じて関連リソースを活用してください。

### 学習ステップの推奨順序

1. **基礎学習**: Microsoft Learn + 公式ドキュメント
2. **実践開発**: サンプルコード + 開発者プログラム
3. **応用・運用**: コミュニティ + ベストプラクティス
4. **継続学習**: 認定資格 + 最新情報の追跡

技術は常に進歩しているため、公式ドキュメントと最新情報の確認を定期的に行うことが重要です。