---
title: "第２章 開発環境統合型文書作成環境の構築"
---

現代のエンジニアにとって効率的な技術文書作成には、既存の開発ワークフローと完全に統合された環境が必要です。本章では、VS Code、Claude Code、GitHub、Zennを組み合わせた統合環境の具体的な構築方法について解説します。

# 2.1 エンジニア向け環境設計のポイント

## 2.1.1 開発環境との完全統合設計

**既存スキル活用**
エンジニアが日常的に使用しているVS CodeやGitなどのツールをそのまま活用することで、新しいツールの学習コストを最小限に抑えます。慣れ親しんだショートカットキーや操作感を保ちながら、文書作成機能を追加する設計思想です。

**ワークフロー統一**
開発タスクと文書作成タスクの境界を排除し、コーディング中に発見した知見をすぐに文書化できる環境を構築します。これにより、「後で文書化しよう」という先延ばしを防ぎ、リアルタイムでの知識蓄積が可能になります。

**効率最大化**
ツール間の切り替えによる認知的負荷を最小化し、集中力を維持したまま作業を継続できます。同じIDE内でコード編集からドキュメント作成まで完結することで、作業効率が大幅に向上します。

**拡張性重視**
将来的な機能追加や自動化への対応を考慮した柔軟な環境設計を行います。CI/CDパイプラインへの文書生成の組み込みや、APIドキュメントの自動更新などの高度な機能も後から追加可能です。

## 2.1.2 知識補完システムの活用戦略

**専門外技術への対応**
Microsoft Learn MCP Serverを活用することで、自分の専門分野以外の技術についても公式情報を即座に参照できます。これにより、不正確な情報に基づく文書作成を防ぎ、常に最新かつ正確な技術情報を含む文書を作成できます。

**最新情報の自動反映**
自分の知識が古い場合や、技術仕様が更新された場合でも、AI支援により最新の情報を自動的に補完できます。これにより、技術トレンドの変化に常に対応した文書を維持できます。

**技術的正確性の担保**
推測や記憶に頼らず、確実な情報源に基づいた文書作成が可能になります。とくに、複雑な技術概念や設定手順については、公式ドキュメントを参照しながら正確性を保証できます。

**学習促進**
文書作成プロセス自体が技術学習になる仕組みを構築します。不明な概念について調べながら文書化することで、知識の深化と文書の充実を同時に実現できます。

# 2.2 Windows WSL環境での具体的セットアップ手順

## 2.2.1 段階1：WSL（Windows Subsystem for Linux）環境構築

**WSLのインストール**

まず、PowerShellを管理者権限で実行し、WSLをインストールします。

```powershell
# PowerShellを管理者権限で実行
wsl --install
# 再起動後、Ubuntu 22.04 LTSをインストール（推奨）
wsl --install -d Ubuntu-22.04
```

**Ubuntu環境のセットアップ**

WSLのインストール完了後、Ubuntu環境をセットアップします。

```bash
# システムアップデート
sudo apt update && sudo apt upgrade -y

# 開発に必要な基本ツールのインストール
sudo apt install build-essential -y

# ユーザー設定
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 2.2.2 段階2：Node.js開発環境の構築

**WSLにNode.jsをインストール（方法1：直接インストール）**

シンプルな方法として、Node.js 22を直接インストールします。

```bash
# Node.js 22のインストールスクリプトをダウンロード
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -

# Node.jsと必要なビルドツールをインストール
sudo apt-get install -y nodejs build-essential

# インストール確認
node -v
npm -v
```

**WSLにNVM（Node Version Manager）をインストール（方法2：バージョン管理が必要な場合）**

複数のNode.jsバージョンを管理したい場合はNVMを使用します。

```bash
# NVMのインストール
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# シェルの再読み込み
exec $SHELL

# Node.js 22のインストールと設定
nvm install 22
nvm use 22
nvm alias default 22

