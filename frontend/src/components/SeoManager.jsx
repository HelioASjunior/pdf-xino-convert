import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_ORIGIN = 'https://pdfxino.com.br';

const DEFAULT_SEO = {
  title: 'PDFXino - Converter PDF Online Grátis | PDF para Word, JPG e Mais',
  description:
    'Converta PDF online grátis. PDF para Word, JPG, compressão, união e edição rápida com segurança no PDFXino.',
  keywords: 'pdf online, converter pdf, pdf para word, word para pdf, unir pdf, comprimir pdf',
};

const ROUTE_SEO = {
  '/': DEFAULT_SEO,
  '/pdf-tools': {
    title: 'Ferramentas de PDF Online Grátis | PDFXino',
    description: 'Use ferramentas de PDF online grátis para comprimir, organizar e preparar arquivos com rapidez no PDFXino.',
  },
  '/image-tools': {
    title: 'Ferramentas de Imagem Online Grátis | PDFXino',
    description: 'Converta e ajuste imagens online grátis com fluxo rápido e prático no PDFXino.',
  },
  '/document-tools': {
    title: 'Ferramentas de Documentos para PDF | PDFXino',
    description: 'Converta Word, planilhas e outros formatos para PDF com segurança no PDFXino.',
  },
  '/utilities': {
    title: 'Utilitários de Arquivos Online | PDFXino',
    description: 'Prepare arquivos, organize downloads e use utilitários online em uma central única no PDFXino.',
  },
  '/imagem-para-pdf': {
    title: 'Imagem para PDF Online Grátis | PDFXino',
    description: 'Transforme imagens em PDF online grátis, com ordenação e configuração rápida no PDFXino.',
  },
  '/pdf-para-imagens': {
    title: 'PDF para Imagens Online Grátis | PDFXino',
    description: 'Extraia páginas de PDF para JPG ou PNG online grátis no PDFXino.',
  },
  '/comprimir-pdf': {
    title: 'Comprimir PDF Online Grátis | PDFXino',
    description: 'Reduza o tamanho do PDF online grátis com qualidade e segurança no PDFXino.',
  },
  '/escanear-documento': {
    title: 'Escanear Documento e Gerar PDF | PDFXino',
    description: 'Organize digitalizações e finalize documentos em PDF com praticidade no PDFXino.',
  },
  '/pdf-para-word': {
    title: 'PDF para Word Online Grátis | PDFXino',
    description: 'Converta PDF para Word online grátis com qualidade e fluxo simples no PDFXino.',
  },
  '/word-para-pdf': {
    title: 'Word para PDF Online Grátis | PDFXino',
    description: 'Converta Word para PDF online grátis de forma rápida e segura no PDFXino.',
  },
  '/unir-pdf': {
    title: 'Unir PDF Online Grátis | PDFXino',
    description: 'Una arquivos PDF online grátis em poucos passos com o PDFXino.',
  },
  '/conversor-audio': {
    title: 'Conversor de Áudio Online Grátis | PDFXino',
    description: 'Converta MP3, WAV, OGG, FLAC, AAC e M4A online grátis no navegador com download imediato.',
  },
  '/tour-pelo-site': {
    title: 'Tour Pelo Site e Guia Rápido | PDFXino',
    description: 'Entenda como usar as principais ferramentas do PDFXino em poucos passos com um guia simples e direto.',
  },
  '/instalar-no-iphone': {
    title: 'Como Instalar no iPhone (Safari) | PDFXino',
    description: 'Veja o passo a passo para adicionar o PDFXino na tela inicial do iPhone usando o Safari.',
  },
};

function normalizePath(pathname) {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function upsertMetaByName(name, value) {
  if (!value) return;

  let tag = document.head.querySelector(`meta[name="${name}"]`);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', value);
}

function upsertMetaByProperty(property, value) {
  if (!value) return;

  let tag = document.head.querySelector(`meta[property="${property}"]`);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', value);
}

function upsertCanonical(url) {
  let link = document.head.querySelector('link[rel="canonical"]');

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }

  link.setAttribute('href', url);
}

function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalized = normalizePath(pathname);
    const routeSeo = ROUTE_SEO[normalized] || DEFAULT_SEO;
    const title = routeSeo.title || DEFAULT_SEO.title;
    const description = routeSeo.description || DEFAULT_SEO.description;
    const canonicalUrl = normalized === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${normalized}`;

    document.title = title;

    upsertMetaByName('description', description);
    upsertMetaByName('keywords', DEFAULT_SEO.keywords);
    upsertMetaByName('robots', 'index, follow');
    upsertMetaByProperty('og:title', title);
    upsertMetaByProperty('og:description', description);
    upsertMetaByProperty('og:url', canonicalUrl);
    upsertMetaByProperty('og:type', 'website');

    upsertCanonical(canonicalUrl);
  }, [pathname]);

  return null;
}

export default SeoManager;
