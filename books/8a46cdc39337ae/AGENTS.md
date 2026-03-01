# SHIKIGAMI - Deep Research Agent Skills v1.35.0

> Knowledge for AI Coding Agents — Triggers and Actions defined with WHEN/DO syntax

---

## ⚠️ ABSOLUTE FIRST RULE - READ BEFORE ANY ACTION

```
🚨 STOP! Before doing ANYTHING with a research/article/report request:

1. Is this a research, article creation, or report task?
   → YES: You MUST start Phase 0 IMMEDIATELY. No exceptions.
   → NO: Proceed with direct response.

2. Phase 0 means:
   - ASK the user for project name FIRST
   - Do NOT read files, search, or analyze before project setup
   - Do NOT skip to "investigating" the topic

3. After Phase 0, you MUST execute Phase 1 (Prompt Optimization):
   - Display 6-element structured prompt
   - WAIT for user approval
   - Do NOT start search until user approves

VIOLATION = WORKFLOW FAILURE
```

---

## Quick Reference

| Item | Value |
|------|-------|
| Version | 1.42.0 |
| Agent Skills | 4 |
| MCP Tools | 11 |
| Frameworks | 53 |
| Report Templates | 33 |

---

## Critical Rules (5 Absolute Prohibitions)

**⚠️ IMPORTANT: These rules MUST be followed. Violation breaks the research workflow.**

### Prohibition 0: ALWAYS Start from Phase 0 (HIGHEST PRIORITY)

```
🚨🚨🚨 THIS IS THE MOST IMPORTANT RULE 🚨🚨🚨

WHEN: Received ANY of the following task types:

  【Research & Analysis】
  - Research / Investigation / Analysis requests
  - Market research, competitive analysis, technology assessment
  - Literature review, survey, or systematic review
  - Feasibility study or due diligence
  - "調査して" "リサーチして" "分析して"

  【Content Creation】
  - Report creation (research report, technical report, proposal)
  - Article creation (Qiita, blog, technical documentation)
  - White paper or case study creation
  - Presentation material requiring external research
  - "記事を作成" "レポート作成" "紹介記事"

  【Information Gathering】
  - Information gathering from external sources
  - Web search-based tasks
  - Multi-source data compilation
  - Trend analysis or news monitoring

DO: IMMEDIATELY start Phase 0 (Project Initialization)
    → Your FIRST response must be: "プロジェクト名はどのようにしますか？"
    → Do NOT read workspace files first
    → Do NOT start "investigating" the topic
    → Do NOT use any tools before asking project name

FORBIDDEN (IMMEDIATE VIOLATION):
  - Skipping Phase 0
  - Starting from Phase 1 or any later phase
  - Answering research questions without project setup
  - Performing web search before set_project
  - Creating reports/articles without tracking
  - Reading files to "understand" the topic before Phase 0
  - Using read_file, grep_search, semantic_search before project setup

CONSEQUENCE: Workflow corruption, data loss, untracked research

CORRECT FIRST RESPONSE EXAMPLE:
  User: "AI for Science向けにToolUniverseの紹介記事を作成して"
  Agent: "記事作成タスクですね。プロジェクト名はどのようにしますか？
         （CamelCase、英数字のみ）
         例: ToolUniverseArticle, AIforScienceIntro"

INCORRECT FIRST RESPONSE (VIOLATION):
  User: "AI for Science向けにToolUniverseの紹介記事を作成して"
  Agent: "ToolUniverseを調査します..." ← ❌ WRONG! Phase 0 skipped!
```

### Tasks NOT Requiring Phase 0 (Direct Response Allowed)

The following tasks can be handled directly WITHOUT initiating the research workflow:

```
WHEN: Task matches ANY of the following:

  【Code Operations】
  - Simple code fixes, bug corrections, or refactoring
  - Code review of provided snippets (no external research)
  - Adding features to existing codebase (no external research)
  - Explaining/summarizing code already in workspace

  【Q&A】
  - Answering conceptual questions from AI's existing knowledge
  - Explaining programming concepts, syntax, or best practices
  - Providing code examples from memory (no web search needed)

  【File Operations】
  - File creation, editing, or deletion (no research needed)
  - Configuration file updates
  - Documentation updates for existing code

  【Other】
  - Clarification questions to user
  - Project status checks
  - Tool/command execution assistance

DO: Respond directly without Phase 0
CONDITION: No web search or external information gathering required
```

### Prohibition 2: Project Creation Required Before Research

```
WHEN: Received a research, investigation, or analysis request
DO: 
  - If user says "project created" or "created project directory": 
    → Call set_project(autoDetect: true) and proceed to Phase 1
  - Otherwise:
    → Execute `npx shikigami new <ProjectName>` before starting research
THEN: Call set_project(autoDetect: true) to activate the project
FORBIDDEN: Web search, using search tools, or gathering information before project activation
```

### Prohibition 3: save_research Required After search/visit

**🚨🚨🚨 EVERY search/visit MUST be followed by save_research 🚨🚨🚨**

