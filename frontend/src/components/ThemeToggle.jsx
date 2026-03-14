import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-slate-700 ring-1 ring-slate-200 transition hover:bg-white hover:ring-slate-300 dark:bg-slate-800/80 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800 dark:hover:ring-slate-600"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

export default ThemeToggle;
