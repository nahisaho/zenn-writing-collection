---
title: "付録 NIST Zero Trust Security準拠の次世代校務DX基盤 RFI・RFP実践テンプレート"
---

# 付録の目的と活用方法

本付録では、第2章〜第4章で解説した手法を実際の調達に活用できるよう、**NIST SP 800-207（Zero Trust Architecture）準拠の次世代校務DX基盤向けRFI（情報提供依頼書）とRFP（提案依頼書）の実践的テンプレート**を提供します。

## テンプレートの特徴

- **NIST SP 800-207完全準拠**：最新のゼロトラストセキュリティ要件を反映
- **教育機関特化**：学校現場の制約と要求を考慮した設計
- **段階的導入対応**：Phase 1〜3の段階的実装を想定
- **実用性重視**：そのまま利用可能な具体的文言を提供

## 活用方法

1. **RFIテンプレート**：市場調査段階で各ベンダーへの情報提供依頼に活用
2. **RFPテンプレート**：正式調達段階での提案依頼書作成に活用
3. **評価基準**：ベンダー提案の客観的評価に活用
4. **カスタマイズ**：各教育機関の状況に応じて内容を調整

:::message alert
**重要な注意事項**
- 本テンプレートは2025年7月時点の情報に基づいています
- 実際の調達では、最新の法令・基準・ガイドラインを必ず確認してください
- 各教育機関の状況に応じて内容の調整が必要です
- 法的な効力を持つ正式文書作成時は、専門家の確認を受けることを推奨します
:::

---

# RFI（情報提供依頼書）テンプレート

## 1. RFI基本情報

### 1.1 調達概要

**件名**: 次世代校務DX基盤構築に係る情報提供依頼書（RFI）

**調達機関**: ○○県○○市教育委員会  
**担当部署**: 教育総務課 情報システム担当  
**連絡先**: [メールアドレス]、[電話番号]

**調達の目的**:
本市教育委員会では、児童生徒の個人情報保護を最優先としながら、教職員の働き方改革を実現する次世代校務DX基盤の構築を検討しています。NIST SP 800-207（Zero Trust Architecture）に準拠した高いセキュリティレベルと、教育現場での実用性を両立するクラウド基盤について、市場での提供状況、技術的実現可能性、導入・運用に関する情報提供を求めます。

**対象範囲**:
- 小学校：○○校（児童数：約○○名、教職員数：約○○名）
- 中学校：○○校（生徒数：約○○名、教職員数：約○○名）
- 教育委員会：○○名

### 1.2 回答要領

**提出期限**: 2025年○月○日（○） 17:00必着  
**提出方法**: 電子メール添付（PDF形式）  
**提出先**: [メールアドレス]

**回答形式**:
- A4サイズ、日本語での作成
- 各質問項目に対して具体的かつ詳細な回答を記載
- 必要に応じて資料・図表を添付

**秘密保持**:
本RFIで取得した情報は、調達目的以外には使用せず、適切に管理いたします。

---

## 2. 基本要件に関する質問

### 2.1 システム構成の理解性確保（調達担当者向け）

:::message
**重要：調達担当者による理解可能性の確保**

IT専門知識を持たない調達担当者でも、提案システムの構成とセキュリティの実現方法を理解できるよう、視覚的資料と平易な説明を必須として提供してください。
:::

**Q2.1.1 システム構成の可視化資料提供**

以下の要件を満たす資料を必須として提供してください：

```yaml
【必須提供資料】
1. システム全体構成図:
   形式: PowerPoint/PDF（A3サイズ推奨）
   レベル別構成:
     - 概要図: 5分で理解できる全体像
     - 詳細図: 技術的な詳細構成
     - 利用シーン図: 教育現場での日常利用イメージ
   
   必須記載事項:
     □ 教育委員会、学校、教職員、児童生徒の関係性図
     □ データ保存場所（国内データセンター位置を地図表示）
     □ 外部サービス連携先の明示
     □ セキュリティ境界の明確な表示
     □ 災害時バックアップ・復旧経路

2. 教育現場利用シーン図解:
   - 年度末成績処理時のシステム動作
   - 新任教員着任時のアカウント設定プロセス
   - 災害時緊急対応でのシステム動作
   - 保護者面談時の個人情報適切表示

3. 調達担当者向け説明資料:
   対象: IT知識のない調達担当者
   形式: PowerPoint 10枚以内
   内容: セキュリティの仕組みを身近な例で説明
```

**Q2.1.2 調達担当者向け説明会実施可否**

```yaml
実施可否: □可能 □条件付き可能 □困難

実施内容（2時間程度）:
  - システム構成説明（30分）
  - セキュリティ仕組み説明（30分）  
  - 教育現場利用イメージ（30分）
  - 質疑応答（30分）

実施条件・制約:
【　　　　　　　　　　　　　　　　　　　　　　　　　　　】
```

### 2.2 NIST SP 800-207準拠要件

**Q2.2.1 ゼロトラストアーキテクチャ準拠状況**
貴社サービスのNIST SP 800-207（Zero Trust Architecture）への準拠状況について、以下の観点で詳しくお答えください。

1. **準拠レベル**
   - 完全準拠 / 部分準拠 / 準拠予定（時期：　　）/ 準拠予定なし
   - 準拠している具体的な要件と準拠していない要件を明記

2. **7つの基本原則への対応状況**
   ```yaml
   1. すべてのデータソースとコンピューティングサービスをリソースとして扱う:
      対応状況: □完全対応 □部分対応 □対応予定 □対応なし
      詳細説明: 
   
   2. ネットワークの場所に関係なく、すべての通信を保護する:
      対応状況: □完全対応 □部分対応 □対応予定 □対応なし
      詳細説明:
   
   3. 企業リソースへのアクセスはセッション単位で付与する:
      対応状況: □完全対応 □部分対応 □対応予定 □対応なし
      詳細説明:
   
   4. リソースへのアクセスは動的ポリシーによって決定する:
      対応状況: □完全対応 □部分対応 □対応予定 □対応なし
      詳細説明:
   
   5. 企業は全ての資産の整合性とセキュリティ態勢を監視・測定する:
      対応状況: □完全対応 □部分対応 □対応予定 □対応なし
      詳細説明:
   
   6. すべてのリソース認証と認可は動的であり、アクセス許可前に厳格に実施される:
      対応状況: □完全対応 □部分対応 □対応予定 □対応なし
      詳細説明:
   
   7. 企業は現在のセキュリティ態勢について可能な限り多くの情報を収集し、セキュリティ態勢の改善に活用する:
      対応状況: □完全対応 □部分対応 □対応予定 □対応なし
      詳細説明:
   ```

3. **第三者認証・監査状況**
   - 取得している認証：SOC2 Type2、ISO27001、ISMAP、FedRAMP等
   - ゼロトラスト関連の外部監査実施状況
   - 認証取得予定と時期

**Q2.1.2 ゼロトラスト完全性検証**

:::message alert
**重要：部分的ゼロトラスト対応の排除**

多くのベンダーが「ゼロトラスト対応」を表明していますが、実際には一部機能のみの対応である場合があります。本質問では、**NIST SP 800-207の7つの基本原則すべてについて、具体的で検証可能な実装内容を詳細に回答**してください。曖昧な表現や部分的な対応は契約対象外となります。
:::

**システム全体での統合的ゼロトラスト実装の詳細確認**

以下の各原則について、**具体的な技術仕様、実装方法、教育機関での動作例を詳細に記述**してください：

