---
title: "第2章：開発環境の構築"
---

# 第2章：開発環境の構築

本章では、Microsoft Entra IDとのSSO連携を実装するための開発環境を構築します。テナントの作成から開発ツールのセットアップまで、実際のコード作成に入る前に必要な準備作業をステップバイステップで解説します。

> 💡 **自動化スクリプト**: 本章で解説する環境構築の多くは、GitHubリポジトリの自動化スクリプトで効率化できます。  
> 📁 **参考ファイル**: [`azure-setup.sh`](https://github.com/nahisaho/entra-id-sso-samples/blob/main/azure-setup.sh)  
> 🔧 **設定テンプレート**: [`configs/environment-variables.env`](https://github.com/nahisaho/entra-id-sso-samples/blob/main/configs/environment-variables.env)

## 2.1 Microsoft Entra ID テナントの作成と初期設定

### テナント作成の準備

開発を始める前に、以下のアカウントとリソースを準備してください。

**必要なアカウント**
- Microsoftアカウント（個人用でも可）
- Azure無料アカウント（推奨）
- Microsoft 365開発者アカウント（オプション）

**推奨される環境**
```
OS: Windows 10/11, macOS 12+, Ubuntu 20.04+
メモリ: 8GB以上
ディスク容量: 50GB以上の空き容量
ネットワーク: インターネット接続必須
```

### Step 1: Azure Portalでのテナント作成

**1. Azure Portalにアクセス**
```
URL: https://portal.azure.com
サインイン: 準備したMicrosoftアカウントを使用
```

**2. 新しいテナントの作成**
```bash
# Azure Portal での操作手順
1. 「Microsoft Entra ID」を検索・選択
2. 左メニューから「テナントの管理」を選択
3. 「+ 作成」をクリック
4. 「Microsoft Entra ID」を選択
```

**3. テナント情報の入力**
```yaml
組織名: "Development SSO Integration"
初期ドメイン名: "dev-sso-integration"  # 一意である必要あり
国/地域: "日本"
```

**4. 作成の完了と確認**
```bash
# 作成が完了すると、以下の情報が生成されます
テナントID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
プライマリドメイン: dev-sso-integration.onmicrosoft.com
初期ディレクトリ管理者: 作成したユーザー
```

### Step 2: Azure CLIを使った自動化（オプション）

> 💡 **自動化スクリプト**: Azure環境の自動セットアップスクリプトは `src/azure-setup.sh` を参照してください。

```bash
# Azure CLIのインストール（Windows）
winget install Microsoft.AzureCLI

# Azure CLIのインストール（macOS）
brew install azure-cli

# Azure CLIのインストール（Ubuntu）
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# ログインとテナント作成
az login
az account tenant create \
  --display-name "Development SSO Integration" \
  --domain-name "dev-sso-integration"
```

### 初期設定の実行

**1. 管理者権限の確認**
```bash
# PowerShell または Azure Cloud Shell で実行
Connect-AzureAD -TenantId "your-tenant-id"
Get-AzureADUser -ObjectId (Get-AzureADCurrentSessionInfo).Account.Id
```

**2. セキュリティ設定**
```yaml
設定項目:
  多要素認証: 管理者アカウントで有効化（必須）
  セキュリティデフォルト: 有効
  パスワードポリシー: 強力なパスワードを要求
  サインインログ: 有効化（監査用）
```

**3. カスタムドメインの設定（オプション）**
```bash
# 独自ドメインがある場合の設定
az ad domain add --domain-name "yourdomain.com"
az ad domain verify --domain-name "yourdomain.com"
```

### テナント設定のベストプラクティス

**命名規則**
```
テナント名: [用途]-[プロジェクト名]-[環境]
例: 
  - dev-webapp-sso
  - staging-api-integration
  - prod-enterprise-portal
```

**環境分離**
```
開発: dev-project.onmicrosoft.com
ステージング: stg-project.onmicrosoft.com
本番: prod-project.onmicrosoft.com
```

## 2.2 開発用ユーザーとグループの作成

### テストユーザーの作成計画

SSO実装のテストには、異なる権限レベルのユーザーが必要です。

**推奨するテストユーザー構成**
```
管理者ユーザー (1名):
  - テナント管理
  - アプリケーション設定
  
標準ユーザー (3-5名):
  - 一般的なSSO動作テスト
  - 異なる属性値でのテスト
  
外部ユーザー (1-2名):
  - B2B連携のテスト
  - ゲストアクセスのテスト
```

### Azure Portalでのユーザー作成

**Step 1: 基本ユーザーの作成**
```bash
# Azure Portal での操作
1. Microsoft Entra ID → ユーザー → 新しいユーザー
2. 「ユーザーの作成」を選択
3. 必要情報を入力
```

**テストユーザーの設定例**
```yaml
ユーザー1:
  ユーザー名: alice.developer@dev-sso-integration.onmicrosoft.com
  表示名: Alice Developer
  姓: Developer
  名: Alice
  役職: Software Engineer
  部署: Engineering

ユーザー2:
  ユーザー名: bob.manager@dev-sso-integration.onmicrosoft.com
  表示名: Bob Manager
  姓: Manager
  名: Bob
  役職: Project Manager
  部署: Product
```

**Step 2: PowerShellによる一括作成**
```powershell
# Microsoft.Graph PowerShell モジュールのインストール
Install-Module Microsoft.Graph -Force
Connect-MgGraph -TenantId "your-tenant-id"

# CSV ファイルからユーザーを一括作成
$users = Import-Csv "test-users.csv"
foreach ($user in $users) {
    $passwordProfile = @{
        forceChangePasswordNextSignIn = $true
        password = "TempPassword123!"
    }
    
    New-MgUser -DisplayName $user.DisplayName `
               -UserPrincipalName $user.UserPrincipalName `
               -MailNickname $user.MailNickname `
               -PasswordProfile $passwordProfile `
               -AccountEnabled
}
```

**CSV ファイル例（test-users.csv）**
```csv
DisplayName,UserPrincipalName,MailNickname,JobTitle,Department
Alice Developer,alice.developer@dev-sso-integration.onmicrosoft.com,alice.developer,Software Engineer,Engineering
Bob Manager,bob.manager@dev-sso-integration.onmicrosoft.com,bob.manager,Project Manager,Product
Carol Tester,carol.tester@dev-sso-integration.onmicrosoft.com,carol.tester,QA Engineer,Quality Assurance
```

### セキュリティグループの作成

**Step 1: 基本グループの作成**
```yaml
グループ1:
  名前: "SSO-Developers"
  説明: "SSO実装開発者グループ"
  タイプ: セキュリティ
  メンバーシップ: 割り当て済み
  
グループ2:
  名前: "SSO-Testers"
  説明: "SSOテストユーザーグループ"
  タイプ: セキュリティ
  メンバーシップ: 割り当て済み

グループ3:
  名前: "SSO-External-Users"
  説明: "外部ユーザー向けSSOグループ"
  タイプ: セキュリティ
  メンバーシップ: 割り当て済み
```

**Step 2: Microsoft Graph APIでのグループ作成**
```powershell
# セキュリティグループの作成
$group1 = New-MgGroup -DisplayName "SSO-Developers" `
                      -Description "SSO実装開発者グループ" `
                      -MailEnabled:$false `
                      -SecurityEnabled:$true `
                      -MailNickname "sso-developers"

# メンバーの追加
Add-MgGroupMember -GroupId $group1.Id -DirectoryObjectId $userId1
Add-MgGroupMember -GroupId $group1.Id -DirectoryObjectId $userId2
```

### 外部ユーザー（B2B）の設定

**Step 1: B2B招待の設定**
```bash
# Azure Portal での設定
1. Microsoft Entra ID → 外部ID → 外部コラボレーション設定
2. ゲスト招待の設定: 「管理者とゲスト招待元ロールのユーザー」
3. コラボレーション制限: 「すべてのドメインからの招待を許可」
```

**Step 2: テスト用外部ユーザーの招待**
```powershell
# 外部ユーザーの招待
$invitation = New-MgInvitation -InvitedUserEmailAddress "external.user@gmail.com" `
                               -InviteRedirectUrl "https://portal.azure.com" `
                               -InvitedUserDisplayName "External Test User" `
                               -SendInvitationMessage:$true
```

## 2.3 必要な開発ツールとSDKのセットアップ

### 開発環境のセットアップ

**基本的な開発ツール**
```bash
# Node.js（LTS版）のインストール
# Windows
winget install OpenJS.NodeJS

# macOS
brew install node

# Ubuntu
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# インストール確認
node --version
npm --version
```

**Java開発環境（SAML実装用）**
```bash
# Java 11+ のインストール
# Windows
winget install Eclipse.Temurin.11.JDK

# macOS
brew install openjdk@11

# Ubuntu
sudo apt install openjdk-11-jdk

# インストール確認
java -version
javac -version
```

**Python開発環境（API連携用）**
```bash
# Python 3.8+ のインストール
# Windows
winget install Python.Python.3.11

# macOS
brew install python@3.11

# Ubuntu
sudo apt install python3.11 python3.11-pip

# インストール確認
python3 --version
pip3 --version
```

### Microsoft認証関連のSDK

**1. Microsoft Authentication Library (MSAL)**

```bash
# JavaScript/Node.js版
npm install @azure/msal-browser @azure/msal-node

# Python版
pip install msal

# Java版（Maven依存関係）
# pom.xmlに追加
```

```xml
<dependency>
    <groupId>com.microsoft.azure</groupId>
    <artifactId>msal4j</artifactId>
    <version>1.13.8</version>
</dependency>
```

**2. Microsoft Graph SDK**

```bash
# JavaScript/Node.js版
npm install @azure/microsoft-graph-client

# Python版
pip install msgraph-core msgraph-sdk

# Java版（Maven）
```

```xml
<dependency>
    <groupId>com.microsoft.graph</groupId>
    <artifactId>microsoft-graph</artifactId>
    <version>5.74.0</version>
</dependency>
```

**3. SAML関連ライブラリ**

```bash
# Java - Spring Security SAML
# pom.xmlに追加
```

```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-saml2-service-provider</artifactId>
    <version>6.2.0</version>
</dependency>
```

```bash
# Node.js - Passport SAML
npm install passport passport-saml

# Python - python-saml
pip install python3-saml
```

### IDEとエディターの設定

**Visual Studio Code の推奨拡張機能**
```json
{
  "recommendations": [
    "ms-vscode.azure-account",
    "ms-azuretools.vscode-azureresourcegroups",
    "ms-python.python",
    "vscjava.vscode-java-pack",
    "ms-vscode.vscode-json",
    "redhat.vscode-xml",
    "humao.rest-client"
  ]
}
```

**Azure拡張機能のセットアップ**
```bash
# VS Code での Azure拡張機能インストール
code --install-extension ms-vscode.azure-account
code --install-extension ms-azuretools.vscode-azureresourcegroups

# Azure にサインイン
# VS Code: Ctrl+Shift+P → "Azure: Sign In"
```

### 開発者ツールの設定

**1. Postman の設定**
```json
{
  "collection_name": "Microsoft Entra ID SSO Testing",
  "environment": {
    "tenant_id": "{{tenant_id}}",
    "client_id": "{{client_id}}",
    "base_url": "https://login.microsoftonline.com"
  }
}
```

**2. Git設定**
```bash
# グローバル設定
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# プロジェクトのクローン
git clone https://github.com/your-org/sso-integration-project.git
cd sso-integration-project

# 開発ブランチの作成
git checkout -b feature/sso-implementation
```

**3. 環境変数の設定**
```bash
# .env ファイルの作成
touch .env

# 環境変数の設定（例）
cat << EOF > .env
TENANT_ID=your-tenant-id
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
REDIRECT_URI=http://localhost:3000/callback
NODE_ENV=development
EOF
```

## 2.4 テスト環境の構築とベストプラクティス

### ローカル開発環境の構築

**1. HTTPSローカル開発サーバーの設定**

Microsoft Entra IDはHTTPS必須のため、ローカル開発でもSSL証明書が必要です。

```bash
# mkcert を使用した自己署名証明書の作成
# インストール（macOS）
brew install mkcert
mkcert -install

# インストール（Windows）
winget install FiloSottile.mkcert
mkcert -install

# ローカル証明書の生成
mkcert localhost 127.0.0.1
```

**2. Node.js Express での HTTPS サーバー**
```javascript
// server.js
const express = require('express');
const https = require('https');
const fs = require('fs');

const app = express();

// HTTPS オプション
const httpsOptions = {
  key: fs.readFileSync('./localhost-key.pem'),
  cert: fs.readFileSync('./localhost.pem')
};

// HTTPS サーバーの起動
https.createServer(httpsOptions, app).listen(3000, () => {
  console.log('HTTPS Server running on https://localhost:3000');
});
```

**3. Java Spring Boot での HTTPS 設定**
```yaml
# application.yml
server:
  port: 8443
  ssl:
    enabled: true
    key-store: classpath:localhost.p12
    key-store-password: changeit
    key-store-type: PKCS12
```

### テスト自動化の設定

**1. ユニットテスト環境**
```bash
# Node.js - Jest のセットアップ
npm install --save-dev jest supertest
npm install --save-dev @types/jest  # TypeScript使用時

# テスト設定ファイル
cat << EOF > jest.config.js
module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testMatch: ['**/__tests__/**/*.test.js']
};
EOF
```

**2. 統合テストの設定**
```javascript
// __tests__/auth.test.js
const request = require('supertest');
const app = require('../app');

describe('Authentication Flow', () => {
  test('should redirect to Microsoft login', async () => {
    const response = await request(app)
      .get('/login')
      .expect(302);
    
    expect(response.headers.location).toContain('login.microsoftonline.com');
  });
});
```

**3. E2Eテストの設定（Playwright）**
```bash
# Playwright のインストール
npm install --save-dev @playwright/test
npx playwright install

# テスト設定
cat << EOF > playwright.config.js
module.exports = {
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: 'https://localhost:3000',
    ignoreHTTPSErrors: true
  }
};
EOF
```

```javascript
// e2e/sso-flow.spec.js
const { test, expect } = require('@playwright/test');

