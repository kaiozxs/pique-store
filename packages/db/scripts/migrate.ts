/**
 * Aplica as migrações no banco apontado por DATABASE_URL (Supabase).
 *   DATABASE_URL="postgresql://…" npm run migrate
 */
import { connect } from "../src/connect.ts";
import { migrar } from "../src/migrate.ts";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Defina DATABASE_URL (a conexão do Supabase).");
  process.exit(1);
}
const sql = connect(url);
const aplicadas = await migrar(sql, (m) => console.log(m));
console.log(aplicadas.length ? `${aplicadas.length} migração(ões) aplicada(s).` : "Nada a aplicar: o banco já está atualizado.");
await (sql as unknown as { end: () => Promise<void> }).end();
