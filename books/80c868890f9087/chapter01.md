---
title: "はじめに：本書の目的と活用方法"
---

# 本書の目的

## なぜこの本を書いたのか

教育現場のデジタル化が急速に進む中、多くの教育委員会や学校現場では「次世代校務DX基盤」の導入が検討されています。しかし、その調達過程で以下のような課題に直面することが少なくありません。

**よくある課題**
- 「何から始めればよいかわからない」
- 「ベンダーの提案を評価する基準がない」
- 「個人情報保護と使いやすさをどう両立すればよいか」
- 「予算内で最適なシステムを選ぶ方法がわからない」

本書は、これらの課題を抱える**教育委員会の調達担当者**が、**児童生徒の個人情報保護を最優先としながら、教職員の働き方改革も実現する次世代校務DX基盤を正しく調達できるようになること**を目的として執筆しました。特に、RFI（情報提供依頼書）による市場調査からRFP（提案依頼書）作成までの実践的なプロセスを、体系的に習得できることを目指しています。

## 本書の特徴

### 1. RFI、RFP作成に特化した実践的内容

本書は、調達プロセスの中でも特に重要な**RFI（情報提供依頼書）からRFP（提案依頼書）までの作成プロセス**に焦点を当てています。RFIによる市場調査から始まり、その分析結果を活用したRFP作成まで、一連の流れを体系的に解説します。

**本書で学べること**
- RFIとは何か、なぜ重要なのか
- 効果的なRFIの構成と質問項目の設計方法
- ベンダー回答の客観的な分析手法
- RFI結果を活用したRFP（提案依頼書）の作成方法
- 実現可能で効果的なRFP要件の設定手法

### 2. NIST SP 800-207準拠のゼロトラストセキュリティ

本書では、最新のセキュリティ標準である **NIST SP 800-207（Zero Trust Architecture）** に準拠した要件設定方法を詳しく解説します。特に重要なのは、**部分的なゼロトラスト対応製品を見抜き、システム全体として真のゼロトラストを実現できるかを判断する方法**です。

**ゼロトラストセキュリティの重要性**
- 従来の境界型セキュリティの限界
- 教育機関特有のセキュリティ要件への対応
- 段階的なゼロトラスト実装アプローチ

**本書で習得できるゼロトラスト評価能力**
- NIST SP 800-207の7つの基本原則すべてへの準拠確認方法
- 部分的対応と完全対応の見分け方
- システム全体でのゼロトラスト実現性の評価手法
- ベンダーの「ゼロトラスト対応」表現の真偽を見抜くチェックポイント
- **IT専門知識がなくても理解できる、視覚的なシステム構成確認手法**
- **調達担当者でも判断できる、具体的なセキュリティ実現性検証方法**

### 3. 個人情報保護と業務効率化の両立

「セキュリティを強化すると使いにくくなる」という固定観念を打破し、**両方を同時に実現する具体的手法**を提示します。

**両立のポイント**
- 自動化による安全性と効率性の向上
- 直感的なUIとセキュリティの共存
- 段階的導入による無理のない移行

### 4. 専門知識不要の平易な解説

IT用語やセキュリティの専門知識がない方でも理解できるよう、すべての専門用語を丁寧に解説し、具体例を交えて説明しています。

---

# 対象読者

## 主な対象読者

本書は、以下の方々を主な対象として執筆しています。

### 1. 教育委員会の調達担当者

**特にこんな方におすすめ**
- 次世代校務DX基盤の調達を担当することになった
- ITの専門知識はないが、適切な調達を行いたい
- 限られた予算で最大の効果を得たい
- 個人情報保護と業務効率化を両立させたい

### 2. 学校管理職（校長・副校長・教頭）

**活用方法**
- 調達プロセスの全体像を理解
- 自校のニーズを的確に伝える方法を習得
- システム導入後の運用イメージを把握

### 3. 情報システム担当教職員

**得られる知識**
- 技術要件の適切な設定方法
- セキュリティ要件の具体的な記述方法
- 現場の声を調達に反映させる手法

### 4. システムインテグレーター・ベンダー

**参考になる内容**
- 教育機関が求める要件の理解
- RFI/RFPへの適切な回答方法
- 教育分野特有の制約と要求事項

## 前提知識

本書を読むにあたって、特別な前提知識は必要ありません。ただし、以下の書籍を事前に読んでいただくと、より理解が深まります。

