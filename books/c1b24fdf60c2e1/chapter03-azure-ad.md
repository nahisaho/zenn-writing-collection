---
title: "第3章: Microsoft Entra ID構築 - 自動化・効率化を重視したID管理基盤"
---

# 3.1 ディレクトリ設計

## 3.1.1 教育機関向け組織構造設計

教育機関でのMicrosoft Entra ID（旧Azure AD）設計は、一般企業とは根本的に異なる複雑な組織構造に対応する必要があります。年度サイクル、学年進行、多様な役割を持つ教職員など、教育現場特有の要件を満たしながら、長期的な運用効率を実現する設計が求められます。

### 3.1.1.1 階層構造の運用最適化

**4層構造による体系的管理**

教育機関では、以下の4層構造で組織を設計することで、効率的な管理と柔軟な運用を両立できます。

```
組織階層構造
├── 教育委員会レベル（Level 0）
│   ├── 市立○○小学校（Level 1）
│   │   ├── 1年生（Level 2）
│   │   │   ├── 1年A組（Level 3）
│   │   │   └── 1年B組（Level 3）
│   │   ├── 2年生（Level 2）
│   │   └── 管理部（Level 2）
│   └── 市立○○中学校（Level 1）
```

**部門単位の横断組織対応**

教育機関では、学年・クラスという縦割り組織と、教科・委員会という横断組織が複雑に絡み合います。これに対応するため、動的グループを活用した柔軟な組織管理を実装します。

```powershell
# 教科別横断組織の動的グループ設定例
function New-SubjectBasedGroups {
    param(
        [string]$TenantId,
        [array]$Subjects = @("数学", "国語", "理科", "社会", "英語")
    )
    
    foreach ($Subject in $Subjects) {
        # 教科担当教員の動的グループ
        $GroupName = "教科担当_$Subject"
        $MembershipRule = "(user.jobTitle -contains '教諭' -or user.jobTitle -contains '講師') -and user.department -contains '$Subject'"
        
        New-MgGroup -DisplayName $GroupName `
                   -Description "$Subject 担当教員グループ" `
                   -GroupTypes @("DynamicMembership") `
                   -MembershipRule $MembershipRule `
                   -MembershipRuleProcessingState "On"
        
        Write-Host "作成完了: $GroupName"
    }
}
```

**特別支援・国際学級等への対応**

通常の学級編成では対応できない特殊組織についても、属性ベースの自動分類により効率的に管理します。

```powershell
# 特別支援学級の動的グループ設定
function New-SpecialNeedsGroups {
    # 特別支援学級生徒
    $SpecialNeedsRule = "user.extensionAttribute1 -eq '特別支援学級'"
    New-MgGroup -DisplayName "特別支援学級_生徒" `
               -GroupTypes @("DynamicMembership") `
               -MembershipRule $SpecialNeedsRule
    
    # 国際学級生徒  
    $InternationalRule = "user.extensionAttribute2 -eq '国際学級'"
    New-MgGroup -DisplayName "国際学級_生徒" `
               -GroupTypes @("DynamicMembership") `
               -MembershipRule $InternationalRule
}
```

### 3.1.1.2 命名規則の標準化

**ユーザーアカウント命名規則**

一貫性のある命名規則により、大量のユーザー管理を効率化します。

```
ユーザーアカウント形式：
[姓名]-[学校コード]-[入学年度]@[ドメイン]

例：
- 田中太郎-ABC-2024@city-edu.jp（ABC小学校2024年入学）
- 佐藤花子-DEF-T2024@city-edu.jp（DEF中学校教員・2024年採用）
```

**グループ名の統一形式**

検索性と管理効率を向上させるため、用途・学校・学年・クラスの階層的命名を実装します。

