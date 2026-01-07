# Zenn Writing Collection - Project Structure

## ディレクトリ構成

```
zenn-writing-collection/
├── articles/              # Zenn単独記事
│   └── {article-slug}.md  # 記事ファイル（frontmatter必須）
│
├── books/                 # Zenn書籍コレクション
│   └── {book-id}/         # 書籍ディレクトリ（自動生成ID）
│       ├── config.yaml    # 書籍メタデータ・章順序
│       ├── draft-*.md     # 下書き・構成ファイル（ローカル専用）
│       ├── chapter*.md    # 章ファイル（frontmatter必須）
│       └── appendix*.md   # 付録ファイル（オプション）
│
├── drafts/                # 全体の下書き・アイデア保管
│   └── *.md               # アイデア・構想メモ
│
├── steering/              # プロジェクトメモリ（MUSUBIX準拠）
│   ├── rules/             # 執筆ルール・ガイドライン
│   │   └── zenn-writing.md # Zenn執筆ルール
│   ├── product.md         # プロダクトコンテキスト
│   ├── tech.md            # 技術スタック
│   └── structure.md       # 構造定義（本ファイル）
│
├── storage/               # データストレージ
│   ├── specs/             # 仕様書・計画書
│   ├── archive/           # 完了コンテンツのアーカイブ
│   └── changes/           # 変更履歴・リリースノート
│
├── INDEX.md               # 全コンテンツ索引（必須更新）
├── AGENTS.md              # AIエージェント向けガイド
├── CLAUDE.md_for_ZennWriting  # 詳細執筆ガイド
├── musubix.config.json    # MUSUBIX設定
└── package.json           # npm依存関係
```

## ファイル命名規則

### 書籍（books/）
| ファイル | 命名規則 | 説明 |
|---------|---------|------|
| config.yaml | 固定名 | 書籍メタデータ |
| 章ファイル | `chapter{N}-{slug}.md` | 例: chapter1-introduction.md |
| 下書き | `draft-{title}.md` | ローカル専用、Zenn非同期 |
| 付録 | `appendix-{slug}.md` | 例: appendix-references.md |

### 記事（articles/）
| ファイル | 命名規則 | 説明 |
|---------|---------|------|
| 記事 | `{slug}.md` | URLスラッグとして使用 |

## config.yaml 構造

```yaml
title: "書籍タイトル"
summary: "書籍概要"
topics: ["tag1", "tag2", "tag3"]  # 最大5個
published: false                   # true: 公開, false: 下書き
price: 0                           # 0: 無料, 200-5000: 有料
chapters:
  - chapter1-introduction
  - chapter2-basics
  - chapter3-advanced
```

## Markdownファイル構造

### 章ファイル（chapter*.md）
```markdown
---
title: "章タイトル"
---

# 節タイトル（H1）

## 項タイトル（H2）

### 小項タイトル（H3）
```

### 記事ファイル（articles/*.md）
```markdown
---
title: "記事タイトル"
emoji: "📝"
type: "tech"  # tech または idea
topics: ["tag1", "tag2"]
published: false
---

# 本文開始
```

## INDEX.md 管理

新規コンテンツ作成時は必ずINDEX.mdを更新：

```markdown
## Books
| Directory | Title | Status | Created | Updated |
|-----------|-------|--------|---------|---------|
| {book-id}/ | {Title} | Writing | YYYY-MM-DD | YYYY-MM-DD |

## Articles
| File | Title | Status | Created | Updated |
|------|-------|--------|---------|---------|
| {slug}.md | {Title} | Draft | YYYY-MM-DD | YYYY-MM-DD |
```

---

**生成日**: 2026-01-07
**最適化対象**: Zenn.dev Content Management
