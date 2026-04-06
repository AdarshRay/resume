const SIZES = [8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72];
const FAMILIES = [
  { name: 'Outfit', val: "'Outfit',sans-serif" },
  { name: 'Newsreader', val: "'Newsreader',serif" },
  { name: 'JetBrains Mono', val: "'JetBrains Mono',monospace" },
  { name: 'Georgia', val: "Georgia,serif" },
  { name: 'Playfair Display', val: "'Playfair Display',serif" },
  { name: 'Lora', val: "'Lora',serif" },
  { name: 'Merriweather', val: "'Merriweather',serif" },
  { name: 'Raleway', val: "'Raleway',sans-serif" },
];

export default function FontPanel({ globalFont, setGlobalFont }) {
  const { size, family } = globalFont;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Size */}
      <div>
        <label className="text-[10px] font-medium mb-2 block" style={{ color: 'var(--c-text-dim)' }}>
          Font Size{size ? <span style={{ color: 'var(--c-accent)' }}> &middot; {size}px</span> : ''}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map(s => (
            <button
              key={s}
              onClick={() => setGlobalFont({ ...globalFont, size: s })}
              className="w-8 h-7 rounded-[10px] text-[10px] font-medium transition-all"
              style={{
                background: size === s ? 'var(--c-accent-surface)' : 'var(--c-card)',
                border: `1px solid ${size === s ? 'var(--c-accent-border)' : 'var(--c-border)'}`,
                color: size === s ? 'var(--c-accent)' : 'var(--c-text-muted)',
              }}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Family */}
      <div>
        <label className="text-[10px] font-medium mb-2 block" style={{ color: 'var(--c-text-dim)' }}>Font Family</label>
        <div className="space-y-1.5">
          {FAMILIES.map(f => (
            <button
              key={f.name}
              onClick={() => setGlobalFont({ ...globalFont, family: f.val })}
              className="w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-medium transition-all"
              style={{
                fontFamily: f.val,
                background: family === f.val ? 'var(--c-accent-surface)' : 'var(--c-card)',
                border: `1px solid ${family === f.val ? 'var(--c-accent-border)' : 'var(--c-border)'}`,
                color: family === f.val ? 'var(--c-accent)' : 'var(--c-text-muted)',
              }}
            >{f.name}</button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() => setGlobalFont({ size: null, family: null })}
        className="sp-destructive-btn"
      >
        Reset to default
      </button>
    </div>
  );
}
