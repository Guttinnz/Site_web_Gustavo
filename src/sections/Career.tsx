import { ChevronDown } from 'lucide-react';
import { RevealOnScroll } from '../components/RevealOnScroll';
import { useI18n } from '../hooks/useI18n';

/** Linha do tempo de cargos (o que os cases não mostram: função, empresa e período). */
export function Career() {
  const { t } = useI18n();

  return (
    <section
      id="career"
      tabIndex={-1}
      aria-labelledby="career-title"
      className="relative scroll-mt-16 border-t border-white/10 bg-surface/95 py-20 backdrop-blur-xl"
    >
      <div className="container">
        <h2 id="career-title" className="section-label mb-10">
          {t.career.label}
        </h2>

        <ol className="border-b border-white/10">
          {t.career.items.map((item) => (
            <li key={item.period} className="border-t border-white/10 py-8 md:py-10">
              <RevealOnScroll className="grid gap-3 md:grid-cols-[14rem_1fr] md:gap-10">
                <p className="font-mono text-sm text-accent md:pt-2">{item.period}</p>
                <div>
                  <h3 className="font-display text-3xl font-bold uppercase leading-[1] tracking-tight md:text-4xl">
                    {item.role}
                  </h3>
                  <p className="mt-3 font-semibold text-white">
                    {item.company}
                    {item.context && <span className="font-normal text-fg-subtle"> · {item.context}</span>}
                  </p>
                  <p className="mt-3 max-w-2xl leading-relaxed text-fg-muted">{item.summary}</p>
                </div>
              </RevealOnScroll>
            </li>
          ))}
        </ol>

        <details className="group mt-8">
          <summary className="interactive focus-ring inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-white hover:text-black [&::-webkit-details-marker]:hidden">
            {t.career.earlyLabel}
            <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <ul className="mt-6 space-y-5">
            {t.career.early.map((item) => (
              <li key={item.period} className="grid gap-1 md:grid-cols-[14rem_1fr] md:gap-10">
                <p className="font-mono text-xs text-accent">{item.period}</p>
                <div>
                  <h4 className="font-semibold text-white">
                    {item.role} <span className="font-normal text-fg-subtle">· {item.company}</span>
                  </h4>
                  <p className="mt-1 text-sm leading-relaxed text-fg-muted">{item.summary}</p>
                </div>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}
