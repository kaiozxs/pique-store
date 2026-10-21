import { timingSafeEqual } from "node:crypto";
import { cancelStalePendingOrders, db } from "@pique/db";

/**
 * Rotina diária (Vercel Cron): pedidos que ficaram aguardando pagamento por
 * mais de uma hora caem e devolvem o estoque que seguravam. A Vercel envia o
 * segredo em `Authorization: Bearer <CRON_SECRET>`; sem ele, ninguém executa.
 */
export async function GET(request: Request) {
  const segredo = process.env.CRON_SECRET;
  const recebido = request.headers.get("authorization") ?? "";
  const esperado = `Bearer ${segredo ?? ""}`;
  const confere =
    Boolean(segredo) && recebido.length === esperado.length && timingSafeEqual(Buffer.from(recebido), Buffer.from(esperado));
  if (!confere) return new Response("Não autorizado.", { status: 401 });

  const liberados = await cancelStalePendingOrders(db(), 60);
  return Response.json({ liberados });
}
