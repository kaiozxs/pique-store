import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Sql } from "./sql.ts";

const PASTA_SQL = join(import.meta.dirname, "..", "sql");

/**
 * Aplica as migrações que ainda não rodaram, em ordem, e anota cada uma.
 * Pode ser executado quantas vezes quiser: o que já foi aplicado é pulado.
 */
export async function migrar(sql: Sql, log: (msg: string) => void = () => {}): Promise<string[]> {
  await sql.unsafe(`create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())`);
  const feitas = new Set((await sql<{ name: string }>`select name from schema_migrations`).map((r) => r.name));
  const aplicadas: string[] = [];

  for (const arquivo of readdirSync(PASTA_SQL).filter((f) => f.endsWith(".sql")).sort()) {
    if (feitas.has(arquivo)) continue;
    log(`aplicando ${arquivo}…`);
    await sql.begin(async (tx) => {
      await tx.unsafe(readFileSync(join(PASTA_SQL, arquivo), "utf8"));
      await tx`insert into schema_migrations (name) values (${arquivo})`;
    });
    aplicadas.push(arquivo);
  }
  return aplicadas;
}
