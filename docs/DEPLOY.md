# Passo a passo: GitHub + Vercel

Roteiro para publicar o portfólio pela primeira vez. Os comandos são para o **PowerShell**, dentro da pasta do projeto. Como a arquitetura funciona está em [ARQUITETURA.md](./ARQUITETURA.md).

Tempo estimado: **40 a 50 minutos**, a maior parte criando contas.

> **Como o site é publicado:** a Vercel **não** publica sozinha a cada push. Quem publica é o workflow **QA** do GitHub Actions, e só depois que o site passa em todos os testes (Cypress web e mobile, acessibilidade e Lighthouse). Esse é o "portão de qualidade" ([ARQUITETURA.md](./ARQUITETURA.md#portão-de-qualidade-github-actions)). Por isso, além de criar o projeto na Vercel, o passo 6 liga o GitHub Actions a ela.

---

## Antes de começar

**Contas necessárias (todas gratuitas):**
- [GitHub](https://github.com): você já tem (`Guttinnz`).
- [Vercel](https://vercel.com/signup): crie com **"Continue with GitHub"**. Isso já conecta as duas contas.
- [Resend](https://resend.com): crie **com o e-mail gustavoriedel2202@gmail.com**. Sem domínio próprio, o Resend só entrega para o e-mail dono da conta.

**Plano da Vercel: Hobby (gratuito).** O Hobby é só para uso pessoal não comercial, e a Vercel cita "anunciar a venda de um serviço" como uso comercial ([regras](https://vercel.com/docs/limits/fair-use-guidelines)). Por isso, o site se apresenta como portfólio para procurar trabalho: o botão da seção de serviços diz "Vamos conversar", e não "Solicitar orçamento". Se um dia o site passar a vender serviços (orçamentos, preços, pagamento), migre para o plano **Pro** (US$ 20/mês).

**Conteúdo:** confira a lista "Antes de publicar" no [README](../README.md#antes-de-publicar). Nada impede publicar agora e trocar a foto e as imagens depois, porque cada push atualiza o site.

---

## 1. Conferir o projeto localmente

```powershell
npm ci
npm run check
```

O `check` roda o lint e o build completo, com as verificações. Ele tem que terminar com `prerender: verificações OK`.

Para rodar também os testes e o Lighthouse, como o GitHub Actions faz: `npm run qa` (leva uns 5 minutos; veja [README → Testes automatizados](../README.md#testes-automatizados)).

## 2 e 3. Repositório no GitHub ✅

Já feito: o projeto está em **<https://github.com/Guttinnz/Site_web_Gustavo>** (branch `main`, remote `origin`).

Confira no GitHub, na aba **Actions**, se o workflow **QA** terminou com ✅. Ele leva de 5 a 7 minutos. Enquanto o passo 6 não for feito, o job "Deploy na Vercel" termina com um aviso amarelo ("Deploy pulado"): os testes rodam, mas nada é publicado.

O `.gitignore` mantém fora do repositório `node_modules`, `dist`, `dist-ssr`, `public/images/opt`, `prompt.md` e qualquer `.env` (só o `.env.example` entra).

## 4. Criar a chave do Resend

1. Em <https://resend.com>, vá em **API Keys → Create API Key**.
2. Nome: `portfolio-vercel`. Permissão: **Sending access**.
3. Copie a chave (começa com `re_`). Ela só aparece uma vez. **Não cole em nenhum arquivo do projeto.**

## 5. Importar o projeto na Vercel

1. Acesse <https://vercel.com/new> e, em **Import Git Repository**, escolha `Site_web_Gustavo`. Se ele não aparecer, clique em *Adjust GitHub App Permissions* e libere só esse repositório.
2. Na tela **Configure Project**:
   - **Project Name:** `gustavo-bueno`. O site ficará em `https://gustavo-bueno.vercel.app`. Se o nome estiver ocupado, use outro: a URL do site se ajusta sozinha.
   - **Framework Preset:** Vite (detectado). O `vercel.json` já define instalação, build, saída e headers, então não altere *Build and Output Settings*.
   - **Environment Variables:** adicione `RESEND_API_KEY` com a chave do passo 4.
3. Clique em **Deploy**. O build leva de 1 a 2 minutos.

Depois deste primeiro deploy, a Vercel não publica mais sozinha a cada push (o `vercel.json` desliga o deploy pelo Git). Os próximos passam pelo GitHub Actions, configurado a seguir.

## 6. Ligar o GitHub Actions à Vercel (portão de qualidade)

O workflow precisa de 3 segredos para publicar. Eles ficam guardados no GitHub, **nunca em arquivos do projeto**.

1. **Token da Vercel:** em <https://vercel.com/account/settings/tokens>, clique em **Create Token**.
   - Nome: `github-actions-portfolio`. Escopo: a sua conta. Validade: a que preferir. Anote a data e renove antes de vencer.
   - Copie o token. Ele só aparece uma vez.
2. **ID do projeto:** no projeto na Vercel, **Settings → General → Project ID**.
3. **ID da conta:** em <https://vercel.com/account/settings>, copie o **Vercel ID**.
4. No GitHub, abra **<https://github.com/Guttinnz/Site_web_Gustavo/settings/secrets/actions>** e crie três **New repository secret**:

   | Nome | Valor |
   |---|---|
   | `VERCEL_TOKEN` | o token do item 1 |
   | `VERCEL_PROJECT_ID` | o Project ID do item 2 |
   | `VERCEL_ORG_ID` | o Vercel ID do item 3 |

5. Em **Actions → QA → Run workflow** (branch `main`), rode o workflow. Ao final, o job **Deploy na Vercel** mostra o link publicado, e a página **/qualidade** do site passa a mostrar os números dessa execução.

> Alternativa pelo terminal: `npx vercel@59.25.4 login` e depois `npx vercel@59.25.4 link`. O arquivo `.vercel/project.json` (fora do Git) traz o `orgId` e o `projectId`.

## 7. Ativar estatísticas e métricas

No projeto na Vercel:

1. Aba **Analytics → Enable**: visitas anônimas, sem cookies.
2. Aba **Speed Insights → Enable**: velocidade real dos visitantes.
3. No GitHub, **Actions → QA → Run workflow** para publicar de novo com as métricas ativas.

## 8. Verificar o site no ar

Abra o site numa **janela anônima** e confira:

- [ ] O site carrega, as partículas aparecem e a troca **BR/EN** funciona.
- [ ] No celular: o menu ☰ abre e fecha, e os links rolam até as seções.
- [ ] O chat de FAQ abre e responde.
- [ ] "Baixar CV" baixa o seu PDF.
- [ ] Uma URL inventada (ex.: `/teste123`) mostra a página 404 do site.
- [ ] **Formulário:** mande uma mensagem de teste. Ela deve chegar no Gmail com o assunto "[Portfólio] …". Na primeira vez, olhe o spam e marque como "não é spam".
- [ ] **Headers de segurança:**
  ```powershell
  curl.exe -sI https://gustavo-bueno.vercel.app | Select-String "content-security-policy|x-frame-options|strict-transport-security"
  ```
  Devem aparecer as três linhas.
- [ ] **Console sem erros:** aperte F12 → Console. Não pode haver erro de "Content-Security-Policy".
- [ ] **Prévia de link:** cole a URL no [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) e numa conversa do WhatsApp. Deve aparecer a imagem "Engenheiro de Software".
- [ ] **Lighthouse** (F12 → Lighthouse → Mobile), em janela anônima. O Kaspersky injeta scripts nas páginas e distorce a nota.
- [ ] **Página de qualidade:** o selo "Este site é testado", no rodapé, leva a `/qualidade`, com a data e o link da execução do GitHub que publicou esta versão.

**Opcional:** cadastre o site no [Google Search Console](https://search.google.com/search-console) e envie o sitemap (`/sitemap.xml`).

---

## Dia a dia: como atualizar o site

```powershell
npm run check
git add .
git commit -m "descreva a mudança"
git push
```

- **Push na `main`:** o workflow QA roda os testes e, se tudo passar, publica. Leva de 5 a 7 minutos. Se algum teste falhar, **nada é publicado** e a versão anterior continua no ar. O e-mail do GitHub avisa, e o log mostra qual teste falhou.
- **Mudanças maiores:** crie uma branch (`git switch -c minha-mudanca`), dê push e abra um pull request. Os testes rodam no PR e o resultado aparece nele. Para ver a mudança antes do merge, rode `npm run build` e `npm run preview` na sua máquina.
- **Mudou uma variável na Vercel** (ex.: `RESEND_API_KEY`)? Rode **Actions → QA → Run workflow** na `main` para publicar de novo.
- **Algo deu errado em produção?** Na Vercel, **Deployments →** escolha o deploy anterior **→ ⋯ → Promote to Production**. Volta em segundos.

## Domínio próprio (opcional)

1. Compre o domínio: [registro.br](https://registro.br) para `.com.br` (cerca de R$ 40/ano), ou um registrador internacional para `.dev`/`.com`.
2. Na Vercel: **Settings → Domains → Add** e siga as instruções de DNS mostradas.
3. Em **Settings → Environment Variables**, adicione `SITE_URL` = `https://seudominio.com.br` e publique de novo (**Actions → QA → Run workflow**).
4. **E-mail com o seu domínio:** no Resend, em **Domains → Add Domain**, configure os registros DNS indicados. Depois adicione `CONTACT_FROM_EMAIL` = `Portfólio <contato@seudominio.com.br>` na Vercel e publique de novo.

## Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| Build falha com "CSP: o script inline do index.html mudou" | O script inline do `index.html` foi editado | Copie o hash que a mensagem mostra para o `vercel.json` (`script-src`). |
| Build falha com "link para arquivo inexistente" | Um link aponta para um arquivo que não está em `public/` (ex.: PDF do TCC) | Coloque o arquivo em `public/` ou esvazie a `url`. |
| Formulário diz "fora do ar" | `RESEND_API_KEY` ausente, ou adicionada sem publicar de novo | Confira a variável e rode **Actions → QA → Run workflow**. |
| Formulário envia, mas o e-mail não chega | Conta do Resend criada com outro e-mail, ou mensagem no spam | Use a conta com gustavoriedel2202@gmail.com e verifique o spam. Os logs ficam em **Vercel → Logs**. |
| Analytics sem dados | Não ativado, sem redeploy, ou bloqueador de anúncios | Passo 6. Teste sem bloqueador. |
| Job "Deploy na Vercel" com aviso "Deploy pulado" | Segredos da Vercel não configurados no GitHub | Passo 6. |
| Deploy falha com "token is not valid" ou "Project not found" | Token vencido/revogado, ou IDs trocados | Gere outro token e confira os 3 segredos (passo 6). |
| Job "Cypress web" ou "Cypress mobile" ❌ | Um teste falhou | O teste aparece no resumo da execução. Os screenshots da falha ficam no artefato `cypress-web`/`cypress-mobile`. Rode `npm run cy:open` para ver o teste passo a passo. |
| Job "Lighthouse CI" ❌ | Nota abaixo da meta (Performance < 90, Acessibilidade < 95 ou SEO < 90) | Os relatórios completos ficam no artefato `lighthouse` (abra o `.html` no navegador). |
| QA ❌ no GitHub, mas funciona na sua máquina | Diferença de ambiente (Linux) | Abra o log do job em **Actions** e me mande o erro. |
