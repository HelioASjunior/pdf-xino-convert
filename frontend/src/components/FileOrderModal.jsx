import { useEffect, useState } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { GripVertical, X } from 'lucide-react';
import FilePreview from './FilePreview';
import Button from './Button';

function FileOrderModal({
  open,
  title = 'Organizar ordem dos arquivos',
  description = 'Arraste para cima ou para baixo para definir a ordem final.',
  items,
  onClose,
  onConfirm,
}) {
  const [draftItems, setDraftItems] = useState([]);
  const [viewerItem, setViewerItem] = useState(null);
  const [viewerUrl, setViewerUrl] = useState('');
  const dndSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    if (!open) return;
    setDraftItems(items);
  }, [open, items]);

  useEffect(() => {
    if (!viewerItem) {
      setViewerUrl('');
      return;
    }

    if (viewerItem.file.type === 'application/pdf') {
      const fileUrl = URL.createObjectURL(viewerItem.file);
      setViewerUrl(fileUrl);

      return () => {
        URL.revokeObjectURL(fileUrl);
      };
    }

    setViewerUrl(viewerItem.preview || '');
  }, [viewerItem]);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setDraftItems((current) => {
      const oldIndex = current.findIndex((item) => item.id === active.id);
      const newIndex = current.findIndex((item) => item.id === over.id);
      return arrayMove(current, oldIndex, newIndex);
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm sm:p-6">
      <div className="glass-panel flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-700 sm:px-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700 dark:text-brand-400">Prévia e ordem final</p>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Fechar organizador"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <GripVertical className="h-3.5 w-3.5" />
            Arraste os cards para reordenar
          </div>

          <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={draftItems.map((item) => item.id)} strategy={rectSortingStrategy}>
              <div className="grid gap-4 lg:grid-cols-2">
                {draftItems.map((item, index) => (
                  <FilePreview
                    key={item.id}
                    item={item}
                    onRemove={() => {}}
                    sortable
                    showRemove={false}
                    orderBadge={index + 1}
                    previewClassName="h-44 w-32 sm:h-52 sm:w-40 lg:h-64 lg:w-48"
                    iconClassName="h-16 w-16"
                    onPreview={setViewerItem}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <footer className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-700 sm:flex-row sm:justify-end sm:px-6">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onConfirm(draftItems)}>Confirmar ordem e continuar</Button>
        </footer>
      </div>

      {viewerItem ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-3 sm:p-6">
          <div className="flex h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700 sm:px-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-400">Visualizacao ampliada</p>
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{viewerItem.file.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewerItem(null)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Fechar visualizacao"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-auto bg-slate-100 p-3 dark:bg-slate-950 sm:p-4">
              {viewerItem.file.type === 'application/pdf' ? (
                <iframe
                  title={`Preview ${viewerItem.file.name}`}
                  src={viewerUrl}
                  className="h-full w-full rounded-2xl border border-slate-300 bg-white dark:border-slate-700"
                />
              ) : (
                <div className="flex min-h-full items-start justify-center">
                  <img
                    src={viewerUrl}
                    alt={viewerItem.file.name}
                    className="max-w-none rounded-2xl border border-slate-300 bg-white shadow-soft dark:border-slate-700"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default FileOrderModal;