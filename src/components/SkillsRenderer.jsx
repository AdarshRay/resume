import EditableText from './EditableText';
import AddButton from './AddButton';
import DeleteButton from './DeleteButton';

/**
 * Shared skill-list renderer.
 *
 * Props
 * ─────
 * skills        – string[]
 * onEdit        – editor callback  (key, payload)
 * variant       – "simple-list" | "bullet-list" | "pill-outline" | "pill-filled" | "compact-grid"
 *                  "underline-list" | "centered-list" | "badge-soft" | "two-column-list" | "icon-list" | "minimal-divider-list"
 * accentColor   – hex colour used for accents / pill bg
 * textColor     – primary text colour
 * fontSize      – base font size (number, px)
 * fontFamily    – optional font-family override
 */

const VARIANTS = {
  'simple-list':  SimpleList,
  'bullet-list':  BulletList,
  'pill-outline': PillOutline,
  'pill-filled':  PillFilled,
  'compact-grid': CompactGrid,
  'underline-list': UnderlineList,
  'centered-list': CenteredList,
  'badge-soft': BadgeSoft,
  'two-column-list': TwoColumnList,
  'icon-list': IconList,
  'minimal-divider-list': MinimalDividerList,
};

export const SKILL_VARIANTS = Object.keys(VARIANTS);

export default function SkillsRenderer({
  skills = [],
  onEdit,
  variant = 'pill-outline',
  accentColor = '#3B82F6',
  textColor = '#374151',
  fontSize = 10,
  fontFamily,
}) {
  if (!skills.length) return null;

  const Renderer = VARIANTS[variant] || PillOutline;

  return (
    <Renderer
      skills={skills}
      onEdit={onEdit}
      accent={accentColor}
      text={textColor}
      size={fontSize}
      font={fontFamily}
    />
  );
}

/* ── Shared per-item wrapper (provides group/item for DeleteButton hover) ── */
function Item({ children, style, className = '' }) {
  return (
    <div className={`group/item ${className}`} style={style}>
      {children}
    </div>
  );
}

/* ── Add + Delete helpers bound to the skills onEdit protocol ── */
function del(onEdit, i) { onEdit('skill_del', { i }); }
function add(onEdit)    { onEdit('skill_add'); }

/* ════════════════════════════════════════
   VARIANT 1 — simple-list
   Plain vertical list, no icons/bullets.
   ════════════════════════════════════════ */
function SimpleList({ skills, onEdit, text, size, font }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: font }}>
      {skills.map((sk, i) => (
        <Item key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <EditableText
            value={sk}
            onChange={v => onEdit('skill', { i, v })}
            tag="span"
            style={{ fontSize: size, color: text, flex: 1 }}
          />
          <DeleteButton onClick={() => del(onEdit, i)} />
        </Item>
      ))}
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}

/* ════════════════════════════════════════
   VARIANT 2 — bullet-list
   Vertical list with bullet prefix (•).
   ════════════════════════════════════════ */
function BulletList({ skills, onEdit, accent, text, size, font }) {
  return (
    <ul style={{ display: 'flex', flexDirection: 'column', gap: 4, listStyle: 'none', padding: 0, margin: 0, fontFamily: font }}>
      {skills.map((sk, i) => (
        <li key={i}>
          <Item style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: accent, fontSize: size, flexShrink: 0, opacity: 0.7 }}>•</span>
            <EditableText
              value={sk}
              onChange={v => onEdit('skill', { i, v })}
              tag="span"
              style={{ fontSize: size, color: text, flex: 1 }}
            />
            <DeleteButton onClick={() => del(onEdit, i)} />
          </Item>
        </li>
      ))}
      <li><AddButton onClick={() => add(onEdit)} label="skill" /></li>
    </ul>
  );
}

/* ════════════════════════════════════════
   VARIANT 3 — pill-outline
   Flex-wrap tags with accent border + tinted bg.
   ════════════════════════════════════════ */
function PillOutline({ skills, onEdit, accent, text, size, font }) {
  return (
    <div style={{ fontFamily: font }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {skills.map((sk, i) => (
          <Item key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            <span
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: size,
                background: `${accent}18`,
                color: accent,
                border: `1px solid ${accent}30`,
              }}
            >
              <EditableText
                value={sk}
                onChange={v => onEdit('skill', { i, v })}
                tag="span"
                style={{ color: 'inherit' }}
              />
            </span>
            <DeleteButton onClick={() => del(onEdit, i)} />
          </Item>
        ))}
      </div>
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}

/* ════════════════════════════════════════
   VARIANT 4 — pill-filled
   Capsule pills with solid accent bg + white text.
   ════════════════════════════════════════ */
function PillFilled({ skills, onEdit, accent, size, font }) {
  return (
    <div style={{ fontFamily: font }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {skills.map((sk, i) => (
          <Item key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            <span
              style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: size,
                background: accent,
                color: '#FFFFFF',
                fontWeight: 500,
              }}
            >
              <EditableText
                value={sk}
                onChange={v => onEdit('skill', { i, v })}
                tag="span"
                style={{ color: 'inherit' }}
              />
            </span>
            <DeleteButton onClick={() => del(onEdit, i)} />
          </Item>
        ))}
      </div>
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}

