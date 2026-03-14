import { useEffect, useRef, useState } from 'react';
import { FileArchive, Scissors, Trash2, RotateCw, Files } from 'lucide-react';
import UploadArea from '../components/UploadArea';
import FilePreview from '../components/FilePreview';
import SelectField from '../components/SelectField';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../hooks/useToast.jsx';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { downloadBlob } from '../utils/formatters';
import { MAX_PDF_SIZE, validateFiles } from '../utils/fileValidation';
import {
  extractPdfPages,
  mergePdfFiles,
  removePdfPages,
  rotatePdf,
  splitPdf,
  zipDownloadItems,
} from '../services/pdfToolkitService';

function PdfToolsPage() {
  const { showToast } = useToast();
  const { addEntry } = useSessionHistory();

  const [files, setFiles] = useState([]);
  const [operation, setOperation] = useState('merge');
  const [range, setRange] = useState('');
  const [angle, setAngle] = useState('90');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => () => {
    files.forEach((item) => item.preview && URL.revokeObjectURL(item.preview));
    if (resultRef.current?.url) {
      URL.revokeObjectURL(resultRef.current.url);
    }
  }, [files]);

  const clearResult = () => {
    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }
    setResult(null);
  };

  const handleFilesSelected = (selectedFiles) => {
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
    clearResult();

    setFiles((current) => [
      ...current,
      ...selectedFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        kind: 'pdf',
        preview: null,
      })),
    ]);
  };

  const removeFile = (id) => {
    setFiles((current) => current.filter((item) => item.id !== id));
  };

  const runOperation = async () => {
    if (!files.length) {
      setError('Envie ao menos um PDF para continuar.');
      return;
    }

    if (operation === 'merge' && files.length < 2) {
      setError('Para juntar PDF, envie pelo menos dois arquivos.');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setError('');

    try {
      clearResult();
      let output;

      if (operation === 'merge') {
        const blob = await mergePdfFiles(files.map((item) => item.file), (value) => setProgress(value));
        output = {
          blob,
          fileName: `pdf-unificado-${Date.now()}.pdf`,
          description: `${files.length} arquivos combinados em um único PDF.`,
        };
      }

      if (operation === 'split') {
        const parts = await splitPdf(files[0].file, range, (value) => setProgress(value));
        const zip = await zipDownloadItems(parts, `pdf-dividido-${Date.now()}.zip`);
        output = {
          blob: zip.zipBlob,
          fileName: zip.zipName,
          description: `${parts.length} parte(s) gerada(s).`,
        };
      }

      if (operation === 'rotate') {
        const blob = await rotatePdf(files[0].file, Number(angle), range, (value) => setProgress(value));
        output = {
          blob,
          fileName: `${files[0].file.name.replace(/\.[^/.]+$/, '')}-rotacionado.pdf`,
          description: 'Rotação aplicada com sucesso.',
        };
      }

      if (operation === 'remove') {
        const blob = await removePdfPages(files[0].file, range, (value) => setProgress(value));
        output = {
          blob,
          fileName: `${files[0].file.name.replace(/\.[^/.]+$/, '')}-sem-paginas.pdf`,
          description: 'Páginas selecionadas removidas.',
        };
      }

      if (operation === 'extract') {
        const blob = await extractPdfPages(files[0].file, range, (value) => setProgress(value));
        output = {
          blob,
          fileName: `${files[0].file.name.replace(/\.[^/.]+$/, '')}-extraido.pdf`,
          description: 'Páginas selecionadas extraídas para novo PDF.',
        };
      }

      const url = downloadBlob(output.blob, output.fileName);
      setResult({ url, ...output });

      addEntry({ tool: 'Ferramentas de PDF', summary: `${operation} executado em ${files[0].file.name}` });
      showToast({ type: 'success', title: 'Processamento concluído', message: output.description });
    } catch (processingError) {
      const message = processingError.message || 'Erro ao processar PDF.';
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
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-400">Ferramentas de PDF</p>
          <h1 className="section-title">Junte, divida, rotacione, remova e extraia páginas de PDF.</h1>
          <p className="section-copy">Processamento local no navegador com feedback em tempo real.</p>
        </div>

        <UploadArea
          title="Enviar arquivos PDF"
          description="Para juntar PDF, envie múltiplos arquivos. Para as demais ações, um único PDF é suficiente."
          accept="application/pdf"
          multiple
          onFilesSelected={handleFilesSelected}
          error={error}
          mode="pdf"
        />

        {files.length ? (
          <div className="space-y-3">
            {files.map((item) => (
              <FilePreview key={item.id} item={item} onRemove={removeFile} />
            ))}
          </div>
        ) : null}
      </section>

      <aside className="space-y-6">
        <div className="glass-panel space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900 p-3 text-white">
              <FileArchive className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Operações PDF</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Selecione a ação e execute no navegador.</p>
            </div>
          </div>

          <SelectField
            label="Ferramenta"
            value={operation}
            onChange={(event) => setOperation(event.target.value)}
            options={[
              { value: 'merge', label: 'Juntar PDF' },
              { value: 'split', label: 'Dividir PDF' },
              { value: 'rotate', label: 'Rotacionar PDF' },
              { value: 'remove', label: 'Remover páginas' },
              { value: 'extract', label: 'Extrair páginas' },
            ]}
          />

          {operation === 'rotate' ? (
            <SelectField
              label="Ângulo"
              value={angle}
              onChange={(event) => setAngle(event.target.value)}
              options={[
                { value: '90', label: '90°' },
                { value: '180', label: '180°' },
                { value: '270', label: '270°' },
              ]}
            />
          ) : null}

          {operation !== 'merge' ? (
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Páginas (ex: 1,3-5)</span>
              <input
                value={range}
                onChange={(event) => setRange(event.target.value)}
                placeholder={operation === 'split' ? 'vazio = uma página por arquivo' : 'vazio = todas as páginas'}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
          ) : null}

          {isLoading ? <LoadingSpinner label="Processando arquivo..." /> : null}
          {isLoading ? <ProgressBar value={progress} label="Executando operação" /> : null}

          <Button className="w-full gap-2" onClick={runOperation} disabled={isLoading || !files.length}>
            {operation === 'split' ? <Scissors className="h-4 w-4" /> : null}
            {operation === 'remove' ? <Trash2 className="h-4 w-4" /> : null}
            {operation === 'rotate' ? <RotateCw className="h-4 w-4" /> : null}
            {(operation === 'merge' || operation === 'extract') ? <Files className="h-4 w-4" /> : null}
            Executar ferramenta
          </Button>
        </div>

        {result ? (
          <ResultCard title="Arquivo pronto" description={result.description} tone="success">
            <a href={result.url} download={result.fileName}>
              <Button>Baixar resultado</Button>
            </a>
          </ResultCard>
        ) : null}
      </aside>
    </div>
  );
}

export default PdfToolsPage;
