import { useEffect, useMemo, useRef, useState } from 'react';
import { extractText } from '../utils/extractText';
import { rewriteTextWithAI } from '../utils/rewriteWithAI';
import GuidedFormFlow from '../components/GuidedFormFlow';
import { getRewriteModeDescription, getRewriteModeLabel } from '../utils/aiConfig';
import { getStorageJSON, removeStorageValue, setStorageJSON } from '../utils/storage';

const FORM_STORAGE_KEY = 'resumeBuilder_guidedFormDraft';

const EMPTY_EXPERIENCE = {
  role: '',
  company: '',
  period: '',
  location: '',
  client: '',
  bullets: '',
  sections: [],
};

const EMPTY_EXPERIENCE_SECTION = {
  heading: '',
  bullets: '',
};

const EMPTY_EDUCATION = {
  degree: '',
  school: '',
  period: '',
  location: '',
};

const EMPTY_PROJECT = {
  name: '',
  company: '',
  client: '',
  startDate: '',
  endDate: '',
  overview: '',
  clientsLabel: 'Clients',
  clients: '',
  detailIntro: '',
  detailItems: [],
  bulletSectionTitle: '',
  bullets: '',
};

const EMPTY_PROJECT_DETAIL = {
  label: '',
  details: '',
};

const EMPTY_AWARD = {
  title: '',
  issuer: '',
  date: '',
  details: '',
};

const EMPTY_REFERENCE = {
  name: '',
  role: '',
  company: '',
  contact: '',
};

const EMPTY_CUSTOM_SECTION = {
  title: '',
  placement: 'side',
  content: '',
};

const SAMPLE_FORM = {
  name: 'Adeline Palmerston',
  title: 'Senior Brand Designer',
  email: 'adeline@reallygreatsite.com',
  phone: '+1 234 567 890',
  location: 'San Francisco, CA',
  website: 'linkedin.com/in/adelinepalmerston',
  summary:
    'Brand designer with 8+ years of experience shaping visual systems, campaign storytelling, and digital-first experiences for growth-stage and enterprise teams. Known for turning strategic direction into polished, conversion-focused design that feels elevated and clear.',
  skills: 'Brand identity, Art direction, Visual systems, Figma, Adobe Creative Suite, UI design, Presentation design, Design systems, Team collaboration, Creative strategy',
  strengths: 'Creative direction\nCross-functional collaboration\nPresentation storytelling\nDesign systems thinking',
  certifications: 'Adobe Certified Professional\nGoogle UX Design Certificate\nBrand Storytelling Workshop',
  languages: 'English - Fluent\nSpanish - Conversational',
  experience: [
    {
      role: 'Senior Brand Designer',
      company: 'Northstar Studio',
      period: '2022 - Present',
      location: 'Remote',
      client: 'Enterprise SaaS portfolio',
      bullets: '',
      sections: [
        {
          heading: 'Brand System Modernization',
          bullets: 'Built premium visual systems and seasonal campaigns for executive and growth teams\nTranslated messaging strategy into polished landing page visuals and sales assets',
        },
        {
          heading: 'Executive Launch Support',
          bullets: 'Created reusable templates that improved design consistency across launches\nPartnered with leadership to align premium customer-facing visuals with campaign strategy',
        },
      ],
    },
    {
      role: 'Visual Designer',
      company: 'Atelier Works',
      period: '2020 - 2022',
      location: 'New York, NY',
      client: 'Consumer lifestyle brands',
      bullets: 'Designed product visuals, social media kits, and editorial layouts across client accounts\nPartnered with marketers to refine positioning and campaign creative\nHelped scale the internal design library for faster content production',
      sections: [],
    },
  ],
  projects: [
    {
      name: 'Global Brand Refresh',
      company: 'Northstar Studio',
      client: 'B2B SaaS Platform',
      startDate: 'Jan 2023',
      endDate: 'Oct 2023',
      overview: 'Led the rollout of a refreshed visual identity across web, events, and sales collateral for a global B2B SaaS launch.',
      clientsLabel: 'Stakeholders',
      clients: 'Revenue leadership\nProduct marketing\nRegional sales teams\nCustomer success directors',
      detailIntro: 'The engagement covered brand system rollout, launch storytelling, and reusable sales enablement assets.',
      detailItems: [
        {
          label: 'Identity system',
          details: 'Built reusable visual foundations for campaign, web, and presentation touchpoints.',
        },
        {
          label: 'Sales enablement',
          details: 'Created proposal and deck systems used by regional sales leaders across launch moments.',
        },
      ],
      bulletSectionTitle: 'Impact',
      bullets: 'Improved consistency across launch assets and reduced custom design requests.\nHelped leadership teams present a more premium and unified story.',
    },
  ],
  education: [
    {
      degree: 'B.Des. Visual Communication',
      school: 'Parsons School of Design',
      period: '2012 - 2016',
      location: 'New York, NY',
    },
  ],
  awards: [
    {
      title: 'Creative Excellence Award',
      issuer: 'Northstar Studio',
      date: '2024',
      details: 'Recognized for leading premium launch visuals for a flagship product campaign.',
    },
  ],
  references: [
    {
      name: 'Rachel Moreno',
      role: 'Creative Director',
      company: 'Northstar Studio',
      contact: 'rachel.moreno@northstar.com',
    },
  ],
  customSections: [
    {
      title: 'Tools & Software',
      placement: 'side',
      content: 'Figma\nAdobe Creative Suite\nNotion\nMiro',
    },
  ],
};

const FORM_STEPS = [
  { id: 'identity', label: 'Identity', blurb: 'Name, role, and top-line positioning for the resume header.' },
  { id: 'contact', label: 'Contact', blurb: 'Essential contact details, location, and public links.' },
  { id: 'profile', label: 'Profile', blurb: 'Summary, strengths, and personal positioning details.' },
  { id: 'experience', label: 'Experience', blurb: 'Work history, grouped workstreams, and impact bullets.' },
  { id: 'projects', label: 'Projects', blurb: 'Project highlights, structured detail lines, and implementation evidence.' },
  { id: 'awards', label: 'Awards', blurb: 'Recognition, achievements, and proof points that strengthen credibility.' },
  { id: 'skills', label: 'Skills', blurb: 'Core capabilities recruiters and ATS systems should notice quickly.' },
  { id: 'languages', label: 'Languages', blurb: 'Language fluency and communication range for global or client-facing roles.' },
  { id: 'education', label: 'Education', blurb: 'Academic history and foundational training.' },
  { id: 'certifications', label: 'Certifications', blurb: 'Credentials, references, and extra supporting details.' },
  { id: 'custom', label: 'Custom Sections', blurb: 'Tools, software, interests, volunteering, publications, or any section you want to add.' },
  { id: 'review', label: 'Review', blurb: 'A polished final check before generating the editable resume.' },
];

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