```yaml
【原則1】すべてのデータソース・コンピューティングサービスのリソース化

完全実装の確認項目:
  対象範囲: 
    - □児童生徒データ □教職員データ □教材データ □運用データ
    - □校務支援システム □学習管理システム □グループウェア
    - □オンプレミス □クラウド □ハイブリッド □エッジ環境
    - □PC □タブレット □スマートフォン □IoT機器
  
  技術実装:
    - リソース識別方式: [具体的な技術名・製品名]
    - 統一管理方法: [統一カタログ・CMDB等の具体的実装]
    - 新規リソース自動登録: □対応 □非対応
  
  教育機関での動作例:
    質問: 新任教員が着任時に持参した私物タブレットは、
         どのような手順でシステムに登録・管理されますか？
    回答: [具体的な手順を記述]

【原則2】場所に関係ないすべての通信保護

完全実装の確認項目:
  対象場所:
    - □学校内 □教育委員会 □自宅 □移動中 □外出先
  
  対象通信手段:
    - □有線 □無線 □モバイル □VPN □直接接続
  
  対象利用者:
    - □正規教職員 □非常勤講師 □外部講師 □保護者 □業者
  
  技術実装:
    - 暗号化方式: [TLS1.3、E2EE等の具体的仕様]
    - 証明書管理: [PKI基盤の具体的実装]
    - 通信品質保証: [帯域・遅延等の保証値]
  
  教育機関特化対応:
    - 家庭訪問時のアクセス保護: [具体的実装]
    - 校外学習時の通信保護: [具体的実装]
    - 災害時の通信確保: [具体的実装]
  
  教育機関での動作例:
    質問: 教職員が自宅から深夜に児童生徒の成績データにアクセスする場合と、
         学校内で昼間にアクセスする場合で、セキュリティレベルに差はありますか？
    回答: [具体的な違いまたは同一性を記述]

【原則3】セッション単位での動的アクセス許可

完全実装の確認項目:
  継続認証実装:
    - 認証確認間隔: [最大○分間隔]
    - 異常検知時の自動切断: [○秒以内]
    - コンテキスト考慮要素: [時間・場所・デバイス・行動パターン]
  
  リスク評価技術:
    - 機械学習活用: □対応 □非対応
    - リアルタイム評価: [○秒以内]
    - 評価精度: [偽陽性○%以下、偽陰性○%以下]
  
  教育現場対応:
    - 年度末大量処理の正常判定: [具体的対応]
    - 入試期間の特殊パターン対応: [具体的対応]
    - 緊急時の柔軟認証: [具体的対応]
  
  教育機関での動作例:
    質問: 夜間に普段と異なる場所から大量の児童生徒データに
         アクセスした場合、システムはどのように対応しますか？
    回答: [検知・判定・対応の具体的手順を記述]

【原則4】動的ポリシーによるアクセス決定

完全実装の確認項目:
  教育コンテキスト対応:
    - 児童生徒情報: [在籍・学年・クラス・特別支援]
    - 教職員情報: [職種・担当・役職・権限レベル]
    - 時期情報: [年度処理・試験・入試・卒業]
    - 状況情報: [通常・緊急・保護者対応]
  
  ポリシー更新技術:
    - 更新頻度: [リアルタイム○分以内]
    - 学習機能: □対応 □非対応
    - 予測機能: □対応 □非対応
    - 例外処理: [緊急時の自動ポリシー適用]
  
  最小権限実装:
    - 権限粒度: [データ単位・機能単位・時間単位]
    - 時限権限: [業務終了時の自動削除]
    - 権限監視: [使用状況の継続監視]
  
  教育機関での動作例:
    質問: 担任教員が年度末の成績処理時期に、通常より大量の
         児童生徒データにアクセスする場合の判定プロセスを説明してください。
    回答: [判定要素・プロセス・制御内容を記述]

【原則5】全資産の包括的監視・記録

完全実装の確認項目:
  監視対象範囲:
    - 記録対象: □全アクセス □全操作 □全変更 □全設定変更
    - 記録内容: [WHO・WHAT・WHEN・WHERE・WHY]
    - 保存期間: [法定○年＋教育機関要求○年]
  
  異常検知技術:
    - 検知速度: [○秒以内]
    - 検知精度: [偽陽性○%以下、偽陰性○%以下]
    - 自動対応: [検知から対応まで○秒以内]
  
  監査対応:
    - 法定監査: [個人情報保護委員会・文科省等]
    - 内部監査: [教育委員会・学校内監査]
    - 外部監査: [第三者監査機関]
    - 住民監査: [情報公開請求・住民監査請求]
  
  教育機関特化監視:
    - 児童生徒データの特別監視: [要配慮個人情報の保護]
    - 年度末処理の監視: [大量データ処理の異常検知]
    - 退職予定者監視: [異動・退職前のアクセス行動]
  
  教育機関での動作例:
    質問: 3年前の特定児童生徒のデータに誰がいつアクセスしたかを
         監査で求められた場合、どのように回答できますか？
    回答: [検索方法・提供形式・所要時間を記述]

【原則6】動的認証・認可のアクセス前実施

完全実装の確認項目:
  認証技術実装:
    - 多要素認証: [生体認証・トークン・SMS等の組み合わせ]
    - デバイス認証: [証明書・TPM等の技術仕様]
    - 継続認証: [セッション中の認証状態確認]
  
  認可技術実装:
    - ABAC実装: [属性ベースアクセス制御の詳細]
    - 権限最小化: [必要最小限の権限付与]
    - 動的権限制御: [状況に応じた権限調整]
  
  教育現場対応:
    - 多様スキル対応: [生体認証・ICカード・スマホ認証の選択肢]
    - 緊急時対応: [災害・事故時の特別認証手順]
    - 外部利用者対応: [保護者・業者の臨時認証]
    - アクセシビリティ: [障害者への配慮]
  
  教育機関での動作例:
    質問: 新任教員が着任初日からシステムアクセスするまでの
         認証・認可プロセスを詳しく説明してください。
    回答: [手順・所要時間・セキュリティ確保方法を記述]

【原則7】包括的情報収集とセキュリティ改善

完全実装の確認項目:
  情報収集範囲:
    - 収集対象: [システム・ネットワーク・デバイス・アプリケーション]
    - 収集頻度: [リアルタイム○秒間隔]
    - 分析技術: [機械学習・AI活用の具体的実装]
  
  脅威対応:
    - 脅威インテリジェンス連携: [国内外の主要フィード]
    - 新規脅威対応: [○時間以内のシステム反映]
    - 自動対応: [既知脅威の自動ブロック・隔離]
  
  継続改善:
    - 自動学習: [使用パターン学習・最適化]
    - 自動調整: [検知精度向上のパラメータ調整]
    - 自動更新: [セキュリティポリシーの最適化]
  
  教育機関特化分析:
    - 教育スケジュール連携: [年間行事とセキュリティ状況の相関]
    - 児童生徒データ分析: [アクセスパターンの異常検知]
    - 教職員負荷分析: [業務負荷とセキュリティ遵守の相関]
  
  教育機関での動作例:
    質問: 新たなセキュリティ脅威が発見された場合、
         どのようにシステム全体のセキュリティを改善しますか？
    回答: [検知・分析・対策・実装・効果測定の具体的プロセス]
```

**統合性・一貫性の確認**
```yaml
システム全体統合の確認:
  原則間連携:
    質問: 7つの原則が相互に連携してセキュリティ効果を高める
         具体的な仕組みを説明してください。
    回答: [原則間の連携方法・相乗効果を記述]
  
  教育現場適合性:
    質問: ゼロトラストセキュリティの実装が、教育業務の効率化に
         どのように貢献するか具体例で説明してください。
    回答: [セキュリティと効率化の両立事例を記述]
  
  段階的実装:
    質問: Phase1〜3の段階的実装において、各段階での
         ゼロトラスト完全性をどのように保証しますか？
    回答: [各段階での完全性保証方法を記述]
```

