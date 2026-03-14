import { GripVertical, ImageIcon, Trash2, FileText } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatBytes } from '../utils/formatters';

function PreviewContent({ item, onRemove, dragHandleProps }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-800">
      {dragHandleProps ? (
        <button type="button" className="text-slate-400 dark:text-slate-500" {...dragHandleProps}>
          <GripVertical className="h-5 w-5" />
        </button>
      ) : null}

      <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-700">
        {item.preview ? (
          <img src={item.preview} alt={item.file.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-500">
            {item.kind === 'pdf' ? <FileText className="h-7 w-7" /> : <ImageIcon className="h-7 w-7" />}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{item.file.name}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatBytes(item.file.size)}</p>
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="rounded-2xl bg-rose-50 p-3 text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-400 dark:hover:bg-rose-900"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function SortableFilePreview({ item, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="rounded-3xl"
    >
      <PreviewContent item={item} onRemove={onRemove} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

function FilePreview({ item, onRemove, sortable = false }) {
  if (sortable) {
    return <SortableFilePreview item={item} onRemove={onRemove} />;
  }

  return <PreviewContent item={item} onRemove={onRemove} />;
}

export default FilePreview;
