# 第9章: デバイス管理運用最適化 - アウトライン（運用管理特化版）

## 構成方針
- 教育機関での効率的なデバイスライフサイクル管理
- Intune・Autopilot・年度更新プロセスの完全自動化
- GIGA スクール対応の大規模デバイス運用

## 9.1 デバイス管理運用体制の構築【既存維持・強化】

### 9.1.1 教育機関向けデバイス管理戦略
- **GIGA スクール対応デバイス管理**
  - 1人1台環境での効率的管理
  - 学年・学級別デバイス管理
  - 個人割り当てデバイスの追跡
  - 故障・紛失時の迅速な対応

- **教育カレンダー連動管理**
  ```powershell
  # 教育機関向けデバイス管理自動化
  function Initialize-EducationDeviceManagement {
      param(
          [string]$TenantId,
          [hashtable]$DeviceCategories = @{
              "Elementary" = @{
                  RestrictedApps = @("Calculator", "Camera")
                  AllowedApps = @("Word", "PowerPoint", "OneNote", "Teams")
                  ScreenTime = @{
                      WeekdayHours = 6
                      WeekendHours = 2
                  }
                  SafeSearch = "Strict"
              }
              "MiddleSchool" = @{
                  RestrictedApps = @("Calculator")
                  AllowedApps = @("Word", "PowerPoint", "OneNote", "Teams", "Excel")
                  ScreenTime = @{
                      WeekdayHours = 8
                      WeekendHours = 4
                  }
                  SafeSearch = "Moderate"
              }
              "HighSchool" = @{
                  RestrictedApps = @()
                  AllowedApps = @("All")
                  ScreenTime = @{
                      WeekdayHours = 10
                      WeekendHours = 8
                  }
                  SafeSearch = "Off"
              }
          }
      )
      
      # 学年別デバイス設定プロファイルの作成
      foreach ($grade in $DeviceCategories.Keys) {
          $settings = $DeviceCategories[$grade]
          
          $deviceProfile = @{
              DisplayName = "教育機関_$grade" + "_デバイス設定"
              Description = "$grade 向けのデバイス設定プロファイル"
              DeviceRestrictions = @{
                  Apps = @{
                      AllowedApps = $settings.AllowedApps
                      RestrictedApps = $settings.RestrictedApps
                  }
                  ScreenTime = $settings.ScreenTime
                  SafeSearch = $settings.SafeSearch
              }
              AssignmentTarget = @{
                  DeviceCategory = $grade
              }
          }
          
          # Intune設定プロファイルの作成
          New-IntuneDeviceConfigurationProfile @deviceProfile
          
          # デバイス群の自動管理開始
          Start-DeviceGroupManagement -Grade $grade -Profile $deviceProfile
      }
  }
  ```

### 9.1.2 Autopilot大規模展開の自動化
- **Windows Autopilot完全自動化**
  - デバイス登録の自動化
  - ハードウェアハッシュの自動登録
  - 配布グループの自動割り当て
  - 設定プロファイルの自動適用

