import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileImage, FileOutput, Layers3, PackageCheck, ShieldCheck } from 'lucide-react';
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
import { useSessionHistory } from '../hooks/useSessionHistory';
import { MAX_IMAGE_SIZE, validateFiles } from '../utils/fileValidation';
import { buildImagesZip, convertImageFiles } from '../services/imageToolsService';
import { createImagePreviewUrl } from '../utils/imagePreview';

function ImageToolsPage() {
  const { showToast } = useToast();
  const { addEntry } = useSessionHistory();
  const { t } = useTranslation();

  const [items, setItems] = useState([]);
  const [targetFormat, setTargetFormat] = useState('jpg');
  const [quality, setQuality] = useState('0.9');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [showIndividual, setShowIndividual] = useState(false);
  const resultRef = useRef(null);

  const acceptedImageMime = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/bmp',
    'image/gif',
    'image/heic',
    'image/heif',
    'image/svg+xml',
    'image/tiff',
  ];

  const imageCategoryTools = [
    {
      title: t('imageTools.categoryTools.imageToPdf.title'),
      description: t('imageTools.categoryTools.imageToPdf.description'),
      href: '/imagem-para-pdf',
      icon: FileOutput,
      accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
      actionLabel: t('imageTools.categoryTools.imageToPdf.actionLabel'),
    },
    {
      title: t('imageTools.categoryTools.convertFormat.title'),
      description: t('imageTools.categoryTools.convertFormat.description'),
      href: '/image-tools',
      icon: FileImage,
      accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
      actionLabel: t('imageTools.categoryTools.convertFormat.actionLabel'),
      current: true,
    },
  ];

  const imageTrustItems = [
    {
      title: t('imageTools.trust.standardization.title'),
      description: t('imageTools.trust.standardization.description'),
      icon: Layers3,
      accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
    },
    {
      title: t('imageTools.trust.smartDownload.title'),
      description: t('imageTools.trust.smartDownload.description'),
      icon: PackageCheck,
      accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
    },
    {
      title: t('imageTools.trust.controlledChoice.title'),
      description: t('imageTools.trust.controlledChoice.description'),
      icon: ShieldCheck,
      accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
  ];

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => () => {
    items.forEach((item) => item.preview && URL.revokeObjectURL(item.preview));
    resultRef.current?.converted?.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
    if (resultRef.current?.url) {
      URL.revokeObjectURL(resultRef.current.url);
    }
  }, [items]);

  const clearResult = () => {
    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }
    result?.converted?.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
    setResult(null);
    setShowIndividual(false);
  };

  const onFilesSelected = async (files) => {
    const validationError = validateFiles(files, {
      mimeTypes: acceptedImageMime,
      extensions: ['.heic', '.heif'],
      maxSize: MAX_IMAGE_SIZE,
      multiple: true,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    clearResult();
    const mappedFiles = await Promise.all(files.map(async (file) => ({
      id: crypto.randomUUID(),
      file,
      preview: await createImagePreviewUrl(file),
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

  const runConversion = async () => {
    if (!items.length) {
      setError('Adicione imagens para converter.');
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      clearResult();

      const convertedResult = await convertImageFiles(
        items.map((item) => item.file),
        targetFormat,
        Number(quality),
        (value) => setProgress(value),
      );

      if (!convertedResult.converted.length) {
        throw new Error(t('imageTools.uploadHint'));
      }

      const isSingle = convertedResult.converted.length === 1;

      if (isSingle) {
        const single = convertedResult.converted[0];
        setResult({
          mode: 'single',
          url: URL.createObjectURL(single.blob),
          fileName: single.name,
          converted: convertedResult.converted,
          failed: convertedResult.failed,
        });
        showToast({ type: 'success', title: 'Conversão concluída', message: 'Escolha como baixar o arquivo.' });
      } else {
        const zipName = `imagens-convertidas-${Date.now()}.zip`;
        const zip = await buildImagesZip(convertedResult.converted, zipName);
        setResult({
          mode: 'multiple',
          url: URL.createObjectURL(zip.zipBlob),
          zipName: zip.zipName,
          converted: convertedResult.converted,
          failed: convertedResult.failed,
        });
        showToast({ type: 'success', title: 'Conversão concluída', message: 'Escolha como baixar os arquivos.' });
      }

      addEntry({ tool: 'Ferramentas de Imagem', summary: `${convertedResult.converted.length} arquivo(s) convertido(s)` });
    } catch (processingError) {
      const message = processingError.message || 'Erro ao converter imagens.';
      setError(message);
      showToast({ type: 'error', title: 'Erro ao processar arquivo', message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <HubFeatureGrid
        title={t('imageTools.shortcutsLabel')}
        description={t('imageTools.shortcutsDesc')}
        items={imageCategoryTools}
      />

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6">
          <UploadArea
            title={t('imageTools.uploadLabel')}
            description={t('imageTools.uploadHint')}
            accept="image/jpeg,image/png,image/webp,image/bmp,image/gif,image/heic,image/heif,image/tiff,image/svg+xml,.heic,.heif"
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
                <FileImage className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Conversão de formato</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Defina o formato de saída e qualidade.</p>
              </div>
            </div>

            <SelectField
              label="Formato de saída"
              value={targetFormat}
              onChange={(event) => setTargetFormat(event.target.value)}
              options={[
                { value: 'jpg', label: 'JPG' },
                { value: 'png', label: 'PNG' },
                { value: 'webp', label: 'WEBP' },
                { value: 'bmp', label: 'BMP' },
                { value: 'gif', label: 'GIF' },
              ]}
              helperText="Escolha o formato final antes de iniciar o lote."
            />

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Qualidade ({Math.round(Number(quality) * 100)}%)</span>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.05"
                value={quality}
                onChange={(event) => setQuality(event.target.value)}
              />
            </label>

            {isLoading ? <LoadingSpinner label="Processando arquivo..." /> : null}
            {isLoading ? <ProgressBar value={progress} label="Convertendo imagens" /> : null}

            <Button className="w-full gap-2" onClick={runConversion} disabled={isLoading || !items.length}>
              <Download className="h-4 w-4" />
              Converter imagens
            </Button>
          </div>

          {result ? (
            <ResultCard
              title="Conversão concluída"
              description={`${result.converted.length} arquivo(s) convertido(s).`}
              tone="success"
            >
              <div className="space-y-3">
                {result.mode === 'single' ? (
                  <a href={result.url} download={result.fileName} className="block">
                    <Button className="w-full gap-2">
                      <Download className="h-4 w-4" />
                      <span className="truncate">Baixar {result.fileName}</span>
                    </Button>
                  </a>
                ) : (
                  <>
                    <a href={result.url} download={result.zipName} className="block">
                      <Button className="w-full gap-2">
                        <Download className="h-4 w-4" />
                        Baixar como ZIP
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => setShowIndividual((v) => !v)}
                    >
                      {showIndividual ? 'Ocultar arquivos individuais' : 'Baixar arquivos individuais'}
                    </Button>
                    {showIndividual ? (
                      <div className="space-y-2">
                        {result.converted.map((item) => (
                          <a key={item.name} href={item.previewUrl} download={item.name} className="block">
                            <Button variant="ghost" className="w-full gap-2">
                              <Download className="h-3 w-3 shrink-0" />
                              <span className="truncate">{item.name}</span>
                            </Button>
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </>
                )}
                {result.failed?.length ? (
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    {result.failed.length} arquivo(s) não puderam ser processados com este formato de saída.
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
            <p className="section-kicker">Ferramentas de Imagem</p>
            <h1 className="section-title">Padronize imagens com mais consistência antes de publicar, compartilhar ou arquivar.</h1>
            <p className="section-copy">Esta área reúne os principais fluxos para transformar imagens em PDF ou converter formatos em lote com uma experiência mais direta.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Saídas disponíveis</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">5 formatos</p>
            </div>
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Envio em lote</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Múltiplas imagens</p>
            </div>
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Entrega final</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Direto ou ZIP</p>
            </div>
          </div>
        </div>

        <ResultCard
          title="Fluxo recomendado"
          description="Escolha abaixo se você quer montar PDFs a partir de imagens ou apenas padronizar formatos. A ferramenta atual permanece disponível logo após os destaques."
          tone="info"
        />
      </section>

      <TrustSection
        title="Por que usar esta área de imagem"
        description="Os fluxos foram organizados para manter consistência visual e reduzir o tempo de preparação dos arquivos."
        items={imageTrustItems}
      />
    </div>
  );
}

export default ImageToolsPage;
