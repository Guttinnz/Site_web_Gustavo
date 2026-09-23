import { useEffect } from 'react';

/** Título da aba e meta description da página atual (atualiza ao trocar o idioma). */
export function usePageMeta(title: string, description: string): void {
  useEffect(() => {
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}
