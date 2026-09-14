// Cliente da Store API do Medusa. Sem SDK — fetch direto, mesmo padrão usado
// pelo storefront oficial da Medusa. Os campos pedidos em `fields` foram
// confirmados contra a instância real (ver docs/modelagem-dados.md).

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "";

export type MedusaRegion = {
  id: string;
  name: string;
  currency_code: string;
};

export type MedusaVariantOption = { value: string };

export type MedusaVariant = {
  id: string;
  title: string;
  sku: string | null;
  manage_inventory: boolean;
  allow_backorder: boolean;
  inventory_quantity: number;
  options: MedusaVariantOption[];
  calculated_price: {
    calculated_amount: number;
    currency_code: string;
  } | null;
};

export type MedusaProductOption = {
  title: string;
  values: { value: string }[];
};

export type MedusaProduct = {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  thumbnail: string | null;
  images: { url: string }[];
  options: MedusaProductOption[];
  variants: MedusaVariant[];
};

const PRODUCT_FIELDS = [
  "title",
  "handle",
  "description",
  "thumbnail",
  "*images",
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

async function medusaFetch<T>(path: string, searchParams: Record<string, string> = {}): Promise<T> {
  const url = new URL(path, BACKEND_URL);
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Medusa request failed (${res.status}): ${path}`);
  }

  return res.json() as Promise<T>;
}

let cachedRegion: MedusaRegion | null = null;

export async function getDefaultRegion(): Promise<MedusaRegion> {
  if (cachedRegion) return cachedRegion;
  const data = await medusaFetch<{ regions: MedusaRegion[] }>("/store/regions");
  const region = data.regions[0];
  if (!region) throw new Error("Nenhuma região configurada no Medusa.");
  cachedRegion = region;
  return region;
}

export async function listProducts(): Promise<{ products: MedusaProduct[]; region: MedusaRegion }> {
  const region = await getDefaultRegion();
  const data = await medusaFetch<{ products: MedusaProduct[] }>("/store/products", {
    region_id: region.id,
    fields: PRODUCT_FIELDS,
  });
  return { products: data.products, region };
}

export async function getProductByHandle(
  handle: string
): Promise<{ product: MedusaProduct | null; region: MedusaRegion }> {
  const region = await getDefaultRegion();
  const data = await medusaFetch<{ products: MedusaProduct[] }>("/store/products", {
    handle,
    region_id: region.id,
    fields: PRODUCT_FIELDS,
  });
  return { product: data.products[0] ?? null, region };
}

// A Store API não devolve o vínculo entre `variant.options[i]` e a opção do
// produto a que pertence (só o valor), então o casamento é feito pela ordem
// de `product.options` — a mesma ordem em que as variantes guardam seus valores.
export function findVariant(
  product: MedusaProduct,
  selectedValues: Record<string, string>
): MedusaVariant | undefined {
  const orderedValues = product.options.map((option) => selectedValues[option.title]);
  return product.variants.find(
    (variant) =>
      variant.options.length === orderedValues.length &&
      variant.options.every((o, i) => o.value === orderedValues[i])
  );
}

export function isVariantAvailable(variant: MedusaVariant): boolean {
  return variant.allow_backorder || !variant.manage_inventory || variant.inventory_quantity > 0;
}

export function isProductAvailable(product: MedusaProduct): boolean {
  return product.variants.some(isVariantAvailable);
}

export function formatMoney(amount: number, currencyCode: string): string {
  return amount.toLocaleString("pt-BR", { style: "currency", currency: currencyCode.toUpperCase() });
}

export function cheapestPrice(product: MedusaProduct): { amount: number; currencyCode: string } | null {
  const prices = product.variants
    .map((v) => v.calculated_price)
    .filter((p): p is NonNullable<MedusaVariant["calculated_price"]> => p !== null);
  if (prices.length === 0) return null;
  const cheapest = prices.reduce((min, p) => (p.calculated_amount < min.calculated_amount ? p : min));
  return { amount: cheapest.calculated_amount, currencyCode: cheapest.currency_code };
}