- **展開プロセスの最適化**
  ```powershell
  # Autopilot 大規模展開自動化
  function Initialize-AutopilotMassDeployment {
      param(
          [string]$TenantId,
          [hashtable]$DeploymentSchedule = @{
              "2024-04-01" = @{
                  Schools = @("小学校A", "小学校B")
                  DeviceCount = 500
                  DeploymentProfile = "Elementary"
              }
              "2024-04-08" = @{
                  Schools = @("中学校A", "中学校B")
                  DeviceCount = 300
                  DeploymentProfile = "MiddleSchool"
              }
              "2024-04-15" = @{
                  Schools = @("高等学校A")
                  DeviceCount = 800
                  DeploymentProfile = "HighSchool"
              }
          }
      )
      
      # 展開スケジュールの自動実行
      foreach ($deploymentDate in $DeploymentSchedule.Keys) {
          $deployment = $DeploymentSchedule[$deploymentDate]
          
          # 展開ジョブのスケジュール
          Register-ScheduledJob -Name "Autopilot_$deploymentDate" -ScriptBlock {
              param($Deployment, $TenantId)
              
              Write-Host "Autopilot展開開始: $($Deployment.Schools -join ', ')" -ForegroundColor Green
              
              # 段階的展開の実行
              foreach ($school in $Deployment.Schools) {
                  $schoolDevices = Get-PendingAutopilotDevices -School $school
                  $batchSize = [Math]::Ceiling($schoolDevices.Count / 10)  # 10バッチに分割
                  
                  for ($i = 0; $i -lt $schoolDevices.Count; $i += $batchSize) {
                      $batch = $schoolDevices[$i..($i + $batchSize - 1)]
                      
                      # バッチ展開の実行
                      $batchResult = Start-AutopilotBatchDeployment -Devices $batch -Profile $Deployment.DeploymentProfile
                      
                      # 展開状況の監視
                      Monitor-BatchDeployment -BatchId $batchResult.BatchId -ExpectedCount $batch.Count
                  }
              }
          } -ArgumentList $deployment, $TenantId -Trigger (New-JobTrigger -Once -At ([DateTime]$deploymentDate))
      }
  }
  ```

## 9.2 デバイスライフサイクル管理の自動化【既存維持・強化】

### 9.2.1 年度更新プロセスの自動化
- **教育機関特有の年度更新処理**
  - 学年進行対応
  - 設定の一括更新
  - 卒業生デバイスの自動回収
  - 新入生デバイスの自動配布

- **年度更新自動化システム**
  ```powershell
  # 年度更新自動化システム
  function Initialize-AnnualDeviceUpdateSystem {
      param(
          [string]$TenantId,
          [int]$NewAcademicYear = 2024,
          [hashtable]$GradeProgressionRules = @{
              "卒業" = @{
                  From = @("小学6年", "中学3年", "高校3年")
                  Action = "Reclaim"
                  DataHandling = "Archive"
                  TimeFrame = "March"
              }
              "進級" = @{
                  From = @("小学1年", "小学2年", "小学3年", "小学4年", "小学5年", "中学1年", "中学2年", "高校1年", "高校2年")
                  Action = "Reassign"
                  DataHandling = "Migrate"
                  TimeFrame = "April"
              }
              "入学" = @{
                  To = @("小学1年", "中学1年", "高校1年")
                  Action = "Provision"
                  DataHandling = "Initialize"
                  TimeFrame = "April"
              }
          }
      )
      
      # 年度更新スケジュールの作成
      foreach ($transition in $GradeProgressionRules.Keys) {
          $rule = $GradeProgressionRules[$transition]
          
          Register-ScheduledJob -Name "AnnualUpdate_$transition" -ScriptBlock {
              param($Transition, $Rule, $NewAcademicYear, $TenantId)
              
              switch ($Rule.Action) {
                  "Reclaim" {
                      # 卒業生デバイスの回収処理
                      $graduatingDevices = Get-DevicesByGrade -Grades $Rule.From
                      foreach ($device in $graduatingDevices) {
                          Archive-StudentData -DeviceId $device.Id
                          Reset-DeviceForReuse -DeviceId $device.Id
                          Add-DeviceToReclaimList -DeviceId $device.Id
                      }
                  }
                  "Reassign" {
                      # 進級処理
                      $promotionDevices = Get-DevicesByGrade -Grades $Rule.From
                      foreach ($device in $promotionDevices) {
                          $newGrade = Get-NextGrade -CurrentGrade $device.AssignedGrade
                          Update-DeviceGradeSetting -DeviceId $device.Id -NewGrade $newGrade
                      }
                  }
                  "Provision" {
                      # 新入生デバイスの準備
                      $newStudents = Get-NewStudents -Grades $Rule.To -AcademicYear $NewAcademicYear
                      foreach ($student in $newStudents) {
                          $availableDevice = Get-AvailableDevice -RequiredGrade $student.Grade
                          if ($availableDevice) {
                              Initialize-DeviceForNewStudent -DeviceId $availableDevice.Id -Student $student
                          }
                      }
                  }
              }
          } -ArgumentList $transition, $rule, $NewAcademicYear, $TenantId
      }
  }
  ```

