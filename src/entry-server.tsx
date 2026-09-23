import { Writable } from 'node:stream';
import { StrictMode } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { App } from './App';
import { I18nProvider } from './components/I18nProvider';
import { content } from './data/content';

/** Título e description (PT) que o HTML pré-renderizado de cada rota recebe no <head>. */
export function pageHead(url: string): { title: string; description: string } {
  const t = content.pt;
  if (url === '/') return t.meta;
  if (url === '/qualidade') return { title: t.quality.metaTitle, description: t.quality.metaDescription };
  return { title: `${t.notFound.title} | Gustavo Bueno`, description: t.meta.description };
}

/**
 * Renderiza uma rota para HTML no build (usado por scripts/prerender.mjs).
 * `onAllReady` espera os componentes lazy (Footer, NotFound) resolverem, então o
 * HTML sai completo — o rodapé com os contatos também fica visível para buscadores.
 */
export function render(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let html = '';
    const sink = new Writable({
      write(chunk: Buffer, _encoding, callback) {
        html += chunk.toString();
        callback();
      },
    });
    sink.on('finish', () => resolve(html));

    const { pipe } = renderToPipeableStream(
      <StrictMode>
        <I18nProvider>
          <StaticRouter location={url} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <App />
          </StaticRouter>
        </I18nProvider>
      </StrictMode>,
      {
        onAllReady: () => pipe(sink),
        onShellError: reject,
        onError: (error) => {
          reject(error instanceof Error ? error : new Error(String(error)));
        },
      },
    );
  });
}
