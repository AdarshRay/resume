const PLAIN_PREFIX = '__plain__::';
const BULLET_PREFIX = '__bullet__::';
const BULLET_PATTERN = /^[-*•◦▸—✓>]\s*/;

function normalizeMultilineInput(value = '') {
  const raw = String(value || '');
  if (!/<[^>]+>/.test(raw)) {
    return raw;
  }

  const temp = document.createElement('div');
  temp.innerHTML = raw;
  temp.querySelectorAll('br').forEach((node) => node.replaceWith(document.createTextNode('\n')));
  temp.querySelectorAll('div,p,li').forEach((node) => {
    if (node.parentElement !== temp) return;
    node.appendChild(document.createTextNode('\n'));
  });
  return temp.innerText || temp.textContent || '';
}

export function parseBulletBlock(value = '') {
  return normalizeMultilineInput(value)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const bulletMatch = line.match(/^([-*•◦▸—✓>])\s*(.*)$/);
      if (bulletMatch) {
        const [, glyph, text] = bulletMatch;
        return `${BULLET_PREFIX}${glyph}::${text.trim()}`;
      }
      return `${PLAIN_PREFIX}${line}`;
    })
    .filter(Boolean);
}

export function bulletBlockValue(items = [], glyph = '•') {
  return (items || [])
    .map((item) => {
      if (typeof item !== 'string') return '';
      if (item.startsWith(PLAIN_PREFIX)) return item.slice(PLAIN_PREFIX.length);
      if (item.startsWith(BULLET_PREFIX)) {
        const [, storedGlyph = glyph, text = ''] = item.split('::');
        return `${storedGlyph || glyph} ${text}`.trim();
      }
      return `${glyph} ${item}`.trim();
    })
    .filter(Boolean)
    .join('\n');
}

export function isPlainBulletLine(item = '') {
  return typeof item === 'string' && item.startsWith(PLAIN_PREFIX);
}

export function stripPlainBulletPrefix(item = '') {
  return isPlainBulletLine(item) ? item.slice(PLAIN_PREFIX.length) : item;
}

export function isStoredBulletLine(item = '') {
  return typeof item === 'string' && item.startsWith(BULLET_PREFIX);
}

export function extractStoredBulletGlyph(item = '', fallback = '•') {
  if (!isStoredBulletLine(item)) return fallback;
  return item.split('::')[1] || fallback;
}
