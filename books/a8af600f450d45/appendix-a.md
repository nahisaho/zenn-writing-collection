---
title: "付録A: Microsoft 365 A3/A5機能比較表"
---

# Microsoft 365 A3/A5 教育機関向け機能比較表

本付録では、教育機関でのZero Trust Architecture実現に重要な機能について、A3とA5の詳細な比較を提供します。ライセンス選択の判断材料として活用してください。

## Identity・認証管理機能

| 機能カテゴリ | 機能名 | A3 | A5 | 教育機関での重要度 | 備考 |
|------------|--------|----|----|------------------|------|
| **基盤認証** | Microsoft Entra ID (基本) | ✅ | ✅ | 高 | 基本的なSSO・ディレクトリ同期 |
| | Microsoft Entra ID Plan 1 | ✅ | ✅ | 高 | 条件付きアクセス・グループベースライセンス |
| | Microsoft Entra ID Plan 2 | ❌ | ✅ | 中〜高 | Identity Protection・PIM・Access Reviews |
| **多要素認証** | 基本MFA | ✅ | ✅ | 高 | SMS・音声通話・Authenticator |
| | 条件付きアクセス | ✅ | ✅ | 高 | 場所・デバイス・アプリ別制御 |
| | リスクベース認証 | ❌ | ✅ | 中 | AI分析による動的認証要求 |
| **特権管理** | 基本管理者役割 | ✅ | ✅ | 高 | Global Admin・Security Admin等 |
| | Privileged Identity Management (PIM) | ❌ | ✅ | 中〜高 | Just-in-Time特権アクセス |
| | Access Reviews | ❌ | ✅ | 中 | 定期的なアクセス権レビュー |
| **Identity保護** | 基本監査ログ | ✅ | ✅ | 高 | サインインログ・監査ログ |
| | Identity Protection | ❌ | ✅ | 中 | 漏洩資格情報検知・リスク分析 |
| | セキュリティレポート | 基本 | 高度 | 中 | A5では詳細なリスクレポート |

## デバイス管理・エンドポイントセキュリティ

| 機能カテゴリ | 機能名 | A3 | A5 | 教育機関での重要度 | 備考 |
|------------|--------|----|----|------------------|------|
| **デバイス管理** | Microsoft Intune | ✅ | ✅ | 高 | モバイルデバイス管理・アプリ管理 |
| | Windows Autopilot | ✅ | ✅ | 中 | デバイス自動セットアップ |
| | コンプライアンスポリシー | ✅ | ✅ | 高 | デバイス準拠性管理 |
| **エンドポイント保護** | Microsoft Defender Antivirus | ✅ | ✅ | 高 | 基本的なマルウェア対策 |
| | Microsoft Defender for Endpoint Plan 1 | ✅ | ❌ | 中〜高 | 基本的なEDR機能 |
| | Microsoft Defender for Endpoint Plan 2 | ❌ | ✅ | 高 | 高度なEDR・脅威ハンティング |
| | 自動調査・修復 (AIR) | 基本 | 高度 | 中〜高 | A5では完全自動化対応 |
| | 脅威インテリジェンス | 基本 | 高度 | 中 | A5では高度な脅威情報 |

## メール・コラボレーションセキュリティ

| 機能カテゴリ | 機能名 | A3 | A5 | 教育機関での重要度 | 備考 |
|------------|--------|----|----|------------------|------|
| **メールセキュリティ** | Exchange Online Protection | ✅ | ✅ | 高 | スパム・マルウェア対策 |
| | Microsoft Defender for Office 365 Plan 1 | ✅ | ✅ | 高 | Safe Attachments・Safe Links |
| | Microsoft Defender for Office 365 Plan 2 | ❌ | ✅ | 中〜高 | Threat Explorer・AIR・Attack Simulation・高度分析 |
| | 高度フィッシング対策 | 基本 | 高度 | 高 | A5では機械学習ベース検知 |
| **Teams セキュリティ** | Teams基本保護 | ✅ | ✅ | 高 | 基本的なデータ保護・アクセス制御 |
| | Teams高度保護 | 部分的 | ✅ | 中 | 高度DLP・情報保護ラベル |
| | 会議セキュリティ | ✅ | ✅ | 高 | 待機室・参加者管理 |

## データ保護・情報ガバナンス

| 機能カテゴリ | 機能名 | A3 | A5 | 教育機関での重要度 | 備考 |
|------------|--------|----|----|------------------|------|
| **データ損失防止** | 基本DLP (Exchange・SharePoint・OneDrive) | ✅ | ✅ | 高 | メール・ファイル共有の基本保護 |
| | Endpoint DLP | ❌ | ✅ | 中〜高 | エンドポイントでのデータ保護 |
| | Teams Chat DLP | ❌ | ✅ | 中 | チャット内機密情報検知 |
| **情報保護** | Azure Information Protection Plan 1 | ✅ | ✅ | 中〜高 | 基本的なラベル付け・暗号化 |
| | Azure Information Protection Plan 2 | ❌ | ✅ | 高 | 高度分類・自動ラベル付け・機械学習分類 |
| | Rights Management | ✅ | ✅ | 中〜高 | ドキュメント暗号化・アクセス制御 |
| **メッセージ暗号化** | 基本Message Encryption | ✅ | ✅ | 中 | メール暗号化機能 |
| | Advanced Message Encryption | ❌ | ✅ | 中 | 高度暗号化・有効期限制御 |

