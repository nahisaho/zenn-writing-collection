---
title: "第6章: Conditional Accessによる校務システムへの安全なアクセス制御"
---

# この章で学ぶこと

:::message alert
⚠️ **本章の目的**: Conditional Accessの技術を学ぶことが目的ではありません。**不正アクセスから児童生徒の個人情報を守ること**が目的です。
:::

---

# なぜConditional Accessが児童生徒の個人情報を守るのか

## 児童生徒の個人情報へのアクセスを厳格に制御

校務支援システムには、児童生徒の以下のような極めて機密性の高い個人情報が保存されています：

- **成績情報**: 通知表、定期テスト、内申点
- **健康情報**: 既往症、アレルギー、健康診断結果
- **家庭環境**: 保護者の職業、収入状況、家族構成
- **要配慮情報**: いじめ・不登校に関する記録

従来の「学校内ネットワークからなら安全」という考え方では、侵害されたアカウントでも校内からは自由にアクセスできてしまいます。

**Conditional Accessは、すべてのアクセス要求に対して「誰が、どこから、どのデバイスで」アクセスしているかを厳格に確認し、不正アクセスをブロックすることで、児童生徒の個人情報を守ります。**

たとえば：
- 海外からのアクセス試行 → **ブロック**
- 管理されていない私物端末からのアクセス → **ブロック**
- 高リスクと判定されたアカウント → **ブロック**
- 校務支援システムへのアクセス → **必ずMFAを要求**

本章で設計するConditional Accessポリシーは、**児童生徒の個人情報を守るための最も重要な制御手段**です。

---

# 状況に応じた動的なアクセス制御を実装する

第5章では、Entra IDによる強固なID基盤を構築し、Identity Protectionによる脅威検知を実装しました。本章では、その基盤の上に **Conditional Access（条件付きアクセス）** を実装し、「誰が、いつ、どこから、どのデバイスで、何にアクセスするか」を細かく制御するゼロトラストの中核機能を実現します。

Conditional Accessの設計・構成により、校務支援システムへの安全なアクセスを確保します。

**本章で学ぶこと**:
- 教育委員会向けConditional Access設計の基本原則
- アクセス制御の判断材料（信号）の理解
- 教育委員会向け実践的なポリシー構成例
- 学校・教育委員会特有のシナリオへの対応
- ポリシーのテストと安全な展開方法

# 6.1 教育委員会向け Conditional Access 設計の基本

## Conditional Accessとは

**Conditional Access（条件付きアクセス）** は、Microsoft Entra IDのゼロトラスト政策エンジンであり、ユーザーがクラウドアプリケーションにアクセスする際に、**複数のシグナル（信号）を評価し、適切なアクセス制御を自動的に適用する**機能です。

### ゼロトラストにおける位置づけ

Conditional Accessは、ゼロトラストの第一原則「**明示的に検証する（Verify explicitly）**」を実現するための最も重要な機能です。

```
ゼロトラストの原則とConditional Accessの関係:

【原則1】明示的に検証する
→ Conditional Access: すべてのサインインで複数の信号を評価

【原則2】最小権限アクセスを使用する
→ Conditional Access: アクセス条件に応じて必要最小限の権限を付与

【原則3】侵害を想定する
→ Conditional Access: リスクに基づいて動的に制御を変更
```

### 従来の境界防御との違い

従来のセキュリティモデルでは、「学校のネットワーク内=信頼できる」という前提でアクセスを許可していました。しかし、この考え方では以下の脅威に対応できません。

**従来の境界防御の問題点**:

| 問題 | 具体的なリスク |
|-----|------------|
| **ネットワーク内=信頼** | 侵害されたアカウントでも校内からは全アクセス可能 |
| **VPN突破=終わり** | VPN認証を突破されると内部リソースに自由にアクセス |
| **デバイス確認なし** | マルウェア感染端末からでもアクセス可能 |
| **一律のアクセス許可** | 管理者も一般教職員も同じアクセス条件 |

**Conditional Accessによるゼロトラストモデル**:

```
✅ すべてのアクセス要求を評価して制御:

[サインイン要求]
    ↓
[複数のシグナルを収集]
  • ユーザー: 誰が？（役割、グループ）
  • 場所: どこから？（IPアドレス、国）
  • デバイス: どのデバイスで？（管理状態、コンプライアンス）
  • アプリ: 何に？（校務支援システム、グループウェア）
  • リスク: 不審な動作は？（Identity Protection）
    ↓
[ポリシー評価]
  • 条件に一致するポリシーをすべて評価
  • 複数のポリシーが適用される場合はすべて適用
    ↓
[アクセス制御を適用]
  • MFA要求
  • デバイスコンプライアンス要求
  • アクセス拒否
  • セッション制限
    ↓
[結果] アクセス許可 or 拒否
```

### 教育機関でのConditional Accessの重要性

#### 理由1: 児童生徒の個人情報保護

校務支援システムには、児童生徒の成績・健康情報・家庭環境など、極めて機密性の高い個人情報が保存されています。

**Conditional Accessによる保護**:
- 管理外のデバイスからのアクセスをブロック
- 不審な場所（海外等）からのアクセスをブロック
- 高リスクと判定されたアカウントのアクセスをブロック
- 校務支援システムへのアクセスには常にMFAを要求

#### 理由2: パスワードスプレー攻撃への対策

教育機関への攻撃の70%を占めるパスワードスプレー攻撃は、正しいパスワードでサインインを試みるため、従来の境界防御では防げません。

**Conditional Accessによる防御**:
```
【攻撃シナリオ】
攻撃者が教職員のアカウント情報を入手
    ↓
海外のIPアドレスから正しいパスワードでサインイン試行
    ↓
【Conditional Accessの判定】
✅ ユーザー: 正規（アカウント情報は正しい）
❌ 場所: 異常（日本国外）
❌ デバイス: 未管理（Intuneに登録されていない）
❌ リスク: 高（Identity Protectionが検知）
    ↓
【結果】アクセス拒否 → 攻撃を防御
```

#### 理由3: BYOD（私物端末）の制御

教育現場では、教職員が私物のスマートフォンやタブレットから校務システムにアクセスするケースがあります。

**Conditional Accessによる制御**:
- 私物端末からのアクセス可否を組織のポリシーに従って制御
- 許可する場合でも、アプリ保護ポリシーでデータ保護を強制
- 校務支援システムへのアクセスは管理端末のみに制限

## ポリシー設計の基本原則

### 原則1: ベースライン保護の実装

**すべてのユーザーに適用すべき最低限の保護**を最初に実装します。

**ベースラインポリシー** (必須):
1. **全ユーザーへのMFA強制**
2. **管理者アカウントの保護強化**
3. **レガシー認証のブロック**
4. **緊急アクセスアカウント（Break Glass）の除外**

これらのポリシーは、**組織のすべてのユーザーに適用される基礎的な保護**であり、最優先で実装すべきです。

### 原則2: 段階的展開とテスト戦略

Conditional Accessポリシーは、誤って設定すると**すべての教職員がサインインできなくなる**という重大な影響があります。そのため、必ず段階的に展開します。

**段階的展開の4フェーズ**:

```
【Phase 1】レポート専用モード（1-2週間）
  - ポリシーを評価するが、実際にはブロックしない
  - サインインログで影響範囲を確認
  - 誤検知や予期しない影響を発見

【Phase 2】パイロットグループ（1-2週間）
  - 情報担当者など、ITリテラシーの高い少数のユーザーに適用
  - 実際の運用での問題を確認
  - フィードバックを収集

【Phase 3】段階的本番展開（1ヶ月）
  - 1校 → 複数校 → 全校の順で展開
  - 各段階で1-2週間運用して問題ないことを確認
  - サインインログを継続的に監視

【Phase 4】本番運用
  - 全ユーザーに適用
  - 継続的な監視とポリシーの調整
```

