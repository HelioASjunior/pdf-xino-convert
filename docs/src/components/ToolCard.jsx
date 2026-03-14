import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function ToolCard({ title, description, icon: Icon, href, accent }) {
  return (
    <Link
      to={href}
      className="group glass-panel flex h-full flex-col justify-between p-6 transition duration-300 hover:-translate-y-1"
    >
      <div>
        <div className={`inline-flex rounded-2xl p-3 ${accent}`}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mt-5 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{description}</p>
      </div>
      <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-200">
        Abrir ferramenta
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default ToolCard;
