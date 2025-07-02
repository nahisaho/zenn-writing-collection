---
title: "第7章 運用・監視・メンテナンス"
---

## 7.0 はじめに

BitLocker回復キー削除システムを本番環境で安定稼働させるためには、継続的な運用・監視・メンテナンス体制の構築が不可欠です。

本章では、定期実行スケジュールの設計から包括的な監視システム、効率的なメンテナンス手順、セキュリティ更新への対応まで、企業レベルでの運用を成功させるための実践的なアプローチを詳しく解説します。

## 7.1 定期実行スケジュールの設計

### 7.1.1 実行頻度の最適化

#### 7.1.1.1 環境別推奨スケジュール
```yaml
Execution_Schedule_Matrix:
  Small_Environment:  # ~500台
    Daily_Maintenance:
      Schedule: "毎日 02:00"
      Scope: "新規・変更のあるデバイスのみ"
      Duration: "30分以内"
      
    Weekly_Full_Check:
      Schedule: "日曜日 01:00"
      Scope: "全デバイス"
      Duration: "2時間以内"
      
    Monthly_Deep_Clean:
      Schedule: "第1日曜日 00:00"
      Scope: "包括的監査と cleanup"
      Duration: "4時間以内"

  Medium_Environment:  # 500-2000台
    Daily_Maintenance:
      Schedule: "毎日 01:30"
      Scope: "高優先度デバイス"
      Duration: "1時間以内"
      
    Bi_Daily_Standard:
      Schedule: "火・木・土 02:00"
      Scope: "標準デバイス"
      Duration: "2時間以内"
      
    Weekly_Comprehensive:
      Schedule: "日曜日 00:00"
      Scope: "全デバイス + レポート生成"
      Duration: "6時間以内"

  Large_Environment:  # 2000台以上
    Continuous_Processing:
      Schedule: "24時間連続（バッチ処理）"
      Scope: "ローリング処理"
      Duration: "継続的"
      
    Priority_Immediate:
      Schedule: "Autopilot Reset後 30分以内"
      Scope: "緊急処理が必要なデバイス"
      Duration: "即座"
      
    Regional_Maintenance:
      Schedule: "地域別時間帯"
      Scope: "地域ごとの最適化実行"
      Duration: "各地域の業務時間外"
```

#### 7.1.1.2 動的スケジューリング実装
```powershell
# Dynamic-Scheduler.ps1
# 動的スケジューリングエンジン

[CmdletBinding()]
param(
    [string]$ConfigFile = "C:\Program Files\BitLockerKeyManager\Config\BitLockerConfig.json",
    [string]$ScheduleDbPath = "C:\Program Files\BitLockerKeyManager\Data\ScheduleDatabase.json"
)

class ScheduleEntry {
    [string]$DeviceId
    [string]$DeviceName
    [datetime]$LastProcessed
    [datetime]$NextScheduled
    [int]$Priority
    [string]$Reason
    [hashtable]$Metadata
    
    ScheduleEntry([string]$DeviceId, [string]$DeviceName) {
        $this.DeviceId = $DeviceId
        $this.DeviceName = $DeviceName
        $this.LastProcessed = [datetime]::MinValue
        $this.Priority = 5
        $this.Metadata = @{}
    }
    
    [void] UpdatePriority([string]$Reason) {
        switch ($Reason) {
            "AutopilotReset" { $this.Priority = 1; $this.NextScheduled = (Get-Date).AddMinutes(30) }
            "NewDevice" { $this.Priority = 2; $this.NextScheduled = (Get-Date).AddHours(2) }
            "RecoveryKeyFound" { $this.Priority = 3; $this.NextScheduled = (Get-Date).AddHours(6) }
            "ScheduledMaintenance" { $this.Priority = 5; $this.NextScheduled = (Get-Date).AddDays(1) }
            "Routine" { $this.Priority = 7; $this.NextScheduled = (Get-Date).AddDays(7) }
            default { $this.Priority = 5; $this.NextScheduled = (Get-Date).AddDays(1) }
        }
        $this.Reason = $Reason
    }
}

class DynamicScheduler {
    [string]$DatabasePath
    [hashtable]$ScheduleDatabase
    [hashtable]$Config
    
    DynamicScheduler([string]$DatabasePath, [hashtable]$Config) {
        $this.DatabasePath = $DatabasePath
        $this.Config = $Config
        $this.LoadScheduleDatabase()
    }
    
    [void] LoadScheduleDatabase() {
        if (Test-Path $this.DatabasePath) {
            try {
                $data = Get-Content $this.DatabasePath | ConvertFrom-Json -AsHashtable
                $this.ScheduleDatabase = @{}
                
                foreach ($deviceId in $data.Keys) {
                    $entry = [ScheduleEntry]::new($data[$deviceId].DeviceId, $data[$deviceId].DeviceName)
                    $entry.LastProcessed = [datetime]$data[$deviceId].LastProcessed
                    $entry.NextScheduled = [datetime]$data[$deviceId].NextScheduled
                    $entry.Priority = $data[$deviceId].Priority
                    $entry.Reason = $data[$deviceId].Reason
                    $entry.Metadata = $data[$deviceId].Metadata
                    
                    $this.ScheduleDatabase[$deviceId] = $entry
                }
            }
            catch {
                Write-Warning "スケジュールデータベース読み込み失敗。新規作成します。"
                $this.ScheduleDatabase = @{}
            }
        }
        else {
            $this.ScheduleDatabase = @{}
        }
    }
    
    [void] SaveScheduleDatabase() {
        try {
            $data = @{}
            foreach ($deviceId in $this.ScheduleDatabase.Keys) {
                $entry = $this.ScheduleDatabase[$deviceId]
                $data[$deviceId] = @{
                    DeviceId = $entry.DeviceId
                    DeviceName = $entry.DeviceName
                    LastProcessed = $entry.LastProcessed.ToString("yyyy-MM-dd HH:mm:ss")
                    NextScheduled = $entry.NextScheduled.ToString("yyyy-MM-dd HH:mm:ss")
                    Priority = $entry.Priority
                    Reason = $entry.Reason
                    Metadata = $entry.Metadata
                }
            }
            
            $dbDir = Split-Path $this.DatabasePath -Parent
            if (-not (Test-Path $dbDir)) {
                New-Item -Path $dbDir -ItemType Directory -Force | Out-Null
            }
            
            $data | ConvertTo-Json -Depth 4 | Set-Content -Path $this.DatabasePath -Encoding UTF8
        }
        catch {
            Write-Error "スケジュールデータベース保存失敗: $($_.Exception.Message)"
        }
    }
    
    [void] RegisterDevice([string]$DeviceId, [string]$DeviceName, [string]$Reason = "NewDevice") {
        if (-not $this.ScheduleDatabase.ContainsKey($DeviceId)) {
            $entry = [ScheduleEntry]::new($DeviceId, $DeviceName)
            $entry.UpdatePriority($Reason)
            $this.ScheduleDatabase[$DeviceId] = $entry
            
            Write-Host "デバイス登録: $DeviceName (優先度: $($entry.Priority), 次回実行: $($entry.NextScheduled))" -ForegroundColor Green
        }
        else {
            # 既存デバイスの優先度更新
            $this.ScheduleDatabase[$DeviceId].UpdatePriority($Reason)
            Write-Host "デバイス優先度更新: $DeviceName (優先度: $($this.ScheduleDatabase[$DeviceId].Priority))" -ForegroundColor Yellow
        }
    }
    
    [array] GetPendingDevices([int]$MaxCount = 50) {
        $now = Get-Date
        $pendingDevices = @()
        
        # 優先度順・実行予定時刻順でソート
        $sortedEntries = $this.ScheduleDatabase.Values | 
            Where-Object { $_.NextScheduled -le $now } | 
            Sort-Object Priority, NextScheduled
        
        $count = 0
        foreach ($entry in $sortedEntries) {
            if ($count -ge $MaxCount) { break }
            
            $pendingDevices += @{
                DeviceId = $entry.DeviceId
                DeviceName = $entry.DeviceName
                Priority = $entry.Priority
                Reason = $entry.Reason
                ScheduledTime = $entry.NextScheduled
                LastProcessed = $entry.LastProcessed
            }
            $count++
        }
        
        return $pendingDevices
    }
    
    [void] MarkProcessed([string]$DeviceId, [bool]$Success, [string]$Notes = "") {
        if ($this.ScheduleDatabase.ContainsKey($DeviceId)) {
            $entry = $this.ScheduleDatabase[$DeviceId]
            $entry.LastProcessed = Get-Date
            
            if ($Success) {
                # 成功時は通常スケジュールに戻す
                $entry.UpdatePriority("Routine")
                $entry.Metadata["LastSuccess"] = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
                $entry.Metadata["SuccessCount"] = ($entry.Metadata["SuccessCount"] -as [int]) + 1
            }
            else {
                # 失敗時は優先度を上げて早期再試行
                if ($entry.Priority -gt 3) {
                    $entry.Priority = 3
                    $entry.NextScheduled = (Get-Date).AddHours(1)
                }
                $entry.Metadata["LastError"] = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
                $entry.Metadata["ErrorCount"] = ($entry.Metadata["ErrorCount"] -as [int]) + 1
            }
            
            if ($Notes) {
                $entry.Metadata["LastNotes"] = $Notes
            }
            
            Write-Host "処理完了マーク: $($entry.DeviceName) (成功: $Success)" -ForegroundColor $(if ($Success) { "Green" } else { "Red" })
        }
    }
    
    [hashtable] GetScheduleStatistics() {
        $now = Get-Date
        $stats = @{
            TotalDevices = $this.ScheduleDatabase.Count
            PendingDevices = ($this.ScheduleDatabase.Values | Where-Object { $_.NextScheduled -le $now }).Count
            HighPriorityDevices = ($this.ScheduleDatabase.Values | Where-Object { $_.Priority -le 3 }).Count
            OverdueDevices = ($this.ScheduleDatabase.Values | Where-Object { $_.NextScheduled -lt $now.AddHours(-6) }).Count
            RecentlyProcessed = ($this.ScheduleDatabase.Values | Where-Object { $_.LastProcessed -gt $now.AddDays(-1) }).Count
            NeverProcessed = ($this.ScheduleDatabase.Values | Where-Object { $_.LastProcessed -eq [datetime]::MinValue }).Count
        }
        
        return $stats
    }
}

function Invoke-DynamicScheduling {
    param(
        [string]$ConfigFile,
        [string]$DatabasePath,
        [switch]$ProcessPending,
        [switch]$ShowStatistics,
        [int]$MaxProcessingCount = 50
    )
    
    # 設定読み込み
    $config = Get-Content $ConfigFile | ConvertFrom-Json -AsHashtable
    
    # スケジューラー初期化
    $scheduler = [DynamicScheduler]::new($DatabasePath, $config)
    
    if ($ShowStatistics) {
        $stats = $scheduler.GetScheduleStatistics()
        
        Write-Host "`nスケジュール統計:" -ForegroundColor Cyan
        Write-Host "総デバイス数: $($stats.TotalDevices)" -ForegroundColor White
        Write-Host "処理待ちデバイス数: $($stats.PendingDevices)" -ForegroundColor Yellow
        Write-Host "高優先度デバイス数: $($stats.HighPriorityDevices)" -ForegroundColor Red
        Write-Host "遅延デバイス数: $($stats.OverdueDevices)" -ForegroundColor Magenta
        Write-Host "24時間以内処理済み: $($stats.RecentlyProcessed)" -ForegroundColor Green
        Write-Host "未処理デバイス数: $($stats.NeverProcessed)" -ForegroundColor Gray
        
        return
    }
    
    if ($ProcessPending) {
        Write-Host "処理待ちデバイス取得..." -ForegroundColor Cyan
        
        $pendingDevices = $scheduler.GetPendingDevices($MaxProcessingCount)
        
        if ($pendingDevices.Count -eq 0) {
            Write-Host "処理待ちデバイスはありません" -ForegroundColor Green
            return
        }
        
        Write-Host "処理対象: $($pendingDevices.Count) デバイス" -ForegroundColor Yellow
        
        foreach ($device in $pendingDevices) {
            Write-Host "`n処理開始: $($device.DeviceName) (優先度: $($device.Priority))" -ForegroundColor Cyan
            
            try {
                # メインスクリプト実行
                $scriptPath = "C:\Program Files\BitLockerKeyManager\Scripts\Remove-BitLockerRecoveryKeys.ps1"
                $result = & $scriptPath -DeviceId $device.DeviceId -ConfigFile $ConfigFile -LogLevel Information
                
                $success = $LASTEXITCODE -eq 0
                $scheduler.MarkProcessed($device.DeviceId, $success, "ExitCode: $LASTEXITCODE")
                
                if ($success) {
                    Write-Host "✓ 処理成功: $($device.DeviceName)" -ForegroundColor Green
                }
                else {
                    Write-Host "✗ 処理失敗: $($device.DeviceName)" -ForegroundColor Red
                }
            }
            catch {
                $scheduler.MarkProcessed($device.DeviceId, $false, "Exception: $($_.Exception.Message)")
                Write-Host "✗ 処理エラー: $($device.DeviceName) - $($_.Exception.Message)" -ForegroundColor Red
            }
            
            # レート制限
            Start-Sleep -Seconds 2
        }
        
        # データベース保存
        $scheduler.SaveScheduleDatabase()
        Write-Host "`nスケジュールデータベース更新完了" -ForegroundColor Green
    }
}

