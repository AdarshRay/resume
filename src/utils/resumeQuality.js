export function calculateResumeQuality(data) {
  const skillsCount = data?.skills?.filter(Boolean).length || 0;
  const experienceCount = data?.experience?.length || 0;
  const experienceBullets = (data?.experience || []).reduce(
    (sum, item) => sum + (item?.bullets?.filter(Boolean).length || 0),
    0
  );
  const educationCount = data?.education?.length || 0;
  const certificationsCount = data?.certifications?.filter(Boolean).length || 0;
  const hasSummary = !!data?.summary?.trim();
  const hasContact = [data?.email, data?.phone, data?.location].filter(Boolean).length >= 2;
  const customCount = data?.customSections?.reduce(
    (sum, section) => sum + (section?.items?.filter(Boolean).length || 0),
    0
  ) || 0;

  const score = Math.min(
    100,
    (hasSummary ? 18 : 0) +
    (hasContact ? 14 : 0) +
    Math.min(experienceCount * 14, 28) +
    Math.min(experienceBullets * 3, 18) +
    Math.min(skillsCount * 2, 10) +
    Math.min(educationCount * 8, 8) +
    Math.min(certificationsCount * 4, 8) +
    Math.min(customCount * 2, 14)
  );

  const suggestions = [];
  if (!hasSummary) suggestions.push('Add a stronger profile summary.');
  if (experienceBullets < 6) suggestions.push('Expand impact bullets to improve recruiter scanability.');
  if (skillsCount < 6) suggestions.push('List more core skills for better ATS coverage.');
  if (!educationCount) suggestions.push('Add education for a more balanced layout.');
  if (!(data?.customSections?.length || 0)) suggestions.push('Use one extra section like Projects, Awards, or Languages.');

  return {
    score,
    label: score >= 86 ? 'Excellent' : score >= 72 ? 'Strong' : score >= 58 ? 'Good base' : 'Needs polish',
    suggestions: suggestions.slice(0, 3),
  };
}
