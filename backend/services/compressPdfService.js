const fs = require('fs/promises');
const { PDFDocument } = require('pdf-lib');
const { renderPdfPages } = require('../utils/pdfRenderer');
const { createOutputPath } = require('../utils/fileStorage');

const COMPRESSION_PRESETS = {
  low: { scale: 1.8, quality: 0.82 },
  medium: { scale: 1.35, quality: 0.66 },
  high: { scale: 1.05, quality: 0.48 },
};

async function compressPdfFile({ file, level = 'medium' }) {
  const preset = COMPRESSION_PRESETS[level] || COMPRESSION_PRESETS.medium;
  const inputBuffer = await fs.readFile(file.path);
  const originalSize = inputBuffer.length;
  const renderedPages = await renderPdfPages(inputBuffer, {
    format: 'jpg',
    scale: preset.scale,
    quality: preset.quality,
  });

  const outputPdf = await PDFDocument.create();

  for (const page of renderedPages) {
    const embeddedImage = await outputPdf.embedJpg(page.buffer);
    const outputPage = outputPdf.addPage([page.originalWidth, page.originalHeight]);

    outputPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: page.originalWidth,
      height: page.originalHeight,
    });
  }

  const outputName = `compressed-${Date.now()}.pdf`;
  const outputPath = createOutputPath(outputName);
  const outputBytes = await outputPdf.save({ useObjectStreams: true, addDefaultPage: false });

  await fs.writeFile(outputPath, outputBytes);

  const finalSize = outputBytes.length;
  const reductionPercent = originalSize > 0
    ? Number((((originalSize - finalSize) / originalSize) * 100).toFixed(2))
    : 0;

  return {
    fileName: outputName,
    filePath: outputPath,
    originalSize,
    finalSize,
    reductionPercent,
  };
}

module.exports = {
  compressPdfFile,
};
