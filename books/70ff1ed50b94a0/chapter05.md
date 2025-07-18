---
title: "第5章：OAuth 2.0 と Microsoft Graph API の活用"
---

# 第5章：OAuth 2.0 と Microsoft Graph API の活用

本章では、OAuth 2.0プロトコルの詳細な理解とMicrosoft Graph APIの実践的な活用方法について解説します。認証だけでなく、実際のビジネスロジックに必要なデータやサービスにアクセスするための仕組みを学びます。

> 💡 **OAuth 2.0とGraph API実装サンプル**: 本章のコード例と多言語実装が利用できます。  
> 📁 **実装例**: Chapter 5で紹介したJavaScript、.NET、Java、PHP、Pythonの実装  
> 🔧 **参考リポジトリ**: [entra-id-sso-samples](https://github.com/nahisaho/entra-id-sso-samples) - 全ての実装パターンとサンプル

## 5.1 OAuth 2.0 による API アクセス権限の管理

### OAuth 2.0 の基本概念と重要性

OAuth 2.0は、現代のWebアプリケーションにおいて不可欠な認可フレームワークです。このプロトコルは、ユーザーの認証情報を第三者アプリケーションに直接渡すことなく、限定的なリソースアクセスを可能にする仕組みを提供します。

**認証と認可の違いの理解**

OAuth 2.0を正しく理解するために、まず認証（Authentication）と認可（Authorization）の違いを明確にする必要があります。認証は「誰であるか」を確認するプロセスであり、認可は「何ができるか」を決定するプロセスです。OAuth 2.0は主に認可に焦点を当てており、OpenID Connectが認証の役割を担います。

**OAuth 2.0 エコシステムの構成要素**

OAuth 2.0のエコシステムは4つの主要な役割で構成されています。まず、リソース所有者（Resource Owner）は、通常エンドユーザーを指し、保護されたリソースへのアクセス権を与える権限を持ちます。次に、クライアント（Client）は、ユーザーに代わってリソースにアクセスしようとするアプリケーションです。

認可サーバー（Authorization Server）は、リソース所有者を認証し、認可を得た後にクライアントにアクセストークンを発行します。Microsoft Entra IDがこの役割を果たします。最後に、リソースサーバー（Resource Server）は、保護されたリソースをホストし、アクセストークンを使用してリクエストを受け入れて応答します。Microsoft Graph APIがこの役割に該当します。

### OAuth 2.0 認可フローの実践的理解

**Authorization Codeフローの詳細**

Microsoft Entra IDとの連携においてもっとも一般的に使用されるのは、Authorization Codeフローです。このフローは、セキュリティを重視したWebアプリケーションに適しており、複数の段階を経てアクセストークンを取得します。

まず、ユーザーがアプリケーションの特定の機能にアクセスしようとすると、アプリケーションはMicrosoft Entra IDの認可エンドポイントにリダイレクトします。この際、アプリケーションID、リダイレクトURI、要求するスコープ、PKCE（Proof Key for Code Exchange）のコードチャレンジなどのパラメータが含まれます。

ユーザーがMicrosoft Entra IDで認証を完了し、要求された権限に同意すると、認可コードがアプリケーションのリダイレクトURIに返されます。この認可コードは一時的なものであり、通常10分程度で期限切れになります。

アプリケーションは、この認可コードを使用してトークンエンドポイントにアクセストークンを要求します。この際、クライアント認証情報とPKCEのコードベリファイアも含めて送信します。成功すると、アクセストークン、リフレッシュトークン、IDトークン（OpenID Connectを使用している場合）が返されます。

**基本的な認可URL生成**

```javascript
// 認可URL生成の基本パターン
const authUrl = new URL('https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/authorize');
authUrl.searchParams.append('client_id', 'your-client-id');
authUrl.searchParams.append('response_type', 'code');
authUrl.searchParams.append('redirect_uri', 'https://your-app.com/callback');
authUrl.searchParams.append('scope', 'openid profile email https://graph.microsoft.com/User.Read');
authUrl.searchParams.append('state', generateRandomState());

// ユーザーをリダイレクト
window.location.href = authUrl.toString();
```

**トークン交換の基本実装**

```javascript
// 認可コードをアクセストークンに交換
async function exchangeCodeForToken(code, state) {
    const response = await fetch('https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: 'your-client-id',
            client_secret: 'your-client-secret', // 機密クライアントの場合のみ
            code: code,
            redirect_uri: 'https://your-app.com/callback'
        })
    });
    
    return await response.json();
}
```

### スコープによる細やかなアクセス制御

**スコープの階層構造とベストプラクティス**

OAuth 2.0におけるスコープは、アプリケーションが要求するリソースへのアクセス範囲を定義します。Microsoft Graph APIでは、詳細に分類されたスコープが提供されており、最小権限の原則に従って必要最小限のスコープのみを要求することが重要です。

基本的なスコープには、OpenID Connect認証のための「openid」、ユーザーの基本プロファイル情報のための「profile」、メールアドレスのための「email」があります。これらは、ほとんどのアプリケーションで必要となる基本的な情報です。

Microsoft Graph固有のスコープは、より具体的なリソースアクセスを制御します。例えば、「User.Read」はユーザー自身のプロファイル情報の読み取りのみを許可し、「User.ReadWrite」は読み書き両方を許可します。メール機能では、「Mail.Read」で受信メールの読み取り、「Mail.Send」で送信が可能になります。

**段階的同意とユーザーエクスペリエンス**

現代のアプリケーション設計では、ユーザーが初回アクセス時にすべての権限を一度に要求するのではなく、機能を使用する際に段階的に権限を要求する「段階的同意」のアプローチが推奨されています。これにより、ユーザーは必要な権限のみを付与でき、より安心してアプリケーションを使用できます。

例えば、最初はユーザーの基本プロファイル情報のみを要求し、メール機能を使用する際に初めてメール関連のスコープを要求します。この方法により、ユーザーの信頼を段階的に構築し、より良いユーザーエクスペリエンスを提供できます。

**スコープの戦略的管理**

実際のアプリケーションでは、スコープを機能ごとに分類し、段階的に要求する戦略が効果的です。基本的なスコープ（openid、profile、email）は初回ログイン時に取得し、その他の機能固有のスコープは必要に応じて後から要求します。

メール機能では読み取り専用の「Mail.Read」と送信機能の「Mail.Send」を分離し、カレンダー機能では閲覧用の「Calendars.Read」と編集用の「Calendars.ReadWrite」を区別します。これにより、ユーザーは必要な権限のみを付与でき、セキュリティリスクを最小限に抑えることができます。

**管理者同意とユーザー同意の使い分け**

Microsoft Graph APIの一部のスコープは、管理者同意が必要です。これらは主に組織全体に影響を与える可能性があるディレクトリ関連の操作に適用されます。例えば、「Directory.Read.All」や「User.Read.All」などは、組織内のすべてのユーザー情報にアクセスできるため、管理者による事前の承認が必要です。

一方、ユーザー個人のデータにのみアクセスするスコープ（「User.Read」、「Mail.Read」など）は、ユーザー自身の同意のみで使用できます。この区別を理解し、適切にスコープを選択することで、導入時の障壁を最小限に抑えることができます。

### 動的同意によるユーザーエクスペリエンスの向上

**機能ベースの権限要求**

現代的なアプリケーション設計では、ユーザーが特定の機能を初めて使用する際に、その機能に必要な権限を動的に要求する「Just-in-Time」アプローチが推奨されています。これにより、ユーザーは権限要求の理由を明確に理解でき、より安心して同意を与えることができます。

例えば、メール送信機能を初めて使用する際に「この機能を使用するために、メール送信の権限が必要です」というメッセージと共に権限要求を行います。この方法により、ユーザーは各権限の目的を理解し、納得して同意を与えることができます。

**段階的信頼構築**

段階的同意は、アプリケーションとユーザーの間の信頼関係を徐々に構築するプロセスでもあります。最初は最小限の権限でサービスを開始し、ユーザーがアプリケーションの価値を実感した後に、より高度な機能のための追加権限を要求します。

この手法により、ユーザーはアプリケーションの信頼性を確認してから重要な権限を付与でき、結果的により多くのユーザーが高度な機能を利用するようになります。

## 5.2 Microsoft Graph API の概要と活用方法

### Microsoft Graph API の全体像

Microsoft Graph APIは、Microsoft 365エコシステムの統一されたAPIエンドポイントとして、多様なサービスとデータへのアクセスを提供します。単一のREST APIを通じて、Microsoft Entra ID、Exchange Online、SharePoint、Teams、OneDrive、Plannerなどの主要サービスに一貫したアクセス方法を提供します。

### 主要な機能領域

Microsoft Graph APIは以下の主要領域をカバーしています：

**ユーザー管理**: 個人および組織のユーザー情報、プロファイル、設定の管理が可能です。現在のユーザー情報の取得から、組織全体のユーザー一覧まで幅広い操作をサポートします。

**メールとコミュニケーション**: Exchange Onlineとの統合により、メールの読み取り、送信、フォルダ管理などの機能を提供します。また、Outlookのカレンダー機能にもアクセスできます。

**ファイルとドキュメント**: OneDriveとSharePointのファイルシステムへのアクセスを提供し、ファイルのアップロード、ダウンロード、共有などの操作が可能です。

**チームコラボレーション**: Microsoft Teamsのチャット、チャネル、会議などの機能にアクセスし、現代的なワークプレイスコラボレーションを支援します。

### Graph SDK の活用

Microsoft Graph SDKは、各プログラミング言語に対応したライブラリを提供し、RAW HTTP APIよりも簡潔で安全なコードでの実装を可能にします。SDKは認証、リトライロジック、エラーハンドリングなどの共通機能を自動化し、開発者の負担を軽減します。

**基本的なGraph API呼び出し**

```javascript
// ユーザー情報を取得する最低限のコード
async function getUserProfile(accessToken) {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (response.ok) {
        return await response.json();
    }
    throw new Error(`API Error: ${response.status}`);
}

// メール送信の基本実装
async function sendEmail(accessToken, emailData) {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: {
                subject: emailData.subject,
                body: { contentType: 'Text', content: emailData.body },
                toRecipients: [{ emailAddress: { address: emailData.to } }]
            }
        })
    });
    
    return response.status === 202; // 送信成功
}
```

## 5.3 アクセス許可の種類と実装パターン

### 委任されたアクセス許可とアプリケーションアクセス許可

Microsoft Graph APIでは、アクセス許可の種類によって異なる実装パターンが必要です。委任されたアクセス許可は、ユーザーに代わってアクセスし、ユーザーがアクセスできるリソースのみに制限されます。一方、アプリケーションアクセス許可は、特定のユーザーなしでアプリケーション自体がリソースにアクセスします。

**委任されたアクセス許可の特徴**: ユーザーの同意が必要で、ユーザーの権限内でのみ動作します。対話的なユーザーが存在するWebアプリケーションに適しています。

**アプリケーションアクセス許可の特徴**: 管理者の同意が必要で、より広範囲のアクセスが可能です。バックグラウンドサービスやデーモンアプリケーションに適しています。

### セキュリティ設計の考慮事項

アクセス許可の実装では、セキュリティ原則を厳密に適用する必要があります。最小権限の原則に従い、アプリケーションが実際に必要とする最小限のスコープのみを要求します。また、権限の昇格を防ぐため、ユーザーのロールと権限を常に検証し、不正なアクセスを防止します。

## 5.4 トークン管理とセキュリティ

### アクセストークンとリフレッシュトークン

OAuth 2.0におけるトークンの適切な管理は、セキュリティと利便性の両立において重要です。アクセストークンは比較的短い有効期限（通常1時間）を持ち、リフレッシュトークンはより長期間有効です。

アプリケーションでは、アクセストークンの有効期限を監視し、期限切れ前に自動的にリフレッシュする仕組みを実装する必要があります。また、トークンは安全な場所に保存し、HTTPS通信でのみ送信することが重要です。

**基本的なトークン管理パターン**

```javascript
class TokenManager {
    constructor() {
        this.tokens = null;
    }
    
    // トークンの保存
    storeTokens(tokenResponse) {
        this.tokens = {
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            expiresAt: Date.now() + (tokenResponse.expires_in * 1000)
        };
    }
    
    // 有効なアクセストークンを取得
    async getValidAccessToken() {
        if (!this.tokens) {
            throw new Error('No tokens available');
        }
        
        // 5分前にリフレッシュ
        if (this.tokens.expiresAt - Date.now() < 300000) {
            await this.refreshAccessToken();
        }
        
        return this.tokens.accessToken;
    }
    
    // トークンのリフレッシュ
    async refreshAccessToken() {
        const response = await fetch('https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: 'your-client-id',
                client_secret: 'your-client-secret',
                refresh_token: this.tokens.refreshToken
            })
        });
        
        const newTokens = await response.json();
        this.storeTokens(newTokens);
    }
}
```

### トークンのセキュアな保存

Webアプリケーションでは、トークンをHTTPOnlyクッキーまたはサーバーサイドセッションに保存することが推奨されます。SPAやモバイルアプリケーションでは、セキュアストレージまたはキーチェーンを使用してトークンを保護します。

## 5.5 マルチ言語による実装パターン

### 共通実装パターン

各プログラミング言語での実装において、以下の共通パターンが重要です：

**認証フローの実装**: Authorization Codeフローの実装、PKCE拡張の使用、状態管理の実装が必要です。

**トークン管理**: アクセストークンとリフレッシュトークンの適切な保存と更新ロジックの実装が必要です。

**エラーハンドリング**: API呼び出しの失敗、トークンの有効期限切れ、レート制限への対応が必要です。

**セキュリティ**: クライアントシークレットの安全な管理、HTTPS通信の強制、CSRFトークンの使用が重要です。

### 各言語固有の考慮事項

**.NET**: Microsoft.Graph NuGetパッケージとMicrosoft.Graph.Authパッケージを使用することで、統合された開発体験を得られます。Dependency Injectionパターンとの組み合わせにより、効率的な実装が可能です。

```csharp
// .NET での基本実装
var app = ConfidentialClientApplicationBuilder
    .Create("client-id")
    .WithClientSecret("client-secret")
    .WithAuthority("https://login.microsoftonline.com/tenant-id")
    .Build();

var result = await app.AcquireTokenForClient(new[] { "https://graph.microsoft.com/.default" })
    .ExecuteAsync();

var graphServiceClient = new GraphServiceClient(
    new DelegateAuthenticationProvider(
        async (requestMessage) => {
            requestMessage.Headers.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", result.AccessToken);
        }));

var user = await graphServiceClient.Me.Request().GetAsync();
```

**Java**: Microsoft Graph SDK for Javaまたは、Spring SecurityのOAuth2サポートを活用できます。Spring Boot Starterを使用することで、設定の簡素化が図れます。

```java
// Java での基本実装
@RestController
public class GraphController {
    
    @GetMapping("/me")
    public User getCurrentUser(OAuth2AuthenticationToken token) {
        OAuth2AccessToken accessToken = token.getPrincipal().getAttribute("access_token");
        
        GraphServiceClient graphClient = GraphServiceClient.builder()
            .authenticationProvider(request -> {
                request.addHeader("Authorization", "Bearer " + accessToken.getTokenValue());
            })
            .buildClient();
            
        return graphClient.me().buildRequest().get();
    }
}
```

**Node.js**: @azure/msal-nodeパッケージとMicrosoft Graph JavaScript SDKの組み合わせが推奨されます。非同期処理とPromiseベースのAPIにより、モダンなJavaScript開発パターンに適合します。

```javascript
// Node.js での基本実装
const { ConfidentialClientApplication } = require('@azure/msal-node');

const clientApp = new ConfidentialClientApplication({
    auth: {
        clientId: 'client-id',
        clientSecret: 'client-secret',
        authority: 'https://login.microsoftonline.com/tenant-id'
    }
});

app.get('/me', async (req, res) => {
    const tokenRequest = {
        scopes: ['https://graph.microsoft.com/User.Read'],
        account: req.session.account
    };
    
    const response = await clientApp.acquireTokenSilent(tokenRequest);
    const userProfile = await getUserProfile(response.accessToken);
    res.json(userProfile);
});
```

**PHP**: LeagueのOAuth2クライアントライブラリと組み合わせてMicrosoft Graph APIを利用します。Composerを使用した依存関係管理により、効率的な開発が可能です。

```php
// PHP での基本実装
use League\OAuth2\Client\Provider\GenericProvider;

$provider = new GenericProvider([
    'clientId' => 'client-id',
    'clientSecret' => 'client-secret',
    'redirectUri' => 'https://your-app.com/callback',
    'urlAuthorize' => 'https://login.microsoftonline.com/tenant-id/oauth2/v2.0/authorize',
    'urlAccessToken' => 'https://login.microsoftonline.com/tenant-id/oauth2/v2.0/token',
    'urlResourceOwnerDetails' => 'https://graph.microsoft.com/v1.0/me'
]);

$accessToken = $provider->getAccessToken('authorization_code', [
    'code' => $_GET['code']
]);

// Graph API 呼び出し
$request = $provider->getAuthenticatedRequest(
    'GET',
    'https://graph.microsoft.com/v1.0/me',
    $accessToken
);

$response = $provider->getParsedResponse($request);
```

**Python**: MSAL PythonライブラリとFlask-OAuthExtensionを使用して実装できます。Djangoフレームワークとの統合も可能で、型ヒンティングによる開発支援を活用できます。

```python
# Python での基本実装
import msal
import requests

app = msal.ConfidentialClientApplication(
    client_id="client-id",
    client_credential="client-secret",
    authority="https://login.microsoftonline.com/tenant-id"
)

@app.route('/me')
def get_user():
    result = app.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])
    
    if "access_token" in result:
        response = requests.get(
            "https://graph.microsoft.com/v1.0/me",
            headers={'Authorization': f'Bearer {result["access_token"]}'}
        )
        return response.json()
    
    return {"error": "Failed to acquire token"}
```

### パフォーマンスとスケーラビリティ

大規模なアプリケーションでは、トークンキャッシュ、接続プーリング、バッチリクエストなどの最適化技術を適用することが重要です。また、Microsoft Graph APIのレート制限を考慮し、適切なリトライロジックとバックオフ戦略を実装する必要があります。

## まとめ

OAuth 2.0とMicrosoft Graph APIの組み合わせは、現代的なクラウドアプリケーション開発において強力な基盤を提供します。適切なスコープ管理、セキュアなトークンハンドリング、そして段階的同意の実装により、セキュリティとユーザビリティを両立できます。

### 次章への準備

次章では、ユーザープロビジョニングと同期について学習します。本章で学んだOAuth 2.0とGraph APIの知識を基盤として、SCIMプロトコルを使用した自動ユーザー管理システムの構築方法を習得していきます。