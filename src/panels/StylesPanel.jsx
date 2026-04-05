const STYLE_OPTIONS = [
  { key: 'skills-simple-list', category: 'Skills', title: 'Skills Simple List', description: 'Clean stacked skill lines for minimal resumes.', value: 'simple-list', onSelectKey: 'setSkillStyle', selectedKey: 'skillStyle', preview: 'list' },
  { key: 'skills-bullet-list', category: 'Skills', title: 'Skills Bullet List', description: 'ATS-friendly bullets with straightforward scanning.', value: 'bullet-list', onSelectKey: 'setSkillStyle', selectedKey: 'skillStyle', preview: 'bullets' },
  { key: 'skills-pill-outline', category: 'Skills', title: 'Skills Pill Outline', description: 'Light pill tags for modern visual grouping.', value: 'pill-outline', onSelectKey: 'setSkillStyle', selectedKey: 'skillStyle', preview: 'pills-outline' },
  { key: 'skills-pill-filled', category: 'Skills', title: 'Skills Pill Filled', description: 'Bold filled chips for emphasis and hierarchy.', value: 'pill-filled', onSelectKey: 'setSkillStyle', selectedKey: 'skillStyle', preview: 'pills-filled' },
  { key: 'skills-compact-grid', category: 'Skills', title: 'Skills Compact Grid', description: 'Dense two-column grid for heavy skill sets.', value: 'compact-grid', onSelectKey: 'setSkillStyle', selectedKey: 'skillStyle', preview: 'grid' },
  { key: 'skills-two-column-list', category: 'Skills', title: 'Skills Two Column', description: 'Balanced two-column listing with clean spacing.', value: 'two-column-list', onSelectKey: 'setSkillStyle', selectedKey: 'skillStyle', preview: 'two-col' },
  { key: 'contact-simple-lines', category: 'Contact', title: 'Contact Simple', description: 'Minimal stacked details for understated headers.', value: 'simple-lines', onSelectKey: 'setContactStyle', selectedKey: 'contactStyle', preview: 'contact-simple' },
  { key: 'contact-inline-compact', category: 'Contact', title: 'Contact Inline Compact', description: 'Single-line compact contact row for modern layouts.', value: 'inline-compact', onSelectKey: 'setContactStyle', selectedKey: 'contactStyle', preview: 'contact-inline' },
  { key: 'contact-icon-list', category: 'Contact', title: 'Contact Icon List', description: 'Icon-led contact pattern for premium templates.', value: 'icon-list', onSelectKey: 'setContactStyle', selectedKey: 'contactStyle', preview: 'contact-icons' },
  { key: 'education-simple-list', category: 'Education', title: 'Education Simple List', description: 'Straightforward academic listing with classic flow.', value: 'simple-list', onSelectKey: 'setEducationStyle', selectedKey: 'educationStyle', preview: 'education-simple' },
  { key: 'education-stacked-cards', category: 'Education', title: 'Education Stacked Cards', description: 'Boxed academic entries with a polished editorial feel.', value: 'stacked-cards', onSelectKey: 'setEducationStyle', selectedKey: 'educationStyle', preview: 'education-cards' },
  { key: 'education-timeline', category: 'Education', title: 'Education Timeline', description: 'Chronology-first layout for academic progression.', value: 'timeline', onSelectKey: 'setEducationStyle', selectedKey: 'educationStyle', preview: 'education-timeline' },
  { key: 'education-compact-block', category: 'Education', title: 'Education Compact Block', description: 'Tighter education rows for space-conscious resumes.', value: 'compact-block', onSelectKey: 'setEducationStyle', selectedKey: 'educationStyle', preview: 'education-compact' },
  { key: 'certification-simple-list', category: 'Certification', title: 'Certification Bullet List', description: 'Classic bullet list for licenses and credentials.', value: 'simple-list', onSelectKey: 'setCertificationStyle', selectedKey: 'certificationStyle', preview: 'cert-bullets' },
  { key: 'certification-check-list', category: 'Certification', title: 'Certification Checkmarks', description: 'Confidence-led checklist style for certifications.', value: 'check-list', onSelectKey: 'setCertificationStyle', selectedKey: 'certificationStyle', preview: 'cert-checks' },
];