```powershell
function New-StandardizedGroupName {
    param(
        [string]$Purpose,    # 用途（学級、教科、委員会等）
        [string]$School,     # 学校コード
        [string]$Grade = "", # 学年（任意）
        [string]$Class = ""  # クラス（任意）
    )
    
    $GroupName = "$Purpose-$School"
    if ($Grade) { $GroupName += "-$Grade" }
    if ($Class) { $GroupName += "-$Class" }
    
    return $GroupName
}

# 使用例
$GroupNames = @(
    (New-StandardizedGroupName -Purpose "学級" -School "ABC" -Grade "01" -Class "A"),
    (New-StandardizedGroupName -Purpose "教科" -School "ABC" -Grade "数学"),
    (New-StandardizedGroupName -Purpose "委員会" -School "ABC" -Grade "生徒会")
)
# 結果：学級-ABC-01-A, 教科-ABC-数学, 委員会-ABC-生徒会
```

## 3.1.2 ユーザー属性設計

### 3.1.2.1 教育機関特有の属性管理

**基本属性の体系化**

教育機関では、標準的な組織属性に加えて、教育特有の属性管理が重要です。Microsoft Entra IDの拡張属性を活用し、School Data Syncとの連携を前提とした設計を行います。

```powershell
# 教育機関向け属性設定の標準化
function Set-EducationUserAttributes {
    param(
        [string]$UserId,
        [hashtable]$EducationAttributes
    )
    
    # 基本教育属性の設定
    $AttributeMap = @{
        "employeeId" = $EducationAttributes.StaffCode      # 職員コード
        "extensionAttribute1" = $EducationAttributes.StudentId  # 学籍番号
        "extensionAttribute2" = $EducationAttributes.Grade      # 学年
        "extensionAttribute3" = $EducationAttributes.Class      # クラス
        "extensionAttribute4" = $EducationAttributes.AttendanceNumber  # 出席番号
        "extensionAttribute5" = $EducationAttributes.EnrollmentYear    # 入学年度
        "extensionAttribute6" = $EducationAttributes.GraduationYear    # 卒業予定年度
        "extensionAttribute7" = $EducationAttributes.AttendanceStatus  # 在籍状況
        "extensionAttribute8" = $EducationAttributes.SubjectSpecialty  # 専科・担当教科
    }
    
    # 属性の一括更新
    Update-MgUser -UserId $UserId -AdditionalProperties $AttributeMap
    Write-Host "教育属性設定完了: $UserId"
}
```

**ライフサイクル管理属性**

学生・教職員のライフサイクル管理のため、期間管理に関する属性を体系的に設定します。

```powershell
# ライフサイクル管理属性の設定
function Set-LifecycleAttributes {
    param(
        [string]$UserId,
        [string]$UserType,  # Student, Teacher, Staff
        [datetime]$StartDate,
        [datetime]$EndDate
    )
    
    $LifecycleAttributes = @{
        "extensionAttribute9" = $UserType
        "extensionAttribute10" = $StartDate.ToString("yyyy-MM-dd")
        "extensionAttribute11" = $EndDate.ToString("yyyy-MM-dd")
        "extensionAttribute12" = (Get-Date).ToString("yyyy-MM-dd")  # 最終更新日
    }
    
    # 自動無効化日の計算（卒業予定日の3か月後）
    if ($UserType -eq "Student") {
        $AutoDisableDate = $EndDate.AddMonths(3)
        $LifecycleAttributes["extensionAttribute13"] = $AutoDisableDate.ToString("yyyy-MM-dd")
    }
    
    Update-MgUser -UserId $UserId -AdditionalProperties $LifecycleAttributes
}
```

### 3.1.2.2 School Data Sync連携属性

**SDS連携のための属性マッピング**

Microsoft School Data Syncとの連携を前提とした属性設計により、学籍システムからの自動プロビジョニングを実現します。

