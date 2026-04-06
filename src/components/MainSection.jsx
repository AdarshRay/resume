import EditableText from './EditableText';
import AddButton from './AddButton';
import ProjectSection from './ProjectSection';
import { isStructuredProjectSection } from '../utils/projectSections';
import { bulletBlockValue, parseBulletBlock } from '../utils/bulletBlocks';
import { syncIndexedList } from '../utils/blockListEditing';

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
    <div style={{ marginTop: 0, marginBottom: 2 }}>
      <EditableText
        value={section.title}
        onChange={(v) => onEdit('custom_section_rename', { id: section.id, v })}
        tag="h2"
        className="text-[11px] font-bold uppercase tracking-wider"
        style={{ color: headingColor, marginBottom: 2 }}
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
        className="text-[10px] leading-[1.55]"
        style={{ color: bodyColor, whiteSpace: 'pre-line' }}
      />
      <div style={{ marginTop: 1 }}>
        <AddButton onClick={() => onEdit('custom_item_add', { id: section.id })} />
      </div>
    </div>
  );
}
