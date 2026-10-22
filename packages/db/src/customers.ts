import { ErroDeRegra, type Sql } from "./sql.ts";
import type { Address, AddressInput, Customer } from "./types.ts";

const COLUNAS_ENDERECO = `id, first_name, last_name, phone, address_1, address_2, city, province, postal_code, country_code, is_default`;

export async function getCustomer(sql: Sql, id: string): Promise<Customer | null> {
  const [c] = await sql<Omit<Customer, "addresses">>`
    select id, email, first_name, last_name, phone, cpf, birth_date::text as birth_date, photo
    from customers where id = ${id}`;
  if (!c) return null;
  const addresses = await sql.unsafe<Address>(
    `select ${COLUNAS_ENDERECO} from addresses where customer_id = $1 order by is_default desc, created_at`,
    [id]
  );
  return { ...c, addresses };
}

/** Garante o cadastro de quem acabou de entrar (o gatilho do banco já costuma ter criado). */
export async function ensureCustomer(
  sql: Sql,
  input: { id: string; email: string; first_name?: string | null; last_name?: string | null }
): Promise<void> {
  await sql`insert into customers (id, email, first_name, last_name)
            values (${input.id}, ${input.email}, ${input.first_name ?? null}, ${input.last_name ?? null})
            on conflict (id) do nothing`;
}

export async function updateProfile(
  sql: Sql,
  id: string,
  dados: { first_name?: string; last_name?: string; phone?: string; cpf?: string; birth_date?: string | null }
): Promise<void> {
  await sql`
    update customers set
      first_name = coalesce(${dados.first_name ?? null}, first_name),
      last_name = coalesce(${dados.last_name ?? null}, last_name),
      phone = coalesce(${dados.phone ?? null}, phone),
      cpf = coalesce(${dados.cpf ?? null}, cpf),
      birth_date = coalesce(${dados.birth_date ?? null}::date, birth_date),
      updated_at = now()
    where id = ${id}`;
}

const FOTO_MAX = 120_000;

/** Só JPEG em data URL e de tamanho limitado: o campo é servido de volta num <img>. */
export async function setPhoto(sql: Sql, id: string, dataUrl: string | null): Promise<void> {
  if (dataUrl !== null) {
    if (!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(dataUrl) || dataUrl.length > FOTO_MAX) {
      throw new ErroDeRegra("Foto inválida.");
    }
  }
  await sql`update customers set photo = ${dataUrl}, updated_at = now() where id = ${id}`;
}

// ───────── Endereços ─────────

export async function addAddress(sql: Sql, customerId: string, a: AddressInput): Promise<string> {
  return sql.begin(async (tx) => {
    const [{ n }] = (await tx<{ n: number }>`select count(*)::int as n from addresses where customer_id = ${customerId}`) as [{ n: number }];
    const [novo] = await tx<{ id: string }>`
      insert into addresses (customer_id, first_name, last_name, phone, address_1, address_2, city, province, postal_code, country_code, is_default)
      values (${customerId}, ${a.first_name}, ${a.last_name}, ${a.phone ?? null}, ${a.address_1}, ${a.address_2 ?? null},
              ${a.city}, ${a.province ?? null}, ${a.postal_code}, ${a.country_code ?? "br"}, ${n === 0})
      returning id`;
    return novo!.id;
  });
}

export async function updateAddress(sql: Sql, customerId: string, addressId: string, a: AddressInput): Promise<void> {
  const r = await sql`
    update addresses set first_name = ${a.first_name}, last_name = ${a.last_name}, phone = ${a.phone ?? null},
           address_1 = ${a.address_1}, address_2 = ${a.address_2 ?? null}, city = ${a.city}, province = ${a.province ?? null},
           postal_code = ${a.postal_code}, country_code = ${a.country_code ?? "br"}
    where id = ${addressId} and customer_id = ${customerId} returning id`;
  if (r.length === 0) throw new ErroDeRegra("Endereço não encontrado.");
}

export async function setDefaultAddress(sql: Sql, customerId: string, addressId: string): Promise<void> {
  await sql.begin(async (tx) => {
    const [a] = await tx<{ id: string }>`select id from addresses where id = ${addressId} and customer_id = ${customerId}`;
    if (!a) throw new ErroDeRegra("Endereço não encontrado.");
    // Primeiro tira o padrão de todos: o índice só admite um por cliente.
    await tx`update addresses set is_default = false where customer_id = ${customerId} and is_default`;
    await tx`update addresses set is_default = true where id = ${addressId}`;
  });
}

/** Excluir o endereço padrão exige dizer qual outro assume o lugar (se houver outro). */
export async function removeAddress(sql: Sql, customerId: string, addressId: string, newDefaultId?: string): Promise<void> {
  await sql.begin(async (tx) => {
    const [a] = await tx<{ id: string; is_default: boolean }>`
      select id, is_default from addresses where id = ${addressId} and customer_id = ${customerId} for update`;
    if (!a) throw new ErroDeRegra("Endereço não encontrado.");
    if (a.is_default) {
      const [{ n }] = (await tx<{ n: number }>`select count(*)::int as n from addresses where customer_id = ${customerId} and id <> ${addressId}`) as [{ n: number }];
      if (n > 0 && !newDefaultId) throw new ErroDeRegra("Escolha qual endereço será o padrão antes de excluir este.");
    }
    await tx`delete from addresses where id = ${addressId}`;
    if (a.is_default && newDefaultId) {
      await tx`update addresses set is_default = true where id = ${newDefaultId} and customer_id = ${customerId}`;
    }
  });
}

