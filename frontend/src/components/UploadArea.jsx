import { useRef, useState } from 'react';
import { CheckCircle2, FileUp, ImagePlus, FileArchive, ShieldCheck } from 'lucide-react';

function UploadArea({
  title,
  description,
  accept,
  multiple = false,
  onFilesSelected,
  error,
  disabled = false,
  mode = 'image',
}) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const Icon = mode === 'pdf' ? FileArchive : ImagePlus;
  const tags = [
    multiple ? 'Upload múltiplo' : 'Arquivo único',
    'Envio guiado',
    'Ação imediata',
  ];

  const handleSelection = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length) {
      onFilesSelected(files);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        className={`glass-panel flex w-full flex-col items-center justify-center gap-5 border-2 border-dashed px-6 py-10 text-center transition ${dragActive ? 'border-brand-400 bg-brand-50/80 shadow-lg dark:border-brand-400 dark:bg-slate-800/60' : 'border-slate-200 dark:border-slate-700'} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          if (!disabled) {
            handleSelection(event.dataTransfer.files);
          }
        }}
        disabled={disabled}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 text-white shadow-soft dark:bg-slate-700">
          <Icon className="h-8 w-8" />
        </div>
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            envio organizado
          </div>
          <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</p>
          <p className="max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:ring-slate-700">
              {tag}
            </span>
          ))}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white">
          <FileUp className="h-4 w-4" />
          Arrastar e soltar ou escolher arquivos
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> seleção rápida</span>
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> interface orientada</span>
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> resultado imediato</span>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={(event) => handleSelection(event.target.files)}
      />

      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}

export default UploadArea;
