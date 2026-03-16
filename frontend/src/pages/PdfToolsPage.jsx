import { useEffect, useRef, useState } from 'react';
import { FileArchive, Scissors, Trash2, RotateCw, Files, Layers3, ShieldCheck, TimerReset, Crop, Shrink } from 'lucide-react';
import UploadArea from '../components/UploadArea';
import FilePreview from '../components/FilePreview';
import SelectField from '../components/SelectField';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import HubFeatureGrid from '../components/HubFeatureGrid';
import TrustSection from '../components/TrustSection';
import FaqSection from '../components/FaqSection';
import PdfCropEditorModal from '../components/PdfCropEditorModal';
import { useToast } from '../hooks/useToast.jsx';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { downloadBlob, formatPercent } from '../utils/formatters';
import { MAX_PDF_SIZE, validateFiles } from '../utils/fileValidation';
import { compressPdfInBrowser } from '../services/clientPdfTools';
import {
  cropPdfPages,
  extractPdfPages,
  mergePdfFiles,
  removePdfPages,
  rotatePdf,
  splitPdf,
  zipDownloadItems,
} from '../services/pdfToolkitService';

const pdfHubItems = [
  {
    title: 'Juntar PDF',
    description: 'Reúna contratos, relatórios e anexos em um único arquivo final.',
    icon: Files,
    badge: 'Mais usado',
    actionLabel: 'Abrir fluxo',
    accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
    onClick: () => {},
    className: 'hover:-translate-y-0',
  },
  {
    title: 'Dividir páginas',
    description: 'Separe capítulos, recibos ou páginas específicas com exportação em ZIP.',
    icon: Scissors,
    actionLabel: 'Preparar recorte',
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
    onClick: () => {},
    className: 'hover:-translate-y-0',
  },
  {
    title: 'Rotacionar e corrigir',
    description: 'Ajuste a orientação de páginas digitalizadas sem retrabalho manual.',
    icon: RotateCw,
    actionLabel: 'Corrigir páginas',
    accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
    onClick: () => {},
    className: 'hover:-translate-y-0',
  },
  {
    title: 'Remover ou extrair',
    description: 'Monte uma versão enxuta do arquivo retirando ou reaproveitando páginas.',
    icon: Trash2,
    actionLabel: 'Ajustar conteúdo',
    accent: 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
    onClick: () => {},
    className: 'hover:-translate-y-0',
  },
  {
    title: 'Recortar PDF',
    description: 'Selecione somente as páginas que deseja manter e gere um novo PDF limpo.',
    icon: Crop,
    actionLabel: 'Definir recorte',
    accent: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300',
    onClick: () => {},
    className: 'hover:-translate-y-0',
  },
  {
    title: 'Comprimir PDF',
    description: 'Reduza o tamanho do arquivo com níveis claros para compartilhar e armazenar melhor.',
    icon: Shrink,
    actionLabel: 'Compactar arquivo',
    accent: 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100',
    onClick: () => {},
    className: 'hover:-translate-y-0',
  },
];