**推奨する関連書籍**
- [「次世代校務DX基盤の教科書 1」](https://zenn.dev/nahisaho/books/d87165478af519)
  - 個人情報保護最優先の基本理念を詳しく解説
  - 本書の理論的基盤となる考え方を提示

---

# 本書の構成

本書は、調達戦略の基礎からRFI作成、分析、そしてRFP作成まで、調達プロセスを段階的に学べる構成となっています。

## 各章の内容

### 第1章：はじめに（本章）
- 本書の目的と対象読者
- 全体構成と活用方法
- 成功する調達のための心構え

### 第2章：個人情報保護と業務最適化を実現する調達戦略の基礎
- なぜ「製品導入」ではなく「二つの目的の実現」が重要なのか
- 個人情報保護と業務効率化を両立する調達アプローチ
- 教育機関の使命を果たすシステム選定の原則
- 段階的調達によるリスク管理

### 第3章：次世代校務DX基盤のRFI設計
- RFIの基本構造と作成手順
- NIST SP 800-207準拠要件の記述方法
- 教育機関特有の要件設定
- 効果的な質問項目の設計

### 第4章：RFI回答の体系的分析手法
- 複数ベンダーの回答を客観的に評価する方法
- SMART分析手法による回答品質の判定
- 技術的実現可能性と教育現場適合性の評価
- コスト構造分析と隠れたリスクの特定

### 第5章：RFP作成の実践的手法
- RFI分析結果を活用したRFP設計戦略
- 個人情報保護要件の具体的な記述方法
- 業務効率化要件とシステム連携仕様の設計
- 提案評価基準と配点設計の実践

### 第6章：まとめ
- 調達プロセスの全体像の振り返り
- 成功する調達の重要ポイント
- よくある失敗パターンと回避方法
- 継続的改善への道筋

### 付録：実践テンプレート
- NIST Zero Trust Security準拠のRFIテンプレート
- NIST Zero Trust Security準拠のRFPテンプレート
- ベンダー評価シート
- 契約条項サンプル

---

# 本書の活用方法

## 読み方ガイド

### 初めて調達を担当する方

**推奨する読み方**
1. 第1章（本章）で全体像を把握
2. 第2章で基本的な考え方を理解
3. 第3章でRFI作成の具体的手法を学習
4. 第4章でRFI分析方法を習得
5. 第5章でRFP作成の実践的手法を学習
6. 付録のテンプレートを参考に実際のRFI・RFPを作成

### 既に調達経験がある方

**効率的な活用方法**
1. 第3章のRFI設計手法を確認
2. 第4章の分析手法で自身の方法を改善
3. 付録のテンプレートで抜け漏れをチェック

### 技術担当者の方

**技術面の深掘り**
1. 第3章のNIST準拠要件を詳しく確認
2. 第5章の技術仕様記述方法を参考に
3. 付録の技術要件チェックリストを活用

## 実践的な使い方

### 1. チェックリストとして活用

各章末にある「確認ポイント」を、実際の調達作業のチェックリストとして使用できます。

### 2. テンプレートのカスタマイズ

付録のテンプレートは、そのまま使用することも、各教育機関の状況に応じてカスタマイズすることも可能です。

### 3. チーム内での共有資料

調達チーム内で本書を共有し、共通認識を形成するための教材として活用できます。

---

# 成功する調達のための心構え

## 1. 目的を見失わない

調達の真の目的は「良いシステムを導入すること」ではありません。

**真の目的**
- **児童生徒の個人情報を確実に守ること**
- **教職員の働き方改革を実現すること**

この二つの目的を常に念頭に置いて、すべての判断を行うことが重要です。

## 2. 完璧を求めすぎない

**段階的アプローチの重要性**
- すべてを一度に実現しようとしない
- 基本機能から始めて段階的に拡張
- 失敗を恐れずに小さく始める

## 3. 現場の声を大切にする

**成功の鍵は現場にあり**
- 教職員の実際の業務フローを理解
- 使う人の立場に立った要件設定
- 継続的なフィードバックの仕組み作り

## 4. 長期的視点を持つ

**持続可能な運用を目指して**
- 初期費用だけでなくTCO（総所有コスト）を考慮
- 技術の進歩に対応できる柔軟性
- 組織の成長に合わせた拡張性

---

# 謝辞と連絡先

## 謝辞

本書の執筆にあたり、多くの教育関係者、システムベンダー、セキュリティ専門家の方々から貴重なご意見をいただきました。特に、実際の調達現場での課題や成功事例を共有してくださった教育委員会の皆様に深く感謝申し上げます。

## フィードバック

本書の内容についてのご質問、ご意見、改善提案などがございましたら、以下の方法でお寄せください。

**連絡方法**
- 著者への直接連絡：[nahisaho@microsoft.com]

## 最新情報

次世代校務DX基盤に関する最新情報や、本書の更新情報は以下でご確認いただけます。

**情報源**
- 文部科学省「次世代校務DXガイドブック」
- 文部科学省「教員勤務実態調査」（令和４年度）  
  📄 [調査結果資料（PDF）](https://www.mext.go.jp/content/20240404-mxt_zaimu01-100003067-2.pdf)
- NIST SP 800-207の最新改訂情報

---

# 次章への導入

次章では、個人情報保護と業務最適化を実現する調達戦略の基礎について詳しく解説します。なぜ「製品導入」ではなく「二つの目的の実現」が重要なのか、その理由と具体的なアプローチ方法を、実例を交えながら説明していきます。

教育現場が抱える課題を正しく理解し、それを解決するための調達戦略を立てることが、成功への第一歩です。さあ、一緒に学んでいきましょう。