import { useEffect, useRef, useState } from 'react';
import { Download, FileText, AlertTriangle, FileSpreadsheet, Files, ShieldCheck } from 'lucide-react';
import UploadArea from '../components/UploadArea';
import FilePreview from '../components/FilePreview';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import HubFeatureGrid from '../components/HubFeatureGrid';
import TrustSection from '../components/TrustSection';
import FaqSection from '../components/FaqSection';
import { useToast } from '../hooks/useToast.jsx';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { convertDocumentFileToPdf } from '../services/documentToolsService';
import { downloadBlob } from '../utils/formatters';

const formatIcon = (name) => `${import.meta.env.BASE_URL}assets/formats/${name}`;

const formatCards = [
  {
    title: 'Word para PDF',
    description: 'Converte DOCX para PDF com extração de texto e preservação básica.',
    formats: [{ label: 'DOCX', icon: formatIcon('docx.svg') }],
    tone: 'from-blue-50 to-blue-100/70 dark:from-blue-900/20 dark:to-blue-800/10',
  },
  {
    title: 'Excel para PDF',
    description: 'Converte XLS, XLSX e CSV para PDF em modo tabular simplificado.',
    formats: [
      { label: 'XLSX', icon: formatIcon('xlsx.svg') },
      { label: 'XLS', icon: formatIcon('xls.svg') },
      { label: 'CSV', icon: formatIcon('csv.svg') },
    ],
    tone: 'from-emerald-50 to-emerald-100/70 dark:from-emerald-900/20 dark:to-emerald-800/10',
  },
  {
    title: 'Texto para PDF',
    description: 'Converte TXT, MD e RTF com quebra automática de páginas.',
    formats: [
      { label: 'TXT', icon: formatIcon('txt.svg') },
      { label: 'MD', icon: formatIcon('md.svg') },
      { label: 'RTF', icon: formatIcon('rtf.svg') },
    ],
    tone: 'from-amber-50 to-amber-100/70 dark:from-amber-900/20 dark:to-amber-800/10',
  },
  {
    title: 'PowerPoint e formatos legados',
    description: 'PPT, PPTX, DOC e ODT contam com fluxo assistido e orientação para continuidade do trabalho.',
    formats: [
      { label: 'PPTX', icon: formatIcon('pptx.svg') },
      { label: 'PPT', icon: formatIcon('ppt.svg') },
      { label: 'DOC', icon: formatIcon('doc.svg') },
      { label: 'ODT', icon: formatIcon('odt.svg') },
    ],
    tone: 'from-slate-100 to-slate-200/70 dark:from-slate-800/40 dark:to-slate-700/20',
  },
];

const documentHubItems = [
  {
    title: 'Textos e contratos',
    description: 'Converta documentos de texto e materiais de apoio em PDF pronto para circulação.',
    icon: Files,
    badge: 'DOCX, TXT, MD',
    actionLabel: 'Enviar documento',
    accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
    onClick: () => {},
    className: 'hover:-translate-y-0',
  },
  {
    title: 'Planilhas e dados',
    description: 'Leve tabelas e planilhas para PDF com uma estrutura simples de leitura.',
    icon: FileSpreadsheet,
    badge: 'XLS, XLSX, CSV',
    actionLabel: 'Preparar planilha',
    accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
    onClick: () => {},
    className: 'hover:-translate-y-0',
  },
];

const documentTrustItems = [
  {
    title: 'Entrada guiada',
    description: 'A área reúne formatos comuns de escritório em um único ponto de conversão.',
    icon: Files,
    accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
  },
  {
    title: 'Cobertura ampla',
    description: 'Word, planilhas, apresentações e textos simples já entram no mesmo fluxo operacional.',
    icon: FileSpreadsheet,
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
  },
  {
    title: 'Orientação assistida',
    description: 'Quando o tipo de arquivo pede cuidado extra, o sistema mostra um encaminhamento mais seguro.',
    icon: ShieldCheck,
    accent: 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
  },
];

const documentFaqItems = [
  {
    question: 'Quais formatos posso enviar nesta área?',
    answer: 'Você pode enviar DOC, DOCX, ODT, XLS, XLSX, CSV, PPT, PPTX, TXT, RTF e MD.',
  },
  {
    question: 'Todos os formatos têm o mesmo tratamento?',
    answer: 'Não. Alguns tipos contam com conversão direta e outros usam um fluxo assistido para preservar melhor a leitura final.',
  },
  {
    question: 'Posso converter mais de um documento por vez?',
    answer: 'Nesta área, o processo foi desenhado para um documento por vez, com foco em controle e revisão do resultado.',
  },
];

