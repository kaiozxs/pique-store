"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Esconde o conteúdo nas rotas indicadas. Usado para tirar o rodapé da área
 * da conta: ali a pessoa está cuidando dos dados dela, e o rodapé da loja
 * (newsletter, links institucionais) só empurra a página para baixo.
 */
export function OcultarEm({ prefixos, children }: { prefixos: string[]; children: ReactNode }) {
  const pathname = usePathname();
  if (prefixos.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  return <>{children}</>;
}
