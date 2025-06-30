---
title: "第6章: トラブルシューティング"
---

## はじめに

この章では、Azure MCP Serverを使用する際に遭遇する可能性のある問題と、その解決方法について詳しく解説します。よくあるエラーから複雑な問題まで、実践的なトラブルシューティング手法を学びます。

## よくあるエラーと対処法

### 認証関連のエラー

#### エラー: "Authentication failed: Invalid client secret"

```
ユーザー: リソースグループを作成しようとしたら認証エラーが出た

AIアシスタント: 認証エラーの詳細を確認して解決策を提示します。

診断コマンド:
@azure diagnose auth-error

エラー詳細:
- エラーコード: AADSTS7000215
- メッセージ: Invalid client secret provided
- 発生時刻: 2024-01-15 10:30:45 UTC

原因分析:
1. サービスプリンシパルのシークレット有効期限切れ
   - 作成日: 2023-01-15
   - 有効期限: 2024-01-14（昨日期限切れ）

解決手順:

1. 新しいシークレットを生成:
@azure renew service-principal-secret
  --app-id "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

✓ 新しいシークレット生成完了
新しいシークレット: ********************************
有効期限: 2025-01-15

2. 環境変数を更新:
export AZURE_CLIENT_SECRET="新しいシークレット"

3. MCP Server再起動:
@azure restart mcp-server

✓ 認証テスト成功
```

#### エラー: "Insufficient permissions"

```
ユーザー: VMを作成しようとしたら権限不足エラーが発生

AIアシスタント: 権限エラーの詳細を分析します。

診断コマンド:
@azure check permissions --operation "Microsoft.Compute/virtualMachines/write"

権限チェック結果:
現在のプリンシパル: app-mcp-server
必要な権限: Microsoft.Compute/virtualMachines/write
現在の権限: 
- Microsoft.Compute/virtualMachines/read ✓
- Microsoft.Compute/virtualMachines/write ✗

必要なロール: 
- Virtual Machine Contributor
- Contributor
- Owner

解決方法:

オプション1: ロールの割り当て（推奨）
```bash
az role assignment create \
  --assignee "app-mcp-server" \
  --role "Virtual Machine Contributor" \
  --scope "/subscriptions/{subscription-id}/resourceGroups/{rg-name}"
```

オプション2: カスタムロールの作成
@azure create custom-role "MCP-VM-Manager"
  --permissions "Microsoft.Compute/*/write,Microsoft.Network/*/write"

✓ ロール割り当て完了
✓ 権限テスト成功
```

### 接続関連のエラー

#### エラー: "Connection timeout to Azure services"

```
ユーザー: Azure APIへの接続がタイムアウトする

AIアシスタント: ネットワーク接続の問題を診断します。

診断コマンド:
@azure diagnose network --detailed

ネットワーク診断:

1. DNS解決テスト:
   - management.azure.com: ✓ (20.189.173.5)
   - login.microsoftonline.com: ✓ (20.190.151.134)
   所要時間: 23ms

2. 接続性テスト:
   - Azure Management API: ✗ タイムアウト
   - Azure AD: ✓ 接続成功
   
3. プロキシ設定確認:
   ⚠️ 企業プロキシ検出: proxy.company.com:8080

問題の原因: プロキシ設定の不備

解決手順:

1. プロキシ設定を環境変数に追加:
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
export NO_PROXY=localhost,127.0.0.1

2. MCP Server設定を更新:
@azure config set proxy.enabled true
@azure config set proxy.host "proxy.company.com"
@azure config set proxy.port 8080

3. プロキシ認証が必要な場合:
@azure config set proxy.auth "username:password"

✓ プロキシ経由での接続テスト成功
✓ Azure API応答確認
```

#### エラー: "SSL certificate verification failed"

```
ユーザー: SSL証明書の検証エラーが発生

AIアシスタント: SSL証明書の問題を診断します。

診断コマンド:
@azure diagnose ssl-error

SSL診断結果:
- エラー: self signed certificate in certificate chain
- 影響範囲: すべてのAzure API呼び出し

原因: 企業の中間CA証明書が信頼されていない

解決方法:

1. 一時的な回避（開発環境のみ）:
export NODE_TLS_REJECT_UNAUTHORIZED=0
⚠️ 警告: セキュリティリスクがあります

2. 推奨される解決方法:
# CA証明書をダウンロード
@azure download ca-certificates
  --url "https://company.com/ca-bundle.crt"

# システムの証明書ストアに追加
sudo cp ca-bundle.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates

# Node.jsに証明書を指定
export NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/ca-bundle.crt

✓ SSL証明書の検証成功
✓ セキュアな接続確立
```

