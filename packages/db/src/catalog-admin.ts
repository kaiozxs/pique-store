import { ErroDeRegra, type Sql } from "./sql.ts";
import { round2 } from "./util.ts";
import type { Product, Variant } from "./types.ts";

// Gestão de produtos pelo painel. Diferente da vitrine (catalog.ts), enxerga
// rascunhos e variações desativadas.

export type VariantAdmin = Variant & { active: boolean };
export type ProductAdmin = Omit<Product, "variants"> & { variants: VariantAdmin[] };

const SELECT_PRODUTO_ADMIN = `
  select p.id, p.handle, p.title, p.description, p.thumbnail, p.status, p.option_order,
         p.is_presale, p.presale_message, p.estimated_ship_date::text as estimated_ship_date,
    coalesce((select json_agg(json_build_object('url', i.url, 'position', i.position) order by i.position)
              from product_images i where i.product_id = p.id), '[]'::json) as images,
    coalesce((select json_agg(json_build_object('id', c.id, 'handle', c.handle, 'name', c.name) order by c.position)
              from product_categories pc join categories c on c.id = pc.category_id
              where pc.product_id = p.id), '[]'::json) as categories,
    coalesce((select json_agg(json_build_object('id', v.id, 'title', v.title, 'sku', v.sku, 'options', v.options,
                                                'price', v.price, 'stock', v.stock,
                                                'allow_backorder', v.allow_backorder, 'position', v.position,
                                                'active', v.active)
                              order by v.position)
              from variants v where v.product_id = p.id), '[]'::json) as variants
  from products p`;

export async function listProductsAdmin(sql: Sql, filtros: { q?: string } = {}): Promise<ProductAdmin[]> {
  const busca = filtros.q?.trim() || null;
  return sql.unsafe<ProductAdmin>(
    `${SELECT_PRODUTO_ADMIN}
     where ($1::text is null or p.title ilike '%' || $1 || '%' or p.handle ilike '%' || $1 || '%')
     order by p.created_at desc, p.title`,
    [busca]
  );
}

export async function getProductAdmin(sql: Sql, id: string): Promise<ProductAdmin | null> {
  const [p] = await sql.unsafe<ProductAdmin>(`${SELECT_PRODUTO_ADMIN} where p.id = $1`, [id]);
  return p ?? null;
}

export async function listCategoriesAdmin(sql: Sql): Promise<{ id: string; handle: string; name: string }[]> {
  return sql`select id, handle, name from categories order by position, name`;
}

export type VariantInput = {
  id?: string;
  title: string;
  sku?: string | null;
  options: Record<string, string>;
  price: number;
  stock: number;
  allow_backorder?: boolean;
  active?: boolean;
};

export type ProductInput = {
  id?: string;
  handle?: string;
  title: string;
  description?: string | null;
  status: "draft" | "published";
  option_order: string[];
  is_presale?: boolean;
  presale_message?: string | null;
  estimated_ship_date?: string | null;
  category_ids: string[];
  /** URLs das fotos, na ordem de exibição; a primeira vira a capa. */
  images: string[];
  variants: VariantInput[];
};

/** "Camiseta Preta!" → "camiseta-preta" */
export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validar(p: ProductInput): void {
  if (!p.title.trim()) throw new ErroDeRegra("Dê um nome ao produto.");
  if (p.variants.length === 0) throw new ErroDeRegra("O produto precisa de pelo menos uma variação (tamanho/cor) com preço.");
  for (const v of p.variants) {
    if (!v.title.trim()) throw new ErroDeRegra("Toda variação precisa de um nome.");
    if (!Number.isFinite(v.price) || v.price < 0) throw new ErroDeRegra(`Preço inválido em "${v.title}".`);
    if (!Number.isInteger(v.stock) || v.stock < 0) throw new ErroDeRegra(`Estoque inválido em "${v.title}": use um número inteiro, zero ou mais.`);
  }
}

async function handleLivre(tx: Sql, base: string, ignorarId?: string): Promise<string> {
  const raiz = base || "produto";
  for (let n = 0; n < 50; n++) {
    const candidato = n === 0 ? raiz : `${raiz}-${n + 1}`;
    const [uso] = await tx<{ id: string }>`select id from products where handle = ${candidato} and (${ignorarId ?? null}::uuid is null or id <> ${ignorarId ?? null}::uuid)`;
    if (!uso) return candidato;
  }
  throw new ErroDeRegra("Não foi possível gerar um endereço único para o produto. Mude o nome.");
}

/**
 * Cria ou atualiza um produto inteiro (dados, fotos, categorias e variações)
 * numa transação. Variações que saem da lista não são apagadas — pedidos e
 * etiquetas antigos apontam para elas —, só desativadas.
 */
