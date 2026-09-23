import { isMobile } from './device';

Cypress.Commands.add('cdp', (command: string, params: Record<string, unknown> = {}) => {
  cy.wrap(Cypress.automation('remote:debugger:protocol', { command, params }), { log: false });
});

Cypress.Commands.add('enableTouch', () => {
  cy.cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
});

Cypress.Commands.add('setReducedMotion', (enabled: boolean) => {
  cy.cdp('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: enabled ? 'reduce' : 'no-preference' }],
  });
});

Cypress.Commands.add('visitSite', (path = '/', options: Cypress.VisitSiteOptions = {}) => {
  if (options.reducedMotion) cy.setReducedMotion(true);
  cy.visit(path, {
    onBeforeLoad(win) {
      if (options.lang) win.localStorage.setItem('gb-lang', options.lang);
    },
  });
  // O rodapé é a última parte a hidratar e marca <html data-hydrated="true">.
  cy.get('html', { log: false }).should('have.attr', 'data-hydrated', 'true');
  if (options.lang) cy.get('html').should('have.attr', 'lang', options.lang === 'en' ? 'en' : 'pt-BR');
});

Cypress.Commands.add('revealAll', () => {
  // Leva cada bloco até a tela e espera a animação de entrada disparar antes de seguir.
  // Rolar em passos fixos não serve: numa máquina lenta (CI), um bloco pode passar
  // pela tela entre dois quadros sem o IntersectionObserver perceber.
  cy.get('.reveal', { log: false }).each(($block) => {
    cy.wrap($block, { log: false }).scrollIntoView({ log: false }).should('have.class', 'opacity-100');
  });
  // Espera a transição de entrada (700 ms) terminar em todos os blocos.
  cy.get('.reveal', { log: false }).should(($blocks) => {
    const hidden = $blocks
      .toArray()
      .filter((el) => getComputedStyle(el).opacity !== '1')
      .map((el) => `#${el.closest('[id]')?.id ?? '?'}`);
    expect(hidden, 'blocos ainda invisíveis').to.deep.equal([]);
  });
});

Cypress.Commands.add('openMobileMenu', () => {
  cy.findByRole('button', { name: /abrir menu|open menu/i }).click();
  cy.get('#mobile-menu').should('be.visible');
});

Cypress.Commands.add('chooseLanguage', (label: 'BR' | 'EN') => {
  if (isMobile()) {
    cy.openMobileMenu();
    cy.get('#mobile-menu').within(() => cy.findByRole('button', { name: new RegExp(`^${label}`) }).click());
    cy.findByRole('button', { name: /fechar menu|close menu/i }).click();
  } else {
    cy.get('header nav').within(() => cy.findByRole('button', { name: new RegExp(`^${label}`) }).click());
  }
});

Cypress.Commands.add('shouldBeInViewport', (selector: string) => {
  cy.window({ log: false }).then((win) => {
    cy.get(selector).should(($el) => {
      const rect = $el[0]?.getBoundingClientRect();
      expect(rect, `${selector} existe`).to.not.equal(undefined);
      if (!rect) return;
      expect(rect.top, `${selector} começa dentro da tela`).to.be.lessThan(win.innerHeight * 0.5);
      expect(rect.bottom, `${selector} não está acima da tela`).to.be.greaterThan(0);
    });
  });
});

Cypress.Commands.add('fillContactForm', (data: Cypress.ContactData) => {
  cy.get('#contact form').within(() => {
    cy.findByLabelText(/^nome$|^name$/i).clear().type(data.nome, { delay: 0 });
    cy.findByLabelText(/^e-mail$|^email$/i).clear().type(data.email, { delay: 0 });
    cy.findByLabelText(/^assunto$|^subject$/i).select(data.assunto);
    cy.findByLabelText(/^mensagem$|^message$/i).clear().type(data.mensagem, { delay: 0 });
  });
});

let ipCounter = 0;
Cypress.Commands.add('useIsolatedIp', () => {
  ipCounter += 1;
  const ip = `10.${Date.now() % 250}.${Math.floor(Math.random() * 250)}.${ipCounter % 250}`;
  cy.intercept('POST', '/api/contact', (req) => {
    req.headers['x-forwarded-for'] = ip;
  }).as('contact');
  return cy.wrap(ip, { log: false });
});