// ───────── Favoritos ─────────

export async function listFavorites(sql: Sql, customerId: string): Promise<string[]> {
  const rows = await sql<{ handle: string }>`
    select p.handle from favorites f join products p on p.id = f.product_id
    where f.customer_id = ${customerId} order by f.created_at`;
  return rows.map((r) => r.handle);
}

export async function toggleFavorite(sql: Sql, customerId: string, handle: string): Promise<{ favoritado: boolean }> {
  return sql.begin(async (tx) => {
    const [p] = await tx<{ id: string }>`select id from products where handle = ${handle}`;
    if (!p) throw new ErroDeRegra("Peça não encontrada.");
    const removido = await tx`delete from favorites where customer_id = ${customerId} and product_id = ${p.id} returning product_id`;
    if (removido.length > 0) return { favoritado: false };
    await tx`insert into favorites (customer_id, product_id) values (${customerId}, ${p.id}) on conflict do nothing`;
    return { favoritado: true };
  });
}

// ───────── Acesso ao painel ─────────

export type PanelRole = "dono" | "lojista";
export type PanelAccess = { customer_id: string; role: PanelRole; email: string; name: string | null };

export async function getPanelRole(sql: Sql, customerId: string): Promise<PanelRole | null> {
  const [r] = await sql<{ role: PanelRole }>`select role from panel_access where customer_id = ${customerId}`;
  return r?.role ?? null;
}

export async function listPanelAccess(sql: Sql): Promise<PanelAccess[]> {
  return sql<PanelAccess>`
    select a.customer_id, a.role, c.email,
           nullif(trim(coalesce(c.first_name, '') || ' ' || coalesce(c.last_name, '')), '') as name
    from panel_access a join customers c on c.id = a.customer_id order by a.created_at`;
}

/** Só quem é dono concede. A pessoa precisa ter conta na loja: o vínculo é com o login dela. */
export async function grantPanelAccess(sql: Sql, byCustomerId: string, email: string, role: PanelRole): Promise<void> {
  await sql.begin(async (tx) => {
    const [quem] = await tx<{ role: PanelRole }>`select role from panel_access where customer_id = ${byCustomerId}`;
    if (quem?.role !== "dono") throw new ErroDeRegra("Só o dono gerencia acessos.", "permissao");
    const [alvo] = await tx<{ id: string }>`select id from customers where lower(email) = lower(${email.trim()})`;
    if (!alvo) throw new ErroDeRegra("Nenhuma conta da loja com esse e-mail. A pessoa precisa se cadastrar primeiro.");
    await tx`insert into panel_access (customer_id, role, granted_by) values (${alvo.id}, ${role}, ${byCustomerId})
             on conflict (customer_id) do update set role = excluded.role, granted_by = excluded.granted_by`;
  });
}

/** O último dono nunca pode ser removido (o painel ficaria sem ninguém no comando). */
export async function revokePanelAccess(sql: Sql, byCustomerId: string, targetCustomerId: string): Promise<void> {
  await sql.begin(async (tx) => {
    const [quem] = await tx<{ role: PanelRole }>`select role from panel_access where customer_id = ${byCustomerId}`;
    if (quem?.role !== "dono") throw new ErroDeRegra("Só o dono gerencia acessos.", "permissao");
    const [alvo] = await tx<{ role: PanelRole }>`select role from panel_access where customer_id = ${targetCustomerId} for update`;
    if (!alvo) return;
    if (alvo.role === "dono") {
      const [{ n }] = (await tx<{ n: number }>`select count(*)::int as n from panel_access where role = 'dono'`) as [{ n: number }];
      if (n <= 1) throw new ErroDeRegra("Esse é o último dono. Conceda o acesso a outra pessoa antes.");
    }
    await tx`delete from panel_access where customer_id = ${targetCustomerId}`;
  });
}

/** Nome completo de vários clientes de uma vez (painel: vendas e etiquetas). Quem não tem nome cadastrado fica de fora. */
export async function listCustomerNames(sql: Sql, ids: string[]): Promise<Map<string, string>> {
  const unicos = [...new Set(ids)];
  if (unicos.length === 0) return new Map();
  // Os ids vêm do próprio banco (uuid), então montar o literal de array é seguro.
  const rows = await sql<{ id: string; nome: string | null }>`
    select id, nullif(trim(coalesce(first_name, '') || ' ' || coalesce(last_name, '')), '') as nome
    from customers where id = any(${`{${unicos.join(",")}}`}::uuid[])`;
  return new Map(rows.flatMap((r) => (r.nome ? [[r.id, r.nome] as [string, string]] : [])));
}
