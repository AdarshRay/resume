import DOMPurify from 'dompurify';

const ALLOWED_TAGS = ['b', 'strong', 'i', 'em', 'u', 'span', 'br', 'div', 'p', 'ul', 'ol', 'li', 'font'];
const ALLOWED_ATTR = ['style'];

const STYLE_PROPERTY_ALLOWLIST = new Set([
  'color',
  'font-size',
  'font-family',
  'font-weight',
  'font-style',
  'text-decoration',
  'text-decoration-line',
]);

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanStyleAttribute(styleText = '') {
  return String(styleText)
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [property, ...rest] = entry.split(':');
      if (!property || rest.length === 0) return '';
      const normalizedProperty = property.trim().toLowerCase();
      if (!STYLE_PROPERTY_ALLOWLIST.has(normalizedProperty)) return '';
      return `${normalizedProperty}: ${rest.join(':').trim()}`;
    })
    .filter(Boolean)
    .join('; ');
}

function sanitizeNodeStyles(root) {
  root.querySelectorAll('[style]').forEach((node) => {
    const nextStyle = cleanStyleAttribute(node.getAttribute('style'));
    if (nextStyle) node.setAttribute('style', nextStyle);
    else node.removeAttribute('style');
  });
}

function normalizeMultilineTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let current = walker.nextNode();
  while (current) {
    if (current.nodeValue?.includes('\n')) {
      textNodes.push(current);
    }
    current = walker.nextNode();
  }

  textNodes.forEach((node) => {
    const parts = String(node.nodeValue || '').split('\n');
    const fragment = document.createDocumentFragment();
    parts.forEach((part, index) => {
      if (part) {
        fragment.appendChild(document.createTextNode(part));
      }
      if (index < parts.length - 1) {
        fragment.appendChild(document.createElement('br'));
      }
    });
    node.replaceWith(fragment);
  });
}

function extractMultilinePlainText(root) {
  const clone = root.cloneNode(true);
  clone.querySelectorAll('br').forEach((node) => node.replaceWith(document.createTextNode('\n')));
  return (clone.textContent || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function sanitizeRichText(value, { multiline = false } = {}) {
  const raw = String(value || '');
  if (!raw) return '';

  const html = /<[^>]+>/.test(raw)
    ? raw
    : escapeHtml(raw).replace(/\n/g, multiline ? '<br>' : ' ');

  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });

  const temp = document.createElement('div');
  temp.innerHTML = sanitized;
  sanitizeNodeStyles(temp);

  if (multiline) {
    normalizeMultilineTextNodes(temp);
  }

  if (!multiline) {
    temp.querySelectorAll('br').forEach((node) => node.replaceWith(document.createTextNode(' ')));
  }

  return temp.innerHTML;
}

export function serializeRichText(element, { multiline = false } = {}) {
  if (!element) return '';

  const temp = document.createElement('div');
  temp.innerHTML = sanitizeRichText(element.innerHTML, { multiline });

  if (multiline) {
    normalizeMultilineTextNodes(temp);
    temp.querySelectorAll('div').forEach((node) => {
      if (node.parentElement !== temp) return;
      if (node.nextSibling) node.insertAdjacentHTML('afterend', '<br>');
      node.replaceWith(...Array.from(node.childNodes));
    });
    temp.querySelectorAll('p').forEach((node) => {
      if (node.parentElement !== temp) return;
      if (node.nextSibling) node.insertAdjacentHTML('afterend', '<br>');
      node.replaceWith(...Array.from(node.childNodes));
    });
  } else {
    temp.querySelectorAll('br,div,p,ul,ol,li').forEach((node) => {
      node.replaceWith(document.createTextNode(node.textContent || ''));
    });
  }

  sanitizeNodeStyles(temp);

  const html = temp.innerHTML
    .replace(/&nbsp;/g, ' ')
    .replace(/\s*(<br\s*\/?>\s*){3,}/gi, '<br><br>')
    .trim();

  const plainText = multiline
    ? extractMultilinePlainText(temp)
    : (temp.textContent || '').replace(/\s+/g, ' ').trim();

  const hasFormatting = /<(?!br\b)[a-z][^>]*>/i.test(html) || /style=/i.test(html);

  if (!hasFormatting) {
    return multiline ? plainText.replace(/\n{3,}/g, '\n\n') : plainText;
  }

  return html;
}

export function isSelectionInside(element) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !element) return false;
  const anchorNode = selection.anchorNode;
  return !!anchorNode && element.contains(anchorNode);
}
