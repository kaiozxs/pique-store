import { ErroDeRegra, type Sql } from "./sql.ts";
import { FORMATO_CODIGO, gerarCodigoDePeca, idPessoal, normalizarCodigo } from "./util.ts";
import type { Piece } from "./types.ts";

// ───────── Verificação pública ─────────

export type PieceVerification = {
  valid: boolean;
  status?: "nao_registrado" | "registrado" | "revogado";
  code?: string;
  /** ID pessoal do dono (PQ-XXXXXXXX), nunca nome ou e-mail. */
  owner_id?: string | null;
  purchased_at?: string | null;
  product?: { title: string | null; handle: string | null; variant_title: string | null; thumbnail: string | null } | null;
};

/**
 * Rota pública: confirma a autenticidade e mostra a quem a peça pertence pelo
 * ID pessoal. Nunca devolve nome, e-mail, id interno, pedido ou nota fiscal.
 */
export async function verifyPiece(sql: Sql, codigo: string): Promise<PieceVerification> {
  const [p] = await sql<{
    code: string;
    status: "nao_registrado" | "registrado" | "revogado";
    owner_id: string | null;
    purchased_at: string | null;
    title: string | null;
    handle: string | null;
    variant_title: string | null;
    thumbnail: string | null;
  }>`
    select pc.code, pc.status, pc.owner_id, to_char(o.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as purchased_at,
           pr.title, pr.handle, v.title as variant_title, pr.thumbnail
    from pieces pc
    left join variants v on v.id = pc.variant_id
    left join products pr on pr.id = v.product_id
    left join orders o on o.id = pc.order_id
    where pc.code = ${normalizarCodigo(codigo)}`;
  if (!p) return { valid: false };
  return {
    valid: p.status !== "revogado",
    status: p.status,
    code: p.code,
    owner_id: p.owner_id ? idPessoal(p.owner_id) : null,
    purchased_at: p.purchased_at,
    product: p.title ? { title: p.title, handle: p.handle, variant_title: p.variant_title, thumbnail: p.thumbnail } : null,
  };
}

// ───────── Geração (compra e painel) ─────────

/**
 * Cria `quantidade` peças da variação. Código repetido (raríssimo) é refeito.
 * Com `ownerId`, a peça já nasce registrada no nome de quem comprou.
 */
export async function createPieces(
  sql: Sql,
  input: { variantId: string; quantidade: number; ownerId?: string | null; orderId?: string | null }
): Promise<Piece[]> {
  const criadas: Piece[] = [];
  for (let n = 0; n < input.quantidade; n++) {
    for (let tentativa = 0; tentativa < 8; tentativa++) {
      const rows = await sql<Piece>`
        insert into pieces (code, variant_id, status, owner_id, order_id)
        values (${gerarCodigoDePeca()}, ${input.variantId}, ${input.ownerId ? "registrado" : "nao_registrado"},
                ${input.ownerId ?? null}, ${input.orderId ?? null})
        on conflict (code) do nothing
        returning id, code, variant_id, status, owner_id, order_id, serial_number, invoice_reference, to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as created_at`;
      if (rows[0]) {
        criadas.push(rows[0]);
        break;
      }
      if (tentativa === 7) throw new Error("Não foi possível gerar um código único para a peça.");
    }
  }
  return criadas;
}

/** Uma peça por unidade vendida. Chamar duas vezes para o mesmo pedido não duplica. */
export async function createPiecesForOrder(tx: Sql, orderId: string): Promise<void> {
  const [ja] = await tx<{ id: string }>`select id from pieces where order_id = ${orderId} limit 1`;
  if (ja) return;
  const [pedido] = await tx<{ customer_id: string | null }>`select customer_id from orders where id = ${orderId}`;
  const itens = await tx<{ variant_id: string | null; quantity: number }>`
    select variant_id, quantity from order_items where order_id = ${orderId} order by id`;
  for (const item of itens) {
    if (!item.variant_id) continue;
    await createPieces(tx, {
      variantId: item.variant_id,
      quantidade: item.quantity,
      ownerId: pedido?.customer_id ?? null,
      orderId,
    });
  }
}

