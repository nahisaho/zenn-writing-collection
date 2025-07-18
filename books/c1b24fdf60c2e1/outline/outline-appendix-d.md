# 付録D: トラブルシューティングガイド - アウトライン（運用管理特化版）

## 構成方針
- 教育機関で頻発する問題の迅速な解決手順
- 段階的なトラブルシューティングアプローチ
- 予防策と再発防止のための根本原因分析

## D.1 認証・ログイン問題

### D.1.1 一般的なログイン問題
- **問題症状：ユーザーがログインできない**
  ```
  【症状の詳細確認】
  □ エラーメッセージの正確な内容
  □ 発生タイミング（初回ログイン/継続利用中）
  □ 使用デバイス・ブラウザ
  □ 影響範囲（個人/グループ/全体）
  
  【第1段階：基本確認】
  1. アカウント状態確認
     PowerShell: Get-MgUser -UserId "ユーザー名" | Select UserPrincipalName, AccountEnabled, UserType
     □ アカウントが有効化されている
     □ ライセンスが割り当てられている
     □ パスワード期限が切れていない
     □ アカウントロックされていない
  
  2. サービス状況確認
     □ Microsoft 365サービス正常性確認（admin.microsoft.com）
     □ Azure AD認証サービス状況確認
     □ ネットワーク接続状況確認
     □ DNS設定・名前解決確認
  
  【第2段階：詳細診断】
  3. サインインログ確認
     PowerShell: Get-MgAuditLogSignIn -Filter "userPrincipalName eq 'ユーザー名'" -Top 10
     □ 最近のサインイン試行状況確認
     □ エラーコードの詳細分析
     □ 使用デバイス・場所の確認
     □ 条件付きアクセスポリシーの影響確認
  
  4. 多要素認証（MFA）確認
     PowerShell: Get-MgUserAuthenticationMethod -UserId "ユーザー名"
     □ MFA設定状況確認
     □ 認証方法の有効性確認
     □ 認証アプリ・電話番号の正確性確認
     □ 一時的なバイパス設定の可否検討
  
  【第3段階：解決実行】
  5. 段階的解決手順
     a. パスワードリセット
        PowerShell: Set-MgUserPassword -UserId "ユーザー名" -Password "新パスワード" -ForceChangePasswordNextSignIn $true
     
     b. アカウントロック解除
        PowerShell: Set-MgUser -UserId "ユーザー名" -AccountEnabled $true
     
     c. MFA再設定支援
        - 認証アプリの再設定
        - 代替認証方法の追加
        - 一時的なバイパス設定（管理者承認要）
     
     d. 条件付きアクセス除外（一時的）
        - ユーザー単位の一時除外設定
        - デバイス登録・準拠性確認
        - 段階的なポリシー適用
  
  【検証・フォローアップ】
  6. 解決確認
     □ ユーザーによる実際のログイン確認
     □ 各サービス（Teams、Outlook等）への正常アクセス確認
     □ モバイルデバイスでのアクセス確認
     □ 今後の予防策説明・指導
  ```

### D.1.2 シングルサインオン（SSO）問題
- **SAML認証エラー対応**
- **フェデレーション設定問題**
- **証明書期限切れ対応**

### D.1.3 条件付きアクセス問題
- **ポリシー適用による意図しないブロック**
- **デバイス準拠性問題**
- **場所ベースアクセス制限問題**

## D.2 メール・Exchange関連問題

