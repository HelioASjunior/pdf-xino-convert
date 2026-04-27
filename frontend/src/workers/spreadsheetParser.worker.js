import * as XLSX from 'xlsx';

function extractSpreadsheetData(workbook) {
  if (!workbook?.SheetNames?.length) {
    return [];
  }

  return workbook.SheetNames.map((sheetName) => {
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      blankrows: false,
      raw: false,
    });

    const cleanRows = rows
      .map((row) => row.map((cell) => String(cell ?? '').trim()))
      .filter((row) => row.some((cell) => cell.length > 0));

    return { name: sheetName, rows: cleanRows };
  });
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
      raw: false,
      cellFormula: false,
      cellHTML: false,
      cellStyles: false,
      cellText: true,
      WTF: false,
    });

    const sheets = extractSpreadsheetData(workbook);
    self.postMessage({ ok: true, sheets });
  } catch (error) {
    self.postMessage({
      ok: false,
      error: error instanceof Error ? error.message : 'Falha ao processar planilha.',
    });
  }
};
