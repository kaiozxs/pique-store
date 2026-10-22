import type { Sql } from "./sql.ts";
import { listProducts } from "./catalog.ts";
import type { Product } from "./types.ts";

// ───────── Home ─────────

export type HomeSectionType = "hero" | "drop_destaque" | "wab_teaser" | "dicas_destaque" | "apresentacao";
export type HomeSection = {
  type: HomeSectionType;
  position: number;
  visible: boolean;
  config: Record<string, string> | null;
};

export async function getHomeSections(sql: Sql): Promise<HomeSection[]> {
  return sql<HomeSection>`select type, position, visible, config from home_sections where visible order by position`;
}

export async function listHomeSectionsAdmin(sql: Sql): Promise<HomeSection[]> {
  return sql<HomeSection>`select type, position, visible, config from home_sections order by position`;
}

export async function upsertHomeSections(sql: Sql, secoes: HomeSection[]): Promise<void> {
  await sql.begin(async (tx) => {
    for (const s of secoes) {
      await tx`insert into home_sections (type, position, visible, config)
               values (${s.type}, ${s.position}, ${s.visible}, ${s.config ? JSON.stringify(s.config) : null}::jsonb)
               on conflict (type) do update set position = excluded.position, visible = excluded.visible, config = excluded.config`;
    }
  });
}

// ───────── WAB ─────────

export type BookContent = {
  status: "em_construcao" | "revelado" | "oculto";
  title: string | null;
  body: string | null;
  media: { items: { url: string; type: "image" | "video" }[] } | null;
};

export async function getBookContent(sql: Sql): Promise<BookContent> {
  const [row] = await sql<BookContent>`select status, title, body, media from wab_content where id = 1`;
  return row ?? { status: "em_construcao", title: null, body: null, media: null };
}

export async function upsertBookContent(sql: Sql, c: BookContent): Promise<void> {
  await sql`insert into wab_content (id, status, title, body, media)
            values (1, ${c.status}, ${c.title}, ${c.body}, ${c.media ? JSON.stringify(c.media) : null}::jsonb)
            on conflict (id) do update set status = excluded.status, title = excluded.title,
                                           body = excluded.body, media = excluded.media`;
}

// ───────── Dicas ─────────

export type TipSummary = {
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
};
export type TipDetail = TipSummary & { body: string };
export type TipAdmin = TipDetail & { id: string; status: "draft" | "published" };

export async function listTips(sql: Sql): Promise<TipSummary[]> {
  return sql<TipSummary>`select title, slug, excerpt, cover_image, to_char(published_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as published_at
                         from tips where status = 'published' order by published_at desc nulls last, created_at desc`;
}

export async function getTipBySlug(sql: Sql, slug: string): Promise<TipDetail | null> {
  const [t] = await sql<TipDetail>`select title, slug, excerpt, body, cover_image, to_char(published_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as published_at
                                   from tips where slug = ${slug} and status = 'published'`;
  return t ?? null;
}

export async function listTipsAdmin(sql: Sql): Promise<TipAdmin[]> {
  return sql<TipAdmin>`select id, title, slug, excerpt, body, cover_image, status, to_char(published_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as published_at
                       from tips order by created_at desc`;
}

export async function saveTip(
  sql: Sql,
  t: {
    id?: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    body: string;
    cover_image?: string | null;
    status: "draft" | "published";
  }
): Promise<string> {
  const [row] = t.id
    ? await sql<{ id: string }>`
        update tips set title = ${t.title}, slug = ${t.slug}, excerpt = ${t.excerpt ?? null}, body = ${t.body},
               cover_image = ${t.cover_image ?? null}, status = ${t.status},
               published_at = case when ${t.status} = 'published' then coalesce(published_at, now()) else null end
        where id = ${t.id} returning id`
    : await sql<{ id: string }>`
        insert into tips (title, slug, excerpt, body, cover_image, status, published_at)
        values (${t.title}, ${t.slug}, ${t.excerpt ?? null}, ${t.body}, ${t.cover_image ?? null}, ${t.status},
                case when ${t.status} = 'published' then now() else null end)
        returning id`;
  return row!.id;
}

