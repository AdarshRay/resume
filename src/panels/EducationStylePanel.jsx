import { EDUCATION_VARIANTS } from '../components/EducationRenderer';

const LABELS = {
  'simple-list':   'Simple',
  'stacked-cards': 'Cards',
  'timeline':      'Timeline',
  'compact-block': 'Compact',
  'divider-list':  'Divider',
};

const PREVIEWS = {
  'simple-list':   SimplePreview,
  'stacked-cards': CardsPreview,
  'timeline':      TimelinePreview,
  'compact-block': CompactPreview,
  'divider-list':  DividerPreview,
};

export default function EducationStylePanel({ selected, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {EDUCATION_VARIANTS.map(v => {
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

function SimplePreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <rect x="3" y="3" width="18" height="2.5" rx="1" fill={c} opacity=".7" />
      <rect x="3" y="7" width="14" height="2" rx="1" fill={c} opacity=".4" />
      <rect x="3" y="11" width="10" height="1.5" rx=".75" fill={c} opacity=".25" />
      <rect x="3" y="16" width="16" height="2.5" rx="1" fill={c} opacity=".5" />
      <rect x="3" y="20" width="12" height="2" rx="1" fill={c} opacity=".3" />
    </svg>
  );
}

function CardsPreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <rect x="2" y="1" width="32" height="10" rx="2" fill={c} opacity=".2" stroke={c} strokeWidth=".5" />
      <line x1="4" y1="1" x2="4" y2="11" stroke={c} strokeWidth="1.5" opacity=".5" />
      <rect x="7" y="3" width="16" height="2" rx="1" fill={c} opacity=".6" />
      <rect x="7" y="7" width="12" height="1.5" rx=".75" fill={c} opacity=".3" />
      <rect x="2" y="13" width="32" height="10" rx="2" fill={c} opacity=".15" stroke={c} strokeWidth=".5" />
      <line x1="4" y1="13" x2="4" y2="23" stroke={c} strokeWidth="1.5" opacity=".35" />
      <rect x="7" y="15" width="14" height="2" rx="1" fill={c} opacity=".45" />
      <rect x="7" y="19" width="10" height="1.5" rx=".75" fill={c} opacity=".25" />
    </svg>
  );
}

function TimelinePreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <circle cx="5" cy="5" r="2.5" fill={c} opacity=".6" />
      <line x1="5" y1="8" x2="5" y2="16" stroke={c} strokeWidth=".8" opacity=".25" />
      <rect x="10" y="3" width="16" height="2" rx="1" fill={c} opacity=".6" />
      <rect x="10" y="7" width="12" height="1.5" rx=".75" fill={c} opacity=".3" />
      <circle cx="5" cy="19" r="2.5" fill={c} opacity=".4" />
      <rect x="10" y="17" width="14" height="2" rx="1" fill={c} opacity=".45" />
      <rect x="10" y="21" width="10" height="1.5" rx=".75" fill={c} opacity=".25" />
    </svg>
  );
}

function CompactPreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <rect x="3" y="3" width="16" height="2.5" rx="1" fill={c} opacity=".7" />
      <rect x="25" y="3.5" width="8" height="1.5" rx=".75" fill={c} opacity=".3" />
      <rect x="3" y="7" width="14" height="2" rx="1" fill={c} opacity=".4" />
      <rect x="3" y="14" width="14" height="2.5" rx="1" fill={c} opacity=".5" />
      <rect x="25" y="14.5" width="8" height="1.5" rx=".75" fill={c} opacity=".25" />
      <rect x="3" y="18" width="12" height="2" rx="1" fill={c} opacity=".3" />
    </svg>
  );
}

function DividerPreview({ active }) {
  const c = active ? '#00E5A0' : '#555';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24">
      <rect x="3" y="2" width="18" height="2.5" rx="1" fill={c} opacity=".7" />
      <rect x="3" y="6" width="14" height="2" rx="1" fill={c} opacity=".4" />
      <rect x="3" y="10" width="10" height="1.5" rx=".75" fill={c} opacity=".25" />
      <line x1="3" y1="14" x2="33" y2="14" stroke={c} strokeWidth=".5" opacity=".2" />
      <rect x="3" y="16" width="16" height="2.5" rx="1" fill={c} opacity=".5" />
      <rect x="3" y="20" width="12" height="2" rx="1" fill={c} opacity=".3" />
    </svg>
  );
}
