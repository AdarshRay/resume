import { useCallback } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';

/**
 * SidebarDndContext — isolated drag-and-drop context for sidebar / right-column sections.
 * Keeps sidebar reordering completely separate from main-area reordering.
 *
 * Props:
 *   sidebarOrder    — array of section IDs (e.g. ['skills','education','certifications'])
 *   setSidebarOrder — state setter
 *   children        — sidebar content with DraggableSection wrappers using `side-` prefixed IDs
 */
export default function SidebarDndContext({ sidebarOrder, setSidebarOrder, children }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    // Strip `side-` prefix to match sidebarOrder entries
    const activeId = String(active.id).replace('side-', '');
    const overId = String(over.id).replace('side-', '');
    setSidebarOrder((prev) => {
      const oldIndex = prev.indexOf(activeId);
      const newIndex = prev.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, [setSidebarOrder]);

  // Build prefixed item list for SortableContext
  const prefixedItems = sidebarOrder.map((id) => `side-${id}`);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={prefixedItems} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}
