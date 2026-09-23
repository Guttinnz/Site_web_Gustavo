import { useEffect, useRef } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

const HOVER_TARGETS = 'a, button, .interactive';

/**
 * Círculo que segue o mouse (mix-blend-mode: difference) e cresce sobre elementos
 * interativos. Só existe em dispositivos com mouse; some ao navegar por teclado para
 * não disputar atenção com o anel de foco.
 */
export function CustomCursor() {
  const hasFinePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!hasFinePointer || !cursor) return;

    const root = document.documentElement;
    root.classList.add('has-custom-cursor');

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
      cursor.dataset.visible = 'true';
    };
    const onPointerOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest(HOVER_TARGETS) : null;
      cursor.dataset.hover = String(target !== null);
    };
    const hide = () => {
      cursor.dataset.visible = 'false';
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') hide();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerover', onPointerOver, { passive: true });
    root.addEventListener('pointerleave', hide);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      root.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerover', onPointerOver);
      root.removeEventListener('pointerleave', hide);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [hasFinePointer]);

  if (!hasFinePointer) return null;
  return <div ref={cursorRef} className="custom-cursor" data-visible="false" data-hover="false" aria-hidden="true" />;
}
