/**
 * Save Module Tests
 * v1.23.0 - REQ-SHIKIGAMI-016
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  savePrompt,
  saveResearch,
  saveResearchJson,
  saveToProject,
} from '../save.js';
import {
  setActiveProject,
  clearActiveProject,
} from '../project.js';

// Mock fs module
vi.mock('fs');

// Mock project module to provide controlled active project
vi.mock('../project.js', async () => {
  const actual = await vi.importActual<typeof import('../project.js')>('../project.js');
  return {
    ...actual,
    hasActiveProject: vi.fn(),
    getActiveProject: vi.fn(),
  };
});

import { hasActiveProject, getActiveProject } from '../project.js';

describe('Save Module', () => {
  const mockProject = {
    projectPath: '/test/projects/pj00001_Test_20260127',
    projectId: 'pj00001',
    projectName: 'Test',
    promptsDir: '/test/projects/pj00001_Test_20260127/prompts',
    researchDir: '/test/projects/pj00001_Test_20260127/research',
    reportsDir: '/test/projects/pj00001_Test_20260127/reports',
    manifestPath: '/test/projects/pj00001_Test_20260127/manifest.yaml',
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(hasActiveProject).mockReturnValue(true);
    vi.mocked(getActiveProject).mockReturnValue(mockProject);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('savePrompt', () => {
    it('should throw error when no active project', async () => {
      vi.mocked(hasActiveProject).mockReturnValue(false);

      await expect(
        savePrompt('test content', { type: 'original' })
      ).rejects.toThrow('No active project');
    });

    it('should save original prompt with correct format', async () => {
      const result = await savePrompt('My original prompt', {
        type: 'original',
      });

      expect(result.success).toBe(true);
      expect(result.filePath).toContain('prompts');
      expect(result.filePath).toContain('prompt_original');
      expect(fs.writeFileSync).toHaveBeenCalled();

      // Check content includes frontmatter
      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;
      expect(content).toContain('---');
      expect(content).toContain('type: "original"');
      expect(content).toContain('project_id: "pj00001"');
      expect(content).toContain('My original prompt');
    });

    it('should save structured prompt with correct format', async () => {
      const result = await savePrompt('Structured prompt content', {
        type: 'structured',
      });

      expect(result.success).toBe(true);
      expect(result.filePath).toContain('prompt_structured');

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;
      expect(content).toContain('type: "structured"');
    });

    it('should save refinement with version number', async () => {
      const result = await savePrompt('Refined prompt', {
        type: 'refinement',
        version: 2,
      });

      expect(result.success).toBe(true);
      expect(result.filePath).toContain('prompt_refinement-2');

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;
      expect(content).toContain('version: 2');
    });

    it('should save answer type (v1.28.0)', async () => {
      const result = await savePrompt('User answer', {
        type: 'answer',
        phase: '1',
        sequence: 3,
      });

      expect(result.success).toBe(true);
      expect(result.filePath).toContain('prompt_answer');

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;
      expect(content).toContain('type: "answer"');
      expect(content).toContain('phase: "1"');
      expect(content).toContain('sequence: 3');
    });

    it('should save instruction type (v1.28.0)', async () => {
      const result = await savePrompt('Additional instruction', {
        type: 'instruction',
      });

      expect(result.success).toBe(true);
      expect(result.filePath).toContain('prompt_instruction');
    });

    it('should save feedback type (v1.28.0)', async () => {
      const result = await savePrompt('Report feedback', {
        type: 'feedback',
      });

      expect(result.success).toBe(true);
      expect(result.filePath).toContain('prompt_feedback');
    });

    it('should save approval type (v1.28.0)', async () => {
      const result = await savePrompt('Yes, approved', {
        type: 'approval',
      });

      expect(result.success).toBe(true);
      expect(result.filePath).toContain('prompt_approval');
    });

    it('should include context when provided (v1.28.0)', async () => {
      const result = await savePrompt('User answer', {
        type: 'answer',
        context: 'Previous question: What is the purpose?',
      });

      expect(result.success).toBe(true);
      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;
      expect(content).toContain('## Context');
      expect(content).toContain('Previous question: What is the purpose?');
    });

    it('should use custom filename when provided', async () => {
      const result = await savePrompt('Content', {
        type: 'original',
        filename: 'custom-name.md',
      });

      expect(result.filePath).toContain('custom-name');
    });
  });

  describe('saveResearch', () => {
    it('should throw error when no active project', async () => {
      vi.mocked(hasActiveProject).mockReturnValue(false);

      await expect(saveResearch('test content', {})).rejects.toThrow(
        'No active project'
      );
    });

    it('should save search result with query info', async () => {
      const result = await saveResearch('Search results here', {
        query: 'TypeScript best practices',
        source: 'search',
      });

      expect(result.success).toBe(true);
      expect(result.filePath).toContain('research');
      expect(result.filePath).toContain('search');

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;
      expect(content).toContain('source: "search"');
      expect(content).toContain('query: "TypeScript best practices"');
    });

    it('should save visit result', async () => {
      const result = await saveResearch('Page content', {
        source: 'visit',
        query: 'example.com',
      });

      expect(result.success).toBe(true);
      expect(result.filePath).toContain('visit');
    });

    it('should save manual notes', async () => {
      const result = await saveResearch('Manual notes', {
        source: 'manual',
      });

      expect(result.success).toBe(true);
      expect(result.filePath).toContain('manual');
    });
  });

  describe('saveResearchJson', () => {
    it('should save JSON data with metadata', async () => {
      const data = {
        results: [
          { title: 'Result 1', url: 'https://example.com/1' },
          { title: 'Result 2', url: 'https://example.com/2' },
        ],
      };

      const result = await saveResearchJson(data, {
        query: 'test query',
        source: 'search',
      });

      expect(result.success).toBe(true);
      expect(result.filePath).toContain('.json');

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;
      const parsed = JSON.parse(content);
      expect(parsed.data).toEqual(data);
      expect(parsed.query).toBe('test query');
      expect(parsed.source).toBe('search');
    });
  });

  describe('saveToProject', () => {
    it('should save to prompts directory', async () => {
      const result = await saveToProject('content', 'prompts', 'test.md');

      expect(result.success).toBe(true);
      expect(result.filePath).toBe(
        '/test/projects/pj00001_Test_20260127/prompts/test.md'
      );
    });

    it('should save to research directory', async () => {
      const result = await saveToProject('content', 'research', 'test.md');

      expect(result.success).toBe(true);
      expect(result.filePath).toBe(
        '/test/projects/pj00001_Test_20260127/research/test.md'
      );
    });

    it('should save to reports directory', async () => {
      const result = await saveToProject('content', 'reports', 'test.md');

      expect(result.success).toBe(true);
      expect(result.filePath).toBe(
        '/test/projects/pj00001_Test_20260127/reports/test.md'
      );
    });

    it('should sanitize filename', async () => {
      const result = await saveToProject(
        'content',
        'prompts',
        'my file<>:"/\\|?*.md'
      );

      expect(result.filePath).not.toContain('<');
      expect(result.filePath).not.toContain('>');
      expect(result.filePath).not.toContain(':');
    });
  });
});
