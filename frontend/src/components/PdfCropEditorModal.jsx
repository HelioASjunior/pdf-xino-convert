import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Info, X } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import Button from './Button';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function pointFromEvent(event, element) {
  const rect = element.getBoundingClientRect();
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
  return {
    x: clamp(clientX - rect.left, 0, rect.width),
    y: clamp(clientY - rect.top, 0, rect.height),
  };
}

function normalizeRect(start, end, bounds) {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);

  const safeWidth = Math.max(12, Math.min(width, bounds.width - x));
  const safeHeight = Math.max(12, Math.min(height, bounds.height - y));

  return {
    x: clamp(x, 0, bounds.width - 12),
    y: clamp(y, 0, bounds.height - 12),
    width: safeWidth,
    height: safeHeight,
  };
}

function PdfCropEditorModal({ open, file, initialConfig, onClose, onApply }) {
  const canvasRef = useRef(null);
  const viewportRef = useRef({ width: 0, height: 0 });
  const dragStartRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialConfig?.currentPage || 1);
  const [applyMode, setApplyMode] = useState(initialConfig?.applyMode || 'all');
  const [selection, setSelection] = useState(null);

  const canRender = open && file;

  useEffect(() => {
    if (!canRender) return;

    let cancelled = false;

    const loadPdf = async () => {
      setIsLoading(true);
      setError('');
      try {
        const buffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const loaded = await loadingTask.promise;
        if (cancelled) return;
        setPdfDoc(loaded);
        setPageCount(loaded.numPages);
        setCurrentPage(1);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Falha ao abrir o PDF para recorte.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [canRender, file]);

  useEffect(() => {
    if (!pdfDoc || !open) return;

    let cancelled = false;

    const renderPage = async () => {
      setIsLoading(true);
      setError('');
      try {
        const page = await pdfDoc.getPage(currentPage);
        const rawViewport = page.getViewport({ scale: 1 });
        const maxWidth = 760;
        const scale = Math.max(0.8, Math.min(2, maxWidth / rawViewport.width));
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        const context = canvas.getContext('2d', { alpha: false });
        if (!context) {
          throw new Error('Não foi possível criar o canvas de visualização.');
        }

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        viewportRef.current = { width: canvas.width, height: canvas.height };

        await page.render({ canvasContext: context, viewport }).promise;

        if (!cancelled) {
          const initialArea = initialConfig?.area
            ? {
                x: initialConfig.area.x * canvas.width,
                y: initialConfig.area.y * canvas.height,
                width: initialConfig.area.width * canvas.width,
                height: initialConfig.area.height * canvas.height,
              }
            : { x: 40, y: 40, width: Math.max(120, canvas.width * 0.5), height: Math.max(120, canvas.height * 0.5) };

          setSelection(initialArea);
        }
      } catch (renderError) {
        if (!cancelled) {
          setError(renderError.message || 'Falha ao renderizar a página para recorte.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    renderPage();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, currentPage, open, initialConfig]);

  const selectionStyle = useMemo(() => {
    if (!selection) return null;
    return {
      left: `${selection.x}px`,
      top: `${selection.y}px`,
      width: `${selection.width}px`,
      height: `${selection.height}px`,
    };
  }, [selection]);

  const startDrag = (event) => {
    if (!selection || !canvasRef.current) return;
    const point = pointFromEvent(event, canvasRef.current);
    dragStartRef.current = point;
    setSelection((prev) => normalizeRect(point, point, viewportRef.current));
  };

  const moveDrag = (event) => {
    if (!dragStartRef.current || !canvasRef.current) return;
    const point = pointFromEvent(event, canvasRef.current);
    setSelection(normalizeRect(dragStartRef.current, point, viewportRef.current));
  };

  const endDrag = () => {
    dragStartRef.current = null;
  };

  const resetAll = () => {
    const bounds = viewportRef.current;
    setSelection({ x: 0, y: 0, width: bounds.width, height: bounds.height });
    setApplyMode('all');
    setCurrentPage(1);
  };

  const applyCrop = () => {
    if (!selection || !viewportRef.current.width || !viewportRef.current.height) return;

    const { width, height } = viewportRef.current;
    const area = {
      x: clamp(selection.x / width, 0, 1),
      y: clamp(selection.y / height, 0, 1),
      width: clamp(selection.width / width, 0.02, 1),
      height: clamp(selection.height / height, 0.02, 1),
    };

    onApply({ area, applyMode, currentPage });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex bg-black/45 backdrop-blur-sm">
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className="flex min-h-0 flex-1 items-center justify-center bg-slate-200/90 p-6 dark:bg-slate-950/85">
          <div className="relative max-h-full max-w-full overflow-auto">
            <div
              className="relative mx-auto cursor-crosshair select-none"
              onMouseDown={startDrag}
              onMouseMove={moveDrag}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
            >
              <canvas ref={canvasRef} className="block max-w-full rounded-xl border border-slate-300 bg-white shadow-soft dark:border-slate-700" />

              {selectionStyle ? (
                <>
                  <div className="pointer-events-none absolute inset-0 bg-black/35" />
                  <div
                    className="pointer-events-none absolute z-10 border-2 border-brand-500 bg-brand-200/20"
                    style={selectionStyle}
                  >
                    <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-brand-500" />
                    <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-brand-500" />
                    <span className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-full bg-brand-500" />
                    <span className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-full bg-brand-500" />
                  </div>
                </>
              ) : null}
            </div>

            {isLoading ? <p className="mt-3 text-center text-sm text-slate-500">Renderizando página...</p> : null}
            {error ? <p className="mt-3 text-center text-sm text-red-600">{error}</p> : null}
          </div>
        </section>

        <aside className="w-full border-t border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 lg:w-[430px] lg:border-l lg:border-t-0">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-4xl font-bold text-slate-900 dark:text-slate-100">Recortar PDF</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Fechar recortador"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="rounded-2xl bg-brand-50 px-4 py-3 text-sm leading-6 text-slate-700 dark:bg-brand-900/30 dark:text-slate-200">
            <p className="inline-flex items-center gap-2"><Info className="h-4 w-4 text-brand-600 dark:text-brand-300" /> Clique e arraste para selecionar a área que deseja manter. Redimensione, se necessário.</p>
          </div>

          <button
            type="button"
            onClick={resetAll}
            className="mt-4 text-sm font-semibold text-red-600 underline underline-offset-2"
          >
            Redefinir tudo
          </button>

          <div className="mt-6 space-y-3">
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Páginas:</p>
            <label className="flex items-center gap-3 text-2xl text-slate-700 dark:text-slate-200">
              <input
                type="radio"
                name="crop-mode"
                checked={applyMode === 'all'}
                onChange={() => setApplyMode('all')}
                className="h-5 w-5"
              />
              Todas as páginas
            </label>
            <label className="flex items-center gap-3 text-2xl text-slate-700 dark:text-slate-200">
              <input
                type="radio"
                name="crop-mode"
                checked={applyMode === 'current'}
                onChange={() => setApplyMode('current')}
                className="h-5 w-5"
              />
              Página atual
            </label>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => clamp(prev - 1, 1, pageCount))}
              className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Página {currentPage} / {pageCount}</p>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => clamp(prev + 1, 1, pageCount))}
              className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <Button className="mt-10 w-full bg-red-600 hover:bg-red-500" onClick={applyCrop}>
            Recortar PDF
          </Button>
        </aside>
      </div>
    </div>
  );
}

export default PdfCropEditorModal;
