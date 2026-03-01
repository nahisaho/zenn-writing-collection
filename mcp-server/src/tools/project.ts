/**
 * Project Management Module
 * v1.23.0 - REQ-SHIKIGAMI-016: プロジェクトコンテキスト管理
 *
 * アクティブなプロジェクトディレクトリを管理し、
 * 他のツール（save_prompt, save_research）が使用するパスを提供
 */

import * as fs from 'fs';
import * as path from 'path';

// アクティブなプロジェクト情報
interface ActiveProject {
  projectPath: string;
  projectId: string;
  projectName: string;
  promptsDir: string;
  researchDir: string;
  reportsDir: string;
  manifestPath: string;
}

// グローバルな現在のプロジェクト
let currentProject: ActiveProject | null = null;

/**
 * プロジェクトディレクトリが有効かどうか検証
 */
export function isValidProjectDirectory(projectPath: string): boolean {
  // 必須ディレクトリの存在チェック
  const requiredDirs = ['prompts', 'research', 'reports'];
  const requiredFiles = ['manifest.yaml'];

  for (const dir of requiredDirs) {
    const dirPath = path.join(projectPath, dir);
    if (!fs.existsSync(dirPath)) {
      return false;
    }
  }

  // manifest.yamlまたはmanifest.ymlの存在チェック
  const manifestYaml = path.join(projectPath, 'manifest.yaml');
  const manifestYml = path.join(projectPath, 'manifest.yml');
  if (!fs.existsSync(manifestYaml) && !fs.existsSync(manifestYml)) {
    return false;
  }

  return true;
}

/**
 * プロジェクトパスからプロジェクト情報を抽出
 */
function extractProjectInfo(projectPath: string): { projectId: string; projectName: string } {
  const dirName = path.basename(projectPath);
  // pjXXXXX_ProjectName_YYYYMMDD 形式をパース
  const match = dirName.match(/^(pj\d{5})_(.+?)_\d{8}$/);

  if (match) {
    return {
      projectId: match[1],
      projectName: match[2],
    };
  }

  // フォールバック
  return {
    projectId: dirName,
    projectName: dirName,
  };
}

/**
 * アクティブなプロジェクトを設定
 */
export function setActiveProject(projectPath: string): ActiveProject {
  // 絶対パスに変換
  const absolutePath = path.isAbsolute(projectPath)
    ? projectPath
    : path.resolve(process.cwd(), projectPath);

  // パスの存在チェック
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Project directory not found: ${absolutePath}`);
  }

  // プロジェクトディレクトリの検証
  if (!isValidProjectDirectory(absolutePath)) {
    throw new Error(
      `Invalid project directory: ${absolutePath}. ` +
        'Expected prompts/, research/, reports/ directories and manifest.yaml'
    );
  }

  const { projectId, projectName } = extractProjectInfo(absolutePath);

  // manifest.yamlのパスを解決
  const manifestYaml = path.join(absolutePath, 'manifest.yaml');
  const manifestYml = path.join(absolutePath, 'manifest.yml');
  const manifestPath = fs.existsSync(manifestYaml) ? manifestYaml : manifestYml;

  currentProject = {
    projectPath: absolutePath,
    projectId,
    projectName,
    promptsDir: path.join(absolutePath, 'prompts'),
    researchDir: path.join(absolutePath, 'research'),
    reportsDir: path.join(absolutePath, 'reports'),
    manifestPath,
  };

  return currentProject;
}

/**
 * 現在のアクティブなプロジェクトを取得
 */
export function getActiveProject(): ActiveProject | null {
  return currentProject;
}

/**
 * プロジェクトがアクティブかどうか確認
 */
export function hasActiveProject(): boolean {
  return currentProject !== null;
}

/**
 * アクティブなプロジェクトをクリア
 */
export function clearActiveProject(): void {
  currentProject = null;
}

/**
 * プロジェクトの特定ディレクトリパスを取得
 */
export function getProjectSubdirectory(
  subdir: 'prompts' | 'research' | 'reports'
): string {
  if (!currentProject) {
    throw new Error('No active project. Use set_project tool first.');
  }

  switch (subdir) {
    case 'prompts':
      return currentProject.promptsDir;
    case 'research':
      return currentProject.researchDir;
    case 'reports':
      return currentProject.reportsDir;
  }
}

/**
 * プロジェクト情報をJSON形式で返す（MCPレスポンス用）
 */
export function getProjectInfo(): Record<string, unknown> {
  if (!currentProject) {
    return {
      active: false,
      message: 'No active project. Use set_project tool to set one.',
    };
  }

  return {
    active: true,
    projectId: currentProject.projectId,
    projectName: currentProject.projectName,
    projectPath: currentProject.projectPath,
    directories: {
      prompts: currentProject.promptsDir,
      research: currentProject.researchDir,
      reports: currentProject.reportsDir,
    },
    manifestPath: currentProject.manifestPath,
  };
}

/**
 * projects/ディレクトリから最新のプロジェクトを自動検出
 */
export function detectLatestProject(basePath?: string): string | null {
  const searchPath = basePath || process.cwd();
  const projectsDir = path.join(searchPath, 'projects');

  if (!fs.existsSync(projectsDir)) {
    return null;
  }

  try {
    const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
    const projects = entries
      .filter((e) => e.isDirectory() && e.name.startsWith('pj'))
      .map((e) => ({
        name: e.name,
        path: path.join(projectsDir, e.name),
        mtime: fs.statSync(path.join(projectsDir, e.name)).mtime,
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    if (projects.length > 0) {
      return projects[0].path;
    }
  } catch {
    // Ignore errors
  }

  return null;
}
