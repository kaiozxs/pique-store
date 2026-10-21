import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { novoBanco } from "./helpers.ts";
import type { Sql } from "../src/sql.ts";
import { ErroDeRegra } from "../src/sql.ts";
import { seedCatalog, type SeedCatalog } from "../src/seed.ts";
import { getProductByHandle, listCategories, listProducts } from "../src/catalog.ts";
import {
  addItem, applyCoupon, assignToCustomer, createCart, findOpenCartForCustomer, getCart, listShippingOptions,
  removeItem, setCheckoutInfo, setItemQuantity, setShippingOption,
} from "../src/cart.ts";
import { applyPaymentResult, cancelOrderWithoutPayment, cancelStalePendingOrders, getOrder, placeOrder, salesMetrics, setTracking } from "../src/orders.ts";
import {
  createPieces, linkLabel, listMyPieces, registerPiece, requestTransfer, resolveTransfer, verifyPiece,
} from "../src/pieces.ts";
import {
  addAddress, getCustomer, grantPanelAccess, removeAddress, revokePanelAccess, setDefaultAddress, toggleFavorite,
  listFavorites, ensureCustomer, setPhoto, getPanelRole,
} from "../src/customers.ts";
import { idPessoal } from "../src/util.ts";

const SEED: SeedCatalog = JSON.parse(readFileSync(join(import.meta.dirname, "..", "seed", "catalog.json"), "utf8"));
const ENDERECO = { first_name: "Ana", last_name: "Silva", address_1: "Rua A, 10", city: "São Paulo", province: "SP", postal_code: "01000-000", country_code: "br" };
const DOC = { cpf: "529.982.247-25", birth_date: "1995-05-05" };

async function loja() {
  const { sql } = await novoBanco();
  await seedCatalog(sql, SEED, { imagesBase: "/produtos" });
  return sql;
}

async function cliente(sql: Sql, email = `c${Math.random().toString(36).slice(2)}@t.com`) {
  const id = randomUUID();
  await ensureCustomer(sql, { id, email, first_name: "Ana", last_name: "Silva" });
  return id;
}

async function umaVariante(sql: Sql, stock?: number) {
  const [v] = await sql<{ id: string; price: number }>`select v.id, v.price from variants v join products p on p.id = v.product_id
                                                        where p.handle = 'sweatshirt' order by v.position limit 1`;
  if (stock !== undefined) await sql`update variants set stock = ${stock} where id = ${v!.id}`;
  return v!;
}

async function sacolaPronta(sql: Sql, variantId: string, qtd = 1, customerId: string | null = null) {
  const cartId = await createCart(sql, customerId);
  await addItem(sql, cartId, variantId, qtd);
  await setCheckoutInfo(sql, cartId, { email: "ana@t.com", address: ENDERECO, document: DOC });
  const [frete] = await listShippingOptions(sql);
  await setShippingOption(sql, cartId, frete!.id);
  return cartId;
}

const estoqueDe = async (sql: Sql, id: string) => (await sql<{ stock: number }>`select stock from variants where id = ${id}`)[0]!.stock;

// ─────────────────────────── Catálogo ───────────────────────────

test("o seed carrega o catálogo e pode rodar de novo sem zerar o estoque", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 7);
  await seedCatalog(sql, SEED, { imagesBase: "/produtos" });
  assert.equal(await estoqueDe(sql, v.id), 7, "estoque existente não pode ser sobrescrito");
  const produtos = await listProducts(sql);
  assert.equal(produtos.length, 2);
  const p = await getProductByHandle(sql, "sweatshirt");
  assert.equal(p!.variants.length, 4);
  assert.ok(p!.images.length > 5 && p!.images[0]!.url.startsWith("/produtos/"));
  assert.equal(await getProductByHandle(sql, "nao-existe"), null);
});

