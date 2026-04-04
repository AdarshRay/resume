export default function DeleteButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      onMouseDown={e => e.stopPropagation()}
      className="text-[10px] opacity-0 group-hover/item:opacity-60 hover:!opacity-100 transition-opacity shrink-0 ml-1"
      style={{ color: '#F43F5E' }}
    >
      ✕
    </button>
  );
}
