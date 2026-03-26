import { Link } from 'react-router-dom';
import { Compass, Home, Plus, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const iphoneSteps = [
  {
    key: 'openSafari',
    icon: Compass,
    image: {
      real: 'iphone-install-step-1-real.png',
      fallback: 'iphone-install-step-1.svg',
    },
    titleKey: 'iphoneInstall.step1Title',
    titleDefault: '1) Abra o site no Safari',
    descKey: 'iphoneInstall.step1Desc',
    descDefault: 'No iPhone, abra https://pdfxino.com.br no Safari. Outros navegadores no iOS podem ocultar opções de atalho.',
    visualLabelKey: 'iphoneInstall.step1Visual',
    visualLabelDefault: 'Barra do Safari com o endereço pdfxino.com.br',
  },
  {
    key: 'tapShare',
    icon: Share2,
    image: {
      real: 'iphone-install-step-2-real.png',
      fallback: 'iphone-install-step-2.svg',
    },
    titleKey: 'iphoneInstall.step2Title',
    titleDefault: '2) Toque no botão Compartilhar',
    descKey: 'iphoneInstall.step2Desc',
    descDefault: 'Toque no ícone de compartilhar na barra do Safari para abrir o menu de ações da página.',
    visualLabelKey: 'iphoneInstall.step2Visual',
    visualLabelDefault: 'Menu do iOS com o ícone de compartilhar em destaque',
  },
  {
    key: 'addToHome',
    icon: Plus,
    image: {
      real: 'iphone-install-step-3-real.png',
      fallback: 'iphone-install-step-3.svg',
    },
    titleKey: 'iphoneInstall.step3Title',
    titleDefault: '3) Escolha Adicionar à Tela de Início',
    descKey: 'iphoneInstall.step3Desc',
    descDefault: 'No menu, role até encontrar Adicionar à Tela de Início. Confirme para criar o atalho do PDF Xino.',
    visualLabelKey: 'iphoneInstall.step3Visual',
    visualLabelDefault: 'Opção Adicionar à Tela de Início no menu do Safari',
  },
  {
    key: 'confirm',
    icon: Home,
    image: {
      real: 'iphone-install-step-4-real.png',
      fallback: 'iphone-install-step-4.svg',
    },
    titleKey: 'iphoneInstall.step4Title',
    titleDefault: '4) Finalize e abra pela tela inicial',
    descKey: 'iphoneInstall.step4Desc',
    descDefault: 'Depois de confirmar, o ícone aparece na tela inicial. Toque nele para abrir o app web diretamente.',
    visualLabelKey: 'iphoneInstall.step4Visual',
    visualLabelDefault: 'Tela inicial com o atalho do PDF Xino instalado',
  },
];

function InstallOnIphonePage() {
  const { t } = useTranslation();
  const visualBase = `${import.meta.env.BASE_URL}assets/visuals`;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="rounded-3xl border border-cyan-200/80 bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-6 shadow-sm sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          {t('iphoneInstall.badge', { defaultValue: 'Instalação no iPhone' })}
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-3xl leading-tight text-slate-900 sm:text-4xl">
          {t('iphoneInstall.title', {
            defaultValue: 'Como adicionar o PDF Xino na tela inicial do iPhone',
          })}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          {t('iphoneInstall.intro', {
            defaultValue:
              'O iOS não usa o aviso automático de instalação. Por isso, o processo é manual pelo Safari. Siga estas etapas com exemplos visuais e finalize em menos de 1 minuto.',
          })}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {iphoneSteps.map((step) => (
          <article key={step.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700">
              <step.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              {t(step.titleKey, { defaultValue: step.titleDefault })}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t(step.descKey, { defaultValue: step.descDefault })}
            </p>

            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <div className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                {t('iphoneInstall.visualLabel', { defaultValue: 'Exemplo visual' })}
              </div>
              <div className="mx-auto mt-3 w-full max-w-[340px] overflow-hidden rounded-lg border border-slate-200 bg-white">
                <img
                  src={`${visualBase}/${step.image.real}`}
                  alt={t(step.visualLabelKey, { defaultValue: step.visualLabelDefault })}
                  className="aspect-[9/19.5] h-full w-full object-cover object-top"
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = `${visualBase}/${step.image.fallback}`;
                  }}
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                {t(step.visualLabelKey, { defaultValue: step.visualLabelDefault })}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-2xl text-slate-900">
          {t('iphoneInstall.tipsTitle', { defaultValue: 'Dicas importantes' })}
        </h2>
        <ul className="mt-3 grid gap-3 text-sm leading-6 text-slate-600 md:grid-cols-2">
          <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            {t('iphoneInstall.tip1', {
              defaultValue: 'Se a opção não aparecer, confirme se você abriu o site no Safari e não em modo anônimo.',
            })}
          </li>
          <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            {t('iphoneInstall.tip2', {
              defaultValue: 'Após adicionar, o PDF Xino abre em tela dedicada e fica mais rápido para acessar no dia a dia.',
            })}
          </li>
        </ul>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            {t('iphoneInstall.backHome', { defaultValue: 'Voltar para a página inicial' })}
          </Link>
          <a
            href="https://pdfxino.com.br"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {t('iphoneInstall.openSite', { defaultValue: 'Abrir site para testar agora' })}
          </a>
        </div>
      </section>
    </div>
  );
}

export default InstallOnIphonePage;