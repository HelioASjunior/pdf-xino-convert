import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ImageToPdfPage from './pages/ImageToPdfPage';
import PdfToImagesPage from './pages/PdfToImagesPage';
import CompressPdfPage from './pages/CompressPdfPage';
import ScanDocumentPage from './pages/ScanDocumentPage';
import { ToastProvider } from './hooks/useToast.jsx';
import { ThemeProvider } from './hooks/useTheme';

const navigation = [
  { label: 'Início', href: '/' },
  { label: 'Imagem para PDF', href: '/imagem-para-pdf' },
  { label: 'PDF para Imagens', href: '/pdf-para-imagens' },
  { label: 'Comprimir PDF', href: '/comprimir-pdf' },
  { label: 'Escanear Documento', href: '/escanear-documento' },
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
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/imagem-para-pdf" element={<ImageToPdfPage />} />
                <Route path="/pdf-para-imagens" element={<PdfToImagesPage />} />
                <Route path="/comprimir-pdf" element={<CompressPdfPage />} />
                <Route path="/escanear-documento" element={<ScanDocumentPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
