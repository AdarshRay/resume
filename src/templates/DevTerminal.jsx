import EditableText from '../components/EditableText';
import AddButton from '../components/AddButton';
import DeleteButton from '../components/DeleteButton';
import MainSection from '../components/MainSection';
import SkillsRenderer from '../components/SkillsRenderer';
import ContactRenderer from '../components/ContactRenderer';
import EducationRenderer from '../components/EducationRenderer';
import CertificationsRenderer from '../components/CertificationsRenderer';
import DraggableSection from '../components/DraggableSection';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { bulletBlockValue, parseBulletBlock } from '../utils/bulletBlocks';

const DEFAULTS = {
  accent: '#38BDF8',
  sidebar: '#0f172a',
  heading: '#e2e8f0',
  text: '#94a3b8',
  background: '#0f172a',
};

export default function DevTerminal({ data, colors = {}, globalFont = {}, onEdit, sectionOrder, sidebarOrder, skillStyle, contactStyle, educationStyle, certificationStyle, sectionLabels = {} }) {
  const d = data;
  const accent = colors.accent || DEFAULTS.accent;
  const headingColor = colors.heading || DEFAULTS.heading;
  const textColor = colors.text || DEFAULTS.text;
  const bgColor = colors.background || DEFAULTS.background;

  const fontFamily = globalFont.family || "'JetBrains Mono',monospace";
  const baseFontSize = globalFont.size || 10;
  const sectionGap = 12;
  const headingGap = 6;
  const summaryLineHeight = 1.72;
  const getGroupedSections = (exp) => Array.isArray(exp?.sections)
    ? exp.sections.filter((section) => section?.heading || (section?.bullets || []).length)
    : [];

  const commentStyle = { color: '#475569', fontSize: baseFontSize, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: headingGap };
  const L = { summary: 'Summary', experience: 'Experience', skills: 'Skills', education: 'Education', certifications: 'Certifications', ...sectionLabels };
  const renderTerminalBullets = (bullets, index, groupIndex = null) => (
    <EditableText
      value={bulletBlockValue(bullets, '>')}
      onChange={(v) => {
        const nextBullets = parseBulletBlock(v);
        const current = bullets || [];
        nextBullets.forEach((item, bulletIndex) => {
          if (typeof groupIndex === 'number') {
            if (current[bulletIndex] !== undefined) onEdit('exp_group_bullet', { i: index, j: groupIndex, k: bulletIndex, v: item });
            else onEdit('exp_group_bullet_add', { i: index, j: groupIndex });
          } else if (current[bulletIndex] !== undefined) onEdit('exp_bullet', { i: index, j: bulletIndex, v: item });
          else onEdit('exp_bullet_add', { i: index });
        });
        nextBullets.forEach((item, bulletIndex) => {
          if (current[bulletIndex] === undefined) {
            if (typeof groupIndex === 'number') onEdit('exp_group_bullet', { i: index, j: groupIndex, k: bulletIndex, v: item });
            else onEdit('exp_bullet', { i: index, j: bulletIndex, v: item });
          }
        });
        for (let bulletIndex = current.length - 1; bulletIndex >= nextBullets.length; bulletIndex -= 1) {
          if (typeof groupIndex === 'number') onEdit('exp_group_bullet_del', { i: index, j: groupIndex, k: bulletIndex });
          else onEdit('exp_bullet_del', { i: index, j: bulletIndex });
        }
      }}
      tag="div"
      multiline
      bulletBlock
      style={{ whiteSpace: 'pre-line', fontSize: baseFontSize, lineHeight: summaryLineHeight, color: textColor }}
    />
  );

  const renderTerminalExperience = (exp, index) => {
    const groupedSections = getGroupedSections(exp);

    return (
      <div style={{ marginBottom: 10, paddingLeft: 12, borderLeft: `2px solid ${accent}30` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <EditableText
            value={exp.role}
            onChange={(v) => onEdit('exp_role', { i: index, v })}
            tag="h3"
            style={{ fontSize: baseFontSize + 1, fontWeight: 600, color: headingColor }}
          />
          <EditableText
            value={exp.period}
            onChange={(v) => onEdit('exp_period', { i: index, v })}
            tag="span"
            style={{ fontSize: baseFontSize - 1, color: '#475569', flexShrink: 0, marginLeft: 8 }}
          />
        </div>
        <EditableText
          value={exp.company}
          onChange={(v) => onEdit('exp_company', { i: index, v })}
          tag="p"
          style={{ fontSize: baseFontSize, color: accent, marginTop: 2, marginBottom: 2 }}
        />
        {!!exp.client && (
          <EditableText
            value={exp.client}
            onChange={(v) => onEdit('exp_client', { i: index, v })}
            tag="p"
            style={{ fontSize: baseFontSize, color: textColor, marginTop: 0, marginBottom: 4, fontWeight: 500 }}
          />
        )}

        {groupedSections.length > 0 ? (
          <div style={{ marginTop: 4 }}>
            {groupedSections.map((section, sectionIndex) => (
              <div key={sectionIndex} style={{ marginBottom: 8 }}>
                <EditableText
                  value={section.heading}
                  onChange={(v) => onEdit('exp_group_heading', { i: index, j: sectionIndex, v })}
                  tag="p"
                  style={{ fontSize: baseFontSize, fontWeight: 700, color: headingColor, textDecoration: 'underline', marginBottom: 3 }}
                />
                {renderTerminalBullets(section.bullets || [], index, sectionIndex)}
                <div className="flex gap-2 mt-1">
                  <AddButton onClick={() => onEdit('exp_group_bullet_add', { i: index, j: sectionIndex })} label="bullet" />
                  <button onClick={() => onEdit('exp_group_del', { i: index, j: sectionIndex })} onMouseDown={(e) => e.stopPropagation()} className="text-[10px] opacity-40 hover:opacity-100 transition-opacity" style={{ color: '#F43F5E' }}>Remove section</button>
                </div>
              </div>
            ))}
            {(exp.bullets || []).length > 0 && renderTerminalBullets(exp.bullets, index)}
          </div>
        ) : (
          renderTerminalBullets(exp.bullets || [], index)
        )}

        <div className="flex gap-2 mt-1 flex-wrap">
          <AddButton onClick={() => onEdit('exp_bullet_add', { i: index })} label={groupedSections.length > 0 ? 'base bullet' : 'bullet'} />
          <AddButton onClick={() => onEdit('exp_group_add', { i: index })} label="sub-section" />
          <button onClick={() => onEdit('exp_del', { i: index })} onMouseDown={(e) => e.stopPropagation()} className="text-[10px] opacity-40 hover:opacity-100 transition-opacity" style={{ color: '#F43F5E' }}>Remove</button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', minHeight: '100%', fontFamily, fontSize: `${baseFontSize}px`, background: bgColor, padding: '36px 34px 28px 34px', color: textColor }}>
      {/* Terminal-style top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: sectionGap }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F43F5E' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
        <span style={{ marginLeft: 12, fontSize: 10, color: '#475569' }}>resume.tsx</span>
      </div>

      {/* Header - Name uses Outfit */}
      <div style={{ marginBottom: sectionGap }}>
        <EditableText
          value={d.name}
          onChange={v => onEdit('name', { v })}
          tag="h1"
          style={{ fontSize: 28, fontWeight: 800, color: headingColor, fontFamily: "'Outfit',sans-serif", lineHeight: 1.2 }}
        />
        <EditableText
          value={d.title}
          onChange={v => onEdit('title', { v })}
          tag="p"
          style={{ fontSize: 13, color: accent, marginTop: 6, fontWeight: 500 }}
        />
        {/* Contact row */}
        <div style={{ marginTop: 12 }}>
          <ContactRenderer email={d.email} phone={d.phone} location={d.location} onEdit={onEdit} variant={contactStyle || 'inline-compact'} accentColor={accent} textColor="#64748b" fontSize={baseFontSize} fontFamily={fontFamily} />
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 2, background: `${accent}20`, marginBottom: sectionGap }} />

      {/* Render all sections (single-column: combine main + sidebar arrays) */}
      {(() => {
        const allSections = [...(sectionOrder || ['summary', 'experience']), ...(sidebarOrder || ['skills', 'education', 'certifications'])];
        return <SortableContext items={allSections} strategy={verticalListSortingStrategy}>
          {allSections.map((sectionId) => {
        if (sectionId === 'summary') {
          return (
            <DraggableSection key="summary" id="summary">
              <section style={{ marginBottom: sectionGap }}>
                <p style={commentStyle}>
                  <span style={{ color: accent }}>{'//'}</span>{' '}
                  <EditableText value={L.summary} onChange={v => onEdit('section_rename', { sectionId: 'summary', v })} tag="span" />
                </p>
                <EditableText
                  value={d.summary}
                  onChange={v => onEdit('summary', { v })}
                  tag="p"
                  multiline
                  style={{ fontSize: baseFontSize, lineHeight: summaryLineHeight, color: textColor }}
                />
              </section>
            </DraggableSection>
          );
        }
        if (sectionId === 'experience') {
          return (
            <DraggableSection key="experience" id="experience">
              <section style={{ marginBottom: sectionGap }}>
                <p style={commentStyle}>
                  <span style={{ color: accent }}>{'//'}</span>{' '}
                  <EditableText value={L.experience} onChange={v => onEdit('section_rename', { sectionId: 'experience', v })} tag="span" />
                </p>
                <SortableContext items={d.experience?.map(e => `exp-${e._id}`) || []} strategy={verticalListSortingStrategy}>
                  {d.experience?.map((exp, i) => (
                    <DraggableSection key={exp._id} id={`exp-${exp._id}`}>
                      {renderTerminalExperience(exp, i)}
                    </DraggableSection>
                  ))}
                </SortableContext>
                <AddButton onClick={() => onEdit('exp_add', {})} label="experience" />
              </section>
            </DraggableSection>
          );
        }
        if (sectionId === 'skills') {
          return (
            <DraggableSection key="skills" id="skills">
              <section style={{ marginBottom: sectionGap }}>
                <p style={commentStyle}>
                  <span style={{ color: accent }}>{'//'}</span>{' '}
                  <EditableText value={L.skills} onChange={v => onEdit('section_rename', { sectionId: 'skills', v })} tag="span" />
                </p>
                <SkillsRenderer skills={d.skills} onEdit={onEdit} variant={skillStyle || 'pill-outline'} accentColor={accent} textColor={accent} fontSize={baseFontSize} fontFamily={fontFamily} />
              </section>
            </DraggableSection>
          );
        }
        if (sectionId === 'education') {
          return (
            <DraggableSection key="education" id="education">
              <section style={{ marginBottom: sectionGap }}>
                <p style={commentStyle}>
                  <span style={{ color: accent }}>{'//'}</span>{' '}
                  <EditableText value={L.education} onChange={v => onEdit('section_rename', { sectionId: 'education', v })} tag="span" />
                </p>
                <EducationRenderer education={d.education} onEdit={onEdit} variant={educationStyle || 'simple-list'} accentColor={accent} headingColor={headingColor} textColor={textColor} fontSize={baseFontSize} fontFamily={fontFamily} />
              </section>
            </DraggableSection>
          );
        }
        if (sectionId === 'certifications') {
          if (!d.certifications?.length) return null;
          return (
            <DraggableSection key="certifications" id="certifications">
              <section style={{ marginBottom: sectionGap }}>
                <p style={commentStyle}>
                  <span style={{ color: accent }}>{'//'}</span>{' '}
                  <EditableText value={L.certifications} onChange={v => onEdit('section_rename', { sectionId: 'certifications', v })} tag="span" />
                </p>
                <CertificationsRenderer certifications={d.certifications} onEdit={onEdit} variant={certificationStyle || 'simple-list'} accentColor={accent} textColor={textColor} fontSize={baseFontSize} fontFamily={fontFamily} />
              </section>
            </DraggableSection>
          );
        }
        // Custom sections
        if (typeof sectionId === 'string' && sectionId.startsWith('cs_')) {
          const csSec = (d.customSections || []).find(s => s.id === sectionId.slice(3));
          if (csSec) return (
            <DraggableSection key={sectionId} id={sectionId}>
              <MainSection section={csSec} onEdit={onEdit} headingColor={headingColor} bodyColor={textColor} accentColor={accent} />
            </DraggableSection>
          );
        }
        return null;
      })}
        </SortableContext>;
      })()}
    </div>
  );
}

DevTerminal.defaults = DEFAULTS;
