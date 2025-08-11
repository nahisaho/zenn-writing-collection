---
title: "第7章: セキュリティとベストプラクティス"
---

# セキュリティ対策

## ネットワークセキュリティ

### ファイアウォール設定

ローカル環境でのAgent AI開発においても、適切なファイアウォール設定は重要です。外部からの不正アクセスを防ぎ、必要な通信のみを許可する設定を行います。

**1. Windows Defenderファイアウォールの設定**

```powershell
# 管理者権限でPowerShellを開く

# 現在のファイアウォール状態確認
Get-NetFirewallProfile

# Agent AI開発用ポートの許可設定
New-NetFirewallRule -DisplayName "LM Studio API" -Direction Inbound -Protocol TCP -LocalPort 1234 -Action Allow
New-NetFirewallRule -DisplayName "Dify Web Interface" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
New-NetFirewallRule -DisplayName "Dify API" -Direction Inbound -Protocol TCP -LocalPort 5001 -Action Allow
New-NetFirewallRule -DisplayName "n8n Interface" -Direction Inbound -Protocol TCP -LocalPort 5678 -Action Allow

# 特定IPからのアクセスのみ許可（開発チーム内のみ）
New-NetFirewallRule -DisplayName "Agent AI Dev Team" -Direction Inbound -Protocol TCP -LocalPort 1234,3000,5001,5678 -RemoteAddress "192.168.1.0/24" -Action Allow

# 不要なポートのブロック
New-NetFirewallRule -DisplayName "Block Unsecured Protocols" -Direction Inbound -Protocol TCP -LocalPort 23,135,139,445 -Action Block
```

**2. Docker環境のネットワーク分離**

```yaml
# docker-compose.yml でのネットワーク分離設定
version: '3.8'

networks:
  # フロントエンド用ネットワーク（外部公開）
  frontend-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/24
  
  # バックエンド用ネットワーク（内部のみ）
  backend-network:
    driver: bridge
    internal: true
    ipam:
      config:
        - subnet: 172.21.0.0/24
  
  # データベース用ネットワーク（最も制限的）
  database-network:
    driver: bridge
    internal: true
    ipam:
      config:
        - subnet: 172.22.0.0/24

services:
  # Web UI（外部アクセス可能）
  dify-web:
    image: langgenius/dify-web:latest
    networks:
      - frontend-network
      - backend-network
    ports:
      - "3000:3000"
  
  # API（内部通信のみ）
  dify-api:
    image: langgenius/dify-api:latest
    networks:
      - backend-network
      - database-network
    # ポート公開なし（内部通信のみ）
  
  # データベース（最も制限的）
  database:
    image: postgres:15-alpine
    networks:
      - database-network
    # 外部アクセス完全遮断
```

**3. WSL2のネットワークセキュリティ**

```bash
# WSL2内でのiptables設定
sudo apt update && sudo apt install iptables-persistent

# 基本的なファイアウォールルール
sudo iptables -P INPUT DROP
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT ACCEPT

# ローカルホスト通信を許可
sudo iptables -A INPUT -i lo -j ACCEPT
sudo iptables -A OUTPUT -o lo -j ACCEPT

# 確立済み接続を許可
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# 開発用ポートを特定ネットワークからのみ許可
sudo iptables -A INPUT -p tcp --dport 1234 -s 192.168.1.0/24 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 5678 -s 192.168.1.0/24 -j ACCEPT

# SSH（必要な場合のみ）
sudo iptables -A INPUT -p tcp --dport 22 -s 192.168.1.0/24 -j ACCEPT

# ルールの保存
sudo iptables-save > /etc/iptables/rules.v4
```

### SSL/TLS設定

**1. 自己署名証明書の作成**

```bash
# 開発環境用の自己署名証明書作成
mkdir -p ~/agent-ai-project/certs
cd ~/agent-ai-project/certs

# 秘密鍵の生成
openssl genrsa -out server.key 2048

# 証明書署名要求（CSR）の作成
openssl req -new -key server.key -out server.csr \
  -subj "/C=JP/ST=Tokyo/L=Tokyo/O=Development/CN=localhost"

# 自己署名証明書の作成
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

# SAN（Subject Alternative Name）拡張付き証明書
cat > v3.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

openssl x509 -req -in server.csr -signkey server.key -out server.crt -extensions v3_req -extfile v3.ext -days 365
```

**2. Nginx リバースプロキシでのSSL終端**

```nginx
# nginx-ssl.conf
server {
    listen 443 ssl http2;
    server_name localhost;
    
    # SSL証明書設定
    ssl_certificate /certs/server.crt;
    ssl_certificate_key /certs/server.key;
    
    # SSL設定の強化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_dhparam /certs/dhparam.pem;
    
    # セキュリティヘッダー
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Dify Webへのプロキシ
    location / {
        proxy_pass http://dify-web:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket対応
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # API エンドポイント
    location /api/ {
        proxy_pass http://dify-api:5001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # レート制限
        limit_req zone=api burst=10 nodelay;
    }
    
    # n8n インターフェース
    location /n8n/ {
        proxy_pass http://n8n:5678/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Basic認証
        auth_basic "n8n Admin Area";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }
}

# HTTPからHTTPSへのリダイレクト
server {
    listen 80;
    server_name localhost;
    return 301 https://$server_name$request_uri;
}

# レート制限設定
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=1r/s;
}
```

### アクセス制御

**1. 多層認証システム**

```yaml
# 認証レイヤーの設計
Authentication Layers:
  
  Layer 1 - Network Level:
    - VPN接続必須
    - IP ホワイトリスト
    - ファイアウォール制御
    
  Layer 2 - Application Level:
    - OAuth 2.0 / OpenID Connect
    - Multi-Factor Authentication
    - Session管理
    
  Layer 3 - API Level:
    - API Key認証
    - JWT Token
    - Rate Limiting
    
  Layer 4 - Data Level:
    - Role-Based Access Control (RBAC)
    - Attribute-Based Access Control (ABAC)
    - Data masking
```

