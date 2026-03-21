import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingSocialButtons from './components/FloatingSocialButtons';
import FirstVisitNotice from './components/FirstVisitNotice';
import SeoManager from './components/SeoManager';
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
const PdfToWordPage = lazy(() => import('./pages/PdfToWordPage'));
const WordToPdfPage = lazy(() => import('./pages/WordToPdfPage'));
const MergePdfPage = lazy(() => import('./pages/MergePdfPage'));
const AudioConverterPage = lazy(() => import('./pages/AudioConverterPage'));
const SiteTourPage = lazy(() => import('./pages/SiteTourPage'));

function App() {
  const { t } = useTranslation();

  const navigation = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.pdfTools'), href: '/pdf-tools' },
    { label: t('nav.imageTools'), href: '/image-tools' },
    { label: t('nav.documentTools'), href: '/document-tools' },
    { label: t('nav.audioTools'), href: '/conversor-audio' },
    { label: t('nav.utilities'), href: '/utilities' },
  ];

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="relative min-h-screen [overflow-x:clip]">
          <SeoManager />
          <div className="pointer-events-none absolute right-0 top-0 h-[86vh] w-[54%] grid-pattern opacity-55" />
          <div className="relative mx-auto flex min-h-screen w-full max-w-[1360px] flex-col px-4 sm:px-6 lg:px-8">
            <Header navigation={navigation} />

            <div className="flex min-h-screen flex-col">
              <main className="flex-1 pt-24 pb-6 md:pb-10">
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
                    <Route path="/pdf-para-word" element={<PdfToWordPage />} />
                    <Route path="/word-para-pdf" element={<WordToPdfPage />} />
                    <Route path="/unir-pdf" element={<MergePdfPage />} />
                    <Route path="/conversor-audio" element={<AudioConverterPage />} />
                    <Route path="/tour-pelo-site" element={<SiteTourPage />} />
                    <Route path="*" element={<HomePage />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
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