test("categorias: 'em breve' quando inativa ou sem produto", async () => {
  const sql = await loja();
  const cats = await listCategories(sql);
  assert.equal(cats.find((c) => c.handle === "shirts")!.available, true);
  assert.equal(cats.find((c) => c.handle === "pants")!.available, false);
  assert.equal(cats.length, 4);
});

test("busca e filtro por categoria", async () => {
  const sql = await loja();
  assert.equal((await listProducts(sql, { q: "branca" })).length, 1);
  assert.equal((await listProducts(sql, { categoryHandle: "shirts" })).length, 2);
  assert.equal((await listProducts(sql, { categoryHandle: "pants" })).length, 0);
  assert.equal((await listProducts(sql, { handles: ["t-shirt"] })).length, 1);
});

test("produto em rascunho não aparece na loja", async () => {
  const sql = await loja();
  await sql`update products set status = 'draft' where handle = 't-shirt'`;
  assert.equal(await getProductByHandle(sql, "t-shirt"), null);
  assert.equal((await listProducts(sql)).length, 1);
});

// ─────────────────────────── Carrinho ───────────────────────────

test("carrinho: soma, limite de estoque e remoção", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 3);
  const cartId = await createCart(sql);
  await addItem(sql, cartId, v.id, 2);
  await addItem(sql, cartId, v.id, 1); // soma na mesma linha
  let cart = (await getCart(sql, cartId))!;
  assert.equal(cart.items.length, 1);
  assert.equal(cart.items[0]!.quantity, 3);
  assert.equal(cart.subtotal, v.price * 3);

  await assert.rejects(() => addItem(sql, cartId, v.id, 1), /Só restam 3/);
  await assert.rejects(() => setItemQuantity(sql, cartId, cart.items[0]!.id, 4), ErroDeRegra);
  await setItemQuantity(sql, cartId, cart.items[0]!.id, 1);
  cart = (await getCart(sql, cartId))!;
  assert.equal(cart.items[0]!.quantity, 1);
  await removeItem(sql, cartId, cart.items[0]!.id);
  assert.equal((await getCart(sql, cartId))!.items.length, 0);
});

test("carrinho: peça esgotada e quantidade inválida", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 0);
  const cartId = await createCart(sql);
  await assert.rejects(() => addItem(sql, cartId, v.id, 1), /esgotada/);
  await assert.rejects(() => addItem(sql, cartId, v.id, 0), /inválida/);
  await assert.rejects(() => addItem(sql, cartId, v.id, 1.5), /inválida/);
  await assert.rejects(() => addItem(sql, cartId, randomUUID(), 1), /disponível/);
});

test("cupons: percentual, fixo, mínimo, vencido e limite", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 10);
  const cartId = await createCart(sql);
  await addItem(sql, cartId, v.id, 2); // 20,00
  await sql`insert into coupons (code, kind, amount) values ('DEZ', 'percent', 10)`;
  await sql`insert into coupons (code, kind, amount) values ('GRANDE', 'fixed', 500)`;
  await sql`insert into coupons (code, kind, amount, min_subtotal) values ('MIN', 'fixed', 5, 100)`;
  await sql`insert into coupons (code, kind, amount, ends_at) values ('VELHO', 'fixed', 5, now() - interval '1 day')`;
  await sql`insert into coupons (code, kind, amount, max_uses, uses) values ('ESGOTADO', 'fixed', 5, 1, 1)`;
  await sql`insert into coupons (code, kind, amount, active) values ('OFF', 'fixed', 5, false)`;

  await applyCoupon(sql, cartId, " dez ");
  assert.equal((await getCart(sql, cartId))!.discount_total, 2);
  await applyCoupon(sql, cartId, "grande");
  const c = (await getCart(sql, cartId))!;
  assert.equal(c.discount_total, 20, "desconto nunca passa do valor das peças");
  assert.equal(c.total, 0);
  for (const ruim of ["MIN", "VELHO", "ESGOTADO", "OFF", "NAOEXISTE"]) {
    await assert.rejects(() => applyCoupon(sql, cartId, ruim), /Cupom inválido/, ruim);
  }
});

