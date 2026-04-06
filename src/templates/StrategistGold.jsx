import EditableText from '../components/EditableText';
import DraggablePhoto from '../components/DraggablePhoto';
import DraggableSection from '../components/DraggableSection';
import DroppableColumn from '../components/DroppableColumn';
import AddButton from '../components/AddButton';
import ProjectSection from '../components/ProjectSection';
import DeleteButton from '../components/DeleteButton';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { bulletBlockValue, parseBulletBlock } from '../utils/bulletBlocks';
import { syncIndexedList } from '../utils/blockListEditing';
import { isStructuredProjectSection } from '../utils/projectSections';

const DEFAULTS = {
  accent: '#CBD3E0',
  sidebar: '#2E3E6A',
  heading: '#2E3E6A',
  text: '#4B5566',
  background: '#FFFFFF',
};

const LEFT_WIDTH = 306;
const LEFT_TOP = 250;
const PHOTO_W = 182;
const PHOTO_H = 256;
const SIDE_SECTION_GAP = 8;
const MAIN_SECTION_GAP = 2;

function getNameFontSize(name = '') {
  const compact = String(name || '').replace(/\s+/g, '');
  const length = compact.length;
  if (length <= 10) return 58;
  if (length <= 14) return 52;
  if (length <= 18) return 46;
  if (length <= 22) return 41;
  return 36;
}

function PillHeading({ value, onChange, color, borderColor }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 6, minHeight: 30 }}>
      <div style={{ position: 'absolute', inset: '50% 0 auto 0', height: 2, background: borderColor, transform: 'translateY(-50%)' }} />
      <EditableText
        value={value}
        onChange={onChange}
        tag="h2"
        style={{
          position: 'relative',
          margin: 0,
          padding: '4px 18px 5px',
          border: `2px solid ${borderColor}`,
          borderRadius: 999,
          background: '#FFFFFF',
          color,
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}
      />
    </div>
  );
}

function SideHeading({ value, onChange }) {
  return (
    <EditableText
      value={value}
      onChange={onChange}
      tag="h3"
      style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 800, letterSpacing: '0.04em', margin: '0 0 6px 0', lineHeight: 1.05 }}
    />
  );
}

function BulletEditor({ items = [], onSync, glyph = '\u2022', style = {} }) {
  return (
    <EditableText
      value={bulletBlockValue(items, glyph)}
      onChange={(v) => onSync(parseBulletBlock(v))}
      tag="div"
      multiline
      bulletBlock
      style={{ whiteSpace: 'pre-line', ...style }}
    />
  );
}

function ContactRow({ icon, value, onChange, textColor, iconColor }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
      <div style={{ width: 20, height: 20, borderRadius: 6, background: '#FFFFFF', color: iconColor, display: 'grid', placeItems: 'center', fontSize: 10.5, fontWeight: 700 }}>
        {icon}
      </div>
      <EditableText value={value} onChange={onChange} tag="span" style={{ color: textColor, fontSize: 12.4, lineHeight: 1.45 }} />
    </div>
  );
}

