/**
 * File Parser Tool
 *
 * Implements REQ-DR-003: ファイル入力
 * Implements REQ-CS-003: コード/ドキュメント解析
 * Implements REQ-NUMERIC-001: 数値データ抽出 (v1.14.0)
 *
 * Supports:
 * - PDF (via pdf-parse or external API)
 * - Text files (txt, md, json, yaml, csv)
 * - Code files (ts, js, py, etc.)
 * - Numeric data extraction (currencies, percentages, dates, etc.)
 *
 * Note: For advanced parsing (complex PDF, Excel), use docling or external API
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  NumericDataExtractor,
  type NumericData,
} from './file-parser/numeric-extractor.js';

/**
 * v1.14.0: 数値データサマリー
 */
export interface NumericDataSummary {
  total: number;
  byType: Record<NumericData['type'], number>;
  currencies: { currency: string; total: number }[];
  dateRange?: { earliest: Date; latest: Date };
}

// v1.14.0: 数値データ抽出器のシングルトン
let numericExtractor: NumericDataExtractor | null = null;

function getNumericExtractor(): NumericDataExtractor {
  if (!numericExtractor) {
    numericExtractor = new NumericDataExtractor();
  }
  return numericExtractor;
}

export interface ParsedFile {
  /** ファイルパス */
  filePath: string;
  /** ファイル名 */
  fileName: string;
  /** 拡張子 */
  extension: string;
  /** MIMEタイプ */
  mimeType: string;
  /** 抽出されたテキスト */
  content: string;
  /** メタデータ */
  metadata: FileMetadata;
  /** エラー（あれば） */
  error?: string;
  /** v1.14.0: 数値データサマリー（オプション） */
  numericData?: NumericDataSummary;
}

export interface FileMetadata {
  /** ファイルサイズ（bytes） */
  size: number;
  /** 最終更新日時 */
  modifiedAt: string;
  /** 行数（テキストファイルの場合） */
  lineCount?: number;
  /** 文字数 */
  charCount?: number;
  /** 言語（コードファイルの場合） */
  language?: string;
}

/** 対応拡張子とMIMEタイプのマッピング */
const EXTENSION_MIME_MAP: Record<string, string> = {
  // Text
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.markdown': 'text/markdown',
  // Data
  '.json': 'application/json',
  '.yaml': 'application/yaml',
  '.yml': 'application/yaml',
  '.csv': 'text/csv',
  '.tsv': 'text/tab-separated-values',
  '.xml': 'application/xml',
  // Code
  '.ts': 'text/typescript',
  '.tsx': 'text/typescript',
  '.js': 'text/javascript',
  '.jsx': 'text/javascript',
  '.py': 'text/x-python',
  '.rb': 'text/x-ruby',
  '.go': 'text/x-go',
  '.rs': 'text/x-rust',
  '.java': 'text/x-java',
  '.c': 'text/x-c',
  '.cpp': 'text/x-c++',
  '.h': 'text/x-c',
  '.hpp': 'text/x-c++',
  '.cs': 'text/x-csharp',
  '.swift': 'text/x-swift',
  '.kt': 'text/x-kotlin',
  '.scala': 'text/x-scala',
  '.php': 'text/x-php',
  '.sh': 'text/x-shellscript',
  '.bash': 'text/x-shellscript',
  '.zsh': 'text/x-shellscript',
  '.sql': 'text/x-sql',
  // Config
  '.ini': 'text/plain',
  '.conf': 'text/plain',
  '.cfg': 'text/plain',
  '.toml': 'application/toml',
  '.env': 'text/plain',
  // Document
  '.html': 'text/html',
  '.htm': 'text/html',
  '.css': 'text/css',
  '.scss': 'text/x-scss',
  '.less': 'text/x-less',
  // Binary (will fail gracefully)
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

/** 言語判定 */
const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.py': 'python',
  '.rb': 'ruby',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java',
  '.c': 'c',
  '.cpp': 'c++',
  '.h': 'c',
  '.hpp': 'c++',
  '.cs': 'csharp',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.scala': 'scala',
  '.php': 'php',
  '.sh': 'shell',
  '.bash': 'bash',
  '.zsh': 'zsh',
  '.sql': 'sql',
  '.md': 'markdown',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.html': 'html',
  '.css': 'css',
};

/**
 * テキストファイルかどうか判定
 */
function isTextFile(extension: string): boolean {
  const textExtensions = new Set([
    '.txt', '.md', '.markdown',
    '.json', '.yaml', '.yml', '.csv', '.tsv', '.xml', '.toml',
    '.ts', '.tsx', '.js', '.jsx',
    '.py', '.rb', '.go', '.rs', '.java',
    '.c', '.cpp', '.h', '.hpp', '.cs',
    '.swift', '.kt', '.scala', '.php',
    '.sh', '.bash', '.zsh', '.sql',
    '.ini', '.conf', '.cfg', '.env',
    '.html', '.htm', '.css', '.scss', '.less',
  ]);
  return textExtensions.has(extension.toLowerCase());
}

