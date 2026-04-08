import EditableText from '../components/EditableText';
import DraggablePhoto from '../components/DraggablePhoto';
import DraggableSection from '../components/DraggableSection';
import DroppableColumn from '../components/DroppableColumn';
import AddButton from '../components/AddButton';
import DeleteButton from '../components/DeleteButton';
import SkillsRenderer from '../components/SkillsRenderer';
import EducationRenderer from '../components/EducationRenderer';
import CertificationsRenderer from '../components/CertificationsRenderer';
import ProjectSection from '../components/ProjectSection';
import { isStructuredProjectSection } from '../utils/projectSections';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { bulletBlockValue, parseBulletBlock, isPlainBulletLine, stripPlainBulletPrefix, isStoredBulletLine, extractStoredBulletGlyph } from '../utils/bulletBlocks';

const DEFAULTS = {
  accent: '#9CA3B5',
  sidebar: '#3E4456',
  heading: '#3D4456',
  text: '#2B2F3A',
  background: '#FFFFFF',
};

export default function DesignerSlate({
  data,
  photo,
  photoSettings,
  onPhotoSettings,
  photoShape,
  colors = {},
  globalFont = {},
  onEdit,
  sectionOrder,
  sidebarOrder,
  skillStyle,
  contactStyle,
  educationStyle,
  certificationStyle,
  sectionLabels = {},
}) {
  const d = data;
  const c = { ...DEFAULTS, ...colors };
  const fontFamily = globalFont.family || "'Raleway',sans-serif";
  const headingFamily = "'Outfit',sans-serif";
  const fontSize = globalFont.size || 10;
  const mainSections = sectionOrder || ['summary', 'experience'];
  const sideSections = sidebarOrder || ['skills', 'education', 'certifications'];
  const sidebarText = 'rgba(255,255,255,.94)';
  const sidebarMuted = 'rgba(255,255,255,.74)';
  const softRule = 'rgba(61, 68, 86, .55)';
  const compactContacts = contactStyle === 'inline-compact';
  const sideSectionGap = 6;
  const mainSectionGap = 0;
  const mainSectionLift = -10;
  const summaryLineHeight = 1.32;
  const getGroupedSections = (exp) => Array.isArray(exp?.sections)
    ? exp.sections.filter((section) => section?.heading || (section?.bullets || []).length)
    : [];

  const L = {
    summary: 'Profile Summary',
    experience: 'Experience',
    skills: 'Skills',
    education: 'Education',
    certifications: 'Certifications',
    ...sectionLabels,
  };

  const contactEntries = [
    { key: 'phone', value: d.phone, field: 'phone', icon: PhoneIcon },
    { key: 'email', value: d.email, field: 'email', icon: MailIcon },
    { key: 'location', value: d.location, field: 'location', icon: HomeIcon },
  ].filter(item => item.value);

  const findCS = (id) => {
    if (typeof id !== 'string' || !id.startsWith('cs_')) return null;
    return (d.customSections || []).find(s => s.id === id.slice(3)) || null;
  };

  const renderDesignerBullets = (bullets, options = {}) => {
    const {
      textColor,
      fontDelta = 0,
      lineHeight = 1.55,
      bulletEdit,
      bulletDelete,
      bulletAdd,
    } = options;

    return (
      <EditableText
        value={bulletBlockValue(bullets, '•')}
        onChange={(v) => {
          const nextBullets = parseBulletBlock(v);
          const current = bullets || [];
          nextBullets.forEach((item, bulletIndex) => {
            if (current[bulletIndex] !== undefined) bulletEdit(bulletIndex, item);
            else bulletAdd?.();
          });
          nextBullets.forEach((item, bulletIndex) => {
            if (current[bulletIndex] === undefined) bulletEdit(bulletIndex, item);
          });
          for (let bulletIndex = current.length - 1; bulletIndex >= nextBullets.length; bulletIndex -= 1) {
            bulletDelete(bulletIndex);
          }
        }}
        tag="div"
        multiline
        bulletBlock
        style={{ whiteSpace: 'pre-line', fontSize: fontSize + fontDelta, color: textColor, lineHeight }}
      />
    );
  };

  const renderDesignerBulletRows = (bullets, options = {}) => {
    const {
      textColor,
      fontDelta = 0,
      lineHeight = 1.55,
      bulletEdit,
      bulletDelete,
      bulletAdd,
    } = options;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {(bullets || []).map((item, bulletIndex) => {
          const storedBullet = isStoredBulletLine(item);
          const glyph = storedBullet ? extractStoredBulletGlyph(item, '•') : (isPlainBulletLine(item) ? '' : '•');
          const text = storedBullet ? item.split('::').slice(2).join('::') : stripPlainBulletPrefix(item || '');
          const nextValue = glyph
            ? `__bullet__::${glyph}::`
            : '__plain__::';

          return (
            <div
              key={bulletIndex}
              className="group/bullet"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                paddingRight: 18,
                minWidth: 0,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 18,
                  flex: '0 0 18px',
                  color: textColor,
                  fontSize: fontSize + fontDelta,
                  lineHeight,
                  textAlign: 'center',
                }}
              >
                {glyph || ''}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <EditableText
                  value={text}
                  onChange={(v) => bulletEdit(bulletIndex, `${nextValue}${v}`)}
                  tag="div"
                  style={{
                    fontSize: fontSize + fontDelta,
                    color: textColor,
                    lineHeight,
                    whiteSpace: 'normal',
                    overflowWrap: 'anywhere',
                    wordBreak: 'normal',
                    minWidth: 0,
                  }}
                />
              </div>

              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 1,
                }}
              >
                <DeleteButton onClick={() => bulletDelete(bulletIndex)} />
              </div>
            </div>
          );
        })}

        <div>
          <AddButton onClick={() => bulletAdd?.()} label="bullet" />
        </div>
      </div>
    );
  };

  const renderDesignerExperience = (exp, index, variant = 'main') => {
    const groupedSections = getGroupedSections(exp);
    const isSidebar = variant === 'side';
    const titleColor = isSidebar ? '#FFFFFF' : c.text;
    const companyColor = isSidebar ? sidebarText : c.text;
    const metaColor = isSidebar ? sidebarMuted : c.text;
    const dotColor = isSidebar ? sidebarText : c.heading;
    const accentTextColor = isSidebar ? sidebarText : c.text;

    return (
      <article className="group/item" style={{ marginTop: index === 0 ? -6 : -2, marginBottom: isSidebar ? 7 : 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <EditableText
            value={exp.role}
            onChange={(v) => onEdit('exp_role', { i: index, v })}
            tag={isSidebar ? 'p' : 'h3'}
            style={{
              fontSize: fontSize + (isSidebar ? 2 : 5),
              fontWeight: 800,
              color: titleColor,
              fontFamily: headingFamily,
              letterSpacing: isSidebar ? '0' : '-0.02em',
              margin: 0,
              lineHeight: 1.16,
            }}
          />
          <EditableText
            value={exp.period}
            onChange={(v) => onEdit('exp_period', { i: index, v })}
            tag="span"
            style={{ fontSize: fontSize + (isSidebar ? 0 : 1), color: metaColor, flexShrink: 0, margin: 0 }}
          />
        </div>

        <EditableText
          value={exp.company}
          onChange={(v) => onEdit('exp_company', { i: index, v })}
          tag="p"
          style={{
            fontSize: fontSize + (isSidebar ? 1 : 2),
            color: companyColor,
            margin: isSidebar ? '1px 0 0 0' : '4px 0 0 0',
            lineHeight: 1.22,
            fontWeight: isSidebar ? 500 : 600,
          }}
        />

        {!!exp.client && (
          <EditableText
            value={exp.client}
            onChange={(v) => onEdit('exp_client', { i: index, v })}
            tag="p"
            style={{
              fontSize: fontSize + (isSidebar ? 0 : 1),
              color: accentTextColor,
              margin: isSidebar ? '1px 0 0 0' : '2px 0 0 0',
              lineHeight: 1.24,
              fontWeight: isSidebar ? 500 : 500,
            }}
          />
        )}

        {groupedSections.length > 0 ? (
          <div style={{ marginTop: isSidebar ? 4 : 6 }}>
            {groupedSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="group/item" style={{ marginBottom: isSidebar ? 6 : 8 }}>
                <EditableText
                  value={section.heading}
                  onChange={(v) => onEdit('exp_group_heading', { i: index, j: sectionIndex, v })}
                  tag="p"
                  style={{
                    color: titleColor,
                    margin: '0 0 3px 0',
                    lineHeight: 1.24,
                    fontWeight: 700,
                    textDecoration: 'underline',
                    fontSize: fontSize + (isSidebar ? 0 : 1),
                  }}
                />
                {renderDesignerBulletRows(section.bullets, {
                  textColor: isSidebar ? sidebarText : c.text,
                  dotColor,
                  fontDelta: isSidebar ? 0 : 1,
                  lineHeight: isSidebar ? 1.55 : 1.5,
                  bulletEdit: (bulletIndex, v) => onEdit('exp_group_bullet', { i: index, j: sectionIndex, k: bulletIndex, v }),
                  bulletDelete: (bulletIndex) => onEdit('exp_group_bullet_del', { i: index, j: sectionIndex, k: bulletIndex }),
                  bulletAdd: () => onEdit('exp_group_bullet_add', { i: index, j: sectionIndex }),
                })}
                <div style={{ display: 'flex', gap: 10, marginTop: 5 }}>
                  <AddButton onClick={() => onEdit('exp_group_bullet_add', { i: index, j: sectionIndex })} label="bullet" />
                  <button onClick={() => onEdit('exp_group_del', { i: index, j: sectionIndex })} onMouseDown={(e) => e.stopPropagation()} className="text-[10px] opacity-40 hover:opacity-100 transition-opacity" style={{ color: '#F43F5E' }}>Remove section</button>
                </div>
              </div>
            ))}
            {(exp.bullets || []).length > 0 && renderDesignerBulletRows(exp.bullets, {
              textColor: isSidebar ? sidebarText : c.text,
              dotColor,
              fontDelta: isSidebar ? 0 : 1,
              lineHeight: isSidebar ? 1.55 : 1.5,
              bulletEdit: (bulletIndex, v) => onEdit('exp_bullet', { i: index, j: bulletIndex, v }),
              bulletDelete: (bulletIndex) => onEdit('exp_bullet_del', { i: index, j: bulletIndex }),
              bulletAdd: () => onEdit('exp_bullet_add', { i: index }),
            })}
          </div>
        ) : (
          <div style={{ marginTop: isSidebar ? 3 : 5 }}>
            {renderDesignerBulletRows(exp.bullets || [], {
              textColor: isSidebar ? sidebarText : c.text,
              dotColor,
              fontDelta: isSidebar ? 0 : 1,
              lineHeight: isSidebar ? 1.55 : 1.5,
              bulletEdit: (bulletIndex, v) => onEdit('exp_bullet', { i: index, j: bulletIndex, v }),
              bulletDelete: (bulletIndex) => onEdit('exp_bullet_del', { i: index, j: bulletIndex }),
              bulletAdd: () => onEdit('exp_bullet_add', { i: index }),
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 5 }}>
          {(groupedSections.length === 0 || (exp.bullets || []).length > 0) && (
            <AddButton onClick={() => onEdit('exp_bullet_add', { i: index })} label={groupedSections.length > 0 ? 'base bullet' : 'bullet'} />
          )}
          {groupedSections.length > 0 && (exp.bullets || []).length === 0 && (
            <AddButton onClick={() => onEdit('exp_bullet_add', { i: index })} label="base bullet" />
          )}
          <AddButton onClick={() => onEdit('exp_group_add', { i: index })} label="sub-section" />
          <button onClick={() => onEdit('exp_del', { i: index })} onMouseDown={(e) => e.stopPropagation()} className="text-[10px] opacity-40 hover:opacity-100 transition-opacity" style={{ color: '#F43F5E' }}>Remove</button>
        </div>
      </article>
    );
  };

  function renderSideSection(sectionId) {
    if (sectionId === 'summary') {
      return (
        <DraggableSection key={sectionId} id={sectionId}>
          <SidebarSectionShell title={L.summary} onRename={v => onEdit('section_rename', { sectionId: 'summary', v })} accent={sidebarText} ruleColor="rgba(255,255,255,.7)" gap={sideSectionGap}>
            <EditableText
              value={d.summary}
              onChange={v => onEdit('summary', { v })}
              tag="p"
              multiline
              style={{ fontSize: fontSize + 1, color: sidebarText, lineHeight: 1.48, margin: 0 }}
            />
          </SidebarSectionShell>
        </DraggableSection>
      );
    }

    if (sectionId === 'experience') {
      return (
        <DraggableSection key={sectionId} id={sectionId}>
          <SidebarSectionShell title={L.experience} onRename={v => onEdit('section_rename', { sectionId: 'experience', v })} accent={sidebarText} ruleColor="rgba(255,255,255,.7)" gap={sideSectionGap}>
            <SortableContext items={d.experience?.map(e => `exp-${e._id}`) || []} strategy={verticalListSortingStrategy}>
              {d.experience?.map((exp, i) => (
                <DraggableSection key={exp._id} id={`exp-${exp._id}`}>
                  {renderDesignerExperience(exp, i, 'side')}
                </DraggableSection>
              ))}
            </SortableContext>
            <div style={{ marginTop: -3 }}>
              <AddButton onClick={() => onEdit('exp_add', {})} label="experience" />
            </div>
          </SidebarSectionShell>
        </DraggableSection>
      );
    }

    if (sectionId === 'education') {
      return (
        <DraggableSection key={sectionId} id={sectionId}>
          <SidebarSectionShell title={L.education} onRename={v => onEdit('section_rename', { sectionId: 'education', v })} accent={sidebarText} ruleColor="rgba(255,255,255,.7)" gap={2} compact lift={-12}>
            <EducationRenderer
              education={d.education}
              onEdit={onEdit}
              variant={educationStyle || 'simple-list'}
              accentColor={c.accent}
              headingColor="#FFFFFF"
              textColor={sidebarText}
              fontSize={fontSize + 1}
              fontFamily={fontFamily}
            />
          </SidebarSectionShell>
        </DraggableSection>
      );
    }

    if (sectionId === 'certifications') {
      return (
        <DraggableSection key={sectionId} id={sectionId}>
          <SidebarSectionShell title={L.certifications} onRename={v => onEdit('section_rename', { sectionId: 'certifications', v })} accent={sidebarText} ruleColor="rgba(255,255,255,.7)" gap={2} compact lift={-12}>
            <CertificationsRenderer
              certifications={d.certifications}
              onEdit={onEdit}
              variant={certificationStyle || 'simple-list'}
              accentColor={c.accent}
              textColor={sidebarText}
              fontSize={fontSize + 1}
              fontFamily={fontFamily}
            />
          </SidebarSectionShell>
        </DraggableSection>
      );
    }

    if (sectionId === 'skills') {
      return (
        <DraggableSection key={sectionId} id={sectionId}>
          <SidebarSectionShell title={L.skills} onRename={v => onEdit('section_rename', { sectionId: 'skills', v })} accent={sidebarText} ruleColor="rgba(255,255,255,.7)" gap={sideSectionGap}>
            <SkillsRenderer
              skills={d.skills}
              onEdit={onEdit}
              variant={skillStyle || 'simple-list'}
              accentColor={c.accent}
              textColor={sidebarText}
              fontSize={fontSize + 1}
              fontFamily={fontFamily}
            />
          </SidebarSectionShell>
        </DraggableSection>
      );
    }

    const csSide = findCS(sectionId);
    if (csSide) {
      if (isStructuredProjectSection(csSide)) {
        return (
          <DraggableSection key={sectionId} id={sectionId}>
            <ProjectSection
              section={csSide}
              onEdit={onEdit}
              tone="side"
              headingColor="#FFFFFF"
              bodyColor={sidebarText}
              accentColor={sidebarText}
              mutedColor={sidebarMuted}
              fontSize={fontSize + 1}
            />
          </DraggableSection>
        );
      }

      if (/language/i.test(csSide.title)) {
        return (
          <DraggableSection key={sectionId} id={sectionId}>
            <SidebarSectionShell title={csSide.title} onRename={v => onEdit('custom_section_rename', { id: csSide.id, v })} accent={sidebarText} ruleColor="rgba(255,255,255,.7)" gap={2} compact lift={-12}>
              {(csSide.items || []).map((item, j) => (
                <div key={j} className="group/item" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <EditableText value={item} onChange={v => onEdit('custom_item', { id: csSide.id, j, v })} tag="span" style={{ flex: 1, fontSize: fontSize + 1, color: sidebarText, fontWeight: 600 }} />
                  <DeleteButton onClick={() => onEdit('custom_item_del', { id: csSide.id, j })} />
                </div>
              ))}
              <AddButton onClick={() => onEdit('custom_item_add', { id: csSide.id })} />
            </SidebarSectionShell>
          </DraggableSection>
        );
      }

      return (
        <DraggableSection key={sectionId} id={sectionId}>
            <SidebarSectionShell title={csSide.title} onRename={v => onEdit('custom_section_rename', { id: csSide.id, v })} accent={sidebarText} ruleColor="rgba(255,255,255,.7)" gap={2} compact lift={-12}>
            {(csSide.items || []).map((item, j) => (
              <div key={j} className="group/item" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <span style={{ color: '#FFFFFF', opacity: 0.75, marginTop: 5, fontSize: 8 }}>&#9679;</span>
                <EditableText value={item} onChange={v => onEdit('custom_item', { id: csSide.id, j, v })} tag="span" style={{ flex: 1, fontSize: fontSize + 1, color: sidebarText, lineHeight: 1.55 }} />
                <DeleteButton onClick={() => onEdit('custom_item_del', { id: csSide.id, j })} />
              </div>
            ))}
            <AddButton onClick={() => onEdit('custom_item_add', { id: csSide.id })} />
          </SidebarSectionShell>
        </DraggableSection>
      );
    }

    return null;
  }

  function renderMainSection(sectionId) {
    if (sectionId === 'summary') {
      return (
        <DraggableSection key={sectionId} id={sectionId}>
          <MainSectionShell title={L.summary} onRename={v => onEdit('section_rename', { sectionId: 'summary', v })} accent={c.heading} ruleColor={softRule} gap={mainSectionGap}>
            <EditableText
              value={d.summary}
              onChange={v => onEdit('summary', { v })}
              tag="p"
              multiline
              style={{ fontSize: fontSize + 2, color: c.text, lineHeight: summaryLineHeight, margin: 0 }}
            />
          </MainSectionShell>
        </DraggableSection>
      );
    }

    if (sectionId === 'experience') {
      return (
        <DraggableSection key={sectionId} id={sectionId}>
          <MainSectionShell title={L.experience} onRename={v => onEdit('section_rename', { sectionId: 'experience', v })} accent={c.heading} ruleColor={softRule} gap={mainSectionGap} lift={0}>
            <div style={{ marginTop: 0 }}>
            <SortableContext items={d.experience?.map(e => `exp-${e._id}`) || []} strategy={verticalListSortingStrategy}>
              {d.experience?.map((exp, i) => (
                <DraggableSection key={exp._id} id={`exp-${exp._id}`}>
                  {renderDesignerExperience(exp, i, 'main')}
                </DraggableSection>
              ))}
            </SortableContext>
            </div>
            <div style={{ marginTop: 0 }}>
              <AddButton onClick={() => onEdit('exp_add', {})} label="experience" />
            </div>
          </MainSectionShell>
        </DraggableSection>
      );
    }

    if (sectionId === 'education') {
      return (
        <DraggableSection key={sectionId} id={sectionId} style={{ marginTop: mainSectionLift }}>
          <MainSectionShell title={L.education} onRename={v => onEdit('section_rename', { sectionId: 'education', v })} accent={c.heading} ruleColor={softRule} gap={mainSectionGap} lift={0}>
            <EducationRenderer education={d.education} onEdit={onEdit} variant={educationStyle || 'divider-list'} accentColor={c.heading} headingColor={c.heading} textColor={c.text} fontSize={fontSize + 2} fontFamily={fontFamily} />
          </MainSectionShell>
        </DraggableSection>
      );
    }

    if (sectionId === 'certifications') {
      return (
        <DraggableSection key={sectionId} id={sectionId} style={{ marginTop: mainSectionLift }}>
          <MainSectionShell title={L.certifications} onRename={v => onEdit('section_rename', { sectionId: 'certifications', v })} accent={c.heading} ruleColor={softRule} gap={mainSectionGap} lift={0}>
            <CertificationsRenderer certifications={d.certifications} onEdit={onEdit} variant={certificationStyle || 'compact-rows'} accentColor={c.heading} textColor={c.text} fontSize={fontSize + 2} fontFamily={fontFamily} />
          </MainSectionShell>
        </DraggableSection>
      );
    }

    if (sectionId === 'skills') {
      return (
        <DraggableSection key={sectionId} id={sectionId} style={{ marginTop: mainSectionLift }}>
          <MainSectionShell title={L.skills} onRename={v => onEdit('section_rename', { sectionId: 'skills', v })} accent={c.heading} ruleColor={softRule} gap={mainSectionGap} lift={0}>
            <SkillsRenderer skills={d.skills} onEdit={onEdit} variant={skillStyle || 'minimal-divider-list'} accentColor={c.heading} textColor={c.text} fontSize={fontSize + 2} fontFamily={fontFamily} />
          </MainSectionShell>
        </DraggableSection>
      );
    }

    const csMain = findCS(sectionId);
    if (csMain) {
      if (isStructuredProjectSection(csMain)) {
        return (
          <DraggableSection key={sectionId} id={sectionId} style={{ marginTop: mainSectionLift }}>
            <MainSectionShell title={csMain.title} onRename={v => onEdit('custom_section_rename', { id: csMain.id, v })} accent={c.heading} ruleColor={softRule} gap={mainSectionGap} lift={0}>
              <ProjectSection
                section={{ ...csMain, title: '' }}
                onEdit={onEdit}
                tone="main"
                headingColor={c.heading}
                bodyColor={c.text}
                accentColor={c.heading}
                mutedColor={c.text}
                fontSize={fontSize + 1}
              />
            </MainSectionShell>
          </DraggableSection>
        );
      }

      if (/reference/i.test(csMain.title)) {
        return (
          <DraggableSection key={sectionId} id={sectionId} style={{ marginTop: mainSectionLift }}>
            <MainSectionShell title={csMain.title} onRename={v => onEdit('custom_section_rename', { id: csMain.id, v })} accent={c.heading} ruleColor={softRule} gap={mainSectionGap} lift={0}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                {(csMain.items || []).map((item, j) => (
                  <div key={j} className="group/item">
                    <EditableText value={item} onChange={v => onEdit('custom_item', { id: csMain.id, j, v })} tag="p" multiline style={{ fontSize: fontSize + 2, color: c.text, lineHeight: 1.55 }} />
                    <DeleteButton onClick={() => onEdit('custom_item_del', { id: csMain.id, j })} />
                  </div>
                ))}
              </div>
              <AddButton onClick={() => onEdit('custom_item_add', { id: csMain.id })} />
            </MainSectionShell>
          </DraggableSection>
        );
      }

      return (
        <DraggableSection key={sectionId} id={sectionId} style={{ marginTop: mainSectionLift }}>
            <MainSectionShell title={csMain.title} onRename={v => onEdit('custom_section_rename', { id: csMain.id, v })} accent={c.heading} ruleColor={softRule} gap={mainSectionGap} lift={0}>
            {(csMain.items || []).map((item, j) => (
              <div key={j} className="group/item" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <span style={{ color: c.heading, opacity: 0.7, marginTop: 6, fontSize: 8 }}>&#9679;</span>
                <EditableText value={item} onChange={v => onEdit('custom_item', { id: csMain.id, j, v })} tag="p" multiline style={{ flex: 1, fontSize: fontSize + 2, color: c.text, lineHeight: 1.55 }} />
                <DeleteButton onClick={() => onEdit('custom_item_del', { id: csMain.id, j })} />
              </div>
            ))}
            <AddButton onClick={() => onEdit('custom_item_add', { id: csMain.id })} />
          </MainSectionShell>
        </DraggableSection>
      );
    }

    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minHeight: '100%',
        background: c.background,
        color: c.text,
        fontFamily,
        fontSize: `${fontSize}px`,
      }}
    >
      <div style={{ display: 'flex', minHeight: 182 }}>
        <div
          style={{
            width: 280,
            minWidth: 280,
            background: c.sidebar,
            borderBottomRightRadius: 58,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 18px',
          }}
        >
          {photo ? (
            <DraggablePhoto
              photo={photo}
              ps={photoSettings}
              onPs={onPhotoSettings}
              shape={photoShape || 'circle'}
              width={126}
              height={126}
              borderColor={c.accent}
              style={{ borderRadius: '50%', boxShadow: '0 0 0 6px rgba(255,255,255,.08)' }}
            />
          ) : (
            <div
              style={{
                width: 126,
                height: 126,
                borderRadius: '50%',
                border: `5px solid ${c.accent}`,
                background: 'rgba(255,255,255,.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              + Photo
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '10px 46px 0 36px' }}>
          <div>
            <EditableText
              value={d.name}
              onChange={v => onEdit('name', { v })}
              tag="h1"
              multiline
              style={{
                fontFamily: headingFamily,
                color: c.heading,
                fontSize: 40,
                fontWeight: 900,
                lineHeight: 1.02,
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
                maxWidth: 420,
              }}
            />
            <EditableText
              value={d.title}
              onChange={v => onEdit('title', { v })}
              tag="p"
              style={{
                marginTop: 8,
                fontFamily: headingFamily,
                color: c.heading,
                fontSize: 15,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
              }}
            />
          </div>
        </div>
      </div>

      {contactEntries.length > 0 && (
        <div style={{ padding: '12px 24px 0 24px' }}>
          <div
            style={{
              background: c.sidebar,
              borderRadius: 999,
              padding: '11px 20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: compactContacts ? '10px 28px' : '14px 22px',
              alignItems: 'center',
            }}
          >
            {contactEntries.map((entry) => {
              const IconComp = entry.icon;
              return (
                <div key={entry.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <IconComp />
                  <EditableText value={entry.value} onChange={v => onEdit(entry.field, { v })} tag="span" style={{ color: '#FFFFFF', fontSize: fontSize + 1, fontWeight: 600 }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'stretch', marginTop: 6, flex: 1, minHeight: 0 }}>
        <DroppableColumn
          id="column-side"
          style={{
            width: 280,
            minWidth: 280,
            background: c.sidebar,
            borderTopRightRadius: 58,
            padding: '10px 24px 28px',
            overflow: 'hidden',
            alignSelf: 'stretch',
            height: '100%',
            minHeight: 0,
          }}
        >
          <SortableContext items={sideSections} strategy={verticalListSortingStrategy}>
            {sideSections.map(renderSideSection)}
          </SortableContext>
        </DroppableColumn>

        <DroppableColumn
          id="column-main"
          style={{
            flex: 1,
            padding: '8px 42px 28px',
            height: '100%',
            minHeight: 0,
            minWidth: 0,
          }}
        >
          <SortableContext items={mainSections} strategy={verticalListSortingStrategy}>
            {mainSections.map(renderMainSection)}
          </SortableContext>
        </DroppableColumn>
      </div>
    </div>
  );
}

function SidebarSectionShell({ title, onRename, accent, ruleColor, children, gap = 20, compact = false, lift = 0 }) {
  return (
    <section
      style={{
        marginTop: lift,
        marginBottom: gap,
        padding: compact ? '0 5px 2px' : '0 8px 5px',
        marginLeft: compact ? -5 : -8,
        marginRight: compact ? -5 : -8,
      }}
    >
      <EditableText
        value={title}
        onChange={onRename}
        tag="h2"
        style={{
          color: accent,
          fontFamily: "'Outfit',sans-serif",
          fontSize: compact ? 16 : 18,
          fontWeight: 800,
          letterSpacing: '0.1em',
          textTransform: 'capitalize',
          margin: compact ? '-1px 0 0 0' : 0,
        }}
      />
      <div style={{ height: 1, background: ruleColor, margin: compact ? '3px 0 4px' : '5px 0 6px' }} />
      {children}
    </section>
  );
}

function MainSectionShell({ title, onRename, accent, ruleColor, children, gap = 2 }) {
  return (
    <section style={{ marginTop: 0, marginBottom: gap, padding: '0 6px 0', marginLeft: -6, marginRight: -6 }}>
      <EditableText
        value={title}
        onChange={onRename}
        tag="h2"
        style={{
          margin: 0,
          color: accent,
          fontFamily: "'Outfit',sans-serif",
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: '0.1em',
          textTransform: 'capitalize',
        }}
      />
      <div style={{ height: 1, background: ruleColor, margin: '3px 0 3px' }} />
      {children}
    </section>
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.48 19.48 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.91.34 1.8.65 2.65a2 2 0 0 1-.45 2.11L8.04 9.96a16 16 0 0 0 6 6l1.48-1.27a2 2 0 0 1 2.11-.45c.85.31 1.74.53 2.65.65A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

DesignerSlate.defaults = DEFAULTS;
