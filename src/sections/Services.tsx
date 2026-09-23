import {
  ArrowRight,
  ClipboardCheck,
  DatabaseZap,
  Gauge,
  MousePointerClick,
  Network,
  SearchCheck,
  Smartphone,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { PillLink } from '../components/PillLink';
import { RevealOnScroll } from '../components/RevealOnScroll';
import type { ServiceIcon } from '../data/content';
import { useI18n } from '../hooks/useI18n';

const ICONS: Record<ServiceIcon, LucideIcon> = {
  e2e: MousePointerClick,
  workflows: Workflow,
  pipelines: DatabaseZap,
  mobile: Smartphone,
  api: Network,
  performance: Gauge,
  design: SearchCheck,
  strategy: ClipboardCheck,
};

export function Services() {
  const { t } = useI18n();

  return (
    <section
      id="services"
      tabIndex={-1}
      aria-labelledby="services-title"
      className="relative scroll-mt-16 border-b border-white/10 bg-surface/95 py-24 backdrop-blur-xl"
    >
      <div className="container">
        <h2 id="services-title" className="section-label mb-16">
          {t.services.label}
        </h2>

        <ul className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {t.services.items.map((service, index) => {
            const Icon = ICONS[service.icon];
            return (
              <li key={service.icon}>
                <RevealOnScroll delay={(index % 2) * 120} className="h-full">
                  <article className="group h-full rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-colors duration-300 hover:bg-white/10 md:p-10">
                    <Icon aria-hidden="true" className="mb-6 h-8 w-8 text-accent" />
                    <h3 className="mb-4 font-display text-2xl font-bold uppercase leading-[1] tracking-tight transition-colors group-hover:text-accent md:text-3xl">
                      {service.title}
                    </h3>
                    <p className="text-lg leading-relaxed text-fg-muted">{service.description}</p>
                  </article>
                </RevealOnScroll>
              </li>
            );
          })}
        </ul>

        <div className="mt-16 flex justify-center">
          <PillLink href="/#contact" icon={ArrowRight}>
            {t.services.cta}
          </PillLink>
        </div>
      </div>
    </section>
  );
}