# インストール確認
node --version
npm --version
```

**WSLにClaude Codeをインストール**

AI支援による文書作成を可能にするClaude Codeをインストールします。

```bash
# Claude Codeのグローバルインストール
npm install -g @anthropic-ai/claude-code

# インストール確認
claude --version
```

**WSLにZenn CLIをインストール**

Zennでの技術文書公開に必要なCLIツールをインストールします。

```bash
# Zenn CLIのインストール
npm install -g zenn-cli

# Zennプロジェクトの初期化（後で使用）
# npx zenn init
```

## 2.2.3 段階3：VS Code環境構築

**VS Codeのインストール（Windows側）**

1. [VS Code公式サイト](https://code.visualstudio.com/)からダウンロード
2. インストール時に「PATHに追加」をチェック

**必須拡張機能のインストール**

WSL環境で効率的に作業するために必要な拡張機能をインストールします。


# WSL内からVS Codeを起動
```bash
code .
```

**以下の拡張機能をインストール：**
 - WSL（Microsoft）
 - Markdown All in One
 - Markdown Preview Enhanced  
 - Japanese Language Pack for VS Code
 - GitHub
 - GitLens
 - テキスト校正くん
 - Claude Code


## 2.2.4 段階4：Git・GitHub環境構築

**GitHub CLIのインストール**

GitHubとの連携を効率化するためのCLIツールをインストールします。

```bash
# GitHub CLIのインストール（Ubuntuの場合）
type -p curl >/dev/null || (sudo apt update && sudo apt install curl -y)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh -y

# GitHub認証
gh auth login
# ブラウザーでの認証を選択し、指示に従う
```

## 2.2.5 段階5：Claude Codeの初期設定

**Claude Codeの初期設定**

Claude Codeの初期設定を実行します。

```bash
# テスト用ディレクトリ作成
mkdir claudecode-test
cd claudecode-test/

# Claude Codeの初期設定を起動
claude
```

**設定手順**
1. サブスクリプションまたはAPI課金を選択
2. ブラウザ認証の指示にしたがって認証を完了
3. VS Codeとの統合設定を完了

**Microsoft Learn MCP Serverの追加**

知識補完システムを構築するためのMCP Serverを追加します。

```bash
# Microsoft Learn MCP Serverの追加
claude mcp add --transport http　microsoft-learn-mcp-server https://learn.microsoft.com/api/mcp

# MCP Server一覧の確認
claude mcp list
# 出力例: microsoft-learn-mcp-server: https://learn.microsoft.com/api/mcp (HTTP)
```

## 2.2.6 プロジェクト専用CLAUDE.mdファイルの作成

**CLAUDE.mdファイルの役割**

各技術文書プロジェクトに専用のCLAUDE.mdファイルを作成することで、Claude Codeが文書作成時に参照する専用の指示や設定を定義できます。これにより、プロジェクトの特性に応じた最適な文書作成支援が可能になります。

**CLAUDE.mdファイルの作成**

```bash
# プロジェクトルートでCLAUDE.mdファイルを作成
touch CLAUDE.md

# VS Codeで編集
code CLAUDE.md
```

**CLAUDE.mdファイルの基本テンプレート**

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Zenn.dev content management repository that uses Zenn CLI to manage technical books. Content is written in Markdown and synchronized with the Zenn.dev platform.

## Common Commands

### Content Management
- `npx zenn new:book` - Create a new book directory with generated ID
- `npx zenn preview` - Start local preview server (opens browser at localhost:8000)
- `npx zenn list:books` - List all books in the repository

### Development Workflow
1. Install dependencies: `npm install`
2. Create books using `npx zenn new:book` command
3. **Create draft file**: After creating the book directory, create a detailed draft file in the book directory
   - Save as `draft-[book-title].md` in the `/books/{book-id}/` directory
   - Include book title, summary, target audience, and complete table of contents
   - **Chapter Structure**: Use hierarchical structure (章=Chapter, 節=Section, 項=Subsection)
   - **Chapter Outlines**: Include purpose and detailed content overview for each chapter, section, and subsection
   - This file is not uploaded to Zenn (local work only, for planning purposes)
4. **IMPORTANT**: Always update INDEX.md when creating new content
5. Edit markdown files in `/books/`
6. Preview changes: `npx zenn preview`
7. Commit and push to GitHub to sync with Zenn.dev

## Content Structure

### Draft Files (Local Only)
Draft files should be saved in the book directory as `draft-[book-title].md` and follow this structure for comprehensive planning:

**File Location**: `/books/{book-id}/draft-[book-title].md`

 ```markdown
