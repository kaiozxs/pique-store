-- PIQUE: apaga de vez as tabelas do Medusa antigo. NÃO TEM VOLTA.
-- Rode só depois de conferir que a loja nova está funcionando.
--
-- Trava de segurança: se as tabelas da loja nova não estiverem aqui, nada é apagado.
-- Só mexe no schema "public" (e no "medusa_old" criado pelo passo 0).
-- NÃO toca em: tabelas da loja nova, login (schema auth), arquivos (storage).

do $$
declare
  nossas text[] := array[
    'categories','products','product_categories','product_images','variants','customers','addresses',
    'favorites','shipping_options','coupons','carts','cart_items','orders','order_items','payments',
    'pieces','piece_transfers','panel_access','wab_content','tips','drop_weeks','drop_week_items',
    'faq_items','home_sections','schema_migrations','dev_credentials'
  ];
  t text;
  apagadas int := 0;
begin
  if to_regclass('public.products') is null or to_regclass('public.variants') is null
     or to_regclass('public.orders') is null or to_regclass('public.pieces') is null then
    raise exception 'Tabelas da loja nova não encontradas. Rode 1-tabelas.sql antes. Nada foi apagado.';
  end if;

  drop schema if exists medusa_old cascade;

  for t in
    select tablename from pg_tables where schemaname = 'public' and tablename <> all(nossas)
  loop
    execute format('drop table if exists public.%I cascade', t);
    apagadas := apagadas + 1;
  end loop;

  raise notice 'tabelas antigas apagadas: %', apagadas;
end $$;