:::message alert
**警告**: 緊急アクセスアカウント（Break Glass）は、**すべてのConditional Accessポリシーから除外**する必要があります。これを忘れると、管理者自身がロックアウトされる危険性があります。
:::

### 原則3: ポリシーの優先順位と競合解決

複数のConditional Accessポリシーが同じユーザーに適用される場合、**すべてのポリシーが評価され、すべての制御が適用**されます。

**評価の仕組み**:

```
例: 田中教諭（一般教職員かつ校務支援システム利用者）がサインイン

【適用されるポリシー】
1. CA001: 全ユーザーにMFA強制
   → 制御: MFA要求

2. CA005: 校務支援システムは準拠デバイスのみ
   → 制御: デバイスコンプライアンス要求

3. CA008: リスクベースアクセス制御
   → 制御: リスクが高い場合はMFA要求

【結果】
✅ MFA必須
✅ 準拠デバイス必須
✅ リスクが高い場合は追加のMFA

→ すべての条件を満たす必要がある
```

**ポリシーの競合を避けるための設計**:

| 設計パターン | 説明 | 例 |
|----------|------|---|
| **階層的設計** | 広範囲 → 狭い範囲の順でポリシーを適用 | 全ユーザー → 管理者 → 特定アプリ |
| **明確な除外** | 例外は明示的に除外グループで管理 | Break Glass、パイロットグループ |
| **レポート専用モードの活用** | 本番適用前に影響を確認 | What-Ifツール、サインインログ |

### 原則4: 監視と継続的改善

Conditional Accessポリシーは「設定して終わり」ではありません。継続的な監視と改善が必要です。

**監視すべき項目**:
- サインイン失敗の傾向（ブロックされているユーザー）
- MFA成功率
- デバイスコンプライアンス違反の傾向
- リスク検知の頻度

**改善サイクル**:
```
[1] サインインログを定期的に分析（週次）
     ↓
[2] 問題やパターンを発見
     - 特定の学校で頻繁にブロックされている
     - 特定のアプリでMFA失敗が多い
     ↓
[3] 原因を調査
     - ネットワーク構成の問題
     - ユーザー教育の不足
     - ポリシー設定の誤り
     ↓
[4] ポリシーまたは運用を改善
     - 除外設定の追加
     - ユーザー教育の実施
     - ポリシー条件の調整
     ↓
[5] 効果を測定して継続的に改善
```

# 6.2 アクセス制御の判断材料（信号）の理解
　
Conditional Accessは、複数の **信号（シグナル）** を組み合わせてアクセス制御を行います。本節では、各信号の種類と教育機関での活用方法を解説します。

## 信号1: ユーザーとグループ

**誰がアクセスしようとしているか**を評価します。

### ユーザー/グループの指定方法

| 指定方法 | 説明 | 教育機関での使用例 |
|--------|------|---------------|
| **すべてのユーザー** | テナント内のすべてのユーザー | ベースライン保護（MFA強制等） |
| **ユーザーを選択** | 個別のユーザーを指定 | 特定の管理者のみ許可 |
| **グループを選択** | セキュリティグループまたはM365グループ | 「校務支援システム利用者」グループ |
| **ディレクトリロール** | Entra IDの管理者ロール | グローバル管理者、ユーザー管理者 |
| **ゲストユーザー** | 外部ユーザー（B2Bコラボレーション） | 外部委託業者のアクセス制御 |

### 教育委員会での推奨グループ設計

```
【アクセス制御用グループ】

CA-Users-AllStaff（全教職員）
├─ CA-Users-SchoolTeachers（学校教職員）
│   ├─ CA-Users-School-A（A小学校教職員）
│   ├─ CA-Users-School-B（B中学校教職員）
│   └─ CA-Users-School-C（C高等学校教職員）
├─ CA-Users-BOE-Staff（教育委員会事務局職員）
└─ CA-Users-Temporary（臨時職員・非常勤講師）

CA-Users-Administrators（管理者）
├─ CA-Users-GlobalAdmins（グローバル管理者）
└─ CA-Users-ITAdmins（IT管理者）

【除外グループ】

CA-Exclude-BreakGlass（緊急アクセスアカウント）
CA-Exclude-Pilot（パイロットグループ除外）
CA-Exclude-ServiceAccounts（サービスアカウント）
```

:::message
**グループ名の命名規則**: 「CA-」で始めることで、Conditional Access用のグループであることを明示します。これにより、誤削除や誤変更を防げます。
:::

## 信号2: クラウドアプリケーション

**何にアクセスしようとしているか**を評価します。

### アプリケーションの指定方法

| 指定方法 | 説明 | 教育機関での使用例 |
|--------|------|---------------|
| **すべてのクラウドアプリ** | すべてのアプリに適用 | ベースラインMFA |
| **アプリを選択** | 特定のアプリを指定 | 校務支援システムのみ |
| **ユーザーアクション** | パスワード登録等の特定の操作 | セキュリティ情報の登録 |

### 教育委員会での主要アプリケーション

**クラウド型校務支援システム環境での主要アプリ**:

```
【優先度：高】
□ 校務支援システム（学籍・成績管理）
  → 最も厳格な制御が必要

□ Microsoft 365アプリ
  - Exchange Online（メール）
  - SharePoint Online（ファイル共有）
  - Teams（チャット・会議）
  - OneDrive for Business（個人ストレージ）

□ Entra ID管理ポータル
  → 管理者のみアクセス可能に制限

【優先度：中】
□ 統合認証している外部アプリ
  - 保護者連絡システム
  - 学習支援システム

【優先度：低】
□ その他の業務アプリ
```

### アプリケーション別の推奨制御

| アプリケーション | 推奨制御 | 理由 |
|-------------|--------|------|
| **校務支援システム** | MFA必須 + 準拠デバイス必須 | 個人情報保護 |
| **Exchange Online** | MFA必須 | フィッシング対策 |
| **SharePoint/OneDrive** | MFA必須 + 準拠デバイス必須 | 情報漏洩対策 |
| **Teams** | MFA必須 | アカウント侵害対策 |
| **Entra ID管理ポータル** | MFA必須 + 承認済みアプリ必須 + 信頼された場所のみ | 管理者保護 |

## 信号3: 条件

サインイン要求の**状況**を評価します。

### 条件の種類

#### (1) サインインリスク

Identity Protection が検出したサインイン時のリスクレベル。

| リスクレベル | 説明 | 検知例 |
|----------|------|-------|
| **高** | 高い確率で侵害されている | 海外からの不審なサインイン、漏洩した資格情報の使用 |
| **中** | 疑わしい動作が検知された | 通常と異なる場所からのサインイン |
| **低** | わずかに疑わしい | 新しいデバイスからのサインイン |

:::message
**サインインリスクはA5/P2ライセンスが必要**: Identity Protectionの機能であり、A3では利用できません。
:::

#### (2) デバイスプラットフォーム

デバイスのOS種類。

| プラットフォーム | 教育機関での使用例 |
|------------|---------------|
| **Windows** | 校務用PC |
| **iOS** | iPad、iPhone |
| **Android** | Android端末 |
| **macOS** | Mac（一部の学校） |
| **Linux** | 通常は使用しない |

**活用例**:
```powershell
# 校務支援システムはWindowsのみ許可
- クラウドアプリ: 校務支援システム
- デバイスプラットフォーム: Windows
- アクセス制御: アクセス許可（他のプラットフォームはブロック）
```

#### (3) 場所

IPアドレスに基づく地理的な場所。

**ネームドロケーション（名前付きの場所）の設定**:

