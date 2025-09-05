---
title: "付録E: 用語集"
---

# 用語集

本書で使用される専門用語・略語・概念について、教育機関でのZero Trust実装に重要な項目を中心に解説します。理解の深化と実践的活用にご活用ください。

---

## A

### A3 / A5 (Microsoft 365 Education)
教育機関向けMicrosoft 365ライセンス。A3は基本機能、A5は高度なセキュリティ・分析機能を含む。Student Use Benefit (SUB) により学生向けライセンスも提供。

### Access Reviews
Microsoft Entra ID P2の機能。ユーザー・グループ・アプリケーションのアクセス権限を定期的にレビューし、不適切な権限を識別・削除するプロセス。

### Advanced Audit
Microsoft 365 A5の監査機能。基本監査（90日保持）を超える1年間のログ保持と高度な検索・分析機能を提供。

### AI-driven Security
人工知能・機械学習を活用したセキュリティ対策。異常検知・行動分析・自動対応により、従来の署名ベース検知を超えた防御を実現。

### Attack Simulation Training
Microsoft Defender for Office 365 Plan 2の機能。フィッシング攻撃等を模擬し、ユーザーのセキュリティ意識向上を図る教育ツール。

### Automated Investigation and Response (AIR)
セキュリティインシデントの自動調査・対応機能。Microsoft Defender製品群で提供され、人的介入を最小化した迅速な対応を実現。

### Azure Information Protection (AIP)
Microsoft のデータ分類・保護サービス。機密情報に自動的にラベルを付与し、暗号化・アクセス制御を適用。Plan 1（基本）とPlan 2（高度分類）がある。

---

## B

### BYOD (Bring Your Own Device)
個人所有デバイスの業務利用。教育機関では教職員・学習者の私有スマートフォン・タブレット等の活用。適切な管理・セキュリティ対策が必要。

### Break-glass Account
緊急時用管理者アカウント。通常のMFA・条件付きアクセスから除外し、システム障害時でも管理機能にアクセス可能にする特別アカウント。

---

## C

### CA (Conditional Access)
条件付きアクセス。ユーザー・デバイス・場所・リスク等の条件に基づき、動的にアクセス制御を実行。Zero Trustの中核技術の一つ。

### CASB (Cloud Access Security Broker)
クラウドサービス利用を監視・制御するセキュリティソリューション。Microsoft Defender for Cloud AppsがCASB機能を提供。

### Cloud App Security
Microsoft Defender for Cloud Appsの旧称。SaaS・IaaS・PaaSの利用を可視化し、データ保護・脅威検知を実行。

### Compliance Center
Microsoft 365コンプライアンス機能の管理画面。DLP・eDiscovery・監査・情報ガバナンス等を統合管理。

### CSP (Cloud Solution Provider)
Microsoftクラウドサービスの販売・サポートを行う認定パートナープログラム。教育機関はCSPを通じてライセンス購入・技術支援を受ける。

---

## D

### Data Loss Prevention (DLP)
データ漏洩防止。機密情報の不正な共有・送信を検知・防止する技術。基本DLP（A3/A5共通）とEndpoint DLP（A5のみ）がある。

### Device Compliance
デバイス準拠性。Intuneで設定する要件（OS更新・暗号化・PIN等）にデバイスが準拠しているかの評価。条件付きアクセスの判断材料。

### Digital Citizenship
デジタル技術を責任を持って倫理的に使用する能力・態度。教育機関でのICT活用において重要な概念。

---

## E

### EDR (Endpoint Detection and Response)
エンドポイントでの高度な脅威検知・対応。Microsoft Defender for Endpoint が EDR機能を提供。Plan 1（基本）とPlan 2（高度）がある。

### eDiscovery
電子情報開示。法的手続きに必要な電子データの検索・保持・提供プロセス。Standard（A3/A5共通）とPremium（A5のみ）がある。

### Exchange Online Protection (EOP)
Microsoft 365の標準メール保護サービス。スパム・マルウェア・フィッシング対策を提供。

---

## F

### FIDO2
Fast Identity Online 2.0。パスワードレス認証標準。物理セキュリティキーやWindows Hello等で実装。

### Federated Identity
フェデレーション認証。複数組織間でのシングルサインオンを実現する認証方式。教育機関間連携で活用。

---

## G

### GIGA スクール構想
文部科学省による「1人1台端末・高速ネットワーク」整備事業。学習者用ICT環境の飛躍的向上を図る。

### Guest Access
ゲストアクセス。外部ユーザーに対するシステム・リソースへのアクセス許可。Microsoft Teamsでの外部連携等で使用。

---

## H

### Hybrid Identity
オンプレミスActive DirectoryとクラウドAzure ADを連携させる認証基盤。Azure AD Connectで同期・統合を実現。

