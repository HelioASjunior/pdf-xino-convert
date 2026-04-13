import heic2any from 'heic2any';

function hasImageExtension(fileName = '', extensions = []) {
  const normalizedName = String(fileName || '').toLowerCase();
  return extensions.some((extension) => normalizedName.endsWith(extension));
}

function isHeicFile(file) {
  return ['image/heic', 'image/heif'].includes(file?.type)
    || hasImageExtension(file?.name, ['.heic', '.heif']);
}

export async function createImagePreviewUrl(file) {
  if (!isHeicFile(file)) {
    return URL.createObjectURL(file);
  }

  try {
    const converted = await heic2any({
      blob: file,
      toType: 'image/png',
    });

    const blob = Array.isArray(converted) ? converted[0] : converted;
    return URL.createObjectURL(blob);
  } catch {
    return URL.createObjectURL(file);
  }
}
