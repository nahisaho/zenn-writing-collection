/**
 * File Save Module
 * v1.28.0 - REQ-SHIKIGAMI-016: プロンプト・検索結果の永続化
 *
 * プロンプトをprompts/に、検索結果をresearch/に保存する機能
 * v1.28.0: すべてのユーザー入力（回答・指示・フィードバック）を保存
 */

import * as fs from 'fs';
import * as path from 'path';
import { getActiveProject, hasActiveProject } from './project.js';

// 保存結果の型定義
export interface SaveResult {
  success: boolean;
  filePath: string;
  message: string;
  timestamp: string;
}

// プロンプト保存オプション（v1.28.0 拡張）
export interface SavePromptOptions {
  filename?: string;
  type: 'original' | 'structured' | 'refinement' | 'answer' | 'instruction' | 'feedback' | 'approval';
  version?: number;
  phase?: string;
  sequence?: number;
  context?: string;
  metadata?: Record<string, unknown>;
}

// リサーチ保存オプション
export interface SaveResearchOptions {
  filename?: string;
  query?: string;
  source?: 'search' | 'visit' | 'manual';
  metadata?: Record<string, unknown>;
}

/**
 * 現在のタイムスタンプを取得
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * 日付文字列を取得（ファイル名用）
 */
function getDateString(): string {
  return new Date().toISOString().split('T')[0].replace(/-/g, '');
}

/**
 * 時刻文字列を取得（ファイル名用）
 */
function getTimeString(): string {
  return new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '');
}

/**
 * ファイル名をサニタイズ
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '-')
    .slice(0, 100);
}

/**
 * プロンプトを保存
 */
