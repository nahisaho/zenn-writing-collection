---
title: "第3章: 実践：Claude Codeを使用した記事執筆"
---


## Claude Codeの起動方法

Claude Codeを使用する方法は2つあります。

### 方法1: コマンドラインから起動（CLI版）

```bash
# WSL環境でプロジェクトディレクトリに移動
cd your-zenn-project

# Claude Codeを起動
claude
```

### 方法2: VSCode拡張機能を使用（推奨）

#### VSCode拡張機能版の起動

1. **VSCodeでプロジェクトを開く**
```bash
# WSL環境でVSCodeを起動
code .
```

2. **Claude Codeパネルを開く**
   - サイドバーのClaude Codeアイコンをクリック
   - または `Ctrl+Shift+C` でパネルを開く

#### VSCode拡張機能での実際の使用例

##### 記事の作成依頼

```
// Claude Codeパネルで入力
新しいZenn記事を作成してください。
タイトル: 「React Server Componentsの実践ガイド」
対象読者: React中級者
```

Claude Codeの応答
- 自動的に `npx zenn new:article` を実行
- フロントマターを適切に設定
- 記事の構成案を提示
- 初期コンテンツを生成

##### ファイル参照を使った編集

```
// @記法でファイルを参照
@articles/react-rsc.md の第3章に、
実際のコード例とデモアプリケーションの実装を追加してください。
```

##### 選択範囲への操作

1. **コードを選択**
2. **右クリック → "Refactor with Claude Code"**
3. **リファクタリング内容を指定**
4. **提案を確認してワンクリックで適用**

### CLI版とVSCode拡張機能版の使い分け

#### CLI版が適している場合
- **自動化スクリプトでの利用**
- **軽量な修正作業**
- **SSHでのリモート作業**
- **ターミナル中心のワークフロー**

#### VSCode拡張機能版が適している場合
- **長時間の執筆作業**
- **複数ファイルの編集**
- **視覚的なフィードバックが必要な作業**
- **コード提案の即座の適用**

## 実際の執筆デモンストレーション

VSCode上でClaude Codeを起動して、コンテンツ作成を依頼します。この記事自体が、以下のような指示で始まりました。

```
Human: Claude code で book タイプで、新しい記事を作成します。
記事のタイトルは「AIペアプロで爆速執筆！Claude Code × GitHub × Zennの最強タッグ」です。
```

## Claude Codeの自動応答と作業開始

Claude Codeが即座に以下の作業を実行しました。

```
Claude: [TodoWrite で作業計画を立案]
1. 記事用ディレクトリの作成
2. Zenn記事テンプレートの生成
3. フロントマターの設定
4. 記事コンテンツの執筆
```

## VSCode統合環境でのメリット

### CLI版を使用した場合の利点

**VSCodeターミナル内でClaude Codeを使用した場合**
- **エディタとの連携**: ファイルを見ながらClaude Codeとやり取り
- **統合されたワークフロー**: 編集、プレビュー、Claude Codeが同一環境で利用可能
- **効率的な作業**: エディタとAIアシスタントの切り替えが不要
- **マルチファイル操作**: 複数ファイルの同時編集が可能

### VSCode拡張機能版の追加メリット

**拡張機能版ならではの強力な機能**

#### 1. インテリジェントなコンテキスト認識
```
// 開いているファイルを自動的に認識
現在のファイルの内容を改善してください
```

#### 2. 視覚的な差分表示
- 提案された変更が色分けされて表示
- 変更前後の比較が一目瞭然
- 部分的な適用も可能

#### 3. リアルタイムプレビュー連携
```
// Claude Codeパネルで
この記事の見出し構造を改善してください。
Zennプレビューを見ながら最適化したいです。
```

#### 4. スマートな補完機能
- 記事執筆中にインライン提案
- Markdownのフォーマット自動補正
- コードブロックの言語自動検出

## 実際の執筆フローの比較

### CLI版での執筆フロー
```bash
# ターミナルで
claude
> 新しい記事を作成してください
# 応答をコピーしてファイルにペースト
# 手動でファイルを編集
```

#### 拡張機能版での執筆フロー
1. **Claude Codeパネルで指示**
2. **提案内容がプレビュー表示**
3. **「Apply」ボタンで即座に適用**
4. **Zennプレビューで確認**
5. **必要に応じて微調整を依頼**

## Zennコンテンツタイプの理解

Zennでは2つのコンテンツタイプを作成できます。

### Articles（記事）
```bash
npx zenn new:article
# → articles/05f48881652ef8.md（単一ファイル）
```

