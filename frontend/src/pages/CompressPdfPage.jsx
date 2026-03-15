import { useEffect, useRef, useState } from 'react';
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
import { downloadBlob, formatBytes, formatPercent } from '../utils/formatters';
import { MAX_PDF_SIZE, validateFiles } from '../utils/fileValidation';

function CompressPdfPage() {
  const { showToast } = useToast();
  const { addEntry } = useSessionHistory();
  const [fileItem, setFileItem] = useState(null);
  const [level, setLevel] = useState('medium');
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
      setError('Selecione um PDF antes de compactar.');
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      if (result?.url) {
        URL.revokeObjectURL(result.url);
      }

      const compression = await compressPdfInBrowser(fileItem.file, {
        level,
        onProgress: (value) => {
          setProgress(value);
        },
      });

      const fileName = `${fileItem.file.name.replace(/\.[^/.]+$/, '')}-comprimido.pdf`;
      const url = downloadBlob(compression.blob, fileName);

      setResult({
        url,
        fileName,
        originalSize: compression.originalSize,
        finalSize: compression.finalSize,
        reductionPercent: compression.reductionPercent,
        wasReduced: compression.wasReduced,
      });

      addEntry({ tool: 'Comprimir PDF', summary: `${fileName} com redução de ${formatPercent(compression.reductionPercent)}` });
      showToast({
        type: compression.wasReduced ? 'success' : 'info',
        title: compression.wasReduced ? 'Compressão concluída' : 'Compressão limitada',
        message: compression.wasReduced
          ? 'Download do arquivo compactado iniciado.'
          : 'O PDF já estava otimizado e não houve redução relevante.',
      });
    } catch (requestError) {
      const message = requestError.message || 'Não foi possível compactar o PDF.';
      setError(message);
      showToast({ type: 'error', title: 'Falha na compactação', message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="space-y-6">
        <UploadArea
          title="Envie o PDF"
          description="Veja o tamanho original, escolha o nível de compressão e baixe o novo arquivo com resumo do ganho obtido."
          accept="application/pdf"
          onFilesSelected={handleFileSelected}
          error={error}
          mode="pdf"
        />

        {fileItem ? <FilePreview item={fileItem} onRemove={() => setFileItem(null)} /> : null}

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-400">Comprimir PDF</p>
          <h1 className="section-title">Reduza o peso do arquivo com níveis claros de compressão.</h1>
          <p className="section-copy">Otimize o tamanho do PDF para compartilhar, armazenar e enviar arquivos com mais eficiência.</p>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="glass-panel space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900 p-3 text-white">
              <Shrink className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Ajustes da compactação</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Escolha o equilíbrio entre qualidade e tamanho final.</p>
            </div>
          </div>

          {fileItem ? (
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
              Tamanho original: <span className="font-semibold text-slate-900 dark:text-slate-100">{formatBytes(fileItem.file.size)}</span>
            </div>
          ) : null}

          <SelectField
            label="Nível de compressão"
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            options={[
              { label: 'Baixa', value: 'low' },
              { label: 'Média', value: 'medium' },
              { label: 'Alta', value: 'high' },
            ]}
            helperText="Níveis mais altos geram arquivos menores, com maior perda visual."
          />

          {isLoading ? <LoadingSpinner label="Processando arquivo..." /> : null}
          {progress > 0 && isLoading ? <ProgressBar value={progress} label="Convertendo páginas para versão otimizada" /> : null}

          <Button className="w-full gap-2" onClick={handleSubmit} disabled={!fileItem || isLoading}>
            <Shrink className="h-4 w-4" />
            Compactar PDF
          </Button>
        </div>

        {result ? (
          <ResultCard title={result.wasReduced ? 'Compressão concluída' : 'Compressão limitada'} description={result.wasReduced ? 'Resumo comparativo do arquivo antes e depois do processamento.' : 'Este arquivo já está próximo do melhor equilíbrio possível para este tipo de conteúdo.'} tone={result.wasReduced ? 'success' : 'info'}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-white p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Original</p>
                <p className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">{formatBytes(result.originalSize)}</p>
              </div>
              <div className="rounded-3xl bg-white p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Final</p>
                <p className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">{formatBytes(result.finalSize)}</p>
              </div>
              <div className="rounded-3xl bg-white p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Redução</p>
                <p className="mt-3 text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatPercent(result.reductionPercent)}</p>
              </div>
            </div>

            <div className="mt-5">
              <a href={result.url} download={result.fileName}>
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Baixar PDF comprimido
                </Button>
              </a>
            </div>
          </ResultCard>
        ) : null}
      </aside>
    </div>
  );
}

export default CompressPdfPage;