# 新デバイス自動登録
function Register-NewDevices {
    param([DynamicScheduler]$Scheduler, [hashtable]$Config)
    
    Write-Host "新デバイス自動登録開始" -ForegroundColor Cyan
    
    try {
        # Microsoft Graph接続
        Connect-MgGraph -TenantId $Config.TenantId -ClientId $Config.ClientId -CertificateThumbprint $Config.CertificateThumbprint -NoWelcome
        
        # 24時間以内に追加されたデバイス取得
        $recentDevices = Get-MgDevice -Filter "approximateLastSignInDateTime ge $((Get-Date).AddDays(-1).ToString('yyyy-MM-ddTHH:mm:ssZ'))"
        
        $newCount = 0
        foreach ($device in $recentDevices) {
            if (-not $Scheduler.ScheduleDatabase.ContainsKey($device.Id)) {
                $Scheduler.RegisterDevice($device.Id, $device.DisplayName, "NewDevice")
                $newCount++
            }
        }
        
        Write-Host "新デバイス登録完了: $newCount 台" -ForegroundColor Green
        
        # Autopilot Reset検出
        $resetEvents = Get-WinEvent -FilterHashtable @{
            LogName = "Microsoft-Windows-ModernDeployment-Diagnostics-Provider/Autopilot"
            ID = 110
            StartTime = (Get-Date).AddHours(-1)
        } -ErrorAction SilentlyContinue
        
        foreach ($event in $resetEvents) {
            # イベントからデバイス情報抽出（簡略化）
            $deviceName = $event.Properties[0].Value
            $targetDevice = $recentDevices | Where-Object { $_.DisplayName -eq $deviceName }
            
            if ($targetDevice) {
                $Scheduler.RegisterDevice($targetDevice.Id, $targetDevice.DisplayName, "AutopilotReset")
                Write-Host "Autopilot Resetデバイス優先登録: $deviceName" -ForegroundColor Yellow
            }
        }
    }
    catch {
        Write-Warning "新デバイス登録エラー: $($_.Exception.Message)"
    }
    finally {
        if (Get-MgContext) {
            Disconnect-MgGraph | Out-Null
        }
    }
}

# メイン実行
try {
    Write-Host "動的スケジューリングエンジン" -ForegroundColor Cyan
    
    # パラメータ処理
    switch ($MyInvocation.BoundParameters.Keys) {
        { $_ -contains "ShowStatistics" } {
            Invoke-DynamicScheduling -ConfigFile $ConfigFile -DatabasePath $ScheduleDbPath -ShowStatistics
        }
        { $_ -contains "ProcessPending" } {
            Invoke-DynamicScheduling -ConfigFile $ConfigFile -DatabasePath $ScheduleDbPath -ProcessPending
        }
        default {
            Write-Host "使用方法:" -ForegroundColor Yellow
            Write-Host "  統計表示: -ShowStatistics" -ForegroundColor White
            Write-Host "  処理実行: -ProcessPending" -ForegroundColor White
            Write-Host "  新デバイス登録: -RegisterNew" -ForegroundColor White
        }
    }
}
catch {
    Write-Error "動的スケジューリングエンジンエラー: $($_.Exception.Message)"
    exit 1
}
```

### 7.1.2 負荷分散とピーク時間回避

#### 7.1.2.1 時間帯別負荷分散
```powershell
# Load-Balancer.ps1
# 負荷分散エンジン

[CmdletBinding()]
param(
    [int]$MaxConcurrentJobs = 10,
    [int]$MaxAPICallsPerMinute = 60,
    [hashtable]$TimeSlotLimits = @{
        "00-06" = 20  # 深夜：高負荷許可
        "06-09" = 5   # 朝：制限
        "09-17" = 3   # 業務時間：最小
        "17-20" = 8   # 夕方：中程度
        "20-00" = 15  # 夜：高負荷許可
    }
)

class LoadBalancer {
    [int]$MaxConcurrentJobs
    [int]$MaxAPICallsPerMinute
    [hashtable]$TimeSlotLimits
    [hashtable]$ActiveJobs
    [System.Collections.Generic.Queue[datetime]]$APICallHistory
    
    LoadBalancer([int]$MaxJobs, [int]$MaxAPICalls, [hashtable]$TimeSlots) {
        $this.MaxConcurrentJobs = $MaxJobs
        $this.MaxAPICallsPerMinute = $MaxAPICalls
        $this.TimeSlotLimits = $TimeSlots
        $this.ActiveJobs = @{}
        $this.APICallHistory = [System.Collections.Generic.Queue[datetime]]::new()
    }
    
    [int] GetCurrentTimeSlotLimit() {
        $currentHour = (Get-Date).Hour
        
        foreach ($slot in $this.TimeSlotLimits.Keys) {
            $startHour, $endHour = $slot -split "-" | ForEach-Object { [int]$_ }
            
            if ($startHour -le $endHour) {
                if ($currentHour -ge $startHour -and $currentHour -lt $endHour) {
                    return $this.TimeSlotLimits[$slot]
                }
            }
            else {
                # 日をまたぐ場合
                if ($currentHour -ge $startHour -or $currentHour -lt $endHour) {
                    return $this.TimeSlotLimits[$slot]
                }
            }
        }
        
        return 5  # デフォルト制限
    }
    
    [bool] CanStartNewJob() {
        $currentLimit = $this.GetCurrentTimeSlotLimit()
        return $this.ActiveJobs.Count -lt [Math]::Min($this.MaxConcurrentJobs, $currentLimit)
    }
    
    [bool] CanMakeAPICall() {
        $now = Get-Date
        
        # 1分以上古い記録を削除
        while ($this.APICallHistory.Count -gt 0 -and 
               ($now - $this.APICallHistory.Peek()).TotalMinutes -gt 1) {
            $this.APICallHistory.Dequeue() | Out-Null
        }
        
        return $this.APICallHistory.Count -lt $this.MaxAPICallsPerMinute
    }
    
    [void] RegisterAPICall() {
        $this.APICallHistory.Enqueue((Get-Date))
    }
    
    [string] StartJob([string]$DeviceId, [scriptblock]$JobScript) {
        if (-not $this.CanStartNewJob()) {
            throw "ジョブ起動制限に達しています"
        }
        
        $jobId = [System.Guid]::NewGuid().ToString()
        $job = Start-Job -ScriptBlock $JobScript -ArgumentList $DeviceId
        
        $this.ActiveJobs[$jobId] = @{
            Job = $job
            DeviceId = $DeviceId
            StartTime = Get-Date
        }
        
        return $jobId
    }
    
    [void] CleanupCompletedJobs() {
        $completedJobs = @()
        
        foreach ($jobId in $this.ActiveJobs.Keys) {
            $jobInfo = $this.ActiveJobs[$jobId]
            
            if ($jobInfo.Job.State -in @("Completed", "Failed", "Stopped")) {
                $completedJobs += $jobId
            }
        }
        
        foreach ($jobId in $completedJobs) {
            $jobInfo = $this.ActiveJobs[$jobId]
            Remove-Job -Job $jobInfo.Job -Force
            $this.ActiveJobs.Remove($jobId)
        }
    }
    
    [hashtable] GetLoadStatistics() {
        $this.CleanupCompletedJobs()
        
        return @{
            ActiveJobs = $this.ActiveJobs.Count
            MaxJobs = $this.GetCurrentTimeSlotLimit()
            APICallsLastMinute = $this.APICallHistory.Count
            MaxAPICalls = $this.MaxAPICallsPerMinute
            CurrentTimeSlot = "$((Get-Date).Hour):00-$((Get-Date).AddHours(1).Hour):00"
            LoadPercentage = ($this.ActiveJobs.Count / $this.GetCurrentTimeSlotLimit()) * 100
        }
    }
}

function Invoke-LoadBalancedExecution {
    param(
        [array]$DeviceList,
        [scriptblock]$ProcessingScript,
        [LoadBalancer]$LoadBalancer
    )
    
    Write-Host "負荷分散実行開始" -ForegroundColor Cyan
    Write-Host "対象デバイス数: $($DeviceList.Count)" -ForegroundColor White
    
    $processedCount = 0
    $failedCount = 0
    
    foreach ($device in $DeviceList) {
        # 負荷制限チェック
        while (-not $LoadBalancer.CanStartNewJob()) {
            Write-Host "負荷制限待機中... (アクティブジョブ: $($LoadBalancer.ActiveJobs.Count))" -ForegroundColor Yellow
            Start-Sleep -Seconds 30
            $LoadBalancer.CleanupCompletedJobs()
        }
        
        # API制限チェック
        while (-not $LoadBalancer.CanMakeAPICall()) {
            Write-Host "API制限待機中... (直近1分間のAPI呼び出し: $($LoadBalancer.APICallHistory.Count))" -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        }
        
        try {
            # ジョブ開始
            $jobId = $LoadBalancer.StartJob($device.DeviceId, $ProcessingScript)
            $LoadBalancer.RegisterAPICall()
            
            Write-Host "ジョブ開始: $($device.DeviceName) (JobID: $jobId)" -ForegroundColor Green
            $processedCount++
            
            # 進捗表示
            if ($processedCount % 10 -eq 0) {
                $stats = $LoadBalancer.GetLoadStatistics()
                Write-Host "進捗: $processedCount/$($DeviceList.Count) (負荷: $([math]::Round($stats.LoadPercentage, 1))%)" -ForegroundColor Cyan
            }
        }
        catch {
            Write-Host "ジョブ開始失敗: $($device.DeviceName) - $($_.Exception.Message)" -ForegroundColor Red
            $failedCount++
        }
        
        # 短時間待機
        Start-Sleep -Milliseconds 500
    }
    
    # 全ジョブ完了待機
    Write-Host "`n全ジョブ完了待機..." -ForegroundColor Yellow
    
    while ($LoadBalancer.ActiveJobs.Count -gt 0) {
        $LoadBalancer.CleanupCompletedJobs()
        
        if ($LoadBalancer.ActiveJobs.Count -gt 0) {
            Write-Host "待機中のジョブ: $($LoadBalancer.ActiveJobs.Count)" -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        }
    }
    
    Write-Host "`n負荷分散実行完了" -ForegroundColor Green
    Write-Host "処理開始: $processedCount デバイス" -ForegroundColor White
    Write-Host "開始失敗: $failedCount デバイス" -ForegroundColor Red
}