/** Reembolso: a autenticidade das peças daquele pedido deixa de valer. */
export async function revokePiecesOfOrder(tx: Sql, orderId: string): Promise<void> {
  await tx`update pieces set status = 'revogado' where order_id = ${orderId}`;
}

// ───────── Etiquetas pré-impressas (painel) ─────────

/**
 * Vincula o código de uma etiqueta já impressa a uma variação. É definitivo:
 * se o código já existe, recusa — a trava mora aqui, no servidor.
 */
export async function linkLabel(sql: Sql, codigo: string, variantId: string): Promise<Piece> {
  const code = normalizarCodigo(codigo);
  if (!FORMATO_CODIGO.test(code)) throw new ErroDeRegra("Código de etiqueta inválido.");
  const [v] = await sql<{ id: string }>`select id from variants where id = ${variantId}`;
  if (!v) throw new ErroDeRegra("Peça não encontrada.");

  const rows = await sql<Piece>`
    insert into pieces (code, variant_id, status) values (${code}, ${variantId}, 'nao_registrado')
    on conflict (code) do nothing
    returning id, code, variant_id, status, owner_id, order_id, serial_number, invoice_reference, to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as created_at`;
  if (!rows[0]) throw new ErroDeRegra("Esta etiqueta já está vinculada a uma peça e não pode ser alterada.", "ja_vinculada");
  return rows[0];
}

// ───────── Conta do cliente ─────────

export type MyPiece = {
  id: string;
  code: string;
  status: "nao_registrado" | "registrado" | "revogado";
  invoice_reference: string | null;
  product: { title: string | null; handle: string | null; thumbnail: string | null; variant_title: string | null } | null;
  /** Transferência pendente: quem está esperando a autorização do dono. */
  pending_transfer: { id: string; to_id: string } | null;
};

export async function listMyPieces(sql: Sql, customerId: string): Promise<MyPiece[]> {
  const rows = await sql<{
    id: string;
    code: string;
    status: MyPiece["status"];
    invoice_reference: string | null;
    title: string | null;
    handle: string | null;
    thumbnail: string | null;
    variant_title: string | null;
    transfer_id: string | null;
    transfer_to: string | null;
  }>`
    select pc.id, pc.code, pc.status, pc.invoice_reference, pr.title, pr.handle, pr.thumbnail, v.title as variant_title,
           t.id as transfer_id, t.to_customer_id as transfer_to
    from pieces pc
    left join variants v on v.id = pc.variant_id
    left join products pr on pr.id = v.product_id
    left join piece_transfers t on t.piece_id = pc.id and t.status = 'pendente'
    where pc.owner_id = ${customerId}
    order by pc.created_at desc`;
  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    status: r.status,
    invoice_reference: r.invoice_reference,
    product: r.title ? { title: r.title, handle: r.handle, thumbnail: r.thumbnail, variant_title: r.variant_title } : null,
    pending_transfer: r.transfer_id ? { id: r.transfer_id, to_id: idPessoal(r.transfer_to!) } : null,
  }));
}

/** Registra uma peça avulsa (ainda sem dono) no nome do cliente. */
export async function registerPiece(sql: Sql, codigo: string, customerId: string): Promise<void> {
  await sql.begin(async (tx) => {
    const [p] = await tx<{ id: string; status: string }>`
      select id, status from pieces where code = ${normalizarCodigo(codigo)} for update`;
    if (!p) throw new ErroDeRegra("Código de peça não encontrado.");
    if (p.status !== "nao_registrado") {
      throw new ErroDeRegra("Esta peça já foi registrada. Use a transferência de titularidade.");
    }
    await tx`update pieces set status = 'registrado', owner_id = ${customerId} where id = ${p.id}`;
    await tx`insert into piece_transfers (piece_id, from_customer_id, to_customer_id, status, authorized_at)
             values (${p.id}, null, ${customerId}, 'concluida', now())`;
  });
}

