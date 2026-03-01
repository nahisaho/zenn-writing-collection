# SHIKIGAMI MCP Server

Deep Research用のMCPサーバー。DuckDuckGo検索とJina AI Readerを使用してリアルタイムWeb検索を実行。

## インストール

```bash
cd mcp-server
npm install
npm run build
```

## ツール

### search

DuckDuckGoでバッチWeb検索を実行。

```json
{
  "query": "TypeScript best practices",
  "maxResults": 10
}
```

または複数クエリ:

```json
{
  "query": ["TypeScript best practices", "TypeScript design patterns"],
  "maxResults": 5
}
```

### visit

Webページを訪問し、内容をLLM用にクリーンなテキストとして抽出。

```json
{
  "url": "https://example.com/article",
  "goal": "主要なポイントを抽出"
}
```

または複数URL:

```json
{
  "url": ["https://example.com/1", "https://example.com/2"]
}
```

## キャッシュシステム（v1.10.0）

検索・訪問結果をキャッシュして効率化。

### キャッシュモジュール

| モジュール | 説明 |
|-----------|------|
| `FileCacheStore` | ファイルベースのキャッシュストア（LRU、TTL） |
| `QueryCacheManager` | 検索・訪問・埋め込みのキャッシュ管理 |
| `SemanticCacheMatcher` | 意味的類似クエリのキャッシュマッチング |
| `GlobalCacheStore` | ユーザー横断グローバルキャッシュ |

### 使用例

```typescript
import { getDefaultCacheManager } from './cache';

const manager = getDefaultCacheManager();

// 検索結果のキャッシュ
const cached = await manager.getSearchResult({ query: 'TypeScript' });
if (!cached.hit) {
  const results = await search('TypeScript');
  await manager.setSearchResult({ query: 'TypeScript' }, results);
}
```

## VS Code設定

`.vscode/mcp.json`:

```json
{
  "servers": {
    "shikigami": {
      "command": "node",
      "args": ["${workspaceFolder}/shikigami/mcp-server/dist/index.js"]
    }
  }
}
```

## 要件準拠

- **REQ-DR-002**: DuckDuckGo Web検索 ✅
- **REQ-CS-004**: search/visit ツール ✅
- **REQ-CACHE-001**: キャッシュシステム ✅ (v1.10.0)
- **REQ-DICT-001**: ドメイン辞書 ✅ (v1.15.0)
- **REQ-PAT-001**: 特許検索最適化 ✅ (v1.15.0)
- **REQ-ALT-001**: 代替情報源管理 ✅ (v1.15.0)
- **REQ-EXT-001**: 構造化データ抽出 ✅ (v1.15.0)
- **REQ-PAY-001**: ペイウォール検知 ✅ (v1.15.0)
- **レート制限**: 1.5秒間隔（DuckDuckGo）、1秒間隔（Jina AI）

## v1.15.0 新機能

### 検索拡張

- **ドメイン辞書**: 専門用語の同義語展開・多言語展開
- **特許検索最適化**: IPC分類コード自動推定、各特許庁向けクエリ生成

```typescript
import { enhanceSearchQuery, getPatentSearchUrls } from '@nahisaho/shikigami-bcg-mcp-server';

// クエリ拡張
const enhanced = await enhanceSearchQuery('AI導入事例');
console.log(enhanced.additionalQueries);

// 特許検索URL取得
const urls = await getPatentSearchUrls('リチウムイオン電池');
```

### 訪問拡張

- **ペイウォール検知**: 有料記事の自動検出
- **代替情報源提案**: オープンアクセス版の提案
- **構造化データ抽出**: 論文・特許からのメタデータ抽出

```typescript
import { enhanceVisit, getAlternativeSources } from '@nahisaho/shikigami-bcg-mcp-server';

// 完全な訪問拡張
const enhanced = await enhanceVisit(url, html, { isPaper: true });
console.log(enhanced.structuredData);
console.log(enhanced.alternativeSources);
```

詳細は [docs/shikigami-v115-search-enhancement.prompt.md](docs/shikigami-v115-search-enhancement.prompt.md) と [docs/shikigami-v115-visit-enhancement.prompt.md](docs/shikigami-v115-visit-enhancement.prompt.md) を参照してください。

## 検索プロバイダー

| プロバイダー | 用途 | APIキー |
|-------------|------|---------|
| DuckDuckGo | Web検索 | 不要 |
| Jina AI Reader | ページ内容抽出 | 不要 |

