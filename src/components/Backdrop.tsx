import { lazy, Suspense } from 'react';
import { useIdle } from '../hooks/useIdle';
import { useReducedMotion } from '../hooks/useReducedMotion';

const Background3D = lazy(() => import('./Background3D'));

/**
 * Fundo fixo da página: um brilho estático em CSS (sempre presente, e o único com
 * prefers-reduced-motion) e, por cima, as partículas 3D — baixadas só depois do
 * carregamento inicial, quando o navegador fica ocioso.
 */
export function Backdrop() {
  const reducedMotion = useReducedMotion();
  const idle = useIdle();

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_75%_35%,rgb(var(--accent-rgb)/0.07),transparent_60%)]"
      />
      {idle && !reducedMotion && (
        <Suspense fallback={null}>
          <Background3D />
        </Suspense>
      )}
    </>
  );
}
