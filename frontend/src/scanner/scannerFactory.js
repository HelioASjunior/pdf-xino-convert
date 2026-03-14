import { MockScannerProvider } from './providers/MockScannerProvider';
import { LocalBridgeScannerProvider } from './providers/LocalBridgeScannerProvider';

export function createScannerProvider(mode = import.meta.env.VITE_SCANNER_PROVIDER || 'bridge') {
  if (mode === 'mock') {
    return new MockScannerProvider();
  }

  return new LocalBridgeScannerProvider();
}