function inferCustomSectionPlacement(title = '') {
  const normalized = String(title || '').trim().toLowerCase();
  if (!normalized) return 'side';
  if (/(award|achievement|project|publication|volunteer|leadership|case study|training|conference)/.test(normalized)) {
    return 'main';
  }
  return 'side';
}

function buildCustomSectionSeed(title = '') {
  const normalized = String(title || '').trim().toLowerCase();
  if (!normalized) return 'Add section title first';
  if (/(tool|software|platform|stack|tech)/.test(normalized)) {
    return 'Primary platform or tool\nSecondary tool or suite\nCollaboration workspace\nReporting or analytics tool\nAutomation or workflow tool';
  }
  if (/(language)/.test(normalized)) {
    return 'English - Fluent\nSpanish - Conversational\nFrench - Basic';
  }
  if (/(award|achievement|honor|recognition)/.test(normalized)) {
    return 'Award name | Issuer | Year\nAchievement highlight with measurable impact';
  }
  if (/(publication|writing|research)/.test(normalized)) {
    return 'Publication or paper title\nPublisher, journal, or platform\nTopic or contribution summary';
  }
  if (/(volunteer|community)/.test(normalized)) {
    return 'Organization name\nRole or contribution\nImpact or initiative supported';
  }
  return `Top entry for ${title}\nSecond supporting entry\nThird supporting entry\nOptional measurable outcome`;
}

function normalizeFormDraft(rawForm = {}) {
  const projects = Array.isArray(rawForm.projects)
    ? rawForm.projects.map((item) => ({
        ...EMPTY_PROJECT,
        ...item,
        detailItems: Array.isArray(item?.detailItems)
          ? item.detailItems.map((detail) => ({ ...EMPTY_PROJECT_DETAIL, ...detail }))
          : [],
      }))
    : String(rawForm.projects || '').trim()
      ? [{ ...EMPTY_PROJECT, name: 'Highlighted Project', bullets: String(rawForm.projects || '') }]
      : [{ ...EMPTY_PROJECT }];

  return {
    name: rawForm.name || '',
    title: rawForm.title || '',
    email: rawForm.email || '',
    phone: rawForm.phone || '',
    location: rawForm.location || '',
    website: rawForm.website || '',
    summary: rawForm.summary || '',
    skills: rawForm.skills || '',
    strengths: rawForm.strengths || '',
    certifications: rawForm.certifications || '',
    languages: rawForm.languages || '',
    experience: Array.isArray(rawForm.experience) && rawForm.experience.length
      ? rawForm.experience.map((item) => ({
          ...EMPTY_EXPERIENCE,
          ...item,
          sections: Array.isArray(item?.sections)
            ? item.sections.map((section) => ({ ...EMPTY_EXPERIENCE_SECTION, ...section }))
            : [],
        }))
      : [{ ...EMPTY_EXPERIENCE }],
    projects,
    education: Array.isArray(rawForm.education) && rawForm.education.length
      ? rawForm.education.map((item) => ({ ...EMPTY_EDUCATION, ...item }))
      : [{ ...EMPTY_EDUCATION }],
    awards: Array.isArray(rawForm.awards) && rawForm.awards.length
      ? rawForm.awards.map((item) => ({ ...EMPTY_AWARD, ...item }))
      : [{ ...EMPTY_AWARD }],
    references: Array.isArray(rawForm.references) && rawForm.references.length
      ? rawForm.references.map((item) => ({ ...EMPTY_REFERENCE, ...item }))
      : [{ ...EMPTY_REFERENCE }],
    customSections: Array.isArray(rawForm.customSections) && rawForm.customSections.length
      ? rawForm.customSections.map((item) => ({ ...EMPTY_CUSTOM_SECTION, ...item }))
      : [],
  };
}

