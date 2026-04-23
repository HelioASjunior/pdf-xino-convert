import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AudioLines, Download, Music4, PackageCheck, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import UploadArea from '../components/UploadArea';
import FilePreview from '../components/FilePreview';
import SelectField from '../components/SelectField';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import TrustSection from '../components/TrustSection';
import { useToast } from '../hooks/useToast.jsx';
import { zipDownloadItems } from '../services/pdfToolkitService';
import { AUDIO_OUTPUT_OPTIONS, convertAudioFiles } from '../services/audioToolsService';
import { downloadBlob } from '../utils/formatters';

const MAX_AUDIO_SIZE = 50 * 1024 * 1024;
const MAX_AUDIO_FILES = 10;

const supportedAudioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'opus', 'wma', 'aiff', 'amr', 'webm'];

function fileExtension(fileName) {
  return fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
}

function isAudioFile(file) {
  if (file.type?.startsWith('audio/')) {
    return true;
  }

  return supportedAudioExtensions.includes(fileExtension(file.name));
}

function AudioConverterPage() {
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || 'pt-BR').toLowerCase();
  const ui = lang.startsWith('en')
    ? { bitrateLabel: 'Quality (bitrate)', b96: '96 kbps (smaller)', b192: '192 kbps (recommended)', b320: '320 kbps (higher quality)' }
    : lang.startsWith('es')
      ? { bitrateLabel: 'Calidad (bitrate)', b96: '96 kbps (más ligero)', b192: '192 kbps (recomendado)', b320: '320 kbps (más calidad)' }
      : lang.startsWith('fr')
        ? { bitrateLabel: 'Qualité (débit)', b96: '96 kbps (plus léger)', b192: '192 kbps (recommandé)', b320: '320 kbps (plus de qualité)' }
        : { bitrateLabel: 'Qualidade (bitrate)', b96: '96 kbps (mais leve)', b192: '192 kbps (recomendado)', b320: '320 kbps (mais qualidade)' };
  const [items, setItems] = useState([]);
  const [targetFormat, setTargetFormat] = useState('mp3');
  const [bitrate, setBitrate] = useState('192');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);
  const audioTrustItems = [
    {
      title: t('audioTools.title'),
      description: t('audioTools.description'),
      icon: ShieldCheck,
      accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
    },
    {
      title: t('audioTools.uploadLabel'),
      description: t('audioTools.uploadDescription'),
      icon: PackageCheck,
      accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
    },
    {
      title: t('audioTools.formatLabel'),
      description: t('audioTools.convertButton'),
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

    if (mergedCount > MAX_AUDIO_FILES) {
      setError(t('audioTools.errorMaxFiles', { max: MAX_AUDIO_FILES }));
      return;
    }

    for (const file of files) {
      if (!isAudioFile(file)) {
        setError(t('audioTools.errorConversion'));
        return;
      }

      if (file.size > MAX_AUDIO_SIZE) {
        setError(t('utilities.errorSizeLimit', { name: file.name }));
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
        kind: 'audio',
      })),
    ]);
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const runConversion = async () => {
    if (!items.length) {
      setError(t('audioTools.errorNoFiles'));
      return;
    }

    setError('');
    setIsLoading(true);
    setProgress(0);

    try {
      clearResult();

      const conversion = await convertAudioFiles(
        items.map((item) => item.file),
        { targetFormat, bitrate },
        (value) => setProgress(Math.max(5, Math.min(95, value))),
      );

      if (!conversion.converted.length) {
        throw new Error(t('audioTools.errorConversion'));
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
          `audios-convertidos-${Date.now()}.zip`,
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
        title: t('audioTools.successTitle'),
        message: t('audioTools.successMessage', { count: conversion.converted.length }),
      });
    } catch (processingError) {
      const message = processingError.message || t('audioTools.errorConversion');
      setError(message);
      showToast({ type: 'error', title: t('pdfTools.fileError'), message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="section-intro">
        <p className="section-kicker">{t('nav.utilities')}</p>
        <h1 className="section-title">{t('audioTools.title')}</h1>
        <p className="section-copy">{t('audioTools.description')}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6">
          <UploadArea
            title={t('audioTools.uploadLabel')}
            description={t('audioTools.uploadDescription')}
            accept="audio/*,.mp3,.wav,.ogg,.flac,.aac,.m4a,.opus,.wma,.aiff,.amr,.webm"
            multiple
            onFilesSelected={onFilesSelected}
            error={error}
          />

          <div className="glass-panel p-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('utilities.uploadLabel')}: {items.length}/{MAX_AUDIO_FILES}
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
                <AudioLines className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{t('audioTools.convertButton')}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('audioTools.description')}</p>
              </div>
            </div>

            <SelectField
              label={t('audioTools.formatLabel')}
              value={targetFormat}
              onChange={(event) => setTargetFormat(event.target.value)}
              options={AUDIO_OUTPUT_OPTIONS}
              helperText={t('audioTools.description')}
            />

            <SelectField
              label={ui.bitrateLabel}
              value={bitrate}
              onChange={(event) => setBitrate(event.target.value)}
              options={[
                { value: '96', label: ui.b96 },
                { value: '128', label: '128 kbps' },
                { value: '192', label: ui.b192 },
                { value: '256', label: '256 kbps' },
                { value: '320', label: ui.b320 },
              ]}
              helperText={t('audioTools.description')}
            />

            {isLoading ? <LoadingSpinner label={t('audioTools.convertButton')} /> : null}
            {isLoading ? <ProgressBar value={progress} label={t('audioTools.convertButton')} /> : null}

            <Button className="w-full gap-2" onClick={runConversion} disabled={isLoading || !items.length}>
              <Download className="h-4 w-4" />
              {t('audioTools.convertButton')}
            </Button>
          </div>

          {result ? (
            <ResultCard
              title={t('audioTools.successTitle')}
              description={t('audioTools.successMessage', { count: result.convertedCount })}
              tone="success"
            >
              <div className="space-y-3">
                <a href={result.url} download={result.fileName}>
                  <Button>
                    {result.outputType === 'single' ? t('audioTools.downloadSingle') : t('audioTools.downloadZip')}
                  </Button>
                </a>
                {result.failed?.length ? (
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    {t('audioTools.errorConversion')}
                  </div>
                ) : null}
              </div>
            </ResultCard>
          ) : null}
        </aside>
      </div>

      <TrustSection
        title={t('audioTools.title')}
        description={t('audioTools.description')}
        items={audioTrustItems}
      />

      <ResultCard
        title={t('audioTools.title')}
        description={t('audioTools.description')}
        tone="info"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Music4 className="h-4 w-4" />
          {t('audioTools.uploadDescription')}
        </div>
      </ResultCard>
    </div>
  );
}

export default AudioConverterPage;
