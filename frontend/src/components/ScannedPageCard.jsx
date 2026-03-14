import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Crop, Download, GripVertical, RotateCw, Trash2 } from 'lucide-react';
import Button from './Button';
import { formatBytes } from '../utils/formatters';

function ScannedPageCardContent({ page, index, onRotate, onCrop, onRemove, onDownload, dragHandleProps }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button type="button" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700" {...dragHandleProps} aria-label={`Reordenar pagina ${index + 1}`}>
            <GripVertical className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Pagina {index + 1}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{page.file.name} • {formatBytes(page.file.size)}</p>
          </div>
        </div>
        {page.cropApplied ? <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">Recorte aplicado</span> : null}
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-700">
        <img src={page.preview} alt={`Preview da pagina ${index + 1}`} className="h-56 w-full object-cover" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="ghost" className="gap-2" onClick={onRotate}>
          <RotateCw className="h-4 w-4" />
          Rotacionar
        </Button>
        <Button variant="ghost" className="gap-2" onClick={onCrop}>
          <Crop className="h-4 w-4" />
          Recortar
        </Button>
        <Button variant="ghost" className="gap-2" onClick={onDownload}>
          <Download className="h-4 w-4" />
          Baixar
        </Button>
        <Button variant="danger" className="gap-2" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
          Remover
        </Button>
      </div>
    </div>
  );
}

function ScannableSortableCard({ page, index, onRotate, onCrop, onRemove, onDownload }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: page.id });

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <ScannedPageCardContent
        page={page}
        index={index}
        onRotate={onRotate}
        onCrop={onCrop}
        onRemove={onRemove}
        onDownload={onDownload}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default ScannableSortableCard;
