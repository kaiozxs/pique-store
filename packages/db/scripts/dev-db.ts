/**
 * Banco local para desenvolvimento: um Postgres de verdade (PGlite) exposto na
 * porta 5433, com as migrações e o catálogo já carregados. Os dados ficam na
 * pasta `.dev-db` e sobrevivem a reinícios.
 *
 *   npm run dev-db
 *   DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/postgres
 */
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { embrulhar, PARSERS } from "../src/dev/pglite.ts";
import { migrar } from "../src/migrate.ts";
import { seedCatalog, type SeedCatalog } from "../src/seed.ts";

const RAIZ = join(import.meta.dirname, "..");
const PORTA = Number(process.env.DEV_DB_PORT ?? 5433);
const IMAGENS = process.env.IMAGES_BASE_URL ?? "http://localhost:3000/produtos";

const pg = await PGlite.create({ dataDir: join(RAIZ, ".dev-db"), parsers: PARSERS });
const sql = embrulhar(pg);

for (const nome of await migrar(sql, (m) => console.log(m))) console.log("  ok:", nome);

const [{ n }] = (await sql<{ n: number }>`select count(*)::int as n from products`) as [{ n: number }];
if (n === 0) {
  const seed: SeedCatalog = JSON.parse(readFileSync(join(RAIZ, "seed", "catalog.json"), "utf8"));
  await seedCatalog(sql, seed, { imagesBase: IMAGENS });
  console.log("catálogo inicial carregado");
}

const servidor = new PGLiteSocketServer({ db: pg, port: PORTA, host: "127.0.0.1", maxConnections: 10 });
await servidor.start();
console.log(`banco local pronto em postgres://postgres:postgres@127.0.0.1:${PORTA}/postgres`);

const sair = async () => {
  await servidor.stop();
  await pg.close();
  process.exit(0);
};
process.on("SIGINT", sair);
process.on("SIGTERM", sair);
