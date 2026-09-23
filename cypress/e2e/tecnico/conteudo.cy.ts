import { content, site } from '../../../src/data/content';

/** Integridade do conteúdo: links, imagens, textos e traduções. */
describe('Conteúdo e links', () => {
  beforeEach(() => {
    cy.visitSite('/');
  });

  it('cada item do menu aponta para uma seção que existe e tem título', () => {
    for (const item of content.pt.nav) {
      cy.get(`#${item.id}`)
        .should('have.attr', 'aria-labelledby')
        .then((titleId) => {
          cy.get(`#${String(titleId)}`).invoke('text').should('not.be.empty');
        });
    }
  });

  it('todo link de âncora (/#secao) leva a um elemento existente', () => {
    cy.get('a[href^="/#"]').each(($link) => {
      const id = ($link.attr('href') ?? '').slice(2);
      cy.get(`[id="${id}"]`).should('exist');
    });
  });

  it('links externos abrem em nova aba com segurança e avisam o leitor de tela', () => {
    cy.get('a[target="_blank"]').each(($link) => {
      expect($link.attr('rel'), $link.attr('href')).to.contain('noopener');
      const warning = `${$link.text()} ${$link.attr('aria-label') ?? ''}`;
      expect(warning, `${$link.attr('href')} avisa que abre em nova aba`).to.contain(content.pt.a11y.newTab);
    });
  });

  it('os cases de trabalho aparecem na ordem, com "Este portfólio" primeiro', () => {
    cy.get('#work ol > li').should('have.length', site.cases.length);
    site.cases.forEach((entry, index) => {
      cy.get('#work ol > li').eq(index).find('h3').should('have.text', content.pt.work.cases[entry.slug].title);
    });
    cy.get('#work ol > li')
      .first()
      .within(() => {
        cy.findByRole('link', { name: content.pt.work.cases.qa.linkLabel })
          .should('have.attr', 'href', '/qualidade')
          .and('not.have.attr', 'target');
      });
  });

  it('as imagens têm texto alternativo, dimensões e carregam de verdade', () => {
    cy.revealAll();
    cy.get('main img').each(($img) => {
      const img = $img[0] as HTMLImageElement;
      expect(img.getAttribute('alt'), `alt de ${img.src}`).to.have.length.greaterThan(5);
      expect(img.getAttribute('width'), 'width').to.match(/^\d+$/);
      expect(img.getAttribute('height'), 'height').to.match(/^\d+$/);
      cy.wrap($img).scrollIntoView();
      cy.wrap($img).should(($loaded) => {
        expect(($loaded[0] as HTMLImageElement).naturalWidth, `${img.currentSrc} carregou`).to.be.greaterThan(0);
      });
    });
  });

  it('os arquivos para download existem', () => {
    cy.get('a[href$=".pdf"]').each(($link) => {
      cy.request({ url: String($link.attr('href')), method: 'HEAD' }).its('status').should('equal', 200);
    });
  });

  it('não sobram marcadores, rascunhos ou valores quebrados no texto', () => {
    cy.revealAll();
    cy.get('body').then(($body) => {
      const text = $body[0]?.innerText ?? '';
      for (const leftover of ['TODO', 'lorem', 'undefined', 'NaN', 'null', '{year}', '{total}', '{performance}', '__SITE_URL__']) {
        expect(text, `texto contém "${leftover}"`).to.not.match(new RegExp(`\\b${leftover.replace(/[{}]/g, '\\$&')}\\b`, 'i'));
      }
    });
  });

  it('em inglês, menu e títulos são trocados pela tradução', () => {
    cy.chooseLanguage('EN');
    cy.get('header nav a').then(($links) => {
      expect([...$links].map((link) => link.textContent)).to.deep.equal(content.en.nav.map((item) => item.label));
    });
    cy.get('#contact-title').should('have.text', content.en.contact.title);
    cy.get('#contact form').within(() => cy.findByLabelText(content.en.contact.form.name).should('exist'));
  });
});
