-- PIQUE: cria as tabelas da loja. Cole tudo no SQL Editor do Supabase e clique em Run.

create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now());

-- ===== 001_loja.sql =====
-- PIQUE — esquema da loja (Postgres / Supabase).
--
-- Substitui o Medusa: catálogo, clientes, carrinho, pedidos, pagamentos e as
-- tabelas próprias da marca (peças com QR, acessos ao painel, conteúdo).
--
-- Valores em dinheiro são numeric(12,2) em reais, do mesmo jeito que o site
-- já os exibe (49.9 = R$ 49,90). Nada aqui fica em centavos.
--
-- Todas as tabelas têm RLS ligado e NENHUMA política: a chave pública do
-- Supabase não enxerga nada. O acesso é só pelo servidor (conexão
-- direta), que decide quem pode ver o quê.

-- ───────────────────────── Catálogo ─────────────────────────

create table categories (
  id uuid primary key default gen_random_uuid(),
  handle text not null unique,
  name text not null,
  position integer not null default 0,
  active boolean not null default true
);

create table products (
  id uuid primary key default gen_random_uuid(),
  handle text not null unique,
  title text not null,
  description text,
  thumbnail text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  -- Ordem em que as opções aparecem na página (ex.: {Color,Size}).
  option_order text[] not null default '{}',
  is_presale boolean not null default false,
  presale_message text,
  estimated_ship_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_categories (
  product_id uuid not null references products (id) on delete cascade,
  category_id uuid not null references categories (id) on delete cascade,
  primary key (product_id, category_id)
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  url text not null,
  position integer not null default 0
);
create index product_images_product_idx on product_images (product_id, position);

create table variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  title text not null,
  sku text unique,
  -- {"Color": "Black", "Size": "G"}
  options jsonb not null default '{}',
  price numeric(12, 2) not null check (price >= 0),
  -- A trava de estoque mora aqui: nunca fica negativo, mesmo com duas
  -- compras ao mesmo tempo (o banco recusa a que passaria do limite).
  stock integer not null default 0 check (stock >= 0),
  allow_backorder boolean not null default false,
  position integer not null default 0,
  active boolean not null default true
);
create index variants_product_idx on variants (product_id, position);

-- ───────────────────────── Clientes ─────────────────────────

