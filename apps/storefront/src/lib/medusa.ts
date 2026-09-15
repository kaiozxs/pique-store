// Camada de acesso à Store API do Medusa, via SDK oficial (@medusajs/js-sdk).
// Os campos pedidos em PRODUCT_FIELDS foram confirmados contra a instância real.

import type { HttpTypes } from "@medusajs/types";
import { sdk } from "./sdk";

export type MedusaRegion = HttpTypes.StoreRegion;
export type MedusaProduct = HttpTypes.StoreProduct;
export type MedusaVariant = HttpTypes.StoreProductVariant;

const PRODUCT_FIELDS = [
  "title",
  "handle",
  "description",
  "thumbnail",
  "metadata",
  "*images",
  "*categories",
  "+options.title",
  "+options.values.value",
  "+variants.title",
  "+variants.sku",
  "+variants.calculated_price",
  "+variants.inventory_quantity",
  "+variants.manage_inventory",
  "+variants.allow_backorder",
  "+variants.options.value",
].join(",");

let cachedRegion: MedusaRegion | null = null;

export async function getDefaultRegion(): Promise<MedusaRegion> {
  if (cachedRegion) return cachedRegion;
  const { regions } = await sdk.store.region.list({ fields: "*countries" });
  const region = regions[0];
  if (!region) throw new Error("Nenhuma região configurada no Medusa.");
  cachedRegion = region;
  return region;
}

export async function listProducts(options?: {
  categoryId?: string;
}): Promise<{ products: MedusaProduct[]; region: MedusaRegion }> {
  const region = await getDefaultRegion();
  const { products } = await sdk.store.product.list({
    region_id: region.id,
    fields: PRODUCT_FIELDS,
    ...(options?.categoryId ? { category_id: [options.categoryId] } : {}),
  });
  return { products, region };
}

// --- Categorias do mega-menu ---
// Inclui categorias inativas/sem produto ainda, marcadas como "em breve" —
// a Store API nativa de categorias esconde inativas, por isso a rota própria.

export type NavCategory = {
  id: string;
  name: string;
  handle: string;
  product_count: number;
  available: boolean;
};

export async function listNavCategories(): Promise<NavCategory[]> {
  const data = await sdk.client.fetch<{ nav_categories: NavCategory[] }>("/store/nav-categories", {
    next: { revalidate: 30 },
  });
  return data.nav_categories;
}

export async function getCuratedDrop(): Promise<{
  title: string | null;
  products: MedusaProduct[];
  region: MedusaRegion;
}> {
  const region = await getDefaultRegion();
  const { title, product_ids } = await sdk.client.fetch<{ title: string | null; product_ids: string[] }>(
    "/store/drop-semana",
    { next: { revalidate: 30 } }
  );

  if (product_ids.length === 0) {
    return { title, products: [], region };
  }

  const { products } = await sdk.store.product.list({
    id: product_ids,
    region_id: region.id,
    fields: PRODUCT_FIELDS,
    limit: product_ids.length,
  });

  // A Store API não garante a ordem do array `id` passado no filtro — a
  // curadoria do painel admin define a ordem, então reordenamos aqui.
  const byId = new Map(products.map((p) => [p.id, p]));
  const ordered = product_ids.map((id) => byId.get(id)).filter((p): p is MedusaProduct => Boolean(p));

  return { title, products: ordered, region };
}

export async function getProductByHandle(
  handle: string
): Promise<{ product: MedusaProduct | null; region: MedusaRegion }> {
  const region = await getDefaultRegion();
  const { products } = await sdk.store.product.list({
    handle,
    region_id: region.id,
    fields: PRODUCT_FIELDS,
  });
  return { product: products[0] ?? null, region };
}

// A Store API não devolve o vínculo entre `variant.options[i]` e a opção do
// produto a que pertence (só o valor), então o casamento é feito pela ordem
// de `product.options` — a mesma ordem em que as variantes guardam seus valores.
export function findVariant(
  product: MedusaProduct,
  selectedValues: Record<string, string>
): MedusaVariant | undefined {
  const productOptions = product.options ?? [];
  const orderedValues = productOptions.map((option) => selectedValues[option.title]);
  return product.variants?.find((variant) => {
    const variantOptions = variant.options ?? [];
    return (
      variantOptions.length === orderedValues.length &&
      variantOptions.every((o, i) => o.value === orderedValues[i])
    );
  });
}

export function isVariantAvailable(variant: MedusaVariant): boolean {
  return Boolean(
    variant.allow_backorder || !variant.manage_inventory || (variant.inventory_quantity ?? 0) > 0
  );
}

