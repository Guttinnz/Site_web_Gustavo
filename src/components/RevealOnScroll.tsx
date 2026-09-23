import type { ReactNode } from 'react';
import { useInView } from '../hooks/useInView';

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  /** Atraso em ms, para escalonar itens vizinhos. */
  delay?: number;
}

/**
 * Fade + slide ao entrar na viewport (uma vez). Com prefers-reduced-motion ou sem JS,
 * o CSS global (.reveal) mostra o conteúdo direto.
 */
export function RevealOnScroll({ children, className = '', delay = 0 }: RevealOnScrollProps) {
  // Equivale a "15% dentro da tela", medido pela viewport e não pela altura do elemento —
  // com threshold: 0.15, um bloco mais alto que ~6 telas (o Sobre no celular) nunca revelaria.
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0, rootMargin: '0px 0px -15% 0px', once: true });

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal transition-all duration-700 ease-out ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}
