/**
 * Robust text extraction from PDF, DOCX, DOC, TXT files.
 * PDF.js loaded from CDN; Mammoth imported as npm module for reliability.
 */

import mammothLib from 'mammoth/mammoth.browser.min.js';

export async function extractText(file) {
  const name = file.name || '';
  const ext = name.split('.').pop().toLowerCase();

  if (ext === 'txt' || ext === 'md') {
    return file.text();
  }

  if (ext === 'pdf') {
    return extractPdf(file);
  }

  if (ext === 'doc' || ext === 'docx') {
    return extractDocx(file);
  }

  throw new Error(`Unsupported file type: .${ext}. Please upload a PDF, DOCX, or TXT file.`);
}

/**
 * Extract text from PDF using PDF.js (loaded from CDN).
 * Groups text items by Y-coordinate (with tolerance) to reconstruct proper lines.
 * Detects large horizontal gaps to preserve column/field separation.
 */
async function extractPdf(file) {
  const pdfjsLib = await waitForGlobal('pdfjsLib', 8000);
  if (!pdfjsLib) {
    throw new Error(
      'PDF reader failed to load. Please check your internet connection and refresh the page.'
    );
  }

  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const allText = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      const pageWidth = viewport.width || 595;
      const textContent = await page.getTextContent();

      // Group items by Y position with tolerance to handle sub-pixel differences
      const Y_TOLERANCE = 4;
      const items = [];

      for (const item of textContent.items) {
        if (!item.str) continue;
        const y = item.transform[5];
        const x = item.transform[4];
        const width = item.width || 0;
        items.push({ x, y, width, text: item.str, hasEOL: item.hasEOL });
      }

      // Cluster items into lines by Y proximity
      const lines = [];
      const used = new Array(items.length).fill(false);

      // Sort by Y descending (PDF coordinate: bottom = 0)
      const sortedIndices = items
        .map((_, i) => i)
        .sort((a, b) => items[b].y - items[a].y);

      for (const idx of sortedIndices) {
        if (used[idx]) continue;
        const lineItems = [items[idx]];
        used[idx] = true;
        const baseY = items[idx].y;

        // Find all items on this line (within Y tolerance)
        for (let j = 0; j < items.length; j++) {
          if (used[j]) continue;
          if (Math.abs(items[j].y - baseY) <= Y_TOLERANCE) {
            lineItems.push(items[j]);
            used[j] = true;
          }
        }

        // Sort items left to right
        lineItems.sort((a, b) => a.x - b.x);

        // Split the line into horizontal segments so multi-column PDFs
        // don't get merged into a single corrupted line.
        const SPLIT_GAP = Math.max(56, pageWidth * 0.085);
        const segments = [];
        let currentSegment = [lineItems[0]];
        for (let k = 1; k < lineItems.length; k++) {
          const prev = lineItems[k - 1];
          const curr = lineItems[k];
          const gap = curr.x - (prev.x + prev.width);
          if (gap > SPLIT_GAP) {
            segments.push(currentSegment);
            currentSegment = [curr];
          } else {
            currentSegment.push(curr);
          }
        }
        if (currentSegment.length) segments.push(currentSegment);

        const builtSegments = segments
          .map((seg) => {
            let segmentText = '';
            for (let s = 0; s < seg.length; s++) {
              const item = seg[s];
              if (s > 0) {
                const prev = seg[s - 1];
                const gap = item.x - (prev.x + prev.width);
                if (gap > 10) segmentText += '  ';
                else if (!segmentText.endsWith(' ') && !item.text.startsWith(' ')) segmentText += ' ';
              }
              segmentText += item.text;
            }
            const normalized = normalizePdfExtractedLine(segmentText);
            if (!normalized) return null;
            const first = seg[0];
            const last = seg[seg.length - 1];
            return {
              x: first.x,
              center: (first.x + (last.x + last.width)) / 2,
              text: normalized,
            };
          })
          .filter(Boolean);

        if (builtSegments.length > 0) {
          lines.push({ y: items[idx].y, segments: builtSegments });
        }
      }

      const flattenedSegments = lines.flatMap((line) =>
        line.segments.map((segment) => ({ ...segment, y: line.y }))
      );

      const splitX = pageWidth * 0.44;
      const leftSegments = flattenedSegments.filter((segment) => segment.center <= splitX);
      const rightSegments = flattenedSegments.filter((segment) => segment.center > splitX);
      const isTwoColumn =
        flattenedSegments.length >= 12 &&
        leftSegments.length >= 4 &&
        rightSegments.length >= 4;

      if (isTwoColumn) {
        const leftWeight = leftSegments.reduce((sum, seg) => sum + seg.text.length, 0);
        const rightWeight = rightSegments.reduce((sum, seg) => sum + seg.text.length, 0);
        const primary = rightWeight >= leftWeight ? rightSegments : leftSegments;
        const secondary = rightWeight >= leftWeight ? leftSegments : rightSegments;

        const columnText = [primary, secondary]
          .map((segments) =>
            dedupeSegmentLines(
              segments
                .sort((a, b) => b.y - a.y || a.x - b.x)
                .map((seg) => seg.text)
            ).join('\n')
          )
          .filter(Boolean);

        allText.push(columnText.join('\n\n'));
      } else {
        allText.push(
          dedupeSegmentLines(
            flattenedSegments
              .sort((a, b) => b.y - a.y || a.x - b.x)
              .map((seg) => seg.text)
          ).join('\n')
        );
      }
    }

    const result = allText.join('\n\n').trim();

    // Normalize: collapse runs of spaces (but preserve intentional multi-space gaps)
    const cleaned = result
      .replace(/[ \t]{5,}/g, '    ')   // cap large gaps at 4 spaces
      .replace(/\n{4,}/g, '\n\n\n');   // max 3 newlines

    if (!cleaned || cleaned.length < 10) {
      throw new Error('Could not extract meaningful text from this PDF. The file may be scanned or image-based. Try pasting the text manually.');
    }
    return cleaned;
  } catch (err) {
    if (err.message.includes('Could not extract')) throw err;
    console.error('PDF extraction error:', err);
    throw new Error(`Failed to read PDF: ${err.message || 'Unknown error'}. Try a different file or paste the text manually.`);
  }
}

