export function formatBytes(bytes = 0) {
  if (!bytes) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function formatPercent(value = 0) {
  return `${Number(value).toFixed(2)}%`;
}

export function formatDate(dateString) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dateString));
}

export function getFilenameFromHeaders(headers, fallback) {
  const directName = headers['x-download-filename'];

  if (directName) {
    return directName;
  }

  const disposition = headers['content-disposition'];
  const match = disposition?.match(/filename="?([^\"]+)"?/i);
  return match?.[1] || fallback;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  return url;
}