```powershell
# SDS連携用属性マッピング設定
function Initialize-SDSAttributeMapping {
    param([string]$TenantId)
    
    # SDS標準属性の定義
    $SDSAttributes = @{
        "School_ID" = "extensionAttribute14"
        "SIS_ID" = "extensionAttribute15"
        "Section_ID" = "extensionAttribute16"
        "Academic_Session" = "extensionAttribute17"
        "Student_Grade" = "extensionAttribute2"  # 既存の学年属性と連携
        "Teacher_Subject" = "extensionAttribute8"  # 既存の教科属性と連携
    }
    
    # 属性マッピングの文書化
    $MappingDoc = @"
# SDS属性マッピング設定
## 学生属性
- School_ID ($($SDSAttributes.School_ID)): 学校識別子
- SIS_ID ($($SDSAttributes.SIS_ID)): 学籍システムID
- Student_Grade ($($SDSAttributes.Student_Grade)): 学年
- Section_ID ($($SDSAttributes.Section_ID)): クラス識別子

## 教職員属性
- School_ID ($($SDSAttributes.School_ID)): 所属学校
- Teacher_Subject ($($SDSAttributes.Teacher_Subject)): 担当教科
- Academic_Session ($($SDSAttributes.Academic_Session)): 年度情報
"@
    
    $MappingDoc | Out-File "SDS_AttributeMapping.md" -Encoding UTF8
    Write-Host "SDS属性マッピング設定完了"
}
```

# 3.2 ハイブリッドアイデンティティ

## 3.2.1 Azure AD Connect運用管理

教育機関では、既存の校務システムとクラウドサービスの連携が不可欠です。Azure AD Connectを用いたハイブリッド構成により、オンプレミスとクラウドの一元管理を実現します。

### 3.2.1.1 同期プロセスの運用監視

**自動監視・アラート体系の構築**

同期プロセスの健全性を継続的に監視し、問題の早期発見・対処を実現します。

```powershell
# Azure AD Connect同期監視スクリプト
function Monitor-ADConnectSync {
    param(
        [string]$ConnectServer,
        [string]$AlertEmail
    )
    
    # 同期ステータスの確認
    $SyncStatus = Get-ADSyncConnectorRunStatus
    $LastSyncTime = (Get-ADSyncScheduler).NextSyncCyclePolicyDateTime
    
    # エラーチェック
    $SyncErrors = Get-ADSyncConnectorStatistics | Where-Object {$_.ConnectorErrors -gt 0}
    
    if ($SyncErrors) {
        $ErrorMessage = @"
Azure AD Connect同期エラーが検出されました。

エラー詳細:
$($SyncErrors | Format-Table -AutoSize | Out-String)

最終同期時刻: $LastSyncTime
サーバー: $ConnectServer

直ちに確認が必要です。
"@
        
        Send-MailMessage -To $AlertEmail `
                        -Subject "【緊急】Azure AD Connect同期エラー" `
                        -Body $ErrorMessage `
                        -SmtpServer "smtp.city-edu.jp"
    }
    
    # 同期遅延チェック（24時間以上同期されていない場合）
    $LastSync = Get-ADSyncConnectorStatistics | 
                Select-Object -ExpandProperty LastSyncTime | 
                Sort-Object -Descending | 
                Select-Object -First 1
    
    if ($LastSync -lt (Get-Date).AddHours(-24)) {
        Write-Warning "同期が24時間以上実行されていません: $LastSync"
        # アラート送信処理
    }
}

# 定期実行設定（Windows タスクスケジューラで15分間隔）
Register-ScheduledTask -TaskName "ADConnect監視" `
                      -Action (New-ScheduledTaskAction -Execute "PowerShell.exe" `
                              -Argument "-File C:\Scripts\Monitor-ADConnectSync.ps1") `
                      -Trigger (New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 15) -Once -At (Get-Date))
```

**同期ルールのカスタマイズ**

教育機関特有の要件に対応するため、同期ルールをカスタマイズします。

```powershell
# 教育機関向け同期ルール設定
function Set-EducationSyncRules {
    # 学生アカウントの条件付き同期
    $StudentSyncRule = @{
        Name = "In from AD - Student Accounts"
        Description = "在学生のみを同期対象とする"
        SourceObjectType = "user"
        TargetObjectType = "person"
        Precedence = 50
        ScopeFilter = @{
            Attribute = "extensionAttribute7"
            Operator = "EQUAL"
            Value = "在学"
        }
    }
    
    # 教職員アカウントの同期
    $StaffSyncRule = @{
        Name = "In from AD - Staff Accounts"
        Description = "在職教職員のみを同期対象とする"
        SourceObjectType = "user"
        TargetObjectType = "person"
        Precedence = 51
        ScopeFilter = @{
            Attribute = "employeeType"
            Operator = "EQUAL"
            Value = "教職員"
        }
    }
    
    Write-Host "教育機関向け同期ルール設定完了"
}
```

