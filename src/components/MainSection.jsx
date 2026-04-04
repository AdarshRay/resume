import EditableText from './EditableText';
import AddButton from './AddButton';
import DeleteButton from './DeleteButton';
import ProjectSection from './ProjectSection';
import { isStructuredProjectSection } from '../utils/projectSections';

export default function MainSection({ section, onEdit, headingColor = '#1a1a2e', bodyColor = '#4b5563', accentColor = '#C9A84C' }) {
  if (isStructuredProjectSection(section)) {
    return (
      <ProjectSection
        section={section}
        onEdit={onEdit}
        tone="main"
        headingColor={headingColor}
        bodyColor={bodyColor}
        accentColor={accentColor}
        fontSize={10}
      />
    );
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <EditableText
        value={section.title}
        onChange={v => onEdit('custom_section_rename', { id: section.id, v })}
        tag="h2"
        className="text-[11px] font-bold uppercase tracking-wider"
        style={{ color: headingColor, marginBottom: 8 }}
      />
      {section.items?.map((item, j) => (
        <div key={j} className="flex items-start gap-2 mb-1 group/item">
          <span className="mt-0.5 text-[8px]" style={{ color: accentColor }}>●</span>
          <EditableText
            value={item}
            onChange={v => onEdit('custom_item', { id: section.id, j, v })}
            tag="span"
            className="text-[10px] flex-1 leading-[1.55]"
            style={{ color: bodyColor }}
          />
          <DeleteButton onClick={() => onEdit('custom_item_del', { id: section.id, j })} />
        </div>
      ))}
      <AddButton onClick={() => onEdit('custom_item_add', { id: section.id })} />
    </div>
  );
}
