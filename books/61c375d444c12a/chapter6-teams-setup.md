---
title: "第6章: Microsoft Teams の設定と管理"
---

## 6.1 Teams の基本構造

### 階層構造の理解
```
組織（テナント）
├── チーム（例: 1年A組、理科部、職員会議）
│   ├── チャネル（例: 一般、数学、英語）
│   │   ├── 会話
│   │   ├── ファイル
│   │   └── アプリ（タブ）
│   └── メンバー（所有者、メンバー、ゲスト）
└── プライベートチャット
```

### 教育機関での活用パターン
1. **クラスチーム**: 各クラスごとに作成
2. **教科チーム**: 教科ごとの教材共有
3. **部活動チーム**: 活動連絡と資料共有
4. **職員チーム**: 教職員間の連携

## 4.2 Teams 管理センターの設定

### アクセス方法
```
admin.teams.microsoft.com
または
Microsoft 365 管理センター > 管理センター > Teams
```

### 組織全体の設定
1. **外部アクセス**
   ```
   ユーザー > 外部アクセス
   - 他の Teams組織: 許可/ブロック
   - Skype: ブロック推奨
   ```

2. **ゲストアクセス**
   ```
   ユーザー > ゲストアクセス
   - ゲストアクセス: オン（必要に応じて）
   - 通話: オフ推奨
   - 会議: 制限付き許可
   ```

## 4.3 チームの作成と管理

### チームテンプレートの活用
1. **教育機関向けテンプレート**
   - クラス: 課題、成績表、Class Notebook付き
   - PLC（専門学習コミュニティ）: 教職員の研修用
   - スタッフ: 管理業務用

### PowerShellでの一括作成
```powershell
# CSVからクラスチームを一括作成
Import-Csv "classes.csv" | ForEach-Object {
    New-Team -DisplayName $_.ClassName `
             -Description $_.Description `
             -Template "EDU_Class" `
             -Owner $_.TeacherEmail
}
```

### チームのライフサイクル管理
1. **有効期限の設定**
   - 学期/年度末での自動アーカイブ
   - 更新通知の設定

2. **アーカイブポリシー**
   ```
   設定 > Teams設定 > チームの有効期限
   - 既定の有効期限: 365日
   - 所有者への通知: 30日前
   ```

## 4.4 会議とライブイベントの設定

### 会議ポリシーの作成
1. **生徒用ポリシー**
   ```
   会議 > 会議ポリシー > 新規作成
   - 会議の開始: 不可
   - 録画の開始: 不可
   - 画面共有: 制限付き
   ```

2. **教職員用ポリシー**
   ```
   - 会議の開始: 可能
   - 録画: 可能
   - 外部参加者の招待: 可能
   ```

### ライブイベントの設定
- 全校集会や保護者会のオンライン配信
- 最大10,000人まで参加可能
- 録画の自動保存

## 4.5 アプリとタブの管理

### 教育用アプリの統合
1. **標準アプリ**
   - OneNote Class Notebook
   - Forms（小テスト）
   - Stream（動画共有）

2. **サードパーティアプリ**
   - アプリの許可/ブロック設定
   - 組織のアプリカタログ作成

### カスタムアプリポリシー
```
Teams管理センター > アプリ > アプリのセットアップポリシー
- 生徒: 教育関連アプリのみ
- 教職員: 承認済みアプリ全般
```

## 4.6 コンプライアンスとセキュリティ

### コミュニケーションの監視
1. **コミュニケーションコンプライアンス**
   - 不適切な言語の検出
   - いじめ防止ポリシー

2. **情報バリア**
   - 教職員と生徒間の適切な境界
   - 部門間の情報分離

### データ保持ポリシー
```
コンプライアンスセンター > データ保持
- チャットメッセージ: 1年間
- チャネルメッセージ: 3年間
- 会議録画: 180日間
```

## 4.7 Class Notebook の活用

### 基本構成
- **コンテンツライブラリ**: 教師が教材を配布
- **コラボレーションスペース**: 共同作業用
- **生徒のノートブック**: 個人作業用（教師のみ閲覧可）

### 効果的な活用方法
1. デジタル教材の配布
2. 課題の提出と採点
3. 個別フィードバック
4. ポートフォリオの作成

## 4.8 トラブルシューティング

### よくある問題

**問題1: チームが作成できない**
- 解決: チーム作成権限の確認
- PowerShellでの権限付与

**問題2: 会議で音声/ビデオが使えない**
- 解決: 会議ポリシーの確認
- デバイス設定の確認

**問題3: ファイルが開けない**
- 解決: SharePoint容量の確認
- ファイル形式の確認

### パフォーマンスの最適化
1. **ネットワーク要件**
   - 最小帯域幅: 1.2 Mbps/ユーザー
   - 推奨: 4 Mbps/ユーザー

2. **クライアント設定**
   - 自動起動の制御
   - キャッシュのクリア

## 4.9 ベストプラクティス

### 導入戦略
1. **パイロット運用**
   - 少数のクラスで試験運用
   - フィードバックの収集
   - 段階的な展開

2. **研修計画**
   - 基本操作研修（全教職員）
   - 管理者研修（IT担当者）
   - 生徒向けガイダンス

### 運用ルール
- チーム命名規則の統一
- チャネル作成ガイドライン
- ファイル管理ポリシー
- 会議エチケット

## まとめ

Microsoft Teamsは、教育現場でのコミュニケーションとコラボレーションを大きく変革するツールです。適切な設定と運用ルールにより、安全で効果的な学習環境を構築できます。次章では、ファイル管理の基盤となるSharePointとOneDriveについて説明します。