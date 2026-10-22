import { randomBytes } from "node:crypto";

/** Arredonda para centavos: evita 0.1 + 0.2 = 0.30000000000000004 nos totais. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * ID pessoal que o cliente vê na conta e que aparece na verificação das peças.
 * É derivado do id interno: identifica sem expor nome, e-mail nem o id real.
 */
export function idPessoal(customerId: string): string {
  return `PQ-${customerId.replace(/-/g, "").slice(-8).toUpperCase()}`;
}

// Sem 0/O/1/I: ninguém confunde ao digitar o código da etiqueta.
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Código público da peça: XXXX-XXXX-XXXX, aleatório e não sequencial. */
export function gerarCodigoDePeca(): string {
  const bytes = randomBytes(12);
  let codigo = "";
  for (let i = 0; i < 12; i++) {
    codigo += ALFABETO[bytes[i]! % ALFABETO.length];
    if (i === 3 || i === 7) codigo += "-";
  }
  return codigo;
}

export const FORMATO_CODIGO = /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;

export function normalizarCodigo(valor: string): string {
  return valor.trim().toUpperCase();
}
