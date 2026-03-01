---
mode: agent
description: "Deep Research結果からSWOT分析を自動生成するプロンプト"
tools: ["shikigami_visit", "shikigami_search", "shikigami_file_parser", "read_file"]
version: "1.12.0"
requirements: ["REQ-FW-001-02"]
---

# SWOT分析自動生成プロンプト

## 概要

Deep Researchフェーズで収集した情報から、SWOT分析（Strengths, Weaknesses, Opportunities, Threats）を自動生成します。

## 入力

- **Deep Researchレポート**: `reports/` ディレクトリ内のリサーチ結果ファイル
- **対象エンティティ**: 分析対象の組織・技術・プロジェクト名

## 抽出キーワード

### Strengths（強み）- 内部環境・プラス要因
```
日本語: 強み, 優位性, 特許, 独自, 先進, 実績, ノウハウ, 競争力, リーダー, 高品質
英語: strength, advantage, patent, unique, advanced, track record, know-how, competitive, leader, high quality
```

### Weaknesses（弱み）- 内部環境・マイナス要因
```
日本語: 弱み, 課題, 不足, 遅れ, 限界, コスト高, 人材不足, 規模, 依存
英語: weakness, challenge, lack, delay, limitation, high cost, talent shortage, scale, dependency
```

### Opportunities（機会）- 外部環境・プラス要因
```
日本語: 機会, 成長, 需要増, 市場拡大, 規制緩和, トレンド, 新興, 補助金, 支援
英語: opportunity, growth, increasing demand, market expansion, deregulation, trend, emerging, subsidy, support
```

### Threats（脅威）- 外部環境・マイナス要因
```
日本語: 脅威, リスク, 競合, 規制強化, 代替, 価格競争, 景気, 人口減, 技術陳腐化
英語: threat, risk, competitor, regulation, substitute, price competition, economy, population decline, obsolescence
```

## 出力フォーマット

### SWOT分析テーブル

```markdown
## SWOT分析: {{対象エンティティ名}}

### 内部環境

| Strengths（強み） | Weaknesses（弱み） |
|------------------|-------------------|
| {{抽出された強み1}} | {{抽出された弱み1}} |
| {{抽出された強み2}} | {{抽出された弱み2}} |
| {{抽出された強み3}} | {{抽出された弱み3}} |

### 外部環境

| Opportunities（機会） | Threats（脅威） |
|---------------------|----------------|
| {{抽出された機会1}} | {{抽出された脅威1}} |
| {{抽出された機会2}} | {{抽出された脅威2}} |
| {{抽出された機会3}} | {{抽出された脅威3}} |
```

### クロスSWOT戦略

```markdown
### クロスSWOT戦略

| | Opportunities（機会） | Threats（脅威） |
|---|---------------------|----------------|
| **Strengths（強み）** | **SO戦略（積極攻勢）**<br>{{強み×機会の戦略}} | **ST戦略（差別化）**<br>{{強み×脅威の戦略}} |
| **Weaknesses（弱み）** | **WO戦略（弱点克服）**<br>{{弱み×機会の戦略}} | **WT戦略（防衛・撤退）**<br>{{弱み×脅威の戦略}} |
```

## ⭐ SWOT分析の永続化（v1.26.0 必須）🆕

**SWOT分析完了後、必ず `save_research` を呼び出す:**

```json
{"tool":"save_research","arguments":{
  "content":"SWOTテーブル + クロスSWOT戦略（Markdown形式）",
  "query":"SWOT分析: [対象エンティティ名]",
  "source":"manual"
}}
```

> ⚠️ これにより research/ ディレクトリにSWOT分析結果が保存されます

---

## 品質検証チェックリスト

生成されたSWOT分析は以下の基準で検証してください：

- [ ] 各象限に最低3項目以上の要素が抽出されている
- [ ] 内部環境（S/W）と外部環境（O/T）が明確に区別されている
- [ ] 抽出元の情報ソースが特定可能
- [ ] クロスSWOT戦略が4象限すべてで生成されている
- [ ] 具体的なアクションに繋がる記述になっている

## 使用例

```
@workspace /shikigami-swot-generation

対象: 〇〇大学△△研究室の量子コンピューティング研究
Deep Researchレポート: reports/quantum-computing-research.md

上記のレポートからSWOT分析を生成してください。
```

## 関連プロンプト

- [shikigami-framework-analysis.prompt.md](shikigami-framework-analysis.prompt.md) - フレームワーク選択
- [shikigami-matching-analysis.prompt.md](shikigami-matching-analysis.prompt.md) - マッチング分析
- [shikigami-deep-research.prompt.md](shikigami-deep-research.prompt.md) - Deep Research

---

## 🌟 PwCフレームワーク連携（推奨）

SWOT分析後、以下のPwCフレームワークへの展開を検討してください：

| 分析結果 | 推奨PwC FW | 用途 |
|---------|-----------|------|
| コスト面の弱みが顕著 | **Fit for Growth** | コスト最適化と成長投資の両立 |
| 戦略・ケイパビリティ課題 | **Strategy&** | 戦略とケイパビリティの一貫性構築 |
| DX関連の機会/脅威 | **BXT**, **Digital Maturity** | デジタル変革の統合設計 |
| ESG/社会価値の機会 | **TIMM**, **ESG Integration** | 非財務価値の定量化 |
| リスク・ガバナンス課題 | **Three Lines of Defense** | リスク管理体制強化 |

> 詳細は `frameworks/pwc/` 配下の各フレームワーク定義を参照

---

## トレーサビリティ

| 項目 | 値 |
|------|-----|
| 要件ID | REQ-FW-001-02 |
| 設計ID | DES-SHIKIGAMI-012 |
| タスクID | TSK-P-002 |
