# Portfólio — Gustavo Bueno · Engenheiro de Software (Qualidade e Automações)

Site one-page, bilíngue (PT-BR / EN), com fundo de partículas em WebGL, hospedado na Vercel.

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

---

## Estrutura

```
src/
├── data/content.ts      ← TODO o texto do site (PT e EN), contatos, trajetória, stack, certificações
├── sections/            ← Hero, Impact, Work, Career, About (+ marquee), Services, Footer
├── components/          ← CustomCursor, Background3D, RevealOnScroll, CountUp, Marquee,
│   │                      Header, MobileMenu, LanguageToggle, I18nProvider, Picture…
│   └── chat/            ← widget de FAQ (QA-Bot)
├── hooks/               ← useI18n, useInView, useReducedMotion, useFocusTrap, useIdle…
├── pages/               ← Home e NotFound (404)
├── styles/index.css     ← tokens de design (cores), utilitários, regras de reduced-motion
├── main.tsx             ← entrada do navegador (hidrata o HTML pré-renderizado)
└── entry-server.tsx     ← entrada do pré-render (usada só no build)
api/contact.ts           ← função da Vercel do formulário (única com chave secreta)
scripts/                 ← images.mjs, placeholders.mjs, prerender.mjs
public/                  ← imagens, favicons, og-image.jpg, cv-gustavo-bueno.pdf
docs/                    ← ARQUITETURA.md e DEPLOY.md
.github/workflows/ci.yml ← CI: lint + build a cada push e pull request
vercel.json              ← build, headers de segurança/CSP, cache e limite da função
```

### Como a página carrega

- **HTML pré-renderizado.** No build, `scripts/prerender.mjs` gera o HTML completo da Home (`dist/index.html`) e da 404 (`dist/404.html`). O texto aparece antes do JavaScript, o que é bom para o LCP e para buscadores. Depois o React hidrata e a página vira uma SPA normal.
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
| `work-icatu.jpg`, `work-ivy.jpg`, `work-going2.jpg`, `work-tcc.jpg`, `work-n8n.jpg` | Capas dos cases | 16:9, centralizado |

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

Resumo: cada push na `main` gera um deploy de produção. O `vercel.json` já define:
- instalação (`npm ci`), build (`npm run build`) e saída (`dist`);
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

**Lighthouse** (build local, 23/09/2026):

| | Performance | Acessibilidade | SEO |
|---|---|---|---|
| Mobile | 94 | 100 | 100 |
| Desktop | 100 | 100 | 100 |

Boas práticas marca 81 localmente só por falta de HTTPS. Na Vercel isso deixa de valer. Se o seu antivírus injeta scripts nas páginas (o Kaspersky faz isso), rode o Lighthouse numa janela anônima ou com `--blocked-url-patterns`, senão ele mede o script do antivírus.

---

## Antes de publicar

- [ ] Confirmar que pode citar Icatu, AutoAvaliar, RwTech e Going2 (o emprego atual fica de fora até poder ser divulgado)
- [ ] Trocar as capas provisórias por prints **com dados mascarados** e atualizar os `imageAlt`
- [ ] Colocar a foto real em `public/images/profile.jpg`
- [ ] Colocar o PDF do TCC em `public/tcc-gustavo-bueno.pdf` e preencher `url: '/tcc-gustavo-bueno.pdf'` (`site.cases` → `tcc`)
- [ ] Revisar a tradução EN e as respostas do FAQ em `content.ts`
- [ ] Rodar o Lighthouse mobile na URL publicada
- [ ] Testar só com teclado (Tab / Shift+Tab / Esc) e com reduced-motion ligado no sistema
