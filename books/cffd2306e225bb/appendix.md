---
title: "付録: 参考文献・リソース集"
---

## AI-Tool Interaction Protocol

> **出典**: [ToolUniverse Documentation — AI-Tool Interaction Protocol](https://zitniklab.hms.harvard.edu/ToolUniverse/guide/interaction_protocol.html)

### 概要

HTTPがWeb上のクライアント・サーバー間通信を標準化したように、ToolUniverseの**AI-Tool Interaction Protocol**はAIモデルと科学ツールの間のやりとりを標準化するプロトコルです。1,000以上の異種ツール（機械学習モデル、データベース、API、ロボティクスシステムなど）を統一的なインターフェイスの背後に抽象化します。

```
┌─────────────────┐
│   AI Model      │ ← LLM、Agent、推論モデル
│ (GPT, Claude,   │   (GitHub Copilotなど)
│  Gemini, etc.)  │
└─────────┬───────┘
          │ AI-Tool Interaction Protocol
          │
┌─────────▼───────┐
│  ToolUniverse   │ ← プロトコル実装レイヤー
│   Ecosystem     │
└─────────┬───────┘
          │
┌─────────▼───────┐
│  1,000+ Tools   │ ← MLモデル、API、データベース等
│ (Heterogeneous  │   (バックエンドの違いを吸収)
│   Backends)     │
└─────────────────┘
```

### プロトコルの3要素

AI-Tool Interaction Protocolは、以下の3つの要素で構成されます。

#### 1. Tool Specification Schema（ツール仕様スキーマ）

ToolUniverse上のすべてのツールは、標準化された仕様で自らを公開します。

```json
{
    "name": "UniProt_get_entry_by_accession",
    "description": "Get complete JSON entry for a UniProtKB accession",
    "parameters": {
        "type": "object",
        "properties": {
            "accession": {
                "type": "string",
                "description": "UniProtKB accession (e.g., P05067)",
                "required": true
            }
        }
    },
    "return_schema": {
        "type": "object",
        "description": "Complete UniProtKB entry with protein information"
    }
}
```

各フィールドの役割は以下のとおりです。

| フィールド | 役割 |
| ---- | ---- |
| `name` | `Database_action_description`形式のツール識別子 |
| `description` | ツールの目的と機能の説明 |
| `parameters` | 引数の型・必須/任意・説明を含む詳細な仕様 |
| `return_schema` | 出力データの構造定義 |

#### 2. Interaction Schema（インタラクションスキーマ）

すべてのツール呼び出しは、統一されたリクエスト形式に従います。

```json
{
    "name": "Tool_identifier",
    "arguments": {
        "parameter1": "value1",
        "parameter2": "value2"
    }
}
```

バックエンドがREST API、GraphQL、MLモデルのいずれであっても、AIモデルからのリクエスト形式は同一です。以下に具体例を示します。

```python
# タンパク質情報の取得（REST API: UniProt）
{"name": "UniProt_get_entry_by_accession", "arguments": {"accession": "P05067"}}

# 薬物安全性の分析（データベース: FAERS）
{"name": "FAERS_count_reactions_by_drug_event", "arguments": {"medicinalproduct": "aspirin"}}

# MLモデルによるドッキング予測（機械学習: Boltz-2）
{"name": "boltz2_docking", "arguments": {"protein_id": "1ABC", "ligand_smiles": "CCO"}}
```

#### 3. Communication Methods（通信方式）

プロトコルは2つの通信方式をサポートします。

**ローカル通信（Python）**:

```python
from tooluniverse import ToolUniverse

tu = ToolUniverse()
tu.load_tools()

# 統一インターフェイスで直接実行
result = tu.run({
    "name": "OpenTargets_get_associated_targets_by_disease_efoId",
    "arguments": {"efoId": "EFO_0000537"}  # hypertension
})
```

**リモート通信（MCP）**:

```bash
# MCPサーバーを起動
tooluniverse-smcp --port 8000

# Claude、GitHub Copilot等のAIアシスタントがMCP経由で接続
# → ToolUniverse上のすべてのツールが利用可能に
```

本書で解説するGitHub Copilotとの連携では、主にこのMCP方式を使用します。

### コアオペレーション

プロトコルは2つの基本操作を定義しています。

#### Find Tool（ツール発見）

自然言語クエリから関連ツールを検索します。3種類の検索方式が利用可能です。

| 検索方式 | 特徴 |
| ---- | ---- |
| Keyword Search | TF-IDFベースの高速マッチング |
| LLM-based Search | 複雑なクエリに対する文脈推論 |
| Embedding Search | ファインチューニング済みモデルによるセマンティック類似度 |

```python
# AIモデルがツールを発見する例
query = "predict protein binding affinity"

# プロトコルが関連ツールを返す
tools_found = [
    "boltz2_docking",
    "ADMETAI_predict_properties",
    "ChEMBL_search_similar_molecules"
]
```

#### Call Tool（ツール実行）

選択したツールを指定引数で実行し、構造化された結果を受け取ります。

```python
# ツール実行
result = tu.run({
    "name": "boltz2_docking",
    "arguments": {
        "protein_id": "P05067",
        "ligand_smiles": "CC(=O)OC1=CC=CC=C1C(=O)O"
    }
})

# 一貫した構造のレスポンス
{
    "binding_affinity": -8.2,
    "binding_probability": 0.85,
    "confidence_score": 0.92,
    "metadata": {
        "model_version": "boltz-2",
        "execution_time": "2.3s"
    }
}
```

### Tool Types — バックエンド抽象化

プロトコルの最大の利点は、異なるバックエンドを同一のインターフェイスで扱える点です。以下の4種類のバックエンドを透過的に抽象化します。

| バックエンド種別 | 例 | リクエスト形式 |
| ---- | ---- | ---- |
| 機械学習モデル | Boltz-2（ドッキング予測）、ADMETAI（ADMET特性予測） | `{"name": "boltz2_docking", "arguments": {...}}` |
| データベースAPI | UniProt（REST）、OpenTargets（GraphQL） | `{"name": "UniProt_get_entry_by_accession", "arguments": {...}}` |
| 科学パッケージ | BioPython、Enrichr | `{"name": "Enrichr_analyze_gene_list", "arguments": {...}}` |
| AIエージェント | 文献レビュー、仮説生成 | `{"name": "conduct_literature_review_and_summarize", "arguments": {...}}` |

### エラーハンドリングとバリデーション

プロトコルには入力バリデーションと構造化されたエラーレスポンスが組み込まれています。

```python
# 不正な入力の例
{"name": "UniProt_get_entry_by_accession", "arguments": {"accession": "INVALID_ID"}}

# 構造化されたエラーレスポンス
{
    "status": "error",
    "error_type": "ValidationError",
    "message": "Invalid UniProt accession format",
    "details": {
        "parameter": "accession",
        "expected_format": "P12345 or Q9Y261",
        "received": "INVALID_ID"
    }
}
```

### プロトコル拡張

#### Tool Composition（ツール合成）

複数のツールをチェーンして複雑なワークフローを構築できます。

```python
# 合成ワークフローの例
workflow = {
    "name": "drug_discovery_pipeline",
    "arguments": {
        "disease": "hypercholesterolemia",
        "steps": [
            "target_identification",
            "compound_screening",
            "ADMET_prediction",
            "patent_analysis"
        ]
    }
}
```

#### Human-in-the-Loop（専門家フィードバック統合）

プロトコルを通じて研究者の専門知識をワークフローに組み込めます。

```python
# 専門家への相談リクエスト
{
    "name": "consult_human_expert",
    "arguments": {
        "question": "Which HMG-CoA reductase inhibitor shows best safety profile?",
        "context": {"compounds": ["lovastatin", "pravastatin", "simvastatin"]},
        "expertise_required": "pharmacology"
    }
}
```

#### Remote Tool Integration（リモートツール統合）

MCPベースで外部ツールサーバーを登録し、プロトコルに統合できます。

```python
# 外部MCPサーバーのツールを登録
{
    "name": "register_mcp_tools",
    "arguments": {
        "server_url": "mcp://expert-system.company.com:8080",
        "tool_categories": ["proprietary_ml_models", "private_databases"]
    }
}
```

### プロトコルの利点

**AI開発者にとって**:
- 1,000以上のツールに対する単一インターフェイス
- ツール固有の統合作業が不要
- 自動エラーハンドリングとバリデーション
- 一貫したレスポンス形式

**科学者にとって**:
- 技術的実装ではなく研究ロジックに集中できる
- ツール間で再現可能なワークフロー
- 容易なツール発見と実験
- 必要時の専門家フィードバック統合

**ツール開発者にとって**:
- 機能公開の標準化された方法
- 自動的なAI互換性
- 組み込みのドキュメントとバリデーション
- コミュニティでの発見可能性

### 実装コンポーネント

プロトコルはToolUniverseの以下のコアコンポーネントによって実装されています。

| コンポーネント | 役割 |
| ---- | ---- |
| Tool Registry | ツール名を実装クラスにマッピング |
| Tool Caller | プロトコルの解析と実行を処理 |
| Tool Finder | 3種類の発見戦略を実装 |
| Tool Manager | ローカル/リモートのツール登録を管理 |
| Validation Engine | リクエスト/レスポンスのプロトコル準拠を保証 |

:::message
本プロトコルの詳細な実装については第3章（Agent Skills・MCP Server開発）で、GitHub CopilotのMCPサーバー経由でToolUniverseを利用する方法については第4章以降で実際のコードとともに解説します。
:::