### D.2.1 メール配信問題
- **問題症状：メールが送受信できない**
  ```
  【症状の詳細確認】
  □ 問題の範囲（送信のみ/受信のみ/両方）
  □ 特定の相手先のみの問題か
  □ エラーメッセージの詳細
  □ 問題発生時期・タイミング
  
  【第1段階：基本確認】
  1. Exchange Onlineサービス状況確認
     □ Microsoft 365管理センターでサービス正常性確認
     □ Exchange Onlineの障害・メンテナンス情報確認
     □ DNS（MXレコード）設定確認
     □ SPF、DKIM、DMARC設定確認
  
  2. メールボックス状態確認
     PowerShell: Get-Mailbox -Identity "ユーザー名" | Select DisplayName, ProhibitSendQuota, IssueWarningQuota
     □ メールボックス容量状況確認
     □ 送信制限に達していないか確認
     □ アーカイブメールボックス状況確認
     □ ライセンス状況確認
  
  【第2段階：配信追跡】
  3. メッセージ追跡実行
     PowerShell: Get-MessageTrace -SenderAddress "送信者" -RecipientAddress "受信者" -StartDate (Get-Date).AddDays(-1)
     □ メッセージの配信状況追跡
     □ 配信経路の確認
     □ 配信失敗の詳細原因確認
     □ スパムフィルターによる影響確認
  
  4. メールフロールール確認
     PowerShell: Get-TransportRule | Where-Object {$_.State -eq "Enabled"}
     □ メールフロールールの適用状況確認
     □ ブロック・リダイレクトルールの確認
     □ DLP（データ損失防止）ポリシーの影響確認
     □ 外部メール配信制限の確認
  
  【第3段階：解決実行】
  5. 問題種別別対応
     a. 容量問題の場合
        - アーカイブメールボックス有効化
        - 古いメール・添付ファイルの削除指導
        - メールボックス容量増加（ライセンス変更）
     
     b. スパムフィルター誤検出の場合
        - 許可リスト（ホワイトリスト）への追加
        - スパムフィルター設定の調整
        - 隔離メールの解放
     
     c. メールフロールール問題の場合
        - 問題のあるルールの無効化・修正
        - 例外設定の追加
        - ルール適用順序の調整
     
     d. DNS・認証問題の場合
        - SPF/DKIM/DMARC設定の修正
        - 外部メールサーバーとの連携設定見直し
        - 逆引きDNS設定確認
  
  【検証・予防策】
  6. 解決確認と予防
     □ テストメール送受信による動作確認
     □ 各種メールクライアントでの動作確認
     □ 監視設定の追加・強化
     □ ユーザーへの操作指導・注意喚起
  ```

### D.2.2 Outlook設定問題
- **プロファイル破損対応**
- **自動設定失敗対応**
- **OST同期問題**

### D.2.3 モバイルデバイス同期問題
- **ActiveSync設定問題**
- **Outlook Mobileアプリ問題**
- **セキュリティポリシー適用問題**

## D.3 Teams関連問題

### D.3.1 会議・通話品質問題
- **問題症状：Teams会議で音声・映像に問題がある**
  ```
  【症状の詳細確認】
  □ 音声問題（聞こえない/雑音/途切れる）
  □ 映像問題（見えない/画質悪い/フリーズ）
  □ 画面共有問題（共有できない/見えない）
  □ 特定ユーザーのみ/会議全体の問題
  
  【第1段階：環境確認】
  1. ネットワーク状況確認
     □ 帯域幅テスト実行（最低1Mbps上り/下り必要）
     □ パケットロス・遅延測定
     □ ファイアウォール・プロキシ設定確認
     □ QoS設定状況確認
  
  2. デバイス・設定確認
     □ マイク・カメラデバイス認識状況
     □ Teamsアプリバージョン確認
     □ オーディオデバイス設定確認
     □ ブラウザ版/デスクトップ版の動作比較
  
  【第2段階：Teams診断】
  3. 通話品質診断実行
     □ Teams管理センターでの通話分析確認
     □ ユーザー別通話品質レポート確認
     □ メディア品質メトリクス確認
     □ エンドポイント性能分析
  
  4. 会議設定確認
     PowerShell: Get-CsTeamsMeetingPolicy -Identity "ユーザー名"
     □ 会議ポリシー設定確認
     □ 録画・転写設定確認
     □ 外部参加者設定確認
     □ ロビー設定確認
  
  【第3段階：解決実行】
  5. 段階的解決手順
     a. 基本設定修正
        - マイク・カメラテスト実行
        - オーディオデバイス変更・再設定
        - Teamsキャッシュクリア
        - アプリ再起動・再インストール
     
     b. ネットワーク最適化
        - QoS設定適用
        - 帯域制限設定調整
        - プロキシ設定見直し
        - 有線接続推奨
     
     c. 会議設定最適化
        - 会議サイズに応じた設定調整
        - 録画・転写無効化（負荷軽減）
        - 参加者制限設定
        - メディア品質設定調整
     
     d. 代替手段提供
        - 電話会議参加案内
        - 別会議室・デバイス利用
        - 会議録画による事後確認
        - チャット機能活用
  
  【検証・改善】
  6. 継続的改善
     □ 解決後の品質確認テスト
     □ 継続的な品質監視設定
     □ ユーザー向け品質向上指導
     □ ネットワーク・インフラ改善計画
  ```

