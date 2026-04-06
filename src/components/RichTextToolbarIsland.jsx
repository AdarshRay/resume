import { useRichTextToolbar } from './useRichTextToolbar';

function ToolbarButton({ active = false, label, onMouseDown, children }) {
  return (
    <button
      type="button"
      className={`nav-rich-btn${active ? ' nav-rich-btn--active' : ''}`}
      aria-label={label}
      title={label}
      onMouseDown={onMouseDown}
    >
      {children}
    </button>
  );
}

function ScopeChip({ active, children }) {
  return (
    <span className={`nav-rich-scope${active ? ' nav-rich-scope--active' : ''}`}>
      {children}
    </span>
  );
}

export default function RichTextToolbarIsland() {
  const toolbar = useRichTextToolbar();

  if (!toolbar?.isVisible) return null;

  const {
    state,
    fontOptions,
    colorOptions,
    bulletOptions,
    exec,
    applyFontFamily,
    applyColor,
    nudgeFontSize,
    applyExactFontSize,
    applyBulletStyle,
    clearFormatting,
    beginToolbarInteraction,
    endToolbarInteraction,
  } = toolbar;

  const preventBlur = (handler) => (event) => {
    event.preventDefault();
    event.stopPropagation();
    handler?.(event);
  };

  return (
    <div className="nav-rich-island">
      <div className="nav-rich-island-pill">
        <span className="nav-rich-label">Text Tools</span>

        <div className="nav-rich-divider" />

        <ToolbarButton label="Bold" active={state.bold} onMouseDown={preventBlur(() => exec('bold'))}>
          B
        </ToolbarButton>
        <ToolbarButton label="Italic" active={state.italic} onMouseDown={preventBlur(() => exec('italic'))}>
          <span style={{ fontStyle: 'italic' }}>I</span>
        </ToolbarButton>
        <ToolbarButton label="Underline" active={state.underline} onMouseDown={preventBlur(() => exec('underline'))}>
          <span style={{ textDecoration: 'underline' }}>U</span>
        </ToolbarButton>

        <div className="nav-rich-divider" />

        <div className="nav-rich-scope-group">
          <ScopeChip active={state.hasSelection}>Selection</ScopeChip>
          <ScopeChip active={!state.hasSelection}>Block</ScopeChip>
        </div>

        <div className="nav-rich-divider" />

        <label className="nav-rich-select-wrap">
          <span>Font</span>
          <select
            className="nav-rich-select"
            value={fontOptions.some((item) => state.fontName?.includes(item.label)) ? fontOptions.find((item) => state.fontName?.includes(item.label)).value : ''}
            onMouseDown={() => beginToolbarInteraction?.()}
            onChange={(event) => {
              applyFontFamily(event.target.value);
              endToolbarInteraction?.();
            }}
            onBlur={() => endToolbarInteraction?.()}
          >
            <option value="">Template</option>
            {fontOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <div className="nav-rich-stepper">
          <ToolbarButton label="Decrease font size" onMouseDown={preventBlur(() => nudgeFontSize(-1))}>A-</ToolbarButton>
          <label className="nav-rich-size-readout">
            <input
              type="number"
              min="8"
              max="72"
              value={state.fontSize || 14}
              onChange={(event) => applyExactFontSize(event.target.value)}
              onMouseDown={() => beginToolbarInteraction?.()}
              onBlur={() => endToolbarInteraction?.()}
            />
            <span>px</span>
          </label>
          <ToolbarButton label="Increase font size" onMouseDown={preventBlur(() => nudgeFontSize(1))}>A+</ToolbarButton>
        </div>

        <label className="nav-rich-color">
          <input
            type="color"
            value={/^#/.test(state.color || '') ? state.color : '#1f2937'}
            onMouseDown={() => beginToolbarInteraction?.()}
            onChange={(event) => {
              applyColor(event.target.value);
              endToolbarInteraction?.();
            }}
            onBlur={() => endToolbarInteraction?.()}
          />
        </label>

        <label className="nav-rich-select-wrap nav-rich-select-wrap--bullet">
          <span>Bullet</span>
          <select
            className="nav-rich-select"
            value={state.bulletGlyph || 'auto'}
            onMouseDown={() => beginToolbarInteraction?.()}
            onChange={(event) => {
              applyBulletStyle(event.target.value);
              endToolbarInteraction?.();
            }}
            onBlur={() => endToolbarInteraction?.()}
          >
            {bulletOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <div className="nav-rich-swatches">
          {colorOptions.map((color) => (
            <button
              key={color}
              type="button"
              className="nav-rich-swatch"
              style={{ background: color }}
              onMouseDown={preventBlur(() => applyColor(color))}
              aria-label={`Apply ${color} text color`}
              title={color}
            />
          ))}
        </div>

        <div className="nav-rich-divider" />

        <ToolbarButton label="Clear formatting" onMouseDown={preventBlur(() => clearFormatting())}>
          Clear
        </ToolbarButton>
      </div>
    </div>
  );
}
