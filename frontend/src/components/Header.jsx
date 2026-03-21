import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import LanguageSwitcher from './LanguageSwitcher';

function Header({ navigation }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const logoSrc = `${import.meta.env.BASE_URL}assets/logo_xinoconvert.png`;

  return (
    <>
      <header className="sticky top-0 z-50 pt-3">
        <div className="mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-[20px] border border-slate-200/80 bg-white/72 px-4 py-3 backdrop-blur-md sm:px-5 lg:px-6">
            <div className="grid items-center gap-4 lg:grid-cols-[auto_1fr_auto]">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src={logoSrc}
                  alt="Logo PDF Xino Convert"
                  className="h-12 w-12 rounded-xl object-cover shadow-soft"
                  loading="eager"
                  decoding="async"
                />
                <p className="font-display text-[1.65rem] leading-none text-slate-900">PDF XinoConvert</p>
              </Link>

              <nav className="hidden items-center justify-center gap-1 px-2 lg:flex">
                {navigation.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      `rounded-full px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? 'bg-brand-100 text-brand-800 ring-1 ring-brand-200'
                          : 'text-slate-600 hover:bg-white hover:text-slate-900'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="hidden items-center justify-end gap-2 lg:flex">
                <LanguageSwitcher dropdownDir="down" />
                <Link to="/tour-pelo-site">
                  <Button className="gap-2 rounded-full border border-emerald-200 bg-emerald-500/90 px-5 py-2 text-sm text-white shadow-sm hover:bg-emerald-600 dark:border-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500">
                    {t('header.siteTour', { defaultValue: 'Tour pelo site' })}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-end gap-2 lg:hidden">
                <button
                  type="button"
                  className="inline-flex rounded-xl border border-slate-300 bg-white p-2.5 text-slate-700"
                  onClick={() => setOpen((current) => !current)}
                >
                  {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {open ? (
        <div className="mx-auto mt-[88px] w-full max-w-[1360px] px-4 sm:px-6 lg:hidden lg:px-8">
          <div className="glass-panel flex flex-col gap-2 px-4 py-4">
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-semibold ${
                    isActive
                      ? 'bg-brand-100 text-brand-800 ring-1 ring-brand-200'
                      : 'bg-slate-50 text-slate-700 ring-1 ring-slate-200'
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
