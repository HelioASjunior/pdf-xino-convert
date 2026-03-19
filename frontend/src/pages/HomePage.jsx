import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PrivacyPolicySection from '../components/PrivacyPolicySection';
import {
  MergePdfIcon, SplitPdfIcon, CompressPdfIcon, PdfToWordIcon,
  PdfToImagesIcon, RotatePdfIcon, RemovePagesIcon,
  ImageToPdfIcon, ConvertImageIcon,
  DocsToPdfIcon, WordToPdfIcon, ScanDocumentIcon,
  AudioConverterIcon, UtilitiesIcon,
} from '../components/ToolIcons';

function HomePage() {
  const { t } = useTranslation();
  const [activeMenu, setActiveMenu] = useState('all');

  const menuTabs = useMemo(() => ([
    { key: 'all',      label: t('home.tab_all',      { defaultValue: 'Todas' }) },
    { key: 'pdf',      label: t('home.tab_pdf') },
    { key: 'image',    label: t('home.tab_image') },
    { key: 'audio',    label: t('home.tab_audio',    { defaultValue: 'Áudio' }) },
    { key: 'document', label: t('home.tab_document') },
    { key: 'utility',  label: t('home.tab_utility') },
  ]), [t]);

  const tools = useMemo(() => ([
    {
      title: t('home.cat.mergePdfTitle', { defaultValue: 'Unir PDF' }),
      description: t('home.grid.mergePdf', { defaultValue: 'Combine múltiplos PDFs em um único arquivo.' }),
      href: '/unir-pdf',
      Icon: MergePdfIcon,
      category: 'pdf',
    },
    {
      title: t('home.grid.splitPdfTitle', { defaultValue: 'Dividir PDF' }),
      description: t('home.grid.splitPdf', { defaultValue: 'Separe páginas e exporte as partes separadas.' }),
      href: '/pdf-tools',
      Icon: SplitPdfIcon,
      category: 'pdf',
    },
    {
      title: t('home.cat.compressPdfTitle'),
      description: t('home.cat.compressPdfDesc'),
      href: '/comprimir-pdf',
      Icon: CompressPdfIcon,
      category: 'pdf',
    },
    {
      title: t('home.cat.pdfToWordTitle', { defaultValue: 'PDF para Word' }),
      description: t('home.grid.pdfToWord', { defaultValue: 'Converta PDF para documento editável.' }),
      href: '/pdf-para-word',
      Icon: PdfToWordIcon,
      category: 'pdf',
    },
    {
      title: t('home.cat.pdfToImagesTitle'),
      description: t('home.cat.pdfToImagesDesc'),
      href: '/pdf-para-imagens',
      Icon: PdfToImagesIcon,
      category: 'pdf',
    },
    {
      title: t('home.grid.rotatePdfTitle', { defaultValue: 'Rotacionar PDF' }),
      description: t('home.grid.rotatePdf', { defaultValue: 'Corrija a orientação das páginas.' }),
      href: '/pdf-tools',
      Icon: RotatePdfIcon,
      category: 'pdf',
    },
    {
      title: t('home.grid.removePagesTitle', { defaultValue: 'Remover Páginas' }),
      description: t('home.grid.removePages', { defaultValue: 'Elimine páginas específicas do PDF.' }),
      href: '/pdf-tools',
      Icon: RemovePagesIcon,
      category: 'pdf',
    },
    {
      title: t('home.cat.imageToPdfTitle'),
      description: t('home.cat.imageToPdfDesc'),
      href: '/imagem-para-pdf',
      Icon: ImageToPdfIcon,
      category: 'image',
    },
    {
      title: t('home.cat.convertImageTitle'),
      description: t('home.cat.convertImageDesc'),
      href: '/image-tools',
      Icon: ConvertImageIcon,
      category: 'image',
    },
    {
      title: t('home.cat.documentsToPdfTitle'),
      description: t('home.cat.documentsToPdfDesc'),
      href: '/document-tools',
      Icon: DocsToPdfIcon,
      category: 'document',
    },
    {
      title: t('home.cat.wordToPdfTitle', { defaultValue: 'Word para PDF' }),
      description: t('home.grid.wordToPdf', { defaultValue: 'Converta DOCX para PDF em poucos cliques.' }),
      href: '/word-para-pdf',
      Icon: WordToPdfIcon,
      category: 'document',
    },
    {
      title: t('home.cat.scanDocumentTitle'),
      description: t('home.cat.scanDocumentDesc'),
      href: '/escanear-documento',
      Icon: ScanDocumentIcon,
      category: 'document',
    },
    {
      title: t('nav.audioTools', { defaultValue: 'Conversor de Áudio' }),
      description: t('home.grid.audioConvert', { defaultValue: 'Converta MP3, WAV, OGG, FLAC e mais.' }),
      href: '/conversor-audio',
      Icon: AudioConverterIcon,
      category: 'audio',
    },
    {
      title: t('home.cat.utilitiesTitle'),
      description: t('home.cat.utilitiesDesc'),
      href: '/utilities',
      Icon: UtilitiesIcon,
      category: 'utility',
    },
  ]), [t]);

  const visibleTools = activeMenu === 'all'
    ? tools
    : tools.filter((tool) => tool.category === activeMenu);

  return (
    <div className="space-y-10 pt-2">
      <section id="funcionalidades" className="space-y-6">
        {/* Compact section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-[1.65rem] font-semibold text-slate-900 sm:text-3xl">
            {t('home.sectionTitle')}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {t('home.sectionDesc')}
          </p>
        </div>

        {/* Category tabs */}
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-2">
          {menuTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveMenu(tab.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeMenu === tab.key
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tool grid — iLovePDF style */}
        <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {visibleTools.map((tool) => (
            <Link
              key={`${tool.category}-${tool.title}`}
              to={tool.href}
              className="group flex min-h-[160px] flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-md"
            >
              <tool.Icon />
              <h3 className="mt-3.5 text-sm font-semibold leading-5 text-slate-900">
                {tool.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-[0.72rem] leading-[1.5] text-slate-500">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <PrivacyPolicySection />
    </div>
  );
}

export default HomePage;
