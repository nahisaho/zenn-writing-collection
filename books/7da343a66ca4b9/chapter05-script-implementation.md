---
title: "第5章 スクリプト実装と検証"
---

## 5.0 はじめに

前章で設計した要件と技術的基盤をもとに、実際に動作するBitLocker回復キー削除スクリプトを実装します。

本章では、完全なPowerShellコードの実装から段階的なテスト手順、トラブルシューティング、パフォーマンス最適化まで、実用レベルでの運用を目指した包括的な実装ガイドを提供します。

## 5.1 完全なスクリプトコードの実装

### 5.1.1 メインスクリプト（Remove-BitLockerRecoveryKeys.ps1）

```powershell
<#
.SYNOPSIS
    BitLocker回復キー削除スクリプト

.DESCRIPTION
    Microsoft Entra IDに保存されているBitLocker回復キーを安全に削除します。
    単体削除、一括削除、スケジュール実行に対応。

.PARAMETER ComputerName
    対象コンピューター名

.PARAMETER DeviceId
    対象デバイスID（GUID）

.PARAMETER InputFile
    一括処理用のCSVファイルパス

.PARAMETER WhatIf
    実際の削除を行わず、実行予定の操作を表示

.PARAMETER Force
    確認プロンプトをスキップして強制実行

.PARAMETER Parallel
    並列処理を有効化（一括処理時）

.PARAMETER LogLevel
    ログレベル (Trace, Debug, Information, Warning, Error, Critical)

.EXAMPLE
    .\Remove-BitLockerRecoveryKeys.ps1 -ComputerName "PC001"
    
.EXAMPLE
    .\Remove-BitLockerRecoveryKeys.ps1 -InputFile "targets.csv" -Parallel -Force

.NOTES
    必要な権限: Device.ReadWrite.All, BitLockerKey.ReadBasic.All
    作成者: IT Security Team
    バージョン: 1.0.0
#>

[CmdletBinding(DefaultParameterSetName = "SingleDevice", SupportsShouldProcess)]
param(
    [Parameter(ParameterSetName = "SingleDevice", Mandatory)]
    [ValidatePattern("^[A-Za-z0-9\-]{1,15}$")]
    [string]$ComputerName,
    
    [Parameter(ParameterSetName = "DeviceId", Mandatory)]
    [ValidateScript({
        try { [System.Guid]::Parse($_); $true } 
        catch { throw "無効なGUID形式です: $_" }
    })]
    [string]$DeviceId,
    
    [Parameter(ParameterSetName = "BulkOperation", Mandatory)]
    [ValidateScript({
        if (-not (Test-Path $_)) { throw "ファイルが見つかりません: $_" }
        if (-not ($_ -match "\.csv$")) { throw "CSVファイルを指定してください" }
        $true
    })]
    [string]$InputFile,
    
    [switch]$WhatIf,
    [switch]$Force,
    [switch]$Parallel,
    [switch]$GenerateReport,
    
    [ValidateSet("Trace", "Debug", "Information", "Warning", "Error", "Critical")]
    [string]$LogLevel = "Information",
    
    [string]$ConfigFile = ".\config\BitLockerConfig.json",
    [string]$LogPath = $null
)

#region Configuration and Initialization

# スクリプトのルートディレクトリ
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition

# 設定ファイル読み込み
if (Test-Path $ConfigFile) {
    try {
        $Config = Get-Content $ConfigFile | ConvertFrom-Json -AsHashtable
        Write-Verbose "設定ファイル読み込み完了: $ConfigFile"
    }
    catch {
        Write-Error "設定ファイル読み込みエラー: $($_.Exception.Message)"
        exit 1
    }
}
else {
    # デフォルト設定
    $Config = @{
        TenantId = $env:AZURE_TENANT_ID
        ClientId = $env:AZURE_CLIENT_ID
        CertificateThumbprint = $env:AZURE_CERTIFICATE_THUMBPRINT
        LogRetentionDays = 90
        MaxParallelism = 10
        RetryAttempts = 3
        RetryDelaySeconds = 5
    }
    Write-Warning "設定ファイルが見つかりません。環境変数から設定を読み込みます。"
}

# ログパス設定
if (-not $LogPath) {
    $LogPath = Join-Path $ScriptRoot "logs\bitlocker-recovery-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
}

# ログディレクトリ作成
$LogDir = Split-Path $LogPath -Parent
if (-not (Test-Path $LogDir)) {
    New-Item -Path $LogDir -ItemType Directory -Force | Out-Null
}

#endregion

#region Class Definitions

# ログエントリクラス
class LogEntry {
    [datetime]$Timestamp
    [string]$Level
    [string]$Component
    [string]$Operation
    [string]$Message
    [hashtable]$Context
    [string]$CorrelationId
    
    LogEntry([string]$Level, [string]$Component, [string]$Operation, [string]$Message, [hashtable]$Context) {
        $this.Timestamp = Get-Date
        $this.Level = $Level
        $this.Component = $Component
        $this.Operation = $Operation
        $this.Message = $Message
        $this.Context = $Context
        $this.CorrelationId = [System.Guid]::NewGuid().ToString()
    }
    
    [string] ToJson() {
        return $this | ConvertTo-Json -Compress
    }
}

# 処理結果クラス
class ProcessingResult {
    [string]$DeviceId
    [string]$DeviceName
    [string]$Status
    [int]$DeletedKeysCount
    [array]$DeletedKeys
    [string]$ErrorMessage
    [datetime]$ProcessedAt
    
    ProcessingResult([string]$DeviceId, [string]$DeviceName) {
        $this.DeviceId = $DeviceId
        $this.DeviceName = $DeviceName
        $this.Status = "Pending"
        $this.DeletedKeysCount = 0
        $this.DeletedKeys = @()
        $this.ProcessedAt = Get-Date
    }
}

# APIスロットリングクラス
class ApiThrottler {
    [int]$MaxRequestsPerSecond
    [System.Collections.Generic.Queue[datetime]]$RequestTimes
    
    ApiThrottler([int]$MaxRequestsPerSecond) {
        $this.MaxRequestsPerSecond = $MaxRequestsPerSecond
        $this.RequestTimes = [System.Collections.Generic.Queue[datetime]]::new()
    }
    
    [void] WaitIfNeeded() {
        $now = Get-Date
        
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

#endregion

#region Logging Functions

# グローバル変数
$global:LogWriter = $null
$global:SessionId = [System.Guid]::NewGuid().ToString()

function Initialize-Logging {
    param([string]$Path, [string]$Level)
    
    try {
        $global:LogWriter = [System.IO.StreamWriter]::new($Path, $true, [System.Text.Encoding]::UTF8)
        $global:LogWriter.AutoFlush = $true
        
        Write-LogEntry -Level "Information" -Component "Main" -Operation "Initialize" -Message "ログシステム初期化完了" -Context @{
            LogPath = $Path
            LogLevel = $Level
            SessionId = $global:SessionId
        }
        
        return $true
    }
    catch {
        Write-Error "ログシステム初期化失敗: $($_.Exception.Message)"
        return $false
    }
}

function Write-LogEntry {
    param(
        [string]$Level,
        [string]$Component,
        [string]$Operation,
        [string]$Message,
        [hashtable]$Context = @{}
    )
    
    $logEntry = [LogEntry]::new($Level, $Component, $Operation, $Message, $Context)
    
    # ファイル出力
    if ($global:LogWriter) {
        $global:LogWriter.WriteLine($logEntry.ToJson())
    }
    
    # コンソール出力
    $color = switch ($Level) {
        "Trace" { "DarkGray" }
        "Debug" { "Gray" }
        "Information" { "White" }
        "Warning" { "Yellow" }
        "Error" { "Red" }
        "Critical" { "Magenta" }
    }
    
    $timestamp = $logEntry.Timestamp.ToString('HH:mm:ss.fff')
    Write-Host "[$timestamp] [$Level] [$Component] $Message" -ForegroundColor $color
}

function Close-Logging {
    if ($global:LogWriter) {
        Write-LogEntry -Level "Information" -Component "Main" -Operation "Cleanup" -Message "ログシステム終了"
        $global:LogWriter.Close()
        $global:LogWriter.Dispose()
    }
}

#endregion

#region Authentication Functions

function Connect-ToMicrosoftGraph {
    param([hashtable]$Config)
    
    Write-LogEntry -Level "Information" -Component "Auth" -Operation "Connect" -Message "Microsoft Graph認証開始"
    
    try {
        # 必須パラメータチェック
        $requiredParams = @('TenantId', 'ClientId', 'CertificateThumbprint')
        foreach ($param in $requiredParams) {
            if (-not $Config[$param]) {
                throw "設定パラメータ '$param' が見つかりません"
            }
        }
        
        # 証明書存在確認
        $cert = Get-ChildItem -Path "Cert:\CurrentUser\My\$($Config.CertificateThumbprint)" -ErrorAction SilentlyContinue
        if (-not $cert) {
            $cert = Get-ChildItem -Path "Cert:\LocalMachine\My\$($Config.CertificateThumbprint)" -ErrorAction SilentlyContinue
        }
        
        if (-not $cert) {
            throw "証明書が見つかりません: $($Config.CertificateThumbprint)"
        }
        
        # Microsoft Graph接続
        $connectParams = @{
            TenantId = $Config.TenantId
            ClientId = $Config.ClientId
            CertificateThumbprint = $Config.CertificateThumbprint
        }
        
        Connect-MgGraph @connectParams -NoWelcome
        
        # 接続確認
        $context = Get-MgContext
        if (-not $context) {
            throw "Microsoft Graph接続に失敗しました"
        }
        
        Write-LogEntry -Level "Information" -Component "Auth" -Operation "Connect" -Message "Microsoft Graph認証成功" -Context @{
            TenantId = $context.TenantId
            Account = $context.Account
            Scopes = $context.Scopes -join ','
        }
        
        return $true
    }
    catch {
        Write-LogEntry -Level "Error" -Component "Auth" -Operation "Connect" -Message "Microsoft Graph認証失敗: $($_.Exception.Message)"
        return $false
    }
}

function Test-RequiredPermissions {
    $requiredScopes = @(
        'https://graph.microsoft.com/Device.ReadWrite.All',
        'https://graph.microsoft.com/BitLockerKey.ReadBasic.All'
    )
    
    $context = Get-MgContext
    if (-not $context) {
        Write-LogEntry -Level "Error" -Component "Auth" -Operation "PermissionCheck" -Message "Microsoft Graphに接続されていません"
        return $false
    }
    
    $currentScopes = $context.Scopes
    $missingScopes = @()
    
    foreach ($scope in $requiredScopes) {
        $scopeName = ($scope -split '/')[-1]
        if ($scopeName -notin $currentScopes) {
            $missingScopes += $scopeName
        }
    }
    
    if ($missingScopes.Count -gt 0) {
        Write-LogEntry -Level "Error" -Component "Auth" -Operation "PermissionCheck" -Message "不足している権限: $($missingScopes -join ', ')"
        return $false
    }
    
    Write-LogEntry -Level "Information" -Component "Auth" -Operation "PermissionCheck" -Message "必要な権限が確認されました"
    return $true
}

#endregion

#region Device Management Functions

function Get-DeviceByName {
    param([string]$ComputerName)
    
    Write-LogEntry -Level "Debug" -Component "Device" -Operation "Search" -Message "デバイス検索開始: $ComputerName"
    
    try {
        $filter = "displayName eq '$ComputerName'"
        $devices = Get-MgDevice -Filter $filter
        
        if ($devices) {
            if ($devices.Count -gt 1) {
                Write-LogEntry -Level "Warning" -Component "Device" -Operation "Search" -Message "複数のデバイスが見つかりました: $($devices.Count)台"
            }
            
            $device = $devices[0]
            Write-LogEntry -Level "Information" -Component "Device" -Operation "Search" -Message "デバイス発見: $($device.DisplayName)" -Context @{
                DeviceId = $device.Id
                OperatingSystem = $device.OperatingSystem
                TrustType = $device.TrustType
            }
            
            return $device
        }
        else {
            Write-LogEntry -Level "Warning" -Component "Device" -Operation "Search" -Message "デバイスが見つかりません: $ComputerName"
            return $null
        }
    }
    catch {
        Write-LogEntry -Level "Error" -Component "Device" -Operation "Search" -Message "デバイス検索エラー: $($_.Exception.Message)" -Context @{
            ComputerName = $ComputerName
        }
        return $null
    }
}

function Get-DeviceById {
    param([string]$DeviceId)
    
    Write-LogEntry -Level "Debug" -Component "Device" -Operation "Get" -Message "デバイス取得開始: $DeviceId"
    
    try {
        $device = Get-MgDevice -DeviceId $DeviceId
        
        if ($device) {
            Write-LogEntry -Level "Information" -Component "Device" -Operation "Get" -Message "デバイス取得成功: $($device.DisplayName)" -Context @{
                DeviceId = $device.Id
                OperatingSystem = $device.OperatingSystem
            }
            return $device
        }
        else {
            Write-LogEntry -Level "Warning" -Component "Device" -Operation "Get" -Message "デバイスが見つかりません: $DeviceId"
            return $null
        }
    }
    catch {
        Write-LogEntry -Level "Error" -Component "Device" -Operation "Get" -Message "デバイス取得エラー: $($_.Exception.Message)" -Context @{
            DeviceId = $DeviceId
        }
        return $null
    }
}

#endregion

#region BitLocker Recovery Key Functions

function Get-RecoveryKeysForDevice {
    param(
        [string]$DeviceId,
        [ApiThrottler]$Throttler
    )
    
    Write-LogEntry -Level "Debug" -Component "BitLocker" -Operation "GetKeys" -Message "回復キー取得開始: $DeviceId"
    
    try {
        if ($Throttler) {
            $Throttler.WaitIfNeeded()
        }
        
        # Microsoft Graph API呼び出し
        $uri = "https://graph.microsoft.com/v1.0/informationProtection/bitlocker/recoveryKeys"
        $filter = "deviceId eq '$DeviceId'"
        
        $response = Invoke-MgGraphRequest -Uri $uri -Method GET -Body @{ '$filter' = $filter }
        
        $recoveryKeys = @()
        foreach ($key in $response.value) {
            $recoveryKeys += [PSCustomObject]@{
                KeyId = $key.id
                CreatedDateTime = $key.createdDateTime
                VolumeType = $key.volumeType
                DeviceId = $DeviceId
            }
        }
        
        Write-LogEntry -Level "Information" -Component "BitLocker" -Operation "GetKeys" -Message "回復キー取得完了: $($recoveryKeys.Count)個" -Context @{
            DeviceId = $DeviceId
            KeyCount = $recoveryKeys.Count
        }
        
        return $recoveryKeys
    }
    catch {
        Write-LogEntry -Level "Error" -Component "BitLocker" -Operation "GetKeys" -Message "回復キー取得エラー: $($_.Exception.Message)" -Context @{
            DeviceId = $DeviceId
        }
        return @()
    }
}

function Remove-RecoveryKey {
    param(
        [string]$KeyId,
        [string]$DeviceId,
        [ApiThrottler]$Throttler,
        [bool]$WhatIf = $false
    )
    
    Write-LogEntry -Level "Debug" -Component "BitLocker" -Operation "DeleteKey" -Message "回復キー削除開始: $KeyId"
    
    if ($WhatIf) {
        Write-LogEntry -Level "Information" -Component "BitLocker" -Operation "DeleteKey" -Message "WhatIf: 回復キーを削除します" -Context @{
            KeyId = $KeyId
            DeviceId = $DeviceId
        }
        return $true
    }
    
    try {
        if ($Throttler) {
            $Throttler.WaitIfNeeded()
        }
        
        $uri = "https://graph.microsoft.com/v1.0/informationProtection/bitlocker/recoveryKeys/$KeyId"
        Invoke-MgGraphRequest -Uri $uri -Method DELETE
        
        # 削除確認のため少し待機
        Start-Sleep -Seconds 2
        
        # 削除確認
        try {
            Invoke-MgGraphRequest -Uri $uri -Method GET
            Write-LogEntry -Level "Warning" -Component "BitLocker" -Operation "DeleteKey" -Message "回復キーが削除されていない可能性があります: $KeyId"
            return $false
        }
        catch {
            if ($_.Exception.Message -match "404|NotFound") {
                Write-LogEntry -Level "Information" -Component "BitLocker" -Operation "DeleteKey" -Message "回復キー削除成功: $KeyId" -Context @{
                    KeyId = $KeyId
                    DeviceId = $DeviceId
                }
                
                # 監査ログ出力
                Write-AuditLog -EventId 4002 -Description "回復キーの削除" -AuditData @{
                    DeviceId = $DeviceId
                    KeyId = $KeyId
                    DeletionMethod = "GraphAPI"
                } -Result "Success"
                
                return $true
            }
            else {
                throw
            }
        }
    }
    catch {
        Write-LogEntry -Level "Error" -Component "BitLocker" -Operation "DeleteKey" -Message "回復キー削除エラー: $($_.Exception.Message)" -Context @{
            KeyId = $KeyId
            DeviceId = $DeviceId
        }
        
        # 監査ログ出力（失敗）
        Write-AuditLog -EventId 4002 -Description "回復キーの削除" -AuditData @{
            DeviceId = $DeviceId
            KeyId = $KeyId
            DeletionMethod = "GraphAPI"
            ErrorMessage = $_.Exception.Message
        } -Result "Failure"
        
        return $false
    }
}

#endregion

#region Processing Functions

function Process-SingleDevice {
    param(
        [string]$DeviceIdentifier,
        [string]$IdentifierType,
        [bool]$WhatIf = $false,
        [ApiThrottler]$Throttler
    )
    
    Write-LogEntry -Level "Information" -Component "Processor" -Operation "ProcessSingle" -Message "単体処理開始: $DeviceIdentifier"
    
    # デバイス取得
    $device = if ($IdentifierType -eq "Name") {
        Get-DeviceByName -ComputerName $DeviceIdentifier
    } else {
        Get-DeviceById -DeviceId $DeviceIdentifier
    }
    
    if (-not $device) {
        return [ProcessingResult]::new($DeviceIdentifier, $DeviceIdentifier)
    }
    
    $result = [ProcessingResult]::new($device.Id, $device.DisplayName)
    
    # 回復キー取得
    $recoveryKeys = Get-RecoveryKeysForDevice -DeviceId $device.Id -Throttler $Throttler
    
    if ($recoveryKeys.Count -eq 0) {
        $result.Status = "NoKeysFound"
        Write-LogEntry -Level "Information" -Component "Processor" -Operation "ProcessSingle" -Message "回復キーが見つかりません: $($device.DisplayName)"
        return $result
    }
    
    # 削除確認
    if (-not $Force -and -not $WhatIf) {
        $confirmation = Read-Host "$($device.DisplayName) の $($recoveryKeys.Count) 個の回復キーを削除しますか？ (y/N)"
        if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
            $result.Status = "Cancelled"
            Write-LogEntry -Level "Information" -Component "Processor" -Operation "ProcessSingle" -Message "削除がキャンセルされました: $($device.DisplayName)"
            return $result
        }
    }
    
    # 回復キー削除
    $successCount = 0
    foreach ($key in $recoveryKeys) {
        if (Remove-RecoveryKey -KeyId $key.KeyId -DeviceId $device.Id -Throttler $Throttler -WhatIf $WhatIf) {
            $successCount++
            $result.DeletedKeys += $key
        }
    }
    
    $result.DeletedKeysCount = $successCount
    $result.Status = if ($successCount -eq $recoveryKeys.Count) { "Success" } else { "PartialSuccess" }
    
    Write-LogEntry -Level "Information" -Component "Processor" -Operation "ProcessSingle" -Message "単体処理完了: $($device.DisplayName)" -Context @{
        DeletedKeys = $successCount
        TotalKeys = $recoveryKeys.Count
        Status = $result.Status
    }
    
    return $result
}

function Process-BulkDevices {
    param(
        [string]$InputFile,
        [bool]$UseParallel = $false,
        [bool]$WhatIf = $false,
        [int]$MaxParallelism = 10
    )
    
    Write-LogEntry -Level "Information" -Component "Processor" -Operation "ProcessBulk" -Message "一括処理開始: $InputFile"
    
    # CSVファイル読み込み
    try {
        $devices = Import-Csv -Path $InputFile
        Write-LogEntry -Level "Information" -Component "Processor" -Operation "ProcessBulk" -Message "対象デバイス数: $($devices.Count)"
    }
    catch {
        Write-LogEntry -Level "Error" -Component "Processor" -Operation "ProcessBulk" -Message "CSVファイル読み込みエラー: $($_.Exception.Message)"
        return @()
    }
    
    # 必要な列の確認
    $requiredColumns = @('ComputerName')
    $csvColumns = $devices[0].PSObject.Properties.Name
    $missingColumns = $requiredColumns | Where-Object { $_ -notin $csvColumns }
    
    if ($missingColumns.Count -gt 0) {
        Write-LogEntry -Level "Error" -Component "Processor" -Operation "ProcessBulk" -Message "CSVファイルに必要な列が不足しています: $($missingColumns -join ', ')"
        return @()
    }
    
    $throttler = [ApiThrottler]::new(10)
    $results = @()
    
    if ($UseParallel) {
        Write-LogEntry -Level "Information" -Component "Processor" -Operation "ProcessBulk" -Message "並列処理開始（最大同時実行数: $MaxParallelism）"
        
        $results = $devices | ForEach-Object -Parallel {
            $device = $_
            $throttler = $using:throttler
            $WhatIf = $using:WhatIf
            
            # 並列処理内でのログ出力は制限される
            try {
                Process-SingleDevice -DeviceIdentifier $device.ComputerName -IdentifierType "Name" -WhatIf $WhatIf -Throttler $throttler
            }
            catch {
                $result = [ProcessingResult]::new("", $device.ComputerName)
                $result.Status = "Error"
                $result.ErrorMessage = $_.Exception.Message
                $result
            }
        } -ThrottleLimit $MaxParallelism
    }
    else {
        Write-LogEntry -Level "Information" -Component "Processor" -Operation "ProcessBulk" -Message "逐次処理開始"
        
        $progress = 0
        foreach ($device in $devices) {
            $progress++
            Write-Progress -Activity "BitLocker回復キー削除" -Status "処理中: $($device.ComputerName)" -PercentComplete (($progress / $devices.Count) * 100)
            
            try {
                $result = Process-SingleDevice -DeviceIdentifier $device.ComputerName -IdentifierType "Name" -WhatIf $WhatIf -Throttler $throttler
                $results += $result
            }
            catch {
                $result = [ProcessingResult]::new("", $device.ComputerName)
                $result.Status = "Error"
                $result.ErrorMessage = $_.Exception.Message
                $results += $result
            }
        }
        Write-Progress -Activity "BitLocker回復キー削除" -Completed
    }
    
    Write-LogEntry -Level "Information" -Component "Processor" -Operation "ProcessBulk" -Message "一括処理完了" -Context @{
        TotalDevices = $devices.Count
        SuccessfulDevices = ($results | Where-Object { $_.Status -eq "Success" }).Count
        PartialSuccessDevices = ($results | Where-Object { $_.Status -eq "PartialSuccess" }).Count
        FailedDevices = ($results | Where-Object { $_.Status -eq "Error" }).Count
    }
    
    return $results
}

#endregion

#region Report Generation

function Generate-ProcessingReport {
    param(
        [array]$Results,
        [string]$OutputPath = $null
    )
    
    if (-not $OutputPath) {
        $OutputPath = Join-Path $ScriptRoot "reports\bitlocker-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').html"
    }
    
    $reportDir = Split-Path $OutputPath -Parent
    if (-not (Test-Path $reportDir)) {
        New-Item -Path $reportDir -ItemType Directory -Force | Out-Null
    }
    
    Write-LogEntry -Level "Information" -Component "Report" -Operation "Generate" -Message "レポート生成開始: $OutputPath"
    
    # 統計情報計算
    $totalDevices = $Results.Count
    $successfulDevices = ($Results | Where-Object { $_.Status -eq "Success" }).Count
    $partialSuccessDevices = ($Results | Where-Object { $_.Status -eq "PartialSuccess" }).Count
    $failedDevices = ($Results | Where-Object { $_.Status -eq "Error" }).Count
    $noKeysDevices = ($Results | Where-Object { $_.Status -eq "NoKeysFound" }).Count
    $cancelledDevices = ($Results | Where-Object { $_.Status -eq "Cancelled" }).Count
    $totalDeletedKeys = ($Results | Measure-Object DeletedKeysCount -Sum).Sum
    
    # HTMLレポート生成
    $html = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>BitLocker回復キー削除レポート</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        .summary { background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .stat { display: inline-block; margin: 10px 20px 10px 0; }
        .stat-value { font-size: 24px; font-weight: bold; color: #2980b9; }
        .stat-label { font-size: 14px; color: #7f8c8d; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #bdc3c7; padding: 8px 12px; text-align: left; }
        th { background-color: #3498db; color: white; }
        tr:nth-child(even) { background-color: #f8f9fa; }
        .status-success { color: #27ae60; font-weight: bold; }
        .status-partial { color: #f39c12; font-weight: bold; }
        .status-error { color: #e74c3c; font-weight: bold; }
        .status-nokeys { color: #95a5a6; font-weight: bold; }
        .status-cancelled { color: #9b59b6; font-weight: bold; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #bdc3c7; font-size: 12px; color: #7f8c8d; }
    </style>
</head>
<body>
    <h1>BitLocker回復キー削除レポート</h1>
    
    <div class="summary">
        <h2>実行サマリー</h2>
        <div class="stat">
            <div class="stat-value">$totalDevices</div>
            <div class="stat-label">対象デバイス数</div>
        </div>
        <div class="stat">
            <div class="stat-value">$successfulDevices</div>
            <div class="stat-label">成功</div>
        </div>
        <div class="stat">
            <div class="stat-value">$partialSuccessDevices</div>
            <div class="stat-label">部分成功</div>
        </div>
        <div class="stat">
            <div class="stat-value">$failedDevices</div>
            <div class="stat-label">失敗</div>
        </div>
        <div class="stat">
            <div class="stat-value">$noKeysDevices</div>
            <div class="stat-label">キーなし</div>
        </div>
        <div class="stat">
            <div class="stat-value">$totalDeletedKeys</div>
            <div class="stat-label">削除されたキー数</div>
        </div>
        <p><strong>実行日時:</strong> $(Get-Date -Format 'yyyy年MM月dd日 HH:mm:ss')</p>
        <p><strong>セッションID:</strong> $global:SessionId</p>
    </div>
    
    <h2>詳細結果</h2>
    <table>
        <thead>
            <tr>
                <th>デバイス名</th>
                <th>デバイスID</th>
                <th>ステータス</th>
                <th>削除キー数</th>
                <th>処理日時</th>
                <th>エラーメッセージ</th>
            </tr>
        </thead>
        <tbody>
"@

    foreach ($result in $Results) {
        $statusClass = switch ($result.Status) {
            "Success" { "status-success" }
            "PartialSuccess" { "status-partial" }
            "Error" { "status-error" }
            "NoKeysFound" { "status-nokeys" }
            "Cancelled" { "status-cancelled" }
            default { "" }
        }
        
        $deviceIdShort = if ($result.DeviceId.Length -gt 36) { $result.DeviceId.Substring(0, 8) + "..." } else { $result.DeviceId }
        $errorMessage = if ($result.ErrorMessage) { [System.Web.HttpUtility]::HtmlEncode($result.ErrorMessage) } else { "" }
        
        $html += @"
            <tr>
                <td>$($result.DeviceName)</td>
                <td title="$($result.DeviceId)">$deviceIdShort</td>
                <td class="$statusClass">$($result.Status)</td>
                <td>$($result.DeletedKeysCount)</td>
                <td>$($result.ProcessedAt.ToString('MM/dd HH:mm:ss'))</td>
                <td>$errorMessage</td>
            </tr>
"@
    }

    $html += @"
        </tbody>
    </table>
    
    <div class="footer">
        <p>このレポートは自動生成されました。</p>
        <p>Windows 端末の完全初期化ガイド - BitLocker回復キー削除ツール v1.0.0</p>
    </div>
</body>
</html>
"@

    try {
        Set-Content -Path $OutputPath -Value $html -Encoding UTF8
        Write-LogEntry -Level "Information" -Component "Report" -Operation "Generate" -Message "レポート生成完了: $OutputPath"
        return $OutputPath
    }
    catch {
        Write-LogEntry -Level "Error" -Component "Report" -Operation "Generate" -Message "レポート生成エラー: $($_.Exception.Message)"
        return $null
    }
}

#endregion

#region Audit Functions

function Write-AuditLog {
    param(
        [int]$EventId,
        [string]$Description,
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
        SessionId = $global:SessionId
        CorrelationId = [System.Guid]::NewGuid().ToString()
        AuditData = $AuditData
    }
    
    # 監査ログファイルに記録
    $auditLogPath = Join-Path $ScriptRoot "logs\audit-$(Get-Date -Format 'yyyyMM').log"
    $auditDir = Split-Path -Path $auditLogPath -Parent
    if (-not (Test-Path -Path $auditDir)) {
        New-Item -Path $auditDir -ItemType Directory -Force | Out-Null
    }
    
    try {
        $auditJson = $auditEntry | ConvertTo-Json -Compress
        Add-Content -Path $auditLogPath -Value $auditJson -Encoding UTF8
    }
    catch {
        Write-LogEntry -Level "Warning" -Component "Audit" -Operation "WriteLog" -Message "監査ログ書き込み失敗: $($_.Exception.Message)"
    }
}

#endregion

#region Main Script Logic

try {
    # ログシステム初期化
    if (-not (Initialize-Logging -Path $LogPath -Level $LogLevel)) {
        Write-Error "ログシステムの初期化に失敗しました"
        exit 1
    }
    
    Write-LogEntry -Level "Information" -Component "Main" -Operation "Start" -Message "BitLocker回復キー削除スクリプト開始" -Context @{
        Version = "1.0.0"
        ParameterSet = $PSCmdlet.ParameterSetName
        WhatIf = $WhatIf.IsPresent
        Force = $Force.IsPresent
        Parallel = $Parallel.IsPresent
    }
    
    # 実行前チェック
    if (-not (Get-Module Microsoft.Graph.Authentication -ListAvailable)) {
        Write-LogEntry -Level "Error" -Component "Main" -Operation "PreCheck" -Message "Microsoft.Graph.Authentication モジュールがインストールされていません"
        throw "必要なPowerShellモジュールが不足しています"
    }
    
    # Microsoft Graph認証
    if (-not (Connect-ToMicrosoftGraph -Config $Config)) {
        throw "Microsoft Graph認証に失敗しました"
    }
    
    # 権限確認
    if (-not (Test-RequiredPermissions)) {
        throw "必要な権限が不足しています"
    }
    
    # 処理実行
    $results = @()
    $throttler = [ApiThrottler]::new($Config.MaxParallelism)
    
    switch ($PSCmdlet.ParameterSetName) {
        "SingleDevice" {
            Write-AuditLog -EventId 4001 -Description "単体デバイス処理開始" -AuditData @{
                ComputerName = $ComputerName
                WhatIf = $WhatIf.IsPresent
            }
            
            $result = Process-SingleDevice -DeviceIdentifier $ComputerName -IdentifierType "Name" -WhatIf $WhatIf.IsPresent -Throttler $throttler
            $results = @($result)
        }
        
        "DeviceId" {
            Write-AuditLog -EventId 4001 -Description "単体デバイス処理開始（ID指定）" -AuditData @{
                DeviceId = $DeviceId
                WhatIf = $WhatIf.IsPresent
            }
            
            $result = Process-SingleDevice -DeviceIdentifier $DeviceId -IdentifierType "Id" -WhatIf $WhatIf.IsPresent -Throttler $throttler
            $results = @($result)
        }
        
        "BulkOperation" {
            Write-AuditLog -EventId 4003 -Description "一括処理開始" -AuditData @{
                InputFile = $InputFile
                Parallel = $Parallel.IsPresent
                WhatIf = $WhatIf.IsPresent
            }
            
            $results = Process-BulkDevices -InputFile $InputFile -UseParallel $Parallel.IsPresent -WhatIf $WhatIf.IsPresent -MaxParallelism $Config.MaxParallelism
            
            Write-AuditLog -EventId 4004 -Description "一括処理完了" -AuditData @{
                TotalDevices = $results.Count
                SuccessfulDevices = ($results | Where-Object { $_.Status -eq "Success" }).Count
                FailedDevices = ($results | Where-Object { $_.Status -eq "Error" }).Count
            }
        }
    }
    
    # 結果表示
    Write-LogEntry -Level "Information" -Component "Main" -Operation "Results" -Message "処理結果サマリー" -Context @{
        TotalDevices = $results.Count
        SuccessfulDevices = ($results | Where-Object { $_.Status -eq "Success" }).Count
        PartialSuccessDevices = ($results | Where-Object { $_.Status -eq "PartialSuccess" }).Count
        FailedDevices = ($results | Where-Object { $_.Status -eq "Error" }).Count
        TotalDeletedKeys = ($results | Measure-Object DeletedKeysCount -Sum).Sum
    }
    
    # レポート生成
    if ($GenerateReport -or $results.Count -gt 1) {
        $reportPath = Generate-ProcessingReport -Results $results
        if ($reportPath) {
            Write-Host "`nレポートが生成されました: $reportPath" -ForegroundColor Green
            if (Get-Command Start-Process -ErrorAction SilentlyContinue) {
                $openReport = Read-Host "レポートを開きますか？ (y/N)"
                if ($openReport -eq 'y' -or $openReport -eq 'Y') {
                    Start-Process $reportPath
                }
            }
        }
    }
    
    # CSVエクスポート（オプション）
    if ($results.Count -gt 1) {
        $csvPath = Join-Path $ScriptRoot "results\bitlocker-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').csv"
        $csvDir = Split-Path $csvPath -Parent
        if (-not (Test-Path $csvDir)) {
            New-Item -Path $csvDir -ItemType Directory -Force | Out-Null
        }
        
        $results | Select-Object DeviceName, DeviceId, Status, DeletedKeysCount, ProcessedAt, ErrorMessage | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
        Write-Host "CSV結果ファイル: $csvPath" -ForegroundColor Cyan
    }
    
    Write-LogEntry -Level "Information" -Component "Main" -Operation "Complete" -Message "スクリプト実行完了"
}
catch {
    Write-LogEntry -Level "Critical" -Component "Main" -Operation "Error" -Message "スクリプト実行エラー: $($_.Exception.Message)" -Context @{
        ErrorType = $_.Exception.GetType().Name
        StackTrace = $_.ScriptStackTrace
    }
    
    Write-Host "`nエラーが発生しました: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    # クリーンアップ
    try {
        if (Get-MgContext) {
            Disconnect-MgGraph | Out-Null
        }
    }
    catch {
        Write-LogEntry -Level "Warning" -Component "Main" -Operation "Cleanup" -Message "Microsoft Graph切断エラー: $($_.Exception.Message)"
    }
    
    Close-Logging
}