**実証・検証の要求**
```yaml
技術実証:
  デモンストレーション: □提供可能 □提供不可
  パイロット運用: □提供可能 □提供不可
  技術検証期間: ○ヶ月間
  
第三者認証:
  ゼロトラスト関連認証: [取得済み認証の詳細]
  認証取得予定: [時期・認証機関]
  外部監査実績: [監査機関・監査結果]
  
成功事例:
  教育機関実績: [○件、規模○万人]
  導入期間: [平均○ヶ月]
  効果測定: [セキュリティ向上・効率化の定量的効果]
```

**Q2.1.3 教育機関向けゼロトラスト実装**
教育機関特有の要件（年度運営、多様なユーザー、BYOD対応等）を考慮したゼロトラスト実装について説明してください。

1. **教育現場での実装事例**
   - 国内教育機関での導入実績（件数、規模）
   - 導入時に対応した教育機関特有の課題
   - 参考となる導入事例の概要

2. **段階的実装支援**
   - Phase 1（基盤構築）での最小限のゼロトラスト実装
   - Phase 2（機能拡張）での段階的強化
   - Phase 3（最適化）での完全実装

### 2.2 個人情報保護要件

**Q2.2.1 個人情報保護体制**

1. **法的コンプライアンス**
   ```yaml
   国内法令:
     個人情報保護法: □完全対応 □部分対応 □対応予定 □対応なし
     個人情報保護委員会ガイドライン: □完全対応 □部分対応 □対応予定 □対応なし
     自治体個人情報保護条例: □完全対応 □部分対応 □対応予定 □対応なし
   
   業界基準:
     文部科学省「教育情報セキュリティポリシーガイドライン」: □完全対応 □部分対応 □対応予定 □対応なし
     「教育データ標準5.0」: □完全対応 □部分対応 □対応予定 □対応なし
   
   国際基準:
     GDPR: □完全対応 □部分対応 □対応予定 □対応なし
     FERPA: □完全対応 □部分対応 □対応予定 □対応なし
     COPPA: □完全対応 □部分対応 □対応予定 □対応なし
   ```

2. **データ保護技術仕様**
   - **暗号化**：保存時・通信時の暗号化方式、鍵管理方式
   - **アクセス制御**：認証方式、認可方式、最小権限原則の実装
   - **データ分離**：マルチテナント環境でのデータ分離技術
   - **バックアップ・復旧**：暗号化バックアップ、復旧時のセキュリティ

**Q2.2.2 インシデント対応体制**

1. **インシデント対応プロセス**
   - 検知〜初動〜調査〜対応〜報告の具体的手順
   - 対応時間：検知から初動まで（目標：　分以内）
   - 顧客への報告時間（目標：　時間以内）

2. **個人情報漏洩時の対応**
   - 影響範囲の特定方法と時間
   - 関係機関への報告体制
   - 被害者への通知・対応方法
   - 再発防止策の策定・実施

### 2.3 業務効率化要件

**Q2.3.1 既存システム連携**

1. **校務支援システム連携**
   - 対応可能な校務支援システム（製品名、ベンダー名）
   - データ連携方式：API、ファイル連携、リアルタイム連携等
   - 連携可能なデータ種別：成績、出席、時数、保健等

2. **認証統合（SSO）**
   - 対応認証プロトコル：SAML 2.0、OAuth 2.0、OpenID Connect等
   - 既存Microsoft Entra ID / LDAP との連携可能性
   - 教育機関向けIDaaS（Identity as a Service）の提供

**Q2.3.2 ユーザビリティ・操作性**

1. **多様なスキルレベルへの対応**
   - 直感的操作を実現するUI/UX設計方針
   - 操作習得支援機能（ガイダンス、ヘルプ等）
   - アクセシビリティ対応状況（JIS X 8341準拠等）

2. **モバイル・多デバイス対応**
   - 対応デバイス：PC、タブレット、スマートフォン
   - 対応OS・ブラウザ
   - オフライン時の機能制限

---

## 3. 技術仕様に関する質問

### 3.1 インフラ・プラットフォーム仕様

**Q3.1.1 クラウドインフラ**

1. **基盤仕様**
   ```yaml
   クラウドプロバイダー:
     プライマリ: [AWS/Azure/GCP/その他（詳細記載）]
     セカンダリ: [冗長性・災害対策のため]
   
   データセンター:
     国内設置: □はい □いいえ
     設置場所: 
     認証・監査: [ISO27001/SOC2/その他]
   
   可用性:
     稼働率SLA: ％（年間）
     計画停止時間: 時間/月
     災害時復旧時間（RTO）: 時間
     災害時復旧時点（RPO）: 時間
   ```

2. **スケーラビリティ**
   - 同時接続ユーザー数上限
   - データ容量上限
   - 負荷増加時の自動スケーリング対応

**Q3.1.2 セキュリティアーキテクチャ**

1. **ネットワークセキュリティ**
   ```yaml
   境界セキュリティ:
     WAF (Web Application Firewall): □提供 □オプション □提供なし
     DDoS対策: □提供 □オプション □提供なし
     IPS/IDS: □提供 □オプション □提供なし
   
   ゼロトラストネットワーク:
     Software-Defined Perimeter (SDP): □提供 □オプション □提供なし
     Secure Access Service Edge (SASE): □提供 □オプション □提供なし
     マイクロセグメンテーション: □提供 □オプション □提供なし
   ```

2. **エンドポイントセキュリティ**
   - デバイス信頼性検証
   - マルウェア対策
   - デバイスコンプライアンス管理

### 3.2 アプリケーション仕様

**Q3.2.1 コアアプリケーション**

1. **グループウェア機能**
   ```yaml
   メール:
     メールボックス容量: GB/ユーザー
     添付ファイル上限: MB
     メールアーカイブ: □提供 □オプション □提供なし
     暗号化メール: □提供 □オプション □提供なし
   
   ファイル共有:
     個人容量: GB/ユーザー
     共有容量: GB/組織
     バージョン管理: □提供 □オプション □提供なし
     同期オフライン: □提供 □オプション □提供なし
   
   コミュニケーション:
     チャット: □提供 □オプション □提供なし
     ビデオ会議: □提供 □オプション □提供なし
     画面共有: □提供 □オプション □提供なし
     録画・録音: □提供 □オプション □提供なし
   ```

2. **業務アプリケーション**
   - 文書作成・編集（Office互換性）
   - プロジェクト管理
   - ワークフロー・承認機能
   - カレンダー・スケジュール管理

**Q3.2.2 セキュリティ機能**

1. **データ保護**
   ```yaml
   データ分類・ラベリング:
     自動分類: □提供 □オプション □提供なし
     手動ラベリング: □提供 □オプション □提供なし
     ポリシー連動: □提供 □オプション □提供なし
   
   データ漏洩防止 (DLP):
     コンテンツ検査: □提供 □オプション □提供なし
     送信ブロック: □提供 □オプション □提供なし
     暗号化強制: □提供 □オプション □提供なし
   
   権利管理 (IRM):
     文書保護: □提供 □オプション □提供なし
     アクセス制御: □提供 □オプション □提供なし
     使用追跡: □提供 □オプション □提供なし
   ```

2. **監査・ログ**
   - 操作ログの記録範囲
   - ログ保存期間
   - ログ分析・レポート機能
   - リアルタイム監視・アラート

---

## 4. 運用・サポートに関する質問

### 4.1 導入・移行支援

**Q4.1.1 導入プロジェクト支援**

