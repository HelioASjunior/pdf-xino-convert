import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText, AlertTriangle, FileSpreadsheet, Files, ShieldCheck } from 'lucide-react';
import UploadArea from '../components/UploadArea';
import FilePreview from '../components/FilePreview';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import HubFeatureGrid from '../components/HubFeatureGrid';
import TrustSection from '../components/TrustSection';
import { useToast } from '../hooks/useToast.jsx';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { convertDocumentFileToPdf } from '../services/documentToolsService';
import { downloadBlob } from '../utils/formatters';

function DocumentToolsPage() {
  const { showToast } = useToast();
  const { addEntry } = useSessionHistory();
  const { t } = useTranslation();

  const formatIcon = (name) => `${import.meta.env.BASE_URL}assets/formats/${name}`;

  const formatCards = [
    {
      title: t('documentTools.wordToPdf.title'),
      description: t('documentTools.wordToPdf.description'),
      formats: [{ label: t('documentTools.wordToPdf.formats'), icon: formatIcon('docx.svg') }],
      tone: 'from-blue-50 to-blue-100/70 dark:from-blue-900/20 dark:to-blue-800/10',
    },
    {
      title: t('documentTools.excelToPdf.title'),
      description: t('documentTools.excelToPdf.description'),
      formats: [
        { label: 'XLSX', icon: formatIcon('xlsx.svg') },
        { label: 'XLS', icon: formatIcon('xls.svg') },
        { label: 'CSV', icon: formatIcon('csv.svg') },
      ],
      tone: 'from-emerald-50 to-emerald-100/70 dark:from-emerald-900/20 dark:to-emerald-800/10',
    },
    {
      title: t('documentTools.textToPdf.title'),
      description: t('documentTools.textToPdf.description'),
      formats: [
        { label: 'TXT', icon: formatIcon('txt.svg') },
        { label: 'MD', icon: formatIcon('md.svg') },
        { label: 'RTF', icon: formatIcon('rtf.svg') },
      ],
      tone: 'from-amber-50 to-amber-100/70 dark:from-amber-900/20 dark:to-amber-800/10',
    },
    {
      title: t('documentTools.powerPointLegacy.title'),
      description: t('documentTools.powerPointLegacy.description'),
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
      title: t('documentTools.hub.textContracts.title'),
      description: t('documentTools.hub.textContracts.description'),
      icon: Files,
      badge: 'DOCX, TXT, MD',
      actionLabel: t('documentTools.hub.textContracts.actionLabel'),
      accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
      onClick: () => {},
      className: 'hover:-translate-y-0',
    },
    {
      title: t('documentTools.hub.sheetsData.title'),
      description: t('documentTools.hub.sheetsData.description'),
      icon: FileSpreadsheet,
      badge: 'XLS, XLSX, CSV',
      actionLabel: t('documentTools.hub.sheetsData.actionLabel'),
      accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
      onClick: () => {},
      className: 'hover:-translate-y-0',
    },
  ];

  const documentTrustItems = [
    {
      title: t('documentTools.trust.directConversion.title'),
      description: t('documentTools.trust.directConversion.description'),
      icon: Files,
      accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
    },
    {
      title: t('documentTools.trust.assistedFlow.title'),
      description: t('documentTools.trust.assistedFlow.description'),
      icon: FileSpreadsheet,
      accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
    },
    {
      title: t('documentTools.trust.qualityPreservation.title'),
      description: t('documentTools.trust.qualityPreservation.description'),
      icon: ShieldCheck,
      accent: 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
    },
  ];

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
      setError(t('documentTools.panel.errorNoFile'));
      return;
    }

    setIsLoading(true);
    setProgress(15);

    try {
      const conversion = await convertDocumentFileToPdf(fileItem.file);
      setProgress(90);

      if (!conversion.supported) {
        setResult({ unsupported: true, reason: conversion.reason, suggestions: conversion.suggestions });
        showToast({ type: 'info', title: t('documentTools.unsupported.toastTitle'), message: t('documentTools.unsupported.toastMsg') });
        setProgress(0);
        return;
      }

      const url = downloadBlob(conversion.blob, conversion.fileName);
      setResult({
        unsupported: false,
        url,
        fileName: conversion.fileName,
        warning: conversion.warning,
      });

      addEntry({ tool: t('documentTools.section.kicker'), summary: `${fileItem.file.name} convertido para PDF` });
      showToast({ type: 'success', title: t('documentTools.resultCard.toastTitle'), message: t('documentTools.resultCard.toastMsg') });
      setProgress(100);
    } catch (processingError) {
      const message = processingError.message || t('documentTools.errorNotPossible');
      setError(message);
      showToast({ type: 'error', title: t('documentTools.errorToastTitle'), message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <HubFeatureGrid
        title={t('documentTools.hub.title')}
        description={t('documentTools.hub.description')}
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
            title={t('documentTools.uploadLabel')}
            description={t('documentTools.uploadHint')}
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
                <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{t('documentTools.panel.title')}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('documentTools.panel.subtitle')}</p>
              </div>
            </div>

            {isLoading ? <LoadingSpinner label={t('documentTools.panel.convertingLabel')} /> : null}
            {(isLoading || progress > 0) ? <ProgressBar value={progress} label={t('documentTools.panel.progressLabel')} /> : null}

            <Button className="w-full gap-2" onClick={runConversion} disabled={isLoading || !fileItem}>
              <Download className="h-4 w-4" />
              {t('documentTools.panel.convertButton')}
            </Button>
          </div>

          {result?.unsupported ? (
            <ResultCard title={t('documentTools.unsupported.title')} description={t('documentTools.unsupported.description')} tone="info">
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {result.suggestions?.map((item) => (
                  <p key={item}>- {item}</p>
                ))}
              </div>
            </ResultCard>
          ) : null}

          {result && !result.unsupported ? (
            <ResultCard title={t('documentTools.resultCard.title')} description={t('documentTools.resultCard.description')} tone="success">
              {result.warning ? (
                <p className="mb-3 flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4" />
                  {result.warning}
                </p>
              ) : null}
              <a href={result.url} download={result.fileName}>
                <Button>{t('documentTools.resultCard.downloadButton')}</Button>
              </a>
            </ResultCard>
          ) : null}
        </aside>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="space-y-5">
          <div className="section-intro">
            <p className="section-kicker">{t('documentTools.section.kicker')}</p>
            <h1 className="section-title">{t('documentTools.section.title')}</h1>
            <p className="section-copy">{t('documentTools.section.description')}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('documentTools.stats.formatsLabel')}</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{t('documentTools.stats.formatsValue')}</p>
            </div>
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('documentTools.stats.submissionLabel')}</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{t('documentTools.stats.submissionValue')}</p>
            </div>
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('documentTools.stats.deliveryLabel')}</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{t('documentTools.stats.deliveryValue')}</p>
            </div>
          </div>
        </div>

        <ResultCard
          title={t('documentTools.beforeConvert.title')}
          description={t('documentTools.beforeConvert.description')}
          tone="info"
        />
      </section>

      <TrustSection
        title={t('documentTools.trustSection.title')}
        description={t('documentTools.trustSection.description')}
        items={documentTrustItems}
      />
    </div>
  );
}

export default DocumentToolsPage;
