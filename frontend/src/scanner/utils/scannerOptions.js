export const defaultScanOptions = {
  colorMode: 'color',
  dpi: '300',
  paperSize: 'auto',
  duplex: false,
  source: 'adf',
  outputFormat: 'pdf',
  pages: '2',
};

export function buildScanOptionList(capabilities = {}) {
  return {
    colorModes: capabilities.colorModes || ['color', 'grayscale', 'bw'],
    dpi: capabilities.dpi || [150, 200, 300],
    paperSizes: capabilities.paperSizes || ['auto', 'A4', 'Letter'],
    outputFormats: capabilities.outputFormats || ['pdf', 'jpg', 'png'],
    duplexEnabled: Boolean(capabilities.duplex),
    adfEnabled: Boolean(capabilities.adf),
    flatbedEnabled: Boolean(capabilities.flatbed),
  };
}
