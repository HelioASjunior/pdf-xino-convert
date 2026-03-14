import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export function resolveAssetUrl(url) {
  if (!url) {
    return '';
  }

  if (url.startsWith('http')) {
    return url;
  }

  return `${API_BASE_URL}${url}`;
}

export function postImageToPdf(formData, onUploadProgress) {
  return api.post('/api/image-to-pdf', formData, {
    responseType: 'blob',
    onUploadProgress,
  });
}

export function postPdfToImages(formData, onUploadProgress) {
  return api.post('/api/pdf-to-images', formData, {
    onUploadProgress,
  });
}

export function postCompressPdf(formData, onUploadProgress) {
  return api.post('/api/compress-pdf', formData, {
    responseType: 'blob',
    onUploadProgress,
  });
}
