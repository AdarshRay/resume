const DEFAULT_PARSE_MODEL = 'claude-sonnet-4-20250514';

function buildResumeParsePrompt(text) {
  return `You are an expert resume parser. Your job is to extract EVERY piece of information from the document below. Do NOT skip or summarize anything - include ALL job roles, ALL bullet points, ALL skills, ALL education entries, ALL certifications.

Return ONLY valid JSON (no backticks, no markdown, no explanation) matching this exact schema:
{"name":"Full Name","title":"Job Title","email":"","phone":"","location":"City, State","summary":"2-3 sentence professional summary","experience":[{"role":"Job Title","company":"Company Name","period":"Start - End","bullets":["Achievement 1","Achievement 2"]}],"skills":["Skill 1","Skill 2"],"education":[{"degree":"Degree Name","school":"School Name","year":"Year or range"}],"certifications":["Cert 1"],"customSections":[{"title":"Contact Details","placement":"side","items":["item 1","item 2"]}]}

CRITICAL RULES:
- Extract EVERY job/role listed, not just the most recent
- Include ALL bullet points for each job exactly as written
- List ALL skills mentioned anywhere in the document
- Include ALL education entries
- Include ALL certifications and licenses under certifications
- Put awards, achievements, projects, languages, strengths, hobbies, references, declaration, and contact/personal details into customSections instead of misplacing them into summary or experience
- Use empty string "" for genuinely missing fields, never skip a field
- If no summary exists, write a professional 2-3 sentence summary based on the experience
- Keep the original wording - do not rephrase or shorten bullet points
- Never place email, phone, address, links, or references inside summary
- Never place education lines into experience or experience lines into education
- customSections placement must be "side" for contact details, languages, strengths, hobbies, declaration, and references; use "main" for awards, projects, volunteering, publications, training, and leadership

Document to parse:
${text}`;
}

export async function requestAnthropicResumeParse({
  apiKey,
  text,
  model = DEFAULT_PARSE_MODEL,
  timeoutMs = 20000,
}) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller
    ? globalThis.setTimeout(() => controller.abort(), timeoutMs)
    : null;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      signal: controller?.signal,
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: buildResumeParsePrompt(text),
        }],
      }),
    });

    const result = await response.json();
    const content = result?.content?.[0]?.text || '{}';
    return JSON.parse(content);
  } finally {
    if (timeoutId) globalThis.clearTimeout(timeoutId);
  }
}

export { DEFAULT_PARSE_MODEL };
