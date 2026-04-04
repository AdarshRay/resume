import { useState } from 'react';

function InputField({ label, value, onChange, placeholder }) {
  return (
    <label className="upload-field-label">
      <span>{label}</span>
      <input className="upload-field" value={value} onChange={onChange} placeholder={placeholder} />
    </label>
  );
}

function TextareaField({ label, value, onChange, placeholder, rows = 5 }) {
  return (
    <label className="upload-field-label">
      <span>{label}</span>
      <textarea
        className="upload-field upload-field--textarea"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="upload-field-label">
      <span>{label}</span>
      <select className="upload-field upload-field--select" value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SectionHeader({ title, copy, actions }) {
  return (
    <div className="upload-section-header upload-section-header--studio">
      <div>
        <h3>{title}</h3>
        <p>{copy}</p>
      </div>
      {!!actions?.length && (
        <div className="upload-section-tools">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={`upload-mini-action${action.primary ? ' upload-mini-action--primary' : ''}`}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function splitListValues(value) {
  return String(value || '')
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitMultiline(value) {
  return String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isCustomSectionFilled(item) {
  return !!(item?.title?.trim() || item?.content?.trim());
}

export default function GuidedFormFlow({
  form,
  formStep,
  setFormStep,
  formSteps,
  completion,
  savePulse,
  photoName,
  photoRef,
  handlePhoto,
  handleUseDemo,
  clearDraft,
  setMode,
  rewriteKey,
  rewriteField,
  handleRewriteWholeForm,
  updateForm,
  updateArrayField,
  updateNestedArrayField,
  addArrayItem,
  addNestedArrayItem,
  removeArrayItem,
  removeNestedArrayItem,
  nextFormStep,
  prevFormStep,
  isLastStep,
  formReady,
  handleFormSubmit,
  formInsights,
  emptyExperience,
  emptyExperienceSection,
  emptyProject,
  emptyProjectDetail,
  emptyAward,
  emptyEducation,
  emptyReference,
  addCustomSection,
  aiFillCustomSection,
}) {
  const currentStepMeta = formSteps[formStep];
  const guidedProgress = Math.round(((formStep + 1) / formSteps.length) * 100);
  const canSkip = currentStepMeta.id !== 'review';
  const [customTitle, setCustomTitle] = useState('');
  const [customPlacement, setCustomPlacement] = useState('side');

  const handleCreateCustomSection = async (withAI) => {
    const title = customTitle.trim();
    if (!title) return;
    await addCustomSection({ title, placement: customPlacement, withAI });
    setCustomTitle('');
    setCustomPlacement('side');
  };

  return (
    <div className="upload-guided-shell">
      <div className="upload-page-orb upload-page-orb--mint" />
      <div className="upload-page-orb upload-page-orb--sky" />

      <div className="upload-guided-frame fade-up">
        <header className="upload-guided-header premium-surface">
          <div className="upload-guided-header-copy">
            <div className="upload-step-chip">Guided Resume Flow</div>
            <p className="upload-guided-step-label">Step {formStep + 1} · {currentStepMeta.label}</p>
            <h1>{currentStepMeta.label}</h1>
            <p>{currentStepMeta.blurb}</p>
          </div>

          <div className="upload-guided-header-meta">
            <div className="upload-guided-progress-card">
              <div className="upload-guided-progress-top">
                <span>Progress</span>
                <strong>{guidedProgress}%</strong>
              </div>
              <div className="upload-guided-progress-track">
                <div className="upload-guided-progress-bar" style={{ width: `${guidedProgress}%` }} />
              </div>
              <small>{savePulse ? 'Draft saved locally' : 'Autosaves locally as you go'}</small>
            </div>

            <div className="upload-guided-header-actions">
              <button type="button" className="upload-guided-pill" onClick={() => photoRef.current?.click()}>
                <span>{photoName ? 'Photo added' : 'Add profile photo'}</span>
                <small>{photoName || 'Optional headshot'}</small>
              </button>
              <button type="button" className="upload-guided-pill" onClick={handleUseDemo}>
                <span>Try demo data</span>
                <small>Load a polished sample</small>
              </button>
              <button type="button" className="upload-guided-pill" onClick={clearDraft}>
                <span>Reset draft</span>
                <small>Clear saved form data</small>
              </button>
            </div>

            <div className="upload-guided-mode-switch">
              <button type="button" className="upload-guided-mode-link" onClick={() => setMode('paste')}>
                Switch to Paste Text
              </button>
              <button type="button" className="upload-guided-mode-link" onClick={() => setMode('upload')}>
                Switch to Upload Resume
              </button>
            </div>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>
        </header>

        <div className="upload-guided-body">
          <aside className="upload-guided-sidebar premium-surface">
            <div className="upload-guided-sidebar-head">
              <strong>Guided Sections</strong>
              <span>{formStep + 1} / {formSteps.length}</span>
            </div>

            <div className="upload-guided-step-list">
              {formSteps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  className={`upload-guided-step-item${index === formStep ? ' upload-guided-step-item--active' : ''}${index < formStep ? ' upload-guided-step-item--complete' : ''}`}
                  onClick={() => setFormStep(index)}
                >
                  <span className="upload-guided-step-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="upload-guided-step-copy">
                    <strong>{step.label}</strong>
                    <small>{step.blurb}</small>
                  </span>
                </button>
              ))}
            </div>

            <div className="upload-guided-sidebar-card">
              <strong>{completion}% complete</strong>
              <p>Every section is optional. Keep the ones that fit this resume, skip the rest, and come back later if you want.</p>
            </div>
          </aside>

          <main className="upload-guided-main premium-surface">
            {currentStepMeta.id === 'identity' && (
              <section className="upload-form-section upload-guided-section">
                <SectionHeader
                  title="Identity"
                  copy="Start with the name and role you want leading the resume. This becomes the first thing recruiters see."
                />
                <div className="upload-form-grid upload-form-grid--2col">
                  <InputField label="Full name" value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Jordan Avery" />
                  <InputField label="Professional title" value={form.title} onChange={(e) => updateForm('title', e.target.value)} placeholder="Senior Brand Designer" />
                </div>
                <div className="upload-guided-note-card">
                  <strong>Tip</strong>
                  <p>Use a real market-facing title here, not just an internal role code. It shapes the tone of the first draft.</p>
                </div>
              </section>
            )}

            {currentStepMeta.id === 'contact' && (
              <section className="upload-form-section upload-guided-section">
                <SectionHeader
                  title="Contact"
                  copy="Capture the details that belong in the header band and make the resume easy to reach out on."
                />
                <div className="upload-form-grid upload-form-grid--2col">
                  <InputField label="Email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="jordan.avery@example.com" />
                  <InputField label="Phone" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="+1 415 555 0182" />
                  <InputField label="Location" value={form.location} onChange={(e) => updateForm('location', e.target.value)} placeholder="Austin, Texas" />
                  <InputField label="Website / LinkedIn" value={form.website} onChange={(e) => updateForm('website', e.target.value)} placeholder="linkedin.com/in/yourname" />
                </div>
              </section>
            )}

            {currentStepMeta.id === 'profile' && (
              <section className="upload-form-section upload-guided-section">
                <SectionHeader
                  title="Profile"
                  copy="Use concise, recruiter-friendly language for your summary and the strengths that support it."
                  actions={[
                    {
                      label: rewriteKey === 'summary' ? 'Rewriting...' : 'Rewrite summary',
                      onClick: () => rewriteField({
                        key: 'summary',
                        scope: 'summary',
                        context: `${form.title || 'Professional'} summary`,
                        value: form.summary,
                        updater: (next) => updateForm('summary', next),
                      }),
                      disabled: rewriteKey === 'summary',
                    },
                  ]}
                />
                <TextareaField label="Professional summary" value={form.summary} onChange={(e) => updateForm('summary', e.target.value)} placeholder="Results-focused analyst with 6+ years of experience..." rows={6} />
                <TextareaField label="Strengths" value={form.strengths} onChange={(e) => updateForm('strengths', e.target.value)} placeholder={'Stakeholder communication\nProblem solving\nReporting automation'} rows={4} />
              </section>
            )}

            {currentStepMeta.id === 'experience' && (
              <section className="upload-form-section upload-guided-section">
                <SectionHeader
                  title="Experience"
                  copy="Each role can capture company, client, location, dates, and grouped workstreams when one role covers multiple initiatives."
                  actions={[{ label: 'Add role', onClick: () => addArrayItem('experience', emptyExperience) }]}
                />
                <div className="upload-repeat-stack">
                  {form.experience.map((item, index) => (
                    <div className="upload-repeat-card" key={`experience-${index}`}>
                      <div className="upload-repeat-head">
                        <strong>{item.role || item.company || `Role ${index + 1}`}</strong>
                        <div className="upload-repeat-head-actions">
                          <button
                            type="button"
                            className="upload-mini-action"
                            onClick={() => rewriteField({
                              key: `experience-${index}`,
                              scope: 'bullets',
                              context: `${item.role || 'Role'} at ${item.company || 'Company'}`,
                              value: item.bullets,
                              updater: (next) => updateArrayField('experience', index, 'bullets', next),
                            })}
                            disabled={rewriteKey === `experience-${index}`}
                          >
                            {rewriteKey === `experience-${index}` ? 'Rewriting...' : 'Rewrite bullets'}
                          </button>
                          <button type="button" className="upload-link-btn" onClick={() => removeArrayItem('experience', index)}>
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="upload-form-grid upload-form-grid--2col">
                        <InputField label="Job title" value={item.role} onChange={(e) => updateArrayField('experience', index, 'role', e.target.value)} placeholder="Lead Supplier Onboarding" />
                        <InputField label="Company" value={item.company} onChange={(e) => updateArrayField('experience', index, 'company', e.target.value)} placeholder="Aurora Consulting" />
                        <InputField label="Client" value={item.client} onChange={(e) => updateArrayField('experience', index, 'client', e.target.value)} placeholder="Meridian Retail Group" />
                        <InputField label="Dates" value={item.period} onChange={(e) => updateArrayField('experience', index, 'period', e.target.value)} placeholder="Sept 2021 - Present" />
                        <InputField label="Location" value={item.location} onChange={(e) => updateArrayField('experience', index, 'location', e.target.value)} placeholder="Remote / Chicago" />
                      </div>
                      <TextareaField label="Impact bullets" value={item.bullets} onChange={(e) => updateArrayField('experience', index, 'bullets', e.target.value)} placeholder={'Improved operational visibility across VMS workflows\nReduced manual reporting effort by 40%\nPartnered with analysts and PMs to launch new integrations'} rows={5} />
                      <div className="upload-nested-composer">
                        <SectionHeader
                          title="Grouped sub-sections"
                          copy="Use this when one company includes multiple workstreams, implementations, support tracks, or client-facing subsections."
                          actions={[{ label: 'Add sub-section', onClick: () => addNestedArrayItem('experience', index, 'sections', emptyExperienceSection) }]}
                        />
                        <div className="upload-repeat-stack">
                          {(item.sections || []).map((section, sectionIndex) => (
                            <div className="upload-repeat-card upload-repeat-card--nested" key={`experience-${index}-section-${sectionIndex}`}>
                              <div className="upload-repeat-head">
                                <strong>{section.heading || `Sub-section ${sectionIndex + 1}`}</strong>
                                <button type="button" className="upload-link-btn" onClick={() => removeNestedArrayItem('experience', index, 'sections', sectionIndex)}>
                                  Remove
                                </button>
                              </div>
                              <div className="upload-form-grid">
                                <InputField label="Sub-section title" value={section.heading} onChange={(e) => updateNestedArrayField('experience', index, 'sections', sectionIndex, 'heading', e.target.value)} placeholder="Customer Implementation and Expansions" />
                                <TextareaField label="Sub-section bullets" value={section.bullets} onChange={(e) => updateNestedArrayField('experience', index, 'sections', sectionIndex, 'bullets', e.target.value)} placeholder={'Serve as the technical lead for new implementations\nConduct discovery, process mapping, and business requirements workshops\nSupport user acceptance testing and go-live activities'} rows={5} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {currentStepMeta.id === 'projects' && (
              <section className="upload-form-section upload-guided-section">
                <SectionHeader
                  title="Projects & achievements"
                  copy="Add richer supporting project stories and recognition that strengthen the final resume draft."
                  actions={[
                    { label: 'Add project', onClick: () => addArrayItem('projects', emptyProject) },
                    {
                      label: rewriteKey === 'whole-form' ? 'Polishing...' : 'Polish draft copy',
                      onClick: handleRewriteWholeForm,
                      disabled: rewriteKey === 'whole-form',
                      primary: true,
                    },
                  ]}
                />
                <div className="upload-repeat-stack">
                  {form.projects.map((item, index) => (
                    <div className="upload-repeat-card" key={`project-${index}`}>
                      <div className="upload-repeat-head">
                        <strong>{item.name || `Project ${index + 1}`}</strong>
                        <div className="upload-repeat-head-actions">
                          <button
                            type="button"
                            className="upload-mini-action"
                            onClick={() => rewriteField({
                              key: `project-${index}`,
                              scope: 'bullets',
                              context: `${item.name || 'Project'} for ${item.client || item.company || 'client'}`,
                              value: item.bullets,
                              updater: (next) => updateArrayField('projects', index, 'bullets', next),
                            })}
                            disabled={rewriteKey === `project-${index}`}
                          >
                            {rewriteKey === `project-${index}` ? 'Rewriting...' : 'Rewrite bullets'}
                          </button>
                          <button type="button" className="upload-link-btn" onClick={() => removeArrayItem('projects', index)}>
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="upload-form-grid upload-form-grid--2col">
                        <InputField label="Project name" value={item.name} onChange={(e) => updateArrayField('projects', index, 'name', e.target.value)} placeholder="Supplier onboarding transformation" />
                        <InputField label="Company" value={item.company} onChange={(e) => updateArrayField('projects', index, 'company', e.target.value)} placeholder="BrightPath Labs" />
                        <InputField label="Client" value={item.client} onChange={(e) => updateArrayField('projects', index, 'client', e.target.value)} placeholder="Apex Health Systems" />
                        <InputField label="Start date" value={item.startDate} onChange={(e) => updateArrayField('projects', index, 'startDate', e.target.value)} placeholder="Apr 2024" />
                        <InputField label="End date" value={item.endDate} onChange={(e) => updateArrayField('projects', index, 'endDate', e.target.value)} placeholder="Present" />
                      </div>
                      <TextareaField label="Overview paragraph" value={item.overview} onChange={(e) => updateArrayField('projects', index, 'overview', e.target.value)} placeholder="Summarize the engagement, scope, ownership, and outcome in one strong paragraph." rows={4} />
                      <div className="upload-form-grid upload-form-grid--2col">
                        <InputField label="Client list heading" value={item.clientsLabel} onChange={(e) => updateArrayField('projects', index, 'clientsLabel', e.target.value)} placeholder="Clients" />
                        <div />
                        <TextareaField label="Client / stakeholder list" value={item.clients} onChange={(e) => updateArrayField('projects', index, 'clients', e.target.value)} placeholder={'The Coca-Cola Company (TCCC)\nCarrier Corporation (CARR)\nWTW'} rows={4} />
                      </div>
                      <TextareaField label="Detail intro" value={item.detailIntro} onChange={(e) => updateArrayField('projects', index, 'detailIntro', e.target.value)} placeholder="Use this for a sentence like: My responsibilities included configuring the following modules from scratch." rows={3} />
                      <div className="upload-nested-composer">
                        <SectionHeader
                          title="Labeled detail lines"
                          copy="Build the richer 'Label: description' rows shown in your reference example."
                          actions={[{ label: 'Add detail line', onClick: () => addNestedArrayItem('projects', index, 'detailItems', emptyProjectDetail) }]}
                        />
                        <div className="upload-repeat-stack">
                          {(item.detailItems || []).map((detail, detailIndex) => (
                            <div className="upload-repeat-card upload-repeat-card--nested" key={`project-${index}-detail-${detailIndex}`}>
                              <div className="upload-repeat-head">
                                <strong>{detail.label || `Detail ${detailIndex + 1}`}</strong>
                                <button type="button" className="upload-link-btn" onClick={() => removeNestedArrayItem('projects', index, 'detailItems', detailIndex)}>
                                  Remove
                                </button>
                              </div>
                              <div className="upload-form-grid">
                                <InputField label="Label" value={detail.label} onChange={(e) => updateNestedArrayField('projects', index, 'detailItems', detailIndex, 'label', e.target.value)} placeholder="Rate Management" />
                                <TextareaField label="Description" value={detail.details} onChange={(e) => updateNestedArrayField('projects', index, 'detailItems', detailIndex, 'details', e.target.value)} placeholder="Modules related to rate setup, rules, approvals, and financial configurations." rows={3} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="upload-form-grid upload-form-grid--2col">
                        <InputField label="Extra notes heading" value={item.bulletSectionTitle} onChange={(e) => updateArrayField('projects', index, 'bulletSectionTitle', e.target.value)} placeholder="Client Support & Operations" />
                        <TextareaField label="Supporting bullet points" value={item.bullets} onChange={(e) => updateArrayField('projects', index, 'bullets', e.target.value)} placeholder={'Built intake workflow for supplier onboarding\nReduced manual handoffs by 40%\nImproved reporting visibility for leadership'} rows={4} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {currentStepMeta.id === 'awards' && (
              <section className="upload-form-section upload-guided-section">
                <SectionHeader
                  title="Awards & achievements"
                  copy="Recognition is optional, but it adds trust and gives the generated resume stronger proof points."
                  actions={[{ label: 'Add award', onClick: () => addArrayItem('awards', emptyAward) }]}
                />
                <div className="upload-repeat-stack">
                  {form.awards.map((item, index) => (
                    <div className="upload-repeat-card" key={`award-${index}`}>
                      <div className="upload-repeat-head">
                        <strong>{item.title || `Award ${index + 1}`}</strong>
                        <div className="upload-repeat-head-actions">
                          <button
                            type="button"
                            className="upload-mini-action"
                            onClick={() => rewriteField({
                              key: `award-${index}`,
                              scope: 'section',
                              context: `${item.title || 'Award'} details`,
                              value: item.details,
                              updater: (next) => updateArrayField('awards', index, 'details', next),
                            })}
                            disabled={rewriteKey === `award-${index}`}
                          >
                            {rewriteKey === `award-${index}` ? 'Rewriting...' : 'Rewrite details'}
                          </button>
                          <button type="button" className="upload-link-btn" onClick={() => removeArrayItem('awards', index)}>
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="upload-form-grid upload-form-grid--2col">
                        <InputField label="Award / recognition" value={item.title} onChange={(e) => updateArrayField('awards', index, 'title', e.target.value)} placeholder="Shining Star Award" />
                        <InputField label="Issuer" value={item.issuer} onChange={(e) => updateArrayField('awards', index, 'issuer', e.target.value)} placeholder="Global Tech Summit" />
                        <InputField label="Date" value={item.date} onChange={(e) => updateArrayField('awards', index, 'date', e.target.value)} placeholder="2024" />
                        <TextareaField label="Details" value={item.details} onChange={(e) => updateArrayField('awards', index, 'details', e.target.value)} placeholder={'Recognized for leading...\nImproved...\nDelivered...'} rows={4} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {currentStepMeta.id === 'skills' && (
              <section className="upload-form-section upload-guided-section">
                <SectionHeader title="Skills" copy="List the capabilities, tools, and strengths that should surface cleanly in the resume sidebar and ATS scan." />
                <TextareaField label="Core skills" value={form.skills} onChange={(e) => updateForm('skills', e.target.value)} placeholder="SQL, Tableau, Power BI, Alteryx, JIRA" rows={8} />
              </section>
            )}

            {currentStepMeta.id === 'languages' && (
              <section className="upload-form-section upload-guided-section">
                <SectionHeader title="Languages" copy="Add spoken or written languages only if they help this version of the resume. You can skip this entirely." />
                <TextareaField label="Languages" value={form.languages} onChange={(e) => updateForm('languages', e.target.value)} placeholder={'English - Fluent\nSpanish - Conversational\nFrench - Basic'} rows={6} />
              </section>
            )}

            {currentStepMeta.id === 'education' && (
              <section className="upload-form-section upload-guided-section">
                <SectionHeader title="Education" copy="Capture degree, institution, timeline, and location so the first draft feels complete and balanced." actions={[{ label: 'Add education', onClick: () => addArrayItem('education', emptyEducation) }]} />
                <div className="upload-repeat-stack">
                  {form.education.map((item, index) => (
                    <div className="upload-repeat-card" key={`education-${index}`}>
                      <div className="upload-repeat-head">
                        <strong>{item.degree || `Education ${index + 1}`}</strong>
                        <button type="button" className="upload-link-btn" onClick={() => removeArrayItem('education', index)}>
                          Remove
                        </button>
                      </div>
                      <div className="upload-form-grid upload-form-grid--2col">
                        <InputField label="Degree" value={item.degree} onChange={(e) => updateArrayField('education', index, 'degree', e.target.value)} placeholder="B.Tech in Computer Science" />
                        <InputField label="Institution" value={item.school} onChange={(e) => updateArrayField('education', index, 'school', e.target.value)} placeholder="Westlake University" />
                        <InputField label="Dates" value={item.period} onChange={(e) => updateArrayField('education', index, 'period', e.target.value)} placeholder="2012 - 2016" />
                        <InputField label="Location" value={item.location} onChange={(e) => updateArrayField('education', index, 'location', e.target.value)} placeholder="Seattle, Washington" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {currentStepMeta.id === 'certifications' && (
              <section className="upload-form-section upload-guided-section">
                <SectionHeader title="Certifications & extras" copy="Use this step for credentials and references that help complete a polished intake." />
                <TextareaField label="Certifications" value={form.certifications} onChange={(e) => updateForm('certifications', e.target.value)} placeholder={'Google Data Analytics\nLean Six Sigma Green Belt'} rows={5} />
                <div className="upload-repeat-stack upload-guided-stack-spaced">
                  <SectionHeader title="References" copy="Useful for premium executive, consulting, and designer-style resumes." actions={[{ label: 'Add reference', onClick: () => addArrayItem('references', emptyReference) }]} />
                  {form.references.map((item, index) => (
                    <div className="upload-repeat-card" key={`reference-${index}`}>
                      <div className="upload-repeat-head">
                        <strong>{item.name || `Reference ${index + 1}`}</strong>
                        <button type="button" className="upload-link-btn" onClick={() => removeArrayItem('references', index)}>
                          Remove
                        </button>
                      </div>
                      <div className="upload-form-grid">
                        <InputField label="Name" value={item.name} onChange={(e) => updateArrayField('references', index, 'name', e.target.value)} placeholder="Maya Patel" />
                        <InputField label="Role" value={item.role} onChange={(e) => updateArrayField('references', index, 'role', e.target.value)} placeholder="CEO" />
                        <InputField label="Company" value={item.company} onChange={(e) => updateArrayField('references', index, 'company', e.target.value)} placeholder="Northshore Analytics" />
                        <InputField label="Contact" value={item.contact} onChange={(e) => updateArrayField('references', index, 'contact', e.target.value)} placeholder="harumi@company.com" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {currentStepMeta.id === 'custom' && (
              <section className="upload-form-section upload-guided-section">
                <SectionHeader title="Custom sections" copy="Add any section you want: tools, software, volunteering, publications, interests, training, or something completely custom." />
                <div className="upload-guided-custom-builder">
                  <div className="upload-form-grid upload-form-grid--2col">
                    <InputField label="Section title" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Tools & Software" />
                    <SelectField
                      label="Placement"
                      value={customPlacement}
                      onChange={(e) => setCustomPlacement(e.target.value)}
                      options={[
                        { value: 'side', label: 'Sidebar / compact section' },
                        { value: 'main', label: 'Main column / wider section' },
                      ]}
                    />
                  </div>
                  <div className="upload-guided-toolbar">
                    <button type="button" className="upload-mini-action" onClick={() => handleCreateCustomSection(false)} disabled={!customTitle.trim()}>
                      Add blank section
                    </button>
                    <button type="button" className="upload-mini-action upload-mini-action--primary" onClick={() => handleCreateCustomSection(true)} disabled={!customTitle.trim() || rewriteKey === 'custom-section-builder'}>
                      {rewriteKey === 'custom-section-builder' ? 'Building...' : 'AI build starter'}
                    </button>
                  </div>
                </div>

                <div className="upload-repeat-stack">
                  {form.customSections.filter(isCustomSectionFilled).length === 0 ? (
                    <div className="upload-guided-empty">
                      Add only the extras that matter for this resume. This step is optional, and you can skip it if everything important already fits elsewhere.
                    </div>
                  ) : (
                    form.customSections.map((item, index) => (
                      <div className="upload-repeat-card" key={`custom-section-${index}`}>
                        <div className="upload-repeat-head">
                          <strong>{item.title || `Custom section ${index + 1}`}</strong>
                          <div className="upload-repeat-head-actions">
                            <button type="button" className="upload-mini-action" onClick={() => aiFillCustomSection(index)} disabled={!item.title.trim() || rewriteKey === `custom-section-${index}`}>
                              {rewriteKey === `custom-section-${index}` ? 'Building...' : 'AI build section'}
                            </button>
                            <button type="button" className="upload-link-btn" onClick={() => removeArrayItem('customSections', index)}>
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="upload-form-grid upload-form-grid--2col">
                          <InputField label="Section title" value={item.title} onChange={(e) => updateArrayField('customSections', index, 'title', e.target.value)} placeholder="Tools & Software" />
                          <SelectField
                            label="Placement"
                            value={item.placement}
                            onChange={(e) => updateArrayField('customSections', index, 'placement', e.target.value)}
                            options={[
                              { value: 'side', label: 'Sidebar / compact section' },
                              { value: 'main', label: 'Main column / wider section' },
                            ]}
                          />
                        </div>
                        <TextareaField label="Section entries" value={item.content} onChange={(e) => updateArrayField('customSections', index, 'content', e.target.value)} placeholder={'Primary tool or software\nSecondary platform\nSupporting system or capability'} rows={5} />
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

            {currentStepMeta.id === 'review' && (
              <section className="upload-form-section upload-guided-section">
                <SectionHeader
                  title="Review before generating"
                  copy="This final pass helps you catch thin sections and see whether the draft feels complete."
                  actions={[
                    {
                      label: rewriteKey === 'whole-form' ? 'Polishing...' : 'AI polish full draft',
                      onClick: handleRewriteWholeForm,
                      disabled: rewriteKey === 'whole-form',
                      primary: true,
                    },
                  ]}
                />
                <div className="upload-review-grid upload-guided-review-grid">
                  <div className="upload-review-card">
                    <strong>{form.name || 'Name missing'}</strong>
                    <span>{form.title || 'Professional title missing'}</span>
                    <p>{[form.email, form.phone, form.location].filter(Boolean).join(' | ') || 'Contact details still need attention'}</p>
                  </div>
                  <div className="upload-review-card">
                    <strong>{form.experience.filter((item) => item.role || item.company).length} role(s)</strong>
                    <span>{form.projects.filter((item) => item.name || item.company).length} project(s)</span>
                    <p>{form.awards.filter((item) => item.title || item.issuer).length} award(s)</p>
                  </div>
                  <div className="upload-review-card">
                    <strong>{form.education.filter((item) => item.degree || item.school).length} education entry(s)</strong>
                    <span>{form.references.filter((item) => item.name || item.contact).length} reference(s)</span>
                    <p>{splitListValues(form.skills).length} listed skill(s)</p>
                  </div>
                  <div className="upload-review-card">
                    <strong>{splitMultiline(form.certifications).length} credential(s)</strong>
                    <span>{splitListValues(form.languages).length} language entry(s)</span>
                    <p>{form.customSections.filter(isCustomSectionFilled).length} custom section(s)</p>
                  </div>
                </div>
                <div className="upload-guided-review-panels">
                  <div className="upload-guided-review-panel">
                    <span>Profile Summary</span>
                    <p>{form.summary || 'Add a concise summary to sharpen the first impression.'}</p>
                  </div>
                  <div className="upload-guided-review-panel">
                    <span>Skills Snapshot</span>
                    <p>{splitListValues(form.skills).slice(0, 10).join(' • ') || 'Add your strongest tools and capabilities.'}</p>
                  </div>
                  <div className="upload-guided-review-panel">
                    <span>Custom Sections</span>
                    <p>{form.customSections.filter(isCustomSectionFilled).map((item) => item.title.trim()).join(' • ') || 'No extra sections added, which is completely fine for a tighter resume.'}</p>
                  </div>
                </div>
                <div className="upload-insight-list">
                  {formInsights.length > 0 ? formInsights.map((item) => (
                    <div className="upload-inline-note" key={item}>{item}</div>
                  )) : (
                    <div className="upload-inline-note"><strong>Strong start:</strong> the draft has enough structure to generate a polished first version.</div>
                  )}
                </div>
              </section>
            )}

            <div className="upload-form-actions upload-guided-actions">
              <button type="button" className="upload-secondary-btn" onClick={prevFormStep} disabled={formStep === 0}>
                Back
              </button>
              <div className="upload-guided-action-group">
                {canSkip && (
                  <button type="button" className="upload-guided-skip" onClick={nextFormStep}>
                    Skip this section
                  </button>
                )}
                {!isLastStep ? (
                  <button type="button" className="upload-primary-btn" onClick={nextFormStep}>
                    Continue to {formSteps[formStep + 1].label}
                  </button>
                ) : (
                  <button type="button" className="upload-primary-btn" onClick={handleFormSubmit} disabled={!formReady}>
                    Build resume from guided form
                  </button>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
