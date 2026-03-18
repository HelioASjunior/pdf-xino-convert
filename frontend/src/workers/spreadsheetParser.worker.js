import * as XLSX from 'xlsx';

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

self.onmessage = (event) => {
  try {
    const { arrayBuffer } = event.data ?? {};

    if (!arrayBuffer) {
      throw new Error('Arquivo inválido para leitura de planilha.');
    }

    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      dense: true,
      raw: true,
      cellFormula: false,
      cellHTML: false,
      cellStyles: false,
      cellText: true,
      WTF: false,
    });

    const text = normalizeSpreadsheetText(workbook);
    self.postMessage({ ok: true, text });
  } catch (error) {
    self.postMessage({
      ok: false,
      error: error instanceof Error ? error.message : 'Falha ao processar planilha.',
    });
  }
};
