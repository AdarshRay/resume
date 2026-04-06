import { beforeEach, describe, expect, it } from 'vitest';
import {
  createProjectRecord,
  extractProjectName,
  loadWorkspace,
  parseImportedProject,
  saveWorkspace,
  serializeProjectForExport,
} from '../utils/workspace';

function createStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

describe('workspace utilities', () => {
  beforeEach(() => {
    globalThis.localStorage = createStorage();
  });

  it('extracts a readable project name from the resume snapshot', () => {
    expect(extractProjectName({ resumeData: { name: 'Avery Hart', title: 'Product Designer' } })).toBe('Avery Hart - Product Designer');
    expect(extractProjectName({ resumeData: { title: 'Product Designer' } })).toBe('Product Designer Resume');
  });

  it('round-trips saved workspace state through localStorage', () => {
    const project = createProjectRecord({
      resumeData: { name: 'Avery Hart', title: 'Product Designer' },
      selectedTemplate: 'designer-slate',
    });

    saveWorkspace({ projects: [project], activeProjectId: project.id });
    const loaded = loadWorkspace();

    expect(loaded.projects).toHaveLength(1);
    expect(loaded.activeProjectId).toBe(project.id);
    expect(loaded.projects[0].name).toBe('Avery Hart - Product Designer');
  });

  it('imports an exported project payload as a new project id', () => {
    const project = createProjectRecord({
      resumeData: { name: 'Avery Hart', title: 'Product Designer' },
      selectedTemplate: 'designer-slate',
    });

    const exported = serializeProjectForExport(project);
    const imported = parseImportedProject(exported);

    expect(imported.id).not.toBe(project.id);
    expect(imported.name).toBe(project.name);
    expect(imported.snapshot.selectedTemplate).toBe('designer-slate');
  });
});
