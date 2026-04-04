import EditableText from '../components/EditableText';
import ExpBlock from '../components/GroupedExpBlock';
import AddButton from '../components/AddButton';
import DeleteButton from '../components/DeleteButton';
import MainSection from '../components/MainSection';
import SkillsRenderer from '../components/SkillsRenderer';
import ContactRenderer from '../components/ContactRenderer';
import EducationRenderer from '../components/EducationRenderer';
import CertificationsRenderer from '../components/CertificationsRenderer';
import DraggableSection from '../components/DraggableSection';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const DEFAULTS = {
  accent: '#64748B',
  sidebar: '#64748B',
  heading: '#1e293b',
  text: '#475569',
  background: '#ffffff',
};

export default function CleanSlate({ data, colors = {}, globalFont = {}, onEdit, sectionOrder, sidebarOrder, skillStyle, contactStyle, educationStyle, certificationStyle, sectionLabels = {} }) {
  const d = data;
  const accent = colors.accent || DEFAULTS.accent;
  const headingColor = colors.heading || DEFAULTS.heading;
  const textColor = colors.text || DEFAULTS.text;
  const bgColor = colors.background || DEFAULTS.background;

  const fontFamily = globalFont.family || "'Newsreader',serif";
  const headingFamily = "'Outfit',sans-serif";
  const L = { summary: 'Profile', experience: 'Experience', skills: 'Skills', education: 'Education', certifications: 'Certifications', ...sectionLabels };
  const baseFontSize = globalFont.size || 10;
  const sectionGap = 12;
  const headingGap = 6;
  const summaryLineHeight = 1.72;

  return (
    <div style={{ width: '100%', minHeight: '100%', fontFamily, fontSize: `${baseFontSize}px`, background: bgColor, padding: '38px 38px 30px 38px', color: textColor }}>
      {/* ===== CENTERED HEADER ===== */}
      <div style={{ textAlign: 'center', marginBottom: sectionGap }}>
        <EditableText
          value={d.name}
          onChange={v => onEdit('name', { v })}
          tag="h1"
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: headingColor,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontFamily: headingFamily,
            lineHeight: 1.3,
          }}
        />
        <EditableText
          value={d.title}
          onChange={v => onEdit('title', { v })}
          tag="p"
          style={{
            fontSize: 12,
            color: accent,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginTop: 4,
            fontFamily: headingFamily,
          }}
        />
        {/* Contact row */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <ContactRenderer email={d.email} phone={d.phone} location={d.location} onEdit={onEdit} variant={contactStyle || 'inline-compact'} accentColor={accent} textColor={textColor} fontSize={baseFontSize} fontFamily={fontFamily} />
        </div>
      </div>

      {/* Render all sections (single-column: combine main + sidebar arrays) */}
      {(() => {
        const allSections = [...(sectionOrder || ['summary', 'experience']), ...(sidebarOrder || ['skills', 'education', 'certifications'])];
        return <SortableContext items={allSections} strategy={verticalListSortingStrategy}>
          {allSections.map((sectionId, idx) => {
        if (sectionId === 'summary') {
          return (
            <DraggableSection key="summary" id="summary">
              {idx > 0 && <div style={{ height: 1, background: `${accent}30`, marginBottom: sectionGap }} />}
              <section style={{ marginBottom: sectionGap }}>
                <EditableText value={L.summary} onChange={v => onEdit('section_rename', { sectionId: 'summary', v })} tag="h2" style={{ fontSize: 12, fontWeight: 600, color: headingColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: headingGap, fontFamily: headingFamily }} />
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
              <div style={{ height: 1, background: `${accent}30`, marginBottom: sectionGap }} />
              <section style={{ marginBottom: sectionGap }}>
                <EditableText value={L.experience} onChange={v => onEdit('section_rename', { sectionId: 'experience', v })} tag="h2" style={{ fontSize: 12, fontWeight: 600, color: headingColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: headingGap, fontFamily: headingFamily }} />
                <SortableContext items={d.experience?.map(e => `exp-${e._id}`) || []} strategy={verticalListSortingStrategy}>
                  {d.experience?.map((exp, i) => (
                    <DraggableSection key={exp._id} id={`exp-${exp._id}`}>
                      <ExpBlock
                        exp={exp}
                        idx={i}
                        onEdit={onEdit}
                        headingColor={headingColor}
                        bodyColor={textColor}
                        accentColor={accent}
                        bulletChar="&mdash;"
                      />
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
              <div style={{ height: 1, background: `${accent}30`, marginBottom: sectionGap }} />
              <section style={{ marginBottom: sectionGap }}>
                <EditableText value={L.skills} onChange={v => onEdit('section_rename', { sectionId: 'skills', v })} tag="h2" style={{ fontSize: 12, fontWeight: 600, color: headingColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: headingGap, fontFamily: headingFamily }} />
                <SkillsRenderer skills={d.skills} onEdit={onEdit} variant={skillStyle || 'simple-list'} accentColor={accent} textColor={textColor} fontSize={baseFontSize} fontFamily={fontFamily} />
              </section>
            </DraggableSection>
          );
        }
        if (sectionId === 'education') {
          return (
            <DraggableSection key="education" id="education">
              <div style={{ height: 1, background: `${accent}30`, marginBottom: sectionGap }} />
              <section style={{ marginBottom: sectionGap }}>
                <EditableText value={L.education} onChange={v => onEdit('section_rename', { sectionId: 'education', v })} tag="h2" style={{ fontSize: 12, fontWeight: 600, color: headingColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: headingGap, fontFamily: headingFamily }} />
                <EducationRenderer education={d.education} onEdit={onEdit} variant={educationStyle || 'simple-list'} accentColor={accent} headingColor={headingColor} textColor={textColor} fontSize={baseFontSize} fontFamily={fontFamily} />
              </section>
            </DraggableSection>
          );
        }
        if (sectionId === 'certifications') {
          if (!d.certifications?.length) return null;
          return (
            <DraggableSection key="certifications" id="certifications">
              <div style={{ height: 1, background: `${accent}30`, marginBottom: sectionGap }} />
              <section style={{ marginBottom: sectionGap }}>
                <EditableText value={L.certifications} onChange={v => onEdit('section_rename', { sectionId: 'certifications', v })} tag="h2" style={{ fontSize: 12, fontWeight: 600, color: headingColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: headingGap, fontFamily: headingFamily }} />
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

CleanSlate.defaults = DEFAULTS;
