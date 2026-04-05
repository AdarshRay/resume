import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { sanitizeRichText } from '../utils/richText';

const FONT_OPTIONS = [
  { label: 'Outfit', value: 'Outfit, sans-serif' },
  { label: 'Raleway', value: 'Raleway, sans-serif' },
  { label: 'Playfair', value: '"Playfair Display", serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'JetBrains', value: '"JetBrains Mono", monospace' },
];

const COLOR_OPTIONS = ['#1f2937', '#0f766e', '#2563eb', '#7c3aed', '#dc2626', '#c9a84c'];
const BULLET_OPTIONS = [
  { label: 'Auto', value: 'auto' },
  { label: 'Dot', value: '•' },
  { label: 'Ring', value: '◦' },
  { label: 'Arrow', value: '▸' },
  { label: 'Dash', value: '—' },
  { label: 'Check', value: '✓' },
  { label: 'Angle', value: '>' },
  { label: 'Plain', value: 'none' },
];

const BULLET_PATTERN = /^([-*•◦▸—✓>])\s+/;

const RichTextToolbarContext = createContext(null);

function findBulletGlyph(element) {
  const row = element?.closest?.('li, .group\\/item, .group\\/exp, .group\\/section') || element?.parentElement;
  if (!row) return null;
  const explicit = row.querySelector?.('[data-bullet-glyph="true"]');
  if (explicit) return explicit;
  const siblings = Array.from(row.children || []);
  return siblings.find((node) => {
    if (node === element) return false;
    const tagName = node.tagName?.toLowerCase();
    const text = node.textContent?.trim();
    if (tagName !== 'span' || !text || text.length > 2) return false;
    return !node.hasAttribute('contenteditable') && !node.querySelector?.('[contenteditable]');
  }) || null;
}

function getTextOffset(root, targetNode, targetOffset) {
  if (!root || !targetNode) return 0;
  const range = document.createRange();
  range.selectNodeContents(root);
  try {
    range.setEnd(targetNode, targetOffset);
  } catch {
    return String(root.innerText || '').length;
  }
  return range.toString().length;
}

function getLineSelectionRange(element) {
  const text = String(element?.innerText || '');
  const lines = text.split('\n');
  if (!element || !lines.length) {
    return { startLine: 0, endLine: 0, hasSelection: false };
  }

  const selection = window.getSelection();
  if (!selection?.rangeCount || selection.isCollapsed) {
    return {
      startLine: 0,
      endLine: Math.max(lines.length - 1, 0),
      hasSelection: false,
    };
  }

  const anchorInside = element.contains(selection.anchorNode);
  const focusInside = element.contains(selection.focusNode);
  if (!anchorInside && !focusInside) {
    return {
      startLine: 0,
      endLine: Math.max(lines.length - 1, 0),
      hasSelection: false,
    };
  }

  const startOffset = anchorInside
    ? getTextOffset(element, selection.anchorNode, selection.anchorOffset)
    : 0;
  const endOffset = focusInside
    ? getTextOffset(element, selection.focusNode, selection.focusOffset)
    : text.length;

  const from = Math.max(0, Math.min(startOffset, endOffset));
  const to = Math.max(0, Math.max(startOffset, endOffset));

  let cursor = 0;
  let startLine = 0;
  let endLine = Math.max(lines.length - 1, 0);

  for (let index = 0; index < lines.length; index += 1) {
    const lineEnd = cursor + lines[index].length;
    if (from <= lineEnd + (index < lines.length - 1 ? 1 : 0)) {
      startLine = index;
      break;
    }
    cursor = lineEnd + 1;
  }

  cursor = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const lineEnd = cursor + lines[index].length;
    if (to <= lineEnd + (index < lines.length - 1 ? 1 : 0)) {
      endLine = index;
      break;
    }
    cursor = lineEnd + 1;
  }

  return {
    startLine: Math.min(startLine, endLine),
    endLine: Math.max(startLine, endLine),
    hasSelection: true,
  };
}

function extractBulletGlyph(line) {
  return line.match(BULLET_PATTERN)?.[1] || null;
}

function isLineEditor(element) {
  return element?.dataset?.bulletBlock === 'true' || element?.dataset?.multiline === 'true';
}