```
【信頼された場所】
□ 教育委員会事務局（203.0.113.0/24）
□ A小学校（198.51.100.0/24）
□ B中学校（192.0.2.0/24）
□ C高等学校（203.0.113.64/26）

【制限すべき場所】
□ 日本国外（すべて）
□ 既知の悪意のあるIPアドレス
```

**活用例**:
- 管理者アカウントは教育委員会事務局からのみアクセス許可
- 日本国外からのアクセスは常にブロック
- 信頼された場所以外からはMFA必須

:::message
**ネームドロケーションの設定場所**:
Entra ID管理センター > セキュリティ > 条件付きアクセス > ネームドロケーション
:::

#### (4) クライアントアプリ

アクセスに使用されているクライアントアプリの種類。

| クライアントアプリ | 説明 | 対策 |
|------------|------|------|
| **ブラウザー** | Edge、Chrome等のWebブラウザー | 通常許可 |
| **モバイルアプリとデスクトップクライアント** | Outlook、Teamsアプリ等 | 通常許可 |
| **Exchange ActiveSync クライアント** | レガシー認証プロトコル | **ブロック推奨** |
| **その他のクライアント** | レガシー認証を使用する古いクライアント | **ブロック推奨** |

:::message alert
**レガシー認証の脅威**: レガシー認証（基本認証）はMFAに対応していないため、パスワードスプレー攻撃の主要な標的となります。**必ずブロックしてください**。
:::

#### (5) デバイスの状態

デバイスの管理状態とコンプライアンス状態。

| 状態 | 説明 | 制御例 |
|-----|------|-------|
| **Hybrid Entra ID参加済み** | オンプレミスADに参加し、Entra IDにも登録 | レガシー環境での認証 |
| **Entra ID参加済み** | クラウドネイティブな管理 | 推奨構成 |
| **準拠としてマーク済み** | Intuneのコンプライアンスポリシーに準拠 | 校務システムアクセスに必須 |

**デバイス状態による制御例**:
```
【校務支援システムへのアクセス】
✅ 条件: デバイスが準拠としてマークされている
✅ 制御: アクセス許可

❌ 条件: デバイスが未管理
❌ 制御: アクセスブロック

→ 管理外の私物端末からのアクセスを防止
```

## 信号4: セッション制御

アクセス許可後の**セッション中の動作**を制御します。

### セッション制御の種類

| 制御 | 説明 | 教育機関での使用例 |
|-----|------|---------------|
| **アプリによって適用される制限を使用する** | Defender for Cloud Appsでリアルタイム監視 | ダウンロード制限、印刷制限 |
| **条件付きアクセスアプリ制御** | リアルタイムセッション制御 | 私的クラウドへのアップロード防止 |
| **サインインの頻度** | 再認証を要求する頻度 | 重要アプリは1時間ごと |
| **永続的ブラウザーセッション** | ブラウザーを閉じてもサインイン状態を維持 | 共有端末では無効化 |

**活用例**:
```
【高リスクなアクセスのセッション制御】

条件:
- アプリ: SharePoint Online
- 場所: 信頼された場所以外

セッション制御:
- ダウンロードのブロック
- 印刷のブロック
- コピー/貼り付けのブロック

→ 校外から個人情報にアクセスしても持ち出し不可
```

# 6.3 教育委員会向け実践的なポリシー構成例

本節では、教育委員会で実装すべき具体的な Conditional Access ポリシーを、優先度順に解説します。

## ポリシー実装の優先順位

### フェーズ1: 基盤保護（必須・即時実装）

**実装期間**: 1-2週間
**対象**: 全ユーザー
**目的**: 最低限のセキュリティ確保

| No | ポリシー名 | 内容 | 優先度 |
|----|---------|------|--------|
| CA001 | 管理者にMFA強制 | 管理者は常にMFA必須 | ★★★ |
| CA002 | 全ユーザーにMFA強制 | すべてのユーザーにMFA必須 | ★★★ |
| CA003 | レガシー認証をブロック | 基本認証を完全にブロック | ★★★ |
| CA004 | Break Glass除外 | 緊急アクセスアカウントを全ポリシーから除外 | ★★★ |

### フェーズ2: デバイス制御（推奨・1-3ヶ月後）

**実装期間**: 1-3ヶ月
**対象**: 校務システム利用者
**目的**: 管理外端末からのアクセスを防止

| No | ポリシー名 | 内容 | 優先度 |
|----|---------|------|--------|
| CA005 | 準拠デバイスを要求 | 校務システムは管理端末のみ | ★★☆ |
| CA006 | 日本国外からブロック | 国外IPからのアクセス拒否 | ★★☆ |

### フェーズ3: 高度な保護（A5限定・3-6ヶ月後）

**実装期間**: 3-6ヶ月
**対象**: 高リスクユーザー/アプリ
**目的**: リスクベースの動的制御

| No | ポリシー名 | 内容 | 優先度 |
|----|---------|------|--------|
| CA008 | リスクベース認証 | Identity Protectionと連携 | ★☆☆ |
| CA009 | セッション制御 | ダウンロード/印刷制限 | ★☆☆ |

## CA001: 管理者アカウントにMFA強制

### 目的

管理者アカウントは組織全体に影響を与える権限を持つため、最も厳格な保護が必要です。

### 対象

- グローバル管理者
- ユーザー管理者
- セキュリティ管理者
- その他の特権ロール

### ポリシー設定

**割り当て**:
```
ユーザー:
  含める: ディレクトリロール
    - グローバル管理者
    - ユーザー管理者
    - セキュリティ管理者
    - 条件付きアクセス管理者
  除外: CA-Exclude-BreakGlass

クラウドアプリ:
  含める: すべてのクラウドアプリ

条件:
  なし（すべての場所、すべてのデバイス）
```

**アクセス制御**:
```
許可:
  ✅ アクセス権の付与
  ✅ 多要素認証が必要

セッション:
  ✅ サインインの頻度: 1時間ごと
```

### Microsoft Graph PowerShell での作成

```powershell
# Microsoft Graph PowerShell に接続
Connect-MgGraph -Scopes "Policy.ReadWrite.ConditionalAccess"

# Break Glass 除外グループを取得
$excludeGroup = Get-MgGroup -Filter "displayName eq 'CA-Exclude-BreakGlass'"

# CA001: 管理者にMFA強制
$ca001 = @{
    DisplayName = "CA001-Require-MFA-for-Admins"
    State = "enabledForReportingButNotEnforced"  # レポート専用モードで開始
    Conditions = @{
        Users = @{
            IncludeRoles = @(
                "62e90394-69f5-4237-9190-012177145e10",  # Global Administrator
                "fe930be7-5e62-47db-91af-98c3a49a38b1",  # User Administrator
                "194ae4cb-b126-40b2-bd5b-6091b380977d",  # Security Administrator
                "b1be1c3e-b65d-4f19-8427-f6fa0d97feb9"   # Conditional Access Administrator
            )
            ExcludeGroups = @($excludeGroup.Id)
        }
        Applications = @{
            IncludeApplications = @("All")
        }
    }
    GrantControls = @{
        Operator = "AND"
        BuiltInControls = @("mfa")
    }
    SessionControls = @{
        SignInFrequency = @{
            Value = 1
            Type = "hours"
            IsEnabled = $true
        }
    }
}

New-MgIdentityConditionalAccessPolicy -BodyParameter $ca001
```

:::message
**レポート専用モードで開始**: 新しいポリシーは必ず `enabledForReportingButNotEnforced` で開始し、1-2週間影響を確認してから `enabled` に変更します。
:::

## CA002: 全ユーザーにMFA強制

### 目的

すべての教職員アカウントに対してMFAを強制し、パスワードスプレー攻撃を防止します。

### 対象

- 全教職員
- 臨時職員
- 外部委託業者

### ポリシー設定

