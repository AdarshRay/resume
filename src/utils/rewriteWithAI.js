import { getAIRewriteEndpoint } from './aiConfig';

const REWRITE_TIMEOUT_MS = 12000;

function normalizeLines(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function polishSentence(text) {
  const cleaned = String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();
  if (!cleaned) return '';
  const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

export function fallbackRewrite(text, scope = 'section') {
  const lines = normalizeLines(text);
  if (!lines.length) return '';

  if (scope === 'summary') {
    const merged = polishSentence(lines.join(' '));
    return merged
      .replace(/\bworking at\b/gi, 'delivering results at')
      .replace(/\bwith\b/gi, 'with strong')
      .replace(/\bresponsible for\b/gi, 'Known for');
  }

  if (scope === 'bullets' || scope === 'section') {
    return lines
      .map((line) => polishSentence(line)
        .replace(/\bworked on\b/gi, 'Led')
        .replace(/\bcreated\b/gi, 'Built')
        .replace(/\bhelped\b/gi, 'Supported')
        .replace(/\bused\b/gi, 'Applied')
      )
      .join('\n');
  }

  return lines.map(polishSentence).join('\n');
}

export async function rewriteTextWithAI(text, { scope = 'section', context = '' } = {}) {
  const cleaned = String(text || '').trim();
  if (!cleaned) return cleaned;

  const rewriteEndpoint = getAIRewriteEndpoint();
  if (!rewriteEndpoint) return fallbackRewrite(cleaned, scope);

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller
    ? globalThis.setTimeout(() => controller.abort(), REWRITE_TIMEOUT_MS)
    : null;

  try {
    const instructions = {
      summary: 'Rewrite this resume summary so it sounds premium, concise, and credible. Keep it to 2-3 strong sentences.',
      bullets: 'Rewrite these resume bullets to sound more polished and outcome-driven. Preserve truth and meaning. Return one bullet per line without adding commentary.',
      section: 'Rewrite this resume section so it sounds cleaner, sharper, and more professional. Keep the same facts. Return only the rewritten text.',
      resume: 'Rewrite this full resume draft to sound more polished and premium while preserving factual accuracy. Return plain text only.',
    };

    const response = await fetch(rewriteEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller?.signal,
      body: JSON.stringify({
        scope,
        context,
        prompt: instructions[scope] || instructions.section,
        text: cleaned,
      }),
    });

    if (!response.ok) {
      throw new Error(`Rewrite endpoint failed with ${response.status}`);
    }

    const result = await response.json().catch(() => ({}));
    const rewritten = result?.text?.trim() || result?.output?.trim() || result?.content?.[0]?.text?.trim();
    return rewritten || fallbackRewrite(cleaned, scope);
  } catch (error) {
    console.error('Rewrite endpoint failed, using built-in fallback:', error);
    return fallbackRewrite(cleaned, scope);
  } finally {
    if (timeoutId) globalThis.clearTimeout(timeoutId);
  }
}
