const REWRITE_ENDPOINT = String(import.meta.env.VITE_AI_REWRITE_ENDPOINT || '').trim();

export function getAIRewriteEndpoint() {
  return REWRITE_ENDPOINT;
}

export function isAIRewriteConfigured() {
  return REWRITE_ENDPOINT.length > 0;
}

export function getRewriteModeLabel() {
  return isAIRewriteConfigured() ? 'AI-assisted rewrite' : 'Built-in rewrite';
}

export function getRewriteModeDescription() {
  if (isAIRewriteConfigured()) {
    return 'Network-backed rewrite assistance is available for summaries, bullets, and companion copy.';
  }
  return 'Using built-in rewrite heuristics. Add VITE_AI_REWRITE_ENDPOINT to enable network-backed rewriting.';
}
