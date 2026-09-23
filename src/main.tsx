import '@fontsource/oswald/latin-700.css';
import '@fontsource/manrope/latin-300.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import './styles/index.css';

import { inject as injectAnalytics } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { I18nProvider } from './components/I18nProvider';

const app = (
  <StrictMode>
    <I18nProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    </I18nProvider>
  </StrictMode>
);

const container = document.getElementById('root');
if (!container) throw new Error('Elemento #root não encontrado no index.html.');

// Em produção o HTML já vem pré-renderizado (scripts/prerender.mjs) e só é hidratado —
// desde que seja o da rota atual (um servidor pode responder qualquer URL com o index.html).
const currentRoute = window.location.pathname === '/' ? 'home' : 'not-found';
if (container.firstElementChild && container.dataset.route === currentRoute) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}

// Speed Insights e Web Analytics (visitas anônimas, sem cookies) só existem no deploy da Vercel.
if (import.meta.env.PROD && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
  injectSpeedInsights();
  injectAnalytics();
}
