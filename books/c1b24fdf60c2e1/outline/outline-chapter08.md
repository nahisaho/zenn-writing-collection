# 第8章: セキュリティ・コンプライアンス運用管理 - アウトライン（運用管理特化版）

## 構成方針
- 教育機関での継続的なセキュリティ運用体制構築
- ライセンス別セキュリティ機能の自動化と運用最適化
- 教育関連法規制への自動対応

## 8.1 セキュリティ運用体制の基盤設計【既存強化】

### 8.1.1 ライセンス別セキュリティ運用戦略
- **A1 for Device環境での運用効率化**
  - 基本セキュリティ機能の最大活用
  - 多要素認証（MFA）の段階的展開
  - Exchange Online Protection（EOP）の詳細設定
  - 運用負荷軽減のための自動化

- **A3/A5環境での高度なセキュリティ運用**
  - Azure AD Premium P1/P2機能の活用
  - Microsoft Defender統合運用
  - Identity Protection自動応答
  - Privileged Identity Management（PIM）

### 8.1.2 教育機関特有のセキュリティ要件
- **学生データ保護の特殊要件**
  - FERPA（米国家族教育権利・プライバシー法）準拠
  - 個人情報保護法対応
  - 学習記録の適切な管理
  - 保護者の同意管理

## 8.2 自動脅威検知・対応システム【新設】

### 8.2.1 統合脅威検知システム
- **教育機関特有の脅威パターン**
  ```powershell
  # 統合脅威検知システム
  function Start-IntegratedThreatDetection {
      param(
          [string]$TenantId,
          [hashtable]$ThreatThresholds = @{
              FailedLoginsPerHour = 10
              DataDownloadGBPerHour = 5
              ExternalSharingPerDay = 20
              PrivilegedAccessOutsideHours = 1
          }
      )
      
      # 脅威検知ジョブの開始
      $detectionJob = Start-Job -ScriptBlock {
          param($TenantId, $Thresholds)
          
          while ($true) {
              # 異常なログイン試行の検出
              $failedLogins = Get-MgAuditLogSignIn -Filter "status/errorCode ne 0" | 
                  Group-Object -Property userPrincipalName | 
                  Where-Object { $_.Count -gt $Thresholds.FailedLoginsPerHour }
              
              foreach ($user in $failedLogins) {
                  $threat = @{
                      Type = "SUSPICIOUS_LOGIN_ATTEMPTS"
                      Severity = "HIGH"
                      User = $user.Name
                      Count = $user.Count
                      DetectedAt = Get-Date
                  }
                  
                  # 自動対応の実行
                  Invoke-AutomaticThreatResponse -Threat $threat
              }
              
              # 5分間隔で監視
              Start-Sleep -Seconds 300
          }
      } -ArgumentList $TenantId, $ThreatThresholds
      
      return $detectionJob
  }
  ```

- **自動対応アクション**
  - リスクレベルに応じた自動アカウント保護
  - 管理者・教職員への即座通知
  - 証跡の自動保存
  - インシデント対応の自動開始

### 8.2.2 インシデント対応の自動化
- **段階的エスカレーション**
  - Level 1: 自動対応（アカウント保護・通知）
  - Level 2: 技術管理者対応（詳細調査・復旧）
  - Level 3: 管理職対応（意思決定・外部連携）
  - Level 4: 外部専門家対応（重大インシデント）

- **自動化された復旧プロセス**
  ```powershell
  # インシデント対応自動化システム
  function Initialize-IncidentResponseSystem {
      param(
          [string]$TenantId,
          [hashtable]$ResponseTeam = @{
              Level1 = @("soc@school.edu")
              Level2 = @("security@school.edu", "it-admin@school.edu")
              Level3 = @("ciso@school.edu", "principal@school.edu")
              Level4 = @("external-security@consultant.com")
          }
      )
      
      # インシデント対応ポリシーの設定
      $responsePolicy = @{
          TenantId = $TenantId
          ResponseTeam = $ResponseTeam
          AutomationLevel = "High"
          EscalationThresholds = @{
              TimeToLevel2 = 30    # 30分
              TimeToLevel3 = 120   # 2時間
              TimeToLevel4 = 360   # 6時間
          }
          RecoveryActions = @{
              AutoAccountRecovery = $true
              AutoDataRecovery = $true
              AutoServiceRecovery = $true
          }
      }
      
      # 自動対応ジョブの開始
      Start-IncidentResponseJob -Policy $responsePolicy
  }
  ```

