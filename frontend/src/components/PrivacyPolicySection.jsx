import { Lock, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function PrivacyPolicySection() {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="privacy-policy-title" className="glass-panel p-6 md:p-8">
      <div className="space-y-4">
        <p className="section-kicker inline-flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          {t('privacyPolicy.kicker')}
        </p>
        <h2 id="privacy-policy-title" className="section-title max-w-[28ch]">
          {t('privacyPolicy.title')}
        </h2>
        <p className="section-copy max-w-3xl text-sm md:text-base">
          {t('privacyPolicy.intro')}
        </p>
      </div>

      <ul className="mt-6 grid gap-3 md:grid-cols-2" aria-label={t('privacyPolicy.listLabel')}>
        <li className="rounded-2xl bg-white/75 p-4 text-sm leading-7 text-slate-700 ring-1 ring-slate-200/85 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700">
          {t('privacyPolicy.pointLocal')}
        </li>
        <li className="rounded-2xl bg-white/75 p-4 text-sm leading-7 text-slate-700 ring-1 ring-slate-200/85 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700">
          {t('privacyPolicy.pointNoStorage')}
        </li>
        <li className="rounded-2xl bg-white/75 p-4 text-sm leading-7 text-slate-700 ring-1 ring-slate-200/85 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700">
          {t('privacyPolicy.pointNoPersonalData')}
        </li>
        <li className="rounded-2xl bg-white/75 p-4 text-sm leading-7 text-slate-700 ring-1 ring-slate-200/85 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700">
          <span className="inline-flex items-start gap-2">
            <Lock className="mt-1 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
            <span>{t('privacyPolicy.pointEssentialTech')}</span>
          </span>
        </li>
      </ul>
    </section>
  );
}

export default PrivacyPolicySection;