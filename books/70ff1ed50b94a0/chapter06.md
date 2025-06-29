---
title: "第6章：ユーザープロビジョニングと同期"
---

# 第6章：ユーザープロビジョニングと同期

本章では、Microsoft Entra IDとアプリケーション間でのユーザープロビジョニングと同期について詳しく解説します。SCIMプロトコルを使用した自動プロビジョニングから、Just-In-Time（JIT）プロビジョニング、ユーザーライフサイクル管理まで、効率的なユーザー管理システムの構築方法を学びます。

## 6.1 SCIM プロトコルによる自動プロビジョニング

### SCIM（System for Cross-domain Identity Management）の概要

SCIMは、システム間でのユーザーとグループ情報の自動プロビジョニングを標準化するためのRESTful APIプロトコルです。Microsoft Entra IDは、SCIM 2.0標準をサポートしており、アプリケーション側にSCIMエンドポイントを実装することで、自動的なユーザー管理を実現できます。

```mermaid
sequenceDiagram
    participant Admin as 管理者
    participant EntraID as Microsoft Entra ID
    participant SCIM as SCIM エンドポイント
    participant App as アプリケーション
    
    Admin->>EntraID: 1. ユーザー作成/更新/削除
    EntraID->>SCIM: 2. SCIM API コール
    SCIM->>App: 3. ユーザー操作実行
    App->>SCIM: 4. 操作結果返却
    SCIM->>EntraID: 5. 同期結果返却
    EntraID->>Admin: 6. 結果通知
```

### SCIM 2.0 の主要概念

**1. リソースタイプ**
```yaml
User:
  - ユーザーアカウント情報
  - 基本属性（名前、メール、ユーザー名）
  - 拡張属性（部署、役職、マネージャー）

Group:
  - グループ情報
  - メンバーシップ管理
  - ネストされたグループ

Schema:
  - リソースの構造定義
  - 属性の型と制約
  - 拡張スキーマ
```

**2. SCIM エンドポイント**
```http
# ユーザー操作
GET    /scim/v2/Users           # ユーザー一覧取得
POST   /scim/v2/Users           # ユーザー作成
GET    /scim/v2/Users/{id}      # 特定ユーザー取得
PUT    /scim/v2/Users/{id}      # ユーザー更新
PATCH  /scim/v2/Users/{id}      # ユーザー部分更新
DELETE /scim/v2/Users/{id}      # ユーザー削除

# グループ操作
GET    /scim/v2/Groups          # グループ一覧取得
POST   /scim/v2/Groups          # グループ作成
GET    /scim/v2/Groups/{id}     # 特定グループ取得
PUT    /scim/v2/Groups/{id}     # グループ更新
PATCH  /scim/v2/Groups/{id}     # グループ部分更新
DELETE /scim/v2/Groups/{id}     # グループ削除

# スキーマとサービス情報
GET    /scim/v2/Schemas         # スキーマ情報取得
GET    /scim/v2/ServiceProviderConfig  # サービス設定取得
GET    /scim/v2/ResourceTypes   # リソースタイプ取得
```

**3. SCIM ユーザーリソースの例**
```json
{
  "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
  "id": "2819c223-7f76-453a-919d-413861904646",
  "externalId": "alice.developer@contoso.com",
  "userName": "alice.developer",
  "name": {
    "formatted": "Alice Developer",
    "givenName": "Alice",
    "familyName": "Developer"
  },
  "emails": [
    {
      "value": "alice.developer@contoso.com",
      "type": "work",
      "primary": true
    }
  ],
  "active": true,
  "groups": [
    {
      "value": "developers-group-id",
      "display": "Developers"
    }
  ],
  "meta": {
    "resourceType": "User",
    "created": "2024-01-15T09:30:00Z",
    "lastModified": "2024-01-15T09:30:00Z",
    "version": "W/\"3694e05e9dff590\""
  }
}
```

### Microsoft Entra ID での SCIM 設定

**Step 1: エンタープライズアプリケーションでのプロビジョニング設定**

```bash
# Azure Portal での設定手順
1. Microsoft Entra admin center にサインイン
2. エンタープライズアプリケーション → 対象アプリを選択
3. プロビジョニング → プロビジョニングの開始
4. プロビジョニングモード: 自動
5. 管理者資格情報:
   - テナント URL: https://myapp.example.com/scim/v2
   - シークレットトークン: [SCIM認証トークン]
6. 接続のテスト → 設定の保存
```

**Step 2: 属性マッピングの設定**

```yaml
# 標準的な属性マッピング
Entra ID属性 → SCIM属性:
  userPrincipalName → userName
  mail → emails[type eq "work"].value
  displayName → displayName
  givenName → name.givenName
  surname → name.familyName
  jobTitle → title
  department → department
  manager → manager
  accountEnabled → active

# カスタム属性マッピング
extensionAttribute1 → urn:ietf:params:scim:schemas:extension:enterprise:2.0:User:employeeNumber
extensionAttribute2 → urn:ietf:params:scim:schemas:extension:enterprise:2.0:User:division
```

**Step 3: スコープフィルターの設定**

```json
{
  "targetAttributeName": "department",
  "operator": "EQUALS",
  "values": ["Engineering", "Product", "Sales"]
}
```

### SCIM プロビジョニングのライフサイクル

```mermaid
graph TB
    subgraph EntraID["Microsoft Entra ID"]
        A[ユーザー作成]
        B[ユーザー更新]
        C[ユーザー無効化]
        D[ユーザー削除]
    end
    
    subgraph SCIMEndpoint["SCIM エンドポイント"]
        E["POST /Users"]
        F["PUT・PATCH /Users/id"]
        G["PATCH /Users/id - active: false"]
        H["DELETE /Users/id"]
    end
    
    subgraph Application["アプリケーション"]
        I[アカウント作成]
        J[属性更新]
        K[アカウント無効化]
        L[アカウント削除]
    end
    
    A --> E
    E --> I
    B --> F
    F --> J
    C --> G
    G --> K
    D --> H
    H --> L
```

## 6.2 Just-In-Time (JIT) プロビジョニングの実装

### JIT プロビジョニングの概要

Just-In-Time（JIT）プロビジョニングは、ユーザーが初回ログイン時に、認証トークンに含まれる情報を基にアプリケーション内でユーザーアカウントを自動作成する手法です。

### JIT プロビジョニングの利点と制限

**利点**
- リアルタイムでのユーザー作成
- SCIM エンドポイントの実装が不要
- シンプルな実装で開始可能

**制限**
- 初回ログイン時のみ動作
- バックグラウンドでの一括操作ができない
- ユーザー削除の自動化が困難

### SAML での JIT プロビジョニング実装

```java
// Spring Security SAML での JIT プロビジョニング
@Component
public class JitProvisioningUserDetailsService implements SAMLUserDetailsService {
    
    @Autowired
    private UserService userService;
    
    @Override
    public Object loadUserBySAML(SAMLCredential credential) throws UsernameNotFoundException {
        String nameId = credential.getNameID().getValue();
        
        // 既存ユーザーの確認
        User existingUser = userService.findByExternalId(nameId);
        
        if (existingUser == null) {
            // JIT プロビジョニング実行
            existingUser = createUserFromSAMLCredential(credential);
        } else {
            // 既存ユーザーの属性更新
            updateUserFromSAMLCredential(existingUser, credential);
        }
        
        return new CustomUserPrincipal(existingUser);
    }
    
    private User createUserFromSAMLCredential(SAMLCredential credential) {
        User newUser = new User();
        
        // 基本属性の設定
        newUser.setExternalId(credential.getNameID().getValue());
        newUser.setEmail(getAttributeValue(credential, "email"));
        newUser.setFirstName(getAttributeValue(credential, "firstName"));
        newUser.setLastName(getAttributeValue(credential, "lastName"));
        newUser.setDisplayName(getAttributeValue(credential, "displayName"));
        
        // 組織属性の設定
        newUser.setDepartment(getAttributeValue(credential, "department"));
        newUser.setJobTitle(getAttributeValue(credential, "jobTitle"));
        
        // デフォルトロールの割り当て
        assignDefaultRoles(newUser);
        
        // ユーザー作成
        return userService.createUser(newUser);
    }
    
    private void updateUserFromSAMLCredential(User user, SAMLCredential credential) {
        // 属性の更新（JIT 同期）
        user.setEmail(getAttributeValue(credential, "email"));
        user.setDisplayName(getAttributeValue(credential, "displayName"));
        user.setDepartment(getAttributeValue(credential, "department"));
        user.setJobTitle(getAttributeValue(credential, "jobTitle"));
        
        userService.updateUser(user);
    }
    
    private String getAttributeValue(SAMLCredential credential, String attributeName) {
        Attribute attribute = credential.getAttribute(attributeName);
        if (attribute != null && attribute.getAttributeValues().size() > 0) {
            return attribute.getAttributeValues().get(0).getDOM().getTextContent();
        }
        return null;
    }
    
    private void assignDefaultRoles(User user) {
        // 部署に基づくデフォルトロールの割り当て
        String department = user.getDepartment();
        
        if ("Engineering".equals(department)) {
            user.addRole("ROLE_DEVELOPER");
        } else if ("Sales".equals(department)) {
            user.addRole("ROLE_SALES");
        } else {
            user.addRole("ROLE_USER");
        }
    }
}
```

### OpenID Connect での JIT プロビジョニング実装

```javascript
// Node.js Express での JIT プロビジョニング
class JitProvisioningService {
    constructor(userRepository, roleService) {
        this.userRepository = userRepository;
        this.roleService = roleService;
    }
    
    async processUser(idToken, accessToken) {
        const claims = this.extractClaims(idToken);
        const externalId = claims.sub;
        
        let user = await this.userRepository.findByExternalId(externalId);
        
        if (!user) {
            // JIT プロビジョニング実行
            user = await this.createUser(claims, accessToken);
        } else {
            // 既存ユーザー更新
            user = await this.updateUser(user, claims, accessToken);
        }
        
        return user;
    }
    
    async createUser(claims, accessToken) {
        // Graph API からの追加情報取得
        const graphUserInfo = await this.getGraphUserInfo(accessToken);
        
        const newUser = {
            externalId: claims.sub,
            email: claims.email,
            name: claims.name,
            givenName: claims.given_name,
            familyName: claims.family_name,
            tenantId: claims.tid,
            
            // Graph API からの拡張情報
            department: graphUserInfo.department,
            jobTitle: graphUserInfo.jobTitle,
            manager: graphUserInfo.manager,
            officeLocation: graphUserInfo.officeLocation,
            
            // JIT 作成時のタイムスタンプ
            createdAt: new Date(),
            lastLoginAt: new Date()
        };
        
        // デフォルトロールの割り当て
        newUser.roles = this.assignDefaultRoles(newUser);
        
        const createdUser = await this.userRepository.create(newUser);
        
        // JIT プロビジョニングイベントのログ
        await this.logProvisioningEvent('USER_CREATED', createdUser);
        
        return createdUser;
    }
    
    async updateUser(user, claims, accessToken) {
        const updateData = {
            email: claims.email,
            name: claims.name,
            lastLoginAt: new Date()
        };
        
        // 属性の変更検出
        const hasChanges = this.detectChanges(user, updateData);
        
        if (hasChanges) {
            const updatedUser = await this.userRepository.update(user.id, updateData);
            await this.logProvisioningEvent('USER_UPDATED', updatedUser);
            return updatedUser;
        }
        
        return user;
    }
    
    async getGraphUserInfo(accessToken) {
        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('Failed to get additional user info from Graph API:', error);
        }
        
        return {};
    }
    
    assignDefaultRoles(user) {
        const roles = ['user']; // デフォルトロール
        
        // 部署ベースのロール割り当て
        if (user.department) {
            const deptRoleMap = {
                'Engineering': ['developer'],
                'Product': ['product_manager'],
                'Sales': ['sales_representative'],
                'HR': ['hr_specialist']
            };
            
            const deptRoles = deptRoleMap[user.department];
            if (deptRoles) {
                roles.push(...deptRoles);
            }
        }
        
        // 職位ベースのロール割り当て
        if (user.jobTitle && user.jobTitle.toLowerCase().includes('manager')) {
            roles.push('manager');
        }
        
        return roles;
    }
    
    extractClaims(idToken) {
        const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
        return payload;
    }
    
    detectChanges(existingUser, newData) {
        const fieldsToCheck = ['email', 'name', 'department', 'jobTitle'];
        
        return fieldsToCheck.some(field => {
            return existingUser[field] !== newData[field];
        });
    }
    
    async logProvisioningEvent(eventType, user) {
        const logEntry = {
            eventType,
            userId: user.id,
            externalId: user.externalId,
            email: user.email,
            timestamp: new Date(),
            source: 'JIT_PROVISIONING'
        };
        
        // ログ記録の実装
        console.log('Provisioning Event:', logEntry);
    }
}
```

## 6.3 属性同期とマッピング戦略

### 属性マッピングの設計原則

**1. 一意性の保証**
```yaml
主キー属性:
  - userPrincipalName (Microsoft Entra ID)
  - email (アプリケーション)
  - externalId (アプリケーション内の外部ID)

一意性制約:
  - 複数の属性の組み合わせで一意性を保証
  - 重複検出ロジックの実装
```

**2. データ型とフォーマットの統一**
```javascript
// 属性変換ルールの定義
const attributeTransformRules = {
    // 真偽値の正規化
    active: (value) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return Boolean(value);
    },
    
    // 日付フォーマットの統一
    lastModified: (value) => {
        if (typeof value === 'string') {
            return new Date(value).toISOString();
        }
        return value instanceof Date ? value.toISOString() : null;
    },
    
    // 配列属性の処理
    groups: (value) => {
        if (Array.isArray(value)) {
            return value.map(group => ({
                id: group.value || group.id,
                display: group.display || group.name
            }));
        }
        return [];
    },
    
    // 電話番号の正規化
    phoneNumber: (value) => {
        if (typeof value === 'string') {
            return value.replace(/[^\d+\-\s()]/g, '');
        }
        return value;
    }
};
```

