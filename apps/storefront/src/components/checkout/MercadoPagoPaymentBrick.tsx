"use client";

import { useEffect, useState } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { submitMercadoPagoPaymentAction } from "@/lib/checkout-actions";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

let mercadoPagoInitialized = false;

export function MercadoPagoPaymentBrick({
  amount,
  email,
  onSuccess,
}: {
  amount: number;
  email?: string;
  onSuccess: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mercadoPagoInitialized || !PUBLIC_KEY) return;
    initMercadoPago(PUBLIC_KEY, { locale: "pt-BR" });
    mercadoPagoInitialized = true;
  }, []);

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
          const result = await submitMercadoPagoPaymentAction({
            token: formData.token,
            payment_method_id: formData.payment_method_id,
            installments: formData.installments,
            issuer_id: formData.issuer_id,
            payer_email: formData.payer?.email,
          });
          if (!result.ok) {
            setError(result.error);
            // O Brick espera a Promise rejeitar quando o envio falha, pra
            // mostrar o próprio estado de erro dele.
            throw new Error(result.error);
          }
          onSuccess();
        }}
        onError={(err) => setError((err as { message?: string })?.message ?? "Erro no formulário de pagamento.")}
      />
    </div>
  );
}