/**
 * ファイルを解析してテキストを抽出
 * @param filePath ファイルパス
 * @param options オプション
 * @param options.extractNumeric 数値データを抽出するかどうか (v1.14.0)
 */
export async function parseFile(
  filePath: string,
  options?: { extractNumeric?: boolean }
): Promise<ParsedFile> {
  const absolutePath = path.resolve(filePath);
  const fileName = path.basename(absolutePath);
  const extension = path.extname(absolutePath).toLowerCase();
  const mimeType = EXTENSION_MIME_MAP[extension] ?? 'application/octet-stream';

  // ファイル存在確認
  if (!fs.existsSync(absolutePath)) {
    return {
      filePath: absolutePath,
      fileName,
      extension,
      mimeType,
      content: '',
      metadata: { size: 0, modifiedAt: '' },
      error: `File not found: ${absolutePath}`,
    };
  }

  // ファイル情報取得
  const stat = fs.statSync(absolutePath);
  const metadata: FileMetadata = {
    size: stat.size,
    modifiedAt: stat.mtime.toISOString(),
  };

  // テキストファイルの場合
  if (isTextFile(extension)) {
    try {
      const content = fs.readFileSync(absolutePath, 'utf-8');
      const lines = content.split('\n');

      metadata.lineCount = lines.length;
      metadata.charCount = content.length;
      metadata.language = EXTENSION_LANGUAGE_MAP[extension];

      // 大きすぎる場合は切り詰め
      const maxLength = 100000; // 100KB
      const truncatedContent = content.length > maxLength
        ? content.slice(0, maxLength) + '\n\n[Content truncated...]'
        : content;

      // v1.14.0: 数値データ抽出（オプション）
      let numericData: NumericDataSummary | undefined;
      if (options?.extractNumeric) {
        const extractor = getNumericExtractor();
        const extracted = extractor.extract(content);
        numericData = extractor.generateSummary(extracted);
      }

      return {
        filePath: absolutePath,
        fileName,
        extension,
        mimeType,
        content: truncatedContent,
        metadata,
        numericData,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        filePath: absolutePath,
        fileName,
        extension,
        mimeType,
        content: '',
        metadata,
        error: `Failed to read file: ${message}`,
      };
    }
  }

  // バイナリファイル（PDF, Office等）の場合
  // 注: 本格的な解析には docling や専用ライブラリが必要
  return {
    filePath: absolutePath,
    fileName,
    extension,
    mimeType,
    content: '',
    metadata,
    error: `Binary file parsing not supported for ${extension}. Use docling or external API for PDF/Office documents.`,
  };
}

/**
 * 複数ファイルを解析
 */
export async function parseFiles(filePaths: string[]): Promise<ParsedFile[]> {
  const results: ParsedFile[] = [];

  for (const filePath of filePaths) {
    const result = await parseFile(filePath);
    results.push(result);
  }

  return results;
}

/**
 * ディレクトリ内のファイルを再帰的に解析
 */
export async function parseDirectory(
  dirPath: string,
  options?: {
    /** 解析する拡張子（指定しない場合は全て） */
    extensions?: string[];
    /** 除外パターン（glob形式ではなく、パスに含まれる文字列） */
    exclude?: string[];
    /** 最大ファイル数 */
    maxFiles?: number;
  }
): Promise<ParsedFile[]> {
  const absolutePath = path.resolve(dirPath);
  const results: ParsedFile[] = [];

  const extensions = options?.extensions?.map(e => e.startsWith('.') ? e : `.${e}`);
  const exclude = options?.exclude ?? ['node_modules', '.git', 'dist', 'build'];
  const maxFiles = options?.maxFiles ?? 100;

  function walk(dir: string): void {
    if (results.length >= maxFiles) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (results.length >= maxFiles) break;

      const fullPath = path.join(dir, entry.name);

      // 除外パターンチェック
      if (exclude.some(pattern => fullPath.includes(pattern))) {
        continue;
      }

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();

        // 拡張子フィルタ
        if (extensions && !extensions.includes(ext)) {
          continue;
        }

        // テキストファイルのみ
        if (!isTextFile(ext)) {
          continue;
        }

        // 同期的に解析（簡易実装）
        const stat = fs.statSync(fullPath);
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const lines = content.split('\n');

          const maxLength = 100000;
          const truncatedContent = content.length > maxLength
            ? content.slice(0, maxLength) + '\n\n[Content truncated...]'
            : content;

          results.push({
            filePath: fullPath,
            fileName: entry.name,
            extension: ext,
            mimeType: EXTENSION_MIME_MAP[ext] ?? 'text/plain',
            content: truncatedContent,
            metadata: {
              size: stat.size,
              modifiedAt: stat.mtime.toISOString(),
              lineCount: lines.length,
              charCount: content.length,
              language: EXTENSION_LANGUAGE_MAP[ext],
            },
          });
        } catch {
          // エラー時はスキップ
        }
      }
    }
  }

  walk(absolutePath);
  return results;
}