# 時間帯別推奨設定
function Get-OptimalExecutionTime {
    param([int]$EstimatedDurationMinutes)
    
    $now = Get-Date
    $recommendations = @()
    
    # 今後24時間の時間帯を評価
    for ($hour = 0; $hour -lt 24; $hour++) {
        $checkTime = $now.Date.AddHours($hour)
        
        if ($checkTime -lt $now) {
            $checkTime = $checkTime.AddDays(1)
        }
        
        $timeSlot = "$($checkTime.Hour):00-$(($checkTime.AddHours(1)).Hour):00"
        $score = 0
        
        # 負荷制限による得点
        $hourSlot = "$($checkTime.Hour)-$(($checkTime.AddHours(1)).Hour)"
        if ($hourSlot -in $TimeSlotLimits.Keys) {
            $score += $TimeSlotLimits[$hourSlot] * 2
        }
        
        # 業務時間外ボーナス
        if ($checkTime.Hour -lt 7 -or $checkTime.Hour -gt 19) {
            $score += 10
        }
        
        # 週末ボーナス
        if ($checkTime.DayOfWeek -in @([DayOfWeek]::Saturday, [DayOfWeek]::Sunday)) {
            $score += 5
        }
        
        # 推定終了時間が業務時間外になるかチェック
        $estimatedEnd = $checkTime.AddMinutes($EstimatedDurationMinutes)
        if ($estimatedEnd.Hour -lt 8) {
            $score += 5
        }
        
        $recommendations += @{
            StartTime = $checkTime
            TimeSlot = $timeSlot
            Score = $score
            EstimatedEnd = $estimatedEnd
        }
    }
    
    # スコア順でソート
    $topRecommendations = $recommendations | Sort-Object Score -Descending | Select-Object -First 5
    
    return $topRecommendations
}

# 使用例
try {
    $loadBalancer = [LoadBalancer]::new($MaxConcurrentJobs, $MaxAPICallsPerMinute, $TimeSlotLimits)
    
    Write-Host "負荷分散エンジン初期化完了" -ForegroundColor Green
    
    # 現在の負荷状況表示
    $stats = $loadBalancer.GetLoadStatistics()
    Write-Host "`n現在の負荷状況:" -ForegroundColor Cyan
    $stats | Format-Table -AutoSize
    
    # 最適実行時間推奨
    $optimalTimes = Get-OptimalExecutionTime -EstimatedDurationMinutes 120
    
    Write-Host "`n推奨実行時間（スコア順）:" -ForegroundColor Cyan
    foreach ($time in $optimalTimes) {
        Write-Host "$($time.StartTime.ToString('MM/dd HH:mm')) - $($time.EstimatedEnd.ToString('HH:mm')) (スコア: $($time.Score))" -ForegroundColor White
    }
}
catch {
    Write-Error "負荷分散エンジンエラー: $($_.Exception.Message)"
}
```

## 7.2 ログ監視と分析システム

### 7.2.1 構造化ログ分析

#### 7.2.1.1 ログ分析エンジン
```powershell
# Log-Analyzer.ps1
# BitLocker Key Manager ログ分析エンジン

[CmdletBinding()]
param(
    [string]$LogDirectory = "C:\Program Files\BitLockerKeyManager\Logs",
    [int]$AnalysisDepthDays = 7,
    [string]$OutputPath = "C:\Program Files\BitLockerKeyManager\Reports\log-analysis.html",
    [switch]$RealTimeMonitoring,
    [switch]$GenerateAlerts
)

class LogEntry {
    [datetime]$Timestamp
    [string]$Level
    [string]$Component
    [string]$Operation
    [string]$Message
    [hashtable]$Context
    [string]$CorrelationId
    [string]$SourceFile
    
    LogEntry([string]$LogLine, [string]$SourceFile) {
        $this.SourceFile = $SourceFile
        $this.ParseLogLine($LogLine)
    }
    
    [void] ParseLogLine([string]$LogLine) {
        try {
            # JSON形式ログの解析
            $logData = $LogLine | ConvertFrom-Json
            
            $this.Timestamp = [datetime]$logData.Timestamp
            $this.Level = $logData.Level
            $this.Component = $logData.Component
            $this.Operation = $logData.Operation
            $this.Message = $logData.Message
            $this.Context = $logData.Context
            $this.CorrelationId = $logData.CorrelationId
        }
        catch {
            # フォールバック：テキスト形式の解析
            if ($LogLine -match '\[(.*?)\] \[(.*?)\] \[(.*?)\] (.*)') {
                $this.Timestamp = [datetime]$Matches[1]
                $this.Level = $Matches[2]
                $this.Component = $Matches[3]
                $this.Message = $Matches[4]
                $this.Context = @{}
                $this.CorrelationId = ""
            }
        }
    }
}

class LogAnalyzer {
    [string]$LogDirectory
    [array]$LogEntries
    [hashtable]$Statistics
    [array]$Alerts
    
    LogAnalyzer([string]$Directory) {
        $this.LogDirectory = $Directory
        $this.LogEntries = @()
        $this.Statistics = @{}
        $this.Alerts = @()
    }
    
    [void] LoadLogs([int]$Days) {
        Write-Host "ログファイル読み込み開始 (過去 $Days 日)" -ForegroundColor Cyan
        
        $cutoffDate = (Get-Date).AddDays(-$Days)
        $logFiles = Get-ChildItem -Path $this.LogDirectory -Filter "*.log" | 
            Where-Object { $_.LastWriteTime -gt $cutoffDate } |
            Sort-Object LastWriteTime -Descending
        
        $totalEntries = 0
        
        foreach ($logFile in $logFiles) {
            Write-Host "読み込み中: $($logFile.Name)" -ForegroundColor Gray
            
            try {
                $lines = Get-Content -Path $logFile.FullName | Where-Object { $_.Trim() -ne "" }
                
                foreach ($line in $lines) {
                    $entry = [LogEntry]::new($line, $logFile.Name)
                    
                    if ($entry.Timestamp -gt $cutoffDate) {
                        $this.LogEntries += $entry
                        $totalEntries++
                    }
                }
            }
            catch {
                Write-Warning "ログファイル読み込みエラー: $($logFile.Name) - $($_.Exception.Message)"
            }
        }
        
        Write-Host "ログ読み込み完了: $totalEntries エントリ" -ForegroundColor Green
    }
    
    [void] AnalyzeStatistics() {
        Write-Host "統計分析実行中..." -ForegroundColor Cyan
        
        # 基本統計
        $this.Statistics["TotalEntries"] = $this.LogEntries.Count
        $this.Statistics["TimeRange"] = @{
            Start = ($this.LogEntries | Measure-Object Timestamp -Minimum).Minimum
            End = ($this.LogEntries | Measure-Object Timestamp -Maximum).Maximum
        }
        
        # レベル別統計
        $levelStats = $this.LogEntries | Group-Object Level | ForEach-Object {
            @{ Level = $_.Name; Count = $_.Count; Percentage = [math]::Round(($_.Count / $this.LogEntries.Count) * 100, 2) }
        }
        $this.Statistics["LevelDistribution"] = $levelStats
        
        # コンポーネント別統計
        $componentStats = $this.LogEntries | Group-Object Component | Sort-Object Count -Descending | ForEach-Object {
            @{ Component = $_.Name; Count = $_.Count; Percentage = [math]::Round(($_.Count / $this.LogEntries.Count) * 100, 2) }
        }
        $this.Statistics["ComponentActivity"] = $componentStats
        
        # 時間別分布
        $hourlyStats = $this.LogEntries | Group-Object { $_.Timestamp.Hour } | Sort-Object Name | ForEach-Object {
            @{ Hour = [int]$_.Name; Count = $_.Count }
        }
        $this.Statistics["HourlyDistribution"] = $hourlyStats
        
        # エラー分析
        $errorEntries = $this.LogEntries | Where-Object { $_.Level -in @("Error", "Critical") }
        $errorStats = @{
            TotalErrors = $errorEntries.Count
            ErrorRate = if ($this.LogEntries.Count -gt 0) { [math]::Round(($errorEntries.Count / $this.LogEntries.Count) * 100, 2) } else { 0 }
            TopErrors = $errorEntries | Group-Object Message | Sort-Object Count -Descending | Select-Object -First 10 | ForEach-Object {
                @{ Message = $_.Name; Count = $_.Count }
            }
        }
        $this.Statistics["ErrorAnalysis"] = $errorStats
        
        # パフォーマンス分析
        $performanceEntries = $this.LogEntries | Where-Object { $_.Context.ProcessingTimeMs -gt 0 }
        if ($performanceEntries.Count -gt 0) {
            $processingTimes = $performanceEntries | ForEach-Object { [int]$_.Context.ProcessingTimeMs }
            $perfStats = @{
                AverageProcessingTime = [math]::Round(($processingTimes | Measure-Object -Average).Average, 2)
                MedianProcessingTime = [math]::Round((($processingTimes | Sort-Object)[[math]::Floor($processingTimes.Count / 2)]), 2)
                MaxProcessingTime = ($processingTimes | Measure-Object -Maximum).Maximum
                SlowOperations = $performanceEntries | Where-Object { [int]$_.Context.ProcessingTimeMs -gt 30000 } | Sort-Object { [int]$_.Context.ProcessingTimeMs } -Descending | Select-Object -First 5
            }
            $this.Statistics["Performance"] = $perfStats
        }
        
        Write-Host "統計分析完了" -ForegroundColor Green
    }
    
    [void] DetectAnomalies() {
        Write-Host "異常検出実行中..." -ForegroundColor Cyan
        
        # 高エラー率検出
        $errorRate = $this.Statistics["ErrorAnalysis"]["ErrorRate"]
        if ($errorRate -gt 5) {
            $this.Alerts += @{
                Type = "HighErrorRate"
                Severity = "High"
                Message = "エラー率が高すぎます: $errorRate%"
                Threshold = "5%"
                Action = "エラーログを確認し、根本原因を調査してください"
            }
        }
        
        # 処理時間異常検出
        if ($this.Statistics.ContainsKey("Performance")) {
            $avgTime = $this.Statistics["Performance"]["AverageProcessingTime"]
            if ($avgTime -gt 60000) {  # 1分以上
                $this.Alerts += @{
                    Type = "SlowPerformance"
                    Severity = "Medium"
                    Message = "平均処理時間が長すぎます: $([math]::Round($avgTime/1000, 1))秒"
                    Threshold = "60秒"
                    Action = "システムリソースとネットワーク接続を確認してください"
                }
            }
        }
        
        # 特定エラーパターン検出
        $criticalErrors = $this.LogEntries | Where-Object { 
            $_.Level -eq "Critical" -or 
            $_.Message -match "Authentication|Certificate|Permission"
        }
        
        if ($criticalErrors.Count -gt 0) {
            $this.Alerts += @{
                Type = "CriticalErrors"
                Severity = "Critical"
                Message = "重要なエラーが検出されました: $($criticalErrors.Count) 件"
                Action = "即座に認証・権限設定を確認してください"
                Details = $criticalErrors | Select-Object -First 5 | ForEach-Object { $_.Message }
            }
        }
        
        # ログ出力停止検出
        $recentEntries = $this.LogEntries | Where-Object { $_.Timestamp -gt (Get-Date).AddHours(-2) }
        if ($recentEntries.Count -eq 0) {
            $this.Alerts += @{
                Type = "NoRecentLogs"
                Severity = "High"
                Message = "過去2時間にログ出力がありません"
                Action = "サービス状態とスケジュールタスクを確認してください"
            }
        }
        
        Write-Host "異常検出完了: $($this.Alerts.Count) 件のアラート" -ForegroundColor $(if ($this.Alerts.Count -gt 0) { "Yellow" } else { "Green" })
    }
    
