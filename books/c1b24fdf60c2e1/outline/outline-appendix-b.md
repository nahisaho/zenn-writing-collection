# 付録B: Microsoft Graph API活用ガイド - アウトライン（運用管理特化版）

## 構成方針
- 教育機関での運用自動化に特化したGraph API活用方法
- 実際のAPI呼び出し例と運用シナリオ
- エラー処理・制限事項への対応策

## B.1 Graph API基礎・認証設定

### B.1.1 教育機関向けAPI認証設定
- **アプリケーション登録とアクセス許可**
  ```json
  {
    "requiredResourceAccess": [
      {
        "resourceAppId": "00000003-0000-0000-c000-000000000000",
        "resourceAccess": [
          {
            "id": "19dbc75e-c2e2-444c-a770-ec69d8559fc7",
            "type": "Role"
          },
          {
            "id": "df021288-bdef-4463-88db-98f22de89214",
            "type": "Role"
          },
          {
            "id": "9a5d68dd-52b0-4cc2-bd40-abcf44ac3a30",
            "type": "Role"
          }
        ]
      }
    ],
    "signInAudience": "AzureADMyOrg",
    "api": {
      "requestedAccessTokenVersion": 2
    }
  }
  ```

- **PowerShellでの認証設定**
  ```powershell
  # 教育機関向けGraph API認証設定
  function Initialize-EducationGraphAPI {
      param(
          [Parameter(Mandatory=$true)]
          [string]$TenantId,
          
          [Parameter(Mandatory=$true)]
          [string]$ClientId,
          
          [Parameter(Mandatory=$true)]
          [string]$ClientSecret,
          
          [array]$RequiredScopes = @(
              "https://graph.microsoft.com/User.ReadWrite.All",
              "https://graph.microsoft.com/Group.ReadWrite.All",
              "https://graph.microsoft.com/Directory.ReadWrite.All",
              "https://graph.microsoft.com/Organization.Read.All",
              "https://graph.microsoft.com/AuditLog.Read.All"
          )
      )
      
      try {
          # 証明書ベース認証（推奨）
          $Certificate = Get-ChildItem -Path "Cert:\CurrentUser\My" | Where-Object {$_.Subject -like "*EducationGraphAPI*"}
          
          if ($Certificate) {
              Connect-MgGraph -TenantId $TenantId -ClientId $ClientId -Certificate $Certificate
              Write-Host "証明書ベース認証成功" -ForegroundColor Green
          } else {
              # シークレットベース認証（開発・テスト用）
              $SecureSecret = ConvertTo-SecureString $ClientSecret -AsPlainText -Force
              $Credential = New-Object System.Management.Automation.PSCredential($ClientId, $SecureSecret)
              
              Connect-MgGraph -TenantId $TenantId -ClientId $ClientId -ClientSecret $SecureSecret
              Write-Host "シークレットベース認証成功" -ForegroundColor Yellow
              Write-Warning "本番環境では証明書ベース認証を使用してください"
          }
          
          # 接続確認
          $Context = Get-MgContext
          if ($Context) {
              Write-Host "Graph API接続確認: $($Context.Account)" -ForegroundColor Green
              Write-Host "権限スコープ: $($Context.Scopes -join ', ')" -ForegroundColor Yellow
              
              # 必要な権限の確認
              $MissingScopes = $RequiredScopes | Where-Object {$_ -notin $Context.Scopes}
              if ($MissingScopes.Count -gt 0) {
                  Write-Warning "不足している権限: $($MissingScopes -join ', ')"
                  Write-Host "管理者に権限の追加を依頼してください" -ForegroundColor Red
              }
              
              return $true
          } else {
              Write-Error "Graph API接続に失敗しました"
              return $false
          }
          
      } catch {
          Write-Error "認証エラー: $($_.Exception.Message)"
          return $false
      }
  }
  ```

### B.1.2 API制限・スロットリング対応
- **レート制限の理解と対応**
- **バッチ処理による効率化**
- **エラーハンドリングとリトライ処理**

## B.2 ユーザー・グループ管理API

