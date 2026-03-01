/**
 * Project Management Module Tests
 * v1.23.0 - REQ-SHIKIGAMI-016
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  setActiveProject,
  getActiveProject,
  hasActiveProject,
  clearActiveProject,
  getProjectSubdirectory,
  getProjectInfo,
  isValidProjectDirectory,
  detectLatestProject,
} from '../project.js';

// Mock fs module
vi.mock('fs');

describe('Project Management Module', () => {
  const mockProjectPath = '/test/projects/pj00001_TestProject_20260127';

  beforeEach(() => {
    clearActiveProject();
    vi.resetAllMocks();
  });

  afterEach(() => {
    clearActiveProject();
  });

  describe('isValidProjectDirectory', () => {
    it('should return true for valid project directory', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        const pathStr = String(p);
        return (
          pathStr.includes('prompts') ||
          pathStr.includes('research') ||
          pathStr.includes('reports') ||
          pathStr.includes('manifest.yaml')
        );
      });

      expect(isValidProjectDirectory(mockProjectPath)).toBe(true);
    });

    it('should return false if prompts directory is missing', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        const pathStr = String(p);
        return !pathStr.includes('prompts');
      });

      expect(isValidProjectDirectory(mockProjectPath)).toBe(false);
    });

    it('should return false if manifest.yaml is missing', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        const pathStr = String(p);
        return (
          pathStr.includes('prompts') ||
          pathStr.includes('research') ||
          pathStr.includes('reports')
        );
      });

      expect(isValidProjectDirectory(mockProjectPath)).toBe(false);
    });
  });

  describe('setActiveProject', () => {
    it('should set active project successfully', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const project = setActiveProject(mockProjectPath);

      expect(project.projectPath).toBe(mockProjectPath);
      expect(project.projectId).toBe('pj00001');
      expect(project.projectName).toBe('TestProject');
      expect(project.promptsDir).toBe(path.join(mockProjectPath, 'prompts'));
      expect(project.researchDir).toBe(path.join(mockProjectPath, 'research'));
      expect(project.reportsDir).toBe(path.join(mockProjectPath, 'reports'));
    });

    it('should throw error if directory does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      expect(() => setActiveProject('/nonexistent')).toThrow(
        'Project directory not found'
      );
    });

    it('should throw error if directory is invalid', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        const pathStr = String(p);
        // Path exists but subdirectories don't
        return pathStr === mockProjectPath;
      });

      expect(() => setActiveProject(mockProjectPath)).toThrow(
        'Invalid project directory'
      );
    });
  });

  describe('getActiveProject', () => {
    it('should return null when no project is active', () => {
      expect(getActiveProject()).toBeNull();
    });

    it('should return active project when set', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      setActiveProject(mockProjectPath);

      const project = getActiveProject();
      expect(project).not.toBeNull();
      expect(project?.projectId).toBe('pj00001');
    });
  });

  describe('hasActiveProject', () => {
    it('should return false when no project is active', () => {
      expect(hasActiveProject()).toBe(false);
    });

    it('should return true when project is active', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      setActiveProject(mockProjectPath);

      expect(hasActiveProject()).toBe(true);
    });
  });

  describe('clearActiveProject', () => {
    it('should clear active project', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      setActiveProject(mockProjectPath);
      expect(hasActiveProject()).toBe(true);

      clearActiveProject();
      expect(hasActiveProject()).toBe(false);
    });
  });

  describe('getProjectSubdirectory', () => {
    it('should throw error when no project is active', () => {
      expect(() => getProjectSubdirectory('prompts')).toThrow(
        'No active project'
      );
    });

    it('should return correct subdirectory path', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      setActiveProject(mockProjectPath);

      expect(getProjectSubdirectory('prompts')).toBe(
        path.join(mockProjectPath, 'prompts')
      );
      expect(getProjectSubdirectory('research')).toBe(
        path.join(mockProjectPath, 'research')
      );
      expect(getProjectSubdirectory('reports')).toBe(
        path.join(mockProjectPath, 'reports')
      );
    });
  });

  describe('getProjectInfo', () => {
    it('should return inactive status when no project is active', () => {
      const info = getProjectInfo();
      expect(info.active).toBe(false);
      expect(info.message).toContain('No active project');
    });

    it('should return full project info when active', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      setActiveProject(mockProjectPath);

      const info = getProjectInfo();
      expect(info.active).toBe(true);
      expect(info.projectId).toBe('pj00001');
      expect(info.projectName).toBe('TestProject');
      expect(info.directories).toBeDefined();
    });
  });

  describe('detectLatestProject', () => {
    it('should return null if projects directory does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      expect(detectLatestProject('/test')).toBeNull();
    });

    it('should return latest project path', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'pj00001_Old_20260101', isDirectory: () => true },
        { name: 'pj00002_New_20260127', isDirectory: () => true },
        { name: '.hidden', isDirectory: () => true },
      ] as unknown as fs.Dirent[]);
      vi.mocked(fs.statSync).mockImplementation((p) => {
        const pathStr = String(p);
        if (pathStr.includes('pj00002')) {
          return { mtime: new Date('2026-01-27') } as fs.Stats;
        }
        return { mtime: new Date('2026-01-01') } as fs.Stats;
      });

      const result = detectLatestProject('/test');
      expect(result).toContain('pj00002_New_20260127');
    });
  });
});