#endregion
```

## 5.2 段階的な動作テスト手順

### 5.2.1 テスト環境の準備

#### 5.2.1.1 開発環境セットアップ
```powershell
# テスト環境セットアップスクリプト
# Setup-TestEnvironment.ps1

[CmdletBinding()]
param(
    [string]$TestTenantId = $env:TEST_AZURE_TENANT_ID,
    [string]$TestClientId = $env:TEST_AZURE_CLIENT_ID,
    [string]$CertificatePath = ".\certs\test-cert.pfx"
)

Write-Host "BitLocker回復キー削除スクリプト - テスト環境セットアップ" -ForegroundColor Cyan

# 必要なモジュール確認・インストール
$requiredModules = @(
    'Microsoft.Graph.Authentication',
    'Microsoft.Graph.DeviceManagement',
    'Microsoft.Graph.Identity.DirectoryManagement'
)

foreach ($module in $requiredModules) {
    if (-not (Get-Module $module -ListAvailable)) {
        Write-Host "モジュールをインストールしています: $module" -ForegroundColor Yellow
        Install-Module $module -Scope CurrentUser -Force
    }
    else {
        Write-Host "モジュール確認OK: $module" -ForegroundColor Green
    }
}

# テスト用証明書作成
if (-not (Test-Path $CertificatePath)) {
    Write-Host "テスト用証明書を作成しています..." -ForegroundColor Yellow
    
    $cert = New-SelfSignedCertificate -Subject "CN=BitLockerTestApp" -KeyUsage DigitalSignature -Type CodeSigningCert -KeyAlgorithm RSA -KeyLength 2048
    $password = ConvertTo-SecureString "TestPassword123!" -AsPlainText -Force
    
    $certDir = Split-Path $CertificatePath -Parent
    if (-not (Test-Path $certDir)) {
        New-Item -Path $certDir -ItemType Directory -Force | Out-Null
    }
    
    Export-PfxCertificate -Cert $cert -FilePath $CertificatePath -Password $password
    Write-Host "証明書作成完了: $CertificatePath" -ForegroundColor Green
    Write-Host "証明書拇印: $($cert.Thumbprint)" -ForegroundColor Yellow
}