test("carrinho: acompanha a conta e volta em outro aparelho", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 5);
  const ana = await cliente(sql);
  const bia = await cliente(sql);
  const cartId = await createCart(sql);
  await addItem(sql, cartId, v.id, 1);
  await assignToCustomer(sql, cartId, ana);
  await assignToCustomer(sql, cartId, bia); // sacola nunca troca de dono
  assert.equal((await getCart(sql, cartId))!.customer_id, ana);
  assert.equal(await findOpenCartForCustomer(sql, ana), cartId);
  assert.equal(await findOpenCartForCustomer(sql, bia), null);
});

// ─────────────────────────── Compra e estoque ───────────────────────────

test("pedido: exige os dados e reserva o estoque", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 5);
  const cartId = await createCart(sql);
  await assert.rejects(() => placeOrder(sql, { cartId, customerId: null }), /vazia/);
  await addItem(sql, cartId, v.id, 2);
  await assert.rejects(() => placeOrder(sql, { cartId, customerId: null }), /e-mail/);
  await setCheckoutInfo(sql, cartId, { email: "Ana@T.com", address: ENDERECO, document: DOC });
  await assert.rejects(() => placeOrder(sql, { cartId, customerId: null }), /envio/);
  const [frete] = await listShippingOptions(sql);
  await setShippingOption(sql, cartId, frete!.id);

  const pedido = await placeOrder(sql, { cartId, customerId: null });
  assert.equal(pedido.status, "pending");
  assert.equal(pedido.payment_status, "awaiting");
  assert.equal(pedido.email, "ana@t.com");
  assert.equal(pedido.subtotal, v.price * 2);
  assert.equal(pedido.total, v.price * 2 + frete!.price);
  assert.equal(pedido.items[0]!.quantity, 2);
  assert.equal(await estoqueDe(sql, v.id), 3, "estoque reservado");
  assert.ok(await getCart(sql, cartId), "a sacola segue aberta até o pagamento ser aprovado");
  await applyPaymentResult(sql, { orderId: pedido.id, providerPaymentId: "ok-1", status: "approved", amount: pedido.total });
  assert.equal(await getCart(sql, cartId), null, "sacola encerrada com a aprovação");
  await assert.rejects(() => placeOrder(sql, { cartId, customerId: null }), /não encontrada|finalizada/);
});

test("cartão recusado: a sacola continua e dá para tentar de novo", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 5);
  const cartId = await sacolaPronta(sql, v.id, 2);
  const p1 = await placeOrder(sql, { cartId, customerId: null });
  await applyPaymentResult(sql, { orderId: p1.id, providerPaymentId: "rec-1", status: "rejected", amount: p1.total });
  assert.equal(await estoqueDe(sql, v.id), 5);
  assert.ok(await getCart(sql, cartId), "sacola intacta");

  const p2 = await placeOrder(sql, { cartId, customerId: null });
  assert.notEqual(p2.id, p1.id);
  assert.equal(await estoqueDe(sql, v.id), 3);
  await applyPaymentResult(sql, { orderId: p2.id, providerPaymentId: "rec-2", status: "approved", amount: p2.total });
  assert.equal((await getOrder(sql, p2.id))!.payment_status, "captured");
});

test("tentar de novo sem ter pago cancela a tentativa anterior; com pagamento em análise, espera", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 5);
  const cartId = await sacolaPronta(sql, v.id, 2);
  const p1 = await placeOrder(sql, { cartId, customerId: null });
  const p2 = await placeOrder(sql, { cartId, customerId: null }); // p1 nunca chegou a cobrar
  assert.equal((await getOrder(sql, p1.id))!.status, "canceled");
  assert.equal(await estoqueDe(sql, v.id), 3, "só a tentativa nova reserva");

  await applyPaymentResult(sql, { orderId: p2.id, providerPaymentId: "ana-1", status: "in_process", amount: p2.total });
  await assert.rejects(() => placeOrder(sql, { cartId, customerId: null }), /em análise/);
  assert.equal(await estoqueDe(sql, v.id), 3, "nada mudou");
});

