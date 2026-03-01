---
mode: agent
description: SHIKIGAMI-PwCの全スキルを統合してエンドツーエンドのリサーチを実行する（PwCフレームワーク優先）
tools: ['shikigami-planner', 'shikigami-deep-research', 'shikigami-consulting-framework', 'shikigami-writing']
---

# SHIKIGAMI-PwC 統合リサーチプロンプト

## WHEN/DO トリガー定義

| WHEN | DO |
|------|-----|
| リサーチ依頼を受けた | Phase 0 を実行（**searchツール使用禁止**） |
| プロジェクト初期化完了 | Phase 1-5 を順次実行 |
| 各Phase完了時 | 成果物を projects/ に保存 |
| **フレームワーク分析時** | **PwCフレームワークを優先適用** |

---

## ⛔ 最重要ルール

> **searchツール使用前に `npx shikigami new <ProjectName>` 必須**

```
1. プロジェクト名をユーザーに提案して確認
2. ⭐ ユーザーの承認を待つ（この時点で何も実行しない）⭐
3. 承認後に npx shikigami new <ProjectName> 実行
4. フォルダ作成確認後、ワークフロー開始
```

❌ **禁止**: 「確認いただく前に作成しておきます」など承認前の実行

---

## 🌟 PwCフレームワーク自動選択（Phase 3）

| 分析目的 | キーワード | 推薦PwC FW |
|----------|-----------|------------|
| コスト最適化 | コスト削減, 成長投資 | **Fit for Growth** |
| 戦略立案 | 戦略, ケイパビリティ | **Strategy&** |
| DX推進 | デジタル変革, CX, EX | **BXT**, **Digital Maturity** |
| インパクト測定 | 社会価値, ESG | **TIMM**, **ESG Integration** |
| リスク管理 | 内部統制, ガバナンス | **Three Lines of Defense** |

---

## ワークフロー（5フェーズ）

| Phase | 内容 | ツール | 成果物保存先 |
|-------|------|--------|-------------|
| **0: 初期化** ⚠️必須 | `npx shikigami new` 実行 | CLI | manifest.yaml |
| **1: 目的探索** | 5 Whys, JTBD分析, 計画立案 | shikigami-planner | - |
| **2: Deep Research** | Think→Report→Action反復（**思考フロー記録**）🆕 | shikigami-deep-research | research/ |
| **3: 分析** | **PwC FW優先**、MECE検証 | shikigami-consulting-framework | research/ |
| **4: レポート** | ハルシネーション検出, 引用管理, **思考フロー出力**🆕 | shikigami-writing | reports/ |
| **5: 完了** | manifest.yaml更新 | - | - |

### ⭐ Phase 2 検索結果の保存（v1.25.0 必須）🆕

```
search/visit実行後、必ず以下を実行:

{"tool":"save_research","arguments":{
  "content":"検索結果やページ内容",
  "query":"検索クエリ",
  "source":"search" or "visit"
}}
```

**保存タイミング**:
- SEARCH後 → `save_research` (source: "search")
- VISIT後 → `save_research` (source: "visit")
- 分析メモ → `save_research` (source: "manual")

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
   ↑          ↑                            ↑
 search禁止   search解禁          思考フロー出力(v1.20.0)
```

---

## Phase 0: プロジェクト初期化

**手順**:
```bash
npx shikigami new <ProjectName>  # 英数字のみ
```

**フォルダ作成後、必ず実行**（v1.25.0）🆕:
```json
{"tool":"set_project","arguments":{"autoDetect":true}}
```

**作成されるディレクトリ**:
```
projects/pjXXXXX_<Name>_YYYYMMDD/
├── manifest.yaml
├── research/
└── reports/
```

**初期化の目的**:
| 目的 | 説明 |
|------|------|
| 成果物一元管理 | 1フォルダに集約 |
| ナレッジ継承 | 過去リサーチ検索・再利用 |
| 進捗追跡 | manifest.yamlで管理 |

---

## 品質基準

| 基準 | 目標 |
|------|------|
| 正確性 | ハルシネーション率 <10% |
| トレーサビリティ | 全情報に出典 |
| 構造性 | MECE・ピラミッド準拠 |
| 実用性 | 即行動可能な示唆 |
| **透明性**🆕 | 思考フローで判断過程を可視化 |

---

## 思考フロー可視化（v1.20.0）🆕

**レポートに自動出力される内容**:
- 🗺️ フローマップ（Mermaidダイアグラム）
- 📜 思考ログ（時系列の判断記録）
- 🔀 重要な判断ポイント（仮説修正・方針転換）
- 📈 思考メトリクス（調査ラウンド数、検証率等）

**記録タイミング**: 各Phase内のすべての判断・アクションを記録

---

## リサーチ依頼

{{{ input }}}