**2. RBAC実装例**

```python
# Role-Based Access Control の実装
from enum import Enum
from typing import Set, Dict, List
import jwt
from datetime import datetime, timedelta

class Permission(Enum):
    READ_DATA = "read_data"
    WRITE_DATA = "write_data"
    EXECUTE_WORKFLOW = "execute_workflow"
    MANAGE_USERS = "manage_users"
    VIEW_ANALYTICS = "view_analytics"
    ADMIN_ACCESS = "admin_access"

class Role(Enum):
    VIEWER = "viewer"
    ANALYST = "analyst"
    DEVELOPER = "developer"
    ADMIN = "admin"

class AccessControl:
    def __init__(self):
        self.role_permissions: Dict[Role, Set[Permission]] = {
            Role.VIEWER: {
                Permission.READ_DATA,
                Permission.VIEW_ANALYTICS
            },
            Role.ANALYST: {
                Permission.READ_DATA,
                Permission.VIEW_ANALYTICS,
                Permission.EXECUTE_WORKFLOW
            },
            Role.DEVELOPER: {
                Permission.READ_DATA,
                Permission.WRITE_DATA,
                Permission.EXECUTE_WORKFLOW,
                Permission.VIEW_ANALYTICS
            },
            Role.ADMIN: set(Permission)  # 全ての権限
        }
    
    def check_permission(self, user_role: Role, required_permission: Permission) -> bool:
        """権限チェック"""
        user_permissions = self.role_permissions.get(user_role, set())
        return required_permission in user_permissions
    
    def generate_access_token(self, user_id: str, role: Role, secret_key: str) -> str:
        """アクセストークンの生成"""
        payload = {
            'user_id': user_id,
            'role': role.value,
            'permissions': [p.value for p in self.role_permissions[role]],
            'exp': datetime.utcnow() + timedelta(hours=8),
            'iat': datetime.utcnow(),
            'iss': 'agent-ai-system'
        }
        return jwt.encode(payload, secret_key, algorithm='HS256')
    
    def verify_token(self, token: str, secret_key: str) -> Dict:
        """トークンの検証"""
        try:
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            raise Exception("Token has expired")
        except jwt.InvalidTokenError:
            raise Exception("Invalid token")

# 認証デコレータ
def require_permission(required_permission: Permission):
    def decorator(func):
        def wrapper(*args, **kwargs):
            # トークンから権限を取得
            token = get_token_from_request()
            user_data = access_control.verify_token(token, SECRET_KEY)
            user_role = Role(user_data['role'])
            
            if not access_control.check_permission(user_role, required_permission):
                raise Exception(f"Permission denied: {required_permission.value} required")
            
            return func(*args, **kwargs)
        return wrapper
    return decorator

# 使用例
@require_permission(Permission.EXECUTE_WORKFLOW)
def execute_ai_workflow(workflow_id: str):
    """AIワークフローの実行（ANALYST以上の権限が必要）"""
    pass

@require_permission(Permission.MANAGE_USERS)
def create_user(user_data: dict):
    """ユーザー作成（ADMIN権限が必要）"""
    pass
```

## データ保護

### 暗号化設定

**1. データベース暗号化**

```sql
-- PostgreSQL での暗号化設定

-- 1. 透過的データ暗号化（TDE）
-- postgresql.conf での設定
-- ssl = on
-- ssl_cert_file = 'server.crt'
-- ssl_key_file = 'server.key'
-- ssl_ca_file = 'ca.crt'

-- 2. 列レベル暗号化
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 暗号化関数の作成
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT, key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(encrypt(data::bytea, key::bytea, 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data TEXT, key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN convert_from(decrypt(decode(encrypted_data, 'base64'), key::bytea, 'aes'), 'UTF8');
END;
$$ LANGUAGE plpgsql;

-- 暗号化テーブルの作成例
CREATE TABLE customer_data (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email_encrypted TEXT, -- 暗号化されたメール
    phone_encrypted TEXT, -- 暗号化された電話番号
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- データ挿入時の暗号化
INSERT INTO customer_data (name, email_encrypted, phone_encrypted) 
VALUES (
    'John Doe',
    encrypt_sensitive_data('john.doe@example.com', 'encryption_key_here'),
    encrypt_sensitive_data('+1-555-0123', 'encryption_key_here')
);

-- データ取得時の復号化
SELECT 
    id,
    name,
    decrypt_sensitive_data(email_encrypted, 'encryption_key_here') as email,
    decrypt_sensitive_data(phone_encrypted, 'encryption_key_here') as phone
FROM customer_data 
WHERE id = 1;
```

**2. ファイルシステム暗号化**

```bash
# LUKS（Linux Unified Key Setup）を使用したディスク暗号化

# 暗号化ボリュームの作成
sudo cryptsetup luksFormat /dev/sdb1
sudo cryptsetup luksOpen /dev/sdb1 encrypted_data

# ファイルシステムの作成
sudo mkfs.ext4 /dev/mapper/encrypted_data

# マウント
sudo mkdir /mnt/encrypted_data
sudo mount /dev/mapper/encrypted_data /mnt/encrypted_data

# 自動マウント設定（/etc/fstab）
echo "/dev/mapper/encrypted_data /mnt/encrypted_data ext4 defaults 0 2" | sudo tee -a /etc/fstab

# キーファイルによる自動unlock設定
sudo dd if=/dev/urandom of=/root/keyfile bs=1024 count=4
sudo chmod 0400 /root/keyfile
sudo cryptsetup luksAddKey /dev/sdb1 /root/keyfile

# /etc/crypttab への追加
echo "encrypted_data /dev/sdb1 /root/keyfile luks" | sudo tee -a /etc/crypttab
```

