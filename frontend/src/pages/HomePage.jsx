import { useMemo, useState } from 'react';
import {
  Archive,
  Crop,
  FileImage,
  FileOutput,
  FileText,
  FolderArchive,
  WandSparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HeroSection from '../components/HeroSection';
import PrivacyPolicySection from '../components/PrivacyPolicySection';
import ToolCard from '../components/ToolCard';
import UploadArea from '../components/UploadArea';
import { detectToolSuggestion } from '../utils/fileTypeDetector';

const visual = (name) => `${import.meta.env.BASE_URL}assets/visuals/${name}`;

function HomePage() {
  const { t } = useTranslation();
  const [suggestion, setSuggestion] = useState(null);

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
      { title: t('home.cat.scanDocumentTitle'),   description: t('home.cat.scanDocumentDesc'),   href: '/pdf-tools',           icon: Crop, accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300', thumbnail: visual('pdf-tools.svg') },
    ],
    utility: [
      { title: t('home.cat.utilitiesTitle'), description: t('home.cat.utilitiesDesc'), href: '/utilities', icon: FolderArchive, accent: 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100', thumbnail: visual('utilities.svg') },
    ],
  }), [t]);

  const allTools = useMemo(() => Object.values(catalog).flat(), [catalog]);

  const detectFromUpload = (files) => {
    if (!files.length) return;
    setSuggestion(detectToolSuggestion(files[0]));
  };

  return (
    <div className="space-y-14">
      <HeroSection />

      <section className="space-y-7">
        <div className="mx-auto grid max-w-6xl auto-rows-fr gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {allTools.map((tool) => (
            <ToolCard key={tool.href} {...tool} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="glass-panel h-full min-h-[300px] p-6">
          <UploadArea
            title={t('home.uploadTitle')}
            description={t('home.uploadDesc')}
            accept="*/*"
            onFilesSelected={detectFromUpload}
            error=""
          />
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900/60 lg:p-5">
          <p className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">{t('home.suggestionTitle')}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {suggestion ? suggestion.message : t('home.suggestionDefault')}
          </p>

          {suggestion ? (
            <>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                {t('home.suggestionCategory')}: {suggestion.category}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestion.suggestions.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </aside>
      </section>

      <PrivacyPolicySection />
    </div>
  );
}

export default HomePage;
