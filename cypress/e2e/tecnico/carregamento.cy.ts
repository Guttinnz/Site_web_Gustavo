import { content } from '../../../src/data/content';

/**
 * Estratégia de carregamento: HTML pronto no primeiro byte, nada de terceiros e o
 * que é pesado (three.js) só depois que a página já carregou.
 */
const THREE_CHUNK = '/assets/Background3D-*.js';

describe('Carregamento e desempenho', () => {
  it('o HTML chega pronto do servidor, com o conteúdo da página inteira', () => {
    cy.request('/').then((response) => {
      const html = response.body as string;
      expect(html).to.contain('<div id="root" data-route="home">');
      for (const line of content.pt.hero.titleLines) expect(html).to.contain(line);
      for (const metric of content.pt.impact.metrics) expect(html).to.contain(metric.label);
      expect(html).to.contain(content.pt.contact.form.title);
    });
  });

  it('a página carrega sem erros no console (inclusive de hidratação)', () => {
    cy.on('window:before:load', (win) => {
      cy.spy(win.console, 'error').as('consoleError');
    });
    cy.visitSite('/');
    // O botão do QA-Bot só aparece quando o navegador fica ocioso: tudo já carregou.
    cy.get('button[aria-controls="faq-panel"]', { timeout: 15000 }).should('be.visible');
    cy.get('@consoleError').should('not.have.been.called');
  });

  it('nenhum recurso de terceiros é carregado (fontes e scripts são self-hosted)', () => {
    cy.visitSite('/');
    cy.get('button[aria-controls="faq-panel"]', { timeout: 15000 }).should('be.visible');
    cy.window().then((win) => {
      const external = win.performance
        .getEntriesByType('resource')
        .map((entry) => entry.name)
        .filter((url) => new URL(url).origin !== win.location.origin && !url.startsWith('data:'));
      expect(external, 'requisições para outros domínios').to.deep.equal([]);
    });
  });

  it('o three.js só é baixado depois do evento load', () => {
    cy.intercept('GET', THREE_CHUNK).as('three');
    cy.visitSite('/');
    cy.wait('@three', { timeout: 20000 });
    // A entrada de performance só aparece quando o download termina: should() espera por ela.
    cy.window().should((win) => {
      const [navigation] = win.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const chunk = win.performance.getEntriesByType('resource').find((entry) => entry.name.includes('/Background3D-'));
      expect(chunk, 'download do three.js registrado').to.not.equal(undefined);
      expect(navigation?.loadEventEnd, 'fim do load').to.be.greaterThan(0);
      expect(chunk?.startTime, 'início do download do three.js').to.be.at.least(navigation?.loadEventEnd ?? 0);
    });
  });

  it('com movimento reduzido, as partículas 3D nem são baixadas', () => {
    cy.intercept('GET', THREE_CHUNK).as('three');
    cy.visitSite('/', { reducedMotion: true });
    cy.get('button[aria-controls="faq-panel"]', { timeout: 15000 }).should('be.visible');
    cy.wait(1000);
    cy.get('@three.all').should('have.length', 0);
    cy.get('canvas').should('not.exist');
  });

  it('os números de impacto terminam no valor real', () => {
    const format = new Intl.NumberFormat('pt-BR');
    cy.visitSite('/');
    cy.get('#impact').scrollIntoView();
    cy.get('#impact li').should('have.length', content.pt.impact.metrics.length);
    content.pt.impact.metrics.forEach((metric, index) => {
      cy.get('#impact li')
        .eq(index)
        .find('span[aria-hidden="true"]')
        .should('have.text', `${format.format(metric.value)}${metric.suffix}`);
    });
  });
});
