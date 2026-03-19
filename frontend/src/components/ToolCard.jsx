import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function ToolCard({ title, description, icon: Icon, href, accent, thumbnail }) {
  return (
    <Link
      to={href}
      className="group feature-card flex h-full min-h-[250px] flex-col justify-between"
    >
      <div className="flex h-full flex-col">
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-lg font-semibold leading-6 text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">{description}</p>
        {thumbnail ? (
          <div className="mt-5 overflow-hidden rounded-2xl ring-1 ring-slate-200/80 dark:ring-slate-700">
            <img src={thumbnail} alt={`${title} visual`} loading="lazy" className="h-20 w-full object-cover" />
          </div>
        ) : null}
      </div>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-200">
        Abrir ferramenta
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default ToolCard;
