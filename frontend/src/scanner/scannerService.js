import { createScannerProvider } from './scannerFactory';
import { ScannerStates } from './providers/ScannerProvider';

function normalizeScannerError(error) {
  const code = error?.code || 'UNKNOWN_ERROR';

  if (code === 'SERVICE_UNAVAILABLE') {
    return {
      code,
      message: 'Componente local de digitalizacao nao encontrado. Instale ou inicie o servico de scanner para continuar.',
      recoverable: true,
    };
  }

  if (code === 'PERMISSION_DENIED') {
    return {
      code,
      message: 'Permissao negada para acessar o scanner. Verifique as permissoes do sistema.',
      recoverable: true,
    };
  }

  if (code === 'DEVICE_OFFLINE') {
    return {
      code,
      message: 'Scanner offline ou desconectado. Verifique cabo/rede e tente novamente.',
      recoverable: true,
    };
  }

  if (code === 'SCAN_CANCELED') {
    return {
      code,
      message: 'Digitalizacao cancelada.',
      recoverable: true,
    };
  }

  return {
    code,
    message: error?.message || 'Erro ao acessar o scanner.',
    recoverable: false,
  };
}

export class ScannerService {
  constructor(providerMode) {
    this.providerMode = providerMode;
    this.provider = createScannerProvider(providerMode);
  }

  setProviderMode(providerMode) {
    this.providerMode = providerMode;
    this.provider = createScannerProvider(providerMode);
  }

  async checkAvailability() {
    try {
      await this.provider.getStatus();
      return { available: true, mode: this.providerMode };
    } catch (error) {
      return { available: false, mode: this.providerMode, error: normalizeScannerError(error) };
    }
  }

  async listDevices() {
    try {
      return await this.provider.listDevices();
    } catch (error) {
      throw normalizeScannerError(error);
    }
  }

  async connect(deviceId) {
    try {
      return await this.provider.connect(deviceId);
    } catch (error) {
      throw normalizeScannerError(error);
    }
  }

  async scan(options) {
    try {
      return await this.provider.scan(options);
    } catch (error) {
      throw normalizeScannerError(error);
    }
  }

  async cancel() {
    try {
      return await this.provider.cancel();
    } catch (error) {
      throw normalizeScannerError(error);
    }
  }

  async getStatus() {
    try {
      return await this.provider.getStatus();
    } catch (error) {
      throw normalizeScannerError(error);
    }
  }
}

export function createScannerService(providerMode) {
  return new ScannerService(providerMode);
}

export { ScannerStates };
