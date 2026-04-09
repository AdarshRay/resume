import { describe, expect, it } from 'vitest';
import { htmlToStructuredText, normalizePdfExtractedLine } from '../utils/extractText';

describe('extractText helpers', () => {
  it('normalizes spaced uppercase headings from PDF extraction', () => {
    expect(normalizePdfExtractedLine('W O R K E X P E R I E N C E')).toBe('WORK EXPERIENCE');
  });

  it('converts heading-style table rows into standalone sections', () => {
    const html = '<table><tr><td>Skills</td><td>SQL</td><td>Python</td></tr></table>';
    expect(htmlToStructuredText(html)).toContain('SKILLS\nSQL\nPython');
  });

  it('preserves list items as readable plain text', () => {
    const html = '<ul><li>Built dashboards</li><li>Improved reporting</li></ul>';
    expect(htmlToStructuredText(html)).toContain('Built dashboards');
    expect(htmlToStructuredText(html)).toContain('Improved reporting');
  });

  it('normalizes common HTML punctuation entities into plain text', () => {
    const html = '<p>Lead strategy &mdash; analytics &bull; reporting</p>';
    expect(htmlToStructuredText(html)).toContain('Lead strategy -- analytics - reporting');
  });
});
