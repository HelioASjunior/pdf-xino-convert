import { useEffect, useRef, useState } from 'react';
import { Download, FileText, AlertTriangle } from 'lucide-react';
import UploadArea from '../components/UploadArea';
import FilePreview from '../components/FilePreview';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
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

function DocumentToolsPage() {
  const { showToast } = useToast();
  const { addEntry } = useSessionHistory();

  const [fileItem, setFileItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

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
      kind: 'pdf',
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
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-400">Ferramentas de Documentos</p>
          <h1 className="section-title">Converta documentos para PDF com um fluxo simples, claro e orientado.</h1>
          <p className="section-copy">Transforme textos, planilhas e apresentações em PDFs prontos para compartilhar com mais agilidade.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
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
  );
}

export default DocumentToolsPage;
