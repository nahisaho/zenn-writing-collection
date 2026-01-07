#!/usr/bin/env node
/**
 * Zenn Article 作成ラッパースクリプト
 * MUSUBIX Article V: INDEX Traceability 準拠
 * 
 * 使用方法:
 *   npm run new:article
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('📝 新規記事を作成中...\n');

try {
  // Zenn CLIで記事を作成
  const result = execSync('npx zenn new:article', {
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
  console.log('   1. frontmatter でメタデータを編集');
  console.log('   2. 記事内容を執筆');
  console.log('   3. npx zenn preview でプレビュー確認');
  
} catch (e) {
  console.error('❌ 記事作成に失敗しました:', e.message);
  process.exit(1);
}
