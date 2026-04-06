import { useMemo, useState } from 'react';
import { buildSectionPayload, createEmptySectionDraft, getSectionTemplate, SECTION_TEMPLATE_DEFS } from '../utils/sectionStudio';

const HAS_SIDEBAR = ['executive-navy', 'bold-coral', 'strategist-gold', 'designer-slate'];
const BUILTIN_SECTIONS = [
  { id: 'summary', label: 'Profile Summary', icon: 'PS', description: 'Edit the opening summary and heading.', count: (data) => (data?.summary?.trim() ? 1 : 0) },
  { id: 'experience', label: 'Experience', icon: 'EX', description: 'Manage roles, bullets, and workstreams.', count: (data) => data?.experience?.length || 0 },
  { id: 'skills', label: 'Skills', icon: 'SK', description: 'Update ATS-friendly skills and wording.', count: (data) => data?.skills?.length || 0 },
  { id: 'education', label: 'Education', icon: 'ED', description: 'Edit degrees, institutions, and years.', count: (data) => data?.education?.length || 0 },
  { id: 'certifications', label: 'Certifications', icon: 'CF', description: 'List badges, licenses, and credentials.', count: (data) => data?.certifications?.length || 0 },
];

function SectionGlyph({ id }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (id) {
    case 'summary':
      return (
        <svg {...common}>
          <path d="M5 6.5h14" />
          <path d="M5 11.5h14" />
          <path d="M5 16.5h9" />
          <circle cx="17.5" cy="16.5" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'experience':
      return (
        <svg {...common}>
          <rect x="4" y="7" width="16" height="12" rx="2.5" />
          <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
          <path d="M4 12h16" />
        </svg>
      );
    case 'skills':
      return (
        <svg {...common}>
          <path d="M8.5 8.5 15.5 15.5" />
          <path d="M10.5 4.5h4l5 5v4l-6 6h-4l-5-5v-4z" />
          <circle cx="14.5" cy="9.5" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'education':
      return (
        <svg {...common}>
          <path d="m3 9 9-4 9 4-9 4-9-4Z" />
          <path d="M7 11.5V15c0 1.6 2.8 3 5 3s5-1.4 5-3v-3.5" />
        </svg>
      );
    case 'certifications':
      return (
        <svg {...common}>
          <circle cx="12" cy="8.5" r="4.5" />
          <path d="m9.5 13  -1 7 3.5-2.2 3.5 2.2-1-7" />
        </svg>
      );
    case 'projects':
      return (
        <svg {...common}>
          <rect x="4" y="5" width="7" height="7" rx="1.8" />
          <rect x="13" y="5" width="7" height="7" rx="1.8" />
          <rect x="8.5" y="14" width="7" height="5" rx="1.8" />
        </svg>
      );
    case 'awards':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M8.5 12.5 7 20l5-2.7 5 2.7-1.5-7.5" />
        </svg>
      );
    case 'languages':
      return (
        <svg {...common}>
          <path d="M4 6h8" />
          <path d="M8 6c0 5-2.2 8-5 10" />
          <path d="M6 11c1.3 2 3.2 3.8 6 5" />
          <path d="M15 9h5" />
          <path d="m16 19 3.5-10 3.5 10" />
          <path d="M17.2 15h4.6" />
        </svg>
      );
    case 'strengths':
      return (
        <svg {...common}>
          <path d="m12 4 6 3v4c0 4-2.5 6.7-6 9-3.5-2.3-6-5-6-9V7z" />
          <path d="m9.5 12 1.7 1.7 3.3-3.4" />
        </svg>
      );
    case 'courses':
      return (
        <svg {...common}>
          <path d="M6 5.5h9.5A2.5 2.5 0 0 1 18 8v10.5H8.5A2.5 2.5 0 0 0 6 21Z" />
          <path d="M6 5.5A2.5 2.5 0 0 0 3.5 8v10.5H6" />
          <path d="M9 10h6" />
          <path d="M9 13.5h5" />
        </svg>
      );
    case 'volunteering':
      return (
        <svg {...common}>
          <path d="M12 19s-6-3.8-6-9a3.5 3.5 0 0 1 6-2.3A3.5 3.5 0 0 1 18 10c0 5.2-6 9-6 9Z" />
        </svg>
      );
    case 'publications':
      return (
        <svg {...common}>
          <path d="M6 5h12a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 18 19H6a1.5 1.5 0 0 1-1.5-1.5v-11A1.5 1.5 0 0 1 6 5Z" />
          <path d="M8 9h8" />
          <path d="M8 12.5h8" />
          <path d="M8 16h5" />
        </svg>
      );
    case 'personal-details':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M6 19a6 6 0 0 1 12 0" />
        </svg>
      );
    case 'declaration':
      return (
        <svg {...common}>
          <path d="M7 4.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V6a1.5 1.5 0 0 1 1-1.5Z" />
          <path d="M14 4.5V9h4" />
          <path d="M9 13h6" />
          <path d="M9 16h4" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="5" y="5" width="14" height="14" rx="3" />
          <path d="M9 12h6" />
        </svg>
      );
  }
}

