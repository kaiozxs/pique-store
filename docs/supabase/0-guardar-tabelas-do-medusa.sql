-- PIQUE: rode ANTES do 1-tabelas.sql.
-- Se o banco já tem tabelas do Medusa antigo com o mesmo nome das da loja nova,
-- elas são MOVIDAS (não apagadas) para o schema "medusa_old". Nada se perde.
-- Se não houver nenhuma, este arquivo não faz nada.

create schema if not exists medusa_old;

do $$
declare
  t text;
begin
  foreach t in array array[
    'categories','products','product_categories','product_images','variants','customers','addresses',
    'favorites','shipping_options','coupons','carts','cart_items','orders','order_items','payments',
    'pieces','piece_transfers','panel_access','wab_content','tips','drop_weeks','drop_week_items',
    'faq_items','home_sections','schema_migrations'
  ]
  loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I set schema medusa_old', t);
      raise notice 'movida: %', t;
    end if;
  end loop;
end $$;