**3. カスタム属性の拡張**
```json
{
  "schemas": [
    "urn:ietf:params:scim:schemas:core:2.0:User",
    "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User",
    "urn:ietf:params:scim:schemas:extension:mycompany:2.0:User"
  ],
  "urn:ietf:params:scim:schemas:extension:mycompany:2.0:User": {
    "employeeId": "EMP001234",
    "costCenter": "CC-1000",
    "securityClearance": "Secret",
    "accessLevel": "Level-3"
  }
}
```

### 双方向同期の実装

```javascript
class BidirectionalSyncService {
    constructor(scimClient, graphClient, userRepository) {
        this.scimClient = scimClient;
        this.graphClient = graphClient;
        this.userRepository = userRepository;
        this.syncQueue = [];
    }
    
    // Microsoft Entra ID → アプリケーション同期
    async syncFromEntraID() {
        try {
            const entraUsers = await this.graphClient.getUsers();
            const localUsers = await this.userRepository.getAllUsers();
            
            const syncResult = {
                created: 0,
                updated: 0,
                deleted: 0,
                errors: []
            };
            
            // 新規作成・更新の処理
            for (const entraUser of entraUsers) {
                try {
                    const localUser = localUsers.find(u => u.externalId === entraUser.id);
                    
                    if (!localUser) {
                        await this.createLocalUser(entraUser);
                        syncResult.created++;
                    } else if (this.hasUserChanges(localUser, entraUser)) {
                        await this.updateLocalUser(localUser, entraUser);
                        syncResult.updated++;
                    }
                } catch (error) {
                    syncResult.errors.push({
                        user: entraUser.userPrincipalName,
                        error: error.message
                    });
                }
            }
            
            // 削除の処理
            const entraUserIds = new Set(entraUsers.map(u => u.id));
            const usersToDelete = localUsers.filter(u => !entraUserIds.has(u.externalId));
            
            for (const userToDelete of usersToDelete) {
                try {
                    await this.deleteLocalUser(userToDelete);
                    syncResult.deleted++;
                } catch (error) {
                    syncResult.errors.push({
                        user: userToDelete.email,
                        error: error.message
                    });
                }
            }
            
            return syncResult;
            
        } catch (error) {
            throw new Error(`Sync from Entra ID failed: ${error.message}`);
        }
    }
    
    // アプリケーション → Microsoft Entra ID 同期
    async syncToEntraID() {
        const localUsers = await this.userRepository.getModifiedUsers();
        const syncResult = {
            updated: 0,
            errors: []
        };
        
        for (const localUser of localUsers) {
            try {
                // 拡張属性の更新
                const updateData = this.mapLocalUserToEntraID(localUser);
                
                await this.graphClient.updateUser(localUser.externalId, updateData);
                
                // 同期完了マークの設定
                await this.userRepository.markAsSynced(localUser.id);
                
                syncResult.updated++;
                
            } catch (error) {
                syncResult.errors.push({
                    user: localUser.email,
                    error: error.message
                });
            }
        }
        
        return syncResult;
    }
    
    hasUserChanges(localUser, entraUser) {
        const fields = ['displayName', 'mail', 'department', 'jobTitle'];
        
        return fields.some(field => {
            const localValue = localUser[field];
            const entraValue = entraUser[field];
            
            return localValue !== entraValue;
        });
    }
    
    mapLocalUserToEntraID(localUser) {
        return {
            displayName: localUser.name,
            mail: localUser.email,
            department: localUser.department,
            jobTitle: localUser.jobTitle,
            
            // 拡張属性
            "extension_12345678_customAttribute1": localUser.customData?.attribute1,
            "extension_12345678_customAttribute2": localUser.customData?.attribute2
        };
    }
}
```

### 競合解決戦略

```javascript
class ConflictResolutionService {
    constructor() {
        this.resolutionStrategies = {
            'last_write_wins': this.lastWriteWins,
            'source_priority': this.sourcePriority,
            'field_priority': this.fieldPriority,
            'manual_review': this.manualReview
        };
    }
    
    async resolveConflict(conflict) {
        const strategy = this.getResolutionStrategy(conflict);
        return await this.resolutionStrategies[strategy](conflict);
    }
    
    getResolutionStrategy(conflict) {
        // 属性の重要度に基づく戦略選択
        const criticalFields = ['email', 'userPrincipalName', 'active'];
        
        if (conflict.fields.some(field => criticalFields.includes(field))) {
            return 'manual_review';
        }
        
        return 'last_write_wins';
    }
    
    lastWriteWins(conflict) {
        // 最後に更新されたタイムスタンプを使用
        if (conflict.localUser.lastModified > conflict.remoteUser.lastModified) {
            return conflict.localUser;
        } else {
            return conflict.remoteUser;
        }
    }
    
    sourcePriority(conflict) {
        // ソースシステムの優先度に基づく解決
        const sourcePriority = {
            'microsoft_graph': 1,
            'scim_provisioning': 2,
            'local_application': 3
        };
        
        if (sourcePriority[conflict.localSource] < sourcePriority[conflict.remoteSource]) {
            return conflict.localUser;
        } else {
            return conflict.remoteUser;
        }
    }
    
    fieldPriority(conflict) {
        // フィールド別の優先度設定
        const fieldPriorities = {
            'email': 'microsoft_graph',
            'displayName': 'microsoft_graph',
            'department': 'microsoft_graph',
            'customField1': 'local_application',
            'lastLoginAt': 'local_application'
        };
        
        const resolvedUser = { ...conflict.localUser };
        
        for (const field of conflict.fields) {
            const preferredSource = fieldPriorities[field];
            
            if (preferredSource === 'microsoft_graph') {
                resolvedUser[field] = conflict.remoteUser[field];
            }
            // local_application の場合は現在の値を保持
        }
        
        return resolvedUser;
    }
    
    async manualReview(conflict) {
        // 手動レビューキューに追加
        await this.addToReviewQueue(conflict);
        
        // 一時的に安全な値を使用
        return this.createSafeResolution(conflict);
    }
    
    createSafeResolution(conflict) {
        // 重要なフィールドは Microsoft Graph の値を優先
        // その他は現在の値を保持
        return {
            ...conflict.localUser,
            email: conflict.remoteUser.email,
            userPrincipalName: conflict.remoteUser.userPrincipalName,
            active: conflict.remoteUser.active,
            needsManualReview: true
        };
    }
}
```

## 6.4 ユーザーライフサイクル管理の自動化

### ライフサイクル管理のフロー

```mermaid
graph TB
    subgraph Onboarding ["入社プロセス"]
        A[HR システム更新] --> B[Entra ID アカウント作成]
        B --> C[SCIM プロビジョニング]
        C --> D[アプリケーションアカウント作成]
        D --> E[初回ログイン通知]
    end
    
    subgraph Transfer ["異動プロセス"]
        F[HR システム更新] --> G[Entra ID 属性更新]
        G --> H[SCIM 同期実行]
        H --> I[ロール・権限更新]
        I --> J[アクセスレビュー実行]
    end
    
    subgraph Offboarding ["退社プロセス"]
        K[HR システム更新] --> L[Entra ID アカウント無効化]
        L --> M[SCIM 無効化通知]
        M --> N[アプリケーションアクセス停止]
        N --> O[データ保持・削除処理]
    end
```

### 自動化ワークフローの実装

```python
# Python での ライフサイクル管理自動化
from enum import Enum
from datetime import datetime, timedelta
import asyncio

class UserLifecycleEvent(Enum):
    CREATED = "created"
    UPDATED = "updated"
    DEACTIVATED = "deactivated"
    REACTIVATED = "reactivated"
    DELETED = "deleted"

class LifecycleWorkflowEngine:
    def __init__(self, scim_client, notification_service, audit_service):
        self.scim_client = scim_client
        self.notification_service = notification_service
        self.audit_service = audit_service
        self.workflows = {}
        
        # デフォルトワークフローの登録
        self._register_default_workflows()
    
    def _register_default_workflows(self):
        """デフォルトワークフローの登録"""
        # 新規ユーザー作成ワークフロー
        self.workflows[UserLifecycleEvent.CREATED] = [
            self._provision_user_accounts,
            self._assign_default_groups,
            self._send_welcome_notification,
            self._schedule_initial_training
        ]
        
        # ユーザー更新ワークフロー
        self.workflows[UserLifecycleEvent.UPDATED] = [
            self._sync_user_attributes,
            self._update_group_memberships,
            self._review_access_permissions
        ]
        
        # ユーザー無効化ワークフロー
        self.workflows[UserLifecycleEvent.DEACTIVATED] = [
            self._disable_user_accounts,
            self._revoke_access_tokens,
            self._backup_user_data,
            self._notify_stakeholders
        ]
    
    async def execute_workflow(self, event: UserLifecycleEvent, user_data: dict):
        """ワークフローの実行"""
        workflow_steps = self.workflows.get(event, [])
        
        results = []
        for step in workflow_steps:
            try:
                result = await step(user_data)
                results.append({
                    'step': step.__name__,
                    'status': 'success',
                    'result': result
                })
                
                # 監査ログの記録
                await self.audit_service.log_event({
                    'event_type': f"lifecycle.{event.value}",
                    'step': step.__name__,
                    'user_id': user_data.get('id'),
                    'timestamp': datetime.utcnow().isoformat(),
                    'status': 'success'
                })
                
            except Exception as e:
                results.append({
                    'step': step.__name__,
                    'status': 'failed',
                    'error': str(e)
                })
                
                # エラーログの記録
                await self.audit_service.log_event({
                    'event_type': f"lifecycle.{event.value}.error",
                    'step': step.__name__,
                    'user_id': user_data.get('id'),
                    'timestamp': datetime.utcnow().isoformat(),
                    'error': str(e)
                })
        
        return results
    
    async def _provision_user_accounts(self, user_data: dict):
        """ユーザーアカウントのプロビジョニング"""
        # 各アプリケーションでのアカウント作成
        provisioned_accounts = []
        
        for app_config in user_data.get('target_applications', []):
            try:
                # SCIM経由でのアカウント作成
                account = await self.scim_client.create_user(
                    app_config['scim_endpoint'],
                    user_data
                )
                
                provisioned_accounts.append({
                    'application': app_config['name'],
                    'account_id': account['id'],
                    'status': 'created'
                })
                
            except Exception as e:
                provisioned_accounts.append({
                    'application': app_config['name'],
                    'status': 'failed',
                    'error': str(e)
                })
        
        return provisioned_accounts
    
    async def _assign_default_groups(self, user_data: dict):
        """デフォルトグループの割り当て"""
        department = user_data.get('department')
        job_title = user_data.get('jobTitle')
        
        # 部署ベースのグループ割り当て
        department_groups = self._get_department_groups(department)
        
        # 職位ベースのグループ割り当て
        role_groups = self._get_role_groups(job_title)
        
        assigned_groups = []
        for group in department_groups + role_groups:
            try:
                await self.scim_client.add_user_to_group(
                    group['id'],
                    user_data['id']
                )
                assigned_groups.append(group['name'])
            except Exception as e:
                pass  # ログ記録は上位で行う
        
        return assigned_groups
    
    async def _send_welcome_notification(self, user_data: dict):
        """ウェルカム通知の送信"""
        notification_data = {
            'to': user_data['email'],
            'template': 'welcome_new_employee',
            'variables': {
                'name': user_data.get('displayName'),
                'department': user_data.get('department'),
                'start_date': user_data.get('startDate'),
                'manager': user_data.get('manager', {}).get('displayName')
            }
        }
        
        return await self.notification_service.send_email(notification_data)
    
    async def _sync_user_attributes(self, user_data: dict):
        """ユーザー属性の同期"""
        sync_results = []
        
        # 変更された属性の特定
        changed_attributes = user_data.get('changed_attributes', [])
        
        for app_config in user_data.get('target_applications', []):
            try:
                # SCIM PATCH操作での属性更新
                patch_operations = self._build_patch_operations(
                    changed_attributes, 
                    user_data
                )
                
                result = await self.scim_client.patch_user(
                    app_config['scim_endpoint'],
                    user_data['id'],
                    patch_operations
                )
                
                sync_results.append({
                    'application': app_config['name'],
                    'status': 'synced',
                    'updated_attributes': changed_attributes
                })
                
            except Exception as e:
                sync_results.append({
                    'application': app_config['name'],
                    'status': 'failed',
                    'error': str(e)
                })
        
        return sync_results
    
    def _build_patch_operations(self, changed_attributes: list, user_data: dict):
        """SCIM PATCH操作の構築"""
        operations = []
        
        for attr in changed_attributes:
            operations.append({
                "op": "replace",
                "path": attr,
                "value": user_data.get(attr)
            })
        
        return operations
    
    async def _disable_user_accounts(self, user_data: dict):
        """ユーザーアカウントの無効化"""
        disabled_accounts = []
        
        for app_config in user_data.get('target_applications', []):
            try:
                # SCIM PATCH操作でのアカウント無効化
                patch_operations = [{
                    "op": "replace",
                    "path": "active",
                    "value": False
                }]
                
                await self.scim_client.patch_user(
                    app_config['scim_endpoint'],
                    user_data['id'],
                    patch_operations
                )
                
                disabled_accounts.append({
                    'application': app_config['name'],
                    'status': 'disabled'
                })
                
            except Exception as e:
                disabled_accounts.append({
                    'application': app_config['name'],
                    'status': 'failed',
                    'error': str(e)
                })
        
        return disabled_accounts

# ワークフロー実行例
async def main():
    # サービスの初期化
    scim_client = SCIMClient()
    notification_service = NotificationService()
    audit_service = AuditService()
    
    # ワークフローエンジンの初期化
    workflow_engine = LifecycleWorkflowEngine(
        scim_client,
        notification_service,
        audit_service
    )
    
    # 新規ユーザーの作成ワークフロー実行
    new_user_data = {
        'id': 'user-123',
        'displayName': '田中 太郎',
        'email': 'tanaka@example.com',
        'department': 'Engineering',
        'jobTitle': 'Software Developer',
        'startDate': '2024-04-01',
        'target_applications': [
            {
                'name': 'Project Management Tool',
                'scim_endpoint': 'https://pm-tool.example.com/scim/v2'
            },
            {
                'name': 'Code Repository',
                'scim_endpoint': 'https://git.example.com/scim/v2'
            }
        ]
    }
    
    # ワークフロー実行
    results = await workflow_engine.execute_workflow(
        UserLifecycleEvent.CREATED,
        new_user_data
    )
    
    print("ワークフロー実行結果:")
    for result in results:
        print(f"- {result['step']}: {result['status']}")

if __name__ == "__main__":
    asyncio.run(main())
```

