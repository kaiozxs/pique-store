import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Diferente do provider de pagamento (que só falha quando alguém tenta usar
// pp_mercadopago sem token), o módulo de Auth valida TODOS os providers
// registrados já na inicialização do servidor — se faltar clientId/secret
// do Google, o backend inteiro nem sobe (login por e-mail/senha incluso).
// Por isso o provider "google" só entra na lista quando a credencial existe.
const authProviders = [
  { resolve: "@medusajs/medusa/auth-emailpass", id: "emailpass" },
  ...(process.env.GOOGLE_CLIENT_ID
    ? [
        {
          resolve: "@medusajs/medusa/auth-google",
          id: "google",
          options: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            // Só serve de valor-padrão: o storefront manda o callback_url
            // dele mesmo em cada tentativa de login (necessário pra
            // funcionar tanto local quanto em produção com o mesmo
            // backend) — ver GoogleAuthService.authenticate.
            callbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback",
          },
        },
      ]
    : []),
]

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    // Sem isso, o provider local de arquivos (upload de imagem de produto)
    // grava a URL pública com o fallback dele mesmo, "localhost:9000" —
    // funciona local, mas quebra em produção (a URL fica salva assim pra
    // sempre no banco, pra cada arquivo). MEDUSA_BACKEND_URL aqui é a URL
    // pública de verdade do backend (ex: a do Railway).
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-local",
            id: "local",
            options: {
              backend_url: `${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/static`,
            },
          },
        ],
      },
    },
    // Diferente do pagamento, o módulo de auth NÃO registra "emailpass"
    // sozinho por baixo dos panos — configurar esse módulo aqui SUBSTITUI
    // a lista de providers inteira. Por isso "emailpass" tem que ficar
    // redeclarado junto do "google", senão o login por e-mail/senha
    // (inclusive do admin, que usa o mesmo módulo) para de funcionar.
    {
      resolve: "@medusajs/medusa/auth",
      options: { providers: authProviders },
    },
    // "pp_system_default" continua registrado automaticamente pelo módulo
    // de pagamento mesmo com isso aqui — não precisa redeclarar ele.
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/mercadopago",
            options: {
              accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
            },
          },
        ],
      },
    },
    { resolve: "./src/modules/book" },
    { resolve: "./src/modules/verification" },
    { resolve: "./src/modules/drop-semana" },
    { resolve: "./src/modules/home-config" },
    { resolve: "./src/modules/dicas" },
    { resolve: "./src/modules/faq" },
  ],
})
