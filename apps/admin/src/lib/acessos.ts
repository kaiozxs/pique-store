import "server-only";
import { sdk } from "./sdk";
import { authHeaders } from "./session";
import type { Papel } from "./papel";

export type AcessoPainel = { id: string; customer_id: string; papel: Papel; email: string | null; nome: string | null };

export async function listAcessos(): Promise<AcessoPainel[]> {
  const headers = await authHeaders();
  const { acessos } = await sdk.client.fetch<{ acessos: AcessoPainel[] }>("/admin/acessos", {
    headers,
    cache: "no-store",
  });
  return acessos;
}

export async function concederAcesso(email: string, papel: Papel): Promise<void> {
  const headers = await authHeaders();
  await sdk.client.fetch("/admin/acessos", { method: "POST", body: { email, papel }, headers });
}

export async function revogarAcesso(id: string): Promise<void> {
  const headers = await authHeaders();
  await sdk.client.fetch(`/admin/acessos/${id}`, { method: "DELETE", headers });
}
