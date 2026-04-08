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

  const placeCaretFromPoint = useCallback((x, y) => {
    const selection = window.getSelection();
    if (!selection || !ref.current) return;

    try {
      if (typeof document.caretRangeFromPoint === 'function') {
        const range = document.caretRangeFromPoint(x, y);
        if (range) {
          selection.removeAllRanges();
          selection.addRange(range);
          return;
        }
      }

      if (typeof document.caretPositionFromPoint === 'function') {
        const position = document.caretPositionFromPoint(x, y);
        if (position) {
          const range = document.createRange();
          range.setStart(position.offsetNode, position.offset);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          return;
        }
      }
    } catch {
      // Fall back to placing the caret at the end if the browser rejects point-based placement.
    }

    selection.selectAllChildren(ref.current);
    selection.collapseToEnd();
  }, []);

  const startEditing = useCallback((e) => {
    e.stopPropagation();
    setEditing(true);
    requestAnimationFrame(() => {
      if (ref.current) {
        ref.current.focus();
        toolbar?.activateEditable?.(ref.current);
        if (typeof e.clientX === 'number' && typeof e.clientY === 'number') {
          placeCaretFromPoint(e.clientX, e.clientY);
        }
      }
    });
  }, [placeCaretFromPoint, toolbar]);

  // When editing, stop propagation so dnd-kit doesn't start a drag
  // When not editing, let the event bubble up to the drag listener
  const handleMouseDown = useCallback((e) => {
    if (editing) {
      e.stopPropagation();
    }
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

  const bulletBlockStyle = bulletBlock ? {
    display: 'block',
  } : null;

  return (
    <Tag
      ref={ref}
      contentEditable={editing}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onClick={startEditing}
      onMouseDown={handleMouseDown}
      onFocus={handleFocus}
      onInput={handleInput}
      onKeyUp={handleInput}
      onKeyDown={handleKeyDown}
      className={className}
      style={{
        margin: 0,
        ...(bulletBlockStyle || {}),
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
