"use server";

import { verifyPiece } from "@/lib/catalogo";

export async function verificarPecaAction(codigo: string) {
  return verifyPiece(codigo.trim().slice(0, 40));
}
