import { useMemo, useState } from 'react';
import { buildSectionPayload, createEmptySectionDraft, getSectionTemplate, SECTION_TEMPLATE_DEFS } from '../utils/sectionStudio';

const HAS_SIDEBAR = ['executive-navy', 'bold-coral', 'strategist-gold', 'designer-slate'];

const BUILTIN_SECTIONS = [
  { id: 'summary', defaultLabel: 'Profile Summary', icon: 'PS' },
  { id: 'experience', defaultLabel: 'Experience', icon: 'EX' },
  { id: 'skills', defaultLabel: 'Skills', icon: 'SK' },
  { id: 'education', defaultLabel: 'Education', icon: 'ED' },
  { id: 'certifications', defaultLabel: 'Certifications', icon: 'CF' },
];

function splitTextarea(value) {
  return String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function InputField({ label, value, onChange, placeholder, textarea = false, rows = 4 }) {
  return (
    <label className="studio-field">
      <span>{label}</span>
      {textarea ? (
        <textarea
          className="studio-input studio-input--textarea"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <input className="studio-input" value={value} onChange={onChange} placeholder={placeholder} />
      )}
    </label>
  );
}

export default function SectionPanel({ data, customSections, onEdit, template, sectionLabels = {}, onAIRewrite }) {
  const hasSidebar = HAS_SIDEBAR.includes(template);
  const [selectedTemplateId, setSelectedTemplateId] = useState(SECTION_TEMPLATE_DEFS[0].id);
  const [placement, setPlacement] = useState(getSectionTemplate(SECTION_TEMPLATE_DEFS[0].id).defaultPlacement);
  const [draft, setDraft] = useState(() => createEmptySectionDraft(SECTION_TEMPLATE_DEFS[0].id));
  const [expandedCustomId, setExpandedCustomId] = useState(null);

  const selectedTemplate = useMemo(() => getSectionTemplate(selectedTemplateId), [selectedTemplateId]);
  const skillsText = useMemo(() => (data?.skills || []).join('\n'), [data?.skills]);
  const certText = useMemo(() => (data?.certifications || []).join('\n'), [data?.certifications]);

  const createSection = () => {
    const payload = buildSectionPayload(selectedTemplateId, draft, placement);
    if (!payload.items.length) return;
    onEdit('custom_section_add', payload);
    setDraft(createEmptySectionDraft(selectedTemplateId));
  };

  const chooseTemplate = (templateId) => {
    const templateDef = getSectionTemplate(templateId);
    setSelectedTemplateId(templateId);
    setPlacement(templateDef.defaultPlacement);
    setDraft(createEmptySectionDraft(templateId));
  };

  return (
    <div className="studio-root">
      <section className="studio-block">
        <div className="studio-block-head">
          <div>
            <span className="studio-kicker">Built-in Studio</span>
            <h3>Core resume sections</h3>
          </div>
          <span className="studio-count">{BUILTIN_SECTIONS.length}</span>
        </div>

        <div className="studio-stack">
          <div className="studio-card">
            <div className="studio-card-head">
              <div className="studio-card-head-main">
                <span className="studio-icon-chip">PS</span>
                <div className="studio-card-head-copy">
                  <strong>{sectionLabels.summary || 'Profile Summary'}</strong>
                  <p>Keep the opening sharp and recruiter-friendly.</p>
                </div>
              </div>
              <div className="studio-card-head-actions">
                <button type="button" className="studio-action-btn" onClick={() => onAIRewrite?.('summary')}>
                  Rewrite
                </button>
              </div>
            </div>
            <InputField
              label="Section heading"
              value={sectionLabels.summary || 'Profile Summary'}
              onChange={(e) => onEdit('section_rename', { sectionId: 'summary', v: e.target.value })}
              placeholder="Profile Summary"
            />
            <InputField
              label="Summary"
              textarea
              rows={5}
              value={data?.summary || ''}
              onChange={(e) => onEdit('summary', { v: e.target.value })}
              placeholder="Write a concise summary with outcomes, domain expertise, and years of experience."
            />
          </div>

          <div className="studio-card">
            <div className="studio-card-head">
              <div className="studio-card-head-main">
                <span className="studio-icon-chip">EX</span>
                <div className="studio-card-head-copy">
                  <strong>{sectionLabels.experience || 'Experience'}</strong>
                  <p>Add detailed roles with stronger bullet points.</p>
                </div>
              </div>
              <div className="studio-card-head-actions">
                <button type="button" className="studio-action-btn" onClick={() => onEdit('exp_add')}>
                  Add role
                </button>
              </div>
            </div>
            <InputField
              label="Section heading"
              value={sectionLabels.experience || 'Experience'}
              onChange={(e) => onEdit('section_rename', { sectionId: 'experience', v: e.target.value })}
              placeholder="Experience"
            />
            <div className="studio-repeat-stack">
              {(data?.experience || []).map((item, index) => (
                <div key={`${item._id || index}`} className="studio-repeat-card">
                  <div className="studio-repeat-head">
                    <div className="studio-repeat-title">
                      <strong>{item.role || `Role ${index + 1}`}</strong>
                      <span>{item.company || 'Add company and timeline details below.'}</span>
                    </div>
                    <div className="studio-repeat-actions">
                      <button type="button" className="studio-action-btn" onClick={() => onAIRewrite?.('experience-bullets', { index })}>
                        Rewrite bullets
                      </button>
                      <button type="button" className="studio-link-btn" onClick={() => onEdit('exp_del', { i: index })}>
                        Remove
                      </button>
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
                    rows={5}
                    value={(item.bullets || []).join('\n')}
                    onChange={(e) => {
                      const nextBullets = splitTextarea(e.target.value);
                      const currentBullets = item.bullets || [];
                      nextBullets.forEach((bullet, bulletIndex) => {
                        if (currentBullets[bulletIndex] !== undefined) {
                          onEdit('exp_bullet', { i: index, j: bulletIndex, v: bullet });
                        } else {
                          onEdit('exp_bullet_add', { i: index });
                          onEdit('exp_bullet', { i: index, j: bulletIndex, v: bullet });
                        }
                      });
                      for (let bulletIndex = currentBullets.length - 1; bulletIndex >= nextBullets.length; bulletIndex -= 1) {
                        onEdit('exp_bullet_del', { i: index, j: bulletIndex });
                      }
                    }}
                    placeholder="Write one result-driven bullet per line."
                  />
                  <div className="studio-repeat-stack">
                    <div className="studio-repeat-head">
                      <div className="studio-repeat-title">
                        <strong>Grouped sub-sections</strong>
                        <span>Use these for workstreams, modules, or account-specific responsibilities.</span>
                      </div>
                      <button type="button" className="studio-action-btn" onClick={() => onEdit('exp_group_add', { i: index })}>
                        Add sub-section
                      </button>
                    </div>
                    {(item.sections || []).map((section, sectionIndex) => (
                      <div key={`${item._id || index}-section-${sectionIndex}`} className="studio-repeat-card">
                        <div className="studio-repeat-head">
                          <div className="studio-repeat-title">
                            <strong>{section.heading || `Sub-section ${sectionIndex + 1}`}</strong>
                            <span>Organize a focused block of bullets under a named workstream.</span>
                          </div>
                          <button type="button" className="studio-link-btn" onClick={() => onEdit('exp_group_del', { i: index, j: sectionIndex })}>
                            Remove
                          </button>
                        </div>
                        <div className="studio-grid">
                          <InputField
                            label="Sub-section title"
                            value={section.heading || ''}
                            onChange={(e) => onEdit('exp_group_heading', { i: index, j: sectionIndex, v: e.target.value })}
                            placeholder="Customer Implementation and Expansions"
                          />
                          <InputField
                            label="Sub-section bullets"
                            textarea
                            rows={5}
                            value={(section.bullets || []).join('\n')}
                            onChange={(e) => {
                              const nextBullets = splitTextarea(e.target.value);
                              const currentBullets = section.bullets || [];
                              nextBullets.forEach((bullet, bulletIndex) => {
                                if (currentBullets[bulletIndex] !== undefined) {
                                  onEdit('exp_group_bullet', { i: index, j: sectionIndex, k: bulletIndex, v: bullet });
                                } else {
                                  onEdit('exp_group_bullet_add', { i: index, j: sectionIndex });
                                  onEdit('exp_group_bullet', { i: index, j: sectionIndex, k: bulletIndex, v: bullet });
                                }
                              });
                              for (let bulletIndex = currentBullets.length - 1; bulletIndex >= nextBullets.length; bulletIndex -= 1) {
                                onEdit('exp_group_bullet_del', { i: index, j: sectionIndex, k: bulletIndex });
                              }
                            }}
                            placeholder="Use one bullet per line for this workstream."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="studio-card">
            <div className="studio-card-head">
              <div className="studio-card-head-main">
                <span className="studio-icon-chip">SK</span>
                <div className="studio-card-head-copy">
                  <strong>{sectionLabels.skills || 'Skills'}</strong>
                  <p>Use one line per skill for easier editing and clearer ATS coverage.</p>
                </div>
              </div>
              <div className="studio-card-head-actions">
                <button type="button" className="studio-action-btn" onClick={() => onAIRewrite?.('skills')}>
                  Rewrite
                </button>
              </div>
            </div>
            <InputField
              label="Section heading"
              value={sectionLabels.skills || 'Skills'}
              onChange={(e) => onEdit('section_rename', { sectionId: 'skills', v: e.target.value })}
              placeholder="Skills"
            />
            <InputField
              label="Skills list"
              textarea
              rows={6}
              value={skillsText}
              onChange={(e) => onEdit('skills_replace', { items: splitTextarea(e.target.value) })}
              placeholder="SQL&#10;Power BI&#10;Alteryx&#10;Stakeholder management"
            />
          </div>

          <div className="studio-card">
            <div className="studio-card-head">
              <div className="studio-card-head-main">
                <span className="studio-icon-chip">ED</span>
                <div className="studio-card-head-copy">
                  <strong>{sectionLabels.education || 'Education'}</strong>
                  <p>Structure degree, institution, and year fields directly from the side studio.</p>
                </div>
              </div>
              <div className="studio-card-head-actions">
                <button type="button" className="studio-action-btn" onClick={() => onEdit('edu_add')}>
                  Add education
                </button>
              </div>
            </div>
            <InputField
              label="Section heading"
              value={sectionLabels.education || 'Education'}
              onChange={(e) => onEdit('section_rename', { sectionId: 'education', v: e.target.value })}
              placeholder="Education"
            />
            <div className="studio-repeat-stack">
              {(data?.education || []).map((item, index) => (
                <div key={`edu-${index}`} className="studio-repeat-card">
                  <div className="studio-repeat-head">
                    <div className="studio-repeat-title">
                      <strong>{item.degree || `Education ${index + 1}`}</strong>
                      <span>{item.school || 'Add institution and year below.'}</span>
                    </div>
                    <button type="button" className="studio-link-btn" onClick={() => onEdit('edu_del', { i: index })}>
                      Remove
                    </button>
                  </div>
                  <div className="studio-grid studio-grid--2">
                    <InputField label="Degree" value={item.degree || ''} onChange={(e) => onEdit('edu_degree', { i: index, v: e.target.value })} placeholder="B.Tech" />
                    <InputField label="Institution" value={item.school || ''} onChange={(e) => onEdit('edu_school', { i: index, v: e.target.value })} placeholder="Synergy Institute" />
                    <InputField label="Year / period" value={item.year || ''} onChange={(e) => onEdit('edu_year', { i: index, v: e.target.value })} placeholder="2012 - 2016" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="studio-card">
            <div className="studio-card-head">
              <div className="studio-card-head-main">
                <span className="studio-icon-chip">CF</span>
                <div className="studio-card-head-copy">
                  <strong>{sectionLabels.certifications || 'Certifications'}</strong>
                  <p>List licenses, badges, and formal credentials in a cleaner stack.</p>
                </div>
              </div>
              <div className="studio-card-head-actions">
                <button type="button" className="studio-action-btn" onClick={() => onAIRewrite?.('certifications')}>
                  Rewrite
                </button>
              </div>
            </div>
            <InputField
              label="Section heading"
              value={sectionLabels.certifications || 'Certifications'}
              onChange={(e) => onEdit('section_rename', { sectionId: 'certifications', v: e.target.value })}
              placeholder="Certifications"
            />
            <InputField
              label="Credentials"
              textarea
              rows={5}
              value={certText}
              onChange={(e) => onEdit('certs_replace', { items: splitTextarea(e.target.value) })}
              placeholder="Workday VNDLY Configuration&#10;Google Data Analytics Certificate"
            />
          </div>
        </div>
      </section>

      <section className="studio-block">
        <div className="studio-block-head">
          <div>
            <span className="studio-kicker">Section Composer</span>
            <h3>Add structured sections</h3>
          </div>
          <span className="studio-count">{customSections.length}</span>
        </div>

        <div className="studio-template-grid">
          {SECTION_TEMPLATE_DEFS.map((templateDef) => (
            <button
              key={templateDef.id}
              type="button"
              className={`studio-template-card${templateDef.id === selectedTemplateId ? ' studio-template-card--active' : ''}`}
              onClick={() => chooseTemplate(templateDef.id)}
            >
              <span className="studio-icon-chip studio-icon-chip--soft">{templateDef.icon}</span>
              <strong>{templateDef.title}</strong>
              <small>{templateDef.description}</small>
            </button>
          ))}
        </div>

        <div className="studio-card studio-card--composer">
          <div className="studio-card-head">
            <div className="studio-card-head-main">
              <span className="studio-icon-chip">{selectedTemplate.icon}</span>
              <div className="studio-card-head-copy">
                <strong>{selectedTemplate.title}</strong>
                <p>{selectedTemplate.description}</p>
              </div>
            </div>
          </div>

          <div className="studio-placement-pill-row">
            <button
              type="button"
              className={`studio-placement-pill${placement === 'main' ? ' studio-placement-pill--active' : ''}`}
              onClick={() => setPlacement('main')}
            >
              Add to main area
            </button>
            {hasSidebar && (
              <button
                type="button"
                className={`studio-placement-pill${placement === 'side' ? ' studio-placement-pill--active' : ''}`}
                onClick={() => setPlacement('side')}
              >
                Add to sidebar
              </button>
            )}
          </div>

          <div className="studio-grid studio-grid--2">
            {selectedTemplate.fields.map((field) => (
              <div key={field.id} className={field.type === 'textarea' ? 'studio-grid-span-2' : ''}>
                <InputField
                  label={field.label}
                  textarea={field.type === 'textarea'}
                  rows={field.rows}
                  value={draft[field.id] || ''}
                  onChange={(e) => setDraft((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>

          <button type="button" className="studio-primary-btn" onClick={createSection}>
            Add {selectedTemplate.title}
          </button>
        </div>

        {!!customSections.length && (
          <div className="studio-stack">
            {customSections.map((section) => {
              const isOpen = expandedCustomId === section.id;
              const isStructuredProjectSection = section.kind === 'project-list';
              return (
                <div key={section.id} className={`studio-card${isOpen ? ' studio-card--open' : ''}`}>
                  <div className="studio-card-head">
                    <div className="studio-card-head-main">
                      <span className="studio-icon-chip">{section.title.slice(0, 2).toUpperCase()}</span>
                      <div className="studio-card-head-copy">
                        <strong>{section.title}</strong>
                        <p>{section.placement === 'side' ? 'Sidebar section' : 'Main section'}</p>
                      </div>
                    </div>
                    <div className="studio-card-head-actions studio-repeat-actions">
                      <button type="button" className="studio-action-btn" onClick={() => onAIRewrite?.('custom-section', { id: section.id })} disabled={isStructuredProjectSection}>
                        Rewrite
                      </button>
                      <button type="button" className="studio-link-btn" onClick={() => setExpandedCustomId(isOpen ? null : section.id)}>
                        {isOpen ? 'Collapse' : 'Edit'}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="studio-stack studio-stack--tight">
                      <InputField
                        label="Section title"
                        value={section.title}
                        onChange={(e) => onEdit('custom_section_rename', { id: section.id, v: e.target.value })}
                        placeholder="Section title"
                      />
                      <div className="studio-placement-pill-row">
                        <button
                          type="button"
                          className={`studio-placement-pill${(section.placement || 'main') === 'main' ? ' studio-placement-pill--active' : ''}`}
                          onClick={() => onEdit('custom_section_placement', { id: section.id, placement: 'main' })}
                        >
                          Main
                        </button>
                        {hasSidebar && (
                          <button
                            type="button"
                            className={`studio-placement-pill${section.placement === 'side' ? ' studio-placement-pill--active' : ''}`}
                            onClick={() => onEdit('custom_section_placement', { id: section.id, placement: 'side' })}
                          >
                            Side
                          </button>
                        )}
                      </div>
                      {isStructuredProjectSection ? (
                        <div className="studio-inline-note">
                          Project sections created from the guided form use a richer layout. Edit the project cards directly on the resume canvas.
                        </div>
                      ) : (
                        <InputField
                          label="Section details"
                          textarea
                          rows={6}
                          value={(section.items || []).join('\n')}
                          onChange={(e) => onEdit('custom_section_replace_items', { id: section.id, items: splitTextarea(e.target.value) })}
                          placeholder="Write one item per line."
                        />
                      )}
                      <div className="studio-inline-actions">
                        <button type="button" className="studio-link-btn" onClick={() => onEdit('custom_section_del', { id: section.id })}>
                          Delete section
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