test('SSO login flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Login with Microsoft');
  
  // Microsoft ログイン画面の確認
  await expect(page).toHaveURL(/login\.microsoftonline\.com/);
  
  // テストユーザーでログイン
  await page.fill('[name="loginfmt"]', 'alice.developer@dev-sso-integration.onmicrosoft.com');
  await page.click('[type="submit"]');
});
```

### 設定管理のベストプラクティス

**1. 設定ファイルの分離**
```
config/
├── development.json     # 開発環境設定
├── staging.json        # ステージング環境設定
├── production.json     # 本番環境設定
└── default.json        # 共通設定
```

**設定例（development.json）**
```json
{
  "azure": {
    "tenantId": "dev-tenant-id",
    "clientId": "dev-client-id",
    "authority": "https://login.microsoftonline.com/dev-tenant-id",
    "redirectUri": "https://localhost:3000/callback"
  },
  "logging": {
    "level": "debug"
  },
  "session": {
    "secret": "dev-session-secret"
  }
}
```

**2. シークレット管理**
```bash
# Azure Key Vault の作成
az keyvault create \
  --name "dev-sso-keyvault" \
  --resource-group "dev-sso-rg" \
  --location "japaneast"

# シークレットの保存
az keyvault secret set \
  --vault-name "dev-sso-keyvault" \
  --name "ClientSecret" \
  --value "your-client-secret"
