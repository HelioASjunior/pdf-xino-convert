import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Globe } from 'lucide-react';

const flagAsset = (name) => `${import.meta.env.BASE_URL}assets/flags/${name}`;

const LANGUAGES = [
  { code: 'pt-BR', label: 'Português', flagSrc: flagAsset('pt-br.svg') },
  { code: 'en', label: 'English', flagSrc: flagAsset('en.svg') },
];

export default function LanguageSwitcher({ dropdownDir = 'up' }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  const handleChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18n-lang', code);
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dropdownClass =
    dropdownDir === 'up'
      ? 'bottom-full mb-1'
      : 'top-full mt-1';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[0.88rem] font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        aria-label="Selecionar idioma"
      >
        <Globe className="h-4 w-4 shrink-0" />
        <img
          src={current.flagSrc}
          alt={`Bandeira ${current.label}`}
          className="h-4 w-5 rounded-[3px] object-cover shadow-sm ring-1 ring-slate-300/70 dark:ring-slate-600/80"
          loading="lazy"
        />
        <span>{current.label}</span>
      </button>

      {open && (
        <div
          className={`absolute left-0 z-50 ${dropdownClass} w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900`}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleChange(lang.code)}
              className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
                lang.code === i18n.language
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <img
                src={lang.flagSrc}
                alt={`Bandeira ${lang.label}`}
                className="h-4 w-5 rounded-[3px] object-cover shadow-sm ring-1 ring-slate-300/70 dark:ring-slate-600/80"
                loading="lazy"
              />
              <span className="flex-1 text-left">{lang.label}</span>
              {lang.code === i18n.language && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
