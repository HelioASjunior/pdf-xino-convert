import { ScannerProvider, ScannerStates } from './ScannerProvider';

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function canvasToBlob(canvas, type = 'image/jpeg', quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Falha ao gerar imagem da digitalizacao simulada.'));
        return;
      }
      resolve(blob);
    }, type, quality);
  });
}

async function generateMockPage(index, options) {
  const canvas = document.createElement('canvas');
  canvas.width = 1240;
  canvas.height = 1754;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Falha ao inicializar renderizacao da pagina simulada.');
  }

  context.fillStyle = options.colorMode === 'bw' ? '#f2f2f2' : '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = '#d4d4d8';
  context.lineWidth = 4;
  context.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);

  context.fillStyle = '#0f172a';
  context.font = '700 46px Sora, sans-serif';
  context.fillText(`Pagina ${index}`, 86, 140);

  context.fillStyle = '#334155';
  context.font = '500 28px Manrope, sans-serif';
  context.fillText(`Scanner mock | ${options.colorMode.toUpperCase()} | ${options.dpi} DPI`, 86, 198);
  context.fillText(`Papel: ${options.paperSize} | Origem: ${options.source}`, 86, 248);

  for (let line = 0; line < 16; line += 1) {
    const y = 340 + line * 70;
    context.fillStyle = line % 2 === 0 ? '#334155' : '#475569';
    context.fillRect(86, y, canvas.width - 172, 6);
  }

  return canvasToBlob(canvas, options.outputFormat === 'png' ? 'image/png' : 'image/jpeg');
}

export class MockScannerProvider extends ScannerProvider {
  constructor() {
    super();
    this.status = {
      state: ScannerStates.IDLE,
      message: 'Modo simulacao pronto.',
      progress: 0,
      page: 0,
      totalPages: 0,
      provider: 'mock',
    };
    this.connectedDeviceId = null;
    this.abortRequested = false;
  }

  async listDevices() {
    this.status = { ...this.status, state: ScannerStates.READY, message: 'Scanners simulados disponiveis.' };

    return [
      {
        id: 'mock-adf-01',
        name: 'XinoScan Office 3000 (Mock)',
        capabilities: {
          duplex: true,
          adf: true,
          flatbed: true,
          colorModes: ['color', 'grayscale', 'bw'],
          dpi: [150, 200, 300],
          paperSizes: ['auto', 'A4', 'Letter'],
          outputFormats: ['pdf', 'jpg', 'png'],
        },
      },
      {
        id: 'mock-flatbed-02',
        name: 'Desk FlatScan Lite (Mock)',
        capabilities: {
          duplex: false,
          adf: false,
          flatbed: true,
          colorModes: ['color', 'grayscale'],
          dpi: [150, 200, 300],
          paperSizes: ['auto', 'A4'],
          outputFormats: ['pdf', 'jpg', 'png'],
        },
      },
    ];
  }

  async connect(deviceId) {
    this.connectedDeviceId = deviceId;
    this.status = {
      ...this.status,
      state: ScannerStates.CONNECTED,
      message: 'Scanner conectado (simulacao).',
      progress: 0,
    };

    return { connected: true, deviceId };
  }

  async scan(options = {}) {
    if (!this.connectedDeviceId) {
      const error = new Error('Nenhum scanner conectado.');
      error.code = 'NOT_CONNECTED';
      throw error;
    }

    this.abortRequested = false;

    const totalPages = Number(options.pages || (options.source === 'adf' ? 3 : 1));
    this.status = {
      ...this.status,
      state: ScannerStates.SCANNING,
      message: 'Digitalizacao em andamento.',
      page: 0,
      totalPages,
      progress: 0,
    };

    const pages = [];

    for (let pageIndex = 1; pageIndex <= totalPages; pageIndex += 1) {
      if (this.abortRequested) {
        const canceled = new Error('Digitalizacao cancelada.');
        canceled.code = 'SCAN_CANCELED';
        this.status = {
          ...this.status,
          state: ScannerStates.CANCELED,
          message: 'Digitalizacao cancelada pelo usuario.',
          progress: 0,
        };
        throw canceled;
      }

      this.status = {
        ...this.status,
        state: ScannerStates.SCANNING,
        message: `Digitalizando pagina ${pageIndex}...`,
        page: pageIndex,
        progress: Math.round((pageIndex / totalPages) * 100),
      };

      if (typeof options.onProgress === 'function') {
        options.onProgress(this.status);
      }

      await sleep(550);
      const blob = await generateMockPage(pageIndex, options);
      pages.push({
        blob,
        mimeType: blob.type || 'image/jpeg',
        name: `scan_${String(pageIndex).padStart(2, '0')}.${blob.type === 'image/png' ? 'png' : 'jpg'}`,
      });
    }

    this.status = {
      ...this.status,
      state: ScannerStates.COMPLETED,
      message: 'Digitalizacao concluida.',
      page: totalPages,
      totalPages,
      progress: 100,
    };

    if (typeof options.onProgress === 'function') {
      options.onProgress(this.status);
    }

    return { pages, status: this.status };
  }

  async cancel() {
    this.abortRequested = true;
    return { canceled: true };
  }

  async getStatus() {
    return this.status;
  }
}
