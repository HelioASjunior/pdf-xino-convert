# PDF XinoConvert (Short English Version)

PDF XinoConvert is a web platform to convert, organize, and prepare files quickly.

This repository is a monorepo:

- Frontend: React + Vite (`frontend/`)
- Backend: Node.js + Express (`backend/`)
- Static Pages build output: `docs/`

## Main Features

- Image to PDF (multi-upload + ordering)
- PDF to Images (JPG/PNG + ZIP)
- PDF Compression
- PDF Toolkit: merge, split, rotate, remove, extract pages
- Document and image utility workflows
- Scanner flow with local bridge provider + mock provider
- Light/Dark theme
- i18n language switcher (pt-BR, en, es, fr)

## Quick Start

Requirements:

- Node.js 20+
- npm 10+

Install:

```bash
npm install
```

Run frontend + backend:

```bash
npm run dev
```

Default local URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Environment Variables

Backend (`backend/.env`):

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

Frontend (`frontend/.env`):

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SCANNER_PROVIDER=bridge
VITE_SCANNER_BRIDGE_URL=http://127.0.0.1:24833
```

Use `VITE_SCANNER_PROVIDER=mock` to test scanner UI without a real scanner.

## Build and Deploy

Build frontend:

```bash
npm run build
```

Build for GitHub Pages:

```bash
npm run build:pages
```

Output is generated in `docs/`.

Project URL:

- https://helioasjunior.github.io/pdf-xino-convert/

## Backend API (Core Endpoints)

- `GET /api/health`
- `POST /api/image-to-pdf`
- `POST /api/pdf-to-images`
- `POST /api/compress-pdf`

## Notes

- Portuguese README is the main documentation: see `README.md`.
- Some office file formats may have partial fidelity in fully client-side conversion flows.
