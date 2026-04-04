import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Nav from './components/Nav';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import GeneratingPage from './pages/GeneratingPage';
import EditorPage from './pages/EditorPage';
import safe from './utils/safeData';
import { rewriteTextWithAI } from './utils/rewriteWithAI';

const THEME_KEY = 'resumeBuilder_theme';
function loadTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'light'; } catch { return 'light'; }
}

const DEFAULT_TEMPLATE = 'designer-slate';
const DEFAULT_COLORS = { accent: '#C9A84C', sidebar: '#1B2A4A', heading: '#1B2A4A', text: '#4b5563', background: '#ffffff' };

const DEFAULT_SECTION_ORDER = ['summary', 'experience'];
const DEFAULT_SIDEBAR_ORDER = ['skills', 'education', 'certifications'];

// Per-template section placement rules
// "main" sections appear in the main/left content area; "side" in sidebar/right
const TEMPLATE_SECTION_DEFAULTS = {
  'executive-navy':  { main: ['summary', 'experience'], side: ['skills', 'education', 'certifications'] },
  'bold-coral':      { main: ['summary', 'experience'], side: ['skills', 'education', 'certifications'] },
  'dev-terminal':    { main: ['summary', 'experience'], side: ['skills', 'education', 'certifications'] },
  'strategist-gold': { main: ['summary', 'experience'], side: ['skills', 'education', 'certifications'] },
  'clean-slate':     { main: ['summary', 'experience'], side: ['skills', 'education', 'certifications'] },
  'designer-slate':  { main: ['summary', 'experience'], side: ['skills', 'education', 'certifications'] },
};

// Sections that MUST stay in the main column (never sidebar) for 2-column templates
const MAIN_ONLY_SECTIONS = ['summary', 'experience'];
// Sections that should default to sidebar for 2-column templates
const SIDEBAR_PREFERRED = ['skills', 'certifications'];
// All built-in section IDs (must always exist in one of the two arrays)
const ALL_BUILTIN_SECTIONS = ['summary', 'experience', 'skills', 'education', 'certifications'];
// Templates that use a 2-column layout
const TWO_COLUMN_TEMPLATES = ['executive-navy', 'bold-coral', 'strategist-gold', 'designer-slate'];

function arraysEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  return a.every((item, idx) => item === b[idx]);
}

/**
 * Validate and repair section placement.
 * Ensures every built-in section is present in exactly one array,
 * enforces main-only rules, and recovers dropped sections.
 */
