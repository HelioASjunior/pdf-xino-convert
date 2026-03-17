import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();

export async function createPdfPreviewUrl(file, width = 220) {
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdfDoc = await loadingTask.promise;
  const page = await pdfDoc.getPage(1);

  const baseViewport = page.getViewport({ scale: 1 });
  const scale = Math.max(0.5, Math.min(2.2, width / baseViewport.width));
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: false });

  if (!context) {
    throw new Error('Nao foi possivel criar o canvas para o preview do PDF.');
  }

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  await page.render({ canvasContext: context, viewport }).promise;

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Falha ao gerar preview do PDF.'));
        }
      },
      'image/jpeg',
      0.82,
    );
  });

  return URL.createObjectURL(blob);
}