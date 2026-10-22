/**
 * Gera dois arquivos SQL para colar no SQL Editor do Supabase (alternativa a
 * `npm run migrate` + `npm run seed`, para quem não quer usar a senha do banco
 * no terminal):
 *   docs/supabase/1-tabelas.sql   → cria as tabelas (igual ao migrate)
 *   docs/supabase/2-produtos.sql  → carrega os produtos (igual ao seed)
 *
 *   npx tsx scripts/gerar-sql.ts [prefixo-das-imagens]   (padrão: /produtos)
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { SeedCatalog } from "../src/seed.ts";

const raiz = join(import.meta.dirname, "..");
const saida = join(raiz, "..", "..", "docs", "supabase");
const base = (process.argv[2] ?? "/produtos").replace(/\/$/, "");
mkdirSync(saida, { recursive: true });

const q = (v: unknown): string => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return `'${String(v).replace(/'/g, "''")}'`;
};
const arr = (a: string[]) => `array[${a.map(q).join(",")}]::text[]`;
const url = (f: string | null) => (f ? (/^https?:\/\//.test(f) ? f : `${base}/${f}`) : null);

// 1) Tabelas
const arquivos = readdirSync(join(raiz, "sql")).filter((f) => f.endsWith(".sql")).sort();
let tabelas = `-- PIQUE: cria as tabelas da loja. Cole tudo no SQL Editor do Supabase e clique em Run.\n\n`;
tabelas += `create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now());\n\n`;
for (const f of arquivos) tabelas += `-- ===== ${f} =====\n${readFileSync(join(raiz, "sql", f), "utf8")}\n\n`;
tabelas += arquivos.map((f) => `insert into schema_migrations (name) values (${q(f)}) on conflict do nothing;`).join("\n") + "\n";
writeFileSync(join(saida, "1-tabelas.sql"), tabelas);

// 2) Produtos
const d: SeedCatalog = JSON.parse(readFileSync(join(raiz, "seed", "catalog.json"), "utf8"));
const o: string[] = [`-- PIQUE: carrega produtos, categorias, frete e home. Rode DEPOIS do 1-tabelas.sql.\n`, "begin;"];
for (const c of d.categories) {
  o.push(`insert into categories (handle, name, position, active) values (${q(c.handle)}, ${q(c.name)}, ${c.position}, ${q(c.active)}) on conflict (handle) do update set name = excluded.name, position = excluded.position, active = excluded.active;`);
}
for (const [i, p] of d.products.entries()) {
  const h = q(p.handle);
  o.push(`\n-- ${p.title}`);
  o.push(`insert into products (handle, title, description, thumbnail, status, option_order, is_presale, presale_message, estimated_ship_date, created_at) values (${h}, ${q(p.title)}, ${q(p.description)}, ${q(url(p.thumbnail))}, ${q(p.status)}, ${arr(p.option_order)}, ${q(p.is_presale)}, ${q(p.presale_message)}, ${q(p.estimated_ship_date)}::date, now() - (${i} * interval '1 second')) on conflict (handle) do update set title = excluded.title, description = excluded.description, thumbnail = excluded.thumbnail, status = excluded.status, option_order = excluded.option_order, is_presale = excluded.is_presale, presale_message = excluded.presale_message, estimated_ship_date = excluded.estimated_ship_date, updated_at = now();`);
  o.push(`delete from product_images where product_id = (select id from products where handle = ${h});`);
  for (const img of p.images) o.push(`insert into product_images (product_id, url, position) select id, ${q(url(img.file))}, ${img.position} from products where handle = ${h};`);
  o.push(`delete from product_categories where product_id = (select id from products where handle = ${h});`);
  for (const c of p.categories) o.push(`insert into product_categories (product_id, category_id) select p.id, c.id from products p, categories c where p.handle = ${h} and c.handle = ${q(c)} on conflict do nothing;`);
  for (const v of p.variants) {
    o.push(`insert into variants (product_id, title, sku, options, price, stock, position) select id, ${q(v.title)}, ${q(v.sku)}, ${q(JSON.stringify(v.options))}::jsonb, ${v.price}, ${v.stock}, ${v.position} from products where handle = ${h} on conflict (sku) do update set title = excluded.title, options = excluded.options, price = excluded.price, position = excluded.position;`);
  }
}
o.push(`\n-- Frete (só se ainda não houver nenhum)`);
o.push(`insert into shipping_options (name, price, position) select * from (values ${d.shipping_options.map((s) => `(${q(s.name)}, ${s.price}::numeric, ${s.position})`).join(", ")}) as v(name, price, position) where not exists (select 1 from shipping_options);`);
o.push(`insert into wab_content (id, status, title, body, media) values (1, ${q(d.wab.status)}, ${q(d.wab.title)}, ${q(d.wab.body)}, ${d.wab.media ? q(JSON.stringify(d.wab.media)) : "null"}::jsonb) on conflict (id) do nothing;`);
for (const hs of d.home_sections) o.push(`insert into home_sections (type, position, visible, config) values (${q(hs.type)}, ${hs.position}, ${q(hs.visible)}, ${hs.config ? q(JSON.stringify(hs.config)) : "null"}::jsonb) on conflict (type) do nothing;`);
o.push(`insert into drop_weeks (title, status) select ${q(d.drop.title)}, ${q(d.drop.status)} where not exists (select 1 from drop_weeks);`);
o.push("commit;");
writeFileSync(join(saida, "2-produtos.sql"), o.join("\n") + "\n");
console.log("ok: docs/supabase/1-tabelas.sql e 2-produtos.sql");
