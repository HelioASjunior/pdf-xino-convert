import { useEffect, useRef, useState } from 'react';
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
import FaqSection from '../components/FaqSection';
import { useToast } from '../hooks/useToast.jsx';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { MAX_IMAGE_SIZE, validateFiles } from '../utils/fileValidation';
import { buildImagesZip, convertImageFiles } from '../services/imageToolsService';
import { downloadBlob } from '../utils/formatters';
import { createImagePreviewUrl } from '../utils/imagePreview';

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
    title: 'Imagem para PDF',
    description: 'Reúna várias imagens em um PDF único ou gere PDFs separados por arquivo.',
    href: '/imagem-para-pdf',
    icon: FileOutput,
    accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
    actionLabel: 'Abrir montagem em PDF',
  },
  {
    title: 'Converter Formato de Imagem',
    description: 'Padronize arquivos HEIC, JPG, PNG, WEBP, BMP ou GIF com download em ZIP.',
    href: '/image-tools',
    icon: FileImage,
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
    actionLabel: 'Ferramenta atual',
    current: true,
  },
];

const imageTrustItems = [
  {
    title: 'Padronização rápida',
    description: 'Converta lotes inteiros para um mesmo formato antes de publicar, compartilhar ou arquivar.',
    icon: Layers3,
    accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
  },
  {
    title: 'Download organizado',
    description: 'As imagens convertidas são entregues em ZIP para manter a distribuição simples.',
    icon: PackageCheck,
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
  },
  {
    title: 'Escolha controlada',
    description: 'Você decide o formato final e a qualidade antes de processar todos os arquivos.',
    icon: ShieldCheck,
    accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
];

const imageFaqItems = [
  {
    question: 'Posso converter várias imagens ao mesmo tempo?',
    answer: 'Sim. O fluxo foi preparado para lotes, mantendo todos os arquivos finais agrupados em um único ZIP.',
  },
  {
    question: 'Quais formatos de entrada são aceitos?',
    answer: 'Você pode enviar HEIC, HEIF, JPG, PNG, WEBP, BMP, GIF, TIFF e SVG para conversão nesta área.',
  },
  {
    question: 'Como funciona a qualidade da saída?',
    answer: 'O controle deslizante ajusta a compressão para formatos compatíveis e ajuda a equilibrar peso e aparência.',
  },
];

function ImageToolsPage() {
  const { showToast } = useToast();
  const { addEntry } = useSessionHistory();

  const [items, setItems] = useState([]);
  const [targetFormat, setTargetFormat] = useState('jpg');
  const [quality, setQuality] = useState('0.9');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

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
        throw new Error('Nenhum arquivo pôde ser convertido com o formato escolhido.');
      }

      const zip = await buildImagesZip(
        convertedResult.converted,
        `imagens-convertidas-${Date.now()}.zip`,
      );

      const url = downloadBlob(zip.zipBlob, zip.zipName);
      setResult({
        url,
        zipName: zip.zipName,
        converted: convertedResult.converted,
        failed: convertedResult.failed,
      });

      addEntry({ tool: 'Ferramentas de Imagem', summary: `${convertedResult.converted.length} arquivo(s) convertido(s)` });
      showToast({ type: 'success', title: 'Conversão concluída', message: 'Download do ZIP iniciado.' });
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
        title="Trilhas rápidas da categoria"
        description="Acesse os dois principais fluxos de imagem a partir de uma única página de entrada."
        items={imageCategoryTools}
      />

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6">
          <UploadArea
            title="Adicionar imagens"
            description="Faça upload de múltiplas imagens e baixe tudo em ZIP ao final."
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
              Converter e gerar ZIP
            </Button>
          </div>

          {result ? (
            <ResultCard
              title="Conversão concluída"
              description={`${result.converted.length} arquivo(s) convertido(s).`}
              tone="success"
            >
              <div className="space-y-3">
                <a href={result.url} download={result.zipName}>
                  <Button>Baixar ZIP</Button>
                </a>
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
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">ZIP organizado</p>
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

      <FaqSection
        description="Informações rápidas para orientar a conversão antes do processamento."
        items={imageFaqItems}
      />
    </div>
  );
}

export default ImageToolsPage;
