---
title: "第3章: 基本的なAzureリソース操作"
---

## はじめに

この章では、Azure MCP Serverを使用した基本的なAzureリソースの操作方法を学びます。リソースグループ、ストレージアカウントなど、現在利用可能なリソースの操作手順を、実践的な例を交えて解説します。

> **重要**: この章で説明する機能の多くは、将来的な実装を想定した概念的な内容です。現在のAzure MCP Serverで実際に利用可能な機能は限定されています。実際の操作については、Microsoft Learn公式ドキュメントでご確認ください。

**現在実際に利用可能な主要な操作**：
- リソースグループの一覧表示
- Azure Storageの操作（アカウント、コンテナ、Blob、テーブル）
- Azure Cosmos DBの操作
- Azure Monitor クエリ
- Azure AI Search操作

## リソースグループの管理

リソースグループは、Azureリソースを論理的にまとめる単位です。すべてのAzureリソースは必ずいずれかのリソースグループに属している必要があります。

### リソースグループの作成

```
ユーザー: 開発環境用のリソースグループを東日本リージョンに作成して

AIアシスタント: 開発環境用のリソースグループを作成します。

実行コマンド:
@azure create resource group "dev-environment-rg" --location "japaneast" --tags "environment=development" "project=webapp"

結果:
✓ リソースグループ 'dev-environment-rg' を作成しました
  - 場所: 東日本
  - タグ: environment=development, project=webapp
```

### リソースグループの一覧表示

```
ユーザー: 現在のサブスクリプションにあるリソースグループを表示して

AIアシスタント: リソースグループの一覧を取得します。

実行コマンド:
@azure list resource groups

結果:
| 名前                  | 場所     | 状態      | タグ                    |
|---------------------|----------|-----------|------------------------|
| dev-environment-rg  | japaneast| Succeeded | environment=development|
| prod-webapp-rg      | japaneast| Succeeded | environment=production |
| test-resources-rg   | westus2  | Succeeded | environment=test       |
```

### リソースグループの詳細表示

```
ユーザー: dev-environment-rgの詳細を見せて

AIアシスタント: リソースグループの詳細情報を取得します。

実行コマンド:
@azure show resource group "dev-environment-rg"

結果:
リソースグループ: dev-environment-rg
- ID: /subscriptions/xxx/resourceGroups/dev-environment-rg
- 場所: japaneast
- プロビジョニング状態: Succeeded
- タグ:
  - environment: development
  - project: webapp
- リソース数: 0
- 作成日時: 2024-01-15 10:30:00 UTC
```

### タグの管理

```
ユーザー: dev-environment-rgにコスト管理用のタグを追加して

AIアシスタント: コスト管理用のタグを追加します。

実行コマンド:
@azure update resource group "dev-environment-rg" --add-tags "cost-center=IT-001" "owner=dev-team"

結果:
✓ タグを追加しました
現在のタグ:
- environment: development
- project: webapp
- cost-center: IT-001
- owner: dev-team
```

### リソースグループの削除

```
ユーザー: test-resources-rgとその中のすべてのリソースを削除して

AIアシスタント: ⚠️ 警告: リソースグループを削除すると、その中のすべてのリソースも削除されます。

実行前の確認:
- リソースグループ: test-resources-rg
- 含まれるリソース: 3個（VM x1, ストレージ x1, ネットワーク x1）

続行しますか？ (yes/no): yes

実行コマンド:
@azure delete resource group "test-resources-rg" --yes

結果:
✓ リソースグループ 'test-resources-rg' とすべてのリソースを削除しました
削除完了時刻: 2024-01-15 11:45:32 UTC
```

## 仮想マシンの作成と管理

### 基本的なVMの作成

```
ユーザー: Ubuntu 20.04のVMを作成して。サイズはB2s、SSHキー認証で

AIアシスタント: Ubuntu 20.04 VMを作成します。まず、SSHキーペアを生成します。

実行コマンド:
@azure create vm "dev-ubuntu-vm" 
  --resource-group "dev-environment-rg"
  --image "UbuntuLTS"
  --size "Standard_B2s"
  --admin-username "azureuser"
  --generate-ssh-keys
  --public-ip-sku "Basic"

結果:
✓ 仮想マシンを作成しました
- 名前: dev-ubuntu-vm
- サイズ: Standard_B2s (2 vCPUs, 4 GB RAM)
- OS: Ubuntu 20.04 LTS
- パブリックIP: 20.78.xx.xx
- SSH接続: ssh azureuser@20.78.xx.xx
- SSHキー: ~/.ssh/id_rsa に保存
```

