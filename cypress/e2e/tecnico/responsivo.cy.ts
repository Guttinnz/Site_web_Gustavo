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

/**
 * Foto do topo, carregada sem lazy-load em qualquer largura:
 * - a partir de 1024 px: retrato 2:3 à direita do título, sem encostar nele;
 * - abaixo disso: camada de fundo atrás do título — as duas áreas se sobrepõem e, no ponto
 *   de sobreposição, o que está na frente é o título.
 */
function shouldPlaceHeroPhoto(width: number): void {
  cy.scrollTo(0, 0);
  cy.get('#top img')
    .should('have.attr', 'loading', 'eager')
    .and(($img) => {
      expect(($img[0] as HTMLImageElement).naturalWidth, 'foto carregada').to.be.greaterThan(0);
    });
  cy.window().then((win) => {
    // Mede a moldura da foto (a parte visível): no celular a imagem tem zoom e a moldura corta o excesso.
    cy.get('[data-hero-photo]').then(($frame) => {
      cy.get('h1').should(($h1) => {
        const photo = $frame[0]?.getBoundingClientRect();
        const title = $h1[0]?.getBoundingClientRect();
        if (!photo || !title) throw new Error('foto ou título ausente');
        expect(photo.right, 'foto dentro da tela').to.be.at.most(width);
        if (width >= 1024) {
          expect(photo.height / photo.width, 'retrato 2:3').to.be.closeTo(1.5, 0.02);
          expect(photo.left, 'foto à direita do título').to.be.at.least(title.right);
          expect(photo.top, 'foto na altura do título').to.be.below(title.bottom);
        } else {
          expect(photo.height / photo.width, 'recorte 4:5 no celular').to.be.closeTo(1.25, 0.02);
          const left = Math.max(photo.left, title.left);
          const right = Math.min(photo.right, title.right);
          const top = Math.max(photo.top, title.top);
          const bottom = Math.min(photo.bottom, title.bottom);
          expect(right > left && bottom > top, 'foto e título sobrepostos').to.equal(true);
          const front = win.document.elementFromPoint((left + right) / 2, (top + bottom) / 2);
          expect(front?.closest('h1'), 'título na frente da foto').to.not.equal(null);
        }
      });
    });
  });
}

describe('Layout responsivo', () => {
  VIEWPORTS.forEach(([width, height]) => {
    it(`${width}×${height}: nada vaza para os lados, e a navegação e a foto do topo ficam no lugar certo`, () => {
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

      // O título gigante do hero cabe na largura da tela, sempre em 2 linhas.
      cy.get('h1').should(($h1) => {
        const h1 = $h1[0] as HTMLElement;
        const fontSize = parseFloat(getComputedStyle(h1).fontSize);
        expect(h1.scrollWidth, 'largura do título').to.be.at.most(h1.clientWidth + 1);
        expect(h1.getBoundingClientRect().height, 'título em 2 linhas').to.be.at.most(fontSize * 2.2);
      });

      shouldPlaceHeroPhoto(width);
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