---

## I

### Identity Protection
Microsoft Entra ID P2の機能。機械学習によるリスク分析により、漏洩資格情報・異常サインインを検知・防止。

### Information Governance
情報ガバナンス。組織のデータを適切に分類・保護・保持・削除するプロセス。Microsoft Purviewで実装。

### Intune
Microsoft のモバイルデバイス管理（MDM）・アプリケーション管理（MAM）サービス。BYOD・組織所有デバイスの統合管理。

---

## J

### Just-in-Time (JIT) Access
必要時のみ特権を付与するアクセス制御方式。Privileged Identity Management (PIM) で実装。管理者権限の濫用防止。

---

## L

### Legacy Authentication
レガシー認証。古い認証プロトコル（基本認証・POP・IMAP等）。多要素認証に対応せず、セキュリティリスクが高い。

### Litigation Hold
法的保持。訴訟・調査のため電子データを削除から保護する機能。eDiscovery の一部として提供。

---

## M

### MFA (Multi-Factor Authentication)
多要素認証。パスワード + SMS・アプリ・生体認証等の複数要素による認証強化。Zero Trust の基盤技術。

### Microsoft Defender
Microsoft の統合セキュリティプラットフォーム。Endpoint・Office 365・Identity・Cloud Apps の各製品群を統合。

### Microsoft Graph
Microsoft 365・Azure の統合API。データアクセス・操作を統一インターフェースで提供。自動化・カスタム開発に活用。

### Microsoft Purview
Microsoft のデータガバナンス・コンプライアンス統合プラットフォーム。旧称「Microsoft 365 Compliance」。

### Microsoft Secure Score
組織のセキュリティ体制を数値化した指標。設定状況・リスク評価に基づき改善提案を提供。

### Microsoft Sentinel
Microsoft のクラウドネイティブSIEM・SOARソリューション。大規模ログ分析・自動対応・脅威ハンティング機能。

---

## N

### NIST SP800-207
米国国立標準技術研究所が2020年に発行したZero Trust Architectureの包括的定義文書。業界標準として広く参照される。

### Never Trust, Always Verify
「何も信頼せず、すべてを検証する」。Zero Trustの基本原則。内部・外部を問わず全アクセスを検証。

---

## O

### Office Message Encryption (OME)
Microsoft 365のメール暗号化機能。外部送信時の自動暗号化・有効期限制御等。Basic（A3/A5共通）とAdvanced（A5のみ）。

---

## P

### Phishing
フィッシング。偽装メール・サイトで認証情報を詐取する攻撃手法。教育機関でも被害が多発。

### PIM (Privileged Identity Management)
特権ID管理。Microsoft Entra ID P2の機能。管理者権限のJust-in-Time付与・承認フロー・監査を提供。

### Privileged Access Management (PAM)
特権アクセス管理。高権限アカウントの保護・監視・制御を包括的に管理するセキュリティ対策。

---

## R

### Risk-based Authentication
リスクベース認証。ユーザー・デバイス・場所・行動パターンを分析し、リスクに応じて認証要求を動的調整。

### Rights Management
権利管理。ドキュメント・メールに暗号化・アクセス制御を適用し、コピー・印刷・転送等を制限する技術。

---

## S

### SAML (Security Assertion Markup Language)
セキュリティ認証マークアップ言語。シングルサインオン・フェデレーション認証で使用される標準プロトコル。

### Secure Score
→ Microsoft Secure Score 参照

### Security Operations Center (SOC)
セキュリティ運用センター。24時間365日のセキュリティ監視・インシデント対応を行う組織・体制。

### SIEM (Security Information and Event Management)
セキュリティ情報・イベント管理。ログ収集・分析・相関分析によりセキュリティ脅威を検知。Microsoft Sentinel が提供。

### Single Sign-On (SSO)
シングルサインオン。一度の認証で複数システムに自動ログイン。ユーザビリティ向上とセキュリティ強化を両立。

### SOAR (Security Orchestration, Automation and Response)
セキュリティオーケストレーション・自動化・対応。インシデント対応プロセスの自動化・標準化。

### Student Use Benefit (SUB)
学生使用特典。教育機関がA3/A5ライセンスを購入した場合、学生は追加費用なしで同等機能を利用可能。

---

## T

### Threat Intelligence
脅威インテリジェンス。サイバー攻撃の手法・指標・傾向に関する情報。Microsoft Defenderで活用。

### Threat Explorer
Microsoft Defender for Office 365 Plan 2の機能。メール脅威の詳細分析・可視化・対応機能を提供。

### Total Cost of Ownership (TCO)
総所有コスト。ライセンス・実装・運用・保守等の全コストを含む投資評価指標。

---

## U

