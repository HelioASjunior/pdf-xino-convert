function ResultCard({ title, description, children, tone = 'default' }) {
  const tones = {
    default: 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800',
    success: 'border-emerald-100 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/40',
    info: 'border-brand-100 bg-brand-50/80 dark:border-brand-800 dark:bg-brand-950/40',
  };

  return (
    <div className={`rounded-[28px] border p-6 shadow-soft ${tones[tone]}`}>
      <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</p>
      {description ? <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">{description}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

export default ResultCard;
