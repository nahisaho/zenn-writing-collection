# 第6章: SharePoint/OneDrive設定 - アウトライン（運用管理特化版）

## 構成方針
- 教育機関の大容量ファイル管理に対応した運用効率化
- 学校間・学年間でのファイル共有の標準化
- 自動アーカイブ・容量最適化による運用負荷軽減

## 6.1 SharePoint Online管理【既存維持・運用観点強化】

### 6.1.1 教育機関向けサイト構造設計
- **階層構造の運用最適化**
  - ハブサイト：教育委員会・法人レベル
  - 関連サイト：学校・部門レベル
  - チームサイト：学年・クラス・委員会レベル
  - 個人サイト：教職員個人・プロジェクトレベル

- **サイトテンプレートの標準化**
  - 学校用テンプレート：基本的な文書管理構造
  - 学年用テンプレート：学年運営・クラス管理用
  - 委員会用テンプレート：会議資料・議事録管理
  - プロジェクト用テンプレート：期間限定活動用

### 6.1.2 権限管理の自動化
- **動的権限割り当て**
  - Azure ADグループと連動した権限管理
  - 職員異動時の自動権限調整
  - 学年進行時の権限継承・移行
  - 退職・卒業時の自動権限削除

- **権限レベルの標準化**
  - 読み取り専用：学生・保護者・地域住民
  - 投稿：一般教職員・委員会メンバー
  - 編集：学年主任・委員会委員長
  - フルコントロール：管理者・校長・教頭

## 6.2 OneDrive for Business管理【既存維持・運用観点強化】

### 6.2.1 容量・同期管理の最適化
- **容量配分の自動調整**
  - 学生：基本1TB、学習用途に最適化
  - 教職員：2TB〜無制限、業務用途考慮
  - 管理者：無制限、システム管理用途
  - ゲスト：制限付き、セキュリティ重視

- **同期制御の運用管理**
  - 校内ネットワーク：高速同期設定
  - リモートアクセス：帯域制限・最適化
  - モバイルデバイス：選択同期推奨
  - 大容量ファイル：オンデマンド同期活用

### 6.2.2 Known Folder Move（KFM）の段階展開
- **段階的展開戦略**
  - Phase 1：IT部門・管理者での試験運用
  - Phase 2：教職員への段階的展開
  - Phase 3：学生への順次適用
  - Phase 4：運用最適化・問題解決

## 6.3 外部共有・コラボレーション【既存維持・運用観点強化】

### 6.3.1 セキュリティを重視した外部共有
- **共有レベルの階層管理**
  - 内部のみ：機密性の高い教育データ
  - 認証済み外部ユーザー：保護者・地域連携
  - リンク知っている人：一般公開資料
  - すべてのユーザー：広報・募集資料

### 6.3.2 ゲストアクセス管理
- **教育機関特有のゲスト管理**
  - 保護者アクセス：子どもの学習状況確認
  - 地域連携：外部講師・ボランティア
  - 業者連携：システム保守・教材提供
  - 研究連携：他校・他機関との共同研究

## 6.4 教育機関向けファイル管理運用【新設】

