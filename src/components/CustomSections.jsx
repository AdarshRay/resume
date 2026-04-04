import SideSection from './SideSection';
import MainSection from './MainSection';

export default function CustomSections({ sections, placement, onEdit, textColor, headingColor, bodyColor, accentColor }) {
  const filtered = sections.filter(s => (s.placement || 'main') === placement);
  if (!filtered.length) return null;

  return filtered.map(sec =>
    placement === 'side' ? (
      <SideSection key={sec.id} section={sec} onEdit={onEdit} textColor={textColor} accentColor={accentColor} />
    ) : (
      <MainSection key={sec.id} section={sec} onEdit={onEdit} headingColor={headingColor} bodyColor={bodyColor} accentColor={accentColor} />
    )
  );
}
