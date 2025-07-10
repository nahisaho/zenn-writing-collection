# 付録A: PowerShellスクリプト集 - アウトライン（運用管理特化版）

## 構成方針
- 教育機関での日常運用に即座活用できるPowerShellスクリプト集
- 自動化・効率化による運用負荷軽減
- コピー&ペーストで使える実践的なコード

## A.1 ユーザー・グループ管理自動化スクリプト

### A.1.1 一括ユーザー作成・更新
- **新年度ユーザー一括作成**
  ```powershell
  # 新年度学生アカウント一括作成スクリプト
  function New-BulkStudentAccounts {
      param(
          [Parameter(Mandatory=$true)]
          [string]$CsvFilePath,
          
          [Parameter(Mandatory=$true)]
          [string]$AcademicYear,
          
          [string]$DefaultDomain = "student.school.edu",
          [string]$DefaultPassword = "TempPass123!",
          [string]$StudentLicense = "STANDARDWOFFPACK_STUDENT"
      )
      
      Begin {
          # Microsoft Graph接続確認
          if (-not (Get-MgContext)) {
              Write-Error "Microsoft Graphに接続されていません。Connect-MgGraphを実行してください。"
              return
          }
          
          $CreationResults = @()
          $ErrorLog = @()
      }
      
      Process {
          # CSVファイルの読み込み
          try {
              $StudentData = Import-Csv -Path $CsvFilePath -Encoding UTF8
              Write-Host "CSVファイル読み込み完了: $($StudentData.Count) 件" -ForegroundColor Green
          } catch {
              Write-Error "CSVファイルの読み込みに失敗しました: $($_.Exception.Message)"
              return
          }
          
          # 学生アカウント作成処理
          foreach ($Student in $StudentData) {
              try {
                  # ユーザープリンシパル名生成
                  $UserPrincipalName = "$($Student.StudentID)@$DefaultDomain"
                  
                  # 表示名生成
                  $DisplayName = "$($Student.LastName) $($Student.FirstName)"
                  
                  # パスワード設定
                  $PasswordProfile = @{
                      Password = $DefaultPassword
                      ForceChangePasswordNextSignIn = $true
                  }
                  
                  # ユーザーアカウント作成
                  $NewUser = New-MgUser -UserPrincipalName $UserPrincipalName `
                                      -DisplayName $DisplayName `
                                      -GivenName $Student.FirstName `
                                      -Surname $Student.LastName `
                                      -Department $Student.Grade `
                                      -JobTitle "学生" `
                                      -CompanyName $Student.School `
                                      -UsageLocation "JP" `
                                      -PasswordProfile $PasswordProfile `
                                      -AccountEnabled $true
                  
                  # カスタム属性設定
                  Set-MgUser -UserId $NewUser.Id `
                           -CustomAttribute1 "Student" `
                           -CustomAttribute2 $AcademicYear `
                           -CustomAttribute3 $Student.Class `
                           -CustomAttribute4 $Student.StudentNumber
                  
                  # ライセンス割り当て
                  $License = @{
                      AddLicenses = @(
                          @{
                              SkuId = (Get-MgSubscribedSku | Where-Object {$_.SkuPartNumber -eq $StudentLicense}).SkuId
                              DisabledPlans = @()
                          }
                      )
                      RemoveLicenses = @()
                  }
                  
                  Set-MgUserLicense -UserId $NewUser.Id -AddLicenses $License.AddLicenses -RemoveLicenses $License.RemoveLicenses
                  
                  # セキュリティグループ追加
                  $GradeGroup = Get-MgGroup -Filter "DisplayName eq '$($Student.Grade)年生'"
                  if ($GradeGroup) {
                      New-MgGroupMember -GroupId $GradeGroup.Id -DirectoryObjectId $NewUser.Id
                  }
                  
                  $ClassGroup = Get-MgGroup -Filter "DisplayName eq '$($Student.Grade)年$($Student.Class)組'"
                  if ($ClassGroup) {
                      New-MgGroupMember -GroupId $ClassGroup.Id -DirectoryObjectId $NewUser.Id
                  }
                  
                  # 結果記録
                  $CreationResults += [PSCustomObject]@{
                      StudentID = $Student.StudentID
                      UserPrincipalName = $UserPrincipalName
                      DisplayName = $DisplayName
                      Grade = $Student.Grade
                      Class = $Student.Class
                      CreatedAt = Get-Date
                      Status = "Success"
                  }
                  
                  Write-Host "学生アカウント作成完了: $UserPrincipalName" -ForegroundColor Green
                  
              } catch {
                  $ErrorLog += [PSCustomObject]@{
                      StudentID = $Student.StudentID
                      Error = $_.Exception.Message
                      ProcessedAt = Get-Date
                  }
                  
                  Write-Warning "学生アカウント作成エラー: $($Student.StudentID) - $($_.Exception.Message)"
              }
              
              # API制限対策の待機
              Start-Sleep -Milliseconds 100
          }
      }
      
      End {
          # 結果レポート生成
          $ReportPath = "StudentCreationReport_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv"
          $CreationResults | Export-Csv -Path $ReportPath -NoTypeInformation -Encoding UTF8
          
          if ($ErrorLog.Count -gt 0) {
              $ErrorPath = "StudentCreationErrors_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv"
              $ErrorLog | Export-Csv -Path $ErrorPath -NoTypeInformation -Encoding UTF8
              Write-Warning "エラーが $($ErrorLog.Count) 件発生しました。詳細: $ErrorPath"
          }
          
          Write-Host "処理完了: 成功 $($CreationResults.Count) 件, エラー $($ErrorLog.Count) 件" -ForegroundColor Yellow
          Write-Host "詳細レポート: $ReportPath" -ForegroundColor Yellow
          
          return @{
              SuccessCount = $CreationResults.Count
              ErrorCount = $ErrorLog.Count
              ReportPath = $ReportPath
              ErrorPath = if ($ErrorLog.Count -gt 0) { $ErrorPath } else { $null }
          }
      }
  }
  ```

### A.1.2 年度更新・進級処理
- **学年進行一括処理スクリプト**
- **卒業生アカウント処理スクリプト**
- **転校・転出処理スクリプト**

### A.1.3 グループ管理自動化
- **学年・クラス別グループ自動作成**
- **メンバーシップ自動更新**
- **配布リスト自動管理**

## A.2 ライセンス管理自動化スクリプト

### A.2.1 ライセンス監視・最適化
- **ライセンス使用状況監視スクリプト**
  ```powershell
  # ライセンス使用状況監視・最適化スクリプト
  function Get-LicenseOptimizationReport {
      param(
          [string]$ReportPath = "LicenseOptimization_$(Get-Date -Format 'yyyyMMdd').csv",
          [int]$InactiveDaysThreshold = 30,
          [switch]$AutoOptimize
      )
      
      Begin {
          $OptimizationResults = @()
          $Recommendations = @()
      }
      
      Process {
          # 全ライセンス情報取得
          $SubscribedSkus = Get-MgSubscribedSku
          
          foreach ($Sku in $SubscribedSkus) {
              # ライセンス割り当て状況分析
              $AssignedUsers = Get-MgUser -Filter "assignedLicenses/any(x:x/skuId eq $($Sku.SkuId))" -All
              
              $LicenseAnalysis = @{
                  SkuPartNumber = $Sku.SkuPartNumber
                  TotalLicenses = $Sku.PrepaidUnits.Enabled
                  AssignedLicenses = $AssignedUsers.Count
                  AvailableLicenses = $Sku.PrepaidUnits.Enabled - $AssignedUsers.Count
                  UtilizationRate = if ($Sku.PrepaidUnits.Enabled -gt 0) { 
                      [Math]::Round(($AssignedUsers.Count / $Sku.PrepaidUnits.Enabled) * 100, 2) 
                  } else { 0 }
                  InactiveUsers = @()
                  Recommendations = @()
              }
              
              # 非アクティブユーザーの特定
              foreach ($User in $AssignedUsers) {
                  $LastSignIn = Get-MgAuditLogSignIn -Filter "userId eq '$($User.Id)'" -Top 1 | Sort-Object CreatedDateTime -Descending | Select-Object -First 1
                  
                  if ($LastSignIn) {
                      $DaysSinceLastSignIn = (Get-Date) - $LastSignIn.CreatedDateTime
                      if ($DaysSinceLastSignIn.Days -gt $InactiveDaysThreshold) {
                          $LicenseAnalysis.InactiveUsers += [PSCustomObject]@{
                              UserPrincipalName = $User.UserPrincipalName
                              DisplayName = $User.DisplayName
                              LastSignIn = $LastSignIn.CreatedDateTime
                              DaysInactive = $DaysSinceLastSignIn.Days
                          }
                      }
                  } else {
                      # サインイン履歴なし（新規ユーザーまたは未使用）
                      $CreatedDate = $User.CreatedDateTime
                      if ($CreatedDate -and ((Get-Date) - $CreatedDate).Days -gt $InactiveDaysThreshold) {
                          $LicenseAnalysis.InactiveUsers += [PSCustomObject]@{
                              UserPrincipalName = $User.UserPrincipalName
                              DisplayName = $User.DisplayName
                              LastSignIn = "サインイン履歴なし"
                              DaysInactive = ((Get-Date) - $CreatedDate).Days
                          }
                      }
                  }
              }
              
              # 最適化推奨事項の生成
              if ($LicenseAnalysis.UtilizationRate -lt 70) {
                  $LicenseAnalysis.Recommendations += "ライセンス利用率が低い（$($LicenseAnalysis.UtilizationRate)%）- ライセンス数見直しを推奨"
              }
              
              if ($LicenseAnalysis.InactiveUsers.Count -gt 0) {
                  $LicenseAnalysis.Recommendations += "$($LicenseAnalysis.InactiveUsers.Count) 名の非アクティブユーザーからライセンス回収を推奨"
              }
              
              if ($LicenseAnalysis.AvailableLicenses -lt 5 -and $LicenseAnalysis.UtilizationRate -gt 95) {
                  $LicenseAnalysis.Recommendations += "ライセンス不足の可能性 - 追加購入を推奨"
              }
              
              # 自動最適化の実行
              if ($AutoOptimize -and $LicenseAnalysis.InactiveUsers.Count -gt 0) {
                  foreach ($InactiveUser in $LicenseAnalysis.InactiveUsers) {
                      try {
                          # 非アクティブユーザーからライセンス除去
                          $RemoveLicense = @{
                              RemoveLicenses = @($Sku.SkuId)
                              AddLicenses = @()
                          }
                          
                          Set-MgUserLicense -UserId $InactiveUser.UserPrincipalName -AddLicenses $RemoveLicense.AddLicenses -RemoveLicenses $RemoveLicense.RemoveLicenses
                          
                          Write-Host "ライセンス回収完了: $($InactiveUser.UserPrincipalName)" -ForegroundColor Green
                          
                      } catch {
                          Write-Warning "ライセンス回収エラー: $($InactiveUser.UserPrincipalName) - $($_.Exception.Message)"
                      }
                  }
              }
              
              $OptimizationResults += $LicenseAnalysis
          }
      }
      
      End {
          # レポート生成
          $FlattenedResults = foreach ($Result in $OptimizationResults) {
              [PSCustomObject]@{
                  ライセンス種別 = $Result.SkuPartNumber
                  総ライセンス数 = $Result.TotalLicenses
                  割り当て済み = $Result.AssignedLicenses
                  利用可能 = $Result.AvailableLicenses
                  利用率 = "$($Result.UtilizationRate)%"
                  非アクティブユーザー数 = $Result.InactiveUsers.Count
                  推奨事項 = ($Result.Recommendations -join "; ")
              }
          }
          
          $FlattenedResults | Export-Csv -Path $ReportPath -NoTypeInformation -Encoding UTF8
          
          # サマリー表示
          $TotalLicenses = ($OptimizationResults | Measure-Object -Property TotalLicenses -Sum).Sum
          $TotalAssigned = ($OptimizationResults | Measure-Object -Property AssignedLicenses -Sum).Sum
          $TotalInactive = ($OptimizationResults | ForEach-Object { $_.InactiveUsers.Count } | Measure-Object -Sum).Sum
          
          Write-Host "=== ライセンス最適化レポート ===" -ForegroundColor Cyan
          Write-Host "総ライセンス数: $TotalLicenses" -ForegroundColor Yellow
          Write-Host "割り当て済み: $TotalAssigned" -ForegroundColor Yellow
          Write-Host "非アクティブ: $TotalInactive" -ForegroundColor Yellow
          Write-Host "最適化可能ライセンス: $TotalInactive" -ForegroundColor Red
          Write-Host "詳細レポート: $ReportPath" -ForegroundColor Yellow
          
          return @{
              Results = $OptimizationResults
              ReportPath = $ReportPath
              Summary = @{
                  TotalLicenses = $TotalLicenses
                  TotalAssigned = $TotalAssigned
                  TotalInactive = $TotalInactive
              }
          }
      }
  }
  ```

### A.2.2 ライセンス自動割り当て
- **新規ユーザー自動ライセンス付与**
- **グループベースライセンス管理**
- **ライセンス不足アラート**

## A.3 セキュリティ監視スクリプト

### A.3.1 異常ログイン検出
- **地理的異常アクセス検出**
- **時間外アクセス監視**
- **複数失敗ログイン検出**

### A.3.2 データ保護監視
- **大量ダウンロード検出**
- **外部共有監視**
- **機密データアクセス監視**

## A.4 運用監視・レポートスクリプト

### A.4.1 システム健全性チェック
- **サービス稼働状況確認**
- **パフォーマンス監視**
- **容量使用状況チェック**

### A.4.2 利用状況分析
- **ユーザー活動分析**
- **アプリケーション利用統計**
- **ストレージ使用量分析**

## A.5 バックアップ・復旧スクリプト

### A.5.1 データエクスポート
- **ユーザーデータ一括エクスポート**
- **メール・予定表バックアップ**
- **SharePointデータ保護**

### A.5.2 災害復旧支援
- **ユーザーアカウント復旧**
- **グループ設定復元**
- **ライセンス設定復旧**

## A.6 年度更新・移行スクリプト

### A.6.1 年度開始処理
- **新年度環境準備**
- **クラス・グループ再編成**
- **教職員異動対応**

### A.6.2 年度終了処理
- **卒業生データ処理**
- **アーカイブ作成**
- **次年度準備**

## A.7 自動化・スケジュール実行スクリプト

### A.7.1 定期実行タスク
- **日次ヘルスチェック**
- **週次レポート生成**
- **月次最適化処理**

### A.7.2 イベント連動処理
- **ユーザー作成時の自動処理**
- **グループ変更時の連動処理**
- **ライセンス変更時の確認処理**