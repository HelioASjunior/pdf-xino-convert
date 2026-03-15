import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'xino-first-visit-notice-v1';

function FirstVisitNotice() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alreadyConfirmed = localStorage.getItem(STORAGE_KEY) === 'true';
    if (!alreadyConfirmed) {
      setVisible(true);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <aside
      className="fixed inset-x-3 bottom-3 z-50 mx-auto w-[min(760px,calc(100%-1.5rem))] rounded-3xl border border-white/80 bg-white/95 p-4 shadow-panel backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 sm:inset-x-6 sm:bottom-6 sm:p-5"
      role="dialog"
      aria-live="polite"
      aria-labelledby="first-visit-title"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/50 dark:text-brand-300">
          <ShieldCheck className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          <h2 id="first-visit-title" className="text-base font-bold leading-6 text-slate-900 dark:text-slate-100 sm:text-lg">
            {t('firstVisitNotice.title')}
          </h2>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{t('firstVisitNotice.descBrowser')}</p>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{t('firstVisitNotice.descDevice')}</p>
          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{t('firstVisitNotice.terms')}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleConfirm}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          {t('firstVisitNotice.confirm')}
        </button>
      </div>
    </aside>
  );
}

export default FirstVisitNotice;