**割り当て**:
```
ユーザー:
  含める: すべてのユーザー
  除外: CA-Exclude-BreakGlass

クラウドアプリ:
  含める: すべてのクラウドアプリ

条件:
  なし
```

**アクセス制御**:
```
許可:
  ✅ アクセス権の付与
  ✅ 多要素認証が必要
```

### Microsoft Graph PowerShell での作成

```powershell
# CA002: 全ユーザーにMFA強制
$ca002 = @{
    DisplayName = "CA002-Require-MFA-for-All-Users"
    State = "enabledForReportingButNotEnforced"
    Conditions = @{
        Users = @{
            IncludeUsers = @("All")
            ExcludeGroups = @($excludeGroup.Id)
        }
        Applications = @{
            IncludeApplications = @("All")
        }
    }
    GrantControls = @{
        Operator = "OR"
        BuiltInControls = @("mfa")
    }
}

New-MgIdentityConditionalAccessPolicy -BodyParameter $ca002
```

### 展開スケジュール

```
Week 1-2: レポート専用モード
  - サインインログを毎日確認
  - MFA未登録ユーザーを特定
  - 影響を受けるレガシーアプリを特定

Week 3: MFA登録キャンペーン
  - 全教職員にMFA登録を依頼
  - 登録手順の説明会を実施
  - ヘルプデスクを強化

Week 4: パイロットグループで有効化
  - 情報担当者10名で先行運用
  - 問題を収集してFAQ作成

Week 5-8: 段階的本番展開
  - 1校 → 複数校 → 全校

Week 9: 全校展開完了
  - ポリシーを "enabled" に変更
```

## CA003: レガシー認証をブロック

### 目的

レガシー認証（基本認証）はMFAをバイパスできるため、完全にブロックします。

### 対象

- すべてのユーザー
- すべてのアプリ

### レガシー認証とは

**レガシー認証プロトコル**（ブロックすべき）:
- POP3
- IMAP
- SMTP AUTH
- Exchange ActiveSync（EAS）
- Exchange Web Services（EWS）
- Remote PowerShell
- MAPI over HTTP

これらのプロトコルは、MFAや Conditional Access に対応していないため、攻撃者がパスワードのみでアクセスできてしまいます。

### ポリシー設定

**割り当て**:
```
ユーザー:
  含める: すべてのユーザー
  除外: CA-Exclude-BreakGlass

クラウドアプリ:
  含める: すべてのクラウドアプリ

条件:
  クライアントアプリ:
    ✅ Exchange ActiveSync クライアント
    ✅ その他のクライアント
```

**アクセス制御**:
```
アクセスのブロック
```

### Microsoft Graph PowerShell での作成

```powershell
# CA003: レガシー認証をブロック
$ca003 = @{
    DisplayName = "CA003-Block-Legacy-Authentication"
    State = "enabledForReportingButNotEnforced"
    Conditions = @{
        Users = @{
            IncludeUsers = @("All")
            ExcludeGroups = @($excludeGroup.Id)
        }
        Applications = @{
            IncludeApplications = @("All")
        }
        ClientAppTypes = @(
            "exchangeActiveSync",
            "other"
        )
    }
    GrantControls = @{
        Operator = "OR"
        BuiltInControls = @("block")
    }
}

New-MgIdentityConditionalAccessPolicy -BodyParameter $ca003
```

### 事前確認

レガシー認証をブロックする前に、**現在レガシー認証を使用しているアプリやユーザーを特定**する必要があります。

**サインインログでの確認方法**:

```powershell
# レガシー認証を使用しているサインインを確認
Connect-MgGraph -Scopes "AuditLog.Read.All"

$startDate = (Get-Date).AddDays(-30)

# レガシー認証のサインインを取得
$legacySignIns = Get-MgAuditLogSignIn -Filter "createdDateTime ge $startDate and (clientAppUsed eq 'Exchange ActiveSync' or clientAppUsed eq 'IMAP4' or clientAppUsed eq 'POP3' or clientAppUsed eq 'SMTP')" -All

# ユーザーとクライアントアプリの集計
$legacySignIns | Group-Object UserPrincipalName, ClientAppUsed | Select-Object Count, Name
```

**対処方法**:
- **Outlook 2016以前**: Outlook 2019以降にアップグレード（モダン認証対応）
- **モバイルメールアプリ**: Outlook for iOS/Android に変更
- **サードパーティアプリ**: モダン認証対応アプリに変更
- **スクリプト/自動化**: アプリパスワードではなくOAuth認証に変更

## CA005: 準拠デバイスからのアクセスを要求

### 目的

校務支援システムへのアクセスを、Intuneで管理された準拠デバイスのみに制限します。

### 前提条件

- Intuneのセットアップが完了していること
- デバイスコンプライアンスポリシーが構成されていること
- 対象デバイスがIntuneに登録されていること

### ポリシー設定

**割り当て**:
```
ユーザー:
  含める: グループ
    - CA-Users-SchoolTeachers（校務システム利用者）
  除外: CA-Exclude-BreakGlass

クラウドアプリ:
  含める: アプリを選択
    - 校務支援システム（SaaS）
    - SharePoint Online
    - OneDrive for Business

条件:
  デバイスプラットフォーム:
    ✅ Windows
    ✅ iOS
    ✅ Android
```

**アクセス制御**:
```
許可:
  ✅ アクセス権の付与
  ✅ デバイスは準拠としてマーク済みである必要があります
  ✅ 多要素認証が必要

演算子: すべての制御が必要（AND）
```

### Microsoft Graph PowerShell での作成

```powershell
# 校務システム利用者グループを取得
$schoolTeachers = Get-MgGroup -Filter "displayName eq 'CA-Users-SchoolTeachers'"

# 校務支援システムのアプリIDを取得（環境に応じて変更）
$koumuApp = Get-MgServicePrincipal -Filter "displayName eq '校務支援システム'"

# CA005: 準拠デバイスを要求
$ca005 = @{
    DisplayName = "CA005-Require-Compliant-Device-for-Koumu-System"
    State = "enabledForReportingButNotEnforced"
    Conditions = @{
        Users = @{
            IncludeGroups = @($schoolTeachers.Id)
            ExcludeGroups = @($excludeGroup.Id)
        }
        Applications = @{
            IncludeApplications = @(
                $koumuApp.AppId,
                "00000003-0000-0ff1-ce00-000000000000",  # SharePoint Online
                "c5393580-f805-4401-95e8-94b7a6ef2fc2"   # OneDrive for Business
            )
        }
        Platforms = @{
            IncludePlatforms = @("windows", "iOS", "android")
        }
    }
    GrantControls = @{
        Operator = "AND"
        BuiltInControls = @("compliantDevice", "mfa")
    }
}

New-MgIdentityConditionalAccessPolicy -BodyParameter $ca005
```

### 展開時の注意点

:::message alert
**デバイス準拠の確認**: このポリシーを有効化する前に、**すべての対象デバイスがIntuneに登録され、コンプライアンスポリシーに準拠している**ことを確認してください。準拠していないデバイスは即座にブロックされます。
:::

**準拠状態の確認方法**:

```powershell
# Intune管理センターでの確認
# デバイス > コンプライアンス > デバイスコンプライアンス
# → すべてのデバイスが "準拠" になっていることを確認
```

## CA006: 日本国外からのアクセスをブロック

### 目的

海外からの不正アクセスを防止します。

### ポリシー設定

**事前準備: ネームドロケーションの設定**:

```powershell
# 日本国外をネームドロケーションとして登録
Connect-MgGraph -Scopes "Policy.ReadWrite.ConditionalAccess"

# 日本を信頼された国として登録
$japanLocation = @{
    DisplayName = "Japan"
    CountriesAndRegions = @("JP")
    IsTrusted = $true
}

New-MgIdentityConditionalAccessNamedLocation -BodyParameter $japanLocation
```