function resolveIconId(icon) {
  const normalized = String(icon || '').toLowerCase();
  const map = {
    ps: 'summary',
    ex: 'experience',
    sk: 'skills',
    ed: 'education',
    cf: 'certifications',
    pr: 'projects',
    aw: 'awards',
    lg: 'languages',
    st: 'strengths',
    cr: 'courses',
    vo: 'volunteering',
    pb: 'publications',
    pd: 'personal-details',
    dc: 'declaration',
  };
  return map[normalized] || normalized;
}

function splitTextarea(value) {
  return String(value || '').split('\n').map((item) => item.trim()).filter(Boolean);
}

function InputField({ label, value, onChange, placeholder, textarea = false, rows = 4 }) {
  return (
    <label className="studio-field">
      <span>{label}</span>
      {textarea ? (
        <textarea className="studio-input studio-input--textarea" value={value} onChange={onChange} placeholder={placeholder} rows={rows} />
      ) : (
        <input className="studio-input" value={value} onChange={onChange} placeholder={placeholder} />
      )}
    </label>
  );
}

function LaunchCard({ icon, title, description, meta, onClick, tone = 'default', onRemove, removeLabel = 'Remove' }) {
  const iconId = resolveIconId(icon);
  return (
    <div className={`studio-launch-card${tone !== 'default' ? ` studio-launch-card--${tone}` : ''}`}>
      <button type="button" className="studio-launch-main" onClick={onClick}>
        <span className="studio-icon-chip" aria-hidden="true">
          <SectionGlyph id={iconId} />
        </span>
        <div className="studio-launch-copy">
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
      </button>
      <div className="studio-launch-actions">
        <span className="studio-launch-meta">{meta}</span>
        {onRemove && (
          <button
            type="button"
            className="studio-launch-remove"
            onClick={onRemove}
          >
            {removeLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function replaceLineArray(nextText, currentItems, changeExisting, addItem, delItem) {
  const nextItems = splitTextarea(nextText);
  nextItems.forEach((value, idx) => {
    if (currentItems[idx] !== undefined) changeExisting(idx, value);
    else {
      addItem();
      changeExisting(idx, value);
    }
  });
  for (let idx = currentItems.length - 1; idx >= nextItems.length; idx -= 1) delItem(idx);
}

export default function SectionStudioModalPanel({ data, customSections, onEdit, template, sectionLabels = {}, hiddenSections = [], onAIRewrite }) {
  const hasSidebar = HAS_SIDEBAR.includes(template);
  const [modalState, setModalState] = useState(null);
  const [placement, setPlacement] = useState('main');
  const [draft, setDraft] = useState({});
  const [customTitle, setCustomTitle] = useState('');
  const [customItemsText, setCustomItemsText] = useState('');
  const skillsText = useMemo(() => (data?.skills || []).join('\n'), [data?.skills]);
  const certText = useMemo(() => (data?.certifications || []).join('\n'), [data?.certifications]);
  const activeTemplate = useMemo(() => modalState?.type === 'template' ? getSectionTemplate(modalState.templateId) : null, [modalState]);
  const activeCustomSection = useMemo(() => modalState?.type === 'custom' ? customSections.find((section) => section.id === modalState.sectionId) || null : null, [customSections, modalState]);
  const activeBuiltin = modalState?.type === 'builtin' ? BUILTIN_SECTIONS.find((section) => section.id === modalState.sectionId) : null;
  const hiddenSet = useMemo(() => new Set(hiddenSections || []), [hiddenSections]);

  const closeModal = () => setModalState(null);
  const openBuiltinModal = (sectionId) => {
    setPlacement('main');
    setDraft({});
    setCustomTitle('');
    setCustomItemsText('');
    setModalState({ type: 'builtin', sectionId });
  };
  const openTemplateModal = (templateId) => {
    const templateDef = getSectionTemplate(templateId);
    setPlacement(templateDef?.defaultPlacement || 'main');
    setDraft(createEmptySectionDraft(templateId));
    setCustomTitle('');
    setCustomItemsText('');
    setModalState({ type: 'template', templateId });
  };
  const openCustomModal = (section) => {
    setPlacement(section?.placement || 'main');
    setDraft({});
    setCustomTitle(section?.title || '');
    setCustomItemsText((section?.items || []).join('\n'));
    setModalState({ type: 'custom', sectionId: section.id });
  };

  const addTemplateSection = () => {
    if (!activeTemplate) return;
    const payload = buildSectionPayload(activeTemplate.id, draft, placement);
    if (!payload.items.length) return;
    onEdit('custom_section_add', payload);
    closeModal();
  };

  const saveCustomSection = () => {
    if (!activeCustomSection) return;
    onEdit('custom_section_rename', { id: activeCustomSection.id, v: customTitle });
    onEdit('custom_section_placement', { id: activeCustomSection.id, placement });
    if (activeCustomSection.kind !== 'project-list') {
      onEdit('custom_section_replace_items', { id: activeCustomSection.id, items: splitTextarea(customItemsText) });
    }
    closeModal();
  };

  const renderBuiltinContent = () => {
    if (!activeBuiltin) return null;
    if (activeBuiltin.id === 'summary') {
      return (
        <>
          <div className="studio-modal-toolbar">
            <button type="button" className="studio-action-btn" onClick={() => onAIRewrite?.('summary')}>Rewrite summary</button>
          </div>
          <InputField label="Section heading" value={sectionLabels.summary || 'Profile Summary'} onChange={(e) => onEdit('section_rename', { sectionId: 'summary', v: e.target.value })} placeholder="Profile Summary" />
          <InputField label="Summary" textarea rows={8} value={data?.summary || ''} onChange={(e) => onEdit('summary', { v: e.target.value })} placeholder="Write a concise summary with outcomes, domain expertise, and years of experience." />
          <div className="studio-modal-footer studio-modal-footer--spread">
            <button type="button" className="studio-link-btn" onClick={() => { onEdit(hiddenSet.has('summary') ? 'section_show' : 'section_hide', { sectionId: 'summary' }); closeModal(); }}>{hiddenSet.has('summary') ? 'Restore section' : 'Remove section'}</button>
          </div>
        </>
      );
    }
    if (activeBuiltin.id === 'skills') {
      return (
        <>
          <div className="studio-modal-toolbar">
            <button type="button" className="studio-action-btn" onClick={() => onAIRewrite?.('skills')}>Rewrite skills</button>
          </div>
          <InputField label="Section heading" value={sectionLabels.skills || 'Skills'} onChange={(e) => onEdit('section_rename', { sectionId: 'skills', v: e.target.value })} placeholder="Skills" />
          <InputField label="Skills list" textarea rows={10} value={skillsText} onChange={(e) => onEdit('skills_replace', { items: splitTextarea(e.target.value) })} placeholder="SQL&#10;Power BI&#10;Alteryx&#10;Stakeholder management" />
          <div className="studio-modal-footer studio-modal-footer--spread">
            <button type="button" className="studio-link-btn" onClick={() => { onEdit(hiddenSet.has('skills') ? 'section_show' : 'section_hide', { sectionId: 'skills' }); closeModal(); }}>{hiddenSet.has('skills') ? 'Restore section' : 'Remove section'}</button>
          </div>
        </>
      );
    }
    if (activeBuiltin.id === 'certifications') {
      return (
        <>
          <div className="studio-modal-toolbar">
            <button type="button" className="studio-action-btn" onClick={() => onAIRewrite?.('certifications')}>Rewrite credentials</button>
          </div>
          <InputField label="Section heading" value={sectionLabels.certifications || 'Certifications'} onChange={(e) => onEdit('section_rename', { sectionId: 'certifications', v: e.target.value })} placeholder="Certifications" />
          <InputField label="Credentials" textarea rows={10} value={certText} onChange={(e) => onEdit('certs_replace', { items: splitTextarea(e.target.value) })} placeholder="Workday VNDLY Configuration&#10;Google Data Analytics Certificate" />
          <div className="studio-modal-footer studio-modal-footer--spread">
            <button type="button" className="studio-link-btn" onClick={() => { onEdit(hiddenSet.has('certifications') ? 'section_show' : 'section_hide', { sectionId: 'certifications' }); closeModal(); }}>{hiddenSet.has('certifications') ? 'Restore section' : 'Remove section'}</button>
          </div>
        </>
      );
    }
    if (activeBuiltin.id === 'education') {
      return (
        <>
          <div className="studio-modal-toolbar">
            <button type="button" className="studio-action-btn" onClick={() => onEdit('edu_add')}>Add education</button>
          </div>
          <InputField label="Section heading" value={sectionLabels.education || 'Education'} onChange={(e) => onEdit('section_rename', { sectionId: 'education', v: e.target.value })} placeholder="Education" />
          <div className="studio-modal-stack">
            {(data?.education || []).map((item, index) => (
              <div key={`edu-${index}`} className="studio-repeat-card">
                <div className="studio-repeat-head">
                  <div className="studio-repeat-title">
                    <strong>{item.degree || `Education ${index + 1}`}</strong>
                    <span>{item.school || 'Add institution and year below.'}</span>
                  </div>
                  <button type="button" className="studio-link-btn" onClick={() => onEdit('edu_del', { i: index })}>Remove</button>
                </div>
                <div className="studio-grid studio-grid--2">
                  <InputField label="Degree" value={item.degree || ''} onChange={(e) => onEdit('edu_degree', { i: index, v: e.target.value })} placeholder="B.Tech" />
                  <InputField label="Institution" value={item.school || ''} onChange={(e) => onEdit('edu_school', { i: index, v: e.target.value })} placeholder="Synergy Institute" />
                  <InputField label="Year / period" value={item.year || ''} onChange={(e) => onEdit('edu_year', { i: index, v: e.target.value })} placeholder="2012 - 2016" />
                </div>
              </div>
            ))}
          </div>
          <div className="studio-modal-footer studio-modal-footer--spread">
            <button type="button" className="studio-link-btn" onClick={() => { onEdit(hiddenSet.has('education') ? 'section_show' : 'section_hide', { sectionId: 'education' }); closeModal(); }}>{hiddenSet.has('education') ? 'Restore section' : 'Remove section'}</button>
          </div>
        </>
      );
    }
    if (activeBuiltin.id === 'experience') {
      return (
        <>
          <div className="studio-modal-toolbar">
            <button type="button" className="studio-action-btn" onClick={() => onEdit('exp_add')}>Add role</button>
          </div>
          <InputField label="Section heading" value={sectionLabels.experience || 'Experience'} onChange={(e) => onEdit('section_rename', { sectionId: 'experience', v: e.target.value })} placeholder="Experience" />
          <div className="studio-modal-stack">
            {(data?.experience || []).map((item, index) => (
              <div key={`${item._id || index}`} className="studio-repeat-card">
                <div className="studio-repeat-head">
                  <div className="studio-repeat-title">
                    <strong>{item.role || `Role ${index + 1}`}</strong>
                    <span>{item.company || 'Add company and timeline details below.'}</span>
                  </div>
                  <div className="studio-repeat-actions">
                    <button type="button" className="studio-action-btn" onClick={() => onAIRewrite?.('experience-bullets', { index })}>Rewrite bullets</button>
                    <button type="button" className="studio-link-btn" onClick={() => onEdit('exp_del', { i: index })}>Remove</button>
                  </div>
                </div>
                <div className="studio-grid studio-grid--2">
                  <InputField label="Role" value={item.role || ''} onChange={(e) => onEdit('exp_role', { i: index, v: e.target.value })} placeholder="Data Analyst" />
                  <InputField label="Company" value={item.company || ''} onChange={(e) => onEdit('exp_company', { i: index, v: e.target.value })} placeholder="Huawei Technologies" />
                  <InputField label="Client / payroll / account" value={item.client || ''} onChange={(e) => onEdit('exp_client', { i: index, v: e.target.value })} placeholder="IMS Payroll (India)" />
                  <InputField label="Dates" value={item.period || ''} onChange={(e) => onEdit('exp_period', { i: index, v: e.target.value })} placeholder="2021 - Present" />
                </div>
                <InputField
                  label="Bullet points"
                  textarea
                  rows={7}
                  value={(item.bullets || []).join('\n')}
                  onChange={(e) => replaceLineArray(
                    e.target.value,
                    item.bullets || [],
                    (bulletIndex, value) => onEdit('exp_bullet', { i: index, j: bulletIndex, v: value }),
                    () => onEdit('exp_bullet_add', { i: index }),
                    (bulletIndex) => onEdit('exp_bullet_del', { i: index, j: bulletIndex })
                  )}
                  placeholder="Write one result-driven bullet per line."
                />
                <div className="studio-modal-subsection">
                  <div className="studio-repeat-head">
                    <div className="studio-repeat-title">
                      <strong>Grouped sub-sections</strong>
                      <span>Use these for workstreams, modules, or account-specific responsibilities.</span>
                    </div>
                    <button type="button" className="studio-action-btn" onClick={() => onEdit('exp_group_add', { i: index })}>Add sub-section</button>
                  </div>
                  <div className="studio-modal-stack">
                    {(item.sections || []).map((section, sectionIndex) => (
                      <div key={`${item._id || index}-section-${sectionIndex}`} className="studio-repeat-card">
                        <div className="studio-repeat-head">
                          <div className="studio-repeat-title">
                            <strong>{section.heading || `Sub-section ${sectionIndex + 1}`}</strong>
                            <span>Organize a focused block of bullets under a named workstream.</span>
                          </div>
                          <button type="button" className="studio-link-btn" onClick={() => onEdit('exp_group_del', { i: index, j: sectionIndex })}>Remove</button>
                        </div>
                        <div className="studio-grid">
                          <InputField label="Sub-section title" value={section.heading || ''} onChange={(e) => onEdit('exp_group_heading', { i: index, j: sectionIndex, v: e.target.value })} placeholder="Customer Implementation and Expansions" />
                          <InputField
                            label="Sub-section bullets"
                            textarea
                            rows={6}
                            value={(section.bullets || []).join('\n')}
                            onChange={(e) => replaceLineArray(
                              e.target.value,
                              section.bullets || [],
                              (bulletIndex, value) => onEdit('exp_group_bullet', { i: index, j: sectionIndex, k: bulletIndex, v: value }),
                              () => onEdit('exp_group_bullet_add', { i: index, j: sectionIndex }),
                              (bulletIndex) => onEdit('exp_group_bullet_del', { i: index, j: sectionIndex, k: bulletIndex })
                            )}
                            placeholder="Use one bullet per line for this workstream."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="studio-modal-footer studio-modal-footer--spread">
            <button type="button" className="studio-link-btn" onClick={() => { onEdit(hiddenSet.has('experience') ? 'section_show' : 'section_hide', { sectionId: 'experience' }); closeModal(); }}>{hiddenSet.has('experience') ? 'Restore section' : 'Remove section'}</button>
          </div>
        </>
      );
    }
    return null;
  };

  const renderTemplateContent = () => activeTemplate ? (
    <>
      <div className="studio-placement-pill-row">
        <button type="button" className={`studio-placement-pill${placement === 'main' ? ' studio-placement-pill--active' : ''}`} onClick={() => setPlacement('main')}>Add to main area</button>
        {hasSidebar && <button type="button" className={`studio-placement-pill${placement === 'side' ? ' studio-placement-pill--active' : ''}`} onClick={() => setPlacement('side')}>Add to sidebar</button>}
      </div>
      <div className="studio-grid studio-grid--2">
        {activeTemplate.fields.map((field) => (
          <div key={field.id} className={field.type === 'textarea' ? 'studio-grid-span-2' : ''}>
            <InputField label={field.label} textarea={field.type === 'textarea'} rows={field.rows} value={draft[field.id] || ''} onChange={(e) => setDraft((prev) => ({ ...prev, [field.id]: e.target.value }))} placeholder={field.placeholder} />
          </div>
        ))}
      </div>
      <div className="studio-modal-footer">
        <button type="button" className="studio-primary-btn" onClick={addTemplateSection}>Add {activeTemplate.title}</button>
      </div>
    </>
  ) : null;

  const renderCustomContent = () => activeCustomSection ? (
    <>
      <InputField label="Section title" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Section title" />
      <div className="studio-placement-pill-row">
        <button type="button" className={`studio-placement-pill${placement === 'main' ? ' studio-placement-pill--active' : ''}`} onClick={() => setPlacement('main')}>Main</button>
        {hasSidebar && <button type="button" className={`studio-placement-pill${placement === 'side' ? ' studio-placement-pill--active' : ''}`} onClick={() => setPlacement('side')}>Side</button>}
      </div>
      {activeCustomSection.kind === 'project-list' ? (
        <div className="studio-inline-note">Project sections created from the guided form use a richer layout. Edit the project cards directly on the resume canvas.</div>
      ) : (
        <InputField label="Section details" textarea rows={10} value={customItemsText} onChange={(e) => setCustomItemsText(e.target.value)} placeholder="Write one item per line." />
      )}
      <div className="studio-modal-footer studio-modal-footer--spread">
        <button type="button" className="studio-link-btn" onClick={() => { onEdit('custom_section_del', { id: activeCustomSection.id }); closeModal(); }}>Delete section</button>
        <button type="button" className="studio-primary-btn" onClick={saveCustomSection}>Save changes</button>
      </div>
    </>
  ) : null;

  const modalIcon = activeBuiltin?.icon || activeTemplate?.icon || (activeCustomSection?.title || 'CS').slice(0, 2).toUpperCase();
  const modalTitle = activeBuiltin ? (sectionLabels[activeBuiltin.id] || activeBuiltin.label) : activeTemplate?.title || activeCustomSection?.title || '';
  const modalDescription = activeBuiltin?.description || activeTemplate?.description || (activeCustomSection?.placement === 'side' ? 'Sidebar section editor.' : 'Main section editor.');

  return (
    <>
      <div className="studio-root">
        <section className="studio-block">
          <div className="studio-block-head">
            <div>
              <span className="studio-kicker">Built-in Studio</span>
              <h3>Edit resume sections</h3>
            </div>
            <span className="studio-count">{BUILTIN_SECTIONS.length}</span>
          </div>
          <div className="studio-launch-list">
            {BUILTIN_SECTIONS.map((section) => (
              <LaunchCard key={section.id} icon={section.icon} title={sectionLabels[section.id] || section.label} description={section.description} meta={hiddenSet.has(section.id) ? 'Hidden' : `${section.count(data)} item${section.count(data) === 1 ? '' : 's'}`} onClick={() => openBuiltinModal(section.id)} onRemove={() => onEdit(hiddenSet.has(section.id) ? 'section_show' : 'section_hide', { sectionId: section.id })} removeLabel={hiddenSet.has(section.id) ? 'Restore' : 'Remove'} />
            ))}
          </div>
        </section>

        <section className="studio-block">
          <div className="studio-block-head">
            <div>
              <span className="studio-kicker">Section Composer</span>
              <h3>Add a new custom section</h3>
            </div>
            <span className="studio-count">{SECTION_TEMPLATE_DEFS.length}</span>
          </div>
          <div className="studio-launch-list">
            {SECTION_TEMPLATE_DEFS.map((templateDef) => (
              <LaunchCard key={templateDef.id} icon={templateDef.icon} title={templateDef.title} description={templateDef.description} meta={templateDef.defaultPlacement === 'side' ? 'Sidebar' : 'Main'} tone="soft" onClick={() => openTemplateModal(templateDef.id)} />
            ))}
          </div>
        </section>

        {!!customSections.length && (
          <section className="studio-block">
            <div className="studio-block-head">
              <div>
                <span className="studio-kicker">Your Sections</span>
                <h3>Edit added custom sections</h3>
              </div>
              <span className="studio-count">{customSections.length}</span>
            </div>
            <div className="studio-launch-list">
              {customSections.map((section) => (
                <LaunchCard key={section.id} icon={section.title.slice(0, 2).toUpperCase()} title={section.title} description={section.kind === 'project-list' ? 'Structured project section from the guided form.' : 'Custom section you can rename, move, or edit.'} meta={section.placement === 'side' ? 'Sidebar' : 'Main'} onClick={() => openCustomModal(section)} onRemove={() => onEdit('custom_section_del', { id: section.id })} />
              ))}
            </div>
          </section>
        )}
      </div>

      {modalState && (
        <div className="studio-modal-overlay" onClick={closeModal}>
          <div className="studio-modal" onClick={(event) => event.stopPropagation()}>
            <div className="studio-modal-head">
              <div className="studio-card-head-main">
                <span className="studio-icon-chip">{modalIcon}</span>
                <div className="studio-card-head-copy">
                  <strong>{modalTitle}</strong>
                  <p>{modalDescription}</p>
                </div>
              </div>
              <button type="button" className="studio-modal-close" onClick={closeModal}>Close</button>
            </div>
            <div className="studio-modal-body">
              {modalState.type === 'builtin' && renderBuiltinContent()}
              {modalState.type === 'template' && renderTemplateContent()}
              {modalState.type === 'custom' && renderCustomContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
