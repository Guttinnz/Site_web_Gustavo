import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

const TOGGLE = 'button[aria-controls="faq-panel"]';

Given('abre o QA-Bot', () => {
  // O QA-Bot carrega sob demanda, quando o navegador fica ocioso.
  cy.get(TOGGLE, { timeout: 15000 }).should('be.visible').click();
  cy.get('#faq-panel').should('be.visible');
});

When('ele pergunta {string}', (pergunta: string) => {
  cy.get('#faq-panel').within(() => cy.findByRole('button', { name: pergunta }).click());
});

Then('o QA-Bot responde com um texto que contém {string}', (trecho: string) => {
  cy.get('#faq-panel [role="log"]').should('contain.text', trecho);
  cy.get('#faq-panel [role="log"]').contains('p', trecho).should('be.visible');
});

Then('o foco vai para a próxima pergunta disponível', () => {
  cy.focused().should(($el) => {
    expect($el.closest('#faq-panel'), 'foco dentro do QA-Bot').to.have.length(1);
    expect($el.is('button'), 'foco em um botão de pergunta').to.equal(true);
    expect($el.attr('data-autofocus'), 'é a primeira pergunta restante').to.equal('');
  });
});

Then('o QA-Bot fecha', () => {
  cy.get('#faq-panel').should('not.be.visible');
  cy.get(TOGGLE).should('have.attr', 'aria-expanded', 'false');
});
