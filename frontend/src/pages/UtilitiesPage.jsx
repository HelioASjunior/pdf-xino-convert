import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Archive, AudioLines, Download, Sparkles, Compass, Package, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import UploadArea from '../components/UploadArea';
import FilePreview from '../components/FilePreview';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import HubFeatureGrid from '../components/HubFeatureGrid';
import TrustSection from '../components/TrustSection';
import { useToast } from '../hooks/useToast.jsx';
import { zipDownloadItems } from '../services/pdfToolkitService';
import { downloadBlob } from '../utils/formatters';
import { detectToolSuggestion } from '../utils/fileTypeDetector';
import { createImagePreviewUrl } from '../utils/imagePreview';

const MAX_GENERIC_FILE_SIZE = 100 * 1024 * 1024;

function UtilitiesPage() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [items, setItems] = useState([]);

  const utilitiesHubItems = [
    {
      key: 'zip',
      title: t('utilities.zipGenerator.title'),
      description: t('utilities.zipGenerator.description'),
      icon: Package,
      badge: t('utilities.zipGenerator.badge'),
      actionLabel: t('utilities.zipGenerator.actionLabel'),
      accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
      className: 'hover:-translate-y-0',
    },
    {
      key: 'detector',
      title: t('utilities.autoDetector.title'),
      description: t('utilities.autoDetector.description'),
      icon: Compass,
      actionLabel: t('utilities.autoDetector.actionLabel'),
      accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
      className: 'hover:-translate-y-0',
    },
    {
      key: 'audio-converter',
      title: t('utilities.audioConverter.title'),
      description: t('utilities.audioConverter.description'),
      icon: AudioLines,
      href: '/conversor-audio',
      actionLabel: t('utilities.audioConverter.actionLabel'),
      accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
      badge: t('utilities.audioConverter.badge'),
    },
  ];

  const utilitiesTrustItems = [
    {
      title: t('utilities.trust.supportArea.title'),
      description: t('utilities.trust.supportArea.description'),
      icon: Compass,
      accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
    },
    {
      title: t('utilities.trust.readyPackages.title'),
      description: t('utilities.trust.readyPackages.description'),
      icon: Package,
      accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
    },
    {
      title: t('utilities.trust.clearForwarding.title'),
      description: t('utilities.trust.clearForwarding.description'),
      icon: ShieldCheck,
      accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
  ];

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);
  const uploadRef = useRef(null);
  const suggestionsRef = useRef(null);
  const suggestions = items.length ? detectToolSuggestion(items[items.length - 1].file) : null;
  const utilityActions = utilitiesHubItems.map((item) => ({
    ...item,
    current: item.key === 'detector' ? Boolean(suggestions) : false,
    onClick: () => {
      if (item.key === 'zip') {
        uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      if (item.key === 'detector') {
        suggestionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
  }));

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => () => {
    if (resultRef.current?.url) {
      URL.revokeObjectURL(resultRef.current.url);
    }
  }, []);

  const onFilesSelected = async (files) => {
    for (const file of files) {
      if (file.size > MAX_GENERIC_FILE_SIZE) {
        setError(t('utilities.errorSizeLimit', { name: file.name }));
        return;
      }
    }

    setError('');
    const mappedFiles = await Promise.all(files.map(async (file) => ({
      id: crypto.randomUUID(),
      file,
      preview: (file.type.startsWith('image/') || /\.(heic|heif)$/i.test(file.name))
        ? await createImagePreviewUrl(file)
        : null,
      kind: file.type === 'application/pdf' ? 'pdf' : 'image',
    })));

    setItems((current) => [
      ...current,
      ...mappedFiles,
    ]);
  };

  const removeItem = (id) => {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }
      return current.filter((item) => item.id !== id);
    });
  };

  const buildZip = async () => {
    if (!items.length) {
      setError(t('utilities.errorNoFiles'));
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      if (result?.url) {
        URL.revokeObjectURL(result.url);
      }

      const zip = await zipDownloadItems(
        items.map((item) => ({ name: item.file.name, file: item.file })),
        `downloads-${Date.now()}.zip`,
        (value) => setProgress(value),
      );

      const url = downloadBlob(zip.zipBlob, zip.zipName);
      setResult({ url, fileName: zip.zipName });
      showToast({ type: 'success', title: t('utilities.successTitle'), message: t('utilities.downloadStarted') });
    } catch (processingError) {
      const message = processingError.message || t('utilities.zipCreationError');
      setError(message);
      showToast({ type: 'error', title: t('utilities.processingError'), message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <HubFeatureGrid
        title={t('utilities.hubTitle')}
        description={t('utilities.hubDescription')}
        items={utilityActions}
        columnsClassName="md:grid-cols-3"
      />

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section ref={uploadRef} className="space-y-6">
          <UploadArea
            title={t('utilities.uploadLabel')}
            description={t('utilities.uploadDescription')}
            accept="*/*"
            multiple
            onFilesSelected={onFilesSelected}
            error={error}
          />

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
                <Archive className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{t('utilities.panelTitle')}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('utilities.panelDescription')}</p>
              </div>
            </div>

            {isLoading ? <LoadingSpinner label={t('utilities.loadingLabel')} /> : null}
            {isLoading ? <ProgressBar value={progress} label={t('utilities.progressLabel')} /> : null}

            <Button className="w-full gap-2" onClick={buildZip} disabled={isLoading || !items.length}>
              <Download className="h-4 w-4" />
              {t('utilities.generateButton')}
            </Button>
          </div>

          {suggestions ? (
            <ResultCard ref={suggestionsRef} title={t('utilities.detectorTitle')} description={suggestions.message} tone="info">
              <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">{t('utilities.suggestedCategory')}: {suggestions.category}</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.suggestions.map((item) => (
                  <Link key={item.href} to={item.href}>
                    <Button variant="ghost" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </ResultCard>
          ) : null}

          {result ? (
            <ResultCard title={t('utilities.successTitle')} description={t('utilities.successDesc')} tone="success">
              <a href={result.url} download={result.fileName}>
                <Button>{t('utilities.downloadButton')}</Button>
              </a>
            </ResultCard>
          ) : null}
        </aside>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="space-y-5">
          <div className="section-intro">
            <p className="section-kicker">{t('utilities.kicker')}</p>
            <h1 className="section-title">{t('utilities.introTitle')}</h1>
            <p className="section-copy">{t('utilities.introDescription')}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('utilities.statLimitLabel')}</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">100 MB</p>
            </div>
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('utilities.statFlexibleLabel')}</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{t('utilities.statFlexibleValue')}</p>
            </div>
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('utilities.statMainLabel')}</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{t('utilities.statMainValue')}</p>
            </div>
          </div>
        </div>

        <ResultCard
          title={t('utilities.whenToUseTitle')}
          description={t('utilities.whenToUseDescription')}
          tone="info"
        />
      </section>

      <TrustSection
        title={t('utilities.trustTitle')}
        description={t('utilities.trustDescription')}
        items={utilitiesTrustItems}
      />
    </div>
  );
}

export default UtilitiesPage;