const pdfTrustItems = [
  {
    title: 'Fluxo direto',
    description: 'Você envia os PDFs, escolhe a ação e baixa o resultado sem etapas desnecessárias.',
    icon: Layers3,
    accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
  },
  {
    title: 'Ajuste preciso',
    description: 'Campos de intervalo permitem trabalhar só nas páginas relevantes de cada documento.',
    icon: ShieldCheck,
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
  },
  {
    title: 'Entrega rápida',
    description: 'O painel lateral concentra configuração, progresso e download para reduzir o tempo de operação.',
    icon: TimerReset,
    accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
];

const pdfFaqItems = [
  {
    question: 'Posso juntar vários PDFs de uma vez?',
    answer: 'Sim. A opção de juntar PDF aceita múltiplos arquivos e gera um único documento consolidado ao final.',
  },
  {
    question: 'Como informar páginas específicas?',
    answer: 'Use formatos como 1,3-5 para trabalhar com páginas isoladas e intervalos no mesmo campo.',
  },
  {
    question: 'A divisão gera vários downloads separados?',
    answer: 'Não. As partes geradas são agrupadas em um ZIP para manter o processo mais organizado.',
  },
];

function PdfToolsPage() {
  const { showToast } = useToast();
  const { addEntry } = useSessionHistory();

  const [files, setFiles] = useState([]);
  const [operation, setOperation] = useState('merge');
  const [range, setRange] = useState('');
  const [angle, setAngle] = useState('90');
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [cropEditorOpen, setCropEditorOpen] = useState(false);
  const [cropConfig, setCropConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);
  const workbenchRef = useRef(null);
  const pdfOperations = pdfHubItems.map((item) => ({
    ...item,
    current:
      (item.title === 'Juntar PDF' && operation === 'merge')
      || (item.title === 'Dividir páginas' && operation === 'split')
      || (item.title === 'Rotacionar e corrigir' && operation === 'rotate')
      || (item.title === 'Remover ou extrair' && (operation === 'remove' || operation === 'extract'))
      || (item.title === 'Recortar PDF' && operation === 'crop')
      || (item.title === 'Comprimir PDF' && operation === 'compress'),
    onClick: () => {
      if (item.title === 'Juntar PDF') setOperation('merge');
      if (item.title === 'Dividir páginas') setOperation('split');
      if (item.title === 'Rotacionar e corrigir') setOperation('rotate');
      if (item.title === 'Remover ou extrair') setOperation('remove');
      if (item.title === 'Recortar PDF') setOperation('crop');
      if (item.title === 'Comprimir PDF') setOperation('compress');
      workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  }));

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

    if (operation === 'crop') {
      setCropEditorOpen(true);
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

      if (operation === 'compress') {
        const compression = await compressPdfInBrowser(files[0].file, {
          level: compressionLevel,
          onProgress: (value) => setProgress(value),
        });

        output = {
          blob: compression.blob,
          fileName: `${files[0].file.name.replace(/\.[^/.]+$/, '')}-comprimido.pdf`,
          description: compression.wasReduced
            ? `Compressão concluída com redução de ${formatPercent(compression.reductionPercent)}.`
            : 'Compressão concluída. O PDF já estava otimizado e não houve redução relevante.',
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

  const runCropOperation = async (config) => {
    if (!files.length) return;

    setCropConfig(config);
    setCropEditorOpen(false);
    setIsLoading(true);
    setProgress(0);
    setError('');

    try {
      clearResult();
      const blob = await cropPdfPages(files[0].file, config, (value) => setProgress(value));
      const output = {
        blob,
        fileName: `${files[0].file.name.replace(/\.[^/.]+$/, '')}-recortado.pdf`,
        description: config.applyMode === 'all'
          ? 'Área de recorte aplicada em todas as páginas.'
          : `Área de recorte aplicada na página ${config.currentPage}.`,
      };

      const url = downloadBlob(output.blob, output.fileName);
      setResult({ url, ...output });

      addEntry({ tool: 'Ferramentas de PDF', summary: `crop executado em ${files[0].file.name}` });
      showToast({ type: 'success', title: 'Recorte concluído', message: output.description });
    } catch (processingError) {
      const message = processingError.message || 'Erro ao recortar PDF.';
      setError(message);
      showToast({ type: 'error', title: 'Erro ao recortar arquivo', message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <HubFeatureGrid
        title="Escolha o tipo de operação"
        description="Cada cartão abaixo ajusta automaticamente a ferramenta principal no painel de execução."
        items={pdfOperations}
      />

      <div ref={workbenchRef} className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6">
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
                <p className="text-sm text-slate-500 dark:text-slate-400">Selecione a ação e defina os ajustes do arquivo.</p>
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
                { value: 'crop', label: 'Recortar PDF' },
                { value: 'extract', label: 'Extrair páginas' },
                { value: 'compress', label: 'Comprimir PDF' },
              ]}
              helperText="Alterne a operação sem sair da página."
            />

            {operation === 'compress' ? (
              <SelectField
                label="Nível de compressão"
                value={compressionLevel}
                onChange={(event) => setCompressionLevel(event.target.value)}
                options={[
                  { value: 'low', label: 'Baixa' },
                  { value: 'medium', label: 'Média' },
                  { value: 'high', label: 'Alta' },
                ]}
                helperText="Níveis mais altos reduzem mais o arquivo, com maior perda visual."
              />
            ) : null}

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

            {(operation !== 'merge' && operation !== 'crop') ? (
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

            {operation === 'crop' ? (
              <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                O recorte visual abre uma nova janela para selecionar a área, escolher entre todas as páginas ou página atual e redefinir tudo quando necessário.
              </p>
            ) : null}

            {isLoading ? <LoadingSpinner label="Processando arquivo..." /> : null}
            {isLoading ? <ProgressBar value={progress} label="Executando operação" /> : null}

            <Button className="w-full gap-2" onClick={runOperation} disabled={isLoading || !files.length}>
              {operation === 'split' ? <Scissors className="h-4 w-4" /> : null}
              {operation === 'remove' ? <Trash2 className="h-4 w-4" /> : null}
              {operation === 'rotate' ? <RotateCw className="h-4 w-4" /> : null}
              {operation === 'crop' ? <Crop className="h-4 w-4" /> : null}
              {operation === 'compress' ? <Shrink className="h-4 w-4" /> : null}
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

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="space-y-5">
          <div className="section-intro">
            <p className="section-kicker">Ferramentas de PDF</p>
            <h1 className="section-title">Centralize tarefas de PDF em um fluxo mais claro, rápido e confiável.</h1>
            <p className="section-copy">Junte arquivos, separe páginas, corrija orientação e prepare versões mais enxutas do documento sem sair da mesma área de trabalho.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Operações reunidas</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">7 fluxos</p>
            </div>
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Intervalos flexíveis</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">1,3-5</p>
            </div>
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Entrega final</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">PDF ou ZIP</p>
            </div>
          </div>
        </div>

        <ResultCard
          title="Como esta área funciona"
          description="Escolha a operação, envie seus PDFs e concentre a configuração no painel lateral. O processo foi organizado para reduzir cliques e retrabalho."
          tone="info"
        >
          <div className="space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            <p>Juntar PDF trabalha com vários arquivos no mesmo fluxo.</p>
            <p>Dividir, rotacionar, remover e extrair funcionam sobre um único PDF por vez com controle de páginas.</p>
          </div>
        </ResultCard>
      </section>

      <TrustSection
        title="Por que usar esta central de PDF"
        description="A interface foi estruturada para tarefas recorrentes de escritório, revisão e organização documental."
        items={pdfTrustItems}
      />

      <FaqSection
        description="Respostas rápidas para dúvidas comuns antes de iniciar o processamento."
        items={pdfFaqItems}
      />

      <PdfCropEditorModal
        open={cropEditorOpen}
        file={files[0]?.file || null}
        initialConfig={cropConfig}
        onClose={() => setCropEditorOpen(false)}
        onApply={runCropOperation}
      />
    </div>
  );
}

export default PdfToolsPage;
