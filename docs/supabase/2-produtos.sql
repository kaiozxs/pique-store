-- PIQUE: carrega produtos, categorias, frete e home. Rode DEPOIS do 1-tabelas.sql.

begin;
insert into categories (handle, name, position, active) values ('shirts', 'Camisetas', 0, true) on conflict (handle) do update set name = excluded.name, position = excluded.position, active = excluded.active;
insert into categories (handle, name, position, active) values ('sweatshirts', 'Moletons', 1, false) on conflict (handle) do update set name = excluded.name, position = excluded.position, active = excluded.active;
insert into categories (handle, name, position, active) values ('pants', 'Calças', 2, false) on conflict (handle) do update set name = excluded.name, position = excluded.position, active = excluded.active;
insert into categories (handle, name, position, active) values ('merch', 'Bonés', 3, false) on conflict (handle) do update set name = excluded.name, position = excluded.position, active = excluded.active;

-- Camiseta PIQUE Preta
insert into products (handle, title, description, thumbnail, status, option_order, is_presale, presale_message, estimated_ship_date, created_at) values ('sweatshirt', 'Camiseta PIQUE Preta', 'Camiseta oversized 100% algodão com estampa exclusiva PIQUE no peito. Corte streetwear de alto padrão, caimento solto.', '/produtos/1789436688990-preta-frente.png', 'published', array['Size']::text[], false, null, null::date, now() - (0 * interval '1 second')) on conflict (handle) do update set title = excluded.title, description = excluded.description, thumbnail = excluded.thumbnail, status = excluded.status, option_order = excluded.option_order, is_presale = excluded.is_presale, presale_message = excluded.presale_message, estimated_ship_date = excluded.estimated_ship_date, updated_at = now();
delete from product_images where product_id = (select id from products where handle = 'sweatshirt');
insert into product_images (product_id, url, position) select id, '/produtos/1789436688990-preta-frente.png', 0 from products where handle = 'sweatshirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789436688991-preta-01-frente.png', 1 from products where handle = 'sweatshirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789436688992-preta-02-direita.png', 2 from products where handle = 'sweatshirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789436688992-preta-03-costas.png', 3 from products where handle = 'sweatshirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789436688993-preta-04-esquerda.png', 4 from products where handle = 'sweatshirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789436688991-preta-05-frente-angulo.png', 5 from products where handle = 'sweatshirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789436688992-preta-06-direita-angulo.png', 6 from products where handle = 'sweatshirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789436688993-preta-07-costas-angulo.png', 7 from products where handle = 'sweatshirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789436688992-preta-08-esquerda-angulo.png', 8 from products where handle = 'sweatshirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789438790917-lifestyle-preta-01.png', 9 from products where handle = 'sweatshirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789438790920-lifestyle-preta-02.png', 10 from products where handle = 'sweatshirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789438790924-lifestyle-preta-03.png', 11 from products where handle = 'sweatshirt';
delete from product_categories where product_id = (select id from products where handle = 'sweatshirt');
insert into product_categories (product_id, category_id) select p.id, c.id from products p, categories c where p.handle = 'sweatshirt' and c.handle = 'shirts' on conflict do nothing;
insert into variants (product_id, title, sku, options, price, stock, position) select id, 'S', 'SWEATSHIRT-S', '{"Size":"S"}'::jsonb, 10, 100, 0 from products where handle = 'sweatshirt' on conflict (sku) do update set title = excluded.title, options = excluded.options, price = excluded.price, position = excluded.position;
insert into variants (product_id, title, sku, options, price, stock, position) select id, 'M', 'SWEATSHIRT-M', '{"Size":"M"}'::jsonb, 10, 100, 10 from products where handle = 'sweatshirt' on conflict (sku) do update set title = excluded.title, options = excluded.options, price = excluded.price, position = excluded.position;
insert into variants (product_id, title, sku, options, price, stock, position) select id, 'L', 'SWEATSHIRT-L', '{"Size":"L"}'::jsonb, 10, 100, 20 from products where handle = 'sweatshirt' on conflict (sku) do update set title = excluded.title, options = excluded.options, price = excluded.price, position = excluded.position;
insert into variants (product_id, title, sku, options, price, stock, position) select id, 'XL', 'SWEATSHIRT-XL', '{"Size":"XL"}'::jsonb, 10, 100, 30 from products where handle = 'sweatshirt' on conflict (sku) do update set title = excluded.title, options = excluded.options, price = excluded.price, position = excluded.position;

