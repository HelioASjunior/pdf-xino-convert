export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_PDF_SIZE = 40 * 1024 * 1024;

export function validateFiles(files, { mimeTypes, maxSize, multiple = true }) {
  if (!files.length) {
    return 'Selecione pelo menos um arquivo.';
  }

  if (!multiple && files.length > 1) {
    return 'Selecione apenas um arquivo por vez.';
  }

  for (const file of files) {
    if (mimeTypes && !mimeTypes.includes(file.type)) {
      return `O arquivo ${file.name} não possui um formato aceito.`;
    }

    if (maxSize && file.size > maxSize) {
      return `O arquivo ${file.name} ultrapassa o limite permitido.`;
    }
  }

  return null;
}
