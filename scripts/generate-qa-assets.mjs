import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'qa-assets');

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeTextFile(filePath, content) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf8');
}

async function writeBinaryFile(filePath, content) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content);
}

function buildSvg({ title, subtitle, primary, secondary }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600" role="img" aria-labelledby="title desc">
  <title>${title}</title>
  <desc>${subtitle}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${primary}" />
      <stop offset="100%" stop-color="${secondary}" />
    </linearGradient>
  </defs>
  <rect width="1200" height="1600" fill="url(#bg)" rx="72" />
  <circle cx="950" cy="260" r="180" fill="rgba(255,255,255,0.16)" />
  <circle cx="260" cy="1280" r="220" fill="rgba(255,255,255,0.12)" />
  <rect x="100" y="120" width="1000" height="1360" rx="48" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.35)" stroke-width="4" />
  <text x="140" y="280" font-family="Georgia, serif" font-size="92" font-weight="700" fill="#ffffff">${title}</text>
  <text x="140" y="380" font-family="Arial, sans-serif" font-size="42" fill="#f4f4f4">${subtitle}</text>
  <rect x="140" y="470" width="920" height="16" fill="rgba(255,255,255,0.65)" rx="8" />
  <rect x="140" y="540" width="820" height="16" fill="rgba(255,255,255,0.45)" rx="8" />
  <rect x="140" y="610" width="880" height="16" fill="rgba(255,255,255,0.45)" rx="8" />
  <rect x="140" y="680" width="760" height="16" fill="rgba(255,255,255,0.45)" rx="8" />
  <rect x="140" y="860" width="420" height="260" fill="rgba(255,255,255,0.20)" rx="32" />
  <rect x="610" y="860" width="450" height="260" fill="rgba(255,255,255,0.12)" rx="32" />
  <text x="140" y="1320" font-family="Arial, sans-serif" font-size="36" fill="#ffffff">PDF XinoConvert QA Asset</text>
  <text x="140" y="1380" font-family="Arial, sans-serif" font-size="28" fill="#f0f0f0">Uso sugerido: imagem para PDF, ZIP e testes de upload</text>
