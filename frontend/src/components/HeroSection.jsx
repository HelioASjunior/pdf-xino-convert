import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, ShieldCheck, Zap } from 'lucide-react';
import Button from './Button';

function HeroSection() {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-700 ring-1 ring-brand-100 dark:bg-slate-800/80 dark:text-brand-300 dark:ring-brand-900">
          <BadgeCheck className="h-4 w-4" />
          Fluxos rápidos para PDF
        </div>
        <div className="space-y-4">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50 sm:text-5xl lg:text-6xl">
            Ferramentas reais para transformar, extrair e compactar PDFs sem atrito.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Faça upload com drag and drop, acompanhe o progresso em tempo real e baixe o resultado pronto com uma interface limpa, rápida e responsiva.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/imagem-para-pdf">
            <Button className="w-full gap-2 sm:w-auto">
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/comprimir-pdf">
            <Button variant="ghost" className="w-full sm:w-auto">
              Explorar ferramentas
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-white/75 p-4 shadow-soft ring-1 ring-white dark:bg-slate-800/60 dark:ring-slate-700">
            <Zap className="h-5 w-5 text-brand-600" />
            <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Fluxo rápido</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Processamento direto no backend com feedback visual.</p>
          </div>
          <div className="rounded-3xl bg-white/75 p-4 shadow-soft ring-1 ring-white dark:bg-slate-800/60 dark:ring-slate-700">
            <ShieldCheck className="h-5 w-5 text-accent-600" />
            <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Upload seguro</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Validação de tipo, limite de tamanho e limpeza automática.</p>
          </div>
          <div className="rounded-3xl bg-white/75 p-4 shadow-soft ring-1 ring-white dark:bg-slate-800/60 dark:ring-slate-700">
            <BadgeCheck className="h-5 w-5 text-slate-900 dark:text-slate-100" />
            <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Pronto para produção</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Código modular, páginas dedicadas e manutenção simples.</p>
          </div>
        </div>
      </div>

      <div className="glass-panel relative overflow-hidden p-6 lg:p-8">
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-r from-brand-500/15 via-transparent to-accent-500/15" />
        <div className="relative space-y-4">
          <div className="rounded-3xl bg-slate-950 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Kit</p>
            <p className="mt-3 font-display text-2xl font-bold">Imagem para PDF</p>
            <p className="mt-2 text-sm text-slate-300">Múltiplas imagens, reordenação e ajuste fino do layout final.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-brand-50 p-5 ring-1 ring-brand-100 dark:bg-brand-900/40 dark:ring-brand-800">
              <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">PDF para Imagens</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Preview de páginas, PNG ou JPG e download em ZIP.</p>
            </div>
            <div className="rounded-3xl bg-accent-50 p-5 ring-1 ring-accent-100 dark:bg-accent-900/40 dark:ring-accent-800">
              <p className="text-sm font-semibold text-accent-700 dark:text-accent-300">Comprimir PDF</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Níveis de compressão e resumo de redução gerada.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
