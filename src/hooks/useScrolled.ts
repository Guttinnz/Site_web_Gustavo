import { useCallback, useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
}

/** `true` quando a página rolou mais que `threshold` px. Só re-renderiza quando o booleano muda. */
export function useScrolled(threshold: number): boolean {
  const getSnapshot = useCallback(() => window.scrollY > threshold, [threshold]);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