function PortraitFallback({ sidebarColor }) {
  return (
    <div
      style={{
        width: PHOTO_W,
        height: PHOTO_H,
        borderRadius: 999,
        border: '3px solid #F2ECE4',
        background: 'linear-gradient(180deg,#f4efe8 0%,#dfd2c4 100%)',
        boxShadow: '0 16px 42px rgba(46,62,106,.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 42, left: '50%', width: 78, height: 78, borderRadius: '50%', background: '#E8DDD1', transform: 'translateX(-50%)' }} />
      <div style={{ position: 'absolute', top: 54, left: '50%', width: 96, height: 62, borderRadius: '50% 50% 42% 42%', background: '#5B483A', transform: 'translateX(-50%)' }} />
      <div style={{ position: 'absolute', top: 78, left: '50%', width: 50, height: 50, borderRadius: '50%', background: '#F2DCC7', transform: 'translateX(-50%)' }} />
      <div style={{ position: 'absolute', top: 122, left: '50%', width: 118, height: 128, borderRadius: '44% 44% 38% 38%', background: '#E2C5A1', transform: 'translateX(-50%)' }} />
      <div style={{ position: 'absolute', top: 150, left: '50%', width: 146, height: 112, borderRadius: '44% 44% 34% 34%', background: sidebarColor, opacity: 0.08, transform: 'translateX(-50%)' }} />
    </div>
  );
}

export default function StrategistGold({
  data,
  photo,
  photoSettings,
  onPhotoSettings,
  colors = {},
  globalFont = {},
  onEdit,
  sectionOrder,
  sidebarOrder,
  sectionLabels = {},
}) {
  const d = data;
  const c = { ...DEFAULTS, ...colors };
  const fontFamily = globalFont.family || "'Outfit',sans-serif";
  const fontSize = globalFont.size || 10;
  const mainSections = sectionOrder || ['experience'];
  const sideSections = sidebarOrder || ['summary', 'skills', 'education', 'certifications'];
  const sidebarText = 'rgba(255,255,255,.94)';
  const sidebarMuted = 'rgba(255,255,255,.82)';
  const ruleColor = c.accent || '#CBD3E0';
  const nameFontSize = getNameFontSize(d.name);

  const L = {
    summary: 'About Me',
    experience: 'Experience',
    skills: 'Skills',
    education: 'Education',
    certifications: 'Certifications',
    ...sectionLabels,
  };

  const findCustomSection = (id) => {
    if (typeof id !== 'string' || !id.startsWith('cs_')) return null;
    return (d.customSections || []).find((section) => section.id === id.slice(3)) || null;
  };

  const renderCustomSide = (section) => {
    if (!section) return null;
    return (
      <DraggableSection key={`cs_${section.id}`} id={`cs_${section.id}`}>
        <div style={{ marginBottom: SIDE_SECTION_GAP }}>
          <SideHeading value={section.title} onChange={(v) => onEdit('custom_section_rename', { id: section.id, v })} />
          {isStructuredProjectSection(section) ? (
            <ProjectSection section={{ ...section, title: '' }} onEdit={onEdit} tone="side" headingColor="#FFFFFF" bodyColor={sidebarText} accentColor="#FFFFFF" mutedColor={sidebarMuted} fontSize={fontSize + 1} />
          ) : (
            <>
              <BulletEditor
                items={section.items || []}
                onSync={(nextItems) => syncIndexedList(section.items || [], nextItems, {
                  changeItem: (j, value) => onEdit('custom_item', { id: section.id, j, v: value }),
                  addItem: () => onEdit('custom_item_add', { id: section.id }),
                  deleteItem: (j) => onEdit('custom_item_del', { id: section.id, j }),
                })}
                style={{ color: sidebarText, fontSize: fontSize + 2, lineHeight: 1.66, margin: 0 }}
              />
              <AddButton onClick={() => onEdit('custom_item_add', { id: section.id })} label="item" />
            </>
          )}
        </div>
      </DraggableSection>
    );
  };

  const renderCustomMain = (section) => {
    if (!section) return null;
    return (
      <DraggableSection key={`cs_${section.id}`} id={`cs_${section.id}`}>
        <section style={{ marginBottom: MAIN_SECTION_GAP }}>
          <PillHeading value={section.title} onChange={(v) => onEdit('custom_section_rename', { id: section.id, v })} color={c.heading} borderColor={ruleColor} />
          {isStructuredProjectSection(section) ? (
            <ProjectSection section={{ ...section, title: '' }} onEdit={onEdit} tone="main" headingColor={c.heading} bodyColor={c.text} accentColor={c.heading} fontSize={fontSize + 1} />
          ) : (
            <>
              <BulletEditor
                items={section.items || []}
                onSync={(nextItems) => syncIndexedList(section.items || [], nextItems, {
                  changeItem: (j, value) => onEdit('custom_item', { id: section.id, j, v: value }),
                  addItem: () => onEdit('custom_item_add', { id: section.id }),
                  deleteItem: (j) => onEdit('custom_item_del', { id: section.id, j }),
                })}
                style={{ color: c.text, fontSize: fontSize + 2, lineHeight: 1.7, margin: 0 }}
              />
              <AddButton onClick={() => onEdit('custom_item_add', { id: section.id })} label="item" />
            </>
          )}
        </section>
      </DraggableSection>
    );
  };

  const renderSideSection = (sectionId) => {
    if (sectionId === 'summary') {
      return (
        <DraggableSection key={sectionId} id={sectionId}>
          <div style={{ marginBottom: SIDE_SECTION_GAP }}>
            <SideHeading value={L.summary} onChange={(v) => onEdit('section_rename', { sectionId: 'summary', v })} />
            <EditableText value={d.summary} onChange={(v) => onEdit('summary', { v })} tag="p" multiline style={{ color: sidebarMuted, fontSize: fontSize + 2, lineHeight: 1.6, margin: 0 }} />
          </div>
        </DraggableSection>
      );
    }

    if (sectionId === 'skills') {
      return (
        <DraggableSection key={sectionId} id={sectionId}>
          <div style={{ marginBottom: SIDE_SECTION_GAP }}>
            <SideHeading value={L.skills} onChange={(v) => onEdit('section_rename', { sectionId: 'skills', v })} />
            <BulletEditor
              items={d.skills || []}
              onSync={(nextItems) => syncIndexedList(d.skills || [], nextItems, {
                changeItem: (i, value) => onEdit('skill', { i, v: value }),
                addItem: () => onEdit('skill_add'),
                deleteItem: (i) => onEdit('skill_del', { i }),
              })}
              style={{ color: sidebarText, fontSize: fontSize + 2, lineHeight: 1.72, margin: 0 }}
            />
            <AddButton onClick={() => onEdit('skill_add')} label="skill" />
          </div>
        </DraggableSection>
      );
    }

    if (sectionId === 'education') {
      return (
        <DraggableSection key={sectionId} id={sectionId}>
          <div style={{ marginBottom: SIDE_SECTION_GAP }}>
            <SideHeading value={L.education} onChange={(v) => onEdit('section_rename', { sectionId: 'education', v })} />
            {(d.education || []).map((edu, index) => (
              <div key={`edu-side-${index}`} className="group/item" style={{ marginBottom: 8 }}>
                <EditableText
                  value={edu.school || 'University'}
                  onChange={(v) => onEdit('edu_school', { i: index, v })}
                  tag="p"
                  style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1.2 }}
                />
                <EditableText
                  value={edu.degree || 'Degree'}
                  onChange={(v) => onEdit('edu_degree', { i: index, v })}
                  tag="p"
                  style={{ color: sidebarMuted, fontSize: fontSize + 1, margin: '3px 0 0 0', lineHeight: 1.45 }}
                />
                <EditableText
                  value={edu.year || 'Year'}
                  onChange={(v) => onEdit('edu_year', { i: index, v })}
                  tag="p"
                  style={{ color: sidebarText, fontSize: fontSize + 1, fontWeight: 600, margin: '2px 0 0 0', lineHeight: 1.35 }}
                />
                <DeleteButton onClick={() => onEdit('edu_del', { i: index })} />
              </div>
            ))}
            <AddButton onClick={() => onEdit('edu_add', {})} label="education" />
          </div>
        </DraggableSection>
      );
    }

    if (sectionId === 'certifications') {
      if (!d.certifications?.length) return null;
      return (
        <DraggableSection key={sectionId} id={sectionId}>
          <div style={{ marginBottom: SIDE_SECTION_GAP }}>
            <SideHeading value={L.certifications} onChange={(v) => onEdit('section_rename', { sectionId: 'certifications', v })} />
            <BulletEditor
              items={d.certifications || []}
              glyph="\u25C6"
              onSync={(nextItems) => syncIndexedList(d.certifications || [], nextItems, {
                changeItem: (i, value) => onEdit('cert', { i, v: value }),
                addItem: () => onEdit('cert_add', {}),
                deleteItem: (i) => onEdit('cert_del', { i }),
              })}
              style={{ color: sidebarText, fontSize: fontSize + 2, lineHeight: 1.68, margin: 0 }}
            />
            <AddButton onClick={() => onEdit('cert_add', {})} label="certification" />
          </div>
        </DraggableSection>
      );
    }

    return renderCustomSide(findCustomSection(sectionId));
  };

  const renderMainSection = (sectionId) => {
    if (sectionId === 'experience') {
      return (
        <DraggableSection key={sectionId} id={sectionId}>
          <section style={{ marginBottom: MAIN_SECTION_GAP }}>
            <PillHeading value={L.experience} onChange={(v) => onEdit('section_rename', { sectionId: 'experience', v })} color={c.heading} borderColor={ruleColor} />
            <SortableContext items={d.experience?.map((exp) => `exp-${exp._id}`) || []} strategy={verticalListSortingStrategy}>
              {(d.experience || []).map((exp, index) => {
                const groupedSections = Array.isArray(exp.sections)
                  ? exp.sections.filter((section) => section?.heading || (section?.bullets || []).length)
                  : [];

                return (
                  <DraggableSection key={exp._id} id={`exp-${exp._id}`}>
                    <div style={{ marginBottom: 10 }} className="group/exp">
                      <EditableText value={exp.role} onChange={(v) => onEdit('exp_role', { i: index, v })} tag="p" style={{ color: '#17181C', fontSize: 14, fontWeight: 700, margin: '0 0 2px 0', lineHeight: 1.25 }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 14 }}>
                        <EditableText value={exp.company} onChange={(v) => onEdit('exp_company', { i: index, v })} tag="h3" style={{ color: '#111111', fontSize: 18, fontWeight: 800, margin: 0, lineHeight: 1.1, flex: 1 }} />
                        <EditableText value={exp.period} onChange={(v) => onEdit('exp_period', { i: index, v })} tag="span" style={{ color: '#1B1F28', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '0.02em' }} />
                      </div>
                      {!!exp.client && <EditableText value={exp.client} onChange={(v) => onEdit('exp_client', { i: index, v })} tag="p" style={{ color: c.text, fontSize: 12, margin: '4px 0 0 0', lineHeight: 1.45, fontWeight: 600 }} />}

                      {groupedSections.map((section, groupIndex) => (
                        <div key={`${exp._id}-group-${groupIndex}`} className="group/item" style={{ marginTop: 6, marginBottom: 8 }}>
                          <EditableText value={section.heading} onChange={(v) => onEdit('exp_group_heading', { i: index, j: groupIndex, v })} tag="p" style={{ color: c.heading, fontSize: 12.2, fontWeight: 700, margin: '0 0 4px 0', lineHeight: 1.35 }} />
                          <BulletEditor
                            items={section.bullets || []}
                            onSync={(nextBullets) => syncIndexedList(section.bullets || [], nextBullets, {
                              changeItem: (k, value) => onEdit('exp_group_bullet', { i: index, j: groupIndex, k, v: value }),
                              addItem: () => onEdit('exp_group_bullet_add', { i: index, j: groupIndex }),
                              deleteItem: (k) => onEdit('exp_group_bullet_del', { i: index, j: groupIndex, k }),
                            })}
                            style={{ color: c.text, fontSize: 12.2, lineHeight: 1.68, margin: 0 }}
                          />
                          <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                            <AddButton onClick={() => onEdit('exp_group_bullet_add', { i: index, j: groupIndex })} label="bullet" />
                            <button type="button" onClick={() => onEdit('exp_group_del', { i: index, j: groupIndex })} onMouseDown={(e) => e.stopPropagation()} className="text-[10px] opacity-40 hover:opacity-100 transition-opacity" style={{ color: '#F43F5E' }}>
                              Remove section
                            </button>
                          </div>
                        </div>
                      ))}

                      <div style={{ marginTop: 6 }}>
                        <BulletEditor
                          items={exp.bullets || []}
                          onSync={(nextBullets) => syncIndexedList(exp.bullets || [], nextBullets, {
                            changeItem: (j, value) => onEdit('exp_bullet', { i: index, j, v: value }),
                            addItem: () => onEdit('exp_bullet_add', { i: index }),
                            deleteItem: (j) => onEdit('exp_bullet_del', { i: index, j }),
                          })}
                          style={{ color: c.text, fontSize: 12.4, lineHeight: 1.7, margin: 0 }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                        <AddButton onClick={() => onEdit('exp_bullet_add', { i: index })} label={groupedSections.length ? 'base bullet' : 'bullet'} />
                        <AddButton onClick={() => onEdit('exp_group_add', { i: index })} label="sub-section" />
                        <button type="button" onClick={() => onEdit('exp_del', { i: index })} onMouseDown={(e) => e.stopPropagation()} className="text-[10px] opacity-40 hover:opacity-100 transition-opacity" style={{ color: '#F43F5E' }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </DraggableSection>
                );
              })}
            </SortableContext>
            <AddButton onClick={() => onEdit('exp_add', {})} label="experience" />
          </section>
        </DraggableSection>
      );
    }

    if (sectionId === 'summary') {
      return (
        <DraggableSection key={sectionId} id={sectionId}>
          <section style={{ marginBottom: MAIN_SECTION_GAP }}>
            <PillHeading value={L.summary} onChange={(v) => onEdit('section_rename', { sectionId: 'summary', v })} color={c.heading} borderColor={ruleColor} />
            <EditableText value={d.summary} onChange={(v) => onEdit('summary', { v })} tag="p" multiline style={{ color: c.text, fontSize: fontSize + 2, lineHeight: 1.68, margin: 0 }} />
          </section>
        </DraggableSection>
      );
    }

    return renderCustomMain(findCustomSection(sectionId));
  };

  return (
    <div style={{ width: '100%', minHeight: '100%', background: c.background, color: c.text, fontFamily, fontSize: `${fontSize}px`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: LEFT_TOP, bottom: 0, width: LEFT_WIDTH, background: c.sidebar, borderTopRightRadius: 116, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, width: 300, height: 226, background: c.sidebar, borderBottomLeftRadius: 96, pointerEvents: 'none' }} />

      <div style={{ position: 'absolute', left: 42, top: 44, right: 260, zIndex: 2 }}>
        <EditableText
          value={d.name}
          onChange={(v) => onEdit('name', { v })}
          tag="h1"
          multiline
          style={{
            color: c.heading,
            fontSize: nameFontSize,
            fontWeight: 800,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            margin: 0,
            lineHeight: 0.96,
            maxWidth: '100%',
            whiteSpace: 'normal',
            overflowWrap: 'anywhere',
          }}
        />
        <EditableText value={d.title} onChange={(v) => onEdit('title', { v })} tag="p" style={{ color: '#151515', fontSize: 16, fontWeight: 600, letterSpacing: '0.08em', margin: '16px 0 0 2px', lineHeight: 1.18, maxWidth: 320 }} />
      </div>

      <div style={{ position: 'absolute', right: 94, top: 52, zIndex: 3 }}>
        {photo ? (
          <DraggablePhoto photo={photo} ps={photoSettings} onPs={onPhotoSettings} shape="square" width={PHOTO_W} height={PHOTO_H} borderColor="#F2ECE4" style={{ borderRadius: 999, boxShadow: '0 16px 42px rgba(46,62,106,.08)' }} />
        ) : (
          <PortraitFallback sidebarColor={c.sidebar} />
        )}
      </div>

      <DroppableColumn id="column-side" style={{ position: 'absolute', left: 0, top: LEFT_TOP, bottom: 0, width: LEFT_WIDTH, padding: '28px 24px 28px', boxSizing: 'border-box', zIndex: 2, color: sidebarText }}>
        <SortableContext items={sideSections} strategy={verticalListSortingStrategy}>
          {sideSections.includes('summary') && renderSideSection('summary')}
          <div style={{ marginBottom: SIDE_SECTION_GAP }}>
            <SideHeading value="Contact" onChange={() => {}} />
            <ContactRow icon="☎" value={d.phone} onChange={(v) => onEdit('phone', { v })} textColor={sidebarText} iconColor={c.sidebar} />
            <ContactRow icon="✉" value={d.email} onChange={(v) => onEdit('email', { v })} textColor={sidebarText} iconColor={c.sidebar} />
            <ContactRow icon="⌂" value={d.location} onChange={(v) => onEdit('location', { v })} textColor={sidebarText} iconColor={c.sidebar} />
          </div>
          {sideSections.filter((id) => id !== 'summary').map(renderSideSection)}
        </SortableContext>
      </DroppableColumn>

      <DroppableColumn id="column-main" style={{ position: 'absolute', left: LEFT_WIDTH + 30, right: 30, top: 276, bottom: 24, zIndex: 2 }}>
        <SortableContext items={mainSections} strategy={verticalListSortingStrategy}>
          {mainSections.map(renderMainSection)}
        </SortableContext>
      </DroppableColumn>
    </div>
  );
}

StrategistGold.defaults = DEFAULTS;
