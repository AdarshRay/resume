import { getStorageJSON, setStorageJSON } from './storage';

const WORKSPACE_KEY = 'resumeBuilder_workspace_v2';
const LEGACY_KEY = 'resumeBuilder_state';

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix = 'project') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function extractProjectName(snapshot) {
  const name = snapshot?.resumeData?.name?.trim();
  const title = snapshot?.resumeData?.title?.trim();
  if (name && title) return `${name} - ${title}`;
  if (name) return `${name} Resume`;
  if (title) return `${title} Resume`;
  return 'Untitled Resume';
}

export function createProjectSnapshot(state = {}) {
  const selectedTemplate = state.selectedTemplate ?? 'designer-slate';
  const canvasPositionsByTemplate = state.canvasPositionsByTemplate
    ?? (state.canvasPositions ? { [selectedTemplate]: state.canvasPositions } : {});

  return {
    resumeData: state.resumeData ?? null,
    selectedTemplate,
    photoUrl: state.photoUrl ?? null,
    photoSettings: state.photoSettings ?? { zoom: 100, posX: 50, posY: 50 },
    photoShape: state.photoShape ?? 'square',
    colors: state.colors ?? null,
    globalFont: state.globalFont ?? { size: null, family: null },
    styleSettings: state.styleSettings ?? {},
    sectionLabels: state.sectionLabels ?? {},
    hiddenSections: state.hiddenSections ?? [],
    sectionOrder: state.sectionOrder ?? ['summary', 'experience'],
    sidebarOrder: state.sidebarOrder ?? ['skills', 'education', 'certifications'],
    sectionLayout: state.sectionLayout ?? {},
    canvasPositionsByTemplate,
    canvasPositions: canvasPositionsByTemplate[selectedTemplate] ?? {},
    extraPages: state.extraPages ?? 0,
    pageLayoutModes: state.pageLayoutModes ?? {},
    pageSidebarVisible: state.pageSidebarVisible ?? {},
    jobDescription: state.jobDescription ?? '',
    coverLetter: state.coverLetter ?? '',
    linkedInSummary: state.linkedInSummary ?? '',
  };
}

export function createProjectRecord(snapshot, overrides = {}) {
  const timestamp = nowIso();
  return {
    id: overrides.id || makeId(),
    name: overrides.name || extractProjectName(snapshot),
    createdAt: overrides.createdAt || timestamp,
    updatedAt: overrides.updatedAt || timestamp,
    snapshot: createProjectSnapshot(snapshot),
  };
}

function normalizeProject(project) {
  if (!project || typeof project !== 'object') return null;
  const snapshot = createProjectSnapshot(project.snapshot || {});
  return {
    id: project.id || makeId(),
    name: project.name || extractProjectName(snapshot),
    createdAt: project.createdAt || nowIso(),
    updatedAt: project.updatedAt || nowIso(),
    snapshot,
  };
}

export function loadLegacySnapshot() {
  return getStorageJSON(LEGACY_KEY, null);
}

export function loadWorkspace() {
  const parsed = getStorageJSON(WORKSPACE_KEY, null);
  if (parsed) {
    const projects = Array.isArray(parsed?.projects)
      ? parsed.projects.map(normalizeProject).filter(Boolean)
      : [];
    const activeProjectId = projects.some((project) => project.id === parsed?.activeProjectId)
      ? parsed.activeProjectId
      : projects[0]?.id || null;
    return { projects, activeProjectId };
  }

  const legacy = loadLegacySnapshot();
  if (!legacy?.resumeData) {
    return { projects: [], activeProjectId: null };
  }

  const migratedProject = createProjectRecord({
    ...legacy,
    jobDescription: legacy.jobDescription || '',
    coverLetter: legacy.coverLetter || '',
    linkedInSummary: legacy.linkedInSummary || '',
  }, {
    name: extractProjectName(legacy),
  });

  return {
    projects: [migratedProject],
    activeProjectId: migratedProject.id,
  };
}

export function saveWorkspace(workspace) {
  setStorageJSON(WORKSPACE_KEY, workspace);
}

export function serializeProjectForExport(project) {
  return JSON.stringify({
    type: 'cv-craft-project',
    version: 1,
    exportedAt: nowIso(),
    project: normalizeProject(project),
  }, null, 2);
}

export function parseImportedProject(raw) {
  const parsed = JSON.parse(raw);
  const source = parsed?.project || parsed;
  const project = normalizeProject(source);
  if (!project) {
    throw new Error('The imported file does not contain a valid CV Craft project.');
  }
  project.id = makeId();
  project.updatedAt = nowIso();
  return project;
}