test("última unidade: duas compras ao mesmo tempo, só uma passa", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 1);
  // As duas sacolas foram montadas quando ainda havia estoque.
  await sql`update variants set stock = 2 where id = ${v.id}`;
  const a = await sacolaPronta(sql, v.id);
  const b = await sacolaPronta(sql, v.id);
  await sql`update variants set stock = 1 where id = ${v.id}`;

  const [ra, rb] = await Promise.allSettled([placeOrder(sql, { cartId: a, customerId: null }), placeOrder(sql, { cartId: b, customerId: null })]);
  const ok = [ra, rb].filter((r) => r.status === "fulfilled").length;
  const falhas = [ra, rb].filter((r): r is PromiseRejectedResult => r.status === "rejected");
  assert.equal(ok, 1);
  assert.match(String(falhas[0]!.reason.message), /esgotou/);
  assert.equal(await estoqueDe(sql, v.id), 0, "nunca fica negativo");
});

test("falha no meio desfaz tudo: estoque, cupom e pedido", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 5);
  const [outra] = await sql<{ id: string }>`select v.id from variants v join products p on p.id = v.product_id
                                            where p.handle = 't-shirt' order by v.position limit 1`;
  await sql`insert into coupons (code, kind, amount, max_uses) values ('UM', 'fixed', 1, 5)`;
  const cartId = await sacolaPronta(sql, v.id, 2);
  await addItem(sql, cartId, outra!.id, 1);
  await applyCoupon(sql, cartId, "UM");
  await sql`update variants set stock = 0 where id = ${outra!.id}`; // esgota a segunda peça depois

  await assert.rejects(() => placeOrder(sql, { cartId, customerId: null }), /esgotou/);
  assert.equal(await estoqueDe(sql, v.id), 5, "a primeira reserva foi desfeita");
  assert.equal((await sql<{ uses: number }>`select uses from coupons where code = 'UM'`)[0]!.uses, 0);
  assert.equal((await sql<{ n: number }>`select count(*)::int as n from orders`)[0]!.n, 0);
  assert.ok(await getCart(sql, cartId), "a sacola continua aberta");
});

test("peça sob encomenda não mexe no estoque", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 0);
  await sql`update variants set allow_backorder = true where id = ${v.id}`;
  const cartId = await sacolaPronta(sql, v.id, 3);
  const pedido = await placeOrder(sql, { cartId, customerId: null });
  assert.equal(await estoqueDe(sql, v.id), 0);
  await applyPaymentResult(sql, { orderId: pedido.id, providerPaymentId: "p1", status: "rejected", amount: pedido.total });
  assert.equal(await estoqueDe(sql, v.id), 0, "não inventa estoque ao devolver");
});

// ─────────────────────────── Pagamento ───────────────────────────

test("pagamento aprovado gera uma peça por unidade, no nome do comprador", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 10);
  const ana = await cliente(sql);
  const cartId = await sacolaPronta(sql, v.id, 3, ana);
  const pedido = await placeOrder(sql, { cartId, customerId: ana });

  const pago = await applyPaymentResult(sql, { orderId: pedido.id, providerPaymentId: "mp-1", status: "approved", amount: pedido.total });
  assert.equal(pago.status, "completed");
  assert.equal(pago.payment_status, "captured");
  assert.ok(pago.paid_at);
  const minhas = await listMyPieces(sql, ana);
  assert.equal(minhas.length, 3);
  assert.ok(minhas.every((p) => p.status === "registrado" && /^[A-HJ-NP-Z2-9]{4}(-[A-HJ-NP-Z2-9]{4}){2}$/.test(p.code)));
  assert.equal(new Set(minhas.map((p) => p.code)).size, 3, "códigos únicos");

  const ver = await verifyPiece(sql, minhas[0]!.code.toLowerCase());
  assert.equal(ver.valid, true);
  assert.equal(ver.owner_id, idPessoal(ana));
  assert.match(ver.owner_id!, /^PQ-[0-9A-F]{8}$/);
  assert.ok(ver.purchased_at && !Number.isNaN(Date.parse(ver.purchased_at)), "data em formato que o navegador entende");
  assert.equal(ver.product!.handle, "sweatshirt");
  assert.equal(JSON.stringify(ver).includes(ana), false, "id interno nunca vaza");
});

