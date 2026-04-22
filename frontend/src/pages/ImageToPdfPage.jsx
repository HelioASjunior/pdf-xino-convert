import { useEffect, useRef, useState } from 'react';
import { FileDown, Images, MoveVertical } from 'lucide-react';
import UploadArea from '../components/UploadArea';
import FilePreview from '../components/FilePreview';
import FileOrderModal from '../components/FileOrderModal';
import SelectField from '../components/SelectField';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultCard from '../components/ResultCard';
import { useToast } from '../hooks/useToast.jsx';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { imagesToPdf, imagesToSeparatePdfs } from '../services/clientPdfTools';
import { MAX_IMAGE_SIZE, validateFiles } from '../utils/fileValidation';
import { createImagePreviewUrl } from '../utils/imagePreview';

const imageMimeTypes = ['image/*'];
const imageExtensions = ['.heic', '.heif'];

function ImageToPdfPage() {
  const { showToast } = useToast();
  const { addEntry } = useSessionHistory();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const itemsRef = useRef([]);
  const resultRef = useRef(null);
  const [options, setOptions] = useState({
    outputMode: 'single',
    orientation: 'portrait',
    pageSize: 'A4',
    margin: '24',
    imageFit: 'contain',
    compressImages: 'true',
  });
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => () => {
    itemsRef.current.forEach((item) => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });

    if (resultRef.current?.url) {
      URL.revokeObjectURL(resultRef.current.url);
    }
  }, []);

  const handleFilesSelected = async (selectedFiles) => {
    const validationError = validateFiles(selectedFiles, {
      mimeTypes: imageMimeTypes,
      extensions: imageExtensions,
      maxSize: MAX_IMAGE_SIZE,
      multiple: true,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    const mappedFiles = await Promise.all(selectedFiles.map(async (file) => ({
      id: crypto.randomUUID(),
      file,
      preview: await createImagePreviewUrl(file),
    })));

    setItems((current) => [
      ...current,
      ...mappedFiles,
    ]);
    setOrderConfirmed(false);
  };

  const removeItem = (id) => {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }
      setOrderConfirmed(false);
      return current.filter((item) => item.id !== id);
    });
  };

  const clearAll = () => {
    items.forEach((item) => URL.revokeObjectURL(item.preview));
    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }
    setItems([]);
    setProgress(0);
    setResult(null);
    setError('');
    setOrderConfirmed(false);
  };

  const applyOrderedItems = (orderedItems) => {
    setItems(orderedItems);
    setOrderConfirmed(true);
    setOrderModalOpen(false);
  };

  const handleSubmit = async () => {
    if (!items.length) {
      setError('Adicione ao menos uma imagem antes de gerar o PDF.');
      return;
    }

    if (items.length > 1 && !orderConfirmed) {
      setOrderModalOpen(true);
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setResult(null);

    try {
      if (result?.url) {
        URL.revokeObjectURL(result.url);
      }

      if (options.outputMode === 'separate') {
        const bundle = await imagesToSeparatePdfs(
          items.map((item) => item.file),
          options,
          (value) => {
            setProgress(value);
          },
        );

        const url = URL.createObjectURL(bundle.zipBlob);
        setResult({
          kind: 'separate',
          fileName: bundle.zipFileName,
          url,
          generatedCount: bundle.files.length,
          failed: bundle.failed,
        });
        showToast({ type: 'success', title: 'PDFs gerados', message: `${bundle.files.length} PDF(s) prontos para download.` });
        addEntry({ tool: 'Imagem para PDF', summary: `${bundle.files.length} PDF(s) individuais gerados` });
      } else {
        const pdfBlob = await imagesToPdf(
          items.map((item) => item.file),
          options,
          (value) => {
            setProgress(value);
          },
        );

        const fileName = `imagens-convertidas-${Date.now()}.pdf`;
        const url = URL.createObjectURL(pdfBlob);
        setResult({
          kind: 'single',
          fileName,
          url,
          generatedCount: items.length,
          failed: [],
        });
        showToast({ type: 'success', title: 'PDF gerado', message: 'Conversão concluída. Clique para baixar.' });
        addEntry({ tool: 'Imagem para PDF', summary: `${items.length} imagens convertidas em ${fileName}` });
      }
    } catch (requestError) {
      const message = requestError.message || 'Não foi possível gerar o PDF.';
      setError(message);
      showToast({ type: 'error', title: 'Falha na conversão', message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-6">
        <UploadArea
          title="Envie suas imagens"
          description="Faça upload de múltiplos arquivos, reorganize a sequência e exporte tudo em um único PDF ou em PDFs individuais."
          accept="image/*,.heic,.heif"
          multiple
          onFilesSelected={handleFilesSelected}
          error={error}
        />

        {items.length ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Fila de imagens</p>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setOrderModalOpen(true)}>
                  <MoveVertical className="mr-1 h-4 w-4" />
                  Organizar ordem
                </Button>
                <Button variant="ghost" onClick={clearAll}>Limpar arquivos</Button>
              </div>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <FilePreview key={item.id} item={item} onRemove={removeItem} />
              ))}
            </div>

            {items.length > 1 && !orderConfirmed ? (
              <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
                Revise a ordem dos arquivos na janela flutuante antes de gerar o documento final.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-400">Imagem para PDF</p>
          <h1 className="section-title">Organize as imagens, ajuste o layout e gere um PDF final limpo.</h1>
          <p className="section-copy">Reordene os arquivos, ajuste a apresentação e escolha entre um PDF único ou versões individuais do documento.</p>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="glass-panel space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900 p-3 text-white">
              <Images className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Configurações do PDF</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Controle a apresentação final do documento.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Modo de saída"
              value={options.outputMode}
              onChange={(event) => setOptions((current) => ({ ...current, outputMode: event.target.value }))}
              options={[
                { label: 'PDF único com todas as imagens', value: 'single' },
                { label: 'PDF separado para cada imagem', value: 'separate' },
              ]}
              helperText="No modo separado, o download sai em ZIP com um PDF por imagem."
            />
            <SelectField
              label="Orientação"
              value={options.orientation}
              onChange={(event) => setOptions((current) => ({ ...current, orientation: event.target.value }))}
              options={[
                { label: 'Retrato', value: 'portrait' },
                { label: 'Paisagem', value: 'landscape' },
              ]}
            />
            <SelectField
              label="Tamanho da página"
              value={options.pageSize}
              onChange={(event) => setOptions((current) => ({ ...current, pageSize: event.target.value }))}
              options={[
                { label: 'A4', value: 'A4' },
                { label: 'Letter', value: 'Letter' },
                { label: 'Legal', value: 'Legal' },
              ]}
            />
            <SelectField
              label="Margem"
              value={options.margin}
              onChange={(event) => setOptions((current) => ({ ...current, margin: event.target.value }))}
              options={[
                { label: 'Pequena (16 pt)', value: '16' },
                { label: 'Média (24 pt)', value: '24' },
                { label: 'Grande (32 pt)', value: '32' },
              ]}
            />
            <SelectField
              label="Ajuste da imagem"
              value={options.imageFit}
              onChange={(event) => setOptions((current) => ({ ...current, imageFit: event.target.value }))}
              options={[
                { label: 'Conter', value: 'contain' },
                { label: 'Cobrir', value: 'cover' },
                { label: 'Esticar', value: 'stretch' },
              ]}
            />
            <SelectField
              label="Compactação de imagem"
              value={options.compressImages}
              onChange={(event) => setOptions((current) => ({ ...current, compressImages: event.target.value }))}
              options={[
                { label: 'Ativada', value: 'true' },
                { label: 'Desativada', value: 'false' },
              ]}
              helperText="Reduz o peso das imagens antes de gerar o PDF."
            />
          </div>

          {isLoading ? <LoadingSpinner label="Processando arquivo..." /> : null}
          {progress > 0 && isLoading ? (
            <ProgressBar
              value={progress}
              label={options.outputMode === 'separate' ? 'Gerando PDFs individuais' : 'Convertendo imagens em PDF'}
            />
          ) : null}

          <Button className="w-full gap-2" onClick={handleSubmit} disabled={isLoading || !items.length}>
            <FileDown className="h-4 w-4" />
            {options.outputMode === 'separate' ? 'Gerar ZIP com PDFs' : 'Gerar PDF'}
          </Button>
        </div>

        {result ? (
          <ResultCard
            title={result.kind === 'separate' ? 'PDFs individuais prontos' : 'PDF final pronto'}
            description={result.kind === 'separate'
              ? `Foram gerados ${result.generatedCount} PDF(s) prontos para download.`
              : 'PDF gerado com sucesso. Clique no botão abaixo para baixar.'}
            tone="success"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href={result.url} download={result.fileName}>
                <Button>{result.kind === 'separate' ? 'Baixar ZIP com PDFs' : 'Baixar PDF final'}</Button>
              </a>
            </div>
            {result.failed?.length ? (
              <div className="mt-4 text-sm text-amber-700 dark:text-amber-300">
                {result.failed.length} imagem(ns) exigiram tratamento diferente e não foram concluídas nesta etapa.
              </div>
            ) : null}
          </ResultCard>
        ) : null}
      </aside>

      <FileOrderModal
        open={orderModalOpen}
        items={items}
        title="Organizar imagens antes de gerar PDF"
        description="A primeira imagem da lista vira a primeira pagina do PDF final."
        onClose={() => setOrderModalOpen(false)}
        onConfirm={applyOrderedItems}
      />
    </div>
  );
}

export default ImageToPdfPage;
