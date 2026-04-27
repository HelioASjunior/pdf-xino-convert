const unsupportedMessage = 'Este formato exige um tratamento específico para preservar melhor a estrutura e a apresentação do conteúdo.';

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

async function toPdfBlobFromSpreadsheetData(sheetsData, title) {
  const { jsPDF } = await import('jspdf');

  const rowHeight = 18;
  const cellPadding = 4;
  const margin = 36;

  const maxCols = Math.max(...sheetsData.flatMap((s) => s.rows.map((r) => r.length)), 1);
  const orientation = maxCols > 8 ? 'landscape' : 'portrait';

  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  if (!sheetsData.length) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Nenhum dado encontrado na planilha.', margin, margin + 20);
    return pdf.output('blob');
  }

  let isFirstSheet = true;

  for (const { name, rows } of sheetsData) {
    if (!isFirstSheet) pdf.addPage();
    isFirstSheet = false;

    let y = margin;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${title} — ${name}`, margin, y);
    y += 20;

    if (!rows.length) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text('(Sem dados detectados)', margin, y);
      continue;
    }

    const numCols = Math.max(...rows.map((r) => r.length), 1);
    const tableWidth = pageWidth - margin * 2;
    const colWidth = tableWidth / numCols;
    const fontSize = colWidth < 55 ? 7 : 9;

    pdf.setFontSize(fontSize);

    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const row = rows[rowIdx];

      if (y + rowHeight > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }

      const isHeader = rowIdx === 0;

      if (isHeader) {
        pdf.setFillColor(52, 101, 164);
        pdf.setTextColor(255, 255, 255);
      } else if (rowIdx % 2 === 0) {
        pdf.setFillColor(240, 244, 248);
        pdf.setTextColor(0, 0, 0);
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.setTextColor(0, 0, 0);
      }

      pdf.rect(margin, y, tableWidth, rowHeight, 'F');
      pdf.setDrawColor(180, 180, 180);
      pdf.rect(margin, y, tableWidth, rowHeight, 'S');

      pdf.setFont('helvetica', isHeader ? 'bold' : 'normal');

      for (let colIdx = 0; colIdx < numCols; colIdx++) {
        const cellText = String(row[colIdx] ?? '');
        const x = margin + colIdx * colWidth;

        if (colIdx > 0) {
          pdf.setDrawColor(180, 180, 180);
          pdf.line(x, y, x, y + rowHeight);
        }

        const truncated = pdf.splitTextToSize(cellText, colWidth - cellPadding * 2)[0] ?? '';
        pdf.text(truncated, x + cellPadding, y + rowHeight - cellPadding - 1);
      }

      y += rowHeight;
    }
  }

  pdf.setTextColor(0, 0, 0);
  return pdf.output('blob');
}

function parseDelimitedLine(line, delimiter) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

async function textFromCsv(file) {
  const rawText = await file.text();
  const lines = rawText
    .replace(/^\uFEFF/, '')
    .split(/\r\n|\n|\r/g)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return '';
  }

  const delimiter = lines.some((line) => line.includes(';')) ? ';' : ',';
  return lines
    .map((line) => parseDelimitedLine(line, delimiter).join(' | '))
    .join('\n');
}

async function dataFromSpreadsheet(file) {
  const buffer = await file.arrayBuffer();

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/spreadsheetParser.worker.js', import.meta.url), {
      type: 'module',
    });

    const timeoutId = setTimeout(() => {
      worker.terminate();
      reject(new Error('Tempo limite excedido ao processar a planilha.'));
    }, 8000);

    worker.onmessage = (event) => {
      clearTimeout(timeoutId);
      worker.terminate();

      if (event.data?.ok) {
        resolve(event.data.sheets ?? []);
        return;
      }

      reject(new Error(event.data?.error || 'Falha ao processar planilha.'));
    };

    worker.onerror = () => {
      clearTimeout(timeoutId);
      worker.terminate();
      reject(new Error('Erro interno ao processar planilha.'));
    };

    worker.postMessage({ arrayBuffer: buffer }, [buffer]);
  });
}

export function getUnsupportedSuggestions() {
  return [
    'Priorize uma versão em PDF já exportada pela ferramenta de origem quando disponível.',
    'Para arquivos complexos, utilize uma etapa complementar de conversão com maior fidelidade.',
    'Se preferir, siga com a versão simplificada e revise o acabamento final do documento.',
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

  if (ext === 'doc') {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const chunks = [];
    let i = 0;
    while (i < bytes.length - 1) {
      const lo = bytes[i];
      const hi = bytes[i + 1];
      const cp = lo | (hi << 8);
      if (cp >= 0x20 && cp < 0xd800 && cp !== 0x00) {
        chunks.push(String.fromCharCode(cp));
        i += 2;
      } else if (lo >= 0x20 && lo < 0x80) {
        chunks.push(String.fromCharCode(lo));
        i += 1;
      } else if (lo === 0x0d || lo === 0x0a) {
        chunks.push('\n');
        i += 1;
      } else {
        i += 1;
      }
    }
    const raw = chunks.join('').replace(/[^\x20-\x7E\xA0-\xFF\n]/g, '').replace(/\n{3,}/g, '\n\n').trim();
    return {
      supported: true,
      blob: await toPdfBlobFromText(raw || '(Sem conteúdo legível extraído)', `DOC para PDF - ${file.name}`),
      fileName: `${file.name.replace(/\.[^/.]+$/, '')}.pdf`,
      warning: 'Conversão simplificada do formato DOC legado: formatação, imagens e tabelas não são preservadas.',
    };
  }

  if (ext === 'csv') {
    const text = await textFromCsv(file);
    return {
      supported: true,
      blob: await toPdfBlobFromText(text, `Planilha para PDF - ${file.name}`),
      fileName: `${file.name.replace(/\.[^/.]+$/, '')}.pdf`,
      warning: 'Conversão simplificada: tabelas complexas e fórmulas avançadas podem perder formatação.',
    };
  }

  if (['xls', 'xlsx'].includes(ext)) {
    const sheets = await dataFromSpreadsheet(file);
    return {
      supported: true,
      blob: await toPdfBlobFromSpreadsheetData(sheets, file.name.replace(/\.[^/.]+$/, '')),
      fileName: `${file.name.replace(/\.[^/.]+$/, '')}.pdf`,
      warning: 'Conversão simplificada: fórmulas, estilos avançados e elementos complexos podem não ser preservados integralmente. Para maior estabilidade, o processamento é isolado em sandbox no navegador.',
    };
  }

  if (['ppt', 'pptx', 'odt'].includes(ext)) {
    return {
      supported: false,
      reason: unsupportedMessage,
      suggestions: getUnsupportedSuggestions(),
    };
  }

  return {
    supported: false,
    reason: 'Este formato ainda não está disponível neste fluxo de conversão.',
    suggestions: getUnsupportedSuggestions(),
  };
}