export async function saveProduct(sql: Sql, input: ProductInput): Promise<string> {
  validar(input);
  return sql.begin(async (tx) => {
    const handle = await handleLivre(tx, slugify(input.handle?.trim() || input.title), input.id);
    const capa = input.images[0] ?? null;
    const opcoes = `{${input.option_order.map((o) => `"${o.replace(/(["\\])/g, "\\$1")}"`).join(",")}}`;

    let id = input.id;
    if (id) {
      const [existe] = await tx<{ id: string }>`select id from products where id = ${id} for update`;
      if (!existe) throw new ErroDeRegra("Produto não encontrado.");
      await tx`update products set handle = ${handle}, title = ${input.title.trim()}, description = ${input.description ?? null},
                      thumbnail = ${capa}, status = ${input.status}, option_order = ${opcoes}::text[],
                      is_presale = ${input.is_presale ?? false}, presale_message = ${input.presale_message ?? null},
                      estimated_ship_date = ${input.estimated_ship_date || null}::date, updated_at = now()
               where id = ${id}`;
    } else {
      const [novo] = await tx<{ id: string }>`
        insert into products (handle, title, description, thumbnail, status, option_order, is_presale, presale_message, estimated_ship_date)
        values (${handle}, ${input.title.trim()}, ${input.description ?? null}, ${capa}, ${input.status}, ${opcoes}::text[],
                ${input.is_presale ?? false}, ${input.presale_message ?? null}, ${input.estimated_ship_date || null}::date)
        returning id`;
      id = novo!.id;
    }

    await tx`delete from product_categories where product_id = ${id}`;
    for (const categoryId of new Set(input.category_ids)) {
      await tx`insert into product_categories (product_id, category_id) values (${id}, ${categoryId})`;
    }

    await tx`delete from product_images where product_id = ${id}`;
    for (const [i, url] of input.images.entries()) {
      await tx`insert into product_images (product_id, url, position) values (${id}, ${url}, ${i})`;
    }

    const mantidas: string[] = [];
    for (const [i, v] of input.variants.entries()) {
      const dados = { sku: v.sku?.trim() || null, options: JSON.stringify(v.options), price: round2(v.price) };
      if (v.id) {
        const feitas = await tx<{ id: string }>`
          update variants set title = ${v.title.trim()}, sku = ${dados.sku}, options = ${dados.options}::jsonb,
                 price = ${dados.price}, stock = ${v.stock}, allow_backorder = ${v.allow_backorder ?? false},
                 position = ${i}, active = ${v.active ?? true}
          where id = ${v.id} and product_id = ${id} returning id`;
        if (!feitas[0]) throw new ErroDeRegra(`Variação "${v.title}" não pertence a este produto.`);
        mantidas.push(v.id);
      } else {
        const [nova] = await tx<{ id: string }>`
          insert into variants (product_id, title, sku, options, price, stock, allow_backorder, position, active)
          values (${id}, ${v.title.trim()}, ${dados.sku}, ${dados.options}::jsonb, ${dados.price}, ${v.stock},
                  ${v.allow_backorder ?? false}, ${i}, ${v.active ?? true})
          returning id`;
        mantidas.push(nova!.id);
      }
    }
    // Ids vêm do banco (uuid), então montar o literal de array aqui é seguro.
    await tx`update variants set active = false where product_id = ${id} and id <> all(${`{${mantidas.join(",")}}`}::uuid[])`;
    return id!;
  });
}

/** Ajuste rápido de estoque (a tela de estoque), sem reenviar o produto inteiro. */
export async function setVariantStock(sql: Sql, variantId: string, stock: number): Promise<void> {
  if (!Number.isInteger(stock) || stock < 0) throw new ErroDeRegra("Estoque precisa ser um número inteiro, zero ou mais.");
  const feitas = await sql<{ id: string }>`update variants set stock = ${stock} where id = ${variantId} returning id`;
  if (!feitas[0]) throw new ErroDeRegra("Variação não encontrada.");
}

/** Só apaga produto que nunca foi vendido; os demais ficam como rascunho (somem da loja, o histórico permanece). */
export async function deleteProduct(sql: Sql, id: string): Promise<"apagado" | "arquivado"> {
  return sql.begin(async (tx) => {
    const [uso] = await tx<{ n: number }>`
      select (select count(*) from order_items oi join variants v on v.id = oi.variant_id where v.product_id = ${id})::int
           + (select count(*) from pieces pc join variants v on v.id = pc.variant_id where v.product_id = ${id})::int as n`;
    if ((uso?.n ?? 0) > 0) {
      await tx`update products set status = 'draft', updated_at = now() where id = ${id}`;
      return "arquivado" as const;
    }
    await tx`delete from products where id = ${id}`;
    return "apagado" as const;
  });
}
