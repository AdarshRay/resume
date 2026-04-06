export default function AddButton({ onClick, label = 'Add' }) {
  return (
    <button
      onClick={onClick}
      onMouseDown={e => e.stopPropagation()}
      className="text-[10px] font-medium transition-opacity opacity-40 hover:opacity-100"
      style={{ color: '#00E5A0' }}
    >
      + {label}
    </button>
  );
}