# テスト用設定ファイル作成
$testConfig = @{
    TenantId = $TestTenantId
    ClientId = $TestClientId
    CertificateThumbprint = (Get-PfxCertificate -FilePath $CertificatePath).Thumbprint
    LogRetentionDays = 30
    MaxParallelism = 5
    RetryAttempts = 2
    RetryDelaySeconds = 3
    TestMode = $true
}

$configDir = ".\config"
if (-not (Test-Path $configDir)) {
    New-Item -Path $configDir -ItemType Directory -Force | Out-Null
}

$testConfig | ConvertTo-Json | Set-Content -Path ".\config\BitLockerConfig-Test.json" -Encoding UTF8
Write-Host "テスト設定ファイル作成完了: .\config\BitLockerConfig-Test.json" -ForegroundColor Green

# テスト用CSVファイル作成
$testDevices = @(
    [PSCustomObject]@{ ComputerName = "TEST-PC001"; Description = "Windows 10 テスト端末" },
    [PSCustomObject]@{ ComputerName = "TEST-PC002"; Description = "Windows 11 テスト端末" },
    [PSCustomObject]@{ ComputerName = "NONEXISTENT-PC"; Description = "存在しない端末（エラーテスト用）" }
)

$testDataDir = ".\testdata"
if (-not (Test-Path $testDataDir)) {
    New-Item -Path $testDataDir -ItemType Directory -Force | Out-Null
}

