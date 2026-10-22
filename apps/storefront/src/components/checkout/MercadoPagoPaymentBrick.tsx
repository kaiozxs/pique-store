"use client";

import { useEffect, useState } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import type { Order } from "@pique/db";
import { payAction } from "@/lib/checkout-actions";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

let mercadoPagoInitialized = false;

type AoPagar = (pedido: Order, status: "aprovado" | "em_analise") => void;

export function MercadoPagoPaymentBrick({
  amount,
  email,
  onPaid,
}: {
  amount: number;
  email?: string;
  onPaid: AoPagar;
}) {
  const [error, setError] = useState<string | null>(null);
  const [simulando, setSimulando] = useState(false);

  useEffect(() => {
    if (mercadoPagoInitialized || !PUBLIC_KEY) return;
    initMercadoPago(PUBLIC_KEY, { locale: "pt-BR" });
    mercadoPagoInitialized = true;
  }, []);

  // SÓ NA MÁQUINA DE DESENVOLVIMENTO, sem credencial do Mercado Pago: três
  // botões que simulam o resultado, para testar o fluxo inteiro. Em produção
  // `NODE_ENV` é "production", o bloco não existe e o servidor também recusa.
  if (!PUBLIC_KEY && process.env.NODE_ENV !== "production") {
    async function simular(resultado: "aprovado" | "analise" | "recusado") {
      setError(null);
      setSimulando(true);
      const r = await payAction({ token: `__simulador_${resultado}__`, payment_method_id: "visa", installments: 1, payer_email: email });
      setSimulando(false);
      if (!r.ok) return setError(r.error);
      onPaid(r.order, r.status);
    }
    return (
      <div className="border border-dashed border-amber-400/60 p-5">
        <div className="mb-1 text-[12px] font-bold tracking-[0.14em] text-amber-400">MODO DE TESTE (só nesta máquina)</div>
        <p className="mb-4 text-sm text-paper/60">
          Sem credencial do Mercado Pago aqui. Simule o resultado do pagamento para testar o fluxo:
        </p>
        {error && <p className="mb-4 text-sm font-semibold text-red-400">{error}</p>}
        <div className="flex flex-wrap gap-3 text-[12px] font-bold tracking-[0.1em]">
          <button disabled={simulando} onClick={() => simular("aprovado")} className="border border-accent px-5 py-3 disabled:opacity-50">
            PAGAMENTO APROVADO
          </button>
          <button disabled={simulando} onClick={() => simular("analise")} className="border border-white/30 px-5 py-3 disabled:opacity-50">
            EM ANÁLISE
          </button>
          <button disabled={simulando} onClick={() => simular("recusado")} className="border border-white/30 px-5 py-3 disabled:opacity-50">
            RECUSADO
          </button>
        </div>
      </div>
    );
  }

  if (!PUBLIC_KEY) {
    return (
      <p className="text-sm text-red-400">
        Pagamento indisponível no momento — chave do Mercado Pago não configurada.
      </p>
    );
  }

  return (
    <div>
      {error && <p className="mb-4 text-sm font-semibold text-red-400">{error}</p>}
      <Payment
        initialization={{ amount, payer: email ? { email } : undefined }}
        // O teto de parcelas fica declarado aqui e não só na conta do Mercado
        // Pago: sem isso, mexer numa configuração do painel muda em silêncio o
        // que a loja oferece. O Brick já mostra valor da parcela e total.
        customization={{
          paymentMethods: { creditCard: "all", debitCard: "all", maxInstallments: 12 },
        }}
        onSubmit={async ({ formData }) => {
          setError(null);
          // O botão do próprio Brick é o "pagar": aqui o pedido é fechado e cobrado.
          const r = await payAction({
            token: formData.token,
            payment_method_id: formData.payment_method_id,
            installments: formData.installments,
            issuer_id: formData.issuer_id,
            payer_email: formData.payer?.email,
          });
          if (!r.ok) {
            setError(r.error);
            // O Brick espera a Promise rejeitar quando o envio falha, pra
            // mostrar o próprio estado de erro dele e deixar tentar de novo.
            throw new Error(r.error);
          }
          onPaid(r.order, r.status);
        }}
        onError={(err) => setError((err as { message?: string })?.message ?? "Erro no formulário de pagamento.")}
      />
    </div>
  );
}
