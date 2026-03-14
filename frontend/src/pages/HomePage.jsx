import { Archive, FileImage, FileOutput, ScanLine, Shield, Sparkles, Timer } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import ToolCard from '../components/ToolCard';

const tools = [
  {title: 'Imagem para PDF', description: 'Combine múltiplas imagens em um único PDF com controle de orientação, tamanho, margem e ajuste de página.', href: '/imagem-para-pdf', icon: FileOutput, accent: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300'},
  {title: 'PDF para Imagens', description: 'Extraia todas as páginas de um PDF como imagens, visualize o resultado e baixe individualmente ou em ZIP.', href: '/pdf-para-imagens', icon: FileImage, accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300'},
  {title: 'Comprimir PDF', description: 'Reduza o tamanho de arquivos PDF com níveis de compressão claros e resumo do ganho obtido.', href: '/comprimir-pdf', icon: Archive, accent: 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100'},
  {title: 'Escanear Documento', description: 'Adquira páginas direto do scanner local via bridge, organize, recorte e exporte em PDF, JPG ou PNG.', href: '/escanear-documento', icon: ScanLine, accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300'},
];

const benefits = [
  { title: 'Rápido', description: 'Fluxo direto, progresso em tempo real e download automático ao concluir.', icon: Timer },
  { title: 'Seguro', description: 'Validação de formato, limites de tamanho e limpeza automática de arquivos temporários.', icon: Shield },
  { title: 'Fácil de usar', description: 'Interface clara para usuários leigos, com mensagens de sucesso e erro objetivas.', icon: Sparkles },
  { title: 'Sem complicação', description: 'Ferramentas separadas por tarefa, com poucos passos e sem configurações confusas.', icon: FileOutput },
];

function HomePage() {
  return (
    <div className="space-y-12">
      <HeroSection />

      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700 dark:text-brand-400">Ferramentas</p>
          <h2 className="section-title">Quatro fluxos centrais, uma experiência consistente.</h2>
          <p className="section-copy max-w-3xl">
            O projeto foi estruturado para atender conversão, extração, compressão e digitalização com a mesma lógica visual e arquitetura modular.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {tools.map((tool) => (
            <ToolCard key={tool.href} {...tool} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-4">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div key={benefit.title} className="glass-panel p-6">
              <div className="inline-flex rounded-2xl bg-slate-900 p-3 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-slate-900 dark:text-slate-100">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">{benefit.description}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}

export default HomePage;
