import { content } from '../../../src/data/content';

/**
 * O HTML que os buscadores e as redes sociais recebem, antes de qualquer JavaScript:
 * cada página é pré-renderizada no build com título, descrição e metadados próprios.
 */
function fetchHtml(path: string): Cypress.Chainable<Document> {
  return cy
    .request({ url: path, failOnStatusCode: false })
    .its('body')
    .then((html: string) => new DOMParser().parseFromString(html, 'text/html'));
}

const meta = (doc: Document, selector: string) => doc.querySelector(selector)?.getAttribute('content') ?? '';

describe('SEO e metadados (HTML pré-renderizado)', () => {
  it('home: título, descrição, canonical e Open Graph', () => {
    fetchHtml('/').then((doc) => {
      expect(doc.documentElement.lang).to.equal('pt-BR');
      expect(doc.title).to.equal(content.pt.meta.title);
      expect(meta(doc, 'meta[name="description"]')).to.equal(content.pt.meta.description);
      expect(meta(doc, 'meta[property="og:title"]')).to.equal(content.pt.meta.title);
      expect(meta(doc, 'meta[property="og:image"]')).to.match(/^https:\/\/.+\.(png|jpg)$/);
      expect(meta(doc, 'meta[name="twitter:card"]')).to.equal('summary_large_image');
      expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).to.match(/^https:\/\/[^/]+\/$/);
      expect(meta(doc, 'meta[name="robots"]')).to.not.contain('noindex');
    });
  });

  it('home: conteúdo completo no HTML, com um único h1', () => {
    fetchHtml('/').then((doc) => {
      expect(doc.querySelectorAll('h1')).to.have.length(1);
      for (const id of ['work', 'career', 'about', 'services', 'recommendations', 'contact']) {
        expect(doc.getElementById(id), `seção #${id}`).to.not.equal(null);
      }
      expect(doc.body.textContent).to.contain(content.pt.hero.specialization);
    });
  });

  it('home: dados estruturados (JSON-LD) de pessoa', () => {
    fetchHtml('/').then((doc) => {
      const script = doc.querySelector('script[type="application/ld+json"]');
      expect(script, 'bloco JSON-LD').to.not.equal(null);
      const data = JSON.parse(script?.textContent ?? '{}') as Record<string, unknown>;
      expect(data['@context']).to.equal('https://schema.org');
      expect(data['@type']).to.equal('Person');
      expect(data.name).to.contain('Gustavo');
      expect(data.sameAs).to.be.an('array').that.is.not.empty;
    });
  });

  it('/qualidade: página própria com título, descrição e canonical', () => {
    fetchHtml('/qualidade').then((doc) => {
      expect(doc.title).to.equal(content.pt.quality.metaTitle);
      expect(meta(doc, 'meta[name="description"]')).to.equal(content.pt.quality.metaDescription);
      expect(meta(doc, 'meta[property="og:title"]')).to.equal(content.pt.quality.metaTitle);
      expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).to.match(/\/qualidade$/);
      expect(doc.getElementById('quality-title')?.textContent).to.equal(content.pt.quality.title);
      expect(doc.querySelector('#root')?.getAttribute('data-route')).to.equal('quality');
    });
  });

  it('404: não é indexada pelos buscadores', () => {
    fetchHtml('/404.html').then((doc) => {
      expect(meta(doc, 'meta[name="robots"]')).to.contain('noindex');
      expect(doc.querySelector('h1')?.textContent).to.equal(content.pt.notFound.title);
      expect(doc.querySelector('link[rel="canonical"]'), 'sem canonical').to.equal(null);
    });
  });

  it('robots.txt e sitemap.xml listam as páginas públicas', () => {
    cy.request('/robots.txt').its('body').should('match', /Sitemap: https:\/\/.+\/sitemap\.xml/);
    cy.request('/sitemap.xml').then((response) => {
      const doc = new DOMParser().parseFromString(response.body as string, 'application/xml');
      const locs = [...doc.querySelectorAll('loc')].map((loc) => new URL(loc.textContent ?? '').pathname);
      expect(locs).to.deep.equal(['/', '/qualidade']);
    });
  });

  it('nenhuma chave, token ou segredo aparece no JavaScript publicado', () => {
    cy.task<{ file: string; rule: string }[]>('scanBundle').then((findings) => {
      expect(findings, 'possíveis segredos no bundle').to.deep.equal([]);
    });
  });
});