**3. アプリケーションレベル暗号化**

```python
# 暗号化ユーティリティクラス
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os
import json
from typing import Dict, Any

class DataEncryption:
    def __init__(self, password: str):
        self.password = password.encode()
        self.salt = os.urandom(16)
        self.key = self._derive_key()
        self.cipher = Fernet(self.key)
    
    def _derive_key(self) -> bytes:
        """パスワードから暗号化キーを生成"""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=self.salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(self.password))
        return key
    
    def encrypt_data(self, data: Any) -> str:
        """データの暗号化"""
        # データをJSONシリアライズ
        json_data = json.dumps(data).encode()
        
        # 暗号化
        encrypted_data = self.cipher.encrypt(json_data)
        
        # saltと暗号化データを結合してbase64エンコード
        combined = self.salt + encrypted_data
        return base64.urlsafe_b64encode(combined).decode()
    
    def decrypt_data(self, encrypted_string: str) -> Any:
        """データの復号化"""
        try:
            # base64デコード
            combined = base64.urlsafe_b64decode(encrypted_string.encode())
            
            # saltと暗号化データを分離
            salt = combined[:16]
            encrypted_data = combined[16:]
            
            # キーを再生成
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
            )
            key = base64.urlsafe_b64encode(kdf.derive(self.password))
            cipher = Fernet(key)
            
            # 復号化
            decrypted_data = cipher.decrypt(encrypted_data)
            
            # JSONデシリアライズ
            return json.loads(decrypted_data.decode())
        
        except Exception as e:
            raise Exception(f"Decryption failed: {str(e)}")
    
    def encrypt_file(self, file_path: str, output_path: str):
        """ファイルの暗号化"""
        with open(file_path, 'rb') as file:
            file_data = file.read()
        
        encrypted_data = self.cipher.encrypt(file_data)
        
        with open(output_path, 'wb') as encrypted_file:
            encrypted_file.write(self.salt + encrypted_data)
    
    def decrypt_file(self, encrypted_file_path: str, output_path: str):
        """ファイルの復号化"""
        with open(encrypted_file_path, 'rb') as encrypted_file:
            combined = encrypted_file.read()
        
        salt = combined[:16]
        encrypted_data = combined[16:]
        
        # キーを再生成
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(self.password))
        cipher = Fernet(key)
        
        decrypted_data = cipher.decrypt(encrypted_data)
        
        with open(output_path, 'wb') as decrypted_file:
            decrypted_file.write(decrypted_data)

# 使用例
encryption = DataEncryption("super_secure_password_2024")

# 機密データの暗号化
sensitive_data = {
    "customer_id": "12345",
    "email": "customer@example.com",
    "api_keys": {
        "openai": "sk-...",
        "anthropic": "ant-..."
    }
}

encrypted = encryption.encrypt_data(sensitive_data)
print(f"Encrypted data: {encrypted}")

# 復号化
decrypted = encryption.decrypt_data(encrypted)
print(f"Decrypted data: {decrypted}")
```

### バックアップ戦略

**1. 包括的バックアップ計画**

```yaml
Backup Strategy:
  
  # データ分類
  Data Classification:
    Critical Data:
      - モデルファイル
      - ナレッジベース
      - 顧客データ
      - 設定ファイル
      
    Important Data:
      - ワークフロー定義
      - ログファイル
      - 分析結果
      
    Replaceable Data:
      - キャッシュファイル
      - 一時ファイル
      - 計算済み統計
  
  # バックアップ頻度
  Backup Frequency:
    Real-time: 
      - 顧客データ（増分レプリケーション）
      - トランザクションログ
      
    Hourly:
      - アクティブワークフロー
      - 設定変更
      
    Daily:
      - 完全データベースバックアップ
      - モデルファイル
      
    Weekly:
      - システム全体のスナップショット
      - アーカイブ用長期保存
  
  # 保存先
  Storage Locations:
    Local:
      - NAS/SAN ストレージ
      - 外付けドライブ
      
    Cloud:
      - 暗号化クラウドストレージ
      - 複数リージョン保存
      
    Offline:
      - テープバックアップ
      - 物理的に分離された場所
```

**2. 自動バックアップスクリプト**