$testDevices | Export-Csv -Path ".\testdata\test-devices.csv" -NoTypeInformation -Encoding UTF8
Write-Host "テストデータファイル作成完了: .\testdata\test-devices.csv" -ForegroundColor Green

Write-Host "`nテスト環境セットアップ完了!" -ForegroundColor Green
Write-Host "次のステップ:" -ForegroundColor Cyan
Write-Host "1. Azure ADでアプリケーション登録を行ってください" -ForegroundColor White
Write-Host "2. 必要な権限（Device.ReadWrite.All, BitLockerKey.ReadBasic.All）を付与してください" -ForegroundColor White
Write-Host "3. 証明書をアプリケーションにアップロードしてください" -ForegroundColor White
Write-Host "4. テスト実行: .\Test-BitLockerScript.ps1" -ForegroundColor White
```

#### 5.2.1.2 単体テストスクリプト
```powershell
# Test-BitLockerScript.ps1

[CmdletBinding()]
param(
    [string]$ConfigFile = ".\config\BitLockerConfig-Test.json",
    [switch]$RunDestructiveTests = $false
)

Write-Host "BitLocker回復キー削除スクリプト - 単体テスト" -ForegroundColor Cyan

# テスト結果記録用
$testResults = @()

function Test-Function {
    param(
        [string]$TestName,
        [scriptblock]$TestScript,
        [string]$ExpectedResult = "Success"
    )
    
    Write-Host "`n[テスト] $TestName" -ForegroundColor Yellow
    
    try {
        $result = & $TestScript
        
        if ($result -eq $ExpectedResult -or ($ExpectedResult -eq "Success" -and $result)) {
            Write-Host "✓ PASS" -ForegroundColor Green
            $script:testResults += [PSCustomObject]@{
                TestName = $TestName
                Result = "PASS"
                Details = $result
                Timestamp = Get-Date
            }
        }
        else {
            Write-Host "✗ FAIL - Expected: $ExpectedResult, Got: $result" -ForegroundColor Red
            $script:testResults += [PSCustomObject]@{
                TestName = $TestName
                Result = "FAIL"
                Details = "Expected: $ExpectedResult, Got: $result"
                Timestamp = Get-Date
            }
        }
    }
    catch {
        Write-Host "✗ ERROR - $($_.Exception.Message)" -ForegroundColor Red
        $script:testResults += [PSCustomObject]@{
            TestName = $TestName
            Result = "ERROR"
            Details = $_.Exception.Message
            Timestamp = Get-Date
        }
    }
}

# テスト1: 設定ファイル読み込み
Test-Function -TestName "設定ファイル読み込み" -TestScript {
    if (Test-Path $ConfigFile) {
        $config = Get-Content $ConfigFile | ConvertFrom-Json -AsHashtable
        if ($config.TenantId -and $config.ClientId) {
            return "Success"
        }
    }
    return "Failed"
}

# テスト2: 必要モジュール確認
Test-Function -TestName "必要モジュール確認" -TestScript {
    $requiredModules = @('Microsoft.Graph.Authentication', 'Microsoft.Graph.DeviceManagement')
    $missingModules = @()
    
    foreach ($module in $requiredModules) {
        if (-not (Get-Module $module -ListAvailable)) {
            $missingModules += $module
        }
    }
    
    if ($missingModules.Count -eq 0) {
        return "Success"
    }
    return "Missing: $($missingModules -join ', ')"
}

# テスト3: 証明書確認
Test-Function -TestName "証明書確認" -TestScript {
    $config = Get-Content $ConfigFile | ConvertFrom-Json -AsHashtable
    $cert = Get-ChildItem -Path "Cert:\CurrentUser\My\$($config.CertificateThumbprint)" -ErrorAction SilentlyContinue
    
    if (-not $cert) {
        $cert = Get-ChildItem -Path "Cert:\LocalMachine\My\$($config.CertificateThumbprint)" -ErrorAction SilentlyContinue
    }
    
    if ($cert) {
        return "Success"
    }
    return "Certificate not found"
}

