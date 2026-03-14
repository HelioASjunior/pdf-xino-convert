import { useMemo, useState } from 'react';
import {
  Archive,
  FileImage,
  FileOutput,
  FileText,
  FolderArchive,
  ScanLine,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import ToolCard from '../components/ToolCard';
import UploadArea from '../components/UploadArea';
import ResultCard from '../components/ResultCard';
import { detectToolSuggestion } from '../utils/fileTypeDetector';

const tabs = [
  { id: 'pdf', label: 'Ferramentas de PDF' },
  { id: 'image', label: 'Ferramentas de Imagem' },
  { id: 'document', label: 'Ferramentas de Documentos' },
  { id: 'utility', label: 'Utilitários' },
];

const visual = (name) => `${import.meta.env.BASE_URL}assets/visuals/${name}`;

const catalog = {
  pdf: [
    { title: 'Kit de PDF', description: 'Juntar PDF, dividir PDF, rotacionar páginas, remover e extrair.', href: '/pdf-tools', icon: FileOutput, accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300', thumbnail: visual('pdf-tools.svg') },
    { title: 'PDF para Imagens', description: 'Converter PDF para JPG/PNG com preview e download individual.', href: '/pdf-para-imagens', icon: FileImage, accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300', thumbnail: visual('pdf-tools.svg') },
    { title: 'Comprimir PDF', description: 'Reduza o tamanho do arquivo com equilíbrio entre leveza e legibilidade.', href: '/comprimir-pdf', icon: Archive, accent: 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100', thumbnail: visual('pdf-tools.svg') },
  ],
  image: [
    { title: 'Imagem para PDF', description: 'Upload múltiplo, ordenação e saída em PDF único ou PDFs separados.', href: '/imagem-para-pdf', icon: FileOutput, accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300', thumbnail: visual('image-tools.svg') },
    { title: 'Converter Formato de Imagem', description: 'JPG, PNG, WEBP, BMP e GIF com download em ZIP.', href: '/image-tools', icon: WandSparkles, accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300', thumbnail: visual('image-tools.svg') },
  ],
  document: [
    { title: 'Documentos para PDF', description: 'Transforme textos, planilhas e documentos em PDFs prontos para compartilhar.', href: '/document-tools', icon: FileText, accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300', thumbnail: visual('document-tools.svg') },
    { title: 'Escanear Documento', description: 'Importe páginas digitalizadas, organize o material e finalize o arquivo com rapidez.', href: '/escanear-documento', icon: ScanLine, accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300', thumbnail: visual('document-tools.svg') },
  ],
  utility: [
    { title: 'Central de Utilitários', description: 'Gerador de ZIP, preparação de downloads múltiplos e detecção de formato.', href: '/utilities', icon: FolderArchive, accent: 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100', thumbnail: visual('utilities.svg') },
  ],
};

function HomePage() {
  const [activeTab, setActiveTab] = useState('pdf');
  const [suggestion, setSuggestion] = useState(null);

  const currentTools = useMemo(() => catalog[activeTab], [activeTab]);

  const detectFromUpload = (files) => {
    if (!files.length) {
      return;
    }
    setSuggestion(detectToolSuggestion(files[0]));
  };

  return (
    <div className="space-y-14">
      <HeroSection />

      <section className="space-y-7">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-400">Plataforma</p>
          <h2 className="section-title leading-tight">Ferramentas de PDF, imagem, documentos e utilitários em um único fluxo.</h2>
          <p className="section-copy max-w-3xl leading-8">
            Uma experiência unificada para converter, organizar e preparar arquivos com agilidade, clareza e acabamento profissional.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-soft dark:border-slate-700 dark:bg-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${activeTab === tab.id
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid auto-rows-fr gap-6 lg:grid-cols-3">
          {currentTools.map((tool) => (
            <ToolCard key={tool.href} {...tool} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
        <div className="glass-panel h-full min-h-[320px] p-6">
          <UploadArea
            title="Detecção automática de formato"
            description="Envie um arquivo e o sistema sugere automaticamente a ferramenta correta."
            accept="*/*"
            onFilesSelected={detectFromUpload}
            error=""
          />
        </div>

        <ResultCard
          title="Sugestão inteligente"
          description={suggestion ? suggestion.message : 'Envie um arquivo para receber recomendação automática.'}
          tone="info"
          className="h-full min-h-[320px]"
        >
          {suggestion ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">Categoria: {suggestion.category}</p>
              <div className="flex flex-wrap gap-2">
                {suggestion.suggestions.map((item) => (
                  <Link key={item.href} to={item.href}>
                    <button type="button" className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white">
                      <Sparkles className="h-4 w-4" />
                      {item.label}
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </ResultCard>
      </section>
    </div>
  );
}

export default HomePage;