```bash
#!/bin/bash
# comprehensive-backup.sh

set -euo pipefail

# 設定
BACKUP_BASE_DIR="/backups"
RETENTION_DAYS=30
LOG_FILE="/var/log/agent-ai-backup.log"
ENCRYPTION_KEY_FILE="/etc/backup-encryption.key"

# ログ関数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 暗号化関数
encrypt_backup() {
    local source_file="$1"
    local encrypted_file="${source_file}.enc"
    
    openssl enc -aes-256-cbc -salt -in "$source_file" -out "$encrypted_file" -pass file:"$ENCRYPTION_KEY_FILE"
    rm "$source_file"
    echo "$encrypted_file"
}

# データベースバックアップ
backup_databases() {
    log "Starting database backup..."
    
    local db_backup_dir="$BACKUP_BASE_DIR/databases/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$db_backup_dir"
    
    # PostgreSQL バックアップ
    docker exec dify-postgres pg_dump -U postgres -d dify > "$db_backup_dir/dify.sql"
    docker exec n8n-postgres pg_dump -U n8n -d n8n > "$db_backup_dir/n8n.sql"
    
    # バックアップファイルを暗号化
    for sql_file in "$db_backup_dir"/*.sql; do
        encrypt_backup "$sql_file"
    done
    
    log "Database backup completed: $db_backup_dir"
}

# ファイルシステムバックアップ
backup_filesystem() {
    log "Starting filesystem backup..."
    
    local fs_backup_dir="$BACKUP_BASE_DIR/filesystem/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$fs_backup_dir"
    
    # 重要なディレクトリのバックアップ
    local directories=(
        "/home/user/agent-ai-project"
        "/var/lib/docker/volumes"
        "/etc/nginx"
        "/etc/ssl/certs"
    )
    
    for dir in "${directories[@]}"; do
        if [[ -d "$dir" ]]; then
            local backup_name=$(basename "$dir")
            tar -czf "$fs_backup_dir/${backup_name}.tar.gz" "$dir"
            encrypt_backup "$fs_backup_dir/${backup_name}.tar.gz"
        fi
    done
    
    log "Filesystem backup completed: $fs_backup_dir"
}

# Dockerイメージバックアップ
backup_docker_images() {
    log "Starting Docker images backup..."
    
    local docker_backup_dir="$BACKUP_BASE_DIR/docker/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$docker_backup_dir"
    
    # カスタムイメージのエクスポート
    local custom_images=(
        "langgenius/dify-api:latest"
        "langgenius/dify-web:latest"
        "n8nio/n8n:latest"
    )
    
    for image in "${custom_images[@]}"; do
        local image_name=$(echo "$image" | tr '/' '_' | tr ':' '_')
        docker save "$image" > "$docker_backup_dir/${image_name}.tar"
        encrypt_backup "$docker_backup_dir/${image_name}.tar"
    done
    
    log "Docker images backup completed: $docker_backup_dir"
}

# 設定ファイルバックアップ
backup_configurations() {
    log "Starting configuration backup..."
    
    local config_backup_dir="$BACKUP_BASE_DIR/configurations/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$config_backup_dir"
    
    # 設定ファイルのコピー
    local config_files=(
        "docker-compose.yml"
        ".env"
        "nginx.conf"
        "prometheus.yml"
    )
    
    for config in "${config_files[@]}"; do
        if [[ -f "/home/user/agent-ai-project/$config" ]]; then
            cp "/home/user/agent-ai-project/$config" "$config_backup_dir/"
        fi
    done
    
    # 設定ディレクトリ全体をアーカイブ
    tar -czf "$config_backup_dir/all_configs.tar.gz" "$config_backup_dir"/*.yml "$config_backup_dir"/*.conf "$config_backup_dir"/.env 2>/dev/null || true
    encrypt_backup "$config_backup_dir/all_configs.tar.gz"
    
    log "Configuration backup completed: $config_backup_dir"
}

# 古いバックアップの削除
cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    find "$BACKUP_BASE_DIR" -type f -name "*.enc" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_BASE_DIR" -type d -empty -delete
    
    log "Old backup cleanup completed"
}

# バックアップの整合性チェック
verify_backups() {
    log "Verifying backup integrity..."
    
    local today_backups=$(find "$BACKUP_BASE_DIR" -name "*.enc" -mtime -1)
    local verification_failed=0
    
    while IFS= read -r backup_file; do
        if ! openssl enc -aes-256-cbc -d -in "$backup_file" -pass file:"$ENCRYPTION_KEY_FILE" > /dev/null 2>&1; then
            log "ERROR: Backup verification failed for $backup_file"
            verification_failed=1
        fi
    done <<< "$today_backups"
    
    if [[ $verification_failed -eq 0 ]]; then
        log "All backups verified successfully"
    else
        log "WARNING: Some backups failed verification"
        exit 1
    fi
}

# S3への同期（オプション）
sync_to_cloud() {
    if command -v aws &> /dev/null && [[ -n "${AWS_S3_BUCKET:-}" ]]; then
        log "Syncing backups to S3..."
        
        aws s3 sync "$BACKUP_BASE_DIR" "s3://$AWS_S3_BUCKET/agent-ai-backups/" \
            --storage-class STANDARD_IA \
            --server-side-encryption AES256
        
        log "S3 sync completed"
    fi
}

# メイン実行
main() {
    log "Starting comprehensive backup process..."
    
    backup_databases
    backup_filesystem
    backup_docker_images
    backup_configurations
    cleanup_old_backups
    verify_backups
    sync_to_cloud
    
    log "Backup process completed successfully"
}

# 実行
main "$@"
```

### アクセスログ

**1. 包括的ログ設定**

```yaml
# docker-compose.yml でのログ設定
version: '3.8'

services:
  dify-api:
    image: langgenius/dify-api:latest
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"
        labels: "service=dify-api,environment=development"
    environment:
      - LOG_LEVEL=INFO
      - AUDIT_LOG_ENABLED=true
      - AUDIT_LOG_LEVEL=DEBUG
  
  n8n:
    image: n8nio/n8n:latest
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"
    environment:
      - N8N_LOG_LEVEL=info
      - N8N_LOG_OUTPUT=console
  
  # ログ収集・分析用のELKスタック
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - es_data:/usr/share/elasticsearch/data
  
  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch
  
  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    environment:
      ELASTICSEARCH_HOSTS: http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  es_data:
```

**2. 構造化ログ実装**

