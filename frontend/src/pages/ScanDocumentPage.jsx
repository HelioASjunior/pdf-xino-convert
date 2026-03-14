import { useEffect, useMemo, useRef, useState } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Download, FileArchive, RefreshCcw, ScanLine, Settings2, Sparkles, XCircle } from 'lucide-react';
import UploadArea from '../components/UploadArea';
import SelectField from '../components/SelectField';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import ResultCard from '../components/ResultCard';
import ScannerStatusPanel from '../components/ScannerStatusPanel';
import ScannedPageCard from '../components/ScannedPageCard';
import { useToast } from '../hooks/useToast.jsx';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { postCompressPdf, postImageToPdf } from '../services/api';
import { downloadBlob, formatBytes, getFilenameFromHeaders } from '../utils/formatters';
import { MAX_IMAGE_SIZE, validateFiles } from '../utils/fileValidation';
import { createScannerService } from '../scanner/scannerService';
import { buildScannedPages, cropScannedPage, mergeScannedPages, pageToDownloadBlob, revokePageUrls, rotateScannedPage } from '../scanner/utils/scannedPageUtils';
import { buildScanOptionList, defaultScanOptions } from '../scanner/utils/scannerOptions';

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

async function buildPdfFromPages(pages) {
  const formData = new FormData();
  pages.forEach((page) => formData.append('images', page.file));
  formData.append('orientation', 'portrait');
  formData.append('pageSize', 'A4');
  formData.append('margin', '16');
  formData.append('imageFit', 'contain');
  formData.append('compressImages', 'true');
  return postImageToPdf(formData);
}

