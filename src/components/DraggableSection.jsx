import { memo } from 'react';
import { useSortable, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

function DraggableSection({ id, children }) {
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
  });

  const style = {
    transform: transform
      ? CSS.Transform.toString({
          x: 0,
          y: transform.y,
          scaleX: 1,
          scaleY: 1,
        })
      : undefined,
    transition: isDragging || transform ? (transition || undefined) : undefined,
    position: 'relative',
    zIndex: isDragging ? 50 : undefined,
    willChange: isDragging ? 'transform' : undefined,
    transformOrigin: 'center top',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      data-section-id={id}
      className={isDragging ? 'draggable-section draggable-section--dragging' : 'draggable-section'}
    >
      {/* Drag handle — visual indicator + keyboard a11y */}
      <div
        {...attributes}
        className="draggable-section-handle"
        title="Drag to reorder sections"
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
    </div>
  );
}

export default memo(DraggableSection);
