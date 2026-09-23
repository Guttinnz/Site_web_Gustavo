import { useEffect, useRef } from 'react';
import type { MarqueeStyle, MarqueeWord } from '../data/content';
import { useReducedMotion } from '../hooks/useReducedMotion';

const SPEED = 40; // px/s

const STYLE_CLASS: Record<MarqueeStyle, string> = {
  outline: 'text-outline',
  accent: 'text-accent drop-shadow-[0_0_15px_rgb(var(--accent-rgb)/0.6)]',
  solid: 'text-white drop-shadow-lg',
};

function Track({ words }: { words: readonly MarqueeWord[] }) {
  return (
    <div className="flex shrink-0 items-center gap-12 px-6">
      {words.map((word) => (
        <span
          key={word.text}
          className={`font-display text-7xl font-bold uppercase leading-[1.1] tracking-tighter md:text-9xl ${STYLE_CLASS[word.style]}`}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
}

/**
 * Faixa infinita animada via JS (translateX em requestAnimationFrame). São duas cópias
 * da trilha: quando a primeira sai inteira da tela, a posição volta uma trilha.
 * Pausa no hover, fora da viewport e com prefers-reduced-motion.
 */
export function Marquee({ words }: { words: readonly MarqueeWord[] }) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const rail = railRef.current;
    const track = rail?.firstElementChild;
    if (!container || !rail || !(track instanceof HTMLElement)) return;

    if (reducedMotion) {
      rail.style.transform = '';
      return;
    }

    let trackWidth = track.offsetWidth;
    let offset = 0;
    let frame = 0;
    let lastTime = 0;
    let hovered = false;
    let visible = false;

    const tick = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      offset -= SPEED * delta;
      if (trackWidth > 0 && -offset >= trackWidth) offset += trackWidth;
      rail.style.transform = `translate3d(${offset}px, 0, 0)`;
      frame = requestAnimationFrame(tick);
    };
    const update = () => {
      const shouldRun = visible && !hovered;
      if (shouldRun && !frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(tick);
      } else if (!shouldRun && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      trackWidth = track.offsetWidth;
    });
    resizeObserver.observe(track);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      update();
    });
    intersectionObserver.observe(container);

    const onEnter = () => {
      hovered = true;
      update();
    };
    const onLeave = () => {
      hovered = false;
      update();
    };
    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
    };
  }, [reducedMotion, words]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="mt-24 w-full overflow-hidden border-y border-white/10 bg-surface/90 py-12 backdrop-blur-xl"
    >
      <div ref={railRef} className="flex w-max whitespace-nowrap will-change-transform">
        <Track words={words} />
        <Track words={words} />
      </div>
    </div>
  );
}
