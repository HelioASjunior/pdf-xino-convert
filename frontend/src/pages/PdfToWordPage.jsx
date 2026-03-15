import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import Button from '../components/Button';

function PdfToWordPage() {
  return (
    <section className="glass-panel mx-auto max-w-5xl space-y-6 p-7 sm:p-9">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-400">PDF para Word</p>
        <h1 className="section-title">Converter PDF para Word Online Grátis</h1>
        <p className="section-copy">
          Converta PDF para Word com layout organizado e exportação rápida para edição em DOCX.
        </p>
      </div>

      <p className="max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
        Transforme arquivos PDF em Word editável com praticidade e mantenha seu fluxo de trabalho mais eficiente no navegador.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link to="/document-tools">
          <Button className="gap-2">
            <FileText className="h-4 w-4" />
            Abrir ferramentas de documentos
          </Button>
        </Link>
      </div>
    </section>
  );
}

export default PdfToWordPage;
