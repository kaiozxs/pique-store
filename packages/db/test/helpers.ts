import { PGlite } from "@electric-sql/pglite";
import { embrulhar, PARSERS } from "../src/dev/pglite.ts";
import { migrar } from "../src/migrate.ts";
import type { Sql } from "../src/sql.ts";

/** Banco novo e vazio, com todas as migrações aplicadas. */
export async function novoBanco(): Promise<{ sql: Sql; pg: PGlite }> {
  const pg = new PGlite({ parsers: PARSERS });
  const sql = embrulhar(pg);
  await migrar(sql);
  return { sql, pg };
}
