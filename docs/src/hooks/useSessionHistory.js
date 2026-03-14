import { useEffect, useState } from 'react';

const STORAGE_KEY = 'pdf-xinoconvert-history';

export function useSessionHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const savedValue = sessionStorage.getItem(STORAGE_KEY);
      setHistory(savedValue ? JSON.parse(savedValue) : []);
    } catch {
      setHistory([]);
    }
  }, []);

  const persist = (nextValue) => {
    setHistory(nextValue);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextValue));
  };

  const addEntry = (entry) => {
    setHistory((current) => {
      const nextValue = [
        {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          ...entry,
        },
        ...current,
      ].slice(0, 8);

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextValue));
      return nextValue;
    });
  };

  const clearHistory = () => {
    persist([]);
  };

  return {
    history,
    addEntry,
    clearHistory,
  };
}