test("aviso de pagamento repetido não duplica nada", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 10);
  const ana = await cliente(sql);
  const pedido = await placeOrder(sql, { cartId: await sacolaPronta(sql, v.id, 2, ana), customerId: ana });
  for (let i = 0; i < 3; i++) {
    await applyPaymentResult(sql, { orderId: pedido.id, providerPaymentId: "mp-2", status: "approved", amount: pedido.total });
  }
  assert.equal((await listMyPieces(sql, ana)).length, 2);
  assert.equal((await sql<{ n: number }>`select count(*)::int as n from payments`)[0]!.n, 1);
});

test("pagamento recusado devolve o estoque uma única vez", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 5);
  await sql`insert into coupons (code, kind, amount, max_uses) values ('UM', 'fixed', 1, 5)`;
  const cartId = await sacolaPronta(sql, v.id, 2);
  await applyCoupon(sql, cartId, "UM");
  const pedido = await placeOrder(sql, { cartId, customerId: null });
  assert.equal(await estoqueDe(sql, v.id), 3);

  for (let i = 0; i < 3; i++) {
    const r = await applyPaymentResult(sql, { orderId: pedido.id, providerPaymentId: "mp-3", status: "rejected", amount: pedido.total });
    assert.equal(r.status, "canceled");
  }
  assert.equal(await estoqueDe(sql, v.id), 5, "voltou, e só uma vez");
  assert.equal((await sql<{ uses: number }>`select uses from coupons where code = 'UM'`)[0]!.uses, 0);
});

test("pagamento pendente não muda nada; recusa tardia não cancela pedido já pago", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 5);
  const pedido = await placeOrder(sql, { cartId: await sacolaPronta(sql, v.id, 1), customerId: null });
  const pend = await applyPaymentResult(sql, { orderId: pedido.id, providerPaymentId: "mp-4", status: "in_process", amount: pedido.total });
  assert.equal(pend.status, "pending");
  assert.equal(await estoqueDe(sql, v.id), 4);

  await applyPaymentResult(sql, { orderId: pedido.id, providerPaymentId: "mp-4", status: "approved", amount: pedido.total });
  const depois = await applyPaymentResult(sql, { orderId: pedido.id, providerPaymentId: "mp-5", status: "rejected", amount: pedido.total });
  assert.equal(depois.payment_status, "captured", "outra tentativa recusada não derruba o pago");
  assert.equal(await estoqueDe(sql, v.id), 4);
});

test("aprovado depois de cancelado: revive se há estoque, senão marca para reembolso", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 2);
  const p1 = await placeOrder(sql, { cartId: await sacolaPronta(sql, v.id, 2), customerId: null });
  await applyPaymentResult(sql, { orderId: p1.id, providerPaymentId: "a", status: "cancelled", amount: p1.total });
  assert.equal(await estoqueDe(sql, v.id), 2);
  const revivido = await applyPaymentResult(sql, { orderId: p1.id, providerPaymentId: "a", status: "approved", amount: p1.total });
  assert.equal(revivido.status, "completed");
  assert.equal(await estoqueDe(sql, v.id), 0);

  const p2 = await placeOrder(sql, { cartId: await sacolaPronta(sql, (await umaVariante(sql, 1)).id, 1), customerId: null });
  await applyPaymentResult(sql, { orderId: p2.id, providerPaymentId: "b", status: "cancelled", amount: p2.total });
  const [outro] = await sql<{ id: string }>`select id from variants where id = ${v.id}`;
  await sql`update variants set stock = 0 where id = ${outro!.id}`; // alguém comprou a peça que voltou
  const sem = await applyPaymentResult(sql, { orderId: p2.id, providerPaymentId: "b", status: "approved", amount: p2.total });
  assert.equal(sem.status, "canceled");
  assert.equal(sem.payment_status, "captured");
  assert.equal(sem.metadata.precisa_reembolso, true);
  assert.equal((await sql<{ n: number }>`select count(*)::int as n from pieces where order_id = ${p2.id}`)[0]!.n, 0, "sem peça para pedido que precisa de reembolso");
});

