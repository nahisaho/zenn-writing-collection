---
title: "付録: Microsoft Forms API リファレンス"
---

# Microsoft Graph API Forms関連エンドポイント

## 概要

Microsoft Formsには専用のAPIが限定的にしか提供されていないため、現在利用可能なエンドポイントと代替アプローチについて解説します。

## 現在のAPI制限

Microsoft Formsの直接的なAPI操作は以下の制限があります：

- **読み取り専用**: フォームの作成・編集はAPIで直接実行できません
- **限定的なアクセス**: 一部のメタデータと回答データのみアクセス可能
- **認証要件**: 適切なアクセス許可とスコープが必要

## 利用可能なGraph APIエンドポイント

### 1. フォーム情報の取得

```http
GET /me/drive/items/{item-id}
```

**説明**: OneDrive内のフォームファイルの基本情報を取得

**必要なアクセス許可**:
- `Files.Read`
- `Files.Read.All`

**レスポンス例**:
```json
{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#drives('drive-id')/items/$entity",
  "id": "item-id",
  "name": "フォーム名.xlsx",
  "size": 12345,
  "createdDateTime": "2024-01-01T00:00:00Z",
  "lastModifiedDateTime": "2024-01-02T00:00:00Z"
}
```

### 2. Forms活動の取得 (限定的)

```http
GET /reports/getOffice365ActivationsUserDetail
```

**説明**: Office 365の利用状況レポートからForms利用情報を取得

**必要なアクセス許可**:
- `Reports.Read.All`

## Power Automate経由での操作

### 利用可能なForms コネクタ

#### トリガー
- **新しい応答が送信されたとき**
  ```
  トリガー名: When a new response is submitted
  説明: フォームに新しい回答が送信されたときに自動実行
  ```

#### アクション
- **応答の詳細を取得**
  ```
  アクション名: Get response details
  説明: 特定の回答の詳細情報を取得
  入力: Form ID, Response ID
  出力: 回答データ、タイムスタンプ、回答者情報
  ```

- **応答一覧の取得**
  ```
  アクション名: List responses
  説明: フォームのすべての回答一覧を取得
  入力: Form ID
  出力: Response IDのリスト
  ```

### Power Automate APIエンドポイント

Microsoft FormsのPower Automateコネクタで使用される内部APIエンドポイント：

```http
POST https://forms.office.com/formapi/api/{tenant-id}/users/{user-id}/forms/{form-id}/responses
```

**注意**: これらのエンドポイントは内部使用のみであり、直接呼び出しはサポートされていません。

## SharePoint Lists統合

### SharePoint REST API経由でのアクセス

Formsの回答をSharePointリストに保存している場合：

```http
GET https://{site-url}/_api/web/lists/getbytitle('{list-name}')/items
```

**必要なアクセス許可**:
- `Sites.Read.All` または `Sites.ReadWrite.All`

**フィルタリング例**:
```http
GET https://{site-url}/_api/web/lists/getbytitle('フォーム回答')/items?$filter=Created ge datetime'2024-01-01T00:00:00Z'
```

## Microsoft Teams統合

### Teams Graph API経由

TeamsアプリとしてのFormsアクセス：

```http
GET /teams/{team-id}/channels/{channel-id}/tabs
```

Formsタブの識別：
```json
{
  "displayName": "フォーム名",
  "teamsApp": {
    "id": "81fef3a6-72aa-4648-a763-de824aeafb7d"
  },
  "configuration": {
    "entityId": "form-id",
    "contentUrl": "https://forms.office.com/..."
  }
}
```

## データエクスポートとバックアップ

### Excel Online API

Forms回答のExcelファイルへのアクセス：

```http
GET /me/drive/items/{workbook-id}/workbook/worksheets/{worksheet-id}/usedRange
```

**レスポンス形式**:
```json
{
  "values": [
    ["タイムスタンプ", "質問1", "質問2", "質問3"],
    ["2024-01-01 10:00:00", "回答1", "回答2", "回答3"]
  ]
}
```

## 認証とアクセス許可

### 必要なMicrosoft Entra IDアプリ権限

**アプリケーション権限**:
```
Files.Read.All
Sites.Read.All
User.Read.All
Reports.Read.All
```

**委任された権限**:
```
Files.Read
Sites.Read
User.Read
offline_access
```

### 認証フロー例

```javascript
const authProvider = {
  getAccessToken: async () => {
    const response = await fetch('https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': '{client-id}',
        'client_secret': '{client-secret}',
        'scope': 'https://graph.microsoft.com/.default'
      })
    });
    
    const data = await response.json();
    return data.access_token;
  }
};
```

## 制限事項と代替案

### 現在の制限事項

1. **フォーム作成API**: 利用不可
2. **質問編集API**: 利用不可
3. **回答データの直接取得**: 限定的
4. **リアルタイム通知**: Power Automate経由のみ

### 推奨代替アプローチ

1. **Power Automateコネクタの使用**
   - ノーコード/ローコードソリューション
   - 豊富なトリガーとアクション
   - 他のMicrosoft 365サービスとの統合

2. **SharePoint Lists統合**
   - フル機能のREST API
   - カスタムフィールドとビュー
   - Power Platformとの深い統合

3. **Microsoft Lists**
   - フォームライクなUI
   - 完全なAPI サポート
   - カスタマイズ可能

## パフォーマンス考慮事項

### API制限

- **Graph API**: 毎秒10,000リクエスト（テナントあたり）
- **SharePoint REST**: 毎分600リクエスト（アプリあたり）
- **Power Automate**: プランによって異なる実行制限

### ベストプラクティス

1. **バッチ処理の実装**
```http
POST https://graph.microsoft.com/v1.0/$batch
Content-Type: application/json

{
  "requests": [
    {
      "id": "1",
      "method": "GET",
      "url": "/me/drive/items/{item-id1}"
    },
    {
      "id": "2", 
      "method": "GET",
      "url": "/me/drive/items/{item-id2}"
    }
  ]
}
```

2. **キャッシュ戦略**
   - 静的データのローカルキャッシュ
   - 適切なTTL設定
   - ETagを使用した条件付きリクエスト

3. **エラーハンドリング**
   - 指数バックオフ実装
   - 適切なログ記録
   - フォールバック機構

## まとめ

Microsoft Forms APIは現在制限的ですが、Power Automateや関連サービスとの統合により、実用的な自動化ソリューションを構築できます。今後のAPI拡張に注目しながら、現在利用可能な方法を最大限活用することが推奨されます。