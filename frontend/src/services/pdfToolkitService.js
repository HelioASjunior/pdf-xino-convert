import JSZip from 'jszip';
import { PDFDocument, degrees } from 'pdf-lib';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toInt(value) {
  const parsed = Number.parseInt(String(value).trim(), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parsePageSelection(selection, totalPages) {
  if (!selection || !selection.trim()) {
    return [...Array(totalPages).keys()];
  }

  const indexes = new Set();
  const chunks = selection.split(',').map((token) => token.trim()).filter(Boolean);

  for (const chunk of chunks) {
    if (chunk.includes('-')) {
      const [startRaw, endRaw] = chunk.split('-');
      const start = toInt(startRaw);
      const end = toInt(endRaw);

      if (start === null || end === null) {
        throw new Error(`Intervalo inválido: ${chunk}`);
      }

      const from = clamp(Math.min(start, end), 1, totalPages);
      const to = clamp(Math.max(start, end), 1, totalPages);

      for (let page = from; page <= to; page += 1) {
        indexes.add(page - 1);
      }
    } else {
      const page = toInt(chunk);
      if (page === null) {
        throw new Error(`Página inválida: ${chunk}`);
      }

      if (page < 1 || page > totalPages) {
        throw new Error(`Página fora do intervalo permitido: ${page}`);
      }

      indexes.add(page - 1);
    }
  }

  const sorted = [...indexes].sort((a, b) => a - b);
  if (!sorted.length) {
    throw new Error('Nenhuma página válida foi selecionada.');
  }

  return sorted;
}

function parseSplitGroups(selection, totalPages) {
  if (!selection || !selection.trim()) {
    return [...Array(totalPages).keys()].map((index) => [index]);
  }

  const groups = [];
  const chunks = selection.split(',').map((token) => token.trim()).filter(Boolean);

  for (const chunk of chunks) {
    if (chunk.includes('-')) {
      const [startRaw, endRaw] = chunk.split('-');
      const start = toInt(startRaw);
      const end = toInt(endRaw);

      if (start === null || end === null) {
        throw new Error(`Intervalo inválido: ${chunk}`);
      }

      const from = clamp(Math.min(start, end), 1, totalPages);
      const to = clamp(Math.max(start, end), 1, totalPages);
      groups.push([...Array(to - from + 1).keys()].map((offset) => from - 1 + offset));
    } else {
      const page = toInt(chunk);
      if (page === null || page < 1 || page > totalPages) {
        throw new Error(`Página inválida: ${chunk}`);
      }
      groups.push([page - 1]);
    }
  }

  if (!groups.length) {
    throw new Error('Nenhum grupo válido para divisão.');
  }

  return groups;
}

export async function mergePdfFiles(files, onProgress) {
  const output = await PDFDocument.create();

  for (let index = 0; index < files.length; index += 1) {
    const bytes = await files[index].arrayBuffer();
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await output.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => output.addPage(page));

    if (typeof onProgress === 'function') {
      onProgress(Math.round(((index + 1) / files.length) * 100));
    }
  }

  const mergedBytes = await output.save({ useObjectStreams: true });
  return new Blob([mergedBytes], { type: 'application/pdf' });
}

export async function splitPdf(file, selection, onProgress) {
  const bytes = await file.arrayBuffer();
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const groups = parseSplitGroups(selection, source.getPageCount());
  const outputs = [];

  for (let index = 0; index < groups.length; index += 1) {
    const doc = await PDFDocument.create();
    const copiedPages = await doc.copyPages(source, groups[index]);
    copiedPages.forEach((page) => doc.addPage(page));

    const chunkBytes = await doc.save({ useObjectStreams: true });
    outputs.push({
      name: `${file.name.replace(/\.[^/.]+$/, '')}-parte-${String(index + 1).padStart(2, '0')}.pdf`,
      blob: new Blob([chunkBytes], { type: 'application/pdf' }),
    });

    if (typeof onProgress === 'function') {
      onProgress(Math.round(((index + 1) / groups.length) * 100));
    }
  }

  return outputs;
}

export async function rotatePdf(file, angle, selection, onProgress) {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const indexes = parsePageSelection(selection, doc.getPageCount());
  const pageSet = new Set(indexes);

  doc.getPages().forEach((page, index) => {
    if (pageSet.has(index)) {
      page.setRotation(degrees(angle));
    }
  });

  if (typeof onProgress === 'function') {
    onProgress(100);
  }

  const outBytes = await doc.save({ useObjectStreams: true });
  return new Blob([outBytes], { type: 'application/pdf' });
}

export async function removePdfPages(file, selection, onProgress) {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const removeIndexes = parsePageSelection(selection, doc.getPageCount()).sort((a, b) => b - a);

  for (const index of removeIndexes) {
    doc.removePage(index);
  }

  if (doc.getPageCount() === 0) {
    throw new Error('Não é possível remover todas as páginas do PDF.');
  }

  if (typeof onProgress === 'function') {
    onProgress(100);
  }

  const outBytes = await doc.save({ useObjectStreams: true });
  return new Blob([outBytes], { type: 'application/pdf' });
}

export async function extractPdfPages(file, selection, onProgress) {
  const bytes = await file.arrayBuffer();
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const indexes = parsePageSelection(selection, source.getPageCount());

  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, indexes);
  pages.forEach((page) => output.addPage(page));

  if (typeof onProgress === 'function') {
    onProgress(100);
  }

  const outBytes = await output.save({ useObjectStreams: true });
  return new Blob([outBytes], { type: 'application/pdf' });
}

export async function cropPdfPages(file, cropConfig, onProgress) {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const totalPages = doc.getPageCount();

  const area = cropConfig?.area || { x: 0, y: 0, width: 1, height: 1 };
  const applyMode = cropConfig?.applyMode === 'current' ? 'current' : 'all';
  const currentPage = clamp(Number(cropConfig?.currentPage) || 1, 1, totalPages);

  const xRatio = clamp(Number(area.x) || 0, 0, 0.98);
  const yRatio = clamp(Number(area.y) || 0, 0, 0.98);
  const widthRatio = clamp(Number(area.width) || 1, 0.02, 1 - xRatio);
  const heightRatio = clamp(Number(area.height) || 1, 0.02, 1 - yRatio);

  doc.getPages().forEach((page, index) => {
    if (applyMode === 'current' && index !== currentPage - 1) return;

    const width = page.getWidth();
    const height = page.getHeight();

    const cropX = clamp(width * xRatio, 0, Math.max(0, width - 10));
    const cropWidth = clamp(width * widthRatio, 10, width - cropX);

    // UI uses top-left origin; PDF boxes use bottom-left.
    const cropHeight = clamp(height * heightRatio, 10, height);
    const topY = clamp(height * yRatio, 0, Math.max(0, height - 10));
    const cropY = clamp(height - topY - cropHeight, 0, Math.max(0, height - 10));

    page.setCropBox(cropX, cropY, cropWidth, cropHeight);
    page.setMediaBox(cropX, cropY, cropWidth, cropHeight);
  });

  if (typeof onProgress === 'function') {
    onProgress(100);
  }

  const outBytes = await doc.save({ useObjectStreams: true });
  return new Blob([outBytes], { type: 'application/pdf' });
}

export async function zipDownloadItems(items, zipName = 'downloads.zip', onProgress) {
  const zip = new JSZip();

  items.forEach((item) => {
    zip.file(item.name, item.blob || item.file);
  });

  const zipBlob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (meta) => {
      if (typeof onProgress === 'function') {
        onProgress(Math.round(meta.percent));
      }
    },
  );

  return {
    zipBlob,
    zipName,
  };
}
