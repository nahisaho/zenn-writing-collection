---
title: "第4章 PowerShellスクリプト設計"
---

## 4.0 はじめに

前章までのリスク分析を踏まえ、BitLocker回復キーを安全かつ確実に削除するPowerShellスクリプトの設計について詳しく解説します。

本章では、要件定義から設計原則、Microsoft Graph APIの活用、エラーハンドリング、ログ出力まで、実用的なスクリプト開発のための技術的基盤を構築します。

## 4.1 スクリプト設計の要件定義

### 4.1.1 機能要件

#### 4.1.1.1 基本機能要件
```yaml
Primary_Functions:
  回復キー削除:
    対象: Microsoft Entra ID保存の回復キー
    方式: Microsoft Graph API経由
    対象範囲: 単体端末または一括処理
    
  削除確認:
    事前確認: 削除対象キーの確認・承認
    事後確認: 削除完了の検証
    
  ログ出力:
    操作ログ: 全操作の詳細記録
    監査ログ: コンプライアンス対応
    エラーログ: 障害時の詳細情報
    
  レポート生成:
    削除レポート: 削除実行結果
    サマリーレポート: 処理統計
    監査レポート: 監査用証跡
```

#### 4.1.1.2 拡張機能要件
```yaml
Extended_Functions:
  バッチ処理:
    対象: 複数端末の一括処理
    並列処理: 効率的な大量処理
    進捗監視: 処理状況の可視化
    
  スケジュール実行:
    定期実行: 自動化されたメンテナンス
    条件実行: イベント駆動での実行
    
  通知機能:
    完了通知: 処理完了の自動通知
    エラー通知: 障害発生時のアラート
    
  統合機能:
    SIEM連携: セキュリティ監視システム連携
    ServiceNow連携: IT運用管理システム連携
```

### 4.1.2 非機能要件

#### 4.1.2.1 パフォーマンス要件
```powershell
# パフォーマンス要件定義
$performanceRequirements = @{
    "単体処理時間" = @{
        Target = "30秒以内"
        Measurement = "回復キー削除 + 確認"
        Baseline = "手動処理: 5分"
    }
    "並列処理性能" = @{
        Target = "100台同時処理"
        Measurement = "同時API呼び出し数"
        Constraint = "Microsoft Graph API制限内"
    }
    "大量処理時間" = @{
        Target = "1000台を1時間以内"
        Measurement = "バッチ処理完了時間"
        Optimization = "スレッドプール使用"
    }
    "メモリ使用量" = @{
        Target = "512MB以下"
        Measurement = "処理中の最大メモリ使用量"
        Constraint = "標準的なIT管理端末で実行可能"
    }
}

Write-Host "パフォーマンス要件:" -ForegroundColor Green
foreach ($req in $performanceRequirements.Keys) {
    Write-Host "$req`: $($performanceRequirements[$req].Target)" -ForegroundColor Yellow
}
```

#### 4.1.2.2 信頼性要件
```yaml
Reliability_Requirements:
  可用性:
    目標: 99.9%
    測定: 月間稼働率
    制約: Microsoft Graph APIの可用性に依存
    
  冪等性:
    要件: 同一処理の重複実行に対する安全性
    実装: 削除済みキーの再削除チェック
    
  リトライ機能:
    対象: ネットワーク障害、API制限
    方式: 指数バックオフ
    上限: 最大3回
    
  ロールバック:
    対象: 部分失敗時の状態復旧
    方式: 削除前バックアップ（暗号化）
    保持期間: 30日間
```

#### 4.1.2.3 セキュリティ要件
```yaml
Security_Requirements:
  認証:
    方式: Service Principal認証
    証明書: X.509証明書ベース
    権限: 最小権限原則
    
  通信セキュリティ:
    プロトコル: HTTPS/TLS 1.3
    証明書検証: 厳格な証明書チェーン検証
    
  ログセキュリティ:
    暗号化: AES-256暗号化
    アクセス制御: 管理者のみ
    改ざん防止: デジタル署名
    
  秘密情報管理:
    認証情報: Azure Key Vault保存
    一時データ: メモリ内のみ、実行後消去
    ログ出力: 機密情報のマスキング
```

### 4.1.3 ユーザビリティ要件

#### 4.1.3.1 操作性要件
```powershell
# コマンドライン仕様
@"
基本実行:
Remove-BitLockerRecoveryKey -ComputerName "PC001"

バッチ処理:
Remove-BitLockerRecoveryKey -InputFile "targets.csv" -Parallel

