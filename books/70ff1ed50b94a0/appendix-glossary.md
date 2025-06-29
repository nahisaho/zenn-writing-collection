---
title: "付録A：用語集"
---

# 付録A：用語集

本書で使用される専門用語と略語の定義を、アルファベット順と五十音順で整理しています。

## A-Z

### A

**Access Token（アクセストークン）**
リソースサーバーがクライアントアプリケーションに特定のリソースへのアクセス権限を付与するために発行するトークン。OAuth 2.0プロトコルで使用される。

**ACS (Assertion Consumer Service)**
SAML 2.0において、Identity Providerから送信されるSAMLアサーションを受信・処理するService Providerのエンドポイント。

**AD FS (Active Directory Federation Services)**
Microsoftが提供するフェデレーション認証サービス。オンプレミスのActive Directoryとクラウドサービス間でのSSO環境を構築する。

**Application Registration（アプリケーション登録）**
Microsoft Entra IDにアプリケーションを登録し、認証・認可に必要な設定情報（Client ID、シークレット、リダイレクトURIなど）を定義するプロセス。

**Assertion（アサーション）**
SAML 2.0において、Identity Providerがユーザーの認証情報や属性情報を記述したXMLドキュメント。デジタル署名により改ざんを防ぐ。

**Authorization Code（認可コード）**
OAuth 2.0 Authorization Code Flowにおいて、認可サーバーがクライアントに一時的に発行するコード。アクセストークンと交換される。

**Azure AD（Azure Active Directory）**
Microsoft Entra IDの旧称。2023年8月にMicrosoft Entra IDに名称変更された。

### B

**Bearer Token（ベアラートークン）**
HTTPヘッダーの`Authorization: Bearer`フィールドで送信されるトークン。OAuth 2.0で一般的に使用される認証方式。

**B2B (Business-to-Business)**
企業間での協業を可能にするMicrosoft Entra IDの機能。外部組織のユーザーを自組織のリソースに招待できる。

**B2C (Business-to-Consumer)**
顧客向けアプリケーションでの認証を提供するAzure Active Directory B2Cサービス。カスタマイズ可能なユーザー体験を提供。

### C

**Claims（クレーム）**
トークンやアサーションに含まれるユーザーの属性情報（名前、メールアドレス、役職など）。認証および認可の判断に使用される。

**Client Credentials Flow**
OAuth 2.0のフローの一つ。アプリケーション自体の認証に使用され、ユーザーの介入なしにアクセストークンを取得する。

**Client ID（クライアントID）**
Microsoft Entra IDにおいてアプリケーションを一意に識別するGUID形式の識別子。

**Client Secret（クライアントシークレット）**
アプリケーションがMicrosoft Entra IDに対して自身を認証するために使用する秘密情報。

**Conditional Access（条件付きアクセス）**
ユーザーの場所、デバイス、リスクレベルなどの条件に基づいてアクセス制御を行うMicrosoft Entra IDの機能。

### D

**Directory（ディレクトリ）**
Microsoft Entra IDにおけるテナントの別称。組織のユーザー、グループ、アプリケーションなどの情報を格納する論理的な境界。

### E

**Enterprise Applications（エンタープライズアプリケーション）**
Microsoft Entra IDでSSO対象として管理されるアプリケーション。ギャラリーアプリとカスタムアプリがある。

### F

**Federation（フェデレーション）**
異なる組織やシステム間で認証情報を安全に共有し、相互運用を可能にする仕組み。

### G

**Graph API**
Microsoft のクラウドサービス（Microsoft 365、Azure、Enterprise Mobility + Security）のデータにアクセスするためのRESTful Web API。

### I

**ID Token（IDトークン）**
OpenID Connectにおいて、ユーザーの認証情報を含むJWT形式のトークン。ユーザーの身元確認に使用される。

**IdP (Identity Provider)**
認証情報を管理し、他のサービスに対してユーザーの認証結果を提供するサービス。Microsoft Entra IDはIdPとして機能する。

**Implicit Flow（インプリシットフロー）**
OAuth 2.0のフローの一つ。主にJavaScriptアプリケーションで使用されるが、セキュリティ上の理由から現在は非推奨。

### J

**JWT (JSON Web Token)**
JSON形式の情報を安全に送信するためのオープンスタンダード。OpenID ConnectのIDトークンで使用される。

**JIT (Just-In-Time) Provisioning**
ユーザーが初回ログイン時に自動的にアカウントを作成するプロビジョニング方式。