**割り当て**:
```
ユーザー:
  含める: すべてのユーザー
  除外:
    - CA-Exclude-BreakGlass
    - CA-Exclude-Overseas（海外出張者用の一時除外グループ）

クラウドアプリ:
  含める: すべてのクラウドアプリ

条件:
  場所:
    含める: 任意の場所
    除外: Japan（日本）
```

**アクセス制御**:
```
アクセスのブロック
```

### Microsoft Graph PowerShell での作成

```powershell
# CA006: 日本国外からブロック
$japanLocationId = (Get-MgIdentityConditionalAccessNamedLocation -Filter "displayName eq 'Japan'").Id

$ca006 = @{
    DisplayName = "CA006-Block-Access-from-Outside-Japan"
    State = "enabledForReportingButNotEnforced"
    Conditions = @{
        Users = @{
            IncludeUsers = @("All")
            ExcludeGroups = @($excludeGroup.Id)
        }
        Applications = @{
            IncludeApplications = @("All")
        }
        Locations = @{
            IncludeLocations = @("All")
            ExcludeLocations = @($japanLocationId)
        }
    }
    GrantControls = @{
        Operator = "OR"
        BuiltInControls = @("block")
    }
}

New-MgIdentityConditionalAccessPolicy -BodyParameter $ca006
```

### 海外出張時の対応

教職員が海外出張する場合は、一時的に除外グループに追加します。

```powershell
# 海外出張者用の一時除外グループに追加
$overseasGroup = Get-MgGroup -Filter "displayName eq 'CA-Exclude-Overseas'"
$user = Get-MgUser -Filter "userPrincipalName eq 'tanaka@city.onmicrosoft.com'"

New-MgGroupMember -GroupId $overseasGroup.Id -DirectoryObjectId $user.Id

# 出張終了後に削除
Remove-MgGroupMemberByRef -GroupId $overseasGroup.Id -DirectoryObjectId $user.Id
```

## CA008: リスクベースアクセス制御（A5限定）

### 目的

Identity Protectionが検知したリスクに基づいて、動的にアクセス制御を変更します。

### 前提条件

- Microsoft 365 A5ライセンス（Identity Protectionが含まれる）
- Identity Protectionの有効化（第5章で実装済み）

### ポリシー設定

**割り当て**:
```
ユーザー:
  含める: すべてのユーザー
  除外: CA-Exclude-BreakGlass

クラウドアプリ:
  含める: すべてのクラウドアプリ

条件:
  サインインリスク:
    ✅ 高
    ✅ 中
```

**アクセス制御**:
```
許可:
  ✅ アクセス権の付与
  ✅ 多要素認証が必要
```

### Microsoft Graph PowerShell での作成

```powershell
# CA008: リスクベース認証
$ca008 = @{
    DisplayName = "CA008-Risk-Based-Authentication"
    State = "enabledForReportingButNotEnforced"
    Conditions = @{
        Users = @{
            IncludeUsers = @("All")
            ExcludeGroups = @($excludeGroup.Id)
        }
        Applications = @{
            IncludeApplications = @("All")
        }
        SignInRiskLevels = @("high", "medium")
    }
    GrantControls = @{
        Operator = "OR"
        BuiltInControls = @("mfa")
    }
}

New-MgIdentityConditionalAccessPolicy -BodyParameter $ca008
```

### リスクレベルの判定例

| リスクレベル | 検知例 | ポリシーの動作 |
|----------|-------|-----------|
| **高** | 漏洩した資格情報の使用、海外からの匿名IPアクセス | MFA要求（CA002により既にMFA済みでも再度要求） |
| **中** | 通常と異なる場所からのサインイン、見慣れないプロパティ | MFA要求 |
| **低** | 新しいデバイス | ポリシー適用なし（CA002のMFAのみ） |

:::message
**CA002との違い**: CA002は常にMFAを要求しますが、CA008はリスクが検知されたときのみ追加のMFAを要求します。両方のポリシーが適用されている場合、ユーザーは通常1回のMFAで済みますが、リスクが検知されると追加のMFAチャレンジが発生します。
:::

# 6.4 学校・教育委員会特有のシナリオ

教育現場には、一般企業とは異なる特有の運用シナリオがあります。本節では、これらのシナリオに対応するポリシー設計を解説します。

## シナリオ1: 臨時職員・非常勤講師のアクセス制御

### 課題

臨時職員や非常勤講師は、以下の特徴があります:
- 勤務期間が限定的（数ヶ月～1年）
- 私物デバイスを使用することが多い
- 校務システムへのアクセス権限が限定的

### 推奨ポリシー

**CA010: 臨時職員のアクセス制御**

```
ユーザー:
  含める: グループ
    - CA-Users-Temporary（臨時職員・非常勤講師）

クラウドアプリ:
  含める: アプリを選択
    - Exchange Online（メール）
    - Teams（チャット・会議）
  除外:
    - 校務支援システム（アクセス不可）
    - SharePoint Online（個人情報保管場所）

条件:
  デバイスプラットフォーム: すべて

アクセス制御:
  許可:
    ✅ 多要素認証が必要
    ✅ 承認されたクライアントアプリが必要
    ✅ アプリ保護ポリシーが必要
```

**Intuneアプリ保護ポリシーとの連携**:

私物端末からのアクセスを許可する場合、Intune アプリ保護ポリシー（MAM）を適用します。

```
アプリ保護ポリシーの設定:
□ 組織データの別アプリへのコピーを禁止
□ スクリーンショットを禁止
□ 印刷を禁止
□ "名前を付けて保存" を禁止
□ デバイス全体の暗号化を要求
```

### PowerShellでの実装

```powershell
# CA010: 臨時職員のアクセス制御
$temporaryStaff = Get-MgGroup -Filter "displayName eq 'CA-Users-Temporary'"

$ca010 = @{
    DisplayName = "CA010-Temporary-Staff-Access-Control"
    State = "enabledForReportingButNotEnforced"
    Conditions = @{
        Users = @{
            IncludeGroups = @($temporaryStaff.Id)
            ExcludeGroups = @($excludeGroup.Id)
        }
        Applications = @{
            IncludeApplications = @(
                "00000002-0000-0ff1-ce00-000000000000",  # Exchange Online
                "cc15fd57-2c6c-4117-a88c-83b1d56b4bbe"   # Microsoft Teams
            )
        }
    }
    GrantControls = @{
        Operator = "AND"
        BuiltInControls = @("mfa", "approvedApplication", "compliantApplication")
    }
}

New-MgIdentityConditionalAccessPolicy -BodyParameter $ca010
```

## シナリオ2: 学校間異動時のアクセス権管理

### 課題

教職員が学校間で異動する際、アクセス権の変更が必要です:
- 異動前の学校の情報へのアクセス権を削除
- 異動後の学校の情報へのアクセス権を付与
- 異動期間中（3月末～4月初旬）の一時的なアクセス管理

### 推奨設計

**グループベースのアクセス管理**:

```
学校別のグループ構造:

CA-Users-School-A-Teachers（A小学校教職員）
  → SharePoint: A小学校サイトへのアクセス権
  → 校務システム: A小学校の児童データへのアクセス権

CA-Users-School-B-Teachers（B中学校教職員）
  → SharePoint: B中学校サイトへのアクセス権
  → 校務システム: B中学校の生徒データへのアクセス権
```

**異動時の運用フロー**:

```
【3月末】
1. 異動対象教職員のリストを作成
2. 異動前グループから削除（4月1日付けで実行）
3. アクセス権の棚卸しを実施

【4月1日】
1. 異動後グループに追加
2. 新しいアクセス権が付与されることを確認
3. 異動前の学校データにアクセスできないことを確認

【4月中】
1. 異動後のアクセス状況を監視
2. 問題があれば迅速に対応
```