対話モード:
Remove-BitLockerRecoveryKey -Interactive

確認モード:
Remove-BitLockerRecoveryKey -ComputerName "PC001" -WhatIf

詳細ログ:
Remove-BitLockerRecoveryKey -ComputerName "PC001" -Verbose
"@ | Write-Host -ForegroundColor Cyan
```

#### 4.1.3.2 エラーメッセージ設計
```yaml
Error_Message_Design:
  レベル分類:
    Info: 正常な処理進行
    Warning: 注意が必要だが処理継続
    Error: 処理失敗、手動対応必要
    Critical: システム障害、緊急対応必要
    
  メッセージ形式:
    構造: "[時刻] [レベル] [コンポーネント] [メッセージ] [対処法]"
    例: "[2024-12-30 10:30:15] ERROR [GraphAPI] Failed to delete recovery key for PC001. Check network connectivity and retry."
    
  多言語対応:
    主言語: 日本語
    副言語: 英語（国際展開対応）
    実装: リソースファイル分離
```

## 4.2 Microsoft Entra ID PowerShellモジュールの活用

### 4.2.1 認証方式の選択と実装

#### 4.2.1.1 Service Principal認証
```powershell
# Service Principal設定
$servicePrincipalConfig = @{
    TenantId = "12345678-1234-1234-1234-123456789012"
    ClientId = "87654321-4321-4321-4321-210987654321"
    CertificateThumbprint = "A1B2C3D4E5F6789012345678901234567890ABCD"
    Scopes = @(
        "https://graph.microsoft.com/Device.ReadWrite.All",
        "https://graph.microsoft.com/BitLockerKey.ReadBasic.All"
    )
}

# 認証実装関数
function Connect-ToMicrosoftGraph {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [hashtable]$Config
    )
    
    try {
        # 証明書ベース認証
        $connectParams = @{
            TenantId = $Config.TenantId
            ClientId = $Config.ClientId
            CertificateThumbprint = $Config.CertificateThumbprint
        }
        
        Connect-MgGraph @connectParams
        
        # 接続確認
        $context = Get-MgContext
        if ($context) {
            Write-Information "Microsoft Graph接続成功: $($context.Account)" -InformationAction Continue
            return $true
        }
    }
    catch {
        Write-Error "Microsoft Graph接続失敗: $($_.Exception.Message)"
        return $false
    }
}
```

#### 4.2.1.2 必要な権限設定
```powershell
# 必要権限の自動チェック
function Test-RequiredPermissions {
    [CmdletBinding()]
    param()
    
    $requiredPermissions = @(
        "Device.ReadWrite.All",
        "BitLockerKey.ReadBasic.All",
        "Directory.Read.All"
    )
    
    $currentPermissions = (Get-MgContext).Scopes
    $missingPermissions = @()
    
    foreach ($permission in $requiredPermissions) {
        if ($permission -notin $currentPermissions) {
            $missingPermissions += $permission
        }
    }
    
    if ($missingPermissions.Count -gt 0) {
        Write-Warning "不足している権限: $($missingPermissions -join ', ')"
        Write-Information "権限追加方法:" -InformationAction Continue
        Write-Information "1. Azure Portal → App registrations" -InformationAction Continue
        Write-Information "2. API permissions → Add a permission" -InformationAction Continue
        Write-Information "3. Microsoft Graph → Application permissions" -InformationAction Continue
        return $false
    }
    
    Write-Information "必要な権限が揃っています" -InformationAction Continue
    return $true
}
```

### 4.2.2 Microsoft Graph APIラッパー関数

#### 4.2.2.1 デバイス管理関数
```powershell
# デバイス検索・取得
function Get-ManagedDevice {
    [CmdletBinding()]
    param(
        [Parameter(ParameterSetName = "ByName")]
        [string]$ComputerName,
        
        [Parameter(ParameterSetName = "ByFilter")]
        [string]$Filter,
        
        [Parameter(ParameterSetName = "All")]
        [switch]$All
    )
    
    try {
        switch ($PSCmdlet.ParameterSetName) {
            "ByName" {
                $filter = "displayName eq '$ComputerName'"
                $devices = Get-MgDevice -Filter $filter
            }
            "ByFilter" {
                $devices = Get-MgDevice -Filter $Filter
            }
            "All" {
                $devices = Get-MgDevice -All
            }
        }
        
        if ($devices) {
            foreach ($device in $devices) {
                [PSCustomObject]@{
                    DeviceId = $device.Id
                    DisplayName = $device.DisplayName
                    OperatingSystem = $device.OperatingSystem
                    TrustType = $device.TrustType
                    IsCompliant = $device.IsCompliant
                    LastSignInDateTime = $device.ApproximateLastSignInDateTime
                }
            }
        }
        else {
            Write-Warning "指定された条件に一致するデバイスが見つかりません"
        }
    }
    catch {
        Write-Error "デバイス取得エラー: $($_.Exception.Message)"
    }
}

