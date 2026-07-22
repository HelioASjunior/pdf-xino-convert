# PDF XinoConvert

[![Build](https://img.shields.io/github/actions/workflow/status/helioasjunior/pdf-xino-convert/validate-pr.yml?branch=main&label=build)](https://github.com/helioasjunior/pdf-xino-convert/actions/workflows/validate-pr.yml)
[![License](https://img.shields.io/github/license/helioasjunior/pdf-xino-convert)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Plataforma web para conversão, organização e preparação de arquivos com foco em produtividade.

O projeto é frontend-only, com interface em React + Vite e processamento local no navegador.

Versão em inglês: [README.en.md](README.en.md)

- Workspace frontend: `frontend/`
- Build estático para GitHub Pages: `docs/`

## Sumário

- [Idioma](#idioma)
- [Visão geral](#visão-geral)
- [Principais recursos](#principais-recursos)
- [Idiomas da interface](#idiomas-da-interface)
- [Arquitetura](#arquitetura)
- [Arquitetura em camadas](#arquitetura-em-camadas)
- [Stack tecnológica](#stack-tecnológica)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Pre-requisitos](#pre-requisitos)
- [Instalação](#instalação)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Execução local](#execução-local)
- [Build, preview e deploy](#build-preview-e-deploy)
- [Scanner (bridge local)](#scanner-bridge-local)
- [Segurança e privacidade](#segurança-e-privacidade)
- [Limitações conhecidas](#limitações-conhecidas)
- [Troubleshooting](#troubleshooting)
- [Scripts disponíveis](#scripts-disponíveis)
- [Contribuição](#contribuição)
- [Roadmap](#roadmap)
- [Licença](#licença)

## Idioma

- Documentação principal (PT-BR): [README.md](README.md)
- English version: [README.en.md](README.en.md)

## Visão geral

O PDF XinoConvert consolida ferramentas de PDF, imagem, documentos, scanner e utilitários em uma única experiência.

Objetivos principais:

- reduzir fricção em tarefas recorrentes de manipulação de arquivos
- manter operações sensíveis no navegador (client-side)
- permitir publicação simples em ambiente estático (GitHub Pages)

## Principais recursos

### PDF

- Imagem para PDF com upload múltiplo, organização de ordem e exportação única ou separada
- PDF para imagens (JPG/PNG) com pacote ZIP
- PDF para EPUB, formato comum em leitores Kindle
- Compressão de PDF no navegador
- Juntar PDF
- Dividir PDF
- Rotacionar PDF por páginas
- Remover páginas
- Extrair páginas

### Imagem

- Conversão entre JPG, PNG, WEBP, BMP e GIF
- Suporte de entrada para HEIC/HEIF
- Processamento em lote com download final em ZIP

### Documentos

- Conversão para PDF de TXT, MD, RTF, DOCX, CSV, XLS e XLSX
- Fluxo de digitalização com preparação de páginas

### Scanner

- Integração com bridge local opcional
- Fluxo alternativo com provider mock para desenvolvimento
- Etapas de importação, preparação e saída em PDF

### Áudio

- Conversão entre MP3, WAV, OGG, FLAC, AAC, M4A, MP4 e OPUS
- Conversão em lote (limite atual de 10 arquivos)

### Utilitários

- Geração de ZIP para múltiplos arquivos
- Detecção automática de tipo de arquivo com sugestão de ferramenta

### UX / UI

- Interface responsiva (desktop e mobile)
- Sidebar flutuante no desktop
- Tema claro/escuro
- Feedback de progresso e estado
- Navegação por categorias de ferramenta

## Idiomas da interface

Idiomas disponíveis:

- Português (pt-BR)
- English (en)
- Español (es)
- Français (fr)

Implementação:

- `i18next` + `react-i18next`
- idioma persistido em `localStorage`
- bandeiras SVG em `frontend/public/assets/flags/`

## Arquitetura

### Frontend-first para GitHub Pages

A aplicação é preparada para deploy estático em `docs/`.

- roteamento SPA com `HashRouter`
- assets versionados e otimizados pelo Vite
- processamento local no navegador para fluxos principais

### Monorepo simples com workspaces

- raiz controla scripts de build/preview/deploy
- `frontend` concentra o app React
- `docs` concentra artefatos para publicação

## Arquitetura em camadas

```mermaid
flowchart TB
	subgraph L1[Camada 1 - Apresentação]
		P1[Pages]
		P2[Components]
		P3[i18n]
		P4[Hooks de UI]
	end

	subgraph L2[Camada 2 - Aplicação]
		A1[Services]
		A2[Utils]
		A3[Validação de arquivos]
		A4[Orquestração de fluxos]
	end

	subgraph L3[Camada 3 - Domínio de Conversão]
		D1[PDF pipeline]
		D2[Image pipeline]
		D3[Document pipeline]
		D4[Audio pipeline]
	end

	subgraph L4[Camada 4 - Infraestrutura]
		I1[Browser APIs]
		I2[Workers]
		I3[Libraries externas]
		I4[Static assets]
	end

	L1 --> L2
	L2 --> L3
	L3 --> L4
```

## Stack tecnológica

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
- heic2any
- browser-image-compression
- ffmpeg.wasm (carregado em runtime)
- Mammoth
- xlsx
- Lucide React

## Estrutura do repositório

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
├─ scripts/
├─ package.json
├─ README.md
└─ README.en.md
```

## Pre-requisitos

- Node.js 20+
- npm 10+

## Instalação

Na raiz do projeto:

```bash
npm install
```

Esse comando instala dependências da raiz e do workspace `frontend`.

## Variáveis de ambiente

### Frontend

Arquivo de exemplo: `frontend/.env.example`

```env
VITE_SCANNER_PROVIDER=bridge
VITE_SCANNER_BRIDGE_URL=http://127.0.0.1:24833
```

Notas:

- `VITE_SCANNER_PROVIDER=mock` permite testar fluxo de scanner sem hardware

## Execução local

Na raiz:

```bash
npm run dev
```

URL padrão: `http://localhost:5173`

Comando equivalente no workspace:

```bash
npm run dev -w frontend
```

## Build, preview e deploy

### Build local

```bash
npm run build
```

### Build para páginas estáticas

```bash
npm run build:pages
```

O artefato final é gerado em `docs/`.

Durante o build, o script `scripts/generate-route-entrypoints.mjs` cria `index.html`
em rotas públicas (exemplo: `docs/pdf-tools/index.html`) para evitar 404 em acesso direto.

### Preview local do build

```bash
npm run preview:pages
```

### CI/CD com GitHub Actions

Workflows principais:

- `.github/workflows/validate-pr.yml`
- `.github/workflows/deploy-pages.yml`

Fluxo esperado:

1. Pull request para branch principal valida build
2. Push na branch principal gera build e publica no GitHub Pages

URL publica:

- https://helioasjunior.github.io/pdf-xino-convert/

## Scanner (bridge local)

Providers da camada de scanner:

- `frontend/src/scanner/providers/ScannerProvider.js`
- `frontend/src/scanner/providers/LocalBridgeScannerProvider.js`
- `frontend/src/scanner/providers/MockScannerProvider.js`

Endpoints esperados da bridge local:

- `GET /status`
- `GET /devices`
- `POST /connect`
- `POST /scan`
- `POST /cancel`

Teste sem scanner físico:

1. Defina `VITE_SCANNER_PROVIDER=mock`
2. Rode `npm run dev`
3. Acesse a página de escaneamento

## Segurança e privacidade

- Os fluxos principais rodam client-side
- Arquivos não são enviados para backend do projeto
- Dependências de runtime (como FFmpeg via CDN) podem existir em algumas funcionalidades

Recomendação:

- Para ambientes corporativos restritivos, valide políticas de rede/CDN antes da adoção

## Limitações conhecidas

- Alguns formatos de escritório (DOC, ODT, PPT, PPTX) podem ter fidelidade parcial em conversão puramente client-side
- Compressão de PDF por recomposição de páginas pode gerar perda visual em níveis agressivos
- Conversor de áudio depende de carregamento de FFmpeg em runtime
- Primeira carga de algumas ferramentas pode ser mais lenta por download inicial de assets

## Troubleshooting

### Erro de formato aceito para HEIC/HEIF

- Verifique se o arquivo termina com `.heic` ou `.heif`
- Atualize para a versão mais recente do projeto (suporte por extensão e fallback de preview)

### Preview de imagem não aparece

- Alguns navegadores não renderizam HEIC diretamente
- O projeto aplica fallback de decodificação para preview; se falhar, teste outro navegador Chromium atualizado

### Porta em uso no preview

Use scripts auxiliares na raiz:

```bash
npm run kill:4173
npm run preview:pages
```

## Scripts disponíveis

### Raiz

- `npm run dev` inicia frontend
- `npm run build` build de produção do frontend e geração de entrypoints estáticos
- `npm run build:pages` alias para build de páginas
- `npm run preview:pages` preview do build
- `npm run preview:pages:auto` preview sem strictPort
- `npm run kill:port` encerra processo por porta
- `npm run kill:4173` encerra porta 4173
- `npm run qa:assets` gera assets de QA
- `npm run test:xlsx-pdf` executa rotina de teste para fluxo de planilha->PDF

### Frontend workspace

- `npm run dev -w frontend`
- `npm run build -w frontend`
- `npm run preview -w frontend`

## Contribuição

Sugestão de fluxo:

1. Crie branch de feature
2. Rode `npm install`
3. Desenvolva e valide com `npm run dev`
4. Gere build com `npm run build`
5. Abra PR com descrição clara de impacto funcional

Boas práticas:

- manter mudancas focadas por PR
- evitar alterar artefatos `docs/` quando o objetivo for apenas desenvolvimento local
- incluir contexto funcional e teste manual no PR

## Roadmap

- Persistência de histórico por usuário
- Fila assíncrona para arquivos grandes
- Melhor fidelidade para formatos de escritório complexos
- Pipeline opcional de processamento remoto

## Licença

Este projeto está licenciado sob os termos do arquivo [LICENSE](LICENSE).

