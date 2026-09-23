/**
 * Resultados dos testes automatizados deste site (página /qualidade e selo do rodapé).
 *
 * O arquivo qa-results.json é gerado por scripts/qa-report.mjs a partir das execuções
 * do Cypress e do Lighthouse. No GitHub Actions ele é regravado antes do build de
 * produção, então o site publicado sempre mostra a execução que o aprovou.
 */
import raw from './qa-results.json';

export type QaSuiteId = 'web' | 'mobile';
export type QaCategory = 'bdd' | 'a11y' | 'api' | 'tecnico';

export interface QaSuite {
  readonly id: QaSuiteId;
  readonly tests: number;
  readonly passed: number;
  readonly failed: number;
  readonly skipped: number;
  readonly durationMs: number;
  /** Ex.: "1440×900". */
  readonly viewport: string;
  /** Ex.: "Chrome 140". */
  readonly browser: string;
  readonly byCategory: Readonly<Record<QaCategory, number>>;
}

export interface QaLighthouse {
  readonly performance: number;
  readonly accessibility: number;
  readonly bestPractices: number;
  readonly seo: number;
}

export interface QaResults {
  readonly generatedAt: string;
  readonly status: 'passed' | 'failed';
  readonly source: 'ci' | 'local';
  /** SHA completo do commit testado (null em execução local sem git). */
  readonly commit: string | null;
  readonly runUrl: string | null;
  readonly cypressVersion: string;
  readonly suites: readonly QaSuite[];
  readonly a11y: { readonly checks: number; readonly violations: number };
  readonly lighthouse: QaLighthouse | null;
}

export const qaResults = raw as QaResults;

export const qaTotals = qaResults.suites.reduce(
  (acc, suite) => ({
    tests: acc.tests + suite.tests,
    passed: acc.passed + suite.passed,
    failed: acc.failed + suite.failed,
  }),
  { tests: 0, passed: 0, failed: 0 },
);
