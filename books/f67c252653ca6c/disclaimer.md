---
title: "免責事項と実際の機能について"
---

## 🚨 重要な免責事項

### 本書の内容について

本書「Azure MCP Server 操作ガイド - MCPを使ったAzureリソース管理の実践」は、**教育的・概念的なコンテンツ**として、Azure MCP Serverの将来的な可能性とModel Context Protocolの理想的な活用シナリオを示すものです。

### 実際の機能との相違

**本書の内容の大部分は、現在のAzure MCP Server（2024年12月時点）では実装されていない機能です。**

#### 現在実際に利用可能な機能
- リソースグループの一覧表示
- Azure Storage（アカウント、コンテナ、Blob、テーブル）の操作
- Azure Cosmos DB（アカウント、データベース、コンテナ、ドキュメント）の操作
- Azure Database for PostgreSQL の管理
- Azure AI Search の操作
- Azure Monitor のログ・メトリクス クエリ
- Azure Service Bus の操作
- Azure Key Vault キーの管理
- Azure App Configuration の設定管理
- Azure Data Explorer の操作
- Azure CLI コマンドの実行

#### 本書で説明しているが現在未実装の機能
- 仮想マシンの作成・削除・詳細管理
- ネットワークリソース（VNet、NSG、ロードバランサー等）の管理
- ARMテンプレートの生成・デプロイ・管理
- 高度なコスト管理・分析機能
- 包括的なセキュリティ設定・管理
- 自動スケーリング設定
- 災害復旧（DR）機能
- 包括的な監視・アラート設定
- 本書の第4章〜第7章で説明している高度な機能の大部分

#### クライアント環境の相違
- **本書記載**: Claude Desktop連携
- **実際**: GitHub Copilot agent mode（VS Code）、OpenAI Agents SDK、Semantic Kernel、カスタム.NET/Pythonクライアント

### 認証方式の相違
- **本書記載**: 複数の認証方式（サービスプリンシパル、マネージドID等）
- **実際**: DefaultAzureCredential（Azure CLI、Azure PowerShell、Azure Developer CLI、Visual Studioでのログイン）

### 免責事項

1. **動作保証**: 本書の内容は将来的な可能性を示すものであり、現在の環境での動作は保証されません
2. **データ損失リスク**: 本書の手順を試行する際は、必ず検証環境で実施してください
3. **責任の所在**: 本書の内容に起因する損害について、著者は一切の責任を負いません

### 最新情報の確認

Azure MCP Serverの実際の機能については、必ず以下の公式情報源でご確認ください：

- [Microsoft Learn - Azure MCP Server](https://learn.microsoft.com/en-us/azure/developer/azure-mcp-server/)
- [Azure MCP Server GitHub](https://github.com/Azure/azure-mcp)
- [Model Context Protocol 公式サイト](https://modelcontextprotocol.io/)

### 本書の価値

本書は現在の実装状況と乖離していますが、以下の価値を提供します：

1. **概念理解**: MCPとAIを活用したクラウド管理の概念理解
2. **将来展望**: Azure MCP Serverが将来実現する可能性のある機能の理解
3. **設計思想**: AI支援によるインフラ管理の理想的なアプローチの学習
4. **準備**: 将来的な機能拡張に向けた知識の準備

本書は、Azure MCP Serverの現在よりも「あるべき姿」「目指すべき方向性」を示すビジョナリーなコンテンツとしてお読みください。