import { Bot, Mail, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { site, type FaqId } from '../../data/content';
import { useI18n } from '../../hooks/useI18n';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { LinkedInIcon, WhatsAppIcon } from '../BrandIcons';

const TYPING_DELAY = 650;

/**
 * "QA-Bot": FAQ com respostas fixas, sem IA e sem backend. O histórico guarda só os
 * ids das perguntas, então trocar o idioma traduz a conversa inteira.
 */
export default function ChatWidget() {
  const { t } = useI18n();
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const [asked, setAsked] = useState<FaqId[]>([]);
  const [pending, setPending] = useState<FaqId | null>(null);

  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const remaining = t.faq.filter((item) => !asked.includes(item.id));
  const finished = remaining.length === 0 && pending === null;

  const openPanel = () => {
    setOpen(true);
    setSeen(true);
  };
  const closePanel = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  const ask = (id: FaqId) => {
    if (pending) return;
    setAsked((current) => [...current, id]);
    setPending(id);
  };

  // Resposta "digitada" com um pequeno atraso (instantânea com reduced-motion).
  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => setPending(null), reducedMotion ? 0 : TYPING_DELAY);
    return () => window.clearTimeout(timer);
  }, [pending, reducedMotion]);

  // Ao abrir, leva o foco para dentro do painel.
  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
  }, [open]);

  // A pergunta clicada sai da lista e leva o foco junto; devolve o foco à próxima opção.
  useEffect(() => {
    if (!open || pending) return;
    const focusLost = document.activeElement === null || document.activeElement === document.body;
    if (focusLost) panelRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
  }, [open, pending]);

  // Mantém a última mensagem visível.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTo({ top: log.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [asked, pending, reducedMotion]);

  // Esc fecha o painel (a menos que outro componente, como o menu mobile, já tenha tratado).
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) closePanel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, closePanel]);

  return (
    <div className="fixed bottom-5 right-5 z-40 md:bottom-8 md:right-8">
      <div
        id="faq-panel"
        ref={panelRef}
        role="dialog"
        aria-labelledby="faq-title"
        hidden={!open}
        className="absolute bottom-20 right-0 flex h-[min(520px,calc(100dvh-7.5rem))] w-[min(360px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface/95 shadow-2xl backdrop-blur-xl motion-safe:animate-fade-in"
      >
        <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent">
            <Bot aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h2 id="faq-title" className="font-display text-lg font-bold uppercase leading-none tracking-tight">
              {t.chat.title}
            </h2>
            <p className="mt-1 text-xs text-fg-subtle">{t.chat.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={closePanel}
            aria-label={t.chat.close}
            className="interactive focus-ring rounded-full p-2 text-fg-muted transition-colors hover:text-white"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>

        <div ref={logRef} role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
          <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/5 px-4 py-3 leading-relaxed text-fg-muted">
            {t.chat.greeting}
          </p>
          {asked.map((id) => {
            const item = t.faq.find((faq) => faq.id === id);
            if (!item) return null;
            return (
              <div key={id} className="space-y-3">
                <p className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-accent px-4 py-3 font-semibold leading-relaxed text-black">
                  {item.question}
                </p>
                {pending === id ? (
                  <p className="flex w-fit items-center gap-1 rounded-2xl rounded-tl-sm bg-white/5 px-4 py-3">
                    <span className="sr-only">{t.chat.typing}</span>
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        aria-hidden="true"
                        style={{ animationDelay: `${delay}ms` }}
                        className="h-1.5 w-1.5 rounded-full bg-fg-subtle motion-safe:animate-bounce"
                      />
                    ))}
                  </p>
                ) : (
                  <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/5 px-4 py-3 leading-relaxed text-fg-muted">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
          {finished && (
            <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/5 px-4 py-3 leading-relaxed text-fg-muted">
              {t.chat.done}
            </p>
          )}
        </div>

        <div className="max-h-48 overflow-y-auto border-t border-white/10 px-4 py-3">
          {remaining.length > 0 && (
            <>
              <h3 className="mb-2 font-mono text-xs uppercase tracking-widest text-fg-subtle">{t.chat.suggestions}</h3>
              <ul className="flex flex-wrap gap-2">
                {remaining.map((item, index) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => ask(item.id)}
                      aria-disabled={pending !== null}
                      data-autofocus={index === 0 ? '' : undefined}
                      className="interactive focus-ring rounded-full border border-white/20 px-3 py-1.5 text-left text-xs transition-colors hover:border-accent hover:text-accent aria-disabled:opacity-50"
                    >
                      {item.question}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className={`flex flex-wrap items-center gap-2 text-xs ${remaining.length > 0 ? 'mt-3' : ''}`}>
            <span className="font-mono uppercase tracking-widest text-fg-subtle">{t.chat.direct}:</span>
            <a
              href={`mailto:${site.email}`}
              data-autofocus={remaining.length === 0 ? '' : undefined}
              className="interactive focus-ring inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1.5 transition-colors hover:bg-white hover:text-black"
            >
              <Mail aria-hidden="true" className="h-3.5 w-3.5" /> E-mail
            </a>
            <a
              href={site.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="interactive focus-ring inline-flex items-center gap-1 rounded-full border border-green-500/50 bg-green-600/20 px-3 py-1.5 text-green-400 transition-colors hover:bg-green-600 hover:text-white"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
              <span className="sr-only"> {t.a11y.newTab}</span>
            </a>
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="interactive focus-ring inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1.5 transition-colors hover:bg-white hover:text-black"
            >
              <LinkedInIcon className="h-3.5 w-3.5" /> LinkedIn
              <span className="sr-only"> {t.a11y.newTab}</span>
            </a>
          </p>
        </div>
      </div>

      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[6px] rounded-full bg-gradient-to-tr from-accent/40 via-accent-soft/30 to-white/40 opacity-60 blur-lg motion-safe:animate-pulse"
        />
        <button
          ref={toggleRef}
          type="button"
          onClick={open ? closePanel : openPanel}
          aria-expanded={open}
          aria-controls="faq-panel"
          aria-label={open ? t.chat.close : t.chat.open}
          className="interactive focus-ring relative flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/40 shadow-[0_0_40px_rgb(var(--accent-rgb)/0.35)] backdrop-blur-xl transition-transform hover:scale-105"
        >
          {open ? (
            <X aria-hidden="true" className="h-7 w-7" />
          ) : (
            <Bot aria-hidden="true" className="h-7 w-7 text-accent" />
          )}
          {!seen && (
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-black ring-2 ring-black"
            >
              ?
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