export async function deleteTip(sql: Sql, id: string): Promise<void> {
  await sql`delete from tips where id = ${id}`;
}

// ───────── FAQ ─────────

export type FaqCategory = { title: string; items: { question: string; answer: string }[] };
export type FaqAdmin = {
  id: string;
  category: string;
  question: string;
  answer: string;
  position: number;
  published: boolean;
};

export async function getFaqCategories(sql: Sql): Promise<FaqCategory[]> {
  const rows = await sql<{ category: string; question: string; answer: string }>`
    select category, question, answer from faq_items where published order by category, position, question`;
  const grupos = new Map<string, FaqCategory>();
  for (const r of rows) {
    const g = grupos.get(r.category) ?? { title: r.category, items: [] };
    g.items.push({ question: r.question, answer: r.answer });
    grupos.set(r.category, g);
  }
  return [...grupos.values()];
}

export async function listFaqAdmin(sql: Sql): Promise<FaqAdmin[]> {
  return sql<FaqAdmin>`select id, category, question, answer, position, published from faq_items order by category, position`;
}

export async function saveFaq(sql: Sql, f: Omit<FaqAdmin, "id"> & { id?: string }): Promise<string> {
  const [row] = f.id
    ? await sql<{ id: string }>`update faq_items set category = ${f.category}, question = ${f.question}, answer = ${f.answer},
                                position = ${f.position}, published = ${f.published} where id = ${f.id} returning id`
    : await sql<{ id: string }>`insert into faq_items (category, question, answer, position, published)
                                values (${f.category}, ${f.question}, ${f.answer}, ${f.position}, ${f.published}) returning id`;
  return row!.id;
}

export async function deleteFaq(sql: Sql, id: string): Promise<void> {
  await sql`delete from faq_items where id = ${id}`;
}

// ───────── Drop da semana ─────────

export type Drop = { title: string | null; status: "draft" | "published"; handles: string[] };

export async function getDropAdmin(sql: Sql): Promise<Drop> {
  const [d] = await sql<{ id: string; title: string | null; status: "draft" | "published" }>`
    select id, title, status from drop_weeks order by id limit 1`;
  if (!d) return { title: null, status: "draft", handles: [] };
  const itens = await sql<{ handle: string }>`
    select p.handle from drop_week_items i join products p on p.id = i.product_id
    where i.drop_week_id = ${d.id} order by i.position`;
  return { title: d.title, status: d.status, handles: itens.map((i) => i.handle) };
}

export async function saveDrop(sql: Sql, drop: Drop): Promise<void> {
  await sql.begin(async (tx) => {
    let [d] = await tx<{ id: string }>`select id from drop_weeks order by id limit 1`;
    if (!d) {
      [d] = await tx<{ id: string }>`insert into drop_weeks (title, status) values (${drop.title}, ${drop.status}) returning id`;
    } else {
      await tx`update drop_weeks set title = ${drop.title}, status = ${drop.status} where id = ${d.id}`;
    }
    await tx`delete from drop_week_items where drop_week_id = ${d!.id}`;
    for (const [i, handle] of drop.handles.entries()) {
      await tx`insert into drop_week_items (drop_week_id, product_id, position)
               select ${d!.id}, id, ${i} from products where handle = ${handle}
               on conflict do nothing`;
    }
  });
}

/**
 * Vitrine "Drops da semana". Sem curadoria publicada no painel, cai nas peças
 * mais recentes — um buraco entre a abertura e as coleções é pior do que
 * mostrar o que acabou de chegar.
 */
export async function getCuratedDrop(sql: Sql): Promise<{ title: string | null; products: Product[] }> {
  const drop = await getDropAdmin(sql);
  if (drop.status === "published" && drop.handles.length > 0) {
    const produtos = await listProducts(sql, { handles: drop.handles });
    const porHandle = new Map(produtos.map((p) => [p.handle, p]));
    return {
      title: drop.title,
      products: drop.handles.map((h) => porHandle.get(h)).filter((p): p is Product => Boolean(p)),
    };
  }
  return { title: null, products: await listProducts(sql) };
}