function readCommandState(activeEditable) {
  const selection = window.getSelection();
  const hasSelection = !!selection && selection.rangeCount > 0 && !selection.isCollapsed;
  const sourceNode = selection?.anchorNode?.nodeType === Node.TEXT_NODE
    ? selection.anchorNode.parentElement
    : selection?.anchorNode;
  const sizeSource = sourceNode?.nodeType === Node.ELEMENT_NODE ? sourceNode : activeEditable;
  const computedSize = sizeSource ? parseFloat(window.getComputedStyle(sizeSource).fontSize || '14') : 14;
  const bulletGlyph = isLineEditor(activeEditable)
    ? (() => {
        const { startLine, endLine } = getLineSelectionRange(activeEditable);
        const matches = String(activeEditable.innerText || '')
          .split('\n')
          .slice(startLine, endLine + 1)
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => extractBulletGlyph(line))
          .filter(Boolean);
        if (!matches.length) return 'auto';
        return matches.every((lineGlyph) => lineGlyph === matches[0]) ? matches[0] : 'auto';
      })()
    : (findBulletGlyph(activeEditable)?.textContent || 'auto');
  return {
    hasSelection,
    bold: document.queryCommandState?.('bold') || false,
    italic: document.queryCommandState?.('italic') || false,
    underline: document.queryCommandState?.('underline') || false,
    fontName: (document.queryCommandValue?.('fontName') || '').replace(/['"]/g, ''),
    color: document.queryCommandValue?.('foreColor') || '#1f2937',
    fontSize: Math.round(computedSize || 14),
    bulletGlyph,
  };
}

export function RichTextToolbarProvider({
  children,
  globalFont,
  setGlobalFont,
  colors,
  setColors,
  sectionStyles = {},
}) {
  const [activeEditable, setActiveEditable] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const savedRangeRef = useRef(null);
  const toolbarInteractingRef = useRef(false);
  const [state, setState] = useState({
    hasSelection: false,
    bold: false,
    italic: false,
    underline: false,
    fontName: '',
    color: '#1f2937',
    fontSize: 14,
    bulletGlyph: 'auto',
  });

  const activeSectionId = activeEditable?.closest?.('[data-section-id]')?.getAttribute?.('data-section-id') || null;
  const activeSectionStyleType = activeSectionId === 'skills'
    ? 'skills'
    : activeSectionId === 'education'
      ? 'education'
      : activeSectionId === 'certifications'
        ? 'certifications'
        : activeSectionId === 'contact'
          ? 'contact'
          : null;

  const refreshState = useCallback(() => {
    if (!activeEditable || !activeEditable.isConnected) {
      setIsVisible(false);
      return;
    }
    const selection = window.getSelection();
    const inside = !!selection?.anchorNode && activeEditable.contains(selection.anchorNode);
    const active = document.activeElement === activeEditable || inside || toolbarInteractingRef.current;
    setIsVisible(active);
    if (active) {
      if (selection?.rangeCount) {
        savedRangeRef.current = selection.getRangeAt(0).cloneRange();
      }
      setState(readCommandState(activeEditable));
    }
  }, [activeEditable]);

  const activateEditable = useCallback((element) => {
    if (!element) return;
    setActiveEditable(element);
    setIsVisible(true);
    requestAnimationFrame(() => {
      setState(readCommandState(element));
    });
  }, []);

  const deactivateEditable = useCallback((element) => {
    setTimeout(() => {
      if (toolbarInteractingRef.current) return;
      const selection = window.getSelection();
      const stillInside = !!selection?.anchorNode && element?.contains?.(selection.anchorNode);
      if (stillInside) return;
      if (element && activeEditable && element !== activeEditable) return;
      setIsVisible(false);
      setActiveEditable((current) => (current === element ? null : current));
    }, 0);
  }, [activeEditable]);

  useEffect(() => {
    const handleSelectionChange = () => refreshState();
    document.addEventListener('selectionchange', handleSelectionChange);
    window.addEventListener('keyup', handleSelectionChange);
    window.addEventListener('mouseup', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      window.removeEventListener('keyup', handleSelectionChange);
      window.removeEventListener('mouseup', handleSelectionChange);
    };
  }, [refreshState]);

  const focusActiveEditable = useCallback(() => {
    if (!activeEditable) return false;
    activeEditable.focus();
    if (savedRangeRef.current) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(savedRangeRef.current);
    }
    return true;
  }, [activeEditable]);

  const exec = useCallback((command, value = null) => {
    if (!focusActiveEditable()) return;
    document.execCommand(command, false, value);
    refreshState();
  }, [focusActiveEditable, refreshState]);

  const applyInlineStyle = useCallback((stylePatch) => {
    if (!focusActiveEditable()) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (selection.isCollapsed) {
      const sourceNode = selection.anchorNode?.nodeType === Node.TEXT_NODE
        ? selection.anchorNode.parentElement
        : selection.anchorNode;
      const target = sourceNode?.nodeType === Node.ELEMENT_NODE ? sourceNode : activeEditable;
      if (!target) return;
      Object.entries(stylePatch).forEach(([key, value]) => {
        target.style[key] = value;
      });
      refreshState();
      return;
    }
    const fragment = range.extractContents();
    const wrapper = document.createElement('span');
    Object.entries(stylePatch).forEach(([key, value]) => {
      wrapper.style[key] = value;
    });
    wrapper.appendChild(fragment);
    range.insertNode(wrapper);

    selection.removeAllRanges();
    const nextRange = document.createRange();
    nextRange.selectNodeContents(wrapper);
    selection.addRange(nextRange);
    savedRangeRef.current = nextRange.cloneRange();
    refreshState();
  }, [activeEditable, focusActiveEditable, refreshState]);

  const applyFontFamily = useCallback((fontFamily) => {
    if (!fontFamily) return;
    applyInlineStyle({ fontFamily });
  }, [applyInlineStyle]);

  const applyColor = useCallback((color) => {
    if (!color) return;
    applyInlineStyle({ color });
  }, [applyInlineStyle]);

  const nudgeFontSize = useCallback((direction) => {
    const nextSize = Math.max(8, Math.min(30, (state.fontSize || 14) + direction));
    applyInlineStyle({ fontSize: `${nextSize}px` });
  }, [applyInlineStyle, state.fontSize]);

  const applyExactFontSize = useCallback((nextSize) => {
    const parsed = Number(nextSize);
    if (!Number.isFinite(parsed)) return;
    const clamped = Math.max(8, Math.min(30, parsed));
    applyInlineStyle({ fontSize: `${clamped}px` });
  }, [applyInlineStyle]);

  const applyBulletStyle = useCallback((glyph) => {
    if (!activeEditable) return;
    if (isLineEditor(activeEditable)) {
      const { startLine, endLine, hasSelection } = getLineSelectionRange(activeEditable);
      const nextText = String(activeEditable.innerText || '')
        .split('\n')
        .map((line, index) => {
          const inScope = hasSelection ? (index >= startLine && index <= endLine) : true;
          if (!inScope || !line.trim()) return line;
          if (glyph === 'auto') return line;
          if (glyph === 'none') return line.replace(BULLET_PATTERN, '');
          if (BULLET_PATTERN.test(line)) return line.replace(BULLET_PATTERN, `${glyph} `);
          return `${glyph} ${line.replace(/^\s+/, '')}`;
        })
        .join('\n');
      activeEditable.innerHTML = sanitizeRichText(nextText, { multiline: true });
      activeEditable.focus();
      setState((prev) => ({ ...prev, bulletGlyph: glyph }));
      refreshState();
      return;
    }
    const bulletNode = findBulletGlyph(activeEditable);
    if (!bulletNode) return;
    bulletNode.textContent = glyph;
    setState((prev) => ({ ...prev, bulletGlyph: glyph }));
  }, [activeEditable, refreshState]);

  const clearFormatting = useCallback(() => {
    exec('removeFormat');
  }, [exec]);

  const beginToolbarInteraction = useCallback(() => {
    toolbarInteractingRef.current = true;
    setIsVisible(true);
  }, []);

  const endToolbarInteraction = useCallback(() => {
    toolbarInteractingRef.current = false;
    refreshState();
  }, [refreshState]);

  const isToolbarInteracting = useCallback(() => toolbarInteractingRef.current, []);

  const value = useMemo(() => ({
    isVisible,
    activeEditable,
    state,
    fontOptions: FONT_OPTIONS,
    colorOptions: COLOR_OPTIONS,
    bulletOptions: BULLET_OPTIONS,
    activateEditable,
    deactivateEditable,
    refreshState,
    exec,
    applyFontFamily,
    applyColor,
    nudgeFontSize,
    applyExactFontSize,
    applyBulletStyle,
    clearFormatting,
    beginToolbarInteraction,
    endToolbarInteraction,
    isToolbarInteracting,
    activeSectionId,
    activeSectionStyleType,
    globalFont,
    setGlobalFont,
    colors,
    setColors,
    sectionStyles,
  }), [
    isVisible,
    activeEditable,
    state,
    activateEditable,
    deactivateEditable,
    refreshState,
    exec,
    applyFontFamily,
    applyColor,
    nudgeFontSize,
    applyExactFontSize,
    applyBulletStyle,
    clearFormatting,
    beginToolbarInteraction,
    endToolbarInteraction,
    isToolbarInteracting,
    activeSectionId,
    activeSectionStyleType,
    globalFont,
    setGlobalFont,
    colors,
    setColors,
    sectionStyles,
  ]);

  return (
    <RichTextToolbarContext.Provider value={value}>
      {children}
    </RichTextToolbarContext.Provider>
  );
}

export function useRichTextToolbar() {
  return useContext(RichTextToolbarContext);
}