```python
# structured_logger.py
import logging
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional
from functools import wraps
import inspect

class StructuredLogger:
    def __init__(self, name: str, level: int = logging.INFO):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(level)
        
        # JSONフォーマッターの設定
        handler = logging.StreamHandler()
        formatter = self.JSONFormatter()
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
    
    class JSONFormatter(logging.Formatter):
        def format(self, record):
            log_entry = {
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'level': record.levelname,
                'logger': record.name,
                'message': record.getMessage(),
                'module': record.module,
                'function': record.funcName,
                'line': record.lineno,
                'thread': record.thread,
                'process': record.process,
            }
            
            # 追加のコンテキスト情報
            if hasattr(record, 'extra_data'):
                log_entry.update(record.extra_data)
            
            return json.dumps(log_entry)
    
    def log_with_context(self, level: int, message: str, **context):
        """コンテキスト付きログ"""
        extra_data = {
            'context': context,
            'service': 'agent-ai-system'
        }
        self.logger.log(level, message, extra={'extra_data': extra_data})
    
    def log_user_action(self, user_id: str, action: str, resource: str, 
                       success: bool, details: Optional[Dict] = None):
        """ユーザーアクションのログ"""
        self.log_with_context(
            logging.INFO,
            f"User action: {action}",
            user_id=user_id,
            action=action,
            resource=resource,
            success=success,
            details=details or {},
            event_type='user_action'
        )
    
    def log_api_request(self, method: str, endpoint: str, user_id: str,
                       status_code: int, response_time: float, 
                       request_size: int = 0, response_size: int = 0):
        """APIリクエストのログ"""
        self.log_with_context(
            logging.INFO,
            f"API request: {method} {endpoint}",
            method=method,
            endpoint=endpoint,
            user_id=user_id,
            status_code=status_code,
            response_time_ms=response_time * 1000,
            request_size_bytes=request_size,
            response_size_bytes=response_size,
            event_type='api_request'
        )
    
    def log_security_event(self, event_type: str, severity: str, 
                          user_id: Optional[str], details: Dict):
        """セキュリティイベントのログ"""
        self.log_with_context(
            logging.WARNING if severity == 'medium' else logging.ERROR,
            f"Security event: {event_type}",
            security_event_type=event_type,
            severity=severity,
            user_id=user_id,
            details=details,
            event_type='security_event'
        )

# ログデコレータ
def log_function_call(logger: StructuredLogger):
    """関数呼び出しをログに記録するデコレータ"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            function_name = func.__name__
            module_name = func.__module__
            
            # 引数の記録（機密情報を除く）
            safe_args = []
            safe_kwargs = {}
            
            for arg in args:
                if isinstance(arg, (str, int, float, bool, list, dict)):
                    safe_args.append(arg)
                else:
                    safe_args.append(f"<{type(arg).__name__}>")
            
            for key, value in kwargs.items():
                if 'password' in key.lower() or 'secret' in key.lower() or 'key' in key.lower():
                    safe_kwargs[key] = '[REDACTED]'
                elif isinstance(value, (str, int, float, bool, list, dict)):
                    safe_kwargs[key] = value
                else:
                    safe_kwargs[key] = f"<{type(value).__name__}>"
            
            try:
                result = func(*args, **kwargs)
                execution_time = time.time() - start_time
                
                logger.log_with_context(
                    logging.INFO,
                    f"Function executed: {function_name}",
                    module=module_name,
                    function=function_name,
                    args=safe_args,
                    kwargs=safe_kwargs,
                    execution_time_ms=execution_time * 1000,
                    success=True,
                    event_type='function_call'
                )
                
                return result
                
            except Exception as e:
                execution_time = time.time() - start_time
                
                logger.log_with_context(
                    logging.ERROR,
                    f"Function failed: {function_name}",
                    module=module_name,
                    function=function_name,
                    args=safe_args,
                    kwargs=safe_kwargs,
                    execution_time_ms=execution_time * 1000,
                    success=False,
                    error_type=type(e).__name__,
                    error_message=str(e),
                    event_type='function_call'
                )
                
                raise
        
        return wrapper
    return decorator

# 使用例
logger = StructuredLogger('agent-ai')

@log_function_call(logger)
def process_user_query(user_id: str, query: str, api_key: str):
    """ユーザークエリの処理"""
    # 機密情報（api_key）は自動的に[REDACTED]に置換される
    logger.log_user_action(user_id, 'query_submitted', 'llm_api', True, {'query_length': len(query)})
    return f"Processed query for {user_id}"

# セキュリティイベントの例
def handle_failed_login(user_id: str, ip_address: str, attempts: int):
    logger.log_security_event(
        'failed_login',
        'high' if attempts > 5 else 'medium',
        user_id,
        {
            'ip_address': ip_address,
            'attempt_count': attempts,
            'blocked': attempts > 5
        }
    )
```

# 開発のベストプラクティス

## バージョン管理とCI/CD

### Gitでの管理

**1. Git ワークフロー設定**

```bash
# プロジェクト初期化
cd ~/agent-ai-project
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"

# ブランチ戦略の設定
git checkout -b develop
git checkout -b main

# .gitignore 設定
cat > .gitignore << EOF
# 環境変数
.env
*.env

# ログファイル
*.log
logs/

# データベースファイル
*.db
*.sqlite

# Docker volumes
volumes/
data/

# Python
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/

# Node.js
node_modules/
npm-debug.log*

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# モデルファイル（大容量のため）
models/*.bin
models/*.safetensors
models/*.gguf

# バックアップファイル
backups/
*.backup

# 機密情報
secrets/
keys/
certificates/
*.key
*.crt
*.pem

# 一時ファイル
tmp/
temp/
*.tmp
EOF

# Git hooks の設定
mkdir -p .git/hooks
```

**2. Pre-commit フックの実装**

