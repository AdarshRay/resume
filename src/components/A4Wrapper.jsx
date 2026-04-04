import { useRef, useState, useEffect } from 'react';

const A4W = 794;
const A4H = 1123;
const PAGE_GAP = 40;

export default function A4Wrapper({ children, pageContents = {}, extraPages = 0, onAddPage, pageLayoutModes = {}, setPageLayoutModes, pageSidebarVisible = {}, setPageSidebarVisible }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.6);

  const hasExtraContent = extraPages > 0 || Object.keys(pageContents).length > 0;
  const totalPages = Math.max(hasExtraContent ? 2 : 1, 1 + extraPages);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const cw = containerRef.current.offsetWidth - 48;
        setScale(Math.min(1, cw / A4W));
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Total unscaled height: pages + gaps between them
  const totalH = totalPages * A4H + (totalPages - 1) * PAGE_GAP;

  return (
    <div
      ref={containerRef}
      className="canvas-container flex flex-col items-center"
      style={{ padding: '32px 24px 48px' }}
    >
      {/* Page counter */}
      <div className="canvas-page-badge">
        {totalPages} page{totalPages > 1 ? 's' : ''} &middot; A4
      </div>

      {/* Scaled wrapper — single transform for all pages */}
      <div
        style={{
          width: A4W,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          marginBottom: -(totalH * (1 - scale)) + 'px',
          marginRight: -(A4W * (1 - scale)) + 'px',
        }}
      >
        {Array.from({ length: totalPages }, (_, pageIndex) => (
          <div key={pageIndex}>
            {/* Fixed-height A4 page */}
            <div
              id={pageIndex === 0 ? 'resume-content' : `resume-page-${pageIndex + 1}`}
              className="a4-page"
              style={{
                width: A4W,
                height: A4H,
                position: 'relative',
                background: '#ffffff',
                overflow: 'hidden',
              }}
            >
              {pageIndex === 0 ? (
                children
              ) : pageContents[pageIndex + 1] ? (
                pageContents[pageIndex + 1]
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#d0d4da',
                    fontSize: 12,
                    fontFamily: "'Outfit',sans-serif",
                    letterSpacing: '0.02em',
                  }}
                >
                  Page {pageIndex + 1}
                </div>
              )}

            </div>

            {/* Page label + layout toggle between pages */}
            {pageIndex < totalPages - 1 && (
              <div className="canvas-page-divider">
                <span className="canvas-page-label">
                  Page {pageIndex + 2}
                </span>
                {setPageLayoutModes && (
                  <LayoutToggle
                    pageNum={pageIndex + 2}
                    mode={pageLayoutModes[pageIndex + 2] || 'same-as-primary'}
                    onChange={(mode) => setPageLayoutModes(prev => ({ ...prev, [pageIndex + 2]: mode }))}
                  />
                )}
                {setPageSidebarVisible && (pageLayoutModes[pageIndex + 2] || 'same-as-primary') === 'same-as-primary' && (
                  <SidebarToggle
                    visible={pageSidebarVisible[pageIndex + 2] !== false}
                    onChange={(v) => setPageSidebarVisible(prev => ({ ...prev, [pageIndex + 2]: v }))}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Page button */}
      {onAddPage && (
        <button
          onClick={onAddPage}
          className="canvas-add-page-btn"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Page
        </button>
      )}
    </div>
  );
}

/* ── Sidebar visibility toggle ── */
function SidebarToggle({ visible, onChange }) {
  return (
    <button
      onClick={() => onChange(!visible)}
      className="canvas-toggle-btn"
      style={{
        color: visible ? 'var(--c-accent)' : 'var(--c-text-dim)',
        background: visible ? 'var(--c-accent-surface)' : 'var(--c-white-a06)',
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="9" y1="3" x2="9" y2="21" />
      </svg>
      {visible ? 'Sidebar On' : 'Sidebar Off'}
    </button>
  );
}

/* ── Minimal layout mode toggle ── */
function LayoutToggle({ mode, onChange }) {
  const options = [
    { value: 'full-width', label: 'Full Width' },
    { value: 'same-as-primary', label: 'Same as First Page' },
  ];

  return (
    <div className="canvas-layout-toggle">
      {options.map(opt => {
        const active = mode === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="canvas-layout-toggle-btn"
            style={{
              fontWeight: active ? 600 : 400,
              color: active ? 'var(--c-accent)' : 'var(--c-text-dim)',
              background: active ? 'var(--c-accent-surface)' : 'transparent',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
