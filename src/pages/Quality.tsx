import { Activity, ArrowLeft, CircleCheck, CircleX, Code, Monitor, ShieldCheck, Smartphone } from 'lucide-react';
import type { ReactNode } from 'react';
import featureSource from '../../cypress/e2e/features/contato.feature?raw';
import { PillLink } from '../components/PillLink';
import { RevealOnScroll } from '../components/RevealOnScroll';
import { site, type Locale } from '../data/content';
import { qaResults, qaTotals, type QaCategory, type QaLighthouse } from '../data/qa';
import { useI18n } from '../hooks/useI18n';
import { usePageMeta } from '../hooks/usePageMeta';

const INTL_LOCALE: Record<Locale, string> = { pt: 'pt-BR', en: 'en-US' };
const CATEGORY_ORDER: readonly QaCategory[] = ['bdd', 'a11y', 'api', 'tecnico'];
const LIGHTHOUSE_ORDER: readonly (keyof QaLighthouse)[] = ['performance', 'accessibility', 'bestPractices', 'seo'];
const GHERKIN_KEYWORDS = /^(\s*)(Funcionalidade|Contexto|Cenário|Esquema do Cenário|Exemplos|Dado|Quando|Então|E|Mas)(:?\s)/;

function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  return seconds < 60 ? `${seconds} s` : `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
}

/** Medidor circular no estilo do Lighthouse (verde ≥ 90, laranja ≥ 50, vermelho abaixo). */
function Gauge({ label, value }: { label: string; value: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const color = value >= 90 ? 'text-green-400' : value >= 50 ? 'text-amber-400' : 'text-red-400';
  return (
    <li className="flex flex-col items-center gap-3 text-center">
      <span className={`relative flex h-24 w-24 items-center justify-center ${color}`}>
        <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="6" />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - value / 100)}
          />
        </svg>
        <span className="font-display text-3xl font-bold">{value}</span>
      </span>
      <span className="text-sm text-fg-muted">{label}</span>
    </li>
  );
}

/** Destaque de sintaxe mínimo para o arquivo .feature (palavras-chave, tags e textos entre aspas). */
function GherkinLine({ line }: { line: string }) {
  const trimmed = line.trim();
  if (trimmed.startsWith('#')) return <span className="text-fg-subtle">{line}</span>;
  if (trimmed.startsWith('@')) return <span className="text-accent-soft">{line}</span>;
  const match = GHERKIN_KEYWORDS.exec(line);
  const rest = match ? line.slice(match[0].length) : line;
  const parts = rest.split(/("[^"]*")/g).map((part, index) =>
    part.startsWith('"') ? (
      <span key={index} className="text-green-300">
        {part}
      </span>
    ) : (
      part
    ),
  );
  return (
    <span>
      {match && (
        <>
          {match[1]}
          <span className="font-semibold text-accent">{match[2]}</span>
          {match[3]}
        </>
      )}
      {parts}
    </span>
  );
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md md:p-8 ${className}`}>
      {children}
    </div>
  );
}

