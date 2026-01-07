# Zenn Writing Collection - Technology Stack

## プラットフォーム

- **Zenn.dev**: 技術コンテンツ配信プラットフォーム
- **GitHub**: ソースコード管理・自動同期

## コンテンツ管理ツール

### Zenn CLI
- **バージョン**: 最新版推奨
- **用途**: 書籍・記事の作成、プレビュー、管理
- **コマンド**:
  - `npx zenn new:book` - 新規書籍作成
  - `npx zenn new:article` - 新規記事作成
  - `npx zenn preview` - ローカルプレビュー
  - `npx zenn list:books` - 書籍一覧
  - `npx zenn list:articles` - 記事一覧

### Node.js
- **バージョン**: 20+
- **用途**: Zenn CLI実行環境

## マークアップ言語

### Markdown
- **標準**: CommonMark + Zenn拡張
- **必須要素**: 
  - frontmatter（title必須）
  - 階層化された見出し
- **文字数制限**: 50,000文字/ファイル

### Zenn独自機能
- **メッセージブロック**: `:::message` / `:::message alert`
- **アコーディオン**: `:::details タイトル`
- **コードブロック拡張**: ファイル名付き、diff表示
- **数式**: KaTeX対応
- **埋め込み**: YouTube、Twitter、CodeSandbox等

## 図表作成

### Mermaid.js
- **バージョン**: 8.10.x（Zenn.dev互換）
- **注意**: 新バージョン構文（11.x）は非対応
- **対応形式**: 
  - flowchart/graph
  - sequenceDiagram
  - classDiagram
  - stateDiagram
  - erDiagram

## AI執筆支援

### MUSUBIX
- **バージョン**: 1.7.5
- **用途**: Zennライティング最適化設定
- **参照ファイル**: 
  - `CLAUDE.md_for_ZennWriting` - 詳細執筆ガイド
  - `AGENTS.md` - AIエージェントガイド

### 対応AIエージェント
- GitHub Copilot
- Claude (claude.ai/code)
- その他MCP対応AIエージェント

## 開発環境

### 推奨エディタ
- VS Code
- 推奨拡張機能:
  - Markdown All in One
  - Zenn CLI Preview
  - Mermaid Preview

### バージョン管理
- Git
- GitHub連携（Zenn自動同期）

---

**生成日**: 2026-01-07
**最適化対象**: Zenn.dev Content Management