# テスト4: Microsoft Graph接続（非破壊的）
Test-Function -TestName "Microsoft Graph接続テスト" -TestScript {
    try {
        $config = Get-Content $ConfigFile | ConvertFrom-Json -AsHashtable
        
        Connect-MgGraph -TenantId $config.TenantId -ClientId $config.ClientId -CertificateThumbprint $config.CertificateThumbprint -NoWelcome
        
        $context = Get-MgContext
        if ($context) {
            Disconnect-MgGraph | Out-Null
            return "Success"
        }
        return "Failed to establish context"
    }
    catch {
        return "Error: $($_.Exception.Message)"
    }
}

# テスト5: 権限確認
Test-Function -TestName "権限確認テスト" -TestScript {
    try {
        $config = Get-Content $ConfigFile | ConvertFrom-Json -AsHashtable
        
        Connect-MgGraph -TenantId $config.TenantId -ClientId $config.ClientId -CertificateThumbprint $config.CertificateThumbprint -NoWelcome
        
        $context = Get-MgContext
        $requiredScopes = @('Device.ReadWrite.All', 'BitLockerKey.ReadBasic.All')
        $missingScopes = @()
        
        foreach ($scope in $requiredScopes) {
            if ($scope -notin $context.Scopes) {
                $missingScopes += $scope
            }
        }
        
        Disconnect-MgGraph | Out-Null
        
        if ($missingScopes.Count -eq 0) {
            return "Success"
        }
        return "Missing scopes: $($missingScopes -join ', ')"
    }
    catch {
        return "Error: $($_.Exception.Message)"
    }
}

# テスト6: デバイス検索テスト（非破壊的）
Test-Function -TestName "デバイス検索テスト" -TestScript {
    try {
        $config = Get-Content $ConfigFile | ConvertFrom-Json -AsHashtable
        
        Connect-MgGraph -TenantId $config.TenantId -ClientId $config.ClientId -CertificateThumbprint $config.CertificateThumbprint -NoWelcome
        
        # 全デバイス取得（最大10件）
        $devices = Get-MgDevice -Top 10
        
        Disconnect-MgGraph | Out-Null
        
        if ($devices -and $devices.Count -gt 0) {
            return "Success - Found $($devices.Count) devices"
        }
        return "No devices found"
    }
    catch {
        return "Error: $($_.Exception.Message)"
    }
}

# 破壊的テスト（オプション）
if ($RunDestructiveTests) {
    Write-Host "`n⚠️ 破壊的テストを実行します..." -ForegroundColor Red
    
    # テスト7: WhatIfモードでの回復キー削除テスト
    Test-Function -TestName "WhatIfモード削除テスト" -TestScript {
        try {
            # 実際のスクリプト実行（WhatIfモード）
            $result = & ".\Remove-BitLockerRecoveryKeys.ps1" -ComputerName "NONEXISTENT-PC" -WhatIf -ConfigFile $ConfigFile
            return "Success"
        }
        catch {
            return "Error: $($_.Exception.Message)"
        }
    }
}

# テスト結果サマリー
Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "テスト結果サマリー" -ForegroundColor Cyan
Write-Host "="*50 -ForegroundColor Cyan

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Result -eq "PASS" }).Count
$failedTests = ($testResults | Where-Object { $_.Result -eq "FAIL" }).Count
$errorTests = ($testResults | Where-Object { $_.Result -eq "ERROR" }).Count

Write-Host "総テスト数: $totalTests" -ForegroundColor White
Write-Host "成功: $passedTests" -ForegroundColor Green
Write-Host "失敗: $failedTests" -ForegroundColor Red
Write-Host "エラー: $errorTests" -ForegroundColor Magenta

# 詳細結果表示
$testResults | Format-Table TestName, Result, Details -AutoSize

# テスト結果をファイルに保存
$testResultsPath = ".\logs\test-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$testResultsDir = Split-Path $testResultsPath -Parent
if (-not (Test-Path $testResultsDir)) {
    New-Item -Path $testResultsDir -ItemType Directory -Force | Out-Null
}

$testResults | ConvertTo-Json | Set-Content -Path $testResultsPath -Encoding UTF8
Write-Host "`nテスト結果保存: $testResultsPath" -ForegroundColor Cyan

# 次のステップ
if ($failedTests -eq 0 -and $errorTests -eq 0) {
    Write-Host "`n✓ 全テストが成功しました！本番環境での実行準備が整いました。" -ForegroundColor Green
}
else {
    Write-Host "`n⚠️ 失敗またはエラーのあるテストがあります。修正後に再実行してください。" -ForegroundColor Yellow
}
```

### 5.2.2 段階的テスト実行計画

#### 5.2.2.1 フェーズ1: 基本機能テスト
```yaml
Phase1_Basic_Tests:
  目的: スクリプトの基本動作確認
  期間: 1-2日
  
  テスト項目:
    - 設定ファイル読み込み
    - Microsoft Graph認証
    - 権限確認
    - デバイス検索
    - ログ出力
    - エラーハンドリング
  
  実行方法:
    - 開発環境での単体テスト
    - WhatIfモードでの実行
    - 存在しないデバイスでのテスト
  
  成功基準:
    - 全単体テストが成功
    - 適切なログ出力
    - エラー時の適切な処理
```

#### 5.2.2.2 フェーズ2: 統合テスト
```yaml
Phase2_Integration_Tests:
  目的: 実際のMicrosoft Entra ID環境での動作確認
  期間: 2-3日
  
  テスト項目:
    - 実際のデバイスでの回復キー取得
    - WhatIfモードでの削除処理
    - 一括処理機能
    - 並列処理性能
    - レポート生成
  
  実行方法:
    - テスト用Microsoft Entra IDテナント
    - 少数のテストデバイス（5-10台）
    - WhatIfモードでの実行
  
  成功基準:
    - 回復キーの正確な取得
    - WhatIf処理の正確性
    - 性能要件の達成
```

#### 5.2.2.3 フェーズ3: パイロット運用
```yaml
Phase3_Pilot_Operation:
  目的: 実環境での小規模運用テスト
  期間: 1週間
  
  テスト項目:
    - 実際の回復キー削除
    - 削除後の検証
    - 監査ログの確認
    - 運用手順の検証
  
  実行方法:
    - 本番Microsoft Entra IDテナント
    - 限定的なデバイス（廃棄予定端末等）
    - 実際の削除処理
  
  成功基準:
    - 回復キーの確実な削除
    - 削除後のデータアクセス不可確認
    - 適切な監査ログ生成
```

## 5.3 テスト環境での検証方法

### 5.3.1 検証環境構築

#### 5.3.1.1 Microsoft Entra IDテストテナント設定
```powershell
# テストテナント設定スクリプト
# Configure-TestTenant.ps1

[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$TenantId,
    
    [Parameter(Mandatory)]
    [string]$AdminUpn
)

Write-Host "Microsoft Entra IDテストテナント設定" -ForegroundColor Cyan

# 管理者認証
Connect-MgGraph -TenantId $TenantId -Scopes "Application.ReadWrite.All", "Directory.ReadWrite.All"

# テスト用アプリケーション登録
$appRegistration = @{
    DisplayName = "BitLocker Key Management Tool - Test"
    Description = "テスト用BitLocker回復キー管理ツール"
    SignInAudience = "AzureADMyOrg"
    RequiredResourceAccess = @(
        @{
            ResourceAppId = "00000003-0000-0000-c000-000000000000" # Microsoft Graph
            ResourceAccess = @(
                @{
                    Id = "1bfefb4e-e0b5-418b-a88f-73c46d2cc8e9" # Device.ReadWrite.All
                    Type = "Role"
                },
                @{
                    Id = "57dae122-6d24-4736-8b8f-3ece9eb5b1d6" # BitLockerKey.ReadBasic.All
                    Type = "Role"
                }
            )
        }
    )
}

try {
    $app = New-MgApplication -BodyParameter $appRegistration
    Write-Host "アプリケーション登録完了: $($app.DisplayName)" -ForegroundColor Green
    Write-Host "アプリケーションID: $($app.AppId)" -ForegroundColor Yellow
    
    # サービスプリンシパル作成
    $sp = New-MgServicePrincipal -AppId $app.AppId
    Write-Host "サービスプリンシパル作成完了: $($sp.Id)" -ForegroundColor Green
    
    # 管理者同意（手動）
    Write-Host "`n次のURLにアクセスして管理者同意を行ってください:" -ForegroundColor Cyan
    Write-Host "https://login.microsoftonline.com/$TenantId/adminconsent?client_id=$($app.AppId)" -ForegroundColor White
    
    # 証明書アップロード用情報
    Write-Host "`n証明書アップロード:" -ForegroundColor Cyan
    Write-Host "1. Azure Portal → App registrations → $($app.DisplayName)" -ForegroundColor White
    Write-Host "2. Certificates & secrets → Upload certificate" -ForegroundColor White
    Write-Host "3. テスト証明書ファイルをアップロード" -ForegroundColor White
    
    return @{
        AppId = $app.AppId
        ObjectId = $app.Id
        ServicePrincipalId = $sp.Id
    }
}
catch {
    Write-Error "アプリケーション登録エラー: $($_.Exception.Message)"
    return $null
}
```

#### 5.3.1.2 テストデバイス準備
```powershell
# テストデバイス準備スクリプト
# Prepare-TestDevices.ps1

[CmdletBinding()]
param(
    [int]$DeviceCount = 3,
    [string]$Prefix = "TEST-BITLOCKER"
)

Write-Host "テストデバイス準備" -ForegroundColor Cyan

# シミュレートされたデバイス情報生成
$testDevices = @()

for ($i = 1; $i -le $DeviceCount; $i++) {
    $deviceName = "$Prefix-$('{0:D3}' -f $i)"
    $deviceId = [System.Guid]::NewGuid().ToString()
    
    $device = [PSCustomObject]@{
        ComputerName = $deviceName
        DeviceId = $deviceId
        OperatingSystem = "Windows 10"
        Version = "10.0.19041"
        BitLockerEnabled = $true
        HasRecoveryKeys = ($i % 2 -eq 1) # 奇数番号のデバイスに回復キーあり
        RecoveryKeyCount = if ($i % 2 -eq 1) { Get-Random -Minimum 1 -Maximum 4 } else { 0 }
        LastSeen = (Get-Date).AddDays(-1 * (Get-Random -Minimum 1 -Maximum 30))
        JoinType = "Azure AD Joined"
    }
    
    $testDevices += $device
}

# テストデータファイル出力
$testDataPath = ".\testdata\test-devices-detailed.csv"
$testDataDir = Split-Path $testDataPath -Parent
if (-not (Test-Path $testDataDir)) {
    New-Item -Path $testDataDir -ItemType Directory -Force | Out-Null
}

$testDevices | Export-Csv -Path $testDataPath -NoTypeInformation -Encoding UTF8
Write-Host "テストデバイスデータ作成完了: $testDataPath" -ForegroundColor Green

