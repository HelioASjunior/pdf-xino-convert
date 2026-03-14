const fs = require('fs/promises');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { createOutputPath } = require('../utils/fileStorage');

const PAGE_SIZES = {
  A4: [595.28, 841.89],
  Letter: [612, 792],
  Legal: [612, 1008],
};

function normalizeNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function prepareImageForPdf(file, shouldCompress) {
  const originalBuffer = await fs.readFile(file.path);

  if (!shouldCompress && ['image/jpeg', 'image/png'].includes(file.mimetype)) {
    return {
      buffer: originalBuffer,
      mimeType: file.mimetype,
    };
  }

  const image = await loadImage(originalBuffer);
  const maxDimension = shouldCompress ? 2200 : Math.max(image.width, image.height);
  const ratio = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');

  context.drawImage(image, 0, 0, width, height);

  const base64 = canvas.toDataURL('image/jpeg', shouldCompress ? 0.82 : 0.92).split(',')[1];

  return {
    buffer: Buffer.from(base64, 'base64'),
    mimeType: 'image/jpeg',
  };
}

function getPageDimensions(pageSize, orientation) {
  const baseSize = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;
  return orientation === 'landscape' ? [baseSize[1], baseSize[0]] : baseSize;
}

function calculatePlacement({ pageWidth, pageHeight, imageWidth, imageHeight, margin, fitMode }) {
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2;

  if (fitMode === 'stretch') {
    return {
      x: margin,
      y: margin,
      width: availableWidth,
      height: availableHeight,
    };
  }

  const widthRatio = availableWidth / imageWidth;
  const heightRatio = availableHeight / imageHeight;
  const scale = fitMode === 'cover' ? Math.max(widthRatio, heightRatio) : Math.min(widthRatio, heightRatio);
  const width = imageWidth * scale;
  const height = imageHeight * scale;

  return {
    x: (pageWidth - width) / 2,
    y: (pageHeight - height) / 2,
    width,
    height,
  };
}

async function buildPdfFromImages({ files, options }) {
  const pdf = await PDFDocument.create();
  const orientation = options.orientation === 'landscape' ? 'landscape' : 'portrait';
  const pageSize = options.pageSize || 'A4';
  const margin = normalizeNumber(options.margin, 24);
  const fitMode = options.imageFit || 'contain';
  const compressImages = options.compressImages === 'true';
  const [pageWidth, pageHeight] = getPageDimensions(pageSize, orientation);

  for (const file of files) {
    const prepared = await prepareImageForPdf(file, compressImages);
    const image = prepared.mimeType === 'image/png'
      ? await pdf.embedPng(prepared.buffer)
      : await pdf.embedJpg(prepared.buffer);

    const page = pdf.addPage([pageWidth, pageHeight]);
    const placement = calculatePlacement({
      pageWidth,
      pageHeight,
      imageWidth: image.width,
      imageHeight: image.height,
      margin,
      fitMode,
    });

    page.drawImage(image, placement);
  }

  const outputName = `images-to-pdf-${Date.now()}.pdf`;
  const outputPath = createOutputPath(outputName);
  const pdfBytes = await pdf.save({ useObjectStreams: true, addDefaultPage: false });

  await fs.writeFile(outputPath, pdfBytes);

  return {
    fileName: outputName,
    filePath: outputPath,
  };
}

module.exports = {
  buildPdfFromImages,
};
