import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { DndContext, closestCenter, pointerWithin, PointerSensor, useSensor, useSensors, DragOverlay, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import A4Wrapper from '../components/A4Wrapper';
import DroppableColumn from '../components/DroppableColumn';
import DraggableSection from '../components/DraggableSection';
import EditableText from '../components/EditableText';
import ExpBlock from '../components/GroupedExpBlock';
import AddButton from '../components/AddButton';
import DeleteButton from '../components/DeleteButton';
import SkillsRenderer from '../components/SkillsRenderer';
import TemplatePanel from '../panels/TemplatePanel';
import PhotoPanel from '../panels/PhotoPanel';
import FontPanel from '../panels/FontPanel';
import ColorPanel from '../panels/ColorPanel';
import SectionPanel from '../panels/SectionStudioModalPanel';
import GlobalSettingsDrawer from '../panels/GlobalSettingsDrawer';
import EducationRenderer from '../components/EducationRenderer';
import CertificationsRenderer from '../components/CertificationsRenderer';
import SideSection from '../components/SideSection';
import MainSection from '../components/MainSection';
import generatePdf from '../utils/generatePdf';
import { isStructuredProjectSection } from '../utils/projectSections';
import { SectionActionsContext } from '../components/SectionActionsContext';

import ExecutiveNavy from '../templates/ExecutiveNavy';
import BoldCoral from '../templates/BoldCoral';
import DevTerminal from '../templates/DevTerminal';
import StrategistGold from '../templates/StrategistGold';
import CleanSlate from '../templates/CleanSlate';
import DesignerSlate from '../templates/DesignerSlate';

const TEMPLATE_MAP = {
  'executive-navy': ExecutiveNavy,
  'bold-coral': BoldCoral,
  'dev-terminal': DevTerminal,
  'strategist-gold': StrategistGold,
  'clean-slate': CleanSlate,
  'designer-slate': DesignerSlate,
};

const TEMPLATE_DEFAULTS = {
  'executive-navy': ExecutiveNavy.defaults,
  'bold-coral': BoldCoral.defaults,
  'dev-terminal': DevTerminal.defaults,
  'strategist-gold': StrategistGold.defaults,
  'clean-slate': CleanSlate.defaults,
  'designer-slate': DesignerSlate.defaults,
};

const NO_PHOTO = ['dev-terminal', 'clean-slate'];

// Sections that must always stay in the main content column (never sidebar)
const MAIN_ONLY_SECTIONS = ['summary', 'experience'];

// A4 page height in pixels (matches A4Wrapper)
const A4H = 1123;

// Structural layout metadata per template (used to replicate layout on additional pages)
const TEMPLATE_LAYOUTS = {
  'executive-navy':  { columns: 2, sidebarSide: 'left',  sidebarWidth: 240, sidebarBg: '#1B2A4A', sidebarColor: '#cbd5e1', mainPadding: '18px 24px 16px 24px', page2SectionGap: 2, page2SidebarSectionGap: 8 },
  'bold-coral':      { columns: 2, sidebarSide: 'right', sidebarFlex: 1,    mainFlex: 2, sidebarBg: 'transparent', sidebarBorder: true, sidebarColor: null, mainPadding: '0', sidebarPadding: '0 0 0 14px', bodyPadding: '18px var(--space-xl) 18px var(--space-xl)', bodyGap: 18, page2SectionGap: 6, page2SidebarSectionGap: 6 },
  'strategist-gold': { columns: 2, sidebarSide: 'right', sidebarFlex: 1.2,  mainFlex: 3, sidebarBg: '#f8f6f0',    sidebarRadius: 10,  sidebarColor: null, mainPadding: '0', sidebarPadding: '14px 18px', bodyPadding: '24px var(--space-xl) 24px var(--space-xl)', bodyGap: 24, page2SectionGap: 12, page2SidebarSectionGap: 12 },
  'dev-terminal':    { columns: 1, mainPadding: '36px 34px 28px 34px', defaultFont: "'JetBrains Mono',monospace", headingStyle: 'comment', bulletChar: '>', expBorderLeft: true, page2SectionGap: 12 },
  'clean-slate':     { columns: 1, mainPadding: '38px 38px 30px 38px', page2SectionGap: 12 },
  'designer-slate':  {
    columns: 2,
    sidebarSide: 'left',
    sidebarWidth: 280,
    sidebarBg: '#3E4456',
    sidebarColor: '#f5f7fb',
    bodyPadding: 0,
    sidebarPadding: '14px 20px 18px',
    mainPadding: '12px 34px 16px 34px',
    page2SectionGap: 2,
    page2SidebarSectionGap: 8,
    p2HeadingSize: 19,
    p2HeadingWeight: 800,
    p2HeadingLetterSpacing: '0.1em',
    p2HeadingTransform: 'capitalize',
    p2HeadingRuleColor: 'rgba(61, 68, 86, .55)',
    p2SidebarHeadingSize: 18,
    p2SidebarHeadingWeight: 800,
    p2SidebarHeadingLetterSpacing: '0.1em',
    p2SidebarHeadingTransform: 'capitalize',
    p2SidebarHeadingColor: '#f5f7fb',
    p2SidebarRuleColor: 'rgba(255,255,255,.7)',
  },
};

/**
 * Custom PointerSensor that ignores activation on editable elements.
 * Allows dragging from any non-text area of a sortable item.
 */
class BlockDragSensor extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown',
      handler: ({ nativeEvent: event }) => {
        const el = event.target;
        if (
          el?.isContentEditable ||
          el?.closest?.('[contenteditable="true"]') ||
          el?.tagName === 'INPUT' ||
          el?.tagName === 'TEXTAREA' ||
          el?.tagName === 'BUTTON' ||
          el?.closest?.('button')
        ) {
          return false;
        }
        return true;
      },
    },
  ];
}

