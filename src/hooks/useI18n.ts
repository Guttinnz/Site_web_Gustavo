import { createContext, useContext } from 'react';
import type { Content, Locale } from '../data/content';

export interface I18nContextValue {
  locale: Locale;
  t: Content;
  setLocale: (locale: Locale) => void;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n precisa ser usado dentro de <I18nProvider>.');
  return context;
}