1. **プロジェクト管理**
   - 導入期間（Phase 1〜3の想定期間）
   - プロジェクト管理手法（PMP、PMBOK等）
   - 専任プロジェクトマネージャーの配置

2. **データ移行支援**
   ```yaml
   移行対象データ:
     メールデータ: □対応 □部分対応 □対応不可
     ファイルデータ: □対応 □部分対応 □対応不可
     連絡先・アドレス帳: □対応 □部分対応 □対応不可
     カレンダーデータ: □対応 □部分対応 □対応不可
   
   移行方式:
     一括移行: □対応 □部分対応 □対応不可
     段階的移行: □対応 □部分対応 □対応不可
     並行運用: □対応 □部分対応 □対応不可
   ```

**Q4.1.2 教育・研修支援**

1. **研修プログラム**
   - 管理者向け研修（時間、内容、形式）
   - 一般ユーザー向け研修（時間、内容、形式）
   - eラーニングの提供状況
   - 研修資料・マニュアルの提供

2. **継続的サポート**
   - 導入後のフォローアップ期間・内容
   - 追加研修の実施
   - ベストプラクティスの共有

### 4.2 運用サポート

**Q4.2.1 技術サポート**

1. **サポート体制**
   ```yaml
   サポート時間:
     平日: 時〜 時
     土日祝日: □対応 □緊急時のみ □対応なし
     24時間365日: □対応 □オプション □対応なし
   
   サポート方法:
     電話: □対応 □オプション □対応なし
     メール: □対応 □オプション □対応なし
     チャット: □対応 □オプション □対応なし
     リモートサポート: □対応 □オプション □対応なし
   
   対応言語:
     日本語: □対応 □対応なし
     英語: □対応 □対応なし
   ```

2. **SLA（Service Level Agreement）**
   - 障害対応時間（重要度別）
   - 復旧時間目標
   - 可用性保証
   - SLA未達時の対応・補償

**Q4.2.2 セキュリティ運用**

1. **セキュリティ監視**
   - SOC（Security Operation Center）の提供
   - 24時間365日監視体制
   - インシデント検知・対応時間
   - 脅威インテリジェンスの活用

2. **定期的セキュリティサービス**
   - 脆弱性診断の実施頻度・方法
   - ペネトレーションテストの実施
   - セキュリティレポートの提供
   - セキュリティ教育・啓発支援

---

## 5. 費用・契約に関する質問

### 5.1 費用構造

**Q5.1.1 初期費用**

```yaml
基本料金:
  セットアップ費用: 円
  データ移行費用: 円
  カスタマイズ費用: 円
  研修費用: 円

ライセンス:
  管理者ライセンス: 円/月・ユーザー
  一般ユーザーライセンス: 円/月・ユーザー
  ゲストユーザーライセンス: 円/月・ユーザー

追加機能（オプション）:
  高度セキュリティ機能: 円/月
  データ分析・レポート: 円/月
  API連携: 円/月
```

**Q5.1.2 運用費用**

```yaml
月額・年額費用:
  基本サービス: 円/月
  サポート費用: 円/月
  セキュリティオプション: 円/月

従量課金:
  データ転送量: 円/GB
  ストレージ超過: 円/GB・月
  API呼び出し: 円/回

その他:
  年次ライセンス更新: 円/年
  バージョンアップ: 円/回
  カスタマイズ変更: 円/時間
```

### 5.2 契約条件

**Q5.2.1 契約形態**

1. **契約期間・更新**
   - 最低契約期間
   - 自動更新の有無・条件
   - 中途解約の可否・条件
   - 契約変更（ユーザー数増減等）の手続き

2. **価格改定**
   - 価格改定の頻度・上限
   - 価格改定の事前通知期間
   - 機能追加時の価格設定方式

**Q5.2.2 責任・リスク分担**

1. **セキュリティインシデント時の責任**
   - サービス側起因の場合の責任範囲
   - 顧客側起因の場合の対応支援
   - 損害賠償の上限・範囲
   - インシデント対応費用の負担

2. **データ保護・移行**
   - データ所有権の明確化
   - 契約終了時のデータ返却・削除
   - データポータビリティの保証
   - バックアップデータの管理・削除

---

## 6. 実績・体制に関する質問

### 6.1 導入実績

**Q6.1.1 教育機関での導入実績**

```yaml
導入実績（過去3年間）:
  自治体数: 件
  学校数: 校
  ユーザー数: 名
  導入期間: 平均 ヶ月

規模別実績:
  大規模（1万人以上）: 件
  中規模（1千人〜1万人）: 件
  小規模（1千人未満）: 件

地域別実績:
  北海道・東北: 件
  関東: 件
  中部: 件
  関西: 件
  中国・四国: 件
  九州・沖縄: 件
```

**Q6.1.2 参考事例**

導入成功事例について、以下の情報を教えてください（守秘義務の範囲内で）。

1. **事例1（大規模自治体）**
   - 自治体規模・特徴
   - 導入の課題・目的
   - 導入期間・体制
   - 導入効果・成果
   - 課題・改善点

2. **事例2（中規模自治体）**
   - 自治体規模・特徴
   - 導入の課題・目的
   - 導入期間・体制
   - 導入効果・成果
   - 課題・改善点

### 6.2 提供体制

**Q6.2.1 組織体制**

1. **開発・運用体制**
   ```yaml
   組織概要:
     従業員数: 名
     エンジニア数: 名
     教育分野専門チーム: 名
   
   拠点情報:
     開発拠点: 
     運用拠点: 
     日本国内拠点: 
   
   認証・資格:
     ISO27001: □取得済み □取得予定 □取得予定なし
     プライバシーマーク: □取得済み □取得予定 □取得予定なし
     ISMAP: □取得済み □取得予定 □取得予定なし
     ISMS: □取得済み □取得予定 □取得予定なし
   ```

2. **パートナー体制**
   - システムインテグレーターとの協業体制
   - 地域パートナーの有無・連絡先
   - 保守・サポートパートナーの体制

**Q6.2.2 技術・ノウハウ**

1. **技術的強み**
   - 自社開発技術・特許
   - 教育分野での専門知識・ノウハウ
   - セキュリティ分野での技術的優位性

2. **継続的発展**
   - 研究開発投資割合
   - 新技術への取り組み（AI、IoT、ブロックチェーン等）
   - 教育機関との共同研究・実証実験

---

## 7. 追加質問・特記事項

### 7.1 教育機関特有の要件

**Q7.1.1 年度運営への対応**

1. **年度更新処理**
   - 年度末・年度始めの一括処理機能
   - 学年・クラス替えへの対応
   - 教職員の人事異動への対応
   - 卒業生データの適切な処理

2. **長期休暇期間の活用**
   - メンテナンス・アップデートのタイミング
   - データ移行・システム更新の最適期間
   - 研修・教育の集中実施

**Q7.1.2 多様なユーザーへの対応**

1. **年齢・スキル多様性**
   - 20代〜60代の幅広い年齢層への配慮
   - ITスキルレベルの差への対応
   - 視覚・聴覚・身体的制約への配慮

2. **役職・権限多様性**
   - 校長・副校長・教頭の管理権限
   - 学年主任・教科主任の中間権限
   - 一般教員・講師・非常勤講師の基本権限
   - 事務職員・用務員等の限定権限

### 7.2 将来拡張・発展性

**Q7.2.1 新技術への対応**

1. **AI・機械学習**
   - 学習分析・個別最適化への対応
   - 自動採点・評価支援機能
   - 業務自動化・効率化AI
   - 異常検知・予測分析

