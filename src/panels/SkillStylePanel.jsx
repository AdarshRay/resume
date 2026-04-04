import { SKILL_VARIANTS } from '../components/SkillsRenderer';

const LABELS = {
  'simple-list':  'Simple List',
  'bullet-list':  'Bullet List',
  'pill-outline': 'Pill Outline',
  'pill-filled':  'Pill Filled',
  'compact-grid': 'Compact Grid',
  'underline-list': 'Underline',
  'centered-list': 'Centered',
  'badge-soft': 'Soft Badge',
  'two-column-list': 'Two Column',
  'icon-list': 'Checkmarks',
  'minimal-divider-list': 'Divider',
};

/* Tiny inline previews for each variant */
const PREVIEWS = {
  'simple-list':  SimplePreview,
  'bullet-list':  BulletPreview,
  'pill-outline': PillOutlinePreview,
  'pill-filled':  PillFilledPreview,
  'compact-grid': GridPreview,
  'underline-list': UnderlinePreview,
  'centered-list': CenteredPreview,
  'badge-soft': BadgeSoftPreview,
  'two-column-list': TwoColumnPreview,
  'icon-list': IconPreview,
  'minimal-divider-list': DividerPreview,
};

export default function SkillStylePanel({ selected, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {SKILL_VARIANTS.map(v => {
        const active = selected === v;
        const Preview = PREVIEWS[v];
        return (
          <button
            key={v}
            onClick={() => onSelect(v)}
            className="style-selector-btn"
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

function SimplePreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <rect x="4" y="4" width="20" height="2" rx="1" fill={c} opacity=".7" />
      <rect x="4" y="10" width="16" height="2" rx="1" fill={c} opacity=".5" />
      <rect x="4" y="16" width="22" height="2" rx="1" fill={c} opacity=".3" />
    </svg>
  );
}

function BulletPreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <circle cx="6" cy="5" r="1.5" fill={c} opacity=".7" />
      <rect x="10" y="4" width="18" height="2" rx="1" fill={c} opacity=".5" />
      <circle cx="6" cy="12" r="1.5" fill={c} opacity=".7" />
      <rect x="10" y="11" width="14" height="2" rx="1" fill={c} opacity=".5" />
      <circle cx="6" cy="19" r="1.5" fill={c} opacity=".7" />
      <rect x="10" y="18" width="20" height="2" rx="1" fill={c} opacity=".5" />
    </svg>
  );
}

function PillOutlinePreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <rect x="2" y="2" width="14" height="8" rx="3" fill="none" stroke={c} strokeWidth=".8" opacity=".7" />
      <rect x="18" y="2" width="16" height="8" rx="3" fill="none" stroke={c} strokeWidth=".8" opacity=".5" />
      <rect x="2" y="14" width="18" height="8" rx="3" fill="none" stroke={c} strokeWidth=".8" opacity=".4" />
      <rect x="22" y="14" width="12" height="8" rx="3" fill="none" stroke={c} strokeWidth=".8" opacity=".3" />
    </svg>
  );
}

function PillFilledPreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <rect x="2" y="2" width="14" height="8" rx="4" fill={c} opacity=".6" />
      <rect x="18" y="2" width="16" height="8" rx="4" fill={c} opacity=".4" />
      <rect x="2" y="14" width="18" height="8" rx="4" fill={c} opacity=".3" />
      <rect x="22" y="14" width="12" height="8" rx="4" fill={c} opacity=".2" />
    </svg>
  );
}

function GridPreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <circle cx="5" cy="5" r="1" fill={c} opacity=".6" />
      <rect x="8" y="4" width="8" height="2" rx="1" fill={c} opacity=".5" />
      <circle cx="21" cy="5" r="1" fill={c} opacity=".6" />
      <rect x="24" y="4" width="10" height="2" rx="1" fill={c} opacity=".5" />
      <circle cx="5" cy="12" r="1" fill={c} opacity=".4" />
      <rect x="8" y="11" width="10" height="2" rx="1" fill={c} opacity=".4" />
      <circle cx="21" cy="12" r="1" fill={c} opacity=".4" />
      <rect x="24" y="11" width="7" height="2" rx="1" fill={c} opacity=".4" />
      <circle cx="5" cy="19" r="1" fill={c} opacity=".3" />
      <rect x="8" y="18" width="6" height="2" rx="1" fill={c} opacity=".3" />
      <circle cx="21" cy="19" r="1" fill={c} opacity=".3" />
      <rect x="24" y="18" width="9" height="2" rx="1" fill={c} opacity=".3" />
    </svg>
  );
}

function UnderlinePreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <rect x="3" y="5" width="12" height="2" rx="1" fill={c} opacity=".6" />
      <line x1="3" y1="9" x2="15" y2="9" stroke={c} strokeWidth=".8" opacity=".4" />
      <rect x="19" y="5" width="14" height="2" rx="1" fill={c} opacity=".5" />
      <line x1="19" y1="9" x2="33" y2="9" stroke={c} strokeWidth=".8" opacity=".35" />
      <rect x="3" y="15" width="16" height="2" rx="1" fill={c} opacity=".4" />
      <line x1="3" y1="19" x2="19" y2="19" stroke={c} strokeWidth=".8" opacity=".3" />
    </svg>
  );
}

function CenteredPreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <rect x="6" y="5" width="8" height="2" rx="1" fill={c} opacity=".6" />
      <circle cx="17" cy="6" r=".8" fill={c} opacity=".3" />
      <rect x="20" y="5" width="10" height="2" rx="1" fill={c} opacity=".5" />
      <rect x="4" y="12" width="10" height="2" rx="1" fill={c} opacity=".4" />
      <circle cx="17" cy="13" r=".8" fill={c} opacity=".3" />
      <rect x="20" y="12" width="12" height="2" rx="1" fill={c} opacity=".35" />
    </svg>
  );
}

function BadgeSoftPreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <rect x="2" y="2" width="14" height="8" rx="3" fill={c} opacity=".15" />
      <rect x="4" y="5" width="10" height="2" rx="1" fill={c} opacity=".6" />
      <rect x="18" y="2" width="16" height="8" rx="3" fill={c} opacity=".1" />
      <rect x="20" y="5" width="12" height="2" rx="1" fill={c} opacity=".5" />
      <rect x="2" y="14" width="18" height="8" rx="3" fill={c} opacity=".08" />
      <rect x="4" y="17" width="14" height="2" rx="1" fill={c} opacity=".4" />
    </svg>
  );
}

function TwoColumnPreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <circle cx="4" cy="5" r="1.2" fill={c} opacity=".6" />
      <rect x="7" y="4" width="10" height="2" rx="1" fill={c} opacity=".5" />
      <circle cx="21" cy="5" r="1.2" fill={c} opacity=".6" />
      <rect x="24" y="4" width="8" height="2" rx="1" fill={c} opacity=".5" />
      <circle cx="4" cy="12" r="1.2" fill={c} opacity=".45" />
      <rect x="7" y="11" width="8" height="2" rx="1" fill={c} opacity=".4" />
      <circle cx="21" cy="12" r="1.2" fill={c} opacity=".45" />
      <rect x="24" y="11" width="10" height="2" rx="1" fill={c} opacity=".4" />
      <circle cx="4" cy="19" r="1.2" fill={c} opacity=".3" />
      <rect x="7" y="18" width="10" height="2" rx="1" fill={c} opacity=".3" />
    </svg>
  );
}

function IconPreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <path d="M4 5.5 L5.5 7 L8 4" stroke={c} strokeWidth="1.2" fill="none" opacity=".7" />
      <rect x="11" y="4" width="18" height="2" rx="1" fill={c} opacity=".5" />
      <path d="M4 12.5 L5.5 14 L8 11" stroke={c} strokeWidth="1.2" fill="none" opacity=".5" />
      <rect x="11" y="11" width="14" height="2" rx="1" fill={c} opacity=".4" />
      <path d="M4 19.5 L5.5 21 L8 18" stroke={c} strokeWidth="1.2" fill="none" opacity=".35" />
      <rect x="11" y="18" width="20" height="2" rx="1" fill={c} opacity=".3" />
    </svg>
  );
}

function DividerPreview({ active }) {
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
