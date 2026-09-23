import { ArrowUpRight, FileText } from 'lucide-react';
import { Picture } from '../components/Picture';
import { PillLink } from '../components/PillLink';
import { RevealOnScroll } from '../components/RevealOnScroll';
import { site } from '../data/content';
import { useI18n } from '../hooks/useI18n';

export function Work() {
  const { t } = useI18n();

  return (
    <section
      id="work"
      tabIndex={-1}
      aria-labelledby="work-title"
      className="relative scroll-mt-16 border-t border-white/10 bg-surface/95 py-20 backdrop-blur-xl"
    >
      <div className="container">
        <h2 id="work-title" className="section-label mb-4">
          {t.work.label}
        </h2>
      </div>

      <ol>
        {site.cases.map((entry) => {
          const { slug, image } = entry;
          const item = t.work.cases[slug];
          const url = 'url' in entry ? entry.url : undefined;
          return (
            <li
              key={slug}
              className="group relative w-full border-t border-white/10 py-12 transition-colors hover:bg-white/5 md:py-16"
            >
              <RevealOnScroll className="container flex flex-col items-center justify-between gap-8 md:flex-row">
                <div className="w-full md:w-1/2">
                  <p className="mb-2 block font-mono text-sm text-accent">
                    {item.period} — {item.category}
                  </p>
                  <h3 className="font-display text-4xl font-bold uppercase leading-[1] tracking-tighter transition-colors group-hover:text-accent md:text-6xl">
                    {item.title}
                  </h3>
                  <p className="mt-4 max-w-md text-lg text-fg-muted">{item.description}</p>
                  {item.clients && (
                    <p className="mt-4 max-w-md leading-relaxed text-fg-muted">
                      <span className="font-semibold text-accent">{t.work.clientsLabel}:</span>{' '}
                      {item.clients.join(' · ')}
                    </p>
                  )}
                  {item.result && (
                    <p className="mt-4 max-w-md font-semibold leading-relaxed text-white">
                      <span className="text-accent">{t.work.resultLabel}:</span> {item.result}
                    </p>
                  )}
                  <ul aria-label={t.work.tagsLabel} className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border border-white/15 px-3 py-1 font-mono text-xs text-fg-subtle"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                  {item.linkLabel &&
                    (url ? (
                      <PillLink
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        icon={ArrowUpRight}
                        className="mt-6"
                      >
                        {item.linkLabel}
                        <span className="sr-only"> {t.a11y.newTab}</span>
                      </PillLink>
                    ) : (
                      // Sem URL ainda: texto comum, sem <a> (preencha `url` em site.cases).
                      // Com URL, o PillLink abre em nova aba — inclusive PDFs hospedados em public/.
                      <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-dashed border-white/20 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-fg-subtle">
                        <FileText aria-hidden="true" className="h-4 w-4" />
                        {item.linkLabel} · {t.work.linkPending}
                      </p>
                    ))}
                </div>

                <div className="aspect-video w-full overflow-hidden rounded-lg border border-white/10 shadow-2xl md:w-1/3">
                  <Picture
                    image={image}
                    alt={item.imageAlt}
                    sizes="(min-width: 1536px) 490px, (min-width: 768px) 33vw, calc(100vw - 3rem)"
                    className="h-full w-full object-cover"
                  />
                </div>
              </RevealOnScroll>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