```
WHEN: Executed search or visit MCP tool
DO: IMMEDIATELY call save_research MCP tool (within the SAME response, not later)

MANDATORY PATTERN - NO EXCEPTIONS:
  search(...) → save_research(...) → next action
  visit(...)  → save_research(...) → next action

EXAMPLE 1 (Search):
  1. search(query: ["AI市場動向", "AI market trends"])
  2. save_research(
       content: "<検索結果の全文をここに>",
       source: "search",
       query: "AI市場動向"
     )

EXAMPLE 2 (Visit):
  1. visit(url: "https://example.com/article")
  2. save_research(
       content: "<ページ内容の全文をここに>",
       source: "visit",
       query: "https://example.com/article"
     )

FORBIDDEN (IMMEDIATE VIOLATION):
  - Calling search then another search without save_research in between
  - Calling visit then summarizing without save_research first
  - Proceeding to analysis without saving raw data
  - "I'll save it later" - NO! Save IMMEDIATELY

CONSEQUENCE: Research data will be lost, workflow corrupted, unable to cite sources
```

**CORRECT FLOW**:
```
Agent: search(query: [...])
       → [結果を受信]
       → save_research(content: <全結果>, source: "search", query: <query>)
       → "検索結果を保存しました。次に..."
```

**INCORRECT FLOW (VIOLATION)**:
```
Agent: search(query: [...])
       → "検索結果によると..." ← ❌ save_research を呼んでいない！
```

### Prohibition 4: save_prompt Required After User Input

```
WHEN: Received ANY input from user (answer, instruction, feedback, approval, question)
DO: IMMEDIATELY call save_prompt MCP tool (within the same response)
EXAMPLE:
  User says: "Focus on Japanese market"
  → save_prompt(content: "Focus on Japanese market", type: "instruction")
FORBIDDEN: Continuing without saving user input
CONSEQUENCE: Conversation history will be lost if not saved
```

### Prohibition 5: PDF Reference via Download and Text Conversion

```
WHEN: Referencing a PDF document in Deep Research
DO:
  1. Create research directory if not exists:
     mkdir -p <project_path>/research
  2. Download PDF using wget:
     wget -O <project_path>/research/<filename>.pdf <pdf_url>
  3. Convert PDF to text using pdftotext:
     pdftotext <project_path>/research/<filename>.pdf <project_path>/research/<filename>.txt
  4. Read and reference the converted text file
  5. Save the extracted content via save_research

EXAMPLE:
  1. mkdir -p projects/pj00001_AIResearch/research
  2. wget -O projects/pj00001_AIResearch/research/paper.pdf https://example.com/paper.pdf
  3. pdftotext projects/pj00001_AIResearch/research/paper.pdf projects/pj00001_AIResearch/research/paper.txt
  4. Read paper.txt and extract relevant information
  5. save_research(content: <extracted_content>, source: "pdf", query: "paper.pdf")

FORBIDDEN:
  - Attempting to read PDF binary directly
  - Skipping pdftotext conversion step
  - Saving PDF to locations other than research directory
  - Referencing PDF content without save_research

CONSEQUENCE: PDF content will be unreadable or lost
```

### Mandatory MCP Call Sequence

Every search/visit operation MUST follow this pattern:
```
1. search(query: [...]) or visit(url: [...])
2. save_research(content: <results>, source: "search"|"visit", query: <query>)
```

Every user interaction MUST trigger:
```
save_prompt(content: <user_input>, type: "original"|"answer"|"instruction"|"feedback"|"approval")
```

---

## Task Classification Decision Tree

Use this flowchart to determine whether Phase 0 is required:

```
                    ┌─────────────────────────┐
                    │   User Request Received │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │ Does task require:       │
                    │ • Web search?            │
                    │ • External data?         │
                    │ • Multi-source analysis? │
                    └───────────┬─────────────┘
                                │
              ┌────── YES ──────┴────── NO ──────┐
              │                                   │
              ▼                                   ▼
    ┌─────────────────┐               ┌─────────────────┐
    │ Is it content   │               │ Is it a simple  │
    │ creation?       │               │ code/file task? │
    │ (report/article)│               └────────┬────────┘
    └────────┬────────┘                        │
             │                     ┌─── YES ───┴─── NO ───┐
             │                     │                      │
      ┌──────┴──────┐              ▼                      ▼
      │             │    ┌─────────────────┐   ┌─────────────────┐
   YES│          NO │    │ Direct Response │   │ Ask for         │
      │             │    │ (No Phase 0)    │   │ Clarification   │
      ▼             ▼    └─────────────────┘   └─────────────────┘
┌───────────┐ ┌───────────┐
│ Phase 0   │ │ Phase 0   │
│ REQUIRED  │ │ REQUIRED  │
└───────────┘ └───────────┘

DECISION RULES:
1. Web search needed → Phase 0 REQUIRED
2. Report/Article creation → Phase 0 REQUIRED (even if data is local)
3. Simple code task + No external data → Direct response OK
4. Uncertain → Ask user for clarification
```

### Edge Cases and Clarification Guidelines

| Scenario | Decision | Rationale |
|----------|----------|-----------|
| "Create introduction article for 〇〇" | Phase 0 | Content creation task |
| "Explain this code" | Direct | Explaining code in workspace |
| "Tell me about 〇〇" (general knowledge) | Direct | Answerable from AI's existing knowledge |
| "Research latest trends in 〇〇" | Phase 0 | Web search required |
| "Compare 〇〇 and △△" (external data needed) | Phase 0 | External information required |
| "Compare 〇〇 and △△" (within code) | Direct | Completable within workspace |
| "Modify AGENTS.md" | Direct | File editing task |
| "Research best practices for 〇〇" | Phase 0 | External research required |

