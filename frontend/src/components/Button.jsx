function Button({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  ...props
}) {
  const variants = {
    primary: 'bg-brand-500 text-white shadow-soft hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-500',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
    ghost: 'bg-white/70 text-slate-700 ring-1 ring-slate-200 hover:bg-white dark:bg-slate-800/70 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800',
    accent: 'bg-accent-500 text-white hover:bg-accent-600',
    danger: 'bg-rose-500 text-white hover:bg-rose-600',
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
