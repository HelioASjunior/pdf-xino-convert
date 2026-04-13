import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import heic2any from 'heic2any';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();

const PAGE_SIZES = {
  A4: [595.28, 841.89],
  Letter: [612, 792],
  Legal: [612, 1008],
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hasImageExtension(fileName = '', extensions = []) {
  const normalizedName = String(fileName || '').toLowerCase();
  return extensions.some((extension) => normalizedName.endsWith(extension));
}

function isHeicFile(file) {
  return ['image/heic', 'image/heif'].includes(file?.type)
    || hasImageExtension(file?.name, ['.heic', '.heif']);
}

async function normalizeInputImage(file) {
  if (!isHeicFile(file)) {
    return file;
  }

  try {
    const converted = await heic2any({
      blob: file,
      toType: 'image/png',
    });

    const blob = Array.isArray(converted) ? converted[0] : converted;
    return new File([blob], `${file.name.replace(/\.[^/.]+$/, '')}.png`, {
      type: blob.type || 'image/png',
    });
  } catch {
    throw new Error(`Não foi possível decodificar o arquivo HEIC/HEIF ${file.name} neste navegador.`);
  }
}

async function blobFromCanvas(canvas, mimeType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Falha ao converter canvas para arquivo.'));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

async function fileToImageBitmap(file) {
  if (window.createImageBitmap) {
    return window.createImageBitmap(file);
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Não foi possível ler a imagem ${file.name}.`));
    };
    image.src = url;
  });
}

async function normalizeImageFile(file, compressImages) {
  const sourceInput = await normalizeInputImage(file);
  const canUseDirectly = sourceInput.type === 'image/jpeg' || sourceInput.type === 'image/png';
  if (canUseDirectly && !compressImages) {
    return sourceInput;
  }

  const bitmap = await fileToImageBitmap(sourceInput);
  const maxDimension = compressImages ? 2200 : 3200;
  const widthScale = maxDimension / bitmap.width;
  const heightScale = maxDimension / bitmap.height;
  const scale = Math.min(1, widthScale, heightScale);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Falha ao preparar a imagem para o PDF.');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);

  if (typeof bitmap.close === 'function') {
    bitmap.close();
  }

  const shouldUsePng = sourceInput.type === 'image/png' && !compressImages;
  const normalizedBlob = await blobFromCanvas(
    canvas,
    shouldUsePng ? 'image/png' : 'image/jpeg',
    compressImages ? 0.82 : 0.92,
  );

  return new File([normalizedBlob], sourceInput.name.replace(/\.[^/.]+$/, shouldUsePng ? '.png' : '.jpg'), {
    type: normalizedBlob.type,
  });
}

function computeDrawRect({
  imageWidth,
  imageHeight,
  pageWidth,
  pageHeight,
  margin,
  imageFit,
}) {
  const safeWidth = Math.max(1, pageWidth - margin * 2);
  const safeHeight = Math.max(1, pageHeight - margin * 2);

  if (imageFit === 'stretch') {
    return {
      x: margin,
      y: margin,
      width: safeWidth,
      height: safeHeight,
    };
  }

  const imageRatio = imageWidth / imageHeight;
  const boxRatio = safeWidth / safeHeight;

  const shouldCover = imageFit === 'cover';
  const useWidth = shouldCover ? imageRatio < boxRatio : imageRatio > boxRatio;

  const width = useWidth ? safeWidth : safeHeight * imageRatio;
  const height = useWidth ? safeWidth / imageRatio : safeHeight;

  return {
    x: margin + (safeWidth - width) / 2,
    y: margin + (safeHeight - height) / 2,
    width,
    height,
  };
}

async function buildPdfFromImages(imageFiles, options = {}, onProgress) {
  const {
    orientation = 'portrait',
    pageSize = 'A4',
    margin = '24',
    imageFit = 'contain',
    compressImages = 'true',
  } = options;

  const marginPoints = clamp(Number(margin) || 24, 0, 72);
  const pagePreset = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;
  const shouldCompress = String(compressImages) === 'true';

  const [baseWidth, baseHeight] = pagePreset;
  const width = orientation === 'landscape' ? baseHeight : baseWidth;
  const height = orientation === 'landscape' ? baseWidth : baseHeight;

  const pdfDoc = await PDFDocument.create();

  for (let index = 0; index < imageFiles.length; index += 1) {
    const original = imageFiles[index];
    const file = await normalizeImageFile(original, shouldCompress);
    const imageBytes = await file.arrayBuffer();

    let embeddedImage;
    if (file.type === 'image/png') {
      embeddedImage = await pdfDoc.embedPng(imageBytes);
    } else {
      embeddedImage = await pdfDoc.embedJpg(imageBytes);
    }

    const page = pdfDoc.addPage([width, height]);
    const rect = computeDrawRect({
      imageWidth: embeddedImage.width,
      imageHeight: embeddedImage.height,
      pageWidth: width,
      pageHeight: height,
      margin: marginPoints,
      imageFit,
    });

    page.drawImage(embeddedImage, rect);

    if (typeof onProgress === 'function') {
      onProgress(Math.round(((index + 1) / imageFiles.length) * 100));
    }
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function convertPdfToImages(pdfFile, options = {}) {
  const { format = 'png', scale = 1.5, onProgress } = options;
  const outputFormat = format === 'jpg' ? 'jpg' : 'png';
  const mimeType = outputFormat === 'png' ? 'image/png' : 'image/jpeg';

  const buffer = await pdfFile.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  const zip = new JSZip();
  const images = [];

  for (let index = 1; index <= pdf.numPages; index += 1) {
    const page = await pdf.getPage(index);
    const viewport = page.getViewport({ scale: clamp(scale, 0.75, 3) });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new Error('Falha ao renderizar uma página do PDF.');
    }

    await page.render({ canvasContext: context, viewport }).promise;

    const blob = await blobFromCanvas(canvas, mimeType, outputFormat === 'jpg' ? 0.9 : undefined);
    const name = `pagina-${String(index).padStart(2, '0')}.${outputFormat}`;
    zip.file(name, blob);
    images.push({ name, blob });

    if (typeof onProgress === 'function') {
      onProgress(Math.round((index / pdf.numPages) * 100));
    }
  }

  const zipBlob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (meta) => {
      if (typeof onProgress === 'function') {
        const safePercent = clamp(Math.round(meta.percent), 0, 100);
        onProgress(safePercent);
      }
    },
  );

  return {
    pageCount: pdf.numPages,
    images,
    zipBlob,
    zipFileName: `${pdfFile.name.replace(/\.[^/.]+$/, '')}-imagens.zip`,
  };
}

export async function imagesToPdf(imageFiles, options = {}, onProgress) {
  return buildPdfFromImages(imageFiles, options, onProgress);
}

export async function imagesToSeparatePdfs(imageFiles, options = {}, onProgress) {
  const createdFiles = [];
  const failed = [];
  const zip = new JSZip();

  for (let index = 0; index < imageFiles.length; index += 1) {
    const file = imageFiles[index];

    try {
      const pdfBlob = await buildPdfFromImages([file], options, (value) => {
        if (typeof onProgress === 'function') {
          const progress = ((index + value / 100) / imageFiles.length) * 90;
          onProgress(Math.round(progress));
        }
      });

      const pdfName = `${file.name.replace(/\.[^/.]+$/, '')}.pdf`;
      zip.file(pdfName, pdfBlob);
      createdFiles.push({ name: pdfName, blob: pdfBlob });
    } catch (error) {
      failed.push({ fileName: file.name, reason: error.message || 'Falha ao gerar PDF individual.' });
      if (typeof onProgress === 'function') {
        const progress = ((index + 1) / imageFiles.length) * 90;
        onProgress(Math.round(progress));
      }
    }
  }

  if (!createdFiles.length) {
    throw new Error('Nenhuma imagem pôde ser convertida em PDF neste navegador.');
  }

  const zipBlob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (meta) => {
      if (typeof onProgress === 'function') {
        onProgress(Math.round(90 + meta.percent * 0.1));
      }
    },
  );

  return {
    files: createdFiles,
    failed,
    zipBlob,
    zipFileName: `pdfs-individuais-${Date.now()}.zip`,
  };
}

export async function compressPdfInBrowser(pdfFile, options = {}) {
  const { level = 'medium', onProgress } = options;

  const profile = {
    low: { scale: 1.2, quality: 0.82 },
    medium: { scale: 1.05, quality: 0.72 },
    high: { scale: 0.9, quality: 0.58 },
  }[level] || { scale: 1.05, quality: 0.72 };

  const buffer = await pdfFile.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const sourcePdf = await loadingTask.promise;
  const compressedPdf = await PDFDocument.create();

  for (let index = 1; index <= sourcePdf.numPages; index += 1) {
    const page = await sourcePdf.getPage(index);
    const viewport = page.getViewport({ scale: profile.scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new Error('Não foi possível concluir a compactação deste PDF neste momento.');
    }

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport }).promise;

    const pageBlob = await blobFromCanvas(canvas, 'image/jpeg', profile.quality);
    const pageBytes = await pageBlob.arrayBuffer();
    const embedded = await compressedPdf.embedJpg(pageBytes);

    const pageWidthPoints = clamp((canvas.width * 72) / 96, 200, 2000);
    const pageHeightPoints = clamp((canvas.height * 72) / 96, 200, 2000);

    const outPage = compressedPdf.addPage([pageWidthPoints, pageHeightPoints]);
    outPage.drawImage(embedded, { x: 0, y: 0, width: pageWidthPoints, height: pageHeightPoints });

    if (typeof onProgress === 'function') {
      onProgress(Math.round((index / sourcePdf.numPages) * 100));
    }
  }

  const pdfBytes = await compressedPdf.save({ useObjectStreams: true });
  const compressedBlob = new Blob([pdfBytes], { type: 'application/pdf' });

  const originalSize = pdfFile.size;
  const finalSize = compressedBlob.size;

  if (finalSize >= originalSize * 0.98) {
    return {
      blob: pdfFile,
      originalSize,
      finalSize: originalSize,
      reductionPercent: 0,
      wasReduced: false,
      strategy: 'fallback',
    };
  }

  const reductionPercent = ((originalSize - finalSize) / originalSize) * 100;

  return {
    blob: compressedBlob,
    originalSize,
    finalSize,
    reductionPercent,
    wasReduced: true,
    strategy: 'rasterize',
  };
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function buildDocxFromPages(pageTexts) {
  const paragraphs = [];

  for (let p = 0; p < pageTexts.length; p += 1) {
    const { lines } = pageTexts[p];

    if (p > 0) {
      paragraphs.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
    }

    for (const line of lines) {
      const safe = escapeXml(line);
      if (safe.trim()) {
        paragraphs.push(`<w:p><w:r><w:t xml:space="preserve">${safe}</w:t></w:r></w:p>`);
      } else {
        paragraphs.push('<w:p/>');
      }
    }
  }

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphs.join('\n    ')}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const relsRoot = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const relsWord = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`;

  const zip = new JSZip();
  zip.file('[Content_Types].xml', contentTypes);
  zip.file('_rels/.rels', relsRoot);
  zip.file('word/document.xml', documentXml);
  zip.file('word/_rels/document.xml.rels', relsWord);

  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

export async function convertPdfToWord(pdfFile, options = {}) {
  const { onProgress } = options;

  const buffer = await pdfFile.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  const pageTexts = [];

  for (let index = 1; index <= pdf.numPages; index += 1) {
    const page = await pdf.getPage(index);
    const textContent = await page.getTextContent();

    const rawItems = textContent.items
      .filter((item) => typeof item.str === 'string')
      .map((item) => ({
        str: item.str,
        x: item.transform[4],
        y: Math.round(item.transform[5]),
      }));

    rawItems.sort((a, b) => b.y - a.y || a.x - b.x);

    const lines = [];
    let currentY = null;
    let currentLine = '';

    for (const item of rawItems) {
      if (currentY === null || Math.abs(item.y - currentY) > 4) {
        if (currentLine !== '') {
          lines.push(currentLine);
        }
        currentLine = item.str;
        currentY = item.y;
      } else {
        currentLine += (item.str.startsWith(' ') || currentLine.endsWith(' ') ? '' : ' ') + item.str;
      }
    }

    if (currentLine !== '') {
      lines.push(currentLine);
    }

    pageTexts.push({ pageNumber: index, lines });

    if (typeof onProgress === 'function') {
      onProgress(Math.round((index / pdf.numPages) * 88));
    }
  }

  const docxBlob = await buildDocxFromPages(pageTexts);

  if (typeof onProgress === 'function') {
    onProgress(100);
  }

  return {
    blob: docxBlob,
    fileName: `${pdfFile.name.replace(/\.[^/.]+$/, '')}.docx`,
    pageCount: pdf.numPages,
  };
}