/* ════════════════════════════════════════
   VARIANT 5 — compact-grid
   Two-column grid, tight spacing, minimal chrome.
   ════════════════════════════════════════ */
function CompactGrid({ skills, onEdit, accent, text, size, font }) {
  return (
    <div style={{ fontFamily: font }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px 12px',
        }}
      >
        {skills.map((sk, i) => (
          <Item key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: accent, fontSize: 7, flexShrink: 0 }}>&#9670;</span>
            <EditableText
              value={sk}
              onChange={v => onEdit('skill', { i, v })}
              tag="span"
              style={{ fontSize: size, color: text, flex: 1 }}
            />
            <DeleteButton onClick={() => del(onEdit, i)} />
          </Item>
        ))}
      </div>
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}

/* ════════════════════════════════════════
   VARIANT 6 — underline-list
   Inline-wrap items with accent underline.
   ════════════════════════════════════════ */
function UnderlineList({ skills, onEdit, accent, text, size, font }) {
  return (
    <div style={{ fontFamily: font }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
        {skills.map((sk, i) => (
          <Item key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            <span style={{ borderBottom: `1px solid ${accent}`, paddingBottom: 1 }}>
              <EditableText
                value={sk}
                onChange={v => onEdit('skill', { i, v })}
                tag="span"
                style={{ fontSize: size, color: text }}
              />
            </span>
            <DeleteButton onClick={() => del(onEdit, i)} />
          </Item>
        ))}
      </div>
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}

/* ════════════════════════════════════════
   VARIANT 7 — centered-list
   Center-aligned comma-style flow.
   ════════════════════════════════════════ */
function CenteredList({ skills, onEdit, accent, text, size, font }) {
  return (
    <div style={{ fontFamily: font, textAlign: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2px 6px' }}>
        {skills.map((sk, i) => (
          <Item key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            {i > 0 && <span style={{ color: accent, opacity: 0.4, fontSize: size, marginRight: 2 }}>·</span>}
            <EditableText
              value={sk}
              onChange={v => onEdit('skill', { i, v })}
              tag="span"
              style={{ fontSize: size, color: text }}
            />
            <DeleteButton onClick={() => del(onEdit, i)} />
          </Item>
        ))}
      </div>
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}

/* ════════════════════════════════════════
   VARIANT 8 — badge-soft
   Rounded badges with soft tinted background, no border.
   ════════════════════════════════════════ */
function BadgeSoft({ skills, onEdit, accent, size, font }) {
  return (
    <div style={{ fontFamily: font }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {skills.map((sk, i) => (
          <Item key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            <span
              style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: 6,
                fontSize: size,
                background: `${accent}15`,
                color: accent,
                fontWeight: 500,
              }}
            >
              <EditableText
                value={sk}
                onChange={v => onEdit('skill', { i, v })}
                tag="span"
                style={{ color: 'inherit' }}
              />
            </span>
            <DeleteButton onClick={() => del(onEdit, i)} />
          </Item>
        ))}
      </div>
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}

/* ════════════════════════════════════════
   VARIANT 9 — two-column-list
   Two-column vertical list with bullet prefix.
   ════════════════════════════════════════ */
function TwoColumnList({ skills, onEdit, accent, text, size, font }) {
  return (
    <div style={{ fontFamily: font }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
        {skills.map((sk, i) => (
          <Item key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: accent, fontSize: size, flexShrink: 0, opacity: 0.6 }}>•</span>
            <EditableText
              value={sk}
              onChange={v => onEdit('skill', { i, v })}
              tag="span"
              style={{ fontSize: size, color: text, flex: 1 }}
            />
            <DeleteButton onClick={() => del(onEdit, i)} />
          </Item>
        ))}
      </div>
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}

/* ════════════════════════════════════════
   VARIANT 10 — icon-list
   Vertical list with checkmark icons.
   ════════════════════════════════════════ */
function IconList({ skills, onEdit, accent, text, size, font }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: font }}>
      {skills.map((sk, i) => (
        <Item key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: accent, fontSize: size + 1, flexShrink: 0, lineHeight: 1 }}>✓</span>
          <EditableText
            value={sk}
            onChange={v => onEdit('skill', { i, v })}
            tag="span"
            style={{ fontSize: size, color: text, flex: 1 }}
          />
          <DeleteButton onClick={() => del(onEdit, i)} />
        </Item>
      ))}
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}

/* ════════════════════════════════════════
   VARIANT 11 — minimal-divider-list
   Horizontal flow separated by thin vertical dividers.
   ════════════════════════════════════════ */
function MinimalDividerList({ skills, onEdit, accent, text, size, font }) {
  return (
    <div style={{ fontFamily: font }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 0' }}>
        {skills.map((sk, i) => (
          <Item key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
            {i > 0 && (
              <span style={{ width: 1, height: size + 2, background: accent, opacity: 0.25, margin: '0 8px', flexShrink: 0 }} />
            )}
            <EditableText
              value={sk}
              onChange={v => onEdit('skill', { i, v })}
              tag="span"
              style={{ fontSize: size, color: text }}
            />
            <DeleteButton onClick={() => del(onEdit, i)} />
          </Item>
        ))}
      </div>
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}
