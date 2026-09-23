import { ArrowRight } from 'lucide-react';
import { PillLink } from '../components/PillLink';
import { useI18n } from '../hooks/useI18n';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <section className="container flex min-h-[80vh] flex-col items-start justify-center pb-16 pt-32">
      <p className="mb-4 font-mono text-sm text-accent">404</p>
      <h1 className="font-display text-6xl font-bold uppercase leading-[1] tracking-tighter md:text-8xl">
        {t.notFound.title}
      </h1>
      <p className="mt-6 max-w-md text-lg text-fg-muted">{t.notFound.text}</p>
      <PillLink href="/" icon={ArrowRight} className="mt-10">
        {t.notFound.back}
      </PillLink>
    </section>
  );
}
