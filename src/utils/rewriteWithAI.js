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

function fallbackRewrite(text, scope = 'section') {
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

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) return fallbackRewrite(cleaned, scope);

  try {
    const instructions = {
      summary: 'Rewrite this resume summary so it sounds premium, concise, and credible. Keep it to 2-3 strong sentences.',
      bullets: 'Rewrite these resume bullets to sound more polished and outcome-driven. Preserve truth and meaning. Return one bullet per line without adding commentary.',
      section: 'Rewrite this resume section so it sounds cleaner, sharper, and more professional. Keep the same facts. Return only the rewritten text.',
      resume: 'Rewrite this full resume draft to sound more polished and premium while preserving factual accuracy. Return plain text only.',
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        messages: [
          {
            role: 'user',
            content: `${instructions[scope] || instructions.section}\n${context ? `Context: ${context}\n` : ''}\nText:\n${cleaned}`,
          },
        ],
      }),
    });

    const result = await response.json();
    const rewritten = result?.content?.[0]?.text?.trim();
    return rewritten || fallbackRewrite(cleaned, scope);
  } catch (error) {
    console.error('AI rewrite failed, using fallback:', error);
    return fallbackRewrite(cleaned, scope);
  }
}
