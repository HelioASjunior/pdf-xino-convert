import { AlertTriangle, CheckCircle2, LoaderCircle, ScanLine, WifiOff } from 'lucide-react';

const statusMap = {
  checking: {
    icon: LoaderCircle,
    tone: 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300',
    label: 'Verificando scanner...',
  },
  no_devices: {
    icon: WifiOff,
    tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    label: 'Nenhum scanner encontrado',
  },
  connected: {
    icon: CheckCircle2,
    tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    label: 'Scanner conectado',
  },
  scanning: {
    icon: ScanLine,
    tone: 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300',
    label: 'Digitalizacao em andamento',
  },
  done: {
    icon: CheckCircle2,
    tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    label: 'Digitalizacao concluida',
  },
  error: {
    icon: AlertTriangle,
    tone: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    label: 'Erro ao acessar o scanner',
  },
};

function ScannerStatusPanel({ state = 'checking', message, progress = 0 }) {
  const config = statusMap[state] || statusMap.checking;
  const Icon = config.icon;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start gap-3">
        <div className={`inline-flex rounded-2xl p-2 ${config.tone}`}>
          <Icon className={`h-5 w-5 ${state === 'checking' ? 'animate-spin' : ''}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{config.label}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message || config.label}</p>
        </div>
      </div>

      {state === 'scanning' ? (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{Math.round(progress)}%</p>
        </div>
      ) : null}
    </div>
  );
}

export default ScannerStatusPanel;
