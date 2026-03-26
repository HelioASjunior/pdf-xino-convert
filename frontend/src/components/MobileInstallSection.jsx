import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function MobileInstallSection() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [androidAvailable, setAndroidAvailable] = useState(false);
  const [status, setStatus] = useState('idle');

  const isAndroid = useMemo(() => /android/i.test(window.navigator.userAgent), []);

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setAndroidAvailable(true);
      setStatus('ready');
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setAndroidAvailable(false);
      setStatus('installed');
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  async function handleAndroidInstall() {
    if (!deferredPrompt) {
      setStatus('unavailable');
      // Mostrar instrução de como fazer manualmente
      alert('Se o prompt automático não aparecer, siga este caminho no Chrome:\n1. Toque no menu (⋮) no canto superior direito\n2. Selecione "Instalar app"\n3. Confirme a instalação\n\nOu acesse mais tarde quando o navegador oferecer a opção automaticamente.');
      return;
    }

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      setStatus('accepted');
      setAndroidAvailable(false);
      setDeferredPrompt(null);
      return;
    }

    setStatus('dismissed');
    setDeferredPrompt(null);
    setAndroidAvailable(false);
  }

  function getAndroidHelper() {
    if (status === 'installed') {
      return t('installSection.androidInstalled', {
        defaultValue: 'Aplicativo instalado com sucesso no seu dispositivo.',
      });
    }

    if (status === 'accepted') {
      return t('installSection.androidAccepted', {
        defaultValue: 'Instalação iniciada. O atalho deve aparecer na sua tela inicial.',
      });
    }

    if (status === 'dismissed') {
      return t('installSection.androidDismissed', {
        defaultValue: 'Instalação cancelada. Você pode tentar novamente quando o navegador liberar o aviso.',
      });
    }

    if (status === 'unavailable' || (isAndroid && !androidAvailable)) {
      return t('installSection.androidUnavailable', {
        defaultValue: 'No Android, abra no Chrome e use o menu para instalar caso o botão não esteja habilitado.',
      });
    }

    return t('installSection.androidReady', {
      defaultValue: 'Quando disponível, o botão abre o instalador nativo do Android.',
    });
  }

  return (
    <section
      aria-labelledby="install-mobile-title"
      className="rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-6 shadow-sm md:p-8"
    >
      <div className="space-y-4">
        <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          <Smartphone className="h-4 w-4" />
          {t('installSection.kicker', { defaultValue: 'Instale no celular' })}
        </p>
        <h2 id="install-mobile-title" className="font-display text-2xl text-slate-900 sm:text-3xl">
          {t('installSection.title', {
            defaultValue: 'Use o PDF Xino direto da tela inicial, sem precisar digitar o site toda vez.',
          })}
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          {t('installSection.intro', {
            defaultValue:
              'No Android, voce pode instalar com um toque quando o navegador liberar o recurso. No iPhone, veja o passo a passo para adicionar ao inicio com seguranca.',
          })}
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {t('installSection.androidLabel', { defaultValue: 'Android' })}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            {t('installSection.androidTitle', { defaultValue: 'Instalação rápida no Android' })}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t('installSection.androidDesc', {
              defaultValue:
                'Toque no botão abaixo para abrir a caixa de diálogo nativa de instalação quando o navegador suportar o recurso.',
            })}
          </p>
          <button
            type="button"
            onClick={handleAndroidInstall}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Download className="h-4 w-4" />
            {t('installSection.androidButton', { defaultValue: 'Instalar no Android' })}
          </button>
          <p className="mt-3 text-xs leading-5 text-slate-500">{getAndroidHelper()}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {t('installSection.iphoneLabel', { defaultValue: 'iPhone' })}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            {t('installSection.iphoneTitle', { defaultValue: 'Guia para adicionar no iPhone' })}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t('installSection.iphoneDesc', {
              defaultValue:
                'No Safari do iOS, a instalação é manual. Criamos uma página com exemplos visuais para você concluir em menos de 1 minuto.',
            })}
          </p>
          <Link
            to="/instalar-no-iphone"
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {t('installSection.iphoneButton', { defaultValue: 'Ver passo a passo no iPhone' })}
          </Link>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {t('installSection.iphoneHelper', {
              defaultValue: 'Abre uma página com etapas, exemplos e orientações para o Safari no iOS.',
            })}
          </p>
        </article>
      </div>
    </section>
  );
}

export default MobileInstallSection;