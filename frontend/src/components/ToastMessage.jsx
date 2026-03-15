import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const toneMap = {
  success: {
    icon: CheckCircle2,
    classes: 'border-emerald-100 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  },
  error: {
    icon: AlertTriangle,
    classes: 'border-rose-100 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200',
  },
  info: {
    icon: Info,
    classes: 'border-brand-100 bg-brand-50 text-brand-800 dark:border-brand-700 dark:bg-brand-900 dark:text-brand-200',
  },
};

function ToastMessage({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const tone = toneMap[toast.type || 'info'];
        const Icon = tone.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto animate-floatIn rounded-3xl border px-4 py-4 shadow-soft ${tone.classes}`}
          >
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                <p className="mt-1 text-sm opacity-90">{toast.message}</p>
              </div>
              <button type="button" onClick={() => onDismiss(toast.id)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ToastMessage;
