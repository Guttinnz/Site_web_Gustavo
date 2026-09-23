import { startTransition, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { content, type Locale } from '../data/content';
import { I18nContext, type I18nContextValue } from '../hooks/useI18n';

/** Única chave do site no localStorage. */
const STORAGE_KEY = 'gb-lang';
const DEFAULT_LOCALE: Locale = 'pt';
const HTML_LANG: Record<Locale, string> = { pt: 'pt-BR', en: 'en' };

function readStoredLocale(): Locale {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'pt' || value === 'en' ? value : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

function storeLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Storage bloqueado (modo privado etc.): o idioma vale só para esta visita.
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Sempre começa em PT, o idioma do HTML pré-renderizado, para a hidratação bater.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [restored, setRestored] = useState(false);

  // A troca de idioma é uma transition: assim ela espera as partes lazy (rodapé)
  // terminarem de hidratar, em vez de forçar o React a re-renderizá-las do zero.
  useEffect(() => {
    const stored = readStoredLocale();
    startTransition(() => {
      setLocaleState(stored);
      setRestored(true);
    });
  }, []);

  useEffect(() => {
    const t = content[locale];
    document.documentElement.lang = HTML_LANG[locale];
    document.title = t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description);
    // Só revela a página quando o idioma preferido já está na tela (evita piscar PT → EN).
    if (restored) document.documentElement.classList.remove('lang-pending');
  }, [locale, restored]);

  const setLocale = useCallback((next: Locale) => {
    storeLocale(next);
    startTransition(() => setLocaleState(next));
  }, []);

  const value = useMemo<I18nContextValue>(() => ({ locale, t: content[locale], setLocale }), [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
