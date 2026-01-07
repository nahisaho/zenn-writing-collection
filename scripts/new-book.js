#!/usr/bin/env node
/**
 * Zenn Book 作成ラッパースクリプト
 * MUSUBIX Article V: INDEX Traceability 準拠
 * 
 * 使用方法:
 *   npm run new:book -- --title "タイトル"
 */

const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const titleArg = args.find(arg => arg.startsWith('--title'));
const title = titleArg ? args[args.indexOf(titleArg) + 1] || args[args.indexOf('--title') + 1] : null;

// タイトルを引数から抽出（--title "タイトル" 形式）
let bookTitle = '';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--title' && args[i + 1]) {
    bookTitle = args[i + 1];
    break;
  }
}

if (!bookTitle) {
  console.error('❌ タイトルを指定してください: npm run new:book -- --title "タイトル"');
  process.exit(1);
}

console.log(`📚 新規書籍を作成: ${bookTitle}\n`);

try {
  // Zenn CLIで書籍を作成
  const result = execSync(`npx zenn new:book --title "${bookTitle}"`, {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  console.log(result);
  
  // INDEX.mdを自動更新
  console.log('\n📋 INDEX.md を更新中...');
  execSync('node scripts/update-index.js', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
    stdio: 'inherit'
  });
  
  console.log('\n🎉 完了！次のステップ:');
  console.log('   1. config.yaml でメタデータを編集');
  console.log('   2. draft-*.md で構成を設計');
  console.log('   3. 各章ファイルを作成');
  console.log('   4. npx zenn preview でプレビュー確認');
  
} catch (e) {
  console.error('❌ 書籍作成に失敗しました:', e.message);
  process.exit(1);
}
