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
import { useTranslation } from 'react-i18next';
import HeroSection from '../components/HeroSection';
import PrivacyPolicySection from '../components/PrivacyPolicySection';
import ToolCard from '../components/ToolCard';
import UploadArea from '../components/UploadArea';
import ResultCard from '../components/ResultCard';
import { detectToolSuggestion } from '../utils/fileTypeDetector';

const visual = (name) => `${import.meta.env.BASE_URL}assets/visuals/${name}`;

function HomePage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('pdf');
  const [suggestion, setSuggestion] = useState(null);

  const tabs = useMemo(() => [
    { id: 'pdf',      label: t('home.tab_pdf') },
    { id: 'image',    label: t('home.tab_image') },
    { id: 'document', label: t('home.tab_document') },
    { id: 'utility',  label: t('home.tab_utility') },
  ], [t]);

  const catalog = useMemo(() => ({
    pdf: [
      { title: t('home.cat.pdfKitTitle'),      description: t('home.cat.pdfKitDesc'),      href: '/pdf-tools',          icon: FileOutput,  accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',  thumbnail: visual('pdf-tools.svg') },
      { title: t('home.cat.pdfToImagesTitle'), description: t('home.cat.pdfToImagesDesc'), href: '/pdf-para-imagens',   icon: FileImage,   accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300', thumbnail: visual('pdf-tools.svg') },
      { title: t('home.cat.compressPdfTitle'), description: t('home.cat.compressPdfDesc'), href: '/comprimir-pdf',      icon: Archive,     accent: 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100',        thumbnail: visual('pdf-tools.svg') },
    ],
    image: [
      { title: t('home.cat.imageToPdfTitle'),    description: t('home.cat.imageToPdfDesc'),    href: '/imagem-para-pdf', icon: FileOutput,   accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',  thumbnail: visual('image-tools.svg') },
      { title: t('home.cat.convertImageTitle'),  description: t('home.cat.convertImageDesc'),  href: '/image-tools',     icon: WandSparkles, accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300', thumbnail: visual('image-tools.svg') },
    ],
    document: [
      { title: t('home.cat.documentsToPdfTitle'), description: t('home.cat.documentsToPdfDesc'), href: '/document-tools',       icon: FileText, accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300', thumbnail: visual('document-tools.svg') },
      { title: t('home.cat.scanDocumentTitle'),   description: t('home.cat.scanDocumentDesc'),   href: '/escanear-documento',   icon: ScanLine, accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300', thumbnail: visual('document-tools.svg') },
    ],
    utility: [
      { title: t('home.cat.utilitiesTitle'), description: t('home.cat.utilitiesDesc'), href: '/utilities', icon: FolderArchive, accent: 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100', thumbnail: visual('utilities.svg') },
    ],
  }), [t]);

  const currentTools = useMemo(() => catalog[activeTab], [catalog, activeTab]);

  const detectFromUpload = (files) => {
    if (!files.length) return;
    setSuggestion(detectToolSuggestion(files[0]));
  };

  return (
    <div className="space-y-14">
      <HeroSection />

      <section className="space-y-7">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-400">{t('home.platformLabel')}</p>
          <h2 className="section-title leading-tight">{t('home.sectionTitle')}</h2>
          <p className="section-copy max-w-3xl leading-8">
            {t('home.sectionDesc')}
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
            title={t('home.uploadTitle')}
            description={t('home.uploadDesc')}
            accept="*/*"
            onFilesSelected={detectFromUpload}
            error=""
          />
        </div>

        <ResultCard
          title={t('home.suggestionTitle')}
          description={suggestion ? suggestion.message : t('home.suggestionDefault')}
          tone="info"
          className="h-full min-h-[320px]"
        >
          {suggestion ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">{t('home.suggestionCategory')}: {suggestion.category}</p>
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

      <PrivacyPolicySection />
    </div>
  );
}

export default HomePage;