### VMの詳細情報取得

```
ユーザー: dev-ubuntu-vmの詳細情報を表示して

AIアシスタント: VMの詳細情報を取得します。

実行コマンド:
@azure show vm "dev-ubuntu-vm" --resource-group "dev-environment-rg"

結果:
仮想マシン: dev-ubuntu-vm
基本情報:
- 状態: Running
- サイズ: Standard_B2s
- OS: Ubuntu 20.04.6 LTS
- 場所: japaneast

ネットワーク:
- プライベートIP: 10.0.0.4
- パブリックIP: 20.78.xx.xx
- 仮想ネットワーク: dev-environment-rg-vnet
- サブネット: default

ディスク:
- OSディスク: 30GB (Premium SSD)
- データディスク: なし

パフォーマンス:
- CPU使用率: 15%
- メモリ使用率: 45%
- ネットワーク入力: 1.2 MB/s
- ネットワーク出力: 0.8 MB/s
```

### VMの起動・停止・再起動

```
ユーザー: dev-ubuntu-vmを停止して

AIアシスタント: VMを停止します（割り当て解除）。

実行コマンド:
@azure stop vm "dev-ubuntu-vm" --resource-group "dev-environment-rg"

結果:
✓ VMを停止しました
- 停止時刻: 2024-01-15 12:00:00 UTC
- 状態: Stopped (deallocated)
- 課金: 停止中（コンピューティング料金は発生しません）
```

```
ユーザー: dev-ubuntu-vmを起動して

AIアシスタント: VMを起動します。

実行コマンド:
@azure start vm "dev-ubuntu-vm" --resource-group "dev-environment-rg"

結果:
✓ VMを起動しました
- 起動時刻: 2024-01-15 12:05:00 UTC
- 状態: Running
- パブリックIP: 20.78.xx.xx（変更なし）
```

### VMのサイズ変更

```
ユーザー: dev-ubuntu-vmをもう少し性能の良いものにアップグレードして

AIアシスタント: 現在のVMサイズと利用可能なアップグレードオプションを確認します。

現在: Standard_B2s (2 vCPUs, 4 GB RAM)

推奨アップグレードオプション:
1. Standard_B2ms (2 vCPUs, 8 GB RAM) - メモリ増強
2. Standard_B4ms (4 vCPUs, 16 GB RAM) - CPU/メモリ増強
3. Standard_D2s_v3 (2 vCPUs, 8 GB RAM) - より高性能

どのサイズにアップグレードしますか？

ユーザー: 2番のB4msで

AIアシスタント: VMをStandard_B4msにリサイズします。VMは一時的に再起動されます。

実行コマンド:
@azure resize vm "dev-ubuntu-vm" 
  --resource-group "dev-environment-rg" 
  --size "Standard_B4ms"

結果:
✓ VMのサイズを変更しました
- 旧サイズ: Standard_B2s
- 新サイズ: Standard_B4ms (4 vCPUs, 16 GB RAM)
- ダウンタイム: 約3分
- 月額料金見込み: ¥5,600 → ¥11,200
```

## ストレージアカウントの操作

### ストレージアカウントの作成

```
ユーザー: 開発環境用のストレージアカウントを作成して

AIアシスタント: 開発環境用のストレージアカウントを作成します。

実行コマンド:
@azure create storage account "devstorageacct2024"
  --resource-group "dev-environment-rg"
  --sku "Standard_LRS"
  --kind "StorageV2"
  --access-tier "Hot"

結果:
✓ ストレージアカウントを作成しました
- 名前: devstorageacct2024
- 種類: StorageV2 (汎用 v2)
- レプリケーション: LRS (ローカル冗長)
- アクセス層: ホット
- プライマリエンドポイント:
  - Blob: https://devstorageacct2024.blob.core.windows.net/
  - File: https://devstorageacct2024.file.core.windows.net/
  - Queue: https://devstorageacct2024.queue.core.windows.net/
  - Table: https://devstorageacct2024.table.core.windows.net/
```