function ScanDocumentPage() {
  const { showToast } = useToast();
  const { addEntry } = useSessionHistory();

  const [providerMode, setProviderMode] = useState(import.meta.env.VITE_SCANNER_PROVIDER || 'bridge');
  const serviceRef = useRef(createScannerService(providerMode));

  const [statusState, setStatusState] = useState('checking');
  const [statusMessage, setStatusMessage] = useState('Verificando scanner...');
  const [scanProgress, setScanProgress] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [connectedDeviceId, setConnectedDeviceId] = useState('');

  const [scanOptions, setScanOptions] = useState(defaultScanOptions);
  const [pages, setPages] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadUrls, setDownloadUrls] = useState([]);
  const pagesRef = useRef([]);
  const downloadUrlsRef = useRef([]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const selectedDevice = useMemo(() => devices.find((device) => device.id === selectedDeviceId) || null, [devices, selectedDeviceId]);
  const capabilityOptions = useMemo(() => buildScanOptionList(selectedDevice?.capabilities), [selectedDevice]);

  useEffect(() => {
    serviceRef.current = createScannerService(providerMode);
  }, [providerMode]);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  useEffect(() => {
    downloadUrlsRef.current = downloadUrls;
  }, [downloadUrls]);

  useEffect(() => () => {
    revokePageUrls(pagesRef.current);
    downloadUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const runScannerDiscovery = async () => {
    setIsChecking(true);
    setErrorMessage('');
    setStatusState('checking');
    setStatusMessage('Verificando scanner...');

    const availability = await serviceRef.current.checkAvailability();
    if (!availability.available) {
      setDevices([]);
      setConnectedDeviceId('');
      setStatusState('error');
      setStatusMessage(availability.error.message);
      setIsChecking(false);
      return;
    }

    try {
      const foundDevices = await serviceRef.current.listDevices();
      setDevices(foundDevices);

      if (!foundDevices.length) {
        setSelectedDeviceId('');
        setConnectedDeviceId('');
        setStatusState('no_devices');
        setStatusMessage('Nenhum scanner encontrado no computador.');
      } else {
        const firstDeviceId = foundDevices[0].id;
        setSelectedDeviceId((current) => current || firstDeviceId);
        setStatusState('connected');
        setStatusMessage('Scanners detectados. Selecione um dispositivo e conecte.');
      }
    } catch (error) {
      setStatusState('error');
      setStatusMessage(error.message || 'Erro ao listar scanners.');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    runScannerDiscovery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerMode]);

  const connectScanner = async () => {
    if (!selectedDeviceId) {
      setErrorMessage('Selecione um scanner antes de conectar.');
      return;
    }

    try {
      setErrorMessage('');
      await serviceRef.current.connect(selectedDeviceId);
      setConnectedDeviceId(selectedDeviceId);
      setStatusState('connected');
      setStatusMessage('Scanner conectado com sucesso.');
      showToast({ type: 'success', title: 'Scanner conectado', message: 'Dispositivo pronto para digitalizar.' });
    } catch (error) {
      setStatusState('error');
      setStatusMessage(error.message || 'Erro ao conectar com o scanner.');
      showToast({ type: 'error', title: 'Falha de conexao', message: error.message || 'Nao foi possivel conectar.' });
    }
  };

  const startScan = async () => {
    if (!connectedDeviceId) {
      setErrorMessage('Conecte um scanner antes de iniciar a digitalizacao.');
      return;
    }

    setErrorMessage('');
    setIsScanning(true);
    setScanProgress(0);
    setStatusState('scanning');
    setStatusMessage('Digitalizando pagina 1...');

    try {
      const result = await serviceRef.current.scan({
        deviceId: connectedDeviceId,
        colorMode: scanOptions.colorMode,
        dpi: Number(scanOptions.dpi),
        paperSize: scanOptions.paperSize,
        duplex: Boolean(scanOptions.duplex),
        source: scanOptions.source,
        outputFormat: scanOptions.outputFormat,
        pages: Number(scanOptions.pages),
        onProgress: (status) => {
          setScanProgress(status.progress || 0);
          setStatusState('scanning');
          setStatusMessage(status.message || 'Digitalizando pagina...');
        },
      });

      const newPages = buildScannedPages(result);
      setPages((current) => mergeScannedPages(current, newPages));
      setScanProgress(100);
      setStatusState('done');
      setStatusMessage('Digitalizacao concluida.');
      addEntry({ tool: 'Escanear documento', summary: `${newPages.length} pagina(s) adicionada(s)` });
      showToast({ type: 'success', title: 'Digitalizacao concluida', message: `${newPages.length} pagina(s) adicionada(s).` });
    } catch (error) {
      setStatusState('error');
      setStatusMessage(error.message || 'Erro ao acessar o scanner.');
      showToast({ type: 'error', title: 'Falha na digitalizacao', message: error.message || 'Nao foi possivel digitalizar.' });
    } finally {
      setIsScanning(false);
    }
  };

  const cancelScan = async () => {
    try {
      await serviceRef.current.cancel();
      setStatusState('error');
      setStatusMessage('Digitalizacao cancelada pelo usuario.');
      setScanProgress(0);
      setIsScanning(false);
    } catch (error) {
      showToast({ type: 'error', title: 'Falha ao cancelar', message: error.message || 'Nao foi possivel cancelar.' });
    }
  };

  const addManualFiles = (files) => {
    const validationError = validateFiles(files, {
      mimeTypes: imageMimeTypes,
      maxSize: MAX_IMAGE_SIZE,
      multiple: true,
    });

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      const mappedPages = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        rotation: 0,
        cropApplied: false,
      }));

      setPages((current) => mergeScannedPages(current, mappedPages));
      setErrorMessage('');
      showToast({ type: 'info', title: 'Fallback manual ativo', message: `${mappedPages.length} arquivo(s) carregado(s).` });
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const removePage = (pageId) => {
    setPages((current) => {
      const target = current.find((page) => page.id === pageId);
      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }
      return current.filter((page) => page.id !== pageId);
    });
  };

  const rotatePage = async (pageId) => {
    const target = pages.find((page) => page.id === pageId);
    if (!target) {
      return;
    }

    try {
      const transformed = await rotateScannedPage(target, 90);
      setPages((current) => current.map((page) => (page.id === pageId ? transformed : page)));
    } catch (error) {
      showToast({ type: 'error', title: 'Falha ao rotacionar', message: error.message || 'Nao foi possivel rotacionar a pagina.' });
    }
  };

  const cropPage = async (pageId) => {
    const target = pages.find((page) => page.id === pageId);
    if (!target) {
      return;
    }

    try {
      const cropped = await cropScannedPage(target, 0.06);
      setPages((current) => current.map((page) => (page.id === pageId ? cropped : page)));
    } catch (error) {
      showToast({ type: 'error', title: 'Falha ao recortar', message: error.message || 'Nao foi possivel recortar a pagina.' });
    }
  };

  const downloadPage = async (page) => {
    try {
      const format = scanOptions.outputFormat === 'pdf' ? 'jpg' : scanOptions.outputFormat;
      const blob = await pageToDownloadBlob(page, format);
      const filename = `${page.file.name.replace(/\.[^/.]+$/, '')}.${format}`;
      const url = downloadBlob(blob, filename);
      setDownloadUrls((current) => [...current, url]);
    } catch (error) {
      showToast({ type: 'error', title: 'Falha no download', message: error.message || 'Nao foi possivel baixar a pagina.' });
    }
  };

  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setPages((current) => {
      const oldIndex = current.findIndex((item) => item.id === active.id);
      const newIndex = current.findIndex((item) => item.id === over.id);
      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const clearScan = () => {
    revokePageUrls(pages);
    setPages([]);
    setStatusState('connected');
    setStatusMessage('Fila de digitalizacao limpa.');
    setScanProgress(0);
    setErrorMessage('');
  };

  const exportPdf = async () => {
    if (!pages.length) {
      setErrorMessage('Adicione paginas antes de gerar o PDF.');
      return;
    }

    setIsExporting(true);
    try {
      const response = await buildPdfFromPages(pages);
      const filename = getFilenameFromHeaders(response.headers, 'scanner_documento.pdf');
      const url = downloadBlob(response.data, filename);
      setDownloadUrls((current) => [...current, url]);
      addEntry({ tool: 'Escanear documento', summary: `PDF gerado com ${pages.length} pagina(s)` });
      showToast({ type: 'success', title: 'PDF pronto', message: 'Download do PDF iniciado.' });
    } catch (error) {
      const message = error.response?.data?.message || 'Nao foi possivel gerar o PDF das paginas escaneadas.';
      showToast({ type: 'error', title: 'Falha ao gerar PDF', message });
    } finally {
      setIsExporting(false);
    }
  };

  const exportCompressedPdf = async () => {
    if (!pages.length) {
      setErrorMessage('Adicione paginas antes de gerar o PDF comprimido.');
      return;
    }

    setIsExporting(true);
    try {
      const rawPdfResponse = await buildPdfFromPages(pages);
      const rawPdfFile = new File([rawPdfResponse.data], 'scanner_documento.pdf', { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('pdf', rawPdfFile);
      formData.append('level', 'medium');

      const compressedResponse = await postCompressPdf(formData);
      const filename = getFilenameFromHeaders(compressedResponse.headers, 'scanner_documento_comprimido.pdf');
      const url = downloadBlob(compressedResponse.data, filename);
      setDownloadUrls((current) => [...current, url]);
      showToast({ type: 'success', title: 'PDF comprimido pronto', message: 'Download iniciado com compactacao media.' });
    } catch (error) {
      const message = error.response?.data?.message || 'Nao foi possivel comprimir o PDF gerado.';
      showToast({ type: 'error', title: 'Falha na compactacao', message });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAllPages = async (format) => {
    if (!pages.length) {
      setErrorMessage('Adicione paginas antes de exportar.');
      return;
    }

    setIsExporting(true);
    try {
      for (const page of pages) {
        const blob = await pageToDownloadBlob(page, format);
        const filename = `${page.file.name.replace(/\.[^/.]+$/, '')}.${format}`;
        const url = downloadBlob(blob, filename);
        setDownloadUrls((current) => [...current, url]);
      }
      showToast({ type: 'success', title: 'Exportacao concluida', message: `Download das paginas em ${format.toUpperCase()} iniciado.` });
    } catch (error) {
      showToast({ type: 'error', title: 'Falha na exportacao', message: error.message || 'Nao foi possivel exportar as paginas.' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-400">Escanear documento</p>
          <h1 className="section-title">Digitalize direto do scanner, organize as paginas e exporte com poucos cliques.</h1>
          <p className="section-copy">Fluxo desktop com suporte a scanner local via bridge, fallback manual por upload e preparacao para SDK real no futuro.</p>
        </div>

        <ScannerStatusPanel state={statusState} message={statusMessage} progress={scanProgress} />

        <div className="glass-panel space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900 p-3 text-white">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Scanner e configuracoes</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Selecione o dispositivo e os parametros de digitalizacao.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Modo do provedor"
              value={providerMode}
              onChange={(event) => setProviderMode(event.target.value)}
              helperText="Bridge: usa servico local real. Mock: simulacao para testes de interface."
              options={[
                { label: 'Bridge local', value: 'bridge' },
                { label: 'Mock (demonstracao)', value: 'mock' },
              ]}
            />

            <SelectField
              label="Scanner"
              value={selectedDeviceId}
              onChange={(event) => setSelectedDeviceId(event.target.value)}
              options={devices.length ? devices.map((device) => ({ value: device.id, label: device.name })) : [{ value: '', label: 'Nenhum scanner detectado' }]}
            />

            <SelectField
              label="Cor"
              value={scanOptions.colorMode}
              onChange={(event) => setScanOptions((current) => ({ ...current, colorMode: event.target.value }))}
              options={capabilityOptions.colorModes.map((mode) => ({ value: mode, label: mode === 'color' ? 'Colorido' : mode === 'grayscale' ? 'Escala de cinza' : 'Preto e branco' }))}
            />

            <SelectField
              label="Resolucao"
              value={scanOptions.dpi}
              onChange={(event) => setScanOptions((current) => ({ ...current, dpi: event.target.value }))}
              options={capabilityOptions.dpi.map((dpi) => ({ value: String(dpi), label: `${dpi} DPI` }))}
            />

            <SelectField
              label="Papel"
              value={scanOptions.paperSize}
              onChange={(event) => setScanOptions((current) => ({ ...current, paperSize: event.target.value }))}
              options={capabilityOptions.paperSizes.map((paper) => ({ value: paper, label: paper === 'auto' ? 'Auto' : paper }))}
            />

            <SelectField
              label="Saida"
              value={scanOptions.outputFormat}
              onChange={(event) => setScanOptions((current) => ({ ...current, outputFormat: event.target.value }))}
              options={capabilityOptions.outputFormats.map((format) => ({ value: format, label: format.toUpperCase() }))}
            />

            <SelectField
              label="Origem"
              value={scanOptions.source}
              onChange={(event) => setScanOptions((current) => ({ ...current, source: event.target.value }))}
              options={[
                { value: 'adf', label: capabilityOptions.adfEnabled ? 'ADF (alimentador automatico)' : 'ADF indisponivel' },
                { value: 'flatbed', label: capabilityOptions.flatbedEnabled ? 'Mesa (flatbed)' : 'Mesa indisponivel' },
              ]}
            />

            <SelectField
              label="Frente e verso"
              value={scanOptions.duplex ? 'true' : 'false'}
              onChange={(event) => setScanOptions((current) => ({ ...current, duplex: event.target.value === 'true' }))}
              options={[
                { value: 'false', label: 'Nao' },
                { value: 'true', label: capabilityOptions.duplexEnabled ? 'Sim' : 'Nao suportado pelo scanner' },
              ]}
            />
          </div>

          <SelectField
            label="Paginas estimadas por varredura"
            value={scanOptions.pages}
            onChange={(event) => setScanOptions((current) => ({ ...current, pages: event.target.value }))}
            helperText="No provider mock, este valor controla quantas paginas serao geradas."
            options={[
              { value: '1', label: '1 pagina' },
              { value: '2', label: '2 paginas' },
              { value: '3', label: '3 paginas' },
              { value: '5', label: '5 paginas' },
            ]}
          />

          <div className="flex flex-wrap gap-3">
            <Button className="gap-2" onClick={connectScanner} disabled={!selectedDeviceId || isChecking || isScanning}>
              <ScanLine className="h-4 w-4" />
              Conectar scanner
            </Button>
            <Button variant="ghost" className="gap-2" onClick={runScannerDiscovery} disabled={isChecking || isScanning}>
              <RefreshCcw className="h-4 w-4" />
              Recarregar dispositivos
            </Button>
            <Button className="gap-2" onClick={startScan} disabled={isChecking || isScanning || !connectedDeviceId}>
              <Sparkles className="h-4 w-4" />
              {pages.length ? 'Adicionar mais paginas' : 'Iniciar digitalizacao'}
            </Button>
            {isScanning ? (
              <Button variant="danger" className="gap-2" onClick={cancelScan}>
                <XCircle className="h-4 w-4" />
                Cancelar digitalizacao
              </Button>
            ) : null}
          </div>

          {isChecking || isScanning || isExporting ? <LoadingSpinner label={isScanning ? 'Digitalizando...' : isExporting ? 'Processando exportacao...' : 'Verificando scanner...'} /> : null}
          {isScanning ? <ProgressBar value={scanProgress} label="Digitalizacao" /> : null}

          {errorMessage ? <p className="text-sm font-semibold text-rose-600">{errorMessage}</p> : null}
        </div>

        {statusState === 'error' ? (
          <ResultCard
            title="Componente de scanner indisponivel"
            description="Instale e inicie o servico local de digitalizacao. Enquanto isso, use o fallback por upload manual para continuar o fluxo."
            tone="info"
          >
            <p className="text-sm text-slate-600 dark:text-slate-400">Ajuda rapida: verifique se o servico local esta ativo em `http://127.0.0.1:24833/status`, confirme permissoes no sistema e reconecte o scanner.</p>
          </ResultCard>
        ) : null}

        <div className="glass-panel space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-accent-500 p-3 text-white">
              <FileArchive className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Fallback manual</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Sem scanner disponivel? Faça upload de imagens para manter o fluxo.</p>
            </div>
          </div>

          <UploadArea
            title="Adicionar imagens manualmente"
            description="Use este fallback quando o scanner nao estiver disponivel. As paginas entram na mesma fila de edicao e exportacao."
            accept="image/jpeg,image/png,image/webp"
            multiple
            onFilesSelected={addManualFiles}
            error=""
          />
        </div>
      </section>

      <aside className="space-y-6">
        <ResultCard
          title="Paginas digitalizadas"
          description={pages.length ? `${pages.length} pagina(s) em memoria (${formatBytes(pages.reduce((sum, page) => sum + page.file.size, 0))}).` : 'Nenhuma pagina adicionada ainda.'}
          tone="default"
        >
          {pages.length ? (
            <>
              <div className="flex flex-wrap gap-2">
                <Button className="gap-2" onClick={exportPdf} disabled={isExporting}>
                  <Download className="h-4 w-4" />
                  Baixar PDF
                </Button>
                <Button variant="secondary" className="gap-2" onClick={exportCompressedPdf} disabled={isExporting}>
                  <FileArchive className="h-4 w-4" />
                  PDF comprimido
                </Button>
                <Button variant="ghost" onClick={() => exportAllPages('jpg')} disabled={isExporting}>Exportar JPG</Button>
                <Button variant="ghost" onClick={() => exportAllPages('png')} disabled={isExporting}>Exportar PNG</Button>
                <Button variant="danger" onClick={clearScan} disabled={isExporting}>Limpar digitalizacao</Button>
              </div>

              <div className="mt-5">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                  <SortableContext items={pages.map((page) => page.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {pages.map((page, index) => (
                        <ScannedPageCard
                          key={page.id}
                          page={page}
                          index={index}
                          onRotate={() => rotatePage(page.id)}
                          onCrop={() => cropPage(page.id)}
                          onRemove={() => removePage(page.id)}
                          onDownload={() => downloadPage(page)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Conecte um scanner e inicie a digitalizacao, ou use o fallback manual para carregar imagens.</p>
          )}
        </ResultCard>
      </aside>
    </div>
  );
}

export default ScanDocumentPage;
