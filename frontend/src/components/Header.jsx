import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

function Header({ navigation }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const logoSrc = `${import.meta.env.BASE_URL}assets/logo_xinoconvert.png`;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/72 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/80">
        <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 xl:gap-8">
            <Link to="/" className="flex shrink-0 items-center gap-3">
              <img
                src={logoSrc}
                alt="Logo PDF Xino Convert"
                className="h-12 w-12 rounded-xl object-cover shadow-soft"
                loading="eager"
                decoding="async"
              />
              <p className="font-display text-[1.65rem] leading-none text-slate-900 dark:text-slate-100">PDF XinoConvert</p>
            </Link>
            <nav className="hidden items-center gap-1 lg:flex">
                {navigation.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      `whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? 'bg-brand-100 text-brand-800 ring-1 ring-brand-200 dark:bg-brand-900/40 dark:text-brand-300 dark:ring-brand-800/60'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2">
            <div className="hidden items-center gap-2 lg:flex">
                <ThemeToggle />
                <LanguageSwitcher dropdownDir="down" />
                <Link to="/tour-pelo-site">
                  <Button className="gap-2 rounded-full border border-emerald-200 bg-emerald-500/90 px-5 py-2 text-sm text-white shadow-sm hover:bg-emerald-600 dark:border-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500">
                    {t('header.siteTour', { defaultValue: 'Tour pelo site' })}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-2 lg:hidden">
                <ThemeToggle />
                <button
                  type="button"
                  className="inline-flex rounded-xl border border-slate-300 bg-white p-2.5 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  onClick={() => setOpen((current) => !current)}
                  aria-label={open ? 'Fechar menu' : 'Abrir menu'}
                >
                  {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
      </header>

      {open ? (
        <div className="mx-auto mt-[74px] w-full px-4 sm:px-6 lg:hidden lg:px-8">
          <div className="glass-panel flex flex-col gap-2 px-4 py-4">
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-brand-100 text-brand-800 ring-1 ring-brand-200 dark:bg-brand-900/40 dark:text-brand-300 dark:ring-brand-800/60'
                      : 'bg-slate-50 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:ring-slate-700/80'
                  }`
                }
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <Link to="/tour-pelo-site" onClick={() => setOpen(false)}>
              <Button className="mt-2 w-full gap-2 rounded-full border border-emerald-200 bg-emerald-500/90 text-white shadow-sm hover:bg-emerald-600 dark:border-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500">
                {t('header.siteTour', { defaultValue: 'Tour pelo site' })}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <LanguageSwitcher dropdownDir="up" />
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Header;
