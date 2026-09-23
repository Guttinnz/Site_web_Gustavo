/**
 * Contrato da API do formulário (POST /api/contact). Roda contra o mesmo código da
 * função da Vercel, servido pelo `vite preview` em modo simulação (sem enviar e-mail).
 * Cada teste usa um "IP" próprio, para o limite de 5 envios por IP não interferir.
 */
let ipSequence = 0;

function newIp(): string {
  ipSequence += 1;
  return `192.0.2.${(Date.now() + ipSequence) % 250}`;
}

const VALID = {
  name: 'Ana Recrutadora',
  email: 'ana@empresa.com.br',
  topic: 'clt',
  message: 'Temos uma vaga remota de QA Sênior para conversar.',
  website: '',
  locale: 'pt',
  elapsedMs: 8000,
};

function post(body: Cypress.RequestBody, options: Partial<Cypress.RequestOptions> = {}) {
  return cy.request({
    method: 'POST',
    url: '/api/contact',
    body,
    failOnStatusCode: false,
    ...options,
    headers: { 'x-forwarded-for': newIp(), ...options.headers },
  });
}

describe('API do formulário de contato', () => {
  it('aceita uma mensagem válida (200)', () => {
    post(VALID).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.include({ ok: true });
      expect(response.headers['cache-control']).to.equal('no-store');
    });
  });

  it('recusa campos inválidos e diz quais são (400)', () => {
    post({ ...VALID, name: 'A', email: 'sem-arroba', message: 'curta' }).then((response) => {
      expect(response.status).to.equal(400);
      expect(response.body).to.deep.equal({ error: 'invalid', fields: ['name', 'email', 'message'] });
    });
  });

  it('recusa envio feito rápido demais depois de abrir a página (400 too_fast)', () => {
    post({ ...VALID, elapsedMs: 800 }).then((response) => {
      expect(response.status).to.equal(400);
      expect(response.body).to.deep.equal({ error: 'too_fast' });
    });
  });

  it('descarta em silêncio o envio de um robô que preencheu a armadilha (honeypot)', () => {
    post({ ...VALID, website: 'https://spam.example' }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal({ ok: true });
      expect(response.body, 'não é um envio simulado de verdade').to.not.have.property('dryRun');
    });
  });

  it('limita a 5 mensagens por IP e informa quando tentar de novo (429)', () => {
    const ip = newIp();
    const headers = { 'x-forwarded-for': ip };
    for (let i = 0; i < 5; i += 1) {
      post(VALID, { headers }).its('status').should('equal', 200);
    }
    post(VALID, { headers }).then((response) => {
      expect(response.status).to.equal(429);
      expect(response.body).to.deep.equal({ error: 'rate_limited' });
      expect(Number(response.headers['retry-after'])).to.be.within(1, 600);
    });
  });

  it('recusa corpo maior que 8 KB (413)', () => {
    post({ ...VALID, message: 'x'.repeat(9000) }).then((response) => {
      expect(response.status).to.equal(413);
      expect(response.body).to.deep.equal({ error: 'too_large' });
    });
  });

  it('recusa formato de corpo desconhecido (415)', () => {
    post('<contato/>', { headers: { 'content-type': 'application/xml' } }).then((response) => {
      expect(response.status).to.equal(415);
      expect(response.body).to.deep.equal({ error: 'unsupported_body' });
    });
  });

  it('só aceita POST (405)', () => {
    cy.request({ method: 'GET', url: '/api/contact', failOnStatusCode: false }).then((response) => {
      expect(response.status).to.equal(405);
      expect(response.headers.allow).to.equal('POST');
    });
  });

  it('funciona sem JavaScript: o formulário HTML puro recebe uma página de resposta', () => {
    post(
      { ...VALID, elapsedMs: undefined },
      { form: true, headers: { 'content-type': 'application/x-www-form-urlencoded' } },
    ).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.headers['content-type']).to.contain('text/html');
      expect(response.body).to.contain('Mensagem enviada!');
      expect(response.body).to.contain('href="/#contact"');
    });
  });
});