test("reembolso: peças perdem a autenticidade e o estoque volta (se não enviado)", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 5);
  const ana = await cliente(sql);
  const pedido = await placeOrder(sql, { cartId: await sacolaPronta(sql, v.id, 2, ana), customerId: ana });
  await applyPaymentResult(sql, { orderId: pedido.id, providerPaymentId: "r1", status: "approved", amount: pedido.total });
  const [peca] = await listMyPieces(sql, ana);
  await applyPaymentResult(sql, { orderId: pedido.id, providerPaymentId: "r1", status: "refunded", amount: pedido.total });
  assert.equal((await getOrder(sql, pedido.id))!.payment_status, "refunded");
  assert.equal((await verifyPiece(sql, peca!.code)).valid, false);
  assert.equal(await estoqueDe(sql, v.id), 5);

  const p2 = await placeOrder(sql, { cartId: await sacolaPronta(sql, v.id, 1, ana), customerId: ana });
  await applyPaymentResult(sql, { orderId: p2.id, providerPaymentId: "r2", status: "approved", amount: p2.total });
  await setTracking(sql, p2.id, "BR123");
  await applyPaymentResult(sql, { orderId: p2.id, providerPaymentId: "r2", status: "refunded", amount: p2.total });
  assert.equal(await estoqueDe(sql, v.id), 4, "peça já enviada não volta para a prateleira");
});

test("pagamento de outro pedido não é aceito", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 5);
  const a = await placeOrder(sql, { cartId: await sacolaPronta(sql, v.id), customerId: null });
  const b = await placeOrder(sql, { cartId: await sacolaPronta(sql, v.id), customerId: null });
  await applyPaymentResult(sql, { orderId: a.id, providerPaymentId: "x", status: "approved", amount: a.total });
  await assert.rejects(() => applyPaymentResult(sql, { orderId: b.id, providerPaymentId: "x", status: "approved", amount: b.total }), /outro pedido/);
});

test("pedidos parados além do prazo caem e devolvem o estoque", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 5);
  const velho = await placeOrder(sql, { cartId: await sacolaPronta(sql, v.id, 2), customerId: null });
  await placeOrder(sql, { cartId: await sacolaPronta(sql, v.id, 1), customerId: null });
  await sql`update orders set created_at = now() - interval '3 hours' where id = ${velho.id}`;
  assert.equal(await cancelStalePendingOrders(sql, 60), 1);
  assert.equal(await estoqueDe(sql, v.id), 4);
  assert.equal(await cancelStalePendingOrders(sql, 60), 0, "rodar de novo não repete");
});

test("faturamento conta só pedido pago", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 9);
  const pago = await placeOrder(sql, { cartId: await sacolaPronta(sql, v.id, 2), customerId: null });
  await applyPaymentResult(sql, { orderId: pago.id, providerPaymentId: "m1", status: "approved", amount: pago.total });
  await placeOrder(sql, { cartId: await sacolaPronta(sql, v.id, 1), customerId: null }); // aguardando
  const hoje = new Date().toISOString().slice(0, 10);
  const m = await salesMetrics(sql, { from: hoje, to: hoje });
  assert.equal(m.order_count, 1);
  assert.equal(m.total_revenue, pago.total);
  assert.equal(m.average_order_value, pago.total);
});

