export const SECTION_TEMPLATE_DEFS = [
  {
    id: 'projects',
    title: 'Projects',
    icon: 'PR',
    defaultPlacement: 'main',
    description: 'Showcase major projects with client, company, timeline, and impact bullets.',
    fields: [
      { id: 'projectName', label: 'Project name', placeholder: 'Workday VNDLY rollout', required: true },
      { id: 'company', label: 'Company', placeholder: 'Innova Solutions' },
      { id: 'client', label: 'Client', placeholder: 'Impellam Group' },
      { id: 'startDate', label: 'Start date', placeholder: 'Apr 2024' },
      { id: 'endDate', label: 'End date', placeholder: 'Present' },
      { id: 'bullets', label: 'Project bullet points', type: 'textarea', rows: 5, placeholder: 'Built intake workflow for supplier onboarding\nReduced manual handoffs by 40%' },
    ],
  },
  {
    id: 'awards',
    title: 'Awards',
    icon: 'AW',
    defaultPlacement: 'main',
    description: 'Capture awards, recognitions, and measurable wins.',
    fields: [
      { id: 'awardName', label: 'Award / recognition', placeholder: 'Shining Star Award', required: true },
      { id: 'issuer', label: 'Issuer', placeholder: 'Huawei Technologies' },
      { id: 'date', label: 'Date', placeholder: '2023' },
      { id: 'details', label: 'Details', type: 'textarea', rows: 4, placeholder: 'Recognized for improving reporting quality and turnaround time.' },
    ],
  },
  {
    id: 'languages',
    title: 'Languages',
    icon: 'LG',
    defaultPlacement: 'side',
    description: 'List spoken languages and proficiency levels.',
    fields: [
      { id: 'languageList', label: 'Languages', type: 'textarea', rows: 5, placeholder: 'English - Fluent\nHindi - Native\nOdia - Conversational', required: true },
    ],
  },
  {
    id: 'strengths',
    title: 'Strengths',
    icon: 'ST',
    defaultPlacement: 'side',
    description: 'Highlight core strengths and working style.',
    fields: [
      { id: 'strengthList', label: 'Strengths', type: 'textarea', rows: 5, placeholder: 'Stakeholder communication\nProcess improvement\nAnalytical problem solving', required: true },
    ],
  },
  {
    id: 'courses',
    title: 'Courses',
    icon: 'CR',
    defaultPlacement: 'side',
    description: 'Add professional courses and continuing education.',
    fields: [
      { id: 'courseName', label: 'Course / credential', placeholder: 'Google Data Analytics Certificate', required: true },
      { id: 'provider', label: 'Provider', placeholder: 'Coursera' },
      { id: 'date', label: 'Date', placeholder: '2024' },
      { id: 'details', label: 'Notes', type: 'textarea', rows: 3, placeholder: 'Covered SQL, spreadsheets, data storytelling, and dashboards.' },
    ],
  },
  {
    id: 'volunteering',
    title: 'Volunteering',
    icon: 'VO',
    defaultPlacement: 'main',
    description: 'Add volunteer roles with organization and impact.',
    fields: [
      { id: 'role', label: 'Volunteer role', placeholder: 'Mentor', required: true },
      { id: 'organization', label: 'Organization', placeholder: 'Local Tech Collective' },
      { id: 'period', label: 'Dates', placeholder: '2022 - Present' },
      { id: 'details', label: 'Impact bullet points', type: 'textarea', rows: 4, placeholder: 'Mentored early-career analysts on SQL and dashboards.' },
    ],
  },
  {
    id: 'publications',
    title: 'Publications',
    icon: 'PB',
    defaultPlacement: 'main',
    description: 'Track papers, reports, or articles you want visible on the resume.',
    fields: [
      { id: 'titleField', label: 'Publication title', placeholder: 'Operational Metrics Playbook', required: true },
      { id: 'publisher', label: 'Publisher / outlet', placeholder: 'Internal Knowledge Hub' },
      { id: 'date', label: 'Date', placeholder: '2024' },
      { id: 'details', label: 'Summary', type: 'textarea', rows: 4, placeholder: 'Wrote the core operational reporting framework for VMS support teams.' },
    ],
  },
  {
    id: 'personal-details',
    title: 'Personal Details',
    icon: 'PD',
    defaultPlacement: 'side',
    description: 'Keep structured personal information in one clean section.',
    fields: [
      { id: 'address', label: 'Address', placeholder: 'Bengaluru, Karnataka' },
      { id: 'birthDate', label: 'Date of birth', placeholder: '29 Aug 1995' },
      { id: 'nationality', label: 'Nationality', placeholder: 'Indian' },
      { id: 'other', label: 'Additional personal details', type: 'textarea', rows: 4, placeholder: 'Marital status: Unmarried\nNotice period: Immediate' },
    ],
  },
  {
    id: 'declaration',
    title: 'Declaration',
    icon: 'DC',
    defaultPlacement: 'side',
    description: 'Add a final declaration or closing note.',
    fields: [
      { id: 'statement', label: 'Declaration statement', type: 'textarea', rows: 4, placeholder: 'I hereby declare that the information above is true to the best of my knowledge.', required: true },
    ],
  },
  {
    id: 'training',
    title: 'Training',
    icon: 'TR',
    defaultPlacement: 'main',
    description: 'Add structured training or implementation programs.',
    fields: [
      { id: 'program', label: 'Program name', placeholder: 'VMS Configuration Training', required: true },
      { id: 'provider', label: 'Provider', placeholder: 'Internal Enablement Team' },
      { id: 'period', label: 'Dates', placeholder: '2023' },
      { id: 'details', label: 'Learning outcomes', type: 'textarea', rows: 4, placeholder: 'Configured supplier workflows, financial rules, and approval paths.' },
    ],
  },
  {
    id: 'leadership',
    title: 'Leadership',
    icon: 'LD',
    defaultPlacement: 'main',
    description: 'Highlight leadership initiatives and ownership.',
    fields: [
      { id: 'initiative', label: 'Initiative / responsibility', placeholder: 'Led onboarding operations for APAC region', required: true },
      { id: 'scope', label: 'Scope', placeholder: 'Cross-functional program' },
      { id: 'period', label: 'Dates', placeholder: '2023 - Present' },
      { id: 'details', label: 'Impact bullet points', type: 'textarea', rows: 4, placeholder: 'Aligned PMs, analysts, and recruiters to improve launch readiness.' },
    ],
  },
  {
    id: 'references',
    title: 'References',
    icon: 'RF',
    defaultPlacement: 'side',
    description: 'Capture structured references and decision-makers.',
    fields: [
      { id: 'referenceName', label: 'Reference name', placeholder: 'Harumi Kobayashi', required: true },
      { id: 'referenceRole', label: 'Role / relationship', placeholder: 'CEO | Ingoude Company' },
      { id: 'referenceContact', label: 'Phone / email', placeholder: '+1 234 567 890' },
      { id: 'details', label: 'Reference note', type: 'textarea', rows: 3, placeholder: 'Available upon request / Former direct manager.' },
    ],
  },
];

