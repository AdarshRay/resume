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

export function splitPlainBlock(value = '') {
  return normalizeMultilineInput(value)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function plainBlockValue(items = []) {
  return (items || []).filter(Boolean).join('\n');
}

export function syncIndexedList(currentItems = [], nextItems = [], handlers = {}) {
  const {
    changeItem,
    addItem,
    deleteItem,
  } = handlers;

  nextItems.forEach((value, index) => {
    if (currentItems[index] !== undefined) {
      changeItem?.(index, value);
    } else {
      addItem?.();
    }
  });

  nextItems.forEach((value, index) => {
    if (currentItems[index] === undefined) {
      changeItem?.(index, value);
    }
  });

  for (let index = currentItems.length - 1; index >= nextItems.length; index -= 1) {
    deleteItem?.(index);
  }
}
