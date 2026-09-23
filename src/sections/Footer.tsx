import { Download, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { GitHubIcon, LinkedInIcon, WhatsAppIcon } from '../components/BrandIcons';
import { ContactForm } from '../components/ContactForm';
import { site } from '../data/content';
import { qaResults, qaTotals } from '../data/qa';
import { useI18n } from '../hooks/useI18n';

/** Rodapé / contato. Carregado com React.lazy, mas incluído no HTML pré-renderizado. */
export default function Footer() {
  const { t } = useI18n();

  // O rodapé é a última parte a hidratar: a partir daqui a página inteira responde a
  // cliques e teclado. Os testes automatizados esperam por este sinal.
  useEffect(() => {
    document.documentElement.dataset.hydrated = 'true';
  }, []);

  const qaDetail = t.contact.qaBadgeDetail
    .replace('{total}', String(qaTotals.tests))
    .replace('{performance}', String(qaResults.lighthouse?.performance ?? '—'));

  const socials = [
    { href: site.linkedin, label: t.contact.linkedin, Icon: LinkedInIcon },
    { href: site.github, label: t.contact.github, Icon: GitHubIcon },
  ];

  // pb-32 no celular: o copyright fica acima do botão flutuante do FAQ.
  return (
    <footer
      id="contact"
      tabIndex={-1}
      aria-labelledby="contact-title"
      className="relative z-20 scroll-mt-16 border-t border-white/10 bg-black/80 pb-32 pt-24 backdrop-blur-xl md:pb-24"
    >
      <div className="container flex flex-col items-center text-center">
        <h2
          id="contact-title"
          className="mb-12 font-display text-5xl font-bold uppercase leading-[1] tracking-tighter md:text-8xl"
        >
          {t.contact.title}
        </h2>

        <div className="mb-12 flex w-full flex-col items-center justify-center gap-6 md:flex-row">
          <a
            href={`mailto:${site.email}`}
            className="interactive focus-ring max-w-full break-all rounded-full border border-white/30 px-6 py-4 text-base transition-all hover:bg-white hover:text-black sm:px-8 sm:text-lg md:text-2xl"
          >
            {site.email}
          </a>
          <a
            href={site.whatsapp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="interactive focus-ring inline-flex items-center gap-2 rounded-full border border-green-500/50 bg-green-600/20 px-8 py-4 text-base text-green-400 transition-all hover:bg-green-600 hover:text-white sm:text-lg md:text-2xl"
          >
            <WhatsAppIcon className="h-5 w-5 md:h-6 md:w-6" />
            {t.contact.whatsapp}
            <span className="sr-only"> {t.a11y.newTab}</span>
          </a>
        </div>

        <div className="mb-16 flex w-full justify-center">
          <ContactForm />
        </div>

        {/* Selo "este site é testado": leva ao dashboard dos testes. */}
        <a
          href="/qualidade"
          className="interactive focus-ring group mb-16 inline-flex max-w-full items-center gap-4 rounded-2xl border border-green-500/40 bg-green-500/10 px-5 py-4 text-left transition-colors hover:border-green-400 hover:bg-green-500/20"
        >
          <ShieldCheck aria-hidden="true" className="h-8 w-8 shrink-0 text-green-400" />
          <span>
            <span className="block font-display text-xl font-bold uppercase tracking-tight text-white group-hover:text-green-300">
              {t.contact.qaBadge}
            </span>
            {qaTotals.tests > 0 && <span className="block text-sm text-fg-muted">{qaDetail}</span>}
          </span>
        </a>

        <ul className="mb-16 flex gap-8">
          {socials.map(({ href, label, Icon }) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} ${t.a11y.newTab}`}
                className="interactive focus-ring block rounded-full border border-white/10 bg-white/5 p-4 transition-all hover:border-accent hover:bg-accent hover:text-black"
              >
                <Icon className="h-6 w-6" />
              </a>
            </li>
          ))}
        </ul>

        <a
          href={site.cv}
          download
          className="interactive focus-ring mb-12 inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm uppercase tracking-widest transition-all hover:bg-white hover:text-black"
        >
          <Download aria-hidden="true" className="h-4 w-4" />
          {t.contact.cv}
        </a>

        <p className="text-sm uppercase tracking-wide text-fg-subtle">
          {t.contact.copyright.replace('{year}', String(__BUILD_YEAR__))}
        </p>
        <p className="mt-2 text-xs text-fg-subtle">{t.contact.analyticsNote}</p>
      </div>
    </footer>
  );
}