# 使用例
$device = Get-ManagedDevice -ComputerName "PC001"
if ($device) {
    Write-Host "デバイス発見: $($device.DisplayName) (ID: $($device.DeviceId))"
}
```

#### 4.2.2.2 BitLocker回復キー管理関数
```powershell
# 回復キー取得
function Get-BitLockerRecoveryKeys {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$DeviceId,
        
        [switch]$IncludeKeyDetails
    )
    
    try {
        $uri = "https://graph.microsoft.com/v1.0/informationProtection/bitlocker/recoveryKeys"
        $filter = "deviceId eq '$DeviceId'"
        
        $response = Invoke-MgGraphRequest -Uri "$uri" -Method GET -Body @{
            '$filter' = $filter
        }
        
        $recoveryKeys = @()
        foreach ($key in $response.value) {
            $keyInfo = [PSCustomObject]@{
                KeyId = $key.id
                CreatedDateTime = $key.createdDateTime
                VolumeType = $key.volumeType
                DeviceId = $DeviceId
            }
            
            if ($IncludeKeyDetails) {
                # 回復キー詳細取得（管理者権限必要）
                try {
                    $keyDetails = Invoke-MgGraphRequest -Uri "$uri/$($key.id)" -Method GET
                    $keyInfo | Add-Member -NotePropertyName "RecoveryKey" -NotePropertyValue $keyDetails.key
                }
                catch {
                    Write-Warning "回復キー詳細取得失敗: $($_.Exception.Message)"
                }
            }
            
            $recoveryKeys += $keyInfo
        }
        
        return $recoveryKeys
    }
    catch {
        Write-Error "回復キー取得エラー: $($_.Exception.Message)"
        return $null
    }
}

# 回復キー削除
function Remove-BitLockerRecoveryKey {
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory)]
        [string]$KeyId,
        
        [switch]$Force
    )
    
    try {
        if ($PSCmdlet.ShouldProcess("Recovery Key ID: $KeyId", "削除")) {
            if (-not $Force) {
                $confirmation = Read-Host "回復キー $KeyId を削除しますか？ (y/N)"
                if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
                    Write-Information "削除をキャンセルしました" -InformationAction Continue
                    return $false
                }
            }
            
            $uri = "https://graph.microsoft.com/v1.0/informationProtection/bitlocker/recoveryKeys/$KeyId"
            Invoke-MgGraphRequest -Uri $uri -Method DELETE
            
            # 削除確認
            Start-Sleep -Seconds 2
            try {
                Invoke-MgGraphRequest -Uri $uri -Method GET
                Write-Warning "回復キーが削除されていない可能性があります"
                return $false
            }
            catch {
                if ($_.Exception.Message -match "404") {
                    Write-Information "回復キー削除成功: $KeyId" -InformationAction Continue
                    return $true
                }
                else {
                    throw
                }
            }
        }
    }
    catch {
        Write-Error "回復キー削除エラー: $($_.Exception.Message)"
        return $false
    }
}
```

## 4.3 Graph API経由でのキー管理

### 4.3.1 API制限とレート制限対応

#### 4.3.1.1 スロットリング制御
```powershell
# APIレート制限対応クラス
class GraphApiThrottler {
    [int]$MaxRequestsPerSecond = 10
    [int]$RequestCount = 0
    [datetime]$WindowStart = [datetime]::Now
    [System.Collections.Generic.Queue[datetime]]$RequestTimes
    
    GraphApiThrottler() {
        $this.RequestTimes = [System.Collections.Generic.Queue[datetime]]::new()
    }
    
    [void] WaitIfNeeded() {
        $now = [datetime]::Now
        
        # 1秒以上古いリクエストを削除
        while ($this.RequestTimes.Count -gt 0 -and 
               ($now - $this.RequestTimes.Peek()).TotalSeconds -gt 1) {
            $this.RequestTimes.Dequeue() | Out-Null
        }
        
        # レート制限チェック
        if ($this.RequestTimes.Count -ge $this.MaxRequestsPerSecond) {
            $waitTime = 1000 - [int]($now - $this.RequestTimes.Peek()).TotalMilliseconds
            if ($waitTime -gt 0) {
                Start-Sleep -Milliseconds $waitTime
            }
        }
        
        $this.RequestTimes.Enqueue($now)
    }
}

