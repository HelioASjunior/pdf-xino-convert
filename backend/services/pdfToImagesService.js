const fs = require('fs/promises');
const path = require('path');
const archiver = require('archiver');
const { renderPdfPages } = require('../utils/pdfRenderer');
const { createSessionTempDir } = require('../utils/fileStorage');

async function createZipFromFiles(directoryPath, fileNames) {
  const zipPath = path.join(directoryPath, 'pages.zip');

  await new Promise((resolve, reject) => {
    const output = require('fs').createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);

    for (const fileName of fileNames) {
      archive.file(path.join(directoryPath, fileName), { name: fileName });
    }

    archive.finalize();
  });

  return zipPath;
}

async function extractPdfPagesAsImages({ file, format = 'png', requestBaseUrl }) {
  const normalizedFormat = format === 'jpg' ? 'jpg' : 'png';
  const { sessionId, directoryPath } = await createSessionTempDir('pdf-pages');
  const pdfBuffer = await fs.readFile(file.path);
  const renderedPages = await renderPdfPages(pdfBuffer, {
    format: normalizedFormat,
    scale: 2,
    quality: 0.9,
  });

  const images = [];

  for (const page of renderedPages) {
    const fileName = `page-${page.pageNumber}.${normalizedFormat}`;
    const filePath = path.join(directoryPath, fileName);
    await fs.writeFile(filePath, page.buffer);

    images.push({
      name: fileName,
      size: page.buffer.length,
      url: `${requestBaseUrl}/temp-files/${sessionId}/${fileName}`,
    });
  }

  await createZipFromFiles(directoryPath, images.map((item) => item.name));

  return {
    sessionId,
    pageCount: images.length,
    images,
    zipUrl: `${requestBaseUrl}/temp-files/${sessionId}/pages.zip`,
  };
}

module.exports = {
  extractPdfPagesAsImages,
};
