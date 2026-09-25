# Portfólio — Gustavo Bueno · Engenheiro de Software (Qualidade e Automações)

[![QA](https://github.com/Guttinnz/Site_web_Gustavo/actions/workflows/qa.yml/badge.svg)](https://github.com/Guttinnz/Site_web_Gustavo/actions/workflows/qa.yml)
![Cypress](https://img.shields.io/badge/E2E-Cypress%2016-69D3A7?logo=cypress&logoColor=white)
![BDD](https://img.shields.io/badge/BDD-Gherkin%20PT--BR-23D96C?logo=cucumber&logoColor=white)
![Acessibilidade](https://img.shields.io/badge/acessibilidade-WCAG%202.2%20AA-1F6FEB)
![Lighthouse](https://img.shields.io/badge/Lighthouse%20CI-perf%20%E2%89%A5%2090-F44B21?logo=lighthouse&logoColor=white)

Site one-page, bilíngue (PT-BR / EN), com fundo de partículas em WebGL, hospedado na Vercel.

**Este site é um case de QA.** Cada mudança passa por testes automatizados em Cypress (web e mobile), checagem de acessibilidade com axe e Lighthouse CI no GitHub Actions. O deploy só acontece se tudo passar. Os resultados da versão no ar aparecem na página **/qualidade** do site. Detalhes em [Testes automatizados](#testes-automatizados).

**Stack:** React 18 · TypeScript (strict) · Vite 8 · Tailwind CSS 3 · React Router 6 · three.js · lucide-react · Oswald e Manrope self-hosted (@fontsource) · Vercel Functions + Resend (formulário).

📦 **Publicar:** [docs/DEPLOY.md](docs/DEPLOY.md) (passo a passo) · 🏗️ **Infra:** [docs/ARQUITETURA.md](docs/ARQUITETURA.md)

---

## Rodando localmente

Requisito: **Node 24** (a versão está em `.nvmrc` e em `package.json` → `engines`).

```bash
npm ci
npm run dev        # http://localhost:5173
```

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento. Antes, gera as imagens otimizadas. |
| `npm run build` | Typecheck → build do cliente → build SSR → pré-render do HTML → verificações. Resultado em `dist/`. |
| `npm run preview` | Serve o `dist/` em http://localhost:4173, para testar o build de produção. |
| `npm run typecheck` | Só o TypeScript. |
| `npm run lint` | ESLint, incluindo regras de acessibilidade (jsx-a11y) e `no-explicit-any`. |
| `npm run check` | Lint + build completo. Rode antes de cada push: é o mesmo que o CI roda no GitHub. |
| `npm run images` | Gera AVIF/WebP/JPEG em `public/images/opt` (roda sozinho no dev e no build). |
| `npm run placeholders` | Recria imagens provisórias, OG, favicons e CV de exemplo (veja abaixo). |
| `npm run qa` | O portão de qualidade completo na sua máquina: build → Cypress web e mobile → Lighthouse → `qa-results.json` → build de novo. |
| `npm run test:e2e` | Sobe o `dist/` em http://localhost:4173 e roda o Cypress web e depois o mobile. Precisa de um `npm run build` antes. |
| `npm run test:web` / `test:mobile` | Uma suíte só, com o servidor já rodando (`npm run preview:test` em outro terminal). |
| `npm run cy:open` / `cy:open:mobile` | Cypress com interface, para ver cada teste passo a passo. |
| `npm run test:lighthouse` | Lighthouse CI: 3 medições no perfil de celular, na Home e em `/qualidade`, com metas mínimas. |
| `npm run qa:report` | Junta os resultados em `src/data/qa-results.json` (os números da página `/qualidade`). |

---

## Estrutura

```
src/
├── data/content.ts      ← TODO o texto do site (PT e EN), contatos, trajetória, stack, certificações
├── data/qa-results.json ← resultados da última execução dos testes (gerado por scripts/qa-report.mjs)
├── sections/            ← Hero, Impact, Work, Career, About (+ marquee), Services, Footer
├── components/          ← CustomCursor, Background3D, RevealOnScroll, CountUp, Marquee,
│   │                      Header, MobileMenu, LanguageToggle, I18nProvider, Picture…
│   └── chat/            ← widget de FAQ (QA-Bot)
├── hooks/               ← useI18n, useInView, useReducedMotion, useFocusTrap, useIdle…
├── pages/               ← Home, Quality (/qualidade, dashboard dos testes) e NotFound (404)
├── styles/index.css     ← tokens de design (cores), utilitários, regras de reduced-motion
├── main.tsx             ← entrada do navegador (hidrata o HTML pré-renderizado)
└── entry-server.tsx     ← entrada do pré-render (usada só no build)
api/contact.ts           ← função da Vercel do formulário (única com chave secreta)
cypress/                 ← testes automatizados (veja "Testes automatizados")
scripts/                 ← images.mjs, placeholders.mjs, prerender.mjs, qa-report.mjs
public/                  ← imagens, favicons, og-image.jpg, cv-gustavo-bueno.pdf
docs/                    ← ARQUITETURA.md e DEPLOY.md
.github/workflows/qa.yml ← portão de qualidade: testes a cada push/PR e deploy só se tudo passar
lighthouserc.json        ← metas do Lighthouse CI
vercel.json              ← build, headers de segurança/CSP, cache e limite da função
```

### Como a página carrega

- **HTML pré-renderizado.** No build, `scripts/prerender.mjs` gera o HTML completo da Home (`dist/index.html`), da página de qualidade (`dist/qualidade.html`) e da 404 (`dist/404.html`), cada uma com título e descrição próprios. O texto aparece antes do JavaScript, o que é bom para o LCP e para buscadores. Depois o React hidrata e a página vira uma SPA normal.
- **Bundle inicial** (~66 kB gzip): React, Router, Header, Hero e as seções.
- **Sob demanda** (`React.lazy`):
  - three.js/Background3D (~131 kB gzip), só depois do `load` e com o navegador ocioso, e nunca com `prefers-reduced-motion`;
  - widget de FAQ;
  - rodapé;
  - página 404.
- **localStorage** guarda uma única chave, `gb-lang`, com o idioma.

---

## Como trocar o conteúdo

### Textos
Tudo está em **`src/data/content.ts`**:
- `site`: e-mail, WhatsApp, LinkedIn, GitHub, ordem dos cases, tecnologias, certificações e cursos;
- `pt` e `en`: todos os textos traduzidos, inclusive a trajetória, as práticas de teste ("Como eu testo"), o selo de disponibilidade do hero e as respostas do FAQ.

O tipo `Content` obriga PT e EN a terem as mesmas chaves. Se faltar uma tradução, o build falha.

Títulos, botões e labels ficam em caixa normal no arquivo. A caixa alta vem do CSS (`uppercase`), o que é melhor para leitores de tela.

### Imagens
Sobrescreva o arquivo em `public/images/` **mantendo o nome**:

| Arquivo | Onde aparece | Recorte |
|---|---|---|
| `profile.jpg` | Foto da seção Sobre | quadrado (1:1), com foco automático |
| `hero.jpg` | Foto do topo, ao lado do título (desktop) e em círculo acima dele (celular e tablet) | retrato 4:5, de preferência 1200×1500 px ou mais, com o rosto no terço de cima |
| `work-icatu.jpg`, `work-ivy.jpg`, `work-going2.jpg`, `work-tcc.jpg`, `work-n8n.jpg` | Capas dos cases | 16:9, centralizado |
| `work-qa.jpg` | Capa do case "Este portfólio" (já é um print real do `/qualidade`) | 16:9 |

A imagem pode ter qualquer tamanho (de preferência ≥ 1280 px de largura), em `.jpg` ou `.png`. O `npm run images` gera as versões AVIF, WebP e JPEG em 2 larguras. Ele roda sozinho no `dev` e no `build`.

> ⚠️ Prints de ambientes de cliente: **mascare dados** (nomes, CPFs, e-mails, URLs internas) antes de publicar.

Os textos alternativos (`imageAlt`, `photoAlt`) ficam no `content.ts`. Quando trocar uma capa provisória por um print real, atualize o alt para descrever o print.

### Novo case
1. Adicione o slug em `CaseSlug` e uma entrada em `site.cases` (define a ordem e a imagem).
2. Escreva os textos em `pt.work.cases` e `en.work.cases`. O TypeScript aponta o que faltar.
3. Coloque a imagem em `public/images/work-<slug>.jpg`.

### Links do TCC, dos cases e das credenciais
Os endereços ficam em `src/data/content.ts`, no objeto `site`. **Enquanto o campo estiver vazio (`''`), o site mostra só o texto, sem link.**

- **PDF do TCC:** o TCC não foi publicado, então o próprio site hospeda o arquivo.
  1. Salve o PDF como `public/tcc-gustavo-bueno.pdf`.
  2. Em `site.cases`, na entrada `slug: 'tcc'`, troque `url: ''` por `url: '/tcc-gustavo-bueno.pdf'`.

  O selo "Ler o TCC (PDF) · em breve" vira um botão que abre o PDF numa nova aba. O texto do botão fica em `linkLabel`, dentro de `pt.work.cases.tcc` e `en.work.cases.tcc`.

  Se a `url` apontar para um arquivo que não está em `public/`, **o build falha e diz qual arquivo falta**. Assim nunca vai ao ar um link quebrado.
- **Outros cases:** qualquer entrada de `site.cases` aceita `url`. Para o link aparecer, o case também precisa de um `linkLabel` nos textos PT/EN.
- **Certificações e cursos:** em `site.certifications` e `site.courses`, preencha `url` com o link de verificação (ex.: badge da CertiProf). A pill vira link, com um selo de verificado.

### Recomendações
Ficam em `src/data/content.ts`, em `pt.recommendations.items` (texto original) e `en.recommendations.items` (tradução). Cada item tem nome, cargo, data e os parágrafos (`quote`). Com `excerpt: true`, o card termina com "[…]", para indicar que é um trecho. Todos os cards têm o link "Ver no LinkedIn".

O site não usa as fotos dos autores: cada card mostra as iniciais.

### CV
O botão "Baixar CV" entrega `public/cv-gustavo-bueno.pdf`, o seu CV real. Para atualizar, basta sobrescrever o arquivo mantendo o nome. Na versão EN do site, o botão avisa que o CV está em português.

### Cor de acento
1. Em `src/styles/index.css`, troque `--accent`/`--accent-rgb` (e `--accent-soft`/`--accent-soft-rgb`). As partículas 3D leem a cor daí.
2. Regenere a imagem de compartilhamento e os favicons com a nova cor:
   ```bash
   npm run placeholders -- --force --only=og,favicons
   ```
   Grupos disponíveis: `work`, `profile`, `og`, `favicons`, `cv`. O script recusa `--force` sem `--only`, para não sobrescrever o CV real nem as suas fotos.

---

## Deploy na Vercel

O passo a passo completo está em **[docs/DEPLOY.md](docs/DEPLOY.md)**: GitHub, Vercel, Resend, verificação pós-deploy, domínio próprio e problemas comuns. A arquitetura está em **[docs/ARQUITETURA.md](docs/ARQUITETURA.md)**.

Resumo: cada push na `main` roda o workflow **QA** no GitHub Actions, que publica na Vercel **só se todos os testes passarem** (o deploy pelo Git da Vercel está desligado). O `vercel.json` já define:
- instalação (`npm ci`, sem baixar o binário do Cypress), build (`npm run build`) e saída (`dist`);
- os headers de segurança;
- o tempo máximo da função do formulário.

A única variável de ambiente necessária é a `RESEND_API_KEY`, do formulário. O canonical, o Open Graph, o JSON-LD, o `sitemap.xml` e o `robots.txt` usam o domínio de produção que a Vercel informa no build.

### Formulário de contato
O formulário do rodapé envia para `POST /api/contact` (`api/contact.ts`), uma função da Vercel. Ela manda o e-mail pelo [Resend](https://resend.com), que tem plano gratuito de 3.000 e-mails por mês.

1. Crie uma conta no Resend **com o e-mail gustavoriedel2202@gmail.com**. Sem domínio próprio, o Resend só entrega mensagens para o e-mail da própria conta.
2. Em *API Keys*, crie uma chave com permissão *Sending access*.
3. Na Vercel, em *Settings → Environment Variables*, adicione `RESEND_API_KEY` com essa chave e faça um redeploy.
4. Mande uma mensagem de teste pelo site. Ela chega com o assunto "[Portfólio] …", e responder ao e-mail responde direto para quem escreveu.

Sem a chave configurada na Vercel, o formulário avisa o visitante que está fora do ar e sugere o e-mail ou o WhatsApp. No `npm run dev` e no `npm run preview`, sem chave, a mensagem só aparece no terminal. Para testar o envio de verdade localmente, coloque a chave num arquivo `.env.local`.

**Proteções:**
- limite de 5 mensagens a cada 10 minutos por IP (por instância da função);
- campo invisível que pega robôs;
- tempo mínimo de preenchimento;
- validação de todos os campos no servidor;
- corpo de no máximo 8 KB.

**Com domínio próprio**, verifique o domínio no Resend e defina `CONTACT_FROM_EMAIL` (ex.: `Portfólio <contato@seudominio.com.br>`).

### Estatísticas de visita
O site usa o Vercel Web Analytics: visitas anônimas, sem cookies, então não precisa de banner. Para ativar, abra o projeto na Vercel → *Analytics* → *Enable* e faça um redeploy. O plano gratuito conta até 50 mil visitas por mês. Eventos personalizados, como cliques em botões, são exclusivos do plano Pro.

O Speed Insights também é ativado automaticamente no domínio da Vercel. Para ver os dados, habilite-o no painel do projeto.

### Segurança
- **Nenhuma chave de API no código do site.** A única chave, a do Resend, fica em variável de ambiente e só é usada pela função `api/contact.ts`, no servidor. O chat continua sendo um FAQ estático.
- O `vercel.json` envia headers de segurança:
  - Content-Security-Policy;
  - X-Frame-Options;
  - X-Content-Type-Options;
  - Referrer-Policy;
  - Permissions-Policy.
- A CSP libera o único script inline do `index.html` pelo hash. **Se você editar esse script, o build falha** e mostra o hash novo para colar no `vercel.json`.
- A Vercel Toolbar dos deploys de *preview* é bloqueada pela CSP. Isso é esperado e não afeta a produção.

---

## Testes automatizados

O próprio site é um case de QA: **124 testes** em duas suítes (web e mobile), rodando a cada push e pull request no GitHub Actions. Resultado da última execução local (23/09/2026): 124/124 aprovados, 15 estados da página verificados com axe e 0 violações, Lighthouse 92/100/100/100.

| Tipo | Formato | Onde | O que cobre |
|---|---|---|---|
| Fluxos de negócio | **Gherkin em PT-BR** (BDD) | `cypress/e2e/features/*.feature` | Navegação e menu mobile, troca de idioma, formulário de contato (erros, envio, limite de mensagens), QA-Bot, o que um recrutador procura (CV, recomendações, WhatsApp, selo de testes) |
| Acessibilidade | TypeScript + axe-core | `cypress/e2e/tecnico/acessibilidade.cy.ts` | WCAG 2.0/2.1/2.2 A e AA em cada estado: Home PT/EN, reduced motion, QA-Bot aberto, formulário com erros, 404, `/qualidade`, menu mobile |
| API do formulário | TypeScript | `cypress/e2e/tecnico/api-contato.cy.ts` | Contrato do `POST /api/contact`: 200, 400 (campos e `too_fast`), honeypot, 429 com `Retry-After`, 413, 415, 405 e envio sem JavaScript |
| Técnicos | TypeScript | `cypress/e2e/tecnico/*.cy.ts` | SEO e metadados, **nenhum segredo no bundle**, carregamento (HTML pronto, sem terceiros, three.js só depois do `load`, console sem erros), responsividade em 9 larguras, integridade de links e imagens, dashboard `/qualidade`, cursor e cabeçalho |
| Performance | Lighthouse CI | `lighthouserc.json` | Mediana de 3 medições no celular: Performance ≥ 90, Acessibilidade ≥ 95, SEO ≥ 90 |

**Dois perfis** (`--expose device=web|mobile`, em `cypress.config.ts`):
- **web:** 1440×900, mouse, cenários sem a tag `@mobile`;
- **mobile:** 390×844, toque emulado pelo Chrome DevTools Protocol e user agent de iPhone, cenários sem a tag `@web`. API, SEO e conteúdo rodam só no web, porque não dependem da tela.

**Como está organizado:**
```
cypress/
├── e2e/features/        ← cenários em Gherkin (# language: pt)
├── e2e/steps/           ← step definitions em TypeScript
├── e2e/tecnico/         ← testes técnicos em TypeScript
├── fixtures/contato.json← massas de teste do formulário
├── support/             ← comandos (visitSite, fillContactForm, checkA11y…), perfis web/mobile
└── plugins/             ← resumo da execução e varredura de segredos no bundle
```

- Os textos esperados vêm do próprio `src/data/content.ts`: mudar um texto do site não quebra os testes.
- Seletores por papel e rótulo acessível (Testing Library), como um usuário ou leitor de tela encontraria o elemento.
- O formulário é testado contra o mesmo código da função da Vercel, em modo simulação (nenhum e-mail é enviado). Cada teste usa um "IP" próprio, para o limite de mensagens não vazar de um teste para outro.
- O cenário `contato.feature` aparece na íntegra na página `/qualidade`, como exemplo.

**Rodando na sua máquina** (precisa do Google Chrome instalado):
```powershell
npm run build
npm run test:e2e          # web + mobile, ~2 minutos
npm run test:lighthouse   # ~2 minutos
npm run qa:report         # atualiza os números da página /qualidade
```

> Se o Cypress disser `bad option: --smoke-test`, o terminal está com a variável `ELECTRON_RUN_AS_NODE` (alguns terminais integrados definem). Rode `Remove-Item Env:ELECTRON_RUN_AS_NODE` no PowerShell e tente de novo.

**No GitHub Actions** (`.github/workflows/qa.yml`): build → Cypress web e mobile em paralelo → Lighthouse CI → relatório → deploy. O deploy só roda na `main` e só se tudo passou, e refaz o build com os resultados da execução. Assim, a página `/qualidade` e o selo do rodapé sempre mostram os números da versão que está no ar. O resumo de cada execução aparece na aba **Actions**, e os screenshots de falhas e os relatórios do Lighthouse ficam como artefatos.

**Onde o trabalho aparece no site:**
- selo "Este site é testado" no rodapé, com o total de testes e a nota do Lighthouse;
- página `/qualidade`: dashboard com os números, o pipeline e o cenário Gherkin real;
- case "Este portfólio", o primeiro da seção Trabalhos;
- pergunta "Como este site é testado?" no QA-Bot.

**O que os testes já encontraram:** a área de conversa do QA-Bot rolava, mas não era alcançável pelo teclado (axe, `scrollable-region-focusable`), e a página 404 tinha `noindex` junto com um `canonical` para a Home (sinais conflitantes para o Google). Os dois foram corrigidos.

## Qualidade

**O que o build verifica** (no `prerender.mjs`; se algo falhar, o deploy não sai):
- 1 `<h1>` por página;
- todas as seções presentes no HTML;
- nenhum marcador `__SITE_URL__` esquecido;
- todo arquivo linkado (CV, PDF do TCC, imagens) existe em `public/`;
- hash da CSP em dia.

**Acessibilidade:**
- skip link;
- só `<a>`/`<button>` reais;
- foco visível em ciano;
- focus trap e Esc no menu mobile e no FAQ;
- `aria-live` no FAQ;
- contraste AA: o `gray-500` da spec foi trocado por `gray-400`, que tem 7,8:1.

O cursor customizado:
- só existe com mouse;
- some ao navegar por teclado.

**Com `prefers-reduced-motion`**, ficam desligados:
- as partículas (o three.js nem é baixado);
- o marquee;
- o CountUp;
- os reveals;
- as transições.

**Sem JavaScript**, o HTML pré-renderizado mostra todo o conteúdo e os contatos.

**Lighthouse CI** (celular, mediana de 3 medições, build local, 23/09/2026):

| Página | Performance | Acessibilidade | Boas práticas | SEO |
|---|---|---|---|---|
| Home | 92 | 100 | 100 | 100 |
| `/qualidade` | 97 | 100 | 100 | 100 |

A auditoria de HTTPS fica de fora localmente (o `vite preview` é HTTP); na Vercel, o site é servido só por HTTPS. O `lighthouserc.json` bloqueia os scripts que o Kaspersky injeta nas páginas, para a nota não medir o antivírus. No DevTools do navegador, use uma janela anônima.

---

## Antes de publicar

- [ ] Confirmar que pode citar Icatu, AutoAvaliar, RwTech e Going2 (o emprego atual fica de fora até poder ser divulgado)
- [ ] Trocar as capas provisórias por prints **com dados mascarados** e atualizar os `imageAlt`
- [ ] Colocar as fotos reais em `public/images/profile.jpg` (Sobre) e `public/images/hero.jpg` (topo)
- [ ] Colocar o PDF do TCC em `public/tcc-gustavo-bueno.pdf` e preencher `url: '/tcc-gustavo-bueno.pdf'` (`site.cases` → `tcc`)
- [ ] Revisar a tradução EN e as respostas do FAQ em `content.ts`
- [ ] Configurar os 3 segredos da Vercel no GitHub ([DEPLOY.md, passo 6](docs/DEPLOY.md#6-ligar-o-github-actions-à-vercel-portão-de-qualidade)); sem eles, os testes rodam, mas o deploy é pulado
- [ ] Rodar o Lighthouse mobile na URL publicada
- [ ] Testar só com teclado (Tab / Shift+Tab / Esc) e com reduced-motion ligado no sistema