</svg>`;
}

async function createPdf(filePath, linesPerPage) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  linesPerPage.forEach((lines, index) => {
    const page = pdfDoc.addPage([595.28, 841.89]);
    page.drawRectangle({ x: 40, y: 40, width: 515.28, height: 761.89, color: rgb(0.97, 0.98, 1) });
    page.drawText(`PDF XinoConvert - QA Asset`, { x: 60, y: 760, size: 22, font, color: rgb(0.12, 0.19, 0.32) });
    page.drawText(`Pagina ${index + 1}`, { x: 60, y: 728, size: 12, font, color: rgb(0.35, 0.4, 0.5) });

    let cursorY = 680;
    for (const line of lines) {
      page.drawText(line, { x: 60, y: cursorY, size: 13, font, color: rgb(0.18, 0.18, 0.18) });
      cursorY -= 24;
    }
  });

  const bytes = await pdfDoc.save();
  await writeBinaryFile(filePath, Buffer.from(bytes));
}

async function createDocx(filePath) {
  const zip = new JSZip();

  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`);

  zip.folder('_rels')?.file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`);

  zip.folder('docProps')?.file('core.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>QA Sample DOCX</dc:title>
  <dc:creator>GitHub Copilot</dc:creator>
  <cp:lastModifiedBy>GitHub Copilot</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-03-17T12:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-03-17T12:00:00Z</dcterms:modified>
</cp:coreProperties>`);

  zip.folder('docProps')?.file('app.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>PDF XinoConvert QA</Application>
</Properties>`);

  zip.folder('word')?.file('styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
</w:styles>`);

  zip.folder('word')?.file('document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 wp14">
  <w:body>
    <w:p><w:r><w:t>PDF XinoConvert - DOCX de teste</w:t></w:r></w:p>
    <w:p><w:r><w:t>Este arquivo serve para validar os fluxos Word para PDF e Documentos para PDF.</w:t></w:r></w:p>
    <w:p><w:r><w:t>Conteudo curto, simples e previsivel para QA manual.</w:t></w:r></w:p>
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`);

  const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  await writeBinaryFile(filePath, buffer);
}

function createWavBuffer({ durationSeconds = 1.5, frequency = 440, sampleRate = 44100 }) {
  const channels = 1;
  const bitsPerSample = 16;
  const totalSamples = Math.floor(durationSeconds * sampleRate);
  const blockAlign = channels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = totalSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < totalSamples; i += 1) {
    const time = i / sampleRate;
    const envelope = Math.min(1, i / 500) * Math.min(1, (totalSamples - i) / 500);
    const sample = Math.sin(2 * Math.PI * frequency * time) * 0.35 * envelope;
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
  }

  return buffer;
}

async function main() {
  await ensureDir(outputDir);

  await writeTextFile(path.join(outputDir, 'README.md'), `# QA Assets\n\nArquivos mínimos para validar os principais fluxos do PDF XinoConvert.\n\n## Conteúdo\n\n- images/sample-card-1.svg e images/sample-card-2.svg\n- pdf/sample-single-page.pdf\n- pdf/sample-two-pages.pdf\n- documents/sample.txt\n- documents/sample.md\n- documents/sample.csv\n- documents/sample.rtf\n- documents/sample.docx\n- audio/sample-tone.wav\n\n## Uso sugerido\n\n- Imagem para PDF: use os dois SVGs\n- PDF para Imagens: use sample-two-pages.pdf\n- Comprimir PDF: use sample-two-pages.pdf\n- Documentos para PDF: use TXT, MD, CSV, RTF ou DOCX\n- PDF para Word: use sample-single-page.pdf ou sample-two-pages.pdf\n- Word para PDF: use sample.docx\n- Utilitários ZIP: use qualquer combinação dos arquivos acima\n- Conversor de Áudio: use sample-tone.wav\n`);

  await writeTextFile(path.join(outputDir, 'images', 'sample-card-1.svg'), buildSvg({
    title: 'Sample Page One',
    subtitle: 'Asset visual para montar PDF a partir de imagens.',
    primary: '#124559',
    secondary: '#598392'
  }));

  await writeTextFile(path.join(outputDir, 'images', 'sample-card-2.svg'), buildSvg({
    title: 'Sample Page Two',
    subtitle: 'Segunda página com contraste diferente para validar ordenação.',
    primary: '#9c6644',
    secondary: '#dda15e'
  }));

  await writeTextFile(path.join(outputDir, 'documents', 'sample.txt'), `PDF XinoConvert - arquivo TXT de teste\n\nEste conteúdo serve para validar conversão simples de texto para PDF.\nLinha 1\nLinha 2\nLinha 3\n`);

  await writeTextFile(path.join(outputDir, 'documents', 'sample.md'), `# QA Sample Markdown\n\nEste arquivo valida o fluxo de conversão de Markdown para PDF.\n\n- item A\n- item B\n- item C\n`);

  await writeTextFile(path.join(outputDir, 'documents', 'sample.csv'), `produto,quantidade,valor\nCaneta,10,2.50\nCaderno,4,18.90\nMochila,1,120.00\n`);

  await writeTextFile(path.join(outputDir, 'documents', 'sample.rtf'), `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Arial;}}\\f0\\fs24 PDF XinoConvert - arquivo RTF de teste\\par Este arquivo pode ser usado para validar documentos de texto formatado.\\par}`);

  await createDocx(path.join(outputDir, 'documents', 'sample.docx'));

  await createPdf(path.join(outputDir, 'pdf', 'sample-single-page.pdf'), [[
    'Arquivo PDF simples para testes de upload, conversao e download.',
    'Use este arquivo para PDF para Word e verificacoes basicas.',
    'Conteudo previsivel facilita a validacao manual.'
  ]]);

  await createPdf(path.join(outputDir, 'pdf', 'sample-two-pages.pdf'), [
    [
      'Pagina 1: use este PDF para extrair imagens e testar compressao.',
      'Este arquivo possui duas paginas para facilitar a validacao do resultado.',
      'Verifique se ambas aparecem no fluxo de saida.'
    ],
    [
      'Pagina 2: variacao de conteudo para conferir ordenacao e contagem.',
      'Tambem pode ser usado em testes de uniao e reorganizacao.',
      'Se o app gerar ZIP, confira se ha dois itens de saida.'
    ]
  ]);

  await writeBinaryFile(path.join(outputDir, 'audio', 'sample-tone.wav'), createWavBuffer({ durationSeconds: 2, frequency: 523.25 }));

  console.log(`QA assets generated in ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
