import { useEffect, useLayoutEffect } from 'react';

/** useLayoutEffect no navegador, useEffect no pré-render (onde layout effects não rodam). */
export const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