### スケジュールベースの自動化

```python
import schedule
import time
from datetime import datetime, timedelta

class ScheduledLifecycleManager:
    def __init__(self, workflow_engine, user_repository):
        self.workflow_engine = workflow_engine
        self.user_repository = user_repository
        
        # スケジュール設定
        self._setup_schedules()
    
    def _setup_schedules(self):
        """定期実行スケジュールの設定"""
        # 毎日午前2時：非アクティブユーザーのチェック
        schedule.every().day.at("02:00").do(self._check_inactive_users)
        
        # 毎週月曜日午前3時：アクセスレビュー
        schedule.every().monday.at("03:00").do(self._execute_access_review)
        
        # 毎月1日午前4時：データ保持ポリシー適用
        schedule.every().month.do(self._apply_retention_policy)
    
    async def _check_inactive_users(self):
        """非アクティブユーザーのチェック"""
        cutoff_date = datetime.utcnow() - timedelta(days=90)
        
        inactive_users = await self.user_repository.get_inactive_users(cutoff_date)
        
        for user in inactive_users:
            # 無効化ワークフローの実行
            await self.workflow_engine.execute_workflow(
                UserLifecycleEvent.DEACTIVATED,
                user
            )
    
    async def _execute_access_review(self):
        """定期的なアクセスレビューの実行"""
        # 高権限ユーザーのレビュー
        privileged_users = await self.user_repository.get_privileged_users()
        
        for user in privileged_users:
            # アクセスレビュー通知の送信
            await self._send_access_review_notification(user)
    
    async def _apply_retention_policy(self):
        """データ保持ポリシーの適用"""
        # 退職から一定期間経過したユーザーデータの削除
        deletion_cutoff = datetime.utcnow() - timedelta(days=365)
        
        users_for_deletion = await self.user_repository.get_users_for_deletion(
            deletion_cutoff
        )
        
        for user in users_for_deletion:
            await self.workflow_engine.execute_workflow(
                UserLifecycleEvent.DELETED,
                user
            )
    
    def start_scheduler(self):
        """スケジューラーの開始"""
        while True:
            schedule.run_pending()
            time.sleep(60)  # 1分間隔でチェック
```

## 6.5 実装例：SCIM エンドポイントの開発

本セクションでは、Microsoft Entra IDと連携するSCIM 2.0エンドポイントを5つのプログラミング言語で実装する方法を詳しく解説します。各言語の特性を活かした実装パターンと、実運用で必要となるセキュリティ・パフォーマンス対策を含む包括的なガイドです。

### 6.5.1 Java/Spring Boot による SCIM 実装

**プロジェクト構成**
```
scim-server/
├── src/main/java/com/example/scim/
│   ├── ScimServerApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   └── DatabaseConfig.java
│   ├── controller/
│   │   ├── UserController.java
│   │   ├── GroupController.java
│   │   └── SchemaController.java
│   ├── model/
│   │   ├── ScimUser.java
│   │   ├── ScimGroup.java
│   │   └── ScimResource.java
│   ├── service/
│   │   ├── UserService.java
│   │   └── GroupService.java
│   └── repository/
│       ├── UserRepository.java
│       └── GroupRepository.java
├── src/main/resources/
│   └── application.yml
└── pom.xml
```

**依存関係 (pom.xml)**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>scim-server</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>
    </dependencies>
</project>
```

**SCIM ユーザーモデル**
```java
package com.example.scim.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "scim_users")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ScimUser {
    
    @Id
    @Column(name = "id")
    private String id;
    
    @Column(name = "external_id")
    @JsonProperty("externalId")
    private String externalId;
    
    @Column(name = "user_name", unique = true, nullable = false)
    @NotBlank
    @JsonProperty("userName")
    private String userName;
    
    @Column(name = "active")
    private Boolean active = true;
    
    @Embedded
    private Name name;
    
    @Column(name = "display_name")
    @JsonProperty("displayName")
    private String displayName;
    
    @ElementCollection
    @CollectionTable(name = "user_emails", joinColumns = @JoinColumn(name = "user_id"))
    private List<Email> emails = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "user_phone_numbers", joinColumns = @JoinColumn(name = "user_id"))
    @JsonProperty("phoneNumbers")
    private List<PhoneNumber> phoneNumbers = new ArrayList<>();
    
    @Embedded
    @JsonProperty("urn:ietf:params:scim:schemas:extension:enterprise:2.0:User")
    private EnterpriseUser enterpriseUser;
    
    @Column(name = "created")
    private LocalDateTime created;
    
    @Column(name = "last_modified")
    @JsonProperty("lastModified")
    private LocalDateTime lastModified;
    
    @Column(name = "version")
    private Long version = 1L;
    
    // コンストラクタ
    public ScimUser() {
        this.id = java.util.UUID.randomUUID().toString();
        this.created = LocalDateTime.now();
        this.lastModified = LocalDateTime.now();
    }
    
    // SCIM レスポンス用メソッド
    @JsonProperty("schemas")
    public List<String> getSchemas() {
        List<String> schemas = new ArrayList<>();
        schemas.add("urn:ietf:params:scim:schemas:core:2.0:User");
        if (enterpriseUser != null) {
            schemas.add("urn:ietf:params:scim:schemas:extension:enterprise:2.0:User");
        }
        return schemas;
    }
    
    @JsonProperty("meta")
    public Meta getMeta() {
        Meta meta = new Meta();
        meta.setResourceType("User");
        meta.setCreated(created);
        meta.setLastModified(lastModified);
        meta.setVersion("W/\"" + version + "\"");
        meta.setLocation("/scim/v2/Users/" + id);
        return meta;
    }
    
    // ゲッター・セッター（省略）
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    
    // 埋め込みクラス
    @Embeddable
    public static class Name {
        @Column(name = "formatted_name")
        private String formatted;
        
        @Column(name = "family_name")
        @JsonProperty("familyName")
        private String familyName;
        
        @Column(name = "given_name")
        @JsonProperty("givenName")
        private String givenName;
        
        // ゲッター・セッター
        public String getFormatted() { return formatted; }
        public void setFormatted(String formatted) { this.formatted = formatted; }
        
        public String getFamilyName() { return familyName; }
        public void setFamilyName(String familyName) { this.familyName = familyName; }
        
        public String getGivenName() { return givenName; }
        public void setGivenName(String givenName) { this.givenName = givenName; }
    }
    
    @Embeddable
    public static class Email {
        @Column(name = "email_value")
        private String value;
        
        @Column(name = "email_type")
        private String type = "work";
        
        @Column(name = "email_primary")
        private Boolean primary = false;
        
        // ゲッター・セッター
        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public Boolean getPrimary() { return primary; }
        public void setPrimary(Boolean primary) { this.primary = primary; }
    }
    
    @Embeddable
    public static class EnterpriseUser {
        @Column(name = "employee_number")
        @JsonProperty("employeeNumber")
        private String employeeNumber;
        
        @Column(name = "cost_center")
        @JsonProperty("costCenter")
        private String costCenter;
        
        @Column(name = "organization")
        private String organization;
        
        @Column(name = "department")
        private String department;
        
        // ゲッター・セッター
        public String getEmployeeNumber() { return employeeNumber; }
        public void setEmployeeNumber(String employeeNumber) { this.employeeNumber = employeeNumber; }
        
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
    }
}
```

**SCIM ユーザーコントローラー**
```java
package com.example.scim.controller;