### B.2.1 大規模ユーザー管理
- **効率的なユーザー検索・フィルタリング**
  ```powershell
  # 高効率ユーザー検索・管理API
  function Get-EducationUsersAdvanced {
      param(
          [string]$Grade = $null,
          [string]$School = $null,
          [string]$UserType = $null,  # Student, Teacher, Staff
          [datetime]$CreatedAfter = $null,
          [datetime]$LastSignInBefore = $null,
          [switch]$IncludeInactive,
          [switch]$IncludeLicenseInfo,
          [int]$BatchSize = 100
      )
      
      # フィルター構築
      $FilterConditions = @()
      
      if ($Grade) {
          $FilterConditions += "department eq '$Grade'"
      }
      
      if ($School) {
          $FilterConditions += "companyName eq '$School'"
      }
      
      if ($UserType) {
          $FilterConditions += "extensionAttribute1 eq '$UserType'"
      }
      
      if ($CreatedAfter) {
          $FilterConditions += "createdDateTime ge $($CreatedAfter.ToString('yyyy-MM-ddTHH:mm:ssZ'))"
      }
      
      if (-not $IncludeInactive) {
          $FilterConditions += "accountEnabled eq true"
      }
      
      $Filter = $FilterConditions -join " and "
      
      # バッチ処理でユーザー取得
      $AllUsers = @()
      $UsersPage = $null
      
      do {
          try {
              if ($UsersPage) {
                  $UsersPage = Get-MgUser -Filter $Filter -All -PageSize $BatchSize -Skip ($AllUsers.Count)
              } else {
                  $UsersPage = Get-MgUser -Filter $Filter -All -PageSize $BatchSize
              }
              
              foreach ($User in $UsersPage) {
                  $UserDetails = @{
                      Id = $User.Id
                      UserPrincipalName = $User.UserPrincipalName
                      DisplayName = $User.DisplayName
                      Department = $User.Department
                      JobTitle = $User.JobTitle
                      CompanyName = $User.CompanyName
                      CreatedDateTime = $User.CreatedDateTime
                      AccountEnabled = $User.AccountEnabled
                  }
                  
                  # ライセンス情報の取得（オプション）
                  if ($IncludeLicenseInfo) {
                      $UserLicenses = Get-MgUserLicenseDetail -UserId $User.Id
                      $UserDetails.Licenses = $UserLicenses | ForEach-Object { $_.SkuPartNumber }
                      $UserDetails.LicenseCount = $UserLicenses.Count
                  }
                  
                  # 最終サインイン情報の取得（オプション）
                  if ($LastSignInBefore) {
                      $SignInLogs = Get-MgAuditLogSignIn -Filter "userId eq '$($User.Id)'" -Top 1
                      if ($SignInLogs) {
                          $UserDetails.LastSignInDateTime = $SignInLogs[0].CreatedDateTime
                          
                          if ($LastSignInBefore -and $SignInLogs[0].CreatedDateTime -gt $LastSignInBefore) {
                              continue  # 条件に合わない場合はスキップ
                          }
                      }
                  }
                  
                  $AllUsers += [PSCustomObject]$UserDetails
              }
              
              # API制限対策
              Start-Sleep -Milliseconds 100
              
          } catch {
              Write-Error "ユーザー取得エラー: $($_.Exception.Message)"
              break
          }
          
      } while ($UsersPage.Count -eq $BatchSize)
      
      return $AllUsers
  }
  ```

### B.2.2 グループ・メンバーシップ管理
- **動的グループ管理**
- **メンバーシップ一括更新**
- **グループ階層管理**

## B.3 教育機関特化API活用