function buildResumeTextFromForm(form) {
  const lines = [];
  const nameLine = [form.name, form.title].filter(Boolean).join(' - ');
  const contactLine = [form.email, form.phone, form.location, form.website].filter(Boolean).join(' | ');

  if (nameLine) lines.push(nameLine);
  if (contactLine) lines.push(contactLine);

  if (form.summary.trim()) {
    lines.push('', 'PROFILE SUMMARY', form.summary.trim());
  }

  if (form.strengths.trim()) {
    lines.push('', 'STRENGTHS');
    splitListValues(form.strengths).forEach((item) => lines.push(`- ${item}`));
  }

  if (form.skills.trim()) {
    lines.push('', 'SKILLS');
    splitListValues(form.skills).forEach((skill) => lines.push(`- ${skill}`));
  }

  if (form.languages.trim()) {
    lines.push('', 'LANGUAGES');
    splitListValues(form.languages).forEach((item) => lines.push(`- ${item}`));
  }

  const validExperience = form.experience.filter(
    (item) => item.role.trim() || item.company.trim() || item.client.trim() || item.bullets.trim() || (item.sections || []).some((section) => section.heading.trim() || section.bullets.trim())
  );
  if (validExperience.length) {
    lines.push('', 'EXPERIENCE');
    validExperience.forEach((item) => {
      const heading = [item.role, item.company].filter(Boolean).join(' | ');
      const meta = [item.period, item.location].filter(Boolean).join(' | ');
      if (heading) lines.push(heading);
      if (item.client) lines.push(`Client: ${item.client}`);
      if (meta) lines.push(meta);
      (item.sections || [])
        .filter((section) => section.heading.trim() || section.bullets.trim())
        .forEach((section) => {
          if (section.heading.trim()) lines.push(section.heading.trim());
          splitMultiline(section.bullets).forEach((bullet) => lines.push(`- ${bullet.replace(/^[-•]\s*/, '')}`));
        });
      splitMultiline(item.bullets).forEach((bullet) => lines.push(`- ${bullet.replace(/^[-•]\s*/, '')}`));
      lines.push('');
    });
  }

  const validProjects = (form.projects || []).filter(
    (item) => (
      item.name.trim() ||
      item.company.trim() ||
      item.client.trim() ||
      item.overview.trim() ||
      item.clients.trim() ||
      item.detailIntro.trim() ||
      item.bulletSectionTitle.trim() ||
      item.bullets.trim() ||
      (item.detailItems || []).some((detail) => detail.label.trim() || detail.details.trim())
    )
  );
  if (validProjects.length) {
    lines.push('PROJECTS');
    validProjects.forEach((item) => {
      const heading = [item.name, item.company].filter(Boolean).join(' | ');
      const timeline = [item.startDate, item.endDate].filter(Boolean).join(' - ');
      if (heading) lines.push(heading);
      if (item.client) lines.push(`Client: ${item.client}`);
      if (timeline) lines.push(`Timeline: ${timeline}`);
      if (item.overview.trim()) lines.push(item.overview.trim());
      const clients = splitListValues(item.clients);
      if (clients.length) {
        lines.push(`${item.clientsLabel?.trim() || 'Clients'}:`);
        clients.forEach((clientName) => lines.push(`- ${clientName}`));
      }
      if (item.detailIntro.trim()) lines.push(item.detailIntro.trim());
      (item.detailItems || [])
        .filter((detail) => detail.label.trim() || detail.details.trim())
        .forEach((detail) => {
          const detailLine = [detail.label.trim(), detail.details.trim()].filter(Boolean).join(': ');
          if (detailLine) lines.push(`- ${detailLine}`);
        });
      if (item.bulletSectionTitle.trim()) lines.push(item.bulletSectionTitle.trim());
      splitMultiline(item.bullets).forEach((bullet) => lines.push(`- ${bullet.replace(/^[-•]\s*/, '')}`));
      lines.push('');
    });
  }

  const validEducation = form.education.filter(
    (item) => item.degree.trim() || item.school.trim() || item.period.trim()
  );
  if (validEducation.length) {
    lines.push('EDUCATION');
    validEducation.forEach((item) => {
      const heading = [item.degree, item.school].filter(Boolean).join(' | ');
      const meta = [item.period, item.location].filter(Boolean).join(' | ');
      if (heading) lines.push(heading);
      if (meta) lines.push(meta);
      lines.push('');
    });
  }

  if (form.certifications.trim()) {
    lines.push('CERTIFICATIONS');
    splitMultiline(form.certifications).forEach((item) => lines.push(`- ${item.replace(/^[-•]\s*/, '')}`));
    lines.push('');
  }

  const validAwards = (form.awards || []).filter(
    (item) => item.title.trim() || item.issuer.trim() || item.details.trim()
  );
  if (validAwards.length) {
    lines.push('AWARDS');
    validAwards.forEach((item) => {
      const heading = [item.title, item.issuer].filter(Boolean).join(' | ');
      if (heading) lines.push(heading);
      if (item.date) lines.push(item.date);
      splitMultiline(item.details).forEach((detail) => lines.push(`- ${detail.replace(/^[-•]\s*/, '')}`));
      lines.push('');
    });
  }

  const validReferences = (form.references || []).filter(
    (item) => item.name.trim() || item.role.trim() || item.company.trim() || item.contact.trim()
  );
  if (validReferences.length) {
    lines.push('REFERENCES');
    validReferences.forEach((item) => {
      const heading = [item.name, item.role].filter(Boolean).join(' | ');
      const meta = [item.company, item.contact].filter(Boolean).join(' | ');
      if (heading) lines.push(heading);
      if (meta) lines.push(meta);
      lines.push('');
    });
  }

  const validCustomSections = (form.customSections || []).filter(isCustomSectionFilled);
  validCustomSections.forEach((section) => {
    lines.push('', section.title.trim() || 'CUSTOM SECTION');
    splitListValues(section.content).forEach((item) => lines.push(`- ${item}`));
  });

  return lines.join('\n').trim();
}

function buildStructuredResumeFromForm(form) {
  const validExperience = form.experience
    .filter((item) => item.role.trim() || item.company.trim() || item.client.trim() || item.bullets.trim() || (item.sections || []).some((section) => section.heading.trim() || section.bullets.trim()))
    .map((item) => ({
      role: item.role.trim() || 'Role',
      company: item.company.trim() || 'Company',
      period: item.period.trim() || 'Date',
      client: item.client.trim(),
      location: item.location.trim(),
      bullets: splitMultiline(item.bullets).map((bullet) => bullet.replace(/^[-•]\s*/, '')).filter(Boolean),
      sections: (item.sections || [])
        .filter((section) => section.heading.trim() || section.bullets.trim())
        .map((section) => ({
          heading: section.heading.trim() || 'Subsection',
          bullets: splitMultiline(section.bullets).map((bullet) => bullet.replace(/^[-•]\s*/, '')).filter(Boolean),
        })),
    }));

  const customSections = [];
  const stamp = Date.now();
  const appendCustomSection = (section) => {
    if (!section?.title || !Array.isArray(section.items) || !section.items.length) return;
    const normalizedTitle = section.title.trim().toLowerCase();
    if (customSections.some((item) => item.title.trim().toLowerCase() === normalizedTitle)) return;
    customSections.push(section);
  };
  const strengths = splitListValues(form.strengths);
  if (strengths.length) appendCustomSection({ id: `cs_${stamp}_strengths`, title: 'Strengths', placement: 'side', items: strengths });
  const languages = splitListValues(form.languages);
  if (languages.length) appendCustomSection({ id: `cs_${stamp}_languages`, title: 'Languages', placement: 'side', items: languages });
  const validProjects = (form.projects || [])
    .filter((item) => (
      item.name.trim() ||
      item.company.trim() ||
      item.client.trim() ||
      item.overview.trim() ||
      item.clients.trim() ||
      item.detailIntro.trim() ||
      item.bulletSectionTitle.trim() ||
      item.bullets.trim() ||
      (item.detailItems || []).some((detail) => detail.label.trim() || detail.details.trim())
    ))
    .map((item) => ({
      type: 'project-entry',
      name: item.name.trim() || 'Highlighted Project',
      company: item.company.trim(),
      client: item.client.trim(),
      timeline: [item.startDate.trim(), item.endDate.trim()].filter(Boolean).join(' - '),
      overview: item.overview.trim(),
      clientsLabel: item.clientsLabel.trim() || 'Clients',
      clients: splitListValues(item.clients).join('\n'),
      detailIntro: item.detailIntro.trim(),
      detailItems: (item.detailItems || [])
        .filter((detail) => detail.label.trim() || detail.details.trim())
        .map((detail) => ({
          label: detail.label.trim() || 'Workstream',
          details: detail.details.trim(),
        })),
      bulletSectionTitle: item.bulletSectionTitle.trim(),
      bullets: splitMultiline(item.bullets).map((bullet) => bullet.replace(/^[-•]\s*/, '')).filter(Boolean),
    }));
  if (validProjects.length) {
    appendCustomSection({
      id: `cs_${stamp}_projects`,
      title: 'Projects',
      placement: 'main',
      kind: 'project-list',
      items: validProjects,
    });
  }
  const validAwards = (form.awards || [])
    .filter((item) => item.title.trim() || item.issuer.trim() || item.details.trim())
    .flatMap((item) => {
      const header = [item.title.trim(), item.issuer.trim(), item.date.trim()].filter(Boolean).join(' | ');
      const details = splitMultiline(item.details).map((detail) => detail.replace(/^[-•]\s*/, ''));
      return [header, ...details].filter(Boolean);
    });
  if (validAwards.length) appendCustomSection({ id: `cs_${stamp}_awards`, title: 'Awards', placement: 'main', items: validAwards });
  const validReferences = (form.references || [])
    .filter((item) => item.name.trim() || item.role.trim() || item.company.trim() || item.contact.trim())
    .map((item) => [item.name.trim(), item.role.trim(), item.company.trim(), item.contact.trim()].filter(Boolean).join(' | '));
  if (validReferences.length) appendCustomSection({ id: `cs_${stamp}_references`, title: 'References', placement: 'side', items: validReferences });
  (form.customSections || [])
    .filter(isCustomSectionFilled)
    .forEach((section, index) => {
      appendCustomSection({
        id: `cs_${stamp}_custom_${index}`,
        title: section.title.trim() || `Custom Section ${index + 1}`,
        placement: section.placement === 'main' ? 'main' : 'side',
        items: splitListValues(section.content),
      });
    });

  return {
    name: form.name.trim(),
    title: form.title.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    location: [form.location.trim(), form.website.trim()].filter(Boolean).join(' | '),
    summary: form.summary.trim(),
    experience: validExperience.length
      ? validExperience
      : [{ role: 'Role', company: 'Company', period: 'Date', bullets: ['Achievement'], sections: [] }],
    skills: splitListValues(form.skills),
    education: form.education
      .filter((item) => item.degree.trim() || item.school.trim() || item.period.trim())
      .map((item) => ({
        degree: item.degree.trim() || 'Degree',
        school: item.school.trim() || 'School',
        year: [item.period.trim(), item.location.trim()].filter(Boolean).join(' | ') || 'Year',
      })),
    certifications: splitMultiline(form.certifications),
    customSections,
  };
}

