import { useRef, useState } from 'react';
import { FileUp, ImagePlus, FileArchive } from 'lucide-react';

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
        className={`glass-panel flex w-full flex-col items-center justify-center gap-4 border-2 border-dashed px-6 py-12 text-center transition ${dragActive ? 'border-brand-400 bg-brand-50/80 dark:border-brand-400 dark:bg-slate-800/60' : 'border-slate-200 dark:border-slate-700'} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
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
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 text-white">
          <Icon className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</p>
          <p className="max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white">
          <FileUp className="h-4 w-4" />
          Arrastar e soltar ou escolher arquivos
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
