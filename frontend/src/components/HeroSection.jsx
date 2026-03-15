import { useTranslation } from 'react-i18next';
const brandMark = `${import.meta.env.BASE_URL}assets/visuals/brand-mark.svg`;

function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-slate-200/90 bg-white/88 px-5 py-10 shadow-panel backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/82 sm:px-8 sm:py-12 lg:px-14 lg:py-16">
      <div className="pointer-events-none absolute -left-16 top-0 h-44 w-44 rounded-full bg-brand-300/25 blur-3xl dark:bg-brand-500/20" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-44 w-44 rounded-full bg-accent-300/20 blur-3xl dark:bg-accent-500/15" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center [animation:fadeInUp_640ms_ease-out_both]">
        <p className="mb-2 inline-flex items-center rounded-full border border-brand-200 bg-brand-50/75 px-4 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.26em] text-brand-700 dark:border-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
          {t('hero.badge')}
        </p>

        <div className="mt-1 flex items-center gap-3 sm:gap-4">
          <img
            src={brandMark}
            alt=""
            aria-hidden="true"
            className="h-10 w-10 sm:h-11 sm:w-11"
            loading="lazy"
          />
          <h1 className="font-display text-3xl font-extrabold leading-[1.02] tracking-tight text-slate-950 dark:text-slate-50 sm:text-5xl lg:text-6xl">
            Converter PDF Online Grátis
          </h1>
        </div>

        <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base sm:leading-8 lg:text-lg lg:leading-9">
          Converta, comprima e manipule PDFs diretamente no navegador.
          <br className="hidden sm:block" />
          Sem upload para servidores.
        </p>

      </div>
    </section>
  );
}

export default HeroSection;
