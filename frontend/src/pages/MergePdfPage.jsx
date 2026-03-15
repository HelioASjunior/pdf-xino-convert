import { Link } from 'react-router-dom';
import { Combine } from 'lucide-react';
import Button from '../components/Button';

function MergePdfPage() {
  return (
    <section className="glass-panel mx-auto max-w-5xl space-y-6 p-7 sm:p-9">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-400">Unir PDF</p>
        <h1 className="section-title">Unir Arquivos PDF Online Grátis</h1>
        <p className="section-copy">
          Junte múltiplos documentos PDF em um único arquivo para facilitar envio, arquivamento e organização.
        </p>
      </div>

      <p className="max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
        Organize páginas de diferentes PDFs e gere um arquivo final único com processo rápido e sem complicação.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link to="/pdf-tools">
          <Button className="gap-2">
            <Combine className="h-4 w-4" />
            Abrir ferramentas de PDF
          </Button>
        </Link>
      </div>
    </section>
  );
}

export default MergePdfPage;
