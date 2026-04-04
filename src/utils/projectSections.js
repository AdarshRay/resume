export function isStructuredProjectSection(section) {
  if (!section || typeof section !== 'object') return false;
  if (section.kind === 'project-list') return true;
  return Array.isArray(section.items) && section.items.some((item) => (
    item &&
    typeof item === 'object' &&
    (
      item.type === 'project-entry' ||
      item.overview ||
      item.clients ||
      item.detailIntro ||
      Array.isArray(item.detailItems)
    )
  ));
}
