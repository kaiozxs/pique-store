import { round2 } from "./util.ts";

export type CupomRegras = {
  kind: "percent" | "fixed";
  amount: number;
  min_subtotal: number;
  starts_at: string | Date | null;
  ends_at: string | Date | null;
  max_uses: number | null;
  uses: number;
  active: boolean;
};

/** null = cupom pode ser usado; senão, o motivo (para log, não para o cliente). */
export function motivoDoCupomInvalido(c: CupomRegras, subtotal: number, agora = new Date()): string | null {
  if (!c.active) return "inativo";
  if (c.starts_at && new Date(c.starts_at) > agora) return "ainda não começou";
  if (c.ends_at && new Date(c.ends_at) < agora) return "expirado";
  if (c.max_uses !== null && c.uses >= c.max_uses) return "limite de usos atingido";
  if (subtotal < c.min_subtotal) return "abaixo do valor mínimo";
  return null;
}

export function calcularDesconto(c: Pick<CupomRegras, "kind" | "amount">, subtotal: number): number {
  const bruto = c.kind === "percent" ? (subtotal * c.amount) / 100 : c.amount;
  // O desconto nunca passa do valor das peças: pedido não fica com total negativo.
  return round2(Math.min(bruto, subtotal));
}

export function calcularTotais(input: { subtotal: number; frete: number; desconto: number }) {
  const subtotal = round2(input.subtotal);
  const frete = round2(input.frete);
  const desconto = round2(input.desconto);
  return { subtotal, frete, desconto, total: round2(subtotal - desconto + frete) };
}
