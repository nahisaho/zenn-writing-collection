---
mode: agent
description: プロジェクト成果物（manifest.yaml）を管理し、一貫した品質を確保する
tools: ['shikigami-consulting-framework']
---

# 成果物マニフェスト管理プロンプト

## WHEN/DO トリガー定義

| WHEN | DO |
|------|-----|
| `@shikigami-manifest show` | manifest.yaml内容を表形式で表示 |
| `@shikigami-manifest update <id> <status>` | 成果物ステータス更新 |
| `@shikigami-manifest link <id> <path>` | ファイルパス登録 |
| `@shikigami-manifest enable <id>` | 条件付き成果物有効化 |
| `@shikigami-manifest type <type>` | プロジェクトタイプ設定・自動有効化 |
| `@shikigami-manifest validate` | 整合性チェック |

---

## manifest.yaml 構造

```yaml
project:
  id: "pjXXXXX"
  name: "プロジェクト名"
  folder: "pjXXXXX_Name_YYYYMMDD"
  status: "planning | in-progress | completed | archived"

deliverables:
  required:      # 必須成果物
  conditional:   # 条件付き成果物
  appendices:    # 補足資料

phases:          # フェーズ管理
quality:         # 品質チェックリスト
```

---

## コマンド詳細

### show - マニフェスト表示

```markdown
📋 Project Manifest: pjXXXXX_name_date

📊 成果物ステータス
| ID | 成果物 | ステータス | ファイル |
|----|--------|-----------|---------|
| executive_summary | エグゼクティブサマリー | ✅ completed | reports/... |

📈 フェーズ進捗
| Phase | ステータス | ゲート通過 |
|-------|-----------|-----------|
| Phase 1 | ✅ completed | ✅ |
```

### update - ステータス更新

| ステータス | 説明 |
|-----------|------|
| `not_started` | 未着手 |
| `in_progress` | 作業中 |
| `draft` | 下書き完了 |
| `review` | レビュー中 |
| `completed` | 完了 |

### type - プロジェクトタイプ設定

| タイプ | 自動有効化 |
|--------|-----------|
| `market_research` | market_research |
| `competitor_analysis` | competitor_analysis |
| `business_proposal` | financial_plan, market_research |
| `investment_analysis` | financial_plan |

---

## ルール

| # | ルール | 内容 |
|---|--------|------|
| R1 | 成果物定義確定 | Phase 1完了時に確定 |
| R2 | ステータス更新 | 作業開始→初稿→レビュー→完了の順 |
| R3 | ファイルパス登録 | `draft`以上でファイルパス必須 |
| R4 | business_proposal | 財務計画（3シナリオ）必須 |

---

## 更新手順

```
1. manifest.yaml 読み込み
2. 指示に従い値更新
3. last_updated を現在日時に更新
4. 変更内容を出力して確認
```

**確認フォーマット**:
```markdown
📝 manifest.yaml 更新内容

変更箇所:
- {変更前} → {変更後}

この変更を適用しますか？ (yes/no)
```

---

## 入力

{{{ input }}}
