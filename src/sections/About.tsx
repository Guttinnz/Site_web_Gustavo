import { BadgeCheck } from 'lucide-react';
import { Marquee } from '../components/Marquee';
import { Picture } from '../components/Picture';
import { PillLink } from '../components/PillLink';
import { RevealOnScroll } from '../components/RevealOnScroll';
import { site, type Credential } from '../data/content';
import { useI18n } from '../hooks/useI18n';

type PillVariant = 'practice' | 'tech' | 'small';

const PILL_CLASS: Record<PillVariant, string> = {
  practice: 'border-accent/30 bg-accent/5 px-4 py-2 text-sm text-accent-soft',
  tech: 'border-white/20 px-4 py-2 text-sm transition-colors duration-300 hover:bg-white hover:text-black',
  small: 'border-white/15 px-3 py-1.5 text-xs text-fg-subtle',
};

interface PillGroupProps {
  title: string;
  /** Texto simples, ou credencial — com `url` preenchida, a pill vira link de verificação. */
  items: readonly (string | Credential)[];
  variant: PillVariant;
}

function PillGroup({ title, items, variant }: PillGroupProps) {
  const { t } = useI18n();

  return (
    <div>
      <h3 className="mb-4 font-mono text-sm uppercase tracking-widest text-accent">{title}</h3>
      <ul className={`flex flex-wrap ${variant === 'small' ? 'gap-2' : 'gap-3'}`}>
        {items.map((item) => {
          const { label, url } = typeof item === 'string' ? { label: item, url: undefined } : item;
          return (
            <li key={label} className="flex">
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`interactive focus-ring inline-flex items-center gap-1.5 rounded-full border transition-colors hover:border-accent hover:text-accent ${PILL_CLASS[variant]}`}
                >
                  {label}
                  <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5 text-accent" />
                  <span className="sr-only">
                    {' '}
                    ({t.about.verify}, {t.a11y.newTab})
                  </span>
                </a>
              ) : (
                <span className={`rounded-full border ${PILL_CLASS[variant]}`}>{label}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function About() {
  const { t } = useI18n();
  const [intro, ...paragraphs] = t.about.paragraphs;

  return (
    <section id="about" tabIndex={-1} aria-labelledby="about-title" className="relative scroll-mt-16 overflow-hidden py-24">
      <div className="container">
        <RevealOnScroll>
          <div className="grid grid-cols-1 items-start gap-12 rounded-3xl border border-white/10 bg-surface/90 p-8 shadow-2xl backdrop-blur-xl md:grid-cols-2 md:p-16">
            <div>
              <h2
                id="about-title"
                className="font-display text-4xl font-bold uppercase leading-tight tracking-tighter md:text-6xl"
              >
                {t.about.title}
              </h2>

              <div className="group relative mt-10 aspect-square w-full max-w-md overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 z-10 bg-accent/10 mix-blend-overlay transition-colors duration-500 group-hover:bg-transparent"
                />
                <Picture
                  image={site.profileImage}
                  alt={t.about.photoAlt}
                  sizes="(min-width: 768px) 448px, calc(100vw - 7rem)"
                  className="h-full w-full scale-110 object-cover grayscale transition-all duration-700 group-hover:scale-100 group-hover:grayscale-0"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,.25)_50%)] bg-[length:100%_4px]"
                />
              </div>
            </div>

            <div className="space-y-8 md:pt-8">
              <p className="text-xl font-light leading-relaxed text-gray-200">{intro}</p>
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="text-lg leading-relaxed text-fg-muted">
                  {paragraph}
                </p>
              ))}

              <PillGroup title={t.about.practices} items={t.about.practiceItems} variant="practice" />
              <PillGroup title={t.about.technologies} items={site.technologies} variant="tech" />
              <PillGroup title={t.about.certifications} items={site.certifications} variant="small" />
              <PillGroup title={t.about.courses} items={site.courses} variant="small" />

              <PillLink href="/#contact" variant="solid">
                {t.about.cta}
              </PillLink>
            </div>
          </div>
        </RevealOnScroll>
      </div>

      <Marquee words={t.marquee} />
    </section>
  );
}
