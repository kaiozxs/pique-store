import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OcultarEm } from "@/components/OcultarEm";
import { CookiesPainel } from "@/components/CookiesPainel";
import { TransicaoDePagina } from "@/components/TransicaoDePagina";

const TITULO = "PIQUE — Streetwear de Alto Padrão";
const DESCRICAO =
  "PIQUE é streetwear de alto padrão: elegância minimalista e vanguarda das ruas. O padrão é incomparável.";

export const metadata: Metadata = {
  // Base dos endereços absolutos da prévia de compartilhamento (WhatsApp, Instagram, etc.).
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.piquecompany.com"),
  title: TITULO,
  description: DESCRICAO,
  // A imagem vem de app/opengraph-image.png e app/twitter-image.png (logo da PIQUE).
  openGraph: { title: TITULO, description: DESCRICAO, siteName: "PIQUE", locale: "pt_BR", type: "website" },
  twitter: { card: "summary_large_image", title: TITULO, description: DESCRICAO },
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
