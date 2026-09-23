import type { Locale } from '../data/content';
import { useI18n } from '../hooks/useI18n';

const OPTIONS: readonly { locale: Locale; label: string; name: string; lang: string }[] = [
  { locale: 'pt', label: 'BR', name: 'Português', lang: 'pt-BR' },
  { locale: 'en', label: 'EN', name: 'English', lang: 'en' },
];

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div role="group" aria-label={t.a11y.language} className={`flex items-center gap-1 ${className}`}>
      {OPTIONS.map((option) => {
        const active = option.locale === locale;
        return (
          <button
            key={option.locale}
            type="button"
            lang={option.lang}
            aria-pressed={active}
            onClick={() => setLocale(option.locale)}
            className={`interactive focus-ring rounded px-1.5 py-1 text-sm font-bold uppercase tracking-widest transition-colors ${
              active ? 'text-accent' : 'text-fg-subtle hover:text-white'
            }`}
          >
            {option.label}
            <span className="sr-only"> ({option.name})</span>
          </button>
        );
      })}
    </div>
  );
}
