import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listAcessos } from "@/lib/acessos";
import { AcessosClient } from "./AcessosClient";

export default async function AcessosPage() {
  const user = await getCurrentUser();
  if (user?.papel !== "dono") redirect("/pedidos");

  const acessos = await listAcessos();
  return (
    <div>
      <h1 className="mb-2 font-display text-2xl uppercase tracking-tight text-ink">Acessos</h1>
      <p className="mb-6 max-w-xl text-sm text-muted">
        Quem pode entrar neste painel com o próprio login da loja, em <strong>/admin</strong>. O dono vê
        tudo; o lojista não vê a parte financeira nem esta página.
      </p>
      <AcessosClient acessos={acessos} />
    </div>
  );
}
