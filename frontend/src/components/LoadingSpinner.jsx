function LoadingSpinner({ label = 'Processando...' }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600 dark:border-brand-800 dark:border-t-brand-400" />
      <span>{label}</span>
    </div>
  );
}

export default LoadingSpinner;
