import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const docsDir = path.join(rootDir, 'qa-assets', 'documents');
const csvPath = path.join(docsDir, 'sample.csv');
const xlsxPath = path.join(docsDir, 'sample.xlsx');
const xlsPath = path.join(docsDir, 'sample.xls');
const outDir = path.join(rootDir, 'qa-assets', 'output');
const outXlsxPdfPath = path.join(outDir, 'sample-xlsx-to-pdf.pdf');
const outXlsPdfPath = path.join(outDir, 'sample-xls-to-pdf.pdf');

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

function tableFromCsv(csvText) {
  const lines = csvText
    .replace(/^\uFEFF/, '')
    .split(/\r\n|\n|\r/g)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return [];
  }

  const delimiter = lines.some((line) => line.includes(';')) ? ';' : ',';
  return lines.map((line) => parseDelimitedLine(line, delimiter));
}

function normalizeSpreadsheetText(workbook) {
  if (!workbook?.SheetNames?.length) {
    return '';
  }

  const sheetTexts = workbook.SheetNames.map((sheetName) => {
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      blankrows: false,
      raw: true,
    });

    const normalizedRows = rows
      .map((row) => row.map((cell) => String(cell ?? '').trim()))
      .filter((row) => row.some((cell) => cell.length > 0))
      .map((row) => row.join(' | '));

    if (!normalizedRows.length) {
      return `Planilha: ${sheetName}\n(Sem dados detectados)`;
    }

    return [`Planilha: ${sheetName}`, ...normalizedRows].join('\n');
  });

  return sheetTexts.join('\n\n');
}

function pdfFromText(content, title) {
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

  for (const line of lines) {
    if (y > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
    pdf.text(line, margin, y);
    y += lineHeight;
  }

  return Buffer.from(pdf.output('arraybuffer'));
}

async function ensureSpreadsheetFixtures() {
  await fs.mkdir(docsDir, { recursive: true });

  const csvExists = await fs
    .access(csvPath)
    .then(() => true)
    .catch(() => false);

  if (!csvExists) {
    throw new Error('Arquivo QA ausente: qa-assets/documents/sample.csv. Rode `npm run qa:assets`.');
  }

  const csvText = await fs.readFile(csvPath, 'utf8');
  const rows = tableFromCsv(csvText);

  if (!rows.length) {
    throw new Error('sample.csv está vazio ou inválido para o teste.');
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'DadosQA');

  const xlsxBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const xlsBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'biff8' });

  await fs.writeFile(xlsxPath, xlsxBuffer);
  await fs.writeFile(xlsPath, xlsBuffer);
}

async function runSpreadsheetToPdfCase(spreadsheetPath, outputPdfPath, caseName) {
  const raw = await fs.readFile(spreadsheetPath);
  const workbook = XLSX.read(raw, {
    type: 'buffer',
    dense: true,
    raw: true,
    cellFormula: false,
    cellHTML: false,
    cellStyles: false,
    cellText: true,
    WTF: false,
  });

  const normalizedText = normalizeSpreadsheetText(workbook);

  if (!normalizedText.trim()) {
    throw new Error(`Falha no caso ${caseName}: texto normalizado vazio.`);
  }

  const pdfBytes = pdfFromText(normalizedText, `Planilha para PDF - ${path.basename(spreadsheetPath)}`);

  if (pdfBytes.byteLength < 800) {
    throw new Error(`Falha no caso ${caseName}: PDF gerado muito pequeno (${pdfBytes.byteLength} bytes).`);
  }

  await fs.mkdir(path.dirname(outputPdfPath), { recursive: true });
  await fs.writeFile(outputPdfPath, pdfBytes);

  console.log(`[OK] ${caseName}: PDF gerado em ${path.relative(rootDir, outputPdfPath)} (${pdfBytes.byteLength} bytes)`);
}

async function main() {
  await ensureSpreadsheetFixtures();

  await runSpreadsheetToPdfCase(xlsxPath, outXlsxPdfPath, 'XLSX -> PDF');
  await runSpreadsheetToPdfCase(xlsPath, outXlsPdfPath, 'XLS -> PDF');

  console.log('Teste automatizado XLS/XLSX -> PDF finalizado com sucesso.');
}

main().catch((error) => {
  console.error(`[FAIL] ${error.message}`);
  process.exitCode = 1;
});