### 6.4.1 学年終了時の自動アーカイブ
- **年度サイクル対応アーカイブ**
  ```powershell
  # 学年終了時自動アーカイブシステム
  function Start-AcademicYearArchive {
      param(
          [int]$AcademicYear,
          [string]$ArchiveLibrary = "学年アーカイブ"
      )
      
      $endOfYear = Get-Date -Year $AcademicYear -Month 3 -Day 31
      $gradeFiles = Get-PnPListItem -List "Documents" -Query @"
          <Query>
              <Where>
                  <And>
                      <Contains>
                          <FieldRef Name='Title'/>
                          <Value Type='Text'>$AcademicYear年度</Value>
                      </Contains>
                      <Lt>
                          <FieldRef Name='Modified'/>
                          <Value Type='DateTime'>$endOfYear</Value>
                      </Lt>
                  </And>
              </Where>
          </Query>
  "@
      
      foreach ($file in $gradeFiles) {
          # アーカイブライブラリに移動
          Move-PnPFile -SourceUrl $file.FieldValues.FileRef `
                       -TargetUrl "$ArchiveLibrary/$AcademicYear年度/$($file.FieldValues.FileLeafRef)"
          
          Write-Host "アーカイブ完了: $($file.FieldValues.Title)" -ForegroundColor Green
      }
  }
  ```

- **自動化アーカイブ条件**
  - 年度終了後30日経過ファイル
  - 学年・クラス特定フォルダの一括移動
  - 重要度に応じた保持期間設定
  - 法的要件に基づく長期保存

- **アーカイブデータの管理**
  - 段階的ストレージ移行（Hot → Cool → Archive）
  - 検索可能な状態での長期保存
  - 必要時の迅速な復元機能
  - コスト最適化のための自動階層化

### 6.4.2 ストレージ容量の監視・最適化
- **リアルタイム容量監視**
  ```powershell
  # ストレージ使用状況監視システム
  function Monitor-SharePointStorage {
      param(
          [double]$WarningThreshold = 0.8,  # 80%
          [double]$CriticalThreshold = 0.9, # 90%
          [string]$ReportPath = "C:\Reports\StorageReport_$(Get-Date -Format 'yyyyMMdd').csv"
      )
      
      $sites = Get-PnPTenantSite
      $storageReport = @()
      
      foreach ($site in $sites) {
          Connect-PnPOnline -Url $site.Url -UseWebLogin
          $siteStorage = Get-PnPTenantSite -Identity $site.Url
          
          $usagePercentage = $siteStorage.StorageUsageCurrent / $siteStorage.StorageMaximumLevel
          $status = switch ($usagePercentage) {
              {$_ -ge $CriticalThreshold} { "Critical" }
              {$_ -ge $WarningThreshold} { "Warning" }
              default { "Normal" }
          }
          
          $storageReport += [PSCustomObject]@{
              SiteUrl = $site.Url
              Title = $site.Title
              StorageUsed = $siteStorage.StorageUsageCurrent
              StorageLimit = $siteStorage.StorageMaximumLevel
              UsagePercentage = [Math]::Round($usagePercentage * 100, 2)
              Status = $status
              LastModified = $site.LastContentModifiedDate
          }
      }
      
      # 警告・緊急サイトの通知
      $alertSites = $storageReport | Where-Object { $_.Status -ne "Normal" }
      if ($alertSites.Count -gt 0) {
          Send-StorageAlert -AlertSites $alertSites
      }
      
      $storageReport | Export-Csv -Path $ReportPath -NoTypeInformation -Encoding UTF8
      return $storageReport
  }
  ```

- **自動容量最適化**
  - 大容量ファイルの自動検出・最適化
  - 重複ファイルの検出・統合
  - 古いバージョンの自動削除
  - 未使用ファイルの自動アーカイブ

- **容量予測・計画**
  - 利用傾向分析による容量予測
  - 年度計画に基づく容量拡張計画
  - コスト最適化のための容量調整
  - 緊急時の容量確保手順

### 6.4.3 学校間でのファイル共有設定
- **学校間連携の標準化**
  - 統一されたフォルダ構造・命名規則
  - 権限レベルの統一基準
  - 共有手順の標準化・自動化
  - セキュリティポリシーの一貫適用

- **ハブサイトを活用した連携**
  ```powershell
  # 学校間ハブサイト構築
  function New-EducationHubSite {
      param(
          [string]$HubSiteUrl,
          [array]$MemberSchools,
          [string]$HubSiteTitle = "教育委員会ハブサイト"
      )
      
      # ハブサイトの作成
      Register-PnPHubSite -Site $HubSiteUrl -HubSiteTitle $HubSiteTitle
      
      foreach ($school in $MemberSchools) {
          # 各学校サイトをハブに関連付け
          Add-PnPHubSiteAssociation -Site $school.SiteUrl -HubSite $HubSiteUrl
          
          # 共通ナビゲーションの適用
          Set-PnPHubSiteNavigation -HubSiteUrl $HubSiteUrl -NavigationNodes @(
              @{ Title="学校情報"; Url="$($school.SiteUrl)/SitePages/SchoolInfo.aspx" },
              @{ Title="共有資料"; Url="$($school.SiteUrl)/Shared Documents" },
              @{ Title="連絡板"; Url="$($school.SiteUrl)/Lists/Announcements" }
          )
      }
  }
  ```

- **統一検索・ナビゲーション**
  - 学校横断での文書検索機能
  - 統一されたナビゲーション構造
  - 関連サイトの自動表示
  - ユーザー権限に応じた表示制御

### 6.4.4 バックアップとデータ保持ポリシー
- **包括的バックアップ戦略**
  - Microsoft 365標準保護の理解と限界
  - 第三者バックアップソリューションの活用
  - 重要データの定期的な外部バックアップ
  - 災害時の迅速な復旧体制

- **データ保持ポリシーの自動適用**
  ```powershell
  # 教育機関向けデータ保持ポリシー設定
  function Set-EducationRetentionPolicy {
      param(
          [hashtable]$RetentionRules = @{
              "学習指導案" = @{ Years = 5; Action = "Delete" }
              "成績資料" = @{ Years = 7; Action = "Archive" }
              "管理文書" = @{ Years = 10; Action = "Archive" }
              "一般文書" = @{ Years = 3; Action = "Delete" }
          }
      )
      
      foreach ($docType in $RetentionRules.Keys) {
          $rule = $RetentionRules[$docType]
          
          $retentionPolicy = @{
              Name = "教育機関_$docType" + "_保持ポリシー"
              Comment = "$docType の法定保持期間対応"
              RetentionDuration = "$($rule.Years) years"
              RetentionAction = $rule.Action
              Locations = @{
                  SharePointLocation = "All"
                  OneDriveLocation = "All"
              }
          }
          
          New-RetentionCompliancePolicy @retentionPolicy
          
          # 自動分類ルールの設定
          New-RetentionComplianceRule -Policy $retentionPolicy.Name `
                                     -ContentMatchQuery "contentclass:$docType" `
                                     -RetentionDuration $retentionPolicy.RetentionDuration `
                                     -RetentionComplianceAction $rule.Action
      }
  }
  ```

- **法的要件への対応**
  - 学校教育法に基づく文書保存義務
  - 個人情報保護法に基づく適切な削除
  - 地方公共団体の文書管理規則対応
  - 電子帳簿保存法への準拠

### 6.4.5 パフォーマンス最適化
- **アクセス最適化**
  - CDN（Content Delivery Network）の活用
  - 地理的分散環境での最適化
  - 大容量ファイルの最適な配信
  - 同時アクセス時の負荷分散

- **同期最適化**
  - OneDrive同期の最適化設定
  - 帯域制限・スケジュール同期
  - 選択同期による効率化
  - オフライン時の同期管理

- **検索最適化**
  - メタデータの充実・標準化
  - 検索インデックスの最適化
  - 関連性の高い検索結果表示
  - 検索パフォーマンスの監視

### 6.4.6 運用監視・レポート
- **利用状況の継続監視**
  ```powershell
  # SharePoint利用状況分析
  function Get-SharePointUsageAnalytics {
      param(
          [int]$Days = 30,
          [string]$OutputPath = "C:\Reports\SharePointAnalytics_$(Get-Date -Format 'yyyyMMdd').json"
      )
      
      $analytics = @{
          Period = "$Days days"
          SiteUsage = @()
          TopFiles = @()
          UserActivity = @()
          StorageTrends = @()
      }
      
      # サイト別利用状況
      $sites = Get-PnPTenantSite
      foreach ($site in $sites) {
          $siteAnalytics = Get-PnPSiteAnalytics -Identity $site.Url -Days $Days
          $analytics.SiteUsage += @{
              SiteUrl = $site.Url
              PageViews = $siteAnalytics.PageViews
              UniqueUsers = $siteAnalytics.UniqueUsers
              FileViews = $siteAnalytics.FileViews
              StorageUsed = $site.StorageUsageCurrent
          }
      }
      
      $analytics | ConvertTo-Json -Depth 3 | Out-File $OutputPath
      return $analytics
  }
  ```

- **セキュリティ監視**
  - 異常なファイルアクセスの検出
  - 大量ダウンロードの監視
  - 外部共有の監査
  - 権限変更の追跡・記録