# Book Draft - [Book Title]

## 基本情報
- **タイトル**: [Book Title]
- **対象読者**: [Target Audience]
- **書籍概要**: [Book Overview]

## 章構成 (Chapter Structure)

### 第1章: [章タイトル]
**目的**: [Chapter Purpose]
**概要**: [Chapter Overview]

#### 1.1 [節タイトル]
**目的**: [Section Purpose]
**内容**: [Section Content Overview]

##### 1.1.1 [項タイトル]
- [Subsection Content Point 1]
- [Subsection Content Point 2]

##### 1.1.2 [項タイトル]
- [Subsection Content Point 1]
- [Subsection Content Point 2]

#### 1.2 [節タイトル]
**目的**: [Section Purpose]
**内容**: [Section Content Overview]

### 第2章: [章タイトル]
[Same structure as above]
` ```

**Benefits of saving draft in book directory**:
- Keeps all project files together
- Easy access during chapter creation
- Maintains project organization
- Draft file travels with the book when shared

### Books (`/books/`)
- Each book is a directory with unique ID
- `config.yaml` defines book metadata and chapter order:
```yaml
title: "Book Title"
summary: "Book description"
topics: ["tag1", "tag2"] # Maximum 5 tags
published: false
price: 0 # 0: free, 200-5000: paid
chapters:
  - "chapter1"
  - "chapter2"
` ``` 
- Each chapter is a `.md` file in the book directory
- **Chapter Hierarchy**: Use title=章, H1=節, H2=項 for consistent structure

### Zenn Markdown Format Requirements
**CRITICAL**: All Zenn book chapter files MUST start with a title using the `---` format:

```markdown
---
title: "Chapter Title"
---

# Chapter Content Starts Here
` ```

**Important Guidelines**:
- Every `.md` file in `/books/` directory MUST have the frontmatter title
- The title in frontmatter should match the chapter title (章タイトル)
- Do NOT use H1 (`#`) for the chapter title - use frontmatter title instead
- Start content with H1 for section titles (節タイトル)
- Use H2 for subsection titles (項タイトル)

**Example Structure**:
```markdown
---
title: "第1章: 環境構築と基本設定"
---

# VS Codeのセットアップ

## VS Codeのインストールと基本設定

### インストール手順

## 執筆に必要な拡張機能
` ```

## GitHub Integration

- Repository must be connected through Zenn's dashboard (maximum 2 repositories)
- Books sync automatically when pushed to GitHub
- Changes to the registered branch trigger automatic deployment to Zenn.dev
- New files with unused names create new posts automatically
- Content deletion must be done through Zenn's dashboard (files in repo will be restored on next sync)

## Markdown Syntax

- Refer to Zenn's Markdown guide: https://zenn.dev/zenn/articles/markdown-guide
- Zenn supports standard Markdown plus custom extensions for enhanced content
- **Character limit**: Markdown files have a maximum limit of 50,000 characters

### Mermaid Diagrams

Zenn.dev uses **mermaid.js 8.10.x**. When creating mermaid diagrams, follow these compatibility guidelines:

#### Subgraph Syntax (8.10.x compatible):
```markdown
```mermaid
graph TB
    subgraph SubgraphId["Display Name"]
        A[Node A] --> B[Node B]
    end
` ```

#### Styling (8.10.x compatible):
```markdown
```mermaid
graph TB
    A[Node A] --> B[Node B]
    
    classDef primaryClass fill:#ff9999
    classDef secondaryClass fill:#99ff99
    
    class A primaryClass
    class B secondaryClass
` ```

#### **DO NOT USE** (deprecated in 11.1.1):
- `subgraph "Display Name"` (use identifier syntax instead)
- `style A fill:#ff9999` (use classDef + class instead)

