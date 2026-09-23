/**
 * Resumo de cada execução do Cypress, gravado em cypress/results/<device>.json.
 * O scripts/qa-report.mjs junta os resumos de web e mobile com o Lighthouse e gera
 * src/data/qa-results.json — os números da página /qualidade.
 */
import fs from 'node:fs';
import path from 'node:path';

export interface A11yRecord {
  state: string;
  violations: number;
  rulesPassed: number;
}

type Category = 'bdd' | 'a11y' | 'api' | 'tecnico';

/** Por estado verificado: numa nova tentativa (retry), vale o resultado mais recente. */
const a11yRecords = new Map<string, A11yRecord>();

export function recordA11y(entry: A11yRecord): null {
  a11yRecords.set(entry.state, entry);
  return null;
}

function categoryOf(specPath: string): Category {
  if (specPath.endsWith('.feature')) return 'bdd';
  if (specPath.includes('acessibilidade')) return 'a11y';
  if (specPath.includes('api-')) return 'api';
  return 'tecnico';
}

export function writeRunSummary(
  device: 'web' | 'mobile',
  config: Cypress.PluginConfigOptions,
  results: CypressCommandLine.CypressRunResult | CypressCommandLine.CypressFailedRunResult,
): void {
  if (!('runs' in results)) return; // execução abortada antes de rodar os specs

  const byCategory: Record<Category, number> = { bdd: 0, a11y: 0, api: 0, tecnico: 0 };
  for (const run of results.runs) byCategory[categoryOf(run.spec.relative)] += run.stats.tests;

  const summary = {
    device,
    tests: results.totalTests,
    passed: results.totalPassed,
    failed: results.totalFailed,
    skipped: results.totalPending + results.totalSkipped,
    durationMs: results.totalDuration,
    viewport: `${config.viewportWidth}×${config.viewportHeight}`,
    browser: `${results.browserName[0]?.toUpperCase() ?? ''}${results.browserName.slice(1)} ${results.browserVersion.split('.')[0]}`,
    cypressVersion: results.cypressVersion,
    byCategory,
    a11y: {
      checks: a11yRecords.size,
      violations: [...a11yRecords.values()].reduce((sum, record) => sum + record.violations, 0),
      states: [...a11yRecords.values()],
    },
    finishedAt: results.endedTestsAt,
  };

  const dir = path.join(config.projectRoot, 'cypress', 'results');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${device}.json`), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`\n[qa] resumo gravado em cypress/results/${device}.json — ${summary.passed}/${summary.tests} aprovados`);
}
