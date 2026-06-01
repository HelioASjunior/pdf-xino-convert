import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Film, Image, Minimize2, PackageCheck, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import UploadArea from '../components/UploadArea';
import FilePreview from '../components/FilePreview';
import SelectField from '../components/SelectField';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import HubFeatureGrid from '../components/HubFeatureGrid';
import TrustSection from '../components/TrustSection';
import { useToast } from '../hooks/useToast.jsx';
import { zipDownloadItems } from '../services/pdfToolkitService';
import { VIDEO_OUTPUT_OPTIONS, convertVideoFiles } from '../services/videoToolsService';
import { downloadBlob } from '../utils/formatters';

const MAX_VIDEO_SIZE = 200 * 1024 * 1024;
const MAX_VIDEO_FILES = 5;

const SUPPORTED_VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', '3gp', 'ogv', 'flv', 'wmv'];

function fileExtension(fileName) {
  return fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
}

function isVideoFile(file) {
  if (file.type?.startsWith('video/')) {
    return true;
  }
  return SUPPORTED_VIDEO_EXTENSIONS.includes(fileExtension(file.name));
}

function VideoToolsPage() {
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [items, setItems] = useState([]);
  const [targetFormat, setTargetFormat] = useState('mp4');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);
  const uploadRef = useRef(null);

  const videoHubItems = [
    {
      title: t('videoTools.converter.title'),
      description: t('videoTools.converter.description'),
      icon: Film,
      accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
      actionLabel: t('videoTools.converter.actionLabel'),
      current: targetFormat !== 'gif',
      onClick: () => {
        setTargetFormat('mp4');
        uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      },
    },
    {
      title: t('videoTools.gif.title'),
      description: t('videoTools.gif.description'),
      icon: Image,
      accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
      actionLabel: t('videoTools.gif.actionLabel'),
      badge: 'GIF',
      current: targetFormat === 'gif',
      onClick: () => {
        setTargetFormat('gif');
        uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      },
    },
    {
      title: t('videoTools.compressor.title'),
      description: t('videoTools.compressor.description'),
      icon: Minimize2,
      accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
      actionLabel: t('videoTools.compressor.actionLabel'),
      badge: t('videoTools.comingSoon'),
      onClick: () => {
        showToast({ type: 'info', title: t('videoTools.comingSoon'), message: t('videoTools.compressor.comingSoonMsg') });
      },
    },
  ];

  const videoTrustItems = [
    {
      title: t('videoTools.trust.clientSide.title'),
      description: t('videoTools.trust.clientSide.description'),
      icon: ShieldCheck,
      accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
    },
    {
      title: t('videoTools.trust.multiFormat.title'),
      description: t('videoTools.trust.multiFormat.description'),
      icon: PackageCheck,
      accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
    },
    {
      title: t('videoTools.trust.batchDownload.title'),
      description: t('videoTools.trust.batchDownload.description'),
      icon: SlidersHorizontal,
      accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
  ];

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

  const onFilesSelected = (files) => {
    const mergedCount = items.length + files.length;

    if (mergedCount > MAX_VIDEO_FILES) {
      setError(t('videoTools.errorMaxFiles', { max: MAX_VIDEO_FILES }));
      return;
    }

    for (const file of files) {
      if (!isVideoFile(file)) {
        setError(t('videoTools.errorNotVideo'));
        return;
      }

      if (file.size > MAX_VIDEO_SIZE) {
        setError(t('videoTools.errorSizeLimit', { name: file.name }));
        return;
      }
    }

    setError('');
    clearResult();
    setItems((current) => [
      ...current,
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        kind: 'video',
      })),
    ]);
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const runConversion = async () => {
    if (!items.length) {
      setError(t('videoTools.errorNoFiles'));
      return;
    }

    setError('');
    setIsLoading(true);
    setProgress(0);

    try {
      clearResult();

      const conversion = await convertVideoFiles(
        items.map((item) => item.file),
        { targetFormat },
        (value) => setProgress(Math.max(5, Math.min(95, value))),
      );

      if (!conversion.converted.length) {
        throw new Error(t('videoTools.errorConversion'));
      }

      let outputUrl;
      let outputName;
      let outputType;

      if (conversion.converted.length === 1) {
        const single = conversion.converted[0];
        outputName = single.fileName;
        outputType = 'single';
        outputUrl = downloadBlob(single.blob, outputName);
        setProgress(100);
      } else {
        const zip = await zipDownloadItems(
          conversion.converted.map((item) => ({ name: item.fileName, blob: item.blob })),
          `videos-convertidos-${Date.now()}.zip`,
          (zipProgress) => {
            const combined = 95 + (Number(zipProgress) / 100) * 5;
            setProgress(Math.round(combined));
          },
        );

        outputName = zip.zipName;
        outputType = 'zip';
        outputUrl = downloadBlob(zip.zipBlob, zip.zipName);
      }

      setResult({
        url: outputUrl,
        fileName: outputName,
        outputType,
        convertedCount: conversion.converted.length,
        failed: conversion.failed,
      });

      showToast({
        type: 'success',
        title: t('videoTools.successTitle'),
        message: t('videoTools.successMessage', { count: conversion.converted.length }),
      });
    } catch (processingError) {
      const message = processingError.message || t('videoTools.errorConversion');
      setError(message);
      showToast({ type: 'error', title: t('pdfTools.fileError'), message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="section-intro">
        <p className="section-kicker">{t('nav.videoTools')}</p>
        <h1 className="section-title">{t('videoTools.title')}</h1>
        <p className="section-copy">{t('videoTools.description')}</p>
      </div>

      <HubFeatureGrid
        title={t('videoTools.hubTitle')}
        description={t('videoTools.hubDescription')}
        items={videoHubItems}
        columnsClassName="md:grid-cols-3"
      />

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section ref={uploadRef} className="space-y-6">
          <UploadArea
            title={t('videoTools.uploadLabel')}
            description={t('videoTools.uploadDescription')}
            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.webm,.mov,.avi,.mkv,.m4v,.3gp,.ogv,.flv"
            multiple
            onFilesSelected={onFilesSelected}
            error={error}
          />

          <div className="glass-panel p-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('utilities.uploadLabel')}: {items.length}/{MAX_VIDEO_FILES}
            </p>
          </div>

          {items.length ? (
            <div className="space-y-3">
              {items.map((item) => (
                <FilePreview key={item.id} item={item} onRemove={removeItem} />
              ))}
            </div>
          ) : null}
        </section>

        <aside className="space-y-6">
          <div className="glass-panel space-y-5 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-900 p-3 text-white">
                <Film className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{t('videoTools.converter.title')}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('videoTools.description')}</p>
              </div>
            </div>

            <SelectField
              label={t('videoTools.formatLabel')}
              value={targetFormat}
              onChange={(event) => setTargetFormat(event.target.value)}
              options={VIDEO_OUTPUT_OPTIONS}
              helperText={t('videoTools.formatHint')}
            />

            {isLoading ? <LoadingSpinner label={t('videoTools.convertButton')} /> : null}
            {isLoading ? <ProgressBar value={progress} label={t('videoTools.convertButton')} /> : null}

            <Button className="w-full gap-2" onClick={runConversion} disabled={isLoading || !items.length}>
              <Download className="h-4 w-4" />
              {t('videoTools.convertButton')}
            </Button>
          </div>

          <ResultCard
            title={t('videoTools.processingNote.title')}
            description={t('videoTools.processingNote.description')}
            tone="info"
          />

          {result ? (
            <ResultCard
              title={t('videoTools.successTitle')}
              description={t('videoTools.successMessage', { count: result.convertedCount })}
              tone="success"
            >
              <div className="space-y-3">
                <a href={result.url} download={result.fileName}>
                  <Button>
                    {result.outputType === 'single' ? t('videoTools.downloadSingle') : t('videoTools.downloadZip')}
                  </Button>
                </a>
                {result.failed?.length ? (
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    {t('videoTools.errorConversion')}
                  </div>
                ) : null}
              </div>
            </ResultCard>
          ) : null}
        </aside>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="space-y-5">
          <div className="section-intro">
            <p className="section-kicker">{t('nav.videoTools')}</p>
            <h2 className="section-title">{t('videoTools.introTitle')}</h2>
            <p className="section-copy">{t('videoTools.introDescription')}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('videoTools.statFormatsLabel')}</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">5 formatos</p>
            </div>
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('videoTools.statBatchLabel')}</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{t('videoTools.statBatchValue')}</p>
            </div>
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('videoTools.statLimitLabel')}</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">200 MB</p>
            </div>
          </div>
        </div>

        <ResultCard
          title={t('videoTools.whenToUseTitle')}
          description={t('videoTools.whenToUseDescription')}
          tone="info"
        />
      </section>

      <TrustSection
        title={t('videoTools.trustTitle')}
        description={t('videoTools.trustDescription')}
        items={videoTrustItems}
      />
    </div>
  );
}

export default VideoToolsPage;
