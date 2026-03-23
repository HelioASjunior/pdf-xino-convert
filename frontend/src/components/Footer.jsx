import { useTranslation } from 'react-i18next';
import { Github, Instagram } from 'lucide-react';

function Footer() {
  const { t } = useTranslation();
  const linkedinIcon = `${import.meta.env.BASE_URL}assets/social/linkedin.svg`;
  const logoSrc = `${import.meta.env.BASE_URL}assets/logo_xinoconvert.png`;

  return (
    <footer className="pb-6 pt-6 sm:pb-8">
      <div className="glass-panel px-6 py-6 text-sm text-slate-500 dark:text-slate-400 lg:px-7 lg:py-7">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr_0.8fr]">
          <div className="space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-3">
              <img
                src={logoSrc}
                alt="Logo PDF Xino Convert"
                className="h-10 w-10 rounded-lg object-cover"
                loading="lazy"
                decoding="async"
              />
              <p className="font-display text-2xl text-slate-900 dark:text-slate-100">PDF XinoConvert</p>
            </div>
            <p className="max-w-[34rem] leading-7 text-slate-600 dark:text-slate-300">
              {t('footer.tagline1')}
            </p>
            <p className="max-w-[34rem] leading-7">
              {t('footer.tagline2')}
            </p>
          </div>

          <div className="space-y-3 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{t('footer.highlightsLabel')}</p>
            <p className="leading-7">{t('footer.highlight1')}</p>
            <p className="leading-7">{t('footer.highlight2')}</p>
            <p className="leading-7">{t('footer.highlight3')}</p>
          </div>

          <div className="space-y-3 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{t('footer.creationLabel')}</p>
            <p className="leading-7">{t('footer.createdBy')}</p>
            <p className="leading-7 text-slate-600 dark:text-slate-300">{t('footer.freeNoAds')}</p>
            <div className="flex flex-wrap justify-center gap-2.5 lg:justify-start">
              <a
                href="https://www.linkedin.com/in/heliojunior1218/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:w-auto"
                aria-label="LinkedIn de Hélio Júnior"
              >
                <img src={linkedinIcon} alt="LinkedIn" className="h-5 w-5" loading="lazy" />
                {t('footer.linkedinLabel')}
              </a>

              <a
                href="https://github.com/HelioASjunior/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:w-auto"
                aria-label="GitHub de Hélio Júnior"
              >
                <Github className="h-5 w-5" />
                GitHub
              </a>

              <a
                href="https://instagram.com/pdfxinoconvert"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:w-auto"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
                Instagram
              </a>
            </div>
          </div>
        </div>

        <p className="mt-6 border-t border-slate-200 pt-4 text-center text-xs leading-6 text-slate-500 dark:border-slate-700 dark:text-slate-400 lg:text-left">
          {t('footer.privacyNotice')}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
