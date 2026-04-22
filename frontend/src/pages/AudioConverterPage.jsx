import { useEffect, useRef, useState } from 'react';
import { AudioLines, Download, Music4, PackageCheck, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import UploadArea from '../components/UploadArea';
import FilePreview from '../components/FilePreview';
import SelectField from '../components/SelectField';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import TrustSection from '../components/TrustSection';
import { useToast } from '../hooks/useToast.jsx';
import { zipDownloadItems } from '../services/pdfToolkitService';
import { AUDIO_OUTPUT_OPTIONS, convertAudioFiles } from '../services/audioToolsService';
import { downloadBlob } from '../utils/formatters';

const MAX_AUDIO_SIZE = 50 * 1024 * 1024;
const MAX_AUDIO_FILES = 10;

const supportedAudioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'opus', 'wma', 'aiff', 'amr', 'webm'];

const audioTrustItems = [
  {
    title: 'Conversão local',
    description: 'O processamento acontece no navegador, sem envio de arquivos para servidor.',
    icon: ShieldCheck,
    accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
  },
  {
    title: 'Lotes até 10 arquivos',
    description: 'Adicione vários áudios de uma vez e receba os resultados organizados automaticamente.',
    icon: PackageCheck,
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
  },
  {
    title: 'Qualidade opcional',
    description: 'Defina bitrate para formatos com perda e ajuste o equilíbrio entre tamanho e qualidade.',
    icon: SlidersHorizontal,
    accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
];

function fileExtension(fileName) {
  return fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
}

function isAudioFile(file) {
  if (file.type?.startsWith('audio/')) {
    return true;
  }

  return supportedAudioExtensions.includes(fileExtension(file.name));
}

function AudioConverterPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [targetFormat, setTargetFormat] = useState('mp3');
  const [bitrate, setBitrate] = useState('192');
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

  const clearResult = () => {
    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }
    setResult(null);
  };

  const onFilesSelected = (files) => {
    const mergedCount = items.length + files.length;

    if (mergedCount > MAX_AUDIO_FILES) {
      setError(`Você pode converter no máximo ${MAX_AUDIO_FILES} arquivos por lote.`);
      return;
    }

    for (const file of files) {
      if (!isAudioFile(file)) {
        setError(`O arquivo ${file.name} não parece ser um áudio válido.`);
        return;
      }

      if (file.size > MAX_AUDIO_SIZE) {
        setError(`O arquivo ${file.name} ultrapassa o limite de 50 MB por arquivo.`);
        return;
      }
    }

    setError('');
    clearResult();
    setItems((current) => [
      ...current,
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        kind: 'audio',
      })),
    ]);
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const runConversion = async () => {
    if (!items.length) {
      setError('Adicione arquivos para converter.');
      return;
    }

    setError('');
    setIsLoading(true);
    setProgress(0);

    try {
      clearResult();

      const conversion = await convertAudioFiles(
        items.map((item) => item.file),
        { targetFormat, bitrate },
        (value) => setProgress(Math.max(5, Math.min(95, value))),
      );

      if (!conversion.converted.length) {
        throw new Error('Nenhum arquivo pôde ser convertido. Verifique o formato e tente novamente.');
      }

      let outputUrl;
      let outputName;
      let outputType;

      if (conversion.converted.length === 1) {
        const single = conversion.converted[0];
        outputName = single.fileName;
        outputType = 'single';
        outputUrl = downloadBlob(single.blob, outputName);
        setProgress(100);
      } else {
        const zip = await zipDownloadItems(
          conversion.converted.map((item) => ({ name: item.fileName, blob: item.blob })),
          `audios-convertidos-${Date.now()}.zip`,
          (zipProgress) => {
            const combined = 95 + (Number(zipProgress) / 100) * 5;
            setProgress(Math.round(combined));
          },
        );

        outputName = zip.zipName;
        outputType = 'zip';
        outputUrl = downloadBlob(zip.zipBlob, zip.zipName);
      }

      setResult({
        url: outputUrl,
        fileName: outputName,
        outputType,
        convertedCount: conversion.converted.length,
        failed: conversion.failed,
      });

      showToast({
        type: 'success',
        title: 'Conversão concluída',
        message: `${conversion.converted.length} arquivo(s) processado(s) com sucesso.`,
      });
    } catch (processingError) {
      const message = processingError.message || 'Erro ao converter áudio.';
      setError(message);
      showToast({ type: 'error', title: 'Erro ao processar arquivo', message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="section-intro">
        <p className="section-kicker">Utilitários</p>
        <h1 className="section-title">Conversor de Áudio online com suporte a múltiplos formatos.</h1>
        <p className="section-copy">Converta MP3, WAV, OGG, FLAC, AAC, M4A, MP4, OPUS e outros formatos compatíveis direto no navegador, com download automático individual ou em ZIP.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6">
          <UploadArea
            title="Adicionar áudios"
            description="Envie até 10 arquivos por lote. Limite de 50 MB por arquivo."
            accept="audio/*,.mp3,.wav,.ogg,.flac,.aac,.m4a,.opus,.wma,.aiff,.amr,.webm"
            multiple
            onFilesSelected={onFilesSelected}
            error={error}
          />

          <div className="glass-panel p-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Arquivos selecionados: {items.length}/{MAX_AUDIO_FILES}
            </p>
          </div>

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
                <AudioLines className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Configurar conversão</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Escolha o formato final e bitrate opcional.</p>
              </div>
            </div>

            <SelectField
              label="Formato de saída"
              value={targetFormat}
              onChange={(event) => setTargetFormat(event.target.value)}
              options={AUDIO_OUTPUT_OPTIONS}
              helperText="Todos os arquivos válidos serão convertidos para este formato."
            />

            <SelectField
              label="Qualidade (bitrate)"
              value={bitrate}
              onChange={(event) => setBitrate(event.target.value)}
              options={[
                { value: '96', label: '96 kbps (mais leve)' },
                { value: '128', label: '128 kbps' },
                { value: '192', label: '192 kbps (recomendado)' },
                { value: '256', label: '256 kbps' },
                { value: '320', label: '320 kbps (mais qualidade)' },
              ]}
              helperText="Bitrate é aplicado para formatos com compressão com perda."
            />

            {isLoading ? <LoadingSpinner label="Convertendo áudios..." /> : null}
            {isLoading ? <ProgressBar value={progress} label="Processando lote" /> : null}

            <Button className="w-full gap-2" onClick={runConversion} disabled={isLoading || !items.length}>
              <Download className="h-4 w-4" />
              Converter e baixar
            </Button>
          </div>

          {result ? (
            <ResultCard
              title="Conversão concluída"
              description={`${result.convertedCount} arquivo(s) convertido(s).`}
              tone="success"
            >
              <div className="space-y-3">
                <a href={result.url} download={result.fileName}>
                  <Button>
                    {result.outputType === 'single' ? 'Baixar arquivo convertido' : 'Baixar ZIP'}
                  </Button>
                </a>
                {result.failed?.length ? (
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    {result.failed.length} arquivo(s) falharam durante a conversão.
                  </div>
                ) : null}
              </div>
            </ResultCard>
          ) : null}
        </aside>
      </div>

      <TrustSection
        title="Por que usar o conversor de áudio"
        description="Fluxo pensado para conversões rápidas, com interface simples, validação de arquivos e download imediato."
        items={audioTrustItems}
      />

      <ResultCard
        title="Compatibilidade"
        description="A ferramenta usa FFmpeg WebAssembly no navegador. Alguns formatos muito específicos podem depender dos codecs disponíveis no seu dispositivo."
        tone="info"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Music4 className="h-4 w-4" />
          Recomendado manter lotes menores para maior velocidade
        </div>
      </ResultCard>
    </div>
  );
}

export default AudioConverterPage;