function validateSectionPlacement(mainArr, sideArr, template) {
  const main = [...mainArr];
  const side = [...sideArr];
  const isTwoCol = TWO_COLUMN_TEMPLATES.includes(template);
  const defaults = TEMPLATE_SECTION_DEFAULTS[template] || TEMPLATE_SECTION_DEFAULTS['executive-navy'];

  // 1. Enforce main-only sections (move out of sidebar)
  if (isTwoCol) {
    for (const id of MAIN_ONLY_SECTIONS) {
      const sideIdx = side.indexOf(id);
      if (sideIdx !== -1) {
        side.splice(sideIdx, 1);
        if (!main.includes(id)) {
          // Insert after summary if possible, else at end
          const summaryIdx = main.indexOf('summary');
          main.splice(summaryIdx >= 0 ? summaryIdx + 1 : main.length, 0, id);
        }
      }
    }
  }

  // 2. Recover missing built-in sections (insert at correct default position, not end)
  for (const id of ALL_BUILTIN_SECTIONS) {
    if (!main.includes(id) && !side.includes(id)) {
      // Put it where the template defaults say it should go, at the right position
      if (defaults.main.includes(id)) {
        const defaultIdx = defaults.main.indexOf(id);
        let insertIdx = main.length;
        for (let i = 0; i < main.length; i++) {
          const existingIdx = defaults.main.indexOf(main[i]);
          if (existingIdx >= 0 && existingIdx > defaultIdx) { insertIdx = i; break; }
        }
        main.splice(insertIdx, 0, id);
      } else {
        const defaultIdx = defaults.side.indexOf(id);
        let insertIdx = side.length;
        for (let i = 0; i < side.length; i++) {
          const existingIdx = defaults.side.indexOf(side[i]);
          if (existingIdx >= 0 && existingIdx > defaultIdx) { insertIdx = i; break; }
        }
        side.splice(insertIdx, 0, id);
      }
    }
  }

  // 3. Remove duplicates (section in both arrays — keep it where it belongs per defaults)
  for (const id of ALL_BUILTIN_SECTIONS) {
    if (main.includes(id) && side.includes(id)) {
      if (defaults.main.includes(id)) {
        side.splice(side.indexOf(id), 1);
      } else {
        main.splice(main.indexOf(id), 1);
      }
    }
  }

  // 4. Enforce default ordering: built-in sections first (in template-default order),
  //    then custom sections (preserving their relative order)
  const customPriority = (id, isSidebar) => {
    if (!isSidebar) return 999;
    if (typeof id !== 'string') return 999;
    if (id.startsWith('cs_contact_details_') || id.startsWith('cs_personal_details_') || id.startsWith('cs_references_')) return -10;
    return 999;
  };

  const sortColumn = (arr, defaultOrder, isSidebar = false) => {
    const builtin = arr.filter(id => ALL_BUILTIN_SECTIONS.includes(id));
    const custom = arr.filter(id => !ALL_BUILTIN_SECTIONS.includes(id));
    builtin.sort((a, b) => {
      const ai = defaultOrder.indexOf(a);
      const bi = defaultOrder.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
    custom.sort((a, b) => customPriority(a, isSidebar) - customPriority(b, isSidebar));
    return isSidebar ? [...custom.filter(id => customPriority(id, true) < 0), ...builtin, ...custom.filter(id => customPriority(id, true) >= 0)] : [...builtin, ...custom];
  };
  const sortedMain = sortColumn(main, ['summary', 'experience', ...defaults.main.filter(id => !['summary', 'experience'].includes(id))]);
  const sortedSide = sortColumn(side, ['skills', 'education', 'certifications'], true);

  return { main: sortedMain, side: sortedSide };
}

/**
 * Build sectionLayout from main/side arrays.
 */
function buildSectionLayout(mainArr, sideArr) {
  const layout = {};
  mainArr.forEach((id, i) => { layout[id] = { page: 1, column: 'main', order: i }; });
  sideArr.forEach((id, i) => { layout[id] = { page: 1, column: 'side', order: i }; });
  return layout;
}

// Page + order assignment for every section
const DEFAULT_SECTION_LAYOUT = {
  summary:        { page: 1, column: 'main', order: 0 },
  experience:     { page: 1, column: 'main', order: 1 },
  skills:         { page: 1, column: 'side', order: 0 },
  education:      { page: 1, column: 'side', order: 1 },
  certifications: { page: 1, column: 'side', order: 2 },
};

const STYLE_DEFAULTS = {
  'executive-navy':  { skillStyle: 'bullet-list',          contactStyle: 'icon-list',       educationStyle: 'simple-list',   certificationStyle: 'simple-list' },
  'bold-coral':      { skillStyle: 'pill-outline',         contactStyle: 'inline-compact',  educationStyle: 'divider-list',  certificationStyle: 'simple-list' },
  'dev-terminal':    { skillStyle: 'simple-list',          contactStyle: 'inline-compact',  educationStyle: 'compact-block', certificationStyle: 'simple-list' },
  'strategist-gold': { skillStyle: 'minimal-divider-list', contactStyle: 'icon-list',       educationStyle: 'timeline',      certificationStyle: 'simple-list' },
  'clean-slate':     { skillStyle: 'simple-list',          contactStyle: 'inline-compact',  educationStyle: 'simple-list',   certificationStyle: 'simple-list' },
  'designer-slate':  { skillStyle: 'simple-list',          contactStyle: 'inline-compact',  educationStyle: 'simple-list',   certificationStyle: 'simple-list' },
};

function createEmptyProjectDetail() {
  return { label: 'Workstream', details: 'Describe the scope, ownership, or outcome.' };
}

function createEmptyProjectEntry() {
  return {
    type: 'project-entry',
    name: 'New Project',
    company: '',
    client: '',
    timeline: '',
    overview: '',
    clientsLabel: 'Clients',
    clients: '',
    detailIntro: '',
    detailItems: [createEmptyProjectDetail()],
    bulletSectionTitle: '',
    bullets: [],
  };
}

const STORAGE_KEY = 'resumeBuilder_state';

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

const saved = loadSaved();

// Validate persisted section placement on load (repairs stale state from previous sessions)
const _savedTemplate = saved?.selectedTemplate ?? DEFAULT_TEMPLATE;
const _validatedPlacement = saved?.sectionOrder
  ? validateSectionPlacement(saved.sectionOrder, saved.sidebarOrder || DEFAULT_SIDEBAR_ORDER, _savedTemplate)
  : null;

export default function App() {
  const [theme, setTheme] = useState(loadTheme);
  const [uploadStartMode, setUploadStartMode] = useState('form');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch { return; }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  const [step, setStep] = useState(saved?.resumeData ? 'preview' : 'landing');
  const [resumeData, setResumeData] = useState(saved?.resumeData ?? null);
  const [selectedTemplate, setSelectedTemplate] = useState(saved?.selectedTemplate ?? DEFAULT_TEMPLATE);
  const [photoUrl, setPhotoUrl] = useState(saved?.photoUrl ?? null);
  const [photoSettings, setPhotoSettings] = useState(saved?.photoSettings ?? { zoom: 100, posX: 50, posY: 50 });
  const [photoShape, setPhotoShape] = useState(saved?.photoShape ?? 'square');
  const [colors, setColors] = useState(saved?.colors ?? DEFAULT_COLORS);
  const [globalFont, setGlobalFont] = useState(saved?.globalFont ?? { size: null, family: null });
  const [progress, setProgress] = useState(0);
  const [sectionOrder, setSectionOrder] = useState(_validatedPlacement?.main ?? DEFAULT_SECTION_ORDER);
  const [sidebarOrder, setSidebarOrder] = useState(_validatedPlacement?.side ?? DEFAULT_SIDEBAR_ORDER);
  const [sectionLayout, setSectionLayout] = useState(() => {
    if (!_validatedPlacement) return DEFAULT_SECTION_LAYOUT;
    // Merge validated placement into existing layout (preserves page-2 assignments for other sections)
    const base = saved?.sectionLayout ? { ...saved.sectionLayout } : {};
    _validatedPlacement.main.forEach((id, i) => { base[id] = { ...base[id], page: 1, column: 'main', order: i }; });
    _validatedPlacement.side.forEach((id, i) => { base[id] = { ...base[id], page: 1, column: 'side', order: i }; });
    return base;
  });
  const [extraPages, setExtraPages] = useState(saved?.extraPages ?? 0);
  // Per-page layout mode: 'full-width' (default) or 'same-as-primary'
  const [pageLayoutModes, setPageLayoutModes] = useState(saved?.pageLayoutModes ?? {});
  // Per-page sidebar visibility: true (default) or false
  const [pageSidebarVisible, setPageSidebarVisible] = useState(saved?.pageSidebarVisible ?? {});
  const [styleSettings, setStyleSettings] = useState(saved?.styleSettings ?? {});
  // User-overridden display names for built-in sections (e.g. { summary: 'About Me' })
  // Empty object = use each template's default labels
  const [sectionLabels, setSectionLabels] = useState(saved?.sectionLabels ?? {});

  // Derive current template's styles (stored values override defaults)
  const currentStyles = useMemo(() => {
    const defaults = STYLE_DEFAULTS[selectedTemplate] || {};
    const stored = styleSettings[selectedTemplate] || {};
    return { ...defaults, ...stored };
  }, [selectedTemplate, styleSettings]);

  const skillStyle = currentStyles.skillStyle;
  const contactStyle = currentStyles.contactStyle;
  const educationStyle = currentStyles.educationStyle;
  const certificationStyle = currentStyles.certificationStyle;

  // Per-template style setters
  const makeStyleSetter = useCallback((key) => (val) => {
    setStyleSettings(prev => ({
      ...prev,
      [selectedTemplate]: { ...(prev[selectedTemplate] || {}), [key]: val },
    }));
  }, [selectedTemplate]);

  const setSkillStyle = useMemo(() => makeStyleSetter('skillStyle'), [makeStyleSetter]);
  const setContactStyle = useMemo(() => makeStyleSetter('contactStyle'), [makeStyleSetter]);
  const setEducationStyle = useMemo(() => makeStyleSetter('educationStyle'), [makeStyleSetter]);
  const setCertificationStyle = useMemo(() => makeStyleSetter('certificationStyle'), [makeStyleSetter]);

  const syncValidatedPlacement = useCallback((main, side) => {
    setSectionOrder(main);
    setSidebarOrder(side);
    setSectionLayout(prev => {
      const next = { ...prev };
      main.forEach((id, i) => { next[id] = { ...next[id], page: 1, column: 'main', order: i }; });
      side.forEach((id, i) => { next[id] = { ...next[id], page: 1, column: 'side', order: i }; });
      return next;
    });
  }, []);

  // Apply validated section placement for a given template (resets to clean defaults)
  const applyValidatedPlacement = useCallback((tmpl) => {
    const defaults = TEMPLATE_SECTION_DEFAULTS[tmpl] || TEMPLATE_SECTION_DEFAULTS['executive-navy'];
    const { main, side } = validateSectionPlacement(defaults.main, defaults.side, tmpl);
    setSectionOrder(main);
    setSidebarOrder(side);
    setSectionLayout(buildSectionLayout(main, side));
    setExtraPages(0);
    setPageLayoutModes({});
    setPageSidebarVisible({});
  }, []);

  // When template changes, re-validate section placement (preserve user reordering within columns,
  // but enforce main-only rules and recover any missing sections)
  const prevTemplateRef = useRef(selectedTemplate);
  const lastPlacementRepairRef = useRef('');
  useEffect(() => {
    if (prevTemplateRef.current === selectedTemplate) return;
    prevTemplateRef.current = selectedTemplate;
    // Re-validate current placement against the new template's rules
    const { main, side } = validateSectionPlacement(sectionOrder, sidebarOrder, selectedTemplate);
    if (!arraysEqual(main, sectionOrder) || !arraysEqual(side, sidebarOrder)) {
      const timer = setTimeout(() => syncValidatedPlacement(main, side), 0);
      return () => clearTimeout(timer);
    }
  }, [selectedTemplate, sectionOrder, sidebarOrder, syncValidatedPlacement]);

  useEffect(() => {
    if (step !== 'preview' || !resumeData) {
      lastPlacementRepairRef.current = '';
      return;
    }

    const { main, side } = validateSectionPlacement(sectionOrder, sidebarOrder, selectedTemplate);
    const needsRepair = !arraysEqual(main, sectionOrder) || !arraysEqual(side, sidebarOrder);

    if (!needsRepair) {
      lastPlacementRepairRef.current = '';
      return;
    }

    const repairKey = `${selectedTemplate}|${sectionOrder.join('|')}|${sidebarOrder.join('|')}=>${main.join('|')}|${side.join('|')}`;
    if (lastPlacementRepairRef.current === repairKey) return;
    lastPlacementRepairRef.current = repairKey;

    const timer = setTimeout(() => syncValidatedPlacement(main, side), 0);
    return () => clearTimeout(timer);
  }, [step, resumeData, selectedTemplate, sectionOrder, sidebarOrder, syncValidatedPlacement]);

  const mounted = useRef(false);
  useEffect(() => {
    // Skip the first render to avoid writing the initial state back immediately
    if (!mounted.current) { mounted.current = true; return; }
    // Only persist when user has resume data (i.e. in editor)
    if (!resumeData) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        resumeData, selectedTemplate, photoUrl, photoSettings, photoShape,
        colors, globalFont, styleSettings, sectionLabels,
        sectionOrder, sidebarOrder, sectionLayout, extraPages, pageLayoutModes, pageSidebarVisible,
      }));
    } catch { /* quota exceeded — silently ignore */ }
  }, [
    resumeData, selectedTemplate, photoUrl, photoSettings, photoShape,
    colors, globalFont, styleSettings, sectionLabels,
    sectionOrder, sidebarOrder, sectionLayout, extraPages, pageLayoutModes, pageSidebarVisible,
  ]);

  const goHome = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setStep('landing');
  }, []);

  // AI generation
  const generateResume = useCallback(async (text) => {
    setStep('generating');
    setProgress(0);

    let p = 0;
    const t = setInterval(() => {
      p += Math.random() * 12 + 3;
      if (p > 90) p = 90;
      setProgress(p);
    }, 400);

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      let parsed;

      if (apiKey) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            messages: [{
              role: 'user',
              content: `You are an expert resume parser. Your job is to extract EVERY piece of information from the document below. Do NOT skip or summarize anything — include ALL job roles, ALL bullet points, ALL skills, ALL education entries, ALL certifications.

Return ONLY valid JSON (no backticks, no markdown, no explanation) matching this exact schema:
{"name":"Full Name","title":"Job Title","email":"","phone":"","location":"City, State","summary":"2-3 sentence professional summary","experience":[{"role":"Job Title","company":"Company Name","period":"Start - End","bullets":["Achievement 1","Achievement 2"]}],"skills":["Skill 1","Skill 2"],"education":[{"degree":"Degree Name","school":"School Name","year":"Year or range"}],"certifications":["Cert 1"],"customSections":[{"title":"Contact Details","placement":"side","items":["item 1","item 2"]}]}

CRITICAL RULES:
- Extract EVERY job/role listed, not just the most recent
- Include ALL bullet points for each job exactly as written
- List ALL skills mentioned anywhere in the document
- Include ALL education entries
- Include ALL certifications and licenses under certifications
- Put awards, achievements, projects, languages, strengths, hobbies, references, declaration, and contact/personal details into customSections instead of misplacing them into summary or experience
- Use empty string "" for genuinely missing fields, never skip a field
- If no summary exists, write a professional 2-3 sentence summary based on the experience
- Keep the original wording - do not rephrase or shorten bullet points
- Never place email, phone, address, links, or references inside summary
- Never place education lines into experience or experience lines into education
- customSections placement must be "side" for contact details, languages, strengths, hobbies, declaration, and references; use "main" for awards, projects, volunteering, publications, training, and leadership

Document to parse:
${text}`
            }]
          })
        });

        const result = await response.json();
        const content = result?.content?.[0]?.text || '{}';
        parsed = JSON.parse(content);
      } else {
        parsed = fallbackParse(text);
      }

      clearInterval(t);
      setProgress(100);
      setResumeData(safe(parsed));
      applyValidatedPlacement(selectedTemplate);
      setTimeout(() => setStep('preview'), 300);
    } catch (e) {
      console.error('Generation error:', e);
      clearInterval(t);
      setProgress(100);
      setResumeData(safe(fallbackParse(text)));
      applyValidatedPlacement(selectedTemplate);
      setTimeout(() => setStep('preview'), 300);
    }
  }, [applyValidatedPlacement, selectedTemplate]);

  // Edit handler
  const handleEdit = useCallback((field, payload = {}) => {
    setResumeData(prev => {
      const d = { ...safe(prev) };
      const { i, j, v, id } = payload;

      switch (field) {
        case 'name': d.name = v; break;
        case 'title': d.title = v; break;
        case 'email': d.email = v; break;
        case 'phone': d.phone = v; break;
        case 'location': d.location = v; break;
        case 'summary': d.summary = v; break;

        case 'skill': d.skills = d.skills.map((s, x) => x === i ? v : s); break;
        case 'skill_del': d.skills = d.skills.filter((_, x) => x !== i); break;
        case 'skill_add': d.skills = [...d.skills, 'New Skill']; break;
        case 'skills_replace': d.skills = (payload.items || []).filter(Boolean); break;

        case 'edu_degree': d.education = d.education.map((e, x) => x === i ? { ...e, degree: v } : e); break;
        case 'edu_school': d.education = d.education.map((e, x) => x === i ? { ...e, school: v } : e); break;
        case 'edu_year': d.education = d.education.map((e, x) => x === i ? { ...e, year: v } : e); break;
        case 'edu_period': d.education = d.education.map((e, x) => x === i ? { ...e, year: v } : e); break;
        case 'edu_del': d.education = d.education.filter((_, x) => x !== i); break;
        case 'edu_add': d.education = [...d.education, { degree: 'Degree', school: 'School', year: 'Year' }]; break;

        case 'exp_role': d.experience = d.experience.map((e, x) => x === i ? { ...e, role: v } : e); break;
        case 'exp_company': d.experience = d.experience.map((e, x) => x === i ? { ...e, company: v } : e); break;
        case 'exp_client': d.experience = d.experience.map((e, x) => x === i ? { ...e, client: v } : e); break;
        case 'exp_period': d.experience = d.experience.map((e, x) => x === i ? { ...e, period: v } : e); break;
        case 'exp_bullet': d.experience = d.experience.map((e, x) => x === i ? { ...e, bullets: e.bullets.map((b, y) => y === j ? v : b) } : e); break;
        case 'exp_bullet_del': d.experience = d.experience.map((e, x) => x === i ? { ...e, bullets: e.bullets.filter((_, y) => y !== j) } : e); break;
        case 'exp_bullet_add': d.experience = d.experience.map((e, x) => x === i ? { ...e, bullets: [...e.bullets, 'New achievement'] } : e); break;
        case 'exp_group_heading':
          d.experience = d.experience.map((e, x) => x === i ? {
            ...e,
            sections: (e.sections || []).map((section, y) => y === j ? { ...section, heading: v } : section),
          } : e);
          break;
        case 'exp_group_add':
          d.experience = d.experience.map((e, x) => x === i ? {
            ...e,
            sections: [...(e.sections || []), { heading: 'Subsection', bullets: ['Achievement'] }],
          } : e);
          break;
        case 'exp_group_del':
          d.experience = d.experience.map((e, x) => x === i ? {
            ...e,
            sections: (e.sections || []).filter((_, y) => y !== j),
          } : e);
          break;
        case 'exp_group_bullet':
          d.experience = d.experience.map((e, x) => x === i ? {
            ...e,
            sections: (e.sections || []).map((section, y) => y === j ? {
              ...section,
              bullets: (section.bullets || []).map((bullet, z) => z === payload.k ? v : bullet),
            } : section),
          } : e);
          break;
        case 'exp_group_bullet_add':
          d.experience = d.experience.map((e, x) => x === i ? {
            ...e,
            sections: (e.sections || []).map((section, y) => y === j ? {
              ...section,
              bullets: [...(section.bullets || []), 'New achievement'],
            } : section),
          } : e);
          break;
        case 'exp_group_bullet_del':
          d.experience = d.experience.map((e, x) => x === i ? {
            ...e,
            sections: (e.sections || []).map((section, y) => y === j ? {
              ...section,
              bullets: (section.bullets || []).filter((_, z) => z !== payload.k),
            } : section),
          } : e);
          break;
        case 'exp_del': d.experience = d.experience.filter((_, x) => x !== i); break;
        case 'exp_add': d.experience = [...d.experience, { role: 'Role', company: 'Company', client: '', period: 'Date', bullets: ['Achievement'], sections: [] }]; break;
        case 'exp_reorder': {
          const arr = [...d.experience];
          const [item] = arr.splice(payload.from, 1);
          arr.splice(payload.to, 0, item);
          d.experience = arr;
          break;
        }

        case 'cert': d.certifications = d.certifications.map((c, x) => x === i ? v : c); break;
        case 'cert_del': d.certifications = d.certifications.filter((_, x) => x !== i); break;
        case 'cert_add': d.certifications = [...d.certifications, 'New Certification']; break;
        case 'certs_replace': d.certifications = (payload.items || []).filter(Boolean); break;

        case 'custom_section_add': {
          const newSec = {
            id: Date.now().toString(),
            title: payload.title,
            placement: payload.placement,
            kind: payload.kind,
            items: payload.items || ['Item'],
          };
          d.customSections = [...d.customSections, newSec];
          break;
        }
        case 'custom_section_del': d.customSections = d.customSections.filter(s => s.id !== id); break;
        case 'custom_section_placement': d.customSections = d.customSections.map(s => s.id === id ? { ...s, placement: payload.placement } : s); break;
        case 'custom_item': d.customSections = d.customSections.map(s => s.id === id ? { ...s, items: s.items.map((it, x) => x === j ? v : it) } : s); break;
        case 'custom_item_field':
          d.customSections = d.customSections.map((s) => s.id === id ? {
            ...s,
            items: s.items.map((it, x) => (
              x === j && it && typeof it === 'object'
                ? { ...it, [payload.key]: Object.prototype.hasOwnProperty.call(payload, 'value') ? payload.value : v }
                : it
            )),
          } : s);
          break;
        case 'custom_item_detail_field':
          d.customSections = d.customSections.map((s) => s.id === id ? {
            ...s,
            items: s.items.map((it, x) => (
              x === j && it && typeof it === 'object'
                ? {
                    ...it,
                    detailItems: (it.detailItems || []).map((detail, detailIndex) => (
                      detailIndex === payload.k
                        ? { ...detail, [payload.key]: Object.prototype.hasOwnProperty.call(payload, 'value') ? payload.value : v }
                        : detail
                    )),
                  }
                : it
            )),
          } : s);
          break;
        case 'custom_item_detail_add':
          d.customSections = d.customSections.map((s) => s.id === id ? {
            ...s,
            items: s.items.map((it, x) => (
              x === j && it && typeof it === 'object'
                ? { ...it, detailItems: [...(it.detailItems || []), createEmptyProjectDetail()] }
                : it
            )),
          } : s);
          break;
        case 'custom_item_detail_del':
          d.customSections = d.customSections.map((s) => s.id === id ? {
            ...s,
            items: s.items.map((it, x) => (
              x === j && it && typeof it === 'object'
                ? { ...it, detailItems: (it.detailItems || []).filter((_, detailIndex) => detailIndex !== payload.k) }
                : it
            )),
          } : s);
          break;
        case 'custom_item_del': d.customSections = d.customSections.map(s => s.id === id ? { ...s, items: s.items.filter((_, x) => x !== j) } : s); break;
        case 'custom_item_add':
          d.customSections = d.customSections.map((s) => s.id === id ? {
            ...s,
            items: [...s.items, s.kind === 'project-list' ? createEmptyProjectEntry() : 'New item'],
          } : s);
          break;
        case 'custom_section_replace_items':
          d.customSections = d.customSections.map((s) => s.id === id ? { ...s, items: payload.items || [] } : s);
          break;
        case 'custom_section_rename': d.customSections = d.customSections.map(s => s.id === id ? { ...s, title: v } : s); break;
        case 'section_rename': {
          // Rename a built-in section — stored in sectionLabels state, not in resumeData
          setSectionLabels(labels => ({ ...labels, [payload.sectionId]: v }));
          return prev; // return prev unchanged — the rename is in sectionLabels, not resumeData
        }

        default: break;
      }

      return d;
    });
  }, []);

  const handleAIRewrite = useCallback(async (scope, payload = {}) => {
    if (!resumeData) return;

    if (scope === 'summary') {
      const nextSummary = await rewriteTextWithAI(resumeData.summary || '', { scope: 'summary', context: 'Resume profile summary' });
      setResumeData(prev => safe({ ...prev, summary: nextSummary }));
      return;
    }

    if (scope === 'whole-resume') {
      const nextSummary = await rewriteTextWithAI(resumeData.summary || '', { scope: 'summary', context: 'Resume profile summary' });
      const nextExperience = await Promise.all((resumeData.experience || []).map(async (item) => {
        const bullets = await rewriteTextWithAI((item.bullets || []).join('\n'), {
          scope: 'bullets',
          context: `${item.role || 'Role'} at ${item.company || 'Company'}`,
        });
        return {
          ...item,
          bullets: bullets.split('\n').map((line) => line.replace(/^[-*]\s*/, '').trim()).filter(Boolean),
        };
      }));
      const nextCustomSections = await Promise.all((resumeData.customSections || []).map(async (section) => {
        if (section.kind === 'project-list' || (section.items || []).some((item) => item && typeof item === 'object')) {
          return section;
        }
        const items = await rewriteTextWithAI((section.items || []).join('\n'), {
          scope: 'section',
          context: `${section.title} section`,
        });
        return {
          ...section,
          items: items.split('\n').map((line) => line.replace(/^[-*]\s*/, '').trim()).filter(Boolean),
        };
      }));
      setResumeData(prev => safe({
        ...prev,
        summary: nextSummary,
        experience: nextExperience,
        customSections: nextCustomSections,
      }));
      return;
    }

    if (scope === 'skills') {
      const rewritten = await rewriteTextWithAI((resumeData.skills || []).join('\n'), {
        scope: 'section',
        context: 'Resume skills section',
      });
      const skills = rewritten.split('\n').map((line) => line.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
      setResumeData(prev => safe({ ...prev, skills }));
      return;
    }

    if (scope === 'certifications') {
      const rewritten = await rewriteTextWithAI((resumeData.certifications || []).join('\n'), {
        scope: 'section',
        context: 'Resume certifications section',
      });
      const certifications = rewritten.split('\n').map((line) => line.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
      setResumeData(prev => safe({ ...prev, certifications }));
      return;
    }

    if (scope === 'experience-bullets') {
      const expIndex = payload.index;
      const exp = resumeData.experience?.[expIndex];
      if (!exp) return;
      const rewritten = await rewriteTextWithAI((exp.bullets || []).join('\n'), {
        scope: 'bullets',
        context: `${exp.role || 'Role'} at ${exp.company || 'Company'}`,
      });
      const bullets = rewritten.split('\n').map((line) => line.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
      setResumeData(prev => safe({
        ...prev,
        experience: prev.experience.map((item, idx) => idx === expIndex ? { ...item, bullets } : item),
      }));
      return;
    }

    if (scope === 'custom-section') {
      const sectionId = payload.id;
      const section = (resumeData.customSections || []).find((item) => item.id === sectionId);
      if (!section) return;
      if (section.kind === 'project-list' || (section.items || []).some((item) => item && typeof item === 'object')) return;
      const rewritten = await rewriteTextWithAI((section.items || []).join('\n'), {
        scope: 'section',
        context: `${section.title} section`,
      });
      const items = rewritten.split('\n').map((line) => line.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
      setResumeData(prev => safe({
        ...prev,
        customSections: prev.customSections.map((item) => item.id === sectionId ? { ...item, items } : item),
      }));
    }
  }, [resumeData]);

  const handleReUpload = () => {
    setStep('upload');
  };

  const handleStartFromLanding = useCallback((mode = 'form') => {
    setUploadStartMode(mode);
    setStep('upload');
  }, []);

  const handleStructuredBuild = useCallback((structuredData) => {
    setResumeData(safe(structuredData));
    setProgress(100);
    applyValidatedPlacement(selectedTemplate);
    setTimeout(() => setStep('preview'), 0);
  }, [applyValidatedPlacement, selectedTemplate]);

  return (
    <div className="min-h-screen">
      <Nav
        onGoHome={goHome}
        theme={theme}
        onToggleTheme={toggleTheme}
        step={step}
        templateName={selectedTemplate}
      />
      {step === 'landing' && <LandingPage onStart={handleStartFromLanding} />}
      {step === 'upload' && (
        <UploadPage
          onTextExtracted={generateResume}
          onPhotoUpload={setPhotoUrl}
          onStructuredBuild={handleStructuredBuild}
          initialMode={uploadStartMode}
        />
      )}
      {step === 'generating' && <GeneratingPage progress={progress} />}
      {step === 'preview' && (
        <EditorPage
          data={safe(resumeData)}
          onEdit={handleEdit}
          template={selectedTemplate}
          setTemplate={setSelectedTemplate}
          photo={photoUrl}
          setPhoto={setPhotoUrl}
          photoSettings={photoSettings}
          setPhotoSettings={setPhotoSettings}
          photoShape={photoShape}
          setPhotoShape={setPhotoShape}
          colors={colors}
          setColors={setColors}
          globalFont={globalFont}
          setGlobalFont={setGlobalFont}
          onReUpload={handleReUpload}
          sectionOrder={sectionOrder}
          setSectionOrder={setSectionOrder}
          sidebarOrder={sidebarOrder}
          setSidebarOrder={setSidebarOrder}
          sectionLayout={sectionLayout}
          setSectionLayout={setSectionLayout}
          extraPages={extraPages}
          setExtraPages={setExtraPages}
          pageLayoutModes={pageLayoutModes}
          setPageLayoutModes={setPageLayoutModes}
          pageSidebarVisible={pageSidebarVisible}
          setPageSidebarVisible={setPageSidebarVisible}
          skillStyle={skillStyle}
          setSkillStyle={setSkillStyle}
          contactStyle={contactStyle}
          setContactStyle={setContactStyle}
          educationStyle={educationStyle}
          setEducationStyle={setEducationStyle}
          certificationStyle={certificationStyle}
          setCertificationStyle={setCertificationStyle}
          sectionLabels={sectionLabels}
          setSectionLabels={setSectionLabels}
          onAIRewrite={handleAIRewrite}
        />
      )}
    </div>
  );
}

/**
 * Synonym-based section mapping.
 * Maps every known heading variant → a canonical internal key.
 * The canonical key is what the parser uses downstream to route content.
 */
const SECTION_SYNONYMS = {
  // SUMMARY
  summary: 'summary', profile: 'summary', professional_summary: 'summary',
  profile_summary: 'summary', career_objective: 'summary', objective: 'summary',
  about_me: 'summary', overview: 'summary', summary_of_qualifications: 'summary',
  profilesummary: 'summary', professionalsummary: 'summary', aboutme: 'summary',
  // EXPERIENCE
  experience: 'experience', work_experience: 'experience', professional_experience: 'experience',
  employment_history: 'experience', employment: 'experience', career_history: 'experience',
  work_history: 'experience', work: 'experience',
  workexperience: 'experience', professionalexperience: 'experience', workhistory: 'experience',
  // SKILLS
  skills: 'skills', technical_skills: 'skills', key_skills: 'skills',
  core_competencies: 'skills', expertise: 'skills', competencies: 'skills',
  skills_summary: 'skills', skill_summary: 'skills', areas_of_expertise: 'skills',
  skills_and_expertise: 'skills', tools_and_technologies: 'skills',
  technicalskills: 'skills', keyskills: 'skills', corecompetencies: 'skills',
  // EDUCATION
  education: 'education', academic_background: 'education', qualifications: 'education',
  academic_qualifications: 'education', academic: 'education',
  educational_qualification: 'education', educational_qualifications: 'education',
  // ACHIEVEMENTS / AWARDS
  achievements: 'achievements', professional_achievements: 'achievements',
  awards: 'achievements', accomplishments: 'achievements', key_achievements: 'achievements',
  awards_and_honors: 'achievements', honors: 'achievements',
  // CERTIFICATIONS
  certifications: 'certifications', certification: 'certifications', certificates: 'certifications',
  licenses: 'certifications', licenses_and_certifications: 'certifications',
  professional_development: 'certifications',
  // LANGUAGES / COMMUNICATION
  languages: 'languages', communication: 'languages', communication_skills: 'languages',
  languages_known: 'languages',
  // STRENGTHS
  strengths: 'strengths', core_strengths: 'strengths', soft_skills: 'strengths',
  personal_strength: 'strengths',
  // PERSONAL DETAILS
  personal_details: 'personal_details', personal_information: 'personal_details',
  personal_profile: 'personal_details', contact_details: 'personal_details',
  contact_information: 'personal_details', contact_info: 'personal_details',
  address_details: 'personal_details',
  contact: 'personal_details', personaldetails: 'personal_details',
  contactdetails: 'personal_details', contactinformation: 'personal_details',
  // PROJECTS
  projects: 'projects', personal_projects: 'projects',
  // VOLUNTEERING
  volunteering: 'volunteering', volunteer: 'volunteering',
  community_service: 'volunteering', community_involvement: 'volunteering',
  // PUBLICATIONS
  publications: 'publications', research: 'publications',
  // HOBBIES
  hobbies: 'hobbies', interests: 'hobbies',
  // DECLARATION
  declaration: 'declaration',
  // SUB-HEADINGS (experience sub-sections — merge into experience)
  role_and_responsibilities: '_exp_sub', responsibilities: '_exp_sub',
  key_responsibilities: '_exp_sub',
  // MISC
  references: 'references', additional_information: 'additional_information',
  training: 'training', activities: 'activities', extracurricular: 'activities',
  leadership: 'leadership',
  vms_tools: 'vms_tools',
  vms_and_tools: 'vms_tools',
  vmsandtools: 'vms_tools',
  vms_implementation_clients: 'vms_implementation_clients',
};

const SPECIAL_HEADING_KEYS = {
  workexperience: 'experience',
  professionalexperience: 'experience',
  profilesummary: 'summary',
  personaldetails: 'personal_details',
  contactdetails: 'personal_details',
  contactinformation: 'personal_details',
  languagesknown: 'languages',
  vmstools: 'vms_tools',
  vmsandtools: 'vms_tools',
  vmsimplementationclients: 'vms_implementation_clients',
};

function collapseLetterSpacedHeading(raw) {
  const text = String(raw || '').trim();
  if (!text) return text;
  if (/^(?:[A-Z&]\s+){2,}[A-Z&]$/.test(text)) {
    const compact = text.replace(/\s+/g, '');
    const map = {
      PROFILE: 'PROFILE',
      CONTACT: 'CONTACT',
      WORKEXPERIENCE: 'WORK EXPERIENCE',
      SKILLS: 'SKILLS',
      CERTIFICATION: 'CERTIFICATION',
      CERTIFICATIONS: 'CERTIFICATIONS',
      EDUCATION: 'EDUCATION',
      PROJECTS: 'PROJECTS',
      LANGUAGES: 'LANGUAGES',
      STRENGTHS: 'STRENGTHS',
      REFERENCES: 'REFERENCES',
      DECLARATION: 'DECLARATION',
      VMSTOOLS: 'VMS TOOLS',
      VMSIMPLEMENTATIONCLIENTS: 'VMS IMPLEMENTATION CLIENTS',
    };
    return map[compact] || compact;
  }
  return text;
}

function prettifySectionTitle(key) {
  const normalized = String(key || '').replace(/^_+/, '');
  const parts = normalized.split('_').filter(Boolean);
  return parts
    .map((part) => {
      if (/^(vms|sap|sql|api|ui|ux|hr|bi)$/i.test(part)) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

function inferCustomSectionPlacement(key, items = []) {
  const joined = `${key} ${items.join(' ')}`.toLowerCase();
  if (/(contact|personal|reference|language|strength|hobb|interest|tool|client|certification|license)/i.test(joined)) {
    return 'side';
  }
  return 'main';
}

function normalizeParsedLine(line) {
  return collapseLetterSpacedHeading(String(line || '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim());
}

function mergeBrokenHeadingLines(lines) {
  const merged = [];
  const headingLike = (line) =>
    !!line &&
    line.length <= 24 &&
    line === line.toUpperCase() &&
    /^[A-Z&/\- ]+$/.test(line);

  for (let i = 0; i < lines.length; i++) {
    const current = normalizeParsedLine(lines[i]);
    if (!current) continue;

    let combined = current;
    let consumed = 0;
    for (let span = 1; span <= 2; span++) {
      const next = normalizeParsedLine(lines[i + span]);
      if (!headingLike(current) || !headingLike(next)) break;
      combined = `${combined} ${next}`.replace(/\s+/g, ' ').trim();
      const key = normalizeHeadingKey(combined);
      if (
        key === 'vms_tools' ||
        key === 'vms_implementation_clients' ||
        key === 'experience' ||
        key === 'summary' ||
        key === 'skills' ||
        key === 'education' ||
        key === 'certifications' ||
        key === 'projects'
      ) {
        consumed = span;
      }
    }

    if (consumed > 0) {
      merged.push(combined);
      i += consumed;
    } else {
      merged.push(current);
    }
  }

  return merged;
}

/**
 * Normalize a raw heading string to an internal key.
 * e.g. "WORK EXPERIENCE" → "work_experience" → (via SECTION_SYNONYMS) → "experience"
 */
function normalizeHeadingKey(raw) {
  const normalized = collapseLetterSpacedHeading(raw);
  const key = normalized.toLowerCase().replace(/\s+/g, '_').replace(/[&]/g, 'and').replace(/[^a-z0-9_]/g, '');
  const condensed = key.replace(/_/g, '');
  return SECTION_SYNONYMS[key] || SECTION_SYNONYMS[condensed] || SPECIAL_HEADING_KEYS[condensed] || key;
}

/**
 * Smart fallback parser when no API key is available.
 * Extracts name, contact info, skills, experience, education from raw text.
 * Uses synonym-based section recognition, robust heading detection,
 * table-aware education parsing, and strict section isolation.
 */
function fallbackParse(text) {
  const lines = mergeBrokenHeadingLines(text.split('\n').map(normalizeParsedLine).filter(Boolean));

  // --- Name: first non-empty line that looks like a name ---
  let name = 'Your Name';
  const contactLinePattern = /(@|https?:\/\/|www\.|linkedin|github|\.\bcom\b|\.\borg\b|\.\bnet\b|\d{3}[.\-\s]\d{3,4})/i;
  const sectionLabelPattern = /^(objective|summary|skills|experience|education|profile|about|contact|projects|certification|languages)/i;
  for (const line of lines.slice(0, 8)) {
    const clean = line.replace(/[*_#|]/g, '').trim();
    if (!clean || clean.length < 2 || clean.length > 60) continue;
    if (contactLinePattern.test(clean)) continue;
    if (sectionLabelPattern.test(clean)) continue;
    if (/^\d/.test(clean) || /^[+(]?\d/.test(clean)) continue;
    name = clean;
    break;
  }

  // --- Contact info ---
  const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.\w{2,}/);
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}\d*/);
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  const locationMatch = text.match(/(?:location|address|city|based\s+in)[:\s|]*([^\n|]+)/i)
    || text.match(/([A-Z][a-z]+(?:,\s*[A-Z]{2}))\s*(?:\d{5})?/);
  const isContactLikeLine = (line) => {
    const clean = line.replace(/[*_#|]/g, '').trim();
    if (!clean) return false;
    return /@|https?:\/\/|www\.|linkedin|github|portfolio|\+?\d[\d\s().-]{6,}|\b(?:address|location|city|phone|mobile|email)\b[:\s]/i.test(clean);
  };
  const normalizeSectionLine = (line) => line.replace(/^[\s•\-*▸►>▪■●➢]+/, '').replace(/[*_#]/g, '').trim();

  // =====================================================================
  // PHASE 1: SECTION BOUNDARY DETECTION (synonym-based, heading-aware)
  // =====================================================================

  // Comprehensive heading keyword list (used for both standalone + inline detection)
  const headingKeywords = [
    'career\\s*objective', 'professional\\s*summary', 'profile\\s*summary',
    'summary\\s*(?:of\\s*qualifications)?', 'objective', 'about\\s*me', 'profile', 'overview',
    'skills?\\s*(?:summary|&\\s*expertise)?', 'skills', 'core\\s*competencies',
    'technical\\s*skills', 'key\\s*skills', 'areas?\\s*of\\s*expertise', 'competencies',
    'tools?\\s*(?:&|and)\\s*technologies', 'expertise',
    'work\\s*(?:experience|history)', 'work', 'experience', 'employment\\s*(?:history)?',
    'professional\\s*experience', 'career\\s*history',
    'education', 'academic\\s*(?:qualifications|background)', 'qualifications',
    'certifications?', 'certificates?', 'licenses?\\s*(?:&|and)\\s*certifications?',
    'professional\\s*achievements?', 'awards?\\s*(?:&|and)\\s*honors?', 'awards?',
    'honors?', 'achievements?', 'accomplishments', 'key\\s*achievements?',
    'projects?', 'personal\\s*projects?', 'publications?', 'research',
    'volunteer(?:ing)?', 'community\\s*(?:service|involvement)',
    'interests', 'hobbies',
    'languages(?:\\s*known)?', 'communication(?:\\s*skills)?',
    'strengths', 'core\\s*strengths', 'soft\\s*skills', 'personal\\s*(?:strength|details|information|profile)',
    'contact(?:\\s*(?:details|information|info))?', 'address\\s*details',
    'references', 'declaration',
    'additional\\s*information', 'professional\\s*development', 'training',
    'activities', 'extracurricular', 'leadership', 'vms\\s*&\\s*tools', 'vms\\s*implementation\\s*clients',
    'role\\s*and\\s*responsibilit\\w*', 'responsibilit\\w*', 'key\\s*responsibilit\\w*',
  ];
  const headingAlternation = headingKeywords.join('|');

  // Standalone heading: occupies the entire line (with optional bold/markdown/colon)
  const standaloneHeadingRe = new RegExp(
    '^(?:#{1,3}\\s*)?(?:\\*{0,2})(' + headingAlternation + ')(?:\\*{0,2})\\s*[:\\-–—]?\\s*$', 'i'
  );

  // Inline heading: heading keyword followed by substantial content on same line
  // (common in 2-column PDF extractions)
  const inlineHeadingRe = new RegExp(
    '^(?:\\*{0,2})(' + headingAlternation + ')\\s+(.{10,})$', 'i'
  );

  /**
   * Detect if a line is a heading using multiple heuristics:
   * 1. Matches known section keyword (standalone)
   * 2. ALL UPPERCASE, short, no heavy punctuation
   * 3. Bold markers (**text**)
   * Returns { key, remainder } or null
   */
  function detectHeading(stripped) {
    const normalized = collapseLetterSpacedHeading(stripped);
    // 1. Standalone keyword match (most reliable)
    const standaloneMatch = normalized.match(standaloneHeadingRe);
    if (standaloneMatch) {
      return { key: normalizeHeadingKey(standaloneMatch[1]), remainder: null };
    }

    // 2. ALL CAPS short line with no punctuation (likely a heading even if not in keyword list)
    //    e.g. "PROFESSIONAL ACHIEVEMENTS" or "WORK EXPERIENCE"
    const noBold = normalized.replace(/\*+/g, '').trim();
    if (
      noBold.length >= 3 && noBold.length <= 60 &&
      noBold === noBold.toUpperCase() &&
      /^[A-Z\s&/\-–—]+$/.test(noBold)
    ) {
      const key = normalizeHeadingKey(noBold);
      const wordCount = noBold.split(/\s+/).filter(Boolean).length;
      const compact = noBold.toLowerCase().replace(/\s+/g, '');
      const isKnownAllCapsHeading = !!(SECTION_SYNONYMS[key] || SPECIAL_HEADING_KEYS[compact]);
      if (key && key.length <= 48 && (isKnownAllCapsHeading || wordCount >= 2)) {
        return { key, remainder: null };
      }
    }

    // 3. Inline heading: keyword + content on same line
    const inlineMatch = normalized.match(inlineHeadingRe);
    if (inlineMatch) {
      const remainder = inlineMatch[2].trim();
      // Validate: remainder should look like actual content (bullet, capital, key:value)
      const looksLikeContent = /^[➢•▸►>\-▪■●A-Z\d"'(]/.test(remainder) ||
        /^[A-Za-z]+\s*:/.test(remainder) ||
        /^[A-Z][a-z]/.test(remainder);
      if (looksLikeContent) {
        return { key: normalizeHeadingKey(inlineMatch[1]), remainder };
      }
    }

    return null;
  }

  // --- Split text into sections using HARD boundaries ---
  const sections = {};
  let currentSection = 'header';
  let currentLines = [];

  for (const line of lines) {
    const stripped = line.replace(/[*_#\t]/g, '').trim();
    const heading = detectHeading(stripped);

    if (heading) {
      // HARD boundary: save current section, start new one
      if (currentLines.length > 0) {
        const canonKey = normalizeHeadingKey(currentSection);
        if (!sections[canonKey]) sections[canonKey] = [];
        sections[canonKey].push(...currentLines);
      }
      currentSection = heading.key;
      currentLines = heading.remainder ? [heading.remainder] : [];
    } else {
      currentLines.push(line);
    }
  }
  // Flush last section
  if (currentLines.length > 0) {
    const canonKey = normalizeHeadingKey(currentSection);
    if (!sections[canonKey]) sections[canonKey] = [];
    sections[canonKey].push(...currentLines);
  }

  // Merge experience sub-sections into experience
  if (sections['_exp_sub'] && sections['_exp_sub'].length > 0) {
    if (!sections['experience']) sections['experience'] = [];
    sections['experience'].push(...sections['_exp_sub']);
    delete sections['_exp_sub'];
  }

  // --- Title: look for a title-like line near the top ---
  const titleKeywords = /analyst|engineer|developer|programmer|manager|designer|consultant|specialist|coordinator|lead|director|architect|scientist|administrator|executive|officer|intern|associate|assistant|technician|strategist|product\s*owner|scrum\s*master|devops|data|software|full[\s-]?stack|front[\s-]?end|back[\s-]?end|mobile|web|cloud|machine\s*learning|ai|ux|ui|marketing|sales|finance|accounting|nurse|teacher|professor|researcher|writer|editor|attorney|lawyer|physician|therapist/i;
  let title = '';
  for (const line of lines.slice(0, 12)) {
    const clean = line.replace(/[*_#|]/g, '').trim();
    if (clean === name) continue;
    if (contactLinePattern.test(clean)) continue;
    if (titleKeywords.test(clean) && clean.length > 3 && clean.length < 80) {
      title = clean;
      break;
    }
    if (/^[A-Z][A-Z\s/&-]{4,80}$/.test(clean) && !/^(profile|summary|skills|experience|education|contact|projects|certification)/i.test(clean)) {
      title = clean;
      break;
    }
  }
  if (!title) {
    const desigMatch = text.match(/(?:designation|title|position)[:\s]*(.+)/i);
    if (desigMatch) title = desigMatch[1].replace(/[*_#]/g, '').trim();
  }

  // =====================================================================
  // PHASE 2: EXTRACT DATA FROM ISOLATED SECTIONS
  // =====================================================================

  // --- Summary ---
  let summary = '';
  if (sections['summary'] && sections['summary'].length > 0) {
    summary = sections['summary']
      .map(normalizeSectionLine)
      .filter(line => line && !isContactLikeLine(line) && !/^(skills?|experience|education|certifications?|projects?|languages|references)\s*:?\s*$/i.test(line))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // --- Skills ---
  let skills = [];
  if (sections['skills'] && sections['skills'].length > 0) {
    const sLines = sections['skills'];
    // Detect if skills are paragraph-style bullets (long lines with ➢, •, ▸, etc.)
    const isParagraphBullets = sLines.every(l => {
      const c = l.replace(/[*_#]/g, '').trim();
      return !c || /^[➢•▸►>\-▪■●]/.test(c) || c.length > 60;
    });

    for (const line of sLines) {
      const cleaned = normalizeSectionLine(line);
      if (!cleaned) continue;
      if (isContactLikeLine(cleaned)) continue;

      if (isParagraphBullets) {
        const stripped = cleaned.replace(/^[\s➢•▸►>\-▪■●*]+/, '').trim();
        if (!stripped || stripped.length < 5) continue;
        // "Category: skill1, skill2" within a bullet
        const catMatch = stripped.match(/^([^:]{2,30}):\s*(.+)/);
        if (catMatch) {
          const items = catMatch[2].split(/[,|]/).map(s => s.trim()).filter(s => s && s.length > 1 && s.length < 50);
          if (items.length > 0) { skills.push(...items); continue; }
        }
        // Extract known tool/technology names
        const toolPattern = /\b(SQL\s*Server|SQL|Power\s*BI|Power\s*Query|Power\s*Pivot|Power\s*View|Power\s*Map|Excel|Python|R\b|Tableau|DAX|SSIS|SSRS|SSAS|Azure|AWS|GCP|Hadoop|Spark|MongoDB|PostgreSQL|MySQL|Oracle|SAP|Jira|Git|Docker|Kubernetes|JavaScript|TypeScript|React|Node\.js|Java|C\+\+|C#|\.NET|HTML5?|CSS3?|Angular|Vue|Django|Flask|TensorFlow|PyTorch|Pandas|NumPy|Matplotlib|Scikit-learn|Power\s*Automate|SharePoint|Salesforce|HubSpot|Snowflake|Redshift|BigQuery|Looker|QlikView|Qlik\s*Sense|SPSS|SAS|Alteryx|Informatica|Talend|Airflow|Kafka|Redis|Elasticsearch|Grafana|Jenkins|CI\/CD|REST\s*APIs?|GraphQL|Linux|Windows|macOS|Agile|Scrum|Kanban|Pivot\s*tables?|VLOOKUP|conditional\s*formatting|data\s*cleaning|data\s*analysis|data\s*model(?:l?ing)?|data\s*processing|data\s*visualization|machine\s*learning|deep\s*learning|NLP|ETL|business\s*intelligence)\b/gi;
        const matches = stripped.match(toolPattern);
        if (matches) {
          for (const m of matches) {
            const normalized = m.trim();
            if (normalized && !skills.some(s => s.toLowerCase() === normalized.toLowerCase())) {
              skills.push(normalized);
            }
          }
        }
        continue;
      }

      // "Category: skill1, skill2" format
      const categoryMatch = cleaned.match(/^[^:]{2,30}:\s*(.+)/);
      const valueStr = categoryMatch ? categoryMatch[1] : cleaned;

      if (valueStr.includes('|')) {
        skills.push(...valueStr.split('|').map(s => s.trim()).filter(s => s && s.length < 50));
      } else if (valueStr.includes(',')) {
        skills.push(...valueStr.split(',').map(s => s.trim()).filter(s => s && s.length < 50));
      } else {
        const item = valueStr.replace(/^[\s•\-*▸►>·:➢▪■●]+/, '').trim();
        if (item && item.length < 50 && !item.match(/^(skills?|summary|section|technical)/i)) {
          skills.push(item);
        }
      }
    }
  }
  skills = [...new Set(skills)].filter(Boolean);
  if (skills.length === 0) skills = ['Add your skills'];

  // --- Experience ---
  const experience = [];
  let expLines = sections['experience'] || [];

  if (expLines.length > 0) {
    let currentExp = null;
    let bullets = [];

    const flushExp = () => {
      if (currentExp) {
        currentExp.bullets = bullets.length > 0 ? [...bullets] : ['Responsibilities and achievements'];
        experience.push({ ...currentExp });
        bullets = [];
      }
    };

    const datePattern = /(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\.?\s*-?\s*)?\d{4}\s*[-–—]+\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\.?\s*-?\s*)?\s*(?:\d{4}|present|current|ongoing|now|continuing)/i;
    const datePattern2 = /\d{1,2}\/\d{4}\s*[-–—]+\s*(?:\d{1,2}\/\d{4}|present|current)/i;
    const skipPattern = /^(role\s*and\s*responsibilit|responsibilit|key\s*responsibilit|tools?\s*used|key\s*achievement|notable\s*achievement)/i;
    const companyMarkerPattern = /^company\s*\d*\s*[:\-–—]/i;
    const kvClientPattern = /^(?:client\s*name|company\s*name|employer|organization|company|client)\s*[:\-–—]\s*(.+)/i;
    const kvRolePattern = /^(?:designation|job\s*title|position|title)\s*[:\-–—]\s*(.+)/i;
    const kvRoleLine = /^role\s*[:\-–—]\s*(.{2,})/i;
    const companyLikePattern = /\b(?:group|solutions?|consult(?:ing|ancy)?|technologies?|infosystems|systems?|services?|company|corporation|corp|partners?|pvt|ltd|limited|llc|inc|pty|india|australia)\b/i;
    const payrollPattern = /^(?:payroll|supporting\s*client|program|client)\s*[:\-–—]/i;
    const subheadingPattern = /^(?:customer implementation and expansions|application support|product evolution and operational excellence|client support & operations|post-go-live support|enhancements? & change requests|supplier & worker support|timesheet & expense support|rate & financial issue resolution|integration monitoring|reporting & analytics(?: support)?|user access & security administration|client communication(?: & (?:governance|coordination))?)$/i;

    for (const line of expLines) {
      const cleaned = normalizeParsedLine(line).replace(/[*_#]/g, '').replace(/\t+/g, ' ').replace(/\s+/g, ' ').trim();
      if (!cleaned) continue;
      if (skipPattern.test(cleaned)) continue;

      const hasDate = datePattern.test(cleaned) || datePattern2.test(cleaned);
      const dateMatch = cleaned.match(datePattern) || cleaned.match(datePattern2);
      const dateOnlyLine = hasDate && cleaned.replace(datePattern, '').replace(datePattern2, '').replace(/[(),\s\-–—]/g, '').trim().length < 6;
      const roleWordCount = cleaned.split(/\s+/).filter(Boolean).length;
      const roleLikeLine = titleKeywords.test(cleaned) && cleaned.length < 70 && roleWordCount <= 6 && !/[.:;]/.test(cleaned) && !/^(?:working|responsible|serve|conduct|translate|configure|develop|manage|support|partner|collaborate|perform|oversee|identify|provide|handle|maintain|create|monitor|analy(?:s|z)|deliver|document|implement)/i.test(cleaned);
      const companyWordCount = cleaned.split(/\s+/).filter(Boolean).length;
      const companyLikeLine = /^[A-Z]/.test(cleaned) && companyLikePattern.test(cleaned) && cleaned.length < 90 && companyWordCount <= 8 && !/[:;]/.test(cleaned) && !/^(?:working|responsible|serve|conduct|translate|configure|develop|manage|support|lead|act|provide|escalate|handle|deliver|partner|collaborate|perform|oversee|identify|document|create|analy(?:s|z)|maintain|monitor)/i.test(cleaned);
      if (companyMarkerPattern.test(cleaned)) {
        flushExp();
        currentExp = { role: '', company: '', period: '', bullets: [] };
        continue;
      }

      const kvClient = cleaned.match(kvClientPattern);
      if (kvClient) {
        if (!currentExp) { flushExp(); currentExp = { role: '', company: '', period: '', bullets: [] }; }
        if (!currentExp.company) currentExp.company = kvClient[1].trim();
        continue;
      }

      const kvRole = cleaned.match(kvRolePattern);
      if (kvRole) {
        if (!currentExp) { flushExp(); currentExp = { role: '', company: '', period: '', bullets: [] }; }
        currentExp.role = kvRole[1].trim();
        continue;
      }

      const kvRoleVal = !cleaned.match(/responsibilit/i) && cleaned.match(kvRoleLine);
      if (kvRoleVal) {
        if (!currentExp) { flushExp(); currentExp = { role: '', company: '', period: '', bullets: [] }; }
        let roleText = kvRoleVal[1].trim();
        const parenDate = roleText.match(/\(([^)]*(?:present|current|\d{4})[^)]*)\)/i);
        if (parenDate) {
          const innerDate = parenDate[1].match(datePattern) || parenDate[1].match(datePattern2);
          if (innerDate && !currentExp.period) currentExp.period = innerDate[0].trim();
          roleText = roleText.replace(/\([^)]*\)/, '').trim();
        }
        if (!currentExp.role) currentExp.role = roleText;
        continue;
      }

      if (payrollPattern.test(cleaned) || subheadingPattern.test(cleaned)) {
        if (!currentExp) currentExp = { role: '', company: '', period: '', bullets: [] };
        bullets.push(cleaned);
        continue;
      }

      if (currentExp && dateOnlyLine && !currentExp.period && (currentExp.role || currentExp.company)) {
        currentExp.period = dateMatch ? dateMatch[0].trim() : '';
        continue;
      }

      if (
        currentExp &&
        currentExp.role &&
        currentExp.company &&
        currentExp.period &&
        companyLikeLine &&
        bullets.length > 0
      ) {
        flushExp();
        currentExp = { role: '', company: cleaned, period: '', bullets: [] };
        continue;
      }

      const isBullet = /^[\s•\-*▸►>·▪■●➢]+/.test(cleaned) || cleaned.length > 100;

      if (!isBullet && hasDate) {
        const dateOnly = cleaned.replace(datePattern, '').replace(datePattern2, '').replace(/[(),\s\-–—]/g, '').trim();
        if (currentExp && !currentExp.period && (currentExp.role || currentExp.company) && dateOnly.length < 15) {
          currentExp.period = dateMatch ? dateMatch[0].trim() : '';
          continue;
        }

        flushExp();
        const period = dateMatch ? dateMatch[0].trim() : '';
        let header = cleaned.replace(datePattern, '').replace(datePattern2, '').replace(/[()]/g, '').trim();
        header = header.replace(/[\s,|–—-]+$/, '').replace(/^[\s,|–—-]+/, '').trim();

        let role = '', company = '';
        const splitMatch = header.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i)
          || header.match(/^(.+?)\s*[|–—]\s*(.+)$/)
          || header.match(/^(.+?),\s+(.+)$/);
        if (splitMatch) {
          role = splitMatch[1].trim();
          company = splitMatch[2].trim();
        } else {
          if (titleKeywords.test(header)) {
            role = header;
          } else {
            company = header;
          }
        }
        currentExp = { role, company, period, bullets: [] };
        continue;
      }

      if (!isBullet && !hasDate && cleaned.length < 80) {
        if (currentExp && currentExp.role && currentExp.company && currentExp.period) {
          if (companyLikeLine && bullets.length > 0) {
            flushExp();
            const cleanVal = cleaned.replace(/^[\s•\-*▸►>·▪■●➢]+/, '').trim();
            currentExp = { role: '', company: cleanVal, period: '', bullets: [] };
            continue;
          }
          if (roleLikeLine && bullets.length > 0) {
            flushExp();
            const cleanVal = cleaned.replace(/^[\s•\-*▸►>·▪■●➢]+/, '').trim();
            currentExp = { role: cleanVal, company: '', period: '', bullets: [] };
            continue;
          }
        }

        if (!currentExp) {
          flushExp();
          currentExp = { role: '', company: '', period: '', bullets: [] };
        }
        if (!currentExp.role && roleLikeLine) {
          currentExp.role = cleaned.replace(/^[\s•\-*▸►>·▪■●➢]+/, '').trim();
          continue;
        }
        if (!currentExp.company && cleaned.length > 2) {
          if (companyLikeLine || currentExp.role || !roleLikeLine) {
            currentExp.company = cleaned.replace(/^[\s•\-*▸►>·▪■●➢]+/, '').trim();
            continue;
          }
        }
        if (currentExp.role && currentExp.company && !currentExp.period) {
          const pureDate = cleaned.match(datePattern) || cleaned.match(datePattern2);
          if (pureDate) {
            currentExp.period = pureDate[0].trim();
            continue;
          }
        }
        if (currentExp && currentExp.role && currentExp.company && currentExp.period) {
          bullets.push(cleaned);
          continue;
        }
      }

      // Bullet point content
      if (currentExp) {
        const bullet = cleaned.replace(/^[\s•\-*▸►>·▪■●➢]+/, '').trim();
        if (bullet.length > 8 && !bullet.match(/^(tools?|technologies|company\s*name|client\s*name|supporting\s*client|designation|role|position|title|location|department)\s*[:\-–—]/i)) {
          bullets.push(bullet);
        }
      } else {
        const bullet = cleaned.replace(/^[\s•\-*▸►>·▪■●➢]+/, '').trim();
        if (bullet.length > 20) {
          currentExp = { role: '', company: '', period: '', bullets: [] };
          bullets.push(bullet);
        }
      }
    }
    flushExp();

    const leakStartPattern = /^(?:orders\s*:|timesheet management\s*:|expenses\s*:|reporting\s*:|workday connectors\s*:|company settings\s*:|integration monitoring|reporting\s*&\s*analytics support|user access\s*&\s*security administration|client communication\s*&\s*(?:coordination|governance)|workday vndly end-to-end implementation|sap fieldglass end-to-end implementation|clients\s*:|extended workforce management\s*:|my responsibilities included configuring and supporting the following modules:|management workflows\.|client support\s*&\s*operations|post-go-live support|enhancements?\s*&\s*change requests|supplier\s*&\s*worker support|timesheet\s*&\s*expense support|rate\s*&\s*financial issue resolution)$/i;
    const isRoleCandidate = (line) => {
      const normalized = normalizeParsedLine(String(line || ''));
      const words = normalized.split(/\s+/).filter(Boolean).length;
      return !!normalized
        && titleKeywords.test(normalized)
        && normalized.length < 70
        && words <= 6
        && !/[.:;]/.test(normalized)
        && !/^(?:working|responsible|serve|conduct|translate|configure|develop|manage|support|partner|collaborate|perform|oversee|identify|provide|handle|maintain|create|monitor|analy(?:s|z)|deliver|document|implement)/i.test(normalized);
    };
    const isCompanyCandidate = (line) => {
      const normalized = normalizeParsedLine(String(line || ''));
      const words = normalized.split(/\s+/).filter(Boolean).length;
      return !!normalized
        && /^[A-Z]/.test(normalized)
        && companyLikePattern.test(normalized)
        && normalized.length < 90
        && words <= 8
        && !/[:;]/.test(normalized)
        && !/^(?:working|responsible|serve|conduct|translate|configure|develop|manage|support|lead|act|provide|escalate|handle|deliver|partner|collaborate|perform|oversee|identify|document|create|analy(?:s|z)|maintain|monitor)/i.test(normalized);
    };
    const isDateCandidate = (line) => {
      const normalized = normalizeParsedLine(String(line || ''));
      const match = normalized.match(datePattern) || normalized.match(datePattern2);
      if (!match) return false;
      return normalized.replace(datePattern, '').replace(datePattern2, '').replace(/[(),\s\-–—]/g, '').trim().length < 6;
    };
    const isSubheadingCandidate = (line) => {
      const normalized = normalizeParsedLine(String(line || ''));
      return payrollPattern.test(normalized) || subheadingPattern.test(normalized);
    };
    const finalizeExpItem = (item) => {
      const cleanedBullets = [...new Set((item.bullets || []).map(normalizeParsedLine).filter(Boolean))];
      return {
        role: item.role || title || 'Professional Experience',
        company: item.company || 'Company Name',
        period: item.period || 'Start - End',
        bullets: cleanedBullets.length > 0 ? cleanedBullets : ['Responsibilities and achievements'],
      };
    };
    const splitEmbeddedExperiences = (items) => {
      const nextItems = [];
      for (const item of items) {
        let current = { ...item, bullets: [] };
        const sourceBullets = (item.bullets || []).map(normalizeParsedLine).filter(Boolean);
        for (let i = 0; i < sourceBullets.length; i++) {
          const line = sourceBullets[i];
          const next = sourceBullets[i + 1] || '';
          const next2 = sourceBullets[i + 2] || '';
          const next3 = sourceBullets[i + 3] || '';

          if (
            isCompanyCandidate(line) &&
            isDateCandidate(next) &&
            (isRoleCandidate(next2) || (isSubheadingCandidate(next2) && isRoleCandidate(next3)))
          ) {
            nextItems.push(finalizeExpItem(current));
            current = { role: '', company: line, period: next, bullets: [] };
            let roleIndex = i + 2;
            if (isSubheadingCandidate(next2)) {
              current.bullets.push(next2);
              roleIndex = i + 3;
            }
            if (isRoleCandidate(sourceBullets[roleIndex])) {
              current.role = sourceBullets[roleIndex];
              i = roleIndex;
            } else {
              i = i + 1;
            }
            continue;
          }

          if (leakStartPattern.test(line)) break;
          current.bullets.push(line);
        }
        nextItems.push(finalizeExpItem(current));
      }
      return nextItems.filter((item, index, arr) => {
        const sig = `${item.role}|${item.company}|${item.period}`;
        return arr.findIndex((other) => `${other.role}|${other.company}|${other.period}` === sig) === index;
      });
    };

    const rebuiltExperience = [];
    const normalizedExpLines = (sections['experience'] || []).map(normalizeParsedLine).filter(Boolean);
    for (let i = 0; i < normalizedExpLines.length; i++) {
      const line = normalizedExpLines[i];
      const next = normalizedExpLines[i + 1] || '';
      if (!isCompanyCandidate(line) || !isDateCandidate(next)) continue;

      let j = i + 2;
      const item = { role: '', company: line, period: next, bullets: [] };
      while (j < normalizedExpLines.length && isSubheadingCandidate(normalizedExpLines[j])) {
        item.bullets.push(normalizedExpLines[j]);
        j++;
      }
      if (isRoleCandidate(normalizedExpLines[j])) {
        item.role = normalizedExpLines[j];
        j++;
      }

      while (j < normalizedExpLines.length) {
        const currentLine = normalizedExpLines[j];
        const upcomingLine = normalizedExpLines[j + 1] || '';
        if (isCompanyCandidate(currentLine) && isDateCandidate(upcomingLine)) break;
        if (leakStartPattern.test(currentLine)) break;
        item.bullets.push(currentLine);
        j++;
      }

      rebuiltExperience.push(finalizeExpItem(item));
      i = j - 1;
    }

    const normalizedExperience = splitEmbeddedExperiences(experience);
    experience.splice(
      0,
      experience.length,
      ...(rebuiltExperience.length >= 2 ? rebuiltExperience : normalizedExperience)
    );
  }

  if (experience.length === 0) {
    experience.push({ role: title || 'Your Role', company: 'Company Name', period: 'Start - End', bullets: ['Add your achievements and responsibilities'] });
  }

  // --- Education (table-aware, strict section isolation) ---
  const education = [];
  const degreePattern = /(?<![a-zA-Z])(b\.?\s*tech|m\.?\s*tech|b\.?\s*sc|m\.?\s*sc|b\.?\s*a\.?|m\.?\s*a\.?|b\.?\s*com|m\.?\s*com|b\.?\s*e\.?|m\.?\s*e\.?|b\.?\s*s\.?|m\.?\s*s\.?|mba|bba|mph|msw|mfa|phd|ph\.?\s*d|ed\.?\s*d|j\.?\s*d\.?|m\.?\s*d\.?|a\.?\s*a\.?\s*s?|ged)(?![a-zA-Z])|(diploma|bachelor|master|associate|doctor(?:ate)?|degree|high\s*school|certificate|juris\s*doctor)/i;

  if (sections['education'] && sections['education'].length > 0) {
    let current = null;
    const tableHeaderPattern = /education\s*type|school.*college.*university|year\s*of\s*pass|percentage|cgpa|sl\.?\s*no/i;

    for (const line of sections['education']) {
      const cleaned = normalizeParsedLine(line).replace(/[*_#]/g, '').trim();
      if (!cleaned) continue;
      // Skip table header rows
      if (tableHeaderPattern.test(cleaned)) continue;

      // Detect table-format rows: columns separated by pipes, tabs, or 3+ spaces
      // DOCX tables produce pipe-separated: "B. TECH (ETC) | Synergy Institute | 2016 | 80"
      // PDF tables produce tab/space-separated columns
      let columns;
      if (cleaned.includes('|')) {
        columns = cleaned.split('|').map(c => c.trim()).filter(Boolean);
      } else {
        columns = cleaned.split(/\t+|\s{3,}/).map(c => c.trim()).filter(Boolean);
      }
      if (columns.length >= 2) {
        const hasDegreeInCol = degreePattern.test(columns[0]) || /intermediate|ssc|hsc|10th|12th/i.test(columns[0]);
        if (hasDegreeInCol) {
          if (current) { education.push(current); current = null; }
          const yearInCols = columns.find(c => /^\d{4}$/.test(c.trim()));
          // School is usually the second column (skip if it's just a year or percentage)
          const schoolCol = columns.slice(1).find(c => !/^\d{4}$/.test(c.trim()) && !/^\d+\.?\d*\s*%?$/.test(c.trim()));
          education.push({
            degree: columns[0],
            school: schoolCol || '',
            year: yearInCols || '',
          });
          continue;
        }
      }

      // Non-table: standard degree line detection
      const hasDegree = degreePattern.test(cleaned) || /intermediate|ssc|hsc|10th|12th/i.test(cleaned);
      const yearMatch = cleaned.match(/\d{4}/);
      if (hasDegree || (cleaned.length > 5 && cleaned.length < 100 && !current)) {
        if (current) education.push(current);
        current = { degree: cleaned, school: '', year: '' };
        if (yearMatch) current.year = yearMatch[0];
      } else if (current) {
        if (yearMatch && !current.year) {
          current.year = yearMatch[0];
          const remainder = cleaned.replace(/\d{4}\s*[-–—]\s*\d{4}|\d{4}/, '').replace(/[,\s]+$/, '').replace(/^[,\s]+/, '').trim();
          if (!current.school && remainder.length > 2) {
            current.school = remainder;
          }
        } else if (!current.school) {
          current.school = cleaned;
        }
      }
    }
    if (current) education.push(current);
  }
  if (education.length === 0) {
    education.push({ degree: 'Your Degree', school: 'University', year: 'Year' });
  }

  // --- Certifications (only actual certs/licenses, NOT achievements/awards) ---
  const certifications = [];
  if (sections['certifications'] && sections['certifications'].length > 0) {
    let currentCert = '';
    for (const line of sections['certifications']) {
      const cleaned = line.replace(/^[\s•\-*▸►>▪■●➢]+/, '').replace(/[*_#]/g, '').trim();
      if (!cleaned || cleaned.length <= 3) continue;

      const looksLikeDate = /^\(?\d{1,2}\/\d{4}\s*[-–—]+\s*(?:\d{1,2}\/\d{4}|present|current)\)?$/i.test(cleaned)
        || /^\(?\d{2}\/\d{4}\s*[-–—]+\s*present\)?$/i.test(cleaned);

      if (looksLikeDate) {
        const combined = `${currentCert} ${cleaned}`.trim();
        certifications.push(combined || cleaned);
        currentCert = '';
        continue;
      }

      if (!currentCert) {
        currentCert = cleaned;
        continue;
      }

      if (/[:-]$/.test(currentCert) || currentCert.split(/\s+/).length < 7) {
        currentCert = `${currentCert} ${cleaned}`.trim();
      } else {
        certifications.push(currentCert);
        currentCert = cleaned;
      }
    }
    if (currentCert) certifications.push(currentCert);
  }

  // --- Dynamic custom sections (Awards, Languages, Strengths, etc.) ---
  const customSections = [];
  const customSectionMap = {
    'achievements':       { title: 'Awards', placement: 'main' },
    'languages':          { title: 'Languages', placement: 'side' },
    'strengths':          { title: 'Strengths', placement: 'side' },
    'hobbies':            { title: 'Hobbies', placement: 'side' },
    'projects':           { title: 'Projects', placement: 'main' },
    'volunteering':       { title: 'Volunteering', placement: 'main' },
    'publications':       { title: 'Publications', placement: 'main' },
    'personal_details':   { title: 'Contact Details', placement: 'side' },
    'declaration':        { title: 'Declaration', placement: 'side' },
    'training':           { title: 'Training', placement: 'main' },
    'leadership':         { title: 'Leadership', placement: 'main' },
    'references':         { title: 'References', placement: 'side' },
    'vms_tools':          { title: 'VMS Tools', placement: 'side' },
    'vms_implementation_clients': { title: 'VMS Implementation Clients', placement: 'side' },
  };

  for (const [canonKey, config] of Object.entries(customSectionMap)) {
    if (sections[canonKey] && sections[canonKey].length > 0) {
      // Don't create duplicate custom sections with the same title
      if (customSections.some(s => s.title === config.title)) continue;
      const items = [];
      for (const line of sections[canonKey]) {
        const cleaned = line.replace(/^[\s•\-*▸►>▪■●➢]+/, '').replace(/[*_#]/g, '').trim();
        if (cleaned && cleaned.length > 3) {
          items.push(cleaned);
        }
      }
      if (items.length > 0) {
        customSections.push({
          id: 'cs_' + canonKey + '_' + Math.random().toString(36).slice(2, 8),
          title: config.title,
          placement: config.placement,
          items,
        });
      }
    }
  }

  const reservedSectionKeys = new Set(['header', 'summary', 'experience', 'skills', 'education', 'certifications', '_exp_sub', ...Object.keys(customSectionMap)]);
  for (const [canonKey, sectionLines] of Object.entries(sections)) {
    if (reservedSectionKeys.has(canonKey)) continue;
    if (!Array.isArray(sectionLines) || sectionLines.length === 0) continue;
    const items = sectionLines
      .map(normalizeSectionLine)
      .filter(line => line && line.length > 2 && !/^page\s+\d+$/i.test(line));
    if (!items.length) continue;
    const title = prettifySectionTitle(canonKey);
    if (customSections.some(s => s.title.toLowerCase() === title.toLowerCase())) continue;
    customSections.push({
      id: 'cs_' + canonKey + '_' + Math.random().toString(36).slice(2, 8),
      title,
      placement: inferCustomSectionPlacement(canonKey, items),
      items,
    });
  }

  let resolvedLocation = locationMatch ? locationMatch[1].trim() : '';
  const contactSectionLines = [
    ...(sections['personal_details'] || []),
    ...(sections['header'] || []).slice(0, 12),
  ].map(normalizeParsedLine);
  const explicitLocationLine = contactSectionLines.find((line) =>
    line &&
    !/@/.test(line) &&
    !/\+?\d[\d\s().-]{6,}/.test(line) &&
    /,/.test(line) &&
    line.length <= 80
  );
  if (explicitLocationLine) {
    resolvedLocation = explicitLocationLine;
  }

  // If title wasn't found in header, try extracting from experience role or summary
  if (!title && experience.length > 0 && experience[0].role) {
    title = experience[0].role;
  }
  if (!title && summary) {
    const summaryTitleMatch = summary.match(/(?:experienced|skilled|senior|junior|lead)?\s*([\w\s]+(?:analyst|engineer|developer|designer|manager|consultant|specialist|architect|scientist|coordinator|director|administrator))/i);
    if (summaryTitleMatch) title = summaryTitleMatch[0].trim();
  }

  return {
    name,
    title: title || 'Professional',
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : '',
    location: resolvedLocation,
    linkedIn: linkedinMatch ? linkedinMatch[0] : '',
    summary: summary || 'Professional with relevant experience. Edit this summary to reflect your background.',
    experience,
    skills,
    education,
    certifications,
    customSections,
  };
}



