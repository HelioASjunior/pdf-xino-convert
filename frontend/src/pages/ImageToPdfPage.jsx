import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || 'pt-BR').toLowerCase();
  const ui = lang.startsWith('en')
    ? {
      outputMode: 'Output mode',
      modeSingle: 'Single PDF with all images',
      modeSeparate: 'Separate PDF for each image',
      modeHelp: 'In separate mode, download is provided as a ZIP with one PDF per image.',
      orientation: 'Orientation',
      portrait: 'Portrait',
      landscape: 'Landscape',
      pageSize: 'Page size',
      margin: 'Margin',
      marginSmall: 'Small (16 pt)',
      marginMedium: 'Medium (24 pt)',
      marginLarge: 'Large (32 pt)',
      fit: 'Image fit',
      fitContain: 'Contain',
      fitCover: 'Cover',
      fitStretch: 'Stretch',
      compression: 'Image compression',
      on: 'Enabled',
      off: 'Disabled',
      compressionHelp: 'Reduces image size before creating the PDF.',
      clearFiles: 'Clear files',
      orderHint: 'Review file order in the floating window before generating the final document.',
      resultSingleButton: 'Download final PDF',
      resultZipButton: 'Download ZIP with PDFs',
      failedMsg: '{{count}} image(s) required a different treatment and were not completed in this step.',
      orderTitle: 'Organize images before generating PDF',
      orderDesc: 'The first image in the list becomes the first page of the final PDF.',
      hide: 'Hide individual files',
      show: 'Download individual files',
    }
    : lang.startsWith('es')
      ? {
        outputMode: 'Modo de salida',
        modeSingle: 'PDF único con todas las imágenes',
        modeSeparate: 'PDF separado para cada imagen',
        modeHelp: 'En modo separado, la descarga se entrega en ZIP con un PDF por imagen.',
        orientation: 'Orientación',
        portrait: 'Retrato',
        landscape: 'Horizontal',
        pageSize: 'Tamaño de página',
        margin: 'Margen',
        marginSmall: 'Pequeño (16 pt)',
        marginMedium: 'Medio (24 pt)',
        marginLarge: 'Grande (32 pt)',
        fit: 'Ajuste de imagen',
        fitContain: 'Contener',
        fitCover: 'Cubrir',
        fitStretch: 'Estirar',
        compression: 'Compresión de imagen',
        on: 'Activada',
        off: 'Desactivada',
        compressionHelp: 'Reduce el tamaño de las imágenes antes de generar el PDF.',
        clearFiles: 'Limpiar archivos',
        orderHint: 'Revise el orden de los archivos en la ventana flotante antes de generar el documento final.',
        resultSingleButton: 'Descargar PDF final',
        resultZipButton: 'Descargar ZIP con PDFs',
        failedMsg: '{{count}} imagen(es) requirieron un tratamiento diferente y no se completaron en esta etapa.',
        orderTitle: 'Organizar imágenes antes de generar PDF',
        orderDesc: 'La primera imagen de la lista se convierte en la primera página del PDF final.',
        hide: 'Ocultar archivos individuales',
        show: 'Descargar archivos individuales',
      }
      : lang.startsWith('fr')
        ? {
          outputMode: 'Mode de sortie',
          modeSingle: 'PDF unique avec toutes les images',
          modeSeparate: 'PDF séparé pour chaque image',
          modeHelp: 'En mode séparé, le téléchargement est fourni en ZIP avec un PDF par image.',
          orientation: 'Orientation',
          portrait: 'Portrait',
          landscape: 'Paysage',
          pageSize: 'Taille de page',
          margin: 'Marge',
          marginSmall: 'Petite (16 pt)',
          marginMedium: 'Moyenne (24 pt)',
          marginLarge: 'Grande (32 pt)',
          fit: 'Ajustement de l\'image',
          fitContain: 'Contenir',
          fitCover: 'Couvrir',
          fitStretch: 'Étirer',
          compression: 'Compression d\'image',
          on: 'Activée',
          off: 'Désactivée',
          compressionHelp: 'Réduit la taille des images avant de générer le PDF.',
          clearFiles: 'Effacer les fichiers',
          orderHint: 'Vérifiez l\'ordre des fichiers dans la fenêtre flottante avant de générer le document final.',
          resultSingleButton: 'Télécharger le PDF final',
          resultZipButton: 'Télécharger ZIP avec PDFs',
          failedMsg: '{{count}} image(s) ont nécessité un traitement différent et n\'ont pas été finalisées à cette étape.',
          orderTitle: 'Organiser les images avant de générer le PDF',
          orderDesc: 'La première image de la liste devient la première page du PDF final.',
          hide: 'Masquer les fichiers individuels',
          show: 'Télécharger les fichiers individuels',
        }
        : {
          outputMode: 'Modo de saída',
          modeSingle: 'PDF único com todas as imagens',
          modeSeparate: 'PDF separado para cada imagem',
          modeHelp: 'No modo separado, o download sai em ZIP com um PDF por imagem.',
          orientation: 'Orientação',
          portrait: 'Retrato',
          landscape: 'Paisagem',
          pageSize: 'Tamanho da página',
          margin: 'Margem',
          marginSmall: 'Pequena (16 pt)',
          marginMedium: 'Média (24 pt)',
          marginLarge: 'Grande (32 pt)',
          fit: 'Ajuste da imagem',
          fitContain: 'Conter',
          fitCover: 'Cobrir',
          fitStretch: 'Esticar',
          compression: 'Compactação de imagem',
          on: 'Ativada',
          off: 'Desativada',
          compressionHelp: 'Reduz o peso das imagens antes de gerar o PDF.',
          clearFiles: 'Limpar arquivos',
          orderHint: 'Revise a ordem dos arquivos na janela flutuante antes de gerar o documento final.',
          resultSingleButton: 'Baixar PDF final',
          resultZipButton: 'Baixar ZIP com PDFs',
          failedMsg: '{{count}} imagem(ns) exigiram tratamento diferente e não foram concluídas nesta etapa.',
          orderTitle: 'Organizar imagens antes de gerar PDF',
          orderDesc: 'A primeira imagem da lista vira a primeira pagina do PDF final.',
          hide: 'Ocultar arquivos individuais',
          show: 'Baixar arquivos individuais',
        };
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
      setError(t('imageTools.uploadHint'));
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
        showToast({ type: 'success', title: t('pdfTools.processComplete'), message: `${bundle.files.length} PDF(s)` });
        addEntry({ tool: t('imageTools.categoryTools.imageToPdf.title'), summary: `${bundle.files.length} PDF(s)` });
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
        showToast({ type: 'success', title: t('pdfTools.processComplete'), message: t('imageTools.categoryTools.imageToPdf.description') });
        addEntry({ tool: t('imageTools.categoryTools.imageToPdf.title'), summary: `${items.length} ${fileName}` });
      }
    } catch (requestError) {
      const message = requestError.message || t('pdfTools.processError');
      setError(message);
      showToast({ type: 'error', title: t('pdfTools.fileError'), message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-6">
        <UploadArea
          title={t('imageTools.uploadLabel')}
          description={t('imageTools.categoryTools.imageToPdf.description')}
          accept="image/*,.heic,.heif"
          multiple
          onFilesSelected={handleFilesSelected}
          error={error}
        />

        {items.length ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{t('imageTools.uploadLabel')}</p>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setOrderModalOpen(true)}>
                  <MoveVertical className="mr-1 h-4 w-4" />
                  {t('pdfTools.orderModal')}
                </Button>
                <Button variant="ghost" onClick={clearAll}>{ui.clearFiles}</Button>
              </div>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <FilePreview key={item.id} item={item} onRemove={removeItem} />
              ))}
            </div>

            {items.length > 1 && !orderConfirmed ? (
              <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
                {ui.orderHint}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-400">{t('imageTools.categoryTools.imageToPdf.title')}</p>
          <h1 className="section-title">{t('Ferramenta de Conversão de Imagens para PDF')}</h1>
          <p className="section-copy">{t('imageTools.categoryTools.imageToPdf.description')}</p>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="glass-panel space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900 p-3 text-white">
              <Images className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{t('pdfTools.selectOperation')}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('imageTools.categoryTools.imageToPdf.description')}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label={ui.outputMode}
              value={options.outputMode}
              onChange={(event) => setOptions((current) => ({ ...current, outputMode: event.target.value }))}
              options={[
                { label: ui.modeSingle, value: 'single' },
                { label: ui.modeSeparate, value: 'separate' },
              ]}
              helperText={ui.modeHelp}
            />
            <SelectField
              label={ui.orientation}
              value={options.orientation}
              onChange={(event) => setOptions((current) => ({ ...current, orientation: event.target.value }))}
              options={[
                { label: ui.portrait, value: 'portrait' },
                { label: ui.landscape, value: 'landscape' },
              ]}
            />
            <SelectField
              label={ui.pageSize}
              value={options.pageSize}
              onChange={(event) => setOptions((current) => ({ ...current, pageSize: event.target.value }))}
              options={[
                { label: 'A4', value: 'A4' },
                { label: 'Letter', value: 'Letter' },
                { label: 'Legal', value: 'Legal' },
              ]}
            />
            <SelectField
              label={ui.margin}
              value={options.margin}
              onChange={(event) => setOptions((current) => ({ ...current, margin: event.target.value }))}
              options={[
                { label: ui.marginSmall, value: '16' },
                { label: ui.marginMedium, value: '24' },
                { label: ui.marginLarge, value: '32' },
              ]}
            />
            <SelectField
              label={ui.fit}
              value={options.imageFit}
              onChange={(event) => setOptions((current) => ({ ...current, imageFit: event.target.value }))}
              options={[
                { label: ui.fitContain, value: 'contain' },
                { label: ui.fitCover, value: 'cover' },
                { label: ui.fitStretch, value: 'stretch' },
              ]}
            />
            <SelectField
              label={ui.compression}
              value={options.compressImages}
              onChange={(event) => setOptions((current) => ({ ...current, compressImages: event.target.value }))}
              options={[
                { label: ui.on, value: 'true' },
                { label: ui.off, value: 'false' },
              ]}
              helperText={ui.compressionHelp}
            />
          </div>

          {isLoading ? <LoadingSpinner label={t('pdfTools.processComplete')} /> : null}
          {progress > 0 && isLoading ? (
            <ProgressBar
              value={progress}
              label={options.outputMode === 'separate' ? t('pdfTools.processComplete') : t('imageTools.categoryTools.imageToPdf.actionLabel')}
            />
          ) : null}

          <Button className="w-full gap-2" onClick={handleSubmit} disabled={isLoading || !items.length}>
            <FileDown className="h-4 w-4" />
            {options.outputMode === 'separate' ? t('audioTools.downloadZip') : t('imageTools.categoryTools.imageToPdf.actionLabel')}
          </Button>
        </div>

        {result ? (
          <ResultCard
            title={result.kind === 'separate' ? t('pdfTools.processComplete') : t('pdfTools.processComplete')}
            description={result.kind === 'separate'
              ? `${result.generatedCount} PDF(s)`
              : t('imageTools.categoryTools.imageToPdf.description')}
            tone="success"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href={result.url} download={result.fileName}>
                <Button>{result.kind === 'separate' ? ui.resultZipButton : ui.resultSingleButton}</Button>
              </a>
            </div>
            {result.failed?.length ? (
              <div className="mt-4 text-sm text-amber-700 dark:text-amber-300">
                {ui.failedMsg.replace('{{count}}', String(result.failed.length))}
              </div>
            ) : null}
          </ResultCard>
        ) : null}
      </aside>

      <FileOrderModal
        open={orderModalOpen}
        items={items}
        title={ui.orderTitle}
        description={ui.orderDesc}
        onClose={() => setOrderModalOpen(false)}
        onConfirm={applyOrderedItems}
      />
    </div>
  );
}

export default ImageToPdfPage;
