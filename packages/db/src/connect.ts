import postgres from "postgres";
import type { Sql } from "./sql.ts";

declare global {
  // eslint-disable-next-line no-var
  var __piqueSql: Sql | undefined;
}

function usaSsl(url: string): boolean {
  if (process.env.DATABASE_SSL === "disable") return false;
  try {
    const host = new URL(url).hostname;
    return !["localhost", "127.0.0.1", "::1", "[::1]"].includes(host);
  } catch {
    return true;
  }
}

/**
 * Conexão com o banco. Use a URL do *pooler* do Supabase (porta 6543): funções
 * serverless abrem muitas conexões curtas, e o pooler existe para isso.
 *
 * `prepare: false` é exigido pelo pooler em modo transação. Números do
 * Postgres (dinheiro e contadores) voltam como `number`, não como texto.
 */
export function connect(url: string): Sql {
  const sql = postgres(url, {
    // Supabase só fala criptografado. Banco na própria máquina (desenvolvimento e
    // testes) não tem SSL; DATABASE_SSL=disable força desligar em outros casos.
    ssl: usaSsl(url) ? "require" : false,
    prepare: false,
    // No Supabase, poucas conexões por função bastam (o pooler cuida do resto).
    // O banco local de desenvolvimento só aguenta uma: DATABASE_POOL_MAX=1.
    max: Number(process.env.DATABASE_POOL_MAX ?? 3),
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {},
    types: {
      numeric: { to: 1700, from: [1700], serialize: (x: unknown) => String(x), parse: (x: string) => Number(x) },
      bigint: { to: 20, from: [20], serialize: (x: unknown) => String(x), parse: (x: string) => Number(x) },
    },
  });
  return sql as unknown as Sql;
}

/** Uma conexão por processo (evita abrir outra a cada recarga no desenvolvimento). */
export function db(): Sql {
  if (!globalThis.__piqueSql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL não está definida.");
    globalThis.__piqueSql = connect(url);
  }
  return globalThis.__piqueSql;
}
