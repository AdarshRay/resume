import EditableText from './EditableText';
import AddButton from './AddButton';
import DeleteButton from './DeleteButton';

const VARIANTS = {
  'simple-list':  SimpleList,
  'badge-tags':   BadgeTags,
  'check-list':   CheckList,
  'compact-rows': CompactRows,
};

export const CERT_VARIANTS = Object.keys(VARIANTS);

export default function CertificationsRenderer({
  certifications = [],
  onEdit,
  variant = 'simple-list',
  accentColor = '#3B82F6',
  textColor = '#374151',
  fontSize = 10,
  fontFamily,
}) {
  if (!certifications.length) return null;
  const Renderer = VARIANTS[variant] || SimpleList;
  return (
    <Renderer
      certs={certifications}
      onEdit={onEdit}
      accent={accentColor}
      text={textColor}
      size={fontSize}
      font={fontFamily}
    />
  );
}

/* ════════════════════════════════════════
   VARIANT 1 — simple-list
   Diamond bullet + text
   ════════════════════════════════════════ */
function SimpleList({ certs, onEdit, accent, text, size, font }) {
  return (
    <div style={{ fontFamily: font }}>
      {certs.map((cert, i) => (
        <div key={i} className="group/item" style={{ display: 'flex', alignItems: 'start', gap: 6, marginBottom: 4 }}>
          <span style={{ color: accent, fontSize: size - 1, marginTop: 2, flexShrink: 0, lineHeight: 1 }}>&#9670;</span>
          <EditableText value={cert} onChange={v => onEdit('cert', { i, v })} tag="span" style={{ fontSize: size, color: text, flex: 1 }} />
          <DeleteButton onClick={() => onEdit('cert_del', { i })} />
        </div>
      ))}
      <AddButton onClick={() => onEdit('cert_add', {})} label="certification" />
    </div>
  );
}

/* ════════════════════════════════════════
   VARIANT 2 — badge-tags
   Each cert in a pill/badge
   ════════════════════════════════════════ */
function BadgeTags({ certs, onEdit, accent, text, size, font }) {
  return (
    <div style={{ fontFamily: font }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {certs.map((cert, i) => (
          <div
            key={i}
            className="group/item"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: 999,
              background: `${accent}12`,
              border: `1px solid ${accent}30`,
            }}
          >
            <EditableText value={cert} onChange={v => onEdit('cert', { i, v })} tag="span" style={{ fontSize: size, color: text }} />
            <DeleteButton onClick={() => onEdit('cert_del', { i })} />
          </div>
        ))}
      </div>
      <AddButton onClick={() => onEdit('cert_add', {})} label="certification" />
    </div>
  );
}

/* ════════════════════════════════════════
   VARIANT 3 — check-list
   Checkmark icon + text
   ════════════════════════════════════════ */
function CheckList({ certs, onEdit, accent, text, size, font }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: font }}>
      {certs.map((cert, i) => (
        <div key={i} className="group/item" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: accent, fontSize: size, flexShrink: 0, lineHeight: 1 }}>✓</span>
          <EditableText value={cert} onChange={v => onEdit('cert', { i, v })} tag="span" style={{ fontSize: size, color: text, flex: 1 }} />
          <DeleteButton onClick={() => onEdit('cert_del', { i })} />
        </div>
      ))}
      <AddButton onClick={() => onEdit('cert_add', {})} label="certification" />
    </div>
  );
}

/* ════════════════════════════════════════
   VARIANT 4 — compact-rows
   Subtle bottom border between entries
   ════════════════════════════════════════ */
function CompactRows({ certs, onEdit, accent, text, size, font }) {
  return (
    <div style={{ fontFamily: font }}>
      {certs.map((cert, i) => (
        <div key={i} className="group/item">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
            <EditableText value={cert} onChange={v => onEdit('cert', { i, v })} tag="span" style={{ fontSize: size, color: text, flex: 1 }} />
            <DeleteButton onClick={() => onEdit('cert_del', { i })} />
          </div>
          {i < certs.length - 1 && <div style={{ height: 1, background: `${accent}18` }} />}
        </div>
      ))}
      <AddButton onClick={() => onEdit('cert_add', {})} label="certification" />
    </div>
  );
}
