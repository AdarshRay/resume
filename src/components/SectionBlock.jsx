import { useRef, useState } from 'react';

/**
 * Draggable section wrapper with grip handle and snap alignment.
 * Uses native HTML drag-and-drop for reordering resume sections.
 */
export default function SectionBlock({
  id,
  index,
  children,
  onMoveSection,
}) {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dropIndicator, setDropIndicator] = useState(null); // 'top' | 'bottom' | null

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, index }));
    // Make drag image slightly transparent
    if (ref.current) {
      e.dataTransfer.setDragImage(ref.current, 20, 20);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDropIndicator(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const midY = rect.top + rect.height / 2;
      setDropIndicator(e.clientY < midY ? 'top' : 'bottom');
    }
  };

  const handleDragLeave = () => {
    setDropIndicator(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDropIndicator(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const fromIndex = data.index;
      const rect = ref.current?.getBoundingClientRect();
      const midY = rect ? rect.top + rect.height / 2 : 0;
      const toIndex = e.clientY < midY ? index : index + 1;
      if (fromIndex !== toIndex && fromIndex !== toIndex - 1) {
        onMoveSection(fromIndex, toIndex > fromIndex ? toIndex - 1 : toIndex);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div
      ref={ref}
      className="section-block-wrapper group/section relative"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        opacity: isDragging ? 0.4 : 1,
        transition: 'opacity 0.15s, transform 0.15s',
      }}
    >
      {/* Top drop indicator */}
      {dropIndicator === 'top' && (
        <div className="snap-guide snap-guide-top" />
      )}

      {/* Drag handle */}
      <div className="drag-handle">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" opacity="0.5">
          <circle cx="3.5" cy="2" r="1.2" />
          <circle cx="8.5" cy="2" r="1.2" />
          <circle cx="3.5" cy="6" r="1.2" />
          <circle cx="8.5" cy="6" r="1.2" />
          <circle cx="3.5" cy="10" r="1.2" />
          <circle cx="8.5" cy="10" r="1.2" />
        </svg>
      </div>

      {children}

      {/* Bottom drop indicator */}
      {dropIndicator === 'bottom' && (
        <div className="snap-guide snap-guide-bottom" />
      )}
    </div>
  );
}
