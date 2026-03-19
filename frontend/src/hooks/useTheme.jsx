import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

function resolveInitialTheme() {
  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(resolveInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    try {
      localStorage.setItem('theme', 'light');
    } catch {
      // localStorage not available
    }
    if (theme !== 'light') {
      setTheme('light');
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme('light');
  }, []);

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
