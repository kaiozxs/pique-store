import { db, listCategories, listProducts } from "@pique/db";
import { getCart } from "@/lib/cart";
import { getCurrentCustomer } from "@/lib/customer";
import { getCuratedDrop, getHomeSections, getProductByHandle, listNavCategories, listProducts as listarVitrine } from "@/lib/catalogo";
import { listFavorites } from "@/lib/customer";

// Diagnóstico rápido: testa, uma por uma e com limite de 8s cada, as consultas que
// a loja faz. Nunca devolve a senha nem a URL completa — só o servidor e os erros.
export const dynamic = "force-dynamic";

function servidor(): string {
  try {
    const u = new URL(process.env.DATABASE_URL ?? "");
    return `${u.hostname}:${u.port}`;
  } catch {
    return "DATABASE_URL ausente ou inválida";
  }
}

async function medir(nome: string, fn: () => Promise<unknown>) {
  const inicio = Date.now();
  try {
    const r = await Promise.race([
      fn(),
      new Promise((_, rejeita) => setTimeout(() => rejeita(new Error("sem resposta em 8s")), 8000)),
    ]);
    return { nome, ok: true, ms: Date.now() - inicio, linhas: Array.isArray(r) ? r.length : null };
  } catch (e) {
    const erro = e as Error & { code?: string };
    return { nome, ok: false, ms: Date.now() - inicio, codigo: erro.code ?? null, erro: erro.message };
  }
}

export async function GET() {
  const testes = [
    await medir("select 1 (template)", () => db()`select 1`),
    await medir("select com parametro (unsafe)", () => db().unsafe("select $1::text as x", ["a"])),
    await medir("categorias", () => listCategories(db())),
    await medir("produtos", () => listProducts(db())),
    await medir("concorrente: 6 consultas ao mesmo tempo", () => Promise.all(Array.from({ length: 6 }, () => listProducts(db())))),
    await medir("cabecalho (sacola + conta + categorias)", () => Promise.all([getCart(), getCurrentCustomer(), listNavCategories()])),
    await medir("home: secoes", () => getHomeSections()),
    await medir("home: drop em destaque", () => getCuratedDrop()),
    await medir("produto sweatshirt", () => getProductByHandle("sweatshirt")),
    await medir("produto t-shirt", () => getProductByHandle("t-shirt")),
    await medir("favoritos (visitante)", () => listFavorites()),
    await medir("vitrine (como a pagina /drops)", async () => {
      await listNavCategories();
      return listarVitrine({});
    }),
  ];
  return Response.json({ ok: testes.every((t) => t.ok), servidor: servidor(), testes }, { status: testes.every((t) => t.ok) ? 200 : 503 });
}
