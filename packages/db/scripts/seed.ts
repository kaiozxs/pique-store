/**
 * Carrega o catálogo inicial (produtos, fotos, categorias, frete, home).
 * Pode rodar de novo sem perder estoque.
 *
 *   DATABASE_URL="postgresql://…" IMAGES_BASE_URL="https://<projeto>.supabase.co/storage/v1/object/public/produtos" npm run seed
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { connect } from "../src/connect.ts";
import { seedCatalog, type SeedCatalog } from "../src/seed.ts";

const url = process.env.DATABASE_URL;
const imagens = process.env.IMAGES_BASE_URL;
if (!url || !imagens) {
  console.error("Defina DATABASE_URL e IMAGES_BASE_URL.");
  process.exit(1);
}
const seed: SeedCatalog = JSON.parse(readFileSync(join(import.meta.dirname, "..", "seed", "catalog.json"), "utf8"));
const sql = connect(url);
await seedCatalog(sql, seed, { imagesBase: imagens });
console.log(`ok: ${seed.products.length} produtos, ${seed.categories.length} categorias.`);
await (sql as unknown as { end: () => Promise<void> }).end();
