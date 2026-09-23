import { content } from '../../../src/data/content';
import { isMobile } from '../../support/device';

/**
 * Cada estado relevante da interface passa pelo axe-core (WCAG 2.2 AA). Estados
 * "escondidos" — menu aberto, QA-Bot com resposta, formulário com erros — são
 * verificados também, porque é aí que costumam aparecer os problemas.
 */
describe('Acessibilidade (axe-core, WCAG 2.2 AA)', () => {
  it('home em português, com todas as seções visíveis', () => {
    cy.visitSite('/');
    cy.revealAll();
    cy.checkA11y('home PT');
  });

  it('home em inglês', () => {
    cy.visitSite('/', { lang: 'en' });
    cy.revealAll();
    cy.checkA11y('home EN');
  });

  it('home com movimento reduzido (prefers-reduced-motion)', () => {
    cy.visitSite('/', { reducedMotion: true });
    cy.get('.reveal').first().should('have.css', 'opacity', '1');
    cy.checkA11y('home com movimento reduzido');
  });

  it('QA-Bot aberto, com uma resposta na conversa', () => {
    cy.visitSite('/');
    cy.get('button[aria-controls="faq-panel"]', { timeout: 15000 }).click();
    cy.get('#faq-panel').within(() => cy.findByRole('button', { name: content.pt.faq[0]?.question }).click());
    cy.get('#faq-panel [role="log"]').should('contain.text', content.pt.faq[0]?.answer.slice(0, 30));
    cy.checkA11y('QA-Bot aberto', '#faq-panel');
  });

  it('formulário de contato mostrando erros de validação', () => {
    cy.visitSite('/');
    cy.get('#contact form').within(() => cy.findByRole('button', { name: /enviar mensagem/i }).click());
    cy.get('#contact form [aria-invalid="true"]').should('have.length', 3);
    cy.checkA11y('formulário com erros', '#contact');
  });

  it('página 404', () => {
    cy.visit('/nao-existe', { failOnStatusCode: false });
    cy.get('html').should('have.attr', 'data-hydrated', 'true');
    cy.findByRole('heading', { level: 1, name: content.pt.notFound.title }).should('be.visible');
    cy.checkA11y('página 404');
  });

  it('página de qualidade (/qualidade)', () => {
    cy.visitSite('/qualidade');
    cy.revealAll();
    cy.checkA11y('página /qualidade');
  });

  if (isMobile()) {
    it('menu mobile aberto', () => {
      cy.visitSite('/');
      cy.openMobileMenu();
      cy.checkA11y('menu mobile aberto', '#mobile-menu');
    });
  }

  it('todo elemento focável mostra um indicador de foco visível', () => {
    cy.visitSite('/');
    cy.get('#contact form').within(() => {
      cy.findByLabelText('Nome').focus();
      cy.focused().should(($el) => {
        const style = getComputedStyle($el[0] as Element);
        const hasOutline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
        const hasRing = style.boxShadow !== 'none';
        expect(hasOutline || hasRing, 'outline ou anel de foco').to.equal(true);
      });
    });
  });
});
