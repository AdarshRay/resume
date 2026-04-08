import EditableText from './EditableText';
import AddButton from './AddButton';
import DeleteButton from './DeleteButton';
import {
  isPlainBulletLine,
  stripPlainBulletPrefix,
  isStoredBulletLine,
  extractStoredBulletGlyph,
} from '../utils/bulletBlocks';

export default function GroupedExpBlock({
  exp,
  idx,
  onEdit,
  headingColor,
  bodyColor,
  accentColor,
  bulletChar = '•',
}) {
  const groupedSections = Array.isArray(exp.sections)
    ? exp.sections.filter((section) => section?.heading || (section?.bullets || []).length)
    : [];
  const flatBullets = Array.isArray(exp.bullets) ? exp.bullets : [];

  const renderBulletRow = ({
    key,
    glyph = bulletChar,
    text,
    onChange,
    onDelete,
  }) => (
    <div
      key={key}
      className="group/bullet"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        paddingRight: onDelete ? 18 : 0,
        minWidth: 0,
      }}
    >
      {glyph ? (
        <span
          aria-hidden="true"
          style={{
            color: bodyColor,
            fontSize: 10,
            lineHeight: 1.7,
            textAlign: 'center',
            paddingTop: 1,
            width: 18,
            flex: '0 0 18px',
          }}
        >
          {glyph}
        </span>
      ) : (
        <span style={{ width: 18, flex: '0 0 18px' }} />
      )}

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
      <EditableText
        value={text}
        onChange={onChange}
        tag="div"
        className="flex-1"
        style={{
          color: bodyColor,
          fontSize: 10,
          lineHeight: 1.7,
          whiteSpace: 'normal',
          overflowWrap: 'anywhere',
          wordBreak: 'normal',
          minWidth: 0,
          marginTop: 0,
        }}
      />
      </div>

      {onDelete ? (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 1,
          }}
        >
          <DeleteButton onClick={onDelete} />
        </div>
      ) : null}
    </div>
  );

  const renderBulletList = (bullets, groupIndex = null) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {(bullets || []).map((item, bulletIndex) => {
        const storedBullet = isStoredBulletLine(item);
        const glyph = storedBullet ? extractStoredBulletGlyph(item, bulletChar) : (isPlainBulletLine(item) ? '' : bulletChar);
        const text = storedBullet ? item.split('::').slice(2).join('::') : stripPlainBulletPrefix(item || '');

        const handleChange = (nextText) => {
          const trimmed = nextText;
          const nextValue = glyph
            ? `__bullet__::${glyph || bulletChar}::${trimmed}`
            : `__plain__::${trimmed}`;

          if (typeof groupIndex === 'number') {
            onEdit('exp_group_bullet', { i: idx, j: groupIndex, k: bulletIndex, v: nextValue });
            return;
          }
          onEdit('exp_bullet', { i: idx, j: bulletIndex, v: nextValue });
        };

        const handleDelete = () => {
          if (typeof groupIndex === 'number') {
            onEdit('exp_group_bullet_del', { i: idx, j: groupIndex, k: bulletIndex });
            return;
          }
          onEdit('exp_bullet_del', { i: idx, j: bulletIndex });
        };

        return renderBulletRow({
          key: bulletIndex,
          glyph,
          text,
          onChange: handleChange,
          onDelete: handleDelete,
        });
      })}
    </div>
  );

  return (
    <div className="group/exp" style={{ marginBottom: 4 }}>
      <div className="flex justify-between items-baseline">
        <EditableText
          value={exp.role}
          onChange={(v) => onEdit('exp_role', { i: idx, v })}
          tag="h3"
          className="font-semibold text-[11px]"
          style={{ color: headingColor, margin: 0, lineHeight: 1.18 }}
        />
        <EditableText
          value={exp.period}
          onChange={(v) => onEdit('exp_period', { i: idx, v })}
          tag="span"
          className="text-[10px] shrink-0 ml-2"
          style={{ color: bodyColor }}
        />
      </div>
      <EditableText
        value={exp.company}
        onChange={(v) => onEdit('exp_company', { i: idx, v })}
        tag="p"
        className="text-[10px]"
        style={{ color: accentColor, margin: '1px 0 3px 0', lineHeight: 1.22 }}
      />
      {!!exp.client && (
        <div style={{ margin: '0 0 4px 0' }}>
          {renderBulletRow({
            key: 'client',
            glyph: bulletChar,
            text: exp.client,
            onChange: (v) => onEdit('exp_client', { i: idx, v }),
          })}
        </div>
      )}

      {groupedSections.length > 0 ? (
        <div style={{ marginTop: 4 }}>
          {groupedSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="group/item" style={{ marginBottom: 5 }}>
              <EditableText
                value={section.heading}
                onChange={(v) => onEdit('exp_group_heading', { i: idx, j: sectionIndex, v })}
                tag="p"
                className="font-semibold text-[10px]"
                style={{ color: headingColor, margin: '0 0 3px 0', lineHeight: 1.25, textDecoration: 'underline' }}
              />
              {renderBulletList(section.bullets || [], sectionIndex)}
              <div className="flex gap-2 mt-1">
                <AddButton onClick={() => onEdit('exp_group_bullet_add', { i: idx, j: sectionIndex })} label="bullet" />
                <button
                  onClick={() => onEdit('exp_group_del', { i: idx, j: sectionIndex })}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="text-[10px] opacity-0 group-hover/item:opacity-60 hover:!opacity-100 transition-opacity"
                  style={{ color: '#F43F5E' }}
                >
                  Remove section
                </button>
              </div>
            </div>
          ))}

          {flatBullets.length > 0 && (
            <div className="group/item" style={{ marginTop: 2 }}>
              {renderBulletList(flatBullets)}
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginTop: 2 }}>
          {renderBulletList(flatBullets)}
        </div>
      )}

      <div className="flex gap-2 mt-1 flex-wrap">
        {groupedSections.length > 0 ? (
          <>
            <AddButton onClick={() => onEdit('exp_bullet_add', { i: idx })} label="base bullet" />
            <AddButton onClick={() => onEdit('exp_group_add', { i: idx })} label="sub-section" />
          </>
        ) : (
          <>
            <AddButton onClick={() => onEdit('exp_bullet_add', { i: idx })} label="bullet" />
            <AddButton onClick={() => onEdit('exp_group_add', { i: idx })} label="sub-section" />
          </>
        )}
        <button
          onClick={() => onEdit('exp_del', { i: idx })}
          onMouseDown={(e) => e.stopPropagation()}
          className="text-[10px] opacity-0 group-hover/exp:opacity-60 hover:!opacity-100 transition-opacity"
          style={{ color: '#F43F5E' }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
