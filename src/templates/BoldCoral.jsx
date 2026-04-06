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
  accent: '#F43F5E',
  sidebar: '#F43F5E',
  heading: '#1e293b',
  text: '#475569',
  background: '#ffffff',
};

export default function BoldCoral({ data, photo, photoSettings = {}, onPhotoSettings, photoShape, colors = {}, globalFont = {}, onEdit, sectionOrder, sidebarOrder, skillStyle, contactStyle, educationStyle, certificationStyle, sectionLabels = {} }) {
  const d = data;
  const accent = colors.accent || DEFAULTS.accent;
  const headingColor = colors.heading || DEFAULTS.heading;
  const textColor = colors.text || DEFAULTS.text;
  const bgColor = colors.background || DEFAULTS.background;
  const bannerBg = colors.sidebar || DEFAULTS.sidebar;

  const fontFamily = globalFont.family || "'Outfit',sans-serif";
  const baseFontSize = globalFont.size || 10;
  const sectionGap = 6;
  const headingGap = 3;
  const summaryLineHeight = 1.56;
  const mainSectionLift = -6;

  const mainSections = sectionOrder || ['summary', 'experience'];
  const sideSections = sidebarOrder || ['skills', 'education', 'certifications'];

  const findCS = (id) => {
    if (typeof id !== 'string' || !id.startsWith('cs_')) return null;
    return (d.customSections || []).find(s => s.id === id.slice(3)) || null;
  };
  const L = { summary: 'About Me', experience: 'Experience', skills: 'Skills', education: 'Education', certifications: 'Certifications', ...sectionLabels };

  // ── Section renderer for LEFT column (dark headings, standard body) ──
  function renderLeftSection(sectionId) {
    if (sectionId === 'summary') return (
      <DraggableSection key={sectionId} id={sectionId}>
        <section style={{ marginBottom: sectionGap }}>
          <EditableText value={L.summary} onChange={v => onEdit('section_rename', { sectionId: 'summary', v })} tag="h2" style={{ fontSize: 13, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: headingGap, paddingBottom: 3, borderBottom: `2px solid ${accent}` }} />
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
        <section style={{ marginTop: 0, marginBottom: sectionGap }}>
          <EditableText value={L.experience} onChange={v => onEdit('section_rename', { sectionId: 'experience', v })} tag="h2" style={{ fontSize: 13, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: headingGap, paddingBottom: 3, borderBottom: `2px solid ${accent}` }} />
          <SortableContext items={d.experience?.map(e => `exp-${e._id}`) || []} strategy={verticalListSortingStrategy}>
            {d.experience?.map((exp, i) => (
              <DraggableSection key={exp._id} id={`exp-${exp._id}`}>
                <div style={{ marginTop: i === 0 ? 4 : 8 }}>
                  <ExpBlock
                    exp={exp}
                    idx={i}
                    onEdit={onEdit}
                    headingColor={headingColor}
                    bodyColor={textColor}
                    accentColor={accent}
                  />
                </div>
              </DraggableSection>
            ))}
          </SortableContext>
          <div style={{ marginTop: 0 }}>
            <AddButton onClick={() => onEdit('exp_add', {})} label="experience" />
          </div>
        </section>
      </DraggableSection>
    );
    if (sectionId === 'skills') return (
      <DraggableSection key={sectionId} id={sectionId} style={{ marginTop: mainSectionLift }}>
        <section style={{ marginBottom: sectionGap }}>
          <EditableText value={L.skills} onChange={v => onEdit('section_rename', { sectionId: 'skills', v })} tag="h2" style={{ fontSize: 13, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: headingGap, paddingBottom: 3, borderBottom: `2px solid ${accent}` }} />
          <SkillsRenderer skills={d.skills} onEdit={onEdit} variant={skillStyle || 'pill-outline'} accentColor={accent} textColor={accent} fontSize={baseFontSize} fontFamily={fontFamily} />
        </section>
      </DraggableSection>
    );
    if (sectionId === 'education') return (
      <DraggableSection key={sectionId} id={sectionId} style={{ marginTop: mainSectionLift }}>
        <section style={{ marginBottom: sectionGap }}>
          <EditableText value={L.education} onChange={v => onEdit('section_rename', { sectionId: 'education', v })} tag="h2" style={{ fontSize: 13, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: headingGap, paddingBottom: 3, borderBottom: `2px solid ${accent}` }} />
          <EducationRenderer education={d.education} onEdit={onEdit} variant={educationStyle || 'simple-list'} accentColor={accent} headingColor={headingColor} textColor={textColor} fontSize={baseFontSize} fontFamily={fontFamily} />
        </section>
      </DraggableSection>
    );
    if (sectionId === 'certifications') {
      if (!d.certifications?.length) return null;
      return (
        <DraggableSection key={sectionId} id={sectionId} style={{ marginTop: mainSectionLift }}>
          <section style={{ marginBottom: sectionGap }}>
            <EditableText value={L.certifications} onChange={v => onEdit('section_rename', { sectionId: 'certifications', v })} tag="h2" style={{ fontSize: 13, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: headingGap, paddingBottom: 3, borderBottom: `2px solid ${accent}` }} />
            <CertificationsRenderer certifications={d.certifications} onEdit={onEdit} variant={certificationStyle || 'simple-list'} accentColor={accent} textColor={textColor} fontSize={baseFontSize} fontFamily={fontFamily} />
          </section>
        </DraggableSection>
      );
    }
    const csLeft = findCS(sectionId);
    if (csLeft) return (
      <DraggableSection key={sectionId} id={sectionId} style={{ marginTop: mainSectionLift }}>
        <div>
          <MainSection section={csLeft} onEdit={onEdit} headingColor={headingColor} bodyColor={textColor} accentColor={accent} />
        </div>
      </DraggableSection>
    );
    return null;
  }

  // ── Section renderer for RIGHT column (accent border side, compact) ──
  function renderRightSection(sectionId) {
    if (sectionId === 'summary') return (
      <DraggableSection key={sectionId} id={sectionId}>
        <section style={{ marginBottom: sectionGap }}>
          <EditableText value={L.summary} onChange={v => onEdit('section_rename', { sectionId: 'summary', v })} tag="h2" style={{ fontSize: 13, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: headingGap, paddingBottom: 3, borderBottom: `1px solid ${accent}40` }} />
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
      <DraggableSection key={sectionId} id={sectionId} style={{ marginTop: mainSectionLift }}>
        <section style={{ marginBottom: sectionGap }}>
          <EditableText value={L.experience} onChange={v => onEdit('section_rename', { sectionId: 'experience', v })} tag="h2" style={{ fontSize: 13, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: headingGap, paddingBottom: 3, borderBottom: `1px solid ${accent}40` }} />
          <SortableContext items={d.experience?.map(e => `exp-${e._id}`) || []} strategy={verticalListSortingStrategy}>
            {d.experience?.map((exp, i) => (
              <DraggableSection key={exp._id} id={`exp-${exp._id}`}>
                <div className="group/item" style={{ marginTop: i === 0 ? -6 : -3, marginBottom: 5 }}>
                  <EditableText value={exp.role} onChange={v => onEdit('exp_role', { i, v })} tag="p" style={{ fontSize: baseFontSize + 1, fontWeight: 600, color: headingColor }} />
                  <EditableText value={exp.company} onChange={v => onEdit('exp_company', { i, v })} tag="p" style={{ fontSize: baseFontSize, color: accent, marginTop: 1 }} />
                  <EditableText value={exp.period} onChange={v => onEdit('exp_period', { i, v })} tag="p" style={{ fontSize: baseFontSize - 1, color: '#94a3b8', marginTop: 1 }} />
                  <DeleteButton onClick={() => onEdit('exp_del', { i })} />
                </div>
              </DraggableSection>
            ))}
          </SortableContext>
          <div style={{ marginTop: -2 }}>
            <AddButton onClick={() => onEdit('exp_add', {})} label="experience" />
          </div>
        </section>
      </DraggableSection>
    );
    if (sectionId === 'skills') return (
      <DraggableSection key={sectionId} id={sectionId} style={{ marginTop: mainSectionLift }}>
        <section style={{ marginBottom: sectionGap }}>
          <EditableText value={L.skills} onChange={v => onEdit('section_rename', { sectionId: 'skills', v })} tag="h2" style={{ fontSize: 13, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: headingGap, paddingBottom: 3, borderBottom: `1px solid ${accent}40` }} />
          <SkillsRenderer skills={d.skills} onEdit={onEdit} variant={skillStyle || 'pill-outline'} accentColor={accent} textColor={accent} fontSize={baseFontSize} fontFamily={fontFamily} />
        </section>
      </DraggableSection>
    );
    if (sectionId === 'education') return (
      <DraggableSection key={sectionId} id={sectionId} style={{ marginTop: mainSectionLift }}>
        <section style={{ marginBottom: sectionGap }}>
          <EditableText value={L.education} onChange={v => onEdit('section_rename', { sectionId: 'education', v })} tag="h2" style={{ fontSize: 13, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: headingGap, paddingBottom: 3, borderBottom: `1px solid ${accent}40` }} />
          <EducationRenderer education={d.education} onEdit={onEdit} variant={educationStyle || 'simple-list'} accentColor={accent} headingColor={headingColor} textColor={textColor} fontSize={baseFontSize} fontFamily={fontFamily} />
        </section>
      </DraggableSection>
    );
    if (sectionId === 'certifications') {
      if (!d.certifications?.length) return null;
      return (
        <DraggableSection key={sectionId} id={sectionId} style={{ marginTop: mainSectionLift }}>
          <section style={{ marginBottom: sectionGap }}>
            <EditableText value={L.certifications} onChange={v => onEdit('section_rename', { sectionId: 'certifications', v })} tag="h2" style={{ fontSize: 13, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: headingGap, paddingBottom: 3, borderBottom: `1px solid ${accent}40` }} />
            <CertificationsRenderer certifications={d.certifications} onEdit={onEdit} variant={certificationStyle || 'simple-list'} accentColor={accent} textColor={textColor} fontSize={baseFontSize} fontFamily={fontFamily} />
          </section>
        </DraggableSection>
      );
    }
    const csRight = findCS(sectionId);
    if (csRight) return (
      <DraggableSection key={sectionId} id={sectionId} style={{ marginTop: mainSectionLift }}>
        <div>
          <SideSection section={csRight} onEdit={onEdit} textColor={textColor} accentColor={accent} />
        </div>
      </DraggableSection>
    );
    return null;
  }

  return (
    <div style={{ width: '100%', minHeight: '100%', fontFamily, fontSize: `${baseFontSize}px`, background: bgColor }}>
      {/* ===== DIAGONAL GRADIENT BANNER ===== */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            background: `linear-gradient(135deg, ${bannerBg}, #FB923C)`,
            padding: '28px var(--space-xl) 22px var(--space-xl)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-lg)',
            minHeight: 136,
          }}
        >
          {/* Photo */}
          {photo && (
            <DraggablePhoto
              photo={photo}
              ps={photoSettings}
              onPs={onPhotoSettings}
              shape={photoShape || 'circle'}
              width={100}
              height={100}
              borderColor="rgba(255,255,255,.4)"
              style={{ borderRadius: '50%' }}
            />
          )}

          {/* Name / Title / Contact */}
          <div style={{ flex: 1 }}>
            <EditableText
              value={d.name}
              onChange={v => onEdit('name', { v })}
              tag="h1"
              style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', letterSpacing: '0.02em', lineHeight: 1.2 }}
            />
            <EditableText
              value={d.title}
              onChange={v => onEdit('title', { v })}
              tag="p"
              style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.85)', marginTop: 4 }}
            />
            <div style={{ marginTop: 0 }}>
              <ContactRenderer email={d.email} phone={d.phone} location={d.location} onEdit={onEdit} variant={contactStyle || 'inline-compact'} accentColor="rgba(255,255,255,.5)" textColor="rgba(255,255,255,.9)" fontSize={baseFontSize} fontFamily={fontFamily} />
            </div>
          </div>
        </div>
        {/* Diagonal skew bottom edge */}
        <div
          style={{
            position: 'absolute',
            bottom: -20,
            left: 0,
            right: 0,
            height: 40,
            background: bgColor,
            transform: 'skewY(-3deg)',
          }}
        />
      </div>

      {/* ===== TWO-COLUMN BODY ===== */}
      <div style={{ display: 'flex', padding: '8px var(--space-xl) 18px var(--space-xl)', gap: 18 }}>
        {/* LEFT - wider column */}
        <DroppableColumn id="column-main" style={{ flex: 2 }}>
          <SortableContext items={mainSections} strategy={verticalListSortingStrategy}>
            {mainSections.map(renderLeftSection)}
          </SortableContext>

        </DroppableColumn>

        {/* RIGHT - narrower column with accent left border */}
        <DroppableColumn id="column-side" style={{ flex: 1, borderLeft: `3px solid ${accent}`, paddingLeft: 18 }}>
          <SortableContext items={sideSections} strategy={verticalListSortingStrategy}>
            {sideSections.map(renderRightSection)}
          </SortableContext>

        </DroppableColumn>
      </div>
    </div>
  );
}

BoldCoral.defaults = DEFAULTS;