# 使用例
$throttler = [GraphApiThrottler]::new()

function Invoke-ThrottledGraphRequest {
    param($Uri, $Method = "GET", $Body = $null)
    
    $throttler.WaitIfNeeded()
    
    try {
        return Invoke-MgGraphRequest -Uri $Uri -Method $Method -Body $Body
    }
    catch {
        if ($_.Exception.Message -match "429") {
            Write-Warning "API制限に達しました。1分待機します..."
            Start-Sleep -Seconds 60
            return Invoke-MgGraphRequest -Uri $Uri -Method $Method -Body $Body
        }
        throw
    }
}
```

#### 4.3.1.2 バッチ処理実装
```powershell
# バッチAPIリクエスト
function Invoke-GraphBatchRequest {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [array]$Requests,
        
        [int]$BatchSize = 20
    )
    
    $results = @()
    $batches = @()
    
    # リクエストをバッチサイズに分割
    for ($i = 0; $i -lt $Requests.Count; $i += $BatchSize) {
        $batchEnd = [Math]::Min($i + $BatchSize - 1, $Requests.Count - 1)
        $batches += , $Requests[$i..$batchEnd]
    }
    
    foreach ($batch in $batches) {
        $batchBody = @{
            requests = @()
        }
        
        $requestId = 1
        foreach ($request in $batch) {
            $batchBody.requests += @{
                id = $requestId.ToString()
                method = $request.Method
                url = $request.Url
                body = $request.Body
            }
            $requestId++
        }
        
        try {
            $batchResponse = Invoke-ThrottledGraphRequest -Uri "https://graph.microsoft.com/v1.0/`$batch" -Method POST -Body $batchBody
            
            foreach ($response in $batchResponse.responses) {
                $results += @{
                    Id = $response.id
                    Status = $response.status
                    Body = $response.body
                }
            }
        }
        catch {
            Write-Error "バッチリクエストエラー: $($_.Exception.Message)"
        }
        
        # バッチ間の待機
        Start-Sleep -Milliseconds 100
    }
    
    return $results
}
```

### 4.3.2 エラー処理とリトライ機能

#### 4.3.2.1 指数バックオフ実装
```powershell
# リトライ機能付きAPI呼び出し
function Invoke-GraphRequestWithRetry {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$Uri,
        
        [string]$Method = "GET",
        
        [hashtable]$Body = $null,
        
        [int]$MaxRetries = 3,
        
        [int]$BaseDelaySeconds = 1
    )
    
    $attempt = 0
    
    while ($attempt -le $MaxRetries) {
        try {
            $result = if ($Body) {
                Invoke-MgGraphRequest -Uri $Uri -Method $Method -Body $Body
            } else {
                Invoke-MgGraphRequest -Uri $Uri -Method $Method
            }
            
            return $result
        }
        catch {
            $attempt++
            
            if ($attempt -gt $MaxRetries) {
                Write-Error "最大リトライ回数に達しました。最後のエラー: $($_.Exception.Message)"
                throw
            }
            
            $errorCode = $_.Exception.Response.StatusCode
            $shouldRetry = $false
            
            switch ($errorCode) {
                429 { # Too Many Requests
                    $shouldRetry = $true
                    $delay = $BaseDelaySeconds * [Math]::Pow(2, $attempt - 1) + 10
                }
                502 { # Bad Gateway
                    $shouldRetry = $true
                    $delay = $BaseDelaySeconds * [Math]::Pow(2, $attempt - 1)
                }
                503 { # Service Unavailable
                    $shouldRetry = $true
                    $delay = $BaseDelaySeconds * [Math]::Pow(2, $attempt - 1)
                }
                504 { # Gateway Timeout
                    $shouldRetry = $true
                    $delay = $BaseDelaySeconds * [Math]::Pow(2, $attempt - 1)
                }
                default {
                    Write-Error "リトライ不可のエラー: $errorCode - $($_.Exception.Message)"
                    throw
                }
            }
            
            if ($shouldRetry) {
                Write-Warning "リトライ $attempt/$MaxRetries : $delay 秒後に再試行します"
                Start-Sleep -Seconds $delay
            }
        }
    }
}
```

## 4.4 エラーハンドリングと例外処理

### 4.4.1 エラー分類と対応戦略

#### 4.4.1.1 エラーカテゴリ定義
```powershell
# エラー分類enum
enum BitLockerErrorCategory {
    AuthenticationError    # 認証関連エラー
    PermissionError       # 権限関連エラー
    NetworkError          # ネットワーク関連エラー
    ApiError              # API関連エラー
    DataError             # データ関連エラー
    ConfigurationError    # 設定関連エラー
    SystemError           # システム関連エラー
}

