---
name: shikigami-planner
description: |
  対話的目的探索・計画立案。5 Whys/JTBDで真の目的を発見し、リサーチ計画を策定。
license: MIT
---

# SHIKIGAMI Planner

| 起動条件 | アクション |
|---------|-----------|
| リサーチ依頼受領時 | Phase 0: プロジェクト初期化を最初に実行 |
| 目的が曖昧な時 | Phase 1: 1問1答で目的探索 |
| 計画策定時 | Phase 2: タスク分解・フレームワーク推奨 |

## ⛔ 最重要ルール

**リサーチ開始前に `npx shikigami new <ProjectName>` を必ず実行。**
- ❌ 禁止: 依頼を受けてすぐWeb検索
- ❌ 禁止: プロジェクト名確認前にフォルダ作成
- ✅ 正解: まずプロジェクト名を質問 → **ユーザーの承認を待つ** → CLI実行

---

## Phase 0: プロジェクト初期化

### ⚠️ 必須フロー（v1.24.0）

```
1. プロジェクト名を提案してユーザーに確認
2. ユーザーが「はい」「OK」「承認」等で同意するまで待機
3. 承認後に npx shikigami new <ProjectName> を実行
4. フォルダ作成確認後、ワークフロー開始
```

❌ **禁止パターン**:
```
「プロジェクト名はXXXでよろしいでしょうか？」
「確認いただく前に、プロジェクトを作成しておきます」  ← これは禁止！
```

✅ **正しいパターン**:
```
「プロジェクト名はXXXでよろしいでしょうか？」
→ ユーザーの返答を待つ（何も実行しない）
→ ユーザーが承認したら npx shikigami new XXX を実行
```

### コマンド

```bash
npx shikigami new <ProjectName>  # 英数字CamelCase、ハイフン禁止
```

**作成されるフォルダ**: `projects/pjXXXXX_<Name>_YYYYMMDD/`

### Phase 0-2: プロジェクト設定（v1.25.0）🆕

フォルダ作成後、**必ず**MCPツールでプロジェクトを設定:

```json
{"tool":"set_project","arguments":{"autoDetect":true}}
```

これにより、以降の`save_prompt`/`save_research`がプロジェクトディレクトリに保存されます。

### Phase 0-1: ナレッジ継承（v1.8.0）
1. 関連レポート検索
2. 継承可能な知識抽出（確定事実/ソースURL）
3. ユーザー確認

### Phase 0.5: 構造化プロンプト生成（v1.19.0）

| 要素 | 説明 |
|------|------|
| PURPOSE | 目的・ゴール |
| TARGET | 調査対象 |
| SCOPE | 範囲・深さ |
| TIMELINE | 期限 |
| CONSTRAINTS | 制約条件 |
| DELIVERABLES | 期待成果物 |

---

## Phase 1: 対話的目的探索

**⚠️ 1問1答厳守（3〜7問で収集）**

| カテゴリ | 質問例 |
|---------|--------|
| WHY | この調査で何を判断しますか？ |
| WHO | 結果を誰が使いますか？ |
| WHAT-IF | 理想的結果が得られたら次に何をしますか？ |
| CONSTRAINT | 時間・予算の制約は？ |
| SUCCESS | どうなれば成功ですか？ |

```markdown
## ❓ 質問 1/5
**カテゴリ**: WHY
この調査で何を判断したいですか？
```

### 5 Whys分析
抽象的回答には最大5回「なぜ？」で掘り下げ

### JTBD分析
- 機能的ジョブ: 達成したいタスク
- 感情的ジョブ: 感じたい/避けたい感情
- 社会的ジョブ: 他者からの評価

---

## Phase 2: 計画立案

```markdown
## 📋 リサーチ計画

| # | タスク | 種別 | 推奨手法 | 優先度 |
|---|--------|------|----------|--------|
| 1 | [タスク] | 調査 | Deep Research | P0 |
| 2 | [タスク] | 分析 | SWOT | P1 |
```

### 成功条件タイプ（v1.6.0）

| タイプ | レポート特徴 |
|--------|-------------|
| IMMEDIATE_APPROVAL | 結論先行、緊急性強調 |
| STAGED_APPROVAL | 段階別サマリー |
| CONSIDERATION | 選択肢比較 |
| BUDGET_APPROVAL | 財務計画詳細、ROI分析 |
| PILOT_APPROVAL | PoC計画、Go/No-Go基準 |

---

## Phase 3: 進捗管理

### 成果物定義（v1.10.0）
```yaml
deliverables:
  - id: "DEL-001"
    type: "report"
    status: "in_progress"  # not_started/in_progress/completed/blocked
    progress: 65
    priority: "P0"
```

### ダッシュボード
```
[██████████░░░░░░░░░░] 52% 完了
完了:2 / 作業中:2 / ブロック:0 / 未着手:1
```

---

## Phase 4: ペルソナ情報収集（v1.6.0）

| 項目 | 選択肢 |
|------|--------|
| 意思決定スタイル | data_driven / intuitive / consensus / balanced |
| ドメイン知識 | expert / intermediate / beginner |
| 重視ポイント | ROI / リスク / 競争優位 / ESG / イノベーション |

→ manifest.yaml `personas[]` に出力

---

## 自動呼び出し（v1.16.0）

| トリガー | 呼び出しプロンプト |
|---------|-------------------|
| BUDGET_APPROVAL | @risk-sensitivity, @financial-analysis |
| STAGED_APPROVAL | @stakeholder-impact |
| 計画完了前 | 提言書チェックリスト検証 |

---

## 保存先
`projects/pjXXXXX_Name_YYYYMMDD/manifest.yaml`

## 関連スキル
- **shikigami-deep-research**: 計画に基づくリサーチ実行
- **shikigami-consulting-framework**: フレームワーク分析
- **shikigami-writing**: 最終レポート生成
