const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'build', 'by', 'for', 'from', 'in', 'into', 'is',
  'of', 'on', 'or', 'our', 'that', 'the', 'their', 'this', 'to', 'with', 'you', 'your', 'will',
  'who', 'we', 'they', 'them', 'has', 'have', 'had', 'using', 'used', 'use', 'across', 'within',
  'through', 'while', 'strong', 'ability', 'skills', 'skill', 'experience', 'experienced',
  'years', 'year', 'work', 'working', 'role', 'team', 'teams', 'including', 'support', 'plus',
]);

function normalizeWord(word) {
  return String(word || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#./-]/g, '')
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
}

function tokenize(text) {
  return String(text || '')
    .split(/\s+/)
    .map(normalizeWord)
    .filter((word) => word.length >= 3 && !STOPWORDS.has(word));
}

function uniq(list) {
  return [...new Set(list)];
}

function buildResumeBuckets(data) {
  const summary = String(data?.summary || '');
  const skills = Array.isArray(data?.skills) ? data.skills.join(' ') : '';
  const experience = Array.isArray(data?.experience)
    ? data.experience.map((item) => [
        item?.role,
        item?.company,
        item?.client,
        item?.period,
        ...(item?.bullets || []),
        ...((item?.sections || []).flatMap((section) => [section?.heading, ...(section?.bullets || [])])),
      ].filter(Boolean).join(' ')).join(' ')
    : '';
  const custom = Array.isArray(data?.customSections)
    ? data.customSections.map((section) => [section?.title, ...(section?.items || [])].filter(Boolean).join(' ')).join(' ')
    : '';

  return {
    summary,
    skills,
    experience,
    custom,
    fullText: [data?.name, data?.title, summary, skills, experience, custom].filter(Boolean).join(' '),
  };
}

export function analyzeJobFit(data, jobDescription) {
  const jd = String(jobDescription || '').trim();
  if (!jd) {
    return {
      score: 0,
      matchedKeywords: [],
      missingKeywords: [],
      suggestions: [],
      strengths: [],
      focusAreas: [],
    };
  }

  const buckets = buildResumeBuckets(data);
  const jdKeywords = uniq(tokenize(jd)).slice(0, 80);
  const resumeTokens = new Set(tokenize(buckets.fullText));
  const matchedKeywords = jdKeywords.filter((word) => resumeTokens.has(word));
  const missingKeywords = jdKeywords.filter((word) => !resumeTokens.has(word)).slice(0, 18);

  const summaryCoverage = tokenize(buckets.summary).filter((word) => jdKeywords.includes(word)).length;
  const skillsCoverage = tokenize(buckets.skills).filter((word) => jdKeywords.includes(word)).length;
  const experienceCoverage = tokenize(buckets.experience).filter((word) => jdKeywords.includes(word)).length;
  const customCoverage = tokenize(buckets.custom).filter((word) => jdKeywords.includes(word)).length;

  const weightedCoverage = (matchedKeywords.length / Math.max(jdKeywords.length, 1)) * 100;
  const score = Math.max(22, Math.min(98, Math.round(weightedCoverage * 0.72 + Math.min(skillsCoverage, 12) * 2 + Math.min(summaryCoverage, 6) * 2)));

  const strengths = [];
  if (summaryCoverage >= 4) strengths.push('Your summary already mirrors several target-role keywords.');
  if (skillsCoverage >= 6) strengths.push('The skills section is carrying strong keyword coverage for ATS scans.');
  if (experienceCoverage >= 10) strengths.push('Experience bullets already echo a healthy portion of the job language.');
  if (customCoverage >= 4) strengths.push('Supporting sections are reinforcing relevant context beyond the main experience block.');

  const suggestions = [];
  if (summaryCoverage < 4) suggestions.push('Rewrite the summary to mirror the target role, domain, and seniority more directly.');
  if (skillsCoverage < 6) suggestions.push('Add missing platform, methodology, or domain terms into skills for faster ATS matching.');
  if (experienceCoverage < 10) suggestions.push('Thread job-description language into accomplishment bullets, not just section titles.');
  if (missingKeywords.length) suggestions.push(`Work in keywords like ${missingKeywords.slice(0, 4).join(', ')} where they are truthful and relevant.`);

  const focusAreas = [
    { section: 'Summary', coverage: summaryCoverage },
    { section: 'Skills', coverage: skillsCoverage },
    { section: 'Experience', coverage: experienceCoverage },
    { section: 'Supporting Sections', coverage: customCoverage },
  ].sort((a, b) => a.coverage - b.coverage);

  return {
    score,
    matchedKeywords: matchedKeywords.slice(0, 18),
    missingKeywords,
    suggestions: suggestions.slice(0, 4),
    strengths: strengths.slice(0, 4),
    focusAreas,
  };
}
