import { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import DesignerSlate from '../templates/DesignerSlate';
import ExecutiveNavy from '../templates/ExecutiveNavy';
import BoldCoral from '../templates/BoldCoral';
import DevTerminal from '../templates/DevTerminal';
import StrategistGold from '../templates/StrategistGold';
import CleanSlate from '../templates/CleanSlate';

const TEMPLATE_MAP = {
  'designer-slate': DesignerSlate,
  'executive-navy': ExecutiveNavy,
  'bold-coral': BoldCoral,
  'dev-terminal': DevTerminal,
  'strategist-gold': StrategistGold,
  'clean-slate': CleanSlate,
};

const TEMPLATE_ITEMS = [
  { id: 'designer-slate', name: 'Designer Slate', desc: 'Editorial portfolio layout', tone: 'Portfolio look' },
  { id: 'executive-navy', name: 'Executive Navy', desc: 'Dark sidebar, gold accents', tone: 'Corporate classic' },
  { id: 'bold-coral', name: 'Bold Coral', desc: 'Diagonal banner, two-column', tone: 'Bold modern' },
  { id: 'dev-terminal', name: 'Dev Terminal', desc: 'Dark mode, monospace', tone: 'Tech-first' },
  { id: 'strategist-gold', name: 'Strategist Gold', desc: 'Header strip, cream panel', tone: 'Warm executive' },
  { id: 'clean-slate', name: 'Clean Slate', desc: 'Centered, pure typography', tone: 'Minimal premium' },
];

const TEMPLATE_DEFAULTS = {
  'designer-slate': DesignerSlate.defaults,
  'executive-navy': ExecutiveNavy.defaults,
  'bold-coral': BoldCoral.defaults,
  'dev-terminal': DevTerminal.defaults,
  'strategist-gold': StrategistGold.defaults,
  'clean-slate': CleanSlate.defaults,
};

const STYLE_DEFAULTS = {
  'designer-slate': { skillStyle: 'simple-list', contactStyle: 'inline-compact', educationStyle: 'simple-list', certificationStyle: 'simple-list' },
  'executive-navy': { skillStyle: 'bullet-list', contactStyle: 'icon-list', educationStyle: 'simple-list', certificationStyle: 'simple-list' },
  'bold-coral': { skillStyle: 'pill-outline', contactStyle: 'inline-compact', educationStyle: 'divider-list', certificationStyle: 'simple-list' },
  'dev-terminal': { skillStyle: 'simple-list', contactStyle: 'inline-compact', educationStyle: 'compact-block', certificationStyle: 'simple-list' },
  'strategist-gold': { skillStyle: 'minimal-divider-list', contactStyle: 'icon-list', educationStyle: 'timeline', certificationStyle: 'simple-list' },
  'clean-slate': { skillStyle: 'simple-list', contactStyle: 'inline-compact', educationStyle: 'simple-list', certificationStyle: 'simple-list' },
};

const SECTION_DEFAULTS = {
  'designer-slate': { main: ['summary', 'experience'], side: ['skills', 'education', 'certifications'] },
  'executive-navy': { main: ['summary', 'experience'], side: ['skills', 'education', 'certifications'] },
  'bold-coral': { main: ['summary', 'experience', 'certifications'], side: ['skills', 'education'] },
  'dev-terminal': { main: ['summary', 'experience'], side: ['skills', 'education', 'certifications'] },
  'strategist-gold': { main: ['summary', 'experience'], side: ['skills', 'education', 'certifications'] },
  'clean-slate': { main: ['summary', 'experience'], side: ['skills', 'education', 'certifications'] },
};

const SAMPLE_DATA = {
  name: 'Adeline Palmerston',
  title: 'Senior Brand Designer',
  email: 'adeline@resumeai.studio',
  phone: '+1 (415) 555-0127',
  location: 'San Francisco, CA',
  summary: 'Design leader shaping premium product stories, visual systems, and high-conversion resumes for ambitious professionals across editorial, product, and hiring touchpoints. Adept at translating complex experience into elegant, persuasive layouts that feel premium and easy to scan. Strong collaborator with product, marketing, and founder teams; comfortable driving concept direction, case-study structure, hiring collateral, and polished presentation systems from first draft to launch.',
  skills: ['Art Direction', 'Figma', 'Brand Systems', 'UX Writing', 'Presentation Design', 'Motion Concepts', 'Resume Strategy', 'Visual Systems', 'Editorial Layout', 'Storytelling', 'Prototyping', 'Creative Direction'],
  education: [
    { degree: 'B.Des, Visual Communication', school: 'Parsons School of Design', period: '2014 - 2018', location: 'New York, NY' },
    { degree: 'Certificate, Interface Design', school: 'School of Visual Arts', period: '2018 - 2019', location: 'New York, NY' },
    { degree: 'Workshop, Narrative Portfolio Systems', school: 'AIGA Studio Intensive', period: '2021', location: 'Remote' },
  ],
  certifications: ['Google UX Design', 'Adobe Certified Professional', 'Notion Essentials', 'Creative Direction Workshop', 'Accessibility for Designers', 'Advanced Figma Systems'],
  experience: [
    {
      _id: 'exp-1',
      role: 'Senior Brand Designer',
      company: 'Northstar Studio',
      period: '2022 - Present',
      bullets: [
        'Built premium hiring collateral and resume systems for executives and creatives.',
        'Translated raw career history into cleaner, more persuasive story-driven layouts.',
        'Created scalable visual systems used across decks, portfolios, and recruiting assets.',
        'Led concept-to-launch design work for positioning updates, founder narratives, and campaign pages.',
      ],
    },
    {
      _id: 'exp-2',
      role: 'Visual Designer',
      company: 'Atelier Works',
      period: '2019 - 2022',
      bullets: [
        'Designed product launches, decks, and editorial layouts across print and digital.',
        'Partnered with founders to refine positioning, case studies, and content hierarchy.',
        'Developed modular component systems that reduced design iteration time across marketing workstreams.',
      ],
    },
    {
      _id: 'exp-3',
      role: 'Junior Designer',
      company: 'Paperlane Collective',
      period: '2018 - 2019',
      bullets: [
        'Supported visual campaigns and layout production for boutique consumer brands.',
        'Prepared polished social, web, and print assets under fast timelines.',
        'Maintained brand consistency across presentation templates, one-pagers, and launch kits.',
      ],
    },
    {
      _id: 'exp-4',
      role: 'Design Intern',
      company: 'Studio Beacon',
      period: '2017 - 2018',
      bullets: [
        'Assisted senior designers with production layouts, research boards, and editorial assets.',
        'Organized client feedback rounds and prepared final presentation files for review.',
      ],
    },
  ],
  customSections: [
    {
      id: 'projects',
      title: 'Selected Projects',
      placement: 'main',
      items: [
        'ResumeAI Studio Redesign - Reframed the homepage, template gallery, and premium editor experience.',
        'Northstar Brand Story - Built a modular executive resume and pitch deck system for leadership hiring.',
        'Creative Career Playbook - Developed repeatable content structure for portfolios, resumes, and case studies.',
      ],
    },
    {
      id: 'languages',
      title: 'Languages',
      placement: 'side',
      items: ['English', 'French', 'Spanish'],
    },
    {
      id: 'awards',
      title: 'Awards',
      placement: 'side',
      items: ['ADC Young Guns Shortlist', 'Behance Featured Project', 'AIGA Student Merit Award'],
    },
  ],
};

const GLOBAL_FONT = { size: 10, family: "'Outfit',sans-serif" };
const NOOP = () => {};
const inertCollision = () => [];
const SAMPLE_PHOTO = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMjAgMzIwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2YzZWZlNyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2Q5ZDJjNyIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMzIwIiBmaWxsPSJ1cmwoI2JnKSIvPjxjaXJjbGUgY3g9IjE2MCIgY3k9IjExOCIgcj0iNTYiIGZpbGw9IiNmMWM3YTMiLz48cGF0aCBkPSJNMTAyIDExOGM4LTQ4IDM5LTczIDc2LTczIDM0IDAgNjIgMTkgNzYgNTgtMTUtMTEtMjgtMTYtNDgtMTYtMjMgMC00MiA4LTY0IDMxLTEzIDE0LTI1IDIwLTQwIDIyeiIgZmlsbD0iIzQ1MzEyNiIvPjxwYXRoIGQ9Ik0xMDQgMjY5YzgtNTggNDQtOTIgOTYtOTJzODggMzQgOTYgOTIiIGZpbGw9IiNmZmZmZmYiLz48cGF0aCBkPSJNMTAyIDI3NGM4LTU2IDQ2LTg5IDk4LTg5IDUwIDAgODggMzMgOTggODkiIGZpbGw9IiNkYmMzYjQiLz48cGF0aCBkPSJNMTE1IDI3NGMxMS00NCA0MS03MCA4My03MCA0MyAwIDcyIDI1IDg2IDcwIiBmaWxsPSIjZjZmNmY2Ii8+PGNpcmNsZSBjeD0iMTM5IiBjeT0iMTE4IiByPSI1IiBmaWxsPSIjMmIyMTFkIi8+PGNpcmNsZSBjeD0iMTgzIiBjeT0iMTE4IiByPSI1IiBmaWxsPSIjMmIyMTFkIi8+PHBhdGggZD0iTTE0MiAxNDZjMTIgMTAgMjUgMTUgMzggMTUgMTMgMCAyNC00IDM0LTEzIiBmaWxsPSJub25lIiBzdHJva2U9IiM5ZjZiNTUiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTExMSAyNzRjMTQtMzUgMzYtNTQgNDktNjEgMTEgMTQgMjYgMjMgNDYgMjMgMjIgMCAzOC0xMCA1MC0yNCAxNyAxMiAzNyAzMiA1MiA2MiIgZmlsbD0iI2Y3ZjdmNyIvPjwvc3ZnPg==';
const PREVIEW_W = 794;
const PREVIEW_H = 1123;
const HERO_SCALE = 0.28;
const CARD_SCALE = 0.145;

const FEATURES = [
  { title: 'Upload Anything', desc: 'Paste text or drop PDF and DOCX resumes without wrestling with formatting.', stat: 'PDF · DOCX · Text' },
  { title: 'AI Structuring', desc: 'Turn raw experience into a cleaner draft with sections, bullets, and styling already mapped.', stat: 'Structured in seconds' },
  { title: 'Premium Editing', desc: 'Live templates, drag-and-drop sections, colors, fonts, and polished export-ready layouts.', stat: 'Fully customizable' },
];

function LandingPreview({ templateId, scale = CARD_SCALE, featured = false }) {
  const TemplateComp = TEMPLATE_MAP[templateId];
  const colors = TEMPLATE_DEFAULTS[templateId];
  const styles = STYLE_DEFAULTS[templateId];
  const placement = SECTION_DEFAULTS[templateId];
  const mainCustomIds = (SAMPLE_DATA.customSections || []).filter(section => section.placement === 'main').map(section => 'cs_' + section.id);
  const sideCustomIds = (SAMPLE_DATA.customSections || []).filter(section => section.placement === 'side').map(section => 'cs_' + section.id);
  const scaledWidth = PREVIEW_W * scale;
  const scaledHeight = PREVIEW_H * scale;
  if (!TemplateComp) return null;

  return (
    <div
      className={'landing-preview-shell' + (featured ? ' landing-preview-shell--featured' : '')}
      style={{ height: `${scaledHeight + (featured ? 34 : 18)}px` }}
    >
      <div
        className="landing-preview-stage"
        style={{
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
        }}
      >
        <div
          className="landing-preview-paper"
          style={{
            width: PREVIEW_W,
            height: PREVIEW_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <TemplateComp
            data={SAMPLE_DATA}
            photo={SAMPLE_PHOTO}
            photoSettings={{ zoom: 100, posX: 50, posY: 50 }}
            onPhotoSettings={NOOP}
            photoShape="circle"
            colors={colors}
            globalFont={GLOBAL_FONT}
            onEdit={NOOP}
            sectionOrder={[...placement.main, ...mainCustomIds]}
            sidebarOrder={[...placement.side, ...sideCustomIds]}
            skillStyle={styles.skillStyle}
            contactStyle={styles.contactStyle}
            educationStyle={styles.educationStyle}
            certificationStyle={styles.certificationStyle}
            sectionLabels={{}}
          />
        </div>
      </div>
    </div>
  );
}

export default function LandingPage({ onStart }) {
  const [chooserOpen, setChooserOpen] = useState(false);

  const openChooser = () => setChooserOpen(true);
  const closeChooser = () => setChooserOpen(false);
  const handleModeStart = (mode) => {
    closeChooser();
    onStart(mode);
  };

  return (
    <DndContext collisionDetection={inertCollision}>
      <div className="landing-page">
        <div className="landing-orb landing-orb--mint" aria-hidden="true" />
        <div className="landing-orb landing-orb--sky" aria-hidden="true" />
        <div className="landing-grid" aria-hidden="true" />

        <section className="landing-hero">
          <div className="landing-copy fade-up">
            <div className="landing-badge">
              <span className="landing-badge-dot" />
              Premium AI Resume Builder
            </div>

            <h1 className="landing-title">
              Resumes that feel
              <span> expensive, clear, and ready to hire.</span>
            </h1>

            <p className="landing-subtitle">
              Upload any resume, let AI structure the content, and refine it with premium templates that already look polished before you touch a thing.
            </p>

            <div className="landing-cta-row">
              <button onClick={openChooser} className="landing-cta">
                Start Building
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
              <div className="landing-proof">
                <strong>6 premium templates</strong>
                <span>Live editing, drag-and-drop sections, polished PDF export</span>
              </div>
            </div>

            <div className="landing-stats">
              <div className="landing-stat-card">
                <strong>1-click</strong>
                <span>AI extraction from existing resumes</span>
              </div>
              <div className="landing-stat-card">
                <strong>Pixel clean</strong>
                <span>Layouts tuned for sharing and print</span>
              </div>
              <div className="landing-stat-card">
                <strong>Premium control</strong>
                <span>Fonts, colors, sections, templates</span>
              </div>
            </div>
          </div>

          <div className="landing-showcase fade-up" style={{ animationDelay: '.12s' }}>
            <div className="landing-showcase-card landing-showcase-card--back">
              <LandingPreview templateId="executive-navy" scale={0.23} />
            </div>
            <div className="landing-showcase-card landing-showcase-card--front">
              <LandingPreview templateId="designer-slate" scale={HERO_SCALE} featured />
            </div>
            <div className="landing-showcase-caption">
              <span className="landing-showcase-pill">Featured template</span>
              <strong>Designer Slate</strong>
              <p>Editorial composition with a sharper premium feel right out of the box.</p>
            </div>
          </div>
        </section>

        <section className="landing-templates fade-up" style={{ animationDelay: '.2s' }}>
          <div className="landing-section-head">
            <div>
              <span className="landing-section-kicker">Template gallery</span>
              <h2>Real miniature previews, not placeholder cards.</h2>
            </div>
            <p>Flip through distinct visual systems before you even upload your resume.</p>
          </div>

          <div className="landing-template-grid">
            {TEMPLATE_ITEMS.map((template) => (
              <button key={template.id} onClick={openChooser} className="landing-template-card">
                <LandingPreview templateId={template.id} />
                <div className="landing-template-copy">
                  <div>
                    <strong>{template.name}</strong>
                    <span>{template.tone}</span>
                  </div>
                  <p>{template.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="landing-features fade-up" style={{ animationDelay: '.28s' }}>
          <div className="landing-section-head">
            <div>
              <span className="landing-section-kicker">Why it feels better</span>
              <h2>Built for people who care about presentation.</h2>
            </div>
            <p>The workflow is simple, but the finish is intentionally premium.</p>
          </div>

          <div className="landing-feature-grid">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="landing-feature-card">
                <span className="landing-feature-stat">{feature.stat}</span>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-bottom-cta fade-up" style={{ animationDelay: '.34s' }}>
          <div>
            <span className="landing-section-kicker">Ready when you are</span>
            <h2>Bring in your existing resume and give it a premium finish.</h2>
          </div>
          <button onClick={openChooser} className="landing-cta landing-cta--secondary">
            Launch Editor
          </button>
        </section>

        {chooserOpen && (
          <div className="landing-chooser-overlay" onClick={closeChooser}>
            <div className="landing-chooser-dialog premium-surface" onClick={(e) => e.stopPropagation()}>
              <div className="landing-chooser-head">
                <div>
                  <span className="landing-section-kicker">Choose your intake path</span>
                  <h3>How would you like to start this resume?</h3>
                </div>
                <button type="button" className="landing-chooser-close" onClick={closeChooser}>
                  Close
                </button>
              </div>

              <div className="landing-chooser-grid">
                <button type="button" className="landing-chooser-card" onClick={() => handleModeStart('form')}>
                  <strong>Guided Form</strong>
                  <p>Answer step by step, skip any section, and use AI-assisted starters for custom sections.</p>
                </button>
                <button type="button" className="landing-chooser-card" onClick={() => handleModeStart('paste')}>
                  <strong>Text Import</strong>
                  <p>Paste raw resume content and let the builder structure it into editable sections.</p>
                </button>
                <button type="button" className="landing-chooser-card" onClick={() => handleModeStart('upload')}>
                  <strong>Upload Resume</strong>
                  <p>Drop a PDF or DOCX file and extract the content into the premium editor workflow.</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}




