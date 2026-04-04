import { CONTACT_VARIANTS } from '../components/ContactRenderer';

const LABELS = {
  'simple-lines':   'Simple',
  'icon-list':      'Icon List',
  'boxed-rows':     'Boxed',
  'inline-compact': 'Inline',
  'divider-list':   'Divider',
};

const PREVIEWS = {
  'simple-lines':   SimpleLinesPreview,
  'icon-list':      IconListPreview,
  'boxed-rows':     BoxedRowsPreview,
  'inline-compact': InlineCompactPreview,
  'divider-list':   DividerListPreview,
};

export default function ContactStylePanel({ selected, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {CONTACT_VARIANTS.map(v => {
        const active = selected === v;
        const Preview = PREVIEWS[v];
        return (
          <button
            key={v}
            onClick={() => onSelect(v)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              padding: '10px 6px 8px',
              borderRadius: 12,
              border: active ? '1px solid var(--c-accent-border)' : '1px solid var(--c-border)',
              background: active ? 'var(--c-accent-surface)' : 'var(--c-card)',
              cursor: 'pointer',
              transition: 'all .15s ease',
            }}
          >
            <Preview active={active} />
            <span style={{
              fontSize: 10,
              fontWeight: active ? 600 : 500,
              color: active ? 'var(--c-accent)' : 'var(--c-text-muted)',
              letterSpacing: '.01em',
            }}>
              {LABELS[v]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Mini SVG previews ── */

function SimpleLinesPreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <rect x="4" y="4" width="20" height="2" rx="1" fill={c} opacity=".7" />
      <rect x="4" y="10" width="16" height="2" rx="1" fill={c} opacity=".5" />
      <rect x="4" y="16" width="22" height="2" rx="1" fill={c} opacity=".3" />
    </svg>
  );
}

function IconListPreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <text x="4" y="7" fontSize="6" fill={c} opacity=".7">✉</text>
      <rect x="12" y="4" width="18" height="2" rx="1" fill={c} opacity=".5" />
      <text x="4" y="14" fontSize="6" fill={c} opacity=".6">☎</text>
      <rect x="12" y="11" width="14" height="2" rx="1" fill={c} opacity=".4" />
      <text x="4" y="21" fontSize="6" fill={c} opacity=".5">◈</text>
      <rect x="12" y="18" width="16" height="2" rx="1" fill={c} opacity=".3" />
    </svg>
  );
}

function BoxedRowsPreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <rect x="2" y="1" width="32" height="6" rx="2" fill={c} opacity=".08" stroke={c} strokeWidth=".5" opacity=".2" />
      <rect x="6" y="3" width="14" height="2" rx="1" fill={c} opacity=".5" />
      <rect x="2" y="9" width="32" height="6" rx="2" fill={c} opacity=".06" stroke={c} strokeWidth=".5" opacity=".15" />
      <rect x="6" y="11" width="12" height="2" rx="1" fill={c} opacity=".4" />
      <rect x="2" y="17" width="32" height="6" rx="2" fill={c} opacity=".04" stroke={c} strokeWidth=".5" opacity=".1" />
      <rect x="6" y="19" width="16" height="2" rx="1" fill={c} opacity=".3" />
    </svg>
  );
}

function InlineCompactPreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <rect x="2" y="10" width="7" height="2" rx="1" fill={c} opacity=".6" />
      <line x1="11" y1="8" x2="11" y2="14" stroke={c} strokeWidth=".6" opacity=".3" />
      <rect x="13" y="10" width="9" height="2" rx="1" fill={c} opacity=".5" />
      <line x1="24" y1="8" x2="24" y2="14" stroke={c} strokeWidth=".6" opacity=".3" />
      <rect x="26" y="10" width="8" height="2" rx="1" fill={c} opacity=".4" />
    </svg>
  );
}

function DividerListPreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <text x="4" y="7" fontSize="5" fill={c} opacity=".7">✉</text>
      <rect x="11" y="4" width="18" height="2" rx="1" fill={c} opacity=".5" />
      <line x1="11" y1="9" x2="29" y2="9" stroke={c} strokeWidth=".4" opacity=".2" />
      <text x="4" y="15" fontSize="5" fill={c} opacity=".6">☎</text>
      <rect x="11" y="12" width="14" height="2" rx="1" fill={c} opacity=".4" />
      <line x1="11" y1="17" x2="25" y2="17" stroke={c} strokeWidth=".4" opacity=".15" />
      <text x="4" y="22" fontSize="5" fill={c} opacity=".5">◈</text>
      <rect x="11" y="19" width="16" height="2" rx="1" fill={c} opacity=".3" />
    </svg>
  );
}
