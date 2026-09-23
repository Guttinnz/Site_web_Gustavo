import { Then, When } from '@badeball/cypress-cucumber-preprocessor';

When('ele procura o link {string}', (name: string) => {
  cy.findByRole('link', { name }).scrollIntoView().should('be.visible').as('link');
});

When('ele procura o link {string} no contato', (name: string) => {
  cy.get('#contact').within(() => {
    cy.findByRole('link', { name: new RegExp(`^${name}`) }).scrollIntoView().should('be.visible').as('link');
  });
});

Then('o link entrega um PDF que existe', () => {
  cy.get('@link').should('have.attr', 'download');
  cy.get('@link')
    .invoke('attr', 'href')
    .then((href) => {
      expect(href, 'endereço do CV').to.match(/\.pdf$/);
      cy.request(String(href)).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.headers['content-type']).to.contain('application/pdf');
      });
    });
});

Then('ele encontra {int} recomendações, cada uma com autor e cargo', (total: number) => {
  cy.get('#recommendations figure').should('have.length', total);
  cy.get('#recommendations figure').each(($figure) => {
    cy.wrap($figure).find('blockquote').invoke('text').should('have.length.greaterThan', 40);
    cy.wrap($figure).find('cite').invoke('text').should('match', /\S+ \S+/);
    cy.wrap($figure).find('figcaption').should('contain.text', '·');
  });
});

Then('um link para conferir as recomendações no LinkedIn', () => {
  cy.get('#recommendations a[href*="linkedin.com"]')
    .should('have.attr', 'target', '_blank')
    .and('have.attr', 'rel', 'noopener noreferrer');
});

Then('o link abre a conversa com o número {string} em uma nova aba', (numero: string) => {
  cy.get('@link')
    .should('have.attr', 'href', `https://wa.me/${numero}`)
    .and('have.attr', 'target', '_blank')
    .and('have.attr', 'rel', 'noopener noreferrer');
});

When('ele clica no selo {string}', (texto: string) => {
  cy.get('#contact').within(() => cy.findByRole('link', { name: new RegExp(`^${texto}`) }).click());
});

Then('ele chega à página {string}', (titulo: string) => {
  cy.location('pathname').should('eq', '/qualidade');
  cy.get('html').should('have.attr', 'data-hydrated', 'true');
  cy.findByRole('heading', { level: 1, name: titulo }).should('be.visible');
});

Then('vê quantos testes automatizados o site tem', () => {
  cy.contains('p', /^testes automatizados$/)
    .prev()
    .invoke('text')
    .should('match', /^\d[\d.]*$/);
  cy.findByRole('heading', { name: 'Como funciona' }).should('exist');
});