function normalizePdfExtractedLine(raw) {
  if (!raw) return '';
  let text = raw.replace(/\u00A0/g, ' ').replace(/[ \t]{2,}/g, ' ').trim();
  if (!text) return '';

  const collapsedHeadingMap = {
    PROFILE: 'PROFILE',
    CONTACT: 'CONTACT',
    WORKEXPERIENCE: 'WORK EXPERIENCE',
    SKILLS: 'SKILLS',
    CERTIFICATION: 'CERTIFICATION',
    CERTIFICATIONS: 'CERTIFICATIONS',
    EDUCATION: 'EDUCATION',
    PROJECTS: 'PROJECTS',
    LANGUAGES: 'LANGUAGES',
    STRENGTHS: 'STRENGTHS',
    REFERENCES: 'REFERENCES',
    DECLARATION: 'DECLARATION',
    VMSTOOLS: 'VMS TOOLS',
    VMSIMPLEMENTATIONCLIENTS: 'VMS IMPLEMENTATION CLIENTS',
  };

  const bare = text.replace(/[^A-Z&]/g, '');
  if (/^(?:[A-Z&]\s+){2,}[A-Z&]$/.test(text)) {
    const compact = text.replace(/\s+/g, '');
    return collapsedHeadingMap[compact] || compact;
  }

  if (text === text.toUpperCase() && bare.length >= 4 && bare.length <= 40) {
    const compact = text.replace(/\s+/g, '');
    if (collapsedHeadingMap[compact]) return collapsedHeadingMap[compact];
  }

  return text;
}

function dedupeSegmentLines(lines) {
  const out = [];
  for (const line of lines) {
    const trimmed = String(line || '').trim();
    if (!trimmed) continue;
    if (out[out.length - 1] === trimmed) continue;
    out.push(trimmed);
  }
  return out;
}

/**
 * Extract text from DOCX/DOC using Mammoth.js (npm module).
 * Uses HTML conversion first to preserve document structure (headings,
 * lists, paragraphs), then falls back to raw text extraction.
 */
