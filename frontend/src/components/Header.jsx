import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowRight, FileOutput, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Button from './Button';

function Header({ navigation }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 pt-4">
      <div className="glass-panel flex items-center justify-between gap-4 px-5 py-4 md:px-7">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-soft dark:bg-slate-700">
            <FileOutput className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-lg font-extrabold text-slate-900 dark:text-slate-50">PDF XinoConvert</p>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Conversão e organização de arquivos</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-soft dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link to="/imagem-para-pdf">
            <Button className="gap-2 px-4 py-2.5 text-sm">
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex rounded-2xl bg-slate-900 p-3 text-white dark:bg-slate-700"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="glass-panel mt-3 flex flex-col gap-2 px-4 py-4 md:hidden">
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `rounded-2xl px-4 py-3 text-sm font-semibold ${
                  isActive
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`
              }
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <Link to="/imagem-para-pdf" onClick={() => setOpen(false)}>
            <Button className="mt-2 w-full gap-2">
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : null}
    </header>
  );
}

export default Header;
