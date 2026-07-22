import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, degrees } from 'pdf-lib';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toInt(value) {
  const parsed = Number.parseInt(String(value).trim(), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizePageText(value) {
  return String(value)
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n?/g, '\n');
}

function textToParagraphs(value) {
  const normalized = normalizePageText(value).trim();

  if (!normalized) {
    return [];
  }

  return normalized
    .split(/\n{2,}/)
    .map((block) => block.replace(/[ \t]*\n[ \t]*/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function decodePdfString(value) {
  return String(value || '').replace(/^\uFEFF/, '').trim();
}

function formatPdfDate(value) {
  const text = decodePdfString(value).replace(/^D:/, '');
  const match = text.match(/^(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?/);

  if (!match) {
    return null;
  }

  const [year, month = '01', day = '01', hour = '00', minute = '00', second = '00'] = match.slice(1);
  return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
}

function buildTitlePageXhtml({ title, coverImageHref }) {
  return `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="pt-BR" lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" type="text/css" href="styles/style.css" />
</head>
<body>
  <section class="chapter chapter-cover chapter-cover-image">
    <img class="cover-image" src="${escapeHtml(coverImageHref)}" alt="${escapeHtml(title)}" />
  </section>
</body>
</html>`;
}

function buildChapterXhtml({ title, pageTitle, paragraphs, imageHref }) {
  const body = paragraphs.length
    ? paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n')
    : `<div class="page-image"><img src="${escapeHtml(imageHref)}" alt="${escapeHtml(pageTitle)}" /></div>`;

  return `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="pt-BR" lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(pageTitle)}</title>
  <link rel="stylesheet" type="text/css" href="../styles/style.css" />
</head>
<body>
  <section class="chapter">
    <h1>${escapeHtml(title)}</h1>
    <h2>${escapeHtml(pageTitle)}</h2>
    ${body}
  </section>
</body>
</html>`;
}

function buildNavXhtml(bookTitle, chapterCount) {
  const items = [...Array(chapterCount).keys()]
    .map((index) => {
      const pageNumber = index + 1;
      const fileName = `page-${String(pageNumber).padStart(3, '0')}.xhtml`;
      return `<li><a href="text/${fileName}">Página ${pageNumber}</a></li>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="pt-BR" lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(bookTitle)}</title>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>${escapeHtml(bookTitle)}</h1>
    <ol>
      ${items}
    </ol>
  </nav>
</body>
</html>`;
}

function buildContainerXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml" />
  </rootfiles>
</container>`;
}

function buildStyleSheet() {
  return `body {
  font-family: serif;
  line-height: 1.5;
  margin: 0;
  padding: 1.25rem;
  color: #111827;
  background: #ffffff;
}

.chapter {
  max-width: 42rem;
  margin: 0 auto;
}

.chapter-cover {
  min-height: calc(100vh - 2.5rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.chapter-cover-image {
  align-items: center;
}

.cover-image {
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  object-fit: contain;
  border-radius: 0.75rem;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
}

.cover-label {
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.78rem;
  color: #0e7490;
}

.meta-line {
  margin: 0 0 0.5rem;
  color: #4b5563;
}

.chapter h1 {
  font-size: 1.6rem;
  margin: 0 0 0.5rem;
}

.chapter h2 {
  font-size: 1rem;
  margin: 0 0 1rem;
  color: #4b5563;
}

.chapter p {
  margin: 0 0 1rem;
  text-align: justify;
}

.page-image img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
}
`;
}

async function renderPageImageBlob(page, options = {}) {
  const baseViewport = page.getViewport({ scale: 1 });
  const maxWidth = options.maxWidth || 1600;
  const quality = typeof options.quality === 'number' ? options.quality : 0.88;
  const scale = Math.max(1, Math.min(2.5, maxWidth / baseViewport.width));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: false });

  if (!context) {
    throw new Error('Nao foi possivel criar a imagem da pagina do PDF.');
  }

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  await page.render({ canvasContext: context, viewport }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
      } else {
        reject(new Error('Falha ao gerar a imagem da pagina do PDF.'));
      }
    }, 'image/jpeg', quality);
  });
}

async function createPdfEpubBlob(file, onProgress) {
  const bytes = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: bytes });
  const pdfDocument = await loadingTask.promise;
  const { info = {} } = await pdfDocument.getMetadata().catch(() => ({ info: {} }));
  const rawTitle = decodePdfString(info.Title);
  const rawAuthor = decodePdfString(info.Author);
  const rawSubject = decodePdfString(info.Subject);
  const rawCreationDate = formatPdfDate(info.CreationDate);
  const rawLanguage = decodePdfString(info.Language) || 'pt-BR';
  const fileTitle = file.name.replace(/\.[^/.]+$/, '') || 'Documento';
  const bookTitle = rawTitle || fileTitle;
  const bookAuthor = rawAuthor || 'PDF XinoConvert';
  const bookDescription = rawSubject || `Versão EPUB gerada a partir de ${fileTitle}`;
  const pageCount = pdfDocument.numPages;
  const chapters = [];
  const imageEntries = [];
  const manifestEntries = [];
  const spineEntries = [];
  const coverPage = await pdfDocument.getPage(1);
  const coverBlob = await renderPageImageBlob(coverPage, { maxWidth: 1800, quality: 0.9 });
  const coverBuffer = await coverBlob.arrayBuffer();

  imageEntries.push({ path: 'OEBPS/images/cover.jpg', content: coverBuffer });

  for (let pageIndex = 1; pageIndex <= pageCount; pageIndex += 1) {
    const page = await pdfDocument.getPage(pageIndex);
    const textContent = await page.getTextContent();
    let pageText = '';

    textContent.items.forEach((item) => {
      if (item?.str) {
        pageText += item.str;
      }
      pageText += item?.hasEOL ? '\n' : ' ';
    });

    const paragraphs = textToParagraphs(pageText);
    const pageId = `page-${String(pageIndex).padStart(3, '0')}`;
    const chapterPath = `OEBPS/text/${pageId}.xhtml`;
    const imagePath = `OEBPS/images/${pageId}.jpg`;

    if (paragraphs.length) {
      chapters.push({
        path: chapterPath,
        content: buildChapterXhtml({
          title: bookTitle,
          pageTitle: `Página ${pageIndex}`,
          paragraphs,
          imageHref: '',
        }),
      });
      manifestEntries.push(`<item id="${pageId}" href="text/${pageId}.xhtml" media-type="application/xhtml+xml" />`);
    } else {
      const imageBlob = await renderPageImageBlob(page);
      const imageBuffer = await imageBlob.arrayBuffer();
      imageEntries.push({ path: imagePath, content: imageBuffer });
      chapters.push({
        path: chapterPath,
        content: buildChapterXhtml({
          title: bookTitle,
          pageTitle: `Página ${pageIndex}`,
          paragraphs: [],
          imageHref: `../images/${pageId}.jpg`,
        }),
      });
      manifestEntries.push(`<item id="${pageId}" href="text/${pageId}.xhtml" media-type="application/xhtml+xml" />`);
      manifestEntries.push(`<item id="${pageId}-img" href="images/${pageId}.jpg" media-type="image/jpeg" />`);
    }

    spineEntries.push(`<itemref idref="${pageId}" />`);

    if (typeof onProgress === 'function') {
      onProgress(Math.round((pageIndex / pageCount) * 100));
    }
  }

  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  zip.file('META-INF/container.xml', buildContainerXml());
  zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="utf-8"?>
<package version="3.0" unique-identifier="bookid" xmlns="http://www.idpf.org/2007/opf" xml:lang="${escapeHtml(rawLanguage)}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">urn:uuid:${crypto.randomUUID()}</dc:identifier>
    <dc:title>${escapeHtml(bookTitle)}</dc:title>
    <dc:creator>${escapeHtml(bookAuthor)}</dc:creator>
    <dc:description>${escapeHtml(bookDescription)}</dc:description>
    <dc:language>${escapeHtml(rawLanguage)}</dc:language>
    <meta property="language">${escapeHtml(rawLanguage)}</meta>
    <meta property="generator">PDF XinoConvert</meta>
    ${rawCreationDate ? `<meta property="dcterms:created">${escapeHtml(rawCreationDate)}</meta>` : ''}
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav" />
    <item id="css" href="styles/style.css" media-type="text/css" />
    <item id="cover" href="text/cover.xhtml" media-type="application/xhtml+xml" />
    <item id="cover-image" href="images/cover.jpg" media-type="image/jpeg" properties="cover-image" />
    ${manifestEntries.join('\n    ')}
  </manifest>
  <spine>
    <itemref idref="cover" />
    ${spineEntries.join('\n    ')}
  </spine>
</package>`);
  zip.file('OEBPS/text/cover.xhtml', buildTitlePageXhtml({ title: bookTitle, coverImageHref: '../images/cover.jpg' }));
  zip.file('OEBPS/nav.xhtml', buildNavXhtml(bookTitle, pageCount));
  zip.file('OEBPS/styles/style.css', buildStyleSheet());

  chapters.forEach((chapter) => {
    zip.file(chapter.path, chapter.content);
  });

  imageEntries.forEach((image) => {
    zip.file(image.path, image.content);
  });

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}

export function parsePageSelection(selection, totalPages) {
  if (!selection || !selection.trim()) {
    return [...Array(totalPages).keys()];
  }

  const indexes = new Set();
  const chunks = selection.split(',').map((token) => token.trim()).filter(Boolean);

  for (const chunk of chunks) {
    if (chunk.includes('-')) {
      const [startRaw, endRaw] = chunk.split('-');
      const start = toInt(startRaw);
      const end = toInt(endRaw);

      if (start === null || end === null) {
        throw new Error(`Intervalo inválido: ${chunk}`);
      }

      const from = clamp(Math.min(start, end), 1, totalPages);
      const to = clamp(Math.max(start, end), 1, totalPages);

      for (let page = from; page <= to; page += 1) {
        indexes.add(page - 1);
      }
    } else {
      const page = toInt(chunk);
      if (page === null) {
        throw new Error(`Página inválida: ${chunk}`);
      }

      if (page < 1 || page > totalPages) {
        throw new Error(`Página fora do intervalo permitido: ${page}`);
      }

      indexes.add(page - 1);
    }
  }

  const sorted = [...indexes].sort((a, b) => a - b);
  if (!sorted.length) {
    throw new Error('Nenhuma página válida foi selecionada.');
  }

  return sorted;
}

function parseSplitGroups(selection, totalPages) {
  if (!selection || !selection.trim()) {
    return [...Array(totalPages).keys()].map((index) => [index]);
  }

  const groups = [];
  const chunks = selection.split(',').map((token) => token.trim()).filter(Boolean);

  for (const chunk of chunks) {
    if (chunk.includes('-')) {
      const [startRaw, endRaw] = chunk.split('-');
      const start = toInt(startRaw);
      const end = toInt(endRaw);

      if (start === null || end === null) {
        throw new Error(`Intervalo inválido: ${chunk}`);
      }

      const from = clamp(Math.min(start, end), 1, totalPages);
      const to = clamp(Math.max(start, end), 1, totalPages);
      groups.push([...Array(to - from + 1).keys()].map((offset) => from - 1 + offset));
    } else {
      const page = toInt(chunk);
      if (page === null || page < 1 || page > totalPages) {
        throw new Error(`Página inválida: ${chunk}`);
      }
      groups.push([page - 1]);
    }
  }

  if (!groups.length) {
    throw new Error('Nenhum grupo válido para divisão.');
  }

  return groups;
}

export async function mergePdfFiles(files, onProgress) {
  const output = await PDFDocument.create();

  for (let index = 0; index < files.length; index += 1) {
    const bytes = await files[index].arrayBuffer();
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await output.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => output.addPage(page));

    if (typeof onProgress === 'function') {
      onProgress(Math.round(((index + 1) / files.length) * 100));
    }
  }

  const mergedBytes = await output.save({ useObjectStreams: true });
  return new Blob([mergedBytes], { type: 'application/pdf' });
}

export async function splitPdf(file, selection, onProgress) {
  const bytes = await file.arrayBuffer();
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const groups = parseSplitGroups(selection, source.getPageCount());
  const outputs = [];

  for (let index = 0; index < groups.length; index += 1) {
    const doc = await PDFDocument.create();
    const copiedPages = await doc.copyPages(source, groups[index]);
    copiedPages.forEach((page) => doc.addPage(page));

    const chunkBytes = await doc.save({ useObjectStreams: true });
    outputs.push({
      name: `${file.name.replace(/\.[^/.]+$/, '')}-parte-${String(index + 1).padStart(2, '0')}.pdf`,
      blob: new Blob([chunkBytes], { type: 'application/pdf' }),
    });

    if (typeof onProgress === 'function') {
      onProgress(Math.round(((index + 1) / groups.length) * 100));
    }
  }

  return outputs;
}

export async function rotatePdf(file, angle, selection, onProgress) {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const indexes = parsePageSelection(selection, doc.getPageCount());
  const pageSet = new Set(indexes);

  doc.getPages().forEach((page, index) => {
    if (pageSet.has(index)) {
      page.setRotation(degrees(angle));
    }
  });

  if (typeof onProgress === 'function') {
    onProgress(100);
  }

  const outBytes = await doc.save({ useObjectStreams: true });
  return new Blob([outBytes], { type: 'application/pdf' });
}

export async function removePdfPages(file, selection, onProgress) {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const removeIndexes = parsePageSelection(selection, doc.getPageCount()).sort((a, b) => b - a);

  for (const index of removeIndexes) {
    doc.removePage(index);
  }

  if (doc.getPageCount() === 0) {
    throw new Error('Não é possível remover todas as páginas do PDF.');
  }

  if (typeof onProgress === 'function') {
    onProgress(100);
  }

  const outBytes = await doc.save({ useObjectStreams: true });
  return new Blob([outBytes], { type: 'application/pdf' });
}

export async function extractPdfPages(file, selection, onProgress) {
  const bytes = await file.arrayBuffer();
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const indexes = parsePageSelection(selection, source.getPageCount());

  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, indexes);
  pages.forEach((page) => output.addPage(page));

  if (typeof onProgress === 'function') {
    onProgress(100);
  }

  const outBytes = await output.save({ useObjectStreams: true });
  return new Blob([outBytes], { type: 'application/pdf' });
}

export async function cropPdfPages(file, cropConfig, onProgress) {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const totalPages = doc.getPageCount();

  const area = cropConfig?.area || { x: 0, y: 0, width: 1, height: 1 };
  const applyMode = cropConfig?.applyMode === 'current' ? 'current' : 'all';
  const currentPage = clamp(Number(cropConfig?.currentPage) || 1, 1, totalPages);

  const xRatio = clamp(Number(area.x) || 0, 0, 0.98);
  const yRatio = clamp(Number(area.y) || 0, 0, 0.98);
  const widthRatio = clamp(Number(area.width) || 1, 0.02, 1 - xRatio);
  const heightRatio = clamp(Number(area.height) || 1, 0.02, 1 - yRatio);

  doc.getPages().forEach((page, index) => {
    if (applyMode === 'current' && index !== currentPage - 1) return;

    const width = page.getWidth();
    const height = page.getHeight();

    const cropX = clamp(width * xRatio, 0, Math.max(0, width - 10));
    const cropWidth = clamp(width * widthRatio, 10, width - cropX);

    // UI uses top-left origin; PDF boxes use bottom-left.
    const cropHeight = clamp(height * heightRatio, 10, height);
    const topY = clamp(height * yRatio, 0, Math.max(0, height - 10));
    const cropY = clamp(height - topY - cropHeight, 0, Math.max(0, height - 10));

    page.setCropBox(cropX, cropY, cropWidth, cropHeight);
    page.setMediaBox(cropX, cropY, cropWidth, cropHeight);
  });

  if (typeof onProgress === 'function') {
    onProgress(100);
  }

  const outBytes = await doc.save({ useObjectStreams: true });
  return new Blob([outBytes], { type: 'application/pdf' });
}

export async function convertPdfToEpub(file, onProgress) {
  return createPdfEpubBlob(file, onProgress);
}

export async function zipDownloadItems(items, zipName = 'downloads.zip', onProgress) {
  const zip = new JSZip();

  items.forEach((item) => {
    zip.file(item.name, item.blob || item.file);
  });

  const zipBlob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (meta) => {
      if (typeof onProgress === 'function') {
        onProgress(Math.round(meta.percent));
      }
    },
  );

  return {
    zipBlob,
    zipName,
  };
}