async function extractDocx(file) {
  const mammoth = mammothLib || window.mammoth;

  if (!mammoth || typeof mammoth.extractRawText !== 'function') {
    throw new Error(
      'Word document reader failed to load. Please refresh the page and try again, or paste the text manually.'
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();

    // Strategy 1: HTML conversion preserves structure (headings, lists, tables)
    let text = '';
    try {
      const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
      const html = htmlResult.value || '';
      if (html.length > 20) {
        text = htmlToStructuredText(html);
      }
    } catch (htmlErr) {
      console.warn('HTML conversion failed, trying raw text:', htmlErr);
    }

    // Strategy 2: Raw text extraction as fallback
    if (!text || text.length < 10) {
      const result = await mammoth.extractRawText({ arrayBuffer });
      text = (result.value || '').trim();
    }

    if (!text || text.length < 10) {
      throw new Error(
        'Could not extract meaningful text from this document. The file may be empty or contain only images. Try saving as PDF or paste the text manually.'
      );
    }

    return text;
  } catch (err) {
    if (err.message.includes('Could not extract')) throw err;
    console.error('DOCX extraction error:', err);
    throw new Error(
      `Failed to read Word document: ${err.message || 'Unknown error'}. Try saving as PDF or paste the text manually.`
    );
  }
}

/**
 * Convert HTML from mammoth into structured plain text that preserves
 * section headings, list items, table rows, and paragraph breaks.
 * Keeps bold markers for downstream heading detection.
 */
/**
 * Known section heading keywords for detecting when a table cell is a heading.
 * Used to split "heading | content" table rows into separate lines.
 */
const SECTION_HEADING_WORDS = /^(?:\*{0,2}\s*)?(summary|profile|skills?|work\s*experience|work|experience|education|certifications?|professional\s*achievements?|achievements?|awards?|communication|languages?|strengths?|personal\s*(?:details|information)|declaration|projects?|hobbies|interests|references|training|qualifications|objective|overview|about\s*me|career\s*(?:objective|history)|employment|professional\s*(?:summary|experience)|technical\s*skills|key\s*skills|core\s*(?:competencies|strengths)|soft\s*skills|volunteer(?:ing)?|publications?)(?:\s*\*{0,2})?\s*$/i;

function htmlToStructuredText(html) {
  // Normalize whitespace inside tags first
  let text = html.replace(/\r\n?/g, '\n');

  // Headings → prefix with newlines and uppercase for clarity
  text = text.replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/gi, (_, level, content) => {
    return '\n\n' + stripTags(content).toUpperCase() + '\n';
  });

  // Preserve bold/strong text with markers to help AI detect sub-headings
  text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gi, (_, content) => '**' + content + '**');
  text = text.replace(/<b[^>]*>(.*?)<\/b>/gi, (_, content) => '**' + content + '**');

  // Table rows → smart conversion:
  // If the first cell looks like a section heading, output it as a standalone heading
  // followed by the remaining cells as content lines.
  // Otherwise, join cells with " | " for data tables (like education rows).
  text = text.replace(/<tr[^>]*>(.*?)<\/tr>/gi, (_, row) => {
    const cells = [];
    row.replace(/<t[dh][^>]*>(.*?)<\/t[dh]>/gi, (__, cell) => {
      cells.push(stripTags(cell).trim());
    });
    if (cells.length === 0) return '\n';

    // Check if first cell is a section heading keyword
    const firstCell = cells[0].replace(/\*+/g, '').trim();
    if (cells.length >= 2 && SECTION_HEADING_WORDS.test(firstCell)) {
      // Output heading on its own line, then content on separate lines
      const heading = '\n\n' + firstCell.toUpperCase() + '\n';
      const contentCells = cells.slice(1).filter(c => c && c.replace(/\*+/g, '').trim());
      if (contentCells.length > 0) {
        return heading + contentCells.join('\n') + '\n';
      }
      return heading;
    }

    // Data table row — join with " | " (e.g., education table)
    return cells.join(' | ') + '\n';
  });

  // List items → prefix with bullet
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, (_, content) => {
    return '  • ' + stripTags(content).trim() + '\n';
  });

  // Paragraph and div breaks
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Strip remaining tags
  text = stripTags(text);

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&bull;/g, '•')
    .replace(/&#\d+;/g, '');

  // Clean up excessive whitespace while preserving structure
  text = text
    .replace(/[ \t]+/g, ' ')           // collapse horizontal spaces
    .replace(/ \n/g, '\n')             // trim trailing spaces on lines
    .replace(/\n /g, '\n')             // trim leading spaces on lines
    .replace(/\n{4,}/g, '\n\n\n')     // max 3 newlines (section break)
    .trim();

  return text;
}

/**
 * Strip all HTML tags from a string.
 */
function stripTags(html) {
  return html.replace(/<[^>]+>/g, '');
}

/**
 * Wait for a global variable to be available (CDN scripts).
 */
function waitForGlobal(name, timeoutMs = 8000) {
  return new Promise((resolve) => {
    if (window[name]) {
      resolve(window[name]);
      return;
    }

    const start = Date.now();
    const interval = setInterval(() => {
      if (window[name]) {
        clearInterval(interval);
        resolve(window[name]);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        resolve(null);
      }
    }, 200);
  });
}