import com.example.scim.model.ScimUser;
import com.example.scim.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/scim/v2/Users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUsers(
            @RequestParam(value = "filter", required = false) String filter,
            @RequestParam(value = "startIndex", defaultValue = "1") int startIndex,
            @RequestParam(value = "count", defaultValue = "20") int count,
            @RequestParam(value = "attributes", required = false) String attributes,
            @RequestParam(value = "excludedAttributes", required = false) String excludedAttributes) {
        
        try {
            Map<String, Object> result = userService.getUsers(filter, startIndex, count, attributes, excludedAttributes);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(500, "Internal Server Error", e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(
            @PathVariable String id,
            @RequestParam(value = "attributes", required = false) String attributes,
            @RequestParam(value = "excludedAttributes", required = false) String excludedAttributes) {
        
        try {
            ScimUser user = userService.getUserById(id);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse(404, "Resource not found", "User " + id + " not found"));
            }
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(500, "Internal Server Error", e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody ScimUser user) {
        try {
            // ユーザー名の重複チェック
            if (userService.getUserByUserName(user.getUserName()) != null) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(createErrorResponse(409, "Uniqueness constraint violation", 
                                "User with userName " + user.getUserName() + " already exists"));
            }
            
            ScimUser createdUser = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(400, "Invalid request", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @Valid @RequestBody ScimUser user) {
        try {
            ScimUser existingUser = userService.getUserById(id);
            if (existingUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse(404, "Resource not found", "User " + id + " not found"));
            }
            
            user.setId(id);
            ScimUser updatedUser = userService.updateUser(user);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(400, "Invalid request", e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}")
    public ResponseEntity<?> patchUser(@PathVariable String id, @RequestBody Map<String, Object> patchRequest) {
        try {
            ScimUser existingUser = userService.getUserById(id);
            if (existingUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse(404, "Resource not found", "User " + id + " not found"));
            }
            
            ScimUser updatedUser = userService.patchUser(id, patchRequest);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(400, "Invalid request", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        try {
            ScimUser existingUser = userService.getUserById(id);
            if (existingUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse(404, "Resource not found", "User " + id + " not found"));
            }
            
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(500, "Internal Server Error", e.getMessage()));
        }
    }
    
    private Map<String, Object> createErrorResponse(int status, String scimType, String detail) {
        return Map.of(
                "schemas", List.of("urn:ietf:params:scim:api:messages:2.0:Error"),
                "status", status,
                "scimType", scimType,
                "detail", detail
        );
    }
}
```

**ユーザーサービス実装**
```java
package com.example.scim.service;

import com.example.scim.model.ScimUser;
import com.example.scim.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public Map<String, Object> getUsers(String filter, int startIndex, int count, 
                                       String attributes, String excludedAttributes) {
        Pageable pageable = PageRequest.of(startIndex - 1, count);
        Page<ScimUser> userPage;
        
        if (filter != null && !filter.isEmpty()) {
            // 簡単なフィルター実装（例：userName eq "value"）
            userPage = applyFilter(filter, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }
        
        List<ScimUser> users = userPage.getContent();
        
        Map<String, Object> response = new HashMap<>();
        response.put("schemas", List.of("urn:ietf:params:scim:api:messages:2.0:ListResponse"));
        response.put("totalResults", userPage.getTotalElements());
        response.put("startIndex", startIndex);
        response.put("itemsPerPage", users.size());
        response.put("Resources", users);
        
        return response;
    }
    
    public ScimUser getUserById(String id) {
        return userRepository.findById(id).orElse(null);
    }
    
    public ScimUser getUserByUserName(String userName) {
        return userRepository.findByUserName(userName);
    }
    
    public ScimUser createUser(ScimUser user) {
        user.setId(UUID.randomUUID().toString());
        user.setCreated(LocalDateTime.now());
        user.setLastModified(LocalDateTime.now());
        user.setVersion(1L);
        return userRepository.save(user);
    }
    
    public ScimUser updateUser(ScimUser user) {
        user.setLastModified(LocalDateTime.now());
        user.setVersion(user.getVersion() + 1);
        return userRepository.save(user);
    }
    
    public ScimUser patchUser(String id, Map<String, Object> patchRequest) {
        ScimUser user = getUserById(id);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> operations = (List<Map<String, Object>>) patchRequest.get("Operations");
        
        for (Map<String, Object> operation : operations) {
            String op = (String) operation.get("op");
            String path = (String) operation.get("path");
            Object value = operation.get("value");
            
            applyPatchOperation(user, op, path, value);
        }
        
        return updateUser(user);
    }
    
    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
    
    private Page<ScimUser> applyFilter(String filter, Pageable pageable) {
        // 簡単なフィルター解析と適用
        if (filter.contains("userName eq")) {
            String userName = extractFilterValue(filter, "userName eq");
            return userRepository.findByUserName(userName, pageable);
        } else if (filter.contains("active eq")) {
            boolean active = Boolean.parseBoolean(extractFilterValue(filter, "active eq"));
            return userRepository.findByActive(active, pageable);
        }
        
        return userRepository.findAll(pageable);
    }
    
    private String extractFilterValue(String filter, String attribute) {
        String[] parts = filter.split(attribute);
        if (parts.length > 1) {
            return parts[1].trim().replaceAll("\"", "");
        }
        return "";
    }
    
    private void applyPatchOperation(ScimUser user, String op, String path, Object value) {
        switch (op.toLowerCase()) {
            case "replace":
                switch (path) {
                    case "active":
                        user.setActive((Boolean) value);
                        break;
                    case "userName":
                        user.setUserName((String) value);
                        break;
                    case "displayName":
                        user.setDisplayName((String) value);
                        break;
                    // 他のパスの処理...
                }
                break;
            case "add":
                // 追加操作の実装
                break;
            case "remove":
                // 削除操作の実装
                break;
        }
    }
}
```

### 6.5.2 .NET Core による SCIM 実装

**プロジェクト構成**
```
ScimServer/
├── Controllers/
│   ├── UsersController.cs
│   ├── GroupsController.cs
│   └── SchemasController.cs
├── Models/
│   ├── ScimUser.cs
│   ├── ScimGroup.cs
│   └── ScimResource.cs
├── Services/
│   ├── IUserService.cs
│   ├── UserService.cs
│   └── ScimFilterParser.cs
├── Data/
│   ├── ScimDbContext.cs
│   └── Repositories/
├── Middleware/
│   └── ScimAuthenticationMiddleware.cs
├── Program.cs
└── ScimServer.csproj
```

**プロジェクトファイル (ScimServer.csproj)**
```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
    <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
    <PackageReference Include="AutoMapper" Version="12.0.1" />
    <PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="12.0.1" />
    <PackageReference Include="Serilog.AspNetCore" Version="8.0.0" />
  </ItemGroup>
</Project>
```

**SCIM ユーザーモデル**
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace ScimServer.Models
{
    [Table("ScimUsers")]
    public class ScimUser
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [JsonProperty("externalId")]
        public string? ExternalId { get; set; }
        
        [Required]
        [JsonProperty("userName")]
        public string UserName { get; set; } = string.Empty;
        
        public bool Active { get; set; } = true;
        
        [JsonProperty("name")]
        public ScimName? Name { get; set; }
        
        [JsonProperty("displayName")]
        public string? DisplayName { get; set; }
        
        [JsonProperty("emails")]
        public List<ScimEmail> Emails { get; set; } = new();
        
        [JsonProperty("phoneNumbers")]
        public List<ScimPhoneNumber> PhoneNumbers { get; set; } = new();
        
        [JsonProperty("urn:ietf:params:scim:schemas:extension:enterprise:2.0:User")]
        public ScimEnterpriseUser? EnterpriseUser { get; set; }
        
        public DateTime Created { get; set; } = DateTime.UtcNow;
        
        [JsonProperty("lastModified")]
        public DateTime LastModified { get; set; } = DateTime.UtcNow;
        
        public long Version { get; set; } = 1;
        
        [JsonProperty("schemas")]
        public List<string> Schemas 
        { 
            get 
            {
                var schemas = new List<string> { "urn:ietf:params:scim:schemas:core:2.0:User" };
                if (EnterpriseUser != null)
                {
                    schemas.Add("urn:ietf:params:scim:schemas:extension:enterprise:2.0:User");
                }
                return schemas;
            } 
        }
        
        [JsonProperty("meta")]
        public ScimMeta Meta => new()
        {
            ResourceType = "User",
            Created = Created,
            LastModified = LastModified,
            Version = $"W/\"{Version}\"",
            Location = $"/scim/v2/Users/{Id}"
        };
    }
    
    [Owned]
    public class ScimName
    {
        public string? Formatted { get; set; }
        
        [JsonProperty("familyName")]
        public string? FamilyName { get; set; }
        
        [JsonProperty("givenName")]
        public string? GivenName { get; set; }
        
        [JsonProperty("middleName")]
        public string? MiddleName { get; set; }
    }
    
    [Owned]
    public class ScimEmail
    {
        public string Value { get; set; } = string.Empty;
        public string Type { get; set; } = "work";
        public bool Primary { get; set; } = false;
    }
    
    [Owned]
    public class ScimEnterpriseUser
    {
        [JsonProperty("employeeNumber")]
        public string? EmployeeNumber { get; set; }
        
        [JsonProperty("costCenter")]
        public string? CostCenter { get; set; }
        
        public string? Organization { get; set; }
        public string? Department { get; set; }
        
        public ScimManager? Manager { get; set; }
    }
    
    [Owned]
    public class ScimManager
    {
        public string Value { get; set; } = string.Empty;
        
        [JsonProperty("$ref")]
        public string Ref => $"/Users/{Value}";
        
        [JsonProperty("displayName")]
        public string? DisplayName { get; set; }
    }
    
    public class ScimMeta
    {
        [JsonProperty("resourceType")]
        public string ResourceType { get; set; } = string.Empty;
        
        public DateTime Created { get; set; }
        
        [JsonProperty("lastModified")]
        public DateTime LastModified { get; set; }
        
        public string Version { get; set; } = string.Empty;
        
        public string Location { get; set; } = string.Empty;
    }
}
```

**ユーザーコントローラー**
```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ScimServer.Models;
using ScimServer.Services;
using Newtonsoft.Json;

namespace ScimServer.Controllers
{
    [ApiController]
    [Route("scim/v2/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UsersController> _logger;
        
        public UsersController(IUserService userService, ILogger<UsersController> logger)
        {
            _userService = userService;
            _logger = logger;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetUsers(
            [FromQuery] string? filter,
            [FromQuery] int startIndex = 1,
            [FromQuery] int count = 20,
            [FromQuery] string? attributes = null,
            [FromQuery] string? excludedAttributes = null)
        {
            try
            {
                var result = await _userService.GetUsersAsync(filter, startIndex, count, attributes, excludedAttributes);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return StatusCode(500, CreateErrorResponse(500, "Internal Server Error", ex.Message));
            }
        }
        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(
            string id,
            [FromQuery] string? attributes = null,
            [FromQuery] string? excludedAttributes = null)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                if (user == null)
                {
                    return NotFound(CreateErrorResponse(404, "Resource not found", $"User {id} not found"));
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user {UserId}", id);
                return StatusCode(500, CreateErrorResponse(500, "Internal Server Error", ex.Message));
            }
        }
        
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] ScimUser user)
        {
            try
            {
                // ユーザー名の重複チェック
                var existingUser = await _userService.GetUserByUserNameAsync(user.UserName);
                if (existingUser != null)
                {
                    return Conflict(CreateErrorResponse(409, "uniqueness", 
                        $"User with userName {user.UserName} already exists"));
                }
                
                var createdUser = await _userService.CreateUserAsync(user);
                return CreatedAtAction(nameof(GetUser), new { id = createdUser.Id }, createdUser);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return BadRequest(CreateErrorResponse(400, "Invalid request", ex.Message));
            }
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] ScimUser user)
        {
            try
            {
                var existingUser = await _userService.GetUserByIdAsync(id);
                if (existingUser == null)
                {
                    return NotFound(CreateErrorResponse(404, "Resource not found", $"User {id} not found"));
                }
                
                user.Id = id;
                var updatedUser = await _userService.UpdateUserAsync(user);
                return Ok(updatedUser);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", id);
                return BadRequest(CreateErrorResponse(400, "Invalid request", ex.Message));
            }
        }
        
        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchUser(string id, [FromBody] JsonElement patchRequest)
        {
            try
            {
                var existingUser = await _userService.GetUserByIdAsync(id);
                if (existingUser == null)
                {
                    return NotFound(CreateErrorResponse(404, "Resource not found", $"User {id} not found"));
                }
                
                var updatedUser = await _userService.PatchUserAsync(id, patchRequest);
                return Ok(updatedUser);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error patching user {UserId}", id);
                return BadRequest(CreateErrorResponse(400, "Invalid request", ex.Message));
            }
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            try
            {
                var existingUser = await _userService.GetUserByIdAsync(id);
                if (existingUser == null)
                {
                    return NotFound(CreateErrorResponse(404, "Resource not found", $"User {id} not found"));
                }
                
                await _userService.DeleteUserAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", id);
                return StatusCode(500, CreateErrorResponse(500, "Internal Server Error", ex.Message));
            }
        }
        
        private object CreateErrorResponse(int status, string scimType, string detail)
        {
            return new
            {
                schemas = new[] { "urn:ietf:params:scim:api:messages:2.0:Error" },
                status,
                scimType,
                detail
            };
        }
    }
}
```

### 6.5.3 Node.js/Express による SCIM 実装

**プロジェクト構成**
```
scim-server/
├── src/
│   ├── controllers/
│   │   ├── usersController.js
│   │   ├── groupsController.js
│   │   └── schemasController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Group.js
│   │   └── index.js
│   ├── services/
│   │   ├── userService.js
│   │   ├── groupService.js
│   │   └── scimFilter.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── utils/
│   │   ├── scimUtils.js
│   │   └── patchUtils.js
│   ├── config/
│   │   └── database.js
│   └── app.js
├── package.json
└── server.js
```

**依存関係 (package.json)**
```json
{
  "name": "scim-server",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.0",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4",
    "joi": "^17.11.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "uuid": "^9.0.1",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  }
}
```

**SCIM ユーザーモデル**
```javascript
const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    externalId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      field: 'external_id'
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'user_name'
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // 名前情報
    formattedName: {
      type: DataTypes.STRING,
      field: 'formatted_name'
    },
    familyName: {
      type: DataTypes.STRING,
      field: 'family_name'
    },
    givenName: {
      type: DataTypes.STRING,
      field: 'given_name'
    },
    middleName: {
      type: DataTypes.STRING,
      field: 'middle_name'
    },
    displayName: {
      type: DataTypes.STRING,
      field: 'display_name'
    },
    // 連絡先情報 (JSON形式で保存)
    emails: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    phoneNumbers: {
      type: DataTypes.JSON,
      defaultValue: [],
      field: 'phone_numbers'
    },
    addresses: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    // エンタープライズ拡張
    employeeNumber: {
      type: DataTypes.STRING,
      field: 'employee_number'
    },
    costCenter: {
      type: DataTypes.STRING,
      field: 'cost_center'
    },
    organization: {
      type: DataTypes.STRING
    },
    department: {
      type: DataTypes.STRING
    },
    managerId: {
      type: DataTypes.STRING,
      field: 'manager_id'
    },
    // メタデータ
    version: {
      type: DataTypes.BIGINT,
      defaultValue: 1
    }
  }, {
    tableName: 'scim_users',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'lastModified',
    indexes: [
      { fields: ['user_name'] },
      { fields: ['external_id'] },
      { fields: ['active'] }
    ]
  });

  // インスタンスメソッド: SCIM形式への変換
  User.prototype.toScimFormat = function(attributes = null, excludedAttributes = null) {
    const scimUser = {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      id: this.id,
      externalId: this.externalId,
      userName: this.userName,
      active: this.active,
      meta: {
        resourceType: 'User',
        created: this.created,
        lastModified: this.lastModified,
        version: `W/"${this.version}"`,
        location: `/scim/v2/Users/${this.id}`
      }
    };

    // 名前情報
    if (this.formattedName || this.familyName || this.givenName) {
      scimUser.name = {};
      if (this.formattedName) scimUser.name.formatted = this.formattedName;
      if (this.familyName) scimUser.name.familyName = this.familyName;
      if (this.givenName) scimUser.name.givenName = this.givenName;
      if (this.middleName) scimUser.name.middleName = this.middleName;
    }

    if (this.displayName) scimUser.displayName = this.displayName;

    // 連絡先情報
    if (this.emails && this.emails.length > 0) {
      scimUser.emails = this.emails;
    }
    if (this.phoneNumbers && this.phoneNumbers.length > 0) {
      scimUser.phoneNumbers = this.phoneNumbers;
    }
    if (this.addresses && this.addresses.length > 0) {
      scimUser.addresses = this.addresses;
    }

    // エンタープライズ拡張
    const enterpriseExt = {};
    if (this.employeeNumber) enterpriseExt.employeeNumber = this.employeeNumber;
    if (this.costCenter) enterpriseExt.costCenter = this.costCenter;
    if (this.organization) enterpriseExt.organization = this.organization;
    if (this.department) enterpriseExt.department = this.department;
    if (this.managerId) {
      enterpriseExt.manager = {
        value: this.managerId,
        $ref: `/Users/${this.managerId}`
      };
    }

    if (Object.keys(enterpriseExt).length > 0) {
      scimUser['urn:ietf:params:scim:schemas:extension:enterprise:2.0:User'] = enterpriseExt;
      scimUser.schemas.push('urn:ietf:params:scim:schemas:extension:enterprise:2.0:User');
    }

    // 属性フィルタリング
    if (attributes) {
      const filteredUser = { schemas: scimUser.schemas, id: scimUser.id };
      attributes.forEach(attr => {
        if (scimUser[attr] !== undefined) {
          filteredUser[attr] = scimUser[attr];
        }
      });
      return filteredUser;
    }

    if (excludedAttributes) {
      excludedAttributes.forEach(attr => {
        delete scimUser[attr];
      });
    }

    return scimUser;
  };

  return User;
};
```

**ユーザーコントローラー**
```javascript
const userService = require('../services/userService');
const { validateUser, validatePatchRequest } = require('../middleware/validation');
const scimUtils = require('../utils/scimUtils');

class UsersController {
  // ユーザー一覧取得
  async getUsers(req, res, next) {
    try {
      const {
        filter,
        startIndex = 1,
        count = 20,
        attributes,
        excludedAttributes
      } = req.query;

      const result = await userService.getUsers({
        filter,
        startIndex: parseInt(startIndex),
        count: parseInt(count),
        attributes: attributes ? attributes.split(',') : null,
        excludedAttributes: excludedAttributes ? excludedAttributes.split(',') : null
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // 特定ユーザー取得
  async getUser(req, res, next) {
    try {
      const { id } = req.params;
      const { attributes, excludedAttributes } = req.query;

      const user = await userService.getUserById(id, {
        attributes: attributes ? attributes.split(',') : null,
        excludedAttributes: excludedAttributes ? excludedAttributes.split(',') : null
      });

      if (!user) {
        return res.status(404).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          status: 404,
          detail: `User ${id} not found`
        });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  // ユーザー作成
  async createUser(req, res, next) {
    try {
      const userData = req.body;

      // ユーザー名の重複チェック
      const existingUser = await userService.getUserByUserName(userData.userName);
      if (existingUser) {
        return res.status(409).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          status: 409,
          scimType: 'uniqueness',
          detail: `User with userName ${userData.userName} already exists`
        });
      }

      const createdUser = await userService.createUser(userData);
      res.status(201).json(createdUser);
    } catch (error) {
      next(error);
    }
  }

  // ユーザー完全更新
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const userData = req.body;

      const existingUser = await userService.getUserById(id);
      if (!existingUser) {
        return res.status(404).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          status: 404,
          detail: `User ${id} not found`
        });
      }

      userData.id = id;
      const updatedUser = await userService.updateUser(userData);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  // ユーザー部分更新
  async patchUser(req, res, next) {
    try {
      const { id } = req.params;
      const patchRequest = req.body;

      const existingUser = await userService.getUserById(id);
      if (!existingUser) {
        return res.status(404).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          status: 404,
          detail: `User ${id} not found`
        });
      }

      const updatedUser = await userService.patchUser(id, patchRequest);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  // ユーザー削除
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      const existingUser = await userService.getUserById(id);
      if (!existingUser) {
        return res.status(404).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          status: 404,
          detail: `User ${id} not found`
        });
      }

      await userService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UsersController();
```

**ユーザーサービス**
```javascript
const { User } = require('../models');
const { Op } = require('sequelize');
const scimFilter = require('./scimFilter');
const patchUtils = require('../utils/patchUtils');

class UserService {
  async getUsers(options = {}) {
    const {
      filter,
      startIndex = 1,
      count = 20,
      attributes,
      excludedAttributes
    } = options;

    let whereClause = {};

    // フィルター適用
    if (filter) {
      whereClause = scimFilter.parseFilter(filter);
    }

    const { rows: users, count: totalResults } = await User.findAndCountAll({
      where: whereClause,
      offset: startIndex - 1,
      limit: count,
      order: [['created', 'ASC']]
    });

    const scimUsers = users.map(user => 
      user.toScimFormat(attributes, excludedAttributes)
    );

    return {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults,
      startIndex,
      itemsPerPage: scimUsers.length,
      Resources: scimUsers
    };
  }

  async getUserById(id, options = {}) {
    const { attributes, excludedAttributes } = options;
    
    const user = await User.findByPk(id);
    if (!user) return null;

    return user.toScimFormat(attributes, excludedAttributes);
  }

  async getUserByUserName(userName) {
    const user = await User.findOne({
      where: { userName }
    });
    return user ? user.toScimFormat() : null;
  }

  async createUser(userData) {
    const userModel = this._mapScimToModel(userData);
    const createdUser = await User.create(userModel);
    return createdUser.toScimFormat();
  }

  async updateUser(userData) {
    const userModel = this._mapScimToModel(userData);
    userModel.version = userModel.version + 1;
    
    const [updatedCount] = await User.update(userModel, {
      where: { id: userData.id }
    });

    if (updatedCount === 0) {
      throw new Error('User not found');
    }

    const updatedUser = await User.findByPk(userData.id);
    return updatedUser.toScimFormat();
  }

  async patchUser(id, patchRequest) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }

    const userObject = user.toScimFormat();
    const operations = patchRequest.Operations || [];

    for (const operation of operations) {
      patchUtils.applyPatchOperation(userObject, operation);
    }

    return this.updateUser(userObject);
  }

  async deleteUser(id) {
    const deletedCount = await User.destroy({
      where: { id }
    });

    if (deletedCount === 0) {
      throw new Error('User not found');
    }

    return true;
  }

  _mapScimToModel(scimUser) {
    const model = {
      userName: scimUser.userName,
      active: scimUser.active !== undefined ? scimUser.active : true
    };

    if (scimUser.externalId) model.externalId = scimUser.externalId;
    if (scimUser.displayName) model.displayName = scimUser.displayName;

    // 名前情報のマッピング
    if (scimUser.name) {
      if (scimUser.name.formatted) model.formattedName = scimUser.name.formatted;
      if (scimUser.name.familyName) model.familyName = scimUser.name.familyName;
      if (scimUser.name.givenName) model.givenName = scimUser.name.givenName;
      if (scimUser.name.middleName) model.middleName = scimUser.name.middleName;
    }

    // 連絡先情報
    if (scimUser.emails) model.emails = scimUser.emails;
    if (scimUser.phoneNumbers) model.phoneNumbers = scimUser.phoneNumbers;
    if (scimUser.addresses) model.addresses = scimUser.addresses;

    // エンタープライズ拡張
    const enterpriseExt = scimUser['urn:ietf:params:scim:schemas:extension:enterprise:2.0:User'];
    if (enterpriseExt) {
      if (enterpriseExt.employeeNumber) model.employeeNumber = enterpriseExt.employeeNumber;
      if (enterpriseExt.costCenter) model.costCenter = enterpriseExt.costCenter;
      if (enterpriseExt.organization) model.organization = enterpriseExt.organization;
      if (enterpriseExt.department) model.department = enterpriseExt.department;
      if (enterpriseExt.manager && enterpriseExt.manager.value) {
        model.managerId = enterpriseExt.manager.value;
      }
    }

    return model;
  }
}

module.exports = new UserService();
```

### 6.5.4 PHP による SCIM 実装

**プロジェクト構成**
```
scim-server/
├── src/
│   ├── Controller/
│   │   ├── UserController.php
│   │   ├── GroupController.php
│   │   └── SchemaController.php
│   ├── Model/
│   │   ├── ScimUser.php
│   │   ├── ScimGroup.php
│   │   └── ScimResource.php
│   ├── Service/
│   │   ├── UserService.php
│   │   ├── GroupService.php
│   │   └── ScimFilterParser.php
│   ├── Repository/
│   │   ├── UserRepository.php
│   │   └── GroupRepository.php
│   ├── Middleware/
│   │   ├── AuthMiddleware.php
│   │   └── ErrorHandler.php
│   └── Utils/
│       ├── ScimUtils.php
│       └── PatchUtils.php
├── config/
│   ├── database.php
│   └── app.php
├── public/
│   └── index.php
├── composer.json
└── README.md
```

**依存関係 (composer.json)**
```json
{
    "name": "example/scim-server",
    "description": "SCIM 2.0 Server Implementation",
    "type": "project",
    "require": {
        "php": "^8.1",
        "slim/slim": "^4.11",
        "slim/psr7": "^1.6",
        "doctrine/orm": "^2.16",
        "doctrine/dbal": "^3.6",
        "doctrine/migrations": "^3.6",
        "firebase/php-jwt": "^6.8",
        "ramsey/uuid": "^4.7",
        "monolog/monolog": "^3.4",
        "vlucas/phpdotenv": "^5.5"
    },
    "require-dev": {
        "phpunit/phpunit": "^10.3",
        "squizlabs/php_codesniffer": "^3.7"
    },
    "autoload": {
        "psr-4": {
            "ScimServer\\": "src/"
        }
    },
    "autoload-dev": {
        "psr-4": {
            "ScimServer\\Tests\\": "tests/"
        }
    }
}
```

**SCIM ユーザーエンティティ**
```php
<?php

namespace ScimServer\Model;

use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use JsonSerializable;

#[ORM\Entity]
#[ORM\Table(name: 'scim_users')]
#[ORM\Index(columns: ['user_name'], name: 'idx_user_name')]
#[ORM\Index(columns: ['external_id'], name: 'idx_external_id')]
class ScimUser implements JsonSerializable
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    private string $id;

    #[ORM\Column(name: 'external_id', type: 'string', length: 255, nullable: true, unique: true)]
    private ?string $externalId = null;

    #[ORM\Column(name: 'user_name', type: 'string', length: 255, unique: true)]
    private string $userName;

    #[ORM\Column(type: 'boolean')]
    private bool $active = true;

    #[ORM\Column(name: 'formatted_name', type: 'string', length: 255, nullable: true)]
    private ?string $formattedName = null;

    #[ORM\Column(name: 'family_name', type: 'string', length: 255, nullable: true)]
    private ?string $familyName = null;

    #[ORM\Column(name: 'given_name', type: 'string', length: 255, nullable: true)]
    private ?string $givenName = null;

    #[ORM\Column(name: 'middle_name', type: 'string', length: 255, nullable: true)]
    private ?string $middleName = null;

    #[ORM\Column(name: 'display_name', type: 'string', length: 255, nullable: true)]
    private ?string $displayName = null;

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $emails = [];

    #[ORM\Column(name: 'phone_numbers', type: 'json', nullable: true)]
    private ?array $phoneNumbers = [];

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $addresses = [];

    #[ORM\Column(name: 'employee_number', type: 'string', length: 255, nullable: true)]
    private ?string $employeeNumber = null;

    #[ORM\Column(name: 'cost_center', type: 'string', length: 255, nullable: true)]
    private ?string $costCenter = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $organization = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $department = null;

    #[ORM\Column(name: 'manager_id', type: 'string', length: 36, nullable: true)]
    private ?string $managerId = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $created;

    #[ORM\Column(name: 'last_modified', type: 'datetime_immutable')]
    private \DateTimeImmutable $lastModified;

    #[ORM\Column(type: 'bigint')]
    private int $version = 1;

    public function __construct()
    {
        $this->id = Uuid::uuid4()->toString();
        $this->created = new \DateTimeImmutable();
        $this->lastModified = new \DateTimeImmutable();
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function setId(string $id): void
    {
        $this->id = $id;
    }

    public function getExternalId(): ?string
    {
        return $this->externalId;
    }

    public function setExternalId(?string $externalId): void
    {
        $this->externalId = $externalId;
    }

    public function getUserName(): string
    {
        return $this->userName;
    }

    public function setUserName(string $userName): void
    {
        $this->userName = $userName;
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    public function setActive(bool $active): void
    {
        $this->active = $active;
    }

    public function getDisplayName(): ?string
    {
        return $this->displayName;
    }

    public function setDisplayName(?string $displayName): void
    {
        $this->displayName = $displayName;
    }

    public function getEmails(): ?array
    {
        return $this->emails;
    }

    public function setEmails(?array $emails): void
    {
        $this->emails = $emails;
    }

    public function getEmployeeNumber(): ?string
    {
        return $this->employeeNumber;
    }

    public function setEmployeeNumber(?string $employeeNumber): void
    {
        $this->employeeNumber = $employeeNumber;
    }

    public function getDepartment(): ?string
    {
        return $this->department;
    }

    public function setDepartment(?string $department): void
    {
        $this->department = $department;
    }

    public function getVersion(): int
    {
        return $this->version;
    }

    public function incrementVersion(): void
    {
        $this->version++;
        $this->lastModified = new \DateTimeImmutable();
    }

    public function jsonSerialize(): array
    {
        $schemas = ['urn:ietf:params:scim:schemas:core:2.0:User'];
        $result = [
            'schemas' => $schemas,
            'id' => $this->id,
            'userName' => $this->userName,
            'active' => $this->active,
            'meta' => [
                'resourceType' => 'User',
                'created' => $this->created->format(\DateTimeInterface::ISO8601),
                'lastModified' => $this->lastModified->format(\DateTimeInterface::ISO8601),
                'version' => 'W/"' . $this->version . '"',
                'location' => '/scim/v2/Users/' . $this->id
            ]
        ];

        if ($this->externalId !== null) {
            $result['externalId'] = $this->externalId;
        }

        // 名前情報
        $name = [];
        if ($this->formattedName !== null) $name['formatted'] = $this->formattedName;
        if ($this->familyName !== null) $name['familyName'] = $this->familyName;
        if ($this->givenName !== null) $name['givenName'] = $this->givenName;
        if ($this->middleName !== null) $name['middleName'] = $this->middleName;

        if (!empty($name)) {
            $result['name'] = $name;
        }

        if ($this->displayName !== null) {
            $result['displayName'] = $this->displayName;
        }

        // 連絡先情報
        if (!empty($this->emails)) {
            $result['emails'] = $this->emails;
        }
        if (!empty($this->phoneNumbers)) {
            $result['phoneNumbers'] = $this->phoneNumbers;
        }
        if (!empty($this->addresses)) {
            $result['addresses'] = $this->addresses;
        }

        // エンタープライズ拡張
        $enterpriseExt = [];
        if ($this->employeeNumber !== null) $enterpriseExt['employeeNumber'] = $this->employeeNumber;
        if ($this->costCenter !== null) $enterpriseExt['costCenter'] = $this->costCenter;
        if ($this->organization !== null) $enterpriseExt['organization'] = $this->organization;
        if ($this->department !== null) $enterpriseExt['department'] = $this->department;
        if ($this->managerId !== null) {
            $enterpriseExt['manager'] = [
                'value' => $this->managerId,
                '$ref' => '/Users/' . $this->managerId
            ];
        }

        if (!empty($enterpriseExt)) {
            $result['urn:ietf:params:scim:schemas:extension:enterprise:2.0:User'] = $enterpriseExt;
            $result['schemas'][] = 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User';
        }

        return $result;
    }

    public function applyScimData(array $scimData): void
    {
        if (isset($scimData['userName'])) {
            $this->setUserName($scimData['userName']);
        }

        if (isset($scimData['active'])) {
            $this->setActive($scimData['active']);
        }

        if (isset($scimData['externalId'])) {
            $this->setExternalId($scimData['externalId']);
        }

        if (isset($scimData['displayName'])) {
            $this->setDisplayName($scimData['displayName']);
        }

        // 名前情報の処理
        if (isset($scimData['name'])) {
            $name = $scimData['name'];
            if (isset($name['formatted'])) $this->formattedName = $name['formatted'];
            if (isset($name['familyName'])) $this->familyName = $name['familyName'];
            if (isset($name['givenName'])) $this->givenName = $name['givenName'];
            if (isset($name['middleName'])) $this->middleName = $name['middleName'];
        }

        // 連絡先情報
        if (isset($scimData['emails'])) {
            $this->setEmails($scimData['emails']);
        }
        if (isset($scimData['phoneNumbers'])) {
            $this->phoneNumbers = $scimData['phoneNumbers'];
        }
        if (isset($scimData['addresses'])) {
            $this->addresses = $scimData['addresses'];
        }

        // エンタープライズ拡張
        $enterpriseKey = 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User';
        if (isset($scimData[$enterpriseKey])) {
            $enterprise = $scimData[$enterpriseKey];
            if (isset($enterprise['employeeNumber'])) $this->employeeNumber = $enterprise['employeeNumber'];
            if (isset($enterprise['costCenter'])) $this->costCenter = $enterprise['costCenter'];
            if (isset($enterprise['organization'])) $this->organization = $enterprise['organization'];
            if (isset($enterprise['department'])) $this->department = $enterprise['department'];
            if (isset($enterprise['manager']['value'])) $this->managerId = $enterprise['manager']['value'];
        }
    }
}
```

**ユーザーコントローラー**
```php
<?php

namespace ScimServer\Controller;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use ScimServer\Service\UserService;
use ScimServer\Utils\ScimUtils;

class UserController
{
    private UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function getUsers(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            
            $filter = $queryParams['filter'] ?? null;
            $startIndex = (int)($queryParams['startIndex'] ?? 1);
            $count = (int)($queryParams['count'] ?? 20);
            $attributes = isset($queryParams['attributes']) ? 
                explode(',', $queryParams['attributes']) : null;
            $excludedAttributes = isset($queryParams['excludedAttributes']) ? 
                explode(',', $queryParams['excludedAttributes']) : null;

            $result = $this->userService->getUsers([
                'filter' => $filter,
                'startIndex' => $startIndex,
                'count' => $count,
                'attributes' => $attributes,
                'excludedAttributes' => $excludedAttributes
            ]);

            $response->getBody()->write(json_encode($result));
            return $response->withHeader('Content-Type', 'application/scim+json');
        } catch (\Exception $e) {
            return $this->createErrorResponse($response, 500, 'Internal Server Error', $e->getMessage());
        }
    }

    public function getUser(Request $request, Response $response, array $args): Response
    {
        try {
            $id = $args['id'];
            $queryParams = $request->getQueryParams();
            
            $attributes = isset($queryParams['attributes']) ? 
                explode(',', $queryParams['attributes']) : null;
            $excludedAttributes = isset($queryParams['excludedAttributes']) ? 
                explode(',', $queryParams['excludedAttributes']) : null;

            $user = $this->userService->getUserById($id, $attributes, $excludedAttributes);
            
            if ($user === null) {
                return $this->createErrorResponse($response, 404, 'Resource not found', "User {$id} not found");
            }

            $response->getBody()->write(json_encode($user));
            return $response->withHeader('Content-Type', 'application/scim+json');
        } catch (\Exception $e) {
            return $this->createErrorResponse($response, 500, 'Internal Server Error', $e->getMessage());
        }
    }

    public function createUser(Request $request, Response $response): Response
    {
        try {
            $userData = json_decode($request->getBody()->getContents(), true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                return $this->createErrorResponse($response, 400, 'Invalid JSON', 'Request body is not valid JSON');
            }

            // ユーザー名の重複チェック
            $existingUser = $this->userService->getUserByUserName($userData['userName']);
            if ($existingUser !== null) {
                return $this->createErrorResponse(
                    $response, 
                    409, 
                    'uniqueness', 
                    "User with userName {$userData['userName']} already exists"
                );
            }

            $createdUser = $this->userService->createUser($userData);
            
            $response->getBody()->write(json_encode($createdUser));
            return $response
                ->withStatus(201)
                ->withHeader('Content-Type', 'application/scim+json')
                ->withHeader('Location', "/scim/v2/Users/{$createdUser['id']}");
        } catch (\Exception $e) {
            return $this->createErrorResponse($response, 400, 'Invalid request', $e->getMessage());
        }
    }

    public function updateUser(Request $request, Response $response, array $args): Response
    {
        try {
            $id = $args['id'];
            $userData = json_decode($request->getBody()->getContents(), true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                return $this->createErrorResponse($response, 400, 'Invalid JSON', 'Request body is not valid JSON');
            }

            $existingUser = $this->userService->getUserById($id);
            if ($existingUser === null) {
                return $this->createErrorResponse($response, 404, 'Resource not found', "User {$id} not found");
            }

            $userData['id'] = $id;
            $updatedUser = $this->userService->updateUser($userData);

            $response->getBody()->write(json_encode($updatedUser));
            return $response->withHeader('Content-Type', 'application/scim+json');
        } catch (\Exception $e) {
            return $this->createErrorResponse($response, 400, 'Invalid request', $e->getMessage());
        }
    }

    public function patchUser(Request $request, Response $response, array $args): Response
    {
        try {
            $id = $args['id'];
            $patchRequest = json_decode($request->getBody()->getContents(), true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                return $this->createErrorResponse($response, 400, 'Invalid JSON', 'Request body is not valid JSON');
            }

            $existingUser = $this->userService->getUserById($id);
            if ($existingUser === null) {
                return $this->createErrorResponse($response, 404, 'Resource not found', "User {$id} not found");
            }

            $updatedUser = $this->userService->patchUser($id, $patchRequest);

            $response->getBody()->write(json_encode($updatedUser));
            return $response->withHeader('Content-Type', 'application/scim+json');
        } catch (\Exception $e) {
            return $this->createErrorResponse($response, 400, 'Invalid request', $e->getMessage());
        }
    }

    public function deleteUser(Request $request, Response $response, array $args): Response
    {
        try {
            $id = $args['id'];

            $existingUser = $this->userService->getUserById($id);
            if ($existingUser === null) {
                return $this->createErrorResponse($response, 404, 'Resource not found', "User {$id} not found");
            }

            $this->userService->deleteUser($id);

            return $response->withStatus(204);
        } catch (\Exception $e) {
            return $this->createErrorResponse($response, 500, 'Internal Server Error', $e->getMessage());
        }
    }

    private function createErrorResponse(Response $response, int $status, string $scimType, string $detail): Response
    {
        $errorResponse = [
            'schemas' => ['urn:ietf:params:scim:api:messages:2.0:Error'],
            'status' => $status,
            'scimType' => $scimType,
            'detail' => $detail
        ];

        $response->getBody()->write(json_encode($errorResponse));
        return $response
            ->withStatus($status)
            ->withHeader('Content-Type', 'application/scim+json');
    }
}
```

### 6.5.5 Python/FastAPI による SCIM 実装

Microsoft Entra IDと連携するSCIM 2.0エンドポイントをPython/FastAPIで実装する包括的なガイドです。

### プロジェクト構成

```
scim-server/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── scim_user.py
│   │   ├── scim_group.py
│   │   └── scim_schema.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── users.py
│   │   ├── groups.py
│   │   ├── schemas.py
│   │   └── service_provider.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── security.py
│   │   └── database.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   └── group_service.py
│   └── utils/
│       ├── __init__.py
│       ├── scim_utils.py
│       └── validators.py
├── tests/
├── requirements.txt
└── docker-compose.yml
```

### 依存関係の設定

**requirements.txt**
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
httpx==0.25.2
pytest==7.4.3
pytest-asyncio==0.21.1
alembic==1.12.1
```

### データモデルの実装

**app/models/scim_user.py**
```python
from sqlalchemy import Column, String, Boolean, DateTime, Integer, JSON, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

# ユーザーとグループの関連テーブル
user_group_association = Table(
    'user_group_association',
    Base.metadata,
    Column('user_id', String, ForeignKey('users.id')),
    Column('group_id', String, ForeignKey('groups.id'))
)

class User(Base):
    __tablename__ = 'users'
    
    # SCIM必須属性
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    external_id = Column(String, unique=True, index=True)
    user_name = Column(String, unique=True, nullable=False, index=True)
    active = Column(Boolean, default=True)
    
    # 名前属性
    formatted_name = Column(String)
    family_name = Column(String)
    given_name = Column(String)
    middle_name = Column(String)
    honorific_prefix = Column(String)
    honorific_suffix = Column(String)
    
    # 連絡先情報
    emails = Column(JSON, default=list)
    phone_numbers = Column(JSON, default=list)
    addresses = Column(JSON, default=list)
    
    # エンタープライズ拡張
    employee_number = Column(String)
    cost_center = Column(String)
    organization = Column(String)
    division = Column(String)
    department = Column(String)
    manager_id = Column(String, ForeignKey('users.id'))
    
    # メタデータ
    created = Column(DateTime, default=datetime.utcnow)
    last_modified = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    version = Column(Integer, default=1)
    
    # リレーション
    groups = relationship('Group', secondary=user_group_association, back_populates='members')
    manager = relationship('User', remote_side=[id])
    
    def to_scim_dict(self, attributes=None, exclude_attributes=None):
        """SCIMフォーマットに変換"""
        scim_user = {
            "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
            "id": self.id,
            "externalId": self.external_id,
            "userName": self.user_name,
            "active": self.active,
            "meta": {
                "resourceType": "User",
                "created": self.created.isoformat() + "Z",
                "lastModified": self.last_modified.isoformat() + "Z",
                "version": f'W/"{self.version}"',
                "location": f"/Users/{self.id}"
            }
        }
        
        # 名前情報
        if any([self.formatted_name, self.family_name, self.given_name]):
            scim_user["name"] = {}
            if self.formatted_name:
                scim_user["name"]["formatted"] = self.formatted_name
            if self.family_name:
                scim_user["name"]["familyName"] = self.family_name
            if self.given_name:
                scim_user["name"]["givenName"] = self.given_name
            if self.middle_name:
                scim_user["name"]["middleName"] = self.middle_name
            if self.honorific_prefix:
                scim_user["name"]["honorificPrefix"] = self.honorific_prefix
            if self.honorific_suffix:
                scim_user["name"]["honorificSuffix"] = self.honorific_suffix
        
        # Email情報
        if self.emails:
            scim_user["emails"] = self.emails
        
        # 電話番号
        if self.phone_numbers:
            scim_user["phoneNumbers"] = self.phone_numbers
        
        # 住所
        if self.addresses:
            scim_user["addresses"] = self.addresses
        
        # エンタープライズ拡張
        enterprise_ext = {}
        if self.employee_number:
            enterprise_ext["employeeNumber"] = self.employee_number
        if self.cost_center:
            enterprise_ext["costCenter"] = self.cost_center
        if self.organization:
            enterprise_ext["organization"] = self.organization
        if self.division:
            enterprise_ext["division"] = self.division
        if self.department:
            enterprise_ext["department"] = self.department
        if self.manager_id:
            enterprise_ext["manager"] = {
                "value": self.manager_id,
                "$ref": f"/Users/{self.manager_id}"
            }
        
        if enterprise_ext:
            scim_user["urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"] = enterprise_ext
            scim_user["schemas"].append("urn:ietf:params:scim:schemas:extension:enterprise:2.0:User")
        
        # グループ情報
        if self.groups:
            scim_user["groups"] = [
                {
                    "value": group.id,
                    "$ref": f"/Groups/{group.id}",
                    "display": group.display_name
                }
                for group in self.groups
            ]
        
        # 属性フィルタリング
        if attributes:
            filtered_user = {"schemas": scim_user["schemas"], "id": scim_user["id"]}
            for attr in attributes:
                if attr in scim_user:
                    filtered_user[attr] = scim_user[attr]
            return filtered_user
        
        if exclude_attributes:
            for attr in exclude_attributes:
                scim_user.pop(attr, None)
        
        return scim_user
```

### APIエンドポイントの実装

**app/api/users.py**
```python
from fastapi import APIRouter, HTTPException, Query, Depends, Response
from sqlalchemy.orm import Session
from typing import Optional, List

from ..models.scim_schema import ScimUser, PatchRequest, ListResponse, ScimError
from ..services.user_service import UserService
from ..core.database import get_db
from ..core.security import verify_bearer_token
from ..utils.scim_utils import parse_filter, parse_attributes

router = APIRouter(prefix="/Users", tags=["Users"])

@router.get("", response_model=ListResponse)
async def get_users(
    filter: Optional[str] = Query(None),
    startIndex: int = Query(1, ge=1),
    count: int = Query(20, ge=1, le=100),
    attributes: Optional[str] = Query(None),
    excludedAttributes: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    token: str = Depends(verify_bearer_token)
):
    """ユーザー一覧取得"""
    try:
        service = UserService(db)
        
        # フィルター解析
        filter_dict = parse_filter(filter) if filter else None
        
        # 属性解析
        attrs = parse_attributes(attributes) if attributes else None
        excluded_attrs = parse_attributes(excludedAttributes) if excludedAttributes else None
        
        users, total = service.get_users(
            filter=filter_dict,
            start_index=startIndex,
            count=count
        )
        
        # SCIMフォーマットに変換
        scim_users = [
            user.to_scim_dict(attributes=attrs, exclude_attributes=excluded_attrs)
            for user in users
        ]
        
        return ListResponse(
            totalResults=total,
            startIndex=startIndex,
            itemsPerPage=len(scim_users),
            Resources=scim_users
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", status_code=201)
async def create_user(
    user_data: ScimUser,
    db: Session = Depends(get_db),
    token: str = Depends(verify_bearer_token)
):
    """ユーザー作成"""
    service = UserService(db)
    
    # ユーザー名の重複チェック
    if service.get_user_by_username(user_data.userName):
        raise HTTPException(
            status_code=409,
            detail=ScimError(
                status=409,
                scimType="uniqueness",
                detail=f"User with userName {user_data.userName} already exists"
            ).dict()
        )
    
    try:
        user = service.create_user(user_data.dict(exclude_unset=True))
        return user.to_scim_dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{user_id}")
async def patch_user(
    user_id: str,
    patch_request: PatchRequest,
    db: Session = Depends(get_db),
    token: str = Depends(verify_bearer_token)
):
    """ユーザー部分更新"""
    service = UserService(db)
    
    user = service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail=ScimError(
                status=404,
                detail=f"User {user_id} not found"
            ).dict()
        )
    
    try:
        updated_user = service.patch_user(user_id, patch_request.Operations)
        return updated_user.to_scim_dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    token: str = Depends(verify_bearer_token)
):
    """ユーザー削除"""
    service = UserService(db)
    
    user = service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail=ScimError(
                status=404,
                detail=f"User {user_id} not found"
            ).dict()
        )
    
    service.delete_user(user_id)
    return Response(status_code=204)
```

### ビジネスロジックの実装

**app/services/user_service.py**
```python
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from typing import List, Dict, Any, Optional, Tuple
import re

from ..models.scim_user import User
from ..models.scim_schema import PatchOperation
from ..utils.scim_utils import apply_patch_operation

class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_users(self, filter: Optional[Dict] = None, start_index: int = 1, 
                  count: int = 20) -> Tuple[List[User], int]:
        """ユーザー一覧取得"""
        query = self.db.query(User)
        
        # フィルタリング
        if filter:
            query = self._apply_filter(query, filter)
        
        # 総数取得
        total = query.count()
        
        # ページネーション
        query = query.offset(start_index - 1).limit(count)
        
        return query.all(), total
    
    def create_user(self, user_data: Dict[str, Any]) -> User:
        """ユーザー作成"""
        # エンタープライズ拡張の処理
        enterprise_data = user_data.pop(
            "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User", {}
        )
        
        user = User()
        
        # 基本属性の設定
        for key, value in user_data.items():
            if hasattr(user, self._to_snake_case(key)):
                setattr(user, self._to_snake_case(key), value)
        
        # 名前情報の処理
        if "name" in user_data:
            name_data = user_data["name"]
            for key, value in name_data.items():
                if hasattr(user, self._to_snake_case(key)):
                    setattr(user, self._to_snake_case(key), value)
        
        # エンタープライズ属性の設定
        for key, value in enterprise_data.items():
            if key == "manager" and isinstance(value, dict):
                user.manager_id = value.get("value")
            elif hasattr(user, self._to_snake_case(key)):
                setattr(user, self._to_snake_case(key), value)
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def patch_user(self, user_id: str, operations: List[PatchOperation]) -> User:
        """ユーザー部分更新"""
        user = self.get_user_by_id(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        user_dict = user.to_scim_dict()
        
        for operation in operations:
            user_dict = apply_patch_operation(user_dict, operation)
        
        # パッチ適用後のデータでユーザー更新
        return self.update_user(user_id, user_dict)
    
    def _apply_filter(self, query, filter_dict: Dict) -> Any:
        """フィルター適用"""
        attribute = filter_dict.get("attribute")
        operator = filter_dict.get("operator")
        value = filter_dict.get("value")
        
        if attribute == "userName":
            if operator == "eq":
                return query.filter(User.user_name == value)
            elif operator == "co":
                return query.filter(User.user_name.contains(value))
        elif attribute == "active":
            return query.filter(User.active == (value.lower() == "true"))
        elif attribute == "externalId":
            return query.filter(User.external_id == value)
        
        return query
    
    def _to_snake_case(self, name: str) -> str:
        """キャメルケースをスネークケースに変換"""
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()
```

### セキュリティ設定

**app/core/security.py**
```python
from fastapi import HTTPException, Header
from typing import Optional
import os
import hmac

# Bearer トークン（環境変数から取得）
SCIM_BEARER_TOKEN = os.getenv("SCIM_BEARER_TOKEN", "your-secure-token-here")

async def verify_bearer_token(authorization: Optional[str] = Header(None)) -> str:
    """Bearerトークンの検証"""
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing"
        )
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header format"
        )
    
    token = parts[1]
    if not compare_digest(token, SCIM_BEARER_TOKEN):
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
    
    return token

