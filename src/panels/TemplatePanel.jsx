import { memo, useMemo, useDeferredValue } from 'react';
import { DndContext } from '@dnd-kit/core';

const TEMPLATES = [
  { id: 'designer-slate', name: 'Designer Slate', desc: 'Portfolio look · Editorial sidebar' },
  { id: 'executive-navy', name: 'Executive Navy', desc: 'Dark sidebar · Gold accents' },
  { id: 'bold-coral', name: 'Bold Coral', desc: 'Gradient banner · Bold type' },
  { id: 'dev-terminal', name: 'Dev Terminal', desc: 'Dark mono · Code-inspired' },
  { id: 'strategist-gold', name: 'Portrait Arc', desc: 'Curved portrait · Bold sidebar' },
  { id: 'clean-slate', name: 'Clean Slate', desc: 'Centered · Minimal layout' },
];

// A4 dimensions that templates render at
const A4_W = 794;
const A4_H = 1123;

// Preview frame — compact for 2-column grid inside 340px panel
const PREVIEW_H = 155;
const PAGE_INSET = 4;
// Scale: A4 fits within ~130px card content width
const PREVIEW_SCALE_BASE = 130;

const SCALE = PREVIEW_SCALE_BASE / A4_W;

// Stable no-op function — shared across all previews, never causes re-render
const NOOP = () => {};

// Inert collision detection — never returns collisions
const inertCollision = () => [];

/**
 * MiniPreview — renders a single template at thumbnail scale.
 * Wrapped in React.memo so it only re-renders when its specific props change.
 */
const MiniPreview = memo(function MiniPreview({ templateComp, colors, data, photo, photoSettings, photoShape, globalFont, sectionOrder, sidebarOrder, skillStyle, contactStyle, educationStyle, certificationStyle, sectionLabels }) {
  const TemplateComponent = templateComp;
  return (
    <div
      className="tpl-preview-frame"
      style={{
        width: '100%',
        height: PREVIEW_H,
        contentVisibility: 'auto',
        containIntrinsicSize: `auto ${PREVIEW_H}px`,
      }}
    >
      <div
        className="tpl-preview-page"
        style={{
          width: A4_W,
          height: A4_H,
          transform: `scale(${SCALE})`,
          transformOrigin: 'top left',
          top: PAGE_INSET,
          left: PAGE_INSET,
          borderRadius: `${3 / SCALE}px`,
        }}
      >
        <TemplateComponent
          data={data}
          photo={photo}
          photoSettings={photoSettings}
          onPhotoSettings={NOOP}
          photoShape={photoShape}
          colors={colors}
          globalFont={globalFont}
          onEdit={NOOP}
          sectionOrder={sectionOrder}
          sidebarOrder={sidebarOrder}
          skillStyle={skillStyle}
          contactStyle={contactStyle}
          educationStyle={educationStyle}
          certificationStyle={certificationStyle}
          sectionLabels={sectionLabels}
        />
      </div>
    </div>
  );
});

export default function TemplatePanel({
  selected,
  onSelect,
  templateMap,
  data,
  photo,
  photoSettings,
  photoShape,
  colors,
  globalFont,
  sectionOrder,
  sidebarOrder,
  skillStyle,
  contactStyle,
  educationStyle,
  certificationStyle,
  sectionLabels,
  templateDefaults,
}) {
  // Defer data so mini previews update at lower priority than the main editor
  const deferredData = useDeferredValue(data);
  const deferredPhoto = useDeferredValue(photo);
  const deferredGlobalFont = useDeferredValue(globalFont);

  // Pre-compute colors per template (stable unless templateDefaults/colors change)
  const colorsByTemplate = useMemo(() => {
    const map = {};
    for (const t of TEMPLATES) {
      map[t.id] = templateDefaults?.[t.id] || colors;
    }
    return map;
  }, [templateDefaults, colors]);

  return (
    // Single inert DndContext — provides the context DnD hooks need but with
    // no sensors and no collision detection, so zero drag overhead.
    <DndContext collisionDetection={inertCollision}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {TEMPLATES.map(t => {
          const isActive = selected === t.id;
          const Comp = templateMap?.[t.id];
          return (
            <div
              key={t.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(t.id)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(t.id); } }}
              className={`template-card text-left ${isActive ? 'template-card--active' : ''}`}
              style={{
                background: isActive ? 'var(--c-accent-surface)' : 'var(--c-card)',
                border: `1px solid ${isActive ? 'var(--c-accent)' : 'var(--c-border)'}`,
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              {/* Live mini preview */}
              <div style={{ padding: '8px 8px 0' }}>
                {Comp ? (
                  <MiniPreview
                    templateComp={Comp}
                    colors={colorsByTemplate[t.id]}
                    data={deferredData}
                    photo={deferredPhoto}
                    photoSettings={photoSettings}
                    photoShape={photoShape}
                    globalFont={deferredGlobalFont}
                    sectionOrder={sectionOrder}
                    sidebarOrder={sidebarOrder}
                    skillStyle={skillStyle}
                    contactStyle={contactStyle}
                    educationStyle={educationStyle}
                    certificationStyle={certificationStyle}
                    sectionLabels={sectionLabels}
                  />
                ) : (
                  <div className="tpl-preview-frame" style={{ width: '100%', height: PREVIEW_H, background: 'var(--c-surface-alt)' }} />
                )}
              </div>

              {/* Card info */}
              <div style={{ padding: '8px 10px 10px' }}>
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 650,
                    lineHeight: 1.2,
                    letterSpacing: '-0.01em',
                    color: isActive ? 'var(--c-accent)' : 'var(--c-text)',
                  }}
                >
                  {t.name}
                </div>
                <div
                  style={{
                    fontSize: 9.5,
                    marginTop: 3,
                    color: 'var(--c-text-faint)',
                    lineHeight: 1.35,
                  }}
                >
                  {t.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DndContext>
  );
}
