---
name: shikigami-deep-research
description: |
  反復的深層リサーチ。Think→Report→Action→完了サイクルで高品質調査を実行。
license: MIT
---

# SHIKIGAMI Deep Research

| 起動条件 | アクション |
|---------|-----------|
| リサーチ依頼時 | Think→Report→Action→完了の反復実行 |
| 情報収集が必要な時 | MCPツール(search/visit)で検索・訪問 |
| 品質検証が必要な時 | 交差検証・ソース批評を実行 |

## MCPツール

### 検索・訪問ツール

| ツール | 用途 | 呼び出し例 |
|--------|------|-----------|
| `search` | Web検索 | `{"tool":"search","arguments":{"query":["日本語","English"],"maxResults":10}}` |
| `visit` | ページ取得 | `{"tool":"visit","arguments":{"url":"URL","goal":"抽出目的"}}` |

### 永続化ツール（v1.25.0）🆕

| ツール | 用途 | 呼び出し例 |
|--------|------|-----------|
| `set_project` | プロジェクト設定 | `{"tool":"set_project","arguments":{"autoDetect":true}}` |
| `save_research` | 検索結果保存 | `{"tool":"save_research","arguments":{"content":"...","query":"検索クエリ","source":"search"}}` |

### ⚠️ 必須フロー（v1.25.0）

```
1. Phase 0完了後、set_projectでプロジェクトを設定
2. search/visit実行後、必ずsave_researchで結果を保存
3. 保存先: projects/pjXXXXX_Name_YYYYMMDD/research/
```

**保存タイミング**:
| アクション | 保存内容 | source値 |
|------------|----------|------------|
| SEARCH後 | 検索結果一覧 | `"search"` |
| VISIT後 | ページ内容抽出 | `"visit"` |
| 手動メモ | 分析メモ | `"manual"` |

---

## Phase 1: Think（思考）

**目的**: 現状分析・仮説生成・次アクション決定

**⚠️ 思考フロー記録必須（v1.20.0）**: 各Thinkステップで判断内容と理由を明記

```markdown
## 🧠 Think - ラウンド [N]

| 確定事実 | 信頼度 | ソース |
|---------|--------|--------|
| [事実] | 高/中/低 | [[1]](#ref-1) |

**未解決の疑問**: [リスト]
**ギャップ**: 目標[X] vs 現状[Y]
**次アクション**: SEARCH / VISIT / VERIFY / COMPLETE / **BRANCH** 🆕
**選択理由**: [なぜこのアクションを選んだか]
```

---

## Phase 1.5: Multi-Pop（分岐探索）🆕 v1.51.0

**起動条件**: Thinkフェーズで対立仮説・複数解釈・探索パス分岐を検出した場合

### Step 1: 分岐検出

Thinkの出力で以下のシグナルを検知したら `branch_detect` を呼び出す:
- 対立する仮説が存在（「一方で」「しかし」「vs」）
- 複数の解釈が可能（「可能性としては」「別の解釈」）
- 深掘り方向が複数（「技術的には/ビジネス的には」）
- 情報ギャップが多面的

```json
{"tool":"branch_detect","arguments":{"thinkOutput":"[Thinkの出力テキスト]","currentRound":N}}
```

**⚠️ 分岐しない場合**: 結果が `detected: false` なら通常フローを継続

### Step 2: ブランチ探索

分岐検出されたら、各ブランチについて独立にThink→Actionを実行:

```markdown
## 🔀 ブランチ探索 - [ブランチID]
**仮説**: [ブランチの仮説]
**探索ラウンド**: [割当数]ラウンド

### Think (Branch [label], Round 1)
...
### Action: SEARCH
{"tool":"search","arguments":{"query":["...", "..."]}}
{"tool":"save_research","arguments":{"content":"...","query":"...","source":"search","metadata":{"branchId":"[ID]"}}}
```

- 各ブランチのsave_researchには `metadata.branchId` を指定
- ブランチ間では情報を共有しない（独立探索）

### Step 3: ブランチ評価

全ブランチの探索完了後、評価を実行:
```json
{"tool":"branch_evaluate","arguments":{
  "branches": [各ブランチのデータ（findings含む）],
  "parentContext": {"confirmedFacts":[],"sources":[],"evolvingReport":"..."}
}}
```

