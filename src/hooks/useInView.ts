import { useEffect, useRef, useState, type RefObject } from 'react';

interface InViewOptions {
  threshold?: number;
  once?: boolean;
  rootMargin?: string;
}

/** Observa um elemento com IntersectionObserver. Com `once`, para de observar após a 1ª entrada. */
export function useInView<T extends Element>({
  threshold = 0.15,
  once = true,
  rootMargin = '0px',
}: InViewOptions = {}): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, once, rootMargin]);

  return [ref, inView];
}
