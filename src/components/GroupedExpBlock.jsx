import EditableText from './EditableText';
import AddButton from './AddButton';
import DeleteButton from './DeleteButton';

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

  const renderBulletList = (bullets, groupIndex = null) => (
    <ul className="space-y-1" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
      {bullets.map((bullet, bulletIndex) => (
        <li key={bulletIndex} className="flex items-start gap-2 text-[10px] leading-[1.7] group/item" style={{ color: bodyColor }}>
          <span style={{ color: accentColor }} className="mt-0.5 shrink-0">{bulletChar}</span>
          <EditableText
            value={bullet}
            onChange={(v) => {
              if (typeof groupIndex === 'number') {
                onEdit('exp_group_bullet', { i: idx, j: groupIndex, k: bulletIndex, v });
                return;
              }
              onEdit('exp_bullet', { i: idx, j: bulletIndex, v });
            }}
            tag="span"
            className="flex-1"
          />
          <DeleteButton
            onClick={() => {
              if (typeof groupIndex === 'number') {
                onEdit('exp_group_bullet_del', { i: idx, j: groupIndex, k: bulletIndex });
                return;
              }
              onEdit('exp_bullet_del', { i: idx, j: bulletIndex });
            }}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="group/exp" style={{ marginBottom: 10 }}>
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
        <EditableText
          value={exp.client}
          onChange={(v) => onEdit('exp_client', { i: idx, v })}
          tag="p"
          className="text-[10px]"
          style={{ color: bodyColor, margin: '0 0 4px 0', lineHeight: 1.22, fontWeight: 500 }}
        />
      )}

      {groupedSections.length > 0 ? (
        <div style={{ marginTop: 4 }}>
          {groupedSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="group/item" style={{ marginBottom: 8 }}>
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
