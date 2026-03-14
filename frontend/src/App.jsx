import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import { ToastProvider } from './hooks/useToast.jsx';
import { ThemeProvider } from './hooks/useTheme';

const PdfToolsPage = lazy(() => import('./pages/PdfToolsPage'));
const ImageToolsPage = lazy(() => import('./pages/ImageToolsPage'));
const DocumentToolsPage = lazy(() => import('./pages/DocumentToolsPage'));
const UtilitiesPage = lazy(() => import('./pages/UtilitiesPage'));
const ImageToPdfPage = lazy(() => import('./pages/ImageToPdfPage'));
const PdfToImagesPage = lazy(() => import('./pages/PdfToImagesPage'));
const CompressPdfPage = lazy(() => import('./pages/CompressPdfPage'));
const ScanDocumentPage = lazy(() => import('./pages/ScanDocumentPage'));

const navigation = [
  { label: 'Início', href: '/' },
  { label: 'Ferramentas de PDF', href: '/pdf-tools' },
  { label: 'Ferramentas de Imagem', href: '/image-tools' },
  { label: 'Ferramentas de Documentos', href: '/document-tools' },
  { label: 'Utilitários', href: '/utilities' },
];

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] grid-pattern opacity-40" />
          <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
            <Header navigation={navigation} />
            <main className="flex-1 py-10 md:py-14">
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/pdf-tools" element={<PdfToolsPage />} />
                  <Route path="/image-tools" element={<ImageToolsPage />} />
                  <Route path="/document-tools" element={<DocumentToolsPage />} />
                  <Route path="/utilities" element={<UtilitiesPage />} />
                  <Route path="/imagem-para-pdf" element={<ImageToPdfPage />} />
                  <Route path="/pdf-para-imagens" element={<PdfToImagesPage />} />
                  <Route path="/comprimir-pdf" element={<CompressPdfPage />} />
                  <Route path="/escanear-documento" element={<ScanDocumentPage />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}

function RouteFallback() {
  return (
    <div className="glass-panel flex min-h-[200px] items-center justify-center p-8">
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Carregando ferramenta...</p>
    </div>
  );
}

export default App;