## 8.3 教育機関特有のコンプライアンス管理【新設】

### 8.3.1 データ保護とプライバシー管理
- **学生データの自動分類**
  - 成績情報の自動識別・暗号化
  - 個人情報の自動タグ付け
  - 機密データの自動保護
  - 保護期間の自動管理

- **アクセス制御の自動化**
  ```powershell
  # 教育機関向けデータ保護自動化
  function Initialize-EducationDataProtection {
      param(
          [string]$TenantId,
          [hashtable]$DataClassification = @{
              StudentGrades = @{
                  Sensitivity = "Confidential"
                  Retention = "7 years"
                  Encryption = "Required"
              }
              StudentRecords = @{
                  Sensitivity = "Highly Confidential"
                  Retention = "Permanent"
                  Encryption = "Required"
              }
              TeacherMaterials = @{
                  Sensitivity = "Internal"
                  Retention = "5 years"
                  Encryption = "Optional"
              }
          }
      )
      
      # データ分類ポリシーの作成
      foreach ($dataType in $DataClassification.Keys) {
          $classification = $DataClassification[$dataType]
          
          # DLPポリシーの適用
          New-DlpCompliancePolicy -Name "教育機関_$dataType" + "_保護ポリシー" `
                                 -ExchangeLocation "All" `
                                 -SharePointLocation "All" `
                                 -OneDriveLocation "All" `
                                 -TeamsLocation "All"
          
          # 感度ラベルの作成
          New-Label -Name "$dataType" + "_分類ラベル" `
                   -DisplayName "$dataType" + "（$($classification.Sensitivity)）" `
                   -EncryptionEnabled ($classification.Encryption -eq "Required")
      }
  }
  ```

### 8.3.2 法規制対応の自動化
- **FERPA・個人情報保護法への自動対応**
  - データ保持期間の自動管理
  - 期限切れデータの自動削除
  - 保護者の同意管理
  - 開示請求の自動処理

- **監査証跡の自動記録**
  ```powershell
  # 法規制対応自動化システム
  function Initialize-RegulatoryCompliance {
      param(
          [string]$TenantId,
          [hashtable]$RetentionPolicies = @{
              "StudentGrades" = @{
                  RetentionPeriod = "7 years"
                  DeleteAfter = $true
                  RequireApproval = $true
              }
              "DisciplinaryRecords" = @{
                  RetentionPeriod = "5 years"
                  DeleteAfter = $true
                  RequireApproval = $true
              }
              "AttendanceRecords" = @{
                  RetentionPeriod = "3 years"
                  DeleteAfter = $true
                  RequireApproval = $false
              }
          }
      )
      
      # 保持ポリシーの設定
      foreach ($recordType in $RetentionPolicies.Keys) {
          $policy = $RetentionPolicies[$recordType]
          
          $retentionPolicy = @{
              Name = "教育機関_$recordType" + "_保持ポリシー"
              Comment = "$recordType の法定保持期間対応"
              RetentionDuration = $policy.RetentionPeriod
              RetentionAction = if ($policy.DeleteAfter) { "Delete" } else { "Archive" }
          }
          
          New-RetentionCompliancePolicy @retentionPolicy
          
          # 自動削除ジョブの作成
          if ($policy.DeleteAfter) {
              Start-AutomaticDataDeletion -RecordType $recordType -RetentionPeriod $policy.RetentionPeriod
          }
      }
  }
  ```

