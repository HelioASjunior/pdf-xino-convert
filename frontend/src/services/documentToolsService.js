const unsupportedMessage = 'Este formato ainda não possui conversão completa no navegador com qualidade profissional.';

function extFromFile(file) {
  return file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
}

function cleanRtf(rawText) {
  return rawText
    .replace(/\\par[d]?/g, '\n')
    .replace(/\\tab/g, '\t')
    .replace(/\\'[0-9a-fA-F]{2}/g, '')
    .replace(/[{}]/g, '')
    .replace(/\\[a-z]+[0-9-]* ?/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function toPdfBlobFromText(content, title) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const lineHeight = 16;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text(title, margin, margin);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);

  const lines = pdf.splitTextToSize(content || '', pageWidth - margin * 2);
  let y = margin + 24;

  lines.forEach((line) => {
    if (y > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
    pdf.text(line, margin, y);
    y += lineHeight;
  });

  return pdf.output('blob');
}

async function textFromSpreadsheet(file) {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return '';
  }

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { header: 1, blankrows: false });
  return rows.map((row) => row.map((cell) => String(cell ?? '')).join(' | ')).join('\n');
}

export function getUnsupportedSuggestions() {
  return [
    'Use conversão via WebAssembly (LibreOffice portado para wasm) para maior fidelidade.',
    'Integre API externa (CloudConvert, ConvertAPI ou Microsoft Graph) para DOC/XLS/PPT complexos.',
    'Ofereça fallback: exportar para PDF simplificado no navegador e informar limitações.',
  ];
}

export async function convertDocumentFileToPdf(file) {
  const ext = extFromFile(file);

  if (['txt', 'md'].includes(ext) || file.type.startsWith('text/')) {
    const content = await file.text();
    return {
      supported: true,
      blob: await toPdfBlobFromText(content, `Conversão de ${file.name}`),
      fileName: `${file.name.replace(/\.[^/.]+$/, '')}.pdf`,
    };
  }

  if (ext === 'rtf') {
    const content = await file.text();
    return {
      supported: true,
      blob: await toPdfBlobFromText(cleanRtf(content), `RTF para PDF - ${file.name}`),
      fileName: `${file.name.replace(/\.[^/.]+$/, '')}.pdf`,
    };
  }

  if (ext === 'docx') {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return {
      supported: true,
      blob: await toPdfBlobFromText(result.value, `DOCX para PDF - ${file.name}`),
      fileName: `${file.name.replace(/\.[^/.]+$/, '')}.pdf`,
      warning: result.messages?.length ? 'Algumas formatações avançadas do DOCX podem não ser preservadas.' : '',
    };
  }

  if (['csv', 'xls', 'xlsx'].includes(ext)) {
    const text = await textFromSpreadsheet(file);
    return {
      supported: true,
      blob: await toPdfBlobFromText(text, `Planilha para PDF - ${file.name}`),
      fileName: `${file.name.replace(/\.[^/.]+$/, '')}.pdf`,
      warning: 'Conversão simplificada: tabelas complexas e fórmulas avançadas podem perder formatação.',
    };
  }

  if (['ppt', 'pptx', 'doc', 'odt'].includes(ext)) {
    return {
      supported: false,
      reason: unsupportedMessage,
      suggestions: getUnsupportedSuggestions(),
    };
  }

  return {
    supported: false,
    reason: 'Formato não suportado para conversão direta no frontend.',
    suggestions: getUnsupportedSuggestions(),
  };
}
