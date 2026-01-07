# Zenn Writing Collection - AI Coding Agent Guide

> **AI Coding Agent向け**: このファイルはAIエージェント（GitHub Copilot、Claude等）がZenn記事作成プロジェクトを理解するためのガイドです。

## 🎯 プロジェクト概要

このプロジェクトは **Zenn.dev** 向け技術書籍・記事を管理するコンテンツリポジトリです。
**MUSUBIX** (Neuro-Symbolic AI Coding System) をZennライティング用に最適化して使用しています。

## 📋 Zennライティング9憲法条項（Constitutional Articles）

| Article | 原則 | Zennライティングでの適用 |
|---------|------|-------------------------|
| I | Reader-First Writing | 読者中心の記事作成、価値提供を最優先 |
| II | Zenn CLI Workflow | `npx zenn` コマンドによるコンテンツ管理 |
| III | Draft-First Development | draft-*.md による事前設計・構成確認 |
| IV | Project Memory | steering/ による執筆方針・決定の記録 |
| V | INDEX Traceability | INDEX.md による全コンテンツの追跡管理 |
| VI | Markdown Format | Zenn準拠のMarkdown形式（frontmatter必須） |
| VII | Quality Gate | チェックリストによる品質確保 |
| VIII | Anti-Complexity | シンプルで読みやすい文章構成 |
| IX | Preview Testing | `npx zenn preview` による公開前確認 |

## 📂 プロジェクト構造

```
zenn-writing-collection/
├── articles/           # 単独記事 (Zenn Articles)
├── books/              # 書籍コンテンツ (Zenn Books)
│   └── {book-id}/      # 各書籍ディレクトリ
│       ├── config.yaml # 書籍設定（タイトル、章順序）
│       ├── draft-*.md  # 下書き・設計ファイル（ローカル用）
│       └── chapter*.md # 章ファイル
├── drafts/             # 全体の下書き・アイデア
├── steering/           # プロジェクトメモリ（執筆方針）
│   ├── rules/          # 執筆ルール・ガイドライン
│   ├── product.md      # プロダクトコンテキスト
│   ├── tech.md         # 技術スタック
│   └── structure.md    # 構造定義
├── storage/            # データストレージ
│   ├── specs/          # 仕様書
│   ├── archive/        # アーカイブ
│   └── changes/        # 変更履歴
├── INDEX.md            # 全コンテンツ索引（必ず更新）
├── CLAUDE.md_for_ZennWriting # Zenn執筆AIガイド
└── musubix.config.json # MUSUBIX設定
```

## 🛠️ Zenn CLI コマンド

```bash
# コンテンツ管理
npx zenn new:book              # 新規書籍作成
npx zenn new:article           # 新規記事作成
npx zenn list:books            # 書籍一覧
npx zenn list:articles         # 記事一覧

# プレビュー
npx zenn preview               # ローカルプレビュー (localhost:8000)

# 開発環境
npm install                    # 依存関係インストール
```

## 📝 執筆ワークフロー

### 書籍作成フロー
1. `npx zenn new:book` で新規書籍ディレクトリ作成
2. **INDEX.md を即座に更新**（Created = Updated）
3. `draft-[book-title].md` で構成を設計
4. 各章ファイル（chapter*.md）を作成
5. `npx zenn preview` で確認
6. GitHubへpush → Zenn.devに自動同期

### Markdown必須形式
```markdown
---
title: "章タイトル"
---

# 節タイトル（H1）

## 項タイトル（H2）
```

## ⚠️ 重要ルール

1. **INDEX.md 更新必須**: 新規コンテンツ作成時は必ず更新
2. **frontmatter 必須**: 全てのZennファイルにtitle frontmatterが必要
3. **文字数制限**: Markdownファイルは50,000文字以内
4. **topics上限**: config.yamlのtopicsは最大5個
5. **mermaid互換性**: Zenn.devはmermaid.js 8.10.x使用

## 🔗 参照ドキュメント

- **CLAUDE.md_for_ZennWriting**: 詳細な執筆ガイド・テンプレート
- **Zenn Markdown Guide**: https://zenn.dev/zenn/articles/markdown-guide

---

**Optimized for**: Zenn.dev Content Management
**Based on**: MUSUBIX v1.7.5
**Date**: 2026-01-07
