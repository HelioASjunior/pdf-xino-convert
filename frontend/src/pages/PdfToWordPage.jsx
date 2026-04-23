import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download } from 'lucide-react';
import UploadArea from '../components/UploadArea';
import FilePreview from '../components/FilePreview';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import ResultCard from '../components/ResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../hooks/useToast.jsx';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { convertPdfToWord } from '../services/clientPdfTools';
import { MAX_PDF_SIZE, validateFiles } from '../utils/fileValidation';
import { downloadBlob } from '../utils/formatters';

function PdfToWordPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { addEntry } = useSessionHistory();
  const [fileItem, setFileItem] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
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

  const clearResult = () => {
    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }
    setResult(null);
  };

  const handleFileSelected = (files) => {
    const validationError = validateFiles(files, {
      mimeTypes: ['application/pdf'],
      maxSize: MAX_PDF_SIZE,
      multiple: false,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    clearResult();
    setFileItem({
      id: crypto.randomUUID(),
      file: files[0],
      preview: null,
      kind: 'pdf',
    });
  };

  const handleSubmit = async () => {
    if (!fileItem) {
      setError(t('pdfTools.emptyFiles'));
      return;
    }

    setIsLoading(true);
    setProgress(0);
    clearResult();
    setError('');

    try {
      const conversion = await convertPdfToWord(fileItem.file, {
        onProgress: (value) => setProgress(value),
      });

      const url = downloadBlob(conversion.blob, conversion.fileName);
      setResult({ url, fileName: conversion.fileName, pageCount: conversion.pageCount });

      addEntry({ tool: t('pdfTools.pdfToWord.title'), summary: `${conversion.pageCount} ${fileItem.file.name}` });
      showToast({ type: 'success', title: t('pdfTools.processComplete'), message: t('pdfTools.pdfToWord.description') });
    } catch (conversionError) {
      const message = conversionError.message || t('pdfTools.processError');
      setError(message);
      showToast({ type: 'error', title: t('pdfTools.fileError'), message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="space-y-6">
        <UploadArea
          title={t('pdfTools.uploadLabel')}
          description={t('pdfTools.pdfToWord.description')}
          accept="application/pdf"
          onFilesSelected={handleFileSelected}
          error={error}
          mode="pdf"
        />

        {fileItem ? (
          <FilePreview item={fileItem} onRemove={() => { setFileItem(null); clearResult(); }} />
        ) : null}

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-400">{t('pdfTools.pdfToWord.title')}</p>
          <h1 className="section-title">{t('home.tools.pdfToWordTitle')}</h1>
          <p className="section-copy">
            {t('pdfTools.pdfToWord.description')}
          </p>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="glass-panel space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-600 p-3 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{t('pdfTools.pdfToWord.actionLabel')}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('pdfTools.pdfToWord.description')}</p>
            </div>
          </div>

          <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {t('pdfTools.pdfToWord.description')}
          </p>

          {isLoading ? <LoadingSpinner label={t('pdfTools.processComplete')} /> : null}
          {isLoading ? <ProgressBar value={progress} label={t('pdfTools.pdfToWord.actionLabel')} /> : null}

          <Button
            className="w-full gap-2"
            onClick={handleSubmit}
            disabled={isLoading || !fileItem}
          >
            <Download className="h-4 w-4" />
            {t('pdfTools.pdfToWord.actionLabel')}
          </Button>
        </div>

        {result ? (
          <ResultCard
            title={t('pdfTools.processComplete')}
            description={t('pdfTools.pdfToWord.description')}
            tone="success"
          >
            <a href={result.url} download={result.fileName}>
              <Button>{t('pdfTools.pdfToWord.actionLabel')}</Button>
            </a>
          </ResultCard>
        ) : null}
      </aside>
    </div>
  );
}

export default PdfToWordPage;