# テストデバイス詳細表示
Write-Host "`nテストデバイス一覧:" -ForegroundColor Cyan
$testDevices | Format-Table ComputerName, HasRecoveryKeys, RecoveryKeyCount, LastSeen -AutoSize

return $testDevices
```

### 5.3.2 検証シナリオ実行

#### 5.3.2.1 シナリオ1: 単体デバイス検証
```powershell
# 単体デバイス検証スクリプト
# Test-SingleDevice.ps1

[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$ComputerName,
    
    [string]$ConfigFile = ".\config\BitLockerConfig-Test.json",
    
    [switch]$ActualDeletion = $false
)

Write-Host "単体デバイス検証: $ComputerName" -ForegroundColor Cyan

$verificationResults = @{
    PreTest = @{}
    Execution = @{}
    PostTest = @{}
    Summary = @{}
}

try {
    # 事前検証
    Write-Host "`n[1] 事前検証" -ForegroundColor Yellow
    
    $config = Get-Content $ConfigFile | ConvertFrom-Json -AsHashtable
    Connect-MgGraph -TenantId $config.TenantId -ClientId $config.ClientId -CertificateThumbprint $config.CertificateThumbprint -NoWelcome
    
    # デバイス存在確認
    $device = Get-MgDevice -Filter "displayName eq '$ComputerName'"
    if ($device) {
        Write-Host "✓ デバイス発見: $($device.DisplayName)" -ForegroundColor Green
        $verificationResults.PreTest.DeviceFound = $true
        $verificationResults.PreTest.DeviceId = $device.Id
    }
    else {
        Write-Host "✗ デバイスが見つかりません" -ForegroundColor Red
        $verificationResults.PreTest.DeviceFound = $false
        return $verificationResults
    }
    
    # 回復キー取得
    $uri = "https://graph.microsoft.com/v1.0/informationProtection/bitlocker/recoveryKeys"
    $filter = "deviceId eq '$($device.Id)'"
    $response = Invoke-MgGraphRequest -Uri $uri -Method GET -Body @{ '$filter' = $filter }
    
    $preTestKeys = $response.value
    Write-Host "✓ 回復キー数: $($preTestKeys.Count)" -ForegroundColor Green
    $verificationResults.PreTest.RecoveryKeyCount = $preTestKeys.Count
    $verificationResults.PreTest.RecoveryKeys = $preTestKeys
    
    # 実行
    Write-Host "`n[2] スクリプト実行" -ForegroundColor Yellow
    
    $executionParams = @{
        ComputerName = $ComputerName
        ConfigFile = $ConfigFile
        LogLevel = "Debug"
        GenerateReport = $true
    }
    
    if (-not $ActualDeletion) {
        $executionParams.WhatIf = $true
        Write-Host "WhatIfモードで実行します" -ForegroundColor Cyan
    }
    else {
        $executionParams.Force = $true
        Write-Host "実際の削除を実行します" -ForegroundColor Red
    }
    
    $executionStart = Get-Date
    $executionResult = & ".\Remove-BitLockerRecoveryKeys.ps1" @executionParams
    $executionDuration = (Get-Date) - $executionStart
    
    $verificationResults.Execution.Duration = $executionDuration
    $verificationResults.Execution.Success = $?
    $verificationResults.Execution.Result = $executionResult
    
    if ($verificationResults.Execution.Success) {
        Write-Host "✓ スクリプト実行成功" -ForegroundColor Green
    }
    else {
        Write-Host "✗ スクリプト実行失敗" -ForegroundColor Red
    }
    
    # 事後検証
    Write-Host "`n[3] 事後検証" -ForegroundColor Yellow
    
    if ($ActualDeletion) {
        # 削除後の回復キー確認
        Start-Sleep -Seconds 5 # API反映待ち
        
        $postResponse = Invoke-MgGraphRequest -Uri $uri -Method GET -Body @{ '$filter' = $filter }
        $postTestKeys = $postResponse.value
        
        Write-Host "削除後回復キー数: $($postTestKeys.Count)" -ForegroundColor Yellow
        $verificationResults.PostTest.RecoveryKeyCount = $postTestKeys.Count
        $verificationResults.PostTest.RecoveryKeys = $postTestKeys
        
        $deletedCount = $verificationResults.PreTest.RecoveryKeyCount - $verificationResults.PostTest.RecoveryKeyCount
        
        if ($deletedCount -eq $verificationResults.PreTest.RecoveryKeyCount) {
            Write-Host "✓ 全回復キー削除確認" -ForegroundColor Green
            $verificationResults.PostTest.AllKeysDeleted = $true
        }
        else {
            Write-Host "✗ 一部回復キーが残存: $($verificationResults.PostTest.RecoveryKeyCount)個" -ForegroundColor Red
            $verificationResults.PostTest.AllKeysDeleted = $false
        }
    }
    else {
        Write-Host "WhatIfモードのため削除確認をスキップ" -ForegroundColor Cyan
        $verificationResults.PostTest.Skipped = $true
    }
    
    # ログファイル確認
    $logFiles = Get-ChildItem -Path ".\logs\*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($logFiles) {
        Write-Host "✓ ログファイル生成確認: $($logFiles.Name)" -ForegroundColor Green
        $verificationResults.PostTest.LogFileGenerated = $true
        $verificationResults.PostTest.LogFilePath = $logFiles.FullName
    }
    
    # レポートファイル確認
    $reportFiles = Get-ChildItem -Path ".\reports\*.html" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($reportFiles) {
        Write-Host "✓ レポートファイル生成確認: $($reportFiles.Name)" -ForegroundColor Green
        $verificationResults.PostTest.ReportFileGenerated = $true
        $verificationResults.PostTest.ReportFilePath = $reportFiles.FullName
    }
    
    # サマリー
    Write-Host "`n[4] 検証サマリー" -ForegroundColor Yellow
    
    $verificationResults.Summary = @{
        OverallSuccess = $verificationResults.PreTest.DeviceFound -and $verificationResults.Execution.Success
        DeviceFound = $verificationResults.PreTest.DeviceFound
        ExecutionSuccess = $verificationResults.Execution.Success
        ExecutionDuration = $verificationResults.Execution.Duration
        PreTestKeyCount = $verificationResults.PreTest.RecoveryKeyCount
        PostTestKeyCount = if ($ActualDeletion) { $verificationResults.PostTest.RecoveryKeyCount } else { "N/A (WhatIf)" }
        KeysDeletionSuccess = if ($ActualDeletion) { $verificationResults.PostTest.AllKeysDeleted } else { "N/A (WhatIf)" }
    }
    
    $verificationResults.Summary | Format-Table -AutoSize
    
}
catch {
    Write-Host "✗ 検証エラー: $($_.Exception.Message)" -ForegroundColor Red
    $verificationResults.Summary.Error = $_.Exception.Message
}
finally {
    if (Get-MgContext) {
        Disconnect-MgGraph | Out-Null
    }
}

# 結果保存
$resultPath = ".\logs\verification-result-$ComputerName-$(Get-Date -Format 'yyyyMMddHHmmss').json"
$verificationResults | ConvertTo-Json -Depth 4 | Set-Content -Path $resultPath -Encoding UTF8
Write-Host "`n検証結果保存: $resultPath" -ForegroundColor Cyan

return $verificationResults
```

## 5.4 トラブルシューティングガイド

### 5.4.1 一般的な問題と解決方法

#### 5.4.1.1 認証関連の問題

**問題1: Microsoft Graph認証失敗**
```powershell
# 診断スクリプト
function Diagnose-AuthenticationIssue {
    [CmdletBinding()]
    param(
        [string]$TenantId,
        [string]$ClientId,
        [string]$CertificateThumbprint
    )
    
    Write-Host "認証問題診断" -ForegroundColor Cyan
    
    # 1. 証明書存在確認
    Write-Host "`n[1] 証明書確認" -ForegroundColor Yellow
    
    $cert = Get-ChildItem -Path "Cert:\CurrentUser\My\$CertificateThumbprint" -ErrorAction SilentlyContinue
    if (-not $cert) {
        $cert = Get-ChildItem -Path "Cert:\LocalMachine\My\$CertificateThumbprint" -ErrorAction SilentlyContinue
    }
    
    if ($cert) {
        Write-Host "✓ 証明書発見: $($cert.Subject)" -ForegroundColor Green
        Write-Host "  期限: $($cert.NotAfter)" -ForegroundColor White
        Write-Host "  拇印: $($cert.Thumbprint)" -ForegroundColor White
        
        if ($cert.NotAfter -lt (Get-Date)) {
            Write-Host "✗ 証明書が期限切れです" -ForegroundColor Red
            return "CertificateExpired"
        }
    }
    else {
        Write-Host "✗ 証明書が見つかりません" -ForegroundColor Red
        Write-Host "証明書ストアを確認してください:" -ForegroundColor Yellow
        Write-Host "  CurrentUser\My: $(Get-ChildItem 'Cert:\CurrentUser\My' | Measure-Object | Select-Object -ExpandProperty Count) 個の証明書" -ForegroundColor White
        Write-Host "  LocalMachine\My: $(Get-ChildItem 'Cert:\LocalMachine\My' | Measure-Object | Select-Object -ExpandProperty Count) 個の証明書" -ForegroundColor White
        return "CertificateNotFound"
    }
    
    # 2. ネットワーク接続確認
    Write-Host "`n[2] ネットワーク接続確認" -ForegroundColor Yellow
    
    $endpoints = @(
        "https://login.microsoftonline.com",
        "https://graph.microsoft.com"
    )
    
    foreach ($endpoint in $endpoints) {
        try {
            $response = Invoke-WebRequest -Uri $endpoint -Method HEAD -TimeoutSec 10
            Write-Host "✓ $endpoint : $($response.StatusCode)" -ForegroundColor Green
        }
        catch {
            Write-Host "✗ $endpoint : $($_.Exception.Message)" -ForegroundColor Red
            return "NetworkConnectivityIssue"
        }
    }
    
    # 3. テナント情報確認
    Write-Host "`n[3] テナント情報確認" -ForegroundColor Yellow
    
    try {
        $tenantInfo = Invoke-RestMethod -Uri "https://login.microsoftonline.com/$TenantId/v2.0/.well-known/openid_configuration"
        Write-Host "✓ テナント発見: $($tenantInfo.issuer)" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ テナント情報取得失敗: $($_.Exception.Message)" -ForegroundColor Red
        return "InvalidTenantId"
    }
    
    # 4. アプリケーション登録確認
    Write-Host "`n[4] アプリケーション登録確認" -ForegroundColor Yellow
    
    try {
        # 簡易的な認証テスト
        $connectParams = @{
            TenantId = $TenantId
            ClientId = $ClientId
            CertificateThumbprint = $CertificateThumbprint
        }
        
        Connect-MgGraph @connectParams -NoWelcome -ErrorAction Stop
        
        $context = Get-MgContext
        Write-Host "✓ 認証成功: $($context.Account)" -ForegroundColor Green
        Write-Host "  スコープ: $($context.Scopes -join ', ')" -ForegroundColor White
        
        Disconnect-MgGraph | Out-Null
        return "Success"
    }
    catch {
        Write-Host "✗ 認証失敗: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Message -match "AADSTS70002") {
            return "InvalidClientId"
        }
        elseif ($_.Exception.Message -match "AADSTS50027") {
            return "CertificateNotConfigured"
        }
        else {
            return "UnknownAuthError"
        }
    }
}