function DocumentToolsPage() {
  const { showToast } = useToast();
  const { addEntry } = useSessionHistory();

  const [fileItem, setFileItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);
  const uploadRef = useRef(null);
  const documentActions = documentHubItems.map((item) => ({
    ...item,
    onClick: () => uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
  }));

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => () => {
    if (resultRef.current?.url) {
      URL.revokeObjectURL(resultRef.current.url);
    }
  }, []);

  const onFilesSelected = (files) => {
    const file = files[0];
    setError('');

    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }
    setResult(null);

    setFileItem({
      id: crypto.randomUUID(),
      file,
      preview: null,
      kind: 'document',
    });
  };

  const runConversion = async () => {
    if (!fileItem) {
      setError('Envie um documento para converter.');
      return;
    }

    setIsLoading(true);
    setProgress(15);

    try {
      const conversion = await convertDocumentFileToPdf(fileItem.file);
      setProgress(90);

      if (!conversion.supported) {
        setResult({ unsupported: true, reason: conversion.reason, suggestions: conversion.suggestions });
        showToast({ type: 'info', title: 'Conversão assistida', message: 'Este arquivo exige um fluxo complementar para manter melhor a qualidade.' });
        return;
      }

      const url = downloadBlob(conversion.blob, conversion.fileName);
      setResult({
        unsupported: false,
        url,
        fileName: conversion.fileName,
        warning: conversion.warning,
      });

      addEntry({ tool: 'Ferramentas de Documentos', summary: `${fileItem.file.name} convertido para PDF` });
      showToast({ type: 'success', title: 'Conversão concluída', message: 'Download do PDF iniciado.' });
      setProgress(100);
    } catch (processingError) {
      const message = processingError.message || 'Não foi possível converter o documento.';
      setError(message);
      showToast({ type: 'error', title: 'Erro ao processar arquivo', message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <HubFeatureGrid
        title="Entradas principais da categoria"
        description="Os blocos abaixo ajudam a localizar rapidamente o tipo de documento mais próximo do seu fluxo."
        items={documentActions}
      />

      <section className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {formatCards.map((card) => (
            <article key={card.title} className={`rounded-3xl border border-slate-200 bg-gradient-to-br ${card.tone} p-5 shadow-soft dark:border-slate-700`}>
              <div className="mb-4 flex flex-wrap gap-3">
                {card.formats.map((format) => (
                  <div key={`${card.title}-${format.label}`} className="flex items-center gap-2 rounded-xl bg-white/90 px-2.5 py-2 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800/80 dark:ring-slate-600">
                    <img src={format.icon} alt={format.label} className="h-7 w-7" loading="lazy" />
                    <span className="text-xs font-extrabold tracking-wide text-slate-700 dark:text-slate-200">{format.label}</span>
                  </div>
                ))}
              </div>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <div ref={uploadRef} className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6">
          <UploadArea
            title="Enviar documento"
            description="Formatos aceitos: DOC, DOCX, ODT, XLS, XLSX, CSV, PPT, PPTX, TXT, RTF, MD."
            accept=".doc,.docx,.odt,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.rtf,.md"
            onFilesSelected={onFilesSelected}
            error={error}
            mode="pdf"
          />

          {fileItem ? <FilePreview item={fileItem} onRemove={() => setFileItem(null)} /> : null}
        </section>

        <aside className="space-y-6">
          <div className="glass-panel space-y-5 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-900 p-3 text-white">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Conversor de Documento para PDF</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Selecione o arquivo e gere o PDF com praticidade.</p>
              </div>
            </div>

            {isLoading ? <LoadingSpinner label="Convertendo documento..." /> : null}
            {(isLoading || progress > 0) ? <ProgressBar value={progress} label="Processando" /> : null}

            <Button className="w-full gap-2" onClick={runConversion} disabled={isLoading || !fileItem}>
              <Download className="h-4 w-4" />
              Converter para PDF
            </Button>
          </div>

          {result?.unsupported ? (
            <ResultCard title="Conversão assistida" description="Este arquivo exige um tratamento específico para preservar melhor a estrutura do conteúdo." tone="info">
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {result.suggestions?.map((item) => (
                  <p key={item}>- {item}</p>
                ))}
              </div>
            </ResultCard>
          ) : null}

          {result && !result.unsupported ? (
            <ResultCard title="PDF pronto" description="Arquivo convertido com sucesso." tone="success">
              {result.warning ? (
                <p className="mb-3 flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4" />
                  {result.warning}
                </p>
              ) : null}
              <a href={result.url} download={result.fileName}>
                <Button>Baixar PDF</Button>
              </a>
            </ResultCard>
          ) : null}
        </aside>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="space-y-5">
          <div className="section-intro">
            <p className="section-kicker">Ferramentas de Documentos</p>
            <h1 className="section-title">Converta documentos de trabalho em PDF com uma entrada mais organizada por tipo de conteúdo.</h1>
            <p className="section-copy">Use esta área para transformar textos, planilhas e materiais de apresentação em arquivos PDF prontos para compartilhar com mais agilidade.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Formatos cobertos</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">11 tipos</p>
            </div>
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Envio orientado</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">1 documento</p>
            </div>
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Entrega</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">PDF final</p>
            </div>
          </div>
        </div>

        <ResultCard
          title="Antes de converter"
          description="Esta área foi desenhada para arquivos individuais, com foco em clareza do resultado e orientação quando um formato pede tratamento complementar."
          tone="info"
        />
      </section>

      <TrustSection
        title="Por que usar esta central de documentos"
        description="A página foi expandida para orientar o envio e reduzir a incerteza entre formatos diferentes de escritório."
        items={documentTrustItems}
      />

      <FaqSection
        description="Informações úteis antes de iniciar a conversão do seu documento."
        items={documentFaqItems}
      />
    </div>
  );
}

export default DocumentToolsPage;
