import "server-only";
import {
  db,
  getBookContent as lerBook,
  getCuratedDrop as lerDrop,
  getFaqCategories as lerFaq,
  getHomeSections as lerHome,
  getProductByHandle as lerProduto,
  getTipBySlug as lerDica,
  listCategories,
  listProducts as lerProdutos,
  listTips as lerDicas,
  verifyPiece as verificar,
  type BookContent,
  type FaqCategory,
  type HomeSection,
  type NavCategory,
  type PieceVerification,
  type Product,
  type TipDetail,
  type TipSummary,
} from "@pique/db";

export type { BookContent, FaqCategory, HomeSection, HomeSectionType, TipDetail, TipSummary, PieceVerification } from "@pique/db";

export async function listNavCategories(): Promise<NavCategory[]> {
  return listCategories(db());
}

export async function listProducts(opcoes?: { categoryHandle?: string; q?: string }): Promise<Product[]> {
  return lerProdutos(db(), opcoes);
}

/** Produtos a partir de uma lista de handles, na ordem pedida (é a ordem em que a pessoa favoritou). */
export async function listProductsByHandles(handles: string[]): Promise<Product[]> {
  if (handles.length === 0) return [];
  const produtos = await lerProdutos(db(), { handles });
  const porHandle = new Map(produtos.map((p) => [p.handle, p]));
  return handles.map((h) => porHandle.get(h)).filter((p): p is Product => Boolean(p));
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  return lerProduto(db(), handle);
}

export async function getCuratedDrop(): Promise<{ title: string | null; products: Product[] }> {
  return lerDrop(db());
}

export async function getBookContent(): Promise<BookContent> {
  return lerBook(db());
}

// Seções que aparecem quando o banco não responde. A home precisa abrir mesmo
// com a base instável: o cliente chega por aqui, e uma página de erro no lugar
// da vitrine é pior do que uma vitrine sem curadoria.
const SECOES_PADRAO: HomeSection[] = [
  { type: "hero", position: 0, visible: true, config: null },
  { type: "drop_destaque", position: 1, visible: true, config: null },
  { type: "wab_teaser", position: 2, visible: true, config: null },
];

export async function getHomeSections(): Promise<HomeSection[]> {
  try {
    return await lerHome(db());
  } catch {
    return SECOES_PADRAO;
  }
}

export async function listTips(): Promise<TipSummary[]> {
  return lerDicas(db());
}

export async function getTipBySlug(slug: string): Promise<TipDetail | null> {
  return lerDica(db(), slug);
}

export async function getFaqCategories(): Promise<FaqCategory[]> {
  return lerFaq(db());
}

export async function verifyPiece(codigo: string): Promise<PieceVerification> {
  return verificar(db(), codigo);
}
