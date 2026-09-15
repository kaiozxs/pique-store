import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { logoutAction } from "./actions";

export default async function PainelLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  // O middleware (proxy.ts) já barra requisição sem cookie de sessão, mas só
  // checa a presença do cookie — essa checagem aqui valida a sessão de
  // verdade (via getCurrentUser) como segunda camada, caso o matcher do
  // middleware algum dia deixe de cobrir uma rota nova sob (painel).
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
          <div className="text-sm text-muted">{user?.email ?? ""}</div>
          <form action={logoutAction}>
            <button type="submit" className="text-sm font-medium text-muted hover:text-accent">
              Sair
            </button>
          </form>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
