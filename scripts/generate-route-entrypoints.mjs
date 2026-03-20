import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const docsDir = path.join(repoRoot, 'docs');
const indexPath = path.join(docsDir, 'index.html');

const ROUTES = [
  '/pdf-tools',
  '/image-tools',
  '/document-tools',
  '/utilities',
  '/imagem-para-pdf',
  '/pdf-para-imagens',
  '/comprimir-pdf',
  '/escanear-documento',
  '/pdf-para-word',
  '/word-para-pdf',
  '/unir-pdf',
  '/conversor-audio',
  '/tour-pelo-site',
];

function ensureNoTrailingSlash(route) {
  return route === '/' ? '/' : route.replace(/\/+$/, '');
}

function toCanonical(route) {
  return route === '/' ? 'https://pdfxino.com.br/' : `https://pdfxino.com.br${route}`;
}

function updateCanonical(html, route) {
  const canonical = toCanonical(route);
  const withCanonical = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?\s*>/i,
    `<link rel="canonical" href="${canonical}" />`
  );

  return withCanonical.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?\s*>/i,
    `<meta property="og:url" content="${canonical}" />`
  );
}

async function main() {
  const indexHtml = await readFile(indexPath, 'utf8');

  await Promise.all(
    ROUTES.map(async (rawRoute) => {
      const route = ensureNoTrailingSlash(rawRoute);
      const relative = route.replace(/^\//, '');
      const routeDir = path.join(docsDir, relative);
      const routeIndexPath = path.join(routeDir, 'index.html');
      const routeHtml = updateCanonical(indexHtml, route);

      await mkdir(routeDir, { recursive: true });
      await writeFile(routeIndexPath, routeHtml, 'utf8');
    })
  );

  console.log(`Generated ${ROUTES.length} static route entrypoints in docs/.`);
}

main().catch((error) => {
  console.error('Failed to generate route entrypoints:', error);
  process.exitCode = 1;
});
