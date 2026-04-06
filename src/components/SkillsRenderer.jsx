import EditableText from './EditableText';
import AddButton from './AddButton';
import DeleteButton from './DeleteButton';
import { bulletBlockValue, parseBulletBlock } from '../utils/bulletBlocks';
import { syncIndexedList } from '../utils/blockListEditing';
import { SKILL_VARIANTS } from './rendererVariants';

const VARIANTS = {
  'simple-list': SimpleList,
  'bullet-list': BulletList,
  'pill-outline': PillOutline,
  'pill-filled': PillFilled,
  'compact-grid': CompactGrid,
  'underline-list': UnderlineList,
  'centered-list': CenteredList,
  'badge-soft': BadgeSoft,
  'two-column-list': TwoColumnList,
  'icon-list': IconList,
  'minimal-divider-list': MinimalDividerList,
};

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

function Item({ children, style, className = '' }) {
  return (
    <div className={`group/item ${className}`} style={style}>
      {children}
    </div>
  );
}

function del(onEdit, i) { onEdit('skill_del', { i }); }
function add(onEdit) { onEdit('skill_add'); }

function syncSkills(skills, onEdit, nextItems) {
  syncIndexedList(skills, nextItems, {
    changeItem: (i, value) => onEdit('skill', { i, v: value }),
    addItem: () => add(onEdit),
    deleteItem: (i) => del(onEdit, i),
  });
}

function SimpleList({ skills, onEdit, text, size, font }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: font }}>
      <EditableText
        value={bulletBlockValue(skills, '\u2022')}
        onChange={(v) => syncSkills(skills, onEdit, parseBulletBlock(v))}
        tag="div"
        multiline
        bulletBlock
        style={{ fontSize: size, color: text, lineHeight: 1.6, whiteSpace: 'pre-line' }}
      />
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}

function BulletList({ skills, onEdit, text, size, font }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: font }}>
      <EditableText
        value={bulletBlockValue(skills, '\u2022')}
        onChange={(v) => syncSkills(skills, onEdit, parseBulletBlock(v))}
        tag="div"
        multiline
        bulletBlock
        style={{ fontSize: size, color: text, lineHeight: 1.6, whiteSpace: 'pre-line' }}
      />
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}

function PillOutline({ skills, onEdit, accent, size, font }) {
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
              <EditableText value={sk} onChange={(v) => onEdit('skill', { i, v })} tag="span" style={{ color: 'inherit' }} />
            </span>
            <DeleteButton onClick={() => del(onEdit, i)} />
          </Item>
        ))}
      </div>
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}

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
              <EditableText value={sk} onChange={(v) => onEdit('skill', { i, v })} tag="span" style={{ color: 'inherit' }} />
            </span>
            <DeleteButton onClick={() => del(onEdit, i)} />
          </Item>
        ))}
      </div>
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}

function CompactGrid({ skills, onEdit, accent, text, size, font }) {
  return (
    <div style={{ fontFamily: font }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
        {skills.map((sk, i) => (
          <Item key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: accent, fontSize: 7, flexShrink: 0 }}>&#9670;</span>
            <EditableText value={sk} onChange={(v) => onEdit('skill', { i, v })} tag="span" style={{ fontSize: size, color: text, flex: 1 }} />
            <DeleteButton onClick={() => del(onEdit, i)} />
          </Item>
        ))}
      </div>
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}

function UnderlineList({ skills, onEdit, accent, text, size, font }) {
  return (
    <div style={{ fontFamily: font }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
        {skills.map((sk, i) => (
          <Item key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            <span style={{ borderBottom: `1px solid ${accent}`, paddingBottom: 1 }}>
              <EditableText value={sk} onChange={(v) => onEdit('skill', { i, v })} tag="span" style={{ fontSize: size, color: text }} />
            </span>
            <DeleteButton onClick={() => del(onEdit, i)} />
          </Item>
        ))}
      </div>
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}

function CenteredList({ skills, onEdit, accent, text, size, font }) {
  return (
    <div style={{ fontFamily: font, textAlign: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2px 6px' }}>
        {skills.map((sk, i) => (
          <Item key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            {i > 0 && <span style={{ color: accent, opacity: 0.4, fontSize: size, marginRight: 2 }}>&middot;</span>}
            <EditableText value={sk} onChange={(v) => onEdit('skill', { i, v })} tag="span" style={{ fontSize: size, color: text }} />
            <DeleteButton onClick={() => del(onEdit, i)} />
          </Item>
        ))}
      </div>
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}

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
              <EditableText value={sk} onChange={(v) => onEdit('skill', { i, v })} tag="span" style={{ color: 'inherit' }} />
            </span>
            <DeleteButton onClick={() => del(onEdit, i)} />
          </Item>
        ))}
      </div>
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}

function TwoColumnList({ skills, onEdit, accent, text, size, font }) {
  return (
    <div style={{ fontFamily: font }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
        {skills.map((sk, i) => (
          <Item key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: accent, fontSize: size, flexShrink: 0, opacity: 0.6 }}>&#8226;</span>
            <EditableText value={sk} onChange={(v) => onEdit('skill', { i, v })} tag="span" style={{ fontSize: size, color: text, flex: 1 }} />
            <DeleteButton onClick={() => del(onEdit, i)} />
          </Item>
        ))}
      </div>
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}

function IconList({ skills, onEdit, text, size, font }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: font }}>
      <EditableText
        value={bulletBlockValue(skills, '\u2713')}
        onChange={(v) => syncSkills(skills, onEdit, parseBulletBlock(v))}
        tag="div"
        multiline
        bulletBlock
        style={{ fontSize: size, color: text, lineHeight: 1.6, whiteSpace: 'pre-line' }}
      />
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}

function MinimalDividerList({ skills, onEdit, accent, text, size, font }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: font }}>
      <EditableText
        value={bulletBlockValue(skills, '\u2022')}
        onChange={(v) => syncSkills(skills, onEdit, parseBulletBlock(v))}
        tag="div"
        multiline
        bulletBlock
        style={{
          fontSize: size,
          color: text,
          lineHeight: 1.65,
          whiteSpace: 'pre-line',
          borderTop: `1px solid ${accent}18`,
          paddingTop: 4,
        }}
      />
      <AddButton onClick={() => add(onEdit)} label="skill" />
    </div>
  );
}
