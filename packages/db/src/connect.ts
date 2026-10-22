import pg from "pg";
import type { Row, Sql } from "./sql.ts";

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

// Dinheiro (numeric) e contadores (bigint) voltam como número, não como texto.
// O resto segue o padrão do `pg` (datas viram Date, json vira objeto, etc.).
const types = {
  getTypeParser: ((oid: number, formato?: "text" | "binary") =>
    oid === 1700 || oid === 20 ? (v: string) => Number(v) : pg.types.getTypeParser(oid, formato as "text")) as typeof pg.types.getTypeParser,
};

/** `select ${a} …` vira `select $1 …` + valores: os valores nunca entram no texto da consulta. */
function montar(strings: TemplateStringsArray, values: unknown[]): { texto: string; valores: unknown[] } {
  let texto = "";
  strings.forEach((s, i) => {
    texto += s;
    if (i < values.length) texto += `$${i + 1}`;
  });
  return { texto, valores: values.map((v) => (v === undefined ? null : v)) };
}

type Executor = Pick<pg.Pool | pg.PoolClient, "query">;

async function rodar<T extends Row>(exec: Executor, texto: string, valores?: unknown[]): Promise<T[]> {
  const r = valores && valores.length > 0 ? await exec.query(texto, valores as unknown[]) : await exec.query(texto);
  // Texto com vários comandos (migrações): o resultado é uma lista, vale o último.
  const ultimo = Array.isArray(r) ? r[r.length - 1] : r;
  return (ultimo?.rows ?? []) as T[];
}

function embrulhar(exec: Executor, abrirTransacao: ((fn: (tx: Sql) => Promise<unknown>) => Promise<unknown>) | null): Sql {
  const f = (async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const { texto, valores } = montar(strings, values);
    return rodar(exec, texto, valores);
  }) as unknown as Sql;
  f.begin = (async (fn: (tx: Sql) => Promise<unknown>) => {
    if (!abrirTransacao) throw new Error("Transação dentro de transação não é suportada.");
    return abrirTransacao(fn);
  }) as Sql["begin"];
  f.unsafe = (async (texto: string, params: unknown[] = []) => rodar(exec, texto, params)) as Sql["unsafe"];
  return f;
}

/**
 * Conexão com o banco. Use a URL do *pooler* do Supabase em modo transação
 * (porta 6543): funções serverless abrem muitas conexões curtas, e o pooler existe
 * para isso.
 *
 * Usa o driver `pg` de propósito: ele manda cada consulta com parâmetros numa
 * viagem só (Parse/Bind/Execute/Sync). A biblioteca `postgres` faz duas viagens
 * (pergunta os tipos, depois manda os valores) e o pooler em modo transação pode
 * entregar cada viagem a uma conexão diferente — a consulta fica pendurada.
 */
export function connect(url: string): Sql {
  const pool = new pg.Pool({
    connectionString: url,
    ssl: usaSsl(url) ? { rejectUnauthorized: false } : false,
    // No Supabase, poucas conexões por função bastam (o pooler cuida do resto).
    // O banco local de desenvolvimento só aguenta uma: DATABASE_POOL_MAX=1.
    max: Number(process.env.DATABASE_POOL_MAX ?? 3),
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
    // Rede de segurança: nenhuma consulta fica esperando para sempre.
    query_timeout: 20_000,
    types,
  });
  // Conexão ociosa derrubada pelo pooler não pode derrubar o processo.
  pool.on("error", (e) => console.error("[db] conexão ociosa encerrada:", e.message));

  const sql = embrulhar(pool, async (fn) => {
    const cliente = await pool.connect();
    try {
      await cliente.query("begin");
      const resultado = await fn(embrulhar(cliente, null));
      await cliente.query("commit");
      return resultado;
    } catch (e) {
      await cliente.query("rollback").catch(() => {});
      throw e;
    } finally {
      cliente.release();
    }
  });
  (sql as unknown as { end: () => Promise<void> }).end = () => pool.end();
  return sql;
}

/**
 * Vigia: consulta que passa de 5s sem resposta é registrada no log (só o começo do
 * texto, nunca os valores). Sem isso, uma conexão presa aparece só como "timeout"
 * genérico da plataforma, sem dizer qual consulta ficou pendurada.
 */
function vigiar<T>(texto: string, rodarConsulta: () => Promise<T>): Promise<T> {
  const inicio = Date.now();
  const aviso = setTimeout(() => console.error(`[db] consulta pendente há 5s: ${texto.replace(/\s+/g, " ").slice(0, 120)}`), 5000);
  return rodarConsulta().finally(() => {
    clearTimeout(aviso);
    const ms = Date.now() - inicio;
    if (ms > 2000) console.warn(`[db] consulta lenta (${ms}ms): ${texto.replace(/\s+/g, " ").slice(0, 120)}`);
  });
}

function comVigia(sql: Sql): Sql {
  const vigiado = ((strings: TemplateStringsArray, ...values: unknown[]) =>
    vigiar(strings.join("?"), () => sql(strings, ...values))) as Sql;
  vigiado.begin = (fn) => vigiar("begin", () => sql.begin(fn));
  vigiado.unsafe = (texto, params) => vigiar(texto, () => sql.unsafe(texto, params));
  return vigiado;
}

/** Uma conexão por processo (evita abrir outra a cada recarga no desenvolvimento). */
export function db(): Sql {
  if (!globalThis.__piqueSql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL não está definida.");
    globalThis.__piqueSql = comVigia(connect(url));
  }
  return globalThis.__piqueSql;
}