**自動化スクリプト（PowerShell）**:

```powershell
# 異動処理の自動化スクリプト
# CSV形式: UserPrincipalName, FromSchool, ToSchool

$transfers = Import-Csv -Path "transfer-list.csv"

foreach ($transfer in $transfers) {
    $user = Get-MgUser -Filter "userPrincipalName eq '$($transfer.UserPrincipalName)'"

    # 異動前グループから削除
    $fromGroup = Get-MgGroup -Filter "displayName eq 'CA-Users-$($transfer.FromSchool)-Teachers'"
    Remove-MgGroupMemberByRef -GroupId $fromGroup.Id -DirectoryObjectId $user.Id

    # 異動後グループに追加
    $toGroup = Get-MgGroup -Filter "displayName eq 'CA-Users-$($transfer.ToSchool)-Teachers'"
    New-MgGroupMember -GroupId $toGroup.Id -DirectoryObjectId $user.Id

    Write-Host "Transferred: $($user.DisplayName) from $($transfer.FromSchool) to $($transfer.ToSchool)"
}
```

## シナリオ3: 学校と教育委員会のアクセス分離

### 課題

学校教職員と教育委員会事務局職員では、アクセスできる情報範囲が異なります:
- 学校教職員: 自校の児童生徒情報のみアクセス可能
- 教育委員会職員: 全校の集計データにアクセス可能
- 教育長・教育委員: すべての情報にアクセス可能

### 推奨ポリシー

**CA011: 教育委員会事務局からのみアクセス許可**

```
【管理ポータルへのアクセス制限】

ユーザー:
  含める: ディレクトリロール
    - グローバル管理者
    - ユーザー管理者

クラウドアプリ:
  含める:
    - Microsoft Entra ID管理センター
    - Microsoft 365 管理センター

条件:
  場所:
    含める: 任意の場所
    除外:
      - ネームドロケーション: 教育委員会事務局

アクセス制御:
  ✅ 多要素認証が必要
  ✅ デバイスは準拠としてマーク済みである必要があります
```

**CA012: 校務システム管理機能への制限**

```
ユーザー:
  含める: グループ
    - CA-Users-Koumu-Admins（校務システム管理者）

クラウドアプリ:
  含める:
    - 校務支援システム（管理者ポータル）

条件:
  場所:
    含める: 任意の場所
    除外:
      - ネームドロケーション: 教育委員会事務局
      - ネームドロケーション: 指定された学校

アクセス制御:
  アクセスのブロック
```

### PowerShellでの実装

```powershell
# 教育委員会事務局の場所を登録
$boeLocation = @{
    DisplayName = "BoardOfEducation-Office"
    IpRanges = @(
        @{
            "@odata.type" = "#microsoft.graph.iPv4CidrRange"
            CidrAddress = "203.0.113.0/24"
        }
    )
    IsTrusted = $true
}

$boeLocationId = (New-MgIdentityConditionalAccessNamedLocation -BodyParameter $boeLocation).Id

# CA011: 管理ポータルは教育委員会事務局からのみ
$ca011 = @{
    DisplayName = "CA011-Admin-Portal-from-BOE-Office-Only"
    State = "enabledForReportingButNotEnforced"
    Conditions = @{
        Users = @{
            IncludeRoles = @(
                "62e90394-69f5-4237-9190-012177145e10",  # Global Administrator
                "fe930be7-5e62-47db-91af-98c3a49a38b1"   # User Administrator
            )
            ExcludeGroups = @($excludeGroup.Id)
        }
        Applications = @{
            IncludeApplications = @(
                "c44b4083-3bb0-49c1-b47d-974e53cbdf3c",  # Entra ID管理センター
                "0000000c-0000-0000-c000-000000000000"   # M365管理センター
            )
        }
        Locations = @{
            IncludeLocations = @("All")
            ExcludeLocations = @($boeLocationId)
        }
    }
    GrantControls = @{
        Operator = "AND"
        BuiltInControls = @("mfa", "compliantDevice")
    }
}

New-MgIdentityConditionalAccessPolicy -BodyParameter $ca011
```

## シナリオ4: 緊急時のアクセス許可手順

### 課題

災害や緊急事態が発生した際、通常のアクセス制御ポリシーが業務を妨げる可能性があります:
- 自宅からの緊急アクセスが必要
- 私物端末からのアクセスが必要
- 校外からの情報確認が必要

### 緊急時対応ポリシー

**事前準備: 緊急時除外グループの作成**

```powershell
# 緊急時除外グループの作成
$emergencyGroup = @{
    DisplayName = "CA-Exclude-Emergency"
    Description = "災害等の緊急時に一時的にポリシーから除外するグループ"
    MailEnabled = $false
    SecurityEnabled = $true
    MailNickname = "ca-exclude-emergency"
}

$emergencyGroupId = (New-MgGroup -BodyParameter $emergencyGroup).Id
```

**すべてのConditional Accessポリシーに除外設定を追加**:

```powershell
# すべてのポリシーに緊急時除外グループを追加
$policies = Get-MgIdentityConditionalAccessPolicy

foreach ($policy in $policies) {
    # 既存の除外グループを取得
    $excludeGroups = $policy.Conditions.Users.ExcludeGroups

    # 緊急時除外グループを追加（重複チェック）
    if ($excludeGroups -notcontains $emergencyGroupId) {
        $excludeGroups += $emergencyGroupId

        $updateParams = @{
            Conditions = @{
                Users = @{
                    ExcludeGroups = $excludeGroups
                }
            }
        }

        Update-MgIdentityConditionalAccessPolicy -ConditionalAccessPolicyId $policy.Id -BodyParameter $updateParams

        Write-Host "Updated policy: $($policy.DisplayName)"
    }
}
```

**緊急時の運用手順**:

```
【緊急事態発生時】

1. 教育長または教育委員会事務局長の承認を得る

2. グローバル管理者が緊急時除外グループにユーザーを追加

   Add-MgGroupMember -GroupId $emergencyGroupId -DirectoryObjectId (Get-MgUser -Filter "userPrincipalName eq 'user@city.onmicrosoft.com'").Id

3. 追加したユーザーと期間を記録（監査のため）

4. 緊急事態終了後、速やかにグループから削除

5. 緊急時のアクセスログを確認し、監査証跡を保存
```

:::message alert
**緊急時除外グループの管理**: このグループへの追加は、グローバル管理者のみが実行でき、すべての操作が監査ログに記録されます。定期的（月次）にメンバーを確認し、不要なユーザーが残っていないかチェックしてください。
:::

# 6.5 ポリシーのテストと安全な展開

Conditional Accessポリシーは、誤って設定すると全教職員がサインインできなくなる可能性があります。本節では、安全にポリシーをテストして展開する方法を解説します。

## What-Ifツールの使用

### What-Ifツールとは

**What-Ifツール**は、特定のユーザーやシナリオに対して、どのConditional Accessポリシーが適用されるかを**事前にシミュレーション**できる機能です。

### What-Ifツールの使い方

**アクセス方法**:
```
Entra ID管理センター
→ セキュリティ
→ 条件付きアクセス
→ What If
```

**シミュレーション手順**:

```
【ステップ1】ユーザーを選択
  - 例: tanaka@city.onmicrosoft.com（一般教職員）

【ステップ2】クラウドアプリを選択
  - 例: 校務支援システム

【ステップ3】条件を指定
  - IPアドレス: 自宅のIPアドレス（信頼されていない場所）
  - デバイスプラットフォーム: Windows
  - デバイスの状態: 未管理

【ステップ4】シミュレーション実行
  → 適用されるポリシーと結果が表示される
```

**結果の例**:

