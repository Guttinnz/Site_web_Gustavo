import { content } from '../../../src/data/content';
import { itOn } from '../../support/device';

/** Detalhes de interação que mudam entre mouse (web) e toque (mobile). */
describe('Interações', () => {
  itOn('web', 'o cursor personalizado segue o mouse, cresce sobre links e some ao usar o teclado', () => {
    cy.visitSite('/');
    cy.get('html').should('have.class', 'has-custom-cursor');
    cy.get('body').trigger('pointermove', { clientX: 300, clientY: 200, pointerType: 'mouse' });
    cy.get('.custom-cursor')
      .should('have.attr', 'data-visible', 'true')
      .and('have.attr', 'style')
      .and('contain', 'translate3d(300px, 200px, 0px)');

    cy.get('header nav a').first().trigger('pointerover', { pointerType: 'mouse' });
    cy.get('.custom-cursor').should('have.attr', 'data-hover', 'true');

    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.get('.custom-cursor').should('have.attr', 'data-visible', 'false');
  });

  itOn('mobile', 'na tela de toque não existe cursor personalizado', () => {
    cy.visitSite('/');
    cy.window().then((win) => {
      expect(win.matchMedia('(hover: hover) and (pointer: fine)').matches, 'mouse detectado').to.equal(false);
    });
    cy.get('.custom-cursor').should('not.exist');
    cy.get('html').should('not.have.class', 'has-custom-cursor');
  });

  it('o cabeçalho ganha fundo de vidro ao rolar a página', () => {
    cy.visitSite('/');
    cy.get('header').should('have.class', 'bg-transparent');
    cy.scrollTo(0, 800);
    cy.get('header').should('have.class', 'backdrop-blur-xl').and('not.have.class', 'bg-transparent');
    cy.scrollTo(0, 0);
    cy.get('header').should('have.class', 'bg-transparent');
  });

  it(`o botão "${content.pt.hero.cta}" leva ao formulário de contato`, () => {
    cy.visitSite('/');
    cy.findByRole('link', { name: content.pt.hero.cta }).click();
    cy.location('hash').should('eq', '#contact');
    cy.get('#contact-title').should(($title) => {
      const rect = $title[0]?.getBoundingClientRect();
      expect(rect?.top ?? -1, 'título do contato na tela').to.be.within(0, Cypress.config('viewportHeight'));
    });
  });
});
