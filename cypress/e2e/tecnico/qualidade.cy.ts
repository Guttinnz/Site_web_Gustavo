import { content, site } from '../../../src/data/content';
import type { QaResults } from '../../../src/data/qa';

/** A página /qualidade mostra os resultados reais da execução que publicou o site. */
describe('Dashboard de qualidade (/qualidade)', () => {
  const q = content.pt.quality;

  it('mostra os números do arquivo de resultados', () => {
    cy.readFile<QaResults>('src/data/qa-results.json').then((results) => {
      const format = new Intl.NumberFormat('pt-BR');
      const total = results.suites.reduce((sum, suite) => sum + suite.tests, 0);
      cy.visitSite('/qualidade');
      cy.contains('p', results.status === 'passed' ? q.statusPassed : q.statusFailed).should('be.visible');
      cy.contains('p', new RegExp(`^${q.totalLabel}$`))
        .prev()
        .should('have.text', format.format(total));
      for (const suite of results.suites) {
        cy.contains('h2', q.suites[suite.id])
          .next()
          .should('have.text', `${format.format(suite.passed)}/${format.format(suite.tests)}`);
      }
      if (results.lighthouse) {
        cy.contains('li', q.lighthouseLabels.performance).should('contain.text', String(results.lighthouse.performance));
      } else {
        cy.contains(q.noLighthouse).should('be.visible');
      }
    });
  });

  it('explica o pipeline em etapas, com o portão de qualidade', () => {
    cy.visitSite('/qualidade');
    cy.get('section[aria-labelledby="pipeline-title"] ol > li').should('have.length', q.pipelineSteps.length);
    q.pipelineSteps.forEach((step, index) => {
      cy.get('section[aria-labelledby="pipeline-title"] ol > li').eq(index).find('h3').should('have.text', step.title);
    });
    cy.contains('p', q.gateNote).should('exist');
  });

  it('exibe o cenário real contato.feature, idêntico ao arquivo testado', () => {
    cy.readFile<string>('cypress/e2e/features/contato.feature').then((source) => {
      cy.visitSite('/qualidade');
      cy.get('pre code').should('have.text', source.replace(/\r?\n/g, ''));
    });
  });

  it('links para o código dos testes e para o histórico de execuções', () => {
    cy.visitSite('/qualidade');
    cy.findByRole('link', { name: new RegExp(q.codeLink) })
      .should('have.attr', 'href', site.repository.tests)
      .and('have.attr', 'target', '_blank');
    cy.findByRole('link', { name: new RegExp(q.historyLink) })
      .should('have.attr', 'href', site.repository.runs)
      .and('have.attr', 'target', '_blank');
    cy.findByRole('link', { name: q.back }).should('have.attr', 'href', '/');
  });

  it('o case "Este portfólio" na seção Trabalhos leva ao dashboard', () => {
    cy.visitSite('/');
    cy.findByRole('link', { name: content.pt.work.cases.qa.linkLabel }).click();
    cy.location('pathname').should('eq', '/qualidade');
    cy.get('html').should('have.attr', 'data-hydrated', 'true');
    cy.title().should('eq', q.metaTitle);
  });

  it('o dashboard também está em inglês', () => {
    cy.visitSite('/qualidade', { lang: 'en' });
    cy.get('#quality-title').should('have.text', content.en.quality.title);
    cy.title().should('eq', content.en.quality.metaTitle);
  });
});
