import { memo, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';

/**
 * DroppableColumn — wrapper that makes a column a valid drop target
 * for cross-column dragging. When all items are dragged out,
 * the column itself remains droppable so items can be dragged back.
 */
function DroppableColumn({ id, children, style, className }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const mergedStyle = useMemo(() => ({
    ...style,
    outline: isOver ? '2px dashed rgba(0,229,160,.5)' : undefined,
    outlineOffset: isOver ? -2 : undefined,
    boxShadow: isOver ? 'inset 0 0 0 9999px rgba(0,229,160,.03)' : style?.boxShadow,
    transition: 'outline .15s ease, box-shadow .15s ease',
  }), [style, isOver]);

  return (
    <div
      id={id}
      ref={setNodeRef}
      style={mergedStyle}
      className={`${className || ''}${isOver ? ' droppable-column--over' : ''}`}
      data-droppable-over={isOver ? 'true' : undefined}
    >
      {children}
    </div>
  );
}

export default memo(DroppableColumn);
