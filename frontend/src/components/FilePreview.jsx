import { GripVertical, ImageIcon, Trash2, FileText } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatBytes } from '../utils/formatters';

function detectLabel(item) {
  if (item.kind === 'pdf' || item.file.type === 'application/pdf') {
    return 'PDF';
  }

  if (item.file.type.startsWith('image/')) {
    return 'Imagem';
  }

  return 'Arquivo';
}

function extensionOf(fileName) {
  return fileName.includes('.') ? fileName.split('.').pop().toUpperCase() : 'ARQ';
}

function PreviewContent({
  item,
  onRemove,
  dragHandleProps,
  showRemove,
  orderBadge,
  previewClassName,
  iconClassName,
  onPreview,
}) {
  const typeLabel = detectLabel(item);
  const extension = extensionOf(item.file.name);

  return (
    <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-soft transition hover:border-slate-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600">
      {dragHandleProps ? (
        <button type="button" className="rounded-2xl bg-slate-100 p-2 text-slate-400 dark:bg-slate-700 dark:text-slate-500" {...dragHandleProps}>
          <GripVertical className="h-5 w-5" />
        </button>
      ) : null}

      <button
        type="button"
        onClick={onPreview ? () => onPreview(item) : undefined}
        className={`relative overflow-hidden rounded-2xl bg-slate-100 text-left dark:bg-slate-700 ${previewClassName} ${onPreview ? 'cursor-zoom-in ring-0 transition hover:ring-2 hover:ring-brand-300 dark:hover:ring-brand-500' : ''}`}
      >
        {item.preview ? (
          <img src={item.preview} alt={item.file.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-500">
            {item.kind === 'pdf' ? <FileText className={iconClassName} /> : <ImageIcon className={iconClassName} />}
          </div>
        )}
        {orderBadge ? (
          <span className="absolute right-1 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
            {orderBadge}
          </span>
        ) : null}
        <span className="absolute bottom-1 left-1 rounded-lg bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
          {extension}
        </span>
      </button>

      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{item.file.name}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">{typeLabel}</span>
          <span>{formatBytes(item.file.size)}</span>
        </div>
      </div>

      {showRemove ? (
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="rounded-2xl bg-rose-50 p-3 text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-400 dark:hover:bg-rose-900"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

function SortableFilePreview({ item, onRemove, showRemove, orderBadge, previewClassName, iconClassName, onPreview }) {
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
      <PreviewContent
        item={item}
        onRemove={onRemove}
        dragHandleProps={{ ...attributes, ...listeners }}
        showRemove={showRemove}
        orderBadge={orderBadge}
        previewClassName={previewClassName}
        iconClassName={iconClassName}
        onPreview={onPreview}
      />
    </div>
  );
}

function FilePreview({
  item,
  onRemove,
  sortable = false,
  showRemove = true,
  orderBadge = null,
  previewClassName = 'h-16 w-16',
  iconClassName = 'h-7 w-7',
  onPreview = null,
}) {
  if (sortable) {
    return (
      <SortableFilePreview
        item={item}
        onRemove={onRemove}
        showRemove={showRemove}
        orderBadge={orderBadge}
        previewClassName={previewClassName}
        iconClassName={iconClassName}
        onPreview={onPreview}
      />
    );
  }

  return (
    <PreviewContent
      item={item}
      onRemove={onRemove}
      showRemove={showRemove}
      orderBadge={orderBadge}
      previewClassName={previewClassName}
      iconClassName={iconClassName}
      onPreview={onPreview}
    />
  );
}

export default FilePreview;