### リソース操作のエラー

#### エラー: "Resource already exists"

```
ユーザー: リソースグループ作成時に既存エラーが出る

AIアシスタント: リソースの重複を確認して解決策を提示します。

診断コマンド:
@azure check resource-exists "prod-webapp-rg"

確認結果:
✓ リソースグループ "prod-webapp-rg" は既に存在
- 作成日: 2024-01-10
- 場所: japaneast
- リソース数: 0（空）
- 所有者: 別のチーム

解決オプション:

1. 別の名前を使用:
@azure suggest resource-name "prod-webapp-rg"
提案:
- prod-webapp-rg-v2
- prod-webapp-2024-rg
- prod-webapp-team2-rg

2. 既存リソースグループを使用（権限がある場合）:
@azure use existing-resource-group "prod-webapp-rg"

3. 既存リソースグループを削除（要注意）:
@azure delete resource-group "prod-webapp-rg" --force

推奨: オプション1（別の名前を使用）
```

#### エラー: "Quota exceeded"

```
ユーザー: VMを作成しようとしたらクォータ超過エラー

AIアシスタント: クォータ状況を確認して対処法を提示します。

診断コマンド:
@azure check quota --resource-type "virtualMachines"

クォータ使用状況:
地域: Japan East
リソース: Standard BSv2 Family vCPUs

現在の使用状況:
- 使用中: 48 vCPUs
- クォータ上限: 50 vCPUs
- 利用可能: 2 vCPUs
- 要求されたVM: Standard_B4ms (4 vCPUs) ✗

他のVMサイズのクォータ:
- Standard DSv2: 20/100 vCPUs ✓
- Standard Dv3: 8/50 vCPUs ✓

解決方法:

1. 別のVMサイズを使用:
@azure create vm --size "Standard_D2s_v3"
（2 vCPUs、クォータ内）

2. 未使用VMの削除:
検出された未使用VM:
- test-vm-old (B2s, 2 vCPUs) - 30日間停止
- demo-vm (B2ms, 2 vCPUs) - 45日間停止

@azure cleanup unused-vms --older-than "30d"

3. クォータ増加申請:
@azure request quota-increase
  --resource "Standard BSv2 Family vCPUs"
  --new-limit 100
  --justification "Production workload expansion"

✓ サポートチケット作成: #2024011500123
予想承認時間: 24-48時間
```

## 認証関連の問題解決

### トークンの有効期限管理

```
ユーザー: 長時間実行中のタスクで認証トークンが期限切れになる

AIアシスタント: トークンの自動更新メカニズムを設定します。

現在の設定:
- トークン有効期限: 1時間
- 自動更新: 無効
- 長時間タスク: バックアップ（3時間）

解決策実装:

1. トークン自動更新の有効化:
@azure config set auth.token-refresh.enabled true
@azure config set auth.token-refresh.interval "45m"

2. 長時間実行タスク用の設定:
@azure config set long-running-tasks.auth-mode "managed-identity"

3. リトライメカニズムの設定:
```json
{
  "retry": {
    "maxAttempts": 3,
    "delay": 5000,
    "maxDelay": 30000,
    "authErrors": true
  }
}
```

テスト実行:
@azure test long-running-task --duration "2h"

✓ 2時間のテストタスク完了
✓ トークン自動更新: 2回
✓ エラーなし
```

### マルチテナント環境での認証

```
ユーザー: 複数のAzureテナントを切り替えて操作したい

AIアシスタント: マルチテナント認証を設定します。

現在の構成:
- プライマリテナント: contoso.com
- 必要なテナント: fabrikam.com, adventure-works.com

設定手順:

1. テナントプロファイルの作成:
@azure create tenant-profile "contoso"
  --tenant-id "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
  --default true

@azure create tenant-profile "fabrikam"
  --tenant-id "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"

@azure create tenant-profile "adventure-works"
  --tenant-id "cccccccc-cccc-cccc-cccc-cccccccccccc"

2. テナント切り替えコマンド:
@azure switch-tenant "fabrikam"

✓ アクティブテナント: fabrikam.com
✓ 利用可能なサブスクリプション: 3個

3. クロステナントリソースアクセス:
@azure enable cross-tenant-access
  --source "contoso"
  --target "fabrikam"
  --permissions "read"

✓ クロステナントアクセス設定完了
```

## パフォーマンスの最適化

### API呼び出しの最適化

