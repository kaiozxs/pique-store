import { test } from "node:test";
import assert from "node:assert/strict";
import { novoBanco } from "./helpers.ts";

test("as migrações aplicam e criam as tabelas esperadas", async () => {
  const { sql } = await novoBanco();
  const tabelas = (await sql<{ table_name: string }>`
    select table_name from information_schema.tables where table_schema = 'public' order by 1`).map((t) => t.table_name);
  for (const t of ["products", "variants", "customers", "carts", "orders", "pieces", "panel_access", "home_sections"]) {
    assert.ok(tabelas.includes(t), `falta a tabela ${t}`);
  }
});

test("estoque nunca fica negativo", async () => {
  const { sql } = await novoBanco();
  const [p] = await sql<{ id: string }>`insert into products (handle, title) values ('x', 'X') returning id`;
  const [v] = await sql<{ id: string }>`insert into variants (product_id, title, price, stock) values (${p.id}, 'M', 10, 1) returning id`;
  await assert.rejects(() => sql`update variants set stock = stock - 2 where id = ${v.id}`, /check|violates/i);
});

test("só um endereço padrão por cliente", async () => {
  const { sql } = await novoBanco();
  const id = "11111111-1111-1111-1111-111111111111";
  await sql`insert into customers (id, email) values (${id}, 'a@b.c')`;
  const ins = () => sql`insert into addresses (customer_id, first_name, last_name, address_1, city, postal_code, is_default)
                        values (${id}, 'A', 'B', 'Rua 1', 'SP', '01000-000', true)`;
  await ins();
  await assert.rejects(ins, /unique|duplicate/i);
});
