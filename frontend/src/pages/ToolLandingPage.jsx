import { Link } from 'react-router-dom';
import Button from '../components/Button';

function ToolLandingPage({ title, description, suggestedPath }) {
  return (
    <section className="glass-panel mx-auto max-w-4xl rounded-3xl p-7 sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        Nova rota otimizada para SEO
      </p>
      <h1 className="section-title mt-3 max-w-[22ch]">{title} Online Grátis</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
        {description}
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
        O fluxo completo desta ferramenta esta em preparação. Enquanto isso, voce pode usar a area relacionada abaixo.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to={suggestedPath}>
          <Button>Ir para ferramenta relacionada</Button>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800"
        >
          Voltar para a home
        </Link>
      </div>
    </section>
  );
}

export default ToolLandingPage;