def compare_digest(a: str, b: str) -> bool:
    """タイミング攻撃を防ぐための安全な文字列比較"""
    return hmac.compare_digest(a.encode(), b.encode())
```

### メインアプリケーション

**app/main.py**
```python
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from .api import users, groups, schemas, service_provider
from .core.config import settings
from .core.database import engine, Base
from .models.scim_schema import ScimError

# ロギング設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# データベーステーブル作成
Base.metadata.create_all(bind=engine)

# FastAPIアプリケーション作成
app = FastAPI(
    title="SCIM 2.0 Server",
    description="SCIM 2.0 compliant server for Microsoft Entra ID",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(users.router, prefix="/scim/v2")
app.include_router(groups.router, prefix="/scim/v2")
app.include_router(schemas.router, prefix="/scim/v2")
app.include_router(service_provider.router, prefix="/scim/v2")

@app.get("/health")
async def health_check():
    """ヘルスチェック"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Docker設定

**docker-compose.yml**
```yaml
version: '3.8'

services:
  scim-server:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://scim:scim123@postgres:5432/scimdb
      - SCIM_BEARER_TOKEN=${SCIM_BEARER_TOKEN}
      - PYTHONPATH=/app
    depends_on:
      - postgres
    volumes:
      - ./app:/app/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=scim
      - POSTGRES_PASSWORD=scim123
      - POSTGRES_DB=scimdb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Microsoft Entra IDでの設定

1. **エンタープライズアプリケーションの作成**
   - Microsoft Entra ID管理センターで「エンタープライズアプリケーション」を選択
   - 「新しいアプリケーション」→「独自のアプリケーションの作成」
   - 「ギャラリーにないその他のアプリケーション」を選択

2. **プロビジョニングの設定**
   - 「プロビジョニング」セクションで「自動」を選択
   - テナント URL: `https://your-domain.com/scim/v2`
   - シークレットトークン: 環境変数で設定したBearerトークン
   - 「テスト接続」でSCIMエンドポイントとの疎通を確認

3. **属性マッピングの設定**
   ```yaml
   Microsoft Entra ID属性 → SCIM属性:
   - userPrincipalName → userName
   - displayName → name.formatted
   - givenName → name.givenName
   - surname → name.familyName
   - mail → emails[type eq "work"].value
   - department → urn:ietf:params:scim:schemas:extension:enterprise:2.0:User.department
   - jobTitle → title
   - employeeId → urn:ietf:params:scim:schemas:extension:enterprise:2.0:User.employeeNumber
   ```

4. **スコープの設定**
   - 同期対象のユーザーとグループを指定
   - 条件付きアクセスによる同期制御

### 運用時の考慮事項

**監視とログ**
```python
import logging
from datetime import datetime

# 構造化ログの設定
logger = logging.getLogger("scim_provisioning")

def log_provisioning_event(event_type: str, user_id: str, details: dict):
    """プロビジョニングイベントのログ記録"""
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "user_id": user_id,
        "details": details
    }
    logger.info(json.dumps(log_entry))
```

**エラーハンドリング**
```python
from fastapi import HTTPException
from .models.scim_schema import ScimError

def handle_scim_error(error: Exception, status_code: int = 500):
    """SCIM準拠エラーレスポンス"""
    scim_error = ScimError(
        status=status_code,
        detail=str(error),
        scimType="invalidValue" if status_code == 400 else None
    )
    raise HTTPException(status_code=status_code, detail=scim_error.dict())
```

**パフォーマンス最適化**
```python
from sqlalchemy import Index
from .models.scim_user import User

# データベースインデックスの追加
Index('idx_user_external_id', User.external_id)
Index('idx_user_username', User.user_name)
Index('idx_user_active', User.active)
```

この実装により、Microsoft Entra IDからの自動プロビジョニングが可能になり、ユーザーのライフサイクル管理が大幅に効率化されます。
        C --> D[アプリケーションアカウント作成]
        D --> E[初回ログイン通知]
    end
    
    subgraph "異動プロセス"
        F[HR システム更新] --> G[Entra ID 属性更新]
        G --> H[SCIM 同期実行]
        H --> I[ロール・権限更新]
        I --> J[アクセスレビュー実行]
    end
    
    subgraph "退社プロセス"
        K[HR システム更新] --> L[Entra ID アカウント無効化]
        L --> M[SCIM 無効化通知]
        M --> N[アプリケーションアクセス停止]
        N --> O[データ保持・削除処理]
    end
```

### 自動化ワークフローの実装

```python
# Python での ライフサイクル管理自動化
from enum import Enum
from datetime import datetime, timedelta
import asyncio

class UserLifecycleEvent(Enum):
    CREATED = "created"
    UPDATED = "updated"
    DEACTIVATED = "deactivated"
    REACTIVATED = "reactivated"
    DELETED = "deleted"

class LifecycleWorkflowEngine:
    def __init__(self, scim_client, notification_service, audit_service):
        self.scim_client = scim_client
        self.notification_service = notification_service
        self.audit_service = audit_service
        self.workflows = {}
        
        # デフォルトワークフローの登録
        self.register_default_workflows()
    
    def register_workflow(self, event_type, workflow_func):
        """ワークフローの登録"""
        if event_type not in self.workflows:
            self.workflows[event_type] = []
        self.workflows[event_type].append(workflow_func)
    
    async def process_lifecycle_event(self, event_type, user_data, context=None):
        """ライフサイクルイベントの処理"""
        workflows = self.workflows.get(event_type, [])
        
        results = []
        for workflow in workflows:
            try:
                result = await workflow(user_data, context)
                results.append(result)
                
                # 監査ログの記録
                await self.audit_service.log_workflow_execution(
                    event_type=event_type,
                    workflow_name=workflow.__name__,
                    user_id=user_data.get('id'),
                    result=result,
                    timestamp=datetime.now()
                )
                
            except Exception as e:
                error_result = {'error': str(e), 'workflow': workflow.__name__}
                results.append(error_result)
                
                await self.audit_service.log_workflow_error(
                    event_type=event_type,
                    workflow_name=workflow.__name__,
                    user_id=user_data.get('id'),
                    error=str(e),
                    timestamp=datetime.now()
                )
        
        return results
    
    def register_default_workflows(self):
        """デフォルトワークフローの登録"""
        
        # 新規ユーザー作成時のワークフロー
        @self.register_workflow(UserLifecycleEvent.CREATED)
        async def new_user_onboarding(user_data, context):
            # デフォルトグループへの追加
            default_groups = ['all-users', 'new-employees']
            for group_name in default_groups:
                await self.add_user_to_group(user_data['id'], group_name)
            
            # ウェルカムメールの送信
            await self.notification_service.send_welcome_email(
                user_data['email'],
                user_data['name']
            )
            
            # 初期パスワード設定の通知
            await self.notification_service.send_password_setup_notification(
                user_data['email']
            )
            
            return {'status': 'onboarding_completed', 'groups_added': default_groups}
        
        # ユーザー更新時のワークフロー
        @self.register_workflow(UserLifecycleEvent.UPDATED)
        async def user_update_processing(user_data, context):
            changes = context.get('changes', {})
            
            # 部署変更の処理
            if 'department' in changes:
                await self.handle_department_change(
                    user_data['id'],
                    changes['department']['old'],
                    changes['department']['new']
                )
            
            # 職位変更の処理
            if 'jobTitle' in changes:
                await self.handle_role_change(
                    user_data['id'],
                    changes['jobTitle']['old'],
                    changes['jobTitle']['new']
                )
            
            return {'status': 'update_processed', 'changes': list(changes.keys())}
        
        # ユーザー無効化時のワークフロー
        @self.register_workflow(UserLifecycleEvent.DEACTIVATED)
        async def user_deactivation(user_data, context):
            # アクティブセッションの無効化
            await self.revoke_user_sessions(user_data['id'])
            
            # 管理者への通知
            await self.notification_service.notify_managers_of_deactivation(
                user_data['email'],
                user_data['manager']
            )
            
            # アクセス権の一時保留
            await self.suspend_user_access(user_data['id'])
            
            return {'status': 'deactivation_completed'}
        
        # ユーザー削除時のワークフロー
        @self.register_workflow(UserLifecycleEvent.DELETED)
        async def user_deletion(user_data, context):
            # データ保持ポリシーの適用
            retention_days = context.get('retention_days', 30)
            deletion_date = datetime.now() + timedelta(days=retention_days)
            
            # データのアーカイブ
            await self.archive_user_data(user_data['id'], deletion_date)
            
            # 関連リソースのクリーンアップ
            await self.cleanup_user_resources(user_data['id'])
            
            return {
                'status': 'deletion_scheduled',
                'deletion_date': deletion_date.isoformat()
            }
    
    async def handle_department_change(self, user_id, old_dept, new_dept):
        """部署変更の処理"""
        # 旧部署グループから削除
        if old_dept:
            old_group = f"dept-{old_dept.lower().replace(' ', '-')}"
            await self.remove_user_from_group(user_id, old_group)
        
        # 新部署グループに追加
        if new_dept:
            new_group = f"dept-{new_dept.lower().replace(' ', '-')}"
            await self.add_user_to_group(user_id, new_group)
        
        # 部署別リソースへのアクセス権更新
        await self.update_department_access(user_id, old_dept, new_dept)
    
    async def handle_role_change(self, user_id, old_role, new_role):
        """職位変更の処理"""
        # 管理者権限の付与/取り消し
        if 'manager' in new_role.lower() and 'manager' not in old_role.lower():
            await self.grant_manager_permissions(user_id)
        elif 'manager' in old_role.lower() and 'manager' not in new_role.lower():
            await self.revoke_manager_permissions(user_id)
        
        # 職位別グループの更新
        await self.update_role_groups(user_id, old_role, new_role)
```

### 自動化されたアクセスレビューの実装

```javascript
// アクセスレビュー自動化システム
class AutomatedAccessReviewService {
    constructor(userRepository, auditService, notificationService) {
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }
    
    async schedulePeriodicReviews() {
        // 月次レビュー（高権限ユーザー）
        this.scheduleReview('high_privilege_monthly', {
            frequency: 'monthly',
            criteria: { roles: ['admin', 'manager'] },
            reviewers: ['security_team'],
            autoRemoval: false
        });
        
        // 四半期レビュー（全ユーザー）
        this.scheduleReview('quarterly_all_users', {
            frequency: 'quarterly',
            criteria: { active: true },
            reviewers: ['direct_manager', 'hr_team'],
            autoRemoval: true,
            inactiveThreshold: 90 // 90日間未使用で自動削除検討
        });
        
        // 年次レビュー（包括的）
        this.scheduleReview('annual_comprehensive', {
            frequency: 'yearly',
            criteria: {},
            reviewers: ['security_team', 'compliance_team'],
            autoRemoval: false,
            includeDataAccess: true
        });
    }
    
    async executeAccessReview(reviewConfig) {
        const users = await this.getUsersForReview(reviewConfig.criteria);
        const reviewId = this.generateReviewId();
        
        const reviewResults = {
            reviewId,
            config: reviewConfig,
            startDate: new Date(),
            users: [],
            recommendations: []
        };
        
        for (const user of users) {
            const userReview = await this.reviewUserAccess(user, reviewConfig);
            reviewResults.users.push(userReview);
            
            if (userReview.recommendation === 'remove' && reviewConfig.autoRemoval) {
                await this.scheduleUserRemoval(user, userReview.reason);
            }
        }
        
        // レビュー結果の通知
        await this.notifyReviewers(reviewResults);
        
        // 監査ログの記録
        await this.auditService.logAccessReview(reviewResults);
        
        return reviewResults;
    }
    
    async reviewUserAccess(user, config) {
        const accessAnalysis = {
            userId: user.id,
            email: user.email,
            lastLoginDate: user.lastLoginAt,
            daysSinceLastLogin: this.calculateDaysSinceLastLogin(user.lastLoginAt),
            permissions: await this.getUserPermissions(user.id),
            groupMemberships: await this.getUserGroups(user.id),
            accessHistory: await this.getAccessHistory(user.id, 90), // 90日間
            recommendation: 'retain'
        };
        
        // 自動判定ルールの適用
        if (accessAnalysis.daysSinceLastLogin > config.inactiveThreshold) {
            accessAnalysis.recommendation = 'remove';
            accessAnalysis.reason = `Inactive for ${accessAnalysis.daysSinceLastLogin} days`;
        } else if (this.hasExcessivePermissions(accessAnalysis.permissions, user)) {
            accessAnalysis.recommendation = 'reduce_permissions';
            accessAnalysis.reason = 'Excessive permissions detected';
        } else if (this.hasOrphanedAccess(accessAnalysis.groupMemberships, user)) {
            accessAnalysis.recommendation = 'review_groups';
            accessAnalysis.reason = 'Orphaned group memberships found';
        }
        
        return accessAnalysis;
    }
    
    hasExcessivePermissions(permissions, user) {
        // 職位と権限の整合性チェック
        const rolePermissionMap = {
            'developer': ['read_code', 'write_code', 'deploy_dev'],
            'manager': ['read_reports', 'manage_team', 'approve_requests'],
            'admin': ['user_management', 'system_config', 'security_settings']
        };
        
        const expectedPermissions = rolePermissionMap[user.primaryRole] || [];
        const excessivePermissions = permissions.filter(perm => 
            !expectedPermissions.includes(perm) && 
            !expectedPermissions.some(expected => perm.startsWith(expected))
        );
        
        return excessivePermissions.length > 2; // 閾値
    }
    
    async scheduleUserRemoval(user, reason) {
        const removalTask = {
            userId: user.id,
            scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後
            reason,
            requestedBy: 'automated_access_review',
            status: 'scheduled'
        };
        
        await this.userRepository.scheduleRemoval(removalTask);
        
        // 予定通知の送信
        await this.notificationService.sendRemovalNotification(
            user.email,
            user.manager,
            removalTask
        );
    }
}
```

## 6.5 実装例：SCIM エンドポイントの開発

### Node.js Express での SCIM サーバー実装

```javascript
// SCIM サーバーの基本実装
const express = require('express');
const { body, param, query, validationResult } = require('express-validator');

class SCIMServer {
    constructor(userRepository, groupRepository) {
        this.app = express();
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        
        this.setupMiddleware();
        this.setupRoutes();
    }
    
    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(this.authenticateRequest.bind(this));
        this.app.use(this.validateContentType.bind(this));
    }
    
    authenticateRequest(req, res, next) {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
                detail: 'Authorization header required',
                status: '401'
            });
        }
        
        const token = authHeader.substring(7);
        
        // トークン検証ロジック
        if (!this.validateToken(token)) {
            return res.status(401).json({
                schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
                detail: 'Invalid token',
                status: '401'
            });
        }
        
        next();
    }
    
    validateContentType(req, res, next) {
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            if (!req.is('application/scim+json') && !req.is('application/json')) {
                return res.status(400).json({
                    schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
                    detail: 'Content-Type must be application/scim+json or application/json',
                    status: '400'
                });
            }
        }
        next();
    }
    
    setupRoutes() {
        // ServiceProviderConfig エンドポイント
        this.app.get('/scim/v2/ServiceProviderConfig', this.getServiceProviderConfig.bind(this));
        
        // Schemas エンドポイント
        this.app.get('/scim/v2/Schemas', this.getSchemas.bind(this));
        this.app.get('/scim/v2/Schemas/:schemaId', this.getSchema.bind(this));
        
        // ResourceTypes エンドポイント
        this.app.get('/scim/v2/ResourceTypes', this.getResourceTypes.bind(this));
        
        // Users エンドポイント
        this.app.get('/scim/v2/Users', this.getUsers.bind(this));
        this.app.post('/scim/v2/Users', 
            [
                body('userName').notEmpty().withMessage('userName is required'),
                body('name.givenName').optional().isString(),
                body('name.familyName').optional().isString(),
                body('emails').isArray().withMessage('emails must be an array')
            ],
            this.createUser.bind(this)
        );
        this.app.get('/scim/v2/Users/:id', this.getUser.bind(this));
        this.app.put('/scim/v2/Users/:id', this.updateUser.bind(this));
        this.app.patch('/scim/v2/Users/:id', this.patchUser.bind(this));
        this.app.delete('/scim/v2/Users/:id', this.deleteUser.bind(this));
        
        // Groups エンドポイント
        this.app.get('/scim/v2/Groups', this.getGroups.bind(this));
        this.app.post('/scim/v2/Groups', this.createGroup.bind(this));
        this.app.get('/scim/v2/Groups/:id', this.getGroup.bind(this));
        this.app.put('/scim/v2/Groups/:id', this.updateGroup.bind(this));
        this.app.patch('/scim/v2/Groups/:id', this.patchGroup.bind(this));
        this.app.delete('/scim/v2/Groups/:id', this.deleteGroup.bind(this));
        
        // エラーハンドリング
        this.app.use(this.errorHandler.bind(this));
    }
    
    // Users エンドポイントの実装
    async getUsers(req, res) {
        try {
            const { startIndex = 1, count = 20, filter } = req.query;
            
            const result = await this.userRepository.getUsers({
                startIndex: parseInt(startIndex),
                count: parseInt(count),
                filter: filter
            });
            
            const scimUsers = result.users.map(user => this.toSCIMUser(user));
            
            res.json({
                schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
                totalResults: result.totalResults,
                startIndex: parseInt(startIndex),
                itemsPerPage: scimUsers.length,
                Resources: scimUsers
            });
            
        } catch (error) {
            this.handleError(res, error);
        }
    }
    
    async createUser(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
                detail: 'Invalid request',
                status: '400'
            });
        }
        
        try {
            const scimUser = req.body;
            const internalUser = this.fromSCIMUser(scimUser);
            
            const createdUser = await this.userRepository.createUser(internalUser);
            const responseUser = this.toSCIMUser(createdUser);
            
            res.status(201).json(responseUser);
            
        } catch (error) {
            if (error.code === 'DUPLICATE_USER') {
                return res.status(409).json({
                    schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
                    detail: 'User already exists',
                    status: '409'
                });
            }
            
            this.handleError(res, error);
        }
    }
    
    async getUser(req, res) {
        try {
            const userId = req.params.id;
            const user = await this.userRepository.getUserById(userId);
            
            if (!user) {
                return res.status(404).json({
                    schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
                    detail: 'User not found',
                    status: '404'
                });
            }
            
            res.json(this.toSCIMUser(user));
            
        } catch (error) {
            this.handleError(res, error);
        }
    }
    
    async patchUser(req, res) {
        try {
            const userId = req.params.id;
            const patchOps = req.body.Operations;
            
            const user = await this.userRepository.getUserById(userId);
            if (!user) {
                return res.status(404).json({
                    schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
                    detail: 'User not found',
                    status: '404'
                });
            }
            
            // PATCH 操作の適用
            const updatedUser = await this.applyPatchOperations(user, patchOps);
            const savedUser = await this.userRepository.updateUser(userId, updatedUser);
            
            res.json(this.toSCIMUser(savedUser));
            
        } catch (error) {
            this.handleError(res, error);
        }
    }
    
    async applyPatchOperations(user, operations) {
        let updatedUser = { ...user };
        
        for (const operation of operations) {
            const { op, path, value } = operation;
            
            switch (op.toLowerCase()) {
                case 'add':
                    updatedUser = this.applyAddOperation(updatedUser, path, value);
                    break;
                case 'remove':
                    updatedUser = this.applyRemoveOperation(updatedUser, path);
                    break;
                case 'replace':
                    updatedUser = this.applyReplaceOperation(updatedUser, path, value);
                    break;
                default:
                    throw new Error(`Unsupported operation: ${op}`);
            }
        }
        
        return updatedUser;
    }
    
    applyReplaceOperation(user, path, value) {
        if (path === 'active') {
            user.active = value;
        } else if (path === 'name.givenName') {
            user.firstName = value;
        } else if (path === 'name.familyName') {
            user.lastName = value;
        } else if (path.startsWith('emails[')) {
            // emails[type eq "work"].value の形式
            const emailIndex = this.parseEmailPath(path);
            if (user.emails && user.emails[emailIndex]) {
                user.emails[emailIndex].value = value;
            }
        }
        
        return user;
    }
    
    // SCIM User オブジェクトへの変換
    toSCIMUser(internalUser) {
        return {
            schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
            id: internalUser.id,
            externalId: internalUser.externalId,
            userName: internalUser.username,
            name: {
                formatted: `${internalUser.firstName} ${internalUser.lastName}`,
                givenName: internalUser.firstName,
                familyName: internalUser.lastName
            },
            displayName: internalUser.displayName,
            emails: internalUser.emails ? internalUser.emails.map(email => ({
                value: email.value,
                type: email.type || 'work',
                primary: email.primary || false
            })) : [],
            active: internalUser.active,
            groups: internalUser.groups ? internalUser.groups.map(group => ({
                value: group.id,
                display: group.name
            })) : [],
            meta: {
                resourceType: 'User',
                created: internalUser.createdAt,
                lastModified: internalUser.updatedAt,
                version: `W/"${internalUser.version || '1'}"`,
                location: `/scim/v2/Users/${internalUser.id}`
            }
        };
    }
    
    // 内部 User オブジェクトへの変換
    fromSCIMUser(scimUser) {
        return {
            externalId: scimUser.externalId,
            username: scimUser.userName,
            firstName: scimUser.name?.givenName,
            lastName: scimUser.name?.familyName,
            displayName: scimUser.displayName,
            emails: scimUser.emails || [],
            active: scimUser.active !== false, // デフォルトは true
            groups: scimUser.groups || []
        };
    }
    
    getServiceProviderConfig(req, res) {
        res.json({
            schemas: ['urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig'],
            patch: {
                supported: true
            },
            bulk: {
                supported: false
            },
            filter: {
                supported: true,
                maxResults: 200
            },
            changePassword: {
                supported: false
            },
            sort: {
                supported: true
            },
            etag: {
                supported: true
            },
            authenticationSchemes: [
                {
                    name: 'OAuth Bearer Token',
                    description: 'Authentication scheme using the OAuth Bearer Token Standard',
                    specUri: 'http://www.rfc-editor.org/info/rfc6750',
                    type: 'oauthbearertoken'
                }
            ],
            meta: {
                location: '/scim/v2/ServiceProviderConfig',
                resourceType: 'ServiceProviderConfig',
                created: '2024-01-01T00:00:00Z',
                lastModified: '2024-01-01T00:00:00Z'
            }
        });
    }
    
    errorHandler(error, req, res, next) {
        console.error('SCIM Error:', error);
        
        res.status(500).json({
            schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
            detail: 'Internal server error',
            status: '500'
        });
    }
}

// サーバーの起動
const userRepository = new UserRepository();
const groupRepository = new GroupRepository();
const scimServer = new SCIMServer(userRepository, groupRepository);

const PORT = process.env.PORT || 3000;
scimServer.app.listen(PORT, () => {
    console.log(`SCIM Server running on port ${PORT}`);
});
```

### SCIM プロビジョニングのテスト

```javascript
// SCIM エンドポイントのテストスイート
const request = require('supertest');
const { expect } = require('chai');

describe('SCIM 2.0 API Tests', () => {
    let app;
    let authToken;
    
    before(async () => {
        app = new SCIMServer(mockUserRepository, mockGroupRepository).app;
        authToken = 'mock-auth-token';
    });
    
    describe('User Provisioning', () => {
        it('should create a new user', async () => {
            const newUser = {
                schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
                userName: 'test.user',
                name: {
                    givenName: 'Test',
                    familyName: 'User'
                },
                emails: [
                    {
                        value: 'test.user@example.com',
                        type: 'work',
                        primary: true
                    }
                ],
                active: true
            };
            
            const response = await request(app)
                .post('/scim/v2/Users')
                .set('Authorization', `Bearer ${authToken}`)
                .set('Content-Type', 'application/scim+json')
                .send(newUser)
                .expect(201);
            
            expect(response.body).to.have.property('id');
            expect(response.body.userName).to.equal('test.user');
            expect(response.body.active).to.be.true;
        });
        
        it('should update user using PATCH', async () => {
            const userId = 'test-user-id';
            const patchRequest = {
                schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
                Operations: [
                    {
                        op: 'replace',
                        path: 'active',
                        value: false
                    },
                    {
                        op: 'replace',
                        path: 'name.givenName',
                        value: 'Updated'
                    }
                ]
            };
            
            const response = await request(app)
                .patch(`/scim/v2/Users/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .set('Content-Type', 'application/scim+json')
                .send(patchRequest)
                .expect(200);
            
            expect(response.body.active).to.be.false;
            expect(response.body.name.givenName).to.equal('Updated');
        });
        
        it('should handle user not found', async () => {
            const response = await request(app)
                .get('/scim/v2/Users/non-existent-id')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
            
            expect(response.body.schemas).to.include('urn:ietf:params:scim:api:messages:2.0:Error');
            expect(response.body.detail).to.equal('User not found');
        });
    });
    
    describe('Filtering and Pagination', () => {
        it('should support user filtering', async () => {
            const response = await request(app)
                .get('/scim/v2/Users?filter=active eq true')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            
            expect(response.body.schemas).to.include('urn:ietf:params:scim:api:messages:2.0:ListResponse');
            expect(response.body.Resources).to.be.an('array');
        });
        
        it('should support pagination', async () => {
            const response = await request(app)
                .get('/scim/v2/Users?startIndex=1&count=10')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            
            expect(response.body.startIndex).to.equal(1);
            expect(response.body.itemsPerPage).to.be.at.most(10);
        });
    });
});
```

## まとめ

本章では、Microsoft Entra IDとアプリケーション間でのユーザープロビジョニングと同期について詳しく解説しました。

**重要なポイント**

1. **SCIM 2.0実装**: 標準化されたプロトコルによる自動プロビジョニング
2. **JITプロビジョニング**: 初回ログイン時の動的ユーザー作成
3. **属性同期戦略**: 双方向同期と競合解決の実装
4. **ライフサイクル管理**: 入社から退社までの自動化ワークフロー
5. **実装例**: Node.jsでの完全なSCIMサーバー実装

**プロビジョニング方式の比較**

| 方式 | SCIM 2.0 | JIT プロビジョニング |
|------|----------|---------------------|
| 実装複雑度 | 高 | 低 |
| リアルタイム性 | 高 | 最高 |
| バックグラウンド処理 | 可能 | 不可 |
| 削除の自動化 | 可能 | 困難 |
| 標準化 | 高 | 中程度 |

**次章への準備**

次章では、セキュリティベストプラクティスについて学習し、トークン管理、攻撃対策、証明書管理など、SSO システムのセキュリティを強化する方法を習得します。