import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileOutput } from 'lucide-react';
import Button from '../components/Button';

function WordToPdfPage() {
  const { t } = useTranslation();

  return (
    <section className="glass-panel mx-auto max-w-5xl space-y-6 p-7 sm:p-9">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-400">{t('documentTools.wordToPdf.title')}</p>
        <h1 className="section-title">{t('home.tools.wordToPdfTitle')}</h1>
        <p className="section-copy">
          {t('documentTools.wordToPdf.description')}
        </p>
      </div>

      <p className="max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
        {t('documentTools.trust.directConversion.description')}
      </p>

      <div className="flex flex-wrap gap-3">
        <Link to="/document-tools">
          <Button className="gap-2">
            <FileOutput className="h-4 w-4" />
            {t('documentTools.uploadLabel')}
          </Button>
        </Link>
      </div>
    </section>
  );
}

export default WordToPdfPage;
