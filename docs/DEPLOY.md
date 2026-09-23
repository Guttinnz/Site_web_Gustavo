# Passo a passo: GitHub + Vercel

Roteiro para publicar o portfólio pela primeira vez. Os comandos são para o **PowerShell**, dentro da pasta do projeto. Como a arquitetura funciona está em [ARQUITETURA.md](./ARQUITETURA.md).

Tempo estimado: **30 a 40 minutos**, a maior parte criando contas.

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

## 2 e 3. Repositório no GitHub ✅

Já feito: o projeto está em **<https://github.com/Guttinnz/Site_web_Gustavo>** (branch `main`, remote `origin`).

Confira no GitHub, na aba **Actions**, se o workflow **CI** terminou com ✅. Ele leva de 1 a 2 minutos.

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

## 6. Ativar estatísticas e métricas

No projeto na Vercel:

1. Aba **Analytics → Enable**: visitas anônimas, sem cookies.
2. Aba **Speed Insights → Enable**: velocidade real dos visitantes.
3. Em **Deployments**, no último deploy: menu **⋯ → Redeploy**, para os scripts entrarem.

## 7. Verificar o site no ar

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

**Opcional:** cadastre o site no [Google Search Console](https://search.google.com/search-console) e envie o sitemap (`/sitemap.xml`).

---

## Dia a dia: como atualizar o site

```powershell
npm run check
git add .
git commit -m "descreva a mudança"
git push
```

- **Push na `main`** vira um deploy de produção automático em 1 a 2 minutos.
- **Mudanças maiores:** crie uma branch (`git switch -c minha-mudanca`), dê push e abra um pull request. A Vercel gera uma **URL de preview** para você conferir antes. O CI roda no PR. Depois é só fazer o merge.
- **Algo deu errado em produção?** Na Vercel, **Deployments →** escolha o deploy anterior **→ ⋯ → Promote to Production**. Volta em segundos.

## Domínio próprio (opcional)

1. Compre o domínio: [registro.br](https://registro.br) para `.com.br` (cerca de R$ 40/ano), ou um registrador internacional para `.dev`/`.com`.
2. Na Vercel: **Settings → Domains → Add** e siga as instruções de DNS mostradas.
3. Em **Settings → Environment Variables**, adicione `SITE_URL` = `https://seudominio.com.br` e faça **Redeploy**.
4. **E-mail com o seu domínio:** no Resend, em **Domains → Add Domain**, configure os registros DNS indicados. Depois adicione `CONTACT_FROM_EMAIL` = `Portfólio <contato@seudominio.com.br>` na Vercel e faça **Redeploy**.

## Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| Build falha com "CSP: o script inline do index.html mudou" | O script inline do `index.html` foi editado | Copie o hash que a mensagem mostra para o `vercel.json` (`script-src`). |
| Build falha com "link para arquivo inexistente" | Um link aponta para um arquivo que não está em `public/` (ex.: PDF do TCC) | Coloque o arquivo em `public/` ou esvazie a `url`. |
| Formulário diz "fora do ar" | `RESEND_API_KEY` ausente, ou adicionada sem redeploy | Confira a variável e faça **Redeploy**. |
| Formulário envia, mas o e-mail não chega | Conta do Resend criada com outro e-mail, ou mensagem no spam | Use a conta com gustavoriedel2202@gmail.com e verifique o spam. Os logs ficam em **Vercel → Logs**. |
| Analytics sem dados | Não ativado, sem redeploy, ou bloqueador de anúncios | Passo 6. Teste sem bloqueador. |
| CI ❌ no GitHub, mas funciona na sua máquina | Diferença de ambiente (Linux) | Abra o log do job em **Actions** e me mande o erro. |