#### Recommended Patterns:
- Use identifier-based subgraph syntax
- Define styles with `classDef` then apply with `class`
- Test locally with `npx zenn preview` before publishing

## Content Management

### INDEX.md File Management
When creating new books, ALWAYS update the INDEX.md file to maintain project organization:

#### For New Books:
```markdown
## Books
| Directory Name | Title | Status | Created | Updated |
|---------------|-------|--------|---------|---------|
| {book-id}/ | {Book Title} | Writing | {Created Date} | {Created Date} |
` ```

### Workflow for Content Creation:
1. Run `npx zenn new:book`
2. **IMMEDIATELY update INDEX.md** with the new content information (Created = Updated)
3. Edit the content files
4. **Update INDEX.md whenever making significant changes**:
   - Update Status as needed (Writing → Preparing → Published)
   - Update Updated date to current date
   - Update Title if changed

### When to Update Updated Date:
- When changing book title
- When changing publication status
- When making major content revisions
- When adding new chapters to books
- When publishing content (published: true)

## Important Notes

- Book IDs are auto-generated and should not be changed
- Use `published: true` to make content public on Zenn.dev
- Preview server hot-reloads on file changes
- **CRITICAL**: Never forget to update INDEX.md when creating new content
- **CRITICAL**: Always update Updated date when making significant changes to content
- INDEX.md helps track all content and makes file management easier
- Updated date tracking helps identify recently modified content and maintenance needs
~~~
```

## 2.2.7 環境構築完了の確認

**動作確認用のテストプロジェクト作成**

すべてのツールが正常に動作することを確認するためのテストプロジェクトを作成します。

```bash
# テスト用ディレクトリー作成
mkdir ~/test-zenn-project
cd ~/test-zenn-project

# 簡単なテスト記事作成
npx zenn new:article

# ローカルプレビュー起動
npx zenn preview
```

**セットアップ完了チェックリスト**

以下の項目をすべてクリアしていることを確認してください。

- [ ] WSL Ubuntuが正常に動作している
- [ ] Node.js、npmが正常にインストールされている
- [ ] VS CodeからWSL環境にアクセスできる
- [ ] Git、GitHub CLIが認証済みで動作している
- [ ] Claude Codeが動作し、初期設定が完了している
- [ ] MCP Serverが追加されている
- [ ] Zenn CLIでローカルプレビューが表示される
- [ ] CLAUDE.mdファイルが作成されている

# 2.3 Zennプロジェクトとの連携設定

## 2.3.1 GitHubリポジトリーの作成と初期設定

Zennでの技術文書公開用のGitHubリポジトリーを作成します。

```bash
# Zenn用リポジトリーの作成（推奨名）
gh repo create username-zenn-contents --public --clone
# または
# gh repo create public-zenn-docs --public --clone

# リポジトリーに移動
cd username-zenn-contents

# Node.jsプロジェクトとして初期化
npm init --yes

# Zenn CLIのローカルインストール
npm install zenn-cli

# Zennプロジェクトとして初期化
npx zenn init
```

## 2.3.2 Zennアカウントとの連携設定

**Zennアカウントの作成と連携**

