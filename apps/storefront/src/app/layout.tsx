import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OcultarEm } from "@/components/OcultarEm";
import { CookiesPainel } from "@/components/CookiesPainel";
import { TransicaoDePagina } from "@/components/TransicaoDePagina";

export const metadata: Metadata = {
  title: "PIQUE — Streetwear de Alto Padrão",
  description:
    "PIQUE é streetwear de alto padrão: elegância minimalista e vanguarda das ruas. O padrão é incomparável.",
};

// A loja lê o banco a cada visita (vitrine, sacola, conta): nenhuma página é montada no build.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <div aria-hidden="true" className="progresso-leitura fixed inset-x-0 top-0 z-[70] h-[2px] bg-accent" />
        <Header />
        <main className="flex-1">
          <TransicaoDePagina>{children}</TransicaoDePagina>
        </main>
        <OcultarEm prefixos={["/conta", "/verifique"]}>
          <Footer />
        </OcultarEm>
        <CookiesPainel />
      </body>
    </html>
  );
}