**Principle when uncertain**:
> "Does this task require information from outside the workspace?"
> → YES: Start Phase 0
> → NO: Direct response

---

## Workflow Execution Order

**⚠️ CRITICAL: ALWAYS START FROM PHASE 0. Execute phases in STRICT numerical order: 0→1→2→3→4→5→6**

**FORBIDDEN**: Skipping Phase 0, jumping directly to search/research, starting from Phase 1 or later

### First Action on ANY Research Request

```
WHEN: Received ANY research, investigation, analysis, or information gathering request
DO: IMMEDIATELY execute Phase 0 (Project Initialization)
FORBIDDEN: 
  - Starting web search without project
  - Skipping to Phase 1 or later
  - Answering the research question directly
```

### Case A: User already created project directory

When user says "project created", "created project", or similar:

1. **(Phase 0)** **Set Context** → `set_project(autoDetect: true)`
2. **(Phase 0)** **Save Original Prompt** → `save_prompt(type: "original")`
3. **(Phase 1)** **Prompt Optimization** → Structure into 6 elements → Display → **WAIT for user approval**
4. **(Phase 2)** **Purpose Discovery** → Discover true purpose through 1Q1A dialogue
5. **(Phase 2.5)** **Knowledge Inheritance** → Search past projects → Inherit if relevant (optional)
6. **(Phase 3)** **Deep Research** → Think→Search→Report→Action cycle
7. **(Phase 4)** **Framework Analysis** → Apply SWOT/3C/PEST etc.
8. **(Phase 5)** **Report Generation** → Select template → Write report → Quality check → **WAIT for approval**
9. **(Phase 6)** **Complete** → Update manifest.yaml, verify deliverables

### Case B: New research request (no project yet)

When receiving a new research request:

1. **(Phase 0)** **ASK Project Name** → "What project name would you like?" → **WAIT for user response**
2. **(Phase 0)** **Create Project** → `npx shikigami new <ProjectName>` (only after user confirms)
3. **(Phase 0)** **Set Context** → `set_project(autoDetect: true)`
4. **(Phase 0)** **Save Original Prompt** → `save_prompt(type: "original")`
5. **(Phase 0)** **Verify Folder** → Confirm `projects/pjXXXXX_<Name>_YYYYMMDD/` exists
6. **(Phase 1)** **Prompt Optimization** → Structure into 6 elements → Display → **WAIT for user approval**
7. **(Phase 2)** **Purpose Discovery** → Discover true purpose through 1Q1A dialogue
8. **(Phase 2.5)** **Knowledge Inheritance** → Search past projects → Inherit if relevant (optional)
9. **(Phase 3)** **Deep Research** → Think→Search→Report→Action cycle
10. **(Phase 4)** **Framework Analysis** → Apply SWOT/3C/PEST etc.
11. **(Phase 5)** **Report Generation** → Select template → Write report → Quality check → **WAIT for approval**
12. **(Phase 6)** **Complete** → Update manifest.yaml, verify deliverables

**MANDATORY APPROVAL POINTS** (must wait for user before proceeding):
- Case B Step 1: Project name confirmation
- Phase 1 (both cases): Structured prompt approval
- Phase 5→6 (both cases): Quality check approval

---

## Phase Details

### Phase 0: Project Initialization

```
WHEN: Received research request
DO:
  Case A - User says "project created" / "created project directory":
    1. Execute set_project(autoDetect: true)
    2. Save original prompt with save_prompt(type: "original")
    3. Proceed to Phase 1 immediately
  
  Case B - New request (no project mentioned):
    1. STOP and ask user: "What project name would you like? (CamelCase, alphanumeric only)"
    2. WAIT for user response (do NOT proceed without approval)
    3. After user confirms name: Execute npx shikigami new <ProjectName>
    4. Execute set_project(autoDetect: true)
    5. Save original prompt with save_prompt(type: "original")
    6. IMMEDIATELY proceed to Phase 1 (Prompt Optimization) - DO NOT START SEARCH
OUTPUT: projects/pjXXXXX_ProjectName_YYYYMMDD/
NEXT: Phase 1 (Prompt Optimization) - NOT Phase 3 (Search)
```

**CRITICAL**: 
- If user indicates project is already created → skip to set_project and proceed to Phase 1
- If new request → MUST ask user for project name confirmation
- You MUST NOT skip to research phase without project activation
- After Phase 0, you MUST execute Phase 1 (NOT jump to search)

**Naming Rules**:
- Folder: `pjXXXXX_ProjectName_YYYYMMDD`
- ProjectName: CamelCase, alphanumeric only (hyphens, spaces, Japanese characters prohibited)
- XXXXX: 5-digit sequential number (auto-assigned)

### Phase 1: Prompt Optimization

** THIS PHASE IS MANDATORY - NEVER SKIP **

```
WHEN: Phase 0 completed (project created and set_project called)
DO:
  1. STOP - Do NOT start searching yet
  2. Analyze original prompt and structure into 6 elements (see table below)
  3. Display structured prompt to user in formatted table
  4. Save with save_prompt(type: "structured")
  5. Ask user: "Please review and approve this structured prompt, or suggest modifications."
  6. WAIT for user approval (do NOT proceed without approval)
  7. Save approval/modifications with save_prompt(type: "approval" or "instruction")
OUTPUT: 6-element structured prompt (user approved)

FORBIDDEN (IMMEDIATE VIOLATION):
  - Starting search/visit before user approves structured prompt
  - Skipping directly to Phase 2 or Phase 3
  - Proceeding without displaying the 6-element table
  - Assuming user approval without explicit confirmation
```

