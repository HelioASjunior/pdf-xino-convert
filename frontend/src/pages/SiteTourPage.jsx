import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const tourSteps = [
  {
    key: 'upload',
    titleKey: 'tour.stepUploadTitle',
    titleDefault: '1) Envie seu arquivo',
    descKey: 'tour.stepUploadDesc',
    descDefault:
      'Arraste o arquivo para a área principal e a plataforma identifica o formato para sugerir o melhor fluxo.',
  },
  {
    key: 'choose',
    titleKey: 'tour.stepChooseTitle',
    titleDefault: '2) Escolha a ferramenta ideal',
    descKey: 'tour.stepChooseDesc',
    descDefault:
      'Use as categorias de PDF, Imagem, Documentos, Áudio e Utilitários para chegar rápido na função certa.',
  },
  {
    key: 'download',
    titleKey: 'tour.stepDownloadTitle',
    titleDefault: '3) Ajuste e baixe',
    descKey: 'tour.stepDownloadDesc',
    descDefault:
      'Revise opções, execute o processamento no navegador e faça o download na hora com segurança.',
  },
];

const keyTools = [
  {
    nameKey: 'home.cat.imageToPdfTitle',
    nameDefault: 'Imagem para PDF',
    descKey: 'tour.toolImageToPdfDesc',
    descDefault: 'Junte várias imagens em um único PDF com ordenação simples.',
    href: '/imagem-para-pdf',
  },
  {
    nameKey: 'home.cat.pdfToImagesTitle',
    nameDefault: 'PDF para Imagens',
    descKey: 'tour.toolPdfToImagesDesc',
    descDefault: 'Extraia páginas em JPG ou PNG e baixe tudo em ZIP.',
    href: '/pdf-para-imagens',
  },
  {
    nameKey: 'home.cat.compressPdfTitle',
    nameDefault: 'Comprimir PDF',
    descKey: 'tour.toolCompressPdfDesc',
    descDefault: 'Reduza o tamanho dos arquivos para facilitar envio e compartilhamento.',
    href: '/comprimir-pdf',
  },
  {
    nameKey: 'nav.audioTools',
    nameDefault: 'Conversor de Áudio',
    descKey: 'tour.toolAudioDesc',
    descDefault: 'Converta formatos como MP3, WAV e OGG em poucos cliques.',
    href: '/conversor-audio',
  },
];

const learningPoints = [
  {
    title: 'Quando usar cada área',
    description:
      'PDF: juntar, dividir, comprimir e extrair páginas. Imagem: converter formatos e montar PDF. Documentos: Word, planilhas e textos para PDF. Áudio: conversão entre formatos. Utilitários: organização e downloads em lote.',
  },
  {
    title: 'Privacidade e processamento',
    description:
      'As ações principais acontecem localmente no navegador. Isso acelera tarefas do dia a dia e reduz exposição de arquivos em serviços externos.',
  },
  {
    title: 'Boas práticas para melhor resultado',
    description:
      'Use nomes de arquivos claros, revise a ordem das páginas antes do download e prefira lotes menores para manter o fluxo rápido em máquinas mais simples.',
  },
];

const socialLinks = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/heliojunior1218/',
    label: 'Falar no LinkedIn',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/HelioASjunior/',
    label: 'Ver projetos no GitHub',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/pdfxinoconvert',
    label: 'Acompanhar no Instagram',
  },
];

function SiteTourPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-sm sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          {t('tour.badge', { defaultValue: 'Guia rápido' })}
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-3xl leading-tight text-slate-900 sm:text-4xl">
          {t('tour.title', { defaultValue: 'Tour pelo site: entenda os principais recursos em 2 minutos.' })}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          {t('tour.intro', {
            defaultValue:
              'Esta página mostra de forma simples como navegar no PDF XinoConvert, quais ferramentas usar em cada cenário e qual o melhor ponto de partida.',
          })}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {tourSteps.map((step) => (
          <article key={step.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              {t(step.titleKey, { defaultValue: step.titleDefault })}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t(step.descKey, { defaultValue: step.descDefault })}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-5">
          <h2 className="font-display text-2xl text-slate-900">
            {t('tour.toolsTitle', { defaultValue: 'Ferramentas mais usadas' })}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t('tour.toolsDesc', {
              defaultValue: 'Comece por uma destas opções e avance para outras páginas conforme sua necessidade.',
            })}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {keyTools.map((tool) => (
            <Link
              key={tool.href}
              to={tool.href}
              className="rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">
                {t(tool.nameKey, { defaultValue: tool.nameDefault })}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {t(tool.descKey, { defaultValue: tool.descDefault })}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-2xl text-slate-900">
          {t('tour.moreInfoTitle', { defaultValue: 'Explicações rápidas que ajudam no uso diário' })}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          {t('tour.moreInfoDesc', {
            defaultValue:
              'Este resumo ajuda a escolher a ferramenta certa com menos tentativa e erro, principalmente para quem está começando agora.',
          })}
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {learningPoints.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-2xl text-slate-900">
          {t('tour.socialTitle', { defaultValue: 'Suas redes e contato' })}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          {t('tour.socialDesc', {
            defaultValue:
              'Se quiser acompanhar novidades, ver projetos ou entrar em contato, estes links levam direto para seus canais oficiais.',
          })}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              {social.label}
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
        <h2 className="font-display text-2xl text-slate-900">
          {t('tour.quickStartTitle', { defaultValue: 'Pronto para começar?' })}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          {t('tour.privacyTip', {
            defaultValue:
              'Todo o processamento principal acontece no seu navegador. Seus arquivos permanecem no seu dispositivo durante o uso.',
          })}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/imagem-para-pdf"
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            {t('tour.primaryCta', { defaultValue: 'Testar Imagem para PDF' })}
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {t('tour.secondaryCta', { defaultValue: 'Voltar para a página inicial' })}
          </Link>
        </div>
      </section>
    </div>
  );
}

export default SiteTourPage;
