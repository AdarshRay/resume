import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSortable, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSectionActions } from './SectionActionsContext';
import { useCanvasEditor } from './CanvasEditorContext';

function animateLayoutChanges(args) {
  const { isSorting, wasDragging } = args;
  if (isSorting || wasDragging) {
    return defaultAnimateLayoutChanges(args);
  }
  return false;
}

const SORTABLE_TRANSITION = {
  duration: 140,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
};

const DRAG_START_DISTANCE = 6;
const SNAP_THRESHOLD = 5;
const GUIDE_THRESHOLD = 120;

function isInteractiveTarget(target) {
  return !!(
    target?.closest?.('button') ||
    target?.tagName === 'INPUT' ||
    target?.tagName === 'TEXTAREA' ||
    target?.tagName === 'SELECT' ||
    target?.isContentEditable ||
    target?.closest?.('[contenteditable="true"]') ||
    target?.closest?.('[data-rich-text-root="true"]')
  );
}

function applyAbsoluteStyles(node, layout, zIndex) {
  if (!node || !layout) return;
  node.style.position = 'absolute';
  node.style.left = `${Math.round(layout.left)}px`;
  node.style.top = `${Math.round(layout.top)}px`;
  node.style.width = `${Math.round(layout.width)}px`;
  node.style.minHeight = `${Math.round(layout.height)}px`;
  node.style.transform = 'none';
  node.style.margin = '0';
  node.style.zIndex = String(zIndex);
}

function clearAbsoluteStyles(node) {
  if (!node) return;
  node.style.position = '';
  node.style.left = '';
  node.style.top = '';
  node.style.width = '';
  node.style.minHeight = '';
  node.style.margin = '';
  node.style.zIndex = '';
  node.style.transform = '';
  node.style.pointerEvents = '';
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return Math.max(aStart, bStart) <= Math.min(aEnd, bEnd);
}

function rangeOverlapSize(aStart, aEnd, bStart, bEnd) {
  return Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));
}