**CRITICAL**:
- You MUST display the 6-element structured prompt
- You MUST wait for user approval before proceeding to Phase 2
- You MUST NOT skip prompt optimization
- You MUST NOT start web search until Phase 3

**CORRECT FLOW AFTER PROJECT CREATION**:
```
Agent: "プロジェクトを作成しました。次にプロンプトを構造化します。

| 要素 | 内容 |
|------|------|
| PURPOSE | ... |
| TARGET | ... |
| SCOPE | ... |
| TIMELINE | ... |
| CONSTRAINTS | ... |
| DELIVERABLES | ... |

この構造化プロンプトを確認して承認してください。修正があればお知らせください。"

→ WAIT for user response ←
```

**INCORRECT FLOW (VIOLATION)**:
```
Agent: "プロジェクトを作成しました。では調査を開始します..." ← ❌ WRONG!
Agent: "検索します..." ← ❌ WRONG! Phase 1 skipped!
```

**6 Elements**:
| Element | Description |
|---------|-------------|
| PURPOSE | What do you want to decide/determine? |
| TARGET | What/whom are you investigating? |
| SCOPE | Depth and breadth of research |
| TIMELINE | Information timeframe, deadline |
| CONSTRAINTS | Research limitations |
| DELIVERABLES | Expected outputs |

### Phase 2: Purpose Discovery

```
WHEN: User approval obtained in Phase 1
DO:
  1. Ask questions in 1Q1A format (multiple questions at once prohibited)
  2. Save each answer with save_prompt(type: "answer")
  3. Conduct minimum 3 rounds of dialogue
  4. Articulate true purpose
OUTPUT: True purpose, research plan, search query list
```

**Question Categories**:
- WHY: Why is this research needed?
- WHO: Who will use the results?
- WHAT-IF: Next actions after ideal results?
- CONSTRAINT: Time, budget, scope limitations?
- SUCCESS: How do you define success?

### Phase 2.5: Knowledge Inheritance (Optional)

```
WHEN: Phase 2 completed, before starting Phase 3
DO:
  1. Search past projects for related topics:
     - Use semantic_search across all projects/*/research/ and projects/*/reports/
     - Query: user's research topic + key concepts from Phase 2
  2. If related projects found (similarity > 0.7):
     - List related projects with summary
     - Ask user: "関連する過去プロジェクトが見つかりました。継承しますか？"
  3. If user approves inheritance:
     - Create research/inherited/ directory
     - Copy relevant files with source tracking
     - Update manifest.yaml with inheritance info
  4. Adjust Phase 3 research plan to focus on:
     - Updates since last research (time-based delta)
     - Gaps not covered in previous research
     - New perspectives requested by user
OUTPUT: Inherited knowledge list, adjusted research plan
```

**Related Project Display Format**:
```markdown
## 関連する過去プロジェクト

| Project | Date | Topic | Similarity | Key Findings |
|---------|------|-------|------------|-------------|
| pj00001_AIMarket_20251015 | 2025-10-15 | AI市場調査 | 0.85 | 市場規橐500億円, 成長率15% |
| pj00003_TechTrend_20251201 | 2025-12-01 | 技術トレンド | 0.72 | LLM採用率拡大 |

継承しますか？ (はい/いいえ/選択して継承)
```

**Inheritance Directory Structure**:
```
projects/pjXXXXX_NewProject_YYYYMMDD/
├── research/
│   ├── inherited/                    # 継承ナレッジ
│   │   ├── INHERITANCE_LOG.md        # 継承元追跡
│   │   ├── pj00001_market-data.md    # 継承ファイル
│   │   └── pj00003_tech-trends.md    # 継承ファイル
│   └── search_*.md                   # 新規調査
```

**INHERITANCE_LOG.md Format**:
```markdown
# Knowledge Inheritance Log

## Inherited From
| Source Project | Files | Inherited Date | Reason |
|----------------|-------|----------------|--------|
| pj00001_AIMarket_20251015 | market-data.md | 2026-01-28 | 市場規模データの再利用 |

## Delta Research Focus
- [ ] 2025年10月以降の市場変化
- [ ] 新規参入企業の動向
- [ ] 規制環境の変化
```

**Delta Research Rules**:
```
WHEN: Knowledge inherited from past project
DO:
  1. Check publication dates of inherited data
  2. Focus new searches on:
     - Time period: [inherited_data_date] to [today]
     - Query modifier: "2025年以降" or "latest" or "recent"
  3. Compare new findings with inherited data
  4. Mark changes with (Δ) in report:
     - 市場規模: 500億円 → 580億円 (Δ+16%)
```

### Phase 3: Deep Research

```
WHEN: Phase 2 completed, true purpose confirmed
DO:
  LOOP:
    1. Think: Analyze knowledge gaps
    2. Search: search(query: ["Japanese query", "English query"])
    3. 🚨 IMMEDIATELY: save_research(content: <FULL search_results>, source: "search", query: <query>)
       → Do NOT proceed without this step!
    4. Visit: visit(url: <target_url>)
    5. 🚨 IMMEDIATELY: save_research(content: <FULL page_content>, source: "visit", query: <url>)
       → Do NOT proceed without this step!
    6. Report: Organize collected information
    7. Action: Determine if additional search needed
OUTPUT: Collected information summary, source list (URL + credibility)
```

