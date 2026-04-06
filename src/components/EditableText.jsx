import { useRef, useState, useCallback, useEffect } from 'react';
import { useRichTextToolbar } from './useRichTextToolbar';
import { sanitizeRichText, serializeRichText } from '../utils/richText';

export default function EditableText({ value, onChange, tag = 'span', style, className = '', multiline, placeholder, bulletBlock = false }) {
  const ref = useRef(null);
  const [editing, setEditing] = useState(false);
  const Tag = tag;
  const toolbar = useRichTextToolbar();

  useEffect(() => {
    if (!ref.current) return;
    const nextHtml = sanitizeRichText(value, { multiline });
    if (ref.current.innerHTML !== nextHtml) {
      ref.current.innerHTML = nextHtml;
    }
  }, [value, multiline]);

  useEffect(() => {
    if (!ref.current) return undefined;
    const element = ref.current;
    const handleRichTextReplace = () => {
      const nextHtml = element.getAttribute('data-pending-richtext');
      if (!nextHtml) return;
      element.innerHTML = nextHtml;
      element.removeAttribute('data-pending-richtext');
      const nextValue = serializeRichText(element, { multiline });
      onChange(nextValue);
    };
    element.addEventListener('richtext-replace', handleRichTextReplace);
    return () => element.removeEventListener('richtext-replace', handleRichTextReplace);
  }, [multiline, onChange]);

  const handleBlur = useCallback(() => {
    if (toolbar?.isToolbarInteracting?.()) {
      return;
    }
    if (ref.current) {
      const text = serializeRichText(ref.current, { multiline });
      if (text !== value) onChange(text);
    }
    setEditing(false);
    toolbar?.deactivateEditable?.(ref.current);
  }, [value, onChange, multiline, toolbar]);

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    setEditing(true);
    // Focus after React re-renders with contentEditable=true
    requestAnimationFrame(() => {
      if (ref.current) {
        ref.current.focus();
        toolbar?.activateEditable?.(ref.current);
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
  }, [toolbar]);

  // When editing, stop propagation so dnd-kit doesn't start a drag
  // When not editing, let the event bubble up to the drag listener
  const handleMouseDown = useCallback((e) => {
    e.stopPropagation();
  }, [editing]);

  const handleFocus = useCallback(() => {
    if (editing && ref.current) {
      toolbar?.activateEditable?.(ref.current);
    }
  }, [editing, toolbar]);

  const handleInput = useCallback(() => {
    toolbar?.refreshState?.();
  }, [toolbar]);

  const handleKeyDown = useCallback((e) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      ref.current?.blur();
    }
  }, [multiline]);

  return (
    <Tag
      ref={ref}
      contentEditable={editing}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onFocus={handleFocus}
      onInput={handleInput}
      onKeyUp={handleInput}
      onKeyDown={handleKeyDown}
      className={className}
      style={{
        margin: 0,
        ...style,
        cursor: 'text',
        userSelect: 'text',
        WebkitUserSelect: 'text',
      }}
      data-rich-text-root="true"
      data-bullet-block={bulletBlock ? 'true' : undefined}
      data-multiline={multiline ? 'true' : undefined}
      data-placeholder={placeholder}
      data-editing={editing ? 'true' : undefined}
    />
  );
}
