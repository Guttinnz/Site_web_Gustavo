/**
 * Junta os resultados dos testes em src/data/qa-results.json — os números que aparecem
 * na página /qualidade e no selo do rodapé.
 *
 *   cypress/results/web.json, mobile.json   → resumos do Cypress (cypress/plugins/summary.ts)
 *   .lighthouseci/relatorios/manifest.json  → notas do Lighthouse CI (execução representativa da Home)
 *
 * No GitHub Actions também registra o commit e o link da execução, e escreve um resumo
 * em Markdown na página do workflow. Rode depois dos testes e antes do build de produção.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'src/data/qa-results.json');
const LIGHTHOUSE_MANIFEST = path.join(ROOT, '.lighthouseci/relatorios/manifest.json');

function readJson(file) {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const suites = ['web', 'mobile']
  .map((id) => readJson(path.join(ROOT, 'cypress/results', `${id}.json`)))
  .filter(Boolean);

if (suites.length === 0) {
  console.error('qa-report: nenhum resultado em cypress/results/ — rode "npm run test:e2e" antes.');
  process.exit(1);
}

function lighthouseScores() {
  const manifest = readJson(LIGHTHOUSE_MANIFEST);
  if (!Array.isArray(manifest)) return null;
  const home = manifest.find((run) => run.isRepresentativeRun && new URL(run.url).pathname === '/');
  if (!home) return null;
  const score = (key) => Math.round((home.summary[key] ?? 0) * 100);
  return {
    performance: score('performance'),
    accessibility: score('accessibility'),
    bestPractices: score('best-practices'),
    seo: score('seo'),
  };
}

const ci = process.env.GITHUB_ACTIONS === 'true';
const runUrl = ci
  ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
  : null;

const results = {
  generatedAt: new Date().toISOString(),
  status: suites.every((suite) => suite.failed === 0) ? 'passed' : 'failed',
  source: ci ? 'ci' : 'local',
  // Localmente o código testado pode ter mudanças sem commit: sem link para não enganar.
  commit: ci ? (process.env.GITHUB_SHA ?? null) : null,
  runUrl,
  cypressVersion: suites[0].cypressVersion,
  suites: suites.map((suite) => ({
    id: suite.device,
    tests: suite.tests,
    passed: suite.passed,
    failed: suite.failed,
    skipped: suite.skipped,
    durationMs: suite.durationMs,
    viewport: suite.viewport,
    browser: suite.browser,
    byCategory: suite.byCategory,
  })),
  a11y: {
    checks: suites.reduce((sum, suite) => sum + suite.a11y.checks, 0),
    violations: suites.reduce((sum, suite) => sum + suite.a11y.violations, 0),
  },
  lighthouse: lighthouseScores(),
};

fs.writeFileSync(OUTPUT, `${JSON.stringify(results, null, 2)}\n`);

const total = results.suites.reduce((sum, suite) => sum + suite.tests, 0);
const passed = results.suites.reduce((sum, suite) => sum + suite.passed, 0);
const lh = results.lighthouse;
console.log(`qa-report: ${passed}/${total} testes aprovados · ${results.a11y.checks} estados com axe · ${results.a11y.violations} violações`);
console.log(lh ? `qa-report: Lighthouse ${lh.performance}/${lh.accessibility}/${lh.bestPractices}/${lh.seo}` : 'qa-report: sem Lighthouse');
console.log(`qa-report: gravado em ${path.relative(ROOT, OUTPUT)}`);

// Resumo na página da execução do GitHub Actions.
if (process.env.GITHUB_STEP_SUMMARY) {
  const icon = results.status === 'passed' ? '✅' : '❌';
  const lines = [
    `## ${icon} QA do portfólio — ${passed}/${total} testes aprovados`,
    '',
    '| Suíte | Testes | Aprovados | Falhas | BDD | Acessibilidade | API | Técnicos | Duração |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...results.suites.map(
      (s) =>
        `| ${s.id} (${s.viewport}, ${s.browser}) | ${s.tests} | ${s.passed} | ${s.failed} | ${s.byCategory.bdd} | ${s.byCategory.a11y} | ${s.byCategory.api} | ${s.byCategory.tecnico} | ${Math.round(s.durationMs / 1000)} s |`,
    ),
    '',
    `**Acessibilidade (axe-core, WCAG 2.2 AA):** ${results.a11y.checks} estados verificados, ${results.a11y.violations} violações.`,
    '',
    lh
      ? `**Lighthouse (celular, mediana de 3):** Performance ${lh.performance} · Acessibilidade ${lh.accessibility} · Boas práticas ${lh.bestPractices} · SEO ${lh.seo}`
      : '**Lighthouse:** sem medição nesta execução.',
    '',
  ];
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);
}
