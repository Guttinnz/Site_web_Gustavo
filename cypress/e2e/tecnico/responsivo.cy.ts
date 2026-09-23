import { isMobile } from '../../support/device';

/**
 * O layout é conferido em várias larguras reais de tela: nada pode vazar para os
 * lados, e a navegação muda de formato no breakpoint de 1024 px.
 */
const VIEWPORTS: readonly [number, number][] = isMobile()
  ? [
      [320, 568],
      [360, 740],
      [390, 844],
      [414, 896],
      [768, 1024],
    ]
  : [
      [1024, 768],
      [1280, 800],
      [1440, 900],
      [1920, 1080],
    ];

/** Dentro de um contêiner que rola ou recorta (bloco de código, letreiro), sair da área é intencional. */
function insideClippingBox(el: Element, win: Window): boolean {
  for (let parent = el.parentElement; parent && parent !== win.document.body; parent = parent.parentElement) {
    if (win.getComputedStyle(parent).overflowX !== 'visible') return true;
  }
  return false;
}

function shouldNotOverflow(label: string): void {
  cy.window().then((win) => {
    const { documentElement } = win.document;
    expect(documentElement.scrollWidth, `${label}: largura do conteúdo`).to.be.at.most(win.innerWidth);
    const wider = [...win.document.querySelectorAll<HTMLElement>('#conteudo *, footer *')].filter((el) => {
      const rect = el.getBoundingClientRect();
      const outside = rect.width > 0 && (rect.right > win.innerWidth + 1 || rect.left < -1);
      return outside && !el.closest('[aria-hidden="true"]') && !insideClippingBox(el, win);
    });
    expect(
      wider.map((el) => `${el.tagName.toLowerCase()}.${el.className.toString().split(' ').slice(0, 3).join('.')}`),
      `${label}: elementos fora da tela`,
    ).to.deep.equal([]);
  });
}

describe('Layout responsivo', () => {
  VIEWPORTS.forEach(([width, height]) => {
    it(`${width}×${height}: nada vaza para os lados e a navegação certa aparece`, () => {
      cy.viewport(width, height);
      cy.visitSite('/');
      cy.revealAll();
      shouldNotOverflow('home');

      // cy.get (e não findByRole): o Testing Library não encontra elementos escondidos.
      if (width >= 1024) {
        cy.get('header nav').should('be.visible');
        cy.get('button[aria-controls="mobile-menu"]').should('not.be.visible');
      } else {
        cy.get('header nav').should('not.be.visible');
        cy.get('button[aria-controls="mobile-menu"]').should('be.visible');
      }

      // O título gigante do hero cabe na largura da tela.
      cy.get('h1').should(($h1) => {
        const h1 = $h1[0] as HTMLElement;
        expect(h1.scrollWidth, 'largura do título').to.be.at.most(h1.clientWidth + 1);
      });
    });
  });

  it('a página /qualidade também cabe na tela menor do perfil', () => {
    const [width, height] = VIEWPORTS[0] ?? [1024, 768];
    cy.viewport(width, height);
    cy.visitSite('/qualidade');
    cy.revealAll();
    shouldNotOverflow('/qualidade');
  });
});
