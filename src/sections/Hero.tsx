import { ArrowDown, ArrowRight } from 'lucide-react';
import { PillLink } from '../components/PillLink';
import { useI18n } from '../hooks/useI18n';

export function Hero() {
  const { t } = useI18n();

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden pb-12 pt-24"
    >
      {/* Escurece a esquerda para o texto; as partículas aparecem à direita. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent"
      />

      <div className="container relative z-10">
        <p className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-green-500/40 bg-green-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-green-400">
          <span aria-hidden="true" className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          {t.hero.availability}
        </p>
        <p className="mb-4 text-xl font-light uppercase tracking-widest text-accent md:text-2xl">{t.hero.eyebrow}</p>

        {/* clamp(): "DE QUALIDADE" mede 5,3em em Oswald Bold — 15vw mantém a linha dentro da tela de 320px a 1067px. */}
        <h1
          id="hero-title"
          className="mb-4 font-display text-[clamp(3rem,15vw,10rem)] font-bold uppercase leading-[1] tracking-tighter"
        >
          {t.hero.titleLines.map((line) => (
            <span key={line} className="interactive block transition-colors hover:text-accent">
              {line}
            </span>
          ))}
        </h1>
        <p className="flex items-center gap-4 font-display text-2xl font-bold uppercase leading-[1.1] tracking-tight text-accent md:text-4xl">
          <span aria-hidden="true" className="hidden h-px w-12 shrink-0 bg-accent sm:block" />
          {t.hero.specialization}
        </p>

        {/* Espaçamento compacto: com o subtítulo, o hero ainda cabe numa tela de 1440×900. */}
        <div className="mt-10 flex flex-col items-start justify-between gap-10 md:mt-12 md:flex-row md:items-end">
          <div className="max-w-md rounded-xl border border-white/5 bg-white/5 p-6 shadow-2xl backdrop-blur-md lg:max-w-lg">
            <p className="mb-6 leading-relaxed text-fg-muted md:text-lg">{t.hero.intro}</p>
            <PillLink href="/#contact" icon={ArrowRight}>
              {t.hero.cta}
            </PillLink>
          </div>

          {/* md:mr-20 deixa espaço para o botão flutuante do FAQ no canto inferior direito. */}
          <a href="/#impact" className="interactive focus-ring group flex items-center gap-4 rounded-full md:mr-20">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 transition-colors group-hover:bg-white group-hover:text-black">
              <ArrowDown aria-hidden="true" className="h-5 w-5 motion-safe:animate-bounce" />
            </span>
            <span className="text-sm font-bold uppercase tracking-widest">{t.hero.scroll}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