// ─────────────────────────── Peças ───────────────────────────

test("etiqueta pré-impressa: vincular é definitivo", async () => {
  const sql = await loja();
  const v = await umaVariante(sql);
  const p = await linkLabel(sql, "wkb2-n92p-z94k", v.id);
  assert.equal(p.code, "WKB2-N92P-Z94K");
  assert.equal(p.status, "nao_registrado");
  await assert.rejects(() => linkLabel(sql, "WKB2-N92P-Z94K", v.id), /já está vinculada/);
  await assert.rejects(() => linkLabel(sql, "ABC", v.id), /inválido/);
  await assert.rejects(() => linkLabel(sql, "WKB2-N92P-Z95K", randomUUID()), /não encontrada/);
  assert.equal((await verifyPiece(sql, "WKB2-N92P-Z94K")).owner_id, null);
});

test("peça: registro avulso e transferência só com o aval do titular", async () => {
  const sql = await loja();
  const v = await umaVariante(sql);
  const [peca] = await createPieces(sql, { variantId: v.id, quantidade: 1 });
  const ana = await cliente(sql);
  const bia = await cliente(sql);
  const caio = await cliente(sql);

  await assert.rejects(() => requestTransfer(sql, peca!.code, bia), /já registrada/);
  await registerPiece(sql, peca!.code, ana);
  await assert.rejects(() => registerPiece(sql, peca!.code, bia), /já foi registrada/);
  await assert.rejects(() => requestTransfer(sql, peca!.code, ana), /já é o titular/);

  const t = await requestTransfer(sql, peca!.code, bia);
  await assert.rejects(() => requestTransfer(sql, peca!.code, caio), /pendente/);
  await assert.rejects(() => resolveTransfer(sql, t, caio, "concluida"), /titular atual/);
  await assert.rejects(() => resolveTransfer(sql, t, bia, "concluida"), /titular atual/);
  assert.equal((await listMyPieces(sql, ana))[0]!.pending_transfer!.to_id, idPessoal(bia));
  await resolveTransfer(sql, t, ana, "concluida");
  assert.equal((await verifyPiece(sql, peca!.code)).owner_id, idPessoal(bia));
  assert.equal((await listMyPieces(sql, ana)).length, 0);
  await assert.rejects(() => resolveTransfer(sql, t, ana, "rejeitada"), /já foi resolvida/);
});

test("código inexistente: não vale e não revela nada", async () => {
  const sql = await loja();
  assert.deepEqual(await verifyPiece(sql, "AAAA-AAAA-AAAA"), { valid: false });
});

// ─────────────────────────── Conta ───────────────────────────

test("endereços: primeiro vira padrão, trocar e excluir o padrão", async () => {
  const sql = await loja();
  const ana = await cliente(sql);
  const a1 = await addAddress(sql, ana, ENDERECO);
  const a2 = await addAddress(sql, ana, { ...ENDERECO, address_1: "Rua B, 20" });
  let c = (await getCustomer(sql, ana))!;
  assert.equal(c.addresses.find((x) => x.id === a1)!.is_default, true);
  assert.equal(c.addresses.find((x) => x.id === a2)!.is_default, false);

  await setDefaultAddress(sql, ana, a2);
  c = (await getCustomer(sql, ana))!;
  assert.equal(c.addresses[0]!.id, a2, "o padrão vem primeiro");
  await assert.rejects(() => removeAddress(sql, ana, a2), /padrão/);
  await removeAddress(sql, ana, a2, a1);
  c = (await getCustomer(sql, ana))!;
  assert.equal(c.addresses.length, 1);
  assert.equal(c.addresses[0]!.is_default, true);

  const outra = await cliente(sql);
  await assert.rejects(() => setDefaultAddress(sql, outra, a1), /não encontrado/);
  await assert.rejects(() => removeAddress(sql, outra, a1), /não encontrado/);
});

