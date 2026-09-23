import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

type Massa = 'recrutadora' | 'nomeCurto' | 'emailInvalido' | 'mensagemCurta';

/** Tempo mínimo que o servidor exige entre abrir a página e enviar (anti-bot). */
const TEMPO_MINIMO_MS = 3000;

Given('que o visitante está no formulário de contato', () => {
  cy.useIsolatedIp();
  cy.visitSite('/');
  cy.get('#contact form').scrollIntoView();
});

Given('que este visitante já enviou {int} mensagens nos últimos minutos', (quantidade: number) => {
  cy.fixture<Record<Massa, Cypress.ContactData>>('contato').then((massas) => {
    const massa = massas.recrutadora;
    cy.window().then((win) => {
      // Mesmo "IP" do visitante (o intercept de useIsolatedIp vale para estas chamadas).
      for (let i = 0; i < quantidade; i += 1) {
        cy.wrap(
          win.fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: massa.nome,
              email: massa.email,
              topic: 'clt',
              message: massa.mensagem,
              website: '',
              locale: 'pt',
              elapsedMs: 10_000,
            }),
          }).then((response) => response.status),
        ).should('eq', 200);
      }
    });
  });
});

When('ele preenche o formulário com a massa {string}', (nome: string) => {
  cy.fixture<Record<Massa, Cypress.ContactData>>('contato').then((massas) => {
    const massa = massas[nome as Massa];
    if (!massa) throw new Error(`Massa de teste inexistente: ${nome}`);
    cy.fillContactForm(massa);
  });
});

When('passa alguns segundos lendo a página', () => {
  // Um envio em menos de 3 s é tratado como robô pelo servidor.
  cy.wait(TEMPO_MINIMO_MS);
});

When(/^(?:ele )?envia o formulário$/, () => {
  cy.get('#contact form').within(() => cy.findByRole('button', { name: /enviar mensagem/i }).click());
});

Then('ele vê o erro {string}', (mensagem: string) => {
  cy.get('#contact form')
    .contains('p', mensagem)
    .should('be.visible')
    .invoke('attr', 'id')
    .then((id) => {
      // O erro está ligado ao campo: o leitor de tela lê a mensagem junto com o rótulo.
      cy.get(`[aria-describedby="${id}"]`).should('have.attr', 'aria-invalid', 'true');
    });
});

Then('o foco vai para o campo {string}', (rotulo: string) => {
  cy.findByLabelText(rotulo).should('have.focus');
});

Then(/^ele vê (?:a confirmação|o aviso) "([^"]+)"$/, (mensagem: string) => {
  cy.wait('@contact');
  cy.get('#contact form [role="status"]').should('have.text', mensagem).and('be.visible');
});

Then('os campos do formulário ficam vazios', () => {
  cy.get('#contact form').within(() => {
    cy.findByLabelText('Nome').should('have.value', '');
    cy.findByLabelText('E-mail').should('have.value', '');
    cy.findByLabelText('Mensagem').should('have.value', '');
  });
});
