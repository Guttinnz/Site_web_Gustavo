/**
 * Checagem de acessibilidade com axe-core, sem plugin intermediário: o axe é injetado
 * na página e roda com as regras WCAG 2.0/2.1/2.2 nível A e AA. Cada estado verificado
 * é registrado no resumo da execução (dashboard em /qualidade).
 */
import type { AxeResults, RunOptions } from 'axe-core';
import { device } from './device';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

type WindowWithAxe = Window & {
  axe?: { run: (context: Element | Document, options: RunOptions) => Promise<AxeResults> };
};

let axeSource: string | undefined;

function injectAxe(): void {
  const inject = (source: string) => {
    cy.window({ log: false }).then((win) => {
      if (!(win as WindowWithAxe).axe) win.eval(source);
    });
  };
  if (axeSource) {
    inject(axeSource);
    return;
  }
  cy.readFile<string>('node_modules/axe-core/axe.min.js', { log: false }).then((source) => {
    axeSource = source;
    inject(source);
  });
}

Cypress.Commands.add('checkA11y', (state: string, context?: string) => {
  const label = `${state} [${device()}]`;
  injectAxe();
  cy.window({ log: false })
    .then((win) => {
      const axe = (win as WindowWithAxe).axe;
      if (!axe) throw new Error('axe-core não foi carregado na página');
      const target = context ? (win.document.querySelector(context) ?? win.document) : win.document;
      return axe.run(target, { runOnly: { type: 'tag', values: WCAG_TAGS }, resultTypes: ['violations'] });
    })
    .then((results) => {
      const { violations, passes } = results;
      cy.task('recordA11y', { state: label, violations: violations.length, rulesPassed: passes.length }, { log: false });
      if (violations.length > 0) {
        cy.task('table', [
          ...violations.map((v) => ({
            estado: label,
            regra: v.id,
            impacto: v.impact,
            elementos: v.nodes.length,
            exemplo: v.nodes[0]?.target.join(' '),
          })),
        ]);
      }
      Cypress.log({ name: 'axe', message: `${label}: ${violations.length} violação(ões), ${passes.length} regras OK` });
      expect(
        violations.map((v) => `${v.id} (${v.impact}, ${v.nodes.length} elemento(s)): ${v.help}`),
        `violações de acessibilidade em "${label}"`,
      ).to.deep.equal([]);
    });
});