```
✅ 適用されるポリシー:
  1. CA002: 全ユーザーにMFA強制
     → 制御: MFA必須

  2. CA005: 準拠デバイスを要求
     → 制御: デバイスコンプライアンス必須
     → 結果: ❌ ブロック（デバイスが未管理のため）

【結論】
田中教諭は、自宅の未管理デバイスから校務支援システムにアクセスできない
→ 想定どおりの動作
```

### What-Ifツールの活用シーン

| シーン | 確認内容 |
|-------|---------|
| **新しいポリシー作成前** | 既存ポリシーとの競合を確認 |
| **ポリシー変更前** | 影響範囲を確認 |
| **ユーザーからの問い合わせ** | なぜブロックされたかを確認 |
| **定期的な棚卸し** | 不要なポリシーがないか確認 |

## レポート専用モードでのテスト

### レポート専用モードとは

**レポート専用モード**（Report-only mode）は、ポリシーを評価するが**実際にはアクセス制御を適用しない**モードです。

```
【通常モード（enabled）】
ポリシー評価 → 制御を適用 → アクセス許可/拒否

【レポート専用モード（enabledForReportingButNotEnforced）】
ポリシー評価 → 制御を適用しない → ログに記録のみ → アクセス許可
```

### レポート専用モードの利点

| 利点 | 説明 |
|-----|------|
| **安全なテスト** | ユーザーの業務を妨げずにポリシーをテスト |
| **影響範囲の確認** | どのユーザーがブロックされるかを事前に把握 |
| **予期しない影響の発見** | 想定外のアプリやシナリオへの影響を発見 |
| **段階的な展開** | 確信を持って本番適用できる |

### レポート専用モードでの運用フロー

```
【Week 1】ポリシーをレポート専用モードで作成
  State = "enabledForReportingButNotEnforced"

【Week 1-2】サインインログで影響を確認
  - 毎日ログを確認
  - ブロックされるユーザー数を集計
  - 想定外の影響がないか確認

【Week 2】影響分析レポートを作成
  - 総サインイン数
  - ブロック対象になるサインイン数（％）
  - 影響を受けるユーザー数
  - 影響を受けるアプリ

【Week 3】必要に応じてポリシーを調整
  - 除外グループの追加
  - 条件の調整
  - 再度レポート専用モードでテスト

【Week 4】本番適用
  State = "enabled"
```

### サインインログでの確認方法

**Entra ID管理センターでの確認**:

```
Entra ID管理センター
→ エンタープライズアプリケーション
→ サインインログ
→ フィルター: "条件付きアクセス" = "レポート専用"
```

**PowerShellでの確認**:

```powershell
# レポート専用モードのポリシー評価結果を取得
Connect-MgGraph -Scopes "AuditLog.Read.All"

$startDate = (Get-Date).AddDays(-7)

# レポート専用モードの結果を取得
$signIns = Get-MgAuditLogSignIn -Filter "createdDateTime ge $startDate" -All |
    Where-Object { $_.ConditionalAccessStatus -eq "reportOnlyInterrupted" }

# ポリシー別の影響を集計
$signIns | ForEach-Object { $_.AppliedConditionalAccessPolicies } |
    Where-Object { $_.Result -eq "reportOnlyInterrupted" } |
    Group-Object DisplayName |
    Select-Object Name, Count |
    Sort-Object Count -Descending
```

**出力例**:

```
Name                                     Count
----                                     -----
CA005-Require-Compliant-Device           1,234
CA006-Block-Access-from-Outside-Japan      156
CA008-Risk-Based-Authentication             23
```

この結果から、CA005を有効化すると1,234回のサインインがブロックされることがわかります。

## 小規模パイロット校での検証

### パイロット検証の目的

レポート専用モードでの確認後、**少数のユーザーで実際にポリシーを有効化**し、実運用での問題を発見します。

### パイロットグループの選定

**推奨パイロットユーザー**:
- 情報担当教諭（各校1名）: 10名程度
- 教育委員会情報担当者: 5名程度
- 合計: 15-20名程度

**パイロットグループの条件**:
- ITリテラシーが高い
- 問題が発生しても自己解決できる
- フィードバックを提供できる
- 業務への影響が少ない時期に実施

### パイロット運用手順

```
【事前準備】
1. パイロットグループを作成

   New-MgGroup -DisplayName "CA-Pilot-Group" -MailEnabled $false -SecurityEnabled $true -MailNickname "ca-pilot"

2. パイロットユーザーをグループに追加

3. ポリシーの対象をパイロットグループに限定

【Week 1】パイロット開始
1. ポリシーを有効化（パイロットグループのみ）
2. パイロットユーザーに通知
   - 何が変わるか説明
   - 問い合わせ先を明示
   - フィードバックシートを配布

【Week 1-2】パイロット運用
1. 毎日サインインログを確認
2. パイロットユーザーからのフィードバック収集
3. 問題があれば即座に対応

【Week 2】パイロット評価
1. フィードバックを分析
2. 問題点を整理
3. ポリシーを調整

【Week 3】本番展開判断
1. パイロット結果を報告
2. 本番展開の承認を得る
3. 展開スケジュールを確定
```

### パイロット用ポリシー設定例

```powershell
# パイロットグループを取得
$pilotGroup = Get-MgGroup -Filter "displayName eq 'CA-Pilot-Group'"

# CA005のパイロット版を作成
$ca005Pilot = @{
    DisplayName = "CA005-Pilot-Require-Compliant-Device"
    State = "enabled"  # パイロットは有効化
    Conditions = @{
        Users = @{
            IncludeGroups = @($pilotGroup.Id)
            ExcludeGroups = @($excludeGroup.Id)
        }
        Applications = @{
            IncludeApplications = @($koumuApp.AppId)
        }
    }
    GrantControls = @{
        Operator = "AND"
        BuiltInControls = @("compliantDevice", "mfa")
    }
}

New-MgIdentityConditionalAccessPolicy -BodyParameter $ca005Pilot
```

## 段階的な本番展開

### 段階的展開の戦略

パイロットが成功したら、段階的に本番展開します。

**展開フェーズ**:

| フェーズ | 対象 | 期間 | 目的 |
|--------|------|------|------|
| **Phase 1** | 1校（小規模校） | 1週間 | 実運用での問題発見 |
| **Phase 2** | 3-5校 | 1週間 | スケーラビリティ確認 |
| **Phase 3** | 全校の50% | 2週間 | 大規模展開の準備 |
| **Phase 4** | 全校 | - | 完全展開 |

### 段階的展開の実装

**方法1: グループの段階的拡大**

```powershell
# Phase 1: 1校を追加
$school1 = Get-MgGroup -Filter "displayName eq 'CA-Users-School-A-Teachers'"
New-MgGroupMember -GroupId $targetGroup.Id -DirectoryObjectId $school1.Id

# Phase 2: さらに3校を追加
$schools = @("School-B", "School-C", "School-D")
foreach ($school in $schools) {
    $schoolGroup = Get-MgGroup -Filter "displayName eq 'CA-Users-$school-Teachers'"
    New-MgGroupMember -GroupId $targetGroup.Id -DirectoryObjectId $schoolGroup.Id
}

# Phase 3: 残りの50%を追加
# ...

# Phase 4: 全校展開 - ポリシーの対象を「すべてのユーザー」に変更
$policy = Get-MgIdentityConditionalAccessPolicy -Filter "displayName eq 'CA005-Require-Compliant-Device'"
$updateParams = @{
    Conditions = @{
        Users = @{
            IncludeUsers = @("All")
            ExcludeGroups = @($excludeGroup.Id)
        }
    }
}
Update-MgIdentityConditionalAccessPolicy -ConditionalAccessPolicyId $policy.Id -BodyParameter $updateParams
```

**方法2: 除外グループの段階的縮小**

