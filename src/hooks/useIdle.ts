import { useEffect, useState } from 'react';

/**
 * Vira `true` depois do evento `load` e de um momento ocioso do navegador.
 * Usado para adiar o que não é essencial (three.js, widget de FAQ) sem competir
 * com o carregamento inicial.
 */
export function useIdle(timeout = 2000): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    let cancelIdle: (() => void) | undefined;

    const schedule = () => {
      if (typeof window.requestIdleCallback === 'function') {
        const id = window.requestIdleCallback(() => setIdle(true), { timeout });
        cancelIdle = () => window.cancelIdleCallback(id);
      } else {
        const id = window.setTimeout(() => setIdle(true), 200);
        cancelIdle = () => window.clearTimeout(id);
      }
    };

    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
    }

    return () => {
      window.removeEventListener('load', schedule);
      cancelIdle?.();
    };
  }, [timeout]);

  return idle;
}
