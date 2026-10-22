// Só para testes e desenvolvimento local: faz o Postgres embutido (PGlite)
// falar o mesmo contrato `Sql` que a biblioteca `postgres` usa em produção.
// Não é exportado pelo pacote principal.
import type { PGlite, Transaction } from "@electric-sql/pglite";
import type { Sql } from "../sql.ts";

export const PARSERS = { 1700: (v: string) => Number(v), 20: (v: string) => Number(v) };

export function embrulhar(base: PGlite | Transaction): Sql {
  const f = (async (strings: TemplateStringsArray, ...values: unknown[]) => {
    let texto = "";
    strings.forEach((s, i) => {
      texto += s;
      if (i < values.length) texto += `$${i + 1}`;
    });
    const r = await base.query(texto, values as unknown[]);
    return r.rows;
  }) as unknown as Sql;
  f.begin = (fn) => (base as PGlite).transaction((tx) => fn(embrulhar(tx)));
  f.unsafe = (async (texto: string, params: unknown[] = []) => {
    // Sem parâmetros: texto pode ter vários comandos (é o caso das migrações).
    if (params.length === 0 && "exec" in base) {
      const r = await (base as PGlite).exec(texto);
      return (r[r.length - 1]?.rows ?? []) as never;
    }
    return (await base.query(texto, params)).rows;
  }) as Sql["unsafe"];
  return f;
}