**🚨 CRITICAL - save_research is MANDATORY after EVERY search/visit**:
- Steps 3 and 5 are NOT optional
- You MUST call save_research IMMEDIATELY after each search/visit
- Do NOT analyze or summarize before saving raw data
- Do NOT call multiple searches without saving each one

**CORRECT Phase 3 Flow**:
```
search(query: [...])
↓
save_research(content: <全結果>, source: "search", ...)  ← 必須！
↓
visit(url: ...)
↓
save_research(content: <全内容>, source: "visit", ...)   ← 必須！
↓
[分析・次のアクション]
```

**Search Rules**:
- Parallel JP/EN search required: `["Japanese query", "English query"]`
- For academic searches: `.ac.jp`, `.edu`, `.gov` domains auto-prioritized
- On 404/5xx: Wayback Machine → Archive.today fallback

### Phase 4: Framework Analysis

```
WHEN: Phase 3 completed, 3+ sources collected, credibility 60%+
DO:
  1. Select appropriate framework
  2. Structure collected information
  3. Verify MECE and logic quality
OUTPUT: Framework application results, analysis insights, recommended actions
```

**Framework Selection Criteria**:
| Trigger Keywords | Recommended Frameworks |
|------------------|------------------------|
| strategy, strengths, weaknesses, opportunities, threats | SWOT, PEST, 5Forces, 3C |
| matching, fit, partnership, collaboration | Matching Matrix |
| roadmap, plan, phases, timeline | Technology Roadmap |
| customer, user, persona, segment | Persona Analysis, STP, Customer Journey |
| pricing, price, cost, value | 4P, Value-Based Pricing, Price Sensitivity |
| market entry, go-to-market, launch | AARRR, GTM Strategy, Ansoff Matrix |
| competitive, differentiation, positioning | Blue Ocean, Positioning Map, Competitive Analysis |
| process, efficiency, workflow, optimization | Value Chain, ECRS, Business Process |
| decision, prioritization, evaluation | Decision Matrix, Eisenhower, Weighted Scoring |
| business model, revenue, monetization | Business Model Canvas, Lean Canvas, Revenue Model |
| root cause, problem, issue, why | Fishbone (Ishikawa), 5 Whys, Issue Tree |
| organization, team, structure, roles | McKinsey 7S, RACI, Org Design |
| risk, uncertainty, mitigation | Risk Matrix, FMEA, Scenario Planning |
| innovation, idea, creativity | Design Thinking, SCAMPER, Brainstorming |
| growth, scale, expansion | BCG Matrix, GE Matrix, Product Lifecycle |

**CRITICAL**: Select framework based on research PURPOSE, not just keywords. When multiple frameworks apply, prioritize:
1. Frameworks that directly answer the user's core question
2. Frameworks with available data from Phase 3 research
3. Simpler frameworks over complex ones when depth is similar

### Phase 5: Report Generation

```
WHEN: Phase 4 completed, 1+ framework applied
DO:
  1. Select appropriate report template (see Template Selection below)
  2. Write content following template structure
  3. Hallucination prevention check (verify all facts against sources)
  4. Organize citations and references (URL required for all data)
  5. Quality verification (numerical consistency, executive summary sync)
OUTPUT: Completed report (under reports/), reference list
```

**Template Selection Criteria**:

**Category 1: Approval & Decision**
| Purpose Keywords | Template | Use When |
|------------------|----------|----------|
| 予算承認、投資申請、コスト承認 | budget-approval | Budget/investment approval requests |
| 即時承認、緊急承認、迅速決定 | immediate-approval | Time-sensitive approvals |
| 段階承認、フェーズ承認、マイルストーン | staged-approval | Multi-phase approval processes |
| パイロット、試験導入、PoC承認 | pilot-approval | Pilot/trial approvals |
| 変更要求、変更管理、スコープ変更 | change-request | Change requests, scope changes |

**Category 2: Analysis & Research**
| Purpose Keywords | Template | Use When |
|------------------|----------|----------|
| 市場調査、市場分析、マーケット | market-analysis | Market research, industry analysis |
| 競合分析、競合調査、ライバル | competitive-analysis | Competitor landscape analysis |
| ユーザー調査、UXリサーチ、顧客理解 | user-research | User/customer research |
| リスク評価、リスク分析、脆弱性 | risk-assessment | Risk assessment, vulnerability analysis |
| デューデリジェンス、M&A、投資判断 | due-diligence | Due diligence, M&A evaluation |
| ABテスト、実験結果、比較実験 | ab-test | A/B test results, experiment reports |

**Category 3: Vendor & Procurement**
| Purpose Keywords | Template | Use When |
|------------------|----------|----------|
| ベンダー評価、製品選定、ツール選定 | vendor-evaluation | Vendor/product evaluation |
| RFI、情報提供依頼、事前調査 | rfi | Request for Information |
| RFP、提案依頼、入札 | rfp | Request for Proposal |
| SLA、サービスレベル、契約条件 | sla | SLA definition, service contracts |