# カスタム例外クラス
class BitLockerException : System.Exception {
    [BitLockerErrorCategory]$Category
    [string]$Component
    [hashtable]$Context
    
    BitLockerException([string]$message, [BitLockerErrorCategory]$category, [string]$component) : base($message) {
        $this.Category = $category
        $this.Component = $component
        $this.Context = @{}
    }
    
    BitLockerException([string]$message, [BitLockerErrorCategory]$category, [string]$component, [hashtable]$context) : base($message) {
        $this.Category = $category
        $this.Component = $component
        $this.Context = $context
    }
}
```

#### 4.4.1.2 エラーハンドリング戦略
```powershell
# 統合エラーハンドラー
function Handle-BitLockerError {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [System.Exception]$Exception,
        
        [string]$Operation = "Unknown",
        
        [hashtable]$Context = @{}
    )
    
    $errorDetails = @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Operation = $Operation
        Exception = $Exception.GetType().Name
        Message = $Exception.Message
        Context = $Context
    }
    
    # エラーの種類に応じた処理
    switch -Regex ($Exception.Message) {
        "401|Unauthorized" {
            $errorDetails.Category = [BitLockerErrorCategory]::AuthenticationError
            $errorDetails.Action = "認証情報を確認し、再認証してください"
            $errorDetails.Severity = "High"
        }
        "403|Forbidden" {
            $errorDetails.Category = [BitLockerErrorCategory]::PermissionError
            $errorDetails.Action = "必要な権限が付与されているか確認してください"
            $errorDetails.Severity = "High"
        }
        "429|Too Many Requests" {
            $errorDetails.Category = [BitLockerErrorCategory]::ApiError
            $errorDetails.Action = "時間をおいて再実行してください"
            $errorDetails.Severity = "Medium"
        }
        "404|Not Found" {
            $errorDetails.Category = [BitLockerErrorCategory]::DataError
            $errorDetails.Action = "対象リソースが存在するか確認してください"
            $errorDetails.Severity = "Medium"
        }
        "Network|Timeout" {
            $errorDetails.Category = [BitLockerErrorCategory]::NetworkError
            $errorDetails.Action = "ネットワーク接続を確認し、再実行してください"
            $errorDetails.Severity = "Medium"
        }
        default {
            $errorDetails.Category = [BitLockerErrorCategory]::SystemError
            $errorDetails.Action = "システム管理者にお問い合わせください"
            $errorDetails.Severity = "High"
        }
    }
    
    # ログ出力
    Write-BitLockerLog -Level "Error" -Message $errorDetails.Message -Category $errorDetails.Category -Context $errorDetails
    
    # 通知（重要度に応じて）
    if ($errorDetails.Severity -eq "High") {
        Send-ErrorNotification -ErrorDetails $errorDetails
    }
    
    return $errorDetails
}
```

### 4.4.2 入力検証とデータ検証

#### 4.4.2.1 パラメータ検証
```powershell
# 入力値検証関数
function Test-InputParameters {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [hashtable]$Parameters
    )
    
    $validationErrors = @()
    
    # コンピューター名検証
    if ($Parameters.ContainsKey("ComputerName")) {
        $computerName = $Parameters.ComputerName
        if (-not ($computerName -match "^[A-Za-z0-9\-]{1,15}$")) {
            $validationErrors += "無効なコンピューター名: $computerName"
        }
    }
    
    # GUID検証
    if ($Parameters.ContainsKey("DeviceId")) {
        $deviceId = $Parameters.DeviceId
        try {
            [System.Guid]::Parse($deviceId) | Out-Null
        }
        catch {
            $validationErrors += "無効なデバイスID: $deviceId"
        }
    }
    
    # ファイルパス検証
    if ($Parameters.ContainsKey("InputFile")) {
        $inputFile = $Parameters.InputFile
        if (-not (Test-Path -Path $inputFile)) {
            $validationErrors += "ファイルが見つかりません: $inputFile"
        }
    }
    
    # 日付範囲検証
    if ($Parameters.ContainsKey("DateFrom") -and $Parameters.ContainsKey("DateTo")) {
        $dateFrom = $Parameters.DateFrom
        $dateTo = $Parameters.DateTo
        if ($dateFrom -gt $dateTo) {
            $validationErrors += "開始日が終了日より後になっています"
        }
    }
    
    if ($validationErrors.Count -gt 0) {
        throw [BitLockerException]::new(
            "入力パラメータエラー: $($validationErrors -join '; ')",
            [BitLockerErrorCategory]::DataError,
            "InputValidation"
        )
    }
    
    return $true
}
```

#### 4.4.2.2 データ整合性チェック
```powershell
# データ整合性検証
function Test-DataIntegrity {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [hashtable]$DeviceInfo,
        
        [Parameter(Mandatory)]
        [array]$RecoveryKeys
    )
    
    $integrityChecks = @{
        DeviceExists = $false
        RecoveryKeysValid = $false
        TimestampConsistent = $false
        VolumeTypeValid = $false
    }
    
    # デバイス存在確認
    if ($DeviceInfo.DeviceId -and $DeviceInfo.DisplayName) {
        $integrityChecks.DeviceExists = $true
    }
    
    # 回復キー有効性確認
    $validKeyCount = 0
    foreach ($key in $RecoveryKeys) {
        if ($key.KeyId -and $key.VolumeType) {
            $validKeyCount++
            
            # タイムスタンプ確認
            if ($key.CreatedDateTime) {
                $createdDate = [datetime]$key.CreatedDateTime
                if ($createdDate -le (Get-Date) -and $createdDate -gt (Get-Date).AddYears(-10)) {
                    $integrityChecks.TimestampConsistent = $true
                }
            }
            
            # ボリュームタイプ確認
            if ($key.VolumeType -in @("OperatingSystemDrive", "DataDrive", "RemovableDrive")) {
                $integrityChecks.VolumeTypeValid = $true
            }
        }
    }
    
    if ($validKeyCount -eq $RecoveryKeys.Count -and $validKeyCount -gt 0) {
        $integrityChecks.RecoveryKeysValid = $true
    }
    
    # 整合性チェック結果
    $overallIntegrity = $integrityChecks.Values -notcontains $false
    
    if (-not $overallIntegrity) {
        $failedChecks = $integrityChecks.GetEnumerator() | Where-Object { -not $_.Value } | ForEach-Object { $_.Key }
        Write-Warning "データ整合性チェック失敗: $($failedChecks -join ', ')"
    }
    
    return @{
        IsValid = $overallIntegrity
        Details = $integrityChecks
    }
}
```

## 4.5 ログ出力と監査証跡の実装

### 4.5.1 構造化ログ設計

#### 4.5.1.1 ログエントリ構造
```powershell
# ログエントリクラス
class LogEntry {
    [datetime]$Timestamp
    [string]$Level
    [string]$Component
    [string]$Operation
    [string]$Message
    [hashtable]$Context
    [string]$CorrelationId
    [string]$UserId
    [string]$SessionId
    
