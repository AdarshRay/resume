import EditableText from './EditableText';
import AddButton from './AddButton';
import DeleteButton from './DeleteButton';
import ProjectSection from './ProjectSection';
import { isStructuredProjectSection } from '../utils/projectSections';

export default function SideSection({ section, onEdit, textColor = '#d1d5db', accentColor = '#C9A84C' }) {
  if (isStructuredProjectSection(section)) {
    return (
      <ProjectSection
        section={section}
        onEdit={onEdit}
        tone="side"
        headingColor={accentColor}
        bodyColor={textColor}
        accentColor={accentColor}
        fontSize={10}
        mutedColor={textColor}
      />
    );
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <EditableText
        value={section.title}
        onChange={v => onEdit('custom_section_rename', { id: section.id, v })}
        tag="h3"
        className="text-[10px] font-bold uppercase tracking-widest"
        style={{ color: accentColor, marginBottom: 8 }}
      />
      {section.items?.map((item, j) => (
        <div key={j} className="flex items-start gap-1.5 mb-1 group/item">
          <span className="mt-0.5 text-[8px]" style={{ color: accentColor }}>●</span>
          <EditableText
            value={item}
            onChange={v => onEdit('custom_item', { id: section.id, j, v })}
            tag="span"
            className="text-[10px] flex-1 leading-[1.5]"
            style={{ color: textColor }}
          />
          <DeleteButton onClick={() => onEdit('custom_item_del', { id: section.id, j })} />
        </div>
      ))}
      <AddButton onClick={() => onEdit('custom_item_add', { id: section.id })} />
    </div>
  );
}