/** Pede a transferência de uma peça de outra pessoa para si; o dono atual precisa autorizar. */
export async function requestTransfer(sql: Sql, codigo: string, toCustomerId: string): Promise<string> {
  return sql.begin(async (tx) => {
    const [p] = await tx<{ id: string; status: string; owner_id: string | null }>`
      select id, status, owner_id from pieces where code = ${normalizarCodigo(codigo)} for update`;
    if (!p) throw new ErroDeRegra("Código de peça não encontrado.");
    if (p.status !== "registrado") throw new ErroDeRegra("Só é possível transferir uma peça já registrada.");
    if (p.owner_id === toCustomerId) throw new ErroDeRegra("Você já é o titular desta peça.");

    const [pendente] = await tx<{ id: string }>`
      select id from piece_transfers where piece_id = ${p.id} and status = 'pendente'`;
    if (pendente) throw new ErroDeRegra("Já existe uma transferência pendente para esta peça.");

    const [t] = await tx<{ id: string }>`
      insert into piece_transfers (piece_id, from_customer_id, to_customer_id, status)
      values (${p.id}, ${p.owner_id}, ${toCustomerId}, 'pendente') returning id`;
    return t!.id;
  });
}

/** Só o titular atual pode autorizar (ou recusar) a transferência. */
export async function resolveTransfer(
  sql: Sql,
  transferId: string,
  byCustomerId: string,
  decision: "concluida" | "rejeitada"
): Promise<void> {
  await sql.begin(async (tx) => {
    const [t] = await tx<{ id: string; piece_id: string; from_customer_id: string | null; to_customer_id: string; status: string }>`
      select id, piece_id, from_customer_id, to_customer_id, status from piece_transfers where id = ${transferId} for update`;
    if (!t) throw new ErroDeRegra("Transferência não encontrada.");
    if (t.status !== "pendente") throw new ErroDeRegra("Esta transferência já foi resolvida.");
    if (t.from_customer_id !== byCustomerId) {
      throw new ErroDeRegra("Somente o titular atual da peça pode autorizar esta transferência.");
    }
    await tx`update piece_transfers set status = ${decision}, authorized_at = now() where id = ${t.id}`;
    if (decision === "concluida") {
      await tx`update pieces set owner_id = ${t.to_customer_id} where id = ${t.piece_id}`;
    }
  });
}

// ───────── Painel ─────────

export type PieceAdmin = Piece & { product_title: string | null; variant_title: string | null; owner_public_id: string | null };

export async function listPiecesAdmin(
  sql: Sql,
  filtros: { variantId?: string; status?: string; code?: string; orderId?: string } = {}
): Promise<PieceAdmin[]> {
  const rows = await sql.unsafe<Piece & { product_title: string | null; variant_title: string | null }>(
    `select pc.id, pc.code, pc.variant_id, pc.status, pc.owner_id, pc.order_id, pc.serial_number, pc.invoice_reference,
            to_char(pc.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as created_at, pr.title as product_title, v.title as variant_title
     from pieces pc
     left join variants v on v.id = pc.variant_id
     left join products pr on pr.id = v.product_id
     where ($1::uuid is null or pc.variant_id = $1)
       and ($2::text is null or pc.status = $2)
       and ($3::text is null or pc.code = $3)
       and ($4::uuid is null or pc.order_id = $4)
     order by pc.created_at desc limit 500`,
    [filtros.variantId ?? null, filtros.status ?? null, filtros.code ? normalizarCodigo(filtros.code) : null, filtros.orderId ?? null]
  );
  return rows.map((r) => ({ ...r, owner_public_id: r.owner_id ? idPessoal(r.owner_id) : null }));
}

export async function deletePiece(sql: Sql, id: string): Promise<void> {
  await sql`delete from pieces where id = ${id}`;
}