export default function EditorPage({
  data, onEdit,
  template, setTemplate,
  photo, setPhoto,
  photoSettings, setPhotoSettings,
  photoShape, setPhotoShape,
  colors, setColors,
  globalFont, setGlobalFont,
  onReUpload,
  sectionOrder, setSectionOrder,
  sidebarOrder, setSidebarOrder,
  sectionLayout, setSectionLayout,
  extraPages, setExtraPages,
  pageLayoutModes, setPageLayoutModes,
  pageSidebarVisible, setPageSidebarVisible,
  skillStyle, setSkillStyle,
  contactStyle, setContactStyle,
  educationStyle, setEducationStyle,
  certificationStyle, setCertificationStyle,
  sectionLabels,
  hiddenSections = [],
  onAIRewrite,
  currentProjectName,
  workspaceProjects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDuplicateProject,
  onDeleteProject,
  onRenameProject,
  onExportProject,
  onImportProject,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  jobDescription,
  onJobDescriptionChange,
  atsReport,
  onGenerateCompanionDocs,
  coverLetter,
  onCoverLetterChange,
  linkedInSummary,
  onLinkedInSummaryChange,
  companionLoading,
}) {
  const [openPanel, setOpenPanel] = useState(null);
  const [globalSettingsOpen, setGlobalSettingsOpen] = useState(false);
  const toggle = (p) => setOpenPanel(prev => prev === p ? null : p);
  const [downloading, setDownloading] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(true);
  const [projectNameDraft, setProjectNameDraft] = useState(currentProjectName || '');
  const importInputRef = useRef(null);
  const handleRemoveSection = useCallback((sectionId) => {
    if (typeof sectionId !== 'string') return;
    if (sectionId.startsWith('cs_')) {
      onEdit('custom_section_del', { id: sectionId.slice(3) });
      return;
    }
    onEdit('section_hide', { sectionId });
  }, [onEdit]);

  useEffect(() => {
    setProjectNameDraft(currentProjectName || '');
  }, [currentProjectName]);
  const resumeQuality = useMemo(() => {
    const skillsCount = data?.skills?.filter(Boolean).length || 0;
    const experienceCount = data?.experience?.length || 0;
    const experienceBullets = (data?.experience || []).reduce((sum, item) => sum + (item?.bullets?.filter(Boolean).length || 0), 0);
    const educationCount = data?.education?.length || 0;
    const certificationsCount = data?.certifications?.filter(Boolean).length || 0;
    const hasSummary = !!data?.summary?.trim();
    const hasContact = [data?.email, data?.phone, data?.location].filter(Boolean).length >= 2;
    const customCount = data?.customSections?.reduce((sum, section) => sum + (section?.items?.filter(Boolean).length || 0), 0) || 0;

    const score = Math.min(
      100,
      (hasSummary ? 18 : 0) +
      (hasContact ? 14 : 0) +
      Math.min(experienceCount * 14, 28) +
      Math.min(experienceBullets * 3, 18) +
      Math.min(skillsCount * 2, 10) +
      Math.min(educationCount * 8, 8) +
      Math.min(certificationsCount * 4, 8) +
      Math.min(customCount * 2, 14)
    );

    const suggestions = [];
    if (!hasSummary) suggestions.push('Add a stronger profile summary.');
    if (experienceBullets < 6) suggestions.push('Expand impact bullets to improve recruiter scanability.');
    if (skillsCount < 6) suggestions.push('List more core skills for better ATS coverage.');
    if (!educationCount) suggestions.push('Add education for a more balanced layout.');
    if (!(data?.customSections?.length || 0)) suggestions.push('Use one extra section like Projects, Awards, or Languages.');

    return {
      score,
      label: score >= 86 ? 'Excellent' : score >= 72 ? 'Strong' : score >= 58 ? 'Good base' : 'Needs polish',
      suggestions: suggestions.slice(0, 3),
    };
  }, [data]);

  // ── dnd-kit: drag context for reordering + cross-column dragging ──
  const [activeDragId, setActiveDragId] = useState(null);
  const activeDragRef = useRef(null);
  const dragPointerRef = useRef(null);
  const dragEndTimeRef = useRef(0);       // timestamp of last drag end — used for auto-pagination cooldown
  const paginationRetryTimerRef = useRef(null);
  const [paginationTick, setPaginationTick] = useState(0);
  const lastDroppedSectionRef = useRef(null);
  const lastDropMetaRef = useRef(null);
  const [dragOverPage, setDragOverPage] = useState(null); // cross-page visual feedback: which page the pointer is over

  // Track individual experience items moved to pages 2+ (expId → pageNumber)
  const [expPageMap, setExpPageMap] = useState({});
  const [expGroupPageMap, setExpGroupPageMap] = useState({});
  const [expBulletPageMap, setExpBulletPageMap] = useState({});
  const [skillsPageMap, setSkillsPageMap] = useState({});
  const [educationPageMap, setEducationPageMap] = useState({});
  const [certPageMap, setCertPageMap] = useState({});
  const [customItemPageMap, setCustomItemPageMap] = useState({});

  const sensors = useSensors(
    useSensor(BlockDragSensor, { activationConstraint: { distance: 5 } })
  );

  const readClientPoint = useCallback((evt) => {
    const eventLike = evt?.nativeEvent || evt;
    if (!eventLike) return null;
    if (typeof eventLike.clientX === 'number' && typeof eventLike.clientY === 'number') {
      return { x: eventLike.clientX, y: eventLike.clientY };
    }
    const touch = eventLike.touches?.[0] || eventLike.changedTouches?.[0];
    if (touch && typeof touch.clientX === 'number' && typeof touch.clientY === 'number') {
      return { x: touch.clientX, y: touch.clientY };
    }
    return null;
  }, []);

  const updateDragPointer = useCallback((evt) => {
    const point = readClientPoint(evt);
    if (point) dragPointerRef.current = point;
  }, [readClientPoint]);

  useEffect(() => {
    if (!activeDragId) {
      dragPointerRef.current = null;
      return undefined;
    }

    const handlePointerMove = (evt) => updateDragPointer(evt);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      dragPointerRef.current = null;
    };
  }, [activeDragId, updateDragPointer]);

  // Helper: get sections assigned to a specific page, sorted by order
  const sectionsForPage = useCallback((pageNum) =>
    Object.entries(sectionLayout)
      .filter(([_, v]) => v.page === pageNum)
      .sort((a, b) => a[1].order - b[1].order)
      .map(([id]) => id),
    [sectionLayout]
  );

  // Helper: get sections for a page filtered by column
  const pageSectionsByColumn = useCallback((pageNum, column) =>
    sectionsForPage(pageNum).filter(id => (sectionLayout[id]?.column || 'main') === column),
    [sectionsForPage, sectionLayout]
  );

  // Stable drag IDs for individual experience items
  const expItemIds = useMemo(() =>
    data?.experience?.map(e => `exp-${e._id}`) || [],
    [data?.experience]
  );

  // Experience items per page
  const materializeExperienceForPage = useCallback((pageNum) => (
    (data?.experience || []).reduce((acc, exp) => {
      const basePage = expPageMap[exp._id] || 1;
      const groupedSections = Array.isArray(exp.sections) ? exp.sections : [];
      const flatBullets = Array.isArray(exp.bullets) ? exp.bullets : [];
      const visibleSections = groupedSections.filter((_, sectionIndex) => ((expGroupPageMap[`${exp._id}:group:${sectionIndex}`] || basePage) === pageNum));
      const visibleBullets = flatBullets.filter((_, bulletIndex) => ((expBulletPageMap[`${exp._id}:bullet:${bulletIndex}`] || basePage) === pageNum));

      if (basePage === pageNum || visibleSections.length > 0 || visibleBullets.length > 0) {
        acc.push({
          ...exp,
          sections: visibleSections,
          bullets: visibleBullets,
        });
      }
      return acc;
    }, [])
  ), [data?.experience, expBulletPageMap, expGroupPageMap, expPageMap]);

  const expForPage = useCallback((pageNum) => {
    return materializeExperienceForPage(pageNum);
  }, [materializeExperienceForPage]);

  const itemsForPage = useCallback((items = [], pageMap = {}, keyForIndex, pageNum = 1) =>
    items.filter((_, index) => ((pageMap[keyForIndex(index)] || 1) === pageNum)),
  []);

  const skillsForPage = useCallback((pageNum) =>
    itemsForPage(data?.skills || [], skillsPageMap, (index) => String(index), pageNum),
  [data?.skills, itemsForPage, skillsPageMap]);

  const educationForPage = useCallback((pageNum) =>
    itemsForPage(data?.education || [], educationPageMap, (index) => String(index), pageNum),
  [data?.education, educationPageMap, itemsForPage]);

  const certsForPage = useCallback((pageNum) =>
    itemsForPage(data?.certifications || [], certPageMap, (index) => String(index), pageNum),
  [data?.certifications, certPageMap, itemsForPage]);

  const customSectionItemsForPage = useCallback((section, pageNum) => {
    if (!section || isStructuredProjectSection(section)) return section?.items || [];
    return itemsForPage(section.items || [], customItemPageMap, (index) => `${section.id}:${index}`, pageNum);
  }, [customItemPageMap, itemsForPage]);

  const page1Experience = useMemo(() => expForPage(1), [expForPage]);
  const page1CustomSections = useMemo(() => (
    (data?.customSections || [])
      .map((section) => (
        isStructuredProjectSection(section)
          ? section
          : { ...section, items: customSectionItemsForPage(section, 1) }
      ))
      .filter((section) => isStructuredProjectSection(section) || (section.items || []).length > 0)
  ), [customSectionItemsForPage, data?.customSections]);
  const page1Data = useMemo(() => ({
    ...data,
    experience: page1Experience,
    skills: skillsForPage(1),
    education: educationForPage(1),
    certifications: certsForPage(1),
    customSections: page1CustomSections,
  }), [certsForPage, data, educationForPage, page1CustomSections, page1Experience, skillsForPage]);

  useEffect(() => {
    setExpGroupPageMap((prev) => Object.fromEntries(
      Object.entries(prev).filter(([key]) => {
        const [expId, type, index] = key.split(':');
        if (type !== 'group') return false;
        const exp = (data?.experience || []).find((entry) => entry._id === expId);
        return exp && Number(index) < ((exp.sections || []).length);
      })
    ));
    setExpBulletPageMap((prev) => Object.fromEntries(
      Object.entries(prev).filter(([key]) => {
        const [expId, type, index] = key.split(':');
        if (type !== 'bullet') return false;
        const exp = (data?.experience || []).find((entry) => entry._id === expId);
        return exp && Number(index) < ((exp.bullets || []).length);
      })
    ));
    setSkillsPageMap((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => Number(key) < (data?.skills?.length || 0))));
    setEducationPageMap((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => Number(key) < (data?.education?.length || 0))));
    setCertPageMap((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => Number(key) < (data?.certifications?.length || 0))));
    setCustomItemPageMap((prev) => Object.fromEntries(
      Object.entries(prev).filter(([key]) => {
        const [sectionId, itemIndex] = key.split(':');
        const section = (data?.customSections || []).find((entry) => entry.id === sectionId);
        return section && !isStructuredProjectSection(section) && Number(itemIndex) < (section.items?.length || 0);
      })
    ));
  }, [data?.certifications, data?.customSections, data?.education, data?.experience, data?.skills]);


  // Helper: ensure page N exists (usable from drag handlers and auto-pagination)
  const ensurePage = useCallback((n) => {
    if (extraPages < n - 1) {
      setExtraPages(n - 1);
    }
    setPageLayoutModes(prev => {
      if (prev[n]) return prev;
      return { ...prev, [n]: 'same-as-primary' };
    });
  }, [extraPages, setExtraPages, setPageLayoutModes]);

  // ── Column-aware auto-pagination: measure each column independently, cascade across pages ──
  const lastPagSigRef = useRef('');

  useEffect(() => {
    // Never run auto-pagination while a drag is in progress — it fights with drag handlers
    if (activeDragRef.current) return;
    // Freeze pagination while the user is actively editing text so sections don't jump mid-edit
    const activeEditor = document.querySelector('#resume-content [data-editing="true"], #resume-content [contenteditable="true"]:focus');
    if (activeEditor) return;
    // Cooldown: skip auto-pagination for 600ms after a drag ends so the user sees their drop result
    const cooldownRemaining = 600 - (Date.now() - dragEndTimeRef.current);
    if (cooldownRemaining > 0) {
      clearTimeout(paginationRetryTimerRef.current);
      paginationRetryTimerRef.current = setTimeout(() => {
        setPaginationTick(v => v + 1);
      }, cooldownRemaining + 10);
      return () => clearTimeout(paginationRetryTimerRef.current);
    }

    let raf1, raf2;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const page1 = document.getElementById('resume-content');
        if (!page1) return;

        const tplLayout = TEMPLATE_LAYOUTS[template];
        const isTwoCol = tplLayout?.columns === 2;

        // Signature to prevent infinite re-checks
        const sig = `${sectionOrder.join(',')}|${sidebarOrder.join(',')}|${JSON.stringify(expPageMap)}|${JSON.stringify(expGroupPageMap)}|${JSON.stringify(expBulletPageMap)}|${JSON.stringify(skillsPageMap)}|${JSON.stringify(educationPageMap)}|${JSON.stringify(certPageMap)}|${JSON.stringify(customItemPageMap)}|${data?.experience?.length}|${extraPages}|${JSON.stringify(sectionLayout)}`;
        if (sig === lastPagSigRef.current) return;

        // ensurePage is now defined outside this effect as a useCallback

        // Helper: move a section from page 1 to target page
        const moveSectionFromPage1 = (secId, targetPage) => {
          const inSide = sidebarOrder.includes(secId);
          setSectionOrder(prev => prev.filter(id => id !== secId));
          setSidebarOrder(prev => prev.filter(id => id !== secId));
          setSectionLayout(prev => {
            const targetCount = Object.values(prev).filter(v => v.page === targetPage).length;
            const col = inSide ? 'side' : (prev[secId]?.column || 'main');
            return { ...prev, [secId]: { ...prev[secId], page: targetPage, column: col, order: targetCount } };
          });
          ensurePage(targetPage);
        };

        // Helper: move a section from page N to page N+1
        const moveSectionToNextPage = (secId, fromPage) => {
          const nextPage = fromPage + 1;
          setSectionLayout(prev => {
            const nextCount = Object.values(prev).filter(v => v.page === nextPage).length;
            return { ...prev, [secId]: { ...prev[secId], page: nextPage, order: nextCount } };
          });
          ensurePage(nextPage);
        };

        const moveLastExperienceContentToPage = (fromPage, targetPage) => {
          const pageExp = materializeExperienceForPage(fromPage);
          if (!pageExp.length) return false;
          const lastExp = pageExp[pageExp.length - 1];
          const sourceExp = (data?.experience || []).find((entry) => entry._id === lastExp._id);
          if (!sourceExp) return false;

          const visibleGroups = (sourceExp.sections || [])
            .map((_, sectionIndex) => sectionIndex)
            .filter((sectionIndex) => ((expGroupPageMap[`${sourceExp._id}:group:${sectionIndex}`] || (expPageMap[sourceExp._id] || 1)) === fromPage));
          const visibleBullets = (sourceExp.bullets || [])
            .map((_, bulletIndex) => bulletIndex)
            .filter((bulletIndex) => ((expBulletPageMap[`${sourceExp._id}:bullet:${bulletIndex}`] || (expPageMap[sourceExp._id] || 1)) === fromPage));

          if (visibleBullets.length > 1) {
            const bulletIndex = visibleBullets[visibleBullets.length - 1];
            setExpBulletPageMap((prev) => ({ ...prev, [`${sourceExp._id}:bullet:${bulletIndex}`]: targetPage }));
            ensurePage(targetPage);
            return true;
          }
          if (visibleGroups.length > 1) {
            const groupIndex = visibleGroups[visibleGroups.length - 1];
            setExpGroupPageMap((prev) => ({ ...prev, [`${sourceExp._id}:group:${groupIndex}`]: targetPage }));
            ensurePage(targetPage);
            return true;
          }
          if (visibleGroups.length > 0 && visibleBullets.length > 0) {
            const bulletIndex = visibleBullets[visibleBullets.length - 1];
            setExpBulletPageMap((prev) => ({ ...prev, [`${sourceExp._id}:bullet:${bulletIndex}`]: targetPage }));
            ensurePage(targetPage);
            return true;
          }
          return false;
        };

        const moveSplitItemForSection = (secId, fromPage, targetPage) => {
          if (secId === 'skills') {
            const visible = (data?.skills || []).map((_, index) => index).filter((index) => ((skillsPageMap[String(index)] || 1) === fromPage));
            if (visible.length <= 1) return false;
            setSkillsPageMap((prev) => ({ ...prev, [String(visible[visible.length - 1])]: targetPage }));
            ensurePage(targetPage);
            return true;
          }
          if (secId === 'education') {
            const visible = (data?.education || []).map((_, index) => index).filter((index) => ((educationPageMap[String(index)] || 1) === fromPage));
            if (visible.length <= 1) return false;
            setEducationPageMap((prev) => ({ ...prev, [String(visible[visible.length - 1])]: targetPage }));
            ensurePage(targetPage);
            return true;
          }
          if (secId === 'certifications') {
            const visible = (data?.certifications || []).map((_, index) => index).filter((index) => ((certPageMap[String(index)] || 1) === fromPage));
            if (visible.length <= 1) return false;
            setCertPageMap((prev) => ({ ...prev, [String(visible[visible.length - 1])]: targetPage }));
            ensurePage(targetPage);
            return true;
          }
          if (typeof secId === 'string' && secId.startsWith('cs_')) {
            const section = (data?.customSections || []).find((entry) => `cs_${entry.id}` === secId);
            if (!section || isStructuredProjectSection(section)) return false;
            const visible = (section.items || []).map((_, index) => index).filter((index) => ((customItemPageMap[`${section.id}:${index}`] || 1) === fromPage));
            if (visible.length <= 1) return false;
            setCustomItemPageMap((prev) => ({ ...prev, [`${section.id}:${visible[visible.length - 1]}`]: targetPage }));
            ensurePage(targetPage);
            return true;
          }
          return false;
        };

        // ── PAGE 1 overflow ──
        let mainOverflows = false;
        let sideOverflows = false;

        if (isTwoCol) {
          const mainCol = document.getElementById('column-main');
          const sideCol = document.getElementById('column-side');
          const measureNatural = (col) => {
            if (!col) return 0;
            const orig = col.style.alignSelf;
            const origHeight = col.style.height;
            const origMinHeight = col.style.minHeight;
            const origOverflow = col.style.overflow;
            col.style.alignSelf = 'flex-start';
            col.style.height = 'auto';
            col.style.minHeight = 'auto';
            col.style.overflow = 'visible';
            const h = Math.max(col.scrollHeight, col.offsetHeight);
            col.style.alignSelf = orig;
            col.style.height = origHeight;
            col.style.minHeight = origMinHeight;
            col.style.overflow = origOverflow;
            return h;
          };
          const getAvailable = (col) => {
            if (!col) return A4H;
            let top = 0, el = col;
            while (el && el !== page1) { top += el.offsetTop; el = el.offsetParent; }
            return A4H - top;
          };
          mainOverflows = measureNatural(mainCol) > getAvailable(mainCol) + 5;
          sideOverflows = measureNatural(sideCol) > getAvailable(sideCol) + 5;
        } else {
          page1.style.overflow = 'hidden';
          const contentH = page1.scrollHeight;
          page1.style.overflow = '';
          mainOverflows = contentH > A4H + 5;
        }

        if (mainOverflows) {
          if (sectionOrder[0] === 'summary' && sectionOrder.includes('experience') && moveLastExperienceContentToPage(1, 2)) {
            lastDroppedSectionRef.current = null;
            lastDropMetaRef.current = null;
            return;
          }
          const splitMainCandidates = [...sectionOrder].reverse().filter((secId) => secId !== 'experience');
          for (const secId of splitMainCandidates) {
            if (moveSplitItemForSection(secId, 1, 2)) {
              lastDroppedSectionRef.current = null;
              lastDropMetaRef.current = null;
              return;
            }
          }
          const droppedMainSection = lastDroppedSectionRef.current;
          const protectedPage1MainSection =
            lastDropMetaRef.current?.toPage === 1 &&
            lastDropMetaRef.current?.fromPage >= 2
              ? droppedMainSection
              : null;
          if (
            droppedMainSection &&
            typeof droppedMainSection === 'string' &&
            sectionOrder.includes(droppedMainSection) &&
            droppedMainSection !== 'experience' &&
            !protectedPage1MainSection
          ) {
            moveSectionFromPage1(droppedMainSection, 2);
            lastDroppedSectionRef.current = null;
            lastDropMetaRef.current = null;
            return;
          }

          const p1Exp = (data?.experience || []).filter(e => !expPageMap[e._id]);
          if (p1Exp.length > 1) {
            setExpPageMap(prev => ({ ...prev, [p1Exp[p1Exp.length - 1]._id]: 2 }));
            ensurePage(2);
            lastDroppedSectionRef.current = null;
            lastDropMetaRef.current = null;
            return;
          }
          const mainMovable = ['certifications', 'education', 'skills'];
          for (const secId of mainMovable) {
            if (secId !== protectedPage1MainSection && sectionOrder.includes(secId)) { moveSectionFromPage1(secId, 2); lastDroppedSectionRef.current = null; lastDropMetaRef.current = null; return; }
          }
          const csMain = sectionOrder.filter(id => typeof id === 'string' && id.startsWith('cs_') && id !== protectedPage1MainSection);
          if (csMain.length > 0) { moveSectionFromPage1(csMain[csMain.length - 1], 2); lastDroppedSectionRef.current = null; lastDropMetaRef.current = null; return; }
          if (!isTwoCol) {
            for (const secId of mainMovable) {
              if (secId !== protectedPage1MainSection && sidebarOrder.includes(secId)) { moveSectionFromPage1(secId, 2); lastDroppedSectionRef.current = null; lastDropMetaRef.current = null; return; }
            }
            const csSide = sidebarOrder.filter(id => typeof id === 'string' && id.startsWith('cs_') && id !== protectedPage1MainSection);
            if (csSide.length > 0) { moveSectionFromPage1(csSide[csSide.length - 1], 2); lastDroppedSectionRef.current = null; lastDropMetaRef.current = null; return; }
          }
          const fallbackMainSection = [...sectionOrder].reverse().find(id => id !== 'experience' && id !== protectedPage1MainSection);
          if (fallbackMainSection) {
            moveSectionFromPage1(fallbackMainSection, 2);
            lastDroppedSectionRef.current = null;
            lastDropMetaRef.current = null;
            return;
          }
        }

        if (sideOverflows && isTwoCol) {
          const splitSideCandidates = [...sidebarOrder].reverse();
          for (const secId of splitSideCandidates) {
            if (moveSplitItemForSection(secId, 1, 2)) {
              lastDroppedSectionRef.current = null;
              lastDropMetaRef.current = null;
              return;
            }
          }
          const droppedSideSection = lastDroppedSectionRef.current;
          const protectedPage1SideSection =
            lastDropMetaRef.current?.toPage === 1 &&
            lastDropMetaRef.current?.fromPage >= 2
              ? droppedSideSection
              : null;
          if (
            droppedSideSection &&
            typeof droppedSideSection === 'string' &&
            sidebarOrder.includes(droppedSideSection) &&
            !protectedPage1SideSection
          ) {
            moveSectionFromPage1(droppedSideSection, 2);
            lastDroppedSectionRef.current = null;
            lastDropMetaRef.current = null;
            return;
          }

          const isPinnedSidebarCustom = (id) =>
            typeof id === 'string' &&
            (id.startsWith('cs_contact_details_') || id.startsWith('cs_personal_details_') || id.startsWith('cs_references_'));

          const csSideMovable = sidebarOrder.filter(
            id => typeof id === 'string' && id.startsWith('cs_') && !isPinnedSidebarCustom(id) && id !== protectedPage1SideSection
          );
          if (csSideMovable.length > 0) { moveSectionFromPage1(csSideMovable[csSideMovable.length - 1], 2); lastDroppedSectionRef.current = null; lastDropMetaRef.current = null; return; }

          const sideMovable = ['certifications', 'education', 'skills'];
          for (const secId of sideMovable) {
            if (secId !== protectedPage1SideSection && sidebarOrder.includes(secId)) { moveSectionFromPage1(secId, 2); lastDroppedSectionRef.current = null; lastDropMetaRef.current = null; return; }
          }

          const csSidePinned = sidebarOrder.filter(id => isPinnedSidebarCustom(id) && id !== protectedPage1SideSection);
          if (csSidePinned.length > 0) { moveSectionFromPage1(csSidePinned[csSidePinned.length - 1], 2); lastDroppedSectionRef.current = null; lastDropMetaRef.current = null; return; }
        }

        // ── PAGES 2+ overflow cascade ──
        const totalPages = 1 + extraPages;
        for (let pageNum = 2; pageNum <= totalPages; pageNum++) {
          const pageEl = document.getElementById(`resume-page-${pageNum}`);
          if (!pageEl) continue;
          const nextPage = pageNum + 1;
          const layoutMode = pageLayoutModes[pageNum] || 'same-as-primary';

          if (isTwoCol && layoutMode === 'same-as-primary') {
            const mainCol = document.getElementById(`page-${pageNum}-main`);
            const sideCol = document.getElementById(`page-${pageNum}-side`);
            const measureNatural = (col) => {
              if (!col) return 0;
              const orig = col.style.alignSelf;
              const origHeight = col.style.height;
              const origMinHeight = col.style.minHeight;
              const origOverflow = col.style.overflow;
              col.style.alignSelf = 'flex-start';
              col.style.height = 'auto';
              col.style.minHeight = 'auto';
              col.style.overflow = 'visible';
              const h = Math.max(col.scrollHeight, col.offsetHeight);
              col.style.alignSelf = orig;
              col.style.height = origHeight;
              col.style.minHeight = origMinHeight;
              col.style.overflow = origOverflow;
              return h;
            };
            const getAvailable = (col) => {
              if (!col) return A4H;
              let top = 0, el = col;
              while (el && el !== pageEl) { top += el.offsetTop; el = el.offsetParent; }
              return A4H - top;
            };

            const mainOverflow = measureNatural(mainCol) > getAvailable(mainCol) + 5;
            const sideOverflow = measureNatural(sideCol) > getAvailable(sideCol) + 5;
            if (!mainOverflow && !sideOverflow) continue;

            if (mainOverflow) {
              if (moveLastExperienceContentToPage(pageNum, nextPage)) {
                lastDroppedSectionRef.current = null;
                lastDropMetaRef.current = null;
                return;
              }
              const splitMainCandidates = Object.entries(sectionLayout)
                .filter(([id, v]) => v.page <= pageNum && (v.column || 'main') === 'main')
                .sort((a, b) => a[1].order - b[1].order)
                .map(([id]) => id)
                .reverse();
              for (const secId of splitMainCandidates) {
                if (moveSplitItemForSection(secId, pageNum, nextPage)) {
                  lastDroppedSectionRef.current = null;
                  lastDropMetaRef.current = null;
                  return;
                }
              }
              const pageMainSecs = Object.entries(sectionLayout)
                .filter(([_, v]) => v.page === pageNum && (v.column || 'main') === 'main')
                .sort((a, b) => a[1].order - b[1].order);
              const droppedSectionId = lastDroppedSectionRef.current;
              if (
                droppedSectionId &&
                typeof droppedSectionId === 'string' &&
                sectionLayout[droppedSectionId]?.page === pageNum &&
                (sectionLayout[droppedSectionId]?.column || 'main') === 'main' &&
                droppedSectionId !== 'experience' &&
                pageMainSecs.length > 1
              ) {
                moveSectionToNextPage(droppedSectionId, pageNum);
                lastDroppedSectionRef.current = null;
                lastDropMetaRef.current = null;
                return;
              }

              const pageExp = (data?.experience || []).filter(e => (expPageMap[e._id] || 1) === pageNum);
              if (pageExp.length > 1) {
                setExpPageMap(prev => ({ ...prev, [pageExp[pageExp.length - 1]._id]: nextPage }));
                ensurePage(nextPage);
                lastDroppedSectionRef.current = null;
                lastDropMetaRef.current = null;
                return;
              }

              if (pageMainSecs.length > 1) {
                moveSectionToNextPage(pageMainSecs[pageMainSecs.length - 1][0], pageNum);
                lastDroppedSectionRef.current = null;
                lastDropMetaRef.current = null;
                return;
              }
            }

            if (sideOverflow) {
              const splitSideCandidates = Object.entries(sectionLayout)
                .filter(([id, v]) => v.page <= pageNum && v.column === 'side')
                .sort((a, b) => a[1].order - b[1].order)
                .map(([id]) => id)
                .reverse();
              for (const secId of splitSideCandidates) {
                if (moveSplitItemForSection(secId, pageNum, nextPage)) {
                  lastDroppedSectionRef.current = null;
                  lastDropMetaRef.current = null;
                  return;
                }
              }
              const pageSideSecs = Object.entries(sectionLayout)
                .filter(([_, v]) => v.page === pageNum && v.column === 'side')
                .sort((a, b) => a[1].order - b[1].order)
                .map(([id]) => id);
              const droppedSectionId = lastDroppedSectionRef.current;
              if (
                droppedSectionId &&
                typeof droppedSectionId === 'string' &&
                sectionLayout[droppedSectionId]?.page === pageNum &&
                sectionLayout[droppedSectionId]?.column === 'side' &&
                pageSideSecs.length > 1
              ) {
                moveSectionToNextPage(droppedSectionId, pageNum);
                lastDroppedSectionRef.current = null;
                lastDropMetaRef.current = null;
                return;
              }

              const isPinnedSidebarCustom = (id) =>
                typeof id === 'string' &&
                (id.startsWith('cs_contact_details_') || id.startsWith('cs_personal_details_') || id.startsWith('cs_references_'));
              const movableCustom = pageSideSecs.filter(id => typeof id === 'string' && id.startsWith('cs_') && !isPinnedSidebarCustom(id));
              if (pageSideSecs.length > 1 && movableCustom.length > 0) {
                moveSectionToNextPage(movableCustom[movableCustom.length - 1], pageNum);
                lastDroppedSectionRef.current = null;
                lastDropMetaRef.current = null;
                return;
              }
              const preferredOrder = ['certifications', 'education', 'skills'];
              for (const secId of preferredOrder) {
                if (pageSideSecs.length > 1 && pageSideSecs.includes(secId)) {
                  moveSectionToNextPage(secId, pageNum);
                  lastDroppedSectionRef.current = null;
                  lastDropMetaRef.current = null;
                  return;
                }
              }
              const pinnedCustom = pageSideSecs.filter(id => isPinnedSidebarCustom(id));
              if (pageSideSecs.length > 1 && pinnedCustom.length > 0) {
                moveSectionToNextPage(pinnedCustom[pinnedCustom.length - 1], pageNum);
                lastDroppedSectionRef.current = null;
                lastDropMetaRef.current = null;
                return;
              }
            }
            continue;
          }

          // Measure overflow for full-width / single-column pages
          pageEl.style.overflow = 'hidden';
          const contentH = pageEl.scrollHeight;
          pageEl.style.overflow = '';
          if (contentH <= A4H + 5) continue;

          // This page overflows — move last item to next page
          const droppedSectionId = lastDroppedSectionRef.current;
          if (moveLastExperienceContentToPage(pageNum, nextPage)) {
            lastDroppedSectionRef.current = null;
            lastDropMetaRef.current = null;
            return;
          }
          const splitCandidates = Object.entries(sectionLayout)
            .filter(([id, v]) => v.page <= pageNum && (v.column || 'main') === 'main')
            .sort((a, b) => a[1].order - b[1].order)
            .map(([id]) => id)
            .reverse();
          for (const secId of splitCandidates) {
            if (moveSplitItemForSection(secId, pageNum, nextPage)) {
              lastDroppedSectionRef.current = null;
              lastDropMetaRef.current = null;
              return;
            }
          }

          // Move experience items from this page bottom-up
          const pageExp = (data?.experience || []).filter(e => (expPageMap[e._id] || 1) === pageNum);
          if (pageExp.length > 1) {
            setExpPageMap(prev => ({ ...prev, [pageExp[pageExp.length - 1]._id]: nextPage }));
            ensurePage(nextPage);
            lastDroppedSectionRef.current = null;
            lastDropMetaRef.current = null;
            return;
          }

          // Move last section from this page to next
          const pageSecs = Object.entries(sectionLayout)
            .filter(([_, v]) => v.page === pageNum)
            .sort((a, b) => a[1].order - b[1].order);
          if (
            droppedSectionId &&
            typeof droppedSectionId === 'string' &&
            sectionLayout[droppedSectionId]?.page === pageNum &&
            pageSecs.length > 1
          ) {
            moveSectionToNextPage(droppedSectionId, pageNum);
            lastDroppedSectionRef.current = null;
            lastDropMetaRef.current = null;
            return;
          }
          if (pageSecs.length > 1) {
            moveSectionToNextPage(pageSecs[pageSecs.length - 1][0], pageNum);
            lastDroppedSectionRef.current = null;
            return;
          }
        }

        // Nothing left to move — record signature
        lastDroppedSectionRef.current = null;
        lastPagSigRef.current = sig;
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(paginationRetryTimerRef.current);
    };
  }, [data, expPageMap, expGroupPageMap, expBulletPageMap, skillsPageMap, educationPageMap, certPageMap, customItemPageMap, extraPages, sectionOrder, sidebarOrder, sectionLayout, template, ensurePage, paginationTick, materializeExperienceForPage]);

  // ── Sync custom section IDs into sectionOrder / sidebarOrder ──
  // Custom sections use `cs_{id}` as drag IDs so they participate in SortableContext
  const customSections = data?.customSections || [];

  useEffect(() => {
    // Exclude cs_ IDs that are currently on pages 2+ (tracked in sectionLayout)
    const onLaterPages = new Set(
      Object.entries(sectionLayout).filter(([_, v]) => v.page >= 2).map(([id]) => id)
    );
    const csMainIds = customSections
      .filter(s => (s.placement || 'main') === 'main')
      .map(s => `cs_${s.id}`)
      .filter(id => !onLaterPages.has(id));
    const csSideIds = customSections
      .filter(s => s.placement === 'side')
      .map(s => `cs_${s.id}`)
      .filter(id => !onLaterPages.has(id));

    // Add any missing custom section IDs to the appropriate order array
    setSectionOrder(prev => {
      // Remove stale cs_ IDs no longer in customSections or moved to later pages
      const cleaned = prev.filter(id => !id.startsWith('cs_') || csMainIds.includes(id));
      const missing = csMainIds.filter(id => !cleaned.includes(id));
      if (missing.length === 0 && cleaned.length === prev.length) return prev;
      return [...cleaned, ...missing];
    });
    setSidebarOrder(prev => {
      const cleaned = prev.filter(id => !id.startsWith('cs_') || csSideIds.includes(id));
      const missing = csSideIds.filter(id => !cleaned.includes(id));
      if (missing.length === 0 && cleaned.length === prev.length) return prev;
      return [...cleaned, ...missing];
    });

    // Sync sectionLayout column for page 2+ sections when their data placement changes
    customSections.forEach(s => {
      const dragId = `cs_${s.id}`;
      const layout = sectionLayout[dragId];
      if (layout && layout.page >= 2) {
        const dataPlacement = s.placement || 'main';
        if (layout.column !== dataPlacement) {
          setSectionLayout(prev => ({
            ...prev,
            [dragId]: { ...prev[dragId], column: dataPlacement },
          }));
        }
      }
    });
  }, [customSections, sectionLayout]);

  // Helper to find a custom section by its drag ID (cs_xxx)
  const findCustomSection = useCallback((dragId) => {
    if (typeof dragId !== 'string' || !dragId.startsWith('cs_')) return null;
    const secId = dragId.slice(3);
    return customSections.find(s => s.id === secId) || null;
  }, [customSections]);

  // Parse a container string into { page, column } or null
  const parseContainer = useCallback((c) => {
    if (!c) return null;
    if (c === 'main' || c === 'column-main') return { page: 1, column: 'main' };
    if (c === 'side' || c === 'column-side') return { page: 1, column: 'side' };
    // Match page-N-main, page-N-side, page-N-drop
    const m = typeof c === 'string' && c.match(/^page-(\d+)-(main|side|drop)$/);
    if (m) return { page: parseInt(m[1]), column: m[2] === 'side' ? 'side' : 'main' };
    return null;
  }, []);

  // Find which column (container) a section ID belongs to
  const findContainer = useCallback((id) => {
    // Experience item — check which page it's on
    if (typeof id === 'string' && id.startsWith('exp-')) {
      const expId = id.slice(4);
      const expPage = expPageMap[expId];
      if (expPage) {
        return `page-${expPage}-main`;
      }
      if (sectionOrder.includes('experience')) return 'main';
      if (sidebarOrder.includes('experience')) return 'side';
      const expLayout = sectionLayout.experience;
      if (expLayout?.page >= 2) return `page-${expLayout.page}-main`;
      return 'main';
    }
    // Check sectionLayout for page 2+ FIRST — sections may still be in sectionOrder/sidebarOrder
    // after auto-pagination moves them, so sectionLayout is the source of truth for page assignment
    const layout = sectionLayout[id];
    if (layout?.page >= 2) {
      return `page-${layout.page}-${layout.column === 'side' ? 'side' : 'main'}`;
    }
    if (sectionOrder.includes(id)) return 'main';
    if (sidebarOrder.includes(id)) return 'side';
    // Check if it's a droppable column container ID
    if (id === 'column-main') return 'main';
    if (id === 'column-side') return 'side';
    // Page N droppable containers
    if (typeof id === 'string' && /^page-\d+-(main|side|drop)$/.test(id)) {
      return id.replace('-drop', '-main');
    }
    return null;
  }, [sectionOrder, sidebarOrder, sectionLayout, expPageMap]);

  const handleDragStart = useCallback((event) => {
    setActiveDragId(event.active.id);
    activeDragRef.current = event.active.id;
    updateDragPointer(event?.activatorEvent);
  }, [updateDragPointer]);

  // ── Fix C: Scoped collision detection ──
  // Wraps closestCenter but filters droppable targets to keep section-level collision
  // scoped to the same page (preventing mid-drag jumps), while allowing cross-page
  // container-level droppables (page-N-drop, page-N-main, page-N-side) so that
  // DroppableColumn's `isOver` highlight gives the user visual feedback when dragging
  // toward a different page.
  const scopedCollision = useCallback((args) => {
    const { active, droppableContainers, ...rest } = args;
    if (!active || !droppableContainers || droppableContainers.length === 0) {
      return closestCenter(args);
    }

    // Determine which page the active item is on
    const activeContainerStr = findContainer(active.id);
    const activeParsed = parseContainer(activeContainerStr);
    const activePage = activeParsed?.page || 1;

    // Filter: keep same-page targets + cross-page CONTAINER droppables (for visual feedback)
    const filtered = droppableContainers.filter((container) => {
      const cId = container.id;

      // Always allow page-level container droppables, including page 1 root columns.
      // Section-level targets still stay scoped to the active page below.
      if (typeof cId === 'string' && /^page-\d+-(drop|main|side)$/.test(cId)) return true;
      if (cId === 'column-main' || cId === 'column-side') return true;

      // For section-level droppables, restrict to same page
      const containerStr = findContainer(cId);
      const parsed = parseContainer(containerStr);
      if (parsed) return parsed.page === activePage;

      const directParsed = parseContainer(cId);
      if (directParsed) return directParsed.page === activePage;

      return true;
    });

    const targets = filtered.length > 0 ? filtered : droppableContainers;
    const pointerHits = pointerWithin({ ...rest, active, droppableContainers: targets });
    if (pointerHits.length > 0) return pointerHits;
    return closestCenter({ ...rest, active, droppableContainers: targets });
  }, [findContainer, parseContainer]);

  // Rebuild sectionLayout from the order arrays (keeps page assignments stable)
  const syncLayout = useCallback((mainArr, sideArr) => {
    setSectionLayout(prev => {
      const next = { ...prev };
      mainArr.forEach((id, i) => {
        const existing = next[id] || {};
        next[id] = { ...existing, column: 'main', order: i, page: 1 };
      });
      sideArr.forEach((id, i) => {
        const existing = next[id] || {};
        next[id] = { ...existing, column: 'side', order: i, page: 1 };
      });
      return next;
    });
  }, [setSectionLayout]);

  // ── Helper: determine insertion offset based on pointer position relative to target center ──
  // Returns 0 (insert before) or 1 (insert after) depending on whether
  // the dragged element is above or below the target's vertical center.
  const getInsertionOffset = useCallback((event) => {
    const { active, over } = event;
    if (!over?.rect || !active?.rect?.current?.translated) return 0;
    const activeCenterY = active.rect.current.translated.top + active.rect.current.translated.height / 2;
    const overCenterY = over.rect.top + over.rect.height / 2;
    return activeCenterY > overCenterY ? 1 : 0;
  }, []);

  const resolveDropTargetFromPoint = useCallback((event, fallbackId) => {
    if (typeof document === 'undefined') return fallbackId;
    const pointerPoint = dragPointerRef.current;
    const translated = event?.active?.rect?.current?.translated;
    const x = typeof pointerPoint?.x === 'number'
      ? pointerPoint.x
      : translated
        ? translated.left + translated.width / 2
        : null;
    const y = typeof pointerPoint?.y === 'number'
      ? pointerPoint.y
      : translated
        ? translated.top + translated.height / 2
        : null;
    if (typeof x !== 'number' || typeof y !== 'number') return fallbackId;

    const stack = document.elementsFromPoint(x, y);

    for (const el of stack) {
      let node = el;
      while (node) {
        if (node.dataset?.sectionId && node.dataset.sectionId !== event?.active?.id) {
          return node.dataset.sectionId;
        }
        if (node.id && (node.id === 'column-main' || node.id === 'column-side' || /^page-\d+-(drop|main|side)$/.test(node.id))) {
          return node.id;
        }
        node = node.parentElement;
      }
    }

    return fallbackId;
  }, []);

  // ── handleDragOver: ONLY same-page cross-column moves (for visual feedback during drag) ──
  // All cross-page moves are deferred to handleDragEnd to prevent mid-drag jumps.
  const handleDragOver = useCallback((event) => {
    const { active, over } = event;
    if (!over) { setDragOverPage(prev => prev === null ? prev : null); return; }

    // Experience items: no cross-container handling during drag — defer to handleDragEnd
    if (typeof active.id === 'string' && active.id.startsWith('exp-')) return;

    // Resolve over.id: if over is an exp-* item and active is a section, use 'experience'
    const effectiveOverId = (typeof over.id === 'string' && over.id.startsWith('exp-'))
      ? 'experience' : over.id;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(effectiveOverId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      setDragOverPage(prev => prev === null ? prev : null);
      return;
    }

    const activeParsed = parseContainer(activeContainer);
    const overParsed = parseContainer(overContainer);
    if (!activeParsed || !overParsed) return;

    // ── BLOCK all cross-page moves during drag — they cause mid-drag jumps ──
    // But track the target page for visual feedback (drop zone highlighting)
    if (activeParsed.page !== overParsed.page) {
      setDragOverPage(prev => prev === overParsed.page ? prev : overParsed.page);
      return;
    }
    setDragOverPage(prev => prev === null ? prev : null);

    // ── Cross-column within same page N (N >= 2) ──
    if (activeParsed.page >= 2 && activeParsed.column !== overParsed.column) {
      const newCol = overParsed.column;
      setSectionLayout(prev => ({
        ...prev,
        [active.id]: { ...prev[active.id], column: newCol },
      }));
      if (typeof active.id === 'string' && active.id.startsWith('cs_')) {
        onEdit('custom_section_placement', { id: active.id.slice(3), placement: newCol });
      }
      return;
    }

    // ── Cross-column within page 1 ──
    if (activeParsed.page === 1 &&
        (activeContainer === 'main' || activeContainer === 'side') &&
        (overContainer === 'main' || overContainer === 'side') &&
        activeContainer !== overContainer) {
      const isTwoCol = (TEMPLATE_LAYOUTS[template]?.columns || 1) === 2;

      // Block main-only sections from being dragged to sidebar in 2-column templates
      if (isTwoCol && activeContainer === 'main' && overContainer === 'side' && MAIN_ONLY_SECTIONS.includes(active.id)) {
        return;
      }

      const setFrom = activeContainer === 'main' ? setSectionOrder : setSidebarOrder;
      const setTo = activeContainer === 'main' ? setSidebarOrder : setSectionOrder;

      setFrom(prev => prev.filter(id => id !== active.id));

      setTo(prev => {
        if (prev.includes(active.id)) return prev;
        const overIndex = prev.indexOf(effectiveOverId);
        const insertAt = overIndex >= 0 ? overIndex : prev.length;
        const next = [...prev];
        next.splice(insertAt, 0, active.id);
        return next;
      });

      if (typeof active.id === 'string' && active.id.startsWith('cs_')) {
        const newPlacement = overContainer === 'side' ? 'side' : 'main';
        onEdit('custom_section_placement', { id: active.id.slice(3), placement: newPlacement });
      }
    }
  }, [findContainer, parseContainer, setSectionOrder, setSidebarOrder, setSectionLayout, onEdit, template]);

  // ── Helper: resolve over.id so section-level reordering always uses a section ID ──
  // When dragging a SECTION, the over target might be an exp-* item (nested sortable)
  // or a container ID (droppable column). Map those to usable section IDs.
  const resolveOverForSection = useCallback((overId) => {
    if (typeof overId === 'string' && overId.startsWith('exp-')) return 'experience';
    return overId;
  }, []);

  const isContainerId = useCallback((id) => {
    if (typeof id !== 'string') return false;
    return id === 'column-main' || id === 'column-side' || /^page-\d+-(drop|main|side)$/.test(id);
  }, []);

  const placeSectionOnPage = useCallback((sectionId, page, column, overId, insertAfter = false) => {
    setSectionLayout(prev => {
      const next = { ...prev };
      const siblingIds = Object.entries(next)
        .filter(([id, v]) => id !== sectionId && v.page === page && (v.column || 'main') === column)
        .sort((a, b) => a[1].order - b[1].order)
        .map(([id]) => id);

      let insertAt = siblingIds.length;
      if (overId && !isContainerId(overId) && siblingIds.includes(overId)) {
        insertAt = siblingIds.indexOf(overId) + (insertAfter ? 1 : 0);
      }

      const ordered = [...siblingIds];
      ordered.splice(insertAt, 0, sectionId);
      ordered.forEach((id, index) => {
        next[id] = { ...(next[id] || {}), page, column, order: index };
      });
      return next;
    });
  }, [isContainerId, setSectionLayout]);

  // ── handleDragEnd: all placement decisions happen here (on drop) ──
  // Cross-page moves, cross-column reorder, within-column reorder — all deterministic on drop.
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveDragId(null);
    activeDragRef.current = null;
    dragEndTimeRef.current = Date.now();
    setDragOverPage(null);

    // ── Experience item: cross-page + same-page reorder ──
    if (typeof active.id === 'string' && active.id.startsWith('exp-')) {
      if (!over || active.id === over.id) return;

      const activeContainer = findContainer(active.id);
      const overContainer = findContainer(over.id);
      if (!activeContainer || !overContainer) return;

      const activeParsed = parseContainer(activeContainer);
      const overParsed = parseContainer(overContainer);

      // Cross-page exp move (deferred from handleDragOver)
      if (activeParsed?.page !== overParsed?.page) {
        const expId = active.id.slice(4);
        if (overParsed.page === 1) {
          setExpPageMap(prev => { const next = { ...prev }; delete next[expId]; return next; });
        } else {
          setExpPageMap(prev => ({ ...prev, [expId]: overParsed.page }));
          ensurePage(overParsed.page);
        }
        return;
      }

      // Same-page reorder between two exp items
      if (activeContainer === overContainer && typeof over.id === 'string' && over.id.startsWith('exp-')) {
        const fromId = active.id.slice(4);
        const toId = over.id.slice(4);
        const fromIdx = data?.experience?.findIndex(e => e._id === fromId);
        const toIdx = data?.experience?.findIndex(e => e._id === toId);
        if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
          onEdit('exp_reorder', { from: fromIdx, to: toIdx });
        }
      }
      return;
    }

    const rawDropTargetId = resolveDropTargetFromPoint(event, over?.id || null);
    if (!rawDropTargetId || active.id === rawDropTargetId) {
      lastDroppedSectionRef.current = null;
      lastDropMetaRef.current = null;
      syncLayout(sectionOrder, sidebarOrder);
      return;
    }

    // Resolve over.id: exp-* → 'experience', container IDs stay as-is for special handling
    const resolvedOver = resolveOverForSection(rawDropTargetId);
    const isOverContainer = isContainerId(rawDropTargetId);

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(resolvedOver);

    if (!activeContainer || !overContainer) {
      lastDropMetaRef.current = null;
      return;
    }

    const activeParsed = parseContainer(activeContainer);
    const overParsed = parseContainer(overContainer);
    if (!activeParsed || !overParsed) {
      lastDropMetaRef.current = null;
      syncLayout(sectionOrder, sidebarOrder);
      return;
    }

    // ── Helper: update custom section placement metadata ──
    const updateCSPlacement = (placement) => {
      if (typeof active.id === 'string' && active.id.startsWith('cs_')) {
        onEdit('custom_section_placement', { id: active.id.slice(3), placement });
      }
    };

    // ══════════════════════════════════════════════════════════
    // CROSS-PAGE MOVES (deferred from handleDragOver for stability)
    // ══════════════════════════════════════════════════════════
    if (activeParsed.page !== overParsed.page) {

      // ── page 1 → page N (N >= 2) ──
      if (activeParsed.page === 1 && overParsed.page >= 2) {
        lastDroppedSectionRef.current = active.id;
        lastDropMetaRef.current = { id: active.id, fromPage: activeParsed.page, toPage: overParsed.page };
        const sourceCol = activeContainer === 'side' ? 'side' : 'main';
        const targetCol = overParsed.column || sourceCol;
        const targetPage = overParsed.page;
        const insertAfter = !isOverContainer ? getInsertionOffset(event) === 1 : false;
        setSectionOrder(prev => prev.filter(id => id !== active.id));
        setSidebarOrder(prev => prev.filter(id => id !== active.id));
        placeSectionOnPage(active.id, targetPage, targetCol, isOverContainer ? null : resolvedOver, insertAfter);
        updateCSPlacement(targetCol);
        ensurePage(targetPage);
        syncLayout(sectionOrder.filter(id => id !== active.id), sidebarOrder.filter(id => id !== active.id));
        return;
      }

      // ── page N (N >= 2) → page 1 ──
      if (activeParsed.page >= 2 && overParsed.page === 1) {
        lastDroppedSectionRef.current = active.id;
        lastDropMetaRef.current = { id: active.id, fromPage: activeParsed.page, toPage: 1 };
        const isTwoCol = (TEMPLATE_LAYOUTS[template]?.columns || 1) === 2;
        const targetCol = (isTwoCol && MAIN_ONLY_SECTIONS.includes(active.id) && overParsed.column === 'side') ? 'main' : overParsed.column;
        const offset = !isOverContainer ? getInsertionOffset(event) : 0;
        const insertInto = (arr) => {
          const cleaned = arr.filter(id => id !== active.id);
          const overIndex = isOverContainer ? -1 : cleaned.indexOf(resolvedOver);
          const insertAt = overIndex >= 0 ? overIndex + offset : cleaned.length;
          const next = [...cleaned];
          next.splice(insertAt, 0, active.id);
          return next;
        };
        const nextMain = targetCol === 'main' ? insertInto(sectionOrder) : sectionOrder.filter(id => id !== active.id);
        const nextSide = targetCol === 'side' ? insertInto(sidebarOrder) : sidebarOrder.filter(id => id !== active.id);
        setSectionOrder(nextMain);
        setSidebarOrder(nextSide);
        syncLayout(nextMain, nextSide);
        setSectionLayout(prev => ({
          ...prev,
          [active.id]: {
            ...(prev[active.id] || {}),
            page: 1,
            column: targetCol,
            order: targetCol === 'main' ? nextMain.indexOf(active.id) : nextSide.indexOf(active.id),
          },
        }));
        updateCSPlacement(targetCol === 'side' ? 'side' : 'main');
        return;
      }

      // ── page N → page M (both >= 2) ──
      if (activeParsed.page >= 2 && overParsed.page >= 2) {
        lastDroppedSectionRef.current = active.id;
        lastDropMetaRef.current = { id: active.id, fromPage: activeParsed.page, toPage: overParsed.page };
        const targetCol = overParsed.column || activeParsed.column || 'main';
        const insertAfter = !isOverContainer ? getInsertionOffset(event) === 1 : false;
        placeSectionOnPage(active.id, overParsed.page, targetCol, isOverContainer ? null : resolvedOver, insertAfter);
        updateCSPlacement(targetCol);
        ensurePage(overParsed.page);
        syncLayout(sectionOrder, sidebarOrder);
        return;
      }

      // Unrecognized cross-page — keep original position
      syncLayout(sectionOrder, sidebarOrder);
      lastDroppedSectionRef.current = null;
      lastDropMetaRef.current = null;
      return;
    }

    // ══════════════════════════════════════════════════════════
    // SAME-PAGE MOVES
    // ══════════════════════════════════════════════════════════

    // ── Same page N >= 2: reorder within that page ──
    if (activeParsed.page >= 2) {
      lastDroppedSectionRef.current = active.id;
      lastDropMetaRef.current = { id: active.id, fromPage: activeParsed.page, toPage: activeParsed.page };
      const sameCol = activeParsed.column === overParsed.column;

      if (sameCol) {
        const col = activeParsed.column;
        const pageNum = activeParsed.page;

        setSectionLayout(prev => {
          const pageItems = Object.entries(prev)
            .filter(([_, v]) => v.page === pageNum && v.column === col)
            .sort((a, b) => a[1].order - b[1].order)
            .map(([id]) => id);

          if (isOverContainer) {
            const filtered = pageItems.filter(id => id !== active.id);
            filtered.push(active.id);
            const next = { ...prev };
            filtered.forEach((id, i) => { next[id] = { ...next[id], order: i }; });
            return next;
          }

          const oldIdx = pageItems.indexOf(active.id);
          const newIdx = pageItems.indexOf(resolvedOver);
          if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return prev;
          const reordered = arrayMove(pageItems, oldIdx, newIdx);
          const next = { ...prev };
          reordered.forEach((id, i) => { next[id] = { ...next[id], order: i }; });
          return next;
        });
      }
      // Cross-column within same page already handled in handleDragOver
      syncLayout(sectionOrder, sidebarOrder);
      return;
    }

    // ── Same page 1: reorder within column ──
    if (activeContainer === overContainer) {
      lastDroppedSectionRef.current = active.id;
      lastDropMetaRef.current = { id: active.id, fromPage: 1, toPage: 1 };
      const isMain = activeContainer === 'main';
      const setter = isMain ? setSectionOrder : setSidebarOrder;
      setter(prev => {
        const oldIndex = prev.indexOf(active.id);
        if (oldIndex === -1) return prev;

        if (isOverContainer) {
          const filtered = prev.filter(id => id !== active.id);
          filtered.push(active.id);
          if (isMain) syncLayout(filtered, sidebarOrder);
          else syncLayout(sectionOrder, filtered);
          return filtered;
        }

        const newIndex = prev.indexOf(resolvedOver);
        if (newIndex === -1 || oldIndex === newIndex) return prev;
        const reordered = arrayMove(prev, oldIndex, newIndex);
        if (isMain) syncLayout(reordered, sidebarOrder);
        else syncLayout(sectionOrder, reordered);
        return reordered;
      });
    } else {
      // Cross-column within page 1: arrays already updated in handleDragOver
      lastDroppedSectionRef.current = active.id;
      lastDropMetaRef.current = { id: active.id, fromPage: 1, toPage: 1 };
      syncLayout(sectionOrder, sidebarOrder);
    }
  }, [findContainer, parseContainer, resolveOverForSection, resolveDropTargetFromPoint, isContainerId, setSectionOrder, setSidebarOrder, setSectionLayout, syncLayout, sectionOrder, sidebarOrder, data, onEdit, expPageMap, ensurePage, template, getInsertionOffset, placeSectionOnPage]);

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null);
    activeDragRef.current = null;
    lastDroppedSectionRef.current = null;
    lastDropMetaRef.current = null;
    dragEndTimeRef.current = Date.now();
    setDragOverPage(null);
  }, []);

  const Template = TEMPLATE_MAP[template] || ExecutiveNavy;
  const defaults = TEMPLATE_DEFAULTS[template] || ExecutiveNavy.defaults;
  const showPhoto = !NO_PHOTO.includes(template);

  const handleTemplateChange = (id) => {
    setTemplate(id);
    const d = TEMPLATE_DEFAULTS[id];
    if (d) setColors(d);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const name = data?.name || 'Resume';
      await generatePdf('resume-content', `Resume_${name.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      console.error('PDF error:', e);
    }
    setDownloading(false);
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await onImportProject?.(file);
    } finally {
      event.target.value = '';
    }
  };

  const applyProjectName = () => {
    const trimmed = String(projectNameDraft || '').trim();
    if (!trimmed || trimmed === currentProjectName) return;
    onRenameProject?.(trimmed);
  };

  const handleMoveSection = (from, to) => {
    setSectionOrder(prev => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  const handleAddPage = () => {
    const newPageNum = 2 + extraPages; // next page number (page 2 is index 0 of extras)
    setExtraPages(p => p + 1);
    setPageLayoutModes(prev => ({ ...prev, [newPageNum]: 'same-as-primary' }));
  };

  // Resolve layout mode for a given page (page 1 is always primary; pages 2+ default to 'same-as-primary')
  const getPageLayoutMode = (pageNum) => pageLayoutModes[pageNum] || 'same-as-primary';

  // Sidebar visibility per page (defaults to true)
  const isSidebarVisible = (pageNum) => pageSidebarVisible[pageNum] !== false;

  // ── Page 2 content: render sections assigned to page 2 ──
  const tplLayout = TEMPLATE_LAYOUTS[template] || TEMPLATE_LAYOUTS['executive-navy'];
  const accentColor = colors.accent || defaults?.accent || '#3B82F6';
  const headColor = colors.heading || defaults?.heading || '#1e293b';
  const bodyColor = colors.text || defaults?.text || '#475569';
  const fontFamily = globalFont?.family || tplLayout.defaultFont || "'Outfit',sans-serif";
  const baseFontSize = globalFont?.size || 10;
  const pageBgColor = colors.background || defaults?.background || '#ffffff';
  const keywordPreview = atsReport?.matchedKeywords?.slice(0, 6) || [];
  const missingKeywordPreview = atsReport?.missingKeywords?.slice(0, 6) || [];

  // Shared heading style for page-2 sections (template-aware)
  const isCommentHeading = tplLayout.headingStyle === 'comment';
  const p2Heading = isCommentHeading
    ? { color: '#475569', fontSize: baseFontSize, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }
    : {
        fontSize: tplLayout.p2HeadingSize || 13,
        fontWeight: tplLayout.p2HeadingWeight || 700,
        color: headColor,
        textTransform: tplLayout.p2HeadingTransform || 'uppercase',
        letterSpacing: tplLayout.p2HeadingLetterSpacing || '0.08em',
        marginBottom: 3,
        paddingBottom: 1,
        borderBottom: `2px solid ${tplLayout.p2HeadingRuleColor || accentColor}`,
      };
  const p2SectionGap = tplLayout.page2SectionGap || 'var(--space-lg)';
  const p2SectionLift = template === 'executive-navy' ? -10 : (template === 'bold-coral' ? -6 : (template === 'designer-slate' ? -10 : 0));

  // Default display names for built-in sections (templates may override these)
  const BUILTIN_LABELS = { summary: 'Profile', experience: 'Experience', skills: 'Skills', education: 'Education', certifications: 'Certifications' };
  const label = (id) => sectionLabels?.[id] || BUILTIN_LABELS[id] || id;

  // Template-aware heading for page 2 sections
  const P2SectionHeading = ({ sectionId }) => {
    if (isCommentHeading) {
      return (
        <p style={p2Heading}>
          <span style={{ color: accentColor }}>{'//'}</span>{' '}
          <EditableText value={label(sectionId)} onChange={v => onEdit('section_rename', { sectionId, v })} tag="span" />
        </p>
      );
    }
    return <EditableText value={label(sectionId)} onChange={v => onEdit('section_rename', { sectionId, v })} tag="h2" style={p2Heading} />;
  };

  function renderPage2Section(sectionId) {
    if (sectionId === 'summary') {
      return (
        <DraggableSection key="summary" id="summary">
          <section style={{ marginBottom: p2SectionGap }}>
            <P2SectionHeading sectionId="summary" />
            <EditableText
              value={data?.summary}
              onChange={v => onEdit('summary', { v })}
              tag="p"
              multiline
              style={{ fontSize: baseFontSize, lineHeight: 1.85, color: bodyColor }}
            />
          </section>
        </DraggableSection>
      );
    }
    if (sectionId === 'experience') {
      return (
        <DraggableSection key="experience" id="experience">
          <section style={{ marginTop: p2SectionLift, marginBottom: p2SectionGap }}>
            <P2SectionHeading sectionId="experience" />
            <SortableContext items={expItemIds} strategy={verticalListSortingStrategy}>
              {data?.experience?.map((exp, i) => (
                <DraggableSection key={exp._id} id={`exp-${exp._id}`}>
                  <div style={tplLayout.expBorderLeft ? { paddingLeft: 14, borderLeft: `2px solid ${accentColor}30` } : (template === 'executive-navy' ? { borderLeft: `2px solid ${accentColor}`, paddingLeft: 6, marginTop: i === 0 ? -24 : -12 } : (template === 'bold-coral' ? { marginTop: i === 0 ? -8 : -4 } : (template === 'designer-slate' ? { marginTop: i === 0 ? -8 : -3 } : undefined)))}>
                    <ExpBlock
                      exp={exp}
                      idx={i}
                      onEdit={onEdit}
                      headingColor={headColor}
                      bodyColor={bodyColor}
                      accentColor={accentColor}
                      bulletChar={tplLayout.bulletChar}
                    />
                  </div>
                </DraggableSection>
              ))}
            </SortableContext>
            <div style={template === 'executive-navy' ? { marginTop: -4 } : (template === 'bold-coral' ? { marginTop: -3 } : (template === 'designer-slate' ? { marginTop: -3 } : undefined))}>
              <AddButton onClick={() => onEdit('exp_add', {})} label="experience" />
            </div>
          </section>
        </DraggableSection>
      );
    }
    if (sectionId === 'skills') {
      return (
        <DraggableSection key="skills" id="skills">
          <section style={{ marginTop: p2SectionLift, marginBottom: p2SectionGap }}>
            <P2SectionHeading sectionId="skills" />
            <SkillsRenderer skills={data?.skills} onEdit={onEdit} variant={skillStyle} accentColor={accentColor} textColor={isCommentHeading ? accentColor : headColor} fontSize={baseFontSize} fontFamily={fontFamily} />
          </section>
        </DraggableSection>
      );
    }
    if (sectionId === 'education') {
      return (
        <DraggableSection key="education" id="education">
          <section style={{ marginTop: p2SectionLift, marginBottom: p2SectionGap }}>
            <P2SectionHeading sectionId="education" />
            <EducationRenderer education={data?.education} onEdit={onEdit} variant={educationStyle} accentColor={accentColor} headingColor={headColor} textColor={bodyColor} fontSize={baseFontSize} fontFamily={fontFamily} />
          </section>
        </DraggableSection>
      );
    }
    if (sectionId === 'certifications') {
      if (!data?.certifications?.length) return null;
      return (
        <DraggableSection key="certifications" id="certifications">
          <section style={{ marginTop: p2SectionLift, marginBottom: p2SectionGap }}>
            <P2SectionHeading sectionId="certifications" />
            <CertificationsRenderer certifications={data?.certifications} onEdit={onEdit} variant={certificationStyle} accentColor={accentColor} textColor={bodyColor} fontSize={baseFontSize} fontFamily={fontFamily} />
          </section>
        </DraggableSection>
      );
    }
    // Custom sections on page 2 main
    const csSec = findCustomSection(sectionId);
    if (csSec) {
      return (
        <DraggableSection key={sectionId} id={sectionId}>
          <div style={p2SectionLift ? { marginTop: p2SectionLift } : undefined}>
            <MainSection section={csSec} onEdit={onEdit} headingColor={headColor} bodyColor={bodyColor} accentColor={accentColor} />
          </div>
        </DraggableSection>
      );
    }
    return null;
  }

  // Sidebar-styled heading for page 2 sidebar sections
  const p2SidebarHeading = {
    fontSize: tplLayout.p2SidebarHeadingSize || 11,
    fontWeight: tplLayout.p2SidebarHeadingWeight || 700,
    textTransform: tplLayout.p2SidebarHeadingTransform || 'uppercase',
    letterSpacing: tplLayout.p2SidebarHeadingLetterSpacing || '0.1em',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: `2px solid ${tplLayout.p2SidebarRuleColor || accentColor}`,
    color: tplLayout.p2SidebarHeadingColor || accentColor,
  };
  const p2SidebarText = tplLayout.sidebarColor || bodyColor;
  const p2SidebarSectionGap = tplLayout.page2SidebarSectionGap || 14;
  const continuationSidebarBg =
    tplLayout.sidebarBg && tplLayout.sidebarBg !== 'transparent'
      ? (colors?.sidebar || tplLayout.sidebarBg)
      : (tplLayout.sidebarBg || 'transparent');

  function renderPage2SidebarSection(sectionId) {
    if (sectionId === 'skills') {
      return (
        <DraggableSection key="skills" id="skills">
          <section style={{ marginBottom: p2SidebarSectionGap }}>
            <EditableText value={label('skills')} onChange={v => onEdit('section_rename', { sectionId: 'skills', v })} tag="h3" style={p2SidebarHeading} />
            <SkillsRenderer skills={data?.skills} onEdit={onEdit} variant={skillStyle} accentColor={accentColor} textColor={p2SidebarText} fontSize={baseFontSize} />
          </section>
        </DraggableSection>
      );
    }
    if (sectionId === 'education') {
      return (
        <DraggableSection key="education" id="education">
          <section style={{ marginBottom: p2SidebarSectionGap }}>
            <EditableText value={label('education')} onChange={v => onEdit('section_rename', { sectionId: 'education', v })} tag="h3" style={p2SidebarHeading} />
            <EducationRenderer education={data?.education} onEdit={onEdit} variant={educationStyle} accentColor={accentColor} headingColor={p2SidebarText} textColor={p2SidebarText} fontSize={baseFontSize} />
          </section>
        </DraggableSection>
      );
    }
    if (sectionId === 'certifications') {
      if (!data?.certifications?.length) return null;
      return (
        <DraggableSection key="certifications" id="certifications">
          <section style={{ marginBottom: p2SidebarSectionGap }}>
            <EditableText value={label('certifications')} onChange={v => onEdit('section_rename', { sectionId: 'certifications', v })} tag="h3" style={p2SidebarHeading} />
            <CertificationsRenderer certifications={data?.certifications} onEdit={onEdit} variant={certificationStyle} accentColor={accentColor} textColor={p2SidebarText} fontSize={baseFontSize - 1} />
          </section>
        </DraggableSection>
      );
    }
    // Custom sections on page 2 sidebar
    const csSec = findCustomSection(sectionId);
    if (csSec) {
      return (
        <DraggableSection key={sectionId} id={sectionId}>
          <SideSection section={csSec} onEdit={onEdit} textColor={p2SidebarText} accentColor={accentColor} />
        </DraggableSection>
      );
    }
    // Fallback: render in main style if a main section ends up here
    return renderPage2Section(sectionId);
  }

  // ── Generalized page content renderer for pages 2+ ──
  const continuationSectionsForPage = useCallback((pageNum, column) => {
    const matchesColumn = (sectionId) => (sectionLayout[sectionId]?.column || 'main') === column;
    const isEarlierPage = (sectionId) => (sectionLayout[sectionId]?.page || 1) < pageNum;
    const items = [];

    if (skillsForPage(pageNum).length > 0 && isEarlierPage('skills') && matchesColumn('skills')) items.push('skills');
    if (educationForPage(pageNum).length > 0 && isEarlierPage('education') && matchesColumn('education')) items.push('education');
    if (certsForPage(pageNum).length > 0 && isEarlierPage('certifications') && matchesColumn('certifications')) items.push('certifications');

    (customSections || []).forEach((section) => {
      const dragId = `cs_${section.id}`;
      if (!isEarlierPage(dragId) || !matchesColumn(dragId) || isStructuredProjectSection(section)) return;
      if (customSectionItemsForPage(section, pageNum).length > 0) items.push(dragId);
    });

    return items;
  }, [certsForPage, customSectionItemsForPage, customSections, educationForPage, sectionLayout, skillsForPage]);

  function renderContinuationSection(sectionId, pageNum, sidebar = false) {
    if (sectionId === 'skills') {
      const items = skillsForPage(pageNum);
      if (!items.length) return null;
      return (
        <section key={`${sectionId}-continuation-${pageNum}`} style={{ marginBottom: sidebar ? p2SidebarSectionGap : p2SectionGap }}>
          <EditableText value={label('skills')} onChange={v => onEdit('section_rename', { sectionId: 'skills', v })} tag={sidebar ? 'h3' : 'h2'} style={sidebar ? p2SidebarHeading : p2Heading} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: sidebar ? 6 : 8 }}>
            {items.map((item, index) => (
              <span key={`${sectionId}-${pageNum}-${index}`} style={{ fontSize: baseFontSize, lineHeight: 1.6, color: sidebar ? p2SidebarText : bodyColor }}>
                {item}
              </span>
            ))}
          </div>
        </section>
      );
    }
    if (sectionId === 'education') {
      const items = educationForPage(pageNum);
      if (!items.length) return null;
      return (
        <section key={`${sectionId}-continuation-${pageNum}`} style={{ marginBottom: sidebar ? p2SidebarSectionGap : p2SectionGap }}>
          <EditableText value={label('education')} onChange={v => onEdit('section_rename', { sectionId: 'education', v })} tag={sidebar ? 'h3' : 'h2'} style={sidebar ? p2SidebarHeading : p2Heading} />
          <div style={{ display: 'grid', gap: 8 }}>
            {items.map((item, index) => (
              <div key={`${sectionId}-${pageNum}-${index}`}>
                <div style={{ fontSize: baseFontSize + 1, fontWeight: 600, color: sidebar ? p2SidebarText : headColor }}>{item.degree}</div>
                <div style={{ fontSize: baseFontSize, color: sidebar ? p2SidebarText : bodyColor }}>{item.school}</div>
                <div style={{ fontSize: baseFontSize - 1, color: sidebar ? p2SidebarText : 'var(--c-text-muted)' }}>{item.year}</div>
              </div>
            ))}
          </div>
        </section>
      );
    }
    if (sectionId === 'certifications') {
      const items = certsForPage(pageNum);
      if (!items.length) return null;
      return (
        <section key={`${sectionId}-continuation-${pageNum}`} style={{ marginBottom: sidebar ? p2SidebarSectionGap : p2SectionGap }}>
          <EditableText value={label('certifications')} onChange={v => onEdit('section_rename', { sectionId: 'certifications', v })} tag={sidebar ? 'h3' : 'h2'} style={sidebar ? p2SidebarHeading : p2Heading} />
          <div style={{ display: 'grid', gap: 4 }}>
            {items.map((item, index) => (
              <div key={`${sectionId}-${pageNum}-${index}`} style={{ fontSize: baseFontSize, lineHeight: 1.6, color: sidebar ? p2SidebarText : bodyColor }}>
                {item}
              </div>
            ))}
          </div>
        </section>
      );
    }

    const section = findCustomSection(sectionId);
    const items = customSectionItemsForPage(section, pageNum);
    if (!section || !items.length) return null;

    return (
      <section key={`${sectionId}-continuation-${pageNum}`} style={{ marginBottom: sidebar ? p2SidebarSectionGap : p2SectionGap }}>
        <EditableText
          value={section.title}
          onChange={v => onEdit('custom_section_rename', { id: section.id, v })}
          tag={sidebar ? 'h3' : 'h2'}
          style={sidebar ? p2SidebarHeading : p2Heading}
        />
        <div style={{ display: 'grid', gap: 6 }}>
          {items.map((item, index) => (
            <div key={`${section.id}-${pageNum}-${index}`} style={{ fontSize: baseFontSize, lineHeight: 1.6, color: sidebar ? p2SidebarText : bodyColor }}>
              {item}
            </div>
          ))}
        </div>
      </section>
    );
  }

  function renderPageContent(pageNum) {
    const pageSections = sectionsForPage(pageNum);
    const pageMainSections = pageSectionsByColumn(pageNum, 'main');
    const pageSidebarSections = pageSectionsByColumn(pageNum, 'side');
    const pageMainContinuations = continuationSectionsForPage(pageNum, 'main');
    const pageSidebarContinuations = continuationSectionsForPage(pageNum, 'side');
    const pageExperience = expForPage(pageNum);
    const pageExpItemIds = pageExperience.map(e => `exp-${e._id}`);

    // Show individual exp items when experience section itself is NOT on this page
    const showIndividualExp = pageExperience.length > 0 && sectionLayout.experience?.page !== pageNum;

    const hasContent = pageSections.length > 0 || showIndividualExp || pageMainContinuations.length > 0 || pageSidebarContinuations.length > 0;
    const hasMainContent = pageMainSections.length > 0 || showIndividualExp || pageMainContinuations.length > 0;
    const layoutMode = getPageLayoutMode(pageNum);
    const sidebarOn = isSidebarVisible(pageNum);
    const isDropTarget = dragOverPage === pageNum;

    // Cross-page drop indicator — shows when dragging a section toward this page
    const crossPageIndicator = isDropTarget && (
      <div style={{
        padding: '8px 14px',
        margin: '4px 0',
        borderRadius: 8,
        border: '2px dashed var(--c-accent-border)',
        background: 'var(--c-accent-surface)',
        color: 'var(--c-accent)',
        fontSize: 11,
        fontWeight: 500,
        fontFamily: "'Outfit',sans-serif",
        textAlign: 'center',
        letterSpacing: '0.02em',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}>
        Drop here to move to page {pageNum}
      </div>
    );

    const pageMainInner = (
      <>
        {/* Experience items (overflow from page 1) render first as continuation */}
        {showIndividualExp && (
          <section style={{ marginBottom: p2SectionGap }}>
            {isCommentHeading ? (
              <p style={p2Heading}>
                <span style={{ color: accentColor }}>{'//'}</span>{' '}
                <EditableText value={label('experience')} onChange={v => onEdit('section_rename', { sectionId: 'experience', v })} tag="span" />
              </p>
            ) : (
              <EditableText value={label('experience')} onChange={v => onEdit('section_rename', { sectionId: 'experience', v })} tag="h2" style={p2Heading} />
            )}
            <SortableContext items={pageExpItemIds} strategy={verticalListSortingStrategy}>
              {pageExperience.map((exp) => {
                const globalIdx = data?.experience?.findIndex(e => e._id === exp._id);
                return (
                  <DraggableSection key={exp._id} id={`exp-${exp._id}`}>
                    <div style={tplLayout.expBorderLeft ? { paddingLeft: 14, borderLeft: `2px solid ${accentColor}30` } : undefined}>
                      <ExpBlock exp={exp} idx={globalIdx} onEdit={onEdit} headingColor={headColor} bodyColor={bodyColor} accentColor={accentColor} bulletChar={tplLayout.bulletChar} />
                    </div>
                  </DraggableSection>
                );
              })}
            </SortableContext>
          </section>
        )}

        {/* Custom/built-in sections assigned to this page's main column */}
        {pageMainContinuations.map((sectionId) => renderContinuationSection(sectionId, pageNum, false))}
        <SortableContext items={pageMainSections} strategy={verticalListSortingStrategy}>
          {pageMainSections.map(renderPage2Section)}
        </SortableContext>
      </>
    );

    const pageSidebarInner = (
      <>
        {pageSidebarContinuations.map((sectionId) => renderContinuationSection(sectionId, pageNum, true))}
        <SortableContext items={pageSidebarSections} strategy={verticalListSortingStrategy}>
          {pageSidebarSections.map(renderPage2SidebarSection)}
        </SortableContext>
      </>
    );

    return (
      <DroppableColumn
        id={`page-${pageNum}-drop`}
        style={{
          width: '100%',
          height: '100%',
          fontFamily,
          fontSize: `${baseFontSize}px`,
          background: pageBgColor,
          color: bodyColor,
          ...(layoutMode === 'same-as-primary' && tplLayout.columns === 2
            ? { display: 'flex', flexDirection: 'row', alignItems: 'stretch', padding: tplLayout.bodyPadding || 0, gap: tplLayout.bodyGap || 0 }
            : { padding: tplLayout.mainPadding || '40px 36px' }
          ),
        }}
      >
        {layoutMode === 'same-as-primary' && tplLayout.columns === 2 ? (
          <>
            {tplLayout.sidebarSide === 'left' && sidebarOn && (
              <DroppableColumn
                id={`page-${pageNum}-side`}
                style={{
                  ...(tplLayout.sidebarFlex
                    ? { flex: tplLayout.sidebarFlex }
                    : { width: tplLayout.sidebarWidth || 'auto', flexShrink: 0 }
                  ),
                  background: continuationSidebarBg,
                  borderRadius: tplLayout.sidebarRadius || 0,
                  color: tplLayout.sidebarColor || bodyColor,
                  padding: tplLayout.sidebarPadding || 'var(--space-xl) 20px',
                  borderRight: tplLayout.sidebarBorder ? `3px solid ${accentColor}` : undefined,
                  alignSelf: 'stretch',
                  height: '100%',
                  minHeight: '100%',
                }}
              >
                {pageSidebarSections.length > 0 ? pageSidebarInner : (
                  <div style={{
                    height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: tplLayout.sidebarColor || 'var(--c-text-ghost)', fontSize: 11, opacity: 0.5,
                  }}>
                    {!hasContent && 'Sidebar'}
                  </div>
                )}
              </DroppableColumn>
            )}

            <DroppableColumn
              id={`page-${pageNum}-main`}
              style={{
                flex: tplLayout.mainFlex || 1,
                padding: tplLayout.mainPadding || '40px var(--space-xl)',
                minWidth: 0,
              }}
            >
              {pageMainInner}
              {crossPageIndicator}

              {!hasMainContent && !isDropTarget && (
                <div style={{
                  width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--c-text-ghost)', fontSize: 12, fontFamily: "'Outfit',sans-serif", letterSpacing: '0.02em',
                  border: '2px dashed rgba(0,0,0,.06)', borderRadius: 8,
                }}>
                  Drop sections here
                </div>
              )}
            </DroppableColumn>

            {tplLayout.sidebarSide === 'right' && sidebarOn && (
              <DroppableColumn
                id={`page-${pageNum}-side`}
                style={{
                  ...(tplLayout.sidebarFlex
                    ? { flex: tplLayout.sidebarFlex }
                    : { width: tplLayout.sidebarWidth || 'auto', flexShrink: 0 }
                  ),
                  background: continuationSidebarBg,
                  borderRadius: tplLayout.sidebarRadius || 0,
                  color: tplLayout.sidebarColor || bodyColor,
                  padding: tplLayout.sidebarPadding || (tplLayout.sidebarBg !== 'transparent' ? 'var(--space-xl) 18px' : 'var(--space-xl) 20px'),
                  borderLeft: tplLayout.sidebarBorder ? `3px solid ${accentColor}` : undefined,
                  alignSelf: 'stretch',
                  height: '100%',
                  minHeight: '100%',
                }}
              >
                {pageSidebarSections.length > 0 ? pageSidebarInner : (
                  <div style={{
                    height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: tplLayout.sidebarColor || 'var(--c-text-ghost)', fontSize: 11, opacity: 0.5,
                  }}>
                    {!hasContent && 'Sidebar'}
                  </div>
                )}
              </DroppableColumn>
            )}
          </>
        ) : (
          <>
            {/* Experience items (overflow from page 1) render first as continuation */}
            {showIndividualExp && (
              <section style={{ marginBottom: 'var(--space-lg)' }}>
                <P2SectionHeading sectionId="experience" />
                <SortableContext items={pageExpItemIds} strategy={verticalListSortingStrategy}>
                  {pageExperience.map((exp) => {
                    const globalIdx = data?.experience?.findIndex(e => e._id === exp._id);
                    return (
                      <DraggableSection key={exp._id} id={`exp-${exp._id}`}>
                        <div style={tplLayout.expBorderLeft ? { paddingLeft: 14, borderLeft: `2px solid ${accentColor}30` } : undefined}>
                          <ExpBlock exp={exp} idx={globalIdx} onEdit={onEdit} headingColor={headColor} bodyColor={bodyColor} accentColor={accentColor} bulletChar={tplLayout.bulletChar} />
                        </div>
                      </DraggableSection>
                    );
                  })}
                </SortableContext>
              </section>
            )}

            {/* Custom/built-in sections assigned to this page */}
            <SortableContext items={pageSections} strategy={verticalListSortingStrategy}>
              {pageSections.map(renderPage2Section)}
            </SortableContext>

            {crossPageIndicator}

            {!hasContent && !isDropTarget && (
              <div style={{
                width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--c-text-ghost)', fontSize: 12, fontFamily: "'Outfit',sans-serif", letterSpacing: '0.02em',
                border: '2px dashed rgba(0,0,0,.06)', borderRadius: 8,
              }}>
                Drop sections here
              </div>
            )}
          </>
        )}
      </DroppableColumn>
    );
  }

  // Build pageContents map for all extra pages
  const pageContents = {};
  for (let n = 2; n <= 1 + extraPages; n++) {
    pageContents[n] = renderPageContent(n);
  }

  return (
    <div className="editor-shell">
      {/* ===== LEFT PANEL (redesigned) ===== */}
      <aside className="editor-sidebar">
        <div className="sidebar-inner">
          <div className="editor-ai-card" style={{ gap: 12 }}>
            <div className="editor-ai-card-head">
              <div>
                <span className="editor-score-eyebrow">Workspace</span>
                <h3>Local project studio</h3>
              </div>
              <span className="editor-ai-badge">Local</span>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <label style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>Project name</label>
              <input
                value={projectNameDraft}
                onChange={(event) => setProjectNameDraft(event.target.value)}
                onBlur={applyProjectName}
                placeholder="Resume name"
                style={{
                  width: '100%',
                  borderRadius: 12,
                  border: '1px solid var(--c-border)',
                  background: 'var(--c-surface-alt)',
                  color: 'var(--c-text)',
                  padding: '10px 12px',
                  fontSize: 12,
                }}
              />
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <label style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>Saved resumes</label>
              <select
                value={activeProjectId || ''}
                onChange={(event) => onSelectProject?.(event.target.value)}
                style={{
                  width: '100%',
                  borderRadius: 12,
                  border: '1px solid var(--c-border)',
                  background: 'var(--c-surface-alt)',
                  color: 'var(--c-text)',
                  padding: '10px 12px',
                  fontSize: 12,
                }}
              >
                {workspaceProjects?.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button type="button" className="editor-ai-btn" onClick={onCreateProject}>New</button>
              <button type="button" className="editor-ai-btn" onClick={onDuplicateProject}>Duplicate</button>
              <button type="button" className="editor-ai-btn" onClick={onExportProject}>Export</button>
              <button type="button" className="editor-ai-btn" onClick={handleImportClick}>Import</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <button type="button" className="editor-ai-btn" onClick={onUndo} disabled={!canUndo}>Undo</button>
              <button type="button" className="editor-ai-btn" onClick={onRedo} disabled={!canRedo}>Redo</button>
              <button type="button" className="editor-ai-btn" onClick={onDeleteProject}>Delete</button>
            </div>
            <input
              ref={importInputRef}
              type="file"
              accept=".json,.cvcraft.json"
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
          </div>

          <div className="editor-score-card">
            <div className="editor-score-head">
              <div>
                <span className="editor-score-eyebrow">Resume Quality</span>
                <h3>{resumeQuality.label}</h3>
              </div>
              <div className="editor-score-ring">
                <strong>{resumeQuality.score}</strong>
              </div>
            </div>
            <div className="editor-score-meter">
              <div className="editor-score-meter-bar" style={{ width: `${resumeQuality.score}%` }} />
            </div>
            <div className="editor-score-list">
              {resumeQuality.suggestions.length > 0 ? (
                resumeQuality.suggestions.map((item) => (
                  <div key={item} className="editor-score-item">{item}</div>
                ))
              ) : (
                <div className="editor-score-item">This draft is already in strong shape. Focus on final wording and spacing polish.</div>
              )}
            </div>
          </div>

          {/* ── Photo ── */}
          <div className="editor-ai-card">
            <div className="editor-ai-card-head">
              <div>
                <span className="editor-score-eyebrow">AI Writing Studio</span>
                <h3>Sharper wording, faster</h3>
              </div>
              <span className="editor-ai-badge">Premium</span>
            </div>
            <p className="editor-ai-copy">
              Rewrite the whole resume or polish the profile instantly before you export.
            </p>
            <div className="editor-ai-actions">
              <button type="button" className="editor-ai-btn" onClick={() => onAIRewrite?.('summary')}>
                Rewrite summary
              </button>
              <button type="button" className="editor-ai-btn editor-ai-btn--primary" onClick={() => onAIRewrite?.('whole-resume')}>
                Rewrite full resume
              </button>
            </div>
          </div>

          <div className="editor-ai-card">
            <div className="editor-ai-card-head">
              <div>
                <span className="editor-score-eyebrow">ATS Studio</span>
                <h3>Target a real job</h3>
              </div>
              <span className="editor-ai-badge">{jobDescription?.trim() ? `${atsReport?.score || 0}%` : 'Ready'}</span>
            </div>
            <textarea
              value={jobDescription}
              onChange={(event) => onJobDescriptionChange?.(event.target.value)}
              placeholder="Paste a job description here to get keyword coverage, gap analysis, and companion copy."
              rows={7}
              style={{
                width: '100%',
                borderRadius: 14,
                border: '1px solid var(--c-border)',
                background: 'var(--c-surface-alt)',
                color: 'var(--c-text)',
                padding: '12px 14px',
                fontSize: 12,
                lineHeight: 1.55,
                resize: 'vertical',
              }}
            />
            {jobDescription?.trim() ? (
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ fontSize: 12, color: 'var(--c-text)' }}>
                  Keyword match score: <strong>{atsReport?.score || 0}</strong>
                </div>
                {keywordPreview.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {keywordPreview.map((keyword) => (
                      <span key={keyword} style={{ fontSize: 11, padding: '5px 8px', borderRadius: 999, background: 'rgba(16,185,129,.12)', color: '#10b981' }}>{keyword}</span>
                    ))}
                  </div>
                )}
                {missingKeywordPreview.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {missingKeywordPreview.map((keyword) => (
                      <span key={keyword} style={{ fontSize: 11, padding: '5px 8px', borderRadius: 999, background: 'rgba(251,146,60,.12)', color: '#fb923c' }}>{keyword}</span>
                    ))}
                  </div>
                )}
                {(atsReport?.suggestions || []).length > 0 && (
                  <div style={{ display: 'grid', gap: 6 }}>
                    {atsReport.suggestions.slice(0, 3).map((item) => (
                      <div key={item} className="editor-score-item">{item}</div>
                    ))}
                  </div>
                )}
                <button type="button" className="editor-ai-btn editor-ai-btn--primary" onClick={onGenerateCompanionDocs} disabled={companionLoading}>
                  {companionLoading ? 'Generating companion copy...' : 'Generate cover letter + LinkedIn'}
                </button>
              </div>
            ) : (
              <p className="editor-ai-copy">Paste a job description to unlock ATS scoring, missing keyword detection, and companion application copy.</p>
            )}
          </div>

          {(coverLetter || linkedInSummary) && (
            <div className="editor-ai-card">
              <div className="editor-ai-card-head">
                <div>
                  <span className="editor-score-eyebrow">Companion Docs</span>
                  <h3>Application assets</h3>
                </div>
                <span className="editor-ai-badge">Generated</span>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                <label style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>Cover letter</label>
                <textarea
                  value={coverLetter}
                  onChange={(event) => onCoverLetterChange?.(event.target.value)}
                  rows={8}
                  style={{
                    width: '100%',
                    borderRadius: 14,
                    border: '1px solid var(--c-border)',
                    background: 'var(--c-surface-alt)',
                    color: 'var(--c-text)',
                    padding: '12px 14px',
                    fontSize: 12,
                    lineHeight: 1.55,
                    resize: 'vertical',
                  }}
                />
                <label style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>LinkedIn About</label>
                <textarea
                  value={linkedInSummary}
                  onChange={(event) => onLinkedInSummaryChange?.(event.target.value)}
                  rows={5}
                  style={{
                    width: '100%',
                    borderRadius: 14,
                    border: '1px solid var(--c-border)',
                    background: 'var(--c-surface-alt)',
                    color: 'var(--c-text)',
                    padding: '12px 14px',
                    fontSize: 12,
                    lineHeight: 1.55,
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          )}

          {showPhoto && (
            <PanelGroup title="Photo" icon={<PhotoIcon />}>
              <PhotoPanel
                photo={photo}
                onPhoto={setPhoto}
                ps={photoSettings}
                onPs={setPhotoSettings}
                shape={photoShape}
                onShape={setPhotoShape}
              />
            </PanelGroup>
          )}

          {/* ── Expandable buttons ── */}
          <div className="panel-divider" />

          <button
            type="button"
            className="global-settings-launch"
            onClick={() => setGlobalSettingsOpen(true)}
          >
            <span className="global-settings-launch__icon"><GlobalSettingsIcon /></span>
            <span className="global-settings-launch__copy">
              <strong>Global Settings</strong>
              <small>Fonts, colors, and the full Styles list in one right-side popup.</small>
            </span>
            <span className="global-settings-launch__cta">Open</span>
          </button>

          <ExpandButton
            label="Section Studio"
            icon={<SectionIcon />}
            isOpen={openPanel === 'sections'}
            onClick={() => toggle('sections')}
          >
            <SectionPanel
              data={data}
              customSections={data?.customSections || []}
              onEdit={onEdit}
              template={template}
              sectionLabels={sectionLabels}
              hiddenSections={hiddenSections}
              onAIRewrite={onAIRewrite}
            />
          </ExpandButton>

          <div className="panel-divider" />

          {/* ── Download PDF ── */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="download-btn"
            style={{
              background: downloading ? 'var(--c-surface-alt)' : 'linear-gradient(135deg,#00E5A0,#00CC8E)',
              color: downloading ? 'var(--c-text-faint)' : 'var(--c-on-accent)',
              boxShadow: downloading ? 'none' : '0 0 30px var(--c-accent-glow)',
            }}
          >
            {downloading ? (
              <>
                <div className="spin" style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--c-border-focus)', borderTopColor: 'var(--c-icon)' }} />
                Generating...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PDF
              </>
            )}
          </button>

          {/* ── Re-upload ── */}
          <button onClick={onReUpload} className="reupload-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
            </svg>
            Re-upload Resume
          </button>
        </div>
      </aside>

      {/* ===== RESUME PREVIEW ===== */}
      <SectionActionsContext.Provider value={{ removeSection: handleRemoveSection }}>
      <DndContext
        sensors={sensors}
        collisionDetection={scopedCollision}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
          <div className="editor-canvas-pane">
            <A4Wrapper
              extraPages={extraPages}
              onAddPage={handleAddPage}
              pageContents={pageContents}
              pageLayoutModes={pageLayoutModes}
              setPageLayoutModes={setPageLayoutModes}
              pageSidebarVisible={pageSidebarVisible}
              setPageSidebarVisible={setPageSidebarVisible}
            >
              <div key={template} className="template-preview-transition">
                <Template
                  data={page1Data}
                  photo={photo}
                  photoSettings={photoSettings}
                  onPhotoSettings={setPhotoSettings}
                  photoShape={photoShape}
                  colors={colors}
                  globalFont={globalFont}
                  onEdit={onEdit}
                  sectionOrder={sectionOrder}
                  sidebarOrder={sidebarOrder}
                  onMoveSection={handleMoveSection}
                  skillStyle={skillStyle}
                  contactStyle={contactStyle}
                  educationStyle={educationStyle}
                  certificationStyle={certificationStyle}
                  sectionLabels={sectionLabels}
                />
              </div>
            </A4Wrapper>
          </div>
        {/* Drag overlay — floating label showing which section is being moved */}
        <DragOverlay dropAnimation={{
          duration: 150,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
          {activeDragId ? (
            <div className="dnd-overlay-label">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" opacity=".5">
                <circle cx="3" cy="1.5" r="1" /><circle cx="7" cy="1.5" r="1" />
                <circle cx="3" cy="5" r="1" /><circle cx="7" cy="5" r="1" />
                <circle cx="3" cy="8.5" r="1" /><circle cx="7" cy="8.5" r="1" />
              </svg>
              {typeof activeDragId === 'string' && activeDragId.startsWith('exp-')
                ? (data?.experience?.find(e => e._id === activeDragId.slice(4))?.role || 'Experience')
                : typeof activeDragId === 'string' && activeDragId.startsWith('cs_')
                  ? (findCustomSection(activeDragId)?.title || 'Section')
                  : label(activeDragId)}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      </SectionActionsContext.Provider>

      {/* ===== RIGHT PANEL (Templates) ===== */}
      <aside className={`editor-sidebar-right${templatesOpen ? '' : ' editor-sidebar-right--collapsed'}`}>
        <div className="sidebar-inner">
          <button
            className="right-panel-header"
            onClick={() => setTemplatesOpen(prev => !prev)}
          >
            <TemplateIcon />
            <span>Templates</span>
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              className={`right-panel-chevron${templatesOpen ? '' : ' right-panel-chevron--closed'}`}
            >
              <polyline points="2.5 4.5 6 8 9.5 4.5" />
            </svg>
          </button>
          {templatesOpen && (
            <TemplatePanel
              selected={template}
              onSelect={handleTemplateChange}
              templateMap={TEMPLATE_MAP}
              data={page1Data}
              photo={photo}
              photoSettings={photoSettings}
              photoShape={photoShape}
              colors={colors}
              globalFont={globalFont}
              sectionOrder={sectionOrder}
              sidebarOrder={sidebarOrder}
              skillStyle={skillStyle}
              contactStyle={contactStyle}
              educationStyle={educationStyle}
              certificationStyle={certificationStyle}
              sectionLabels={sectionLabels}
              templateDefaults={TEMPLATE_DEFAULTS}
            />
          )}
        </div>
      </aside>

      <GlobalSettingsDrawer
        open={globalSettingsOpen}
        onClose={() => setGlobalSettingsOpen(false)}
        globalFont={globalFont}
        setGlobalFont={setGlobalFont}
        colors={colors}
        setColors={setColors}
        defaults={defaults}
        skillStyle={skillStyle}
        setSkillStyle={setSkillStyle}
        contactStyle={contactStyle}
        setContactStyle={setContactStyle}
        educationStyle={educationStyle}
        setEducationStyle={setEducationStyle}
        certificationStyle={certificationStyle}
        setCertificationStyle={setCertificationStyle}
      />
    </div>
  );
}

/* ── Panel group (collapsible, with icon + title) ── */
function PanelGroup({ title, icon, children, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="panel-group">
      <button onClick={() => setOpen(!open)} className="panel-group-header">
        <div className="flex items-center gap-2.5">
          <span className="panel-icon">{icon}</span>
          <span className="panel-title">{title}</span>
        </div>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"
          className="panel-chevron" data-open={open ? 'true' : undefined}
        >
          <polyline points="2.5 4.5 6 8 9.5 4.5" />
        </svg>
      </button>
      <div className="panel-group-content">
        <div className="panel-group-inner" data-open={open ? 'true' : undefined}>
          <div className="panel-group-overflow">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Expand button (for Fonts, Colors, Sections) ── */
function ExpandButton({ label, icon, isOpen, onClick, children }) {
  return (
    <div className="expand-section">
      <button onClick={onClick} className={`expand-btn ${isOpen ? 'expand-btn-active' : ''}`}>
        <div className="flex items-center gap-2.5">
          <span className="panel-icon">{icon}</span>
          <span>{label}</span>
        </div>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"
          className="panel-chevron" data-open={isOpen ? 'true' : undefined}
        >
          <polyline points="2.5 4.5 6 8 9.5 4.5" />
        </svg>
      </button>
      <div className="expand-inner" data-open={isOpen ? 'true' : undefined}>
        <div className="expand-overflow">
          <div className="expand-content">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ── Icons ── */
function TemplateIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function PhotoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function FontIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  );
}

function ColorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="13.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="15.5" r="2.5" />
      <circle cx="8.5" cy="15.5" r="2.5" /><circle cx="6.5" cy="6.5" r="2.5" />
    </svg>
  );
}

function SkillIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="4" width="8" height="5" rx="2" /><rect x="14" y="4" width="8" height="5" rx="2" />
      <rect x="2" y="15" width="10" height="5" rx="2" /><rect x="16" y="15" width="6" height="5" rx="2" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="7" y1="9" x2="17" y2="9" />
      <line x1="7" y1="13" x2="14" y2="13" />
    </svg>
  );
}

function EduIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 1 4 3 6 3s6-2 6-3v-5" />
    </svg>
  );
}

function CertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M8.5 14 L7 22 L12 19 L17 22 L15.5 14" />
    </svg>
  );
}

function SectionIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function GlobalSettingsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 .99-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51.99H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
