import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

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
    { resolve: "./src/modules/book" },
    { resolve: "./src/modules/verification" },
    { resolve: "./src/modules/drop-semana" },
    { resolve: "./src/modules/home-config" },
    { resolve: "./src/modules/dicas" },
    { resolve: "./src/modules/faq" },
  ],
})