### Blobコンテナーの作成と管理

```
ユーザー: アプリケーションのログを保存するためのコンテナーを作成して

AIアシスタント: ログ保存用のBlobコンテナーを作成します。

実行コマンド:
@azure create storage container "app-logs"
  --account-name "devstorageacct2024"
  --public-access "off"

結果:
✓ Blobコンテナーを作成しました
- コンテナー名: app-logs
- パブリックアクセス: 無効（プライベート）
- URL: https://devstorageacct2024.blob.core.windows.net/app-logs
```

### ファイルのアップロード

```
ユーザー: ローカルのログファイルをアップロードしたい

AIアシスタント: ログファイルをBlobストレージにアップロードする方法を説明します。

実行例:
@azure upload blob "/path/to/app.log"
  --container "app-logs"
  --account-name "devstorageacct2024"
  --blob-name "2024-01-15/app.log"

アップロード可能なオプション:
- 単一ファイル
- ディレクトリ全体（再帰的）
- パターンマッチング（*.log など）

アップロードするファイルのパスを教えてください。
```

### アクセスキーとSASトークンの管理

```
ユーザー: アプリケーションからストレージにアクセスするための接続文字列を取得して

AIアシスタント: ストレージアカウントの接続文字列を取得します。

実行コマンド:
@azure show storage connection-string
  --account-name "devstorageacct2024"

結果:
接続文字列:
DefaultEndpointsProtocol=https;AccountName=devstorageacct2024;AccountKey=xxx...xxx;EndpointSuffix=core.windows.net

⚠️ セキュリティ注意事項:
- この接続文字列は秘密情報です
- ソースコードにハードコードしないでください
- Azure Key VaultやApp Configurationの使用を推奨します

より安全な方法としてSASトークンの使用も可能です。必要でしょうか？
```

## ネットワークリソースの管理

### 仮想ネットワークの作成

```
ユーザー: アプリケーション用の仮想ネットワークを作成して

AIアシスタント: アプリケーション用の仮想ネットワークを作成します。

実行コマンド:
@azure create vnet "app-vnet"
  --resource-group "dev-environment-rg"
  --address-prefix "10.1.0.0/16"
  --subnet-name "app-subnet"
  --subnet-prefix "10.1.1.0/24"

結果:
✓ 仮想ネットワークを作成しました
- 名前: app-vnet
- アドレス空間: 10.1.0.0/16 (65,536 アドレス)
- サブネット:
  - 名前: app-subnet
  - アドレス範囲: 10.1.1.0/24 (256 アドレス)
  - 利用可能アドレス: 251
```

### ネットワークセキュリティグループ（NSG）の作成と設定

```
ユーザー: Webアプリケーション用のセキュリティグループを作成して、HTTPとHTTPSのみ許可

AIアシスタント: WebアプリケーションのNSGを作成し、必要なルールを設定します。

実行コマンド:
@azure create nsg "webapp-nsg"
  --resource-group "dev-environment-rg"

@azure add nsg rule "webapp-nsg"
  --name "Allow-HTTP"
  --priority 100
  --source "*"
  --destination "*"
  --port 80
  --protocol "Tcp"
  --access "Allow"
  --direction "Inbound"

@azure add nsg rule "webapp-nsg"
  --name "Allow-HTTPS"
  --priority 110
  --source "*"
  --destination "*"
  --port 443
  --protocol "Tcp"
  --access "Allow"
  --direction "Inbound"

結果:
✓ NSGを作成し、ルールを追加しました
セキュリティルール:
| 優先度 | 名前         | ソース | 宛先 | ポート | プロトコル | アクション |
|-------|-------------|--------|------|--------|-----------|----------|
| 100   | Allow-HTTP  | *      | *    | 80     | TCP       | 許可     |
| 110   | Allow-HTTPS | *      | *    | 443    | TCP       | 許可     |
| 65000 | AllowVnet   | VNet   | VNet | *      | *         | 許可     |
| 65001 | AllowAzure  | Azure  | *    | *      | *         | 許可     |
| 65500 | DenyAll     | *      | *    | *      | *         | 拒否     |
```

### パブリックIPアドレスの作成と割り当て

