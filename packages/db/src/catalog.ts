import type { Sql } from "./sql.ts";
import type { NavCategory, Product } from "./types.ts";

// Um produto já vem com imagens, categorias e variações em UMA consulta: o
// site monta cada vitrine com uma ida ao banco, não com uma por produto.
const SELECT_PRODUTO = `
  select p.id, p.handle, p.title, p.description, p.thumbnail, p.status, p.option_order,
         p.is_presale, p.presale_message, p.estimated_ship_date::text as estimated_ship_date,
    coalesce((select json_agg(json_build_object('url', i.url, 'position', i.position) order by i.position)
              from product_images i where i.product_id = p.id), '[]'::json) as images,
    coalesce((select json_agg(json_build_object('id', c.id, 'handle', c.handle, 'name', c.name) order by c.position)
              from product_categories pc join categories c on c.id = pc.category_id
              where pc.product_id = p.id), '[]'::json) as categories,
    coalesce((select json_agg(json_build_object('id', v.id, 'title', v.title, 'sku', v.sku, 'options', v.options,
                                                'price', v.price, 'stock', v.stock,
                                                'allow_backorder', v.allow_backorder, 'position', v.position)
                              order by v.position)
              from variants v where v.product_id = p.id and v.active), '[]'::json) as variants
  from products p`;

export async function listCategories(sql: Sql): Promise<NavCategory[]> {
  const rows = await sql<NavCategory & { active: boolean }>`
    select c.id, c.name, c.handle, c.active,
      (select count(*)::int from product_categories pc join products p on p.id = pc.product_id
        where pc.category_id = c.id and p.status = 'published') as product_count
    from categories c order by c.position, c.name`;
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    handle: c.handle,
    product_count: c.product_count,
    available: c.active && c.product_count > 0,
  }));
}

/**
 * Produtos publicados, do mais novo para o mais antigo.
 * Filtros opcionais: categoria (handle), busca (título/descrição) e lista de handles.
 */
export async function listProducts(
  sql: Sql,
  filtros: { categoryHandle?: string; q?: string; handles?: string[] } = {}
): Promise<Product[]> {
  const categoria = filtros.categoryHandle ?? null;
  const busca = filtros.q?.trim() || null;
  const handles = filtros.handles ?? null;
  return sql.unsafe<Product>(
    `${SELECT_PRODUTO}
     where p.status = 'published'
       and ($1::text is null or exists (select 1 from product_categories pc join categories c on c.id = pc.category_id
                                         where pc.product_id = p.id and c.handle = $1))
       and ($2::text is null or p.title ilike '%' || $2 || '%' or coalesce(p.description, '') ilike '%' || $2 || '%')
       and ($3::text[] is null or p.handle = any($3::text[]))
     order by p.created_at desc, p.title`,
    [categoria, busca, handles]
  );
}

export async function getProductByHandle(sql: Sql, handle: string): Promise<Product | null> {
  const [produto] = await sql.unsafe<Product>(`${SELECT_PRODUTO} where p.handle = $1 and p.status = 'published'`, [handle]);
  return produto ?? null;
}

/** Estado de uma variação, para validar carrinho e compra. */
export async function getVariant(sql: Sql, variantId: string) {
  const [v] = await sql<{
    id: string;
    product_id: string;
    stock: number;
    allow_backorder: boolean;
    price: number;
    active: boolean;
    published: boolean;
  }>`
    select v.id, v.product_id, v.stock, v.allow_backorder, v.price, v.active, (p.status = 'published') as published
    from variants v join products p on p.id = v.product_id where v.id = ${variantId}`;
  return v ?? null;
}