function getInitialDraft() {
  return getStorageJSON(FORM_STORAGE_KEY, null);
}

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

export default function UploadPage({ onTextExtracted, onPhotoUpload, onStructuredBuild, initialMode = 'form' }) {
  const initialDraft = useMemo(() => getInitialDraft(), []);
  const [mode, setMode] = useState(initialMode || initialDraft?.mode || 'form');
  const [formStep, setFormStep] = useState(initialDraft?.formStep || 0);
  const [dragOver, setDragOver] = useState(false);
  const [pasteText, setPasteText] = useState(initialDraft?.pasteText || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [photoName, setPhotoName] = useState(initialDraft?.photoName || '');
  const [rewriteKey, setRewriteKey] = useState('');
  const [form, setForm] = useState(() => normalizeFormDraft(initialDraft?.form || {}));
  const rewriteModeLabel = getRewriteModeLabel();
  const rewriteModeDescription = getRewriteModeDescription();

  const fileRef = useRef(null);
  const photoRef = useRef(null);

  useEffect(() => {
    setStorageJSON(FORM_STORAGE_KEY, { mode, formStep, pasteText, photoName, form });
  }, [mode, formStep, pasteText, photoName, form]);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  const formReady = useMemo(() => {
    return form.name.trim() && (form.summary.trim() || form.skills.trim() || form.experience.some((item) => item.role.trim() || item.company.trim()));
  }, [form]);

  const completion = useMemo(() => {
    const checks = [
      !!form.name.trim(),
      !!form.title.trim(),
      !!form.summary.trim(),
      !!form.skills.trim(),
      !!form.strengths.trim(),
      !!form.languages.trim(),
      form.experience.some((item) => item.role.trim() || item.company.trim()),
      form.projects.some((item) => item.name.trim() || item.company.trim()),
      form.awards.some((item) => item.title.trim() || item.issuer.trim()),
      form.education.some((item) => item.degree.trim() || item.school.trim()),
      !!form.certifications.trim(),
      form.references.some((item) => item.name.trim() || item.contact.trim()),
      form.customSections.some(isCustomSectionFilled),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form]);

  const formInsights = useMemo(() => {
    const items = [];
    if (!form.summary.trim()) items.push('Add a sharper summary so the first draft opens with clearer positioning.');
    if (!form.skills.trim()) items.push('List 8 to 12 core skills to make the resume feel more complete and ATS-ready.');
    if (!form.experience.some((item) => item.bullets.trim())) items.push('Add measurable bullets to at least one role for stronger first-pass wording.');
    if (!form.projects.some((item) => item.name.trim())) items.push('Projects help the templates feel richer, especially for product, analytics, and consulting profiles.');
    if (!form.languages.trim()) items.push('Languages are optional, but adding them helps global, consulting, and customer-facing resumes feel more complete.');
    if (!form.education.some((item) => item.degree.trim())) items.push('Education keeps premium templates visually balanced and complete.');
    if (!form.customSections.some(isCustomSectionFilled)) items.push('Custom sections are great for tools, software, volunteering, awards, publications, or anything unique to your story.');
    return items.slice(0, 4);
  }, [form]);

  const currentStepMeta = FORM_STEPS[formStep];
  const isLastStep = formStep === FORM_STEPS.length - 1;

  const rewriteField = async ({ key, scope = 'section', context, value, updater }) => {
    if (!String(value || '').trim()) return;
    setRewriteKey(key);
    try {
      const rewritten = await rewriteTextWithAI(value, { scope, context });
      updater(rewritten);
    } finally {
      setRewriteKey('');
    }
  };

  const handleRewriteWholeForm = async () => {
    setRewriteKey('whole-form');
    try {
      const nextSummary = form.summary.trim()
        ? await rewriteTextWithAI(form.summary, { scope: 'summary', context: 'Resume summary' })
        : form.summary;

      const nextExperience = await Promise.all(form.experience.map(async (item) => {
        if (!item.bullets.trim()) return item;
        const bullets = await rewriteTextWithAI(item.bullets, {
          scope: 'bullets',
          context: `${item.role || 'Role'} at ${item.company || 'Company'}`,
        });
        return { ...item, bullets };
      }));

      const nextProjects = await Promise.all(form.projects.map(async (item) => {
        if (!item.bullets.trim()) return item;
        const bullets = await rewriteTextWithAI(item.bullets, {
          scope: 'bullets',
          context: `${item.name || 'Project'} for ${item.client || item.company || 'client'}`,
        });
        return { ...item, bullets };
      }));

      const nextAwards = await Promise.all(form.awards.map(async (item) => {
        if (!item.details.trim()) return item;
        const details = await rewriteTextWithAI(item.details, {
          scope: 'section',
          context: `${item.title || 'Award'} details`,
        });
        return { ...item, details };
      }));

      const nextCustomSections = await Promise.all(form.customSections.map(async (item) => {
        if (!item.content.trim()) return item;
        const content = await rewriteTextWithAI(item.content, {
          scope: 'section',
          context: `${item.title || 'Custom section'} entries`,
        });
        return { ...item, content };
      }));

      setForm((prev) => ({
        ...prev,
        summary: nextSummary,
        experience: nextExperience,
        projects: nextProjects,
        awards: nextAwards,
        customSections: nextCustomSections,
      }));
    } finally {
      setRewriteKey('');
    }
  };

  const handleFile = async (file) => {
    setError('');
    setLoading(true);
    try {
      const text = await extractText(file);
      if (!text || text.trim().length < 20) throw new Error('Could not extract enough text from file');
      onTextExtracted(text.trim());
    } catch (e) {
      setError(e.message || 'Failed to extract text');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handlePaste = () => {
    setError('');
    if (pasteText.trim().length < 20) {
      setError('Please paste at least 20 characters of resume text.');
      return;
    }
    onTextExtracted(pasteText.trim());
  };

  const handlePhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoName(f.name);
    const reader = new FileReader();
    reader.onload = (ev) => onPhotoUpload(ev.target.result);
    reader.readAsDataURL(f);
  };

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateArrayField = (group, index, key, value) => {
    setForm((prev) => ({
      ...prev,
      [group]: prev[group].map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }));
  };

  const updateNestedArrayField = (group, index, nestedKey, nestedIndex, key, value) => {
    setForm((prev) => ({
      ...prev,
      [group]: prev[group].map((item, itemIndex) => (
        itemIndex === index
          ? {
              ...item,
              [nestedKey]: (item[nestedKey] || []).map((nestedItem, currentNestedIndex) => (
                currentNestedIndex === nestedIndex ? { ...nestedItem, [key]: value } : nestedItem
              )),
            }
          : item
      )),
    }));
  };

  const addArrayItem = (group, emptyItem) => {
    setForm((prev) => ({ ...prev, [group]: [...prev[group], { ...emptyItem }] }));
  };

  const buildCustomSectionWithAI = async (title, currentContent = '', key = 'custom-section-builder') => {
    const safeTitle = title.trim();
    if (!safeTitle) return '';
    setRewriteKey(key);
    try {
      const rewritten = await rewriteTextWithAI(currentContent.trim() || buildCustomSectionSeed(safeTitle), {
        scope: 'section',
        context: `Create concise starter entries for a resume custom section titled "${safeTitle}". Return only editable line items with no commentary.`,
      });
      return rewritten;
    } finally {
      setRewriteKey('');
    }
  };

  const addCustomSection = async ({ title, placement = 'side', withAI = false }) => {
    const safeTitle = title.trim();
    if (!safeTitle) return;
    const resolvedPlacement = placement || inferCustomSectionPlacement(safeTitle);
    const content = withAI ? await buildCustomSectionWithAI(safeTitle, '', 'custom-section-builder') : '';
    setForm((prev) => ({
      ...prev,
      customSections: [
        ...prev.customSections,
        {
          ...EMPTY_CUSTOM_SECTION,
          title: safeTitle,
          placement: resolvedPlacement,
          content,
        },
      ],
    }));
  };

  const aiFillCustomSection = async (index) => {
    const section = form.customSections[index];
    if (!section?.title?.trim()) return;
    const content = await buildCustomSectionWithAI(section.title, section.content, `custom-section-${index}`);
    updateArrayField('customSections', index, 'content', content);
  };

  const addNestedArrayItem = (group, index, nestedKey, emptyItem) => {
    setForm((prev) => ({
      ...prev,
      [group]: prev[group].map((item, itemIndex) => (
        itemIndex === index
          ? { ...item, [nestedKey]: [...(item[nestedKey] || []), { ...emptyItem }] }
          : item
      )),
    }));
  };

  const removeArrayItem = (group, index) => {
    setForm((prev) => ({
      ...prev,
      [group]: group === 'customSections'
        ? prev[group].filter((_, itemIndex) => itemIndex !== index)
        : prev[group].length === 1
          ? prev[group]
          : prev[group].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const removeNestedArrayItem = (group, index, nestedKey, nestedIndex) => {
    setForm((prev) => ({
      ...prev,
      [group]: prev[group].map((item, itemIndex) => (
        itemIndex === index
          ? {
              ...item,
              [nestedKey]: (item[nestedKey] || []).length === 1
                ? []
                : (item[nestedKey] || []).filter((_, currentNestedIndex) => currentNestedIndex !== nestedIndex),
            }
          : item
      )),
    }));
  };

  const clearDraft = () => {
    try {
      removeStorageValue(FORM_STORAGE_KEY);
    } catch {
      return;
    }
    setMode('form');
    setPasteText('');
    setPhotoName('');
    setFormStep(0);
    setForm(normalizeFormDraft({}));
  };

  const handleUseDemo = () => {
    setMode('form');
    setFormStep(0);
    setForm(normalizeFormDraft(SAMPLE_FORM));
  };

  const handleFormSubmit = () => {
    setError('');
    const structured = buildStructuredResumeFromForm(form);
    const compiled = buildResumeTextFromForm(form);
    if (compiled.length < 40) {
      setError('Please add a few more details before generating your resume.');
      return;
    }
    if (onStructuredBuild) {
      onStructuredBuild(structured);
      return;
    }
    onTextExtracted(compiled);
  };

  const nextFormStep = () => {
    setFormStep((prev) => Math.min(prev + 1, FORM_STEPS.length - 1));
  };

  const prevFormStep = () => {
    setFormStep((prev) => Math.max(prev - 1, 0));
  };

  if (mode === 'form') {
    return (
      <GuidedFormFlow
        form={form}
        formStep={formStep}
        setFormStep={setFormStep}
        formSteps={FORM_STEPS}
        completion={completion}
        photoName={photoName}
        photoRef={photoRef}
        handlePhoto={handlePhoto}
        handleUseDemo={handleUseDemo}
        clearDraft={clearDraft}
        setMode={setMode}
        rewriteKey={rewriteKey}
        rewriteField={rewriteField}
        handleRewriteWholeForm={handleRewriteWholeForm}
        updateForm={updateForm}
        updateArrayField={updateArrayField}
        updateNestedArrayField={updateNestedArrayField}
        addArrayItem={addArrayItem}
        addNestedArrayItem={addNestedArrayItem}
        removeArrayItem={removeArrayItem}
        removeNestedArrayItem={removeNestedArrayItem}
        nextFormStep={nextFormStep}
        prevFormStep={prevFormStep}
        isLastStep={isLastStep}
        formReady={formReady}
        handleFormSubmit={handleFormSubmit}
        formInsights={formInsights}
        emptyExperience={EMPTY_EXPERIENCE}
        emptyExperienceSection={EMPTY_EXPERIENCE_SECTION}
        emptyProject={EMPTY_PROJECT}
        emptyProjectDetail={EMPTY_PROJECT_DETAIL}
        emptyAward={EMPTY_AWARD}
        emptyEducation={EMPTY_EDUCATION}
        emptyReference={EMPTY_REFERENCE}
        emptyCustomSection={EMPTY_CUSTOM_SECTION}
        addCustomSection={addCustomSection}
        aiFillCustomSection={aiFillCustomSection}
        rewriteModeLabel={rewriteModeLabel}
        rewriteModeDescription={rewriteModeDescription}
      />
    );
  }

  return (
    <div className="upload-page-shell">
      <div className="upload-page-orb upload-page-orb--mint" />
      <div className="upload-page-orb upload-page-orb--sky" />

      <div className="upload-page-grid">
        <section className="upload-intro-card premium-surface">
          <div className="upload-step-chip">Premium Intake Flow</div>
          <h1 className="upload-title">Build your resume from a polished upload studio.</h1>
          <p className="upload-copy">
            Import a file, paste raw content, or answer a guided form. However you start, we structure it into an editable, premium resume experience.
          </p>

          <div className="upload-hero-actions">
            <button type="button" className="upload-primary-btn upload-primary-btn--ghost" onClick={handleUseDemo}>
              Try a polished demo
            </button>
            <button type="button" className="upload-link-btn upload-link-btn--soft" onClick={clearDraft}>
              Reset saved draft
            </button>
          </div>

          <div className="upload-highlights">
            <div className="upload-highlight-card">
              <strong>Upload & extract</strong>
              <span>Drop PDF, DOCX, TXT, or Markdown and let the parser pull the essentials automatically.</span>
            </div>
            <div className="upload-highlight-card">
              <strong>Guided sections</strong>
              <span>Walk through profile, experience, education, skills, projects, and more in a clean form flow.</span>
            </div>
            <div className="upload-highlight-card">
              <strong>Auto-saved progress</strong>
              <span>Your guided form progress stays locally saved while you move between sections.</span>
            </div>
          </div>

          <div className="upload-preview-card">
            <div className="upload-preview-header">
              <div>
                <p className="upload-preview-pill">Preferred intake order</p>
                <h3>Lead with structure. Keep import as a fallback.</h3>
              </div>
              <span className="upload-preview-status">
                Autosaves locally
              </span>
            </div>
            <div className="upload-preview-steps">
              <div className="upload-preview-step">
                <strong>01</strong>
                <div>
                  <span>Guided Form</span>
                  <p>Best for polished, complete resumes from scratch.</p>
                </div>
              </div>
              <div className="upload-preview-step">
                <strong>02</strong>
                <div>
                  <span>Paste text</span>
                  <p>Useful when the source content is already copied out.</p>
                </div>
              </div>
              <div className="upload-preview-step">
                <strong>03</strong>
                <div>
                  <span>Upload Resume</span>
                  <p>Fast fallback for PDFs, DOCX files, and existing CVs.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="upload-main-card premium-surface">
          <div className="upload-panel-head">
            <div>
              <div className="upload-step-chip">Step 1 of 2</div>
              <h2>Start with your content</h2>
              <p>Pick a premium intake path, add your details, and we will generate the first editable draft.</p>
            </div>

            <div className="upload-panel-meta">
              <button type="button" className="upload-photo-chip" onClick={() => photoRef.current?.click()}>
                <span>{photoName ? 'Photo added' : 'Add profile photo'}</span>
                <small>{photoName || 'Optional headshot'}</small>
              </button>
              <div className="upload-draft-badge">
                <strong>{completion}%</strong>
                <span>guided form readiness</span>
              </div>
            </div>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>

          <div className="upload-mode-toggle">
            {[
              ['form', 'Guided Form'],
              ['paste', 'Paste Text'],
              ['upload', 'Upload Resume'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`upload-mode-btn${mode === value ? ' upload-mode-btn--active' : ''}`}
                onClick={() => {
                  setError('');
                  setMode(value);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === 'upload' && (
            <div className="upload-card-stack">
              <div
                className={`upload-dropzone${dragOver ? ' upload-dropzone--active' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  className="hidden"
                  onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                />
                <div className="upload-drop-icon">
                  {loading ? (
                    <div className="spin" style={{ width: 26, height: 26, borderRadius: '50%', border: '2px solid rgba(148,163,184,.25)', borderTopColor: 'var(--c-accent)' }} />
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  )}
                </div>
                <h3>{loading ? 'Extracting your resume...' : 'Drop your resume here'}</h3>
                <p>PDF, DOCX, TXT, or Markdown. We will pull the text and move you straight into the live editor.</p>
                <span>or click to browse files</span>
              </div>

              <div className="upload-inline-note">
                <strong>Best for:</strong> existing resumes, consultant CVs, exported LinkedIn copies, and recruiter-submitted files.
              </div>
            </div>
          )}

          {mode === 'paste' && (
            <div className="upload-card-stack">
              <TextareaField
                label="Paste resume text"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste your resume, LinkedIn export, or raw draft here..."
                rows={10}
              />
              <div className="upload-inline-note">
                <strong>Tip:</strong> paste section headings like Experience, Education, and Skills to improve the first-pass structure.
              </div>
              <button type="button" className="upload-primary-btn" onClick={handlePaste}>
                Use this text to generate resume
              </button>
            </div>
          )}

          {mode === 'form' && (
            <div className="upload-card-stack upload-form-layout">
              <div className="upload-stepper-shell">
                <div className="upload-stepper-progress">
                  <div className="upload-stepper-progress-bar" style={{ width: `${((formStep + 1) / FORM_STEPS.length) * 100}%` }} />
                </div>
                <div className="upload-stepper-head">
                  <div>
                    <p>{currentStepMeta.label}</p>
                    <h3>{currentStepMeta.blurb}</h3>
                  </div>
                  <span>{formStep + 1} / {FORM_STEPS.length}</span>
                </div>
                <div className="upload-stepper-tabs">
                  {FORM_STEPS.map((step, index) => (
                    <button
                      key={step.id}
                      type="button"
                      className={`upload-stepper-tab${index === formStep ? ' upload-stepper-tab--active' : ''}`}
                      onClick={() => setFormStep(index)}
                    >
                      {step.label}
                    </button>
                  ))}
                </div>
              </div>

              {formStep === 0 && (
                <section className="upload-form-section">
                  <SectionHeader
                    title="Identity"
                    copy="Anchor the resume with the name, title, contact information, and public links you want recruiters to see first."
                  />
                  <div className="upload-form-grid upload-form-grid--2col">
                    <InputField label="Full name" value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Jordan Avery" />
                    <InputField label="Professional title" value={form.title} onChange={(e) => updateForm('title', e.target.value)} placeholder="Senior Brand Designer" />
                    <InputField label="Email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="jordan.avery@example.com" />
                    <InputField label="Phone" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="+1 415 555 0182" />
                    <InputField label="Location" value={form.location} onChange={(e) => updateForm('location', e.target.value)} placeholder="Austin, Texas" />
                    <InputField label="Website / LinkedIn" value={form.website} onChange={(e) => updateForm('website', e.target.value)} placeholder="linkedin.com/in/yourname" />
                  </div>
                </section>
              )}

              {formStep === 1 && (
                <section className="upload-form-section">
                  <SectionHeader
                    title="Profile"
                    copy="Use concise, recruiter-friendly language for the opening summary and the supporting skills around it."
                    actions={[
                      {
                        label: rewriteKey === 'summary' ? 'Polishing...' : 'Polish summary',
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
                  <TextareaField label="Professional summary" value={form.summary} onChange={(e) => updateForm('summary', e.target.value)} placeholder="Results-focused analyst with 6+ years of experience..." rows={5} />
                  <div className="upload-form-grid upload-form-grid--2col">
                    <TextareaField label="Core skills" value={form.skills} onChange={(e) => updateForm('skills', e.target.value)} placeholder="SQL, Tableau, Power BI, Alteryx, JIRA" rows={4} />
                    <TextareaField label="Strengths" value={form.strengths} onChange={(e) => updateForm('strengths', e.target.value)} placeholder={'Stakeholder communication\nProblem solving\nReporting automation'} rows={4} />
                    <TextareaField label="Languages" value={form.languages} onChange={(e) => updateForm('languages', e.target.value)} placeholder={'English - Fluent\nSpanish - Conversational\nFrench - Basic'} rows={4} />
                  </div>
                </section>
              )}

              {formStep === 2 && (
                <section className="upload-form-section">
                  <SectionHeader
                    title="Experience"
                    copy="Each role can capture company, client, location, dates, and outcome-focused bullet points."
                    actions={[
                      {
                        label: 'Add role',
                        onClick: () => addArrayItem('experience', EMPTY_EXPERIENCE),
                      },
                    ]}
                  />
                  <div className="upload-repeat-stack">
                    {form.experience.map((item, index) => (
                      <div className="upload-repeat-card" key={`experience-${index}`}>
                        <div className="upload-repeat-head">
                          <strong>{item.role || `Role ${index + 1}`}</strong>
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
                              {rewriteKey === `experience-${index}` ? 'Polishing...' : 'Polish bullets'}
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
                        <TextareaField
                          label="Impact bullets"
                          value={item.bullets}
                          onChange={(e) => updateArrayField('experience', index, 'bullets', e.target.value)}
                          placeholder={'Improved operational visibility across VMS workflows\nReduced manual reporting effort by 40%\nPartnered with analysts and PMs to launch new integrations'}
                          rows={5}
                        />
                        <div className="upload-nested-composer">
                          <SectionHeader
                            title="Grouped sub-sections"
                            copy="Use this when one company includes multiple workstreams, implementations, support tracks, or client-facing subsections."
                            actions={[
                              {
                                label: 'Add sub-section',
                                onClick: () => addNestedArrayItem('experience', index, 'sections', EMPTY_EXPERIENCE_SECTION),
                              },
                            ]}
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
                                  <InputField
                                    label="Sub-section title"
                                    value={section.heading}
                                    onChange={(e) => updateNestedArrayField('experience', index, 'sections', sectionIndex, 'heading', e.target.value)}
                                    placeholder="Customer Implementation and Expansions"
                                  />
                                  <TextareaField
                                    label="Sub-section bullets"
                                    value={section.bullets}
                                    onChange={(e) => updateNestedArrayField('experience', index, 'sections', sectionIndex, 'bullets', e.target.value)}
                                    placeholder={'Serve as the technical lead for new implementations\nConduct discovery, process mapping, and business requirements workshops\nSupport user acceptance testing and go-live activities'}
                                    rows={5}
                                  />
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

              {formStep === 3 && (
                <section className="upload-form-section">
                  <SectionHeader
                    title="Projects & supporting sections"
                    copy="Add richer supporting sections that the editor will carry into custom resume blocks automatically."
                    actions={[
                      {
                        label: 'Add project',
                        onClick: () => addArrayItem('projects', EMPTY_PROJECT),
                      },
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
                              {rewriteKey === `project-${index}` ? 'Polishing...' : 'Polish bullets'}
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
                        <TextareaField
                          label="Overview paragraph"
                          value={item.overview}
                          onChange={(e) => updateArrayField('projects', index, 'overview', e.target.value)}
                          placeholder="Summarize the engagement, scope, ownership, and outcome in one strong paragraph."
                          rows={4}
                        />
                        <div className="upload-form-grid upload-form-grid--2col">
                          <InputField
                            label="Client list heading"
                            value={item.clientsLabel}
                            onChange={(e) => updateArrayField('projects', index, 'clientsLabel', e.target.value)}
                            placeholder="Clients"
                          />
                          <div />
                          <TextareaField
                            label="Client / stakeholder list"
                            value={item.clients}
                            onChange={(e) => updateArrayField('projects', index, 'clients', e.target.value)}
                            placeholder={'The Coca-Cola Company (TCCC)\nCarrier Corporation (CARR)\nWTW'}
                            rows={4}
                          />
                        </div>
                        <TextareaField
                          label="Detail intro"
                          value={item.detailIntro}
                          onChange={(e) => updateArrayField('projects', index, 'detailIntro', e.target.value)}
                          placeholder="Use this for a sentence like: My responsibilities included configuring the following modules from scratch."
                          rows={3}
                        />
                        <div className="upload-nested-composer">
                          <SectionHeader
                            title="Labeled detail lines"
                            copy="Build the richer 'Label: description' rows shown in your reference example."
                            actions={[
                              {
                                label: 'Add detail line',
                                onClick: () => addNestedArrayItem('projects', index, 'detailItems', EMPTY_PROJECT_DETAIL),
                              },
                            ]}
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
                                  <InputField
                                    label="Label"
                                    value={detail.label}
                                    onChange={(e) => updateNestedArrayField('projects', index, 'detailItems', detailIndex, 'label', e.target.value)}
                                    placeholder="Rate Management"
                                  />
                                  <TextareaField
                                    label="Description"
                                    value={detail.details}
                                    onChange={(e) => updateNestedArrayField('projects', index, 'detailItems', detailIndex, 'details', e.target.value)}
                                    placeholder="Modules related to rate setup, rules, approvals, and financial configurations."
                                    rows={3}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="upload-form-grid upload-form-grid--2col">
                          <InputField
                            label="Extra notes heading"
                            value={item.bulletSectionTitle}
                            onChange={(e) => updateArrayField('projects', index, 'bulletSectionTitle', e.target.value)}
                            placeholder="Client Support & Operations"
                          />
                          <TextareaField
                            label="Supporting bullet points"
                            value={item.bullets}
                            onChange={(e) => updateArrayField('projects', index, 'bullets', e.target.value)}
                            placeholder={'Built intake workflow for supplier onboarding\nReduced manual handoffs by 40%\nImproved reporting visibility for leadership'}
                            rows={4}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="upload-form-grid upload-form-grid--2col upload-form-grid--studio-gap">
                    <div className="upload-repeat-stack">
                      <SectionHeader
                        title="Awards"
                        copy="Optional but useful when you want stronger proof of recognition and impact."
                        actions={[{ label: 'Add award', onClick: () => addArrayItem('awards', EMPTY_AWARD) }]}
                      />
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
                                {rewriteKey === `award-${index}` ? 'Polishing...' : 'Polish details'}
                              </button>
                              <button type="button" className="upload-link-btn" onClick={() => removeArrayItem('awards', index)}>
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="upload-form-grid">
                            <InputField label="Award / recognition" value={item.title} onChange={(e) => updateArrayField('awards', index, 'title', e.target.value)} placeholder="Shining Star Award" />
                            <InputField label="Issuer" value={item.issuer} onChange={(e) => updateArrayField('awards', index, 'issuer', e.target.value)} placeholder="Global Tech Summit" />
                            <InputField label="Date" value={item.date} onChange={(e) => updateArrayField('awards', index, 'date', e.target.value)} placeholder="2024" />
                            <TextareaField label="Details" value={item.details} onChange={(e) => updateArrayField('awards', index, 'details', e.target.value)} placeholder={'Recognized for...'} rows={3} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="upload-repeat-stack">
                      <SectionHeader
                        title="References"
                        copy="Useful for premium executive, consulting, and designer-style resumes."
                        actions={[{ label: 'Add reference', onClick: () => addArrayItem('references', EMPTY_REFERENCE) }]}
                      />
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
                  </div>
                </section>
              )}

              {formStep === 4 && (
                <section className="upload-form-section">
                  <SectionHeader
                    title="Education & credentials"
                    copy="Capture academic history and credentials so the first draft arrives visually balanced and ready to edit."
                    actions={[{ label: 'Add education', onClick: () => addArrayItem('education', EMPTY_EDUCATION) }]}
                  />
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
                  <TextareaField label="Certifications" value={form.certifications} onChange={(e) => updateForm('certifications', e.target.value)} placeholder={'Google Data Analytics\nLean Six Sigma Green Belt'} rows={4} />
                </section>
              )}

              {formStep === 5 && (
                <section className="upload-form-section">
                  <SectionHeader
                    title="Review before generating"
                    copy="This review step helps you spot thin sections before the resume gets created."
                    actions={[
                      {
                        label: rewriteKey === 'whole-form' ? 'Polishing...' : 'Polish full draft',
                        onClick: handleRewriteWholeForm,
                        disabled: rewriteKey === 'whole-form',
                        primary: true,
                      },
                    ]}
                  />
                  <div className="upload-review-grid">
                    <div className="upload-review-card">
                      <strong>{form.name || 'Name missing'}</strong>
                      <span>{form.title || 'Professional title missing'}</span>
                      <p>{form.email || 'Email missing'}{form.phone ? ` | ${form.phone}` : ''}</p>
                    </div>
                    <div className="upload-review-card">
                      <strong>{form.experience.filter((item) => item.role || item.company).length} role(s)</strong>
                      <span>{form.projects.filter((item) => item.name || item.company).length} project(s)</span>
                      <p>{form.education.filter((item) => item.degree || item.school).length} education entry(s)</p>
                    </div>
                    <div className="upload-review-card">
                      <strong>{splitListValues(form.skills).length} skills</strong>
                      <span>{splitMultiline(form.certifications).length} credentials</span>
                      <p>{form.references.filter((item) => item.name || item.contact).length} reference(s)</p>
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

              <div className="upload-form-actions">
                <button type="button" className="upload-secondary-btn" onClick={prevFormStep} disabled={formStep === 0}>
                  Back
                </button>
                {!isLastStep ? (
                  <button type="button" className="upload-primary-btn" onClick={nextFormStep}>
                    Continue to {FORM_STEPS[formStep + 1].label}
                  </button>
                ) : (
                  <button type="button" className="upload-primary-btn" onClick={handleFormSubmit} disabled={!formReady}>
                    Build resume from guided form
                  </button>
                )}
              </div>
            </div>
          )}

          {error && <div className="upload-error-banner">{error}</div>}
        </section>
      </div>
    </div>
  );
}


