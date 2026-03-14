import { Github, Linkedin } from 'lucide-react';

const socialLinks = [
  {
    label: 'GitHub do projeto',
    href: 'https://github.com/HelioASjunior',
    icon: Github,
  },
  {
    label: 'LinkedIn de Hélio Júnior',
    href: 'https://www.linkedin.com/in/heliojunior1218/',
    icon: Linkedin,
  },
];

function FloatingSocialButtons() {
  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col gap-3 sm:bottom-6 sm:right-6">
      {socialLinks.map((item) => {
        const Icon = item.icon;

        return (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            aria-label={item.label}
            title={item.label}
            className="group inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-xl ring-1 ring-white/70 transition hover:-translate-y-0.5 hover:bg-brand-600 dark:ring-slate-800"
          >
            <Icon className="h-5 w-5 transition group-hover:scale-105" />
          </a>
        );
      })}
    </div>
  );
}

export default FloatingSocialButtons;
