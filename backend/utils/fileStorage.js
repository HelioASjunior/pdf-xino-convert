const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const sanitize = require('sanitize-filename');

const ROOT_DIR = path.join(__dirname, '..');
const UPLOAD_DIR = path.join(ROOT_DIR, 'uploads');
const TEMP_DIR = path.join(ROOT_DIR, 'temp');
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PDF_MIME_TYPES = ['application/pdf'];

function ensureRuntimeDirectories() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

function safeFileName(originalName) {
  const extension = path.extname(originalName).toLowerCase();
  const name = sanitize(path.basename(originalName, extension)).replace(/\s+/g, '-').toLowerCase() || 'file';
  return `${name}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}${extension}`;
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, UPLOAD_DIR),
  filename: (_req, file, callback) => callback(null, safeFileName(file.originalname)),
});

function buildUploader({ allowedTypes, maxFileSize }) {
  return multer({
    storage,
    limits: {
      fileSize: maxFileSize,
    },
    fileFilter: (_req, file, callback) => {
      if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
        return;
      }

      const error = new Error('Tipo de arquivo não permitido para esta operação.');
      error.status = 400;
      callback(error);
    },
  });
}

const imageUpload = buildUploader({
  allowedTypes: IMAGE_MIME_TYPES,
  maxFileSize: 10 * 1024 * 1024,
});

const pdfUpload = buildUploader({
  allowedTypes: PDF_MIME_TYPES,
  maxFileSize: 40 * 1024 * 1024,
});

function createOutputPath(fileName) {
  ensureRuntimeDirectories();
  return path.join(TEMP_DIR, fileName);
}

async function createSessionTempDir(prefix) {
  ensureRuntimeDirectories();
  const sessionId = `${prefix}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const directoryPath = path.join(TEMP_DIR, sessionId);

  await fs.promises.mkdir(directoryPath, { recursive: true });

  return {
    sessionId,
    directoryPath,
  };
}

async function cleanupPath(targetPath) {
  if (!targetPath) {
    return;
  }

  try {
    const stats = await fs.promises.stat(targetPath);

    if (stats.isDirectory()) {
      await fs.promises.rm(targetPath, { recursive: true, force: true });
      return;
    }

    await fs.promises.unlink(targetPath);
  } catch {
    // Ignore cleanup errors.
  }
}

async function cleanupFiles(files = []) {
  await Promise.all(
    files
      .filter(Boolean)
      .map((file) => cleanupPath(file.path))
  );
}

async function purgeOldEntries(directoryPath, maxAgeMs) {
  let entries = [];

  try {
    entries = await fs.promises.readdir(directoryPath, { withFileTypes: true });
  } catch {
    return;
  }

  const now = Date.now();

  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directoryPath, entry.name);

      try {
        const stats = await fs.promises.stat(entryPath);

        if (now - stats.mtimeMs > maxAgeMs) {
          await cleanupPath(entryPath);
        }
      } catch {
        // Ignore cleanup errors.
      }
    })
  );
}

function startTempCleanupJob() {
  const maxAgeMs = 1000 * 60 * 60;
  purgeOldEntries(TEMP_DIR, maxAgeMs);
  setInterval(() => purgeOldEntries(TEMP_DIR, maxAgeMs), 1000 * 60 * 20).unref();
}

module.exports = {
  TEMP_DIR,
  ensureRuntimeDirectories,
  imageUpload,
  pdfUpload,
  createOutputPath,
  createSessionTempDir,
  cleanupPath,
  cleanupFiles,
  startTempCleanupJob,
};