```powershell
# 最初は全ユーザーを除外グループに追加
$excludeRollout = New-MgGroup -DisplayName "CA-Exclude-Rollout" -MailEnabled $false -SecurityEnabled $true -MailNickname "ca-exclude-rollout"

# 全教職員を除外グループに追加
# ...

# Phase 1: 1校を除外グループから削除（ポリシーが適用される）
# Phase 2: さらに3校を除外グループから削除
# ...
```

### 展開中の監視

展開中は、以下の指標を継続的に監視します。

**監視ダッシュボード**:

```powershell
# 日次監視レポート
$today = Get-Date
$yesterday = $today.AddDays(-1)

# 1. サインイン成功率
$allSignIns = Get-MgAuditLogSignIn -Filter "createdDateTime ge $yesterday" -All
$successRate = ($allSignIns | Where-Object { $_.Status.ErrorCode -eq 0 }).Count / $allSignIns.Count * 100

Write-Host "サインイン成功率: $([math]::Round($successRate, 2))%"

# 2. ポリシーによるブロック数
$blockedByCA = $allSignIns | Where-Object {
    $_.ConditionalAccessStatus -eq "failure"
}

Write-Host "Conditional Accessによるブロック数: $($blockedByCA.Count)"

# 3. ヘルプデスク問い合わせ数（手動で記録）
# - サインインできない
# - MFAが通らない
# - デバイスが準拠していないと言われる

# 4. 異常なパターンの検知
$blockedUsers = $blockedByCA | Group-Object UserPrincipalName |
    Where-Object { $_.Count -gt 5 } |
    Select-Object Name, Count

if ($blockedUsers.Count -gt 0) {
    Write-Host "警告: 以下のユーザーが5回以上ブロックされています:"
    $blockedUsers
}
```

### 展開の一時停止・ロールバック

問題が発生した場合の対応手順を事前に準備します。

**一時停止（ポリシーを無効化）**:

```powershell
# ポリシーを無効化
Update-MgIdentityConditionalAccessPolicy -ConditionalAccessPolicyId $policyId -State "disabled"

# または、レポート専用モードに戻す
Update-MgIdentityConditionalAccessPolicy -ConditionalAccessPolicyId $policyId -State "enabledForReportingButNotEnforced"
```

**ロールバック（ポリシーを削除）**:

```powershell
# ポリシーを削除
Remove-MgIdentityConditionalAccessPolicy -ConditionalAccessPolicyId $policyId
```

:::message alert
**ロールバック判断基準**:
- サインイン成功率が90%を下回る
- ヘルプデスク問い合わせが通常の3倍以上
- 業務に重大な影響が出ている

これらの状況では、即座にポリシーを無効化し、原因を調査してください。
:::

## サインインログの分析

### サインインログの確認方法

**Entra ID管理センターでの確認**:

```
Entra ID管理センター
→ ユーザー
→ すべてのユーザー
→ サインインログ
```

**重要なフィルター**:

| フィルター | 使用目的 |
|---------|---------|
| **状態 = 失敗** | ブロックされたサインインを確認 |
| **条件付きアクセス = 失敗** | Conditional Accessが原因でブロックされたサインインを確認 |
| **ユーザー** | 特定ユーザーのサインイン履歴を確認 |
| **アプリケーション** | 特定アプリへのサインインを確認 |
| **日付** | 特定期間のサインインを確認 |

### PowerShellでの高度な分析

**よく使う分析クエリ**:

```powershell
Connect-MgGraph -Scopes "AuditLog.Read.All"

# 1. ポリシー別のブロック数（過去7日間）
$startDate = (Get-Date).AddDays(-7)
$signIns = Get-MgAuditLogSignIn -Filter "createdDateTime ge $startDate" -All

$signIns | ForEach-Object { $_.AppliedConditionalAccessPolicies } |
    Where-Object { $_.Result -eq "failure" } |
    Group-Object DisplayName |
    Select-Object Name, Count |
    Sort-Object Count -Descending |
    Format-Table

# 2. ユーザー別のブロック数
$signIns | Where-Object { $_.ConditionalAccessStatus -eq "failure" } |
    Group-Object UserPrincipalName |
    Select-Object Name, Count |
    Sort-Object Count -Descending |
    Select-Object -First 10 |
    Format-Table

# 3. アプリ別のブロック数
$signIns | Where-Object { $_.ConditionalAccessStatus -eq "failure" } |
    Group-Object AppDisplayName |
    Select-Object Name, Count |
    Sort-Object Count -Descending |
    Format-Table

# 4. 失敗理由の分析
$signIns | Where-Object { $_.ConditionalAccessStatus -eq "failure" } |
    ForEach-Object { $_.Status.ErrorCode } |
    Group-Object |
    Select-Object Name, Count |
    Format-Table
```

**出力例**:

```
【ポリシー別のブロック数】
Name                                     Count
----                                     -----
CA005-Require-Compliant-Device              45
CA006-Block-Access-from-Outside-Japan        8
CA003-Block-Legacy-Authentication            3

【ユーザー別のブロック数】
Name                                     Count
----                                     -----
tanaka@city.onmicrosoft.com                 12
suzuki@city.onmicrosoft.com                  8
sato@city.onmicrosoft.com                    5

【アプリ別のブロック数】
Name                                     Count
----                                     -----
校務支援システム                             38
SharePoint Online                            10
Microsoft Teams                               7
```

### トラブルシューティング

**よくある問題と解決方法**:

| 問題 | 原因 | 解決方法 |
|-----|------|---------|
| **特定ユーザーが頻繁にブロックされる** | デバイスが準拠していない | Intuneコンプライアンスポリシーを確認、デバイスを修正 |
| **海外IPからのアクセスがブロック** | 国外ブロックポリシー | 一時的に除外グループに追加（出張時） |
| **MFAが通らない** | 電話番号未登録、認証アプリ未設定 | セキュリティ情報の再登録 |
| **レガシー認証ブロックで古いアプリが使えない** | アプリがモダン認証非対応 | アプリをアップグレード、または承認されたアプリに変更 |

# 6.6 まとめ

本章では、Conditional Accessによる校務システムへの安全なアクセス制御を実装しました。

## 本章で実装した内容

### 実装したポリシー

| ポリシー | 目的 | 優先度 |
|--------|------|--------|
| **CA001** | 管理者にMFA強制 | ★★★ |
| **CA002** | 全ユーザーにMFA強制 | ★★★ |
| **CA003** | レガシー認証ブロック | ★★★ |
| **CA004** | Break Glass除外 | ★★★ |
| **CA005** | 準拠デバイスを要求 | ★★☆ |
| **CA006** | 日本国外からブロック | ★★☆ |
| **CA008** | リスクベース認証（A5限定） | ★☆☆ |

### 達成したゼロトラスト目標

```
✅ 明示的な検証
  - すべてのサインインで複数の信号を評価
  - ユーザー、場所、デバイス、リスクを総合的に判断

✅ 最小権限アクセス
  - 条件に応じて必要最小限のアクセスを付与
  - 信頼された環境以外ではアクセス制限

✅ 侵害を想定
  - Identity Protectionと連携してリスクを検知
  - 異常なサインインを自動的にブロック
```

## 教育委員会での実装効果

**セキュリティの向上**:
- パスワードスプレー攻撃の防御: MFA強制により99.9%防止
- 管理外デバイスのブロック: 私物端末からの個人情報アクセスを防止
- レガシー認証の排除: MFAバイパス攻撃を防止

**コンプライアンスの達成**:
- 文部科学省ガイドライン対応: アクセス制御の実装
- 個人情報保護法対応: 技術的安全管理措置の実装
- 監査証跡の保存: すべてのアクセスをログに記録

**運用の効率化**:
- 自動化されたアクセス制御: 人手による判断が不要
- リスクベースの動的制御: 状況に応じた柔軟な対応
- 集中管理: Entra IDで一元管理


