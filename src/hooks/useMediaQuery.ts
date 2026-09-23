import { useCallback, useSyncExternalStore } from 'react';

/**
 * Estado de uma media query. No servidor (e na hidratação) é sempre `false`, então o
 * HTML pré-renderizado e o primeiro render do cliente batem; depois o React atualiza.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
