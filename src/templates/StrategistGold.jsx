import EditableText from '../components/EditableText';
import ExpBlock from '../components/GroupedExpBlock';
import AddButton from '../components/AddButton';
import DeleteButton from '../components/DeleteButton';
import SideSection from '../components/SideSection';
import MainSection from '../components/MainSection';
import SkillsRenderer from '../components/SkillsRenderer';
import ContactRenderer from '../components/ContactRenderer';
import EducationRenderer from '../components/EducationRenderer';
import CertificationsRenderer from '../components/CertificationsRenderer';
import DraggablePhoto from '../components/DraggablePhoto';
import DraggableSection from '../components/DraggableSection';
import DroppableColumn from '../components/DroppableColumn';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const DEFAULTS = {
  accent: '#D4A843',
  sidebar: '#1a1a2e',
  heading: '#1a1a2e',
  text: '#4b5563',
  background: '#ffffff',
};

export default function StrategistGold({ data, photo, photoSettings = {}, onPhotoSettings, photoShape, colors = {}, globalFont = {}, onEdit, sectionOrder, sidebarOrder, skillStyle, contactStyle, educationStyle, certificationStyle, sectionLabels = {} }) {
  const d = data;
  const accent = colors.accent || DEFAULTS.accent;
  const headerBg = colors.sidebar || DEFAULTS.sidebar;
  const headingColor = colors.heading || DEFAULTS.heading;
  const textColor = colors.text || DEFAULTS.text;
  const bgColor = colors.background || DEFAULTS.background;

  const fontFamily = globalFont.family || "'Outfit',sans-serif";
  const baseFontSize = globalFont.size || 10;
  const sectionGap = 12;
  const headingGap = 6;
  const summaryLineHeight = 1.72;

  const mainSections = sectionOrder || ['summary', 'experience'];
  const sideSections = sidebarOrder || ['skills', 'education', 'certifications'];

  const findCS = (id) => {
    if (typeof id !== 'string' || !id.startsWith('cs_')) return null;
    return (d.customSections || []).find(s => s.id === id.slice(3)) || null;
  };
  const L = { summary: 'Profile', experience: 'Experience', skills: 'Skills', education: 'Education', certifications: 'Certifications', ...sectionLabels };

  // ── Section renderer for LEFT column (light bg, dark text, full-width styling) ──
  function renderLeftSection(sectionId) {
    if (sectionId === 'summary') return (
      <DraggableSection key={sectionId} id={sectionId}>
        <section style={{ marginBottom: sectionGap }}>
          <EditableText value={L.summary} onChange={v => onEdit('section_rename', { sectionId: 'summary', v })} tag="h2" style={{ fontSize: 12, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: headingGap, paddingBottom: 3, borderBottom: `2px solid ${accent}` }} />
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
    if (sectionId === 'experience') return (
      <DraggableSection key={sectionId} id={sectionId}>
        <section style={{ marginBottom: sectionGap }}>
          <EditableText value={L.experience} onChange={v => onEdit('section_rename', { sectionId: 'experience', v })} tag="h2" style={{ fontSize: 12, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: headingGap, paddingBottom: 3, borderBottom: `2px solid ${accent}` }} />
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
                  bulletChar="&#x25B8;"
                />
              </DraggableSection>
            ))}
          </SortableContext>
          <AddButton onClick={() => onEdit('exp_add', {})} label="experience" />
        </section>
      </DraggableSection>
    );
    if (sectionId === 'skills') return (
      <DraggableSection key={sectionId} id={sectionId}>
        <section style={{ marginBottom: sectionGap }}>
          <EditableText value={L.skills} onChange={v => onEdit('section_rename', { sectionId: 'skills', v })} tag="h2" style={{ fontSize: 12, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: headingGap, paddingBottom: 3, borderBottom: `2px solid ${accent}` }} />
          <SkillsRenderer skills={d.skills} onEdit={onEdit} variant={skillStyle || 'bullet-list'} accentColor={accent} textColor={textColor} fontSize={baseFontSize} fontFamily={fontFamily} />
        </section>
      </DraggableSection>
    );
    if (sectionId === 'education') return (
      <DraggableSection key={sectionId} id={sectionId}>
        <section style={{ marginBottom: sectionGap }}>
          <EditableText value={L.education} onChange={v => onEdit('section_rename', { sectionId: 'education', v })} tag="h2" style={{ fontSize: 12, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: headingGap, paddingBottom: 3, borderBottom: `2px solid ${accent}` }} />
          <EducationRenderer education={d.education} onEdit={onEdit} variant={educationStyle || 'simple-list'} accentColor={accent} headingColor={headingColor} textColor={textColor} fontSize={baseFontSize} fontFamily={fontFamily} />
        </section>
      </DraggableSection>
    );
    if (sectionId === 'certifications') {
      if (!d.certifications?.length) return null;
      return (
        <DraggableSection key={sectionId} id={sectionId}>
          <section style={{ marginBottom: sectionGap }}>
            <EditableText value={L.certifications} onChange={v => onEdit('section_rename', { sectionId: 'certifications', v })} tag="h2" style={{ fontSize: 12, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: headingGap, paddingBottom: 3, borderBottom: `2px solid ${accent}` }} />
            <CertificationsRenderer certifications={d.certifications} onEdit={onEdit} variant={certificationStyle || 'simple-list'} accentColor={accent} textColor={textColor} fontSize={baseFontSize} fontFamily={fontFamily} />
          </section>
        </DraggableSection>
      );
    }
    const csLeft = findCS(sectionId);
    if (csLeft) return (
      <DraggableSection key={sectionId} id={sectionId}>
        <MainSection section={csLeft} onEdit={onEdit} headingColor={headingColor} bodyColor={textColor} accentColor={accent} />
      </DraggableSection>
    );
    return null;
  }

  // ── Section renderer for RIGHT column (cream card, compact styling) ──
  function renderRightSection(sectionId) {
    if (sectionId === 'summary') return (
      <DraggableSection key={sectionId} id={sectionId}>
        <section style={{ marginBottom: sectionGap }}>
          <EditableText value={L.summary} onChange={v => onEdit('section_rename', { sectionId: 'summary', v })} tag="h2" style={{ fontSize: 12, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: headingGap, paddingBottom: 3 }} />
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
    if (sectionId === 'experience') return (
      <DraggableSection key={sectionId} id={sectionId}>
        <section style={{ marginBottom: sectionGap }}>
          <EditableText value={L.experience} onChange={v => onEdit('section_rename', { sectionId: 'experience', v })} tag="h2" style={{ fontSize: 12, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: headingGap, paddingBottom: 3 }} />
          <SortableContext items={d.experience?.map(e => `exp-${e._id}`) || []} strategy={verticalListSortingStrategy}>
            {d.experience?.map((exp, i) => (
              <DraggableSection key={exp._id} id={`exp-${exp._id}`}>
                <div className="group/item" style={{ marginBottom: 8 }}>
                  <EditableText value={exp.role} onChange={v => onEdit('exp_role', { i, v })} tag="p" style={{ fontSize: baseFontSize, fontWeight: 600, color: headingColor }} />
                  <EditableText value={exp.company} onChange={v => onEdit('exp_company', { i, v })} tag="p" style={{ fontSize: baseFontSize - 1, color: accent, marginTop: 1 }} />
                  <EditableText value={exp.period} onChange={v => onEdit('exp_period', { i, v })} tag="p" style={{ fontSize: baseFontSize - 1, color: '#94a3b8', marginTop: 1 }} />
                  <DeleteButton onClick={() => onEdit('exp_del', { i })} />
                </div>
              </DraggableSection>
            ))}
          </SortableContext>
          <AddButton onClick={() => onEdit('exp_add', {})} label="experience" />
        </section>
      </DraggableSection>
    );
    if (sectionId === 'skills') return (
      <DraggableSection key={sectionId} id={sectionId}>
        <section style={{ marginBottom: sectionGap }}>
          <EditableText value={L.skills} onChange={v => onEdit('section_rename', { sectionId: 'skills', v })} tag="h2" style={{ fontSize: 12, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: headingGap, paddingBottom: 3 }} />
          <SkillsRenderer skills={d.skills} onEdit={onEdit} variant={skillStyle || 'bullet-list'} accentColor={accent} textColor={textColor} fontSize={baseFontSize} fontFamily={fontFamily} />
        </section>
      </DraggableSection>
    );
    if (sectionId === 'education') return (
      <DraggableSection key={sectionId} id={sectionId}>
        <section style={{ marginBottom: sectionGap }}>
          <EditableText value={L.education} onChange={v => onEdit('section_rename', { sectionId: 'education', v })} tag="h2" style={{ fontSize: 12, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: headingGap, paddingBottom: 3 }} />
          <EducationRenderer education={d.education} onEdit={onEdit} variant={educationStyle || 'simple-list'} accentColor={accent} headingColor={headingColor} textColor={textColor} fontSize={baseFontSize} fontFamily={fontFamily} />
        </section>
      </DraggableSection>
    );
    if (sectionId === 'certifications') {
      if (!d.certifications?.length) return null;
      return (
        <DraggableSection key={sectionId} id={sectionId}>
          <section style={{ marginBottom: sectionGap }}>
            <EditableText value={L.certifications} onChange={v => onEdit('section_rename', { sectionId: 'certifications', v })} tag="h2" style={{ fontSize: 12, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: headingGap, paddingBottom: 3 }} />
            <CertificationsRenderer certifications={d.certifications} onEdit={onEdit} variant={certificationStyle || 'simple-list'} accentColor={accent} textColor={textColor} fontSize={baseFontSize} fontFamily={fontFamily} />
          </section>
        </DraggableSection>
      );
    }
    const csRight = findCS(sectionId);
    if (csRight) return (
      <DraggableSection key={sectionId} id={sectionId}>
        <SideSection section={csRight} onEdit={onEdit} textColor={textColor} accentColor={accent} />
      </DraggableSection>
    );
    return null;
  }

  return (
    <div style={{ width: '100%', minHeight: '100%', fontFamily, fontSize: `${baseFontSize}px`, background: bgColor }}>
      {/* ===== DARK HEADER STRIP ===== */}
      <div
        style={{
          background: headerBg,
          padding: 'var(--space-xl)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-lg)',
        }}
      >
        {/* Photo left */}
        {photo && (
          <DraggablePhoto
            photo={photo}
            ps={photoSettings}
            onPs={onPhotoSettings}
            shape={photoShape || 'circle'}
            width={80}
            height={80}
            borderColor={accent}
            style={{ borderRadius: '50%' }}
          />
        )}

        {/* Name + Title center */}
        <div style={{ flex: 1 }}>
          <EditableText
            value={d.name}
            onChange={v => onEdit('name', { v })}
            tag="h1"
            style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em', lineHeight: 1.2 }}
          />
          <EditableText
            value={d.title}
            onChange={v => onEdit('title', { v })}
            tag="p"
            style={{ fontSize: 12, color: accent, marginTop: 5, fontWeight: 500, letterSpacing: '0.06em' }}
          />
        </div>

        {/* Contact right-aligned */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <ContactRenderer email={d.email} phone={d.phone} location={d.location} onEdit={onEdit} variant={contactStyle || 'icon-list'} accentColor={accent} textColor="rgba(255,255,255,.8)" fontSize={baseFontSize} fontFamily={fontFamily} />
        </div>
      </div>

      {/* ===== GOLD ACCENT LINE ===== */}
      <div style={{ height: 4, background: `linear-gradient(to right, ${accent}, transparent)` }} />

      {/* ===== TWO-COLUMN BODY ===== */}
      <div style={{ display: 'flex', padding: '24px var(--space-xl) 24px var(--space-xl)', gap: 24 }}>
        {/* LEFT - wider */}
        <DroppableColumn id="column-main" style={{ flex: 3 }}>
          <SortableContext items={mainSections} strategy={verticalListSortingStrategy}>
            {mainSections.map(renderLeftSection)}
          </SortableContext>

        </DroppableColumn>

        {/* RIGHT - cream/beige card */}
        <DroppableColumn
          id="column-side"
          style={{
            flex: 1.2,
            background: '#f8f6f0',
            borderRadius: 10,
            padding: '14px 18px',
            alignSelf: 'flex-start',
          }}
        >
          <SortableContext items={sideSections} strategy={verticalListSortingStrategy}>
            {sideSections.map(renderRightSection)}
          </SortableContext>

        </DroppableColumn>
      </div>
    </div>
  );
}

StrategistGold.defaults = DEFAULTS;
