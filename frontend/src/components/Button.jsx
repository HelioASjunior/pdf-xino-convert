function Button({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  ...props
}) {
  const variants = {
    primary: 'bg-black text-white shadow-soft hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-panel dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
    secondary: 'bg-slate-900 text-white shadow-soft hover:bg-slate-800 hover:shadow-lg dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
    ghost: 'bg-white text-slate-700 ring-1 ring-slate-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:ring-slate-400 hover:shadow-soft dark:bg-slate-800/75 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800 dark:hover:ring-slate-600',
    accent: 'bg-accent-500 text-white shadow-soft hover:bg-accent-600 hover:shadow-lg',
    danger: 'bg-rose-500 text-white shadow-soft hover:bg-rose-600 hover:shadow-lg',
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-[18px] px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-brand-900/40 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
