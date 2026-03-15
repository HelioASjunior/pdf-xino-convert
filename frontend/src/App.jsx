import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingSocialButtons from './components/FloatingSocialButtons';
import FirstVisitNotice from './components/FirstVisitNotice';
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

function App() {
  const { t } = useTranslation();

  const navigation = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.pdfTools'), href: '/pdf-tools' },
    { label: t('nav.imageTools'), href: '/image-tools' },
    { label: t('nav.documentTools'), href: '/document-tools' },
    { label: t('nav.utilities'), href: '/utilities' },
  ];

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="relative min-h-screen overflow-x-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] grid-pattern opacity-40" />
          <div className="relative w-full px-3 sm:px-5 lg:px-6">
            <div className="lg:grid lg:min-h-screen lg:grid-cols-[236px_minmax(0,1fr)] lg:items-start lg:gap-5 lg:py-5">
              <Header navigation={navigation} />

              <div className="flex min-h-screen flex-col lg:min-h-0">
                <main className="flex-1 py-8 md:py-10 lg:py-5">
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
          </div>
          <FloatingSocialButtons />
          <FirstVisitNotice />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}

function RouteFallback() {
  const { t } = useTranslation();
  return (
    <div className="glass-panel flex min-h-[200px] items-center justify-center p-8">
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t('header.loading')}</p>
    </div>
  );
}

export default App;
