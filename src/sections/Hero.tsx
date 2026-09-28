import { ArrowDown, ArrowRight } from 'lucide-react';
import { Picture } from '../components/Picture';
import { PillLink } from '../components/PillLink';
import { site } from '../data/content';
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
        {/*
          Uma foto só (um <img>):
          - até 1023 px: camada de fundo à direita, ATRÁS do texto (absolute, z-0), recortada em 4:5
            a partir do topo e com as bordas dissolvidas no fundo (.hero-photo-fade);
          - a partir de 1024 px: retrato 2:3 (rosto, peito e braços) na coluna da direita, ocupando a
            altura do título e do bloco de apresentação — assim o topo ainda cabe em 1440×900.
        */}
        <div className="relative lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:grid-rows-[auto_auto] lg:gap-x-8 xl:gap-x-12 2xl:gap-x-16">
          <div className="relative z-10 lg:col-start-1 lg:row-start-1">
            <p className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-green-500/40 bg-green-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-green-400">
              <span aria-hidden="true" className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              {t.hero.availability}
            </p>
            <p className="mb-4 text-base font-light uppercase tracking-widest text-accent sm:text-xl md:text-2xl">{t.hero.eyebrow}</p>

            {/*
              A linha mais larga ("DE SOFTWARE") mede 5,04em em Oswald Bold. Cada faixa cabe na largura útil:
              celular 12,5vw (menor, para a foto atrás aparecer) · tablet até 8,5rem (720 px úteis) · lg 7,5rem (coluna de ~624 px ao lado da foto)
              · xl 9rem (~768 px) · 2xl 10rem (~944 px).
            */}
            <h1
              id="hero-title"
              className="mb-4 font-display text-[clamp(2.75rem,12.5vw,10rem)] font-bold uppercase leading-[1] tracking-tighter md:text-[min(15vw,8.5rem)] lg:text-[7.5rem] xl:text-[9rem] 2xl:text-[10rem]"
            >
              {t.hero.titleLines.map((line) => (
                <span key={line} className="interactive block transition-colors hover:text-accent">
                  {line}
                </span>
              ))}
            </h1>
            <p className="flex items-center gap-4 font-display text-xl font-bold uppercase leading-[1.1] tracking-tight text-accent max-md:max-w-[16rem] sm:text-2xl md:text-4xl">
              <span aria-hidden="true" className="hidden h-px w-12 shrink-0 bg-accent sm:block" />
              {t.hero.specialization}
            </p>
          </div>

          <div className="pointer-events-none absolute -right-6 top-0 z-0 w-[78%] max-w-sm md:right-0 md:w-[26rem] md:max-w-none lg:pointer-events-auto lg:relative lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:right-auto lg:top-auto lg:w-auto lg:self-center">
            <div
              aria-hidden="true"
              className="absolute -inset-4 hidden rounded-[2rem] bg-accent/20 blur-2xl lg:block"
            />
            <div
              data-hero-photo
              className="hero-photo-fade relative aspect-[4/5] w-full overflow-hidden opacity-80 lg:aspect-[2/3] lg:w-80 lg:rounded-3xl lg:border lg:border-white/15 lg:opacity-100 lg:shadow-2xl xl:w-[26rem] 2xl:w-[30rem]">
              {/* Acima da dobra: sem lazy-load. No celular é o maior elemento da tela (LCP): prioridade alta.
                  Lá a foto ganha zoom no rosto, para ele ficar atrás do título. */}
              <Picture
                image={site.heroImage}
                alt={t.hero.photoAlt}
                loading="eager"
                priority
                sizes="(min-width: 1536px) 480px, (min-width: 1280px) 416px, (min-width: 1024px) 320px, (min-width: 768px) 416px, 78vw"
                className="h-full w-full object-cover object-top max-lg:origin-[55%_38%] max-lg:scale-[1.4] lg:object-center"
              />
            </div>
          </div>

          {/* Espaçamento compacto: com o subtítulo, o hero ainda cabe numa tela de 1440×900. */}
          <div className="relative z-10 mt-10 flex flex-col items-start justify-between gap-10 md:mt-12 md:flex-row md:items-end lg:col-start-1 lg:row-start-2">
            <div className="max-w-md rounded-xl border border-white/5 bg-white/5 p-6 shadow-2xl backdrop-blur-md lg:max-w-lg">
              <p className="mb-6 leading-relaxed text-fg-muted md:text-lg">{t.hero.intro}</p>
              <PillLink href="/#contact" icon={ArrowRight}>
                {t.hero.cta}
              </PillLink>
            </div>

            {/* md:mr-20 deixa espaço para o botão flutuante do FAQ (no desktop o link fica na coluna da esquerda, longe dele). */}
            <a href="/#impact" className="interactive focus-ring group flex shrink-0 items-center gap-4 whitespace-nowrap rounded-full md:mr-20 lg:mr-0">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 transition-colors group-hover:bg-white group-hover:text-black">
                <ArrowDown aria-hidden="true" className="h-5 w-5 motion-safe:animate-bounce" />
              </span>
              <span className="text-sm font-bold uppercase tracking-widest">{t.hero.scroll}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