```bash
# .git/hooks/pre-commit
#!/bin/bash

echo "Running pre-commit checks..."

# 1. 機密情報の検出
echo "Checking for secrets..."
if git diff --cached --name-only | xargs grep -l "password\|secret\|key\|token" 2>/dev/null; then
    echo "WARNING: Potential secrets detected in staged files!"
    echo "Please review the following files:"
    git diff --cached --name-only | xargs grep -l "password\|secret\|key\|token" 2>/dev/null
    read -p "Continue with commit? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 2. Python コードの品質チェック
echo "Running Python linting..."
if command -v flake8 &> /dev/null; then
    git diff --cached --name-only --diff-filter=ACM | grep '\.py$' | xargs flake8
    if [ $? -ne 0 ]; then
        echo "Python linting failed!"
        exit 1
    fi
fi

# 3. Docker設定の検証
echo "Validating Docker configurations..."
for file in $(git diff --cached --name-only | grep -E "(docker-compose|Dockerfile)"); do
    if [[ "$file" == *"docker-compose"* ]]; then
        docker-compose -f "$file" config > /dev/null
        if [ $? -ne 0 ]; then
            echo "Docker Compose validation failed for $file"
            exit 1
        fi
    fi
done

# 4. 設定ファイルの構文チェック
echo "Validating configuration files..."
for file in $(git diff --cached --name-only | grep -E "\.(yml|yaml|json)$"); do
    if [[ "$file" == *.json ]]; then
        python -m json.tool "$file" > /dev/null
        if [ $? -ne 0 ]; then
            echo "JSON validation failed for $file"
            exit 1
        fi
    elif [[ "$file" == *.yml || "$file" == *.yaml ]]; then
        python -c "import yaml; yaml.safe_load(open('$file'))"
        if [ $? -ne 0 ]; then
            echo "YAML validation failed for $file"
            exit 1
        fi
    fi
done

echo "All pre-commit checks passed!"
```

**3. CI/CD パイプライン設定**

```yaml
# .github/workflows/ci-cd.yml
name: Agent AI CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # コード品質チェック
  code-quality:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install flake8 black isort mypy pytest
        if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
    
    - name: Lint with flake8
      run: |
        flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
        flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
    
    - name: Check code formatting
      run: |
        black --check .
        isort --check-only .
    
    - name: Type checking
      run: mypy . --ignore-missing-imports
    
    - name: Run tests
      run: pytest tests/ -v --coverage

  # セキュリティ監査
  security-audit:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run security audit
      uses: pypa/gh-action-pip-audit@v1.0.8
      with:
        inputs: requirements.txt
    
    - name: Run Bandit security linter
      run: |
        pip install bandit
        bandit -r . -f json -o bandit-report.json
    
    - name: Upload security report
      uses: actions/upload-artifact@v3
      with:
        name: security-report
        path: bandit-report.json

  # Docker イメージビルド
  build-images:
    runs-on: ubuntu-latest
    needs: [code-quality, security-audit]
    permissions:
      contents: read
      packages: write
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  # 統合テスト
  integration-tests:
    runs-on: ubuntu-latest
    needs: build-images
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Start services
      run: |
        docker-compose -f docker-compose.test.yml up -d
        sleep 30  # サービス起動待機
    
    - name: Run integration tests
      run: |
        python -m pytest tests/integration/ -v
    
    - name: Collect service logs
      if: failure()
      run: |
        docker-compose -f docker-compose.test.yml logs > service-logs.txt
    
    - name: Upload logs
      if: failure()
      uses: actions/upload-artifact@v3
      with:
        name: service-logs
        path: service-logs.txt

  # デプロイメント
  deploy:
    runs-on: ubuntu-latest
    needs: [integration-tests]
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to staging
      run: |
        echo "Deploying to staging environment..."
        # ここに実際のデプロイメントスクリプトを追加
    
    - name: Health check
      run: |
        curl -f http://staging.yourdomain.com/health || exit 1
    
    - name: Deploy to production
      if: success()
      run: |
        echo "Deploying to production environment..."
        # ここに本番デプロイメントスクリプトを追加
```

### 自動テスト

**1. テストスイート構成**

```python
# tests/conftest.py
import pytest
import docker
import time
import requests
from typing import Generator

@pytest.fixture(scope="session")
def docker_services():
    """Docker サービスの起動と終了"""
    client = docker.from_env()
    
    # テスト用 docker-compose の起動
    import subprocess
    subprocess.run(["docker-compose", "-f", "docker-compose.test.yml", "up", "-d"], check=True)
    
    # サービスの起動を待機
    time.sleep(30)
    
    # ヘルスチェック
    max_retries = 30
    for i in range(max_retries):
        try:
            response = requests.get("http://localhost:3000/health", timeout=5)
            if response.status_code == 200:
                break
        except requests.exceptions.RequestException:
            pass
        time.sleep(2)
    else:
        pytest.fail("Services failed to start within timeout period")
    
    yield
    
    # クリーンアップ
    subprocess.run(["docker-compose", "-f", "docker-compose.test.yml", "down", "-v"], check=True)

@pytest.fixture
def api_client():
    """API クライアントのセットアップ"""
    class APIClient:
        base_url = "http://localhost:5001"
        
        def post(self, endpoint, data=None, headers=None):
            url = f"{self.base_url}{endpoint}"
            return requests.post(url, json=data, headers=headers)
        
        def get(self, endpoint, params=None, headers=None):
            url = f"{self.base_url}{endpoint}"
            return requests.get(url, params=params, headers=headers)
    
    return APIClient()

@pytest.fixture
def test_data():
    """テスト用データの提供"""
    return {
        "sample_query": "What are the business hours?",
        "sample_user_id": "test_user_123",
        "sample_conversation": [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi there! How can I help you?"}
        ]
    }
```

**2. 単体テスト**

