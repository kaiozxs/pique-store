import "server-only";
import QRCode from "qrcode";
import { db, listPiecesAdmin } from "@pique/db";
import { exigirUsuario } from "./auth";
import { paraUnidade, type PieceUnit } from "./pecas";

// Endereço público da loja: o QR leva direto à verificação já preenchida,
// então qualquer câmera de celular abre o resultado sem digitar nada.
const LOJA = (process.env.STOREFRONT_URL ?? "https://pique-store-seven.vercel.app").replace(/\/$/, "");

export function linkDeVerificacao(codigo: string): string {
  return `${LOJA}/verifique?codigo=${encodeURIComponent(codigo)}`;
}

export async function listPiecesByOrder(orderId: string): Promise<PieceUnit[]> {
  await exigirUsuario();
  return (await listPiecesAdmin(db(), { orderId })).map(paraUnidade);
}

/** QR em SVG (vetorial: imprime nítido em qualquer tamanho de etiqueta). */
export async function qrSvg(codigo: string): Promise<string> {
  return QRCode.toString(linkDeVerificacao(codigo), {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#ffffff" },
  });
}