### D.3.2 チーム・チャネル管理問題
- **チーム作成・削除問題**
- **メンバーシップ管理問題**
- **ゲストアクセス問題**

### D.3.3 ファイル共有・OneDrive同期問題
- **ファイルアップロード失敗**
- **同期エラー対応**
- **権限設定問題**

## D.4 SharePoint・OneDrive問題

### D.4.1 アクセス・権限問題
- **問題症状：SharePointサイトにアクセスできない**
  ```
  【症状の詳細確認】
  □ 特定サイト/全サイトの問題
  □ エラーメッセージ詳細（403/404/500等）
  □ 以前アクセスできていたか
  □ 他ユーザーの状況
  
  【第1段階：基本確認】
  1. サイト・ユーザー状況確認
     PowerShell: Get-PnPSite -Identity "サイトURL"
     □ サイト存在確認
     □ サイト状態（Active/ReadOnly等）確認
     □ ユーザーのサイト権限確認
     □ グループメンバーシップ確認
  
  2. 権限設定確認
     PowerShell: Get-PnPSiteUser -Identity "サイトURL"
     □ サイトレベル権限確認
     □ リスト・ライブラリ権限確認
     □ アイテムレベル権限確認
     □ 継承設定確認
  
  【第2段階：詳細診断】
  3. 条件付きアクセス・DLP確認
     □ 条件付きアクセスポリシー適用状況
     □ DLPポリシー適用状況
     □ 情報バリア設定影響
     □ 外部共有設定確認
  
  4. SharePoint管理設定確認
     □ テナント設定確認
     □ サイトコレクション設定確認
     □ 外部共有設定確認
     □ アプリ権限設定確認
  
  【第3段階：解決実行】
  5. 権限問題解決
     a. 基本権限付与
        PowerShell: Add-PnPSiteUser -Identity "サイトURL" -LoginName "ユーザー" -Group "権限グループ"
     
     b. グループメンバーシップ修正
        PowerShell: Add-MgGroupMember -GroupId "グループID" -DirectoryObjectId "ユーザーID"
     
     c. 条件付きアクセス調整
        - 一時的な除外設定
        - デバイス登録・準拠性確認
        - ポリシー適用順序見直し
     
     d. サイト設定修正
        - 外部共有設定調整
        - DLP除外設定
        - アプリ権限見直し
  
  【検証・予防】
  6. アクセス確認・予防策
     □ 複数ブラウザでのアクセステスト
     □ モバイルアプリでのアクセステスト
     □ 権限管理プロセス見直し
     □ 定期的な権限監査実施
  ```

### D.4.2 同期・パフォーマンス問題
- **OneDrive同期停止・遅延**
- **ファイル競合解決**
- **大容量ファイル処理問題**

### D.4.3 検索・ナビゲーション問題
- **検索結果表示不正**
- **サイトナビゲーション問題**
- **メタデータ・分類問題**

## D.5 ライセンス・サブスクリプション問題

