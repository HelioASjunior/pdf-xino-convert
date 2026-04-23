import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileArchive, Scissors, Trash2, RotateCw, Files, Layers3, ShieldCheck, TimerReset, Crop, Shrink, MoveVertical, FileText, Image } from 'lucide-react';
import UploadArea from '../components/UploadArea';
import FilePreview from '../components/FilePreview';
import FileOrderModal from '../components/FileOrderModal';
import SelectField from '../components/SelectField';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import HubFeatureGrid from '../components/HubFeatureGrid';
import TrustSection from '../components/TrustSection';
import PdfCropEditorModal from '../components/PdfCropEditorModal';
import { useToast } from '../hooks/useToast.jsx';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { formatPercent } from '../utils/formatters';
import { MAX_PDF_SIZE, validateFiles } from '../utils/fileValidation';
import { createPdfPreviewUrl } from '../utils/pdfPreview';
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

function PdfToolsPage() {
  const { showToast } = useToast();
  const { addEntry } = useSessionHistory();
  const { t } = useTranslation();

  const [files, setFiles] = useState([]);
  const [operation, setOperation] = useState('merge');
  const [range, setRange] = useState('');
  const [angle, setAngle] = useState('90');
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [cropEditorOpen, setCropEditorOpen] = useState(false);
  const [cropConfig, setCropConfig] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [showIndividual, setShowIndividual] = useState(false);
  const filesRef = useRef([]);
  const resultRef = useRef(null);
  const workbenchRef = useRef(null);

  const pdfHubItems = [
    {
      title: t('pdfTools.merge.title'),
      description: t('pdfTools.merge.description'),
      icon: Files,
      badge: t('pdfTools.merge.badge'),
      actionLabel: t('pdfTools.merge.actionLabel'),
      accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
      onClick: () => {},
      className: 'hover:-translate-y-0',
    },
    {
      title: t('pdfTools.split.title'),
      description: t('pdfTools.split.description'),
      icon: Scissors,
      actionLabel: t('pdfTools.split.actionLabel'),
      accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
      onClick: () => {},
      className: 'hover:-translate-y-0',
    },
    {
      title: t('pdfTools.rotate.title'),
      description: t('pdfTools.rotate.description'),
      icon: RotateCw,
      actionLabel: t('pdfTools.rotate.actionLabel'),
      accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
      onClick: () => {},
      className: 'hover:-translate-y-0',
    },
    {
      title: t('pdfTools.removeExtract.title'),
      description: t('pdfTools.removeExtract.description'),
      icon: Trash2,
      actionLabel: t('pdfTools.removeExtract.actionLabel'),
      accent: 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
      onClick: () => {},
      className: 'hover:-translate-y-0',
    },
    {
      title: t('pdfTools.crop.title'),
      description: t('pdfTools.crop.description'),
      icon: Crop,
      actionLabel: t('pdfTools.crop.actionLabel'),
      accent: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300',
      onClick: () => {},
      className: 'hover:-translate-y-0',
    },
    {
      title: t('pdfTools.compress.title'),
      description: t('pdfTools.compress.description'),
      icon: Shrink,
      actionLabel: t('pdfTools.compress.actionLabel'),
      accent: 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100',
      onClick: () => {},
      className: 'hover:-translate-y-0',
    },
    {
      title: t('pdfTools.pdfToWord.title'),
      description: t('pdfTools.pdfToWord.description'),
      icon: FileText,
      badge: t('pdfTools.pdfToWord.badge'),
      actionLabel: t('pdfTools.pdfToWord.actionLabel'),
      accent: 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
      href: '/pdf-para-word',
    },
    {
      title: t('pdfTools.pdfToImages.title'),
      description: t('pdfTools.pdfToImages.description'),
      icon: Image,
      badge: t('pdfTools.pdfToImages.badge'),
      actionLabel: t('pdfTools.pdfToImages.actionLabel'),
      accent: 'bg-violet-50 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300',
      href: '/pdf-para-imagens',
    },
  ];

  const pdfTrustItems = [
    {
      title: t('pdfTools.trust.directFlow.title'),
      description: t('pdfTools.trust.directFlow.description'),
      icon: Layers3,
      accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
    },
    {
      title: t('pdfTools.trust.preciseAdjust.title'),
      description: t('pdfTools.trust.preciseAdjust.description'),
      icon: ShieldCheck,
      accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
    },
    {
      title: t('pdfTools.trust.fastDelivery.title'),
      description: t('pdfTools.trust.fastDelivery.description'),
      icon: TimerReset,
      accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
  ];

  const pdfOperations = pdfHubItems.map((item) => ({
    ...item,
    current:
      (item.title === t('pdfTools.merge.title') && operation === 'merge')
      || (item.title === t('pdfTools.split.title') && operation === 'split')
      || (item.title === t('pdfTools.rotate.title') && operation === 'rotate')
      || (item.title === t('pdfTools.removeExtract.title') && (operation === 'remove' || operation === 'extract'))
      || (item.title === t('pdfTools.crop.title') && operation === 'crop')
      || (item.title === t('pdfTools.compress.title') && operation === 'compress'),
    onClick: () => {
      const mergeTitle = t('pdfTools.merge.title');
      const splitTitle = t('pdfTools.split.title');
      const rotateTitle = t('pdfTools.rotate.title');
      const removeTitle = t('pdfTools.removeExtract.title');
      const cropTitle = t('pdfTools.crop.title');
      const compressTitle = t('pdfTools.compress.title');

      if (item.title === mergeTitle) setOperation('merge');
      if (item.title === splitTitle) setOperation('split');
      if (item.title === rotateTitle) setOperation('rotate');
      if (item.title === removeTitle) setOperation('remove');
      if (item.title === cropTitle) setOperation('crop');
      if (item.title === compressTitle) setOperation('compress');
      workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  }));

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => () => {
    filesRef.current.forEach((item) => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });
    if (resultRef.current?.url) {
      URL.revokeObjectURL(resultRef.current.url);
    }
    resultRef.current?.individualFiles?.forEach((f) => URL.revokeObjectURL(f.url));
  }, []);

  const clearResult = () => {
    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }
    result?.individualFiles?.forEach((f) => URL.revokeObjectURL(f.url));
    setResult(null);
    setShowIndividual(false);
  };

  const handleFilesSelected = async (selectedFiles) => {
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
    setOrderConfirmed(false);

    const preparedFiles = await Promise.all(
      selectedFiles.map(async (file) => {
        let preview = null;

        try {
          preview = await createPdfPreviewUrl(file);
        } catch {
          preview = null;
        }

        return {
          id: crypto.randomUUID(),
          file,
          kind: 'pdf',
          preview,
        };
      }),
    );

    setFiles((current) => [
      ...current,
      ...preparedFiles,
    ]);
  };

  const removeFile = (id) => {
    setFiles((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }

      return current.filter((item) => item.id !== id);
    });
    setOrderConfirmed(false);
  };

  const applyOrderedFiles = (orderedFiles) => {
    setFiles(orderedFiles);
    setOrderConfirmed(true);
    setOrderModalOpen(false);
  };

  const runOperation = async () => {
    if (!files.length) {
      setError(t('pdfTools.emptyFiles'));
      return;
    }

    if (operation === 'merge' && files.length < 2) {
      setError(t('pdfTools.minFiles'));
      return;
    }

    if (operation === 'merge' && files.length > 1 && !orderConfirmed) {
      setOrderModalOpen(true);
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

      const fileProgress = (i) => (v) => setProgress(Math.round((i * 100 + v) / files.length));

      let output;

      if (operation === 'merge') {
        const blob = await mergePdfFiles(files.map((item) => item.file), (value) => setProgress(value));
        output = {
          mode: 'single',
          blob,
          fileName: `${t('pdfTools.merge.successFile')}-${Date.now()}.pdf`,
          description: t('pdfTools.merge.successMsg', { count: files.length }),
        };
      }

      if (operation === 'split') {
        const allParts = [];
        for (let i = 0; i < files.length; i++) {
          const parts = await splitPdf(files[i].file, range, fileProgress(i));
          allParts.push(...parts);
        }
        const zip = await zipDownloadItems(allParts, `${t('pdfTools.split.successFile')}-${Date.now()}.zip`);
        output = {
          mode: 'multiple',
          blob: zip.zipBlob,
          fileName: zip.zipName,
          description: t('pdfTools.split.successMsg', { count: allParts.length }),
          individualFiles: allParts.map((p) => ({ name: p.name, url: URL.createObjectURL(p.blob) })),
        };
      }

      if (operation === 'rotate') {
        const parts = [];
        for (let i = 0; i < files.length; i++) {
          const blob = await rotatePdf(files[i].file, Number(angle), range, fileProgress(i));
          parts.push({ name: `${files[i].file.name.replace(/\.[^/.]+$/, '')}-rotacionado.pdf`, blob });
        }
        if (parts.length === 1) {
          output = { mode: 'single', blob: parts[0].blob, fileName: parts[0].name, description: t('pdfTools.rotate.successMsg2') };
        } else {
          const zip = await zipDownloadItems(parts, `${t('pdfTools.rotate.successFile')}-${Date.now()}.zip`);
          output = {
            mode: 'multiple',
            blob: zip.zipBlob,
            fileName: zip.zipName,
            description: t('pdfTools.rotate.successMsg', { count: parts.length }),
            individualFiles: parts.map((p) => ({ name: p.name, url: URL.createObjectURL(p.blob) })),
          };
        }
      }

      if (operation === 'remove') {
        const parts = [];
        for (let i = 0; i < files.length; i++) {
          const blob = await removePdfPages(files[i].file, range, fileProgress(i));
          parts.push({ name: `${files[i].file.name.replace(/\.[^/.]+$/, '')}-sem-paginas.pdf`, blob });
        }
        if (parts.length === 1) {
          output = { mode: 'single', blob: parts[0].blob, fileName: parts[0].name, description: t('pdfTools.removeExtract.removedMsg') };
        } else {
          const zip = await zipDownloadItems(parts, `${t('pdfTools.removeExtract.successFile')}-${Date.now()}.zip`);
          output = {
            mode: 'multiple',
            blob: zip.zipBlob,
            fileName: zip.zipName,
            description: t('pdfTools.removeExtract.successMsg', { count: parts.length }),
            individualFiles: parts.map((p) => ({ name: p.name, url: URL.createObjectURL(p.blob) })),
          };
        }
      }

      if (operation === 'extract') {
        const parts = [];
        for (let i = 0; i < files.length; i++) {
          const blob = await extractPdfPages(files[i].file, range, fileProgress(i));
          parts.push({ name: `${files[i].file.name.replace(/\.[^/.]+$/, '')}-extraido.pdf`, blob });
        }
        if (parts.length === 1) {
          output = { mode: 'single', blob: parts[0].blob, fileName: parts[0].name, description: t('pdfTools.removeExtract.extractedMsg') };
        } else {
          const zip = await zipDownloadItems(parts, `${t('pdfTools.removeExtract.extractedFile')}-${Date.now()}.zip`);
          output = {
            mode: 'multiple',
            blob: zip.zipBlob,
            fileName: zip.zipName,
            description: t('pdfTools.removeExtract.extractedCountMsg', { count: parts.length }),
            individualFiles: parts.map((p) => ({ name: p.name, url: URL.createObjectURL(p.blob) })),
          };
        }
      }

      if (operation === 'compress') {
        const parts = [];
        for (let i = 0; i < files.length; i++) {
          const compression = await compressPdfInBrowser(files[i].file, {
            level: compressionLevel,
            onProgress: fileProgress(i),
          });
          parts.push({
            name: `${files[i].file.name.replace(/\.[^/.]+$/, '')}-comprimido.pdf`,
            blob: compression.blob,
            wasReduced: compression.wasReduced,
            reductionPercent: compression.reductionPercent,
          });
        }
        if (parts.length === 1) {
          output = {
            mode: 'single',
            blob: parts[0].blob,
            fileName: parts[0].name,
            description: parts[0].wasReduced
              ? t('pdfTools.compress.successMsg', { percent: formatPercent(parts[0].reductionPercent) })
              : t('pdfTools.compress.noReductionMsg'),
          };
        } else {
          const reduced = parts.filter((p) => p.wasReduced).length;
          const zip = await zipDownloadItems(
            parts.map((p) => ({ name: p.name, blob: p.blob })),
            `${t('pdfTools.compress.successFile')}-${Date.now()}.zip`,
          );
          output = {
            mode: 'multiple',
            blob: zip.zipBlob,
            fileName: zip.zipName,
            description: t('pdfTools.compress.multiMsg', { count: parts.length, reduced }),
            individualFiles: parts.map((p) => ({ name: p.name, url: URL.createObjectURL(p.blob) })),
          };
        }
      }

      const url = URL.createObjectURL(output.blob);
      setResult({ url, ...output });

      addEntry({ tool: 'Ferramentas de PDF', summary: `${operation} executado em ${files.length} arquivo(s)` });
      showToast({ type: 'success', title: t('pdfTools.processComplete'), message: output.description });
    } catch (processingError) {
      const message = processingError.message || t('pdfTools.processError');
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
          ? t('pdfTools.crop.appliedAll')
          : t('pdfTools.crop.appliedPage', { page: config.currentPage }),
      };

      const url = URL.createObjectURL(output.blob);
      setResult({ url, ...output });

      addEntry({ tool: 'Ferramentas de PDF', summary: `crop executado em ${files[0].file.name}` });
      showToast({ type: 'success', title: t('pdfTools.crop.successMsg'), message: output.description });
    } catch (processingError) {
      const message = processingError.message || t('pdfTools.crop.errorMsg');
      setError(message);
      showToast({ type: 'error', title: 'Erro ao recortar arquivo', message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <HubFeatureGrid
        title={t('pdfTools.selectOperation')}
        description={t('pdfTools.operationHint')}
        items={pdfOperations}
      />

      <div ref={workbenchRef} className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6">
          <UploadArea
            title={t('pdfTools.uploadLabel')}
            description={t('pdfTools.uploadHint')}
            accept="application/pdf"
            multiple
            onFilesSelected={handleFilesSelected}
            error={error}
            mode="pdf"
          />

          {files.length ? (
            <div className="space-y-3">
              {(operation === 'merge' && files.length > 1) ? (
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">{t('pdfTools.orderModal')}</p>
                  <Button variant="ghost" onClick={() => setOrderModalOpen(true)}>
                    <MoveVertical className="mr-1 h-4 w-4" />
                    {t('pdfTools.orderButton')}
                  </Button>
                </div>
              ) : null}

              {(operation === 'merge' && files.length > 1 && !orderConfirmed) ? (
                <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
                  Confirme a ordem dos PDFs no organizador antes de executar a uniao.
                </p>
              ) : null}

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

            {(operation === 'merge' && files.length > 1 && !orderConfirmed) ? (
              <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
                Para unir PDFs, a organizacao da ordem e obrigatoria. Clique em "{t('pdfTools.orderButton')}" e confirme para habilitar a execucao.
              </p>
            ) : null}

            {isLoading ? <LoadingSpinner label="Processando arquivo..." /> : null}
            {isLoading ? <ProgressBar value={progress} label="Executando operação" /> : null}

            <Button
              className="w-full gap-2"
              onClick={runOperation}
              disabled={isLoading || !files.length || (operation === 'merge' && files.length > 1 && !orderConfirmed)}
            >
              {operation === 'split' ? <Scissors className="h-4 w-4" /> : null}
              {operation === 'remove' ? <Trash2 className="h-4 w-4" /> : null}
              {operation === 'rotate' ? <RotateCw className="h-4 w-4" /> : null}
              {operation === 'crop' ? <Crop className="h-4 w-4" /> : null}
              {operation === 'compress' ? <Shrink className="h-4 w-4" /> : null}
              {(operation === 'merge' || operation === 'extract') ? <Files className="h-4 w-4" /> : null}
              {(operation === 'merge' && files.length > 1 && !orderConfirmed) ? 'Organize a ordem para continuar' : 'Executar ferramenta'}
            </Button>
          </div>

          {result ? (
            <ResultCard title="Arquivo pronto" description={result.description} tone="success">
              <div className="space-y-3">
                {result.mode === 'multiple' ? (
                  <>
                    <a href={result.url} download={result.fileName} className="block">
                      <Button className="w-full gap-2">
                        <Download className="h-4 w-4" />
                        Baixar como ZIP
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => setShowIndividual((v) => !v)}
                    >
                      {showIndividual ? 'Ocultar arquivos individuais' : 'Baixar arquivos individuais'}
                    </Button>
                    {showIndividual ? (
                      <div className="space-y-2">
                        {result.individualFiles.map((f) => (
                          <a key={f.name} href={f.url} download={f.name} className="block">
                            <Button variant="ghost" className="w-full gap-2">
                              <Download className="h-3 w-3 shrink-0" />
                              <span className="truncate">{f.name}</span>
                            </Button>
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <a href={result.url} download={result.fileName} className="block">
                    <Button className="w-full gap-2">
                      <Download className="h-4 w-4" />
                      Baixar resultado
                    </Button>
                  </a>
                )}
              </div>
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

      <PdfCropEditorModal
        open={cropEditorOpen}
        file={files[0]?.file || null}
        initialConfig={cropConfig}
        onClose={() => setCropEditorOpen(false)}
        onApply={runCropOperation}
      />

      <FileOrderModal
        open={orderModalOpen}
        items={files}
        title={t('pdfTools.orderModal')}
        description={t('pdfTools.orderHint')}
        onClose={() => setOrderModalOpen(false)}
        onConfirm={applyOrderedFiles}
      />
    </div>
  );
}

export default PdfToolsPage;
