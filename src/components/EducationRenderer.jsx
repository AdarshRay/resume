import EditableText from './EditableText';
import AddButton from './AddButton';
import DeleteButton from './DeleteButton';
import { EDUCATION_VARIANTS } from './rendererVariants';

const VARIANTS = {
  'simple-list':   SimpleList,
  'stacked-cards': StackedCards,
  'timeline':      Timeline,
  'compact-block': CompactBlock,
  'divider-list':  DividerList,
};

export default function EducationRenderer({
  education = [],
  onEdit,
  variant = 'simple-list',
  accentColor = '#3B82F6',
  headingColor = '#1e293b',
  textColor = '#374151',
  fontSize = 10,
  fontFamily,
}) {
  if (!education.length) return null;
  const Renderer = VARIANTS[variant] || SimpleList;
  return (
    <Renderer
      education={education}
      onEdit={onEdit}
      accent={accentColor}
      heading={headingColor}
      text={textColor}
      size={fontSize}
      font={fontFamily}
    />
  );
}

/* ════════════════════════════════════════
   VARIANT 1 — simple-list
   Degree, school, year stacked plainly
   ════════════════════════════════════════ */
function SimpleList({ education, onEdit, heading, text, size, font }) {
  return (
    <div style={{ fontFamily: font }}>
      {education.map((edu, i) => (
        <div key={i} className="group/item" style={{ marginBottom: 8 }}>
          <EditableText value={edu.degree} onChange={v => onEdit('edu_degree', { i, v })} tag="p" style={{ fontSize: size + 1, fontWeight: 600, color: heading }} />
          <EditableText value={edu.school} onChange={v => onEdit('edu_school', { i, v })} tag="p" style={{ fontSize: size, color: text }} />
          <EditableText value={edu.year} onChange={v => onEdit('edu_year', { i, v })} tag="p" style={{ fontSize: size - 1, color: '#94a3b8' }} />
          <DeleteButton onClick={() => onEdit('edu_del', { i })} />
        </div>
      ))}
      <AddButton onClick={() => onEdit('edu_add', {})} label="education" />
    </div>
  );
}

/* ════════════════════════════════════════
   VARIANT 2 — stacked-cards
   Each entry in a subtle bordered card
   ════════════════════════════════════════ */
function StackedCards({ education, onEdit, accent, heading, text, size, font }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: font }}>
      {education.map((edu, i) => (
        <div
          key={i}
          className="group/item"
          style={{
            padding: '6px 8px',
            border: `1px solid ${accent}25`,
            borderLeft: `3px solid ${accent}`,
            borderRadius: 4,
            background: `${accent}06`,
          }}
        >
          <EditableText value={edu.degree} onChange={v => onEdit('edu_degree', { i, v })} tag="p" style={{ fontSize: size + 1, fontWeight: 600, color: heading }} />
          <EditableText value={edu.school} onChange={v => onEdit('edu_school', { i, v })} tag="p" style={{ fontSize: size, color: text }} />
          <EditableText value={edu.year} onChange={v => onEdit('edu_year', { i, v })} tag="p" style={{ fontSize: size - 1, color: accent, marginTop: 2 }} />
          <DeleteButton onClick={() => onEdit('edu_del', { i })} />
        </div>
      ))}
      <AddButton onClick={() => onEdit('edu_add', {})} label="education" />
    </div>
  );
}

/* ════════════════════════════════════════
   VARIANT 3 — timeline
   Vertical line with dot markers
   ════════════════════════════════════════ */
function Timeline({ education, onEdit, accent, heading, text, size, font }) {
  return (
    <div style={{ fontFamily: font }}>
      {education.map((edu, i) => (
        <div key={i} className="group/item" style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 12 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: accent, flexShrink: 0, marginTop: 3 }} />
            {i < education.length - 1 && <div style={{ width: 1, flex: 1, background: `${accent}30`, marginTop: 2 }} />}
          </div>
          <div style={{ flex: 1, paddingBottom: 2 }}>
            <EditableText value={edu.degree} onChange={v => onEdit('edu_degree', { i, v })} tag="p" style={{ fontSize: size + 1, fontWeight: 600, color: heading }} />
            <EditableText value={edu.school} onChange={v => onEdit('edu_school', { i, v })} tag="p" style={{ fontSize: size, color: text }} />
            <EditableText value={edu.year} onChange={v => onEdit('edu_year', { i, v })} tag="p" style={{ fontSize: size - 1, color: '#94a3b8' }} />
            <DeleteButton onClick={() => onEdit('edu_del', { i })} />
          </div>
        </div>
      ))}
      <AddButton onClick={() => onEdit('edu_add', {})} label="education" />
    </div>
  );
}

/* ════════════════════════════════════════
   VARIANT 4 — compact-block
   Degree + year on one line, school below
   ════════════════════════════════════════ */
function CompactBlock({ education, onEdit, heading, text, size, font }) {
  return (
    <div style={{ fontFamily: font }}>
      {education.map((edu, i) => (
        <div key={i} className="group/item" style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <EditableText value={edu.degree} onChange={v => onEdit('edu_degree', { i, v })} tag="p" style={{ fontSize: size + 1, fontWeight: 600, color: heading }} />
            <EditableText value={edu.year} onChange={v => onEdit('edu_year', { i, v })} tag="span" style={{ fontSize: size - 1, color: '#94a3b8', flexShrink: 0 }} />
          </div>
          <EditableText value={edu.school} onChange={v => onEdit('edu_school', { i, v })} tag="p" style={{ fontSize: size, color: text }} />
          <DeleteButton onClick={() => onEdit('edu_del', { i })} />
        </div>
      ))}
      <AddButton onClick={() => onEdit('edu_add', {})} label="education" />
    </div>
  );
}

/* ════════════════════════════════════════
   VARIANT 5 — divider-list
   Entries separated by subtle horizontal lines
   ════════════════════════════════════════ */
function DividerList({ education, onEdit, accent, heading, text, size, font }) {
  return (
    <div style={{ fontFamily: font }}>
      {education.map((edu, i) => (
        <div key={i} className="group/item">
          {i > 0 && <div style={{ height: 1, background: `${accent}20`, margin: '6px 0' }} />}
          <EditableText value={edu.degree} onChange={v => onEdit('edu_degree', { i, v })} tag="p" style={{ fontSize: size + 1, fontWeight: 600, color: heading }} />
          <EditableText value={edu.school} onChange={v => onEdit('edu_school', { i, v })} tag="p" style={{ fontSize: size, color: text }} />
          <EditableText value={edu.year} onChange={v => onEdit('edu_year', { i, v })} tag="p" style={{ fontSize: size - 1, color: '#94a3b8' }} />
          <DeleteButton onClick={() => onEdit('edu_del', { i })} />
        </div>
      ))}
      <AddButton onClick={() => onEdit('edu_add', {})} label="education" />
    </div>
  );
}
