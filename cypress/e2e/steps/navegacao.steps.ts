import { Then, When } from '@badeball/cypress-cucumber-preprocessor';

When('ele clica em {string} no menu principal', (label: string) => {
  cy.get('header nav').within(() => cy.findByRole('link', { name: label }).click());
});

Then('o endereço da página termina com {string}', (hash: string) => {
  cy.location('hash').should('eq', hash);
});

When('ele abre o menu mobile', () => {
  cy.openMobileMenu();
});

When('escolhe {string} no menu mobile', (label: string) => {
  cy.get('#mobile-menu').within(() => cy.findByRole('link', { name: label }).click());
});

Then('o menu cobre a tela inteira', () => {
  cy.window().then((win) => {
    cy.get('#mobile-menu').should(($menu) => {
      const rect = $menu[0]?.getBoundingClientRect();
      expect(rect?.width, 'largura do menu').to.equal(win.innerWidth);
      expect(rect?.height, 'altura do menu').to.equal(win.innerHeight);
    });
  });
  cy.get('html').should('have.css', 'overflow', 'hidden');
});

Then('navegar com Tab mantém o foco dentro do menu', () => {
  // Mais Tabs do que elementos focáveis no menu: o foco precisa dar a volta sem escapar.
  for (let i = 0; i < 12; i += 1) {
    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.focused().should(($el) => {
      expect($el.closest('#mobile-menu'), 'foco dentro do menu').to.have.length(1);
    });
  }
});

Then('o menu fecha', () => {
  cy.get('#mobile-menu').should('not.be.visible');
});

Then('a página volta a rolar normalmente', () => {
  cy.get('#mobile-menu').should('not.be.visible');
  cy.get('html').should(($html) => {
    expect($html[0]?.style.overflow ?? '', 'overflow do <html>').to.not.equal('hidden');
  });
});
