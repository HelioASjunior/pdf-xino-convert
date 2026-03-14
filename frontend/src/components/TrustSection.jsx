function TrustSection({ title = 'Por que usar esta área', description, items }) {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
        {description ? <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">{description}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.title} className="glass-panel h-full space-y-3 p-5">
              <div className={`inline-flex rounded-2xl p-3 ${item.accent || 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <p className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">{item.title}</p>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">{item.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default TrustSection;