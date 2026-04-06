import EditableText from './EditableText';
import AddButton from './AddButton';
import DeleteButton from './DeleteButton';

function splitProjectLines(value, allowComma = false) {
  const source = String(value || '');
  const parts = allowComma ? source.split(/\n|,/) : source.split('\n');
  return parts
    .map((item) => item.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);
}

export default function ProjectSection({
  section,
  onEdit,
  tone = 'main',
  headingColor = '#1a1a2e',
  bodyColor = '#4b5563',
  accentColor = '#C9A84C',
  fontSize = 10,
  mutedColor,
}) {
  const isSide = tone === 'side';
  const metaColor = mutedColor || bodyColor;
  const titleSize = fontSize + (isSide ? 1 : 3);
  const bodySize = fontSize + (isSide ? 0 : 1);
  const metaSize = fontSize - (isSide ? 0 : 0);
  const cardGap = isSide ? 12 : 16;
  const borderColor = `${accentColor}40`;

  const updateField = (projectIndex, key, value) => {
    onEdit('custom_item_field', { id: section.id, j: projectIndex, key, value });
  };

  const updateDetailField = (projectIndex, detailIndex, key, value) => {
    onEdit('custom_item_detail_field', { id: section.id, j: projectIndex, k: detailIndex, key, value });
  };

  return (
    <div style={{ marginBottom: isSide ? 12 : 14 }}>
      {section.title !== '' && (
        <EditableText
          value={section.title}
          onChange={(v) => onEdit('custom_section_rename', { id: section.id, v })}
          tag={isSide ? 'h3' : 'h2'}
          className={isSide ? 'text-[10px] font-bold uppercase tracking-widest' : 'text-[11px] font-bold uppercase tracking-wider'}
          style={{ color: isSide ? accentColor : headingColor, marginBottom: 8 }}
        />
      )}

      {(section.items || []).map((item, projectIndex) => {
        const clients = splitProjectLines(item?.clients, true);
        const detailItems = Array.isArray(item?.detailItems) ? item.detailItems : [];
        const extraBullets = Array.isArray(item?.bullets) ? item.bullets : [];
        const showMeta = item?.company || item?.client || item?.timeline;
        const showClients = clients.length > 0;
        const showDetails = detailItems.some((detail) => detail?.label || detail?.details);
        const showExtraBullets = extraBullets.length > 0;
        const clientEditorValue = clients.map((client) => `- ${client}`).join('\n');
        const bulletEditorValue = extraBullets.map((bullet) => `- ${bullet}`).join('\n');

        return (
          <div
            key={`project-${projectIndex}`}
            style={{
              marginBottom: cardGap,
              paddingBottom: projectIndex < (section.items || []).length - 1 ? (isSide ? 10 : 12) : 0,
              borderBottom: projectIndex < (section.items || []).length - 1 ? `1px solid ${borderColor}` : 'none',
            }}
          >
            <div className="group/item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <EditableText
                  value={item?.name || `Project ${projectIndex + 1}`}
                  onChange={(v) => updateField(projectIndex, 'name', v)}
                  tag={isSide ? 'p' : 'h3'}
                  style={{
                    margin: 0,
                    color: headingColor,
                    fontSize: titleSize,
                    fontWeight: 800,
                    lineHeight: 1.18,
                  }}
                />
                {!!item?.timeline && (
                  <EditableText
                    value={item.timeline}
                    onChange={(v) => updateField(projectIndex, 'timeline', v)}
                    tag="span"
                    style={{ color: metaColor, fontSize: metaSize, flexShrink: 0 }}
                  />
                )}
              </div>

              {showMeta && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 4 }}>
                  {!!item?.company && (
                    <span style={{ color: metaColor, fontSize: metaSize }}>
                      <strong style={{ color: headingColor }}>Company:</strong>{' '}
                      <EditableText
                        value={item.company}
                        onChange={(v) => updateField(projectIndex, 'company', v)}
                        tag="span"
                        style={{ color: metaColor, fontSize: metaSize }}
                      />
                    </span>
                  )}
                  {!!item?.client && (
                    <span style={{ color: metaColor, fontSize: metaSize }}>
                      <strong style={{ color: headingColor }}>Client:</strong>{' '}
                      <EditableText
                        value={item.client}
                        onChange={(v) => updateField(projectIndex, 'client', v)}
                        tag="span"
                        style={{ color: metaColor, fontSize: metaSize }}
                      />
                    </span>
                  )}
                </div>
              )}

              {showClients && (
                <div style={{ marginTop: 10 }}>
                  <EditableText
                    value={item?.clientsLabel || 'Clients'}
                    onChange={(v) => updateField(projectIndex, 'clientsLabel', v)}
                    tag="p"
                    style={{ margin: '0 0 6px 0', color: headingColor, fontWeight: 700, fontSize: bodySize }}
                  />
                  <EditableText
                    value={clientEditorValue}
                    onChange={(v) => updateField(projectIndex, 'clients', splitProjectLines(v).join('\n'))}
                    tag="div"
                    multiline
                    style={{
                      whiteSpace: 'pre-line',
                      color: bodyColor,
                      fontSize: bodySize,
                      lineHeight: 1.55,
                      border: `1px dashed ${borderColor}`,
                      borderRadius: 8,
                      padding: isSide ? '8px 10px' : '10px 12px',
                      columnCount: !isSide && clients.length > 4 ? 2 : 1,
                      columnGap: 24,
                    }}
                  />
                </div>
              )}

              {!!item?.overview && (
                <EditableText
                  value={item.overview}
                  onChange={(v) => updateField(projectIndex, 'overview', v)}
                  tag="p"
                  multiline
                  style={{ margin: '10px 0 0 0', color: bodyColor, fontSize: bodySize, lineHeight: 1.58 }}
                />
              )}

              {!!item?.detailIntro && (
                <EditableText
                  value={item.detailIntro}
                  onChange={(v) => updateField(projectIndex, 'detailIntro', v)}
                  tag="p"
                  multiline
                  style={{ margin: '10px 0 0 0', color: bodyColor, fontSize: bodySize, lineHeight: 1.58 }}
                />
              )}

              {showDetails && (
                <div style={{ marginTop: 10 }}>
                  {detailItems.map((detail, detailIndex) => {
                    if (!detail?.label && !detail?.details) return null;
                    return (
                      <div key={`project-${projectIndex}-detail-${detailIndex}`} className="group/item" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                        <span style={{ color: accentColor, fontSize: 8, marginTop: 6, flexShrink: 0 }}>&#9679;</span>
                        <div style={{ flex: 1, color: bodyColor, fontSize: bodySize, lineHeight: 1.55 }}>
                          <EditableText
                            value={detail.label || 'Label'}
                            onChange={(v) => updateDetailField(projectIndex, detailIndex, 'label', v)}
                            tag="span"
                            style={{ color: headingColor, fontWeight: 700, fontSize: bodySize }}
                          />
                          <span style={{ color: headingColor, fontWeight: 700 }}>:</span>{' '}
                          <EditableText
                            value={detail.details || 'Describe the workstream'}
                            onChange={(v) => updateDetailField(projectIndex, detailIndex, 'details', v)}
                            tag="span"
                            multiline
                            style={{ color: bodyColor, fontSize: bodySize, lineHeight: 1.55 }}
                          />
                        </div>
                        <DeleteButton onClick={() => onEdit('custom_item_detail_del', { id: section.id, j: projectIndex, k: detailIndex })} />
                      </div>
                    );
                  })}
                </div>
              )}

              {(item?.bulletSectionTitle || showExtraBullets) && (
                <div style={{ marginTop: 10 }}>
                  {!!item?.bulletSectionTitle && (
                    <EditableText
                      value={item.bulletSectionTitle}
                      onChange={(v) => updateField(projectIndex, 'bulletSectionTitle', v)}
                      tag="p"
                      style={{ margin: '0 0 6px 0', color: headingColor, fontWeight: 700, fontSize: bodySize }}
                    />
                  )}
                  {showExtraBullets && (
                    <EditableText
                      value={bulletEditorValue}
                      onChange={(v) => updateField(projectIndex, 'bullets', splitProjectLines(v).map((line) => line.replace(/^[-*•]\s*/, '')))}
                      tag="div"
                      multiline
                      style={{ whiteSpace: 'pre-line', color: bodyColor, fontSize: bodySize, lineHeight: 1.55 }}
                    />
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 2, flexWrap: 'wrap' }}>
                <AddButton onClick={() => onEdit('custom_item_detail_add', { id: section.id, j: projectIndex })} label="detail line" />
                <button
                  type="button"
                  onClick={() => onEdit('custom_item_del', { id: section.id, j: projectIndex })}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="text-[10px] opacity-40 hover:opacity-100 transition-opacity"
                  style={{ color: '#F43F5E' }}
                >
                  Remove project
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <AddButton onClick={() => onEdit('custom_item_add', { id: section.id })} label="project" />
    </div>
  );
}