-- O id é o mesmo do login (Supabase Auth). A ligação com auth.users é criada
-- no fim deste arquivo, só quando esse esquema existe (no Supabase).
create table customers (
  id uuid primary key,
  email text not null,
  first_name text,
  last_name text,
  phone text,
  cpf text,
  birth_date date,
  -- JPEG reduzido em data URL, como já era no Medusa.
  photo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index customers_email_key on customers (lower(email));

create table addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  phone text,
  address_1 text not null,
  address_2 text,
  city text not null,
  province text,
  postal_code text not null,
  country_code text not null default 'br',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index addresses_customer_idx on addresses (customer_id);
-- No máximo um endereço padrão por cliente.
create unique index addresses_one_default on addresses (customer_id) where is_default;

create table favorites (
  customer_id uuid not null references customers (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (customer_id, product_id)
);

-- ───────────────────────── Frete e cupons ─────────────────────────

create table shipping_options (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12, 2) not null check (price >= 0),
  estimate text,
  position integer not null default 0,
  active boolean not null default true
);

create table coupons (
  code text primary key check (code = upper(code)),
  kind text not null check (kind in ('percent', 'fixed')),
  amount numeric(12, 2) not null check (amount > 0),
  min_subtotal numeric(12, 2) not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  max_uses integer,
  uses integer not null default 0,
  active boolean not null default true,
  check (kind <> 'percent' or amount <= 100)
);

-- ───────────────────────── Carrinho ─────────────────────────

create table carts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers (id) on delete set null,
  email text,
  shipping_address jsonb,
  -- CPF e data de nascimento exigidos no checkout.
  document jsonb,
  shipping_option_id uuid references shipping_options (id) on delete set null,
  coupon_code text references coupons (code) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
create index carts_customer_idx on carts (customer_id);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts (id) on delete cascade,
  variant_id uuid not null references variants (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

-- ───────────────────────── Pedidos e pagamentos ─────────────────────────

create table orders (
  id uuid primary key default gen_random_uuid(),
  -- Número que o cliente vê (#1, #2…).
  display_id bigint generated always as identity unique,
  customer_id uuid references customers (id) on delete set null,
  -- A sacola só é encerrada quando o pagamento é aprovado: se o cartão for
  -- recusado, ela continua aberta para a pessoa tentar de novo.
  cart_id uuid references carts (id) on delete set null,
  email text not null,
  shipping_address jsonb not null,
  document jsonb,
  subtotal numeric(12, 2) not null,
  shipping_total numeric(12, 2) not null default 0,
  discount_total numeric(12, 2) not null default 0,
  total numeric(12, 2) not null,
  currency_code text not null default 'brl',
  coupon_code text,
  shipping_option_name text,
  -- Mesmos nomes que o Medusa usava, para a tela de status não mudar.
  status text not null default 'pending' check (status in ('pending', 'completed', 'canceled')),
  payment_status text not null default 'awaiting' check (payment_status in ('awaiting', 'captured', 'canceled', 'refunded')),
  fulfillment_status text not null default 'not_fulfilled' check (fulfillment_status in ('not_fulfilled', 'fulfilled', 'shipped', 'delivered', 'canceled')),
  tracking_code text,
  -- Garante que o estoque reservado volta uma única vez se o pedido cair.
  stock_released boolean not null default false,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);
create index orders_customer_idx on orders (customer_id, created_at desc);
create index orders_cart_idx on orders (cart_id);
create index orders_created_idx on orders (created_at desc);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  variant_id uuid references variants (id) on delete set null,
  -- Congelado na compra: o pedido não muda se o produto for editado depois.
  product_title text not null,
  variant_title text,
  thumbnail text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null,
  total numeric(12, 2) not null,
  -- Quanto do estoque este item reservou na compra (0 para peça sob
  -- encomenda). Se o pedido cair, devolve exatamente isso.
  stock_reserved integer not null default 0
);
create index order_items_order_idx on order_items (order_id);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  provider text not null default 'mercadopago',
  -- Id do pagamento no Mercado Pago. Único: o mesmo aviso (webhook) repetido
  -- nunca vira dois pagamentos.
  provider_payment_id text unique,
  status text not null,
  status_detail text,
  amount numeric(12, 2) not null,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_order_idx on payments (order_id);

-- ───────────────────────── Autenticidade (QR) ─────────────────────────

create table pieces (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  variant_id uuid references variants (id) on delete set null,
  serial_number text,
  status text not null default 'nao_registrado' check (status in ('nao_registrado', 'registrado', 'revogado')),
  owner_id uuid references customers (id) on delete set null,
  order_id uuid references orders (id) on delete set null,
  invoice_reference text,
  created_at timestamptz not null default now()
);
create index pieces_owner_idx on pieces (owner_id);
create index pieces_order_idx on pieces (order_id);

create table piece_transfers (
  id uuid primary key default gen_random_uuid(),
  piece_id uuid not null references pieces (id) on delete cascade,
  from_customer_id uuid references customers (id) on delete set null,
  to_customer_id uuid not null references customers (id) on delete cascade,
  status text not null default 'pendente' check (status in ('pendente', 'rejeitada', 'concluida')),
  authorized_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
create index piece_transfers_piece_idx on piece_transfers (piece_id);

-- ───────────────────────── Painel ─────────────────────────

-- Quem entra no painel com o login da loja. Só o servidor escreve aqui.
create table panel_access (
  customer_id uuid primary key references customers (id) on delete cascade,
  role text not null check (role in ('dono', 'lojista')),
  granted_by uuid references customers (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ───────────────────────── Conteúdo editorial ─────────────────────────

create table wab_content (
  -- Uma linha só.
  id integer primary key default 1 check (id = 1),
  status text not null default 'em_construcao' check (status in ('em_construcao', 'revelado', 'oculto')),
  title text,
  body text,
  media jsonb
);

create table tips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text not null,
  cover_image text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table drop_weeks (
  id uuid primary key default gen_random_uuid(),
  title text,
  status text not null default 'draft' check (status in ('draft', 'published'))
);

create table drop_week_items (
  drop_week_id uuid not null references drop_weeks (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  position integer not null default 0,
  primary key (drop_week_id, product_id)
);

create table faq_items (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  question text not null,
  answer text not null,
  position integer not null default 0,
  published boolean not null default true
);

create table home_sections (
  type text primary key check (type in ('hero', 'drop_destaque', 'wab_teaser', 'dicas_destaque', 'apresentacao')),
  position integer not null default 0,
  visible boolean not null default true,
  config jsonb
);

-- ───────────────────────── Segurança ─────────────────────────

alter table categories enable row level security;
alter table products enable row level security;
alter table product_categories enable row level security;
alter table product_images enable row level security;
alter table variants enable row level security;
alter table customers enable row level security;
alter table addresses enable row level security;
alter table favorites enable row level security;
alter table shipping_options enable row level security;
alter table coupons enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table pieces enable row level security;
alter table piece_transfers enable row level security;
alter table panel_access enable row level security;
alter table wab_content enable row level security;
alter table tips enable row level security;
alter table drop_weeks enable row level security;
alter table drop_week_items enable row level security;
alter table faq_items enable row level security;
alter table home_sections enable row level security;

-- ───────────────────────── Ligação com o login (só no Supabase) ─────────────────────────

do $$
begin
  if to_regclass('auth.users') is not null then
    alter table customers
      add constraint customers_auth_fk foreign key (id) references auth.users (id) on delete cascade;
  end if;
end $$;


-- ===== 002_auth.sql =====
-- PIQUE — cria o cliente quando alguém se cadastra (e-mail ou Google).
--
-- Só faz algo no Supabase, onde existe o esquema `auth`. Sem isso, o primeiro
-- login com Google deixaria a pessoa autenticada mas sem cadastro na loja.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  completo text := coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '');
  nome text;
  sobrenome text;
begin
  nome := coalesce(
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'given_name',
    nullif(split_part(completo, ' ', 1), '')
  );
  sobrenome := coalesce(
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'family_name',
    nullif(regexp_replace(completo, '^\S+\s*', ''), '')
  );

  insert into customers (id, email, first_name, last_name)
  values (new.id, new.email, nome, sobrenome)
  on conflict (id) do nothing;

  return new;
end;
$$;

do $$
begin
  if to_regclass('auth.users') is not null then
    drop trigger if exists on_auth_user_created on auth.users;
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_auth_user();
  end if;
end $$;


insert into schema_migrations (name) values ('001_loja.sql') on conflict do nothing;
insert into schema_migrations (name) values ('002_auth.sql') on conflict do nothing;
