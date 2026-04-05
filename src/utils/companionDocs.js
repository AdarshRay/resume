function firstSentence(text) {
  const cleaned = String(text || '').trim();
  if (!cleaned) return '';
  const match = cleaned.match(/[^.!?]+[.!?]?/);
  return (match?.[0] || cleaned).trim();
}

function pickKeywords(report, count = 4) {
  return (report?.matchedKeywords || report?.missingKeywords || []).slice(0, count);
}

export function buildCoverLetter(data, jobDescription, report) {
  const name = data?.name || 'Candidate';
  const title = data?.title || 'professional';
  const summaryLead = firstSentence(data?.summary);
  const companyHint = String(jobDescription || '').match(/(?:at|with|join)\s+([A-Z][A-Za-z0-9&.\- ]{2,40})/)?.[1] || 'your team';
  const experienceLead = data?.experience?.[0];
  const keywords = pickKeywords(report, 4);

  const paragraphOne = `Dear Hiring Team,\n\nI am excited to apply for the ${title} opportunity with ${companyHint}. ${summaryLead || `${name} brings a track record of delivering clear, high-impact work across complex projects.`}`;
  const paragraphTwo = experienceLead
    ? `In my recent work as ${experienceLead.role || title}${experienceLead.company ? ` at ${experienceLead.company}` : ''}, I have focused on ${keywords.length ? keywords.join(', ') : 'building measurable business outcomes and polished execution'}. My background combines hands-on delivery, structured communication, and the ability to turn ambiguous goals into results that stakeholders can trust.`
    : `My background combines hands-on delivery, structured communication, and the ability to turn ambiguous goals into results that stakeholders can trust.`;
  const paragraphThree = `What stands out to me about this role is the chance to contribute with both precision and momentum. I would welcome the opportunity to bring a thoughtful, execution-focused approach to ${companyHint} and help advance the priorities outlined in the role.\n\nThank you for your time and consideration.\n\n${name}`;

  return [paragraphOne, paragraphTwo, paragraphThree].join('\n\n').trim();
}

export function buildLinkedInSummary(data, jobDescription, report) {
  const title = data?.title || 'Professional';
  const summary = String(data?.summary || '').trim();
  const skills = Array.isArray(data?.skills) ? data.skills.filter(Boolean).slice(0, 8) : [];
  const experienceLead = data?.experience?.[0];
  const keywords = pickKeywords(report, 5);

  const opening = summary || `${title} focused on turning complex work into clear, high-value outcomes.`;
  const middle = experienceLead
    ? `Recently focused on ${experienceLead.role || title}${experienceLead.company ? ` at ${experienceLead.company}` : ''}, with work spanning ${keywords.length ? keywords.join(', ') : 'strategy, execution, and stakeholder alignment'}.`
    : `Known for combining strategy, execution, and stakeholder alignment in fast-moving environments.`;
  const closing = skills.length
    ? `Core strengths include ${skills.join(', ')}. Open to conversations around roles where thoughtful execution and strong communication matter.`
    : `Open to conversations around roles where thoughtful execution and strong communication matter.`;

  return [opening, middle, closing].join(' ').trim();
}