```
ユーザー: リソース一覧の取得が遅い

AIアシスタント: パフォーマンスを分析して最適化します。

パフォーマンス分析:
@azure analyze performance --operation "list-resources"

分析結果:
- 総リソース数: 1,247
- API呼び出し回数: 1,247（個別取得）
- 総実行時間: 62.3秒
- 平均レスポンス時間: 50ms/呼び出し

ボトルネック: 逐次的なAPI呼び出し

最適化実装:

1. バッチ処理の有効化:
@azure config set api.batch-size 50
@azure config set api.parallel-requests 10

2. キャッシングの設定:
@azure config set cache.enabled true
@azure config set cache.ttl "5m"
@azure config set cache.size "100MB"

3. 選択的フィールド取得:
@azure list resources --fields "name,type,location"

最適化後の結果:
- API呼び出し回数: 25（バッチ処理）
- 総実行時間: 3.2秒
- 改善率: 94.9%

✓ パフォーマンス最適化完了
```

### メモリ使用量の削減

```
ユーザー: 大量のリソースを扱うとメモリ不足になる

AIアシスタント: メモリ使用量を分析して最適化します。

メモリプロファイリング:
@azure profile memory --scenario "bulk-operations"

プロファイル結果:
- ピークメモリ使用量: 4.2GB
- リソースオブジェクト: 2.8GB
- キャッシュ: 1.1GB
- その他: 0.3GB

最適化戦略:

1. ストリーミング処理の実装:
@azure config set processing.mode "stream"
@azure config set processing.chunk-size 100

2. 不要なデータのフィルタリング:
@azure config set resource.fetch-details false
@azure config set resource.exclude-properties "tags,properties.provisioningDetails"

3. ガベージコレクションの調整:
export NODE_OPTIONS="--max-old-space-size=2048 --gc-interval=100"

最適化後:
- ピークメモリ使用量: 512MB
- 処理速度: 同等
- 安定性: 向上

✓ メモリ最適化完了
```

## ログ分析とデバッグ

### 詳細ログの有効化

```
ユーザー: 問題の原因が分からないので詳細なログが欲しい

AIアシスタント: デバッグログを有効化して問題を調査します。

ログレベル設定:
@azure config set log.level "debug"
@azure config set log.categories "auth,api,resource"
@azure config set log.output "/tmp/azure-mcp-debug.log"

デバッグ情報収集:
@azure enable debug-mode
  --capture-requests true
  --capture-responses true
  --include-headers true

サンプル実行:
@azure create resource-group "test-debug-rg"

収集されたログ:
```
```log
2024-01-15T10:30:00.123Z [DEBUG] [auth] Token refresh initiated
2024-01-15T10:30:00.456Z [DEBUG] [auth] Token acquired successfully
2024-01-15T10:30:00.789Z [DEBUG] [api] Request: PUT /subscriptions/.../resourceGroups/test-debug-rg
Headers: {
  "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6...",
  "Content-Type": "application/json",
  "x-ms-client-request-id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
Body: {
  "location": "japaneast",
  "tags": {}
}
2024-01-15T10:30:01.234Z [DEBUG] [api] Response: 201 Created
Headers: {
  "x-ms-request-id": "12345678-90ab-cdef-1234-567890abcdef",
  "x-ms-correlation-request-id": "fedcba09-8765-4321-0987-654321fedcba"
}
Body: {
  "id": "/subscriptions/.../resourceGroups/test-debug-rg",
  "name": "test-debug-rg",
  "location": "japaneast",
  "properties": {
    "provisioningState": "Succeeded"
  }
}
```
```

ログ分析ツール:
@azure analyze logs --file "/tmp/azure-mcp-debug.log"
  --find-errors
  --show-timeline
  --correlation-analysis

分析結果:
- エラー: 0件
- 警告: 2件（リトライ発生）
- 平均API応答時間: 445ms
- 最も遅い操作: リソース一覧取得（2.3秒）
```

### 相関IDを使用した問題追跡

```
ユーザー: 特定の操作がなぜ失敗したか追跡したい

AIアシスタント: 相関IDを使用して操作を追跡します。

失敗した操作の相関ID:
x-ms-correlation-request-id: a1b2c3d4-e5f6-7890-abcd-ef1234567890

追跡コマンド:
@azure trace operation --correlation-id "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

操作追跡結果:
```
```
Timeline:
10:30:00 - [Client] VM作成リクエスト開始
10:30:01 - [Gateway] リクエスト受信
10:30:02 - [Auth] 認証成功
10:30:03 - [Compute] VM作成開始
10:30:15 - [Network] 仮想NIC作成開始
10:30:25 - [Network] NSG割り当てエラー ❌
10:30:26 - [Compute] ロールバック開始
10:30:30 - [Client] エラー応答

根本原因:
- NSG "default-nsg" が見つからない
- 依存リソースの作成順序エラー

修正方法:
1. NSGを先に作成
2. または、既存のNSGを指定
3. または、NSG作成をスキップ

@azure create vm "retry-vm"
  --no-nsg  # NSGなしで作成

✓ VM作成成功
```
```

## 高度なトラブルシューティング

### リソースの状態不整合

```
ユーザー: リソースの状態がPortalとMCP Serverで異なる

