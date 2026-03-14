const MAX_SCAN_MEMORY_BYTES = 120 * 1024 * 1024;

function toImageBitmapSource(blob) {
  return window.createImageBitmap(blob);
}

function canvasToBlob(canvas, type = 'image/jpeg', quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Nao foi possivel gerar a imagem processada.'));
        return;
      }
      resolve(blob);
    }, type, quality);
  });
}

function ensureMemoryBudget(nextPages) {
  const total = nextPages.reduce((sum, page) => sum + page.file.size, 0);
  if (total > MAX_SCAN_MEMORY_BYTES) {
    const error = new Error('As paginas escaneadas ultrapassaram o limite de memoria temporaria (120 MB). Remova algumas paginas e tente novamente.');
    error.code = 'MEMORY_LIMIT_EXCEEDED';
    throw error;
  }
}

export function revokePageUrls(pages) {
  pages.forEach((page) => {
    if (page.preview) {
      URL.revokeObjectURL(page.preview);
    }
  });
}

export function buildScannedPages(scanResult) {
  const pages = (scanResult.pages || []).map((page, index) => {
    const blob = page.blob;
    const file = new File([blob], page.name || `scan_${index + 1}.jpg`, {
      type: page.mimeType || blob.type || 'image/jpeg',
    });

    return {
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      rotation: 0,
      cropApplied: false,
    };
  });

  ensureMemoryBudget(pages);
  return pages;
}

export function mergeScannedPages(currentPages, newPages) {
  const merged = [...currentPages, ...newPages];
  ensureMemoryBudget(merged);
  return merged;
}

async function transformImageBlob(blob, drawFn, outputType) {
  const bitmap = await toImageBitmapSource(blob);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Falha ao inicializar edicao da imagem escaneada.');
  }

  drawFn({ canvas, context, bitmap });
  const transformed = await canvasToBlob(canvas, outputType || blob.type || 'image/jpeg');
  bitmap.close?.();
  return transformed;
}

export async function rotateScannedPage(page, degrees = 90) {
  const normalized = ((degrees % 360) + 360) % 360;
  if (normalized === 0) {
    return page;
  }

  const transformedBlob = await transformImageBlob(page.file, ({ canvas, context, bitmap }) => {
    const quarterTurn = normalized === 90 || normalized === 270;
    canvas.width = quarterTurn ? bitmap.height : bitmap.width;
    canvas.height = quarterTurn ? bitmap.width : bitmap.height;

    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate((normalized * Math.PI) / 180);
    context.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
  });

  URL.revokeObjectURL(page.preview);
  const file = new File([transformedBlob], page.file.name, { type: transformedBlob.type });

  return {
    ...page,
    file,
    preview: URL.createObjectURL(file),
    rotation: (page.rotation + normalized) % 360,
  };
}

export async function cropScannedPage(page, marginPercent = 0.05) {
  const transformedBlob = await transformImageBlob(page.file, ({ canvas, context, bitmap }) => {
    const marginX = Math.floor(bitmap.width * marginPercent);
    const marginY = Math.floor(bitmap.height * marginPercent);
    const width = Math.max(200, bitmap.width - marginX * 2);
    const height = Math.max(200, bitmap.height - marginY * 2);

    canvas.width = width;
    canvas.height = height;
    context.drawImage(bitmap, marginX, marginY, width, height, 0, 0, width, height);
  });

  URL.revokeObjectURL(page.preview);
  const file = new File([transformedBlob], page.file.name, { type: transformedBlob.type });

  return {
    ...page,
    file,
    preview: URL.createObjectURL(file),
    cropApplied: true,
  };
}

export async function pageToDownloadBlob(page, outputFormat) {
  if (outputFormat === 'png' && page.file.type !== 'image/png') {
    return transformImageBlob(page.file, ({ canvas, context, bitmap }) => {
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      context.drawImage(bitmap, 0, 0);
    }, 'image/png');
  }

  if (outputFormat === 'jpg' && page.file.type !== 'image/jpeg') {
    return transformImageBlob(page.file, ({ canvas, context, bitmap }) => {
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      context.drawImage(bitmap, 0, 0);
    }, 'image/jpeg');
  }

  return page.file;
}
