import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Backdrop } from './components/Backdrop';
import { ChatLauncher } from './components/chat/ChatLauncher';
import { CustomCursor } from './components/CustomCursor';
import { Header } from './components/Header';
import { Home } from './pages/Home';

// A Home fica no bundle inicial (é ela que pinta o LCP); o resto é carregado sob demanda.
const NotFound = lazy(() => import('./pages/NotFound'));
const Footer = lazy(() => import('./sections/Footer'));

export function App() {
  return (
    <>
      <CustomCursor />
      <Backdrop />
      <Header />

      <main id="conteudo" tabIndex={-1} className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="*"
            element={
              <Suspense fallback={null}>
                <NotFound />
              </Suspense>
            }
          />
        </Routes>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>

      <ChatLauncher />
    </>
  );
}