export async function savePrompt(
  content: string,
  options: SavePromptOptions
): Promise<SaveResult> {
  if (!hasActiveProject()) {
    throw new Error('No active project. Use set_project tool first.');
  }

  const project = getActiveProject()!;
  const timestamp = getTimestamp();
  const dateStr = getDateString();
  const timeStr = getTimeString();

  // ファイル名を決定
  let filename: string;
  if (options.filename) {
    filename = sanitizeFilename(options.filename);
  } else {
    switch (options.type) {
      case 'original':
        filename = `prompt_original_${dateStr}_${timeStr}.md`;
        break;
      case 'structured':
        filename = `prompt_structured_${dateStr}_${timeStr}.md`;
        break;
      case 'refinement':
        filename = `prompt_refinement-${options.version || 1}_${dateStr}_${timeStr}.md`;
        break;
      case 'answer':
        filename = `prompt_answer_${dateStr}_${timeStr}.md`;
        break;
      case 'instruction':
        filename = `prompt_instruction_${dateStr}_${timeStr}.md`;
        break;
      case 'feedback':
        filename = `prompt_feedback_${dateStr}_${timeStr}.md`;
        break;
      case 'approval':
        filename = `prompt_approval_${dateStr}_${timeStr}.md`;
        break;
      default:
        filename = `prompt_${dateStr}_${timeStr}.md`;
    }
  }

  // Markdownフロントマター付きのコンテンツを生成
  const frontmatter = {
    timestamp,
    project_id: project.projectId,
    type: options.type,
    ...(options.version && { version: options.version }),
    ...(options.phase && { phase: options.phase }),
    ...(options.sequence && { sequence: options.sequence }),
    ...(options.metadata && { metadata: options.metadata }),
  };

  const fullContent = `---
timestamp: "${frontmatter.timestamp}"
project_id: "${frontmatter.project_id}"
type: "${frontmatter.type}"${frontmatter.version ? `\nversion: ${frontmatter.version}` : ''}${frontmatter.phase ? `\nphase: "${frontmatter.phase}"` : ''}${frontmatter.sequence ? `\nsequence: ${frontmatter.sequence}` : ''}
---

${content}
${options.context ? `\n## Context\n\n${options.context}\n` : ''}`;

  const filePath = path.join(project.promptsDir, filename);

  try {
    fs.writeFileSync(filePath, fullContent, 'utf-8');

    // 会話ログにも追記（v1.28.0）
    await appendToConversationLog(project.promptsDir, content, options.type, timestamp);

    return {
      success: true,
      filePath,
      message: `Prompt saved successfully to ${filePath}`,
      timestamp,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to save prompt: ${message}`);
  }
}

/**
 * 会話ログに追記（v1.28.0）
 */
async function appendToConversationLog(
  promptsDir: string,
  content: string,
  type: string,
  timestamp: string
): Promise<void> {
  const logPath = path.join(promptsDir, 'conversation-log.md');
  const time = timestamp.split('T')[1].split('.')[0];
  const date = timestamp.split('T')[0];

  // ログファイルが存在しない場合はヘッダーを作成
  let logContent = '';
  if (!fs.existsSync(logPath)) {
    logContent = `# Conversation Log\n\n## Session: ${date}\n\n`;
  }

  // エントリを追加
  const role = type === 'structured' ? 'AI' : 'User';
  logContent += `### [${time}] ${role} (${type})\n\n${content}\n\n---\n\n`;

  try {
    fs.appendFileSync(logPath, logContent, 'utf-8');
  } catch {
    // ログ追記失敗は警告のみ（メイン処理は継続）
    console.warn(`Warning: Failed to append to conversation log`);
  }
}

/**
 * 検索結果を保存
 */
export async function saveResearch(
  content: string,
  options: SaveResearchOptions
): Promise<SaveResult> {
  if (!hasActiveProject()) {
    throw new Error('No active project. Use set_project tool first.');
  }

  const project = getActiveProject()!;
  const timestamp = getTimestamp();
  const dateStr = getDateString();
  const timeStr = getTimeString();

  // ファイル名を決定
  let filename: string;
  if (options.filename) {
    filename = sanitizeFilename(options.filename);
  } else {
    const source = options.source || 'manual';
    const queryPart = options.query
      ? `_${sanitizeFilename(options.query).slice(0, 30)}`
      : '';
    filename = `${source}${queryPart}_${dateStr}_${timeStr}.md`;
  }

  // Markdownフロントマター付きのコンテンツを生成
  const frontmatter = {
    timestamp,
    project_id: project.projectId,
    source: options.source || 'manual',
    ...(options.query && { query: options.query }),
    ...(options.metadata && { metadata: options.metadata }),
  };

  const fullContent = `---
timestamp: "${frontmatter.timestamp}"
project_id: "${frontmatter.project_id}"
source: "${frontmatter.source}"${frontmatter.query ? `\nquery: "${frontmatter.query}"` : ''}
---

${content}
`;

  const filePath = path.join(project.researchDir, filename);

  try {
    fs.writeFileSync(filePath, fullContent, 'utf-8');
    return {
      success: true,
      filePath,
      message: `Research saved successfully to ${filePath}`,
      timestamp,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to save research: ${message}`);
  }
}

/**
 * 検索結果をJSON形式で保存
 */
export async function saveResearchJson(
  data: unknown,
  options: SaveResearchOptions
): Promise<SaveResult> {
  if (!hasActiveProject()) {
    throw new Error('No active project. Use set_project tool first.');
  }

  const project = getActiveProject()!;
  const timestamp = getTimestamp();
  const dateStr = getDateString();
  const timeStr = getTimeString();

  // ファイル名を決定
  let filename: string;
  if (options.filename) {
    filename = sanitizeFilename(options.filename);
    if (!filename.endsWith('.json')) {
      filename += '.json';
    }
  } else {
    const source = options.source || 'manual';
    const queryPart = options.query
      ? `_${sanitizeFilename(options.query).slice(0, 30)}`
      : '';
    filename = `${source}${queryPart}_${dateStr}_${timeStr}.json`;
  }

  const jsonContent = {
    timestamp,
    project_id: project.projectId,
    source: options.source || 'manual',
    ...(options.query && { query: options.query }),
    ...(options.metadata && { metadata: options.metadata }),
    data,
  };

  const filePath = path.join(project.researchDir, filename);

  try {
    fs.writeFileSync(filePath, JSON.stringify(jsonContent, null, 2), 'utf-8');
    return {
      success: true,
      filePath,
      message: `Research JSON saved successfully to ${filePath}`,
      timestamp,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to save research JSON: ${message}`);
  }
}

/**
 * 汎用ファイル保存（指定ディレクトリに保存）
 */
export async function saveToProject(
  content: string,
  subdir: 'prompts' | 'research' | 'reports',
  filename: string
): Promise<SaveResult> {
  if (!hasActiveProject()) {
    throw new Error('No active project. Use set_project tool first.');
  }

  const project = getActiveProject()!;
  const timestamp = getTimestamp();

  let targetDir: string;
  switch (subdir) {
    case 'prompts':
      targetDir = project.promptsDir;
      break;
    case 'research':
      targetDir = project.researchDir;
      break;
    case 'reports':
      targetDir = project.reportsDir;
      break;
  }

  const filePath = path.join(targetDir, sanitizeFilename(filename));

  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return {
      success: true,
      filePath,
      message: `File saved successfully to ${filePath}`,
      timestamp,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to save file: ${message}`);
  }
}