### B.3.1 School Data Sync API連携
- **SDS同期状況監視**
  ```powershell
  # School Data Sync監視・管理API
  function Get-SchoolDataSyncStatus {
      param(
          [string]$SyncProfileId = $null,
          [switch]$IncludeErrors,
          [switch]$GenerateReport
      )
      
      try {
          # 同期プロファイルの取得
          if ($SyncProfileId) {
              $SyncProfiles = @(Get-MgEducationSynchronizationProfile -EducationSynchronizationProfileId $SyncProfileId)
          } else {
              $SyncProfiles = Get-MgEducationSynchronizationProfile -All
          }
          
          $SyncStatusReport = @()
          
          foreach ($Profile in $SyncProfiles) {
              $ProfileStatus = @{
                  ProfileId = $Profile.Id
                  DisplayName = $Profile.DisplayName
                  State = $Profile.State
                  LastSynchronizationDateTime = $Profile.LastSynchronizationDateTime
                  ExpirationDate = $Profile.ExpirationDate
                  SyncStatus = @{
                      StudentsInSync = 0
                      TeachersInSync = 0
                      SchoolsInSync = 0
                      ClassesInSync = 0
                      EnrollmentsInSync = 0
                  }
                  Errors = @()
                  Warnings = @()
              }
              
              # 同期統計の取得
              try {
                  $SyncStats = Get-MgEducationSynchronizationProfileStatus -EducationSynchronizationProfileId $Profile.Id
                  
                  if ($SyncStats) {
                      $ProfileStatus.SyncStatus.StudentsInSync = $SyncStats.StudentsInSync
                      $ProfileStatus.SyncStatus.TeachersInSync = $SyncStats.TeachersInSync
                      $ProfileStatus.SyncStatus.SchoolsInSync = $SyncStats.SchoolsInSync
                      $ProfileStatus.SyncStatus.ClassesInSync = $SyncStats.ClassesInSync
                      $ProfileStatus.SyncStatus.EnrollmentsInSync = $SyncStats.EnrollmentsInSync
                  }
              } catch {
                  Write-Warning "同期統計取得エラー: $($Profile.DisplayName) - $($_.Exception.Message)"
              }
              
              # エラー情報の取得
              if ($IncludeErrors) {
                  try {
                      $SyncErrors = Get-MgEducationSynchronizationProfileError -EducationSynchronizationProfileId $Profile.Id -All
                      $ProfileStatus.Errors = $SyncErrors | ForEach-Object {
                          @{
                              ErrorCode = $_.ErrorCode
                              ErrorMessage = $_.ErrorMessage
                              EntityType = $_.EntityType
                              EntityId = $_.EntityId
                              OccurredDateTime = $_.ReportableIdentifier
                          }
                      }
                  } catch {
                      Write-Warning "エラー情報取得失敗: $($Profile.DisplayName)"
                  }
              }
              
              # 健全性チェック
              $HealthChecks = @()
              
              # 同期の新しさチェック
              if ($Profile.LastSynchronizationDateTime) {
                  $LastSyncAge = (Get-Date) - $Profile.LastSynchronizationDateTime
                  if ($LastSyncAge.TotalHours -gt 25) {
                      $HealthChecks += "同期が24時間以上実行されていません"
                  }
              }
              
              # 有効期限チェック
              if ($Profile.ExpirationDate -and $Profile.ExpirationDate -lt (Get-Date).AddDays(7)) {
                  $HealthChecks += "プロファイルの有効期限が7日以内に切れます"
              }
              
              # エラー率チェック
              if ($ProfileStatus.Errors.Count -gt 100) {
                  $HealthChecks += "エラー数が多すぎます ($($ProfileStatus.Errors.Count)件)"
              }
              
              $ProfileStatus.HealthChecks = $HealthChecks
              $SyncStatusReport += [PSCustomObject]$ProfileStatus
          }
          
          # レポート生成
          if ($GenerateReport) {
              $ReportPath = "SDSStatusReport_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
              $SyncStatusReport | ConvertTo-Json -Depth 4 | Out-File -FilePath $ReportPath -Encoding UTF8
              
              Write-Host "SDS状況レポート生成完了: $ReportPath" -ForegroundColor Green
              
              # サマリー表示
              $TotalProfiles = $SyncStatusReport.Count
              $ActiveProfiles = ($SyncStatusReport | Where-Object {$_.State -eq "Provisioned"}).Count
              $ErrorProfiles = ($SyncStatusReport | Where-Object {$_.Errors.Count -gt 0}).Count
              
              Write-Host "=== SDS 同期状況サマリー ===" -ForegroundColor Cyan
              Write-Host "総プロファイル数: $TotalProfiles" -ForegroundColor Yellow
              Write-Host "アクティブプロファイル: $ActiveProfiles" -ForegroundColor Green
              Write-Host "エラーのあるプロファイル: $ErrorProfiles" -ForegroundColor Red
          }
          
          return $SyncStatusReport
          
      } catch {
          Write-Error "SDS状況取得エラー: $($_.Exception.Message)"
          return $null
      }
  }
  ```

### B.3.2 教育データ分析API
- **学習進捗データ取得**
- **利用統計分析**
- **教育効果測定API**

## B.4 セキュリティ・監査API

### B.4.1 サインインログ分析
- **異常ログイン検出API**
- **地理的アクセス分析**
- **デバイス別アクセス分析**

### B.4.2 監査ログ活用
- **管理者操作追跡**
- **データアクセス監査**
- **設定変更監視**

## B.5 ライセンス・使用量API

### B.5.1 ライセンス最適化API
- **ライセンス使用状況分析**
- **自動ライセンス調整**
- **コスト最適化提案**

### B.5.2 使用量レポートAPI
- **アプリケーション使用統計**
- **ストレージ使用量分析**
- **パフォーマンス指標取得**

## B.6 Teams Education API

### B.6.1 クラスチーム管理
- **自動クラス作成**
- **メンバーシップ管理**
- **課題・評価連携**

### B.6.2 会議・イベント管理
- **大規模イベント管理**
- **会議品質監視**
- **参加状況分析**

## B.7 SharePoint・OneDrive API

### B.7.1 コンテンツ管理
- **一括ファイル操作**
- **権限管理自動化**
- **アーカイブ処理**

### B.7.2 ストレージ最適化
- **容量監視API**
- **重複ファイル検出**
- **自動クリーンアップ**

## B.8 カスタム統合・ワークフロー

### B.8.1 外部システム連携
- **校務システム連携**
- **学習管理システム統合**
- **保護者連絡システム連携**

### B.8.2 自動化ワークフロー
- **Power Automate連携**
- **Logic Apps統合**
- **Azure Functions活用**

## B.9 エラー処理・デバッグ

### B.9.1 一般的なAPI エラー対処
- **認証エラー解決**
- **権限不足対応**
- **レート制限回避**

### B.9.2 デバッグ・トラブルシューティング
- **ログ出力設定**
- **API呼び出し追跡**
- **パフォーマンス最適化**