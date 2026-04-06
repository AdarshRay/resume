import EditableText from './EditableText';
import { CONTACT_VARIANTS } from './rendererVariants';

/**
 * Shared contact renderer.
 *
 * Props
 * ─────
 * email        – string
 * phone        – string
 * location     – string
 * onEdit       – editor callback (key, payload)
 * variant      – "simple-lines" | "icon-list" | "boxed-rows" | "inline-compact" | "divider-list"
 * accentColor  – hex colour for icons / accents
 * textColor    – primary text colour
 * fontSize     – base font size (number, px)
 * fontFamily   – optional font-family override
 */

const VARIANTS = {
  'simple-lines': SimpleLines,
  'icon-list':    IconList,
  'boxed-rows':   BoxedRows,
  'inline-compact': InlineCompact,
  'divider-list': DividerList,
};

export default function ContactRenderer({
  email = '',
  phone = '',
  location = '',
  onEdit,
  variant = 'icon-list',
  accentColor = '#3B82F6',
  textColor = '#374151',
  fontSize = 10,
  fontFamily,
}) {
  if (!email && !phone && !location) return null;

  const Renderer = VARIANTS[variant] || IconList;

  return (
    <Renderer
      email={email}
      phone={phone}
      location={location}
      onEdit={onEdit}
      accent={accentColor}
      text={textColor}
      size={fontSize}
      font={fontFamily}
    />
  );
}

/* ── Contact field definitions ── */
const FIELDS = [
  { key: 'email',    field: 'email',    icon: '\u2709', label: 'Email' },
  { key: 'phone',    field: 'phone',    icon: '\u260E', label: 'Phone' },
  { key: 'location', field: 'location', icon: '\u25C8', label: 'Location' },
];

function getEntries(email, phone, location) {
  return FIELDS.filter(f => {
    const val = f.key === 'email' ? email : f.key === 'phone' ? phone : location;
    return !!val;
  }).map(f => ({
    ...f,
    value: f.key === 'email' ? email : f.key === 'phone' ? phone : location,
  }));
}

/* ════════════════════════════════════════
   VARIANT 1 — simple-lines
   Plain text, one per line, no icons
   ════════════════════════════════════════ */
function SimpleLines({ email, phone, location, onEdit, text, size, font }) {
  const entries = getEntries(email, phone, location);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: font }}>
      {entries.map(e => (
        <EditableText
          key={e.key}
          value={e.value}
          onChange={v => onEdit(e.field, { v })}
          tag="span"
          style={{ fontSize: size, color: text, lineHeight: 1.4 }}
        />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════
   VARIANT 2 — icon-list
   Icon + text, vertical list
   ════════════════════════════════════════ */
function IconList({ email, phone, location, onEdit, accent, text, size, font }) {
  const entries = getEntries(email, phone, location);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: font }}>
      {entries.map(e => (
        <div key={e.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: size + 1, color: accent, flexShrink: 0, lineHeight: 1 }}>{e.icon}</span>
          <EditableText
            value={e.value}
            onChange={v => onEdit(e.field, { v })}
            tag="span"
            style={{ fontSize: size, color: text, lineHeight: 1.4 }}
          />
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════
   VARIANT 3 — boxed-rows
   Each field in a subtle bordered box
   ════════════════════════════════════════ */
function BoxedRows({ email, phone, location, onEdit, accent, text, size, font }) {
  const entries = getEntries(email, phone, location);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: font }}>
      {entries.map(e => (
        <div
          key={e.key}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '3px 6px',
            border: `1px solid ${accent}33`,
            borderRadius: 4,
            background: `${accent}08`,
          }}
        >
          <span style={{ fontSize: size + 1, color: accent, flexShrink: 0, lineHeight: 1 }}>{e.icon}</span>
          <EditableText
            value={e.value}
            onChange={v => onEdit(e.field, { v })}
            tag="span"
            style={{ fontSize: size, color: text, lineHeight: 1.4 }}
          />
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════
   VARIANT 4 — inline-compact
   All fields in one horizontal line with pipe separators
   ════════════════════════════════════════ */
function InlineCompact({ email, phone, location, onEdit, accent, text, size, font }) {
  const entries = getEntries(email, phone, location);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 0', fontFamily: font }}>
      {entries.map((e, i) => (
        <span key={e.key} style={{ display: 'inline-flex', alignItems: 'center' }}>
          {i > 0 && (
            <span style={{ width: 1, height: size + 2, background: accent, opacity: 0.3, margin: '0 10px', flexShrink: 0 }} />
          )}
          <EditableText
            value={e.value}
            onChange={v => onEdit(e.field, { v })}
            tag="span"
            style={{ fontSize: size, color: text, lineHeight: 1.4 }}
          />
        </span>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════
   VARIANT 5 — divider-list
   Icon + text with bottom divider between entries
   ════════════════════════════════════════ */
function DividerList({ email, phone, location, onEdit, accent, text, size, font }) {
  const entries = getEntries(email, phone, location);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, fontFamily: font }}>
      {entries.map((e, i) => (
        <div key={e.key}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
            <span style={{ fontSize: size + 1, color: accent, flexShrink: 0, lineHeight: 1 }}>{e.icon}</span>
            <EditableText
              value={e.value}
              onChange={v => onEdit(e.field, { v })}
              tag="span"
              style={{ fontSize: size, color: text, lineHeight: 1.4 }}
            />
          </div>
          {i < entries.length - 1 && (
            <div style={{ height: 1, background: `${accent}20`, margin: '0 0 0 ' + (size + 7) + 'px' }} />
          )}
        </div>
      ))}
    </div>
  );
}
