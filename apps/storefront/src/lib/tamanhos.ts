/**
 * As variantes ficam cadastradas em S/M/L/XL (padrão do catálogo e do SKU),
 * mas quem compra no Brasil lê P/M/G/GG. A tradução é só de exibição: o valor
 * real da variante não muda, então SKU, estoque e integrações seguem intactos.
 *
 * Fica aqui, e não na página do produto, porque o nome do tamanho aparece
 * também no pedido, na sacola e no e-mail — e ver "S" num lugar e "P" no outro
 * confunde mais do que não traduzir.
 */
export const SIZE_ORDER = ["S", "M", "L", "XL"];

const SIZE_LABELS: Record<string, string> = { S: "P", M: "M", L: "G", XL: "GG" };

export function isSizeOption(optionTitle: string): boolean {
  const t = optionTitle.trim().toLowerCase();
  return t === "size" || t === "tamanho";
}

export function sizeLabel(value: string): string {
  return SIZE_LABELS[value.trim().toUpperCase()] ?? value;
}

/** Traduz o nome da variante que vem gravado no pedido, ex.: "S" -> "P". */
export function variantTitleLabel(variantTitle: string | null | undefined): string {
  if (!variantTitle) return "";
  return variantTitle
    .split("/")
    .map((parte) => sizeLabel(parte))
    .join(" / ");
}