/** Página /qualidade: o dashboard dos testes automatizados deste site. */
export default function Quality() {
  const { t, locale } = useI18n();
  const q = t.quality;
  usePageMeta(q.metaTitle, q.metaDescription);

  const numbers = new Intl.NumberFormat(INTL_LOCALE[locale]);
  const date = new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(qaResults.generatedAt));
  const passed = qaResults.status === 'passed';
  const commit = qaResults.commit;

  return (
    <div className="container pb-24 pt-32">
      <header className="max-w-3xl">
        <p className="section-label mb-4">{q.label}</p>
        <h1
          id="quality-title"
          className="font-display text-5xl font-bold uppercase leading-[1] tracking-tighter md:text-7xl"
        >
          {q.title}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-fg-muted">{q.intro}</p>
      </header>

      {/* Situação da última execução */}
      <div
        className={`mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border p-5 ${
          passed ? 'border-green-500/40 bg-green-500/10' : 'border-red-500/40 bg-red-500/10'
        }`}
      >
        <p className={`flex items-center gap-2 font-semibold ${passed ? 'text-green-400' : 'text-red-400'}`}>
          {passed ? <CircleCheck aria-hidden="true" className="h-5 w-5" /> : <CircleX aria-hidden="true" className="h-5 w-5" />}
          {passed ? q.statusPassed : q.statusFailed}
        </p>
        <p className="text-sm text-fg-muted">
          {q.ranOn.replace('{date}', date)} · {qaResults.source === 'ci' ? q.sourceCi : q.sourceLocal}
          {commit && (
            <>
              {' · commit '}
              <a
                href={`${site.repository.url}/commit/${commit}`}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring rounded font-mono text-white underline decoration-white/30 underline-offset-4 hover:decoration-accent"
              >
                {commit.slice(0, 7)}
                <span className="sr-only"> {t.a11y.newTab}</span>
              </a>
            </>
          )}
        </p>
        {qaResults.runUrl && (
          <a
            href={qaResults.runUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring ml-auto rounded text-sm font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-accent"
          >
            {q.viewRun}
            <span className="sr-only"> {t.a11y.newTab}</span>
          </a>
        )}
      </div>

      {/* Números */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <p className="font-display text-7xl font-bold leading-none tracking-tighter text-accent">
            {numbers.format(qaTotals.tests)}
          </p>
          <p className="mt-3 text-lg text-white">{q.totalLabel}</p>
          <p className="mt-1 text-sm text-fg-muted">
            {numbers.format(qaTotals.passed)} {q.passedLabel} · Cypress {qaResults.cypressVersion}
          </p>
        </Card>
        {qaResults.suites.map((suite) => {
          const Icon = suite.id === 'web' ? Monitor : Smartphone;
          return (
            <Card key={suite.id}>
              <h2 className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-accent">
                <Icon aria-hidden="true" className="h-4 w-4" />
                {q.suites[suite.id]}
              </h2>
              <p className="mt-4 font-display text-5xl font-bold leading-none tracking-tighter">
                {numbers.format(suite.passed)}
                <span className="text-2xl text-fg-subtle">/{numbers.format(suite.tests)}</span>
              </p>
              <p className="mt-2 text-sm text-fg-muted">
                {suite.viewport} · {suite.browser} · {formatDuration(suite.durationMs)}
              </p>
              <ul className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
                {CATEGORY_ORDER.filter((category) => suite.byCategory[category] > 0).map((category) => (
                  <li key={category} className="flex justify-between gap-4">
                    <span className="text-fg-muted">{q.categories[category]}</span>
                    <span className="font-semibold text-white">{numbers.format(suite.byCategory[category])}</span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-accent">
            <ShieldCheck aria-hidden="true" className="h-4 w-4" />
            {q.a11yTitle}
          </h2>
          <p className="mt-4 font-display text-5xl font-bold leading-none tracking-tighter">
            {numbers.format(qaResults.a11y.violations)}
          </p>
          <p className="mt-3 leading-relaxed text-fg-muted">
            {q.a11yText
              .replace('{checks}', numbers.format(qaResults.a11y.checks))
              .replace('{violations}', numbers.format(qaResults.a11y.violations))}
          </p>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="font-mono text-sm uppercase tracking-widest text-accent">{q.lighthouseTitle}</h2>
          {qaResults.lighthouse ? (
            <>
              <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
                {LIGHTHOUSE_ORDER.map((key) => (
                  <Gauge key={key} label={q.lighthouseLabels[key]} value={qaResults.lighthouse?.[key] ?? 0} />
                ))}
              </ul>
              <p className="mt-6 text-xs text-fg-subtle">{q.lighthouseNote}</p>
            </>
          ) : (
            <p className="mt-4 text-fg-muted">{q.noLighthouse}</p>
          )}
        </Card>
      </div>

      {/* Como funciona */}
      <section aria-labelledby="pipeline-title" className="mt-20">
        <h2 id="pipeline-title" className="section-label mb-8">
          {q.pipelineTitle}
        </h2>
        <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {q.pipelineSteps.map((step, index) => (
            <li key={step.title}>
              <RevealOnScroll className="h-full">
                <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6">
                  <span className="font-mono text-sm text-accent">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="mt-2 font-display text-xl font-bold uppercase tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg-muted">{step.text}</p>
                </div>
              </RevealOnScroll>
            </li>
          ))}
        </ol>
        <p className="mt-6 rounded-2xl border border-accent/40 bg-accent/10 p-5 font-semibold text-white">{q.gateNote}</p>
      </section>

      {/* Exemplo real */}
      <section aria-labelledby="example-title" className="mt-20">
        <h2 id="example-title" className="section-label mb-2">
          {q.exampleTitle}
        </h2>
        <p className="mb-6 text-sm text-fg-subtle">{q.exampleNote}</p>
        {/* Área rolável: precisa receber foco para ser lida e rolada pelo teclado (WCAG 2.1.1). */}
        <pre
          role="region"
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          aria-labelledby="example-title"
          className="focus-ring max-h-[32rem] overflow-auto rounded-2xl border border-white/10 bg-black/60 p-6 font-mono text-sm leading-relaxed text-fg-muted"
        >
          <code>
            {featureSource.split('\n').map((line, index) => (
              <span key={index} className="block">
                <GherkinLine line={line} />
              </span>
            ))}
          </code>
        </pre>
      </section>

      {/* Ferramentas e links */}
      <section aria-labelledby="tools-title" className="mt-20">
        <h2 id="tools-title" className="section-label mb-6">
          {q.toolsTitle}
        </h2>
        <ul className="flex flex-wrap gap-3">
          {q.tools.map((tool) => (
            <li key={tool} className="rounded-full border border-white/20 px-4 py-2 text-sm">
              {tool}
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap gap-4">
          <PillLink href={site.repository.tests} target="_blank" rel="noopener noreferrer" icon={Code}>
            {q.codeLink}
            <span className="sr-only"> {t.a11y.newTab}</span>
          </PillLink>
          <PillLink href={site.repository.runs} target="_blank" rel="noopener noreferrer" icon={Activity}>
            {q.historyLink}
            <span className="sr-only"> {t.a11y.newTab}</span>
          </PillLink>
          <PillLink href="/" icon={ArrowLeft}>
            {q.back}
          </PillLink>
        </div>
      </section>
    </div>
  );
}