2. **IoT・デバイス連携**
   - 電子黒板・タブレットとの連携
   - 校内センサー・カメラとの統合
   - ウェアラブルデバイスの活用
   - スマートスクール構想への対応

**Q7.2.2 教育政策・制度変更への対応**

1. **制度変更への柔軟性**
   - 学習指導要領改訂への対応
   - 新しい評価制度への対応
   - 個人情報保護法改正への対応
   - 国際標準・規格変更への対応

2. **他システムとの連携拡張**
   - 学習系システムとの統合
   - 図書館システムとの連携
   - 保護者向けシステムとの連携
   - 地域・自治体システムとの連携

### 7.3 自由記述・アピールポイント

**Q7.3.1 貴社の強み・特徴**
教育機関向けクラウドサービスにおける貴社の独自性・強み・特徴について、自由に記述してください。

**Q7.3.2 提案・推奨事項**
本市の次世代校務DX基盤構築に向けて、貴社からの提案・推奨事項があれば記述してください。

**Q7.3.3 質問・確認事項**
本RFIや調達要件について、貴社からの質問・確認事項があれば記述してください。

---

# RFP（提案依頼書）テンプレート

## 1. RFP基本情報

### 1.1 調達概要

**件名**: 次世代校務DX基盤構築・運用業務委託

**調達機関**: ○○県○○市教育委員会  
**担当部署**: 教育総務課 情報システム担当  
**連絡先**: [メールアドレス]、[電話番号]

**業務概要**:
本市教育委員会では、児童生徒の個人情報保護を最優先としながら、教職員の働き方改革を実現する次世代校務DX基盤の構築・運用を行う事業者を選定します。NIST SP 800-207（Zero Trust Architecture）に準拠した高いセキュリティレベルと、教育現場での実用性を両立するクラウド基盤の構築・運用を求めます。

**調達方式**: 公募型プロポーザル方式  
**契約期間**: 2025年○月○日〜2030年○月○日（5年間）  
**想定予算**: 年額○○,○○○千円（税込）

### 1.2 提案書提出要領

**提出期限**: 2025年○月○日（○） 17:00必着  
**提出方法**: 持参または郵送（電子媒体併用）  
**提出先**: ○○県○○市教育委員会 教育総務課

**提案書構成**:
1. 提案書表紙・目次
2. 会社概要・実績
3. 技術提案書
4. 運用提案書
5. 費用提案書
6. その他（資料等）

**評価方法**: 技術点（700点）+ 価格点（300点）= 総合点（1000点）

---

## 2. 必須要件（Must Have）

### 2.1 NIST SP 800-207準拠要件【必須】

**M2.1.1 ゼロトラストアーキテクチャの実装**

サービスは、NIST SP 800-207で定義されるゼロトラストアーキテクチャに完全準拠し、以下の7つの基本原則をすべて満たすこと。

```yaml
必須原則:
  1. データソース・コンピューティングサービスのリソース化:
     要件: すべてのデータとサービスを明確に定義・分類・管理
     実装: □必須実装 □段階的実装不可
  
  2. 場所に依存しない通信保護:
     要件: すべての通信の暗号化（TLS 1.3以上）
     実装: □必須実装 □段階的実装不可
  
  3. セッション単位のアクセス制御:
     要件: すべてのアクセスをセッション毎に認証・認可
     実装: □必須実装 □段階的実装不可
  
  4. 動的ポリシーベースアクセス制御:
     要件: ユーザー・デバイス・環境を総合的に評価
     実装: □必須実装 □段階的実装不可
  
  5. 資産の整合性・セキュリティ態勢監視:
     要件: リアルタイム監視・ログ記録・分析
     実装: □必須実装 □段階的実装不可
  
  6. 動的認証・認可:
     要件: アクセス毎の厳格な認証・認可
     実装: □必須実装 □段階的実装不可
  
  7. セキュリティ態勢情報収集・活用:
     要件: 包括的ログ収集・分析・改善
     実装: □必須実装 □段階的実装不可
```

**評価基準**: 7原則すべての完全実装が必須。1つでも未実装の場合は失格。

**M2.1.2 第三者認証の取得**

以下の認証をすべて取得していること。
- SOC 2 Type II（取得日：○年○月○日以降）
- ISO/IEC 27001（取得日：○年○月○日以降）
- プライバシーマーク（取得日：○年○月○日以降）
- ISMAP（政府情報システムのためのセキュリティ評価制度）（登録日：○年○月○日以降）

### 2.2 個人情報保護要件【必須】

**M2.2.1 法的コンプライアンス**

以下の法令・ガイドラインに完全準拠すること。

```yaml
国内法令【必須】:
  個人情報保護法: 完全準拠（2025年改正版）
  個人情報保護委員会ガイドライン: 完全準拠
  自治体個人情報保護条例: 本市条例への完全対応

業界基準【必須】:
  文部科学省「教育情報セキュリティポリシーガイドライン」: 完全準拠
  「教育データ標準5.0」: 完全準拠
  ISMAP: 登録済み（登録日：○年○月○日以降）

国際基準【推奨】:
  GDPR: 準拠（海外展開時に必要）
  FERPA: 準拠（米国システム連携時に必要）
```

**M2.2.2 データ保護技術仕様**

```yaml
暗号化【必須】:
  保存時暗号化: AES-256以上
  通信時暗号化: TLS 1.3以上
  鍵管理: FIPS 140-2 Level 3準拠HSM

アクセス制御【必須】:
  多要素認証: すべてのユーザーに必須
  最小権限原則: 自動適用・定期レビュー
  ゼロトラスト認証: 場所・デバイスに依存しない

ログ・監査【必須】:
  完全操作ログ: すべての操作を記録
  改ざん防止: ログの暗号化・署名
  長期保存: 10年間の安全な保存
  リアルタイム分析: 異常検知・即座のアラート
```

### 2.3 可用性・性能要件【必須】

**M2.3.1 サービスレベル**

```yaml
可用性【必須】:
  稼働率: 99.9%以上（年間）
  計画停止: 月4時間以内（事前通知必須）
  障害復旧: 
    - レベル1（サービス停止）: 1時間以内
    - レベル2（機能制限）: 4時間以内
    - レベル3（軽微）: 24時間以内

性能【必須】:
  同時接続数: 1,000ユーザー以上
  応答時間: 3秒以内（通常時）
  ファイルアップロード: 100MB/ファイル
  データ転送速度: 10Mbps以上/ユーザー
```

**M2.3.2 災害対策・事業継続**

```yaml
バックアップ【必須】:
  頻度: 日次（増分）、週次（完全）
  保存期間: 1年間以上
  暗号化: AES-256での暗号化
  テスト復旧: 月次での復旧テスト実施

災害対策【必須】:
  RTO（復旧時間目標）: 4時間以内
  RPO（復旧時点目標）: 1時間以内
  地理的分散: 500km以上離れた拠点での冗長化
  通信回線: 複数キャリアでの冗長化
```

---

## 3. 推奨要件（Should Have）

### 3.1 業務効率化推奨要件

**S3.1.1 高度な統合機能**

```yaml
システム統合【推奨50点】:
  SSO統合: SAML/OAuth/OpenID Connect対応
  API統合: REST/GraphQL APIの提供
  データ連携: リアルタイム双方向連携
  ワークフロー: 承認・決裁プロセスの自動化

ユーザビリティ【推奨40点】:
  直感的UI: ノーコード・ローコード操作
  モバイル対応: iOS/Android完全対応
  オフライン対応: 一時的な切断時の継続利用
  多言語対応: 日本語・英語・その他
```

**S3.1.2 AI・自動化機能**