export function getSectionTemplate(templateId) {
  return SECTION_TEMPLATE_DEFS.find((template) => template.id === templateId) || SECTION_TEMPLATE_DEFS[0];
}

export function createEmptySectionDraft(templateId) {
  const template = getSectionTemplate(templateId);
  return template.fields.reduce((draft, field) => {
    draft[field.id] = '';
    return draft;
  }, {});
}

function normalizeLines(value) {
  return String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function pairDates(startDate, endDate, period) {
  if (period) return period.trim();
  const joined = [startDate, endDate].filter(Boolean).join(' - ');
  return joined.trim();
}

export function serializeSectionDraft(templateId, draft) {
  const id = String(templateId || '').toLowerCase();
  const lines = [];

  if (id === 'projects') {
    if (draft.projectName) lines.push(`Project: ${draft.projectName}`);
    if (draft.company) lines.push(`Company: ${draft.company}`);
    if (draft.client) lines.push(`Client: ${draft.client}`);
    const dates = pairDates(draft.startDate, draft.endDate, draft.period);
    if (dates) lines.push(`Timeline: ${dates}`);
    normalizeLines(draft.bullets).forEach((line) => lines.push(line));
    return lines;
  }

  if (id === 'awards') {
    if (draft.awardName) lines.push(draft.awardName);
    const meta = [draft.issuer, draft.date].filter(Boolean).join(' | ');
    if (meta) lines.push(meta);
    normalizeLines(draft.details).forEach((line) => lines.push(line));
    return lines;
  }

  if (id === 'courses') {
    if (draft.courseName) lines.push(draft.courseName);
    const meta = [draft.provider, draft.date].filter(Boolean).join(' | ');
    if (meta) lines.push(meta);
    normalizeLines(draft.details).forEach((line) => lines.push(line));
    return lines;
  }

  if (id === 'volunteering') {
    if (draft.role) lines.push(draft.role);
    const meta = [draft.organization, draft.period].filter(Boolean).join(' | ');
    if (meta) lines.push(meta);
    normalizeLines(draft.details).forEach((line) => lines.push(line));
    return lines;
  }

  if (id === 'publications') {
    if (draft.titleField) lines.push(draft.titleField);
    const meta = [draft.publisher, draft.date].filter(Boolean).join(' | ');
    if (meta) lines.push(meta);
    normalizeLines(draft.details).forEach((line) => lines.push(line));
    return lines;
  }

  if (id === 'personal-details') {
    if (draft.address) lines.push(`Address: ${draft.address}`);
    if (draft.birthDate) lines.push(`Date of Birth: ${draft.birthDate}`);
    if (draft.nationality) lines.push(`Nationality: ${draft.nationality}`);
    normalizeLines(draft.other).forEach((line) => lines.push(line));
    return lines;
  }

  if (id === 'declaration') {
    return normalizeLines(draft.statement);
  }

  if (id === 'training') {
    if (draft.program) lines.push(draft.program);
    const meta = [draft.provider, draft.period].filter(Boolean).join(' | ');
    if (meta) lines.push(meta);
    normalizeLines(draft.details).forEach((line) => lines.push(line));
    return lines;
  }

  if (id === 'leadership') {
    if (draft.initiative) lines.push(draft.initiative);
    const meta = [draft.scope, draft.period].filter(Boolean).join(' | ');
    if (meta) lines.push(meta);
    normalizeLines(draft.details).forEach((line) => lines.push(line));
    return lines;
  }

  if (id === 'references') {
    if (draft.referenceName) lines.push(draft.referenceName);
    const meta = [draft.referenceRole, draft.referenceContact].filter(Boolean).join(' | ');
    if (meta) lines.push(meta);
    normalizeLines(draft.details).forEach((line) => lines.push(line));
    return lines;
  }

  if (id === 'languages') return normalizeLines(draft.languageList);
  if (id === 'strengths') return normalizeLines(draft.strengthList);

  return Object.values(draft).flatMap(normalizeLines);
}

export function buildSectionPayload(templateId, draft, placementOverride) {
  const template = getSectionTemplate(templateId);
  return {
    title: template.title,
    placement: placementOverride || template.defaultPlacement,
    items: serializeSectionDraft(templateId, draft),
  };
}