### M

**MFA (Multi-Factor Authentication)**
複数の認証要素（知識、所有、生体など）を組み合わせてセキュリティを強化する認証方式。

**MSAL (Microsoft Authentication Library)**
Microsoft が提供するクライアントライブラリ。OAuth 2.0とOpenID Connectプロトコルを使用した認証を簡素化する。

### O

**OAuth 2.0**
リソースアクセスの認可に特化したオープンスタンダードプロトコル。APIアクセスの安全な制御に使用される。

**OIDC (OpenID Connect)**
OAuth 2.0の上に構築された認証プロトコル。ユーザー認証とAPIアクセス認可の両方を提供する。

### P

**PKCE (Proof Key for Code Exchange)**
OAuth 2.0のセキュリティ拡張。認可コードの傍受攻撃を防ぐためにパブリッククライアントで使用される。

**Principal（プリンシパル）**
セキュリティコンテキストにおいて、認証・認可の対象となるエンティティ（ユーザー、アプリケーション、サービスなど）。

### R

**Refresh Token（リフレッシュトークン）**
アクセストークンの有効期限が切れた際に、新しいアクセストークンを取得するために使用される長期有効なトークン。

**Redirect URI**
認証完了後にユーザーをリダイレクトするURL。セキュリティのため事前にアプリケーション登録で定義する必要がある。

### S

**SAML 2.0 (Security Assertion Markup Language)**
XMLベースの認証・認可情報交換プロトコル。エンタープライズ環境でのSSO実装に広く使用される。

**SCIM (System for Cross-domain Identity Management)**
システム間でのユーザー・グループ情報の自動プロビジョニングを標準化するRESTful プロトコル。

**Service Principal（サービスプリンシパル）**
Microsoft Entra IDにおいて、アプリケーションやサービスを表すセキュリティプリンシパル。

**SP (Service Provider)**
SAML 2.0において、ユーザーにサービスを提供し、認証をIdPに委託するアプリケーション。

**SSO (Single Sign-On)**
一度の認証で複数のアプリケーションやサービスにアクセスできる仕組み。

### T

**Tenant（テナント）**
Microsoft Entra IDにおける組織の論理的な境界。独立したディレクトリサービスインスタンス。

**Token Endpoint（トークンエンドポイント）**
OAuth 2.0/OpenID Connectにおいて、認可コードをアクセストークンやIDトークンと交換するエンドポイント。

### Z

**Zero Trust**
「信頼を前提とせず、すべてを検証する」セキュリティモデル。継続的な認証・認可により最小権限アクセスを実現する。

## あ行

**アクセストークン**
→ Access Token を参照

**アサーション**
→ Assertion を参照

**アプリケーション登録**
→ Application Registration を参照

**エンタープライズアプリケーション**
→ Enterprise Applications を参照

## か行

**クレーム**
→ Claims を参照

**クライアントID**
→ Client ID を参照

**条件付きアクセス**
→ Conditional Access を参照

## さ行

**サービスプリンシパル**
→ Service Principal を参照

**シングルサインオン**
→ SSO を参照

## た行

**テナント**
→ Tenant を参照

**トークンエンドポイント**
→ Token Endpoint を参照

## な行

**認可コード**
→ Authorization Code を参照

## は行

**フェデレーション**
→ Federation を参照

**プリンシパル**
→ Principal を参照

## ま行

**マルチファクター認証**
→ MFA を参照

## ら行

**リダイレクトURI**
→ Redirect URI を参照

**リフレッシュトークン**
→ Refresh Token を参照

## 略語一覧

