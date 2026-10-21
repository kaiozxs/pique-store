import "server-only";
import {
  db,
  deleteProduct,
  getProductAdmin,
  listCategoriesAdmin,
  listProductsAdmin,
  saveProduct,
  setVariantStock,
  type ProductAdmin,
  type ProductInput,
} from "@pique/db";
import { exigirUsuario } from "./auth";

export type { ProductAdmin, ProductInput };

export async function listarProdutos(q?: string): Promise<ProductAdmin[]> {
  await exigirUsuario();
  return listProductsAdmin(db(), { q });
}

export async function buscarProduto(id: string): Promise<ProductAdmin | null> {
  await exigirUsuario();
  try {
    return await getProductAdmin(db(), id);
  } catch {
    // id que não é um uuid válido
    return null;
  }
}

export async function listarCategorias() {
  await exigirUsuario();
  return listCategoriesAdmin(db());
}

export async function salvarProduto(input: ProductInput): Promise<string> {
  await exigirUsuario();
  return saveProduct(db(), input);
}

export async function apagarProduto(id: string): Promise<"apagado" | "arquivado"> {
  await exigirUsuario();
  return deleteProduct(db(), id);
}

export async function ajustarEstoque(variantId: string, estoque: number): Promise<void> {
  await exigirUsuario();
  await setVariantStock(db(), variantId, estoque);
}
