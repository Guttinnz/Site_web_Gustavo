export {};

declare global {
  namespace Cypress {
    interface VisitSiteOptions {
      /** Idioma salvo antes de abrir a página, como se o visitante já tivesse escolhido. */
      lang?: 'pt' | 'en';
      /** Emula prefers-reduced-motion: reduce. */
      reducedMotion?: boolean;
    }

    interface ContactData {
      nome: string;
      email: string;
      assunto: string;
      mensagem: string;
    }

    interface Chainable {
      /** Envia um comando ao Chrome pelo DevTools Protocol (emulação de mídia, toque…). */
      cdp(command: string, params?: Record<string, unknown>): Chainable<void>;
      /** Liga o toque emulado (pointer: coarse), como num celular. */
      enableTouch(): Chainable<void>;
      /** Liga ou desliga prefers-reduced-motion: reduce. */
      setReducedMotion(enabled: boolean): Chainable<void>;
      /** Abre uma página do site e espera a hidratação terminar. */
      visitSite(path?: string, options?: VisitSiteOptions): Chainable<void>;
      /** Rola a página inteira para disparar as animações de entrada. */
      revealAll(): Chainable<void>;
      /** Abre o menu ☰ (perfil mobile). */
      openMobileMenu(): Chainable<void>;
      /** Troca o idioma pelo seletor BR/EN (no celular, dentro do menu). */
      chooseLanguage(label: 'BR' | 'EN'): Chainable<void>;
      /** Garante que a seção está dentro da área visível da tela. */
      shouldBeInViewport(selector: string): Chainable<void>;
      /** Preenche o formulário de contato. */
      fillContactForm(data: ContactData): Chainable<void>;
      /**
       * Faz os envios do formulário saírem de um "IP" exclusivo do teste, para o limite
       * de 5 mensagens por IP não vazar de um teste para outro. Retorna o IP usado.
       */
      useIsolatedIp(): Chainable<string>;
      /** Roda o axe-core (WCAG 2.2 AA) no estado atual da página e falha se houver violação. */
      checkA11y(state: string, context?: string): Chainable<void>;
    }
  }
}
