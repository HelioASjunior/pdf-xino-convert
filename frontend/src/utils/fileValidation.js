export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_PDF_SIZE = 100 * 1024 * 1024;

function matchesMimeType(fileType, acceptedType) {
  if (!fileType || !acceptedType) {
    return false;
  }

  if (acceptedType.endsWith('/*')) {
    const prefix = acceptedType.slice(0, acceptedType.indexOf('/'));
    return fileType.startsWith(`${prefix}/`);
  }

  return fileType === acceptedType;
}

function hasAcceptedExtension(fileName, acceptedExtensions) {
  if (!fileName || !acceptedExtensions?.length) {
    return false;
  }

  const normalizedName = String(fileName).toLowerCase();
  return acceptedExtensions.some((extension) => normalizedName.endsWith(String(extension).toLowerCase()));
}

export function validateFiles(files, {
  mimeTypes,
  extensions,
  maxSize,
  multiple = true,
}) {
  if (!files.length) {
    return 'Selecione pelo menos um arquivo.';
  }

  if (!multiple && files.length > 1) {
    return 'Selecione apenas um arquivo por vez.';
  }

  for (const file of files) {
    const mimeAccepted = mimeTypes
      ? mimeTypes.some((acceptedType) => matchesMimeType(file.type, acceptedType))
      : false;
    const extensionAccepted = hasAcceptedExtension(file.name, extensions);

    if ((mimeTypes || extensions) && !mimeAccepted && !extensionAccepted) {
      return `O arquivo ${file.name} não possui um formato aceito.`;
    }

    if (maxSize && file.size > maxSize) {
      return `O arquivo ${file.name} ultrapassa o limite permitido.`;
    }
  }

  return null;
}
