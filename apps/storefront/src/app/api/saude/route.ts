import { db } from "@pique/db";

// Diagnóstico rápido: responde se a loja consegue falar com o banco, em no máximo
// 8 segundos, sem esperar a conexão pendurar. Nunca devolve a senha nem a URL
// completa — só o servidor e a mensagem de erro.
export const dynamic = "force-dynamic";

function servidor(): string {
  try {
    const u = new URL(process.env.DATABASE_URL ?? "");
    return `${u.hostname}:${u.port}`;
  } catch {
    return "DATABASE_URL ausente ou inválida";
  }
}

export async function GET() {
  const inicio = Date.now();
  try {
    await Promise.race([
      db()`select 1`,
      new Promise((_, rejeita) => setTimeout(() => rejeita(new Error("sem resposta do banco em 8s")), 8000)),
    ]);
    return Response.json({ ok: true, ms: Date.now() - inicio, servidor: servidor() });
  } catch (e) {
    const erro = e as Error & { code?: string };
    return Response.json(
      { ok: false, ms: Date.now() - inicio, servidor: servidor(), codigo: erro.code ?? null, erro: erro.message },
      { status: 503 }
    );
  }
}