// Pré-venda vive no metadata do produto (sem módulo/tabela própria) —
// preenchida pelo widget "Pré-venda" na página do produto no admin.
export type PresaleInfo = { message: string | null; estimatedShipDate: string | null };

export function getPresaleInfo(product: MedusaProduct): PresaleInfo | null {
  const metadata = product.metadata as Record<string, unknown> | null;
  if (!metadata?.is_presale) return null;
  return {
    message: typeof metadata.presale_message === "string" ? metadata.presale_message : null,
    estimatedShipDate:
      typeof metadata.estimated_ship_date === "string" ? metadata.estimated_ship_date : null,
  };
}

export function isProductAvailable(product: MedusaProduct): boolean {
  return (product.variants ?? []).some(isVariantAvailable);
}

export function formatMoney(amount: number, currencyCode: string): string {
  return amount.toLocaleString("pt-BR", { style: "currency", currency: currencyCode.toUpperCase() });
}

export function cheapestPrice(product: MedusaProduct): { amount: number; currencyCode: string } | null {
  const prices = (product.variants ?? [])
    .map((v) => v.calculated_price)
    .filter((p): p is NonNullable<MedusaVariant["calculated_price"]> => Boolean(p));
  if (prices.length === 0) return null;
  const cheapest = prices.reduce((min, p) =>
    (p.calculated_amount ?? Infinity) < (min.calculated_amount ?? Infinity) ? p : min
  );
  return { amount: cheapest.calculated_amount ?? 0, currencyCode: cheapest.currency_code ?? "brl" };
}

// --- WAB (área de mistério/em construção) — rota própria, não vem do SDK ---

export type WabMedia = { url: string; type: "image" | "video" };
export type WabContent = {
  status: "em_construcao" | "revelado" | "oculto";
  title: string | null;
  body: string | null;
  media: { items: WabMedia[] } | null;
};

export async function getWabContent(): Promise<WabContent> {
  const data = await sdk.client.fetch<{ wab_content: WabContent }>("/store/wab", {
    next: { revalidate: 30 },
  });
  return data.wab_content;
}

// --- Verifique seu PIQUE (autenticidade da peça física) ---

export type PieceVerification = {
  valid: boolean;
  status?: "nao_registrado" | "registrado" | "revogado";
  product?: { title: string | null; variant_title: string; thumbnail: string | null } | null;
};

export async function verifyPiece(code: string): Promise<PieceVerification> {
  return sdk.client.fetch<PieceVerification>("/store/verifique", {
    query: { code },
    cache: "no-store",
  });
}

// --- Home configurável (ordem, visibilidade e textos das seções) ---

export type HomeSectionType = "hero" | "drop_destaque" | "wab_teaser" | "dicas_destaque" | "apresentacao";
export type HomeSection = {
  type: HomeSectionType;
  position: number;
  visible: boolean;
  config: Record<string, string> | null;
};

export async function getHomeSections(): Promise<HomeSection[]> {
  const data = await sdk.client.fetch<{ sections: HomeSection[] }>("/store/home-config", {
    next: { revalidate: 30 },
  });
  return data.sections;
}

// --- Dicas (conteúdo editorial) ---

export type TipSummary = {
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
};

export type TipDetail = TipSummary & { body: string };

export async function listTips(): Promise<TipSummary[]> {
  const data = await sdk.client.fetch<{ tip_posts: TipSummary[] }>("/store/dicas", {
    next: { revalidate: 30 },
  });
  return data.tip_posts;
}

export async function getTipBySlug(slug: string): Promise<TipDetail | null> {
  try {
    const data = await sdk.client.fetch<{ tip_post: TipDetail }>(`/store/dicas/${slug}`, {
      next: { revalidate: 30 },
    });
    return data.tip_post;
  } catch {
    return null;
  }
}

// --- Ajuda / FAQ ---

export type FaqItem = { category: string; question: string; answer: string };
export type FaqCategory = { title: string; items: { question: string; answer: string }[] };

export async function getFaqCategories(): Promise<FaqCategory[]> {
  const data = await sdk.client.fetch<{ faq_items: FaqItem[] }>("/store/faq", {
    next: { revalidate: 30 },
  });

  const byCategory = new Map<string, FaqCategory>();
  for (const item of data.faq_items) {
    if (!byCategory.has(item.category)) {
      byCategory.set(item.category, { title: item.category, items: [] });
    }
    byCategory.get(item.category)!.items.push({ question: item.question, answer: item.answer });
  }
  return Array.from(byCategory.values());
}
