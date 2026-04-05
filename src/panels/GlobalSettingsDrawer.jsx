import FontPanel from './FontPanel';
import ColorPanel from './ColorPanel';
import StylesPanel from './StylesPanel';

export default function GlobalSettingsDrawer({
  open,
  onClose,
  globalFont,
  setGlobalFont,
  colors,
  setColors,
  defaults,
  skillStyle,
  setSkillStyle,
  contactStyle,
  setContactStyle,
  educationStyle,
  setEducationStyle,
  certificationStyle,
  setCertificationStyle,
}) {
  if (!open) return null;

  return (
    <div className="editor-drawer-layer">
      <button
        type="button"
        className="editor-drawer-backdrop"
        onClick={onClose}
        aria-label="Close global settings"
      />
      <aside className="editor-global-drawer" aria-label="Global settings drawer">
        <div className="editor-global-drawer__header">
          <div>
            <span className="editor-score-eyebrow">Global Settings</span>
            <h3>Resume-wide design controls</h3>
            <p>Adjust typography, palette, and unified style presets from one premium drawer.</p>
          </div>
          <button type="button" className="editor-global-drawer__close" onClick={onClose} aria-label="Close global settings">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="editor-global-drawer__body">
          <section className="global-settings-block">
            <div className="global-settings-head">
              <span className="global-settings-title">Typography</span>
              <span className="global-settings-copy">Set the global type size and family used across the resume.</span>
            </div>
            <FontPanel globalFont={globalFont} setGlobalFont={setGlobalFont} />
          </section>

          <section className="global-settings-block">
            <div className="global-settings-head">
              <span className="global-settings-title">Palette</span>
              <span className="global-settings-copy">Control accent, background, text, and structural colors.</span>
            </div>
            <ColorPanel colors={colors} setColors={setColors} defaults={defaults} />
          </section>

          <section className="global-settings-block">
            <div className="global-settings-head">
              <span className="global-settings-title">Styles</span>
              <span className="global-settings-copy">One unified list of curated, non-duplicate styles for every major resume section type.</span>
            </div>
            <StylesPanel
              skillStyle={skillStyle}
              setSkillStyle={setSkillStyle}
              contactStyle={contactStyle}
              setContactStyle={setContactStyle}
              educationStyle={educationStyle}
              setEducationStyle={setEducationStyle}
              certificationStyle={certificationStyle}
              setCertificationStyle={setCertificationStyle}
            />
          </section>
        </div>
      </aside>
    </div>
  );
}
