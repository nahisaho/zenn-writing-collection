---
title: "第2章: 環境構築：10分で始める執筆環境"
---

# 環境構築：10分で始める執筆環境

## 必要なツールの準備

まずは、以下のツールが必要です。

- **WSL (Windows Subsystem for Linux)**
- **Node.js** (v14.0.0以上)
- **Git**
- **VSCode** または任意のエディタ
- **Claude Code** アクセス権

## Step 1: WSLの準備

### WSL環境の確認

本記事では、**すべての作業をWSL上で実行**することを前提としています。Node.js、Claude Code、Zenn CLIなどのインストールや実行は、すべてWSL環境内で行います。

```bash
# WSLを起動してバージョン確認
wsl --version
```

:::message
WSLのインストール方法については、本記事では詳しく扱いません。
[Microsoft公式ドキュメント](https://learn.microsoft.com/ja-jp/windows/wsl/)を参照してください。

**重要**: 以降のすべてのコマンドは、WSL環境内で実行してください。
:::

## Step 2: システムの更新（WSL内）

```bash
# パッケージリストを更新
sudo apt update

# インストール済みパッケージをアップグレード
sudo apt upgrade -y
```

## Step 3: Node.jsのインストール（WSL内）

```bash
# WSL環境内でNode.jsをインストール
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Node.jsとnpmのバージョン確認
node --version  # v14.0.0以上が必要
npm --version
```

## Step 4: Git と GitHub CLI のインストール（WSL内）

```bash
# Gitをインストール
sudo apt install git -y

# GitHub CLIのインストール
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh -y

# GitHub認証の設定
gh auth login
gh auth status
```

## Step 5: Zenn CLIのセットアップ（WSL内）

```bash
# Zenn CLIをグローバルインストール（任意）
npm install -g zenn-cli

# Zenn CLIの動作確認
npx zenn --version
```

:::message
実際のプロジェクトセットアップ（package.json初期化、Zenn CLI のローカルインストール、ディレクトリ構造作成）は、Step 9でリポジトリ内で行います。
:::

## Step 6: VSCodeのWSL環境への導入

### VSCodeのインストールと設定

WSL環境で効率的に開発を行うために、VSCodeとWSL拡張機能をセットアップします。

```bash
# WSL環境からVSCodeをインストール・起動するための準備
# まず、WindowsにVSCodeがインストールされていることを確認
```

### WSL拡張機能のインストール

1. **Windows側でVSCodeを起動**
2. **WSL拡張機能をインストール**
   - Extensions Marketplace（`Ctrl+Shift+X`）を開く
   - 「WSL」で検索
   - 「WSL」拡張機能をインストール

### WSL環境からVSCodeを起動

```bash
# WSL環境内でVSCodeを起動
code .

# 初回起動時にVSCode Serverが自動インストールされます
```

:::message
詳細なセットアップ方法については、[Microsoft公式ドキュメント](https://learn.microsoft.com/ja-jp/windows/wsl/tutorials/wsl-vscode)を参照してください。
:::

## Step 7: Claude Codeの導入

### 必要な環境
- **Node.js 18以上**
- **WSL環境**（Windows）
- **最低4GBのRAM**

### インストール方法

Claude Codeは2つの方法で利用できます。

#### 方法1: CLI版のインストール

```bash
# Node.jsのバージョン確認（18以上が必要）
node --version

# Claude Codeをグローバルインストール
npm install -g @anthropic-ai/claude-code
```

:::message alert
**重要**: `sudo npm install -g` は使用しないでください。権限の問題やセキュリティリスクが発生する可能性があります。
:::

#### 方法2: VSCode拡張機能のインストール（推奨）

1. **VSCodeを開く**
2. **拡張機能マーケットプレイスを開く**（`Ctrl+Shift+X`）
3. **「Claude Code」で検索**
4. **Anthropic公式の「Claude Code」拡張機能をインストール**

![Claude Code Extension](../images/books/0094d21340d214/claude-code-extension.png)

### 認証の設定

Claude Codeの初回起動時に認証が必要です。

1. **Anthropic Console経由**（推奨）
2. **Claude App**（Pro/Maxプランが必要）
3. **Enterprise**: Amazon BedrockまたはGoogle Vertex AI連携

### Claude Codeの起動

#### CLI版の場合

```bash
# WSL環境内でプロジェクトディレクトリに移動
cd your-zenn-project

# Claude Codeを起動
claude
```

#### VSCode拡張機能の場合

1. **VSCodeのサイドバーにClaude Codeアイコンが表示される**
2. **アイコンをクリックしてClaude Codeパネルを開く**
3. **初回は認証が必要**（Anthropic Consoleでの認証を推奨）

### VSCode拡張機能の特徴

VSCode拡張機能版のClaude Codeには、CLI版にはない以下の特徴があります。

#### 統合されたUI
- **専用のサイドパネル**: チャット履歴が常に表示
- **インラインコード提案**: エディタ内で直接コード提案を受けられる
- **コンテキスト認識**: 開いているファイルの内容を自動的に認識

#### 便利な機能
- **ファイル参照**: `@ファイル名` で特定のファイルを会話に含める
- **選択範囲の送信**: コードを選択して右クリック → "Ask Claude Code"
- **差分表示**: 提案された変更をdiff形式で確認
- **ワンクリック適用**: 提案されたコードをクリック一つで適用

#### ショートカットキー
- `Ctrl+Shift+C`: Claude Codeパネルを開く/閉じる
- `Ctrl+K Ctrl+C`: 選択したコードについて質問
- `Ctrl+K Ctrl+R`: 選択したコードのリファクタリング提案

### VSCodeとの連携方法

#### CLI版とVSCodeの連携

VSCodeのターミナル内でClaude Codeを起動することで、エディタと連携しながら作業できます。

```bash
# VSCode内のターミナルで実行
claude

# これにより、ファイル編集とClaude Codeの対話を同じ画面で行える
```

#### 拡張機能版の高度な連携

1. **コンテキストメニューの活用**
   - コードを選択 → 右クリック → "Explain with Claude Code"
   - エラー箇所で右クリック → "Fix with Claude Code"

2. **マルチファイル対応**
   ```
   @ファイル1.js @ファイル2.js を参照して、共通の処理を関数化してください
   ```

3. **プロジェクト全体の理解**
   ```
   このプロジェクトの構造を理解して、新しい機能を追加する最適な場所を提案してください
   ```

:::message
VSCode拡張機能版は、より直感的で効率的な開発体験を提供します。特に長時間の執筆作業では、統合されたUIの恩恵が大きくなります。
:::

### CLI版 vs VSCode拡張機能版の比較

| 機能 | CLI版 | VSCode拡張機能版 |
|-----|-------|-----------------|
| インストール方法 | npm install | VSCodeマーケットプレイス |
| UI | ターミナルベース | 統合されたGUI |
| ファイル参照 | 手動でパス指定 | @記法で簡単参照 |
| コード適用 | コピー&ペースト | ワンクリック適用 |
| 履歴管理 | セッション単位 | 永続的な履歴 |
| マルチファイル編集 | コマンドで指定 | ドラッグ&ドロップ |
| 推奨用途 | 軽量な作業、自動化 | 長時間の開発作業 |

:::message
詳細なセットアップ方法は[Claude Code公式ドキュメント](https://docs.anthropic.com/ja/docs/claude-code/setup)を参照してください。
:::

## Step 8: GitHubリポジトリの作成とクローン

### GitHubでリポジトリを作成

1. **GitHub上でリポジトリを作成**
   - [GitHub](https://github.com) にログイン
   - 「New repository」をクリック
   - リポジトリ名を入力（例：`my-zenn-content`）
   - 「Add a README file」をチェック
   - 「Create repository」をクリック

### GitHub CLI を使用した場合（推奨）

```bash
# GitHub CLIでリポジトリを作成してクローン
gh repo create my-zenn-content --public --clone
cd my-zenn-content
```

### 手動でクローンする場合

```bash
# WSL環境内で適切なディレクトリに移動
cd ~

# GitHubリポジトリをクローン
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

:::message
`YOUR_USERNAME`と`YOUR_REPO`は実際のGitHubユーザー名とリポジトリ名に置き換えてください。
:::

## Step 9: Zennプロジェクトの初期化とCLAUDE.md作成

リポジトリ内でZennプロジェクトを初期化し、Claude Codeをより効果的に使用するためのプロジェクトガイドファイルを作成します。

```bash
# リポジトリのディレクトリに移動
cd my-zenn-content  # または実際のリポジトリ名

# package.jsonを初期化
npm init --yes

# Zenn CLIをインストール
npm install zenn-cli

# .gitignoreを作成
echo "node_modules/" > .gitignore

# Zennの必要なディレクトリ構造を作成
npx zenn init

# CLAUDE.mdファイルを作成（次ページ参照）
```

## Step 10: プレビュー環境の確認

```bash
# プレビューサーバーを起動
npx zenn preview
# http://localhost:8000 でアクセス可能
```

**環境構築完了チェックリスト**
- [ ] WSLが正常に動作している
- [ ] Node.js v18.0.0以上がインストールされている
- [ ] Git・GitHub CLIが設定済み
- [ ] VSCodeとWSL拡張機能がインストールされている
- [ ] WSL環境からVSCodeが起動できる
- [ ] Zenn CLIが動作している
- [ ] Claude Code CLI版がインストールされている（`claude --version`で確認）
- [ ] または Claude Code VSCode拡張機能がインストールされている
- [ ] Claude Codeの認証が完了している
- [ ] GitHubリポジトリが作成されている
- [ ] リポジトリがローカルにクローンされている
- [ ] CLAUDE.mdファイルが作成されている
- [ ] プレビューサーバーが起動できる