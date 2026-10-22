import type { Sql } from "./sql.ts";

export type SeedCatalog = {
  categories: { handle: string; name: string; position: number; active: boolean }[];
  products: {
    handle: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    status: "draft" | "published";
    option_order: string[];
    is_presale: boolean;
    presale_message: string | null;
    estimated_ship_date: string | null;
    categories: string[];
    images: { file: string; position: number }[];
    variants: { title: string; sku: string | null; options: Record<string, string>; price: number; stock: number; position: number }[];
  }[];
  shipping_options: { name: string; price: number; position: number }[];
  wab: { status: string; title: string | null; body: string | null; media: unknown };
  home_sections: { type: string; position: number; visible: boolean; config: unknown }[];
  drop: { title: string | null; status: string; handles: string[] };
};

/**
 * Carrega o catálogo inicial. Pode rodar de novo sem estragar nada: produtos e
 * variações são atualizados pelo handle/SKU e o ESTOQUE existente nunca é
 * sobrescrito (só definido na primeira vez).
 *
 * A ordem do arquivo é a ordem da vitrine (o primeiro aparece primeiro).
 */
export async function seedCatalog(sql: Sql, data: SeedCatalog, opts: { imagesBase: string }): Promise<void> {
  const base = opts.imagesBase.replace(/\/$/, "");
  const url = (file: string | null) => (file ? (/^https?:\/\//.test(file) ? file : `${base}/${file}`) : null);

  await sql.begin(async (tx) => {
    for (const c of data.categories) {
      await tx`insert into categories (handle, name, position, active) values (${c.handle}, ${c.name}, ${c.position}, ${c.active})
               on conflict (handle) do update set name = excluded.name, position = excluded.position, active = excluded.active`;
    }

    for (const [i, p] of data.products.entries()) {
      const [prod] = await tx<{ id: string }>`
        insert into products (handle, title, description, thumbnail, status, option_order, is_presale, presale_message,
                              estimated_ship_date, created_at)
        values (${p.handle}, ${p.title}, ${p.description}, ${url(p.thumbnail)}, ${p.status}, ${p.option_order}::text[],
                ${p.is_presale}, ${p.presale_message}, ${p.estimated_ship_date}::date, now() - (${i} * interval '1 second'))
        on conflict (handle) do update set title = excluded.title, description = excluded.description,
               thumbnail = excluded.thumbnail, status = excluded.status, option_order = excluded.option_order,
               is_presale = excluded.is_presale, presale_message = excluded.presale_message,
               estimated_ship_date = excluded.estimated_ship_date, updated_at = now()
        returning id`;

      await tx`delete from product_images where product_id = ${prod!.id}`;
      for (const img of p.images) {
        await tx`insert into product_images (product_id, url, position) values (${prod!.id}, ${url(img.file)}, ${img.position})`;
      }

      await tx`delete from product_categories where product_id = ${prod!.id}`;
      for (const handle of p.categories) {
        await tx`insert into product_categories (product_id, category_id)
                 select ${prod!.id}, id from categories where handle = ${handle} on conflict do nothing`;
      }

      for (const v of p.variants) {
        await tx`
          insert into variants (product_id, title, sku, options, price, stock, position)
          values (${prod!.id}, ${v.title}, ${v.sku}, ${JSON.stringify(v.options)}::jsonb, ${v.price}, ${v.stock}, ${v.position})
          on conflict (sku) do update set title = excluded.title, options = excluded.options,
                 price = excluded.price, position = excluded.position`;
      }
    }

    const [{ n }] = (await tx<{ n: number }>`select count(*)::int as n from shipping_options`) as [{ n: number }];
    if (n === 0) {
      for (const s of data.shipping_options) {
        await tx`insert into shipping_options (name, price, position) values (${s.name}, ${s.price}, ${s.position})`;
      }
    }

    await tx`insert into wab_content (id, status, title, body, media)
             values (1, ${data.wab.status}, ${data.wab.title}, ${data.wab.body}, ${data.wab.media ? JSON.stringify(data.wab.media) : null}::jsonb)
             on conflict (id) do nothing`;

    for (const h of data.home_sections) {
      await tx`insert into home_sections (type, position, visible, config)
               values (${h.type}, ${h.position}, ${h.visible}, ${h.config ? JSON.stringify(h.config) : null}::jsonb)
               on conflict (type) do nothing`;
    }

    const [d] = await tx<{ id: string }>`select id from drop_weeks limit 1`;
    if (!d) await tx`insert into drop_weeks (title, status) values (${data.drop.title}, ${data.drop.status})`;
  });
}
