import { useEffect, useRef, useState } from 'react';
import { Archive, AudioLines, Download, Sparkles, Compass, Package, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import UploadArea from '../components/UploadArea';
import FilePreview from '../components/FilePreview';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import HubFeatureGrid from '../components/HubFeatureGrid';
import TrustSection from '../components/TrustSection';
import FaqSection from '../components/FaqSection';
import { useToast } from '../hooks/useToast.jsx';
import { zipDownloadItems } from '../services/pdfToolkitService';
import { downloadBlob } from '../utils/formatters';
import { detectToolSuggestion } from '../utils/fileTypeDetector';

const MAX_GENERIC_FILE_SIZE = 100 * 1024 * 1024;

const utilitiesHubItems = [
  {
    key: 'zip',
    title: 'Gerar ZIP',
    description: 'Agrupe vários arquivos em um único pacote para download, envio ou organização interna.',
    icon: Package,
    badge: 'Fluxo principal',
    actionLabel: 'Preparar pacote',
    accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
    className: 'hover:-translate-y-0',
  },
  {
    key: 'detector',
    title: 'Detecção automática',
    description: 'Envie um arquivo e receba um encaminhamento para a área mais adequada da plataforma.',
    icon: Compass,
    actionLabel: 'Ver recomendação',
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
    className: 'hover:-translate-y-0',
  },
  {
    key: 'audio-converter',
    title: 'Conversor de Áudio',
    description: 'Converta MP3, WAV, OGG, FLAC, AAC, M4A e outros formatos compatíveis direto no navegador.',
    icon: AudioLines,
    href: '/conversor-audio',
    actionLabel: 'Abrir conversor',
    accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
    badge: 'Novo',
  },
];

const utilitiesTrustItems = [
  {
    title: 'Área de apoio',
    description: 'Use os utilitários como etapa de preparação antes de converter, empacotar ou redistribuir arquivos.',
    icon: Compass,
    accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
  },
  {
    title: 'Pacotes prontos',
    description: 'A geração de ZIP simplifica entregas com muitos arquivos e reduz a dispersão de downloads.',
    icon: Package,
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300',
  },
  {
    title: 'Encaminhamento claro',
    description: 'A sugestão automática ajuda a localizar a ferramenta correta quando o tipo de arquivo é reconhecido.',
    icon: ShieldCheck,
    accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
];

const utilitiesFaqItems = [
  {
    question: 'Quais arquivos posso enviar nesta área?',
    answer: 'Qualquer arquivo com até 100 MB por item pode ser usado para organização e geração de ZIP.',
  },
  {
    question: 'A detecção automática converte meus arquivos?',
    answer: 'Não. Ela apenas analisa o tipo enviado e sugere a área mais adequada da plataforma para continuar o trabalho.',
  },
  {
    question: 'Posso usar utilitários sem converter nada?',
    answer: 'Sim. Esta página também funciona como uma central simples para agrupar downloads em um único pacote ZIP.',
  },
];

function UtilitiesPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);
  const uploadRef = useRef(null);
  const suggestionsRef = useRef(null);
  const suggestions = items.length ? detectToolSuggestion(items[items.length - 1].file) : null;
  const utilityActions = utilitiesHubItems.map((item) => ({
    ...item,
    current: item.key === 'detector' ? Boolean(suggestions) : false,
    onClick: () => {
      if (item.key === 'zip') {
        uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      if (item.key === 'detector') {
        suggestionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
  }));

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => () => {
    if (resultRef.current?.url) {
      URL.revokeObjectURL(resultRef.current.url);
    }
  }, []);

  const onFilesSelected = (files) => {
    for (const file of files) {
      if (file.size > MAX_GENERIC_FILE_SIZE) {
        setError(`O arquivo ${file.name} ultrapassa o limite de 100 MB por arquivo.`);
        return;
      }
    }

    setError('');
    setItems((current) => [
      ...current,
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        kind: file.type === 'application/pdf' ? 'pdf' : 'image',
      })),
    ]);
  };

  const removeItem = (id) => {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }
      return current.filter((item) => item.id !== id);
    });
  };

  const buildZip = async () => {
    if (!items.length) {
      setError('Adicione arquivos para criar o ZIP.');
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      if (result?.url) {
        URL.revokeObjectURL(result.url);
      }

      const zip = await zipDownloadItems(
        items.map((item) => ({ name: item.file.name, file: item.file })),
        `downloads-${Date.now()}.zip`,
        (value) => setProgress(value),
      );

      const url = downloadBlob(zip.zipBlob, zip.zipName);
      setResult({ url, fileName: zip.zipName });
      showToast({ type: 'success', title: 'ZIP pronto', message: 'Download iniciado.' });
    } catch (processingError) {
      const message = processingError.message || 'Não foi possível criar o ZIP.';
      setError(message);
      showToast({ type: 'error', title: 'Erro ao processar arquivo', message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <HubFeatureGrid
        title="Recursos principais da área"
        description="A central combina organização simples com encaminhamento para outras categorias quando necessário."
        items={utilityActions}
        columnsClassName="md:grid-cols-3"
      />

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section ref={uploadRef} className="space-y-6">
          <UploadArea
            title="Adicionar arquivos"
            description="Aceita qualquer arquivo até 100 MB para organização e pacote ZIP."
            accept="*/*"
            multiple
            onFilesSelected={onFilesSelected}
            error={error}
          />

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
                <Archive className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Gerador de ZIP</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Empacote múltiplos arquivos em um único download.</p>
              </div>
            </div>

            {isLoading ? <LoadingSpinner label="Preparando download..." /> : null}
            {isLoading ? <ProgressBar value={progress} label="Gerando ZIP" /> : null}

            <Button className="w-full gap-2" onClick={buildZip} disabled={isLoading || !items.length}>
              <Download className="h-4 w-4" />
              Gerar ZIP
            </Button>
          </div>

          {suggestions ? (
            <ResultCard ref={suggestionsRef} title="Detecção automática" description={suggestions.message} tone="info">
              <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Categoria sugerida: {suggestions.category}</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.suggestions.map((item) => (
                  <Link key={item.href} to={item.href}>
                    <Button variant="ghost" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </ResultCard>
          ) : null}

          {result ? (
            <ResultCard title="ZIP pronto" description="Arquivo gerado com sucesso." tone="success">
              <a href={result.url} download={result.fileName}>
                <Button>Baixar ZIP</Button>
              </a>
            </ResultCard>
          ) : null}
        </aside>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="space-y-5">
          <div className="section-intro">
            <p className="section-kicker">Utilitários</p>
            <h1 className="section-title">Use esta central para preparar arquivos, gerar pacotes ZIP e descobrir a melhor ferramenta para cada caso.</h1>
            <p className="section-copy">A área de utilitários foi desenhada como suporte operacional: um ponto de entrada simples para organização, agrupamento e encaminhamento de arquivos.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Limite por arquivo</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">100 MB</p>
            </div>
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Entrada flexível</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Qualquer tipo</p>
            </div>
            <div className="glass-panel p-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Uso principal</p>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Apoio rápido</p>
            </div>
          </div>
        </div>

        <ResultCard
          title="Quando usar utilitários"
          description="Esta página faz mais sentido quando você precisa apenas agrupar downloads ou descobrir rapidamente qual área da plataforma atende melhor o arquivo enviado."
          tone="info"
        />
      </section>

      <TrustSection
        title="Por que manter esta central"
        description="Nem todo fluxo começa com conversão. Em muitos casos, organizar e encaminhar arquivos é a etapa mais útil."
        items={utilitiesTrustItems}
      />

      <FaqSection
        description="Pontos rápidos para orientar o uso dos utilitários no dia a dia."
        items={utilitiesFaqItems}
      />
    </div>
  );
}

export default UtilitiesPage;
