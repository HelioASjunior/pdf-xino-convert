import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileImage, Files } from 'lucide-react';
import UploadArea from '../components/UploadArea';
import SelectField from '../components/SelectField';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import ResultCard from '../components/ResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import FilePreview from '../components/FilePreview';
import { useToast } from '../hooks/useToast.jsx';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { convertPdfToImages } from '../services/clientPdfTools';
import { MAX_PDF_SIZE, validateFiles } from '../utils/fileValidation';

function PdfToImagesPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { addEntry } = useSessionHistory();
  const [fileItem, setFileItem] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState('png');
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => () => {
    const finalResult = resultRef.current;
    if (!finalResult) {
      return;
    }

    if (finalResult.zipUrl) {
      URL.revokeObjectURL(finalResult.zipUrl);
    }

    finalResult.images?.forEach((image) => {
      if (image.url) {
        URL.revokeObjectURL(image.url);
      }
    });
  }, []);

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
    if (result?.zipUrl) {
      URL.revokeObjectURL(result.zipUrl);
      result.images?.forEach((image) => URL.revokeObjectURL(image.url));
    }
    setResult(null);
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

    try {
      if (result?.zipUrl) {
        URL.revokeObjectURL(result.zipUrl);
        result.images?.forEach((image) => URL.revokeObjectURL(image.url));
      }

      const conversion = await convertPdfToImages(fileItem.file, {
        format,
        onProgress: (value) => {
          setProgress(value);
        },
      });

      const images = conversion.images.map((image) => ({
        name: image.name,
        url: URL.createObjectURL(image.blob),
      }));

      const zipUrl = URL.createObjectURL(conversion.zipBlob);

      setResult({
        pageCount: conversion.pageCount,
        images,
        zipUrl,
        zipFileName: conversion.zipFileName,
      });

      addEntry({ tool: t('pdfTools.pdfToImages.title'), summary: `${conversion.pageCount} ${format.toUpperCase()}` });
      showToast({ type: 'success', title: t('pdfTools.processComplete'), message: t('pdfTools.pdfToImages.description') });
    } catch (requestError) {
      const message = requestError.message || t('pdfTools.processError');
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
          description={t('pdfTools.pdfToImages.description')}
          accept="application/pdf"
          onFilesSelected={handleFileSelected}
          error={error}
          mode="pdf"
        />

        {fileItem ? (
          <FilePreview item={fileItem} onRemove={() => setFileItem(null)} />
        ) : null}

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-400">{t('pdfTools.pdfToImages.title')}</p>
          <h1 className="section-title">{t('Ferramenta de Conversão de PDF para Imagens')}</h1>
          <p className="section-copy">{t('pdfTools.pdfToImages.description')}</p>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="glass-panel space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-accent-500 p-3 text-white">
              <FileImage className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{t('pdfTools.pdfToImages.actionLabel')}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('pdfTools.pdfToImages.description')}</p>
            </div>
          </div>

          <SelectField
            label={t('audioTools.formatLabel')}
            value={format}
            onChange={(event) => setFormat(event.target.value)}
            options={[
              { label: 'PNG', value: 'png' },
              { label: 'JPG', value: 'jpg' },
            ]}
          />

          {isLoading ? <LoadingSpinner label={t('pdfTools.processComplete')} /> : null}
          {progress > 0 && isLoading ? <ProgressBar value={progress} label={t('pdfTools.pdfToImages.actionLabel')} /> : null}

          <Button className="w-full gap-2" onClick={handleSubmit} disabled={isLoading || !fileItem}>
            <Files className="h-4 w-4" />
            {t('pdfTools.pdfToImages.actionLabel')}
          </Button>
        </div>

        {result ? (
          <ResultCard
            title={t('pdfTools.processComplete')}
            description={t('pdfTools.pdfToImages.description')}
            tone="success"
          >
            <div className="flex flex-wrap gap-3">
              <a href={result.zipUrl} download={result.zipFileName}>
                <Button className="gap-2" type="button">
                  <Download className="h-4 w-4" />
                  {t('audioTools.downloadZip')}
                </Button>
              </a>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {result.images.map((image) => (
                <div key={image.name} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-800">
                  <img src={image.url} alt={image.name} className="aspect-[4/5] w-full object-cover" />
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{image.name}</p>
                    </div>
                    <a href={image.url} download={image.name}>
                      <Button variant="ghost">{t('utilities.downloadButton')}</Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </ResultCard>
        ) : null}
      </aside>
    </div>
  );
}

export default PdfToImagesPage;
