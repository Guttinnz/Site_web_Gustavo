# Arquitetura e infraestrutura

Como o portfólio é construído, publicado e servido. O passo a passo para publicar está em [DEPLOY.md](./DEPLOY.md).

## Visão geral

```mermaid
flowchart LR
  dev["Você<br/>(VS Code)"] -- "git push" --> gh["GitHub<br/>repositório"]
  gh --> qa["GitHub Actions — QA<br/>lint, build, Cypress web + mobile,<br/>axe, Lighthouse CI"]
  qa -- "só se tudo passar<br/>vercel deploy --prebuilt" --> cdn["CDN da Vercel<br/>HTML pré-renderizado, JS, CSS,<br/>imagens, CV em PDF"]
  qa -- "só se tudo passar" --> fn["Função /api/contact<br/>Node.js 24"]
  visitante["Visitante"] --> cdn
  visitante -- "formulário (POST)" --> fn
  fn -- "RESEND_API_KEY" --> resend["Resend<br/>(envio de e-mail)"]
  resend --> gmail["Seu Gmail"]
  visitante -. "visitas anônimas,<br/>sem cookies" .-> analytics["Vercel Web Analytics<br/>+ Speed Insights"]
```

- **Site estático na CDN.** O HTML já sai pronto do build (pré-render) e é servido pela CDN global da Vercel. Não há servidor rodando para montar páginas.
- **Uma única função no servidor:** `api/contact.ts`, que recebe o formulário e envia o e-mail. É o único lugar com chave secreta.
- **Tudo cabe nos planos gratuitos** de GitHub, Vercel e Resend, respeitadas as observações sobre o plano Hobby em [Custos e limites](#custos-e-limites).

## Componentes

| Componente | Onde roda | Papel |
|---|---|---|
| Repositório | GitHub (público) | Código-fonte e testes. Cada push na `main` dispara o workflow de QA. |
| QA (`.github/workflows/qa.yml`) | GitHub Actions | Lint, build, Cypress (web e mobile), axe e Lighthouse CI em cada push e pull request. Na `main`, publica na Vercel **só se tudo passar**. |
| Build de produção | GitHub Actions (`vercel build`) | `npm ci` + `npm run build`, com Node 24 e os resultados dos testes embutidos. O deploy automático da Vercel pelo Git está desligado (`vercel.json` → `git.deploymentEnabled: false`). |
| Site | CDN da Vercel | Arquivos de `dist/`: páginas, JS, CSS, fontes, imagens, PDFs. |
| `api/contact.ts` | Vercel Functions (Node.js, região padrão `iad1`) | Valida o formulário, aplica o limite por IP e envia pelo Resend. |
| Resend | SaaS externo | Entrega o e-mail no seu Gmail. O botão "Responder" responde direto ao visitante. |
| Web Analytics + Speed Insights | Vercel | Visitas anônimas e métricas de velocidade (Core Web Vitals), sem cookies. |

A função roda em Washington (`iad1`), perto da API do Resend, que fica nos EUA. O visitante brasileiro recebe o site pela CDN, de um ponto próximo, e só o envio do formulário vai até a função.

## Pipeline de build

`npm run build` executa, nesta ordem:

1. **`scripts/images.mjs`** (via `prebuild`): gera AVIF, WebP e JPEG otimizados em `public/images/opt`. Essa pasta não vai para o Git: é refeita a cada build.
2. **`tsc -b`**: checagem de tipos do site, do servidor de pré-render e da função.
3. **`vite build`**: bundle do cliente em `dist/`. O three.js e o widget de FAQ ficam em chunks separados, carregados depois.
4. **`vite build --ssr`**: versão de servidor do app, usada só no passo seguinte.
5. **`scripts/prerender.mjs`**: gera `dist/index.html` e `dist/404.html` com o HTML completo e **derruba o build** se:
   - alguma página não tiver exatamente 1 `<h1>`;
   - faltar alguma seção;
   - algum link apontar para um arquivo que não existe;
   - o hash do script inline não bater com a CSP do `vercel.json`.

Se o build falha, nada é publicado e a versão anterior continua no ar.

## Portão de qualidade (GitHub Actions)

```mermaid
flowchart LR
  push["push / pull request"] --> build["build<br/>lint + typecheck + build"]
  build --> web["Cypress web<br/>1440×900"]
  build --> mobile["Cypress mobile<br/>390×844, toque"]
  build --> lh["Lighthouse CI<br/>celular, 3 medições"]
  web --> report["relatório<br/>qa-results.json"]
  mobile --> report
  lh --> report
  report -- "push na main<br/>e tudo verde" --> deploy["deploy<br/>vercel build + deploy --prebuilt"]
```

- **build:** o mesmo `npm run build` de sempre. O `dist/` vai como artefato para os jobs seguintes, então todos testam exatamente o mesmo site.
- **Cypress web e mobile** (em paralelo): cenários BDD em Gherkin (PT-BR) e testes técnicos em TypeScript contra o `vite preview`, que serve o `dist/` e a função do formulário em modo simulação. Detalhes em [README → Testes automatizados](../README.md#testes-automatizados).
- **Lighthouse CI:** mediana de 3 medições no perfil de celular, na Home e em `/qualidade`. Falha se Performance < 90, Acessibilidade < 95 ou SEO < 90.
- **relatório:** `scripts/qa-report.mjs` junta os resultados em `src/data/qa-results.json` e escreve o resumo na página da execução.
- **deploy:** só em push na `main` e só se todos os jobs passaram. Refaz o build com o `qa-results.json` desta execução, então a página `/qualidade` e o selo do rodapé mostram os números da versão que está no ar. Sem os segredos da Vercel configurados, o job apenas avisa e não publica.

Os resultados dos testes (resumos, screenshots de falhas, relatórios do Lighthouse) ficam como artefatos da execução por 14 dias.

## Rotas e cache

| Caminho | O que é | Cache |
|---|---|---|
| `/` | `index.html` pré-renderizado | Padrão da Vercel. Cada deploy invalida o cache. |
| `/qualidade` | `qualidade.html` pré-renderizado (`cleanUrls`), dashboard dos testes | Padrão |
| qualquer rota inexistente | `404.html`, com status 404 | Padrão |
| `/assets/*` | JS, CSS e fontes, com hash no nome | 1 ano, `immutable` |
| `/images/*` | Imagens otimizadas | 1 dia, mais 7 dias de `stale-while-revalidate` |
| `/cv-gustavo-bueno.pdf` | CV | Padrão |
| `/api/contact` | Função, só `POST` | `no-store` |
| `/robots.txt`, `/sitemap.xml` | Gerados no build com a URL do site | Padrão |

## Variáveis de ambiente

Configuradas na Vercel em *Settings → Environment Variables*. Nenhuma fica no código.

| Variável | Obrigatória | Uso |
|---|---|---|
| `RESEND_API_KEY` | Para o formulário funcionar | Chave do Resend, lida só por `api/contact.ts`. |
| `SITE_URL` | Não | URL pública, usada em canonical, Open Graph, JSON-LD e sitemap. Sem ela, vale o domínio de produção da Vercel. Defina ao ter domínio próprio. |
| `CONTACT_TO_EMAIL` | Não | Destino dos e-mails. Padrão: gustavoriedel2202@gmail.com. |
| `CONTACT_FROM_EMAIL` | Não | Remetente. Padrão: `onboarding@resend.dev`. Troque ao verificar um domínio no Resend. |

Toda variável alterada só vale **no próximo deploy**: use *Redeploy*.

## Ambientes

| Ambiente | Quando | Endereço |
|---|---|---|
| Produção | Push ou merge na `main`, **depois de passar em todos os testes** | `https://<projeto>.vercel.app` (ou o seu domínio) |
| Pull request | Push em outra branch com PR aberto | Os testes rodam e o resultado aparece no PR. Não há deploy de preview (o deploy pelo Git está desligado); para ver a mudança, use `npm run preview`. |
| Local | `npm run dev` / `npm run preview` | `localhost`. O formulário só simula o envio, a menos que exista `RESEND_API_KEY` no `.env.local`. |

## Segurança

- **Sem segredos no navegador.** A única chave (Resend) fica em variável de ambiente, e o `.gitignore` bloqueia `.env` e `.env.*`.
- **Headers** (`vercel.json`):
  - Content-Security-Policy restritiva: só scripts do próprio site, mais o script inline liberado por hash;
  - X-Frame-Options `DENY`;
  - X-Content-Type-Options `nosniff`;
  - Referrer-Policy;
  - Permissions-Policy.
- **Formulário:**
  - validação no servidor;
  - corpo de no máximo 8 KB;
  - 5 mensagens por IP a cada 10 minutos (por instância da função);
  - campo invisível contra robôs;
  - tempo mínimo desde a abertura da página;
  - tempo máximo de execução de 10 s.
- **Teste de segredos:** a cada execução, `seo.cy.ts` varre o JavaScript publicado atrás de formatos de chave (Resend, Google, OpenAI, GitHub) e dos valores das variáveis sensíveis do ambiente.
- **Token de deploy** (`VERCEL_TOKEN`) fica só nos segredos do GitHub, usado apenas pelo job de deploy, que só roda em push na `main` (nunca em pull request de terceiros).

## Custos e limites

| Serviço | Plano | Limites relevantes |
|---|---|---|
| GitHub | Free | Repositório público: Actions ilimitado. Cada execução do QA leva cerca de 5 a 7 minutos de runner. |
| Vercel | Hobby (grátis) | 100 GB de tráfego/mês, 1 milhão de execuções de função/mês, 50 mil eventos de Analytics/mês. **Só para uso pessoal não comercial** (veja abaixo). |
| Resend | Free | 3.000 e-mails/mês, 100 por dia. Sem domínio próprio, só entrega para o e-mail dono da conta. |

> ⚠️ **Plano Hobby e uso comercial.** As [regras de uso da Vercel](https://vercel.com/docs/limits/fair-use-guidelines) restringem o Hobby a uso pessoal não comercial, e citam "anunciar a venda de um produto ou serviço" como uso comercial.
>
> **Decisão:** ficar no Hobby, com o site posicionado como portfólio para procurar trabalho. O botão da seção de serviços diz "Vamos conversar", sem "Solicitar orçamento". Se o site passar a vender serviços (orçamentos, preços, pagamento), migre para o plano Pro.
