import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Shrink } from 'lucide-react';
import UploadArea from '../components/UploadArea';
import FilePreview from '../components/FilePreview';
import SelectField from '../components/SelectField';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import ResultCard from '../components/ResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../hooks/useToast.jsx';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { compressPdfInBrowser } from '../services/clientPdfTools';
import { zipDownloadItems } from '../services/pdfToolkitService';
import { formatBytes, formatPercent } from '../utils/formatters';
import { MAX_PDF_SIZE, validateFiles } from '../utils/fileValidation';

function CompressPdfPage() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || 'pt-BR').toLowerCase();
  const ui = lang.startsWith('en')
    ? { originalSize: 'Original size', originalSizeMany: 'Original size ({{count}} files)', original: 'Original', final: 'Final', reduction: 'Reduction', hide: 'Hide individual files', show: 'Download individual files', low: 'Low', medium: 'Medium', high: 'High', downloadSingle: 'Download compressed PDF' }
    : lang.startsWith('es')
      ? { originalSize: 'Tamaño original', originalSizeMany: 'Tamaño original ({{count}} archivos)', original: 'Original', final: 'Final', reduction: 'Reducción', hide: 'Ocultar archivos individuales', show: 'Descargar archivos individuales', low: 'Baja', medium: 'Media', high: 'Alta', downloadSingle: 'Descargar PDF comprimido' }
      : lang.startsWith('fr')
        ? { originalSize: 'Taille originale', originalSizeMany: 'Taille originale ({{count}} fichiers)', original: 'Original', final: 'Final', reduction: 'Réduction', hide: 'Masquer les fichiers individuels', show: 'Télécharger les fichiers individuels', low: 'Faible', medium: 'Moyenne', high: 'Élevée', downloadSingle: 'Télécharger PDF compressé' }
        : { originalSize: 'Tamanho original', originalSizeMany: 'Tamanho original ({{count}} arquivos)', original: 'Original', final: 'Final', reduction: 'Redução', hide: 'Ocultar arquivos individuais', show: 'Baixar arquivos individuais', low: 'Baixa', medium: 'Média', high: 'Alta', downloadSingle: 'Baixar PDF comprimido' };
  const { showToast } = useToast();
  const { addEntry } = useSessionHistory();
  const [files, setFiles] = useState([]);
  const [level, setLevel] = useState('medium');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showIndividual, setShowIndividual] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => () => {
    if (resultRef.current?.url) {
      URL.revokeObjectURL(resultRef.current.url);
    }
    resultRef.current?.individualFiles?.forEach((f) => URL.revokeObjectURL(f.url));
  }, []);

  const handleFileSelected = (selectedFiles) => {
    const validationError = validateFiles(selectedFiles, {
      mimeTypes: ['application/pdf'],
      maxSize: MAX_PDF_SIZE,
      multiple: true,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setResult(null);
    setFiles((current) => [
      ...current,
      ...selectedFiles.map((f) => ({
        id: crypto.randomUUID(),
        file: f,
        preview: null,
        kind: 'pdf',
      })),
    ]);
  };

  const removeFile = (id) => {
    setFiles((current) => current.filter((item) => item.id !== id));
  };

  const handleSubmit = async () => {
    if (!files.length) {
      setError(t('pdfTools.emptyFiles'));
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      if (result?.url) URL.revokeObjectURL(result.url);
      result?.individualFiles?.forEach((f) => URL.revokeObjectURL(f.url));
      setResult(null);
      setShowIndividual(false);

      const parts = [];
      const fileProgress = (i) => (v) => setProgress(Math.round((i * 100 + v) / files.length));

      for (let i = 0; i < files.length; i++) {
        const compression = await compressPdfInBrowser(files[i].file, {
          level,
          onProgress: fileProgress(i),
        });
        parts.push({
          name: `${files[i].file.name.replace(/\.[^/.]+$/, '')}-comprimido.pdf`,
          blob: compression.blob,
          originalSize: compression.originalSize,
          finalSize: compression.finalSize,
          reductionPercent: compression.reductionPercent,
          wasReduced: compression.wasReduced,
        });
      }

      const totalOrig = parts.reduce((acc, p) => acc + p.originalSize, 0);
      const totalFinal = parts.reduce((acc, p) => acc + p.finalSize, 0);
      const overallReduction = totalOrig > 0 ? ((totalOrig - totalFinal) / totalOrig) * 100 : 0;
      const reducedCount = parts.filter((p) => p.wasReduced).length;

      if (parts.length === 1) {
        const p = parts[0];
        const url = URL.createObjectURL(p.blob);
        setResult({
          mode: 'single',
          url,
          fileName: p.name,
          originalSize: p.originalSize,
          finalSize: p.finalSize,
          reductionPercent: p.reductionPercent,
          wasReduced: p.wasReduced,
        });

        addEntry({ tool: t('pdfTools.compress.title'), summary: `${p.name} ${formatPercent(p.reductionPercent)}` });
        showToast({
          type: p.wasReduced ? 'success' : 'info',
          title: p.wasReduced ? t('pdfTools.processComplete') : t('pdfTools.compress.actionLabel'),
          message: p.wasReduced ? t('pdfTools.compress.successMsg', { percent: formatPercent(p.reductionPercent) }) : t('pdfTools.compress.noReductionMsg'),
        });
      } else {
        const zip = await zipDownloadItems(
          parts.map((p) => ({ name: p.name, blob: p.blob })),
          `pdfs-comprimidos-${Date.now()}.zip`
        );
        setResult({
          mode: 'multiple',
          url: URL.createObjectURL(zip.zipBlob),
          fileName: zip.zipName,
          originalSize: totalOrig,
          finalSize: totalFinal,
          reductionPercent: overallReduction,
          wasReduced: reducedCount > 0,
          individualFiles: parts.map((p) => ({ name: p.name, url: URL.createObjectURL(p.blob) })),
        });

        addEntry({ tool: t('pdfTools.compress.title'), summary: `${parts.length} ${formatPercent(overallReduction)}` });
        showToast({ type: 'success', title: t('pdfTools.processComplete'), message: t('pdfTools.compress.multiMsg', { count: parts.length, reduced: reducedCount }) });
      }
    } catch (requestError) {
      const message = requestError.message || t('pdfTools.processError');
      setError(message);
      showToast({ type: 'error', title: t('pdfTools.fileError'), message });
    } finally {
      setIsLoading(false);
    }
  };

  const totalOriginalSize = files.reduce((acc, item) => acc + item.file.size, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="space-y-6">
        <UploadArea
          title={t('pdfTools.uploadLabel')}
          description={t('pdfTools.compress.description')}
          accept="application/pdf"
          multiple
          onFilesSelected={handleFileSelected}
          error={error}
          mode="pdf"
        />

        {files.length > 0 ? (
          <div className="space-y-3">
            {files.map((item) => (
              <FilePreview key={item.id} item={item} onRemove={removeFile} />
            ))}
          </div>
        ) : null}

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-400">{t('pdfTools.compress.title')}</p>
          <h1 className="section-title">{t('home.tools.compressPdfTitle')}</h1>
          <p className="section-copy">{t('pdfTools.compress.description')}</p>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="glass-panel space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900 p-3 text-white">
              <Shrink className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{t('pdfTools.compress.actionLabel')}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('pdfTools.compress.description')}</p>
            </div>
          </div>

          {files.length > 0 ? (
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
              {(files.length === 1 ? ui.originalSize : ui.originalSizeMany.replace('{{count}}', String(files.length)))}: <span className="font-semibold text-slate-900 dark:text-slate-100">{formatBytes(totalOriginalSize)}</span>
            </div>
          ) : null}

          <SelectField
            label={t('home.tools.compressPdfTitle')}
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            options={[
              { label: ui.low, value: 'low' },
              { label: ui.medium, value: 'medium' },
              { label: ui.high, value: 'high' },
            ]}
            helperText={t('pdfTools.compress.description')}
          />

          {isLoading ? <LoadingSpinner label={t('pdfTools.processComplete')} /> : null}
          {progress > 0 && isLoading ? <ProgressBar value={progress} label={t('pdfTools.compress.actionLabel')} /> : null}

          <Button className="w-full gap-2" onClick={handleSubmit} disabled={!files.length || isLoading}>
            <Shrink className="h-4 w-4" />
            {t('pdfTools.compress.actionLabel')}
          </Button>
        </div>

        {result ? (
          <ResultCard title={result.wasReduced ? t('pdfTools.processComplete') : t('pdfTools.compress.actionLabel')} description={result.wasReduced ? t('pdfTools.compress.successMsg', { percent: formatPercent(result.reductionPercent) }) : t('pdfTools.compress.noReductionMsg')} tone={result.wasReduced ? 'success' : 'info'}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-white p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{ui.original}</p>
                <p className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">{formatBytes(result.originalSize)}</p>
              </div>
              <div className="rounded-3xl bg-white p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{ui.final}</p>
                <p className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">{formatBytes(result.finalSize)}</p>
              </div>
              <div className="rounded-3xl bg-white p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{ui.reduction}</p>
                <p className="mt-3 text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatPercent(result.reductionPercent)}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {result.mode === 'multiple' ? (
                <>
                  <a href={result.url} download={result.fileName} className="block">
                    <Button className="w-full gap-2">
                      <Download className="h-4 w-4" />
                      {t('audioTools.downloadZip')}
                    </Button>
                  </a>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowIndividual((v) => !v)}
                  >
                    {showIndividual ? ui.hide : ui.show}
                  </Button>
                  {showIndividual ? (
                    <div className="space-y-2">
                      {result.individualFiles.map((f) => (
                        <a key={f.name} href={f.url} download={f.name} className="block">
                          <Button variant="ghost" className="w-full gap-2">
                            <Download className="h-3 w-3 shrink-0" />
                            <span className="truncate">{f.name}</span>
                          </Button>
                        </a>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <a href={result.url} download={result.fileName} className="block">
                  <Button className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    {ui.downloadSingle}
                  </Button>
                </a>
              )}
            </div>
          </ResultCard>
        ) : null}
      </aside>
    </div>
  );
}

export default CompressPdfPage;
