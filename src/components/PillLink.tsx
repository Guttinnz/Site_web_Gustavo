import type { LucideIcon } from 'lucide-react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

type PillVariant = 'outline' | 'solid';

interface PillLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  variant?: PillVariant;
  icon?: LucideIcon;
}

const VARIANT_CLASS: Record<PillVariant, string> = {
  outline: 'border-white/40 hover:bg-white hover:text-black',
  solid: 'border-white bg-white text-black hover:bg-transparent hover:text-white',
};

/** Link em formato de pílula — os CTAs do site. */
export function PillLink({ variant = 'outline', icon: Icon, className = '', children, ...rest }: PillLinkProps) {
  return (
    <a
      {...rest}
      className={`interactive focus-ring inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all ${VARIANT_CLASS[variant]} ${className}`}
    >
      {children}
      {Icon && <Icon aria-hidden="true" className="h-4 w-4" />}
    </a>
  );
}
