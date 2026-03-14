import { useEffect, useRef, useState } from 'react';
import { Archive, Download, Sparkles } from 'lucide-react';
import UploadArea from '../components/UploadArea';
import FilePreview from '../components/FilePreview';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import { useToast } from '../hooks/useToast.jsx';
import { zipDownloadItems } from '../services/pdfToolkitService';
import { downloadBlob } from '../utils/formatters';
import { detectToolSuggestion } from '../utils/fileTypeDetector';

const MAX_GENERIC_FILE_SIZE = 50 * 1024 * 1024;

function UtilitiesPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
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

  const onFilesSelected = (files) => {
    for (const file of files) {
      if (file.size > MAX_GENERIC_FILE_SIZE) {
        setError(`O arquivo ${file.name} ultrapassa o limite de 50 MB por arquivo.`);
        return;
      }
    }

    setError('');
    setItems((current) => [
      ...current,
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        kind: file.type === 'application/pdf' ? 'pdf' : 'image',
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

  const buildZip = async () => {
    if (!items.length) {
      setError('Adicione arquivos para criar o ZIP.');
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
      showToast({ type: 'success', title: 'ZIP pronto', message: 'Download iniciado.' });
    } catch (processingError) {
      const message = processingError.message || 'Não foi possível criar o ZIP.';
      setError(message);
      showToast({ type: 'error', title: 'Erro ao processar arquivo', message });
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = items.length ? detectToolSuggestion(items[items.length - 1].file) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-400">Utilitários</p>
          <h1 className="section-title">Organize downloads, gere ZIPs e receba sugestão automática de ferramenta.</h1>
          <p className="section-copy">Use como área de preparação para múltiplos arquivos antes de conversões.</p>
        </div>

        <UploadArea
          title="Adicionar arquivos"
          description="Aceita qualquer arquivo até 50 MB para organização e pacote ZIP."
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
              <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Gerador de ZIP</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Empacote múltiplos arquivos em um único download.</p>
            </div>
          </div>

          {isLoading ? <LoadingSpinner label="Preparando download..." /> : null}
          {isLoading ? <ProgressBar value={progress} label="Gerando ZIP" /> : null}

          <Button className="w-full gap-2" onClick={buildZip} disabled={isLoading || !items.length}>
            <Download className="h-4 w-4" />
            Gerar ZIP
          </Button>
        </div>

        {suggestions ? (
          <ResultCard title="Detecção automática" description={suggestions.message} tone="info">
            <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Categoria sugerida: {suggestions.category}</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.suggestions.map((item) => (
                <a key={item.href} href={`#${item.href}`}>
                  <Button variant="ghost" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    {item.label}
                  </Button>
                </a>
              ))}
            </div>
          </ResultCard>
        ) : null}

        {result ? (
          <ResultCard title="ZIP pronto" description="Arquivo gerado com sucesso." tone="success">
            <a href={result.url} download={result.fileName}>
              <Button>Baixar ZIP</Button>
            </a>
          </ResultCard>
        ) : null}
      </aside>
    </div>
  );
}

export default UtilitiesPage;