function computeSnapAndGuides({ floatingRect, targetPage, selfId, selfNode }) {
  if (!targetPage || typeof document === 'undefined') {
    return { rect: floatingRect, guides: [], gaps: [] };
  }

  const pageRect = targetPage.getBoundingClientRect();
  const candidates = Array.from(targetPage.querySelectorAll('[data-section-id]'))
    .filter((node) => node.getAttribute('data-section-id') !== String(selfId))
    .filter((node) => {
      if (!selfNode) return true;
      return !node.contains(selfNode) && !selfNode.contains(node);
    })
    .filter((node) => !node.closest('.draggable-section--drag-ghost'));

  let snappedRect = { ...floatingRect };
  let bestVertical = null;
  let bestHorizontal = null;
  let bestBlockVertical = null;
  let bestBlockHorizontal = null;
  let bestPageVertical = null;
  let bestPageHorizontal = null;
  let bestBlockReference = null;
  const guideCandidates = [];

  const pageVerticalGuides = [
    { target: pageRect.left, kind: 'page-left' },
    { target: pageRect.left + (pageRect.width / 2), kind: 'page-center' },
    { target: pageRect.right, kind: 'page-right' },
  ];
  const pageHorizontalGuides = [
    { target: pageRect.top, kind: 'page-top' },
    { target: pageRect.top + (pageRect.height / 2), kind: 'page-middle' },
    { target: pageRect.bottom, kind: 'page-bottom' },
  ];
  const floatingCenterX = floatingRect.left + (floatingRect.width / 2);
  const floatingCenterY = floatingRect.top + (floatingRect.height / 2);

  const floatingVerticalPoints = [
    { source: floatingRect.left, anchor: 'left' },
    { source: floatingRect.left + (floatingRect.width / 2), anchor: 'center' },
    { source: floatingRect.right, anchor: 'right' },
  ];
  const floatingHorizontalPoints = [
    { source: floatingRect.top, anchor: 'top' },
    { source: floatingRect.top + (floatingRect.height / 2), anchor: 'middle' },
    { source: floatingRect.bottom, anchor: 'bottom' },
  ];

  pageVerticalGuides.forEach((guide) => {
    floatingVerticalPoints.forEach((point) => {
      const delta = guide.target - point.source;
      if (Math.abs(delta) > GUIDE_THRESHOLD) return;
      guideCandidates.push({
        axis: 'vertical',
        target: guide.target,
        delta,
        kind: guide.kind,
        pageGuide: true,
      });
      if (!bestPageVertical || Math.abs(delta) < Math.abs(bestPageVertical.delta)) {
        bestPageVertical = { target: guide.target, delta, kind: guide.kind, rect: pageRect, pageGuide: true };
      }
    });
  });

  pageHorizontalGuides.forEach((guide) => {
    floatingHorizontalPoints.forEach((point) => {
      const delta = guide.target - point.source;
      if (Math.abs(delta) > GUIDE_THRESHOLD) return;
      guideCandidates.push({
        axis: 'horizontal',
        target: guide.target,
        delta,
        kind: guide.kind,
        pageGuide: true,
      });
      if (!bestPageHorizontal || Math.abs(delta) < Math.abs(bestPageHorizontal.delta)) {
        bestPageHorizontal = { target: guide.target, delta, kind: guide.kind, rect: pageRect, pageGuide: true };
      }
    });
  });

  candidates.forEach((node) => {
    const rect = node.getBoundingClientRect();
    const rectCenterX = rect.left + (rect.width / 2);
    const rectCenterY = rect.top + (rect.height / 2);
    const horizontalOverlap = rangeOverlapSize(floatingRect.left, floatingRect.right, rect.left, rect.right);
    const verticalOverlap = rangeOverlapSize(floatingRect.top, floatingRect.bottom, rect.top, rect.bottom);
    const centerDistanceX = Math.abs(floatingCenterX - rectCenterX);
    const centerDistanceY = Math.abs(floatingCenterY - rectCenterY);
    const sameContentLane = horizontalOverlap >= 24
      || centerDistanceX <= Math.max(floatingRect.width, rect.width) * 0.45;
    const nearbyStackMate = centerDistanceY <= Math.max(floatingRect.height, rect.height) * 1.5 + 160;

    if (sameContentLane && nearbyStackMate) {
      const verticalPairs = [
        { source: floatingRect.left, target: rect.left, kind: 'left-left' },
        { source: floatingRect.right, target: rect.right, kind: 'right-right' },
        { source: floatingRect.left + (floatingRect.width / 2), target: rect.left + (rect.width / 2), kind: 'center-center' },
      ];
      verticalPairs.forEach((pair) => {
        const delta = pair.target - pair.source;
        if (Math.abs(delta) > GUIDE_THRESHOLD) return;
        const score = Math.abs(delta) + (centerDistanceY * 0.12);
        guideCandidates.push({
          axis: 'vertical',
          target: pair.target,
          delta,
          kind: pair.kind,
          rect,
          score,
        });
        if (!bestBlockReference || score < bestBlockReference.score) {
          bestBlockReference = { rect, delta, score };
        }
        if (!bestBlockVertical || score < bestBlockVertical.score) {
          bestBlockVertical = { ...pair, delta, rect, pageGuide: false, score };
        }
      });
    }

    if (sameContentLane && (verticalOverlap >= 18 || nearbyStackMate)) {
      const horizontalPairs = [
        { source: floatingRect.top, target: rect.top, kind: 'top-top' },
        { source: floatingRect.bottom, target: rect.bottom, kind: 'bottom-bottom' },
        { source: floatingRect.top + (floatingRect.height / 2), target: rect.top + (rect.height / 2), kind: 'middle-middle' },
      ];
      horizontalPairs.forEach((pair) => {
        const delta = pair.target - pair.source;
        if (Math.abs(delta) > GUIDE_THRESHOLD) return;
        const score = Math.abs(delta) + (centerDistanceX * 0.12);
        guideCandidates.push({
          axis: 'horizontal',
          target: pair.target,
          delta,
          kind: pair.kind,
          rect,
          score,
        });
        if (!bestBlockReference || score < bestBlockReference.score) {
          bestBlockReference = { rect, delta, score };
        }
        if (!bestBlockHorizontal || score < bestBlockHorizontal.score) {
          bestBlockHorizontal = { ...pair, delta, rect, pageGuide: false, score };
        }
      });
    }
  });

  bestVertical = bestBlockVertical || bestPageVertical;
  bestHorizontal = bestBlockHorizontal || bestPageHorizontal;

  if (bestVertical && Math.abs(bestVertical.delta) <= SNAP_THRESHOLD) {
    snappedRect.left += bestVertical.delta;
  }
  if (bestHorizontal && Math.abs(bestHorizontal.delta) <= SNAP_THRESHOLD) {
    snappedRect.top += bestHorizontal.delta;
  }

  snappedRect.right = snappedRect.left + snappedRect.width;
  snappedRect.bottom = snappedRect.top + snappedRect.height;

  const guides = [];
  const gaps = [];

  const dedupeTargets = (items) => {
    const seen = new Set();
    return items.filter((item) => {
      const rounded = Math.round(item.target);
      if (seen.has(rounded)) return false;
      seen.add(rounded);
      return true;
    });
  };

  const verticalGuideSet = dedupeTargets(
    guideCandidates
      .filter((item) => item.axis === 'vertical')
      .sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta))
      .slice(0, 3)
  );

  const horizontalGuideSet = dedupeTargets(
    guideCandidates
      .filter((item) => item.axis === 'horizontal')
      .sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta))
      .slice(0, 3)
  );

  verticalGuideSet.forEach((guide) => {
    guides.push({
      type: 'vertical',
      x: guide.target,
      top: pageRect.top,
      length: pageRect.height,
    });
  });

  horizontalGuideSet.forEach((guide) => {
    guides.push({
      type: 'horizontal',
      y: guide.target,
      left: pageRect.left,
      length: pageRect.width,
    });
  });

  const addRectReferenceGuides = (rect) => {
    if (!rect) return;
    guides.push(
      {
        type: 'vertical',
        x: rect.left,
        top: pageRect.top,
        length: pageRect.height,
      },
      {
        type: 'vertical',
        x: rect.left + (rect.width / 2),
        top: pageRect.top,
        length: pageRect.height,
      },
      {
        type: 'vertical',
        x: rect.right,
        top: pageRect.top,
        length: pageRect.height,
      },
      {
        type: 'horizontal',
        y: rect.top,
        left: pageRect.left,
        length: pageRect.width,
      },
      {
        type: 'horizontal',
        y: rect.bottom,
        left: pageRect.left,
        length: pageRect.width,
      }
    );
  };

  const referenceRects = [
    bestBlockReference?.rect,
    bestBlockVertical && !bestBlockVertical.pageGuide ? bestBlockVertical.rect : null,
    bestBlockHorizontal && !bestBlockHorizontal.pageGuide ? bestBlockHorizontal.rect : null,
  ].filter(Boolean);

  const seenReferenceRects = new Set();
  referenceRects.forEach((rect) => {
    const key = [
      Math.round(rect.left),
      Math.round(rect.top),
      Math.round(rect.width),
      Math.round(rect.height),
    ].join(':');
    if (seenReferenceRects.has(key)) return;
    seenReferenceRects.add(key);
    addRectReferenceGuides(rect);
  });

  const dedupedGuides = [];
  const guideSeen = new Set();
  guides.forEach((guide) => {
    const key = `${guide.type}:${Math.round(guide.type === 'vertical' ? guide.x : guide.y)}`;
    if (guideSeen.has(key)) return;
    guideSeen.add(key);
    dedupedGuides.push(guide);
  });

  candidates.forEach((node) => {
    const rect = node.getBoundingClientRect();
    if (rangesOverlap(snappedRect.left, snappedRect.right, rect.left, rect.right)) {
      if (Math.abs(snappedRect.top - rect.bottom) <= 80 && snappedRect.top >= rect.bottom) {
        const gap = snappedRect.top - rect.bottom;
        gaps.push({
          type: 'vertical',
          x: Math.max(snappedRect.left, rect.left) + 16,
          top: rect.bottom,
          length: gap,
          badgeLeft: Math.max(snappedRect.left, rect.left) + 24,
          badgeTop: rect.bottom + (gap / 2) - 12,
          label: `${Math.round(gap)}px`,
        });
      }
      if (Math.abs(rect.top - snappedRect.bottom) <= 80 && rect.top >= snappedRect.bottom) {
        const gap = rect.top - snappedRect.bottom;
        gaps.push({
          type: 'vertical',
          x: Math.max(snappedRect.left, rect.left) + 16,
          top: snappedRect.bottom,
          length: gap,
          badgeLeft: Math.max(snappedRect.left, rect.left) + 24,
          badgeTop: snappedRect.bottom + (gap / 2) - 12,
          label: `${Math.round(gap)}px`,
        });
      }
    }

    if (rangesOverlap(snappedRect.top, snappedRect.bottom, rect.top, rect.bottom)) {
      if (Math.abs(snappedRect.left - rect.right) <= 80 && snappedRect.left >= rect.right) {
        const gap = snappedRect.left - rect.right;
        gaps.push({
          type: 'horizontal',
          left: rect.right,
          y: Math.max(snappedRect.top, rect.top) + 16,
          length: gap,
          badgeLeft: rect.right + (gap / 2) - 18,
          badgeTop: Math.max(snappedRect.top, rect.top) + 22,
          label: `${Math.round(gap)}px`,
        });
      }
      if (Math.abs(rect.left - snappedRect.right) <= 80 && rect.left >= snappedRect.right) {
        const gap = rect.left - snappedRect.right;
        gaps.push({
          type: 'horizontal',
          left: snappedRect.right,
          y: Math.max(snappedRect.top, rect.top) + 16,
          length: gap,
          badgeLeft: snappedRect.right + (gap / 2) - 18,
          badgeTop: Math.max(snappedRect.top, rect.top) + 22,
          label: `${Math.round(gap)}px`,
        });
      }
    }
  });

  return {
    rect: snappedRect,
    guides: dedupedGuides,
    gaps: gaps.slice(0, 2),
  };
}