### User Entity and Behavior Analytics (UEBA)
ユーザー・エンティティ行動分析。機械学習により通常の行動パターンを学習し、異常行動を検知。

---

## V

### VPN (Virtual Private Network)
仮想プライベートネットワーク。暗号化通信によりセキュアなリモートアクセスを実現。Zero Trustでは補完的役割。

---

## W

### Windows Autopilot
Windowsデバイスの自動セットアップ・プロビジョニング機能。教育機関での大量デバイス展開を効率化。

### Windows Hello for Business
Windows のパスワードレス認証システム。生体認証・PIN・セキュリティキーを活用。

---

## X

### XDR (Extended Detection and Response)
拡張検知・対応。エンドポイント・ネットワーク・クラウド・アプリケーションを統合したセキュリティ対応。

---

## Z

### Zero Trust
ゼロトラスト。「何も信頼せず、すべてを検証する」原則に基づくセキュリティアーキテクチャ。境界防御から Identity 中心の防御への転換。

### Zero Trust Architecture
Zero Trust を実現するためのシステム・ネットワーク・プロセスの包括的設計。NIST SP800-207で標準化。

### Zero Trust Network Access (ZTNA)
Zero Trust ネットワークアクセス。VPNに代わる次世代リモートアクセス技術。アプリケーション単位での細粒度制御。

---

## 3層分離モデル
従来の教育情報セキュリティで採用された境界防御モデル。校務系・学習系・インターネット系を物理的に分離。GIGA時代には制約が顕在化。

---

## 略語一覧

| 略語 | 正式名称 | 意味 |
|------|----------|------|
| AAD | Azure Active Directory | Microsoft のクラウド認証基盤 (現 Microsoft Entra ID) |
| AD | Active Directory | Microsoft のオンプレミス認証基盤 |
| AI | Artificial Intelligence | 人工知能 |
| AIR | Automated Investigation and Response | 自動調査・対応 |
| AIP | Azure Information Protection | Azure 情報保護 |
| ATP | Advanced Threat Protection | 高度脅威保護 (現 Microsoft Defender) |
| BYOD | Bring Your Own Device | 私物デバイス利用 |
| CA | Conditional Access | 条件付きアクセス |
| CASB | Cloud Access Security Broker | クラウドアクセスセキュリティブローカー |
| CSP | Cloud Solution Provider | クラウドソリューションプロバイダー |
| DLP | Data Loss Prevention | データ漏洩防止 |
| EDR | Endpoint Detection and Response | エンドポイント検知・対応 |
| EOP | Exchange Online Protection | Exchange Online 保護 |
| GIGA | Global and Innovation Gateway for All | GIGAスクール構想 |
| IAM | Identity and Access Management | ID・アクセス管理 |
| IdP | Identity Provider | ID プロバイダー |
| JIT | Just-in-Time | 必要時のみ |
| MAM | Mobile Application Management | モバイルアプリ管理 |
| MDM | Mobile Device Management | モバイルデバイス管理 |
| MFA | Multi-Factor Authentication | 多要素認証 |
| ML | Machine Learning | 機械学習 |
| NIST | National Institute of Standards and Technology | 米国国立標準技術研究所 |
| OME | Office Message Encryption | Office メッセージ暗号化 |
| PIM | Privileged Identity Management | 特権ID管理 |
| RBAC | Role-Based Access Control | ロールベースアクセス制御 |
| SAML | Security Assertion Markup Language | セキュリティ認証マークアップ言語 |
| SIEM | Security Information and Event Management | セキュリティ情報・イベント管理 |
| SOAR | Security Orchestration, Automation and Response | セキュリティ自動化・対応 |
| SOC | Security Operations Center | セキュリティ運用センター |
| SSO | Single Sign-On | シングルサインオン |
| SUB | Student Use Benefit | 学生使用特典 |
| TCO | Total Cost of Ownership | 総所有コスト |
| UEBA | User and Entity Behavior Analytics | ユーザー・エンティティ行動分析 |
| VPN | Virtual Private Network | 仮想プライベートネットワーク |
| XDR | Extended Detection and Response | 拡張検知・対応 |
| ZTNA | Zero Trust Network Access | Zero Trust ネットワークアクセス |

---

## 注意事項

1. **用語の進化**: Microsoft 365・Azure の機能・名称は継続的に変更されます。最新情報は公式ドキュメントで確認してください

2. **地域差**: 一部機能・サービスは地域により名称・利用可否が異なる場合があります

3. **ライセンス依存**: 機能の利用には適切なライセンスが必要です。本書第9章・付録Aで詳細を確認してください

4. **実装差**: 同一機能でも組織・環境により実装方法が異なる場合があります

この用語集は、教育機関でのZero Trust理解・実装における基礎知識として活用してください。不明な点は専門家・認定パートナーにご相談することをお勧めします。