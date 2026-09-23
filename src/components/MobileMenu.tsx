import { X } from 'lucide-react';
import { useCallback, useRef, type MouseEvent } from 'react';
import type { SectionId } from '../data/content';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useI18n } from '../hooks/useI18n';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { LanguageToggle } from './LanguageToggle';

interface MobileMenuProps {
  open: boolean;
  /** `restoreFocus`: devolve o foco ao botão do menu (Esc / fechar), mas não ao navegar. */
  onClose: (restoreFocus: boolean) => void;
}

/** Overlay de navegação em tela cheia (mobile): focus trap, Esc fecha, trava o scroll da página. */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { t } = useI18n();
  const reducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);

  const closeAndRestore = useCallback(() => onClose(true), [onClose]);
  useFocusTrap(dialogRef, open, closeAndRestore);

  // Layout effect: o scroll é destravado no mesmo commit que fecha o menu,
  // antes de rolarmos até a seção escolhida.
  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  const navigate = (event: MouseEvent<HTMLAnchorElement>, id: SectionId) => {
    const target = document.getElementById(id);
    if (!target) return; // deixa o link seguir normalmente (ex.: página 404)
    event.preventDefault();
    onClose(false);
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      window.history.pushState(null, '', `#${id}`);
      target.focus({ preventScroll: true });
    });
  };

  return (
    <div
      id="mobile-menu"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t.a11y.menu}
      hidden={!open}
      className="fixed inset-0 z-[60] flex flex-col bg-surface/95 backdrop-blur-xl lg:hidden"
    >
      <div className="container flex items-center justify-between py-6">
        <span className="font-display text-2xl font-bold uppercase tracking-tighter">Gustavo Bueno</span>
        <button
          type="button"
          aria-label={t.a11y.closeMenu}
          onClick={closeAndRestore}
          className="focus-ring -mr-2 rounded-full p-2"
        >
          <X aria-hidden="true" className="h-7 w-7" />
        </button>
      </div>

      <nav aria-label={t.a11y.primaryNav} className="container mt-10">
        <ul className="flex flex-col gap-6">
          {t.nav.map((item) => (
            <li key={item.id}>
              <a
                href={`/#${item.id}`}
                onClick={(event) => navigate(event, item.id)}
                className="focus-ring rounded font-display text-5xl font-bold uppercase leading-[1] tracking-tighter transition-colors hover:text-accent"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container mt-auto pb-10">
        <LanguageToggle />
      </div>
    </div>
  );
}