```
ユーザー: 静的なパブリックIPアドレスを作成して

AIアシスタント: 静的パブリックIPアドレスを作成します。

実行コマンド:
@azure create public-ip "webapp-public-ip"
  --resource-group "dev-environment-rg"
  --allocation-method "Static"
  --sku "Standard"
  --zone "1,2,3"

結果:
✓ パブリックIPアドレスを作成しました
- 名前: webapp-public-ip
- IPアドレス: 20.89.xx.xx
- 割り当て方法: 静的
- SKU: Standard
- 可用性ゾーン: 1,2,3（ゾーン冗長）
- 月額料金: 約¥600
```

## リソースの監視とログ

### リソースの使用状況確認

```
ユーザー: 現在のリソースグループ内のすべてのリソースとそのコストを表示して

AIアシスタント: リソースグループ内のリソースとコスト情報を取得します。

実行コマンド:
@azure show resource group costs "dev-environment-rg"

結果:
リソース一覧とコスト見積もり（月額）:
| リソース名           | 種類              | 状態    | 月額見積  |
|--------------------|------------------|---------|----------|
| dev-ubuntu-vm      | Virtual Machine  | Running | ¥11,200  |
| devstorageacct2024 | Storage Account  | Active  | ¥500     |
| app-vnet           | Virtual Network  | Active  | ¥0       |
| webapp-nsg         | NSG              | Active  | ¥0       |
| webapp-public-ip   | Public IP        | Active  | ¥600     |

合計月額見積もり: ¥12,300

コスト削減の提案:
1. VMを使用しない時は停止（割り当て解除）
2. ストレージのアクセス層を「クール」に変更（使用頻度が低い場合）
3. 開発/テスト価格の適用を検討
```

### アクティビティログの確認

```
ユーザー: 過去24時間のリソースグループの変更履歴を見せて

AIアシスタント: 過去24時間のアクティビティログを取得します。

実行コマンド:
@azure show activity log
  --resource-group "dev-environment-rg"
  --start-time "24 hours ago"

結果:
アクティビティログ（過去24時間）:
| 時刻              | 操作                    | リソース         | 状態      | 実行者     |
|------------------|------------------------|-----------------|-----------|-----------|
| 12:05:00         | VM起動                 | dev-ubuntu-vm   | 成功      | user@example |
| 12:00:00         | VM停止                 | dev-ubuntu-vm   | 成功      | user@example |
| 11:45:32         | リソースグループ削除    | test-resources  | 成功      | user@example |
| 10:30:00         | リソースグループ作成    | dev-environment | 成功      | user@example |
```

## ベストプラクティスとヒント

### 1. 命名規則の統一

```
推奨される命名パターン:
- リソースグループ: {環境}-{プロジェクト}-rg
- VM: {環境}-{OS}-{用途}-vm
- ストレージ: {環境}{プロジェクト}storage{番号}
- ネットワーク: {環境}-{用途}-vnet

例:
- dev-webapp-rg
- dev-ubuntu-web-vm
- devwebappstorage001
- dev-app-vnet
```

### 2. タグの活用

```
推奨タグ:
- environment: dev/test/staging/prod
- project: プロジェクト名
- owner: 所有者/チーム
- cost-center: コストセンター
- created-date: 作成日
- expiry-date: 有効期限（一時リソース用）
```

### 3. リソースのクリーンアップ

```
ユーザー: 開発環境の未使用リソースをクリーンアップして

AIアシスタント: 未使用リソースを検出してクリーンアップ提案を行います。

検出された未使用リソース:
1. 停止中のVM（30日以上）: old-test-vm
2. 空のストレージアカウント: teststorage2023
3. 未接続のディスク: old-data-disk
4. 未使用のパブリックIP: unused-ip-address

クリーンアップを実行しますか？ (yes/no)
```

## まとめ

この章では、Azure MCP Serverを使用した基本的なリソース操作について学びました：

1. **リソースグループ**: 作成、タグ管理、削除の基本操作
2. **仮想マシン**: 作成、起動/停止、サイズ変更の手順
3. **ストレージ**: アカウント作成、Blobコンテナー管理、アクセス制御
4. **ネットワーク**: 仮想ネットワーク、NSG、パブリックIPの設定

これらの基本操作をマスターすることで、Azure MCP Serverを使った効率的なクラウドリソース管理が可能になります。次の章では、より高度なリソース管理テクニックについて解説します。