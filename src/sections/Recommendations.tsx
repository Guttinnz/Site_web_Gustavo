import { Quote } from 'lucide-react';
import { LinkedInIcon } from '../components/BrandIcons';
import { RevealOnScroll } from '../components/RevealOnScroll';
import { site, type Recommendation } from '../data/content';
import { useI18n } from '../hooks/useI18n';

/** "Cláudio Virginelli" → "CV" (sem fotos de terceiros no site). */
function initials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}

function RecommendationCard({ item }: { item: Recommendation }) {
  return (
    <RevealOnScroll className="h-full">
      <figure className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <Quote aria-hidden="true" className="mb-5 h-8 w-8 shrink-0 text-accent" />
        <blockquote className={`flex-1 space-y-4 leading-relaxed text-fg-muted ${item.featured ? 'md:text-lg' : ''}`}>
          {item.quote.map((paragraph, index) => (
            <p key={paragraph.slice(0, 32)}>
              {paragraph}
              {item.excerpt && index === item.quote.length - 1 ? ' […]' : ''}
            </p>
          ))}
        </blockquote>
        <figcaption className="mt-6 flex items-center gap-4 border-t border-white/10 pt-6">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10 font-display text-lg font-bold text-accent"
          >
            {initials(item.name)}
          </span>
          <span>
            <cite className="block font-semibold not-italic text-white">{item.name}</cite>
            <span className="block text-sm text-fg-subtle">
              {item.role} · {item.date}
            </span>
          </span>
        </figcaption>
      </figure>
    </RevealOnScroll>
  );
}

/**
 * Recomendações públicas do LinkedIn em duas linhas: as marcadas como `featured` em
 * 2 colunas e as demais em 3. Os cards de cada linha têm a mesma altura, com o autor
 * alinhado embaixo — o layout não depende do tamanho de cada texto.
 */
export function Recommendations() {
  const { t } = useI18n();
  const featured = t.recommendations.items.filter((item) => item.featured);
  const others = t.recommendations.items.filter((item) => !item.featured);

  return (
    <section
      id="recommendations"
      tabIndex={-1}
      aria-labelledby="recommendations-title"
      className="relative scroll-mt-16 py-24"
    >
      <div className="container">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="recommendations-title" className="section-label mb-4">
              {t.recommendations.label}
            </h2>
            <p className="max-w-2xl font-display text-3xl font-bold uppercase leading-[1.05] tracking-tight md:text-5xl">
              {t.recommendations.intro}
            </p>
          </div>
          <a
            href={site.linkedinRecommendations}
            target="_blank"
            rel="noopener noreferrer"
            className="interactive focus-ring inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-white/40 px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all hover:bg-white hover:text-black md:self-auto"
          >
            <LinkedInIcon className="h-4 w-4" />
            {t.recommendations.link}
            <span className="sr-only"> {t.a11y.newTab}</span>
          </a>
        </div>

        <ul className="grid gap-6 md:grid-cols-2">
          {featured.map((item) => (
            <li key={item.name}>
              <RecommendationCard item={item} />
            </li>
          ))}
        </ul>
        {/* No tablet ficam 2 por linha; o último card sozinho ocupa a linha inteira. */}
        <ul className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {others.map((item) => (
            <li key={item.name} className="md:[&:last-child:nth-child(odd)]:col-span-2 xl:[&:last-child:nth-child(odd)]:col-span-1">
              <RecommendationCard item={item} />
            </li>
          ))}
        </ul>

        <p className="mt-6 font-mono text-xs uppercase text-fg-subtle">{t.recommendations.source}</p>
      </div>
    </section>
  );
}
