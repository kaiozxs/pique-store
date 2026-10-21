import "server-only";
import { MercadoPagoConfig, Payment } from "mercadopago";
import {
  applyPaymentResult,
  cancelOrderWithoutPayment,
  cancelStalePendingOrders,
  db,
  ensureCustomer,
  ErroDeRegra,
  placeOrder,
  type Order,
} from "@pique/db";
import { usuarioAtual } from "./auth";
import { clearCartId, getCartId } from "./cart-session";

/** O que o Brick do Mercado Pago devolve depois que a pessoa preenche o cartão. */
export type DadosDoBrick = {
  token: string;
  payment_method_id: string;
  installments?: number;
  issuer_id?: string | number;
  payer_email?: string;
};

export type ResultadoPagamento =
  | { ok: true; order: Order; status: "aprovado" | "em_analise" }
  | { ok: false; error: string };

const MENSAGENS_DE_RECUSA: Record<string, string> = {
  cc_rejected_insufficient_amount: "Saldo ou limite insuficiente. Tente outro cartão.",
  cc_rejected_bad_filled_security_code: "Código de segurança inválido. Confira e tente de novo.",
  cc_rejected_bad_filled_date: "Data de validade inválida. Confira e tente de novo.",
  cc_rejected_bad_filled_other: "Algum dado do cartão está errado. Confira e tente de novo.",
  cc_rejected_bad_filled_card_number: "Número do cartão inválido. Confira e tente de novo.",
  cc_rejected_call_for_authorize: "Seu banco precisa autorizar esta compra. Fale com ele ou use outro cartão.",
  cc_rejected_card_disabled: "Cartão desabilitado. Ative-o com o banco ou use outro.",
  cc_rejected_high_risk: "Pagamento não aprovado por segurança. Tente outro cartão.",
  cc_rejected_max_attempts: "Muitas tentativas com este cartão. Use outro cartão.",
  cc_rejected_duplicated_payment: "Você já fez um pagamento com este valor. Confira seus pedidos.",
};

function mensagemDeRecusa(detalhe?: string | null): string {
  return (detalhe && MENSAGENS_DE_RECUSA[detalhe]) || "Pagamento recusado. Confira os dados ou use outro cartão.";
}

export function clienteMercadoPago(): Payment | null {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  return accessToken ? new Payment(new MercadoPagoConfig({ accessToken })) : null;
}

/** Só existe fora de produção e sem credencial: permite testar o fluxo na máquina. */
function modoSimulado(token: string): boolean {
  return process.env.NODE_ENV !== "production" && !process.env.MERCADOPAGO_ACCESS_TOKEN && token.startsWith("__simulador_");
}

type RespostaMP = { id?: number | string; status?: string; status_detail?: string };

async function cobrar(pedido: Order, dados: DadosDoBrick): Promise<RespostaMP> {
  if (modoSimulado(dados.token)) {
    const status = dados.token.includes("aprovado") ? "approved" : dados.token.includes("analise") ? "in_process" : "rejected";
    return {
      id: `simulado-${pedido.id}`,
      status,
      status_detail: status === "approved" ? "accredited" : status === "rejected" ? "cc_rejected_insufficient_amount" : "pending_review_manual",
    };
  }

  const pagamentos = clienteMercadoPago();
  if (!pagamentos) throw new Error("Pagamento indisponível: credencial do Mercado Pago não configurada.");

  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const cpf = pedido.document?.cpf.replace(/\D/g, "");
  return pagamentos.create({
    body: {
      transaction_amount: pedido.total,
      token: dados.token,
      description: `Pedido PIQUE #${pedido.display_id}`,
      installments: Number(dados.installments ?? 1),
      payment_method_id: dados.payment_method_id,
      issuer_id: dados.issuer_id ? Number(dados.issuer_id) : undefined,
      payer: {
        email: dados.payer_email || pedido.email,
        identification: cpf ? { type: "CPF", number: cpf } : undefined,
      },
      external_reference: pedido.id,
      // O aviso automático só faz sentido com endereço público em HTTPS.
      ...(site?.startsWith("https://") ? { notification_url: `${site}/api/mercadopago/webhook` } : {}),
    },
    // Repetir a mesma chamada nunca cobra duas vezes: a chave é o próprio pedido.
    requestOptions: { idempotencyKey: pedido.id },
  });
}

/**
 * Compra de ponta a ponta: fecha o pedido (reservando o estoque), cobra no
 * Mercado Pago e registra o resultado. Se a cobrança não chega a acontecer, o
 * pedido cai e o estoque volta; a sacola só é encerrada quando o pagamento é
 * aprovado, então um cartão recusado não faz a pessoa perder o que montou.
 */
export async function pagar(dados: DadosDoBrick): Promise<ResultadoPagamento> {
  const usuario = await usuarioAtual();
  if (!usuario) return { ok: false, error: "Entre na sua conta para pagar." };

  const cartId = await getCartId();
  if (!cartId) return { ok: false, error: "Sua sacola está vazia." };

  await ensureCustomer(db(), { id: usuario.id, email: usuario.email });

  // Devolve ao estoque o que pedidos abandonados seguravam, antes de reservar de novo.
  await cancelStalePendingOrders(db(), 60).catch((e) => console.error("[pagamento] limpeza de pedidos parados falhou:", e));

  let pedido: Order;
  try {
    pedido = await placeOrder(db(), { cartId, customerId: usuario.id });
  } catch (e) {
    if (e instanceof ErroDeRegra) return { ok: false, error: e.message };
    console.error("[pagamento] falha ao criar o pedido:", e);
    return { ok: false, error: "Não foi possível fechar o pedido agora. Tente de novo." };
  }

  let resposta: RespostaMP;
  try {
    resposta = await cobrar(pedido, dados);
  } catch (e) {
    console.error("[pagamento] falha ao falar com o Mercado Pago:", e);
    await cancelOrderWithoutPayment(db(), pedido.id);
    return { ok: false, error: "Não foi possível processar o pagamento agora. Nada foi cobrado. Tente de novo." };
  }

  const status = resposta.status ?? "rejected";
  const atualizado = await applyPaymentResult(db(), {
    orderId: pedido.id,
    providerPaymentId: String(resposta.id),
    status,
    statusDetail: resposta.status_detail ?? null,
    amount: pedido.total,
    // Só o essencial: nada de dados do cartão.
    raw: { id: resposta.id, status, status_detail: resposta.status_detail, payment_method_id: dados.payment_method_id },
  });

  if (status === "approved") {
    await clearCartId();
    return { ok: true, order: atualizado, status: "aprovado" };
  }
  if (status === "in_process" || status === "pending" || status === "authorized") {
    return { ok: true, order: atualizado, status: "em_analise" };
  }
  return { ok: false, error: mensagemDeRecusa(resposta.status_detail) };
}
