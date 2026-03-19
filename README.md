# PDF XinoConvert

Plataforma web para conversão, organização e preparação de arquivos com foco em produtividade.

O projeto é frontend-only, com interface em React + Vite e processamento executado no navegador.

Versão em inglês: [README.en.md](README.en.md)

- Frontend: `frontend/`
- Build estático para GitHub Pages: `docs/`

## Sumário

- [Language](#language)
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
- [Scanner (bridge local)](#scanner-bridge-local)
- [Limitações conhecidas](#limitações-conhecidas)
- [Scripts disponíveis](#scripts-disponíveis)
- [Roadmap](#roadmap)
- [Licença](#licença)

## Language

- Documentação principal (Português): [README.md](README.md)
- English version: [README.en.md](README.en.md)

## Visão geral

O PDF XinoConvert reúne ferramentas de PDF, imagem, documentos e utilitários em uma interface única.

Os fluxos principais rodam diretamente no navegador e podem ser publicados como site estático.

## Recursos

### PDF

- Imagem para PDF com múltiplos arquivos e ordenação
- PDF para imagens em JPG ou PNG com exportação ZIP
- Compressão de PDF no navegador
- Juntar PDF
- Dividir PDF
- Rotacionar PDF
- Remover páginas
- Extrair páginas

### Imagem

- Conversão de formato entre JPG, PNG, WEBP, BMP e GIF
- Fluxo de múltiplos arquivos

### Documentos

- Conversão de documentos para PDF, incluindo TXT, MD, RTF, DOCX, CSV, XLS e XLSX
- Fluxo de digitalização com preparação de páginas

### Utilitários

- Geração de ZIP para múltiplos downloads
- Detecção automática de formato com sugestão de ferramenta
- Conversor de áudio com suporte a MP3, WAV, OGG, FLAC, AAC, M4A, MP4 e OPUS
- Conversão em lote de até 10 arquivos

### UX / UI

- Layout responsivo para desktop e mobile
- Sidebar flutuante no desktop
- Tema claro/escuro
- Feedback visual de progresso e estado
- Navegação por categoria de ferramentas

## Idiomas

A interface possui alternância de idioma no menu.

- Português (pt-BR)
- English (en)
- Español (es)
- Français (fr)

Detalhes da implementação:

- i18n com `i18next` e `react-i18next`
- idioma persistido em `localStorage`
- seletor com bandeiras SVG em `frontend/public/assets/flags/`

## Arquitetura

### Frontend-first para GitHub Pages

A aplicação pode ser publicada como site estático no GitHub Pages com saída em `docs/`.

- roteamento SPA com `HashRouter`
- assets estáticos otimizados pelo Vite
- processamento local no navegador para os fluxos principais

## Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- React Router
- i18next + react-i18next
- dnd-kit
- pdf-lib
- pdfjs-dist
- jsPDF
- JSZip
- ffmpeg.wasm carregado em runtime no navegador
- Mammoth
- xlsx
- Lucide React

## Estrutura do projeto

```text
.
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

Esse comando instala as dependências da raiz e do workspace `frontend`.

## Variáveis de ambiente

### Frontend

Arquivo de exemplo: `frontend/.env.example`

```env
VITE_SCANNER_PROVIDER=bridge
VITE_SCANNER_BRIDGE_URL=http://127.0.0.1:24833
```

Notas:

- `VITE_SCANNER_PROVIDER=mock` permite testar a UI de scanner sem dispositivo real.

## Como rodar localmente

Na raiz:

```bash
npm run dev
```

URL padrão: `http://localhost:5173`

Comando equivalente do workspace:

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

Durante o build, o script `scripts/generate-route-entrypoints.mjs` cria arquivos `index.html`
em cada rota publica (por exemplo `docs/pdf-tools/index.html`). Isso evita resposta 404
em acesso direto por URL e melhora a cobertura de indexacao no Search Console.

### Preview do build

```bash
npm run preview:pages
```

### CI/CD (GitHub Actions)

Workflows incluídos:

- `.github/workflows/validate-pr.yml`
- `.github/workflows/deploy-pages.yml`

Fluxo esperado:

1. PR para a branch principal valida o build.
2. Push na branch principal gera o build e publica no GitHub Pages.

URL pública:

- https://helioasjunior.github.io/pdf-xino-convert/

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

1. Defina `VITE_SCANNER_PROVIDER=mock`.
2. Rode `npm run dev`.
3. Acesse a página de escaneamento.

## Limitações conhecidas

- Alguns formatos de escritório, como DOC, ODT, PPT e PPTX, podem ter fidelidade parcial em conversão puramente client-side.
- Compressão de PDF baseada em recomposição de páginas pode gerar perda visual em níveis mais agressivos.
- O conversor de áudio depende do carregamento do FFmpeg via CDN no navegador; redes com bloqueio de CDN ou proxy podem impedir a conversão.
- A primeira carga do conversor de áudio pode ser mais lenta devido ao download inicial dos arquivos do FFmpeg.

## Scripts disponíveis

### Raiz

- `npm run dev` para o frontend
- `npm run build` para o build do frontend
- `npm run build:pages` para gerar `docs/`
- `npm run preview:pages` para visualizar o build

### Frontend

- `npm run dev -w frontend`
- `npm run build -w frontend`
- `npm run preview -w frontend`

## Roadmap

- Persistência de histórico por usuário
- Fila assíncrona para arquivos grandes
- Melhoria de fidelidade para formatos de escritório complexos
- Pipeline opcional de processamento remoto

## Licença

Este projeto está licenciado sob os termos do arquivo LICENSE.

![alt text](<Captura de tela 2026-03-14 130525.png>)
![alt text](<Captura de tela 2026-03-14 130450.png>)