```

**3. 環境変数の管理**
```bash
# direnv を使用した環境変数管理
# インストール
brew install direnv  # macOS
sudo apt install direnv  # Ubuntu

# .envrc ファイルの作成
cat << EOF > .envrc
export TENANT_ID="your-tenant-id"
export CLIENT_ID="your-client-id"
export NODE_ENV="development"
EOF

# 許可
direnv allow
```

### ログ設定とモニタリング

**1. 構造化ログの設定**
```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'app.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
```

**2. 認証イベントのログ設定**
```javascript
// 認証成功/失敗のログ記録
app.use('/callback', (req, res, next) => {
  logger.info('Authentication callback received', {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    state: req.query.state
  });
  next();
});
```

**3. Application Insights の設定（オプション）**
```javascript
// Application Insights の設定
const appInsights = require('applicationinsights');
appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY);
appInsights.start();

// カスタムイベントの送信
appInsights.defaultClient.trackEvent({
  name: 'SSO_Login_Success',
  properties: { userId: user.id }
});
```

## まとめ

本章では、Microsoft Entra IDとのSSO連携を実装するための包括的な開発環境を構築しました。

**構築した環境の要素**
1. **Microsoft Entra IDテナント**: 開発用テナントの作成と基本設定
2. **テストユーザーとグループ**: さまざまなシナリオをテストするためのユーザー構成
3. **開発ツールとSDK**: 各種プログラミング言語での実装に必要なツール
4. **テスト環境**: 自動テストとローカルHTTPS環境

**次章以降での活用**
- 第3章では、この環境を使ってSAML 2.0実装を行います
- 第4章では、OpenID Connect実装を実装します  
- 第5章では、OAuth 2.0とMicrosoft Graph API連携を実装します

適切に構築された開発環境は、効率的なSSO実装の基盤となります。次章では、実際のSAML 2.0実装に進みましょう。