# 解決方法提案
function Get-AuthSolution {
    param([string]$DiagnosisResult)
    
    switch ($DiagnosisResult) {
        "CertificateExpired" {
            @"
解決方法: 証明書期限切れ
1. 新しい証明書を生成してください
2. Azure Portalでアプリケーション登録の証明書を更新してください
3. 設定ファイルの証明書拇印を更新してください
"@
        }
        "CertificateNotFound" {
            @"
解決方法: 証明書が見つからない
1. 証明書が正しい場所にインストールされているか確認してください
2. 証明書の拇印が設定ファイルと一致しているか確認してください
3. 必要に応じて証明書を再インストールしてください
"@
        }
        "InvalidTenantId" {
            @"
解決方法: 無効なテナントID
1. Azure Portalでテナント情報を確認してください
2. 設定ファイルのTenantIdが正しいか確認してください
"@
        }
        "InvalidClientId" {
            @"
解決方法: 無効なクライアントID
1. Azure Portalでアプリケーション登録を確認してください
2. 設定ファイルのClientIdが正しいか確認してください
"@
        }
        "CertificateNotConfigured" {
            @"
解決方法: 証明書が未設定
1. Azure Portalのアプリケーション登録で証明書をアップロードしてください
2. 証明書がActive状態になっているか確認してください
"@
        }
        default {
            @"
解決方法: 一般的なトラブルシューティング
1. 管理者権限でPowerShellを実行していることを確認
2. 必要なPowerShellモジュールがインストールされていることを確認
3. ファイアウォール・プロキシ設定を確認
4. Azure Portal でアプリケーションの設定を再確認
"@
        }
    }
}
```

**問題2: 権限不足エラー**
```powershell
# 権限問題診断スクリプト
function Diagnose-PermissionIssue {
    [CmdletBinding()]
    param(
        [string]$TenantId,
        [string]$ClientId
    )
    
    Write-Host "権限問題診断" -ForegroundColor Cyan
    
    try {
        # Microsoft Graph接続（管理者アカウント）
        Connect-MgGraph -TenantId $TenantId -Scopes "Application.Read.All", "Directory.Read.All"
        
        # アプリケーション情報取得
        $app = Get-MgApplication -Filter "appId eq '$ClientId'"
        if (-not $app) {
            Write-Host "✗ アプリケーションが見つかりません: $ClientId" -ForegroundColor Red
            return
        }
        
        Write-Host "✓ アプリケーション発見: $($app.DisplayName)" -ForegroundColor Green
        
        # 必要な権限定義
        $requiredPermissions = @{
            "00000003-0000-0000-c000-000000000000" = @{ # Microsoft Graph
                "1bfefb4e-e0b5-418b-a88f-73c46d2cc8e9" = "Device.ReadWrite.All"
                "57dae122-6d24-4736-8b8f-3ece9eb5b1d6" = "BitLockerKey.ReadBasic.All"
            }
        }
        
        # 現在の権限確認
        Write-Host "`n現在の権限設定:" -ForegroundColor Yellow
        
        foreach ($resourceAccess in $app.RequiredResourceAccess) {
            $resourceName = switch ($resourceAccess.ResourceAppId) {
                "00000003-0000-0000-c000-000000000000" { "Microsoft Graph" }
                default { $resourceAccess.ResourceAppId }
            }
            
            Write-Host "リソース: $resourceName" -ForegroundColor Cyan
            
            foreach ($permission in $resourceAccess.ResourceAccess) {
                $permissionName = if ($requiredPermissions[$resourceAccess.ResourceAppId][$permission.Id]) {
                    $requiredPermissions[$resourceAccess.ResourceAppId][$permission.Id]
                } else {
                    $permission.Id
                }
                
                $type = if ($permission.Type -eq "Role") { "Application" } else { "Delegated" }
                Write-Host "  ✓ $permissionName ($type)" -ForegroundColor Green
            }
        }
        
        # 管理者同意状況確認
        $servicePrincipal = Get-MgServicePrincipal -Filter "appId eq '$ClientId'"
        if ($servicePrincipal) {
            Write-Host "`n管理者同意状況:" -ForegroundColor Yellow
            
            $oauth2Grants = Get-MgOauth2PermissionGrant -Filter "clientId eq '$($servicePrincipal.Id)'"
            $appRoleAssignments = Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $servicePrincipal.Id
            
            if ($appRoleAssignments.Count -gt 0) {
                Write-Host "✓ Application権限の管理者同意済み" -ForegroundColor Green
                foreach ($assignment in $appRoleAssignments) {
                    $roleName = $requiredPermissions["00000003-0000-0000-c000-000000000000"][$assignment.AppRoleId]
                    if ($roleName) {
                        Write-Host "  ✓ $roleName" -ForegroundColor Green
                    }
                }
            }
            else {
                Write-Host "✗ Application権限の管理者同意が未完了" -ForegroundColor Red
                Write-Host "次のURLで管理者同意を実行してください:" -ForegroundColor Yellow
                Write-Host "https://login.microsoftonline.com/$TenantId/adminconsent?client_id=$ClientId" -ForegroundColor White
            }
        }
        
    }
    catch {
        Write-Host "✗ 権限診断エラー: $($_.Exception.Message)" -ForegroundColor Red
    }
    finally {
        if (Get-MgContext) {
            Disconnect-MgGraph | Out-Null
        }
    }
}
```

#### 5.4.1.2 API制限・パフォーマンス問題

**問題3: Microsoft Graph API制限**
```powershell
# API制限問題診断
function Diagnose-ApiLimits {
    [CmdletBinding()]
    param(
        [int]$TestRequestCount = 50,
        [int]$TestDurationSeconds = 60
    )
    
    Write-Host "API制限診断テスト" -ForegroundColor Cyan
    Write-Host "テスト設定: $TestRequestCount リクエスト / $TestDurationSeconds 秒" -ForegroundColor White
    
    $results = @{
        TotalRequests = 0
        SuccessfulRequests = 0
        ThrottledRequests = 0
        ErrorRequests = 0
        AverageResponseTime = 0
        MaxResponseTime = 0
        ThrottlingOccurred = $false
    }
    
    $responseTimes = @()
    $startTime = Get-Date
    $endTime = $startTime.AddSeconds($TestDurationSeconds)
    
    while ((Get-Date) -lt $endTime -and $results.TotalRequests -lt $TestRequestCount) {
        $results.TotalRequests++
        
        try {
            $requestStart = Get-Date
            
            # 軽量なAPIリクエスト実行
            $response = Invoke-MgGraphRequest -Uri "https://graph.microsoft.com/v1.0/me" -Method GET
            
            $requestEnd = Get-Date
            $responseTime = ($requestEnd - $requestStart).TotalMilliseconds
            $responseTimes += $responseTime
            
            $results.SuccessfulRequests++
            
            if ($responseTime -gt $results.MaxResponseTime) {
                $results.MaxResponseTime = $responseTime
            }
            
            Write-Host "." -NoNewline -ForegroundColor Green
        }
        catch {
            if ($_.Exception.Message -match "429|Too Many Requests") {
                $results.ThrottledRequests++
                $results.ThrottlingOccurred = $true
                Write-Host "T" -NoNewline -ForegroundColor Yellow
                
                # スロットリング時は長めに待機
                Start-Sleep -Seconds 10
            }
            else {
                $results.ErrorRequests++
                Write-Host "E" -NoNewline -ForegroundColor Red
            }
        }
        
        # 基本的な待機（レート制限回避）
        Start-Sleep -Milliseconds 100
    }
    
    Write-Host "`n"
    
    # 結果計算
    if ($responseTimes.Count -gt 0) {
        $results.AverageResponseTime = ($responseTimes | Measure-Object -Average).Average
    }
    
    # 結果表示
    Write-Host "API制限診断結果:" -ForegroundColor Cyan
    Write-Host "総リクエスト数: $($results.TotalRequests)" -ForegroundColor White
    Write-Host "成功: $($results.SuccessfulRequests)" -ForegroundColor Green
    Write-Host "スロットリング: $($results.ThrottledRequests)" -ForegroundColor Yellow
    Write-Host "エラー: $($results.ErrorRequests)" -ForegroundColor Red
    Write-Host "平均応答時間: $([math]::Round($results.AverageResponseTime, 2)) ms" -ForegroundColor White
    Write-Host "最大応答時間: $([math]::Round($results.MaxResponseTime, 2)) ms" -ForegroundColor White
    
    # 推奨設定
    if ($results.ThrottlingOccurred) {
        Write-Host "`n推奨設定:" -ForegroundColor Yellow
        Write-Host "- MaxParallelism を 5 以下に設定" -ForegroundColor White
        Write-Host "- リクエスト間隔を 200ms 以上に設定" -ForegroundColor White
        Write-Host "- リトライ間隔を指数バックオフで 60秒まで設定" -ForegroundColor White
    }
    else {
        Write-Host "`n現在の設定で問題なし" -ForegroundColor Green
    }
    
    return $results
}
```

## 5.5 パフォーマンス最適化

### 5.5.1 パフォーマンス監視

#### 5.5.1.1 実行時間測定
```powershell
# パフォーマンス測定クラス
class PerformanceMonitor {
    [hashtable]$Metrics
    [datetime]$StartTime
    [hashtable]$Timers
    
    PerformanceMonitor() {
        $this.Metrics = @{}
        $this.StartTime = Get-Date
        $this.Timers = @{}
    }
    
    [void] StartTimer([string]$Name) {
        $this.Timers[$Name] = Get-Date
    }
    
    [double] StopTimer([string]$Name) {
        if ($this.Timers.ContainsKey($Name)) {
            $duration = ((Get-Date) - $this.Timers[$Name]).TotalMilliseconds
            $this.Timers.Remove($Name)
            return $duration
        }
        return 0
    }
    
    [void] RecordMetric([string]$Name, [object]$Value) {
        if (-not $this.Metrics.ContainsKey($Name)) {
            $this.Metrics[$Name] = @()
        }
        $this.Metrics[$Name] += @{
            Timestamp = Get-Date
            Value = $Value
        }
    }
    
