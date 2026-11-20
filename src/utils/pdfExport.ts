import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportPdfOptions {
  elementId: string;
  filename?: string;
  domainName?: string;
}

export async function exportReportToPdf({
  elementId,
  filename,
  domainName = 'website'
}: ExportPdfOptions): Promise<void> {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    throw new Error('لم يتم العثور على عنصر التقرير');
  }

  // Generate safe filename
  const cleanDomain = domainName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `RasidSEO-Report-${cleanDomain}-${dateStr}.pdf`;

  // Render canvas with high resolution and crisp font rendering
  const canvas = await html2canvas(targetElement, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#f8fafc', // slate-50 background
    windowWidth: targetElement.scrollWidth,
    onclone: (clonedDoc) => {
      // Ensure elements in clone are fully expanded for PDF
      const clonedEl = clonedDoc.getElementById(elementId);
      if (clonedEl) {
        clonedEl.style.padding = '24px';
        clonedEl.style.maxWidth = '1200px';
      }
    }
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  // A4 dimensions in mm
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = 210;
  const pdfPageHeight = 297;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  // Add first page
  pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pdfPageHeight;

  // Add subsequent pages if the report height exceeds one page
  while (heightLeft > 0) {
    position -= pdfPageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfPageHeight;
  }

  // Save the PDF file
  pdf.save(finalFilename);
}
