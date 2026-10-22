/**
 * Dá o papel de DONO a uma conta que já se cadastrou na loja. É o único jeito
 * de criar o primeiro dono (depois disso, ele concede os outros pelo painel).
 *
 *   DATABASE_URL="postgresql://…" npm run primeiro-dono -- email@dominio.com
 */
import { connect } from "../src/connect.ts";

const url = process.env.DATABASE_URL;
const email = process.argv[2]?.trim().toLowerCase();
if (!url || !email) {
  console.error("Uso: DATABASE_URL=… npm run primeiro-dono -- email@dominio.com");
  process.exit(1);
}
const sql = connect(url);
const [c] = await sql<{ id: string }>`select id from customers where lower(email) = ${email}`;
if (!c) {
  console.error(`Nenhuma conta com o e-mail ${email}. Cadastre-se na loja primeiro.`);
  process.exit(1);
}
await sql`insert into panel_access (customer_id, role) values (${c.id}, 'dono')
          on conflict (customer_id) do update set role = 'dono'`;
console.log(`ok: ${email} agora é dono do painel.`);
await (sql as unknown as { end: () => Promise<void> }).end();
