import EditableText from './EditableText';
import AddButton from './AddButton';
import ProjectSection from './ProjectSection';
import { isStructuredProjectSection } from '../utils/projectSections';
import { bulletBlockValue, parseBulletBlock } from '../utils/bulletBlocks';
import { syncIndexedList } from '../utils/blockListEditing';

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
        onChange={(v) => onEdit('custom_section_rename', { id: section.id, v })}
        tag="h3"
        className="text-[10px] font-bold uppercase tracking-widest"
        style={{ color: accentColor, marginBottom: 8 }}
      />
      <EditableText
        value={bulletBlockValue(section.items || [], '\u2022')}
        onChange={(v) => syncIndexedList(section.items || [], parseBulletBlock(v), {
          changeItem: (j, nextValue) => onEdit('custom_item', { id: section.id, j, v: nextValue }),
          addItem: () => onEdit('custom_item_add', { id: section.id }),
          deleteItem: (j) => onEdit('custom_item_del', { id: section.id, j }),
        })}
        tag="div"
        multiline
        bulletBlock
        className="text-[10px] leading-[1.5]"
        style={{ color: textColor, whiteSpace: 'pre-line' }}
      />
      <AddButton onClick={() => onEdit('custom_item_add', { id: section.id })} />
    </div>
  );
}
