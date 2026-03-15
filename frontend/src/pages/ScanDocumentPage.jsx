import { useEffect, useRef, useState } from 'react';
import { Download, FileArchive, Info, ScanLine } from 'lucide-react';
import UploadArea from '../components/UploadArea';
import FilePreview from '../components/FilePreview';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import { useToast } from '../hooks/useToast.jsx';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { compressPdfInBrowser, imagesToPdf } from '../services/clientPdfTools';
import { downloadBlob, formatBytes, formatPercent } from '../utils/formatters';
import { MAX_IMAGE_SIZE, MAX_PDF_SIZE, validateFiles } from '../utils/fileValidation';

const acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

function ScanDocumentPage() {
  const { showToast } = useToast();
  const { addEntry } = useSessionHistory();

  const [showScannerHelp, setShowScannerHelp] = useState(false);
  const [images, setImages] = useState([]);
  const [scannedPdf, setScannedPdf] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);
  const imagesRef = useRef([]);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => () => {
    imagesRef.current.forEach((item) => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });

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

  const addFiles = (files) => {
    const validationError = validateFiles(files, {
      mimeTypes: acceptedTypes,
      maxSize: Math.max(MAX_IMAGE_SIZE, MAX_PDF_SIZE),
      multiple: true,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    const pdfFiles = files.filter((file) => file.type === 'application/pdf');
    const imageFiles = files.filter((file) => file.type !== 'application/pdf');

    if (pdfFiles.length > 1) {
      setError('Selecione apenas um PDF por vez para arquivo escaneado.');
      return;
    }

    if (pdfFiles[0] && pdfFiles[0].size > MAX_PDF_SIZE) {
      setError(`O arquivo ${pdfFiles[0].name} ultrapassa o limite permitido.`);
      return;
    }

    if (imageFiles.some((file) => file.size > MAX_IMAGE_SIZE)) {
      const oversized = imageFiles.find((file) => file.size > MAX_IMAGE_SIZE);
      setError(`O arquivo ${oversized?.name} ultrapassa o limite permitido.`);
      return;
    }

    clearResult();
    setError('');

    if (pdfFiles[0]) {
      setScannedPdf({
        id: crypto.randomUUID(),
        file: pdfFiles[0],
        kind: 'pdf',
        preview: null,
      });
      showToast({ type: 'info', title: 'PDF escaneado carregado', message: 'Você já pode baixar ou compactar este documento.' });
    }

    if (imageFiles.length) {
      setImages((current) => [
        ...current,
        ...imageFiles.map((file) => ({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
        })),
      ]);
      showToast({ type: 'success', title: 'Imagens carregadas', message: `${imageFiles.length} página(s) adicionada(s).` });
    }
  };

  const removeImage = (id) => {
    setImages((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }
      return current.filter((item) => item.id !== id);
    });
  };

  const clearAll = () => {
    images.forEach((item) => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });

    clearResult();
    setImages([]);
    setScannedPdf(null);
    setError('');
    setProgress(0);
  };

  const exportPdfFromImages = async () => {
    if (!images.length) {
      setError('Adicione imagens escaneadas para gerar o PDF.');
      return;
    }

    setIsExporting(true);
    setProgress(0);

    try {
      clearResult();
      const pdfBlob = await imagesToPdf(
        images.map((item) => item.file),
        {
          orientation: 'portrait',
          pageSize: 'A4',
          margin: '16',
          imageFit: 'contain',
          compressImages: 'true',
        },
        (value) => setProgress(value),
      );

      const fileName = `documento-escaneado-${Date.now()}.pdf`;
      const url = downloadBlob(pdfBlob, fileName);
      setResult({
        fileName,
        url,
        originalSize: images.reduce((sum, item) => sum + item.file.size, 0),
        finalSize: pdfBlob.size,
        reductionPercent: 0,
      });

      addEntry({ tool: 'Escanear documento', summary: `${images.length} página(s) convertida(s) em PDF` });
      showToast({ type: 'success', title: 'PDF gerado', message: 'Conversão concluída e download iniciado.' });
    } catch (processingError) {
      const message = processingError.message || 'Não foi possível gerar o PDF.';
      setError(message);
      showToast({ type: 'error', title: 'Erro ao processar arquivo', message });
    } finally {
      setIsExporting(false);
    }
  };

  const compressCurrentPdf = async () => {
    if (!scannedPdf?.file) {
      setError('Carregue um PDF escaneado para compactar.');
      return;
    }

    setIsExporting(true);
    setProgress(0);

    try {
      clearResult();
      const compression = await compressPdfInBrowser(scannedPdf.file, {
        level: 'medium',
        onProgress: (value) => setProgress(value),
      });

      const fileName = `${scannedPdf.file.name.replace(/\.[^/.]+$/, '')}-comprimido.pdf`;
      const url = downloadBlob(compression.blob, fileName);
      setResult({
        fileName,
        url,
        originalSize: compression.originalSize,
        finalSize: compression.finalSize,
        reductionPercent: compression.reductionPercent,
      });

      addEntry({ tool: 'Escanear documento', summary: `PDF escaneado compactado (${formatPercent(compression.reductionPercent)})` });
      showToast({ type: 'success', title: 'Compressão concluída', message: 'Arquivo compactado disponível para download.' });
    } catch (processingError) {
      const message = processingError.message || 'Não foi possível compactar o PDF escaneado.';
      setError(message);
      showToast({ type: 'error', title: 'Erro ao processar arquivo', message });
    } finally {
      setIsExporting(false);
    }
  };

  const startExternalScanFlow = () => {
    setShowScannerHelp(true);
    showToast({
      type: 'info',
      title: 'Escaneamento via app do computador',
      message: 'Use o software do scanner para gerar PDF/JPG/PNG e depois envie o arquivo aqui.',
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-6">
        <div className="glass-panel space-y-4 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-slate-900 p-3 text-white">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Scanner local</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Fluxo recomendado para importar páginas com praticidade e seguir a finalização aqui.</p>
            </div>
          </div>

          <Button className="gap-2" onClick={startExternalScanFlow}>
            <ScanLine className="h-4 w-4" />
            Escanear documento
          </Button>

          {showScannerHelp ? (
            <ResultCard
              title="Como escanear e enviar"
              description="Use o aplicativo do scanner (ou do sistema) e depois faça upload aqui."
              tone="info"
            >
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <p>1. Abra o software do scanner no computador.</p>
                <p>2. Digitalize em PDF, JPG ou PNG.</p>
                <p>3. Clique em "Adicionar arquivo escaneado" e envie o arquivo.</p>
              </div>
            </ResultCard>
          ) : null}

          <UploadArea
            title="Adicionar arquivo escaneado"
            description="Aceita PDF, JPG, PNG e WEBP. Você pode enviar um PDF escaneado pronto ou múltiplas imagens de páginas."
            accept="application/pdf,image/jpeg,image/png,image/webp"
            multiple
            onFilesSelected={addFiles}
            error={error}
          />
        </div>

        {scannedPdf ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">PDF escaneado</p>
            <FilePreview item={scannedPdf} onRemove={() => setScannedPdf(null)} />
          </div>
        ) : null}

        {images.length ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Páginas em imagem</p>
              <Button variant="ghost" onClick={clearAll}>Limpar tudo</Button>
            </div>

            <div className="space-y-3">
              {images.map((item) => (
                <FilePreview key={item.id} item={item} onRemove={removeImage} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-400">Escanear documento</p>
          <h1 className="section-title">Digitalize no seu equipamento e finalize o documento aqui com praticidade.</h1>
          <p className="section-copy">Importe páginas já digitalizadas, organize o material e gere um arquivo pronto para compartilhar.</p>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="glass-panel space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-accent-500 p-3 text-white">
              <FileArchive className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Ações do documento</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Converta imagens em PDF ou compacte um PDF já escaneado.</p>
            </div>
          </div>

          {isExporting ? <LoadingSpinner label="Processando arquivo..." /> : null}
          {isExporting ? <ProgressBar value={progress} label="Executando processamento" /> : null}

          <div className="flex flex-wrap gap-3">
            <Button className="gap-2" onClick={exportPdfFromImages} disabled={isExporting || !images.length}>
              <Download className="h-4 w-4" />
              Gerar PDF das imagens
            </Button>
            <Button variant="secondary" className="gap-2" onClick={compressCurrentPdf} disabled={isExporting || !scannedPdf}>
              <FileArchive className="h-4 w-4" />
              Comprimir PDF escaneado
            </Button>
          </div>

          <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
            Ideal para centralizar páginas digitalizadas, consolidar documentos e preparar versões finais com mais agilidade.
          </p>
        </div>

        {result ? (
          <ResultCard title="Arquivo pronto" description="Processamento concluído com sucesso." tone="success">
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

            <div className="mt-5 flex flex-wrap gap-3">
              <a href={result.url} download={result.fileName}>
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Baixar arquivo
                </Button>
              </a>
              <Button variant="ghost" onClick={clearResult}>Limpar resultado</Button>
            </div>
          </ResultCard>
        ) : (
          <ResultCard title="Como funciona a digitalização" description="A captura começa no aplicativo do seu scanner e a finalização do arquivo acontece aqui em poucos passos." tone="info">
            <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Info className="mt-0.5 h-4 w-4" />
              <p>
                Digitalize no software do equipamento, salve em PDF ou imagem e envie o arquivo para concluir o documento com organização e rapidez.
              </p>
            </div>
          </ResultCard>
        )}
      </aside>
    </div>
  );
}

export default ScanDocumentPage;
