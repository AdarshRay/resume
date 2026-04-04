const SWATCHES = ['#00E5A0','#3B82F6','#F43F5E','#F59E0B','#A78BFA','#38BDF8','#EC4899','#10B981','#C9A84C','#64748B','#1B2A4A','#0f172a','#1a1a2e','#333','#ffffff','#f8f6f0'];

const CHANNELS = [
  { key: 'accent', label: 'Accent Color' },
  { key: 'sidebar', label: 'Sidebar / Header BG' },
  { key: 'heading', label: 'Heading Text' },
  { key: 'text', label: 'Body Text' },
  { key: 'background', label: 'Background' },
];

function Channel({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 'var(--space-base)' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-sm)' }}>
        <label className="text-[10px] font-medium" style={{ color: 'var(--c-text-sub)' }}>{label}</label>
        {value && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: value, border: '1px solid var(--c-border)' }} />
            <span className="text-[9px] font-mono" style={{ color: 'var(--c-text-faint)' }}>{value}</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SWATCHES.map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className="w-5 h-5 rounded-full transition-all hover:scale-110"
            style={{
              background: c,
              border: c === value ? '2.5px solid var(--c-accent)' : '1px solid var(--c-border)',
              transform: c === value ? 'scale(1.2)' : undefined,
              boxShadow: c === value ? '0 0 8px var(--c-accent-glow)' : undefined,
            }}
          />
        ))}
        <label
          className="w-5 h-5 rounded-full overflow-hidden cursor-pointer relative hover:scale-110 transition-transform"
          style={{ background: 'conic-gradient(red,yellow,lime,aqua,blue,magenta,red)' }}
          title="Custom color"
        >
          <input
            type="color"
            value={value || '#000'}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}

export default function ColorPanel({ colors, setColors, defaults }) {
  return (
    <div>
      {CHANNELS.map(ch => (
        <Channel
          key={ch.key}
          label={ch.label}
          value={colors[ch.key]}
          onChange={v => setColors(prev => ({ ...prev, [ch.key]: v }))}
        />
      ))}
      <button
        onClick={() => setColors(defaults)}
        className="sp-destructive-btn"
        style={{ marginTop: 4 }}
      >
        Reset to defaults
      </button>
    </div>
  );
}
