import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

const targetMimeMap = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  bmp: 'image/bmp',
  gif: 'image/gif',
};

function extensionFor(format) {
  const normalized = String(format || '').toLowerCase();
  if (normalized === 'jpg') {
    return 'jpg';
  }
  return normalized;
}

async function readImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Formato não suportado pelo navegador para ${file.name}.`));
    };
    image.src = url;
  });
}

async function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Falha ao gerar arquivo de imagem.'));
        return;
      }
      resolve(blob);
    }, mimeType, quality);
  });
}

async function convertSingleImage(file, targetFormat, quality = 0.9) {
  const normalizedTarget = extensionFor(targetFormat);
  const targetMime = targetMimeMap[normalizedTarget];

  if (!targetMime) {
    throw new Error(`Formato de saída não suportado: ${targetFormat}`);
  }

  const image = await readImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Falha ao preparar conversão da imagem.');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);

  const sourceNeedsCompression = ['image/jpeg', 'image/webp'].includes(file.type);
  const sourceFile = sourceNeedsCompression
    ? await imageCompression(file, {
      maxWidthOrHeight: 2800,
      initialQuality: quality,
      useWebWorker: true,
    })
    : file;

  const sourceImage = sourceNeedsCompression ? await readImage(sourceFile) : null;
  if (sourceImage) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
  }

  const convertedBlob = await canvasToBlob(canvas, targetMime, quality);
  const extension = extensionFor(targetFormat);
  const fileName = `${file.name.replace(/\.[^/.]+$/, '')}.${extension}`;

  return {
    name: fileName,
    blob: convertedBlob,
    previewUrl: URL.createObjectURL(convertedBlob),
  };
}

export async function convertImageFiles(files, targetFormat, quality, onProgress) {
  const converted = [];
  const failed = [];

  for (let index = 0; index < files.length; index += 1) {
    try {
      const output = await convertSingleImage(files[index], targetFormat, quality);
      converted.push(output);
    } catch (error) {
      failed.push({ fileName: files[index].name, reason: error.message });
    }

    if (typeof onProgress === 'function') {
      onProgress(Math.round(((index + 1) / files.length) * 100));
    }
  }

  return { converted, failed };
}

export async function buildImagesZip(items, zipName, onProgress) {
  const zip = new JSZip();
  items.forEach((item) => zip.file(item.name, item.blob));

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