-- Camiseta PIQUE Branca
insert into products (handle, title, description, thumbnail, status, option_order, is_presale, presale_message, estimated_ship_date, created_at) values ('t-shirt', 'Camiseta PIQUE Branca', 'Camiseta oversized 100% algodão com estampa exclusiva PIQUE no peito. Corte streetwear de alto padrão, caimento solto.', '/produtos/1789436689129-branca-frente.png', 'published', array['Color','Size']::text[], false, null, null::date, now() - (1 * interval '1 second')) on conflict (handle) do update set title = excluded.title, description = excluded.description, thumbnail = excluded.thumbnail, status = excluded.status, option_order = excluded.option_order, is_presale = excluded.is_presale, presale_message = excluded.presale_message, estimated_ship_date = excluded.estimated_ship_date, updated_at = now();
delete from product_images where product_id = (select id from products where handle = 't-shirt');
insert into product_images (product_id, url, position) select id, '/produtos/1789436689129-branca-frente.png', 0 from products where handle = 't-shirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789436689130-branca-01-frente.png', 1 from products where handle = 't-shirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789436689130-branca-02-direita.png', 2 from products where handle = 't-shirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789436689130-branca-03-costas.png', 3 from products where handle = 't-shirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789436689130-branca-04-esquerda.png', 4 from products where handle = 't-shirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789436689131-branca-05-estampa.png', 5 from products where handle = 't-shirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789436689132-branca-06-tag.png', 6 from products where handle = 't-shirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789436689131-branca-07-clip.png', 7 from products where handle = 't-shirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789436689132-branca-08-tecido.png', 8 from products where handle = 't-shirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789438791059-lifestyle-branca-01.png', 9 from products where handle = 't-shirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789438791063-lifestyle-branca-02.png', 10 from products where handle = 't-shirt';
insert into product_images (product_id, url, position) select id, '/produtos/1789438791068-lifestyle-branca-03.png', 11 from products where handle = 't-shirt';
delete from product_categories where product_id = (select id from products where handle = 't-shirt');
insert into product_categories (product_id, category_id) select p.id, c.id from products p, categories c where p.handle = 't-shirt' and c.handle = 'shirts' on conflict do nothing;
insert into variants (product_id, title, sku, options, price, stock, position) select id, 'S / Black', 'SHIRT-S-BLACK', '{"Size":"S","Color":"Black"}'::jsonb, 10, 100, 0 from products where handle = 't-shirt' on conflict (sku) do update set title = excluded.title, options = excluded.options, price = excluded.price, position = excluded.position;
insert into variants (product_id, title, sku, options, price, stock, position) select id, 'S / White', 'SHIRT-S-WHITE', '{"Size":"S","Color":"White"}'::jsonb, 10, 100, 1 from products where handle = 't-shirt' on conflict (sku) do update set title = excluded.title, options = excluded.options, price = excluded.price, position = excluded.position;
insert into variants (product_id, title, sku, options, price, stock, position) select id, 'M / Black', 'SHIRT-M-BLACK', '{"Size":"M","Color":"Black"}'::jsonb, 10, 100, 10 from products where handle = 't-shirt' on conflict (sku) do update set title = excluded.title, options = excluded.options, price = excluded.price, position = excluded.position;
insert into variants (product_id, title, sku, options, price, stock, position) select id, 'M / White', 'SHIRT-M-WHITE', '{"Size":"M","Color":"White"}'::jsonb, 10, 100, 11 from products where handle = 't-shirt' on conflict (sku) do update set title = excluded.title, options = excluded.options, price = excluded.price, position = excluded.position;
insert into variants (product_id, title, sku, options, price, stock, position) select id, 'L / Black', 'SHIRT-L-BLACK', '{"Size":"L","Color":"Black"}'::jsonb, 10, 100, 20 from products where handle = 't-shirt' on conflict (sku) do update set title = excluded.title, options = excluded.options, price = excluded.price, position = excluded.position;
insert into variants (product_id, title, sku, options, price, stock, position) select id, 'L / White', 'SHIRT-L-WHITE', '{"Size":"L","Color":"White"}'::jsonb, 10, 100, 21 from products where handle = 't-shirt' on conflict (sku) do update set title = excluded.title, options = excluded.options, price = excluded.price, position = excluded.position;
insert into variants (product_id, title, sku, options, price, stock, position) select id, 'XL / Black', 'SHIRT-XL-BLACK', '{"Size":"XL","Color":"Black"}'::jsonb, 10, 100, 30 from products where handle = 't-shirt' on conflict (sku) do update set title = excluded.title, options = excluded.options, price = excluded.price, position = excluded.position;
insert into variants (product_id, title, sku, options, price, stock, position) select id, 'XL / White', 'SHIRT-XL-WHITE', '{"Size":"XL","Color":"White"}'::jsonb, 10, 100, 31 from products where handle = 't-shirt' on conflict (sku) do update set title = excluded.title, options = excluded.options, price = excluded.price, position = excluded.position;

-- Frete (só se ainda não houver nenhum)
insert into shipping_options (name, price, position) select * from (values ('Frete padrão', 10::numeric, 0), ('Frete expresso', 10::numeric, 1)) as v(name, price, position) where not exists (select 1 from shipping_options);
insert into wab_content (id, status, title, body, media) values (1, 'em_construcao', null, null, null::jsonb) on conflict (id) do nothing;
insert into home_sections (type, position, visible, config) values ('hero', 0, true, null::jsonb) on conflict (type) do nothing;
insert into home_sections (type, position, visible, config) values ('drop_destaque', 1, true, null::jsonb) on conflict (type) do nothing;
insert into home_sections (type, position, visible, config) values ('wab_teaser', 2, true, null::jsonb) on conflict (type) do nothing;
insert into home_sections (type, position, visible, config) values ('dicas_destaque', 3, true, null::jsonb) on conflict (type) do nothing;
insert into home_sections (type, position, visible, config) values ('apresentacao', 4, true, null::jsonb) on conflict (type) do nothing;
insert into drop_weeks (title, status) select null, 'draft' where not exists (select 1 from drop_weeks);
commit;
