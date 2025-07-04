---
title: "はじめに"
---

# はじめに

## 本書の目的と構成

近年、企業のデジタルトランスフォーメーション（DX）が加速する中で、複数のクラウドサービスを安全かつ効率的に利用するためのシングルサインオン（SSO）の重要性が高まっています。特に、Microsoft Entra ID（旧 Azure Active Directory）は、多くの企業で採用されている認証基盤として、その存在感を増しています。

本書は、**自社のWebサービスやアプリケーションにMicrosoft Entra IDとのSSO連携を実装したい開発者**のために執筆されました。単なる理論の解説ではなく、実際のプロジェクトで直面する課題とその解決方法を、具体的なコード例とともに解説することを重視しています。

> 🚀 **実装サンプルをすぐに試せます**  
> 本書で解説するすべてのコード例とサンプル実装は、GitHubで公開されています。  
> 📁 **GitHub**: [entra-id-sso-samples](https://github.com/nahisaho/entra-id-sso-samples)  
> 読みながらすぐに実際のコードを確認・実行できるため、効率的な学習が可能です。

### 本書で学べること

- **3つの主要な認証プロトコル（SAML 2.0、OpenID Connect、OAuth 2.0）の実装方法**
- **Microsoft Entra IDとの連携における具体的な設定手順**
- **セキュリティベストプラクティスとトラブルシューティング**
- **本番環境への展開とコンプライアンス対応**
- **実践的なユースケースと実装パターン**

### 本書の構成

本書は10章構成となっており、基礎から応用まで段階的に学習できるよう設計されています。

**第1章〜第2章**では、Microsoft Entra IDとSSOの基礎知識、開発環境の構築方法を解説します。

**第3章〜第5章**では、SAML 2.0、OpenID Connect、OAuth 2.0という3つの主要な認証プロトコルの実装方法を、実際のコード例とともに詳しく説明します。

**第6章〜第7章**では、ユーザープロビジョニング、セキュリティベストプラクティスなど、エンタープライズグレードのシステムに求められる高度な機能について解説します。

**第8章〜第10章**では、トラブルシューティング、本番環境への展開、コンプライアンス対応を扱い、実際のプロジェクトで役立つノウハウを提供します。

**付録**では、用語集と参考資料・リンク集を収録し、開発時のリファレンスとして活用できます。

## 効果的な読み方

### 読者のレベルに応じた読み方

**初めてSSO実装に取り組む方**
- 第1章から順番に読み進めることをお勧めします
- 各章のサンプルコードを実際に動かしながら学習してください
- 第8章のトラブルシューティングは、問題に直面した際に参照してください

**特定のプロトコルで実装を急ぐ方**
- 第1章で基礎を確認後、実装したいプロトコルの章（第3〜5章）に進んでください
- 第7章のセキュリティベストプラクティスは必ず確認してください
- 第9章の本番環境への展開も早めに確認することをお勧めします

**経験豊富な開発者の方**
- 目次から必要な箇所を選んで読み進めてください
- 第6〜7章の高度な機能、第8〜10章の実践的な内容が特に有用でしょう
- 付録の用語集と参考資料は、リファレンスとして活用してください

### 本書の活用方法

1. **動作確認しながら学習する**: 各章のサンプルコードは、実際に動作確認できるよう設計されています
2. **プロジェクトのリファレンスとして**: 実装時の設定手順やトラブルシューティングガイドとして活用できます
3. **チーム内での知識共有**: 本書の内容を基に、チーム内でのナレッジベースを構築できます

## サンプルコードについて

### コード例の構成

本書では、各章で実装方法を詳しく解説するとともに、実践的なサンプルコードを豊富に掲載しています：

**第3章：SAML 2.0実装**
- .NET、Java/Spring Boot、Node.js/Express、PHP、Pythonでの実装例
- 認証要求・応答の処理、証明書検証、クレーム抽出

**第4章：OpenID Connect実装**
- .NET、Java/Spring Boot、Node.js/Express、PHP、Pythonでの実装例
- トークン検証、ユーザー情報取得、セッション管理

**第5章：OAuth 2.0とMicrosoft Graph API**
- .NET、Java/Spring Boot、Node.js/Express、PHP、Pythonでの実装例
- アクセストークン取得、API呼び出し、エラーハンドリング

**第6章：ユーザープロビジョニング**
- SCIM 2.0エンドポイントの実装例
- 自動ユーザー作成・更新・削除の処理

**第7章：セキュリティベストプラクティス**
- トークン管理、PKCE実装、監査ログの設定例

### 利用上の注意

- サンプルコードは教育目的で作成されており、そのまま本書内に掲載されています
- 本番環境で使用する際は、必ず自社のセキュリティ要件に合わせてカスタマイズしてください
- コードをコピー&ペーストする際は、環境変数や設定値を適切に変更してください

## 動作環境と前提条件

### 必要な環境

本書のサンプルコードを動作させるには、以下の環境が必要です。

**開発環境**
- OS: Windows 10/11、macOS 10.15以降、Ubuntu 20.04 LTS以降
- .NET: 6.0以降（各章の.NET実装例用）
- Java: 11以降（各章のJava/Spring Boot実装例用）
- Node.js: 16.x以降（各章のNode.js/Express実装例用）
- PHP: 8.0以降（各章のPHP実装例用）
- Python: 3.8以降（各章のPython実装例用）
- Visual Studio Code または任意のIDE

**Microsoft Entra ID環境**
- Microsoft Entra ID テナント（無料版でも可）
- グローバル管理者またはアプリケーション管理者の権限
- 開発用のテストユーザーアカウント

**その他のツール**
- Git
- Postman または類似のAPIテストツール
- Chrome DevTools または類似の開発者ツール

### 前提知識

本書を最大限に活用するために、以下の知識があることが望ましいです。

- **Web開発の基礎知識**: HTTP/HTTPS、REST API、JSON
- **プログラミング経験**: .NET、Java、JavaScript/Node.js、PHP、Pythonのいずれか
- **認証の基礎概念**: 認証と認可の違い、セッション管理、トークンの概念
- **基本的なセキュリティ知識**: HTTPS、証明書、暗号化の基礎

これらの前提知識がない場合でも、各章で必要な概念は都度説明していますので、学習しながら読み進めることができます。

## 謝辞

本書の執筆にあたり、多くの方々にご協力いただきました。

技術的なレビューとフィードバックをいただいた皆様、サンプルコードのテストに協力いただいた開発者の方々、そして日々の業務でMicrosoft Entra IDとの連携に取り組まれているすべてのエンジニアの皆様に、心より感謝申し上げます。

また、Microsoft社の技術ドキュメントチーム、開発者コミュニティの皆様の継続的な情報発信と知識共有にも深く感謝いたします。

最後に、本書が皆様のプロジェクトの成功に少しでも貢献できることを願っています。

---

それでは、Microsoft Entra IDとの認証連携の世界へ、一緒に踏み出しましょう。