AIアシスタント: リソース状態の不整合を調査します。

状態確認:
@azure diagnose resource-state "problematic-vm"

診断結果:
- Portal表示: Running
- MCP Server: Stopped
- 実際の状態: Running
- 最終更新: 45分前

原因: キャッシュの不整合

解決手順:

1. キャッシュのクリア:
@azure cache clear --resource "problematic-vm"

2. 強制リフレッシュ:
@azure refresh resource-state "problematic-vm" --force

3. 状態の同期:
@azure sync resource-state --verify

✓ 状態同期完了
現在の状態: Running（全システムで一致）

予防策:
@azure config set cache.validation.enabled true
@azure config set cache.validation.interval "1m"
```

### 並行実行時の競合状態

```
ユーザー: 複数のユーザーが同時に操作すると競合エラーが発生

AIアシスタント: 並行実行の競合を解決します。

競合検出:
@azure detect race-conditions --time-window "1h"

検出された競合:
- リソースグループのタグ更新: 3件
- VM設定変更: 2件
- ストレージアカウントキー再生成: 1件

解決策実装:

1. 楽観的ロックの有効化:
@azure config set concurrency.optimistic-locking true
@azure config set concurrency.retry-on-conflict true

2. 操作のシリアライズ:
@azure config set operations.queue.enabled true
@azure config set operations.queue.max-concurrent 1

3. 競合解決戦略:
```json
{
  "conflictResolution": {
    "strategy": "last-write-wins",
    "retryAttempts": 3,
    "backoffMultiplier": 2
  }
}
```

テスト実行:
@azure test concurrent-operations --users 10 --operations 100

結果:
- 成功: 100/100
- 競合検出: 12件
- 自動解決: 12件
- 失敗: 0件

✓ 競合処理メカニズム正常動作
```

## エラーリカバリとレジリエンス

### 自動リトライメカニズム

```
ユーザー: 一時的なエラーで操作が失敗することがある

AIアシスタント: 自動リトライメカニズムを設定します。

現在のエラー統計:
- 一時的エラー（429, 503）: 15%
- ネットワークエラー: 5%
- 永続的エラー: 2%

リトライ設定:
@azure configure retry-policy
  --transient-errors "429,503,502,504"
  --network-errors true
  --max-attempts 5
  --base-delay 1000
  --max-delay 30000
  --exponential-backoff true

詳細設定:
```json
{
  "retry": {
    "strategies": {
      "429": {
        "respectRetryAfter": true,
        "maxAttempts": 10
      },
      "503": {
        "baseDelay": 2000,
        "maxAttempts": 5
      },
      "network": {
        "baseDelay": 500,
        "jitter": true
      }
    }
  }
}
```

効果測定（1週間後）:
- 成功率: 98.5% → 99.9%
- 平均リトライ回数: 1.3回
- 最大遅延: 15秒
```

### 部分的な失敗の処理

```
ユーザー: 複数リソースの作成中に一部が失敗した

AIアシスタント: 部分的な失敗を検出してリカバリします。

失敗状況:
作成予定: 10個のVM
成功: 7個
失敗: 3個（クォータ超過）

リカバリオプション:

1. ロールバック（全削除）:
@azure rollback bulk-operation --id "bulk-vm-create-12345"

2. 部分的な再試行:
@azure retry failed-resources
  --operation-id "bulk-vm-create-12345"
  --with-modifications "size=Standard_B2s"

3. 手動修正後の継続:
@azure continue bulk-operation
  --id "bulk-vm-create-12345"
  --skip-failed

推奨: オプション2（サイズ変更して再試行）

実行結果:
✓ 3個のVMを Standard_B2s で作成成功
✓ 全10個のVM作成完了
```

## まとめ

この章では、Azure MCP Server使用時の様々なトラブルシューティング方法を解説しました：

1. **一般的なエラー**: 認証、接続、リソース操作の問題と解決法
2. **パフォーマンス最適化**: API呼び出しとメモリ使用の効率化
3. **デバッグ技法**: ログ分析と問題追跡の手法
4. **高度な問題解決**: 状態不整合や競合状態への対処
5. **レジリエンス**: 自動リトライとエラーリカバリ

これらの知識を活用することで、Azure MCP Serverを安定的に運用し、問題が発生した際も迅速に解決できるようになります。次の章では、ベストプラクティスとセキュリティについて解説します。