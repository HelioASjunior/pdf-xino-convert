export const ScannerStates = {
  IDLE: 'idle',
  CHECKING: 'checking',
  READY: 'ready',
  CONNECTED: 'connected',
  SCANNING: 'scanning',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
  ERROR: 'error',
};

// Base contract to keep scanner SDK integration isolated from UI.
export class ScannerProvider {
  async listDevices() {
    throw new Error('listDevices() not implemented.');
  }

  async connect(_deviceId) {
    throw new Error('connect() not implemented.');
  }

  async scan(_options) {
    throw new Error('scan() not implemented.');
  }

  async cancel() {
    throw new Error('cancel() not implemented.');
  }

  async getStatus() {
    throw new Error('getStatus() not implemented.');
  }
}
