import { listPieceUnits, listProductsWithVariants } from "@/lib/pecas";
import { PecasClient } from "./PecasClient";

export default async function PecasPage() {
  const [pieces, products] = await Promise.all([listPieceUnits(), listProductsWithVariants()]);
  return <PecasClient initial={pieces} products={products} />;
}