```yaml
AI活用【推奨60点】:
  文書分析: 自動分類・タグ付け
  異常検知: ユーザー行動・システム状態
  予測分析: 容量・性能・セキュリティリスク
  自然言語処理: 検索・要約・翻訳

自動化【推奨40点】:
  定型業務: レポート生成・データ集計
  プロビジョニング: ユーザー・権限の自動設定
  アップデート: セキュリティパッチの自動適用
  バックアップ: 自動スケジューリング・検証
```

### 3.2 拡張性・将来性推奨要件

**S3.2.1 技術的拡張性**

```yaml
アーキテクチャ【推奨40点】:
  マイクロサービス: 機能単位での独立性・拡張性
  コンテナ化: Docker/Kubernetes対応
  クラウドネイティブ: スケーラビリティ・可搬性
  オープンスタンダード: 標準技術・オープンソース活用

API・連携【推奨30点】:
  RESTful API: 全機能のAPI化
  Webhook: リアルタイムイベント通知
  SDKライブラリ: 主要言語でのSDK提供
  APIゲートウェイ: 統一的なAPI管理
```

**S3.2.2 新技術対応**

```yaml
次世代技術【推奨30点】:
  量子暗号: 量子コンピュータ耐性暗号
  ブロックチェーン: 改ざん耐性・分散台帳
  IoT統合: センサー・デバイス連携
  5G対応: 高速・低遅延通信活用

データ活用【推奨20点】:
  ビッグデータ分析: 大規模データ処理・分析
  機械学習: 個別最適化・予測・推奨
  データレイク: 構造化・非構造化データ統合
  リアルタイム分析: ストリーミング処理
```

---

## 4. オプション要件（Could Have）

### 4.1 高度機能オプション

**C4.1.1 先進セキュリティ機能**

```yaml
ゼロトラスト拡張【加点20点】:
  行動分析: ユーザー行動パターン学習・異常検知
  リスクスコア: 動的リスク評価・適応的制御
  CASB: クラウドセキュリティブローカー
  SASE: セキュアアクセスサービスエッジ

プライバシー強化【加点15点】:
  差分プライバシー: 統計的プライバシー保護
  準同型暗号: 暗号化状態での演算
  秘密計算: データを秘匿したまま処理
  連合学習: データを移動せずに機械学習
```

**C4.1.2 業務高度化機能**

```yaml
AI・ML高度活用【加点25点】:
  自動採点: 記述問題の自動評価
  学習分析: 個別学習進度・課題分析
  予測モデル: 不登校・学習困難予測
  推奨システム: 個別学習コンテンツ推奨

業務自動化【加点20点】:
  RPA統合: ロボティック・プロセス・オートメーション
  ワークフロー: 複雑な業務プロセス自動化
  スケジューリング: AI による最適スケジュール生成
  レポート自動生成: 定型・非定型レポートの自動作成
```

### 4.2 付加価値オプション

**C4.2.1 教育支援機能**

```yaml
学習支援【加点15点】:
  LMS統合: 学習管理システム連携
  コンテンツ配信: 教材・動画の配信最適化
  協働学習: オンライン協働学習環境
  評価システム: 多面的評価・ポートフォリオ

保護者連携【加点10点】:
  保護者ポータル: 成績・出席状況の共有
  連絡システム: 緊急連絡・一斉配信
  面談予約: オンライン面談・スケジューリング
  アンケート: 満足度調査・意見収集
```

**C4.2.2 地域連携機能**

```yaml
自治体連携【加点10点】:
  データ連携: 住民基本台帳・福祉システム連携
  統計連携: 教育統計・調査データ自動生成
  防災連携: 緊急時の安否確認・避難誘導
  図書館連携: 図書貸出・学習履歴連携

広域連携【加点5点】:
  自治体間連携: 転校・進学時のデータ引継ぎ
  標準化対応: 全国標準データ形式対応
  相互運用性: 他自治体システムとの互換性
  共同利用: 複数自治体での共同利用・運用
```

---

## 5. 技術仕様詳細

### 5.1 システムアーキテクチャ

**5.1.1 全体アーキテクチャ**

```yaml
必須アーキテクチャ:
  クラウド形態: パブリッククラウド（AWS/Azure/GCP）
  マルチテナント: 論理分離による安全なマルチテナント
  冗長化構成: アクティブ・アクティブ構成
  ロードバランシング: 自動負荷分散・ヘルスチェック

推奨アーキテクチャ:
  マイクロサービス: 機能別独立サービス
  コンテナオーケストレーション: Kubernetes
  サーバーレス: Function as a Service活用
  CDN: グローバルコンテンツ配信網
```

**5.1.2 セキュリティアーキテクチャ**

```yaml
ネットワークセキュリティ:
  ゼロトラストネットワーク: 
    - Software-Defined Perimeter (SDP)
    - Network Access Control (NAC)
    - マイクロセグメンテーション
  
  境界セキュリティ:
    - Web Application Firewall (WAF)
    - DDoS Protection
    - Intrusion Detection/Prevention System (IDS/IPS)

エンドポイントセキュリティ:
  デバイス認証:
    - 証明書ベース認証
    - デバイス登録・管理
    - コンプライアンスチェック
  
  エンドポイント保護:
    - マルウェア対策
    - アプリケーション制御
    - データ漏洩防止 (DLP)
```

### 5.2 データベース・ストレージ仕様

**5.2.1 データベース要件**

```yaml
必須要件:
  RDBMS: PostgreSQL 13以上 または同等
  暗号化: Transparent Data Encryption (TDE)
  バックアップ: Point-in-Time Recovery対応
  レプリケーション: 同期・非同期レプリケーション

性能要件:
  同時接続数: 1,000セッション以上
  トランザクション: 1,000TPS以上
  レスポンス: 100ms以内（単純クエリ）
  可用性: 99.9%以上

推奨機能:
  分散データベース: 水平スケーリング対応
  インメモリ処理: 高速データ処理
  AI・ML統合: データベース内機械学習
  オートチューニング: 自動パフォーマンス最適化
```

**5.2.2 ストレージ要件**

```yaml
必須要件:
  容量: 100TB以上（初期）、1PB以上（最大）
  暗号化: AES-256暗号化
  冗長化: RAID構成＋地理的分散
  バックアップ: 差分・増分バックアップ

性能要件:
  IOPS: 100,000 IOPS以上
  スループット: 10GB/s以上
  レイテンシ: 1ms以下（SSDベース）
  可用性: 99.999%以上

推奨機能:
  オブジェクトストレージ: S3互換API
  階層化ストレージ: アクセス頻度別自動移動
  圧縮・重複排除: ストレージ効率化
  スナップショット: 高速バックアップ・復旧
```

---

## 6. 運用要件

### 6.1 導入・移行要件

**6.1.1 導入スケジュール**

```yaml
Phase 1: 基盤構築（2025年10月〜2026年3月）:
  環境構築:
    - クラウド基盤セットアップ: 1ヶ月
    - セキュリティ設定: 1ヶ月
    - 基本機能実装: 2ヶ月
    - テスト・検証: 1ヶ月
    - 本稼働開始: 2026年4月1日

  移行作業:
    - データ分析・設計: 1ヶ月
    - データ移行ツール開発: 1ヶ月
    - 段階的データ移行: 2ヶ月
    - 最終移行・切替: 1ヶ月

Phase 2: 機能拡張（2026年4月〜2027年3月）:
  追加機能実装: 8ヶ月
  高度セキュリティ実装: 4ヶ月
  システム統合・連携: 4ヶ月

Phase 3: 最適化（2027年4月〜）:
  AI・機械学習実装: 継続的
  業務プロセス最適化: 継続的
  新技術導入: 継続的
```

**6.1.2 データ移行要件**

