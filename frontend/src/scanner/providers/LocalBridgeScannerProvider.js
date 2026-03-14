import { ScannerProvider, ScannerStates } from './ScannerProvider';

function parseError(response, fallbackMessage) {
  if (!response) {
    const error = new Error('Servico local de scanner indisponivel.');
    error.code = 'SERVICE_UNAVAILABLE';
    return error;
  }

  const message = response.error || response.message || fallbackMessage;
  const error = new Error(message);
  error.code = response.code || 'BRIDGE_ERROR';
  return error;
}

function base64ToBlob(base64, mimeType) {
  const binary = window.atob(base64);
  const length = binary.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType || 'image/jpeg' });
}

async function requestJson(url, options = {}) {
  const response = await window.fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw parseError(payload, 'Falha na comunicacao com o servico local de scanner.');
  }

  return payload;
}

export class LocalBridgeScannerProvider extends ScannerProvider {
  constructor({ baseUrl } = {}) {
    super();
    this.baseUrl = baseUrl || import.meta.env.VITE_SCANNER_BRIDGE_URL || 'http://127.0.0.1:24833';
  }

  async listDevices() {
    const payload = await requestJson(`${this.baseUrl}/devices`, { method: 'GET' });
    return payload.devices || [];
  }

  async connect(deviceId) {
    const payload = await requestJson(`${this.baseUrl}/connect`, {
      method: 'POST',
      body: JSON.stringify({ deviceId }),
    });

    return payload;
  }

  async scan(options = {}) {
    const scanPayload = {
      ...options,
    };
    delete scanPayload.onProgress;

    const payload = await requestJson(`${this.baseUrl}/scan`, {
      method: 'POST',
      body: JSON.stringify(scanPayload),
    });

    const pages = (payload.pages || []).map((page, index) => {
      const blob = base64ToBlob(page.base64, page.mimeType);
      return {
        blob,
        mimeType: page.mimeType || blob.type,
        name: page.name || `scan_${String(index + 1).padStart(2, '0')}.jpg`,
      };
    });

    return {
      pages,
      status: payload.status || {
        state: ScannerStates.COMPLETED,
        message: 'Digitalizacao concluida.',
        progress: 100,
        provider: 'bridge',
      },
    };
  }

  async cancel() {
    return requestJson(`${this.baseUrl}/cancel`, { method: 'POST', body: JSON.stringify({}) });
  }

  async getStatus() {
    return requestJson(`${this.baseUrl}/status`, { method: 'GET' });
  }
}