### 9.2.2 故障・紛失対応の自動化
- **デバイス問題の自動検出・対応**
  - 予防的メンテナンス
  - 故障デバイスの自動隔離
  - 代替デバイスの自動配布
  - 紛失デバイスの自動ロック

- **デバイス故障・紛失対応自動化**
  ```powershell
  # デバイス故障・紛失対応自動化
  function Initialize-DeviceIncidentResponse {
      param(
          [string]$TenantId,
          [hashtable]$IncidentResponseRules = @{
              "HardwareFailure" = @{
                  DetectionThreshold = @{
                      BlueScreenEvents = 3
                      DiskErrors = 5
                      BatteryDegradation = 70  # 70%以下
                  }
                  AutoResponse = @{
                      IsolateDevice = $true
                      NotifyUser = $true
                      NotifyAdmin = $true
                      RequestReplacement = $true
                  }
              }
              "DeviceLoss" = @{
                  DetectionThreshold = @{
                      LastSeenHours = 48
                      LocationChangeDistance = 100  # km
                      ConsecutiveFailedConnections = 10
                  }
                  AutoResponse = @{
                      LockDevice = $true
                      WipeDevice = $false  # 初期段階では実行しない
                      NotifyAuthorities = $false
                      TrackLocation = $true
                  }
              }
          }
      )
      
      # インシデント検出・対応ジョブの開始
      $incidentJob = Start-Job -ScriptBlock {
          param($TenantId, $Rules)
          
          while ($true) {
              # 全デバイスの健全性チェック
              $devices = Get-IntuneManagedDevice -All
              
              foreach ($device in $devices) {
                  # ハードウェア故障の検出
                  $hardwareHealth = Get-DeviceHardwareHealth -DeviceId $device.Id
                  
                  if ($hardwareHealth.BlueScreenEvents -gt $Rules.HardwareFailure.DetectionThreshold.BlueScreenEvents) {
                      $incident = @{
                          Type = "HardwareFailure"
                          DeviceId = $device.Id
                          Severity = "High"
                          Details = "過度なブルースクリーン発生: $($hardwareHealth.BlueScreenEvents) 回"
                          DetectedAt = Get-Date
                      }
                      
                      Handle-DeviceIncident -Incident $incident -Rules $Rules.HardwareFailure
                  }
              }
              
              # 15分間隔でチェック
              Start-Sleep -Seconds 900
          }
      } -ArgumentList $TenantId, $IncidentResponseRules
      
      return $incidentJob
  }
  ```

## 9.3 デバイス初期設定とデプロイメント【既存維持】

### 9.3.1 デプロイメント手法の比較
- **Autopilot vs プロビジョニングパッケージ**
- **ハイブリッド展開戦略**
- **大規模展開での最適化**

### 9.3.2 Windows Autopilotの実装
- **Autopilotプロファイルの設計**
- **デバイス登録の自動化**
- **OOBE（Out-of-Box Experience）のカスタマイズ**

### 9.3.3 プロビジョニングパッケージの作成
- **Windows Configuration Designer活用**
- **学校別カスタマイズパッケージ**
- **大量展開での効率化**

## 9.4 端末の年度更新とライフサイクル管理【既存維持】

### 9.4.1 年度更新プロセス
- **学年進行に伴う設定変更**
- **デバイス再割り当て**
- **データ移行・保護**

### 9.4.2 端末の廃棄とデータ消去
- **安全なデータ消去手順**
- **環境に配慮した廃棄**
- **法的要件への対応**

## 9.5 運用自動化とスケーリング【新設】

### 9.5.1 大規模展開での自動化戦略
- **段階的展開プロセス**
  - パイロット展開（50台）
  - 限定展開（500台）
  - 本格展開（5000台以上）
  - 品質管理・問題解決

