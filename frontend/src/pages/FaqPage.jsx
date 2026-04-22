import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle } from 'lucide-react';
import FaqSection from '../components/FaqSection';

function FaqPage() {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');

  const faqCategories = [
    { key: 'all', label: t('faqPage.filterAll') },
    { key: 'pdf', label: t('nav.pdfTools') },
    { key: 'image', label: t('nav.imageTools') },
    { key: 'document', label: t('nav.documentTools') },
    { key: 'utilities', label: t('nav.utilities') },
    { key: 'audio', label: t('nav.audioTools') },
  ];

  const faqSections = [
    {
      key: 'pdf',
      title: t('nav.pdfTools'),
      description: t('faqPage.pdfDesc'),
      items: [
        { question: t('faqPage.pdfQ1'), answer: t('faqPage.pdfA1') },
        { question: t('faqPage.pdfQ2'), answer: t('faqPage.pdfA2') },
        { question: t('faqPage.pdfQ3'), answer: t('faqPage.pdfA3') },
      ],
    },
    {
      key: 'image',
      title: t('nav.imageTools'),
      description: t('faqPage.imageDesc'),
      items: [
        { question: t('faqPage.imageQ1'), answer: t('faqPage.imageA1') },
        { question: t('faqPage.imageQ2'), answer: t('faqPage.imageA2') },
        { question: t('faqPage.imageQ3'), answer: t('faqPage.imageA3') },
      ],
    },
    {
      key: 'document',
      title: t('nav.documentTools'),
      description: t('faqPage.documentDesc'),
      items: [
        { question: t('faqPage.docQ1'), answer: t('faqPage.docA1') },
        { question: t('faqPage.docQ2'), answer: t('faqPage.docA2') },
        { question: t('faqPage.docQ3'), answer: t('faqPage.docA3') },
      ],
    },
    {
      key: 'utilities',
      title: t('nav.utilities'),
      description: t('faqPage.utilitiesDesc'),
      items: [
        { question: t('faqPage.utilQ1'), answer: t('faqPage.utilA1') },
        { question: t('faqPage.utilQ2'), answer: t('faqPage.utilA2') },
        { question: t('faqPage.utilQ3'), answer: t('faqPage.utilA3') },
      ],
    },
    {
      key: 'audio',
      title: t('nav.audioTools'),
      description: t('faqPage.audioDesc'),
      items: [
        { question: t('faqPage.audioQ1'), answer: t('faqPage.audioA1') },
        { question: t('faqPage.audioQ2'), answer: t('faqPage.audioA2') },
        { question: t('faqPage.audioQ3'), answer: t('faqPage.audioA3') },
      ],
    },
  ];

  const visibleSections = activeFilter === 'all'
    ? faqSections
    : faqSections.filter((section) => section.key === activeFilter);

  return (
    <div className="space-y-10">
      <div className="section-intro">
        <p className="section-kicker">{t('faqPage.kicker')}</p>
        <h1 className="section-title">{t('faqPage.title')}</h1>
        <p className="section-copy">
          {t('faqPage.description')}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {faqCategories.map((category) => (
          <button
            key={category.key}
            type="button"
            onClick={() => setActiveFilter(category.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeFilter === category.key
                ? 'bg-brand-100 text-brand-800 ring-1 ring-brand-200 dark:bg-brand-900/40 dark:text-brand-300 dark:ring-brand-800/60'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="space-y-10">
        {visibleSections.map((section) => (
          <FaqSection
            key={section.key}
            title={section.title}
            description={section.description}
            items={section.items}
          />
        ))}
      </div>

      <div className="glass-panel flex items-start gap-4 p-6">
        <div className="shrink-0 rounded-2xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
          <HelpCircle className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">{t('faqPage.helpTitle')}</p>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
            {t('faqPage.helpText')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default FaqPage;
