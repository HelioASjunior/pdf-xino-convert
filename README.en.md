# PDF XinoConvert

Web platform for file conversion, organization, and preparation focused on productivity.

This repository is a monorepo with a React + Vite frontend and a Node.js + Express backend.

Main Portuguese documentation: [README.md](README.md)

- Frontend workspace: frontend
- Backend workspace: backend
- Static GitHub Pages build output: docs

## Table of Contents

- [Language](#language)
- [Overview](#overview)
- [Features](#features)
- [Languages](#languages)
- [Architecture](#architecture)
- [Stack](#stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Run Locally](#run-locally)
- [Build and Deploy](#build-and-deploy)
- [Backend API](#backend-api)
- [Scanner (Local Bridge)](#scanner-local-bridge)
- [Known Limitations](#known-limitations)
- [Available Scripts](#available-scripts)
- [Roadmap](#roadmap)
- [License](#license)

## Language

- Main documentation (Portuguese): [README.md](README.md)
- English documentation: [README.en.md](README.en.md)

## Overview

PDF XinoConvert brings together PDF, image, document, and utility tools in a single interface.

The frontend includes browser-based flows and supports static deployment on GitHub Pages. For API-dependent operations, the backend can be run separately and connected through environment variables.

## Features

### PDF

- Image to PDF (multi-upload, ordering, and PDF output)
- PDF to Images (JPG/PNG with optional ZIP)
- Compress PDF
- Merge PDF
- Split PDF
- Rotate PDF
- Remove pages
- Extract pages

### Image

- Image format conversion (JPG, PNG, WEBP, BMP, GIF)
- Multi-file workflow

### Documents

- Convert documents to PDF (for example TXT, MD, RTF, DOCX, CSV, XLS, XLSX)
- Scan workflow with page preparation

### Utilities

- ZIP generation for multiple downloads
- Automatic format detection with tool suggestion
- Audio converter (MP3, WAV, OGG, FLAC, AAC, M4A, MP4, OPUS)
- Audio batch conversion (up to 10 files) with direct download for one file and ZIP for multiple files

### UX / UI

- Responsive layout (desktop and mobile)
- Floating desktop sidebar
- Light and dark theme
- Progress and status visual feedback
- Tool-category navigation

## Languages

The interface includes language switching in the menu.

Available languages:

- Portuguese (pt-BR)
- English (en)
- Spanish (es)
- French (fr)

Implementation details:

- i18n with i18next and react-i18next
- Language persisted in localStorage
- Flag icons in frontend/public/assets/flags

## Architecture

### Frontend-first for GitHub Pages

The app can be published as a static site on GitHub Pages with output generated in docs.

- SPA routing with HashRouter
- Static assets optimized by Vite
- No backend required for fully client-side flows

### Optional backend for API routes

The backend remains available for upload/processing endpoints and temporary generated files.

## Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- i18next and react-i18next
- dnd-kit
- pdf-lib
- pdfjs-dist
- jsPDF
- JSZip
- ffmpeg.wasm (core loaded at runtime in the browser)
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

## Project Structure

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

## Prerequisites

- Node.js 20+
- npm 10+

## Installation

From the project root:

```bash
npm install
```

This installs root and workspace dependencies for frontend and backend.

## Environment Variables

### Backend

Example file: backend/.env.example

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

### Frontend

Example file: frontend/.env.example

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SCANNER_PROVIDER=bridge
VITE_SCANNER_BRIDGE_URL=http://127.0.0.1:24833
```

Notes:

- Without VITE_API_BASE_URL, frontend uses local defaults.
- VITE_SCANNER_PROVIDER=mock allows scanner UI testing without physical hardware.

## Run Locally

### Frontend + Backend

From root:

```bash
npm run dev
```

Default services:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Backend only

```bash
npm run start
```

### Frontend only

```bash
npm run dev -w frontend
```

## Build and Deploy

### Local frontend build

```bash
npm run build
```

### Build for GitHub Pages

```bash
npm run build:pages
```

Final artifacts are generated in docs.

### Build preview

```bash
npm run preview:pages
```

### CI/CD (GitHub Actions)

Included workflows:

- .github/workflows/validate-pr.yml
- .github/workflows/deploy-pages.yml

Expected flow:

1. Pull request to main branch validates build.
2. Push to main branch builds and publishes GitHub Pages.

Public URL:

- https://helioasjunior.github.io/pdf-xino-convert/

## Backend API

Default local base URL:

- http://localhost:5000

### Health check

- GET /api/health

Example response:

```json
{ "status": "ok" }
```

### Images to PDF

- POST /api/image-to-pdf
- multipart field: images (up to 25 files)

Optional fields:

- orientation: portrait or landscape
- pageSize: A4, Letter, Legal
- margin
- imageFit: contain, cover, stretch
- compressImages: true or false

Response: PDF file download.

### PDF to images

- POST /api/pdf-to-images
- multipart field: pdf

Optional fields:

- format: png or jpg

Response: JSON with rendered pages and ZIP metadata.

### PDF compression

- POST /api/compress-pdf
- multipart field: pdf

Optional fields:

- level: low, medium, high

Response: compressed PDF download.

Useful response headers:

- X-Original-Size
- X-Final-Size
- X-Reduction-Percent
- X-Download-Filename

## Scanner (Local Bridge)

Scanner layer providers:

- frontend/src/scanner/providers/ScannerProvider.js
- frontend/src/scanner/providers/LocalBridgeScannerProvider.js
- frontend/src/scanner/providers/MockScannerProvider.js

Expected local bridge endpoints:

- GET /status
- GET /devices
- POST /connect
- POST /scan
- POST /cancel

Scanner-free test flow:

1. Set VITE_SCANNER_PROVIDER=mock.
2. Run npm run dev.
3. Open the scan page.

## Known Limitations

- Some office formats (for example DOC, ODT, PPT, PPTX) may have partial fidelity in fully client-side conversion.
- PDF recomposition-based compression can introduce visual loss at aggressive levels.
- Audio conversion depends on runtime FFmpeg loading from CDN; restricted networks or proxy blocks may prevent initialization.
- First audio conversion load may be slower due to FFmpeg asset download.
- GitHub Pages publishes static frontend only; for API-dependent features, set VITE_API_BASE_URL to a hosted backend.

## Available Scripts

### Root

- npm run dev (frontend + backend)
- npm run build (frontend build)
- npm run build:pages (frontend build to docs)
- npm run preview:pages (build preview)
- npm run start (backend production)

### Frontend

- npm run dev -w frontend
- npm run build -w frontend
- npm run preview -w frontend

### Backend

- npm run dev -w backend
- npm run start -w backend

## Roadmap

- Per-user history persistence
- Async queue for large files
- Better fidelity for complex office formats
- Optional remote processing pipeline

## License

This project is licensed under the terms of the LICENSE file.