### D.5.1 ライセンス割り当て問題
- **問題症状：ライセンスが正しく割り当てられない**
  ```
  【症状の詳細確認】
  □ 特定ライセンス/全ライセンスの問題
  □ 新規ユーザー/既存ユーザーの問題
  □ エラーメッセージ詳細
  □ 利用可能ライセンス数確認
  
  【第1段階：ライセンス状況確認】
  1. テナントライセンス確認
     PowerShell: Get-MgSubscribedSku | Select SkuPartNumber, ConsumedUnits, PrepaidUnits
     □ 購入済みライセンス数確認
     □ 消費済みライセンス数確認
     □ 利用可能ライセンス数確認
     □ ライセンス種別・プラン確認
  
  2. ユーザーライセンス状況確認
     PowerShell: Get-MgUserLicenseDetail -UserId "ユーザー名"
     □ 現在割り当て済みライセンス確認
     □ ライセンス割り当て履歴確認
     □ 無効化されたサービスプラン確認
     □ ライセンス競合状況確認
  
  【第2段階：割り当て問題診断】
  3. 割り当てエラー分析
     PowerShell: Get-MgUser -UserId "ユーザー名" | Select DisplayName, UsageLocation, AssignedLicenses
     □ 使用場所（UsageLocation）設定確認
     □ 既存ライセンス競合確認
     □ グループベースライセンス設定確認
     □ ライセンス継承問題確認
  
  4. 依存関係・前提条件確認
     □ 必要な基本ライセンス確認
     □ アドオンライセンス依存関係確認
     □ 地域制限・コンプライアンス要件確認
     □ 教育機関向けライセンス資格確認
  
  【第3段階：解決実行】
  5. ライセンス割り当て修正
     a. 基本ライセンス割り当て
        PowerShell: Set-MgUserLicense -UserId "ユーザー名" -AddLicenses @{SkuId="ライセンスID"}
     
     b. 使用場所設定
        PowerShell: Set-MgUser -UserId "ユーザー名" -UsageLocation "JP"
     
     c. ライセンス競合解決
        - 競合するライセンスの除去
        - 適切なライセンス組み合わせ設定
        - グループベースライセンス見直し
     
     d. 追加ライセンス購入
        - 不足ライセンスの購入手続き
        - 一時的なライセンス借用
        - ライセンス最適化・再配分
  
  【検証・最適化】
  6. 割り当て確認・最適化
     □ ライセンス正常割り当て確認
     □ サービス機能正常動作確認
     □ ライセンス使用状況継続監視
     □ ライセンス管理プロセス改善
  ```

### D.5.2 サービス機能問題
- **特定機能が利用できない**
- **ライセンスダウングレード影響**
- **期限切れライセンス対応**

## D.6 セキュリティ・コンプライアンス問題

### D.6.1 セキュリティアラート対応
- **疑わしいログイン活動検出**
- **マルウェア・フィッシング検出**
- **データ漏洩リスク検出**

### D.6.2 コンプライアンス違反対応
- **DLPポリシー違反対応**
- **保持ポリシー問題**
- **電子情報開示要求対応**

## D.7 パフォーマンス・可用性問題

### D.7.1 応答時間・遅延問題
- **全般的なパフォーマンス劣化**
- **特定時間帯の負荷集中**
- **地理的・ISP依存問題**

### D.7.2 システム可用性問題
- **部分的サービス停止**
- **断続的接続問題**
- **データセンター障害対応**

## D.8 教育機関特有問題

### D.8.1 大規模ユーザー管理問題
- **年度更新時の大量処理問題**
- **同時ログイン集中問題**
- **学年進行時のデータ移行問題**

### D.8.2 教育システム連携問題
- **校務システム連携エラー**
- **学習管理システム統合問題**
- **成績・出席システム連携問題**

## D.9 予防策・再発防止

### D.9.1 監視・アラート強化
- **予防的監視設定**
- **早期警告システム**
- **自動復旧機能設定**

### D.9.2 運用改善・教育
- **運用手順書更新**
- **管理者研修実施**
- **ユーザー教育強化**
- **ベストプラクティス水平展開**