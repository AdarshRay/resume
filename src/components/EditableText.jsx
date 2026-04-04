import { useRef, useState, useCallback } from 'react';

export default function EditableText({ value, onChange, tag = 'span', style, className = '', multiline, placeholder }) {
  const ref = useRef(null);
  const [editing, setEditing] = useState(false);
  const Tag = tag;

  const handleBlur = useCallback(() => {
    if (ref.current) {
      const text = ref.current[multiline ? 'innerText' : 'textContent'];
      if (text !== value) onChange(text);
    }
    setEditing(false);
  }, [value, onChange, multiline]);

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    setEditing(true);
    // Focus after React re-renders with contentEditable=true
    requestAnimationFrame(() => {
      if (ref.current) {
        ref.current.focus();
        // Place cursor at click position via selection
        const sel = window.getSelection();
        if (sel && ref.current.childNodes.length > 0) {
          try {
            const range = document.caretRangeFromPoint(e.clientX, e.clientY);
            if (range) {
              sel.removeAllRanges();
              sel.addRange(range);
            }
          } catch {
            // Fallback: select all text
            sel.selectAllChildren(ref.current);
            sel.collapseToEnd();
          }
        }
      }
    });
  }, []);

  // When editing, stop propagation so dnd-kit doesn't start a drag
  // When not editing, let the event bubble up to the drag listener
  const handleMouseDown = useCallback((e) => {
    if (editing) {
      e.stopPropagation();
    }
  }, [editing]);

  return (
    <Tag
      ref={ref}
      contentEditable={editing}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      className={className}
      style={{
        ...style,
        cursor: editing ? 'text' : 'inherit',
        userSelect: editing ? 'text' : 'none',
        WebkitUserSelect: editing ? 'text' : 'none',
      }}
      data-placeholder={placeholder}
      data-editing={editing ? 'true' : undefined}
    >
      {value}
    </Tag>
  );
}
