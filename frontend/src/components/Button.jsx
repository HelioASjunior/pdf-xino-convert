function Button({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  ...props
}) {
  const variants = {
    primary: 'bg-brand-500 text-white shadow-soft hover:bg-brand-600 hover:shadow-lg dark:bg-brand-600 dark:hover:bg-brand-500',
    secondary: 'bg-slate-900 text-white shadow-soft hover:bg-slate-800 hover:shadow-lg dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
    ghost: 'bg-white/75 text-slate-700 ring-1 ring-slate-200 hover:bg-white hover:ring-slate-300 dark:bg-slate-800/75 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800 dark:hover:ring-slate-600',
    accent: 'bg-accent-500 text-white shadow-soft hover:bg-accent-600 hover:shadow-lg',
    danger: 'bg-rose-500 text-white shadow-soft hover:bg-rose-600 hover:shadow-lg',
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-brand-900/40 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
