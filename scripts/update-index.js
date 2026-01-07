#!/usr/bin/env node
/**
 * INDEX.md 自動更新スクリプト
 * MUSUBIX Article V: INDEX Traceability 準拠
 * 
 * 使用方法:
 *   node scripts/update-index.js
 *   npm run index:update
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const ROOT_DIR = path.join(__dirname, '..');
const INDEX_PATH = path.join(ROOT_DIR, 'INDEX.md');
const BOOKS_DIR = path.join(ROOT_DIR, 'books');
const ARTICLES_DIR = path.join(ROOT_DIR, 'articles');

/**
 * 書籍情報を取得
 */
function getBookInfo(bookDir) {
  const configPath = path.join(BOOKS_DIR, bookDir, 'config.yaml');
  if (!fs.existsSync(configPath)) return null;
  
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = yaml.parse(configContent);
    const stats = fs.statSync(configPath);
    
    return {
      dir: bookDir,
      title: config.title || 'タイトル未設定',
      published: config.published || false,
      created: stats.birthtime,
      modified: stats.mtime
    };
  } catch (e) {
    console.error(`Error reading ${configPath}:`, e.message);
    return null;
  }
}

/**
 * 記事情報を取得
 */
function getArticleInfo(articleFile) {
  const articlePath = path.join(ARTICLES_DIR, articleFile);
  if (!fs.existsSync(articlePath)) return null;
  
  try {
    const content = fs.readFileSync(articlePath, 'utf8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return null;
    
    const frontmatter = yaml.parse(frontmatterMatch[1]);
    const stats = fs.statSync(articlePath);
    
    return {
      file: articleFile,
      title: frontmatter.title || 'タイトル未設定',
      published: frontmatter.published || false,
      created: stats.birthtime,
      modified: stats.mtime
    };
  } catch (e) {
    console.error(`Error reading ${articlePath}:`, e.message);
    return null;
  }
}

/**
 * 日付をフォーマット
 */
function formatDate(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * 状態を判定
 */
function getStatus(published) {
  return published ? '公開済み' : '執筆中';
}

/**
 * INDEX.mdから既存エントリを解析
 */
function parseExistingIndex() {
  if (!fs.existsSync(INDEX_PATH)) return { books: {}, articles: {} };
  
  const content = fs.readFileSync(INDEX_PATH, 'utf8');
  const books = {};
  const articles = {};
  
  // 書籍エントリを解析
  const bookMatches = content.matchAll(/\| ([a-f0-9]+)\/ \| (.+?) \| (.+?) \| (\d{4}-\d{2}-\d{2}) \| (\d{4}-\d{2}-\d{2}) \|/g);
  for (const match of bookMatches) {
    books[match[1]] = {
      title: match[2],
      status: match[3],
      created: match[4],
      updated: match[5]
    };
  }
  
  return { books, articles };
}

/**
 * INDEX.mdを更新
 */
function updateIndex() {
  const existing = parseExistingIndex();
  const today = formatDate(new Date());
  
  // 書籍ディレクトリをスキャン
  const bookDirs = fs.readdirSync(BOOKS_DIR)
    .filter(dir => {
      const fullPath = path.join(BOOKS_DIR, dir);
      return fs.statSync(fullPath).isDirectory() && 
             /^[a-f0-9]+$/.test(dir) &&
             fs.existsSync(path.join(fullPath, 'config.yaml'));
    });
  
  const books = [];
  let newCount = 0;
  
  for (const dir of bookDirs) {
    const info = getBookInfo(dir);
    if (!info) continue;
    
    const existingEntry = existing.books[dir];
    
    if (existingEntry) {
      // 既存エントリ: タイトルや公開状態が変わった場合のみ更新日を変更
      const statusChanged = getStatus(info.published) !== existingEntry.status;
      const titleChanged = info.title !== existingEntry.title;
      
      books.push({
        dir: dir + '/',
        title: info.title,
        status: getStatus(info.published),
        created: existingEntry.created,
        updated: (statusChanged || titleChanged) ? today : existingEntry.updated
      });
    } else {
      // 新規エントリ
      books.push({
        dir: dir + '/',
        title: info.title,
        status: getStatus(info.published),
        created: today,
        updated: today
      });
      newCount++;
      console.log(`📚 新規書籍を検出: ${info.title} (${dir})`);
    }
  }
  
  // 作成日でソート
  books.sort((a, b) => a.created.localeCompare(b.created));
  
  // 記事ディレクトリをスキャン
  let articles = [];
  if (fs.existsSync(ARTICLES_DIR)) {
    const articleFiles = fs.readdirSync(ARTICLES_DIR)
      .filter(file => file.endsWith('.md'));
    
    for (const file of articleFiles) {
      const info = getArticleInfo(file);
      if (info) {
        articles.push({
          file: info.file,
          title: info.title,
          status: getStatus(info.published),
          created: formatDate(info.created),
          updated: formatDate(info.modified)
        });
      }
    }
  }
  
  // INDEX.mdを読み込み、Booksセクションを更新
  let indexContent = fs.readFileSync(INDEX_PATH, 'utf8');
  
  // Booksテーブルを生成
  const booksTable = books.map(b => 
    `| ${b.dir} | ${b.title} | ${b.status} | ${b.created} | ${b.updated} |`
  ).join('\n');
  
  // Booksセクションを置換
  const booksPattern = /(\| ディレクトリ名 \| タイトル \| 状態 \| 作成日 \| 更新日 \|\n\|[-|]+\|\n)([\s\S]*?)(\n\n---)/;
  indexContent = indexContent.replace(booksPattern, `$1${booksTable}$3`);
  
  fs.writeFileSync(INDEX_PATH, indexContent);
  
  if (newCount > 0) {
    console.log(`\n✅ INDEX.md を更新しました（新規 ${newCount} 件追加）`);
  } else {
    console.log('✅ INDEX.md は最新の状態です');
  }
}

// メイン実行
try {
  updateIndex();
} catch (e) {
  console.error('❌ INDEX.md の更新に失敗しました:', e.message);
  process.exit(1);
}