### 3.2.1.2 オンプレミスAD連携の運用

**地理的分散環境での最適化**

離島・山間部を含む広範囲な教育機関に対応するため、WAN回線制約を考慮した同期設定を実装します。

```powershell
# 地理的分散対応の同期スケジュール設定
function Set-GeographicOptimizedSync {
    param(
        [array]$RemoteSchools,
        [string]$MainSite
    )
    
    foreach ($School in $RemoteSchools) {
        $SyncSchedule = switch ($School.ConnectionType) {
            "Satellite" { 
                # 衛星回線：夜間のみ同期
                @{
                    Frequency = "Daily"
                    StartTime = "02:00"
                    Duration = "4 hours"
                }
            }
            "ADSL" { 
                # ADSL：3時間間隔
                @{
                    Frequency = "Every3Hours"
                    StartTime = "06:00"
                    Duration = "30 minutes"
                }
            }
            "Fiber" { 
                # 光回線：30分間隔
                @{
                    Frequency = "Every30Minutes"
                    StartTime = "00:00"
                    Duration = "10 minutes"
                }
            }
        }
        
        Set-ADSyncScheduler -SyncCycleEnabled $true `
                           -NextSyncCyclePolicyDateTime $SyncSchedule.StartTime
        
        Write-Host "$($School.Name): $($School.ConnectionType)向け同期設定完了"
    }
}
```

# 3.3 認証・アクセス制御

## 3.3.1 多要素認証（MFA）の運用管理

教育機関では、年齢段階別のセキュリティ要件と使いやすさのバランスを取る必要があります。段階的MFA展開により、セキュリティを確保しながら教育活動への影響を最小限に抑えます。

### 3.3.1.1 段階的MFA展開戦略

**年齢・役割別MFA設定**

```powershell
# 教育機関向け段階的MFA展開
function Deploy-EducationMFA {
    param([string]$TenantId)
    
    # フェーズ1: 管理者（即座適用）
    $AdminUsers = Get-MgUser -Filter "assignedLicenses/any(x:x/skuId eq '00000000-0000-0000-0000-000000000000')" |
                  Where-Object {$_.UserPrincipalName -like "*admin*"}
    
    foreach ($Admin in $AdminUsers) {
        $MFARequirement = @{
            State = "Enabled"
            StrongAuthenticationMethods = @(
                @{MethodType = "PhoneAppOTP"; IsDefault = $true},
                @{MethodType = "PhoneAppNotification"; IsDefault = $false}
            )
        }
        
        Set-MgUser -UserId $Admin.Id -AdditionalProperties @{
            StrongAuthenticationRequirements = @($MFARequirement)
        }
        Write-Host "MFA設定完了（管理者）: $($Admin.DisplayName)"
    }
    
    # フェーズ2: 教職員（4週間で段階展開）
    $Teachers = Get-MgUser -Filter "jobTitle eq '教諭' or jobTitle eq '講師'"
    $BatchSize = [Math]::Ceiling($Teachers.Count / 4)  # 4週間で分割
    
    for ($Week = 1; $Week -le 4; $Week++) {
        $StartIndex = ($Week - 1) * $BatchSize
        $EndIndex = [Math]::Min($Week * $BatchSize - 1, $Teachers.Count - 1)
        $WeeklyBatch = $Teachers[$StartIndex..$EndIndex]
        
        foreach ($Teacher in $WeeklyBatch) {
            # 教職員向けMFA設定（SMS + アプリ）
            $TeacherMFA = @{
                State = "Enabled"
                StrongAuthenticationMethods = @(
                    @{MethodType = "TwoWayVoiceMobile"; IsDefault = $true},
                    @{MethodType = "PhoneAppOTP"; IsDefault = $false}
                )
            }
            
            Set-MgUser -UserId $Teacher.Id -AdditionalProperties @{
                StrongAuthenticationRequirements = @($TeacherMFA)
            }
        }
        
        Write-Host "週$Week MFA設定完了: $($WeeklyBatch.Count)名の教職員"
    }
    
    # フェーズ3: 高校生（制限付きMFA）
    $HighSchoolStudents = Get-MgUser -Filter "extensionAttribute2 eq '高校生'"
    foreach ($Student in $HighSchoolStudents) {
        $StudentMFA = @{
            State = "Enabled"
            StrongAuthenticationMethods = @(
                @{MethodType = "TwoWayVoiceMobile"; IsDefault = $true}  # SMS のみ
            )
        }
        
        Set-MgUser -UserId $Student.Id -AdditionalProperties @{
            StrongAuthenticationRequirements = @($StudentMFA)
        }
    }
}
```

## 3.3.2 条件付きアクセスの運用設計

### 3.3.2.1 教育機関向けポリシー設計

**年齢段階別アクセス制御**

教育機関では、年齢に応じた段階的なアクセス制御が法的要件となります。条件付きアクセスポリシーにより、きめ細かな制御を実現します。

```powershell
# 年齢段階別条件付きアクセスポリシー作成
function New-EducationConditionalAccessPolicies {
    param([string]$TenantId)
    
    # 小学生用ポリシー（厳格な制限）
    $ElementaryPolicy = @{
        DisplayName = "小学生_校内アクセス限定"
        State = "enabled"
        Conditions = @{
            Users = @{
                IncludeGroups = @("小学生_全学年")
            }
            Applications = @{
                IncludeApplications = @("All")
            }
            Locations = @{
                ExcludeLocations = @("校内ネットワーク")
            }
        }
        GrantControls = @{
            Operator = "AND"
            BuiltInControls = @("block")
        }
    }
    
    New-MgIdentityConditionalAccessPolicy -BodyParameter $ElementaryPolicy
    
    # 中学生用ポリシー（時間制限付き）
    $MiddleSchoolPolicy = @{
        DisplayName = "中学生_時間制限アクセス"
        State = "enabled"
        Conditions = @{
            Users = @{
                IncludeGroups = @("中学生_全学年")
            }
            Applications = @{
                IncludeApplications = @("All")
            }
            SignInRiskLevels = @("high")
        }
        GrantControls = @{
            Operator = "OR"
            BuiltInControls = @("mfa", "compliantDevice")
        }
        SessionControls = @{
            SignInFrequency = @{
                Value = 4
                Type = "hours"
                IsEnabled = $true
            }
        }
    }
    
    New-MgIdentityConditionalAccessPolicy -BodyParameter $MiddleSchoolPolicy
    
    # 高校生用ポリシー（最小制限）
    $HighSchoolPolicy = @{
        DisplayName = "高校生_基本制限"
        State = "enabled"
        Conditions = @{
            Users = @{
                IncludeGroups = @("高校生_全学年")
            }
            Applications = @{
                IncludeApplications = @("All")
            }
            SignInRiskLevels = @("high", "medium")
        }
        GrantControls = @{
            Operator = "OR"
            BuiltInControls = @("mfa")
        }
    }
    
    New-MgIdentityConditionalAccessPolicy -BodyParameter $HighSchoolPolicy
    
    Write-Host "年齢段階別条件付きアクセスポリシー作成完了"
}
```

# 3.4 運用効率化のための高度な設定

## 3.4.1 動的グループの積極活用

教育機関の複雑な組織構造と頻繁な変更に対応するため、動的グループを積極的に活用し、手作業による管理負荷を大幅に軽減します。

### 3.4.1.1 学年・クラス別の自動グループ作成

**属性ベースの自動メンバーシップ**

```powershell
# 学年・クラス別動的グループの自動作成
function New-GradeClassDynamicGroups {
    param(
        [array]$Grades = @("1", "2", "3", "4", "5", "6"),
        [array]$Classes = @("A", "B", "C", "D"),
        [string]$SchoolCode = "ABC"
    )
    
    foreach ($Grade in $Grades) {
        foreach ($Class in $Classes) {
            $GroupName = "学級_${SchoolCode}_${Grade}年${Class}組"
            $MembershipRule = "(user.extensionAttribute2 -eq '$Grade') -and (user.extensionAttribute3 -eq '$Class') -and (user.extensionAttribute14 -eq '$SchoolCode')"
            
            $GroupParams = @{
                DisplayName = $GroupName
                Description = "$SchoolCode 小学校 $Grade 年 $Class 組の動的グループ"
                GroupTypes = @("DynamicMembership")
                MembershipRule = $MembershipRule
                MembershipRuleProcessingState = "On"
                MailEnabled = $false
                SecurityEnabled = $true
            }
            
            try {
                $NewGroup = New-MgGroup @GroupParams
                Write-Host "作成成功: $GroupName (ID: $($NewGroup.Id))"
            }
            catch {
                Write-Error "作成失敗: $GroupName - $($_.Exception.Message)"
            }
        }
    }
}
```

**進級時の自動グループ移動**

年度更新時の学年進行を自動化し、手作業による移動処理を排除します。

```powershell
# 年度更新時の学年進行処理
function Invoke-AcademicYearProgression {
    param(
        [string]$NewAcademicYear,
        [string]$SchoolCode
    )
    
    # 現在の学年別ユーザー取得
    for ($CurrentGrade = 1; $CurrentGrade -le 6; $CurrentGrade++) {
        $CurrentGradeStudents = Get-MgUser -Filter "extensionAttribute2 eq '$CurrentGrade' and extensionAttribute14 eq '$SchoolCode'"
        
        # 学年進行処理
        foreach ($Student in $CurrentGradeStudents) {
            if ($CurrentGrade -eq 6) {
                # 6年生は卒業処理
                $UpdateParams = @{
                    extensionAttribute2 = "卒業生"
                    extensionAttribute7 = "卒業"
                    extensionAttribute11 = (Get-Date).ToString("yyyy-MM-dd")  # 卒業日
                }
                Write-Host "卒業処理: $($Student.DisplayName)"
            }
            else {
                # 1-5年生は進級処理
                $NewGrade = $CurrentGrade + 1
                $UpdateParams = @{
                    extensionAttribute2 = $NewGrade.ToString()
                    extensionAttribute12 = (Get-Date).ToString("yyyy-MM-dd")  # 進級日
                }
                Write-Host "進級処理: $($Student.DisplayName) → $NewGrade 年生"
            }
            
            Update-MgUser -UserId $Student.Id -AdditionalProperties $UpdateParams
        }
    }
    
    # 新入生の自動追加処理
    $NewStudents = Import-Csv "新入生名簿_$NewAcademicYear.csv"
    foreach ($NewStudent in $NewStudents) {
        $NewStudentParams = @{
            DisplayName = $NewStudent.DisplayName
            UserPrincipalName = "$($NewStudent.LoginName)@$($SchoolCode.ToLower()).edu.jp"
            extensionAttribute2 = "1"  # 1年生
            extensionAttribute3 = $NewStudent.Class
            extensionAttribute14 = $SchoolCode
            extensionAttribute5 = $NewAcademicYear  # 入学年度
        }
        
        New-MgUser @NewStudentParams
        Write-Host "新入生作成: $($NewStudent.DisplayName)"
    }
}
```

## 3.4.2 管理単位の委任設定

### 3.4.2.1 学校別管理者の権限委任

**Administrative Units (AU) を活用した権限分離**

大規模な教育委員会では、学校単位での管理権限委任により、運用負荷の分散と責任の明確化を実現します。

```powershell
# 学校別管理単位設定
function New-SchoolAdministrativeUnits {
    param([array]$Schools)
    
    foreach ($School in $Schools) {
        # 管理単位の作成
        $AUParams = @{
            DisplayName = "$($School.Name)_管理単位"
            Description = "$($School.Name) の管理範囲"
            IsMemberManagementRestricted = $true
        }
        
        $AU = New-MgDirectoryAdministrativeUnit @AUParams
        Write-Host "管理単位作成: $($School.Name)"
        
        # 学校のユーザーを管理単位に追加
        $SchoolUsers = Get-MgUser -Filter "extensionAttribute14 eq '$($School.Code)'"
        foreach ($User in $SchoolUsers) {
            New-MgDirectoryAdministrativeUnitMemberByRef -AdministrativeUnitId $AU.Id -OdataId "https://graph.microsoft.com/v1.0/users/$($User.Id)"
        }
        
        # 学校管理者に権限委任
        $Principal = Get-MgUser -Filter "userPrincipalName eq '$($School.AdminEmail)'"
        $RoleAssignment = @{
            RoleDefinitionId = "fe930be7-5e62-47db-91af-98c3a49a38b1"  # User Administrator (Limited)
            PrincipalId = $Principal.Id
            DirectoryScopeId = "/administrativeUnits/$($AU.Id)"
        }
        
        New-MgRoleManagementDirectoryRoleAssignment -BodyParameter $RoleAssignment
        Write-Host "権限委任完了: $($School.AdminEmail) → $($School.Name)"
    }
}
```

## 3.4.3 ライフサイクル管理の自動化

### 3.4.3.1 アカウント作成の自動化

**HRシステム・校務システム連携**

校務システムからのデータ連携により、アカウント作成プロセスを完全自動化します。

```powershell
# 校務システム連携による自動アカウント作成
function New-AutomatedAccountProvisioning {
    param(
        [string]$SISDataPath,
        [string]$SchoolCode
    )
    
    # 校務システムデータの読み込み
    $SISData = Import-Csv $SISDataPath -Encoding UTF8
    
    foreach ($Record in $SISData) {
        # アカウント存在チェック
        $ExistingUser = Get-MgUser -Filter "employeeId eq '$($Record.EmployeeId)'" -ErrorAction SilentlyContinue
        
        if (-not $ExistingUser) {
            # 新規アカウント作成
            $UserParams = @{
                DisplayName = $Record.DisplayName
                UserPrincipalName = "$($Record.LoginName)@$SchoolCode.edu.jp"
                EmployeeId = $Record.EmployeeId
                JobTitle = $Record.JobTitle
                Department = $Record.Department
                extensionAttribute1 = $Record.StudentId
                extensionAttribute2 = $Record.Grade
                extensionAttribute3 = $Record.Class
                extensionAttribute5 = $Record.EnrollmentYear
                extensionAttribute7 = "在学"
                PasswordProfile = @{
                    ForceChangePasswordNextSignIn = $true
                    Password = New-TemporaryPassword
                }
            }
            
            $NewUser = New-MgUser @UserParams
            
            # 適切なライセンス自動割り当て
            $LicenseSku = switch ($Record.UserType) {
                "Student" { "STANDARDWOFFPACK_FACULTY" }  # A1 for Students
                "Teacher" { "STANDARDWOFFPACK_FACULTY" }  # A1 for Faculty  
                "Staff" { "STANDARDWOFFPACK_FACULTY" }    # A1 for Faculty
            }
            
            Set-MgUserLicense -UserId $NewUser.Id -AddLicenses @{SkuId = $LicenseSku} -RemoveLicenses @()
            
            Write-Host "アカウント作成完了: $($Record.DisplayName) ($($Record.UserType))"
        }
    }
}