**Category 4: Technical & Security**
| Purpose Keywords | Template | Use When |
|------------------|----------|----------|
| 技術調査、技術評価、アーキテクチャ | technical-report | Deep technical investigation |
| セキュリティ評価、脆弱性診断、監査 | security-assessment | Security audits, assessments |
| コンプライアンス、規制対応、法令遵守 | compliance | Compliance reports, regulatory |

**Category 5: Business & Strategy**
| Purpose Keywords | Template | Use When |
|------------------|----------|----------|
| ビジネスケース、投資対効果、ROI | business-case | Business case, ROI analysis |
| エグゼクティブサマリー、経営報告 | executive-summary | Brief overview for executives |
| ホワイトペーパー、技術解説、啓蒙 | white-paper | Thought leadership, technical papers |
| 検討資料、比較検討、オプション分析 | consideration | Options analysis, consideration docs |

**Category 6: Project & Operations**
| Purpose Keywords | Template | Use When |
|------------------|----------|----------|
| プロジェクト状況、進捗報告、ステータス | project-status | Project status reports |
| ポストモーテム、振り返り、障害報告 | post-mortem | Incident reviews, retrospectives |
| ロードマップ、製品計画、開発計画 | product-roadmap | Product/development roadmaps |
| QBR、四半期レビュー、業績報告 | qbr | Quarterly business reviews |

**Category 7: Sales & Customer**
| Purpose Keywords | Template | Use When |
|------------------|----------|----------|
| 営業資料、セールス、提案書 | sales-playbook | Sales enablement materials |
| 顧客成功事例、ケーススタディ、導入事例 | customer-success | Customer success stories |

**Category 8: Learning & Collaboration**
| Purpose Keywords | Template | Use When |
|------------------|----------|----------|
| 研修資料、トレーニング、教育 | training-material | Training/education materials |
| ワークショップ、ファシリテーション | workshop | Workshop design, facilitation |
| インタビューガイド、ヒアリング | interview-guide | Interview/hearing guides |
| 共同研究、産学連携、研究提案 | joint-research-proposal | Joint research proposals |
| 思考フロー、分析過程、ロジック展開 | thinking-flow-report | Thinking process documentation |

**Template Selection Flow**:
```
WHEN: Phase 5 starts
DO:
  1. Extract purpose keywords from user's original request
  2. Match keywords against Template Selection Criteria tables
  3. If multiple matches, prioritize by:
     a. Exact keyword match
     b. Category relevance
     c. User's stated output format
  4. If no match found, use 'consideration' as default
  5. Confirm template selection with user before writing
```

**CRITICAL**: Always use `shikigami-report-template` skill to load the appropriate template BEFORE writing. Template provides:
- Required sections and structure
- Formatting guidelines
- Quality checklist

---

## MCP Tools List

| Tool | Purpose | Required Timing |
|------|---------|-----------------|
| `set_project` | Set project context | Once after Phase 0 completion |
| `save_prompt` | Save prompts to prompts/ | Every time user input received |
| `save_research` | Save research results to research/ | Every time after search/visit |
| `search` | Web search | Phase 3 |
| `visit` | Extract page content | Phase 3 |
| `parse_file` | Parse local files | As needed |
| `parse_directory` | Recursively parse directories | As needed |
| `embed` | Generate text embedding vectors | For semantic search |
| `similarity` | Calculate text similarity | For relevance determination |
| `semantic_search` | Semantic search | For context retrieval |
| `get_project` | Check current project | For debugging |

### save_prompt type Parameter

| type | Purpose |
|------|---------|
| `original` | Initial research request |
| `structured` | Structured prompt (AI generated) |
| `answer` | Answer to question |
| `instruction` | Additional instructions/modification requests |
| `feedback` | Feedback on report |
| `approval` | Approval/confirmation |

### save_research source Parameter

| source | Purpose | Filename Example |
|--------|---------|------------------|
| `search` | Search results | `search_query_YYYYMMDD_HHMMSS.md` |
| `visit` | Page visit results | `visit_domain_YYYYMMDD_HHMMSS.md` |
| `manual` | Analysis notes | `manual_topic_YYYYMMDD_HHMMSS.md` |

---

## Quality Gates

| Gate | Conditions | User Approval |
|------|------------|---------------|
| 0→1 | Project folder exists, manifest.yaml exists | Not required |
| 1→2 | Structured prompt generated, user confirmed | **Required** |
| 2→3 | True purpose defined, research plan created, minimum 3 dialogues | **Required** |
| 3→4 | 3+ sources, credibility evaluated, credibility 60%+ | Not required |
| 4→5 | 1+ framework applied, numerical verification done | Not required |
| 5→6 | Report exists, quality check passed, citations complete | **Required** |

### Quality Checklist (Phase 5→6 Gate)

```
WHEN: Report draft completed, before Phase 6
DO: Execute ALL checks below. Report CANNOT proceed to Phase 6 until all items pass.
```

**1. Numerical Consistency Check** ✅
| Check Item | How to Verify | FAIL Condition |
|------------|---------------|----------------|
| Source attribution | Every number has [[n]] citation | Any number without citation |
| Percentage totals | Sum of percentages = 100% (or explicitly explained) | Silent deviation from 100% |
| Text-table match | Numbers in body text match tables/charts | Any discrepancy |
| Unit correctness | 億/万/thousand/million used correctly | Unit mismatch or confusion |
| Time series order | Chronological data in correct sequence | Year/date ordering errors |
| Calculation accuracy | Derived numbers (growth rate, averages) are correct | Math errors |

