```prompt
---
mode: agent
description: アクセンチュア標準コンサルティングフレームワークを自動選択・適用してデータを分析する
tools: ['shikigami-consulting-framework']
version: "2.0.0"
requirements: ["REQ-FW-001-01", "REQ-FW-002", "ACN-METHODOLOGY"]
---

# アクセンチュア・フレームワーク分析プロンプト

## WHEN / DO

| WHEN | DO |
|------|-----|
| Deep Research完了後 | キーワードから最適ACN FWを自動選択 |
| 分析目的を指定 | 対応アクセンチュアFWを推薦・適用 |
| 手動オーバーライド | 指定FWで分析実行 |

---

## アクセンチュア・フレームワーク選択ルール

| 分析目的 | キーワード | 推薦FW (優先順) |
|----------|-----------|----------------|
| DX戦略 | DX, クラウド, AI導入, 自動化 | Technology Vision → Cloud Smart → Intelligent Ops |
| 戦略・経営 | 戦略, 成長, M&A, 企業価値 | Value Creation → Growth Strategy Matrix → PMI |
| コスト最適化 | コスト, 効率化, BPR, ZBB | ZBB → Process Excellence → Intelligent Automation |
| 人材・組織 | 人材, スキル, 変革, リスキリング | Skills-to-Jobs → Change Enablement → Future Workforce |
| CX向上 | 顧客体験, CX, パーソナライズ | Living Business → Customer Journey → Hyper-Personalization |
| ESG・サステナビリティ | ESG, 脱炭素, Net Zero | Net Zero Transition → ESG Value Driver → Circular Economy |
| データ・AI | データ分析, AI, アナリティクス | Applied Intelligence → Data-Driven Enterprise → Responsible AI |

> 詳細: `configs/framework-auto-apply-rules.yaml`, `configs/framework-recommendation-rules.yaml`

---

## 利用可能アクセンチュア・フレームワーク

| カテゴリ | フレームワーク | 用途 |
|----------|---------------|------|
| DX | Technology Vision, Cloud Smart, SONG | DX戦略・クラウド移行 |
| 戦略 | Value Creation, Growth Strategy Matrix | 企業価値・成長戦略 |
| オペレーション | ZBB, Process Excellence | コスト最適化・業務改革 |
| 人材 | Skills-to-Jobs, Change Enablement | 人材戦略・変革管理 |
| ESG | Net Zero Transition, ESG Value Driver | サステナビリティ |

---

## 入力

```
分析目的: {{analysis_purpose}}
収集情報: {{collected_data}}
対象エンティティ: {{entities}}
```

{{{ input }}}

---

## 出力フォーマット

### 1. ACN FW選択結果
| 順位 | フレームワーク | 適合度 | 理由 |
|-----|---------------|-------|------|
| 1 | [ACN FW名] | ◎/○/△ | [理由] |

### 2. 情報マッピング（ADMフェーズ対応）
| FW項目 | マッピング元 | 信頼度 | ADMフェーズ |
|--------|-------------|-------|------------|
| [項目] | [情報源] | 高/中/低 | Discover/Design/Deliver/Operate |

### 3. 分析結果
選択ACN FWに基づく構造化分析

### 4. 戦略示唆（Actionable Recommendations）
| 施策 | 期待効果 | 実行難易度 | 優先度 |
|------|----------|-----------|-------|
| [施策1] | [効果] | 高/中/低 | A/B/C |

---

## ⭐ 分析結果の永続化（必須）

**分析完了後、必ず `save_research` を呼び出す:**

```json
{"tool":"save_research","arguments":{
  "content":"アクセンチュアフレームワーク分析結果（Markdown形式）",
  "query":"分析対象: [エンティティ名] / FW: [ACNフレームワーク名]",
  "source":"manual"
}}
```

> ⚠️ これにより research/ ディレクトリに分析結果が保存されます

---

## トレーサビリティ

| 項目 | 値 |
|------|-----|
| 要件ID | REQ-FW-001-01, REQ-FW-002, ACN-METHODOLOGY |
| 設計ID | DES-SHIKIGAMI-012, DES-SHIKIGAMI-014 |
```