| 略語 | 正式名称 | 日本語 |
|------|----------|--------|
| AAD | Azure Active Directory | Azure Active Directory（旧称） |
| ACS | Assertion Consumer Service | アサーション消費サービス |
| AD FS | Active Directory Federation Services | Active Directory フェデレーションサービス |
| API | Application Programming Interface | アプリケーションプログラミングインターフェース |
| B2B | Business-to-Business | 企業間取引 |
| B2C | Business-to-Consumer | 企業対消費者 |
| CA | Conditional Access | 条件付きアクセス |
| FIDO | Fast Identity Online | 高速オンライン認証 |
| HTTP | Hypertext Transfer Protocol | ハイパーテキスト転送プロトコル |
| HTTPS | HTTP Secure | セキュアHTTP |
| IdP | Identity Provider | IDプロバイダー |
| JIT | Just-In-Time | ジャストインタイム |
| JSON | JavaScript Object Notation | JavaScript オブジェクト記法 |
| JWT | JSON Web Token | JSON ウェブトークン |
| MFA | Multi-Factor Authentication | 多要素認証 |
| MSAL | Microsoft Authentication Library | Microsoft認証ライブラリ |
| OAuth | Open Authorization | オープン認可 |
| OIDC | OpenID Connect | OpenID Connect |
| PKCE | Proof Key for Code Exchange | 認可コード交換の証明キー |
| REST | Representational State Transfer | 表現状態転送 |
| SAML | Security Assertion Markup Language | セキュリティアサーションマークアップ言語 |
| SCIM | System for Cross-domain Identity Management | ドメイン間ID管理システム |
| SDK | Software Development Kit | ソフトウェア開発キット |
| SLA | Service Level Agreement | サービスレベル合意 |
| SP | Service Provider | サービスプロバイダー |
| SPA | Single Page Application | シングルページアプリケーション |
| SSO | Single Sign-On | シングルサインオン |
| TLS | Transport Layer Security | トランスポートレイヤーセキュリティ |
| URI | Uniform Resource Identifier | 統一リソース識別子 |
| URL | Uniform Resource Locator | 統一リソースロケータ |
| XML | Extensible Markup Language | 拡張可能マークアップ言語 |

## プロトコル・技術仕様

### SAML 2.0 関連

**AuthnRequest**
Service ProviderからIdentity Providerに送信される認証要求メッセージ。

**AuthnResponse**
Identity ProviderからService Providerに送信される認証応答メッセージ。

**Binding**
SAMLメッセージの転送方法を定義する仕様。HTTP POST、HTTP Redirectなどがある。

**Metadata**
SAML エンティティ（IdP、SP）の設定情報を記述したXMLドキュメント。

**Profile**
特定のユースケースに対するSAMLの実装方式。Web Browser SSO Profileが最も一般的。

### OAuth 2.0 / OpenID Connect 関連

**Authorization Endpoint**
ユーザーの認証と認可を行うエンドポイント。認可コードを発行する。

**Scope**
アクセストークンが持つ権限の範囲を定義するパラメータ。

**State Parameter**
CSRF攻撃を防ぐためにクライアントが生成するランダムな値。

**Userinfo Endpoint**
アクセストークンを使用してユーザー情報を取得するエンドポイント。

### Microsoft Graph API 関連

**Microsoft Graph**
Microsoft クラウドサービスの統合APIエンドポイント。

**Permission**
Microsoft Graph APIにアクセスするために必要な権限。Delegated（委任）とApplication（アプリケーション）がある。

**Resource**
Microsoft Graph APIでアクセス可能なデータやサービス（ユーザー、メール、カレンダーなど）。

## セキュリティ用語

**Certificate（証明書）**
公開鍵暗号方式において、公開鍵の正当性を証明するデジタル証明書。

**Digital Signature（デジタル署名）**
メッセージの完全性と送信者の認証を保証する暗号技術。

**Encryption（暗号化）**
データを第三者が読めない形に変換するプロセス。

**Hash（ハッシュ）**
任意長のデータを固定長の値に変換する一方向関数。

**Nonce**
一度だけ使用される数値。リプレイ攻撃を防ぐために使用される。

**Salt**
パスワードハッシュ化時に追加されるランダムな値。レインボーテーブル攻撃を防ぐ。

## エラーコード

### OAuth 2.0 / OpenID Connect エラー

**invalid_request**
リクエストに必須パラメータが不足している、または不正な値が含まれている。

**invalid_client**
クライアント認証に失敗した。

**invalid_grant**
提供された認可コードが無効、期限切れ、または取り消されている。

**unauthorized_client**
クライアントがこの方法での認可要求を許可されていない。

**unsupported_grant_type**
指定されたgrant_typeがサポートされていない。

**invalid_scope**
要求されたスコープが無効、不明、または不正な形式である。

### SAML エラー

**AuthnFailed**
認証プロセスが失敗した。

**InvalidAttrNameOrValue**
属性名または属性値が無効である。

**InvalidNameIDPolicy**
NameIDPolicyが無効または処理できない。

**NoAuthnContext**
要求された認証コンテキストを提供できない。

**RequestDenied**
Identity Providerがリクエストを拒否した。

**UnsupportedBinding**
要求されたバインディングがサポートされていない。