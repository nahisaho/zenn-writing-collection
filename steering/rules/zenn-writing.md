# Zenn執筆ルール・ガイドライン

## 📋 Zennライティング9憲法条項

### Article I: Reader-First Writing
読者中心の記事作成を最優先とする。
- 読者にとっての価値を常に考える
- 問題解決・スキル習得に焦点を当てる
- 読者レベルに適した説明を提供

### Article II: Zenn CLI Workflow
`npx zenn` コマンドによるコンテンツ管理を遵守。
- 新規作成: `npx zenn new:book` / `npx zenn new:article`
- プレビュー: `npx zenn preview`
- 一覧: `npx zenn list:books` / `npx zenn list:articles`

### Article III: Draft-First Development
draft-*.md による事前設計・構成確認を行う。
- 書籍作成前に構成を設計
- 章立て・節構成を事前に検討
- 下書きファイルはローカル専用（Zenn非同期）

### Article IV: Project Memory
steering/ による執筆方針・決定の記録を維持。
- product.md: プロダクトコンテキスト
- tech.md: 技術スタック
- structure.md: 構造定義
- rules/: 執筆ルール

### Article V: INDEX Traceability
INDEX.md による全コンテンツの追跡管理を必須とする。
- 新規コンテンツ作成時は即座に更新
- Created = Updated（初回）
- ステータス変更時に更新

### Article VI: Markdown Format
Zenn準拠のMarkdown形式を遵守。
- frontmatter必須（title）
- 章: frontmatter title
- 節: H1（#）
- 項: H2（##）
- 小項: H3（###）

### Article VII: Quality Gate
チェックリストによる品質確保を実施。
- 技術的正確性の確認
- コード動作検証
- 文章の可読性チェック
- 公開前の最終確認

### Article VIII: Anti-Complexity
シンプルで読みやすい文章構成を維持。
- 一つの概念を一度に説明
- 短い段落（2-4文）
- 具体例の活用
- 能動態の使用

### Article IX: Preview Testing
`npx zenn preview` による公開前確認を必須とする。
- 表示崩れの確認
- リンク動作確認
- コードブロック確認
- モバイル表示確認

---

## 📝 Zennファイル形式ルール

### frontmatter必須要素

**書籍章ファイル**
```markdown
---
title: "章タイトル"
---
```

**記事ファイル**
```markdown
---
title: "記事タイトル"
emoji: "📝"
type: "tech"
topics: ["tag1", "tag2"]
published: false
---
```

### 制限事項
- 文字数: 50,000文字/ファイル
- topics: 最大5個
- mermaid: 8.10.x互換構文のみ

---

## ✅ 品質チェックリスト

### 公開前必須確認
- [ ] frontmatterが正しい形式
- [ ] INDEX.mdを更新済み
- [ ] `npx zenn preview`で確認済み
- [ ] コードが動作確認済み
- [ ] リンクが有効
- [ ] 誤字脱字チェック済み

### 推奨確認
- [ ] SEO最適化（タイトル30-60文字）
- [ ] 適切なemoji選択
- [ ] Zenn機能の活用（message、details等）
- [ ] 読者レベルに適した説明

---

**生成日**: 2026-01-07
**参照**: CLAUDE.md_for_ZennWriting
