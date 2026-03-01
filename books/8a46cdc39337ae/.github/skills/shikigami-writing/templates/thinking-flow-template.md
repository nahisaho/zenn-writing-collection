# 思考フロートラッキング テンプレート

このテンプレートはレポート生成時に思考の流れを自動記録するためのものです。

---

## 🧭 思考フロー・トラッカー

### フォーマット

各思考ステップを以下の形式で記録:

```yaml
thinking_flow:
  project_id: "pjXXXXX"
  started_at: "YYYY-MM-DD HH:MM"
  completed_at: "YYYY-MM-DD HH:MM"
  
  steps:
    - id: 1
      type: "purpose_discovery"
      timestamp: "YYYY-MM-DD HH:MM:SS"
      input: "ユーザーの質問・要求"
      reasoning: "なぜこの判断をしたか"
      output: "このステップの結果"
      confidence: 0.85
      sources: []
      duration_sec: 120
      
    - id: 2
      type: "hypothesis_generation"
      # ...
```

---

## 📊 思考フロー可視化セクション（レポート用）

レポートに挿入する形式:

```markdown
## 📐 思考フロー・トレース

> このレポートはどのような思考プロセスを経て作成されたかを示します。

### 🗺️ フローマップ

\`\`\`mermaid
flowchart TB
    subgraph Phase0["Phase 0: 初期化"]
        A[🚀 プロジェクト初期化]
    end
    
    subgraph Phase1["Phase 1: 目的探索"]
        B[🎯 目的探索]
        C[💡 仮説生成]
        D[📋 計画立案]
    end
    
    subgraph Phase2["Phase 2: Deep Research"]
        E[🧠 Think #1]
        F[🔍 Search]
        G[📖 Visit]
        H[✅ Verify]
        I[📄 Report更新]
    end
    
    subgraph Phase3["Phase 3: 分析"]
        J[🔧 フレームワーク選択]
        K[📊 フレームワーク分析]
        L[💎 洞察抽出]
    end
    
    subgraph Phase4["Phase 4: レポート"]
        M[🏗️ 構成設計]
        N[✍️ コンテンツ生成]
        O[🔬 品質検証]
        P[📚 引用整形]
        Q[🎉 完成]
    end
    
    A --> B --> C --> D --> E
    E --> F --> I
    E --> G --> I
    E --> H --> I
    I -->|"十分"| J
    I -->|"不十分"| E
    J --> K --> L --> M
    M --> N --> O
    O -->|"OK"| P --> Q
    O -->|"修正"| N
    
    classDef completed fill:#10b981,stroke:#059669,color:#fff
    classDef current fill:#3b82f6,stroke:#2563eb,color:#fff
    classDef pending fill:#e5e7eb,stroke:#9ca3af
    
    class A,B,C,D,E,F,G,H,I,J,K,L completed
    class M,N current
    class O,P,Q pending
\`\`\`

### 📜 思考ログ

| # | 時刻 | ステップ | 判断内容 | 信頼度 |
|---|------|---------|---------|--------|
| 1 | 10:00 | 🎯 目的探索 | JTBDで「業務効率化」が真のゴールと判明 | ⭐⭐⭐⭐ |
| 2 | 10:15 | 💡 仮説生成 | 「ツールAが最適」という初期仮説を設定 | ⭐⭐⭐ |
| 3 | 10:30 | 🔍 検索 | 「ツールA 比較 2026」で検索、10件取得 | - |
| 4 | 10:45 | 🧠 Think | 仮説と矛盾するデータ発見、仮説を修正 | ⭐⭐⭐⭐ |
| 5 | 11:00 | ✅ 検証 | 3ソースで価格情報を交差検証 | ⭐⭐⭐⭐⭐ |

### 🔀 重要な判断ポイント

| ポイント | 判断 | 理由 |
|---------|------|------|
| **仮説修正** | ツールA → ツールB | 価格差が想定の2倍、ROI見込みが逆転 |
| **追加調査** | セキュリティ機能 | 顧客要件の優先度が高いと判明 |
| **フレームワーク選択** | SWOT + TCO分析 | 競合比較と費用対効果の両面が必要 |

### 📈 思考メトリクス

| 指標 | 値 | 評価 |
|------|-----|------|
| 調査ラウンド数 | 5 | ✅ 適切（3-7が目安） |
| 交差検証率 | 78% | ✅ 良好（70%以上が目標） |
| ソース多様性 | 12ドメイン | ✅ 良好 |
| 仮説修正回数 | 2 | ✅ 柔軟な思考 |
| デッドエンド | 1 | 📝 「ツールC調査→中止」 |
```

---

## 🔧 実装ガイド

### ステップ記録タイミング

| イベント | 記録する内容 |
|---------|-------------|
| Phase開始 | タイムスタンプ、インプット |
| 判断実施 | reasoning、confidence、代替案 |
| ツール使用 | ツール名、パラメータ、結果サマリー |
| 仮説変更 | 変更前/後、変更理由 |
| Phase完了 | アウトプット、次ステップ |

### confidence（信頼度）の基準

| 値 | 星 | 意味 |
|----|-----|------|
| 0.9-1.0 | ⭐⭐⭐⭐⭐ | 複数信頼ソース、矛盾なし |
| 0.7-0.9 | ⭐⭐⭐⭐ | 2+ソース、軽微な矛盾 |
| 0.5-0.7 | ⭐⭐⭐ | 単一ソース or 一部未確認 |
| 0.3-0.5 | ⭐⭐ | 推定・仮説段階 |
| 0.0-0.3 | ⭐ | 情報不足、要追加調査 |