```python
# tests/unit/test_data_processing.py
import pytest
import pandas as pd
import numpy as np
from src.data_processing import DataProcessor, DataValidator

class TestDataProcessor:
    
    @pytest.fixture
    def sample_data(self):
        return pd.DataFrame({
            'id': [1, 2, 3, 4, 5],
            'name': ['Alice', 'Bob', 'Charlie', None, 'Eve'],
            'email': ['alice@test.com', 'bob@test.com', 'charlie@test.com', 'invalid-email', 'eve@test.com'],
            'age': [25, 30, 35, 200, 28],  # 200 is an outlier
            'salary': [50000, 60000, 70000, -1000, 55000]  # -1000 is invalid
        })
    
    def test_data_cleaning(self, sample_data):
        processor = DataProcessor()
        cleaned_data = processor.clean_data(sample_data)
        
        # 欠損値が処理されていることを確認
        assert cleaned_data['name'].isnull().sum() == 0
        
        # 外れ値が処理されていることを確認
        assert cleaned_data['age'].max() <= 100
        
        # 無効なデータが除去されていることを確認
        assert all(cleaned_data['salary'] >= 0)
    
    def test_data_validation(self, sample_data):
        validator = DataValidator()
        validation_result = validator.validate(sample_data)
        
        assert validation_result['total_records'] == 5
        assert validation_result['null_records'] == 1
        assert validation_result['quality_score'] < 1.0  # データ品質に問題があるため
    
    def test_outlier_detection(self):
        data = pd.Series([1, 2, 3, 4, 5, 100])  # 100 is clear outlier
        processor = DataProcessor()
        outliers = processor.detect_outliers(data)
        
        assert 100 in outliers
        assert len(outliers) == 1
    
    def test_missing_value_imputation(self):
        data = pd.Series([1, 2, None, 4, 5])
        processor = DataProcessor()
        imputed = processor.impute_missing_values(data, strategy='median')
        
        assert imputed.isnull().sum() == 0
        assert imputed.iloc[2] == 3.0  # median of [1,2,4,5]

# tests/unit/test_llm_integration.py
import pytest
from unittest.mock import Mock, patch
from src.llm_integration import LMStudioClient, DifyClient

class TestLMStudioClient:
    
    @pytest.fixture
    def mock_response(self):
        return {
            "choices": [
                {
                    "message": {
                        "content": "This is a test response from the model."
                    },
                    "finish_reason": "stop"
                }
            ],
            "usage": {
                "prompt_tokens": 10,
                "completion_tokens": 15,
                "total_tokens": 25
            }
        }
    
    @patch('requests.post')
    def test_successful_api_call(self, mock_post, mock_response):
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = mock_response
        
        client = LMStudioClient("http://localhost:1234")
        response = client.chat_completion([
            {"role": "user", "content": "Test message"}
        ])
        
        assert response["choices"][0]["message"]["content"] == "This is a test response from the model."
        assert response["usage"]["total_tokens"] == 25
    
    @patch('requests.post')
    def test_api_timeout_handling(self, mock_post):
        mock_post.side_effect = requests.exceptions.Timeout()
        
        client = LMStudioClient("http://localhost:1234")
        
        with pytest.raises(Exception) as exc_info:
            client.chat_completion([{"role": "user", "content": "Test"}])
        
        assert "timeout" in str(exc_info.value).lower()
    
    def test_request_validation(self):
        client = LMStudioClient("http://localhost:1234")
        
        # 空のメッセージでエラーが発生することを確認
        with pytest.raises(ValueError):
            client.chat_completion([])
        
        # 不正な形式のメッセージでエラーが発生することを確認
        with pytest.raises(ValueError):
            client.chat_completion([{"invalid": "format"}])
```

**3. 統合テスト**

```python
# tests/integration/test_end_to_end.py
import pytest
import time
import json

class TestEndToEndWorkflow:
    
    def test_customer_support_workflow(self, docker_services, api_client, test_data):
        """カスタマーサポートワークフローの完全テスト"""
        
        # 1. 顧客からの問い合わせ
        inquiry_data = {
            "customer_id": test_data["sample_user_id"],
            "message": test_data["sample_query"],
            "channel": "web"
        }
        
        response = api_client.post("/webhook/customer-inquiry", inquiry_data)
        assert response.status_code == 200
        
        response_data = response.json()
        assert "agent_response" in response_data
        assert response_data["confidence"] > 0.5
        
        # 2. フォローアップ質問
        followup_data = {
            "customer_id": test_data["sample_user_id"],
            "message": "Can you provide more details?",
            "channel": "web"
        }
        
        followup_response = api_client.post("/webhook/customer-inquiry", followup_data)
        assert followup_response.status_code == 200
        
        # コンテキストが維持されていることを確認
        followup_response_data = followup_response.json()
        assert "detail" in followup_response_data["agent_response"].lower()
    
    def test_data_analysis_pipeline(self, docker_services, api_client):
        """データ分析パイプラインの完全テスト"""
        
        # 1. データアップロード
        sample_data = [
            {"date": "2024-01-01", "sales": 1000, "customers": 50},
            {"date": "2024-01-02", "sales": 1200, "customers": 55},
            {"date": "2024-01-03", "sales": 900, "customers": 45}
        ]
        
        upload_response = api_client.post("/api/data/upload", {
            "data": sample_data,
            "source": "sales_data"
        })
        assert upload_response.status_code == 200
        
        # 2. 分析実行
        analysis_request = {
            "analysis_type": "trend",
            "data_source": "sales_data",
            "parameters": {
                "time_column": "date",
                "value_columns": ["sales", "customers"]
            }
        }
        
        analysis_response = api_client.post("/api/analyze", analysis_request)
        assert analysis_response.status_code == 200
        
        analysis_results = analysis_response.json()
        assert "trends" in analysis_results
        assert "sales" in analysis_results["trends"]
        
        # 3. レポート生成
        report_request = {
            "analysis_id": analysis_results["analysis_id"],
            "format": "html"
        }
        
        report_response = api_client.post("/api/generate-report", report_request)
        assert report_response.status_code == 200
        
        report_data = report_response.json()
        assert "report_url" in report_data
    
    def test_workflow_error_handling(self, docker_services, api_client):
        """エラーハンドリングの統合テスト"""
        
        # 不正なデータでのリクエスト
        invalid_request = {
            "invalid_field": "invalid_value"
        }
        
        response = api_client.post("/webhook/customer-inquiry", invalid_request)
        assert response.status_code == 400
        
        error_data = response.json()
        assert "error" in error_data
        assert "missing required fields" in error_data["error"].lower()
    
    def test_performance_under_load(self, docker_services, api_client, test_data):
        """負荷下でのパフォーマンステスト"""
        import concurrent.futures
        import time
        
        def make_request():
            start_time = time.time()
            response = api_client.post("/webhook/customer-inquiry", {
                "customer_id": f"load_test_{time.time()}",
                "message": test_data["sample_query"],
                "channel": "web"
            })
            end_time = time.time()
            
            return {
                "status_code": response.status_code,
                "response_time": end_time - start_time,
                "success": response.status_code == 200
            }
        
        # 同時に10個のリクエストを送信
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request) for _ in range(10)]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        
        # 結果の検証
        success_count = sum(1 for r in results if r["success"])
        avg_response_time = sum(r["response_time"] for r in results) / len(results)
        
        assert success_count >= 8  # 80%以上の成功率
        assert avg_response_time < 5.0  # 平均5秒以内
```

