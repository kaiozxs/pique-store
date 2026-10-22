/**
 * Teste de fumaça com o driver real (`postgres`): passa pelas consultas que a
 * loja usa, contra o banco apontado por DATABASE_URL. Cria e apaga dados
 * próprios; não mexe no resto.
 *
 *   DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/postgres npm run fumaca
 */
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { connect } from "../src/connect.ts";
import { getCuratedDrop, getFaqCategories, getHomeSections } from "../src/content.ts";
import { getProductByHandle, listCategories, listProducts } from "../src/catalog.ts";
import { addItem, createCart, getCart, listShippingOptions, setCheckoutInfo, setShippingOption } from "../src/cart.ts";
import { applyPaymentResult, getOrder, listOrders, placeOrder, salesMetrics } from "../src/orders.ts";
import { listMyPieces, verifyPiece } from "../src/pieces.ts";
import { ensureCustomer, getCustomer, toggleFavorite, listFavorites } from "../src/customers.ts";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Defina DATABASE_URL.");
const sql = connect(url);

const produtos = await listProducts(sql);
assert.ok(produtos.length >= 1, "sem produtos");
assert.equal(typeof produtos[0]!.variants[0]!.price, "number", "preço deve vir como número");
assert.ok(Array.isArray(produtos[0]!.images) && Array.isArray(produtos[0]!.option_order));
assert.equal((await listProducts(sql, { handles: [produtos[0]!.handle] })).length, 1, "filtro por lista de handles");
assert.equal((await listProducts(sql, { categoryHandle: "shirts", q: "PIQUE" })).length >= 1, true);
assert.ok((await listCategories(sql)).length >= 1);
assert.ok(await getProductByHandle(sql, produtos[0]!.handle));
await getHomeSections(sql);
await getFaqCategories(sql);
assert.ok((await getCuratedDrop(sql)).products.length >= 1);

const id = randomUUID();
await ensureCustomer(sql, { id, email: `fumaca-${id.slice(0, 8)}@teste.dev`, first_name: "Fumaça", last_name: "Teste" });
try {
  const v = produtos[0]!.variants.find((x) => x.stock > 2)!;
  const cartId = await createCart(sql, id);
  await addItem(sql, cartId, v.id, 2);
  await setCheckoutInfo(sql, cartId, {
    email: "fumaca@teste.dev",
    address: { first_name: "A", last_name: "B", address_1: "Rua 1", city: "SP", postal_code: "01000-000" },
    document: { cpf: "529.982.247-25", birth_date: "1990-01-01" },
  });
  await setShippingOption(sql, cartId, (await listShippingOptions(sql))[0]!.id);
  const cart = await getCart(sql, cartId);
  assert.equal(cart!.item_count, 2);
  assert.equal(typeof cart!.total, "number");

  const pedido = await placeOrder(sql, { cartId, customerId: id });
  assert.equal(typeof pedido.display_id, "number", "número do pedido deve ser número");
  assert.ok(!Number.isNaN(Date.parse(pedido.created_at)));
  const pago = await applyPaymentResult(sql, { orderId: pedido.id, providerPaymentId: `fumaca-${id}`, status: "approved", amount: pedido.total, raw: { teste: true } });
  assert.equal(pago.payment_status, "captured");
  const pecas = await listMyPieces(sql, id);
  assert.equal(pecas.length, 2);
  const ver = await verifyPiece(sql, pecas[0]!.code);
  assert.match(ver.owner_id!, /^PQ-[0-9A-F]{8}$/);
  assert.equal((await listOrders(sql, { customerId: id })).count, 1);
  assert.ok((await getOrder(sql, pedido.id, { customerId: id }))!.items.length === 1);
  assert.equal(await getOrder(sql, pedido.id, { customerId: randomUUID() }), null, "pedido de outra conta não aparece");
  const hoje = new Date().toISOString().slice(0, 10);
  assert.ok((await salesMetrics(sql, { from: hoje, to: hoje })).total_revenue >= pago.total);
  await toggleFavorite(sql, id, produtos[0]!.handle);
  assert.deepEqual(await listFavorites(sql, id), [produtos[0]!.handle]);
  assert.equal((await getCustomer(sql, id))!.first_name, "Fumaça");
  console.log("fumaça: tudo certo com o driver real");
} finally {
  // Limpeza: devolve o estoque e apaga o que o teste criou.
  const pedidos = await sql<{ id: string }>`select id from orders where customer_id = ${id}`;
  for (const p of pedidos) {
    await sql`update variants v set stock = v.stock + oi.stock_reserved from order_items oi where oi.order_id = ${p.id} and oi.variant_id = v.id`;
    await sql`delete from pieces where order_id = ${p.id}`;
    await sql`delete from orders where id = ${p.id}`;
  }
  await sql`delete from carts where customer_id = ${id}`;
  await sql`delete from customers where id = ${id}`;
}
await (sql as unknown as { end: () => Promise<void> }).end();
