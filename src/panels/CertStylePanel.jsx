import { CERT_VARIANTS } from '../components/rendererVariants';

const LABELS = {
  'simple-list':  'Bullet List',
  'badge-tags':   'Badges',
  'check-list':   'Checkmarks',
  'compact-rows': 'Compact',
};

const PREVIEWS = {
  'simple-list':  BulletPreview,
  'badge-tags':   BadgePreview,
  'check-list':   CheckPreview,
  'compact-rows': CompactPreview,
};

export default function CertStylePanel({ selected, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {CERT_VARIANTS.map(v => {
        const active = selected === v;
        const Preview = PREVIEWS[v];
        return (
          <button
            key={v}
            onClick={() => onSelect(v)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '10px 6px 8px', borderRadius: 12,
              border: active ? '1px solid var(--c-accent-border)' : '1px solid var(--c-border)',
              background: active ? 'var(--c-accent-surface)' : 'var(--c-card)',
              cursor: 'pointer', transition: 'all .15s ease',
            }}
          >
            <Preview active={active} />
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 500, color: active ? 'var(--c-accent)' : 'var(--c-text-muted)', letterSpacing: '.01em' }}>
              {LABELS[v]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function BulletPreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <polygon points="4,4 7,6 4,8" fill={c} opacity=".7" />
      <rect x="10" y="5" width="20" height="2" rx="1" fill={c} opacity=".5" />
      <polygon points="4,12 7,14 4,16" fill={c} opacity=".5" />
      <rect x="10" y="13" width="16" height="2" rx="1" fill={c} opacity=".4" />
      <polygon points="4,19 7,21 4,23" fill={c} opacity=".35" />
      <rect x="10" y="20" width="18" height="2" rx="1" fill={c} opacity=".3" />
    </svg>
  );
}

function BadgePreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <rect x="1" y="3" width="16" height="7" rx="3.5" fill={c} opacity=".3" stroke={c} strokeWidth=".5" />
      <rect x="4" y="5.5" width="10" height="2" rx="1" fill={c} opacity=".5" />
      <rect x="19" y="3" width="16" height="7" rx="3.5" fill={c} opacity=".25" stroke={c} strokeWidth=".5" />
      <rect x="22" y="5.5" width="10" height="2" rx="1" fill={c} opacity=".4" />
      <rect x="1" y="14" width="18" height="7" rx="3.5" fill={c} opacity=".2" stroke={c} strokeWidth=".5" />
      <rect x="4" y="16.5" width="12" height="2" rx="1" fill={c} opacity=".35" />
    </svg>
  );
}

function CheckPreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <path d="M3 5.5 L4.5 7 L7 4" stroke={c} strokeWidth="1.2" fill="none" opacity=".7" />
      <rect x="10" y="4" width="20" height="2" rx="1" fill={c} opacity=".5" />
      <path d="M3 12.5 L4.5 14 L7 11" stroke={c} strokeWidth="1.2" fill="none" opacity=".5" />
      <rect x="10" y="11" width="16" height="2" rx="1" fill={c} opacity=".4" />
      <path d="M3 19.5 L4.5 21 L7 18" stroke={c} strokeWidth="1.2" fill="none" opacity=".35" />
      <rect x="10" y="18" width="18" height="2" rx="1" fill={c} opacity=".3" />
    </svg>
  );
}

function CompactPreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <rect x="3" y="4" width="22" height="2" rx="1" fill={c} opacity=".6" />
      <line x1="3" y1="9" x2="33" y2="9" stroke={c} strokeWidth=".4" opacity=".2" />
      <rect x="3" y="12" width="18" height="2" rx="1" fill={c} opacity=".45" />
      <line x1="3" y1="17" x2="33" y2="17" stroke={c} strokeWidth=".4" opacity=".15" />
      <rect x="3" y="20" width="20" height="2" rx="1" fill={c} opacity=".3" />
    </svg>
  );
}
