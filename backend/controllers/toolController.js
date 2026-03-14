const fs = require('fs/promises');
const path = require('path');
const { buildPdfFromImages } = require('../services/imageToPdfService');
const { extractPdfPagesAsImages } = require('../services/pdfToImagesService');
const { compressPdfFile } = require('../services/compressPdfService');
const { cleanupFiles, cleanupPath } = require('../utils/fileStorage');

function setDownloadHeaders(res, fileName) {
  res.setHeader('X-Download-Filename', fileName);
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, X-Download-Filename, X-Original-Size, X-Final-Size, X-Reduction-Percent');
}

async function createPdfFromImages(req, res, next) {
  try {
    if (!req.files?.length) {
      const error = new Error('Selecione ao menos uma imagem para gerar o PDF.');
      error.status = 400;
      throw error;
    }

    const result = await buildPdfFromImages({
      files: req.files,
      options: req.body,
    });

    setDownloadHeaders(res, result.fileName);

    res.download(result.filePath, result.fileName, async (downloadError) => {
      await cleanupFiles(req.files);
      await cleanupPath(result.filePath);

      if (downloadError && !res.headersSent) {
        next(downloadError);
      }
    });
  } catch (error) {
    await cleanupFiles(req.files);
    next(error);
  }
}

async function convertPdfToImages(req, res, next) {
  try {
    if (!req.file) {
      const error = new Error('Envie um arquivo PDF para extrair as páginas.');
      error.status = 400;
      throw error;
    }

    const result = await extractPdfPagesAsImages({
      file: req.file,
      format: req.body.format,
      requestBaseUrl: `${req.protocol}://${req.get('host')}`,
    });

    await cleanupFiles([req.file]);

    res.json(result);
  } catch (error) {
    await cleanupFiles(req.file ? [req.file] : []);
    next(error);
  }
}

async function compressPdf(req, res, next) {
  try {
    if (!req.file) {
      const error = new Error('Envie um arquivo PDF para compactar.');
      error.status = 400;
      throw error;
    }

    const result = await compressPdfFile({
      file: req.file,
      level: req.body.level,
    });

    setDownloadHeaders(res, result.fileName);
    res.setHeader('X-Original-Size', String(result.originalSize));
    res.setHeader('X-Final-Size', String(result.finalSize));
    res.setHeader('X-Reduction-Percent', String(result.reductionPercent));

    res.download(result.filePath, result.fileName, async (downloadError) => {
      await cleanupFiles([req.file]);
      await cleanupPath(result.filePath);

      if (downloadError && !res.headersSent) {
        next(downloadError);
      }
    });
  } catch (error) {
    await cleanupFiles(req.file ? [req.file] : []);
    next(error);
  }
}

module.exports = {
  createPdfFromImages,
  convertPdfToImages,
  compressPdf,
};
