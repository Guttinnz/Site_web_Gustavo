import { Menu } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useScrolled } from '../hooks/useScrolled';
import { LanguageToggle } from './LanguageToggle';
import { MobileMenu } from './MobileMenu';

export function Header() {
  const { t } = useI18n();
  const scrolled = useScrolled(40);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback((restoreFocus: boolean) => {
    setMenuOpen(false);
    if (restoreFocus) menuButtonRef.current?.focus();
  }, []);

  return (
    <>
      <a
        href="#conteudo"
        className="focus-ring sr-only rounded-full bg-white px-5 py-3 text-sm font-bold text-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
      >
        {t.a11y.skipToContent}
      </a>

      <header
        className={`fixed left-0 top-0 z-50 w-full border-b transition-all duration-500 ${
          scrolled
            ? 'border-white/5 bg-surface/90 py-4 shadow-lg backdrop-blur-xl'
            : 'border-transparent bg-transparent py-6'
        }`}
      >
        <div className="container flex items-center justify-between">
          <a
            href="/#top"
            aria-label={t.a11y.home}
            className="interactive focus-ring rounded font-display text-2xl font-bold uppercase tracking-tighter"
          >
            Gustavo Bueno
          </a>

          <nav aria-label={t.a11y.primaryNav} className="hidden items-center gap-8 lg:flex">
            <ul className="flex gap-8">
              {t.nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`/#${item.id}`}
                    className="interactive focus-ring rounded text-sm font-bold uppercase tracking-widest transition-colors hover:text-accent"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <span aria-hidden="true" className="text-white/30">
              |
            </span>
            <LanguageToggle />
          </nav>

          <button
            ref={menuButtonRef}
            type="button"
            aria-label={t.a11y.openMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
            className="focus-ring -mr-2 rounded-full p-2 lg:hidden"
          >
            <Menu aria-hidden="true" className="h-7 w-7" />
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  );
}
