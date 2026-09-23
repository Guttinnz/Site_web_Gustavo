import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** `false` no servidor e durante a hidratação; `true` a partir do render seguinte. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