```yaml
移行対象データ:
  ユーザーデータ:
    - Microsoft Entra ID: 約1,000ユーザー
    - グループ・組織情報: 約100組織
    - 権限・ロール設定: 約50ロール

  業務データ:
    - メールデータ: 約10TB
    - ファイルデータ: 約50TB
    - 連絡先・カレンダー: 約100万件
    - 既存システムデータ: 約20TB

移行品質要件:
  データ整合性: 100%（欠損・破損なし）
  移行時間: 各システム4時間以内
  ダウンタイム: 土日祝日のみ
  ロールバック: 24時間以内の復旧可能
```

### 6.2 運用サポート要件

**6.2.1 サポート体制**

```yaml
必須サポート:
  営業時間サポート:
    - 時間: 平日9:00-18:00
    - 方法: 電話・メール・チャット
    - 言語: 日本語
    - 初回応答: 1時間以内

  緊急時サポート:
    - 時間: 24時間365日
    - 対象: レベル1・2障害
    - 初回応答: 30分以内
    - 現地対応: 4時間以内（必要時）

推奨サポート:
  専任担当者:
    - カスタマーサクセスマネージャー: 1名専任
    - テクニカルアカウントマネージャー: 1名専任
    - プロジェクトマネージャー: 1名専任

  定期レビュー:
    - 月次運用レビュー: 運用状況・改善提案
    - 四半期戦略レビュー: 中長期計画・新技術
    - 年次契約レビュー: 契約条件・SLA見直し
```

**6.2.2 教育・研修サポート**

```yaml
必須研修:
  管理者研修:
    - システム管理: 16時間（2日間）
    - セキュリティ管理: 8時間（1日間）
    - 運用・監視: 8時間（1日間）
    - 障害対応: 8時間（1日間）

  ユーザー研修:
    - 基本操作: 4時間（半日）
    - 応用操作: 4時間（半日）
    - セキュリティ教育: 2時間
    - 個人情報保護: 2時間

推奨研修:
  継続的教育:
    - eラーニング: オンライン学習コンテンツ
    - 定期アップデート研修: 新機能・セキュリティ
    - ユーザーコミュニティ: 事例共有・ベストプラクティス
    - 資格取得支援: 関連資格の取得支援
```

---

## 7. 評価基準・配点

### 7.1 技術評価（700点）

**7.1.1 セキュリティ・コンプライアンス（300点）**

```yaml
NIST準拠（100点）:
  完全準拠: 100点
  部分準拠（6原則以上）: 70点
  部分準拠（5原則以下）: 失格

個人情報保護（100点）:
  法令完全準拠: 50点
  技術的保護措置: 30点
  運用・管理体制: 20点

セキュリティ技術（100点）:
  暗号化・認証: 40点
  監視・ログ: 30点
  インシデント対応: 30点
```

**7.1.2 システム性能・信頼性（200点）**

```yaml
性能（100点）:
  応答性能: 40点
  スループット: 30点
  拡張性: 30点

可用性（100点）:
  稼働率: 50点
  災害対策: 30点
  障害対応: 20点
```

**7.1.3 機能・利便性（200点）**

```yaml
基本機能（100点）:
  グループウェア: 40点
  システム統合: 30点
  モバイル対応: 30点

拡張機能（100点）:
  AI・自動化: 40点
  分析・レポート: 30点
  カスタマイズ: 30点
```

### 7.2 運用・サポート評価（200点）

**7.2.1 導入・移行（100点）**

```yaml
導入計画（50点）:
  スケジュール: 20点
  体制・リソース: 15点
  リスク管理: 15点

データ移行（50点）:
  移行計画: 20点
  品質保証: 15点
  バックアップ・ロールバック: 15点
```

**7.2.2 運用サポート（100点）**

```yaml
サポート体制（50点）:
  対応時間・方法: 20点
  専任担当者: 15点
  日本語対応: 15点

教育・研修（50点）:
  研修プログラム: 20点
  継続的サポート: 15点
  オンライン学習: 15点
```

### 7.3 実績・信頼性評価（200点）

**7.3.1 導入実績（100点）**

```yaml
教育機関実績（60点）:
  導入件数: 30点
  規模・複雑性: 20点
  成功事例: 10点

技術・業界実績（40点）:
  技術革新: 20点
  業界評価: 10点
  パートナーシップ: 10点
```

**7.3.2 組織・体制（100点）**

```yaml
組織信頼性（50点）:
  財務安定性: 20点
  組織体制: 15点
  認証・資格: 15点

技術・人材（50点）:
  技術力: 25点
  人材・ノウハウ: 15点
  研究開発: 10点
```

### 7.4 価格評価（300点）

**7.4.1 価格評価方式**

```yaml
評価方式: 最低価格を基準とした逆比例方式
計算式: （最低価格 ÷ 各社価格）× 300点

価格内訳:
  初期費用（20%）: 構築・移行・研修費用
  運用費用（80%）: 月額・年額費用（5年分）

評価対象:
  基本サービス費用: 必須要件の実装費用
  推奨機能費用: Should Have要件の実装費用
  オプション機能費用: Could Have要件の実装費用
```

**7.4.2 コストパフォーマンス調整**

```yaml
機能別価格評価:
  必須機能: 基本価格として評価
  推奨機能: 費用対効果による評価
  オプション機能: 追加価値による評価

長期契約メリット:
  長期割引: 複数年契約での割引率
  価格安定性: 契約期間中の価格保証
  アップグレード: 無償機能追加・強化
```

---

## 8. 契約条件

### 8.1 基本契約条件

**8.1.1 契約形態・期間**

```yaml
契約形態: 業務委託契約
契約期間: 2025年○月○日〜2030年○月○日（5年間）
更新: 1年毎の自動更新（双方異議なき場合）
中途解約: 6ヶ月前の書面通知により可能

契約範囲:
  基本サービス: システム構築・運用・保守
  オプションサービス: 追加機能・拡張・カスタマイズ
  サポートサービス: 技術支援・教育・コンサルティング
```

**8.1.2 価格・支払条件**

```yaml
価格体系:
  初期費用: 契約時一括支払い
  月額費用: 毎月末日締め・翌月末日支払い
  従量課金: 四半期毎精算・翌月支払い

価格改定:
  改定頻度: 年1回まで
  改定上限: 前年比5%以内
  事前通知: 3ヶ月前の書面通知

支払方法:
  支払手段: 銀行振込
  支払期限: 請求書発行から30日以内
  分割支払: 初期費用の分割支払い可能
```

### 8.2 SLA（Service Level Agreement）

**8.2.1 可用性SLA**

```yaml
サービス稼働率:
  目標値: 99.9%以上（年間）
  測定方法: システム監視ツールによる自動測定
  対象外時間: 計画メンテナンス時間（事前通知必須）

SLA未達時の措置:
  99.5%以上99.9%未満: 月額費用5%返金
  99.0%以上99.5%未満: 月額費用10%返金
  99.0%未満: 月額費用20%返金＋改善計画提出

障害対応時間:
  レベル1（サービス停止）: 1時間以内復旧
  レベル2（機能制限）: 4時間以内復旧
  レベル3（軽微な問題）: 24時間以内復旧
```

**8.2.2 性能SLA**

```yaml
応答時間:
  通常時: 3秒以内（95%tile）
  ピーク時: 5秒以内（95%tile）
  測定方法: 合成監視・実測値

スループット:
  同時接続数: 1,000ユーザー以上
  データ転送: 10Mbps以上/ユーザー
  ファイルアップロード: 100MB/ファイル

SLA未達時の措置:
  目標値未達: 原因調査・改善計画提出
  継続的未達: 追加リソース投入・費用負担
  重大な影響: 損害賠償・契約見直し
```

