// Funções puras do catálogo: servem tanto para o servidor quanto para os
// componentes do navegador. Nada aqui fala com o banco (isso fica em
// catalogo.ts, só servidor) — por isso só importa TIPOS do pacote de dados.

import type { Product, Variant } from "@pique/db";

export type { Product, Variant, NavCategory, PieceVerification } from "@pique/db";

export type OpcaoDoProduto = { title: string; values: { value: string }[] };

/**
 * As opções da página (Cor, Tamanho…) derivadas das variações: na ordem em que
 * o produto as define, cada uma com os valores que realmente existem.
 */
export function opcoesDoProduto(product: Product): OpcaoDoProduto[] {
  return product.option_order.map((title) => {
    const vistos: string[] = [];
    for (const v of product.variants) {
      const valor = v.options[title];
      if (valor && !vistos.includes(valor)) vistos.push(valor);
    }
    return { title, values: vistos.map((value) => ({ value })) };
  });
}

/** A variação que combina com as escolhas (ex.: {Color: "Black", Size: "G"}). */
export function findVariant(product: Product, selected: Record<string, string>): Variant | undefined {
  return product.variants.find((v) => product.option_order.every((titulo) => v.options[titulo] === selected[titulo]));
}

export function isVariantAvailable(variant: Variant): boolean {
  return variant.allow_backorder || variant.stock > 0;
}

export function isProductAvailable(product: Product): boolean {
  return product.variants.some(isVariantAvailable);
}

/** Quantos o cliente pode pedir de uma vez: o estoque, ou um teto são para peça sob encomenda. */
export function maxQuantidade(variant: Variant | undefined): number {
  if (!variant) return 1;
  if (variant.allow_backorder) return 10;
  return Math.max(1, variant.stock);
}

export type PresaleInfo = { message: string | null; estimatedShipDate: string | null };

export function getPresaleInfo(product: Product): PresaleInfo | null {
  if (!product.is_presale) return null;
  return { message: product.presale_message, estimatedShipDate: product.estimated_ship_date };
}

export function formatMoney(amount: number, currencyCode: string = "brl"): string {
  return amount.toLocaleString("pt-BR", { style: "currency", currency: currencyCode.toUpperCase() });
}

export function cheapestPrice(product: Product): { amount: number; currencyCode: string } | null {
  if (product.variants.length === 0) return null;
  return { amount: Math.min(...product.variants.map((v) => v.price)), currencyCode: "brl" };
}
