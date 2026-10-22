import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { applyPaymentResult, db, getOrder } from "@pique/db";
import { clienteMercadoPago } from "@/lib/pagamento";

// O Mercado Pago avisa aqui quando um pagamento muda de estado (aprovou,
// recusou, venceu, foi estornado). O aviso pode chegar repetido ou fora de
// ordem: applyPaymentResult é idempotente.

/**
 * Confere a assinatura do aviso quando o segredo está configurado
 * (MERCADOPAGO_WEBHOOK_SECRET). Mesmo sem ela, o status NUNCA é lido do corpo
 * do aviso: sempre voltamos a perguntar ao Mercado Pago, com a nossa
 * credencial, qual é o estado real do pagamento.
 */
function assinaturaValida(req: Request, dataId: string): boolean {
  const segredo = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!segredo) return true;
  const assinatura = req.headers.get("x-signature") ?? "";
  const requestId = req.headers.get("x-request-id") ?? "";
  const partes = Object.fromEntries(assinatura.split(",").map((p) => p.trim().split("=") as [string, string]));
  if (!partes.ts || !partes.v1) return false;
  const manifesto = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${partes.ts};`;
  const esperado = Buffer.from(createHmac("sha256", segredo).update(manifesto).digest("hex"));
  const recebido = Buffer.from(partes.v1);
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido);
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const corpo = (await req.json().catch(() => ({}))) as { type?: string; data?: { id?: string | number } };
  const tipo = corpo.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const pagamentoId = String(corpo.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");

  if (tipo !== "payment" || !pagamentoId) return NextResponse.json({ ok: true, ignorado: true });
  if (!assinaturaValida(req, pagamentoId)) return NextResponse.json({ ok: false }, { status: 401 });

  const pagamentos = clienteMercadoPago();
  if (!pagamentos) return NextResponse.json({ ok: true, ignorado: true });

  try {
    const pagamento = await pagamentos.get({ id: pagamentoId });
    const pedidoId = pagamento.external_reference;
    if (!pedidoId) return NextResponse.json({ ok: true, ignorado: true });

    const pedido = await getOrder(db(), pedidoId);
    if (!pedido) return NextResponse.json({ ok: true, ignorado: true });

    // Aprovado por menos do que o pedido vale não libera nada.
    if (pagamento.status === "approved" && (pagamento.transaction_amount ?? 0) + 0.01 < pedido.total) {
      console.error(`[webhook] pagamento ${pagamentoId} aprovado por valor menor que o pedido ${pedidoId}`);
      return NextResponse.json({ ok: true, ignorado: true });
    }

    await applyPaymentResult(db(), {
      orderId: pedidoId,
      providerPaymentId: String(pagamento.id),
      status: pagamento.status ?? "pending",
      statusDetail: pagamento.status_detail ?? null,
      amount: pagamento.transaction_amount ?? pedido.total,
      raw: { id: pagamento.id, status: pagamento.status, status_detail: pagamento.status_detail },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[webhook] erro ao processar o aviso do Mercado Pago:", e);
    // 500 faz o Mercado Pago tentar de novo mais tarde.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
