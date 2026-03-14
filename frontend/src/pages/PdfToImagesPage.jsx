import { useState } from 'react';
import { Download, FileImage, Files } from 'lucide-react';
import UploadArea from '../components/UploadArea';
import SelectField from '../components/SelectField';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import ResultCard from '../components/ResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import FilePreview from '../components/FilePreview';
import { useToast } from '../hooks/useToast.jsx';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { postPdfToImages, resolveAssetUrl } from '../services/api';
import { MAX_PDF_SIZE, validateFiles } from '../utils/fileValidation';

function PdfToImagesPage() {
  const { showToast } = useToast();
  const { addEntry } = useSessionHistory();
  const [fileItem, setFileItem] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState('png');
  const [result, setResult] = useState(null);

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
      setError('Selecione um PDF antes de converter.');
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('pdf', fileItem.file);
      formData.append('format', format);

      const response = await postPdfToImages(formData, (event) => {
        if (event.total) {
          setProgress((event.loaded / event.total) * 100);
        }
      });

      setResult(response.data);
      addEntry({ tool: 'PDF para Imagens', summary: `${response.data.pageCount} páginas exportadas em ${format.toUpperCase()}` });
      showToast({ type: 'success', title: 'Conversão concluída', message: 'As páginas foram extraídas com sucesso.' });
    } catch (requestError) {
      const message = requestError.response?.data?.message || 'Não foi possível converter o PDF em imagens.';
      setError(message);
      showToast({ type: 'error', title: 'Falha na extração', message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-400">PDF para Imagens</p>
          <h1 className="section-title">Extraia páginas do PDF como imagens e baixe tudo em um clique.</h1>
          <p className="section-copy">Envie um PDF, escolha PNG ou JPG e visualize o resultado de cada página antes de baixar.</p>
        </div>

        <UploadArea
          title="Envie um PDF"
          description="A ferramenta detecta a quantidade de páginas e converte cada página em imagem, com arquivo ZIP pronto para download."
          accept="application/pdf"
          onFilesSelected={handleFileSelected}
          error={error}
          mode="pdf"
        />

        {fileItem ? (
          <FilePreview item={fileItem} onRemove={() => setFileItem(null)} />
        ) : null}
      </section>

      <aside className="space-y-6">
        <div className="glass-panel space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-accent-500 p-3 text-white">
              <FileImage className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Saída das imagens</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Escolha o formato e execute a extração.</p>
            </div>
          </div>

          <SelectField
            label="Formato de saída"
            value={format}
            onChange={(event) => setFormat(event.target.value)}
            options={[
              { label: 'PNG', value: 'png' },
              { label: 'JPG', value: 'jpg' },
            ]}
          />

          {isLoading ? <LoadingSpinner label="Convertendo páginas..." /> : null}
          {progress > 0 && isLoading ? <ProgressBar value={progress} label="Upload e leitura do PDF" /> : null}

          <Button className="w-full gap-2" onClick={handleSubmit} disabled={isLoading || !fileItem}>
            <Files className="h-4 w-4" />
            Converter PDF em imagens
          </Button>
        </div>

        {result ? (
          <ResultCard
            title="Páginas extraídas"
            description={`${result.pageCount} páginas detectadas. Faça o download individual ou baixe todas em ZIP.`}
            tone="success"
          >
            <div className="flex flex-wrap gap-3">
              <a href={resolveAssetUrl(result.zipUrl)} target="_blank" rel="noreferrer">
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Baixar ZIP
                </Button>
              </a>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {result.images.map((image) => (
                <div key={image.name} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-800">
                  <img src={resolveAssetUrl(image.url)} alt={image.name} className="aspect-[4/5] w-full object-cover" />
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{image.name}</p>
                    </div>
                    <a href={resolveAssetUrl(image.url)} target="_blank" rel="noreferrer">
                      <Button variant="ghost">Baixar</Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </ResultCard>
        ) : null}
      </aside>
    </div>
  );
}

export default PdfToImagesPage;
