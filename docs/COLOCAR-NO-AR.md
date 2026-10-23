# Colocar a loja nova no ar (sem Medusa)

Tudo o que dependia de você, em ordem. O código já está pronto na branch `sem-medusa`
e foi testado de ponta a ponta no banco local (cupom → endereço → frete → conta →
pagamento → pedido → peças com código → verificação → painel).

> Regra de ouro: **chaves e senhas nunca vão no chat nem no GitHub.** Elas ficam só
> nos arquivos `.env.local` (no seu PC) e nas "Environment Variables" da Vercel.

## 1. Supabase (banco + login + fotos)

1. Crie o projeto em <https://supabase.com> → região **South America (São Paulo)**.
   Anote a senha do banco que você escolher.
2. **Project Settings → API**: copie `Project URL`, `anon / publishable key` e
   `service_role key` (esta última é secreta, só vai no servidor).
3. **Connect → Transaction pooler** (porta **6543**): copie a string de conexão e
   troque `[YOUR-PASSWORD]` pela senha do banco. Essa é a `DATABASE_URL`.
4. **Authentication → Sign In / Providers → Email**: **desligue "Confirm email"**
   (a loja ainda não envia e-mail de confirmação; com ele ligado ninguém consegue
   criar conta).
5. **Authentication → URL Configuration**:
   - *Site URL*: o endereço da loja (ex.: `https://pique-store-seven.vercel.app`).
   - *Redirect URLs*: adicione `https://<endereço da loja>/auth/callback`
     (e `http://localhost:3000/auth/callback` para testar no PC).
6. **Authentication → Providers → Google**: ative e cole o *Client ID* e o
   *Client secret* do Google Cloud. No Google Cloud (OAuth client), o URI de
   redirecionamento autorizado é o que o Supabase mostra nessa tela
   (`https://<projeto>.supabase.co/auth/v1/callback`).
7. **Storage → New bucket**: nome `produtos`, marque **Public bucket**.

## 2. Criar as tabelas e carregar os produtos (no seu PC)

Na pasta `packages/db`, com a `DATABASE_URL` do passo 1.3:

```bash
npm install
DATABASE_URL="postgresql://…" npm run migrate
DATABASE_URL="postgresql://…" IMAGES_BASE_URL="/produtos" npm run seed
```

- `migrate` cria todas as tabelas (pode rodar de novo sem problema).
- `seed` carrega os produtos que já estavam na loja (camisetas Preta e Branca,
  categorias, frete, home). As fotos continuam saindo da própria loja (`/produtos`),
  não precisa subir nada no Storage para elas. Rodar de novo **não** zera estoque.
- Estoque inicial de cada variação ficou em **100** e os dois fretes em **R$ 10,00**;
  ajuste em **/admin → Produtos**.

## 3. Mercado Pago

1. No painel do Mercado Pago → *Suas integrações*: pegue a **Public Key** e o
   **Access Token** (use as de **teste** primeiro).
2. Em *Webhooks*: URL `https://<endereço da loja>/api/mercadopago/webhook`, evento
   **Pagamentos**. Copie a **assinatura secreta** (opcional, mas recomendado).

## 4. Vercel (dois projetos, mesmo repositório)

| Projeto | Root Directory | Branch |
|---|---|---|
| Loja (já existe) | `apps/storefront` | `sem-medusa` (depois `main`) |
| Painel (novo) | `apps/admin` | `sem-medusa` (depois `main`) |

**Loja** — variáveis (modelo em `apps/storefront/.env.example`):
`DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`,
`MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `CRON_SECRET`
(qualquer texto longo e aleatório) e `ADMIN_APP_URL` (o endereço do projeto do
painel, ex.: `https://pique-admin.vercel.app`).

**Painel** — variáveis (modelo em `apps/admin/.env.example`):
`DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `STOREFRONT_URL`.

O painel aparece em `https://<loja>/admin` (a loja repassa o tráfego), por isso o
login vale nos dois.

Confira que **nenhuma** variável de teste (`DEV_AUTH_SECRET`) existe lá: o login e
o pagamento "simulados" só funcionam no seu PC e **nunca** em produção.

## 5. Primeiro dono do painel

1. Crie sua conta normalmente na loja (ou entre com o Google).
2. No PC, em `packages/db`:

   ```bash
   DATABASE_URL="postgresql://…" npm run primeiro-dono -- seu@email.com
   ```
3. Entre em `https://<loja>/admin`. Daí em diante você libera o lojista pela tela
   **Acessos** (a pessoa precisa ter conta na loja). Lojista não vê financeiro nem
   Acessos.

## 6. Teste final (5 minutos)

- [ ] Entrar com e-mail/senha **e** com o Google.
- [ ] Adicionar ao carrinho, aplicar cupom, comprar com cartão de **teste**.
- [ ] O pedido aparece em **/admin → Pedidos**; o estoque desceu.
- [ ] Em **Minhas coleções** a peça aparece com código; **Verifique seu PIQUE** confirma.
- [ ] Em **/admin → Produtos**: criar um produto de teste, publicar, ver na loja, apagar.
- [ ] Em **Vendas e etiquetas**: gerar o .zip do dia.

## O que mudou / o que sobrou

- **Fora:** Medusa (backend, Railway) não é mais usado. A pasta `apps/backend` foi removida
  do repositório (continua no histórico do Git, se um dia precisar). Dá para cancelar o
  Railway.
- **Cupons:** não há tela de cupom ainda — crie por SQL (tabela `coupons`: `code`,
  `kind` = `percent`|`fixed`, `amount`). Exemplo: `insert into coupons (code, kind, amount) values ('PIQUE10','percent',10);`
- **Pedidos abandonados:** o estoque que eles seguravam volta sozinho (a cada nova
  compra e numa rotina diária). Pedido com pagamento "em análise" espera o aviso do
  Mercado Pago.
- **Produto "Branca":** tem uma opção de cor estranha herdada do Medusa; vale revisar
  em **/admin → Produtos**.
- **E-mails** (confirmação, recibo): ainda não existem — por isso a confirmação de
  e-mail do Supabase precisa ficar desligada.
- **Nota fiscal / Correios:** continuam como antes (botão "Emitir NF" desativado;
  rastreio colado à mão no pedido).