### Step 4: ブランチ選択・マージ

```json
{"tool":"branch_select","arguments":{
  "evaluations": [branch_evaluateの結果],
  "branches": [全ブランチデータ]
}}
```

**結果の活用**:
- `selected`: このブランチのコンテキストでPhase 2へ進行
- `mergeCandidates`: 有用な発見事項が自動マージ済み
- `pruned`: 打ち切られたブランチ（情報不足/低品質）

→ 選択されたブランチのコンテキストで **Phase 2 (Report)** へ進行

---

## Phase 2: Report（進化するレポート）

**目的**: 最新知見を反映した暫定レポート維持

```markdown
## 📄 Evolving Report - v[N]（完成度[X]%）

### 主要発見事項
- [発見1] [[1]](#ref-1) 信頼度:⭐⭐⭐⭐
- ⚠️ [単一ソースの情報] [[2]](#ref-2)

### 参考文献
<a id="ref-1">[1]</a> [タイトル](URL) - YYYY-MM-DD
```

---

## Phase 3: Action（実行）

### 検索ルール（必須）
- **日本語→英語翻訳して両方検索**
- 例: `["TypeScript ベストプラクティス","TypeScript best practices"]`

| アクション | 用途 |
|-----------|------|
| SEARCH | 新情報が必要 |
| VISIT | 詳細取得が必要 |
| VERIFY | 交差検証（3+ソース確認） |
| COMPLETE | 十分な情報収集完了 |

---

## Phase 4: 完了判定

| 条件 | 説明 |
|------|------|
| 十分性 | 目的に対して情報十分 |
| 信頼性 | 主要事実が複数ソース確認済 |
| 完全性 | 重要疑問が解決済 |

```markdown
## ✅ リサーチ完了
総ラウンド:[N] / 交差検証率:[X]% / 使用ソース:[Y]件
→ **shikigami-writing** でレポート生成
```

---

## ソース品質基準

| 要素 | 高信頼 | 中信頼 | 低信頼 |
|------|--------|--------|--------|
| ドメイン | .gov/.edu/学術誌 | 企業公式/大手メディア | 個人ブログ/SNS |
| 日付 | 1年以内 | 3年以内 | 3年以上前 |
| 交差検証 | 3+ソース | 2ソース | 単一 |

---

## 拡張機能

### ペルソナ認識（v1.6.0）
manifest.yaml `personas[].domain_knowledge.level` で調整:
- expert: 専門用語OK、詳細データ
- beginner: 入門資料も検索、用語解説必須

### 並列エンティティリサーチ（v1.8.0）
複数企業/技術を独立調査→比較マトリクス生成

### マルチポップ（v1.51.0）🆕
多段階分岐探索。Thinkで分岐点を検出し、複数パスを並行探索→評価→最有望パスを選択

| MCPツール | 用途 |
|-----------|------|
| `branch_detect` | 分岐点検出（Thinkの出力を分析） |
| `branch_evaluate` | ブランチ評価（5基準加重スコアリング） |
| `branch_select` | ブランチ選択・マージ（有用情報の統合） |

### ソース批評自動呼び出し（v1.16.0）
完了時に `@source-critique` 自動実行（ソース数≥5）

### 思考フロー記録（v1.20.0）🆕
各Think/Search/Visit/Verifyステップを自動記録し、shikigami-writingに引き継ぎ

**記録内容**:
| 項目 | 説明 |
|------|------|
| タイムスタンプ | 各ステップの実行時刻 |
| 判断内容 | 何を判断・決定したか |
| 信頼度 | その判断の確信度（0.0-1.0） |
| ソース | 参照した情報源 |
| 次アクション理由 | なぜその次のアクションを選んだか |

**ピボット検出**: 仮説修正・方針転換を自動検出して強調記録

---

## 保存先
`projects/pjXXXXX_Name_YYYYMMDD/research/`

## 関連スキル
- **shikigami-planner**: 事前の計画立案
- **shikigami-consulting-framework**: フレームワーク分析
- **shikigami-writing**: 最終レポート生成