## 監査・コンプライアンス

| 機能カテゴリ | 機能名 | A3 | A5 | 教育機関での重要度 | 備考 |
|------------|--------|----|----|------------------|------|
| **監査機能** | 基本監査ログ | ✅ | ✅ | 高 | 90日間の基本ログ保持 |
| | 高度監査 (Advanced Audit) | ❌ | ✅ | 中〜高 | 1年間保持・高度検索・アラート |
| | 監査ログ検索 | 基本 | 高度 | 高 | A5では詳細フィルタリング |
| **eDiscovery** | Content Search | ✅ | ✅ | 中〜高 | 基本的なコンテンツ検索 |
| | eDiscovery (Standard) | ✅ | ✅ | 中 | 法的保持・エクスポート |
| | eDiscovery (Premium) | ❌ | ✅ | 中 | 高度分析・機械学習分類 |
| **法的保持** | Litigation Hold | ✅ | ✅ | 中〜高 | メールボックス保持 |
| | Advanced Hold | ❌ | ✅ | 中 | SharePoint・Teams含む包括的保持 |
| **コンプライアンス** | Communication Compliance | ❌ | ✅ | 低〜中 | 不適切コミュニケーション検知 |
| | Insider Risk Management | ❌ | ✅ | 低 | 内部不正リスク検知 |

## 分析・レポート機能

| 機能カテゴリ | 機能名 | A3 | A5 | 教育機関での重要度 | 備考 |
|------------|--------|----|----|------------------|------|
| **利用状況分析** | 基本利用状況レポート | ✅ | ✅ | 中 | Microsoft 365 usage analytics |
| | Power BI Pro | ❌ | ✅ | 中 | 高度なデータ分析・ダッシュボード |
| | MyAnalytics | ❌ | ✅ | 低 | 個人生産性分析 |
| **セキュリティ分析** | Microsoft 365 Defender | 基本 | 高度 | 中〜高 | 統合セキュリティダッシュボード |
| | セキュリティスコア | ✅ | ✅ | 中 | セキュリティ体制評価 |
| | 脅威インテリジェンス | 基本 | 高度 | 中 | A5では詳細な脅威分析 |

## 音声・会議機能

| 機能カテゴリ | 機能名 | A3 | A5 | 教育機関での重要度 | 備考 |
|------------|--------|----|----|------------------|------|
| **Teams会議** | Teams会議基本機能 | ✅ | ✅ | 高 | オンライン授業・会議 |
| | Meeting Recording | ✅ | ✅ | 高 | 録画・自動文字起こし |
| | Phone System | ❌ | ✅ | 低〜中 | クラウドPBX機能 |
| | Audio Conferencing | ❌ | ✅ | 低〜中 | 電話参加機能 |
| **放送機能** | Teams Live Events | ✅ | ✅ | 中 | 大規模配信イベント |
| | Stream | ✅ | ✅ | 中 | 動画配信・管理 |

## 教育機関でのライセンス選択ガイドライン

### A3が適切な場合

**推奨条件**：
- 学校規模：2,000名以下
- 校務データ：基本的な学籍・成績管理中心
- IT体制：専任1-3名の基本運用
- 予算制約：IT予算に厳しい制限

**A3で十分な機能**：
- 基本的なMFA・条件付きアクセス
- Standard DLP・基本情報保護
- Intune基本デバイス管理
- 基本的な監査・eDiscovery

### A5が推奨される場合

**推奨条件**：
- 学校規模：3,000名以上または複数拠点
- 校務データ：機密情報・健康情報等の高度保護要求
- IT体制：専任3名以上または高度スキル
- セキュリティ要件：高度な脅威対策が必要

**A5の重要機能**：
- Identity Protection・PIM
- Endpoint DLP・高度情報保護
- Microsoft Defender for Endpoint Plan 2
- 高度監査・Premium eDiscovery

## 実装優先度ランキング

教育機関での実装において、以下の優先順位で機能を検討することを推奨します：

### 【最優先】基盤セキュリティ (A3/A5共通)
1. 多要素認証 (MFA)
2. 条件付きアクセス
3. 基本DLP
4. デバイス管理 (Intune)
5. メールセキュリティ (EOP)

### 【高優先】高度セキュリティ (主にA5)
1. Identity Protection
2. Endpoint DLP  
3. Microsoft Defender for Endpoint Plan 2
4. 高度監査機能
5. PIM (特権管理)

### 【中優先】業務効率化
1. Power BI Pro (A5)
2. Teams高度機能
3. 高度eDiscovery
4. 自動分類・ラベル付け

### 【低優先】特殊要件
1. Communication Compliance
2. Insider Risk Management  
3. Phone System
4. Audio Conferencing

## 注意事項

- 本比較表は2024年12月時点の情報に基づき、Microsoft Learn公式ドキュメントで検証済みです
- Microsoft 365の機能は継続的に追加・変更されるため、最新情報は[Microsoft Learn](https://learn.microsoft.com/)で確認してください
- 教育機関固有の要件については、Microsoftまたは認定パートナーにご相談ください
- 一部機能は地域・テナント設定により利用可否が異なる場合があります
- ライセンス詳細は[Microsoft 365 Education比較ページ](https://www.microsoft.com/ja-jp/education/buy-license/microsoft365)で最新情報を確認してください