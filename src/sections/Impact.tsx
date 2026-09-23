import { CountUp } from '../components/CountUp';
import { RevealOnScroll } from '../components/RevealOnScroll';
import { useI18n } from '../hooks/useI18n';

export function Impact() {
  const { t } = useI18n();

  return (
    <section
      id="impact"
      tabIndex={-1}
      aria-labelledby="impact-title"
      className="relative scroll-mt-16 border-y border-white/10 bg-surface/95 py-16 backdrop-blur-xl"
    >
      <RevealOnScroll className="container">
        <h2 id="impact-title" className="section-label mb-10">
          {t.impact.label}
        </h2>
        {/* 5 números: 2 colunas no celular, 3 no tablet, 5 a partir de 1280px (onde "5.200h" em text-7xl cabe). */}
        <ul className="grid grid-cols-2 gap-8 md:grid-cols-3 xl:grid-cols-5">
          {t.impact.metrics.map((metric) => (
            <li key={metric.label}>
              <p className="font-display text-5xl font-bold leading-[1] tracking-tighter text-accent md:text-6xl xl:text-7xl">
                <CountUp value={metric.value} suffix={metric.suffix} />
              </p>
              <p className="mt-2 text-sm leading-snug text-fg-muted">{metric.label}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 font-mono text-xs uppercase text-fg-subtle">{t.impact.footnote}</p>
      </RevealOnScroll>
    </section>
  );
}
