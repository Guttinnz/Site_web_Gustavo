import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

Given('que o visitante abre o portfólio', () => {
  cy.visitSite('/');
});

When('ele abre o portfólio', () => {
  cy.visitSite('/');
});

When('ele acessa o endereço {string}', (path: string) => {
  cy.visit(path, { failOnStatusCode: false });
  cy.get('html').should('have.attr', 'data-hydrated', 'true');
});

When('ele pressiona Tab', () => {
  cy.press(Cypress.Keyboard.Keys.TAB);
});

When('ele pressiona Esc', () => {
  cy.press(Cypress.Keyboard.Keys.ESC);
});

Then('o foco está no link {string}', (name: string) => {
  cy.focused().should('match', 'a').and('contain.text', name).and('be.visible');
});

Then('o foco volta para o botão {string}', (name: string) => {
  cy.focused().should('match', 'button').and('have.attr', 'aria-label', name);
});

Then('ele vê o título {string}', (title: string) => {
  cy.findByRole('heading', { level: 1, name: title }).should('be.visible');
});

Then('encontra o link {string}', (name: string) => {
  cy.findByRole('link', { name }).should('be.visible').and('have.attr', 'href', '/');
});

Then('a seção {string} aparece na tela', (selector: string) => {
  cy.shouldBeInViewport(selector);
});