**2. Citation Completeness Check** 📚
| Check Item | How to Verify | FAIL Condition |
|------------|---------------|----------------|
| Inline citations | All facts/claims have [[n]] format | Uncited factual statements |
| References list | All [[n]] appear in References section | Missing reference entries |
| URL validity | All URLs are accessible | 404 or dead links |
| No vague sources | No "various sources", "it is said that" | Vague attributions |
| Date recorded | All references include access date | Missing dates |

**3. Content Consistency Check** 🔄
| Check Item | How to Verify | FAIL Condition |
|------------|---------------|----------------|
| Executive summary sync | Summary numbers match body text | Any discrepancy |
| Conclusion alignment | Conclusions supported by analysis | Unsupported claims |
| Conflict markers handled | All (?), (⚡), (💭) items addressed | Unresolved conflicts |
| MECE coverage | No gaps or overlaps in analysis | Logical gaps |

**4. Format & Structure Check** 📋
| Check Item | How to Verify | FAIL Condition |
|------------|---------------|----------------|
| Template compliance | All required sections present | Missing sections |
| Heading hierarchy | Proper H1→H2→H3 structure | Broken hierarchy |
| Table formatting | Tables render correctly | Malformed tables |
| Link formatting | All links work correctly | Broken markdown links |

**Quality Check Execution Flow**:
```
Phase 5 Complete
    ↓
[1] Run Numerical Consistency Check
    ↓ (All pass?)
[2] Run Citation Completeness Check  
    ↓ (All pass?)
[3] Run Content Consistency Check
    ↓ (All pass?)
[4] Run Format & Structure Check
    ↓ (All pass?)
Generate Quality Report Summary
    ↓
Request User Approval for Phase 6
```

**Quality Report Format**:
```markdown
## Quality Check Results

| Category | Status | Issues Found |
|----------|--------|-------------|
| Numerical Consistency | ✅ PASS / ❌ FAIL | [count] issues |
| Citation Completeness | ✅ PASS / ❌ FAIL | [count] issues |
| Content Consistency | ✅ PASS / ❌ FAIL | [count] issues |
| Format & Structure | ✅ PASS / ❌ FAIL | [count] issues |

### Issues to Address (if any)
1. [Issue description and location]
2. [Issue description and location]
```

**Auto-Fix Rules**:
| Issue Type | Auto-Fix Action |
|------------|----------------|
| Missing citation | Flag with ⚠️, request source |
| Percentage ≠ 100% | Add "(その他: X%)" or note |
| Unit confusion | Standardize to larger unit |
| Dead URL | Attempt Wayback Machine recovery |

---

## File Saving Rules

| Phase | Save Location | Content |
|-------|---------------|---------|
| Phase 1 | `prompts/` | Prompt history |
| Phase 3-4 | `research/` | Search results, analysis notes |
| Phase 5 | `reports/` | Final reports |

**File Naming**: `[content]-v[major].[minor].md`

**Prohibited**:
- Saving final reports to research/
- Saving research notes to reports/
- Overwriting existing files (must create new version)

---

## Citation Rules

```
WHEN: Recording data or factual claims in report
DO: Always attach source URL
FORBIDDEN: References without URLs, vague descriptions like "various web articles"
```

**Required Format**:
```markdown
## References

<a id="ref-1">[1]</a> [Title](URL) - Site Name, YYYY-MM-DD
```

In body text: `[[1]](#ref-1)` for inline citation

---

## Urgency Triage

| Level | Keywords | Workflow |
|-------|----------|----------|
| Normal | - | Full Phase 0-6 |
| Urgent | urgent, today, by tomorrow, ASAP | Phase 0→2 simplified→3→5 simplified |
| Critical | right now, immediately, emergency, overview only | Phase 0→3 brief→5 summary |

---

## Agent Skills

| Skill | Responsible Phases | Main Functions |
|-------|-------------------|----------------|
| shikigami-planner | Phase 0-2 | Purpose discovery, 5 Whys, JTBD, research planning |
| shikigami-deep-research | Phase 3 | Think→Search→Report→Action, source tracking |
| shikigami-consulting-framework | Phase 4 | 53 frameworks, MECE verification |
| shikigami-writing | Phase 5 | Report generation, hallucination prevention, citation management |

---

## Framework Library (53 Definitions)

| Category | Count | Key Frameworks |
|----------|-------|----------------|
| Strategic Analysis | 10 | SWOT, 3C, PEST, 5Forces, BCG, VRIO |
| Problem Solving | 7 | MECE, Logic Tree, 5 Whys, Fishbone |
| Thinking Organization | 3 | Pyramid Structure, So What/Why So, PREP |
| Decision Making | 4 | Decision Matrix, Pros/Cons, Risk Matrix |
| Marketing | 7 | 4P, STP, Customer Journey, Persona |
| Innovation | 7 | Business Model Canvas, Lean Canvas, TAM/SAM/SOM |
| Process Improvement | 3 | PDCA, OODA, ECRS |
| General Tools | 5 | 5W1H, SMART, OKR, KPT, JTBD |

---

## CLI Commands

```bash
npx shikigami new <ProjectName>  # Create new project
npx shikigami -v                 # Check version
npx shikigami -h                 # Show help
```

---

## Project Output Structure