test("favoritos pertencem à conta", async () => {
  const sql = await loja();
  const ana = await cliente(sql);
  assert.deepEqual(await toggleFavorite(sql, ana, "t-shirt"), { favoritado: true });
  await toggleFavorite(sql, ana, "sweatshirt");
  assert.deepEqual(await listFavorites(sql, ana), ["t-shirt", "sweatshirt"]);
  assert.deepEqual(await toggleFavorite(sql, ana, "t-shirt"), { favoritado: false });
  assert.deepEqual(await listFavorites(sql, ana), ["sweatshirt"]);
  await assert.rejects(() => toggleFavorite(sql, ana, "nada"), /não encontrada/);
});

test("foto de perfil: só JPEG pequeno", async () => {
  const sql = await loja();
  const ana = await cliente(sql);
  await setPhoto(sql, ana, "data:image/jpeg;base64,/9j/4AAQ");
  assert.equal((await getCustomer(sql, ana))!.photo, "data:image/jpeg;base64,/9j/4AAQ");
  await assert.rejects(() => setPhoto(sql, ana, "data:image/svg+xml;base64,PHN2Zz4="), /inválida/);
  await assert.rejects(() => setPhoto(sql, ana, "javascript:alert(1)"), /inválida/);
  await assert.rejects(() => setPhoto(sql, ana, `data:image/jpeg;base64,${"A".repeat(130_000)}`), /inválida/);
  await setPhoto(sql, ana, null);
  assert.equal((await getCustomer(sql, ana))!.photo, null);
});

test("acesso ao painel: só dono concede, o último dono não sai", async () => {
  const sql = await loja();
  const dono = await cliente(sql, "dono@t.com");
  const lojista = await cliente(sql, "loja@t.com");
  const curioso = await cliente(sql, "curioso@t.com");
  await sql`insert into panel_access (customer_id, role) values (${dono}, 'dono')`; // primeiro dono: direto no banco

  await grantPanelAccess(sql, dono, " LOJA@t.com ", "lojista");
  assert.equal(await getPanelRole(sql, lojista), "lojista");
  assert.equal(await getPanelRole(sql, curioso), null);
  await assert.rejects(() => grantPanelAccess(sql, lojista, "curioso@t.com", "dono"), /Só o dono/);
  await assert.rejects(() => grantPanelAccess(sql, curioso, "curioso@t.com", "dono"), /Só o dono/);
  await assert.rejects(() => grantPanelAccess(sql, dono, "ninguem@t.com", "lojista"), /precisa se cadastrar/);
  await assert.rejects(() => revokePanelAccess(sql, dono, dono), /último dono/);
  await revokePanelAccess(sql, dono, lojista);
  assert.equal(await getPanelRole(sql, lojista), null);
});

test("pedido que nunca cobrou cai e devolve o estoque; com pagamento em andamento, não", async () => {
  const sql = await loja();
  const v = await umaVariante(sql, 5);
  const semCobranca = await placeOrder(sql, { cartId: await sacolaPronta(sql, v.id, 2), customerId: null });
  await cancelOrderWithoutPayment(sql, semCobranca.id);
  assert.equal((await getOrder(sql, semCobranca.id))!.status, "canceled");
  assert.equal(await estoqueDe(sql, v.id), 5);

  const cobrando = await placeOrder(sql, { cartId: await sacolaPronta(sql, v.id, 1), customerId: null });
  await applyPaymentResult(sql, { orderId: cobrando.id, providerPaymentId: "andamento-1", status: "in_process", amount: cobrando.total });
  await cancelOrderWithoutPayment(sql, cobrando.id);
  assert.equal((await getOrder(sql, cobrando.id))!.status, "pending", "pagamento em análise não é derrubado");
  assert.equal(await estoqueDe(sql, v.id), 4);
});