### デプロイメント戦略

**1. Blue-Green デプロイメント**

```bash
#!/bin/bash
# blue-green-deploy.sh

set -euo pipefail

# 設定
BLUE_ENV="blue"
GREEN_ENV="green"
HEALTH_CHECK_URL="/health"
NGINX_CONFIG_DIR="/etc/nginx/conf.d"

# 現在のアクティブ環境を取得
get_active_environment() {
    if curl -s http://localhost${HEALTH_CHECK_URL} | grep -q "blue"; then
        echo "blue"
    elif curl -s http://localhost${HEALTH_CHECK_URL} | grep -q "green"; then
        echo "green"
    else
        echo "unknown"
    fi
}

# ヘルスチェック
health_check() {
    local env=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    echo "Performing health check for $env environment on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -sf "http://localhost:$port$HEALTH_CHECK_URL" >/dev/null 2>&1; then
            echo "Health check passed for $env environment"
            return 0
        fi
        
        echo "Health check attempt $attempt/$max_attempts failed, retrying..."
        sleep 10
        ((attempt++))
    done
    
    echo "Health check failed for $env environment after $max_attempts attempts"
    return 1
}

# トラフィックの切り替え
switch_traffic() {
    local target_env=$1
    local target_port
    
    if [ "$target_env" = "blue" ]; then
        target_port=3001
    else
        target_port=3002
    fi
    
    echo "Switching traffic to $target_env environment (port $target_port)..."
    
    # Nginx設定の更新
    cat > "$NGINX_CONFIG_DIR/upstream.conf" << EOF
upstream app_server {
    server localhost:$target_port;
}
EOF
    
    # Nginx設定のリロード
    nginx -t && nginx -s reload
    
    echo "Traffic switched to $target_env environment"
}

# 古い環境のクリーンアップ
cleanup_old_environment() {
    local old_env=$1
    
    echo "Cleaning up $old_env environment..."
    
    docker-compose -f "docker-compose.$old_env.yml" down
    
    echo "Cleanup completed for $old_env environment"
}

# メインデプロイメント関数
deploy() {
    local version=$1
    
    echo "Starting Blue-Green deployment for version $version..."
    
    # 現在のアクティブ環境を取得
    local active_env=$(get_active_environment)
    echo "Current active environment: $active_env"
    
    # デプロイ先環境を決定
    local target_env
    if [ "$active_env" = "blue" ]; then
        target_env="green"
    else
        target_env="blue"
    fi
    
    echo "Deploying to $target_env environment..."
    
    # 新しい環境をデプロイ
    export VERSION=$version
    docker-compose -f "docker-compose.$target_env.yml" up -d
    
    # デプロイ完了を待機
    sleep 30
    
    # ヘルスチェック
    local target_port
    if [ "$target_env" = "blue" ]; then
        target_port=3001
    else
        target_port=3002
    fi
    
    if health_check "$target_env" "$target_port"; then
        # トラフィックを新しい環境に切り替え
        switch_traffic "$target_env"
        
        # 古い環境をクリーンアップ
        if [ "$active_env" != "unknown" ]; then
            sleep 30  # 切り替え後の安定化待機
            cleanup_old_environment "$active_env"
        fi
        
        echo "Deployment completed successfully! Active environment: $target_env"
    else
        echo "Deployment failed! Rolling back..."
        docker-compose -f "docker-compose.$target_env.yml" down
        exit 1
    fi
}

# ロールバック関数
rollback() {
    local active_env=$(get_active_environment)
    
    if [ "$active_env" = "unknown" ]; then
        echo "Cannot determine active environment for rollback"
        exit 1
    fi
    
    echo "Rolling back from $active_env environment..."
    
    # 前のバージョンの環境を起動
    local rollback_env
    if [ "$active_env" = "blue" ]; then
        rollback_env="green"
    else
        rollback_env="blue"
    fi
    
    # 前のバージョンのコンテナが存在するか確認
    if docker-compose -f "docker-compose.$rollback_env.yml" ps | grep -q Up; then
        switch_traffic "$rollback_env"
        cleanup_old_environment "$active_env"
        echo "Rollback completed! Active environment: $rollback_env"
    else
        echo "Previous environment not available for rollback"
        exit 1
    fi
}

# コマンドライン引数の処理
case "${1:-}" in
    deploy)
        if [ -z "${2:-}" ]; then
            echo "Usage: $0 deploy <version>"
            exit 1
        fi
        deploy "$2"
        ;;
    rollback)
        rollback
        ;;
    status)
        echo "Active environment: $(get_active_environment)"
        ;;
    *)
        echo "Usage: $0 {deploy <version>|rollback|status}"
        exit 1
        ;;
esac
```

これらのセキュリティ対策とベストプラクティスにより、安全で保守性の高いAgent AI開発環境を構築できます。次章では、開発中によく遭遇する問題の解決方法と将来の技術動向について解説します。