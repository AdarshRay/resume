import EditableText from './EditableText';
import AddButton from './AddButton';
import DeleteButton from './DeleteButton';
import { bulletBlockValue, parseBulletBlock } from '../utils/bulletBlocks';
import { syncIndexedList } from '../utils/blockListEditing';
import { CERT_VARIANTS } from './rendererVariants';

const VARIANTS = {
  'simple-list': SimpleList,
  'badge-tags': BadgeTags,
  'check-list': CheckList,
  'compact-rows': CompactRows,
};

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

function syncCerts(certs, onEdit, nextItems) {
  syncIndexedList(certs, nextItems, {
    changeItem: (i, value) => onEdit('cert', { i, v: value }),
    addItem: () => onEdit('cert_add', {}),
    deleteItem: (i) => onEdit('cert_del', { i }),
  });
}

function SimpleList({ certs, onEdit, text, size, font }) {
  return (
    <div style={{ fontFamily: font }}>
      <EditableText
        value={bulletBlockValue(certs, '\u25C6')}
        onChange={(v) => syncCerts(certs, onEdit, parseBulletBlock(v))}
        tag="div"
        multiline
        bulletBlock
        style={{ fontSize: size, color: text, lineHeight: 1.6, whiteSpace: 'pre-line' }}
      />
      <AddButton onClick={() => onEdit('cert_add', {})} label="certification" />
    </div>
  );
}

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
            <EditableText value={cert} onChange={(v) => onEdit('cert', { i, v })} tag="span" style={{ fontSize: size, color: text }} />
            <DeleteButton onClick={() => onEdit('cert_del', { i })} />
          </div>
        ))}
      </div>
      <AddButton onClick={() => onEdit('cert_add', {})} label="certification" />
    </div>
  );
}

function CheckList({ certs, onEdit, text, size, font }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: font }}>
      <EditableText
        value={bulletBlockValue(certs, '\u2713')}
        onChange={(v) => syncCerts(certs, onEdit, parseBulletBlock(v))}
        tag="div"
        multiline
        bulletBlock
        style={{ fontSize: size, color: text, lineHeight: 1.6, whiteSpace: 'pre-line' }}
      />
      <AddButton onClick={() => onEdit('cert_add', {})} label="certification" />
    </div>
  );
}

function CompactRows({ certs, onEdit, text, size, font }) {
  return (
    <div style={{ fontFamily: font }}>
      <EditableText
        value={bulletBlockValue(certs, '\u25C6')}
        onChange={(v) => syncCerts(certs, onEdit, parseBulletBlock(v))}
        tag="div"
        multiline
        bulletBlock
        style={{ fontSize: size, color: text, lineHeight: 1.6, whiteSpace: 'pre-line' }}
      />
      <AddButton onClick={() => onEdit('cert_add', {})} label="certification" />
    </div>
  );
}