# 一時パスワード生成関数
function New-TemporaryPassword {
    $adjectives = @("Quick", "Bright", "Happy", "Swift", "Kind")
    $nouns = @("Tiger", "Mountain", "River", "Ocean", "Forest")
    $number = Get-Random -Minimum 100 -Maximum 999
    
    return "$($adjectives | Get-Random)$($nouns | Get-Random)$number!"
}
```

### 3.4.3.2 定期的なアクセスレビュー

**自動化されたアクセス権限見直し**

```powershell
# 四半期アクセスレビューの自動実行
function Start-QuarterlyAccessReview {
    param([string]$Quarter)
    
    # 長期未使用アカウントの特定
    $ThreeMonthsAgo = (Get-Date).AddDays(-90)
    $UnusedAccounts = Get-MgUser -Filter "signInActivity/lastSignInDateTime lt '$($ThreeMonthsAgo.ToString('yyyy-MM-ddTHH:mm:ssZ'))'"
    
    foreach ($Account in $UnusedAccounts) {
        $ReviewData = @{
            UserId = $Account.Id
            DisplayName = $Account.DisplayName
            LastSignIn = $Account.SignInActivity.LastSignInDateTime
            UserType = $Account.extensionAttribute9
            RecommendedAction = if ($Account.extensionAttribute9 -eq "Student" -and $Account.extensionAttribute7 -eq "卒業") {
                "削除"
            } else {
                "要確認"
            }
        }
        
        # レビューレポートに追加
        $ReviewData | Export-Csv "AccessReview_$Quarter.csv" -Append -NoTypeInformation
    }
    
    Write-Host "アクセスレビュー完了: $($UnusedAccounts.Count) アカウントを特定"
}
```

## 3.4.4 監視・レポートの自動化

### 3.4.4.1 Identity Protection活用

**リスクベース認証の実装**

```powershell
# Identity Protection設定
function Enable-IdentityProtection {
    param([string]$TenantId)
    
    # ユーザーリスクポリシー
    $UserRiskPolicy = @{
        DisplayName = "教育機関_ユーザーリスクポリシー"
        State = "enabled"
        UserRiskLevels = @("high")
        Conditions = @{
            Users = @{
                IncludeUsers = @("All")
                ExcludeUsers = @("管理者緊急アカウント")
            }
        }
        Controls = @{
            RequiredControls = @("passwordChange")
        }
    }
    
    # サインインリスクポリシー  
    $SignInRiskPolicy = @{
        DisplayName = "教育機関_サインインリスクポリシー"
        State = "enabled"
        SignInRiskLevels = @("high", "medium")
        Conditions = @{
            Users = @{
                IncludeUsers = @("All")
            }
        }
        Controls = @{
            RequiredControls = @("mfa")
        }
    }
    
    Write-Host "Identity Protection設定完了"
}
```

### 3.4.4.2 定期レポートの自動生成

**教育機関向けカスタムレポート**

```powershell
# 月次統計レポート自動生成
function New-MonthlyEducationReport {
    param(
        [string]$Month,
        [string]$OutputPath
    )
    
    # ユーザー統計
    $TotalUsers = (Get-MgUser).Count
    $ActiveStudents = (Get-MgUser -Filter "extensionAttribute9 eq 'Student' and extensionAttribute7 eq '在学'").Count
    $ActiveTeachers = (Get-MgUser -Filter "extensionAttribute9 eq 'Teacher'").Count
    
    # サインイン統計
    $SignInLogs = Get-MgAuditLogSignIn -Filter "createdDateTime ge $((Get-Date).AddDays(-30).ToString('yyyy-MM-ddTHH:mm:ssZ'))"
    $SuccessfulSignIns = ($SignInLogs | Where-Object {$_.Status.ErrorCode -eq 0}).Count
    $FailedSignIns = ($SignInLogs | Where-Object {$_.Status.ErrorCode -ne 0}).Count
    
    # セキュリティインシデント
    $RiskyUsers = (Get-MgIdentityProtectionRiskyUser -Filter "riskLevel eq 'high' or riskLevel eq 'medium'").Count
    
    # レポート生成
    $Report = @{
        Month = $Month
        TotalUsers = $TotalUsers
        ActiveStudents = $ActiveStudents
        ActiveTeachers = $ActiveTeachers
        SuccessfulSignIns = $SuccessfulSignIns
        FailedSignIns = $FailedSignIns
        RiskyUsers = $RiskyUsers
        SuccessRate = [Math]::Round(($SuccessfulSignIns / ($SuccessfulSignIns + $FailedSignIns)) * 100, 2)
    }
    
    $Report | ConvertTo-Json | Out-File "$OutputPath\EducationReport_$Month.json"
    
    # Excel形式でもエクスポート
    $Report | Export-Csv "$OutputPath\EducationReport_$Month.csv" -NoTypeInformation
    
    Write-Host "月次レポート生成完了: $Month"
}
```

---

**第3章のまとめ**

Microsoft Entra IDの構築において、教育機関特有の要件を満たしながら運用効率を最大化するためには、自動化と標準化が不可欠です。動的グループ、条件付きアクセス、ライフサイクル管理の自動化により、限られた人員でも安全で効率的な運用を実現できます。

次章では、これらの基盤の上に構築するユーザー・ライセンス管理の実践的手法を詳しく解説します。