    LogEntry() {
        $this.Timestamp = Get-Date
        $this.CorrelationId = [System.Guid]::NewGuid().ToString()
        $this.Context = @{}
    }
    
    [string] ToJson() {
        return $this | ConvertTo-Json -Compress
    }
    
    [string] ToFormattedString() {
        return "[$($this.Timestamp.ToString('yyyy-MM-dd HH:mm:ss.fff'))] [$($this.Level)] [$($this.Component)] $($this.Message)"
    }
}

# ログレベル定義
enum LogLevel {
    Trace = 0
    Debug = 1
    Information = 2
    Warning = 3
    Error = 4
    Critical = 5
}
```

#### 4.5.1.2 ログ出力システム
```powershell
# ログ管理クラス
class BitLockerLogger {
    [string]$LogPath
    [LogLevel]$MinimumLevel
    [bool]$EnableConsoleOutput
    [bool]$EnableStructuredLogging
    [System.IO.StreamWriter]$LogWriter
    
    BitLockerLogger([string]$logPath, [LogLevel]$minimumLevel) {
        $this.LogPath = $logPath
        $this.MinimumLevel = $minimumLevel
        $this.EnableConsoleOutput = $true
        $this.EnableStructuredLogging = $true
        
        # ログディレクトリ作成
        $logDir = Split-Path -Path $logPath -Parent
        if (-not (Test-Path -Path $logDir)) {
            New-Item -Path $logDir -ItemType Directory -Force | Out-Null
        }
        
        # ログファイル初期化
        $this.LogWriter = [System.IO.StreamWriter]::new($logPath, $true, [System.Text.Encoding]::UTF8)
        $this.LogWriter.AutoFlush = $true
    }
    
