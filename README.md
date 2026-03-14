# PDF XinoConvert

Plataforma web para conversão, organização e preparação de arquivos com foco em produtividade.

O projeto é um monorepo com frontend em React + Vite e backend em Node.js + Express.

Versão curta em inglês: [README.en.md](README.en.md)

- Frontend (workspace): `frontend/`
- Backend (workspace): `backend/`
- Build estático para GitHub Pages: `docs/`

## Sumário

- [Visão geral](#visão-geral)
- [Recursos](#recursos)
- [Idiomas](#idiomas)
- [Arquitetura](#arquitetura)
- [Stack](#stack)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Como rodar localmente](#como-rodar-localmente)
- [Build e deploy](#build-e-deploy)
- [API backend](#api-backend)
- [Scanner (bridge local)](#scanner-bridge-local)
- [Limitações conhecidas](#limitações-conhecidas)
- [Scripts disponíveis](#scripts-disponíveis)
- [Roadmap](#roadmap)
- [Licença](#licença)

## Visão geral

O PDF XinoConvert reúne ferramentas de PDF, imagem, documentos e utilitários em uma interface única.

O frontend oferece fluxos que funcionam no navegador (incluindo deploy estático no GitHub Pages). Para operações que dependem de API, o backend pode ser executado separadamente e conectado via variável de ambiente.

## Recursos

### PDF

- Imagem para PDF (upload múltiplo, ordenação e saída em PDF)
- PDF para imagens (JPG/PNG com opção de ZIP)
- Comprimir PDF
- Juntar PDF
- Dividir PDF
- Rotacionar PDF
- Remover páginas
- Extrair páginas

### Imagem

- Conversão de formato (JPG, PNG, WEBP, BMP, GIF)
- Fluxo de múltiplos arquivos

### Documentos

- Conversão de documentos para PDF (ex.: TXT, MD, RTF, DOCX, CSV, XLS, XLSX)
- Fluxo de digitalização com preparação de páginas

### Utilitários

- Geração de ZIP para múltiplos downloads
- Detecção automática de formato com sugestão de ferramenta

### UX / UI

- Layout responsivo (desktop e mobile)
- Sidebar flutuante no desktop
- Tema claro/escuro
- Feedback visual de progresso e estado
- Navegação por categoria de ferramentas

## Idiomas

A interface possui internacionalização com alternância de idioma no menu.

Idiomas disponíveis:

- Português (pt-BR)
- English (en)
- Español (es)
- Français (fr)

Detalhes da implementação:

- i18n com `i18next` + `react-i18next`
- idioma persistido em `localStorage`
- seletor com bandeiras em SVG em `frontend/public/assets/flags/`

## Arquitetura

### Frontend-first para GitHub Pages

A aplicação pode ser publicada como site estático no GitHub Pages com conteúdo gerado em `docs/`.

- roteamento SPA com `HashRouter`
- assets estáticos otimizados pelo Vite
- sem necessidade de backend para partes totalmente client-side

### Backend opcional para rotas API

O backend permanece disponível para endpoints de upload/processamento e serve arquivos temporários gerados por certos fluxos.

## Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- i18next + react-i18next
- dnd-kit
- pdf-lib
- pdfjs-dist
- jsPDF
- JSZip
- Mammoth
- xlsx
- Lucide React

### Backend

- Node.js
- Express
- Multer
- pdf-lib
- pdfjs-dist
- @napi-rs/canvas
- Archiver
- Helmet
- CORS
- express-rate-limit
- sanitize-filename

## Estrutura do projeto

```text
.
├─ backend/
│  ├─ controllers/
│  ├─ routes/
│  ├─ services/
│  ├─ utils/
│  ├─ app.js
│  └─ server.js
├─ docs/
│  ├─ index.html
│  ├─ assets/
│  ├─ css/
│  └─ js/
├─ frontend/
│  ├─ public/
│  │  ├─ assets/
│  │  │  ├─ flags/
│  │  │  ├─ social/
│  │  │  └─ visuals/
│  │  └─ favicon_pdf.ico
│  ├─ src/
│  │  ├─ components/
│  │  ├─ hooks/
│  │  ├─ i18n/
│  │  ├─ pages/
│  │  ├─ scanner/
│  │  ├─ services/
│  │  └─ utils/
│  ├─ index.html
│  └─ vite.config.js
├─ .github/workflows/
│  ├─ deploy-pages.yml
│  └─ validate-pr.yml
├─ package.json
└─ README.md
```

## Pré-requisitos

- Node.js 20+
- npm 10+

## Instalação

Na raiz do projeto:

```bash
npm install
```

Esse comando instala dependências da raiz e dos workspaces `frontend` e `backend`.

## Variáveis de ambiente

### Backend

Arquivo de exemplo: `backend/.env.example`

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

### Frontend

Arquivo de exemplo: `frontend/.env.example`

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SCANNER_PROVIDER=bridge
VITE_SCANNER_BRIDGE_URL=http://127.0.0.1:24833
```

Notas:

- Sem `VITE_API_BASE_URL`, o frontend usa as configurações locais padrão de desenvolvimento.
- `VITE_SCANNER_PROVIDER=mock` permite testar a UI de scanner sem dispositivo real.

## Como rodar localmente

### Frontend + Backend

Na raiz:

```bash
npm run dev
```

Serviços padrão:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

### Somente backend

```bash
npm run start
```

### Somente frontend

```bash
npm run dev -w frontend
```

## Build e deploy

### Build local do frontend

```bash
npm run build
```

### Build para GitHub Pages

```bash
npm run build:pages
```

O artefato final é gerado em `docs/`.

### Preview do build

```bash
npm run preview:pages
```

### CI/CD (GitHub Actions)

Workflows incluídos:

- `.github/workflows/validate-pr.yml`
- `.github/workflows/deploy-pages.yml`

Fluxo esperado:

1. PR para branch principal: valida build
2. Push em branch principal: gera build e publica Pages

URL pública:

- https://helioasjunior.github.io/pdf-xino-convert/

## API backend

Base local padrão:

- `http://localhost:5000`

### Health check

- `GET /api/health`

Retorno exemplo:

```json
{ "status": "ok" }
```

### Imagens para PDF

- `POST /api/image-to-pdf`
- multipart field: `images` (até 25 arquivos)

Campos opcionais:

- `orientation`: `portrait` | `landscape`
- `pageSize`: `A4` | `Letter` | `Legal`
- `margin`
- `imageFit`: `contain` | `cover` | `stretch`
- `compressImages`: `true` | `false`

Resposta: download de arquivo PDF.

### PDF para imagens

- `POST /api/pdf-to-images`
- multipart field: `pdf`

Campos opcionais:

- `format`: `png` | `jpg`

Resposta: JSON com páginas renderizadas e ZIP.

### Compressão de PDF

- `POST /api/compress-pdf`
- multipart field: `pdf`

Campos opcionais:

- `level`: `low` | `medium` | `high`

Resposta: download do PDF compactado.

Headers úteis de resposta:

- `X-Original-Size`
- `X-Final-Size`
- `X-Reduction-Percent`
- `X-Download-Filename`

## Scanner (bridge local)

A camada de scanner é desacoplada por providers:

- `frontend/src/scanner/providers/ScannerProvider.js`
- `frontend/src/scanner/providers/LocalBridgeScannerProvider.js`
- `frontend/src/scanner/providers/MockScannerProvider.js`

Endpoints esperados no bridge local:

- `GET /status`
- `GET /devices`
- `POST /connect`
- `POST /scan`
- `POST /cancel`

Teste sem scanner físico:

1. Defina `VITE_SCANNER_PROVIDER=mock`
2. Rode `npm run dev`
3. Acesse a página de escaneamento

## Limitações conhecidas

- Alguns formatos de escritório (como DOC, ODT, PPT e PPTX) podem ter fidelidade parcial em conversão puramente client-side.
- Compressão de PDF baseada em recomposição de páginas pode gerar perda visual em níveis mais agressivos.
- GitHub Pages publica apenas frontend estático; para recursos dependentes de API, configure `VITE_API_BASE_URL` apontando para backend hospedado.

## Scripts disponíveis

### Raiz

- `npm run dev` (frontend + backend)
- `npm run build` (build frontend)
- `npm run build:pages` (build frontend para `docs/`)
- `npm run preview:pages` (preview do build)
- `npm run start` (backend em produção)

### Frontend

- `npm run dev -w frontend`
- `npm run build -w frontend`
- `npm run preview -w frontend`

### Backend

- `npm run dev -w backend`
- `npm run start -w backend`

## Roadmap

- Persistência de histórico por usuário
- Fila assíncrona para arquivos grandes
- Melhoria de fidelidade para formatos de escritório complexos
- Pipeline opcional de processamento remoto

## Licença

Este projeto está licenciado sob os termos do arquivo LICENSE.
