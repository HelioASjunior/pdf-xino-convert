import { useTranslation } from 'react-i18next';

const brandMark = `${import.meta.env.BASE_URL}assets/visuals/brand-mark.svg`;

function HeroSection() {
  const { t } = useTranslation();

  return (
    <section id="manifesto" className="relative overflow-hidden px-2 py-12 sm:px-3 lg:py-16">
      <div className="mx-auto max-w-4xl [animation:fadeInUp_640ms_ease-out_both]">
        <div className="text-center">
          <div className="mb-5 inline-flex items-center gap-3 text-slate-700 dark:text-slate-300">
            <img
              src={brandMark}
              alt=""
              aria-hidden="true"
              className="h-8 w-8"
              loading="lazy"
            />
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">{t('hero.badge')}</p>
          </div>

          <h1 className="mx-auto max-w-[12ch] font-display text-[2.7rem] font-medium leading-[1.1] tracking-tight text-slate-900 dark:text-slate-50 sm:text-[3.5rem] lg:text-[5rem]">
            {t('hero.title')}
          </h1>

          <p className="mx-auto mt-6 max-w-[58ch] text-base leading-8 text-slate-600 dark:text-slate-300 lg:text-[1.08rem] lg:leading-9">
            {t('hero.desc')}
          </p>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