## 8.4 継続的なセキュリティ監視【既存強化】

### 8.4.1 自動脅威検出の設定
- **異常ログインの監視**
  - 地理的異常アクセスの検出
  - 時間外アクセスの監視
  - 複数失敗後の自動ロック
  - VPN・プロキシ経由アクセスの制御

### 8.4.2 定期的なセキュリティ評価
- **月次セキュリティレポート**
  - Microsoft Secure Scoreの監視
  - セキュリティインシデント集計
  - 脆弱性評価結果
  - 改善推奨事項の提示

## 8.5 運用セキュリティ【新設】

### 8.5.1 セキュリティダッシュボードの構築
- **統合監視システム**
  ```powershell
  # セキュリティダッシュボード自動更新
  function Update-SecurityDashboard {
      param(
          [string]$DashboardPath = "C:\SecurityDashboard\dashboard.json"
      )
      
      $securityMetrics = @{
          SecureScore = Get-MgSecuritySecureScore
          RiskDetections = Get-MgRiskDetection -Top 10
          SignInLogs = Get-MgAuditLogSignIn -Filter "status/errorCode ne 0" -Top 100
          ComplianceScore = Get-ComplianceScore
          IncidentCount = Get-SecurityIncidents -Days 30
          LastUpdated = Get-Date
      }
      
      # ダッシュボードデータの生成
      $dashboard = @{
          Overview = @{
              SecurityScore = $securityMetrics.SecureScore.CurrentScore
              RiskLevel = Get-OverallRiskLevel -Metrics $securityMetrics
              ActiveIncidents = $securityMetrics.IncidentCount
              ComplianceStatus = $securityMetrics.ComplianceScore
          }
          Alerts = Generate-SecurityAlerts -Metrics $securityMetrics
          Trends = Calculate-SecurityTrends -Metrics $securityMetrics
      }
      
      $dashboard | ConvertTo-Json -Depth 3 | Out-File $DashboardPath
      return $dashboard
  }
  ```

### 8.5.2 インシデント対応自動化
- **自動隔離設定**
  - 感染デバイスの自動隔離
  - 不正アクセスアカウントの自動無効化
  - 疑わしい通信の自動ブロック
  - 自動復旧条件の設定

### 8.5.3 四半期脆弱性評価
- **自動脆弱性スキャン**
  - Microsoft 365環境の定期スキャン
  - 設定ミス・脆弱性の自動検出
  - 修正優先度の自動評価
  - 修正手順の自動生成

## 8.6 セキュリティ運用の自動化【新設】

### 8.6.1 予防的セキュリティ措置
- **プロアクティブな脅威対策**
  - 脅威インテリジェンスの自動取得
  - 新種攻撃パターンの自動学習
  - 予防的ブロックリストの更新
  - セキュリティ設定の自動調整

### 8.6.2 セキュリティ教育・訓練の自動化
- **フィッシング訓練の自動実施**
  ```powershell
  # 自動フィッシング訓練システム
  function Start-AutomatedPhishingTraining {
      param(
          [array]$TargetUsers,
          [string]$TrainingTemplate = "Education-Basic",
          [int]$FrequencyDays = 30
      )
      
      foreach ($user in $TargetUsers) {
          # ユーザーの役割・経験レベルに応じた訓練レベル設定
          $trainingLevel = Get-UserTrainingLevel -User $user
          
          # カスタマイズされた訓練メールの送信
          Send-PhishingTraining -User $user -Template $TrainingTemplate -Level $trainingLevel
          
          # 結果の自動追跡・評価
          Register-TrainingResult -User $user -TrainingId $trainingId
      }
      
      # 次回訓練の自動スケジュール
      Schedule-NextTraining -Days $FrequencyDays
  }
  ```

### 8.6.3 コンプライアンス状況の自動監視
- **法的要件への自動対応**
  - データ保護規則の遵守状況監視
  - 監査要求への自動対応
  - コンプライアンス違反の自動検出
  - 是正措置の自動実行