```
projects/pjXXXXX_Name_YYYYMMDD/
├── manifest.yaml    # Project management
├── prompts/         # User input history
├── research/        # Search results, analysis notes
└── reports/         # Final reports
```

---

## Credibility Scoring

| Factor | Weight | Description |
|--------|--------|-------------|
| Source Credibility | 30% | Academic institutions 0.9, Major media 0.7, Blogs 0.3 |
| Data Freshness | 20% | Within 3 months 1.0, Within 1 year 0.8, Over 3 years 0.2 |
| Coverage Rate | 25% | Coverage of research scope |
| Source Diversity | 15% | Diversity of source types |
| Internal Consistency | 10% | No contradictions in data |

**Thresholds**: 80%+ = High credibility, 60%+ = Gate passable, Below 40% = Gate blocked

---

## Information Conflict Handling

```
WHEN: Multiple sources provide conflicting information on the same fact
DO:
  1. Mark the fact with "(?)" in the report
  2. Note all conflicting values with their sources
  3. Identify the most credible source based on Credibility Scoring
  4. Add conflicting facts to "Information Conflicts" section at report end
```

**Conflict Notation Format**:
```
[Fact]: [Value](?) 
  - Source A ([Name]): [Value A]
  - Source B ([Name]): [Value B]
  - Source C ([Name]): [Value C]
  → Most credible: [Source] ([Reason])
```

**Example**:
```
市場規模: 500億円(?) 
  - Source A (日経新聞): 500億円
  - Source B (業界団体レポート): 480億円  
  - Source C (調査会社X): 520億円
  → Most credible: 日経新聞 (Major media, published 2025-12)
```

**Report Section Template**:
```markdown
## Information Conflicts

| Fact | Values | Most Credible | Reason |
|------|--------|---------------|--------|
| 市場規模 | 480-520億円 | 500億円 (日経) | Major media, latest data |
| 成長率 | 3.2%-4.1% | 3.5% (業界団体) | Primary source |
```

**Conflict Severity Levels**:
| Deviation | Severity | Action |
|-----------|----------|--------|
| <5% | Low | Note in footnote |
| 5-20% | Medium | Mark with (?), add to Conflicts section |
| >20% | High | Mark with (??), investigate further, consider excluding unreliable sources |

### Content/Opinion Conflicts

```
WHEN: Sources provide contradictory statements or opinions on the same topic
DO:
  1. Mark with "(⚡)" for factual contradictions
  2. Mark with "(💭)" for opinion/interpretation differences
  3. Present all viewpoints with their sources
  4. Add to "Content Conflicts" section at report end
```

**Conflict Type Markers**:
| Marker | Type | Description |
|--------|------|-------------|
| (?) | Numeric | Values differ by 5-20% |
| (??) | Numeric (High) | Values differ by >20% |
| (⚡) | Factual | Contradictory facts/statements |
| (💭) | Opinion | Different interpretations/predictions |

**Example (Factual Contradiction)**:
```
原因(⚡): 
  - Source A (調査報告書): 「システム障害が主因」
  - Source B (業界紙): 「人的ミスが主因」
  → No consensus - both viewpoints presented
```

**Example (Opinion/Interpretation Difference)**:
```
将来予測(💭):
  - Source A (アナリストX): 「市場は2030年まで拡大する」
  - Source B (業界団体): 「市場は縮小傾向にある」
  → Different interpretations noted - reader should evaluate
```

**Content Conflicts Section Template**:
```markdown
## Content Conflicts

### Factual Contradictions (⚡)
| Topic | Viewpoint A | Viewpoint B | Sources |
|-------|-------------|-------------|----------|
| 障害原因 | システム障害 | 人的ミス | 調査報告書 vs 業界紙 |

### Opinion Differences (💭)
| Topic | Viewpoint A | Viewpoint B | Sources |
|-------|-------------|-------------|----------|
| 市場予測 | 拡大継続 | 縮小傾向 | アナリストX vs 業界団体 |
```

---

## Academic Search Rules

```
WHEN: Query contains academic keywords (university, research institute, professor, etc.)
DO: Auto-prioritize .ac.jp, .edu, .gov domains
```

**Domain Priority**:
| Region | Domain | Description |
|--------|--------|-------------|
| Japan | `.ac.jp` | Universities |
| Japan | `.go.jp` | Government agencies |
| Global | `.edu` | US Universities |
| Global | `.gov` | Government agencies |

---

## Error Handling

### On 404/5xx Errors

```
WHEN: HTTP error occurs on visit
DO:
  1. Attempt retrieval from Wayback Machine (archive.org)
  2. On failure, attempt retrieval from Archive.today
  3. Note archive retrieval in report
```

### On Character Encoding Issues

```
WHEN: Mojibake patterns detected on Japanese sites (e.g., garbled characters)
DO: Auto-detect Shift_JIS/EUC-JP/ISO-2022-JP and convert to UTF-8
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| `configs/workflow-gates.yaml` | Quality gate settings |
| `configs/triage-rules.yaml` | Urgency triage |
| `configs/auto-invoke-triggers.yaml` | Auto-invoke triggers |
| `configs/framework-recommendation-rules.yaml` | Framework recommendations |
| `configs/academic-search-config.yaml` | Academic search settings |
| `configs/citation-styles.yaml` | Citation styles |

---

**Last Updated**: 2026-01-28  
**Version**: 1.48.0
