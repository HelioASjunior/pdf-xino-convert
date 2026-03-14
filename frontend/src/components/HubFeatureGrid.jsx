import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function HubFeatureGrid({ title, description, items, columnsClassName = 'md:grid-cols-2', className = '' }) {
  return (
    <section className={`space-y-4 ${className}`.trim()}>
      {title || description ? (
        <div className="space-y-2">
          {title ? <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h2> : null}
          {description ? <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">{description}</p> : null}
        </div>
      ) : null}

      <div className={`grid gap-4 ${columnsClassName}`.trim()}>
        {items.map((item) => {
          const Icon = item.icon;
          const body = (
            <>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className={`inline-flex rounded-2xl p-3 ${item.accent || 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'}`}>
                    {Icon ? <Icon className="h-5 w-5" /> : null}
                  </div>
                  {item.badge ? (
                    <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:ring-slate-700">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <p className="font-display text-2xl font-bold leading-tight text-slate-900 dark:text-slate-100">{item.title}</p>
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">{item.description}</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {item.actionLabel || 'Abrir'}
                <ArrowRight className="h-4 w-4" />
              </div>
            </>
          );

          const sharedClassName = `glass-panel flex h-full flex-col justify-between gap-5 p-5 text-left transition duration-300 ${item.current ? 'ring-2 ring-brand-200 dark:ring-brand-700/60' : 'hover:-translate-y-1'} ${item.className || ''}`.trim();

          if (item.href) {
            return (
              <Link key={item.title} to={item.href} className={sharedClassName}>
                {body}
              </Link>
            );
          }

          return (
            <button key={item.title} type="button" onClick={item.onClick} className={sharedClassName}>
              {body}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default HubFeatureGrid;