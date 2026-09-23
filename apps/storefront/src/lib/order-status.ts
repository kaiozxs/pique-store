import type { MedusaCustomerOrder } from "@/lib/customer";

/**
 * Traduz o estado bruto do pedido para uma das quatro etapas que o cliente vê.
 *
 * O Medusa guarda dois estados separados (o do pagamento e o da entrega) com
 * nomes técnicos em inglês — "not_fulfilled", "captured". Mostrar isso pra quem
 * comprou não diz nada. Aqui os dois viram uma etapa só, na ordem em que a
 * compra realmente acontece, que é a representação que a Política de Pedidos e
 * Acompanhamento define.
 *
 * Situações fora do caminho normal (cancelado, pagamento expirado) não são uma
 * das quatro etapas: elas substituem a apresentação, por isso vêm com
 * `etapa: null`.
 */
export type EtapaPedido = 1 | 2 | 3 | 4;

export type StatusPedido = {
  etapa: EtapaPedido | null;
  rotulo: string;
  descricao: string;
  /** Situação fora do fluxo normal — a interface não desenha as quatro etapas. */
  excecao: boolean;
};

export const ETAPAS: { etapa: EtapaPedido; titulo: string }[] = [
  { etapa: 1, titulo: "Pedido" },
  { etapa: 2, titulo: "Pagamento" },
  { etapa: 3, titulo: "Preparação" },
  { etapa: 4, titulo: "Transporte" },
];

export function statusDoPedido(order: MedusaCustomerOrder): StatusPedido {
  const pagamento = order.payment_status ?? "";
  const entrega = order.fulfillment_status ?? "";

  if (order.status === "canceled" || pagamento === "canceled" || entrega === "canceled") {
    return {
      etapa: null,
      rotulo: "Cancelado",
      descricao: "Este pedido foi cancelado.",
      excecao: true,
    };
  }

  if (pagamento === "requires_action" || pagamento === "not_paid" || pagamento === "awaiting") {
    return {
      etapa: 1,
      rotulo: "Aguardando pagamento",
      descricao: "Assim que o pagamento for confirmado, a gente começa a preparar.",
      excecao: false,
    };
  }

  if (entrega === "delivered") {
    return {
      etapa: 4,
      rotulo: "Entregue",
      descricao: "O pedido foi entregue.",
      excecao: false,
    };
  }

  if (entrega === "shipped" || entrega === "partially_shipped") {
    return {
      etapa: 4,
      rotulo: "Em movimento",
      descricao: "O pedido saiu da PIQUE e está a caminho.",
      excecao: false,
    };
  }

  if (entrega === "fulfilled" || entrega === "partially_fulfilled") {
    return {
      etapa: 3,
      rotulo: "Em preparação",
      descricao: "A PIQUE está separando e embalando seu pedido.",
      excecao: false,
    };
  }

  // Pago e ainda sem nenhuma movimentação de entrega.
  return {
    etapa: 2,
    rotulo: "Pagamento aprovado",
    descricao: "Pagamento confirmado. O próximo passo é a preparação.",
    excecao: false,
  };
}