    [void] WriteLog([LogLevel]$level, [string]$component, [string]$operation, [string]$message, [hashtable]$context) {
        if ($level -lt $this.MinimumLevel) {
            return
        }
        
        $logEntry = [LogEntry]::new()
        $logEntry.Level = $level.ToString()
        $logEntry.Component = $component
        $logEntry.Operation = $operation
        $logEntry.Message = $message
        $logEntry.Context = $context
        $logEntry.UserId = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
        $logEntry.SessionId = $PID
        
        # 構造化ログ出力
        if ($this.EnableStructuredLogging) {
            $this.LogWriter.WriteLine($logEntry.ToJson())
        } else {
            $this.LogWriter.WriteLine($logEntry.ToFormattedString())
        }
        
        # コンソール出力
        if ($this.EnableConsoleOutput) {
            $color = switch ($level) {
                ([LogLevel]::Trace) { "DarkGray" }
                ([LogLevel]::Debug) { "Gray" }
                ([LogLevel]::Information) { "White" }
                ([LogLevel]::Warning) { "Yellow" }
                ([LogLevel]::Error) { "Red" }
                ([LogLevel]::Critical) { "Magenta" }
            }
            Write-Host $logEntry.ToFormattedString() -ForegroundColor $color
        }
    }
    
    [void] Close() {
        if ($this.LogWriter) {
            $this.LogWriter.Close()
            $this.LogWriter.Dispose()
        }
    }
}

# グローバルロガーインスタンス
$global:BitLockerLogger = $null

function Initialize-BitLockerLogging {
    [CmdletBinding()]
    param(
        [string]$LogPath = "C:\Logs\BitLockerKeyManagement\bitlocker-$(Get-Date -Format 'yyyyMMdd').log",
        [LogLevel]$MinimumLevel = [LogLevel]::Information
    )
    
    $global:BitLockerLogger = [BitLockerLogger]::new($LogPath, $MinimumLevel)
    Write-Information "ログシステム初期化完了: $LogPath" -InformationAction Continue
}

function Write-BitLockerLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [LogLevel]$Level,
        
        [Parameter(Mandatory)]
        [string]$Message,
        
        [string]$Component = "BitLockerKeyManager",
        
        [string]$Operation = "General",
        
        [hashtable]$Context = @{}
    )
    
    if ($global:BitLockerLogger) {
        $global:BitLockerLogger.WriteLog($Level, $Component, $Operation, $Message, $Context)
    } else {
        Write-Warning "ログシステムが初期化されていません。Initialize-BitLockerLogging を実行してください。"
    }
}
```

### 4.5.2 監査ログ仕様

#### 4.5.2.1 監査イベント定義
```yaml
Audit_Events:
  RECOVERY_KEY_ACCESSED:
    EventId: 4001
    Description: "回復キーへのアクセス"
    RequiredFields: [UserId, DeviceId, KeyId, AccessType]
    
  RECOVERY_KEY_DELETED:
    EventId: 4002
    Description: "回復キーの削除"
    RequiredFields: [UserId, DeviceId, KeyId, DeletionMethod]
    
  BULK_OPERATION_STARTED:
    EventId: 4003
    Description: "一括処理の開始"
    RequiredFields: [UserId, OperationType, TargetCount]
    
  BULK_OPERATION_COMPLETED:
    EventId: 4004
    Description: "一括処理の完了"
    RequiredFields: [UserId, OperationType, SuccessCount, FailureCount]
    
  AUTHENTICATION_FAILED:
    EventId: 4005
    Description: "認証失敗"
    RequiredFields: [UserId, AuthMethod, FailureReason]
    
  PERMISSION_DENIED:
    EventId: 4006
    Description: "権限不足"
    RequiredFields: [UserId, RequestedOperation, RequiredPermission]
