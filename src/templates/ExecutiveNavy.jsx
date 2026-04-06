import EditableText from '../components/EditableText';
import DraggablePhoto from '../components/DraggablePhoto';
import DraggableSection from '../components/DraggableSection';
import DroppableColumn from '../components/DroppableColumn';
import ExpBlock from '../components/GroupedExpBlock';
import AddButton from '../components/AddButton';
import DeleteButton from '../components/DeleteButton';
import SideSection from '../components/SideSection';
import MainSection from '../components/MainSection';
import SkillsRenderer from '../components/SkillsRenderer';
import ContactRenderer from '../components/ContactRenderer';
import EducationRenderer from '../components/EducationRenderer';
import CertificationsRenderer from '../components/CertificationsRenderer';
import { SHAPES } from '../components/PhotoWidget';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const DEFAULTS = {
  accent: '#C9A84C',
  sidebar: '#1B2A4A',
  heading: '#1B2A4A',
  text: '#4b5563',
  background: '#ffffff',
};

export default function ExecutiveNavy({ data, photo, photoSettings, onPhotoSettings, photoShape, colors, globalFont, onEdit, sectionOrder, sidebarOrder, skillStyle, contactStyle, educationStyle, certificationStyle, sectionLabels = {} }) {
  const d = data;
  const c = { ...DEFAULTS, ...colors };
  const font = globalFont || {};
  const fontSize = font.size || 10;
  const fontFamily = font.family || "'Outfit',sans-serif";
  const accent = c.accent;
  const sidebar = c.sidebar;
  const L = { summary: 'Profile', experience: 'Experience', skills: 'Skills', education: 'Education', certifications: 'Certifications', ...sectionLabels };

  const sideText = 'rgba(255,255,255,.85)';
  const sideMuted = 'rgba(255,255,255,.6)';
  const sectionGap = 0;
  const summaryLineHeight = 1.34;
  const mainSectionLift = -24;

  const mainSections = sectionOrder || ['summary', 'experience'];
  const sideSections = sidebarOrder || ['skills', 'education', 'certifications'];

  // Helper to find custom section by drag ID
  const findCS = (id) => {
    if (typeof id !== 'string' || !id.startsWith('cs_')) return null;
    return (d.customSections || []).find(s => s.id === id.slice(3)) || null;
  };

  // ── Section renderer for SIDEBAR (dark bg, light text) ──
  function renderSideSection(sectionId) {
    if (sectionId === 'summary') return (
      <DraggableSection key={sectionId} id={sectionId}>
        <div style={{ marginBottom: sectionGap }}>
          <EditableText value={L.summary} onChange={v => onEdit('section_rename', { sectionId: 'summary', v })} tag="h3" className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }} />
          <EditableText value={d.summary} onChange={v => onEdit('summary', { v })} tag="p" multiline className="text-[10px]" style={{ color: sideText, lineHeight: summaryLineHeight }} />
        </div>
      </DraggableSection>
    );
    if (sectionId === 'experience') return (
      <DraggableSection key={sectionId} id={sectionId}>
        <div style={{ marginBottom: sectionGap }}>
          <EditableText value={L.experience} onChange={v => onEdit('section_rename', { sectionId: 'experience', v })} tag="h3" className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }} />
          <SortableContext items={d.experience?.map(e => `exp-${e._id}`) || []} strategy={verticalListSortingStrategy}>
            {d.experience?.map((exp, i) => (
              <DraggableSection key={exp._id} id={`exp-${exp._id}`}>
                <div className="mb-2 group/item">
                  <EditableText value={exp.role} onChange={v => onEdit('exp_role', { i, v })} tag="p" className="text-[10px] font-semibold" style={{ color: sideText }} />
                  <EditableText value={exp.company} onChange={v => onEdit('exp_company', { i, v })} tag="p" className="text-[9px]" style={{ color: accent }} />
                  <EditableText value={exp.period} onChange={v => onEdit('exp_period', { i, v })} tag="p" className="text-[9px]" style={{ color: sideMuted }} />
                  <DeleteButton onClick={() => onEdit('exp_del', { i })} />
                </div>
              </DraggableSection>
            ))}
          </SortableContext>
          <AddButton onClick={() => onEdit('exp_add', {})} label="experience" />
        </div>
      </DraggableSection>
    );
    if (sectionId === 'skills') return (
      <DraggableSection key={sectionId} id={sectionId}>
        <div style={{ marginBottom: sectionGap }}>
          <EditableText value={L.skills} onChange={v => onEdit('section_rename', { sectionId: 'skills', v })} tag="h3" className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }} />
          <SkillsRenderer skills={d.skills} onEdit={onEdit} variant={skillStyle || 'bullet-list'} accentColor={accent} textColor={sideText} fontSize={fontSize} fontFamily={fontFamily} />
        </div>
      </DraggableSection>
    );
    if (sectionId === 'education') return (
      <DraggableSection key={sectionId} id={sectionId}>
        <div style={{ marginBottom: sectionGap }}>
          <EditableText value={L.education} onChange={v => onEdit('section_rename', { sectionId: 'education', v })} tag="h3" className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }} />
          <EducationRenderer education={d.education} onEdit={onEdit} variant={educationStyle || 'simple-list'} accentColor={accent} headingColor={sideText} textColor={sideMuted} fontSize={fontSize} fontFamily={fontFamily} />
        </div>
      </DraggableSection>
    );
    if (sectionId === 'certifications') return (
      <DraggableSection key={sectionId} id={sectionId}>
        <div style={{ marginBottom: sectionGap }}>
          <EditableText value={L.certifications} onChange={v => onEdit('section_rename', { sectionId: 'certifications', v })} tag="h3" className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }} />
          <CertificationsRenderer certifications={d.certifications} onEdit={onEdit} variant={certificationStyle || 'simple-list'} accentColor={accent} textColor={sideText} fontSize={fontSize} fontFamily={fontFamily} />
        </div>
      </DraggableSection>
    );
    const csSide = findCS(sectionId);
    if (csSide) return (
      <DraggableSection key={sectionId} id={sectionId}>
        <SideSection section={csSide} onEdit={onEdit} textColor={sideText} accentColor={accent} />
      </DraggableSection>
    );
    return null;
  }

  // ── Section renderer for MAIN AREA (light bg, dark text) ──
  function renderMainSection(sectionId) {
    if (sectionId === 'summary') return (
      <DraggableSection key={sectionId} id={sectionId}>
        <div style={{ marginBottom: sectionGap }}>
          <EditableText value={L.summary} onChange={v => onEdit('section_rename', { sectionId: 'summary', v })} tag="h2" className="text-[11px] font-bold uppercase tracking-wider" style={{ color: c.heading, margin: '0 0 2px 0' }} />
          <EditableText value={d.summary} onChange={v => onEdit('summary', { v })} tag="p" multiline className="text-[10px]" style={{ color: c.text, lineHeight: summaryLineHeight, margin: 0 }} />
        </div>
      </DraggableSection>
    );
    if (sectionId === 'experience') return (
      <DraggableSection key={sectionId} id={sectionId}>
        <div style={{ marginTop: 0, marginBottom: sectionGap }}>
          <EditableText value={L.experience} onChange={v => onEdit('section_rename', { sectionId: 'experience', v })} tag="h2" className="text-[11px] font-bold uppercase tracking-wider" style={{ color: c.heading, margin: '0 0 1px 0' }} />
          <SortableContext items={d.experience?.map(e => `exp-${e._id}`) || []} strategy={verticalListSortingStrategy}>
            {d.experience?.map((exp, i) => (
              <DraggableSection key={exp._id} id={`exp-${exp._id}`}>
                <div style={{ borderLeft: `2px solid ${accent}`, paddingLeft: 6, marginTop: i === 0 ? 4 : 8 }}>
                  <ExpBlock exp={exp} idx={i} onEdit={onEdit} headingColor={c.heading} bodyColor={c.text} accentColor={accent} />
                </div>
              </DraggableSection>
            ))}
          </SortableContext>
          <div style={{ marginTop: 0 }}>
            <AddButton onClick={() => onEdit('exp_add', {})} label="experience" />
          </div>
        </div>
      </DraggableSection>
    );
    if (sectionId === 'skills') return (
      <DraggableSection key={sectionId} id={sectionId} style={{ marginTop: mainSectionLift }}>
        <div style={{ marginBottom: sectionGap }}>
          <EditableText value={L.skills} onChange={v => onEdit('section_rename', { sectionId: 'skills', v })} tag="h2" className="text-[11px] font-bold uppercase tracking-wider" style={{ color: c.heading, marginBottom: 2 }} />
          <SkillsRenderer skills={d.skills} onEdit={onEdit} variant={skillStyle || 'pill-outline'} accentColor={accent} textColor={c.heading} fontSize={fontSize} fontFamily={fontFamily} />
        </div>
      </DraggableSection>
    );
    if (sectionId === 'education') return (
      <DraggableSection key={sectionId} id={sectionId} style={{ marginTop: mainSectionLift }}>
        <div style={{ marginBottom: sectionGap }}>
          <EditableText value={L.education} onChange={v => onEdit('section_rename', { sectionId: 'education', v })} tag="h2" className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: c.heading }} />
          <EducationRenderer education={d.education} onEdit={onEdit} variant={educationStyle || 'simple-list'} accentColor={accent} headingColor={c.heading} textColor={c.text} fontSize={fontSize} fontFamily={fontFamily} />
        </div>
      </DraggableSection>
    );
    if (sectionId === 'certifications') return (
      <DraggableSection key={sectionId} id={sectionId} style={{ marginTop: mainSectionLift }}>
        <div style={{ marginBottom: sectionGap }}>
          <EditableText value={L.certifications} onChange={v => onEdit('section_rename', { sectionId: 'certifications', v })} tag="h2" className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: c.heading }} />
          <CertificationsRenderer certifications={d.certifications} onEdit={onEdit} variant={certificationStyle || 'simple-list'} accentColor={accent} textColor={c.text} fontSize={fontSize} fontFamily={fontFamily} />
        </div>
      </DraggableSection>
    );
    const csMain = findCS(sectionId);
    if (csMain) return (
      <DraggableSection key={sectionId} id={sectionId} style={{ marginTop: mainSectionLift }}>
        <div>
          <MainSection section={csMain} onEdit={onEdit} headingColor={c.heading} bodyColor={c.text} accentColor={accent} />
        </div>
      </DraggableSection>
    );
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        minHeight: '100%',
        fontFamily,
        fontSize: `${fontSize}px`,
        background: c.background,
      }}
    >
      {/* ===== SIDEBAR ===== */}
      <DroppableColumn
        id="column-side"
        style={{
          width: 240,
          minWidth: 240,
          background: sidebar,
          padding: '0 0 var(--space-lg) 0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Photo */}
        <div style={{ width: '100%', padding: 'var(--space-lg) var(--space-base) 0 var(--space-base)' }}>
          {photo ? (
            <DraggablePhoto
              photo={photo}
              ps={photoSettings}
              onPs={onPhotoSettings}
              shape={photoShape}
              width="100%"
              height={190}
              style={{ width: '100%', borderRadius: 6 }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: 190,
                background: 'rgba(255,255,255,.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6,
              }}
            >
              <span style={{ color: sideMuted, fontSize: 11 }}>+ Photo</span>
            </div>
          )}
        </div>

        <div style={{ padding: 'var(--space-base) 18px 0 18px' }}>
          {/* Contact (always fixed in sidebar) */}
          <div style={{ marginBottom: sectionGap }}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Contact</h3>
            <ContactRenderer email={d.email} phone={d.phone} location={d.location} onEdit={onEdit} variant={contactStyle || 'icon-list'} accentColor={accent} textColor={sideText} fontSize={fontSize} fontFamily={fontFamily} />
          </div>

          {/* Sidebar sections — draggable, cross-column enabled */}
          <SortableContext items={sideSections} strategy={verticalListSortingStrategy}>
            {sideSections.map(renderSideSection)}
          </SortableContext>

        </div>
      </DroppableColumn>

      {/* ===== MAIN AREA ===== */}
      <DroppableColumn
        id="column-main"
        style={{ flex: 1, padding: '2px 24px 12px 24px', background: c.background }}
      >
        <div style={{ marginBottom: 1 }}>
          <EditableText value={d.name} onChange={v => onEdit('name', { v })} tag="h1" className="leading-tight"
            style={{ fontSize: 26, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: c.heading, margin: 0 }} />
          <EditableText value={d.title} onChange={v => onEdit('title', { v })} tag="p" className="text-[12px]"
            style={{ color: accent, fontWeight: 500, margin: 0 }} />
        </div>
        <div style={{ height: 2, background: accent, marginBottom: 1, opacity: 0.4 }} />

        {/* Main sections — draggable, cross-column enabled */}
        <SortableContext items={mainSections} strategy={verticalListSortingStrategy}>
          {mainSections.map(renderMainSection)}
        </SortableContext>

      </DroppableColumn>
    </div>
  );
}

ExecutiveNavy.defaults = DEFAULTS;
