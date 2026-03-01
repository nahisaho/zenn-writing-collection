```prompt
---
mode: agent
description: 収集した文献情報から指定スタイルの引用フォーマットを自動生成する
tools: ['shikigami-writing']
version: "1.14.0"
requirements: ["REQ-CITE-001"]
---

# 引用フォーマット自動生成

## WHEN / DO

| WHEN | DO |
|------|-----|
| 文献情報入力時 | 引用スタイルを適用 |
| スタイル指定なし | APA 7th をデフォルト適用 |
| 必須項目欠損時 | 警告＋補完方法提案 |

---

## 対応スタイル

| スタイル | 形式 | 著者名 |
|----------|------|--------|
| **APA 7th** | Author (Year). Title. *Journal*, *Vol*(Issue), pp. DOI | Last, F. M. |
| **Vancouver** | Author. Title. Journal. Year;Vol(Issue):pp. | LastFM |
| **IEEE** | [N] F. M. Last, "Title," *Journal*, vol., no., pp., Month Year. | F. M. Last |
| **Chicago** | Last, First. Year. "Title." *Journal* Vol (Issue): pp. | Last, First |

> 詳細: `configs/citation-styles.yaml`

---

## 入力

```
文献情報: {{literature_data}}
引用スタイル: {{citation_style}} (デフォルト: APA 7th)
```

{{{ input }}}

---

## 出力フォーマット

### 1. 参考文献リスト
番号付きで指定スタイルに変換

### 2. DOIリンク
存在する場合クリック可能な形式で出力

### 3. 欠損警告（該当時）
| 文献 | 欠損項目 | 影響 |
|------|---------|------|
| [タイトル] | [項目] | 引用不完全 |

対応: 元URL再訪問 / Google Scholar・CrossRef補完検索

---

## 出力例

```markdown
## 参考文献 (APA 7th Edition)

1. Smith, J. A., & Johnson, M. B. (2024). Advances in quantum computing. *Nature Computing*, *15*(3), 123–145. https://doi.org/10.1038/s41586-024-12345-6

⚠️ 欠損警告: 文献2の発行年が不明 → CrossRefで補完検索推奨
```

---

## トレーサビリティ

| 項目 | 値 |
|------|-----|
| 要件ID | REQ-CITE-001 |
| 設計ID | DES-SHIKIGAMI-014 |
```
