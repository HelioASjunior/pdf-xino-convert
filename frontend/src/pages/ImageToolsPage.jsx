import { useEffect, useRef, useState } from 'react';
import { Download, FileImage, FileOutput, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import UploadArea from '../components/UploadArea';
import FilePreview from '../components/FilePreview';
import SelectField from '../components/SelectField';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import { useToast } from '../hooks/useToast.jsx';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { MAX_IMAGE_SIZE, validateFiles } from '../utils/fileValidation';
import { buildImagesZip, convertImageFiles } from '../services/imageToolsService';
import { downloadBlob } from '../utils/formatters';

const acceptedImageMime = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/bmp',
  'image/gif',
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
    description: 'Padronize arquivos em JPG, PNG, WEBP, BMP ou GIF com download em ZIP.',
    href: '/image-tools',
    icon: FileImage,
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
    actionLabel: 'Ferramenta atual',
    current: true,
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

  const onFilesSelected = (files) => {
    const validationError = validateFiles(files, {
      mimeTypes: acceptedImageMime,
      maxSize: MAX_IMAGE_SIZE,
      multiple: true,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    clearResult();
    setItems((current) => [
      ...current,
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      })),
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
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-400">Ferramentas de Imagem</p>
          <h1 className="section-title">Converta imagens entre os formatos mais usados com rapidez e consistência.</h1>
          <p className="section-copy">Ideal para padronizar arquivos antes de apresentar, compartilhar ou arquivar seu material.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {imageCategoryTools.map((tool) => {
            const Icon = tool.icon;

            return (
              <Link
                key={tool.title}
                to={tool.href}
                className={`glass-panel flex h-full flex-col justify-between gap-5 p-5 transition duration-300 ${tool.current ? 'ring-2 ring-accent-200 dark:ring-accent-700/60' : 'hover:-translate-y-1'}`}
              >
                <div className="space-y-4">
                  <div className={`inline-flex rounded-2xl p-3 ${tool.accent}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{tool.title}</p>
                    <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">{tool.description}</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {tool.actionLabel}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>

        <UploadArea
          title="Adicionar imagens"
          description="Faça upload de múltiplas imagens e baixe tudo em ZIP ao final."
          accept="image/jpeg,image/png,image/webp,image/bmp,image/gif,image/tiff,image/svg+xml"
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
  );
}

export default ImageToolsPage;
