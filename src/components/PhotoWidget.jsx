import { useRef, useState, useCallback } from 'react';

const SHAPES = {
  square: 'none',
  circle: 'circle(50%)',
  rounded: 'inset(0 round 16px)',
  hexagon: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  shield: 'polygon(50% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%, 0% 0%)',
};

export default function PhotoWidget({ photo, onPhoto, ps, onPs, height = 120, shape = 'square', borderColor }) {
  const [hover, setHover] = useState(false);
  const fileRef = useRef(null);

  const clip = SHAPES[shape] || 'none';
  const zoom = ps?.zoom || 100;
  const posX = ps?.posX ?? 50;
  const posY = ps?.posY ?? 50;

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const startPosX = posX, startPosY = posY;
    const move = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      onPs({
        ...ps,
        posX: Math.max(0, Math.min(100, startPosX - dx * 0.3)),
        posY: Math.max(0, Math.min(100, startPosY - dy * 0.3)),
      });
    };
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, [posX, posY, ps, onPs]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const d = e.deltaY > 0 ? -5 : 5;
    onPs({ ...ps, zoom: Math.max(100, Math.min(300, zoom + d)) });
  }, [zoom, ps, onPs]);

  if (!photo) {
    return (
      <div
        onClick={() => fileRef.current?.click()}
        className="flex items-center justify-center cursor-pointer border-2 border-dashed transition-colors"
        style={{
          width: height, height,
          borderColor: borderColor ? `${borderColor}40` : 'rgba(255,255,255,.12)',
          borderRadius: shape === 'circle' ? '50%' : shape === 'rounded' ? 16 : 0,
          background: 'rgba(255,255,255,.03)',
        }}
      >
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <span style={{ color: '#555', fontSize: 11 }}>+ Photo</span>
      </div>
    );
  }

  return (
    <div
      className="relative"
      style={{ width: height, height }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        style={{
          width: '100%', height: '100%',
          clipPath: clip === 'none' ? undefined : clip,
          backgroundImage: `url(${photo})`,
          backgroundSize: `${zoom}%`,
          backgroundPosition: `${posX}% ${posY}%`,
          backgroundRepeat: 'no-repeat',
          cursor: 'move',
          border: borderColor ? `2px solid ${borderColor}` : undefined,
        }}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      />
      {hover && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1" style={{ background: 'rgba(0,0,0,.55)', clipPath: clip === 'none' ? undefined : clip }}>
          <button onClick={() => fileRef.current?.click()} className="text-white text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,.2)' }}>Change</button>
          <button onClick={() => onPhoto(null)} className="text-[10px] px-2 py-0.5 rounded" style={{ color: '#F43F5E', background: 'rgba(244,63,94,.15)' }}>Remove</button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      )}
    </div>
  );
}

export { SHAPES };
