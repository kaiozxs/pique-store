/**
 * Cria um cupom de 10% chamado TESTE10 no banco apontado por DATABASE_URL
 * (pensado para o banco local de desenvolvimento).
 *   DATABASE_POOL_MAX=1 DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/postgres npx tsx scripts/cupom-teste.ts
 */
import { connect } from "../src/connect.ts";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Defina DATABASE_URL.");
const sql = connect(url);
await sql`insert into coupons (code, kind, amount) values ('TESTE10', 'percent', 10) on conflict (code) do nothing`;
console.log("cupom TESTE10 pronto");
await (sql as unknown as { end: () => Promise<void> }).end();
