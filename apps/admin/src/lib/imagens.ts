import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { exigirUsuario } from "./auth";

const TIPOS: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/avif": "avif" };
const LIMITE = 5 * 1024 * 1024;
const BUCKET = "produtos";

/**
 * Guarda a foto enviada pelo painel e devolve o endereço público.
 *
 * Em produção vai para o Supabase Storage (bucket público "produtos"), usando
 * a chave de serviço, que só existe no servidor. Fora de produção, sem
 * Supabase, grava na pasta pública da loja local — só para testar.
 */
export async function guardarImagem(arquivo: File): Promise<string> {
  await exigirUsuario();
  const ext = TIPOS[arquivo.type];
  if (!ext) throw new Error("Use uma imagem PNG, JPG, WEBP ou AVIF.");
  if (arquivo.size > LIMITE) throw new Error("A imagem passa de 5 MB. Reduza e tente de novo.");
  const nome = `${new Date().getFullYear()}/${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await arquivo.arrayBuffer());

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chaveServico = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && chaveServico) {
    const supabase = createClient(url, chaveServico, { auth: { persistSession: false } });
    const { error } = await supabase.storage.from(BUCKET).upload(nome, bytes, { contentType: arquivo.type, upsert: false });
    if (error) throw new Error("Não foi possível enviar a imagem agora. Tente de novo.");
    return supabase.storage.from(BUCKET).getPublicUrl(nome).data.publicUrl;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Envio de imagens não está configurado (falta a chave do Supabase Storage).");
  }
  const pasta = path.resolve(process.cwd(), "..", "storefront", "public", "produtos", "uploads");
  const destino = path.join(pasta, nome);
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, bytes);
  return `/produtos/uploads/${nome}`;
}
