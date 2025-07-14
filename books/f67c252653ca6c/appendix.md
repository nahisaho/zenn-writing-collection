---
title: "付録: 用語集と参考資料"
---

## 用語集

### A

**ARM (Azure Resource Manager)**
Azureリソースのデプロイメントと管理を行うサービス。JSONテンプレート（ARMテンプレート）を使用してインフラストラクチャをコードとして定義できる。

**ARM Template (Azure Resource Manager Template)**
AzureリソースをJSON形式で定義するテンプレート。Infrastructure as Code（IaC）の実装に使用される。

**Azure CLI**
Azureリソースを管理するためのクロスプラットフォーム対応のコマンドラインツール。

**Azure Identity**
Azureサービスへの認証を統一的に処理するライブラリ。DefaultAzureCredentialなどの認証チェーンを提供。

**Azure MCP Server**
Model Context Protocol（MCP）を実装し、AIアプリケーションからAzureリソースへのアクセスを可能にするサーバー実装。

**Azure Monitor**
Azureリソースの監視、診断、ログ収集を行う包括的な監視ソリューション。

**Azure PowerShell**
PowerShellコマンドレットを使用してAzureリソースを管理するツール。

### D

**DefaultAzureCredential**
Azure Identity ライブラリが提供する認証クラス。複数の認証方法を順次試行して、利用可能な認証情報を自動的に選択する。

### G

**GitHub Copilot**
GitHubが開発したAI搭載のコーディング支援ツール。VS Codeの拡張機能として提供されるAgent Modeでは、MCPサーバーとの連携が可能。

### J

**JSON-RPC 2.0**
JSONを使用したリモートプロシージャコール（RPC）プロトコル。MCPの通信基盤として使用される。

### K

**KQL (Kusto Query Language)**
Azure Monitor、Azure Data Explorer、Microsoft Sentinelなどで使用される強力なクエリ言語。

### M

**MCP (Model Context Protocol)**
AIモデルと外部ツール、メモリ、コンテキストとの安全で構造化された相互作用を管理するオープンプロトコル。

**MCP Client**
MCPプロトコルを使用してMCPサーバーに接続し、ツールやリソースにアクセスするクライアント実装。

**MCP Host**
MCPクライアントを使用してMCPサーバーに接続し、データを消費するアプリケーション（例：VS Code）。

**MCP Server**
MCPプロトコルに従って、ツール、リソース、プロンプトなどの機能を提供する軽量なプログラム。

**Microsoft Entra ID (旧Azure Active Directory)**
Microsoftのクラウドベースのアイデンティティおよびアクセス管理サービス。

### O

**OpenAI Agents SDK**
OpenAIが提供する、AIエージェントを構築するためのソフトウェア開発キット。MCPサポートを含む。

### R

**RBAC (Role-Based Access Control)**
ロールベースのアクセス制御。Azureでユーザーやアプリケーションに対してきめ細かい権限管理を提供する仕組み。

**Resource Group**
関連するAzureリソースを論理的にグループ化する単位。リソースの管理、監視、課金、アクセス制御の境界として機能。

### S

**Semantic Kernel**
Microsoftが開発したAIオーケストレーションSDK。さまざまなAIサービスやプラグインを統合してAIアプリケーションを構築できる。

**Server-Sent Events (SSE)**
サーバーからクライアントへの一方向のリアルタイム通信を可能にするWeb標準技術。MCPのトランスポート層として使用される。

**Service Principal**
Azureにおいて、アプリケーションやサービスが他のリソースにアクセスするためのアイデンティティ。

### V

**Visual Studio Code (VS Code)**
Microsoftが開発したオープンソースのコードエディタ。豊富な拡張機能エコシステムを持つ。

## 参考資料とURL

### 公式ドキュメント

