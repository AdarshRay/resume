import { useRef, useCallback } from 'react';
import { SHAPES } from './PhotoWidget';

/**
 * DraggablePhoto — renders a photo inside templates that users can
 * drag to reposition and scroll-wheel to zoom. Used directly in
 * template JSX instead of a plain div background-image.
 *
 * Props:
 *   photo       - dataURL string
 *   ps          - { zoom, posX, posY }
 *   onPs        - setter for ps
 *   shape       - clip-path key (square, circle, rounded, hexagon, diamond, shield)
 *   width       - container width
 *   height      - container height
 *   borderColor - optional border color
 *   borderRadius- optional explicit border-radius
 *   className   - optional additional className
 *   style       - optional additional style overrides
 */
export default function DraggablePhoto({
  photo,
  ps,
  onPs,
  shape = 'square',
  width = 120,
  height = 120,
  borderColor,
  borderRadius,
  className = '',
  style = {},
}) {
  const ref = useRef(null);

  const clip = SHAPES[shape] || 'none';
  const zoom = ps?.zoom ?? 100;
  const posX = ps?.posX ?? 50;
  const posY = ps?.posY ?? 50;

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = posX;
    const startPosY = posY;

    const handleMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (onPs) {
        onPs({
          zoom,
          posX: Math.max(0, Math.min(100, startPosX - dx * 0.4)),
          posY: Math.max(0, Math.min(100, startPosY - dy * 0.4)),
        });
      }
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [posX, posY, zoom, onPs]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -5 : 5;
    if (onPs) {
      onPs({
        posX,
        posY,
        zoom: Math.max(100, Math.min(300, zoom + delta)),
      });
    }
  }, [zoom, posX, posY, onPs]);

  if (!photo) return null;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        width,
        height,
        flexShrink: 0,
        backgroundImage: `url(${photo})`,
        backgroundSize: `${zoom}%`,
        backgroundPosition: `${posX}% ${posY}%`,
        backgroundRepeat: 'no-repeat',
        clipPath: clip === 'none' ? undefined : clip,
        border: borderColor ? `2px solid ${borderColor}` : undefined,
        borderRadius: borderRadius || (clip === 'none' ? undefined : undefined),
        cursor: onPs ? 'grab' : 'default',
        userSelect: 'none',
        ...style,
      }}
      onMouseDown={onPs ? handleMouseDown : undefined}
      onWheel={onPs ? handleWheel : undefined}
      title={onPs ? 'Drag to reposition · Scroll to zoom' : undefined}
    />
  );
}
