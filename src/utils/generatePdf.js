import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default async function generatePdf(elementId, fileName) {
  const A4_W_MM = 210, A4_H_MM = 297;
  const A4_H_PX = 1123;

  // Collect all page elements
  const pages = [];
  const page1 = document.getElementById(elementId);
  if (page1) pages.push(page1);

  let pageNum = 2;
  while (true) {
    const el = document.getElementById(`resume-page-${pageNum}`);
    if (!el) break;
    // Skip empty placeholder pages (no real content)
    if (el.querySelector('.draggable-section, section')) {
      pages.push(el);
    }
    pageNum++;
  }

  if (pages.length === 0) return;

  // Temporarily enforce overflow:hidden + fixed height for clean capture
  const saved = pages.map(p => ({
    overflow: p.style.overflow,
    height: p.style.height,
  }));
  pages.forEach(p => {
    p.style.overflow = 'hidden';
    p.style.height = A4_H_PX + 'px';
  });

  const pdf = new jsPDF('p', 'mm', 'a4');

  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      width: 794,
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL('image/png');
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, 0, A4_W_MM, A4_H_MM);
  }

  // Restore original styles
  pages.forEach((p, i) => {
    p.style.overflow = saved[i].overflow;
    p.style.height = saved[i].height;
  });

  pdf.save(fileName || 'Resume.pdf');
}
