import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableIn(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => element.getClientRects().length > 0,
  );
}

/**
 * Prende o foco de teclado dentro de `containerRef` enquanto `active` for true:
 * foca o primeiro item, faz Tab/Shift+Tab circular e chama `onEscape` com Esc.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape: () => void,
): void {
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;

    focusableIn(container)[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscapeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = focusableIn(container);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active, containerRef]);
}