    [string] GenerateHtmlReport() {
        Write-Host "HTMLレポート生成中..." -ForegroundColor Cyan
        
        $html = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>BitLocker Key Manager ログ分析レポート</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        .alert { padding: 15px; margin: 10px 0; border-radius: 5px; }
        .alert-critical { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .alert-high { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
        .alert-medium { background-color: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #3498db; }
        .stat-value { font-size: 24px; font-weight: bold; color: #2980b9; }
        .stat-label { font-size: 14px; color: #7f8c8d; margin-top: 5px; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
        th { background-color: #3498db; color: white; }
        tr:nth-child(even) { background-color: #f8f9fa; }
        .chart-container { width: 100%; height: 300px; margin: 20px 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #7f8c8d; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="container">
        <h1>BitLocker Key Manager ログ分析レポート</h1>
        
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value">$($this.Statistics["TotalEntries"])</div>
                <div class="stat-label">総ログエントリ数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">$($this.Statistics["ErrorAnalysis"]["ErrorRate"])%</div>
                <div class="stat-label">エラー率</div>
            </div>
"@

        if ($this.Statistics.ContainsKey("Performance")) {
            $html += @"
            <div class="stat-card">
                <div class="stat-value">$([math]::Round($this.Statistics["Performance"]["AverageProcessingTime"]/1000, 1))s</div>
                <div class="stat-label">平均処理時間</div>
            </div>
"@
        }

        $html += @"
            <div class="stat-card">
                <div class="stat-value">$($this.Alerts.Count)</div>
                <div class="stat-label">アラート数</div>
            </div>
        </div>
"@

        # アラート表示
        if ($this.Alerts.Count -gt 0) {
            $html += "<h2>🚨 アラート</h2>"
            
            foreach ($alert in $this.Alerts) {
                $alertClass = switch ($alert.Severity) {
                    "Critical" { "alert-critical" }
                    "High" { "alert-high" }
                    "Medium" { "alert-medium" }
                    default { "alert-medium" }
                }
                
                $html += @"
                <div class="alert $alertClass">
                    <strong>[$($alert.Severity)] $($alert.Type)</strong><br>
                    $($alert.Message)<br>
                    <em>推奨アクション: $($alert.Action)</em>
                </div>
"@
            }
        }

        # レベル別分布グラフ
        $html += @"
        <h2>📊 ログレベル分布</h2>
        <div class="chart-container">
            <canvas id="levelChart"></canvas>
        </div>
        
        <h2>⏰ 時間別アクティビティ</h2>
        <div class="chart-container">
            <canvas id="hourlyChart"></canvas>
        </div>
"@

        # エラー詳細テーブル
        if ($this.Statistics["ErrorAnalysis"]["TopErrors"].Count -gt 0) {
            $html += @"
            <h2>❌ 頻発エラー</h2>
            <table>
                <thead>
                    <tr><th>エラーメッセージ</th><th>発生回数</th></tr>
                </thead>
                <tbody>
"@

            foreach ($error in $this.Statistics["ErrorAnalysis"]["TopErrors"]) {
                $html += "<tr><td>$($error.Message)</td><td>$($error.Count)</td></tr>"
            }

            $html += "</tbody></table>"
        }

        # JavaScript for charts
        $html += @"
        <script>
            // レベル別分布チャート
            const levelCtx = document.getElementById('levelChart').getContext('2d');
            const levelChart = new Chart(levelCtx, {
                type: 'doughnut',
                data: {
                    labels: [$($this.Statistics["LevelDistribution"] | ForEach-Object { "'$($_.Level)'" } | Join-String -Separator ',')],
                    datasets: [{
                        data: [$($this.Statistics["LevelDistribution"] | ForEach-Object { $_.Count } | Join-String -Separator ',')],
                        backgroundColor: ['#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', '#34495e']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
            
            // 時間別分布チャート
            const hourlyCtx = document.getElementById('hourlyChart').getContext('2d');
            const hourlyChart = new Chart(hourlyCtx, {
                type: 'bar',
                data: {
                    labels: [$($this.Statistics["HourlyDistribution"] | ForEach-Object { "'$($_.Hour):00'" } | Join-String -Separator ',')],
                    datasets: [{
                        label: 'ログエントリ数',
                        data: [$($this.Statistics["HourlyDistribution"] | ForEach-Object { $_.Count } | Join-String -Separator ',')],
                        backgroundColor: '#3498db'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        </script>
        
        <div class="footer">
            <p>レポート生成日時: $(Get-Date -Format 'yyyy年MM月dd日 HH:mm:ss')</p>
            <p>分析期間: $($this.Statistics["TimeRange"]["Start"].ToString('MM/dd HH:mm')) - $($this.Statistics["TimeRange"]["End"].ToString('MM/dd HH:mm'))</p>
            <p>BitLocker Key Manager ログ分析エンジン v1.0</p>
        </div>
    </div>
</body>
</html>
"@

        return $html
    }
}

function Start-RealTimeMonitoring {
    param([string]$LogDirectory, [int]$CheckIntervalSeconds = 30)
    
    Write-Host "リアルタイム監視開始" -ForegroundColor Cyan
    Write-Host "監視ディレクトリ: $LogDirectory" -ForegroundColor Gray
    Write-Host "チェック間隔: $CheckIntervalSeconds 秒" -ForegroundColor Gray
    
    $lastCheck = Get-Date
    
    while ($true) {
        try {
            # 最新ログファイル確認
            $recentFiles = Get-ChildItem -Path $LogDirectory -Filter "*.log" | 
                Where-Object { $_.LastWriteTime -gt $lastCheck }
            
            if ($recentFiles.Count -gt 0) {
                Write-Host "新しいログ活動を検出: $($recentFiles.Count) ファイル" -ForegroundColor Yellow
                
                # 簡易分析実行
                $analyzer = [LogAnalyzer]::new($LogDirectory)
                $analyzer.LoadLogs(1)  # 過去1日
                $analyzer.AnalyzeStatistics()
                $analyzer.DetectAnomalies()
                
                # 重要なアラートがあれば通知
                $criticalAlerts = $analyzer.Alerts | Where-Object { $_.Severity -eq "Critical" }
                if ($criticalAlerts.Count -gt 0) {
                    Write-Host "🚨 重要アラート検出!" -ForegroundColor Red
                    foreach ($alert in $criticalAlerts) {
                        Write-Host "[$($alert.Type)] $($alert.Message)" -ForegroundColor Red
                    }
                    
                    # 通知送信（実装に応じて）
                    Send-AlertNotification -Alerts $criticalAlerts
                }
            }
            
            $lastCheck = Get-Date
            Start-Sleep -Seconds $CheckIntervalSeconds
        }
        catch [System.Management.Automation.PipelineStoppedException] {
            Write-Host "リアルタイム監視停止" -ForegroundColor Yellow
            break
        }
        catch {
            Write-Warning "リアルタイム監視エラー: $($_.Exception.Message)"
            Start-Sleep -Seconds $CheckIntervalSeconds
        }
    }
}

function Send-AlertNotification {
    param([array]$Alerts)
    
    # メール通知、Slack通知、Teams通知などの実装
    # 組織の通知システムに応じてカスタマイズ
    
    foreach ($alert in $Alerts) {
        Write-EventLog -LogName Application -Source "BitLockerKeyManager" -EventId 2000 -EntryType Warning -Message "Alert: [$($alert.Severity)] $($alert.Type) - $($alert.Message)"
    }
}

# メイン実行
try {
    if ($RealTimeMonitoring) {
        Start-RealTimeMonitoring -LogDirectory $LogDirectory
    }
    else {
        Write-Host "BitLocker Key Manager ログ分析開始" -ForegroundColor Cyan
        
        $analyzer = [LogAnalyzer]::new($LogDirectory)
        $analyzer.LoadLogs($AnalysisDepthDays)
        $analyzer.AnalyzeStatistics()
        $analyzer.DetectAnomalies()
        
        # HTMLレポート生成
        $htmlReport = $analyzer.GenerateHtmlReport()
        
        $reportDir = Split-Path $OutputPath -Parent
        if (-not (Test-Path $reportDir)) {
            New-Item -Path $reportDir -ItemType Directory -Force | Out-Null
        }
        
        Set-Content -Path $OutputPath -Value $htmlReport -Encoding UTF8
        
        Write-Host "`nログ分析完了!" -ForegroundColor Green
        Write-Host "レポート: $OutputPath" -ForegroundColor Yellow
        Write-Host "アラート数: $($analyzer.Alerts.Count)" -ForegroundColor $(if ($analyzer.Alerts.Count -gt 0) { "Red" } else { "Green" })
        
        # アラート通知
        if ($GenerateAlerts -and $analyzer.Alerts.Count -gt 0) {
            Send-AlertNotification -Alerts $analyzer.Alerts
        }
        
        # コンソール統計表示
        Write-Host "`n統計サマリー:" -ForegroundColor Cyan
        Write-Host "総ログエントリ: $($analyzer.Statistics["TotalEntries"])" -ForegroundColor White
        Write-Host "エラー率: $($analyzer.Statistics["ErrorAnalysis"]["ErrorRate"])%" -ForegroundColor White
        
        if ($analyzer.Statistics.ContainsKey("Performance")) {
            Write-Host "平均処理時間: $([math]::Round($analyzer.Statistics["Performance"]["AverageProcessingTime"]/1000, 1))秒" -ForegroundColor White
        }
    }
}
catch {
    Write-Error "ログ分析エラー: $($_.Exception.Message)"
    exit 1
}
```

## 7.3 スクリプトのバージョン管理

### 7.3.1 Git統合とデプロイメント管理

#### 7.3.1.1 バージョン管理システム
```powershell
# Version-Manager.ps1
# BitLocker Key Manager バージョン管理システム

[CmdletBinding()]
param(
    [Parameter(ParameterSetName = "Deploy")]
    [string]$Version,
    
    [Parameter(ParameterSetName = "Deploy")]
    [string]$Environment = "Production",
    
    [Parameter(ParameterSetName = "Rollback")]
    [string]$RollbackToVersion,
    
    [Parameter(ParameterSetName = "Status")]
    [switch]$ShowStatus,
    
    [string]$RepositoryPath = "C:\BitLockerKeyManager-Repo",
    [string]$DeploymentPath = "C:\Program Files\BitLockerKeyManager",
    [string]$BackupPath = "C:\Program Files\BitLockerKeyManager\Backups"
)

class VersionManager {
    [string]$RepoPath
    [string]$DeployPath
    [string]$BackupPath
    [hashtable]$VersionHistory
    
    VersionManager([string]$RepoPath, [string]$DeployPath, [string]$BackupPath) {
        $this.RepoPath = $RepoPath
        $this.DeployPath = $DeployPath
        $this.BackupPath = $BackupPath
        $this.LoadVersionHistory()
    }
    
    [void] LoadVersionHistory() {
        $historyFile = Join-Path $this.DeployPath "version-history.json"
        
        if (Test-Path $historyFile) {
            try {
                $this.VersionHistory = Get-Content $historyFile | ConvertFrom-Json -AsHashtable
            }
            catch {
                Write-Warning "バージョン履歴読み込み失敗。新規作成します。"
                $this.VersionHistory = @{}
            }
        }
        else {
            $this.VersionHistory = @{}
        }
    }
    
    [void] SaveVersionHistory() {
        $historyFile = Join-Path $this.DeployPath "version-history.json"
        
        try {
            $this.VersionHistory | ConvertTo-Json -Depth 3 | Set-Content -Path $historyFile -Encoding UTF8
        }
        catch {
            Write-Error "バージョン履歴保存失敗: $($_.Exception.Message)"
        }
    }
    
    [string] GetCurrentVersion() {
        $versionFile = Join-Path $this.DeployPath "VERSION.txt"
        
        if (Test-Path $versionFile) {
            return (Get-Content $versionFile -First 1).Trim()
        }
        
        return "Unknown"
    }
    
    [hashtable] GetGitInfo([string]$Version) {
        Push-Location $this.RepoPath
        
        try {
            $commitHash = git rev-parse $Version 2>$null
            $commitDate = git show -s --format=%ci $Version 2>$null
            $commitMessage = git show -s --format=%s $Version 2>$null
            $author = git show -s --format=%an $Version 2>$null
            
            return @{
                Version = $Version
                CommitHash = $commitHash
                Date = $commitDate
                Message = $commitMessage
                Author = $author
                Valid = $LASTEXITCODE -eq 0
            }
        }
        catch {
            return @{
                Version = $Version
                Valid = $false
                Error = $_.Exception.Message
            }
        }
        finally {
            Pop-Location
        }
    }
    
    [void] CreateBackup([string]$Version) {
        Write-Host "現在の配布をバックアップ中..." -ForegroundColor Yellow
        
        $backupDir = Join-Path $this.BackupPath "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')-$Version"
        
        if (-not (Test-Path $this.BackupPath)) {
            New-Item -Path $this.BackupPath -ItemType Directory -Force | Out-Null
        }
        
        # 設定ファイルとログを除く全ファイルをバックアップ
        $excludePatterns = @("*.log", "Config\*.json", "Data\*", "Logs\*", "Reports\*")
        
        robocopy $this.DeployPath $backupDir /E /XF $excludePatterns /XD Logs Reports Data /NP /NFL /NDL | Out-Null
        
        if ($LASTEXITCODE -le 1) {  # robocopyの成功コード
            Write-Host "✓ バックアップ作成完了: $backupDir" -ForegroundColor Green
            
            # バックアップ履歴に記録
            $this.VersionHistory["Backups"] = $this.VersionHistory["Backups"] ?? @()
            $this.VersionHistory["Backups"] += @{
                Version = $Version
                BackupPath = $backupDir
                CreatedDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            }
        }
        else {
            throw "バックアップ作成失敗 (robocopy exit code: $LASTEXITCODE)"
        }
    }
    
    [bool] DeployVersion([string]$Version, [string]$Environment) {
        Write-Host "バージョン $Version を $Environment 環境にデプロイ開始" -ForegroundColor Cyan
        
        # Git情報確認
        $gitInfo = $this.GetGitInfo($Version)
        if (-not $gitInfo.Valid) {
            Write-Error "無効なバージョン: $Version"
            return $false
        }
        
        Write-Host "デプロイ対象:" -ForegroundColor White
        Write-Host "  バージョン: $($gitInfo.Version)" -ForegroundColor Gray
        Write-Host "  コミット: $($gitInfo.CommitHash.Substring(0,8))" -ForegroundColor Gray
        Write-Host "  日時: $($gitInfo.Date)" -ForegroundColor Gray
        Write-Host "  メッセージ: $($gitInfo.Message)" -ForegroundColor Gray
        Write-Host "  作成者: $($gitInfo.Author)" -ForegroundColor Gray
        
        try {
            # 現在のバージョンバックアップ
            $currentVersion = $this.GetCurrentVersion()
            if ($currentVersion -ne "Unknown") {
                $this.CreateBackup($currentVersion)
            }
            
            # Gitからチェックアウト
            Push-Location $this.RepoPath
            
            git fetch origin 2>$null
            git checkout $Version 2>$null
            
            if ($LASTEXITCODE -ne 0) {
                throw "Git checkout失敗"
            }
            
            Pop-Location
            
            # デプロイメント実行
            $deployScript = Join-Path $this.RepoPath "Scripts\Deploy-BitLockerKeyManager.ps1"
            if (Test-Path $deployScript) {
                & $deployScript -Environment $Environment -TargetPath $this.DeployPath -UpdateOnly
                
                if ($LASTEXITCODE -ne 0) {
                    throw "デプロイメントスクリプト実行失敗"
                }
            }
            else {
                # 手動ファイルコピー
                $sourceFiles = @("Scripts", "Tools", "Documentation")
                foreach ($folder in $sourceFiles) {
                    $sourcePath = Join-Path $this.RepoPath $folder
                    $targetPath = Join-Path $this.DeployPath $folder
                    
                    if (Test-Path $sourcePath) {
                        robocopy $sourcePath $targetPath /E /XO /NP /NFL /NDL | Out-Null
                        if ($LASTEXITCODE -gt 1) {
                            throw "ファイルコピー失敗: $folder"
                        }
                    }
                }
            }
            
            # バージョンファイル更新
            Set-Content -Path (Join-Path $this.DeployPath "VERSION.txt") -Value $Version -Encoding UTF8
            
            # バージョン履歴記録
            $this.VersionHistory["Deployments"] = $this.VersionHistory["Deployments"] ?? @()
            $this.VersionHistory["Deployments"] += @{
                Version = $Version
                Environment = $Environment
                DeployedDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                GitInfo = $gitInfo
                DeployedBy = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
            }
            
            $this.SaveVersionHistory()
            
            Write-Host "✓ デプロイメント完了" -ForegroundColor Green
            return $true
        }
        catch {
            Write-Error "デプロイメント失敗: $($_.Exception.Message)"
            return $false
        }
        finally {
            if (Get-Location -Stack -ErrorAction SilentlyContinue) {
                Pop-Location
            }
        }
    }
    
    [bool] RollbackToVersion([string]$Version) {
        Write-Host "バージョン $Version へのロールバック開始" -ForegroundColor Yellow
        
        # バックアップからの復元
        $backups = $this.VersionHistory["Backups"] ?? @()
        $targetBackup = $backups | Where-Object { $_.Version -eq $Version } | Sort-Object CreatedDate -Descending | Select-Object -First 1
        
        if ($targetBackup) {
            Write-Host "バックアップから復元: $($targetBackup.BackupPath)" -ForegroundColor Cyan
            
            try {
                # 現在のバージョンをバックアップ
                $currentVersion = $this.GetCurrentVersion()
                $this.CreateBackup($currentVersion)
                
                # バックアップから復元
                robocopy $targetBackup.BackupPath $this.DeployPath /E /XO /NP /NFL /NDL | Out-Null
                
                if ($LASTEXITCODE -le 1) {
                    # バージョンファイル更新
                    Set-Content -Path (Join-Path $this.DeployPath "VERSION.txt") -Value $Version -Encoding UTF8
                    
                    # ロールバック履歴記録
                    $this.VersionHistory["Rollbacks"] = $this.VersionHistory["Rollbacks"] ?? @()
                    $this.VersionHistory["Rollbacks"] += @{
                        FromVersion = $currentVersion
                        ToVersion = $Version
                        RollbackDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                        RollbackBy = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
                    }
                    
                    $this.SaveVersionHistory()
                    
                    Write-Host "✓ ロールバック完了" -ForegroundColor Green
                    return $true
                }
                else {
                    throw "ファイル復元失敗 (robocopy exit code: $LASTEXITCODE)"
                }
            }
            catch {
                Write-Error "ロールバック失敗: $($_.Exception.Message)"
                return $false
            }
        }
        else {
            # Gitからの再デプロイ
            Write-Host "バックアップが見つかりません。Gitから再デプロイします。" -ForegroundColor Yellow
            return $this.DeployVersion($Version, "Production")
        }
    }
    
    [hashtable] GetDeploymentStatus() {
        $currentVersion = $this.GetCurrentVersion()
        $gitInfo = $this.GetGitInfo($currentVersion)
        
        $deployments = $this.VersionHistory["Deployments"] ?? @()
        $rollbacks = $this.VersionHistory["Rollbacks"] ?? @()
        $backups = $this.VersionHistory["Backups"] ?? @()
        
        return @{
            CurrentVersion = $currentVersion
            GitInfo = $gitInfo
            TotalDeployments = $deployments.Count
            TotalRollbacks = $rollbacks.Count
            TotalBackups = $backups.Count
            LastDeployment = if ($deployments.Count -gt 0) { $deployments[-1] } else { $null }
            LastRollback = if ($rollbacks.Count -gt 0) { $rollbacks[-1] } else { $null }
            AvailableBackups = $backups | Sort-Object CreatedDate -Descending | Select-Object -First 5
        }
    }
}

function Show-DeploymentStatus {
    param([VersionManager]$Manager)
    
    $status = $Manager.GetDeploymentStatus()
    
    Write-Host "`nBitLocker Key Manager デプロイメント状況" -ForegroundColor Cyan
    Write-Host "=" * 50 -ForegroundColor Gray
    
    Write-Host "`n現在のバージョン: " -NoNewline -ForegroundColor White
    Write-Host $status.CurrentVersion -ForegroundColor Green
    
    if ($status.GitInfo.Valid) {
        Write-Host "コミット: $($status.GitInfo.CommitHash.Substring(0,8))" -ForegroundColor Gray
        Write-Host "日時: $($status.GitInfo.Date)" -ForegroundColor Gray
        Write-Host "メッセージ: $($status.GitInfo.Message)" -ForegroundColor Gray
    }
    
    Write-Host "`n統計:" -ForegroundColor White
    Write-Host "  総デプロイ回数: $($status.TotalDeployments)" -ForegroundColor Gray
    Write-Host "  総ロールバック回数: $($status.TotalRollbacks)" -ForegroundColor Gray
    Write-Host "  利用可能バックアップ数: $($status.TotalBackups)" -ForegroundColor Gray
    
    if ($status.LastDeployment) {
        Write-Host "`n最新デプロイ:" -ForegroundColor White
        Write-Host "  バージョン: $($status.LastDeployment.Version)" -ForegroundColor Gray
        Write-Host "  環境: $($status.LastDeployment.Environment)" -ForegroundColor Gray
        Write-Host "  日時: $($status.LastDeployment.DeployedDate)" -ForegroundColor Gray
        Write-Host "  実行者: $($status.LastDeployment.DeployedBy)" -ForegroundColor Gray
    }
    
    if ($status.AvailableBackups.Count -gt 0) {
        Write-Host "`n利用可能なバックアップ:" -ForegroundColor White
        foreach ($backup in $status.AvailableBackups) {
            Write-Host "  $($backup.Version) ($($backup.CreatedDate))" -ForegroundColor Gray
        }
    }
}

# メイン実行
try {
    Write-Host "BitLocker Key Manager バージョン管理システム" -ForegroundColor Cyan
    
    # 管理者権限確認
    if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
        throw "このスクリプトは管理者権限で実行してください"
    }
    
    # バージョンマネージャー初期化
    $versionManager = [VersionManager]::new($RepositoryPath, $DeploymentPath, $BackupPath)
    
    switch ($PSCmdlet.ParameterSetName) {
        "Deploy" {
            if ($versionManager.DeployVersion($Version, $Environment)) {
                Write-Host "`nデプロイメント成功!" -ForegroundColor Green
                Show-DeploymentStatus -Manager $versionManager
            }
            else {
                Write-Host "`nデプロイメント失敗" -ForegroundColor Red
                exit 1
            }
        }
        
        "Rollback" {
            if ($versionManager.RollbackToVersion($RollbackToVersion)) {
                Write-Host "`nロールバック成功!" -ForegroundColor Green
                Show-DeploymentStatus -Manager $versionManager
            }
            else {
                Write-Host "`nロールバック失敗" -ForegroundColor Red
                exit 1
            }
        }
        
        "Status" {
            Show-DeploymentStatus -Manager $versionManager
        }
        
        default {
            Write-Host "`n使用方法:" -ForegroundColor Yellow
            Write-Host "  デプロイ: -Version v1.2.0 -Environment Production" -ForegroundColor White
            Write-Host "  ロールバック: -RollbackToVersion v1.1.0" -ForegroundColor White
            Write-Host "  状況確認: -ShowStatus" -ForegroundColor White
        }
    }
}
catch {
    Write-Error "バージョン管理エラー: $($_.Exception.Message)"
    exit 1
}
```

## 7.4 セキュリティ更新への対応

### 7.4.1 自動セキュリティ更新システム

#### 7.4.1.1 セキュリティ更新検出と適用
```powershell
# Security-Update-Manager.ps1
# セキュリティ更新管理システム

[CmdletBinding()]
param(
    [switch]$CheckUpdates,
    [switch]$ApplyUpdates,
    [switch]$EmergencyUpdate,
    [string]$ConfigFile = "C:\Program Files\BitLockerKeyManager\Config\BitLockerConfig.json"
)

class SecurityUpdateManager {
    [hashtable]$Config
    [string]$UpdateHistoryPath
    [array]$UpdateSources
    [hashtable]$CriticalComponents
    
    SecurityUpdateManager([hashtable]$Config) {
        $this.Config = $Config
        $this.UpdateHistoryPath = "C:\Program Files\BitLockerKeyManager\Data\security-updates.json"
        $this.InitializeUpdateSources()
        $this.InitializeCriticalComponents()
    }
    
    [void] InitializeUpdateSources() {
        $this.UpdateSources = @(
            @{
                Name = "PowerShell Gallery"
                Type = "Module"
                CheckCommand = "Find-Module"
                UpdateCommand = "Update-Module"
                Modules = @("Microsoft.Graph.Authentication", "Microsoft.Graph.DeviceManagement")
            },
            @{
                Name = "Windows Update"
                Type = "OS"
                CheckCommand = "Get-WindowsUpdate"
                UpdateCommand = "Install-WindowsUpdate"
                Categories = @("Security Updates", "Critical Updates")
            },
            @{
                Name = "Certificate Store"
                Type = "Certificate"
                CheckCommand = "Get-ChildItem Cert:"
                Action = "Manual"
            },
            @{
                Name = "Custom Repository"
                Type = "Application"
                URL = $this.Config.UpdateRepositoryURL ?? "https://updates.company.com/bitlocker"
                CheckInterval = "Daily"
            }
        )
    }
    
    [void] InitializeCriticalComponents() {
        $this.CriticalComponents = @{
            "Microsoft.Graph.Authentication" = @{
                MinVersion = "1.0.0"
                SecurityBaseline = "1.28.0"
                LastChecked = [datetime]::MinValue
                AutoUpdate = $true
            }
            "Microsoft.Graph.DeviceManagement" = @{
                MinVersion = "1.0.0"
                SecurityBaseline = "1.28.0"
                LastChecked = [datetime]::MinValue
                AutoUpdate = $true
            }
            "Windows" = @{
                MinVersion = "10.0.19041"
                SecurityBaseline = "Latest"
                LastChecked = [datetime]::MinValue
                AutoUpdate = $false  # 手動制御
            }
            "Authentication Certificate" = @{
                ExpiryWarningDays = 30
                LastChecked = [datetime]::MinValue
                AutoRenewal = $false
            }
        }
    }
    
    [array] CheckForUpdates([bool]$IncludeOptional = $false) {
        Write-Host "セキュリティ更新確認開始" -ForegroundColor Cyan
        
        $availableUpdates = @()
        
        # PowerShellモジュール更新確認
        foreach ($source in $this.UpdateSources) {
            if ($source.Type -eq "Module") {
                Write-Host "モジュール更新確認: $($source.Name)" -ForegroundColor Yellow
                
                foreach ($moduleName in $source.Modules) {
                    try {
                        $installedModule = Get-Module -Name $moduleName -ListAvailable | Sort-Object Version -Descending | Select-Object -First 1
                        $latestModule = Find-Module -Name $moduleName
                        
                        if ($installedModule -and $latestModule) {
                            $installed = [version]$installedModule.Version
                            $latest = [version]$latestModule.Version
                            
                            if ($latest -gt $installed) {
                                $updateInfo = @{
                                    Component = $moduleName
                                    Type = "PowerShell Module"
                                    CurrentVersion = $installed.ToString()
                                    LatestVersion = $latest.ToString()
                                    SecurityUpdate = $this.IsSecurityUpdate($moduleName, $latest)
                                    AutoUpdate = $this.CriticalComponents[$moduleName].AutoUpdate
                                    Priority = if ($this.IsSecurityUpdate($moduleName, $latest)) { "Critical" } else { "Normal" }
                                }
                                
                                $availableUpdates += $updateInfo
                                Write-Host "  更新利用可能: $moduleName $installed → $latest" -ForegroundColor $(if ($updateInfo.SecurityUpdate) { "Red" } else { "Yellow" })
                            }
                            else {
                                Write-Host "  最新: $moduleName $installed" -ForegroundColor Green
                            }
                        }
                    }
                    catch {
                        Write-Warning "モジュール確認エラー: $moduleName - $($_.Exception.Message)"
                    }
                }
            }
        }
        
        # Windows Update確認
        if (Get-Module PSWindowsUpdate -ListAvailable) {
            Write-Host "Windows Update確認" -ForegroundColor Yellow
            
            try {
                $windowsUpdates = Get-WindowsUpdate -Category "Security Updates", "Critical Updates" -AcceptAll -IgnoreReboot
                
                foreach ($update in $windowsUpdates) {
                    $updateInfo = @{
                        Component = "Windows"
                        Type = "Windows Update"
                        Title = $update.Title
                        KB = $update.KB
                        Size = $update.Size
                        SecurityUpdate = $update.Title -match "Security|Critical"
                        AutoUpdate = $false
                        Priority = if ($update.Title -match "Security|Critical") { "Critical" } else { "Normal" }
                    }
                    
                    $availableUpdates += $updateInfo
                    Write-Host "  利用可能: $($update.Title)" -ForegroundColor Red
                }
            }
            catch {
                Write-Warning "Windows Update確認エラー: $($_.Exception.Message)"
            }
        }
        
        # 証明書有効期限確認
        Write-Host "証明書有効期限確認" -ForegroundColor Yellow
        
        $certThumbprint = $this.Config.CertificateThumbprint
        if ($certThumbprint) {
            $cert = Get-ChildItem -Path "Cert:\LocalMachine\My\$certThumbprint" -ErrorAction SilentlyContinue
            
            if ($cert) {
                $daysUntilExpiry = ($cert.NotAfter - (Get-Date)).Days
                $warningDays = $this.CriticalComponents["Authentication Certificate"].ExpiryWarningDays
                
                if ($daysUntilExpiry -le $warningDays) {
                    $updateInfo = @{
                        Component = "Authentication Certificate"
                        Type = "Certificate"
                        CurrentExpiry = $cert.NotAfter.ToString("yyyy-MM-dd")
                        DaysUntilExpiry = $daysUntilExpiry
                        SecurityUpdate = $true
                        AutoUpdate = $false
                        Priority = if ($daysUntilExpiry -le 7) { "Critical" } else { "High" }
                        Action = "Certificate Renewal Required"
                    }
                    
                    $availableUpdates += $updateInfo
                    Write-Host "  証明書期限警告: $daysUntilExpiry 日後に期限切れ" -ForegroundColor Red
                }
                else {
                    Write-Host "  証明書OK: $daysUntilExpiry 日後に期限切れ" -ForegroundColor Green
                }
            }
        }
        
        # カスタムアプリケーション更新確認
        $customUpdates = $this.CheckCustomApplicationUpdates()
        $availableUpdates += $customUpdates
        
        Write-Host "更新確認完了: $($availableUpdates.Count) 件の更新が利用可能" -ForegroundColor Cyan
        
        return $availableUpdates
    }
    
    [array] CheckCustomApplicationUpdates() {
        $updates = @()
        
        # カスタムリポジトリから更新確認
        $customSource = $this.UpdateSources | Where-Object { $_.Type -eq "Application" }
        
        if ($customSource -and $customSource.URL) {
            try {
                Write-Host "カスタム更新確認: $($customSource.URL)" -ForegroundColor Yellow
                
                $response = Invoke-RestMethod -Uri "$($customSource.URL)/api/updates" -Method GET -TimeoutSec 30
                
                foreach ($update in $response.Updates) {
                    $currentVersion = Get-Content "C:\Program Files\BitLockerKeyManager\VERSION.txt" -ErrorAction SilentlyContinue
                    
                    if ($update.Version -and $currentVersion) {
                        $current = [version]$currentVersion.Trim()
                        $available = [version]$update.Version
                        
                        if ($available -gt $current) {
                            $updateInfo = @{
                                Component = "BitLocker Key Manager"
                                Type = "Application"
                                CurrentVersion = $current.ToString()
                                LatestVersion = $available.ToString()
                                SecurityUpdate = $update.SecurityUpdate ?? $false
                                ReleaseNotes = $update.ReleaseNotes
                                DownloadURL = $update.DownloadURL
                                AutoUpdate = $update.AutoUpdate ?? $false
                                Priority = if ($update.SecurityUpdate) { "Critical" } else { "Normal" }
                            }
                            
                            $updates += $updateInfo
                        }
                    }
                }
            }
            catch {
                Write-Warning "カスタム更新確認エラー: $($_.Exception.Message)"
            }
        }
        
        return $updates
    }
    
    [bool] IsSecurityUpdate([string]$ModuleName, [version]$Version) {
        # セキュリティベースラインバージョンとの比較
        if ($this.CriticalComponents.ContainsKey($ModuleName)) {
            $baseline = $this.CriticalComponents[$ModuleName].SecurityBaseline
            if ($baseline -ne "Latest") {
                return $Version -ge [version]$baseline
            }
        }
        
        # リリースノートからセキュリティ更新を検出（簡略化）
        try {
            $moduleInfo = Find-Module -Name $ModuleName -RequiredVersion $Version.ToString()
            return $moduleInfo.Description -match "security|vulnerability|CVE|patch"
        }
        catch {
            return $false
        }
    }
    
    [bool] ApplyUpdates([array]$Updates, [bool]$AutoApprove = $false, [bool]$EmergencyMode = $false) {
        Write-Host "セキュリティ更新適用開始" -ForegroundColor Cyan
        
        if (-not $AutoApprove -and -not $EmergencyMode) {
            Write-Host "`n適用予定の更新:" -ForegroundColor Yellow
            foreach ($update in $Updates) {
                $priorityColor = switch ($update.Priority) {
                    "Critical" { "Red" }
                    "High" { "Yellow" }
                    default { "White" }
                }
                Write-Host "  [$($update.Priority)] $($update.Component) $($update.CurrentVersion) → $($update.LatestVersion)" -ForegroundColor $priorityColor
            }
            
            $confirmation = Read-Host "`n更新を適用しますか？ (y/N)"
            if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
                Write-Host "更新がキャンセルされました" -ForegroundColor Yellow
                return $false
            }
        }
        
        $successCount = 0
        $failureCount = 0
        
        # 緊急モードでは重要度順に処理
        if ($EmergencyMode) {
            $Updates = $Updates | Sort-Object @{Expression = {
                switch ($_.Priority) {
                    "Critical" { 1 }
                    "High" { 2 }
                    "Normal" { 3 }
                    default { 4 }
                }
            }}
        }
        
        foreach ($update in $Updates) {
            Write-Host "`n更新適用: $($update.Component)" -ForegroundColor Cyan
            
            try {
                $success = $false
                
                switch ($update.Type) {
                    "PowerShell Module" {
                        if ($update.AutoUpdate -or $EmergencyMode) {
                            Update-Module -Name $update.Component -Force
                            $success = $true
                            Write-Host "✓ モジュール更新完了: $($update.Component)" -ForegroundColor Green
                        }
                        else {
                            Write-Host "⚠ 手動更新が必要: $($update.Component)" -ForegroundColor Yellow
                        }
                    }
                    
                    "Windows Update" {
                        if ($EmergencyMode) {
                            Install-WindowsUpdate -KBArticleID $update.KB -AcceptAll -AutoReboot
                            $success = $true
                            Write-Host "✓ Windows Update適用完了: $($update.KB)" -ForegroundColor Green
                        }
                        else {
                            Write-Host "⚠ Windows Update手動適用が必要: $($update.KB)" -ForegroundColor Yellow
                        }
                    }
                    
                    "Application" {
                        if ($update.DownloadURL) {
                            # アプリケーション更新の自動適用
                            $this.ApplyApplicationUpdate($update)
                            $success = $true
                        }
                    }
                    
                    "Certificate" {
                        Write-Host "⚠ 証明書更新は手動で実行してください" -ForegroundColor Yellow
                        Write-Host "  有効期限: $($update.CurrentExpiry)" -ForegroundColor Gray
                        Write-Host "  残り日数: $($update.DaysUntilExpiry)" -ForegroundColor Gray
                    }
                }
                
                if ($success) {
                    $successCount++
                    $this.RecordUpdateHistory($update, "Success")
                }
                else {
                    $this.RecordUpdateHistory($update, "Skipped")
                }
            }
            catch {
                $failureCount++
                Write-Host "✗ 更新失敗: $($update.Component) - $($_.Exception.Message)" -ForegroundColor Red
                $this.RecordUpdateHistory($update, "Failed", $_.Exception.Message)
            }
        }
        
        Write-Host "`n更新適用完了" -ForegroundColor Green
        Write-Host "成功: $successCount 件" -ForegroundColor Green
        Write-Host "失敗: $failureCount 件" -ForegroundColor Red
        
        return $failureCount -eq 0
    }
    
    [void] ApplyApplicationUpdate([hashtable]$Update) {
        Write-Host "アプリケーション更新適用: $($Update.Component)" -ForegroundColor Yellow
        
        $tempPath = "$env:TEMP\BitLockerKeyManager-Update-$($Update.LatestVersion).zip"
        
        # 更新パッケージダウンロード
        Invoke-WebRequest -Uri $Update.DownloadURL -OutFile $tempPath
        
        # 更新適用（バージョン管理システム経由）
        $versionManagerScript = "C:\Program Files\BitLockerKeyManager\Scripts\Version-Manager.ps1"
        if (Test-Path $versionManagerScript) {
            & $versionManagerScript -Version $Update.LatestVersion -Environment "Production"
        }
        
        # 一時ファイル削除
        Remove-Item -Path $tempPath -Force -ErrorAction SilentlyContinue
    }
    
    [void] RecordUpdateHistory([hashtable]$Update, [string]$Status, [string]$ErrorMessage = "") {
        $historyEntry = @{
            Component = $Update.Component
            Type = $Update.Type
            FromVersion = $Update.CurrentVersion
            ToVersion = $Update.LatestVersion
            Status = $Status
            AppliedDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            AppliedBy = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
            ErrorMessage = $ErrorMessage
            SecurityUpdate = $Update.SecurityUpdate
            Priority = $Update.Priority
        }
        
        # 履歴ファイル読み込み
        $history = @()
        if (Test-Path $this.UpdateHistoryPath) {
            try {
                $history = Get-Content $this.UpdateHistoryPath | ConvertFrom-Json
            }
            catch {
                Write-Warning "更新履歴読み込み失敗"
            }
        }
        
        # 新エントリ追加
        $history += $historyEntry
        
        # 履歴保存（最新100件まで）
        $history = $history | Sort-Object AppliedDate -Descending | Select-Object -First 100
        
        try {
            $historyDir = Split-Path $this.UpdateHistoryPath -Parent
            if (-not (Test-Path $historyDir)) {
                New-Item -Path $historyDir -ItemType Directory -Force | Out-Null
            }
            
            $history | ConvertTo-Json | Set-Content -Path $this.UpdateHistoryPath -Encoding UTF8
        }
        catch {
            Write-Warning "更新履歴保存失敗: $($_.Exception.Message)"
        }
    }
    
    [array] GetUpdateHistory([int]$Days = 30) {
        if (-not (Test-Path $this.UpdateHistoryPath)) {
            return @()
        }
        
        try {
            $history = Get-Content $this.UpdateHistoryPath | ConvertFrom-Json
            $cutoffDate = (Get-Date).AddDays(-$Days)
            
            return $history | Where-Object { [datetime]$_.AppliedDate -gt $cutoffDate } | Sort-Object AppliedDate -Descending
        }
        catch {
            Write-Warning "更新履歴読み込み失敗: $($_.Exception.Message)"
            return @()
        }
    }
}

function Send-SecurityAlert {
    param([array]$CriticalUpdates)
    
    if ($CriticalUpdates.Count -eq 0) {
        return
    }
    
    $alertMessage = "🚨 重要なセキュリティ更新が利用可能です:`n`n"
    
    foreach ($update in $CriticalUpdates) {
        $alertMessage += "- $($update.Component): $($update.CurrentVersion) → $($update.LatestVersion)`n"
    }
    
    $alertMessage += "`n緊急適用が推奨されます。"
    
    # イベントログ出力
    Write-EventLog -LogName Application -Source "BitLockerKeyManager" -EventId 3000 -EntryType Warning -Message $alertMessage
    
    # 追加通知（メール、Slack等）の実装
    # Send-MailMessage, Invoke-RestMethod等を使用
    
    Write-Host $alertMessage -ForegroundColor Red
}

# メイン実行
try {
    Write-Host "BitLocker Key Manager セキュリティ更新管理" -ForegroundColor Cyan
    
    # 設定読み込み
    if (Test-Path $ConfigFile) {
        $config = Get-Content $ConfigFile | ConvertFrom-Json -AsHashtable
    }
    else {
        $config = @{}
    }
    
    $updateManager = [SecurityUpdateManager]::new($config)
    
    if ($CheckUpdates) {
        Write-Host "セキュリティ更新確認実行" -ForegroundColor Yellow
        
        $availableUpdates = $updateManager.CheckForUpdates()
        
        if ($availableUpdates.Count -gt 0) {
            Write-Host "`n利用可能な更新:" -ForegroundColor Cyan
            $availableUpdates | Format-Table Component, Type, CurrentVersion, LatestVersion, Priority, SecurityUpdate -AutoSize
            
            # 重要な更新のアラート
            $criticalUpdates = $availableUpdates | Where-Object { $_.Priority -eq "Critical" }
            if ($criticalUpdates.Count -gt 0) {
                Send-SecurityAlert -CriticalUpdates $criticalUpdates
            }
        }
        else {
            Write-Host "`n利用可能な更新はありません" -ForegroundColor Green
        }
    }
    
    if ($ApplyUpdates) {
        $availableUpdates = $updateManager.CheckForUpdates()
        
        if ($availableUpdates.Count -gt 0) {
            $updateManager.ApplyUpdates($availableUpdates, $false, $EmergencyUpdate)
        }
        else {
            Write-Host "適用可能な更新はありません" -ForegroundColor Green
        }
    }
    
    if ($EmergencyUpdate) {
        Write-Host "緊急セキュリティ更新モード" -ForegroundColor Red
        
        $criticalUpdates = $updateManager.CheckForUpdates() | Where-Object { $_.SecurityUpdate -eq $true }
        
        if ($criticalUpdates.Count -gt 0) {
            Write-Host "緊急適用対象: $($criticalUpdates.Count) 件" -ForegroundColor Red
            $updateManager.ApplyUpdates($criticalUpdates, $true, $true)
        }
        else {
            Write-Host "緊急適用が必要な更新はありません" -ForegroundColor Green
        }
    }
    
    # 更新履歴表示
    $recentHistory = $updateManager.GetUpdateHistory(7)
    if ($recentHistory.Count -gt 0) {
        Write-Host "`n過去7日間の更新履歴:" -ForegroundColor Cyan
        $recentHistory | Select-Object Component, FromVersion, ToVersion, Status, AppliedDate | Format-Table -AutoSize
    }
}
catch {
    Write-Error "セキュリティ更新管理エラー: $($_.Exception.Message)"
    exit 1
}
```

## 7.5 運用チームの役割分担

### 7.5.1 役割定義と責任マトリックス

#### 7.5.1.1 RACI マトリックス
```yaml
RACI_Matrix:
  "スクリプト実行監視":
    IT_Operations: "R"  # Responsible
    Security_Team: "A"  # Accountable  
    System_Admin: "C"   # Consulted
    End_Users: "I"      # Informed
    
  "セキュリティ更新適用":
    Security_Team: "R"
    IT_Operations: "A"
    CISO: "C"
    Business_Users: "I"
    
  "インシデント対応":
    Security_Team: "R"
    IT_Operations: "R"
    Management: "A"
    Legal_Team: "C"
    
  "監査対応":
    Compliance_Team: "R"
    Security_Team: "A"
    IT_Operations: "C"
    External_Auditor: "I"
    
  "バックアップ・復旧":
    IT_Operations: "R"
    System_Admin: "A"
    Security_Team: "C"
    Business_Users: "I"
```

#### 7.5.1.2 チーム別責任定義
```powershell
# Team-Role-Manager.ps1
# 運用チーム役割管理システム

class TeamRole {
    [string]$TeamName
    [array]$Responsibilities
    [array]$Skills
    [array]$Tools
    [hashtable]$Contacts
    
    TeamRole([string]$Name) {
        $this.TeamName = $Name
        $this.Responsibilities = @()
        $this.Skills = @()
        $this.Tools = @()
        $this.Contacts = @{}
    }
}

class OperationTeamManager {
    [hashtable]$Teams
    [hashtable]$EscalationMatrix
    [hashtable]$OnCallSchedule
    
    OperationTeamManager() {
        $this.Teams = @{}
        $this.InitializeTeams()
        $this.InitializeEscalationMatrix()
    }
    
    [void] InitializeTeams() {
        # IT運用チーム
        $itOps = [TeamRole]::new("IT Operations")
        $itOps.Responsibilities = @(
            "日常的なスクリプト実行監視",
            "システムパフォーマンス監視",
            "ログ分析と問題の初期対応",
            "定期メンテナンスの実行",
            "バックアップ・復旧作業"
        )
        $itOps.Skills = @(
            "PowerShell スクリプティング",
            "Windows サーバー管理",
            "監視ツール操作",
            "基本的なトラブルシューティング"
        )
        $itOps.Tools = @(
            "Task Scheduler",
            "Event Viewer",
            "Performance Monitor",
            "PowerShell ISE/VSCode"
        )
        $itOps.Contacts = @{
            "Primary" = "it-ops@company.com"
            "Emergency" = "+81-3-1234-5678"
            "Slack" = "#it-operations"
        }
        
        # セキュリティチーム
        $security = [TeamRole]::new("Security Team")
        $security.Responsibilities = @(
            "セキュリティポリシー策定・更新",
            "セキュリティインシデント対応",
            "権限管理と証明書管理",
            "セキュリティ更新の評価・適用",
            "コンプライアンス要件への対応"
        )
        $security.Skills = @(
            "情報セキュリティ専門知識",
            "インシデント対応",
            "Microsoft Entra ID 管理",
            "証明書管理",
            "法規制・コンプライアンス"
        )
        $security.Tools = @(
            "Microsoft Entra ID Portal",
            "Security Center",
            "Certificate Manager",
            "SIEM システム"
        )
        $security.Contacts = @{
            "Primary" = "security@company.com"
            "Emergency" = "+81-3-1234-5679"
            "Slack" = "#security-team"
        }
        
        # システム管理チーム
        $sysAdmin = [TeamRole]::new("System Admin")
        $sysAdmin.Responsibilities = @(
            "システム基盤の設計・構築",
            "Active Directory 管理",
            "Group Policy 管理",
            "Microsoft Intune 管理",
            "システムアーキテクチャの最適化"
        )
        $sysAdmin.Skills = @(
            "Windows Server 管理",
            "Active Directory",
            "Group Policy",
            "Microsoft Intune",
            "PowerShell 上級スキル"
        )
        $sysAdmin.Tools = @(
            "Active Directory Users and Computers",
            "Group Policy Management Console",
            "Microsoft Endpoint Manager",
            "PowerShell"
        )
        $sysAdmin.Contacts = @{
            "Primary" = "sysadmin@company.com"
            "Emergency" = "+81-3-1234-5680"
            "Slack" = "#system-admin"
        }
        
        # コンプライアンスチーム
        $compliance = [TeamRole]::new("Compliance Team")
        $compliance.Responsibilities = @(
            "監査対応",
            "コンプライアンス要件管理",
            "文書化・記録管理",
            "リスク評価",
            "外部監査機関との調整"
        )
        $compliance.Skills = @(
            "法規制知識",
            "監査実務",
            "リスク管理",
            "文書管理",
            "プロジェクト管理"
        )
        $compliance.Tools = @(
            "監査管理システム",
            "文書管理システム",
            "リスク管理ツール"
        )
        $compliance.Contacts = @{
            "Primary" = "compliance@company.com"
            "Emergency" = "+81-3-1234-5681"
            "Slack" = "#compliance"
        }
        
        $this.Teams["ITOperations"] = $itOps
        $this.Teams["Security"] = $security
        $this.Teams["SystemAdmin"] = $sysAdmin
        $this.Teams["Compliance"] = $compliance
    }
    
    [void] InitializeEscalationMatrix() {
        $this.EscalationMatrix = @{
            "Level1_Initial" = @{
                ResponsibleTeam = "ITOperations"
                TimeLimit = 30  # minutes
                Actions = @(
                    "ログ確認",
                    "基本的なトラブルシューティング",
                    "問題の分類・優先度付け"
                )
                EscalationCriteria = @(
                    "30分以内に解決できない",
                    "セキュリティに関連する問題",
                    "複数システムに影響"
                )
            }
            "Level2_Specialist" = @{
                ResponsibleTeam = "Security|SystemAdmin"
                TimeLimit = 120  # minutes
                Actions = @(
                    "詳細分析",
                    "専門的なトラブルシューティング",
                    "一時的な回避策の実装"
                )
                EscalationCriteria = @(
                    "2時間以内に解決できない",
                    "業務に重大な影響",
                    "データ漏洩の可能性"
                )
            }
            "Level3_Management" = @{
                ResponsibleTeam = "Management"
                TimeLimit = 240  # minutes
                Actions = @(
                    "経営判断",
                    "外部専門家の招聘",
                    "お客様・パートナーへの通知"
                )
            }
        }
    }
    
    [string] GetResponsibleTeam([string]$IncidentType, [string]$Severity) {
        $routing = @{
            "Authentication_Error" = "Security"
            "Permission_Error" = "Security"
            "Certificate_Error" = "Security"
            "Script_Execution_Error" = "ITOperations"
            "Performance_Issue" = "ITOperations"
            "System_Error" = "SystemAdmin"
            "Network_Error" = "SystemAdmin"
            "Compliance_Issue" = "Compliance"
        }
        
        $team = $routing[$IncidentType]
        
        # 重要度が高い場合は複数チームを返す
        if ($Severity -eq "Critical") {
            switch ($IncidentType) {
                "Authentication_Error" { return "Security,ITOperations" }
                "Certificate_Error" { return "Security,SystemAdmin" }
                default { return $team ?? "ITOperations" }
            }
        }
        
        return $team ?? "ITOperations"
    }
    
    [hashtable] CreateIncidentTicket([string]$IncidentType, [string]$Severity, [string]$Description) {
        $ticketId = "BLK-$(Get-Date -Format 'yyyyMMdd')-$((Get-Random -Maximum 9999).ToString('D4'))"
        $responsibleTeam = $this.GetResponsibleTeam($IncidentType, $Severity)
        
        $ticket = @{
            TicketId = $ticketId
            IncidentType = $IncidentType
            Severity = $Severity
            Description = $Description
            ResponsibleTeam = $responsibleTeam
            CreatedDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            Status = "Open"
            AssignedTo = ""
            EscalationLevel = 1
            LastUpdate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            ResolutionTime = $null
            Notes = @()
        }
        
        # 自動通知
        $this.NotifyResponsibleTeam($ticket)
        
        return $ticket
    }
    
    [void] NotifyResponsibleTeam([hashtable]$Ticket) {
        $teams = $Ticket.ResponsibleTeam -split ","
        
        foreach ($teamName in $teams) {
            if ($this.Teams.ContainsKey($teamName)) {
                $team = $this.Teams[$teamName]
                $message = @"
🎫 新しいインシデントチケット: $($Ticket.TicketId)

種別: $($Ticket.IncidentType)
重要度: $($Ticket.Severity)
説明: $($Ticket.Description)

担当チーム: $($team.TeamName)
作成日時: $($Ticket.CreatedDate)

対応をお願いします。
"@
                
                # 通知送信（実装に応じて）
                Write-Host "通知送信: $($team.TeamName)" -ForegroundColor Yellow
                Write-Host $message -ForegroundColor Gray
                
                # Slack通知例
                if ($team.Contacts.Slack) {
                    # Send-SlackMessage -Channel $team.Contacts.Slack -Message $message
                }
                
                # メール通知例
                if ($team.Contacts.Primary) {
                    # Send-MailMessage -To $team.Contacts.Primary -Subject "BitLocker Key Manager Alert: $($Ticket.TicketId)" -Body $message
                }
            }
        }
    }
    
    [hashtable] GetTeamCapabilities() {
        $capabilities = @{}
        
        foreach ($teamName in $this.Teams.Keys) {
            $team = $this.Teams[$teamName]
            $capabilities[$teamName] = @{
                TeamName = $team.TeamName
                ResponsibilityCount = $team.Responsibilities.Count
                SkillCount = $team.Skills.Count
                ToolCount = $team.Tools.Count
                PrimaryContact = $team.Contacts.Primary
                EmergencyContact = $team.Contacts.Emergency
                AvailableSkills = $team.Skills -join ", "
            }
        }
        
        return $capabilities
    }
}

function Show-TeamStructure {
    param([OperationTeamManager]$Manager)
    
    Write-Host "BitLocker Key Manager 運用チーム構成" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Gray
    
    foreach ($teamName in $Manager.Teams.Keys) {
        $team = $Manager.Teams[$teamName]
        
        Write-Host "`n🏢 $($team.TeamName)" -ForegroundColor Yellow
        
        Write-Host "`n責任範囲:" -ForegroundColor White
        foreach ($responsibility in $team.Responsibilities) {
            Write-Host "  • $responsibility" -ForegroundColor Gray
        }
        
        Write-Host "`n必要スキル:" -ForegroundColor White
        foreach ($skill in $team.Skills) {
            Write-Host "  • $skill" -ForegroundColor Gray
        }
        
        Write-Host "`n使用ツール:" -ForegroundColor White
        foreach ($tool in $team.Tools) {
            Write-Host "  • $tool" -ForegroundColor Gray
        }
        
        Write-Host "`n連絡先:" -ForegroundColor White
        foreach ($contactType in $team.Contacts.Keys) {
            Write-Host "  $contactType`: $($team.Contacts[$contactType])" -ForegroundColor Gray
        }
        
        Write-Host ""
    }
}

function Show-EscalationMatrix {
    param([OperationTeamManager]$Manager)
    
    Write-Host "`nエスカレーションマトリックス" -ForegroundColor Cyan
    Write-Host "=" * 40 -ForegroundColor Gray
    
    foreach ($level in $Manager.EscalationMatrix.Keys) {
        $escalation = $Manager.EscalationMatrix[$level]
        
        Write-Host "`n📈 $level" -ForegroundColor Yellow
        Write-Host "担当チーム: $($escalation.ResponsibleTeam)" -ForegroundColor White
        Write-Host "制限時間: $($escalation.TimeLimit) 分" -ForegroundColor White
        
        Write-Host "実行アクション:" -ForegroundColor White
        foreach ($action in $escalation.Actions) {
            Write-Host "  • $action" -ForegroundColor Gray
        }
        
        if ($escalation.EscalationCriteria) {
            Write-Host "エスカレーション条件:" -ForegroundColor White
            foreach ($criteria in $escalation.EscalationCriteria) {
                Write-Host "  • $criteria" -ForegroundColor Gray
            }
        }
    }
}

# 使用例
try {
    $teamManager = [OperationTeamManager]::new()
    
    # チーム構成表示
    Show-TeamStructure -Manager $teamManager
    
    # エスカレーションマトリックス表示
    Show-EscalationMatrix -Manager $teamManager
    
    # チーム能力サマリー
    Write-Host "`nチーム能力サマリー" -ForegroundColor Cyan
    $capabilities = $teamManager.GetTeamCapabilities()
    $capabilities.Values | Format-Table TeamName, ResponsibilityCount, SkillCount, PrimaryContact -AutoSize
    
    # インシデントチケット作成例
    Write-Host "`nインシデントチケット作成例:" -ForegroundColor Cyan
    $ticket = $teamManager.CreateIncidentTicket("Authentication_Error", "High", "Microsoft Graph認証失敗が継続発生")
    
    Write-Host "作成されたチケット:" -ForegroundColor Yellow
    $ticket | Format-Table TicketId, IncidentType, Severity, ResponsibleTeam, Status -AutoSize
}
catch {
    Write-Error "運用チーム管理エラー: $($_.Exception.Message)"
}
```

## 7.6 まとめ

本章では、BitLocker回復キー削除システムの継続的な運用・監視・メンテナンスについて包括的に解説しました。重要なポイントは以下の通りです：

1. **定期実行スケジュール**: 環境規模に応じた最適な実行頻度と動的スケジューリング
2. **ログ監視と分析**: 構造化ログ分析、異常検出、リアルタイム監視システム
3. **バージョン管理**: Git統合によるデプロイメント管理とロールバック機能
4. **セキュリティ更新**: 自動更新検出・適用システムと緊急対応プロセス
5. **運用チーム体制**: 明確な役割分担、エスカレーションマトリックス、インシデント管理

次章では、これらの知識を統合した実践的な導入事例について詳しく解説します。

---

:::message
**運用の重要性**
技術的な実装だけでなく、適切な運用体制とプロセスの構築が、システムの長期的な成功を決定します。特にセキュリティ関連システムでは、継続的な監視と迅速な対応が不可欠です。
:::