1. [Zenn](https://zenn.dev/)でアカウント作成（GitHubアカウントでログインを推奨）
2. Zennダッシュボードの「GitHubデプロイ」をクリック
3. 「リポジトリを連携する」をクリック
4. 作成したGitHubリポジトリーを選択
   - 注意: 連携可能なリポジトリーは最大2個まで
   - 「Only select repositories」で選択することを推奨

**ブランチ同期設定**

5. Zennのリポジトリ設定で同期ブランチを確認（デフォルト: main）
6. 指定したブランチへの変更が自動デプロイをトリガー

## 2.3.3 最初の記事作成とテスト公開

環境構築の最終確認として、実際に記事を作成して公開をテストします。

```bash
# テスト記事の作成（スラッグ指定推奨）
npx zenn new:article --slug test-environment-setup

# 記事編集（VS Codeで）
code articles/test-environment-setup.md

# ローカルプレビューで確認
npx zenn preview
# ブラウザで http://localhost:8000 を開いて確認

# GitHubにプッシュして自動公開をテスト
git add .
git commit -m "feat: add test article for environment setup"
git push origin main
```

**連携確認ポイント**
- GitHubにプッシュ後、5-10分でZennに自動デプロイされる
- Zennダッシュボードで記事が表示されることを確認
- バージョン管理やロールバックがGitHub経由で可能

# 2.4 トラブルシューティングと学習支援

## 2.4.1 WSL環境でよくある問題と解決策

**WSLインストール時の問題**

WSLが正常にインストールされない場合の対処法：

```bash
# WSLが有効化されていない場合
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# WSL2が既定になっていない場合
wsl --set-default-version 2
```

**Node.js環境の問題**

Node.js関連の問題とその解決策：

```bash
# nvmコマンドが見つからない場合（NVM使用時）
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.bashrc
exec $SHELL

# npmパッケージのグローバルインストール権限エラー
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Claude Codeが認識されない場合
which claude  # インストール場所を確認
npm list -g @anthropic-ai/claude-code  # インストール状態を確認
```

## 2.4.2 操作に慣れるためのコツ

**段階的な機能活用**
すべての機能を一度に使おうとせず、まずは基本機能のみを使いこなすことから始めます。徐々に高度な機能を追加していくことで、無理なく習熟できます。

**ショートカットの段階的習得**
頻繁に使用する基本操作のショートカットから覚え始めます。VS Codeの基本操作、Markdownプレビュー、Git操作などの基本から段階的に覚えていきます。

**エラーメッセージの読み方**
英語のエラーメッセージに慣れることが重要です。Claude Codeを使ってエラーメッセージの解釈や解決策の提案を求めることで、効率的に問題解決できます。

**ヘルプリソースの活用**
公式ドキュメント、コミュニティフォーラム、技術ブログなどのリソースを積極的に活用します。とくに、各ツールの公式ドキュメントは信頼性が高く、最新情報を得られます。

## 2.4.3 環境構築完了後の次ステップ

**VS Code拡張機能の追加**
基本環境構築後、必要に応じて追加の拡張機能をインストールします。テーマ、言語固有の拡張機能、生産性向上ツールなどを段階的に追加します。

**Gitワークフローの習得**
ブランチ作成、マージ、プルリクエストなどの基本的なGitワークフローを習得します。文書作成においても、コード開発と同様の品質管理プロセスを適用できるようになります。

**Zenn記法の学習**
Zenn特有のマークダウン記法と機能を学習します。コードブロック、数式、図表の挿入方法など、技術文書作成に特化した機能を活用できるようになります。

**定期的な環境メンテナンス**
ツールのアップデート、セキュリティ設定の確認、不要なファイルの整理などを定期的に実施します。安定した作業環境を維持することで、継続的な文書作成活動をサポートします。

# まとめ

本章では、エンジニア向けの統合文書作成環境の構築方法について詳しく解説しました。WSL環境の構築から、各種ツールのインストールと設定、Zennとの連携まで、段階的なセットアップ手順を示しました。

この環境により、従来のWord/PowerPoint中心の文書作成から脱却し、開発ワークフローと完全に統合された効率的な文書作成が可能になります。

次章では、構築した環境を使って実際に技術文書を作成する具体的な手順について解説します。文書企画からドラフト作成、AI支援による品質向上まで、実践的な文書作成プロセスを学習します。