import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from './Button';

const heroVisual = (name) => `${import.meta.env.BASE_URL}assets/visuals/${name}`;

function HeroSection() {
  const { t } = useTranslation();
  return (
    <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div className="space-y-7">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-700 ring-1 ring-brand-100 dark:bg-slate-800/80 dark:text-brand-300 dark:ring-brand-900">
          <BadgeCheck className="h-4 w-4" />
          {t('hero.badge')}
        </div>
        <div className="space-y-5">
          <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-950 dark:text-slate-50 sm:text-5xl lg:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg md:leading-9">
            {t('hero.desc')}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/imagem-para-pdf">
            <Button className="w-full gap-2 sm:w-auto">
              {t('hero.startNow')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/comprimir-pdf">
            <Button variant="ghost" className="w-full sm:w-auto">
              {t('hero.explore')}
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-white/75 p-4 shadow-soft ring-1 ring-white dark:bg-slate-800/60 dark:ring-slate-700">
            <img src={heroVisual('hero-flow.svg')} alt={t('hero.card1Title')} className="h-20 w-full rounded-xl object-cover" loading="lazy" />
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100">{t('hero.card1Title')}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{t('hero.card1Desc')}</p>
          </div>
          <div className="rounded-3xl bg-white/75 p-4 shadow-soft ring-1 ring-white dark:bg-slate-800/60 dark:ring-slate-700">
            <img src={heroVisual('hero-secure.svg')} alt={t('hero.card2Title')} className="h-20 w-full rounded-xl object-cover" loading="lazy" />
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100">{t('hero.card2Title')}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{t('hero.card2Desc')}</p>
          </div>
          <div className="rounded-3xl bg-white/75 p-4 shadow-soft ring-1 ring-white dark:bg-slate-800/60 dark:ring-slate-700">
            <img src={heroVisual('hero-ready.svg')} alt={t('hero.card3Title')} className="h-20 w-full rounded-xl object-cover" loading="lazy" />
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100">{t('hero.card3Title')}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{t('hero.card3Desc')}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel relative overflow-hidden p-6 lg:p-8">
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-r from-brand-500/15 via-transparent to-accent-500/15" />
        <div className="relative space-y-4">
          <div className="rounded-3xl bg-slate-950 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t('hero.kitLabel')}</p>
            <img src={heroVisual('hero-image-to-pdf.svg')} alt={t('hero.feature1Title')} className="mt-3 h-24 w-full rounded-2xl object-cover" loading="lazy" />
            <p className="mt-3 font-display text-2xl font-bold leading-tight">{t('hero.feature1Title')}</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">{t('hero.feature1Desc')}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-brand-50 p-5 ring-1 ring-brand-100 dark:bg-brand-900/40 dark:ring-brand-800">
              <img src={heroVisual('hero-pdf-images.svg')} alt={t('hero.feature2Title')} className="h-20 w-full rounded-xl object-cover" loading="lazy" />
              <p className="mt-2 text-sm font-semibold leading-6 text-brand-700 dark:text-brand-300">{t('hero.feature2Title')}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{t('hero.feature2Desc')}</p>
            </div>
            <div className="rounded-3xl bg-accent-50 p-5 ring-1 ring-accent-100 dark:bg-accent-900/40 dark:ring-accent-800">
              <img src={heroVisual('hero-compress.svg')} alt={t('hero.feature3Title')} className="h-20 w-full rounded-xl object-cover" loading="lazy" />
              <p className="mt-2 text-sm font-semibold leading-6 text-accent-700 dark:text-accent-300">{t('hero.feature3Title')}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{t('hero.feature3Desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