### 8.3 責任・リスク分担

**8.3.1 セキュリティインシデント時の責任**

```yaml
事業者責任範囲:
  システム脆弱性: 完全責任・損害賠償
  運用ミス: 完全責任・改善措置
  第三者攻撃: 対応支援・原因調査

顧客責任範囲:
  ユーザー操作ミス: 顧客責任・事業者支援
  不正利用: 顧客責任・事業者技術支援
  設定ミス: 双方協力・原因究明

共同責任範囲:
  境界領域: 詳細調査により責任分担決定
  複合要因: 原因割合により責任按分
  不明要因: 双方協力による原因究明
```

**8.3.2 データ保護・移行責任**

```yaml
データ所有権:
  顧客データ: 顧客の完全な所有権
  システムデータ: 事業者の管理権・顧客の利用権
  ログデータ: 双方の共同利用・管理

データ移行責任:
  移行計画: 事業者が策定・顧客が承認
  移行実行: 事業者が実行・顧客が検証
  品質保証: 事業者が保証・顧客が確認

契約終了時:
  データ返却: 事業者が実行（90日以内）
  データ削除: 事業者が実行・証明書発行
  システム撤去: 事業者責任（180日以内）
```

---

## 9. 提案書作成要領

### 9.1 提案書構成・様式

**9.1.1 提案書構成**

```yaml
1. 提案書表紙・目次（5ページ以内）:
   - 会社概要・代表者氏名
   - 提案概要・特徴
   - 目次・構成

2. 会社概要・実績（20ページ以内）:
   - 会社概要・組織体制
   - 財務状況・安定性
   - 教育機関導入実績
   - 技術・認証取得状況

3. 技術提案書（50ページ以内）:
   - システム概要・アーキテクチャ
   - セキュリティ・NIST準拠
   - 機能仕様・技術仕様
   - 性能・可用性

4. 運用提案書（30ページ以内）:
   - 導入計画・スケジュール
   - データ移行計画
   - 運用サポート体制
   - 教育・研修プログラム

5. 費用提案書（10ページ以内）:
   - 費用内訳・算定根拠
   - 支払スケジュール
   - 価格改定方針
   - コストパフォーマンス

6. その他資料:
   - 認証書・資格証明
   - 導入事例詳細
   - 技術資料・マニュアル
   - デモ・プレゼンテーション資料
```

**9.1.2 作成要領**

```yaml
基本要件:
  用紙: A4サイズ
  言語: 日本語
  フォント: 10ポイント以上
  ページ数: 各セクション上限内

提出形式:
  紙媒体: 正本1部・副本5部
  電子媒体: PDF形式（USB・CD-ROM）
  プレゼンテーション: PowerPoint形式

機密保持:
  秘密情報: 適切にマーキング
  第三者情報: 使用許可確認
  個人情報: 含めない・マスキング
```

### 9.2 評価プロセス

**9.2.1 評価スケジュール**

```yaml
提案書評価:
  提出期限: 2025年○月○日 17:00
  書面評価: 2025年○月○日〜○月○日
  評価結果通知: 2025年○月○日

プレゼンテーション:
  実施日: 2025年○月○日〜○月○日
  時間: 60分（提案45分＋質疑15分）
  参加者: 提案者5名以内・評価者10名程度

最終評価:
  評価会議: 2025年○月○日
  結果通知: 2025年○月○日
  契約交渉: 2025年○月○日〜○月○日
```

**9.2.2 評価委員会**

```yaml
委員構成:
  委員長: 教育長
  内部委員: 教育委員会職員（5名）
  外部委員: 学識経験者・専門家（3名）
  オブザーバー: 学校現場代表者（2名）

評価方法:
  個別評価: 各委員が独立して評価
  合議評価: 全委員での討議・合意
  最終決定: 委員長が総合的に判断

公平性確保:
  利害関係: 事前確認・回避措置
  守秘義務: 評価情報の厳格管理
  透明性: 評価基準・プロセスの公開
```

---

## 10. 参考資料・関連文書

### 10.1 関連法令・ガイドライン

```yaml
法令:
  個人情報保護法: 2005年法律第57号（最新改正版）
  個人情報保護条例: ○○市個人情報保護条例
  働き方改革関連法: 労働基準法等の改正法

国の指針・ガイドライン:
  文部科学省「教育情報セキュリティポリシーガイドライン」
  文部科学省「次世代校務DXガイドブック」
  個人情報保護委員会「個人情報保護法ガイドライン」
  総務省「地方公共団体における情報セキュリティポリシーガイドライン」

技術標準:
  NIST SP 800-207「Zero Trust Architecture」
  ISO/IEC 27001「情報セキュリティマネジメントシステム」
  JIS X 8341「ウェブアクセシビリティ」
  RFC 6749「OAuth 2.0 Authorization Framework」
```

### 10.2 参考文献・資料

```yaml
教育DX関連:
  「GIGAスクール構想の実現について」（文部科学省）
  「教育データ標準5.0」（文部科学省）
  「学校における働き方改革プラン」（文部科学省）

セキュリティ関連:
  「ゼロトラストアーキテクチャ導入指針」（内閣サイバーセキュリティセンター）
  「政府情報システムのためのセキュリティ評価制度（ISMAP）」
  「クラウドサービス利用のための情報セキュリティマネジメントガイドライン」

技術・運用関連:
  「クラウドサービス安全・信頼性に係る情報開示指針」
  「SLA（Service Level Agreement）策定ガイドライン」
  「システム監査基準・システム管理基準」
```

### 10.3 用語集・略語集

```yaml
セキュリティ関連:
  NIST: 米国国立標準技術研究所
  Zero Trust: すべてのアクセスを検証するセキュリティモデル
  SASE: Secure Access Service Edge
  CASB: Cloud Access Security Broker
  SIEM: Security Information and Event Management

認証・認可:
  SSO: Single Sign-On
  MFA: Multi-Factor Authentication
  SAML: Security Assertion Markup Language
  OAuth: Open Authorization
  OpenID Connect: OpenID Connect

クラウド・インフラ:
  IaaS: Infrastructure as a Service
  PaaS: Platform as a Service
  SaaS: Software as a Service
  API: Application Programming Interface
  CDN: Content Delivery Network

運用・管理:
  SLA: Service Level Agreement
  RTO: Recovery Time Objective
  RPO: Recovery Point Objective
  MTBF: Mean Time Between Failures
  MTTR: Mean Time To Recovery
```

---

# まとめ

本付録では、NIST SP 800-207準拠の次世代校務DX基盤向けRFI・RFPテンプレートを提供しました。

## 活用時の重要ポイント

1. **要件の明確化**: 必須・推奨・オプションの区分を明確にし、現実的な要件設定を行う
2. **評価基準の客観性**: 定量的な評価基準を設定し、公平で透明な評価を実施する
3. **段階的導入**: Phase 1〜3の段階的実装により、リスクを最小化し確実な成果を実現する
4. **継続的改善**: 運用開始後も継続的な改善により、長期的な価値を最大化する

## カスタマイズの指針

各教育機関の状況に応じて、以下の観点でテンプレートをカスタマイズしてください：

- **規模・予算**: 組織規模・予算制約に応じた要件調整
- **既存システム**: 現在利用中のシステムとの連携要件
- **セキュリティレベル**: 地域・組織のセキュリティポリシーに応じた調整
- **導入時期**: 年度運営・業務スケジュールに応じた計画調整

本テンプレートが、個人情報保護と業務効率化を両立する次世代校務DX基盤の成功する調達に貢献できれば幸いです。