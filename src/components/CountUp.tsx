import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useInView } from '../hooks/useInView';
import { useIsClient } from '../hooks/useIsClient';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface CountUpProps {
  value: number;
  suffix?: string;
  duration?: number;
}

const NUMBER_LOCALE = { pt: 'pt-BR', en: 'en-US' } as const;

/**
 * Conta de 0 até `value` quando entra na viewport. O HTML pré-renderizado (e quem usa
 * prefers-reduced-motion) recebe o valor final; leitores de tela leem só o valor final.
 */
export function CountUp({ value, suffix = '', duration = 1200 }: CountUpProps) {
  const { locale } = useI18n();
  const isClient = useIsClient();
  const reducedMotion = useReducedMotion();
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.5, once: true });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!inView || reducedMotion) return;
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setProgress(1 - (1 - t) ** 3); // easeOutCubic
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, reducedMotion, duration]);

  const format = useMemo(() => new Intl.NumberFormat(NUMBER_LOCALE[locale]), [locale]);
  const shown = !isClient || reducedMotion ? value : Math.round(value * progress);

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {format.format(shown)}
        {suffix}
      </span>
      <span className="sr-only">
        {format.format(value)}
        {suffix}
      </span>
    </>
  );
}