- **自動化による効率化**
  ```powershell
  # 大規模デバイス展開自動化
  function Start-MassDeviceDeployment {
      param(
          [array]$DeviceList,
          [string]$DeploymentProfile,
          [int]$BatchSize = 50,
          [int]$DelayBetweenBatches = 300  # 5分
      )
      
      $batches = @()
      for ($i = 0; $i -lt $DeviceList.Count; $i += $BatchSize) {
          $batch = $DeviceList[$i..([Math]::Min($i + $BatchSize - 1, $DeviceList.Count - 1))]
          $batches += ,$batch
      }
      
      foreach ($batch in $batches) {
          Write-Host "バッチ展開開始: $($batch.Count) 台" -ForegroundColor Green
          
          # バッチ処理の並行実行
          $jobs = @()
          foreach ($device in $batch) {
              $job = Start-Job -ScriptBlock {
                  param($Device, $Profile)
                  Deploy-SingleDevice -Device $Device -Profile $Profile
              } -ArgumentList $device, $DeploymentProfile
              $jobs += $job
          }
          
          # バッチ完了待機
          Wait-Job $jobs | Receive-Job
          Remove-Job $jobs
          
          # 次バッチまでの待機
          if ($batches.IndexOf($batch) -lt ($batches.Count - 1)) {
              Start-Sleep -Seconds $DelayBetweenBatches
          }
      }
  }
  ```

### 9.5.2 設定変更の一括適用
- **Configuration Manager連携**
- **PowerShell DSC活用**
- **Group Policy統合管理**

### 9.5.3 リモート診断・修復
- **自動診断システム**
  ```powershell
  # リモート診断・修復システム
  function Start-RemoteDiagnostics {
      param(
          [array]$TargetDevices,
          [array]$DiagnosticTests = @(
              "NetworkConnectivity",
              "DiskHealth", 
              "MemoryTest",
              "WindowsUpdates",
              "AntivirusStatus"
          )
      )
      
      foreach ($device in $TargetDevices) {
          Write-Host "診断開始: $($device.DeviceName)" -ForegroundColor Yellow
          
          $diagnosticResults = @{}
          
          foreach ($test in $DiagnosticTests) {
              try {
                  $result = Invoke-Command -ComputerName $device.DeviceName -ScriptBlock {
                      param($TestName)
                      
                      switch ($TestName) {
                          "NetworkConnectivity" {
                              Test-NetConnection -ComputerName "8.8.8.8" -Port 53
                          }
                          "DiskHealth" {
                              Get-PhysicalDisk | Get-StorageReliabilityCounter
                          }
                          "MemoryTest" {
                              Get-WmiObject -Class Win32_MemoryDevice
                          }
                          "WindowsUpdates" {
                              Get-WindowsUpdate -AcceptAll -Install -AutoReboot
                          }
                          "AntivirusStatus" {
                              Get-MpComputerStatus
                          }
                      }
                  } -ArgumentList $test
                  
                  $diagnosticResults[$test] = @{
                      Status = "Success"
                      Result = $result
                  }
                  
                  # 問題検出時の自動修復
                  if (Test-RequiresRepair -TestResult $result -TestName $test) {
                      Invoke-AutoRepair -Device $device -Issue $test
                  }
                  
              } catch {
                  $diagnosticResults[$test] = @{
                      Status = "Failed"
                      Error = $_.Exception.Message
                  }
              }
          }
          
          # 診断結果の記録・報告
          Save-DiagnosticResults -Device $device -Results $diagnosticResults
          
          if ($diagnosticResults.Values | Where-Object { $_.Status -eq "Failed" }) {
              Send-DiagnosticAlert -Device $device -Results $diagnosticResults
          }
      }
  }
  ```

### 9.5.4 パフォーマンス監視の自動化
- **デバイスパフォーマンス監視**
- **利用状況分析**
- **予防保守の自動スケジュール**
- **ハードウェア更新計画の策定**