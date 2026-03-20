import { useEffect, useRef, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import UploadArea from '../components/UploadArea';
import FilePreview from '../components/FilePreview';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import ResultCard from '../components/ResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../hooks/useToast.jsx';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { convertPdfToWord } from '../services/clientPdfTools';
import { MAX_PDF_SIZE, validateFiles } from '../utils/fileValidation';
import { downloadBlob } from '../utils/formatters';

function PdfToWordPage() {
  const { showToast } = useToast();
  const { addEntry } = useSessionHistory();
  const [fileItem, setFileItem] = useState(null);
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

  const clearResult = () => {
    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }
    setResult(null);
  };

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
    clearResult();
    setFileItem({
      id: crypto.randomUUID(),
      file: files[0],
      preview: null,
      kind: 'pdf',
    });
  };

  const handleSubmit = async () => {
    if (!fileItem) {
      setError('Selecione um PDF antes de converter.');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    clearResult();
    setError('');

    try {
      const conversion = await convertPdfToWord(fileItem.file, {
        onProgress: (value) => setProgress(value),
      });

      const url = downloadBlob(conversion.blob, conversion.fileName);
      setResult({ url, fileName: conversion.fileName, pageCount: conversion.pageCount });

      addEntry({ tool: 'PDF para Word', summary: `${conversion.pageCount} página(s) extraídas de ${fileItem.file.name}` });
      showToast({ type: 'success', title: 'Conversão concluída', message: 'O arquivo DOCX está pronto para download.' });
    } catch (conversionError) {
      const message = conversionError.message || 'Não foi possível converter o PDF.';
      setError(message);
      showToast({ type: 'error', title: 'Falha na conversão', message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="space-y-6">
        <UploadArea
          title="Envie um PDF"
          description="O texto de cada página será extraído e organizado em um documento Word editável em formato DOCX."
          accept="application/pdf"
          onFilesSelected={handleFileSelected}
          error={error}
          mode="pdf"
        />

        {fileItem ? (
          <FilePreview item={fileItem} onRemove={() => { setFileItem(null); clearResult(); }} />
        ) : null}

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-400">PDF para Word</p>
          <h1 className="section-title">Converter PDF para Word Online Grátis</h1>
          <p className="section-copy">
            O texto de cada página é extraído diretamente no navegador e exportado como DOCX editável, sem envio de arquivos a servidores externos.
          </p>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="glass-panel space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-600 p-3 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Saída em Word</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Texto extraído e exportado como DOCX.</p>
            </div>
          </div>

          <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            A conversão extrai o conteúdo textual do PDF e preserva a separação por páginas no Word resultante. Formatações visuais complexas como tabelas e colunas podem ser simplificadas.
          </p>

          {isLoading ? <LoadingSpinner label="Extraindo texto do PDF..." /> : null}
          {isLoading ? <ProgressBar value={progress} label="Convertendo para Word" /> : null}

          <Button
            className="w-full gap-2"
            onClick={handleSubmit}
            disabled={isLoading || !fileItem}
          >
            <Download className="h-4 w-4" />
            Converter para Word
          </Button>
        </div>

        {result ? (
          <ResultCard
            title="Arquivo pronto"
            description={`${result.pageCount} página(s) extraída(s) com sucesso.`}
            tone="success"
          >
            <a href={result.url} download={result.fileName}>
              <Button>Baixar DOCX</Button>
            </a>
          </ResultCard>
        ) : null}
      </aside>
    </div>
  );
}

export default PdfToWordPage;

