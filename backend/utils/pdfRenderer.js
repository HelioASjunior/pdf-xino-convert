const { createCanvas } = require('@napi-rs/canvas');

// Cache the module so we only import and configure pdfjs once.
let _pdfjs = null;

async function loadPdfJs() {
  if (_pdfjs) return _pdfjs;

  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

  // In Node.js the worker must be pointed at the real worker file via a file:// URL.
  const workerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    `file:///${workerPath.replace(/\\/g, '/')}`
  ).href;

  _pdfjs = pdfjs;
  return pdfjs;
}

function dataUrlToBuffer(dataUrl) {
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

async function renderPdfPages(pdfBuffer, options = {}) {
  const pdfjs = await loadPdfJs();
  const documentTask = pdfjs.getDocument({
    data: new Uint8Array(pdfBuffer),
    useSystemFonts: true,
    isEvalSupported: false,
  });
  const pdfDocument = await documentTask.promise;
  const results = [];

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
    const page = await pdfDocument.getPage(pageNumber);
    const originalViewport = page.getViewport({ scale: 1 });
    const renderViewport = page.getViewport({ scale: options.scale || 1.8 });
    const canvas = createCanvas(Math.ceil(renderViewport.width), Math.ceil(renderViewport.height));
    const context = canvas.getContext('2d');

    await page.render({
      canvasContext: context,
      viewport: renderViewport,
    }).promise;

    const buffer = options.format === 'jpg'
      ? dataUrlToBuffer(canvas.toDataURL('image/jpeg', options.quality || 0.8))
      : dataUrlToBuffer(canvas.toDataURL('image/png'));

    results.push({
      pageNumber,
      buffer,
      originalWidth: originalViewport.width,
      originalHeight: originalViewport.height,
    });
  }

  return results;
}

module.exports = {
  renderPdfPages,
};