#### Azure MCP Server
- [Azure MCP Server 概要](https://learn.microsoft.com/en-us/azure/developer/azure-mcp-server/)
- [Azure MCP Server 利用可能ツール](https://learn.microsoft.com/en-us/azure/developer/azure-mcp-server/tools/)
- [Azure MCP Server GitHub リポジトリ](https://github.com/Azure/azure-mcp)

#### Model Context Protocol
- [MCP 公式サイト](https://modelcontextprotocol.io/)
- [MCP 仕様書](https://modelcontextprotocol.io/specification/)
- [MCP GitHub リポジトリ](https://github.com/modelcontextprotocol)
- [MCP ドキュメント](https://modelcontextprotocol.io/docs/)

#### Microsoft Azure
- [Azure 公式ドキュメント](https://docs.microsoft.com/azure/)
- [Azure CLI ドキュメント](https://docs.microsoft.com/cli/azure/)
- [Azure PowerShell ドキュメント](https://docs.microsoft.com/powershell/azure/)
- [Azure Identity ライブラリ](https://docs.microsoft.com/dotnet/api/overview/azure/identity-readme)

### 開発者リソース

#### GitHub Copilot と MCP
- [VS Code での MCP サーバー使用](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)
- [Visual Studio での MCP サーバー使用](https://learn.microsoft.com/visualstudio/ide/mcp-servers)

#### Semantic Kernel
- [Semantic Kernel 公式サイト](https://learn.microsoft.com/semantic-kernel/)
- [Semantic Kernel での MCP プラグイン追加](https://learn.microsoft.com/semantic-kernel/concepts/plugins/adding-mcp-plugins)

#### .NET と MCP
- [.NET AI と Model Context Protocol](https://learn.microsoft.com/dotnet/ai/get-started-mcp)
- [MCP C# SDK](https://github.com/modelcontextprotocol/csharp-sdk)

### ブログとニュース

#### Microsoft 公式ブログ
- [Azure での Model Context Protocol を使用したエージェント構築](https://learn.microsoft.com/azure/developer/ai/intro-agents-mcp)
- [Microsoft が Anthropic と提携して C# SDK を作成](https://devblogs.microsoft.com/blog/microsoft-partners-with-anthropic-to-create-official-c-sdk-for-model-context-protocol)
- [C# で MCP サーバーを構築](https://devblogs.microsoft.com/dotnet/build-a-model-context-protocol-mcp-server-in-csharp/)
- [Azure Functions でリモート MCP サーバーを構築](https://devblogs.microsoft.com/dotnet/build-mcp-remote-servers-with-azure-functions/)

### コミュニティリソース

#### GitHub リポジトリ
- [MCP サーバー公式リポジトリ](https://github.com/modelcontextprotocol/servers)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

#### サンプルとテンプレート
- [OpenAI MCP Agent Building Block](https://aka.ms/mcp/openai)
- [MCP Container App Building Block](https://aka.ms/mcp/aca)
- [リモート MCP Functions サンプル](https://aka.ms/cadotnet/mcp/functions/remote-sample)

### ツールとユーティリティ

#### MCP 開発支援ツール
- [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)
- [MCP デバッガー](https://modelcontextprotocol.io/docs/tools/debugging)

#### Azure 管理ツール
- [Azure Portal](https://portal.azure.com/)
- [Azure Cloud Shell](https://shell.azure.com/)
- [Azure Mobile App](https://azure.microsoft.com/features/azure-portal/mobile-app/)

### API リファレンス

#### Azure REST API
- [Azure REST API リファレンス](https://docs.microsoft.com/rest/api/azure/)
- [Azure Resource Manager REST API](https://docs.microsoft.com/rest/api/resources/)

#### MCP API
- [MCP 仕様 - API リファレンス](https://modelcontextprotocol.io/specification/2025-03-26)

### 学習リソース

#### Microsoft Learn
- [Azure 基礎](https://docs.microsoft.com/learn/paths/azure-fundamentals/)
- [Azure AI 基礎](https://docs.microsoft.com/learn/paths/get-started-with-artificial-intelligence-on-azure/)
- [Azure CLI を使い始める](https://docs.microsoft.com/learn/modules/control-azure-services-with-cli/)

#### その他の学習プラットフォーム
- [Azure アーキテクチャセンター](https://docs.microsoft.com/azure/architecture/)
- [Azure サンプルコード](https://github.com/Azure-Samples)

### コンプライアンスとセキュリティ

#### Azure セキュリティ
- [Azure セキュリティドキュメント](https://docs.microsoft.com/azure/security/)
- [Azure セキュリティベンチマーク](https://docs.microsoft.com/security/benchmark/azure/)
- [Azure Well-Architected Framework](https://docs.microsoft.com/azure/architecture/framework/)

### サポートとコミュニティ

#### 公式サポート
- [Azure サポート](https://azure.microsoft.com/support/)
- [Microsoft Q&A](https://docs.microsoft.com/answers/topics/azure.html)

#### コミュニティフォーラム
- [Azure コミュニティ](https://techcommunity.microsoft.com/azure)
- [Stack Overflow - Azure タグ](https://stackoverflow.com/questions/tagged/azure)
- [Reddit - Azure コミュニティ](https://www.reddit.com/r/AZURE/)

### 最新情報とアップデート

#### ニュースとアップデート
- [Azure Updates](https://azure.microsoft.com/updates/)
- [Azure ブログ](https://azure.microsoft.com/blog/)
- [Microsoft Tech Community](https://techcommunity.microsoft.com/)

### 注意事項

本付録に記載されているURLやリソースは、執筆時点（2024年6月）での情報です。URLの変更やサービスの廃止により、一部のリンクが無効になる可能性があります。最新の情報については、各公式サイトでご確認ください。

また、本書で説明している機能の多くは概念的なものであり、実際のAzure MCP Serverの実装とは異なる場合があります。実装前には必ず公式ドキュメントで最新の機能と制限をご確認ください。