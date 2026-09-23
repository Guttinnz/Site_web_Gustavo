import { lazy, Suspense } from 'react';
import { useIdle } from '../../hooks/useIdle';

const ChatWidget = lazy(() => import('./ChatWidget'));

/** O widget de FAQ é carregado sob demanda, depois do carregamento inicial da página. */
export function ChatLauncher() {
  const idle = useIdle();
  if (!idle) return null;

  return (
    <Suspense fallback={null}>
      <ChatWidget />
    </Suspense>
  );
}
