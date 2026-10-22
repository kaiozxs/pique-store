import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { novoBanco } from "./helpers.ts";
import { ErroDeRegra } from "../src/sql.ts";
import { seedCatalog, type SeedCatalog } from "../src/seed.ts";
import { getProductByHandle, listProducts } from "../src/catalog.ts";
import {
  deleteProduct, getProductAdmin, listCategoriesAdmin, listProductsAdmin, saveProduct, setVariantStock, slugify,
  type ProductInput,
} from "../src/catalog-admin.ts";
import { addItem, createCart, setCheckoutInfo, setShippingOption, listShippingOptions } from "../src/cart.ts";
import { placeOrder } from "../src/orders.ts";

const SEED: SeedCatalog = JSON.parse(readFileSync(join(import.meta.dirname, "..", "seed", "catalog.json"), "utf8"));
const ENDERECO = { first_name: "Ana", last_name: "Silva", address_1: "Rua A, 10", city: "São Paulo", province: "SP", postal_code: "01000-000", country_code: "br" };
const DOC = { cpf: "529.982.247-25", birth_date: "1995-05-05" };

async function loja() {
  const { sql } = await novoBanco();
  await seedCatalog(sql, SEED, { imagesBase: "/produtos" });
  return sql;
}

const MOLDE: ProductInput = {
  title: "Moletom Pique Cinza",
  description: "Peso 400g",
  status: "draft",
  option_order: ["Tamanho"],
  category_ids: [],
  images: ["/produtos/a.png", "/produtos/b.png"],
  variants: [
    { title: "P", options: { Tamanho: "P" }, price: 349.9, stock: 5 },
    { title: "M", options: { Tamanho: "M" }, price: 349.9, stock: 3 },
  ],
};

test("slugify tira acento, espaço e símbolo", () => {
  assert.equal(slugify("Camiseta PIQUE Preta!"), "camiseta-pique-preta");
  assert.equal(slugify("  Moletom  Açaí  "), "moletom-acai");
});

test("produto novo nasce como rascunho: o painel vê, a vitrine não", async () => {
  const sql = await loja();
  const id = await saveProduct(sql, MOLDE);

  const admin = await getProductAdmin(sql, id);
  assert.equal(admin?.handle, "moletom-pique-cinza");
  assert.equal(admin?.thumbnail, "/produtos/a.png");
  assert.deepEqual(admin?.images.map((i) => i.url), ["/produtos/a.png", "/produtos/b.png"]);
  assert.equal(admin?.variants.length, 2);
  assert.equal(admin?.variants[0]?.price, 349.9);

  assert.equal(await getProductByHandle(sql, "moletom-pique-cinza"), null);
  assert.ok(!(await listProducts(sql)).some((p) => p.id === id));
  assert.ok((await listProductsAdmin(sql)).some((p) => p.id === id));
});

test("publicar põe na vitrine; nome repetido ganha endereço novo", async () => {
  const sql = await loja();
  const a = await saveProduct(sql, { ...MOLDE, status: "published" });
  const b = await saveProduct(sql, { ...MOLDE, status: "published" });
  assert.notEqual(a, b);
  assert.ok(await getProductByHandle(sql, "moletom-pique-cinza"));
  assert.ok(await getProductByHandle(sql, "moletom-pique-cinza-2"));
});

test("editar mantém as variações existentes e desativa a que saiu da lista", async () => {
  const sql = await loja();
  const id = await saveProduct(sql, { ...MOLDE, status: "published" });
  const antes = (await getProductAdmin(sql, id))!;
  const [p, m] = antes.variants;

  await saveProduct(sql, {
    ...MOLDE,
    id,
    status: "published",
    title: "Moletom Pique Cinza Mescla",
    variants: [{ id: p!.id, title: "P", options: { Tamanho: "P" }, price: 399, stock: 9 }],
  });

  const depois = (await getProductAdmin(sql, id))!;
  assert.equal(depois.title, "Moletom Pique Cinza Mescla");
  const vp = depois.variants.find((v) => v.id === p!.id)!;
  const vm = depois.variants.find((v) => v.id === m!.id)!;
  assert.equal(vp.price, 399);
  assert.equal(vp.stock, 9);
  assert.equal(vp.active, true);
  assert.equal(vm.active, false);

  // A vitrine só mostra a variação ativa.
  const vitrine = await getProductByHandle(sql, depois.handle);
  assert.deepEqual(vitrine?.variants.map((v) => v.id), [p!.id]);
});

test("categorias do produto são trocadas junto", async () => {
  const sql = await loja();
  const categorias = await listCategoriesAdmin(sql);
  assert.ok(categorias.length > 0);
  const id = await saveProduct(sql, { ...MOLDE, category_ids: [categorias[0]!.id] });
  assert.deepEqual((await getProductAdmin(sql, id))?.categories.map((c) => c.id), [categorias[0]!.id]);
  await saveProduct(sql, { ...MOLDE, id, category_ids: [] });
  assert.deepEqual((await getProductAdmin(sql, id))?.categories, []);
});

test("recusa produto sem variação, preço negativo e estoque quebrado", async () => {
  const sql = await loja();
  await assert.rejects(saveProduct(sql, { ...MOLDE, variants: [] }), ErroDeRegra);
  await assert.rejects(saveProduct(sql, { ...MOLDE, variants: [{ title: "P", options: {}, price: -1, stock: 1 }] }), ErroDeRegra);
  await assert.rejects(saveProduct(sql, { ...MOLDE, variants: [{ title: "P", options: {}, price: 10, stock: 1.5 }] }), ErroDeRegra);
  await assert.rejects(saveProduct(sql, { ...MOLDE, title: "  " }), ErroDeRegra);
});

test("ajuste de estoque não aceita negativo", async () => {
  const sql = await loja();
  const id = await saveProduct(sql, MOLDE);
  const v = (await getProductAdmin(sql, id))!.variants[0]!;
  await setVariantStock(sql, v.id, 42);
  assert.equal((await getProductAdmin(sql, id))!.variants[0]!.stock, 42);
  await assert.rejects(setVariantStock(sql, v.id, -1), ErroDeRegra);
  await assert.rejects(setVariantStock(sql, randomUUID(), 1), ErroDeRegra);
});

test("produto nunca vendido é apagado; vendido vira rascunho e o pedido continua", async () => {
  const sql = await loja();
  const livre = await saveProduct(sql, MOLDE);
  assert.equal(await deleteProduct(sql, livre), "apagado");
  assert.equal(await getProductAdmin(sql, livre), null);

  const vendido = await saveProduct(sql, { ...MOLDE, title: "Vendido", status: "published" });
  const variante = (await getProductAdmin(sql, vendido))!.variants[0]!;
  const cartId = await createCart(sql);
  await addItem(sql, cartId, variante.id, 1);
  await setCheckoutInfo(sql, cartId, { email: "a@b.com", address: ENDERECO, document: DOC });
  const [frete] = await listShippingOptions(sql);
  await setShippingOption(sql, cartId, frete!.id);
  await placeOrder(sql, { cartId, customerId: null });

  assert.equal(await deleteProduct(sql, vendido), "arquivado");
  assert.equal((await getProductAdmin(sql, vendido))?.status, "draft");
  assert.equal(await getProductByHandle(sql, "vendido"), null);
});
