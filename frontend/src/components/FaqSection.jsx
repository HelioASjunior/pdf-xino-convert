import { ChevronDown } from 'lucide-react';

function FaqSection({ title = 'Perguntas frequentes', description, items }) {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
        {description ? <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">{description}</p> : null}
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <details key={item.question} className="glass-panel group overflow-hidden p-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left">
              <span className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">{item.question}</span>
              <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180 dark:text-slate-500" />
            </summary>
            <div className="border-t border-slate-200 px-5 py-4 text-sm leading-7 text-slate-600 dark:border-slate-700 dark:text-slate-400">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

export default FaqSection;