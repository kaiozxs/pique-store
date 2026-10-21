import "server-only";
import { db, grantPanelAccess, listPanelAccess, revokePanelAccess } from "@pique/db";
import { exigirDono } from "./auth";
import type { Papel } from "./papel";

export type AcessoPainel = { id: string; customer_id: string; papel: Papel; email: string | null; nome: string | null };

export async function listAcessos(): Promise<AcessoPainel[]> {
  await exigirDono();
  const acessos = await listPanelAccess(db());
  return acessos.map((a) => ({ id: a.customer_id, customer_id: a.customer_id, papel: a.role, email: a.email, nome: a.name }));
}

export async function concederAcesso(email: string, papel: Papel): Promise<void> {
  const dono = await exigirDono();
  await grantPanelAccess(db(), dono.id, email, papel);
}

/** `id` é o id do cliente que perde o acesso. O banco recusa remover o último dono. */
export async function revogarAcesso(id: string): Promise<void> {
  const dono = await exigirDono();
  await revokePanelAccess(db(), dono.id, id);
}