### Books（本）
```bash
npx zenn new:book
# → books/458a5e743ad515/（ディレクトリ構造）
#   ├── config.yaml
#   └── chapter1.md
```

## GitHub連携の重要な注意事項

### Articles（記事）の場合
:::message alert
**重要**: ArticlesはGitHub連携ができません。作成したMarkdownファイルの内容を手動でZenn.devにコピー&ペーストする必要があります。

1. ローカルで記事を作成・編集
2. `npx zenn preview` で内容を確認
3. Markdownの内容をコピー
4. [Zenn.dev](https://zenn.dev) で新規記事作成
5. コピーした内容をペースト
6. Zenn.dev上で公開設定
:::

### Books（本）の場合
:::message
BooksはGitHub連携が可能です。リポジトリをZennのダッシュボードで連携設定すると、GitHubへのpush時に自動でZenn.devに同期されます。
:::

## Step 1: 環境セットアップの自動実行

```bash
# Claude Codeが自動実行したコマンド群
npm init -y
npm install zenn-cli
npx zenn new:article

# 生成されたファイル: articles/05f48881652ef8.md
```

**ファイル構造の違い**
- **Article**: 単一のMarkdownファイル（記事・チュートリアル向け）
- **Book**: ディレクトリ内で複数ファイルを管理（連載・体系的ドキュメント向け）

**ポイント**: VSCode上でClaude Codeを使用することで、エディタ内で直接AIとペアプログラミングしながら、効率的にコンテンツを作成できます。

## 動的コンテンツ生成

記事執筆中、Claude Codeは以下のように支援します。

- **構成提案**: セクション構成を論理的に組み立て
- **コード生成**: 実際に動作するサンプルコードを自動生成
- **検証実行**: 生成したコードの動作確認を自動実行
- **品質保証**: 記事全体の一貫性とクオリティをチェック

## 記事の公開ワークフロー

### Articles（記事）の場合

```bash
# 記事をプレビューして確認
npx zenn preview

# 内容に満足したら、Markdownファイルの内容をコピー
cat articles/05f48881652ef8.md
```

**公開手順**:
1. **ローカルでプレビュー確認**
2. **Markdownファイルの内容をコピー**
3. **[Zenn.dev](https://zenn.dev)にログインして新規記事作成**
4. **コピーした内容をペースト**
5. **タイトル、絵文字、タグ等を設定**
6. **公開**

### Books（本）の場合

```bash
# 記事をプレビューして確認
npx zenn preview

# 変更をGitにコミット
git add .
git commit -m "Add new book about Claude Code workflow"
git push
```

**効果**: 
- プロジェクト全体の可視性向上
- ファイル管理の効率化
- Books: GitHubとZennの自動同期による効率的な公開フロー
- Articles: ローカルでの高品質な執筆環境とプレビュー機能

## プロジェクト管理の最適化

記事執筆後、ファイル管理の課題に対してもClaude Codeが即座に解決策を提案しました。

```bash
# 記事一覧の確認
npx zenn list:articles

# 出力例: 05f48881652ef8	AIペアプロで爆速執筆！Claude Code × GitHub × Zennの最強タッグ
```

**課題**: Zennが生成するランダムなファイル名（`05f48881652ef8.md`）では内容が推測できない

**Claude Codeの解決策**: 自動的にインデックスファイルを提案・作成

```markdown
# INDEX.md - コンテンツ管理

## Books
| Directory Name | Title | Status | Created | Updated |
|---------------|-------|--------|---------|---------|
| 458a5e743ad515/ | Claude Code活用ガイド | Writing | 2025-06-28 | 2025-06-28 |

## Articles  
| File Name | Title | Status | Created | Updated |
|-----------|-------|--------|---------|---------|
| 05f48881652ef8.md | AIペアプロで爆速執筆！... | Draft | 2025-06-28 | 2025-06-28 |
```

### INDEX.md管理のベストプラクティス

**重要**: 新しいコンテンツを作成する際は、必ずINDEX.mdファイルを更新してください。

#### コンテンツ作成時の手順
1. `npx zenn new:book` または `npx zenn new:article` でコンテンツ作成
2. **即座にINDEX.mdを更新**（Created = Updated）
3. コンテンツを編集
4. 大きな変更時にINDEX.mdのUpdated日付を更新

#### Status（状態）の更新タイミング
- **Writing** → **Preparing** → **Published**
- 公開設定変更時（`published: true`）
- 大幅な内容修正時
- 新しい章の追加時