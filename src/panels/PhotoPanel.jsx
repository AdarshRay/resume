const SHAPE_LIST = ['square', 'circle', 'rounded', 'hexagon', 'diamond', 'shield'];

const SHAPE_ICONS = {
  square: '◻', circle: '●', rounded: '▢',
  hexagon: '⬡', diamond: '◆', shield: '🛡',
};

export default function PhotoPanel({ photo, onPhoto, ps, onPs, shape, onShape }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-base)' }}>
      {/* Upload area */}
      <label
        className="flex flex-col items-center justify-center py-5 rounded-xl cursor-pointer transition-all hover:border-[var(--c-accent-border)]"
        style={{
          border: '1px dashed var(--c-border-hover)',
          background: 'var(--c-card)',
        }}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) {
              const r = new FileReader();
              r.onload = ev => onPhoto(ev.target.result);
              r.readAsDataURL(f);
            }
          }}
        />
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span className="text-[11px] mt-2 font-medium" style={{ color: 'var(--c-text-faint)' }}>
          {photo ? 'Change photo' : 'Upload photo'}
        </span>
      </label>

      {photo && (
        <>
          {/* Zoom slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-medium" style={{ color: 'var(--c-text-dim)' }}>Zoom</label>
              <span className="text-[10px] font-mono" style={{ color: 'var(--c-text-faint)' }}>{ps.zoom}%</span>
            </div>
            <input
              type="range" min="100" max="300" value={ps.zoom}
              onChange={e => onPs({ ...ps, zoom: +e.target.value })}
              className="w-full accent-green-400 h-1"
            />
          </div>

          {/* Position sliders */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-medium" style={{ color: 'var(--c-text-dim)' }}>X Position</label>
                <span className="text-[10px] font-mono" style={{ color: 'var(--c-text-faint)' }}>{ps.posX}</span>
              </div>
              <input
                type="range" min="0" max="100" value={ps.posX}
                onChange={e => onPs({ ...ps, posX: +e.target.value })}
                className="w-full accent-green-400 h-1"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-medium" style={{ color: 'var(--c-text-dim)' }}>Y Position</label>
                <span className="text-[10px] font-mono" style={{ color: 'var(--c-text-faint)' }}>{ps.posY}</span>
              </div>
              <input
                type="range" min="0" max="100" value={ps.posY}
                onChange={e => onPs({ ...ps, posY: +e.target.value })}
                className="w-full accent-green-400 h-1"
              />
            </div>
          </div>

          {/* Shape picker */}
          <div>
            <label className="text-[10px] font-medium mb-2 block" style={{ color: 'var(--c-text-dim)' }}>Shape</label>
            <div className="grid grid-cols-3 gap-2">
              {SHAPE_LIST.map(s => (
                <button
                  key={s}
                  onClick={() => onShape(s)}
                  className="py-2 rounded-xl text-[10px] capitalize transition-all font-medium"
                  style={{
                    background: shape === s ? 'var(--c-accent-surface)' : 'var(--c-card)',
                    border: `1px solid ${shape === s ? 'var(--c-accent-border)' : 'var(--c-border)'}`,
                    color: shape === s ? 'var(--c-accent)' : 'var(--c-text-muted)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Remove */}
          <button
            onClick={() => onPhoto(null)}
            className="sp-destructive-btn"
          >
            Remove photo
          </button>
        </>
      )}
    </div>
  );
}
