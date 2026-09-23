import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

const LOCALES = { BR: 'pt', EN: 'en' } as const;
type LanguageLabel = keyof typeof LOCALES;

function toLabel(value: string): LanguageLabel {
  if (value !== 'BR' && value !== 'EN') throw new Error(`Idioma desconhecido: ${value}`);
  return value;
}

Given('que o visitante já escolheu o idioma {string} antes', (label: string) => {
  const locale = LOCALES[toLabel(label)];
  // Só grava a preferência: a visita em si acontece no passo seguinte.
  cy.on('window:before:load', (win) => win.localStorage.setItem('gb-lang', locale));
});

When('ele escolhe o idioma {string}', (label: string) => {
  cy.chooseLanguage(toLabel(label));
});

Then('o título principal diz {string}', (title: string) => {
  // Cada palavra do título é uma linha (bloco) e a caixa alta vem do CSS.
  cy.get('h1').should(($h1) => {
    const text = ($h1[0]?.innerText ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
    expect(text).to.equal(title.toLowerCase());
  });
});

Then('a página é marcada como idioma {string}', (lang: string) => {
  cy.get('html').should('have.attr', 'lang', lang);
});

Then('o título da aba é {string}', (title: string) => {
  cy.title().should('eq', title);
});

Then('o armazenamento local tem apenas a chave {string} com o valor {string}', (key: string, value: string) => {
  cy.window().should((win) => {
    const keys = Object.keys(win.localStorage);
    expect(keys, 'chaves no localStorage').to.deep.equal([key]);
    expect(win.localStorage.getItem(key)).to.equal(value);
  });
  cy.getCookies().should('have.length', 0);
});