function Preview({ kind }) {
  switch (kind) {
    case 'bullets':
      return (
        <svg width="72" height="40" viewBox="0 0 72 40" fill="none">
          <circle cx="8" cy="9" r="2" fill="currentColor" opacity=".72" />
          <rect x="14" y="7.5" width="42" height="3" rx="1.5" fill="currentColor" opacity=".45" />
          <circle cx="8" cy="20" r="2" fill="currentColor" opacity=".6" />
          <rect x="14" y="18.5" width="34" height="3" rx="1.5" fill="currentColor" opacity=".36" />
          <circle cx="8" cy="31" r="2" fill="currentColor" opacity=".48" />
          <rect x="14" y="29.5" width="46" height="3" rx="1.5" fill="currentColor" opacity=".28" />
        </svg>
      );
    case 'pills-outline':
      return (
        <svg width="72" height="40" viewBox="0 0 72 40" fill="none">
          <rect x="4" y="6" width="24" height="10" rx="5" stroke="currentColor" opacity=".68" />
          <rect x="32" y="6" width="30" height="10" rx="5" stroke="currentColor" opacity=".5" />
          <rect x="4" y="23" width="28" height="10" rx="5" stroke="currentColor" opacity=".42" />
          <rect x="36" y="23" width="18" height="10" rx="5" stroke="currentColor" opacity=".32" />
        </svg>
      );
    case 'pills-filled':
      return (
        <svg width="72" height="40" viewBox="0 0 72 40" fill="none">
          <rect x="4" y="6" width="24" height="10" rx="5" fill="currentColor" opacity=".62" />
          <rect x="32" y="6" width="30" height="10" rx="5" fill="currentColor" opacity=".46" />
          <rect x="4" y="23" width="28" height="10" rx="5" fill="currentColor" opacity=".34" />
          <rect x="36" y="23" width="18" height="10" rx="5" fill="currentColor" opacity=".24" />
        </svg>
      );
    case 'grid':
      return (
        <svg width="72" height="40" viewBox="0 0 72 40" fill="none">
          <circle cx="7" cy="9" r="1.8" fill="currentColor" opacity=".7" />
          <rect x="12" y="7.5" width="18" height="3" rx="1.5" fill="currentColor" opacity=".48" />
          <circle cx="39" cy="9" r="1.8" fill="currentColor" opacity=".7" />
          <rect x="44" y="7.5" width="19" height="3" rx="1.5" fill="currentColor" opacity=".48" />
          <circle cx="7" cy="20" r="1.8" fill="currentColor" opacity=".5" />
          <rect x="12" y="18.5" width="16" height="3" rx="1.5" fill="currentColor" opacity=".36" />
          <circle cx="39" cy="20" r="1.8" fill="currentColor" opacity=".5" />
          <rect x="44" y="18.5" width="22" height="3" rx="1.5" fill="currentColor" opacity=".36" />
          <circle cx="7" cy="31" r="1.8" fill="currentColor" opacity=".35" />
          <rect x="12" y="29.5" width="14" height="3" rx="1.5" fill="currentColor" opacity=".24" />
        </svg>
      );
    case 'two-col':
      return (
        <svg width="72" height="40" viewBox="0 0 72 40" fill="none">
          <rect x="4" y="7.5" width="22" height="3" rx="1.5" fill="currentColor" opacity=".56" />
          <rect x="40" y="7.5" width="20" height="3" rx="1.5" fill="currentColor" opacity=".56" />
          <rect x="4" y="18.5" width="18" height="3" rx="1.5" fill="currentColor" opacity=".38" />
          <rect x="40" y="18.5" width="24" height="3" rx="1.5" fill="currentColor" opacity=".38" />
          <rect x="4" y="29.5" width="20" height="3" rx="1.5" fill="currentColor" opacity=".24" />
        </svg>
      );
    case 'contact-inline':
      return (
        <svg width="72" height="40" viewBox="0 0 72 40" fill="none">
          <rect x="4" y="18.5" width="16" height="3" rx="1.5" fill="currentColor" opacity=".58" />
          <line x1="26" y1="15" x2="26" y2="25" stroke="currentColor" opacity=".24" />
          <rect x="31" y="18.5" width="14" height="3" rx="1.5" fill="currentColor" opacity=".44" />
          <line x1="50" y1="15" x2="50" y2="25" stroke="currentColor" opacity=".2" />
          <rect x="55" y="18.5" width="11" height="3" rx="1.5" fill="currentColor" opacity=".32" />
        </svg>
      );
    case 'contact-icons':
      return (
        <svg width="72" height="40" viewBox="0 0 72 40" fill="none">
          <circle cx="8" cy="9" r="3" stroke="currentColor" opacity=".64" />
          <rect x="16" y="7.5" width="34" height="3" rx="1.5" fill="currentColor" opacity=".42" />
          <rect x="5" y="17" width="6" height="6" rx="1.8" fill="currentColor" opacity=".46" />
          <rect x="16" y="18.5" width="26" height="3" rx="1.5" fill="currentColor" opacity=".32" />
          <path d="M5 31h6" stroke="currentColor" strokeWidth="2" opacity=".4" />
          <rect x="16" y="29.5" width="30" height="3" rx="1.5" fill="currentColor" opacity=".24" />
        </svg>
      );
    case 'education-cards':
      return (
        <svg width="72" height="40" viewBox="0 0 72 40" fill="none">
          <rect x="3.5" y="4.5" width="65" height="12" rx="5" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeOpacity=".24" />
          <rect x="10" y="8.5" width="28" height="3" rx="1.5" fill="currentColor" opacity=".5" />
          <rect x="10" y="22.5" width="24" height="3" rx="1.5" fill="currentColor" opacity=".38" />
          <rect x="3.5" y="18.5" width="65" height="12" rx="5" fill="currentColor" fillOpacity=".08" stroke="currentColor" strokeOpacity=".18" />
        </svg>
      );
    case 'education-timeline':
      return (
        <svg width="72" height="40" viewBox="0 0 72 40" fill="none">
          <circle cx="8" cy="10" r="3" fill="currentColor" opacity=".58" />
          <line x1="8" y1="13" x2="8" y2="28" stroke="currentColor" opacity=".24" />
          <rect x="16" y="8.5" width="28" height="3" rx="1.5" fill="currentColor" opacity=".46" />
          <circle cx="8" cy="30" r="3" fill="currentColor" opacity=".38" />
          <rect x="16" y="28.5" width="24" height="3" rx="1.5" fill="currentColor" opacity=".3" />
        </svg>
      );
    case 'education-compact':
      return (
        <svg width="72" height="40" viewBox="0 0 72 40" fill="none">
          <rect x="4" y="8.5" width="28" height="3" rx="1.5" fill="currentColor" opacity=".56" />
          <rect x="48" y="8.5" width="14" height="3" rx="1.5" fill="currentColor" opacity=".24" />
          <rect x="4" y="18.5" width="22" height="3" rx="1.5" fill="currentColor" opacity=".4" />
          <rect x="4" y="28.5" width="25" height="3" rx="1.5" fill="currentColor" opacity=".28" />
          <rect x="48" y="28.5" width="14" height="3" rx="1.5" fill="currentColor" opacity=".18" />
        </svg>
      );
    case 'cert-checks':
      return (
        <svg width="72" height="40" viewBox="0 0 72 40" fill="none">
          <path d="M4 9l2 2 4-4" stroke="currentColor" strokeWidth="1.7" opacity=".64" />
          <rect x="14" y="7.5" width="34" height="3" rx="1.5" fill="currentColor" opacity=".42" />
          <path d="M4 20l2 2 4-4" stroke="currentColor" strokeWidth="1.7" opacity=".48" />
          <rect x="14" y="18.5" width="28" height="3" rx="1.5" fill="currentColor" opacity=".32" />
          <path d="M4 31l2 2 4-4" stroke="currentColor" strokeWidth="1.7" opacity=".34" />
          <rect x="14" y="29.5" width="32" height="3" rx="1.5" fill="currentColor" opacity=".22" />
        </svg>
      );
    case 'cert-bullets':
    case 'contact-simple':
    case 'education-simple':
    case 'list':
    default:
      return (
        <svg width="72" height="40" viewBox="0 0 72 40" fill="none">
          <rect x="4" y="7.5" width="34" height="3" rx="1.5" fill="currentColor" opacity=".56" />
          <rect x="4" y="18.5" width="28" height="3" rx="1.5" fill="currentColor" opacity=".38" />
          <rect x="4" y="29.5" width="40" height="3" rx="1.5" fill="currentColor" opacity=".24" />
        </svg>
      );
  }
}

export default function StylesPanel({
  skillStyle,
  setSkillStyle,
  contactStyle,
  setContactStyle,
  educationStyle,
  setEducationStyle,
  certificationStyle,
  setCertificationStyle,
}) {
  const handlers = {
    setSkillStyle,
    setContactStyle,
    setEducationStyle,
    setCertificationStyle,
  };

  const selected = {
    skillStyle,
    contactStyle,
    educationStyle,
    certificationStyle,
  };

  return (
    <div className="styles-unified-grid">
      {STYLE_OPTIONS.map((option) => {
        const active = selected[option.selectedKey] === option.value;
        return (
          <button
            key={option.key}
            type="button"
            className={`styles-unified-card${active ? ' styles-unified-card--active' : ''}`}
            onClick={() => handlers[option.onSelectKey]?.(option.value)}
          >
            <div className="styles-unified-card__meta">
              <span className="styles-unified-card__category">{option.category}</span>
              {active && <span className="styles-unified-card__badge">Active</span>}
            </div>
            <div className="styles-unified-card__preview">
              <Preview kind={option.preview} />
            </div>
            <div className="styles-unified-card__copy">
              <strong>{option.title}</strong>
              <p>{option.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