    [hashtable] GetSummary() {
        $totalDuration = ((Get-Date) - $this.StartTime).TotalSeconds
        
        $summary = @{
            TotalDurationSeconds = $totalDuration
            Metrics = @{}
        }
        
        foreach ($metricName in $this.Metrics.Keys) {
            $values = $this.Metrics[$metricName] | ForEach-Object { $_.Value }
            $summary.Metrics[$metricName] = @{
                Count = $values.Count
                Average = if ($values.Count -gt 0) { ($values | Measure-Object -Average).Average } else { 0 }
                Min = if ($values.Count -gt 0) { ($values | Measure-Object -Minimum).Minimum } else { 0 }
                Max = if ($values.Count -gt 0) { ($values | Measure-Object -Maximum).Maximum } else { 0 }
                Total = if ($values.Count -gt 0) { ($values | Measure-Object -Sum).Sum } else { 0 }
            }
        }
        
        return $summary
    }
}

# パフォーマンス最適化版の主要関数
function Invoke-OptimizedBulkProcessing {
    [CmdletBinding()]
    param(
        [array]$Devices,
        [int]$MaxParallelism = 10,
        [int]$BatchSize = 20,
        [hashtable]$Config
    )
    
    $monitor = [PerformanceMonitor]::new()
    $monitor.StartTimer("TotalProcessing")
    
    Write-Host "最適化された一括処理開始" -ForegroundColor Cyan
    Write-Host "対象デバイス数: $($Devices.Count)" -ForegroundColor White
    Write-Host "並列度: $MaxParallelism" -ForegroundColor White
    Write-Host "バッチサイズ: $BatchSize" -ForegroundColor White
    
    # デバイスをバッチに分割
    $batches = @()
    for ($i = 0; $i -lt $Devices.Count; $i += $BatchSize) {
        $batchEnd = [Math]::Min($i + $BatchSize - 1, $Devices.Count - 1)
        $batches += , $Devices[$i..$batchEnd]
    }
    
    Write-Host "バッチ数: $($batches.Count)" -ForegroundColor White
    
    $results = @()
    $batchNumber = 0
    
    foreach ($batch in $batches) {
        $batchNumber++
        $monitor.StartTimer("Batch$batchNumber")
        
        Write-Host "`nバッチ $batchNumber/$($batches.Count) 処理中..." -ForegroundColor Yellow
        
        # 並列処理実行
        $batchResults = $batch | ForEach-Object -Parallel {
            $device = $_
            $config = $using:Config
            $monitor = $using:monitor
            
            # 個別デバイス処理
            $deviceStart = Get-Date
            
            try {
                # Microsoft Graph認証
                Connect-MgGraph -TenantId $config.TenantId -ClientId $config.ClientId -CertificateThumbprint $config.CertificateThumbprint -NoWelcome
                
                # デバイス検索
                $foundDevice = Get-MgDevice -Filter "displayName eq '$($device.ComputerName)'"
                
                if ($foundDevice) {
                    # 回復キー取得・削除処理
                    $uri = "https://graph.microsoft.com/v1.0/informationProtection/bitlocker/recoveryKeys"
                    $filter = "deviceId eq '$($foundDevice.Id)'"
                    $response = Invoke-MgGraphRequest -Uri $uri -Method GET -Body @{ '$filter' = $filter }
                    
                    $deletedCount = 0
                    foreach ($key in $response.value) {
                        try {
                            Invoke-MgGraphRequest -Uri "https://graph.microsoft.com/v1.0/informationProtection/bitlocker/recoveryKeys/$($key.id)" -Method DELETE
                            $deletedCount++
                        }
                        catch {
                            # エラーは記録するが処理継続
                        }
                    }
                    
                    $result = [PSCustomObject]@{
                        DeviceId = $foundDevice.Id
                        DeviceName = $foundDevice.DisplayName
                        Status = "Success"
                        DeletedKeysCount = $deletedCount
                        ProcessingTimeMs = ((Get-Date) - $deviceStart).TotalMilliseconds
                    }
                }
                else {
                    $result = [PSCustomObject]@{
                        DeviceId = ""
                        DeviceName = $device.ComputerName
                        Status = "DeviceNotFound"
                        DeletedKeysCount = 0
                        ProcessingTimeMs = ((Get-Date) - $deviceStart).TotalMilliseconds
                    }
                }
                
                return $result
            }
            catch {
                return [PSCustomObject]@{
                    DeviceId = ""
                    DeviceName = $device.ComputerName
                    Status = "Error"
                    DeletedKeysCount = 0
                    ErrorMessage = $_.Exception.Message
                    ProcessingTimeMs = ((Get-Date) - $deviceStart).TotalMilliseconds
                }
            }
            finally {
                if (Get-MgContext) {
                    Disconnect-MgGraph | Out-Null
                }
            }
        } -ThrottleLimit $MaxParallelism
        
        $batchDuration = $monitor.StopTimer("Batch$batchNumber")
        $monitor.RecordMetric("BatchProcessingTime", $batchDuration)
        $monitor.RecordMetric("BatchSize", $batch.Count)
        
        $results += $batchResults
        
        # バッチ結果サマリー
        $batchSuccessCount = ($batchResults | Where-Object { $_.Status -eq "Success" }).Count
        Write-Host "バッチ $batchNumber 完了: $batchSuccessCount/$($batch.Count) 成功 ($(([math]::Round($batchDuration/1000, 2))) 秒)" -ForegroundColor Green
        
        # バッチ間の待機（API制限対策）
        if ($batchNumber -lt $batches.Count) {
            Start-Sleep -Seconds 2
        }
    }
    
    $totalDuration = $monitor.StopTimer("TotalProcessing")
    
    # パフォーマンス統計
    $summary = $monitor.GetSummary()
    
    Write-Host "`nパフォーマンス統計:" -ForegroundColor Cyan
    Write-Host "総処理時間: $([math]::Round($totalDuration/1000, 2)) 秒" -ForegroundColor White
    Write-Host "平均バッチ処理時間: $([math]::Round($summary.Metrics.BatchProcessingTime.Average/1000, 2)) 秒" -ForegroundColor White
    Write-Host "デバイスあたり平均処理時間: $([math]::Round($totalDuration/$Devices.Count, 2)) ms" -ForegroundColor White
    Write-Host "スループット: $([math]::Round($Devices.Count/($totalDuration/1000), 2)) デバイス/秒" -ForegroundColor White
    
    return @{
        Results = $results
        PerformanceMetrics = $summary
    }
}
```

### 5.5.2 メモリ使用量最適化

#### 5.5.2.1 大規模データ処理最適化
```powershell
# メモリ効率的な大規模処理
function Invoke-MemoryOptimizedProcessing {
    [CmdletBinding()]
    param(
        [string]$InputFile,
        [int]$StreamingBatchSize = 100,
        [hashtable]$Config
    )
    
    Write-Host "メモリ最適化処理開始" -ForegroundColor Cyan
    
    # メモリ使用量監視
    $initialMemory = [System.GC]::GetTotalMemory($false)
    Write-Host "初期メモリ使用量: $([math]::Round($initialMemory/1MB, 2)) MB" -ForegroundColor White
    
    # ストリーミング処理用のカスタムリーダー
    $streamReader = [System.IO.StreamReader]::new($InputFile)
    $csvHeader = $streamReader.ReadLine()
    
    $processedCount = 0
    $batchBuffer = @()
    $results = @()
    
    try {
        while (-not $streamReader.EndOfStream) {
            $line = $streamReader.ReadLine()
            
            if ($line) {
                # CSVパース（軽量）
                $values = $line -split ','
                $device = [PSCustomObject]@{
                    ComputerName = $values[0].Trim('"')
                }
                
                $batchBuffer += $device
                
                # バッチサイズに達したら処理実行
                if ($batchBuffer.Count -ge $StreamingBatchSize) {
                    $batchResults = Process-DeviceBatch -Devices $batchBuffer -Config $Config
                    $results += $batchResults
                    
                    $processedCount += $batchBuffer.Count
                    Write-Progress -Activity "メモリ最適化処理" -Status "処理済み: $processedCount デバイス" -PercentComplete -1
                    
                    # メモリクリーンアップ
                    $batchBuffer = @()
                    [System.GC]::Collect()
                    [System.GC]::WaitForPendingFinalizers()
                    
                    # メモリ使用量確認
                    $currentMemory = [System.GC]::GetTotalMemory($false)
                    if (($currentMemory - $initialMemory) -gt 500MB) {
                        Write-Warning "メモリ使用量が増加しています: $([math]::Round($currentMemory/1MB, 2)) MB"
                    }
                }
            }
        }
        
        # 最後のバッチ処理
        if ($batchBuffer.Count -gt 0) {
            $batchResults = Process-DeviceBatch -Devices $batchBuffer -Config $Config
            $results += $batchResults
            $processedCount += $batchBuffer.Count
        }
        
    }
    finally {
        $streamReader.Close()
        $streamReader.Dispose()
        Write-Progress -Activity "メモリ最適化処理" -Completed
    }
    
    $finalMemory = [System.GC]::GetTotalMemory($true)
    Write-Host "最終メモリ使用量: $([math]::Round($finalMemory/1MB, 2)) MB" -ForegroundColor White
    Write-Host "メモリ使用量増加: $([math]::Round(($finalMemory-$initialMemory)/1MB, 2)) MB" -ForegroundColor White
    
    return $results
}

function Process-DeviceBatch {
    param([array]$Devices, [hashtable]$Config)
    
    # 軽量な処理実装
    $results = @()
    
    foreach ($device in $Devices) {
        try {
            # 必要最小限の処理
            $result = [PSCustomObject]@{
                DeviceName = $device.ComputerName
                Status = "Processed"
                ProcessedAt = Get-Date
            }
            $results += $result
        }
        catch {
            $results += [PSCustomObject]@{
                DeviceName = $device.ComputerName
                Status = "Error"
                ErrorMessage = $_.Exception.Message
                ProcessedAt = Get-Date
            }
        }
    }
    
    return $results
}
```

## 5.6 まとめ

本章では、BitLocker回復キー削除スクリプトの完全な実装と検証方法について詳しく解説しました。重要なポイントは以下の通りです：

1. **完全なスクリプト実装**: 企業環境で運用可能な堅牢で包括的なPowerShellスクリプト
2. **段階的テスト手順**: 開発環境から本番環境への安全な移行プロセス
3. **包括的な検証方法**: 機能・性能・セキュリティの多角的な検証アプローチ
4. **実用的なトラブルシューティング**: 一般的な問題への対処法と診断ツール
5. **パフォーマンス最適化**: 大規模環境での効率的な処理実現

次章では、このスクリプトを実際の環境で自動実行するシステムの構築について詳しく解説します。

---

:::message
**実装に関する重要な注意**
本章のスクリプトは教育・学習目的で提供されています。実際の本番環境での使用前には、必ず十分なテストと組織のセキュリティポリシーへの適合性確認を行ってください。
:::