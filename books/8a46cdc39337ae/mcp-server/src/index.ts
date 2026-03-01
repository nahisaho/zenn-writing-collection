#!/usr/bin/env node
/**
 * SHIKIGAMI MCP Server
 * 
 * Deep Research tools with DuckDuckGo search and Jina AI page fetching.
 * Implements REQ-DR-002, REQ-DR-003, REQ-CS-002, REQ-CS-003, REQ-CS-004 from requirements.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { searchDuckDuckGo, type SearchResult } from './tools/search.js';
import { visitPage, type PageContent } from './tools/visit.js';
import { parseFile, parseFiles, parseDirectory, type ParsedFile } from './tools/file-parser.js';
import {
  embed,
  embedBatch,
  similarity,
  semanticSearch,
  type EmbeddingResult,
  type SimilarityResult,
  type SearchResult as SemanticSearchResult,
} from './tools/embedding.js';
import {
  setActiveProject,
  getProjectInfo,
  detectLatestProject,
} from './tools/project.js';
import {
  savePrompt,
  saveResearch,
  saveResearchJson,
  type SavePromptOptions,
  type SaveResearchOptions,
} from './tools/save.js';
import {
  detectBranchPoint,
  evaluateAllBranches,
  selectBranch,
  mergeBranches,
  applyMergeResult,
  initMultiPopState,
  createBranches,
  initBudget,
  DEFAULT_MULTI_POP_CONFIG,
  type MultiPopConfig,
  type MultiPopState,
  type BranchContext,
  type Branch,
  type BranchEvaluation,
} from './tools/multi-pop/index.js';

// Tool definitions
const TOOLS: Tool[] = [
  // Project Management Tools (v1.23.0)
  {
    name: 'set_project',
    description: `アクティブなプロジェクトディレクトリを設定。
save_prompt, save_researchの前に必ず実行。
プロジェクトパスはnpx shikigami newで作成されたフォルダを指定。`,
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'プロジェクトディレクトリの絶対パスまたは相対パス（例: projects/pj00001_MyProject_20260127）',
        },
        autoDetect: {
          type: 'boolean',
          default: false,
          description: 'trueの場合、projects/内の最新プロジェクトを自動検出',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_project',
    description: `現在のアクティブなプロジェクト情報を取得。
プロジェクトID、パス、各ディレクトリの情報を返却。`,
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'save_prompt',
    description: `プロンプトをプロジェクトのprompts/ディレクトリに保存。
v1.28.0: 最初のプロンプトだけでなく、すべてのユーザー入力（回答・指示・フィードバック）を保存。
ユーザーから入力を受け取るたびに必ず呼び出すこと。
set_projectでプロジェクトを設定してから使用。`,
    inputSchema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: '保存するプロンプト/ユーザー入力の内容',
        },
        type: {
          type: 'string',
          enum: ['original', 'structured', 'refinement', 'answer', 'instruction', 'feedback', 'approval'],
          description: `入力の種類:
- original: 最初のリサーチ依頼
- structured: 構造化プロンプト（AI生成）
- refinement: 構造化プロンプトの修正
- answer: 質問への回答（v1.28.0）
- instruction: 追加指示・修正要求（v1.28.0）
- feedback: レポートへのフィードバック（v1.28.0）
- approval: 承認・確認（v1.28.0）`,
        },
        filename: {
          type: 'string',
          description: 'ファイル名（省略時は自動生成）',
        },
        version: {
          type: 'number',
          description: '修正バージョン番号（refinementタイプの場合）',
        },
        phase: {
          type: 'string',
          description: '現在のフェーズ（0, 0.5, 1, 2, 3, 4, 5）',
        },
        sequence: {
          type: 'number',
          description: 'セッション内の連番',
        },
        context: {
          type: 'string',
          description: 'コンテキスト情報（前の質問など）',
        },
        metadata: {
          type: 'object',
          description: '追加のメタデータ',
        },
      },
      required: ['content', 'type'],
    },
  },
  {
    name: 'save_research',
    description: `検索結果や調査内容をプロジェクトのresearch/ディレクトリに保存。
Web検索結果、ページ訪問結果、手動メモを記録。
set_projectでプロジェクトを設定してから使用。`,
    inputSchema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: '保存する調査内容（Markdown形式推奨）',
        },
        query: {
          type: 'string',
          description: '検索クエリ（ファイル名に使用）',
        },
        source: {
          type: 'string',
          enum: ['search', 'visit', 'manual'],
          default: 'manual',
          description: '情報ソース（search: Web検索, visit: ページ訪問, manual: 手動入力）',
        },
        filename: {
          type: 'string',
          description: 'ファイル名（省略時は自動生成）',
        },
        format: {
          type: 'string',
          enum: ['markdown', 'json'],
          default: 'markdown',
          description: '保存形式',
        },
        data: {
          type: 'object',
          description: 'JSON形式で保存する場合のデータ（format=jsonの場合）',
        },
        metadata: {
          type: 'object',
          description: '追加のメタデータ',
        },
      },
      required: ['content'],
    },
  },
  // Search & Visit Tools
  {
    name: 'search',
    description: `バッチWeb検索を実行（DuckDuckGo使用）。
複数クエリを配列で指定可。各クエリのTop10結果を返却。
Deep Researchの情報収集フェーズで使用。`,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          oneOf: [
            { type: 'string', description: '単一の検索クエリ' },
            {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              description: '検索クエリのリスト（バッチ検索）',
            },
          ],
          description: '検索クエリ（文字列または文字列配列）',
        },
        maxResults: {
          type: 'number',
          default: 10,
          description: '各クエリあたりの最大結果数（デフォルト: 10）',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'visit',
    description: `Webページを訪問し、内容のテキストを抽出（Jina AI Reader使用）。
LLM用に最適化されたクリーンなテキストを返却。
Deep Researchの詳細調査フェーズで使用。`,
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          oneOf: [
            { type: 'string', description: '単一のURL' },
            {
              type: 'array',
              items: { type: 'string' },
              description: 'URLのリスト（バッチ訪問）',
            },
          ],
          description: '訪問するURL（文字列または文字列配列）',
        },
        goal: {
          type: 'string',
          description: 'このページ訪問の目的（抽出する情報の指針）',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'parse_file',
    description: `ローカルファイルを解析してテキストを抽出。
対応形式: テキスト(txt,md,json,yaml,csv)、コード(ts,js,py等)。
ドキュメント調査やコード解析に使用。`,
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          oneOf: [
            { type: 'string', description: '単一のファイルパス' },
            {
              type: 'array',
              items: { type: 'string' },
              description: 'ファイルパスのリスト（バッチ解析）',
            },
          ],
          description: '解析するファイルパス（文字列または文字列配列）',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'parse_directory',
    description: `ディレクトリ内のファイルを再帰的に解析。
コードベース全体の理解や、プロジェクト構造の把握に使用。
node_modules, .git等は自動除外。`,
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: '解析するディレクトリパス',
        },
        extensions: {
          type: 'array',
          items: { type: 'string' },
          description: '解析する拡張子リスト（例: [".ts", ".js"]）',
        },
        exclude: {
          type: 'array',
          items: { type: 'string' },
          description: '除外パターン（デフォルト: node_modules, .git, dist, build）',
        },
        maxFiles: {
          type: 'number',
          default: 100,
          description: '最大ファイル数（デフォルト: 100）',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'embed',
    description: `テキストの埋め込みベクトルを生成（Ollama/OpenAI使用）。
セマンティック検索や類似度計算の基盤。`,
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          oneOf: [
            { type: 'string', description: '単一のテキスト' },
            {
              type: 'array',
              items: { type: 'string' },
              description: 'テキストのリスト（バッチ処理）',
            },
          ],
          description: '埋め込みを生成するテキスト',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'similarity',
    description: `2つのテキスト間の意味的類似度を計算（0-1のスコア）。
コンテンツの関連性判定に使用。`,
    inputSchema: {
      type: 'object',
      properties: {
        textA: {
          type: 'string',
          description: '比較するテキストA',
        },
        textB: {
          type: 'string',
          description: '比較するテキストB',
        },
      },
      required: ['textA', 'textB'],
    },
  },
  {
    name: 'semantic_search',
    description: `クエリに最も類似したドキュメントを検索。
関連情報の発見やコンテキスト取得に使用。`,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '検索クエリ',
        },
        documents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: { type: 'string', description: 'ドキュメントテキスト' },
              metadata: { type: 'object', description: 'メタデータ（任意）' },
            },
            required: ['text'],
          },
          description: '検索対象ドキュメントのリスト',
        },
        topK: {
          type: 'number',
          default: 5,
          description: '返却する最大件数（デフォルト: 5）',
        },
        minScore: {
          type: 'number',
          default: 0,
          description: '最小類似度閾値（デフォルト: 0）',
        },
      },
      required: ['query', 'documents'],
    },
  },
  // Multi-Pop Tools (v1.51.0)
  {
    name: 'branch_detect',
    description: `Thinkフェーズの出力から分岐点を検出。マルチポップ（多段階分岐探索）の開始判定に使用。
対立仮説・複数解釈・探索パス分岐・多面的ギャップを検出。
v1.51.0 新機能。`,
    inputSchema: {
      type: 'object',
      properties: {
        thinkOutput: {
          type: 'string',
          description: 'Thinkフェーズの出力テキスト',
        },
        currentRound: {
          type: 'number',
          description: '現在のラウンド番号',
        },
        parentBranchId: {
          type: 'string',
          default: 'main',
          description: '親ブランチID（デフォルト: main）',
        },
        currentDepth: {
          type: 'number',
          default: 0,
          description: '現在の分岐深度（デフォルト: 0）',
        },
        state: {
          type: 'object',
          description: '現在のMultiPopState（前回の結果を渡す。初回は省略可）',
        },
      },
      required: ['thinkOutput', 'currentRound'],
    },
  },
  {
    name: 'branch_evaluate',
    description: `ブランチ探索の成果を評価し、スコアリング。
信頼度・情報量・新規性・関連性・発展性の5基準で評価。
v1.51.0 新機能。`,
    inputSchema: {
      type: 'object',
      properties: {
        branches: {
          type: 'array',
          description: '評価対象のブランチ配列（各ブランチのfindings含む）',
          items: { type: 'object' },
        },
        parentContext: {
          type: 'object',
          description: '親ブランチのコンテキスト（confirmedFacts, sources, evolvingReport）',
        },
      },
      required: ['branches', 'parentContext'],
    },
  },
  {
    name: 'branch_select',
    description: `評価結果に基づきブランチを選択し、有用情報をマージ。
最有望ブランチを主パスとして選択し、マージ候補の発見事項を統合。
v1.51.0 新機能。`,
    inputSchema: {
      type: 'object',
      properties: {
        evaluations: {
          type: 'array',
          description: 'branch_evaluateの結果（BranchEvaluation配列）',
          items: { type: 'object' },
        },
        branches: {
          type: 'array',
          description: '全ブランチデータ',
          items: { type: 'object' },
        },
        state: {
          type: 'object',
          description: '現在のMultiPopState',
        },
      },
      required: ['evaluations', 'branches'],
    },
  },
];

// Server setup
const server = new Server(
  {
    name: 'shikigami-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // Project Management Handlers (v1.23.0)
      case 'set_project': {
        const projectPath = args?.projectPath as string | undefined;
        const autoDetect = args?.autoDetect as boolean | undefined;

        let targetPath: string;

        if (autoDetect) {
          const detected = detectLatestProject();
          if (!detected) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: false,
                    error: 'No project found in projects/ directory. Create one with: npx shikigami new <ProjectName>',
                  }, null, 2),
                },
              ],
              isError: true,
            };
          }
          targetPath = detected;
        } else if (projectPath) {
          targetPath = projectPath;
        } else {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: 'Either projectPath or autoDetect=true is required',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }

        const project = setActiveProject(targetPath);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Active project set to: ${project.projectPath}`,
                project: getProjectInfo(),
              }, null, 2),
            },
          ],
        };
      }

      case 'get_project': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(getProjectInfo(), null, 2),
            },
          ],
        };
      }

      case 'save_prompt': {
        const content = args?.content as string;
        const type = args?.type as 'original' | 'structured' | 'refinement' | 'answer' | 'instruction' | 'feedback' | 'approval';
        const filename = args?.filename as string | undefined;
        const version = args?.version as number | undefined;
        const phase = args?.phase as string | undefined;
        const sequence = args?.sequence as number | undefined;
        const context = args?.context as string | undefined;
        const metadata = args?.metadata as Record<string, unknown> | undefined;

        const result = await savePrompt(content, {
          type,
          filename,
          version,
          phase,
          sequence,
          context,
          metadata,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'save_research': {
        const content = args?.content as string;
        const query = args?.query as string | undefined;
        const source = args?.source as 'search' | 'visit' | 'manual' | undefined;
        const filename = args?.filename as string | undefined;
        const format = args?.format as 'markdown' | 'json' | undefined;
        const data = args?.data as unknown;
        const metadata = args?.metadata as Record<string, unknown> | undefined;

        if (format === 'json' && data) {
          const result = await saveResearchJson(data, {
            query,
            source,
            filename,
            metadata,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        const result = await saveResearch(content, {
          query,
          source,
          filename,
          metadata,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Search & Visit Handlers
      case 'search': {
        const queryInput = args?.query as string | string[];
        const maxResults = (args?.maxResults as number) ?? 10;
        
        const queries = Array.isArray(queryInput) ? queryInput : [queryInput];
        const results: Record<string, SearchResult[]> = {};
        
        for (const query of queries) {
          results[query] = await searchDuckDuckGo(query, maxResults);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case 'visit': {
        const urlInput = args?.url as string | string[];
        const goal = (args?.goal as string) ?? '';
        
        const urls = Array.isArray(urlInput) ? urlInput : [urlInput];
        const results: PageContent[] = [];
        
        for (const url of urls) {
          const content = await visitPage(url, goal);
          results.push(content);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case 'parse_file': {
        const pathInput = args?.path as string | string[];
        
        const paths = Array.isArray(pathInput) ? pathInput : [pathInput];
        const results: ParsedFile[] = await parseFiles(paths);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case 'parse_directory': {
        const dirPath = args?.path as string;
        const extensions = args?.extensions as string[] | undefined;
        const exclude = args?.exclude as string[] | undefined;
        const maxFiles = (args?.maxFiles as number) ?? 100;
        
        const results: ParsedFile[] = await parseDirectory(dirPath, {
          extensions,
          exclude,
          maxFiles,
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case 'embed': {
        const textInput = args?.text as string | string[];
        
        if (Array.isArray(textInput)) {
          const results: EmbeddingResult[] = await embedBatch(textInput);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(results, null, 2),
              },
            ],
          };
        } else {
          const result: EmbeddingResult = await embed(textInput);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }
      }

      case 'similarity': {
        const textA = args?.textA as string;
        const textB = args?.textB as string;
        
        const result: SimilarityResult = await similarity(textA, textB);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'semantic_search': {
        const query = args?.query as string;
        const documents = args?.documents as Array<{ text: string; metadata?: Record<string, unknown> }>;
        const topK = (args?.topK as number) ?? 5;
        const minScore = (args?.minScore as number) ?? 0;
        
        const results: SemanticSearchResult[] = await semanticSearch(query, documents, {
          topK,
          minScore,
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      // Multi-Pop Handlers (v1.51.0)
      case 'branch_detect': {
        const thinkOutput = args?.thinkOutput as string;
        const currentRound = args?.currentRound as number;
        const parentBranchId = (args?.parentBranchId as string) ?? 'main';
        const currentDepth = (args?.currentDepth as number) ?? 0;
        const existingState = args?.state as MultiPopState | undefined;

        const config = DEFAULT_MULTI_POP_CONFIG;
        const budget = existingState
          ? { totalBudget: config.maxTotalRounds, consumed: existingState.totalConsumedRounds, reserved: 0, remaining: existingState.remainingBudget }
          : initBudget(config);

        const branchPoint = detectBranchPoint(
          thinkOutput,
          currentRound,
          parentBranchId,
          currentDepth,
          config,
          budget,
        );

        if (!branchPoint) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  detected: false,
                  message: '分岐点は検出されませんでした。通常のThink→Report→Actionフローを継続してください。',
                }, null, 2),
              },
            ],
          };
        }

        // ブランチを生成
        const state = existingState ?? initMultiPopState(config);
        const parentContext: BranchContext = {
          confirmedFacts: [],
          sources: [],
          evolvingReport: '',
        };
        const { branches, budget: updatedBudget } = createBranches(branchPoint, parentContext, budget, config);

        const updatedState: MultiPopState = {
          ...state,
          branchPoints: [...state.branchPoints, branchPoint],
          branches: [...state.branches, ...branches],
          remainingBudget: updatedBudget.remaining,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                detected: true,
                branchPoint,
                branches: branches.map((b) => ({
                  id: b.id,
                  label: b.label,
                  hypothesis: b.hypothesis,
                  allocatedRounds: b.allocatedRounds,
                })),
                state: updatedState,
                instruction: `${branches.length}個のブランチが生成されました。各ブランチについて独立にThink→Actionを${branches[0]?.allocatedRounds ?? 3}ラウンド実行し、結果をfindingsとして記録してください。完了後にbranch_evaluateを呼び出してください。`,
              }, null, 2),
            },
          ],
        };
      }

      case 'branch_evaluate': {
        const branchesInput = args?.branches as Branch[];
        const parentContext = args?.parentContext as BranchContext;

        const config = DEFAULT_MULTI_POP_CONFIG;
        const evaluations = evaluateAllBranches(branchesInput, parentContext, config);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                evaluations: evaluations.map((e) => ({
                  branchId: e.branchId,
                  totalScore: Math.round(e.totalScore * 1000) / 1000,
                  scores: Object.fromEntries(
                    Object.entries(e.scores).map(([k, v]) => [k, Math.round(v * 1000) / 1000]),
                  ),
                  recommendation: e.recommendation,
                  reasoning: e.reasoning,
                })),
                instruction: '評価が完了しました。branch_selectを呼び出してブランチを選択・マージしてください。',
              }, null, 2),
            },
          ],
        };
      }

      case 'branch_select': {
        const evaluations = args?.evaluations as BranchEvaluation[];
        const branchesData = args?.branches as Branch[];
        const existingState = args?.state as MultiPopState | undefined;

        const config = DEFAULT_MULTI_POP_CONFIG;
        const selection = selectBranch(evaluations, config);

        // マージ実行
        const selectedBranch = branchesData.find((b) => b.id === selection.selected);
        const mergeCandidateBranches = branchesData.filter((b) =>
          selection.mergeCandidates.includes(b.id),
        );

        let mergeResult = null;
        let finalBranch = selectedBranch;
        if (selectedBranch && mergeCandidateBranches.length > 0) {
          mergeResult = mergeBranches(selectedBranch, mergeCandidateBranches, config);
          finalBranch = applyMergeResult(selectedBranch, mergeResult);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                selected: selection.selected,
                mergeCandidates: selection.mergeCandidates,
                pruned: selection.pruned,
                mergeResult: mergeResult
                  ? {
                      mergedFindings: mergeResult.mergedFindings.length,
                      mergedSources: mergeResult.mergedSources.length,
                      excluded: mergeResult.excluded.length,
                    }
                  : null,
                selectedBranch: finalBranch
                  ? {
                      id: finalBranch.id,
                      hypothesis: finalBranch.hypothesis,
                      findingsCount: finalBranch.findings.length,
                      sourcesCount: finalBranch.inheritedContext.sources.length,
                    }
                  : null,
                instruction: `ブランチ「${selection.selected}」が選択されました。このブランチのコンテキストを使用してPhase 2 (Report) に進み、Evolving Reportを更新してください。`,
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SHIKIGAMI MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