function DraggableSection({ id, children, style: userStyle }) {
  const nodeRef = useRef(null);
  const dragRef = useRef(null);
  const rafRef = useRef(null);
  const [dragVisual, setDragVisual] = useState(null);
  const { removeSection } = useSectionActions();
  const canvasEditor = useCanvasEditor();
  const manualPlacementEnabled = !!canvasEditor?.manualPlacementEnabled;
  const persistedLayout = canvasEditor?.getItemLayout?.(id) || null;
  const isSelected = canvasEditor?.selectedItemId === id;
  const persistedPageNumber = Number(persistedLayout?.page || 0);
  const portalPageTarget = typeof document !== 'undefined' && persistedPageNumber > 0
    ? document.getElementById(persistedPageNumber === 1 ? 'resume-content' : `resume-page-${persistedPageNumber}`)
    : null;
  const shouldDetachToPage = !!(manualPlacementEnabled && persistedLayout && portalPageTarget);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    animateLayoutChanges,
    transition: SORTABLE_TRANSITION,
    disabled: manualPlacementEnabled,
  });

  const attachRef = useCallback((node) => {
    nodeRef.current = node;
    setNodeRef(node);
  }, [setNodeRef]);

  const style = {
    ...userStyle,
    ...(shouldDetachToPage ? {
      position: 'absolute',
      left: persistedLayout.left,
      top: persistedLayout.top,
      width: persistedLayout.width,
      minHeight: persistedLayout.height,
      margin: 0,
      transform: 'none',
    } : persistedLayout ? {
      position: 'absolute',
      left: persistedLayout.left,
      top: persistedLayout.top,
      width: persistedLayout.width,
      minHeight: persistedLayout.height,
      margin: 0,
      transform: 'none',
    } : {
      transform: transform
        ? CSS.Transform.toString({
            x: 0,
            y: transform.y,
            scaleX: 1,
            scaleY: 1,
          })
        : undefined,
      transition: isDragging ? (transition || undefined) : undefined,
      position: 'relative',
    }),
    opacity: dragVisual?.mode === 'floating' ? 0.12 : undefined,
    zIndex: persistedLayout ? 20 : (isDragging ? 50 : undefined),
    willChange: manualPlacementEnabled || isDragging ? 'left, top, transform' : undefined,
    transformOrigin: 'center top',
  };

  const canRemove = typeof id === 'string' && !id.startsWith('exp-') && typeof removeSection === 'function';

  const finishDrag = useCallback((cancelled = false) => {
    const state = dragRef.current;
    if (!state) return;
    dragRef.current = null;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    window.removeEventListener('pointermove', state.onPointerMove);
    window.removeEventListener('pointerup', state.onPointerUp);
    window.removeEventListener('pointercancel', state.onPointerCancel);

    if (!cancelled && state.dragging) {
      canvasEditor?.setItemLayout?.(id, state.currentLayout);
    } else if (!state.hadPersistedLayout) {
      clearAbsoluteStyles(nodeRef.current);
    } else {
      applyAbsoluteStyles(nodeRef.current, state.currentLayout, 20);
    }
    canvasEditor?.setDragOverlay?.(null);
    setDragVisual(null);
  }, [canvasEditor, id]);

  const beginManualDrag = useCallback((event) => {
    if (!manualPlacementEnabled || !nodeRef.current || isInteractiveTarget(event.target)) return;

    const page = nodeRef.current.closest('.a4-page');
    if (!page) return;

    const pageRect = page.getBoundingClientRect();
    const nodeRect = nodeRef.current.getBoundingClientRect();
    const scaleX = pageRect.width / page.offsetWidth || 1;
    const scaleY = pageRect.height / page.offsetHeight || 1;
    const layout = persistedLayout || {
      page: Number(page.dataset.pageNumber || 1),
      left: (nodeRect.left - pageRect.left) / scaleX,
      top: (nodeRect.top - pageRect.top) / scaleY,
      width: nodeRect.width / scaleX,
      height: nodeRect.height / scaleY,
    };

    const state = {
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      pointerOffsetX: event.clientX - nodeRect.left,
      pointerOffsetY: event.clientY - nodeRect.top,
      width: layout.width,
      height: layout.height,
      startLayout: layout,
      currentLayout: layout,
      dragging: false,
      hadPersistedLayout: !!persistedLayout,
      originPage: page,
      onPointerMove: null,
      onPointerUp: null,
      onPointerCancel: null,
    };

    state.onPointerMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - state.startPointerX;
      const deltaY = moveEvent.clientY - state.startPointerY;

      if (!state.dragging && Math.hypot(deltaX, deltaY) < DRAG_START_DISTANCE) {
        return;
      }

      if (!state.dragging) {
        canvasEditor?.selectItem?.(id);
        setDragVisual({
          mode: 'floating',
          left: nodeRect.left,
          top: nodeRect.top,
          width: nodeRect.width,
          height: nodeRect.height,
        });
      }

      state.dragging = true;
      moveEvent.preventDefault();

      const canvasPane = nodeRef.current?.closest('.editor-canvas-pane');
      if (canvasPane) {
        const paneRect = canvasPane.getBoundingClientRect();
        const edgeThreshold = 64;
        if (moveEvent.clientY > paneRect.bottom - edgeThreshold) {
          canvasPane.scrollTop += 18;
        } else if (moveEvent.clientY < paneRect.top + edgeThreshold) {
          canvasPane.scrollTop -= 18;
        }
      }

      const floatingRect = {
        left: moveEvent.clientX - state.pointerOffsetX,
        top: moveEvent.clientY - state.pointerOffsetY,
        width: state.width,
        height: state.height,
      };

      const targetElement = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
      const targetPage = targetElement?.closest?.('.a4-page') || state.originPage;
      const targetPageRect = targetPage?.getBoundingClientRect?.() || state.originPage.getBoundingClientRect();
      const targetScaleX = targetPageRect.width / targetPage.offsetWidth || 1;
      const targetScaleY = targetPageRect.height / targetPage.offsetHeight || 1;

      const nextLeft = Math.max(
        0,
        Math.min(
          (targetPageRect.width / targetScaleX) - state.width,
          (floatingRect.left - targetPageRect.left) / targetScaleX
        )
      );
      const nextTop = Math.max(
        0,
        Math.min(
          (targetPageRect.height / targetScaleY) - state.height,
          (floatingRect.top - targetPageRect.top) / targetScaleY
        )
      );

      let nextLayout = {
        page: Number(targetPage?.dataset?.pageNumber || state.startLayout.page || 1),
        left: nextLeft,
        top: nextTop,
        width: state.width,
        height: state.height,
      };

      const snapped = computeSnapAndGuides({
        floatingRect,
        targetPage,
        selfId: id,
        selfNode: nodeRef.current,
      });

      nextLayout = {
        ...nextLayout,
        left: Math.max(0, Math.min(
          (targetPageRect.width / targetScaleX) - state.width,
          (snapped.rect.left - targetPageRect.left) / targetScaleX
        )),
        top: Math.max(0, Math.min(
          (targetPageRect.height / targetScaleY) - state.height,
          (snapped.rect.top - targetPageRect.top) / targetScaleY
        )),
      };

      state.currentLayout = nextLayout;

      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        canvasEditor?.setDragOverlay?.({
          guides: snapped.guides,
          gaps: snapped.gaps,
        });
        setDragVisual({
          mode: 'floating',
          left: snapped.rect.left,
          top: snapped.rect.top,
          width: snapped.rect.width,
          height: snapped.rect.height,
        });
      });
    };

    state.onPointerUp = (upEvent) => {
      if (state.dragging) {
        upEvent.preventDefault();
      } else {
        canvasEditor?.selectItem?.(id);
      }
      finishDrag(false);
    };

    state.onPointerCancel = () => finishDrag(true);

    dragRef.current = state;
    window.addEventListener('pointermove', state.onPointerMove, { passive: false });
    window.addEventListener('pointerup', state.onPointerUp, { passive: false });
    window.addEventListener('pointercancel', state.onPointerCancel);
  }, [canvasEditor, finishDrag, id, manualPlacementEnabled, persistedLayout]);

  const handleMouseDown = useCallback((event) => {
    if (!manualPlacementEnabled) return;
    if (event.target.closest('button')) return;
    if (isInteractiveTarget(event.target)) return;
    const nearestSection = event.target.closest?.('[data-section-id]');
    if (nearestSection && nearestSection !== event.currentTarget) return;
    event.stopPropagation();
    beginManualDrag(event);
  }, [beginManualDrag, manualPlacementEnabled]);

  const handleClick = useCallback((event) => {
    if (!manualPlacementEnabled) return;
    if (event.target.closest('button')) return;
    if (isInteractiveTarget(event.target)) return;
    canvasEditor?.selectItem?.(id);
  }, [canvasEditor, id, manualPlacementEnabled]);

  const className = useMemo(() => {
    const classes = ['draggable-section'];
    if (manualPlacementEnabled) classes.push('draggable-section--freeform');
    if (isSelected) classes.push('draggable-section--selected');
    if (isDragging) classes.push('draggable-section--dragging');
    return classes.join(' ');
  }, [isDragging, isSelected, manualPlacementEnabled]);

  const renderInner = () => (
    <>
      {canRemove && (
        <button
          type="button"
          className="draggable-section-remove"
          title="Remove section"
          onClick={(event) => {
            event.stopPropagation();
            removeSection(id);
          }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          Remove
        </button>
      )}

      <div
        {...(manualPlacementEnabled ? {} : attributes)}
        {...(manualPlacementEnabled ? {} : listeners)}
        className="draggable-section-handle"
        title={manualPlacementEnabled ? 'Click and drag to move' : 'Drag to reorder sections'}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <circle cx="3" cy="1.5" r="1" />
          <circle cx="7" cy="1.5" r="1" />
          <circle cx="3" cy="5" r="1" />
          <circle cx="7" cy="5" r="1" />
          <circle cx="3" cy="8.5" r="1" />
          <circle cx="7" cy="8.5" r="1" />
        </svg>
      </div>

      {children}
    </>
  );

  const wrapper = (
    <div
      ref={attachRef}
      style={style}
      data-section-id={id}
      className={className}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {renderInner()}
    </div>
  );

  return (
    <>
      {shouldDetachToPage ? createPortal(wrapper, portalPageTarget) : wrapper}

      {dragVisual?.mode === 'floating' && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="draggable-section draggable-section--drag-ghost draggable-section--selected"
              style={{
                position: 'fixed',
                left: dragVisual.left,
                top: dragVisual.top,
                width: dragVisual.width,
                minHeight: dragVisual.height,
                margin: 0,
                zIndex: 120,
                pointerEvents: 'none',
                transform: 'none',
              }}
            >
              {children}
            </div>,
            document.body
          )
        : null}
    </>
  );
}

export default memo(DraggableSection);
