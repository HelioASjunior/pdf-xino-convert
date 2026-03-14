import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function ToolCard({ title, description, icon: Icon, href, accent, thumbnail }) {
  return (
    <Link
      to={href}
      className="group glass-panel flex h-full min-h-[380px] flex-col justify-between p-6 transition duration-300 hover:-translate-y-1"
    >
      <div className="flex h-full flex-col">
        <div className={`inline-flex rounded-2xl p-3 ${accent}`}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mt-5 min-h-[64px] font-display text-[1.65rem] font-bold leading-[1.18] text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="mt-3 min-h-[84px] text-sm font-medium leading-7 text-slate-600 dark:text-slate-400">{description}</p>
        {thumbnail ? (
          <div className="mt-auto overflow-hidden rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700">
            <img src={thumbnail} alt={`${title} visual`} loading="lazy" className="h-24 w-full object-cover" />
          </div>
        ) : null}
      </div>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold tracking-wide text-slate-900 dark:text-slate-200">
        Abrir ferramenta
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default ToolCard;