```

#### 4.5.2.2 監査ログ出力関数
```powershell
function Write-AuditLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [int]$EventId,
        
        [Parameter(Mandatory)]
        [string]$Description,
        
        [Parameter(Mandatory)]
        [hashtable]$AuditData,
        
        [string]$Result = "Success"
    )
    
    $auditEntry = @{
        Timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
        EventId = $EventId
        EventType = "BitLockerKeyManagement"
        Description = $Description
        Result = $Result
        UserId = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
        UserSid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value
        ComputerName = $env:COMPUTERNAME
        ProcessId = $PID
        CorrelationId = [System.Guid]::NewGuid().ToString()
        AuditData = $AuditData
    }
    
    # Windows Event Logに記録
    try {
        $eventParams = @{
            LogName = "Application"
            Source = "BitLockerKeyManager"
            EventId = $EventId
            EntryType = if ($Result -eq "Success") { "Information" } else { "Warning" }
            Message = "$Description`n$($auditEntry | ConvertTo-Json -Depth 3)"
        }
        
        Write-EventLog @eventParams
    }
    catch {
        Write-Warning "Windows Event Log への書き込みに失敗しました: $($_.Exception.Message)"
    }
    
    # 専用監査ログファイルに記録
    $auditLogPath = "C:\Logs\BitLockerKeyManagement\audit-$(Get-Date -Format 'yyyyMM').log"
    $auditDir = Split-Path -Path $auditLogPath -Parent
    if (-not (Test-Path -Path $auditDir)) {
        New-Item -Path $auditDir -ItemType Directory -Force | Out-Null
    }
    
    try {
        $auditJson = $auditEntry | ConvertTo-Json -Compress
        Add-Content -Path $auditLogPath -Value $auditJson -Encoding UTF8
    }
    catch {
        Write-Warning "監査ログファイルへの書き込みに失敗しました: $($_.Exception.Message)"
    }
    
    # SIEM システムへの送信（オプション）
    if ($global:SiemEndpoint) {
        try {
            $headers = @{
                "Content-Type" = "application/json"
                "Authorization" = "Bearer $global:SiemToken"
            }
            
            Invoke-RestMethod -Uri $global:SiemEndpoint -Method POST -Body ($auditEntry | ConvertTo-Json) -Headers $headers
        }
        catch {
            Write-Warning "SIEM システムへの送信に失敗しました: $($_.Exception.Message)"
        }
    }
}

# 使用例
Write-AuditLog -EventId 4002 -Description "回復キーの削除" -AuditData @{
    DeviceId = "12345678-1234-1234-1234-123456789012"
    DeviceName = "PC001"
    KeyId = "87654321-4321-4321-4321-210987654321"
    DeletionMethod = "GraphAPI"
} -Result "Success"
```

### 4.5.3 セキュリティ考慮事項

#### 4.5.3.1 ログの暗号化
```powershell
# ログ暗号化機能
function Protect-LogFile {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$LogFilePath,
        
        [string]$CertificateThumbprint = $null
    )
    
    if (-not $CertificateThumbprint) {
        # 自己署名証明書の作成（開発用）
        $cert = New-SelfSignedCertificate -Subject "CN=BitLockerLogEncryption" -KeyUsage DataEncipherment -Type DocumentEncryptionCert -KeyAlgorithm RSA -KeyLength 2048
        $CertificateThumbprint = $cert.Thumbprint
        Write-Information "新しい暗号化証明書を作成しました: $CertificateThumbprint" -InformationAction Continue
    }
    
    try {
        # ログファイル暗号化
        $content = Get-Content -Path $LogFilePath -Raw -Encoding UTF8
        $encryptedContent = Protect-CmsMessage -Content $content -To $CertificateThumbprint
        
        # 暗号化ファイル保存
        $encryptedPath = "$LogFilePath.encrypted"
        Set-Content -Path $encryptedPath -Value $encryptedContent -Encoding UTF8
        
        # 元ファイル削除
        Remove-Item -Path $LogFilePath -Force
        
        Write-Information "ログファイル暗号化完了: $encryptedPath" -InformationAction Continue
        return $encryptedPath
    }
    catch {
        Write-Error "ログファイル暗号化エラー: $($_.Exception.Message)"
        return $null
    }
}
```

## 4.6 まとめ

本章では、BitLocker回復キー削除のためのPowerShellスクリプト設計について詳しく解説しました。重要なポイントは以下の通りです：

1. **要件定義**: 機能要件・非機能要件の明確化とセキュリティ要件の定義
2. **Microsoft Graph API活用**: 認証からAPI制限対応まで包括的な実装方針
3. **エラーハンドリング**: 体系的なエラー分類と適切な例外処理の実装
4. **ログ・監査**: 構造化ログと監査証跡による透明性とコンプライアンス対応

次章では、これらの設計原則に基づいて、実際に動作するPowerShellスクリプトの実装と検証について詳しく解説します。

---

:::message
**設計原則の重要性**
本章で解説した設計原則は、単なる回復キー削除にとどまらず、企業レベルのセキュリティ運用システム全体に適用可能な知識です。設計段階での十分な検討が、運用時の安定性と信頼性を決定します。
:::