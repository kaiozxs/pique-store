import Image from "next/image";
import Link from "next/link";
import { PaymentBrands } from "@/components/PaymentBrands";

const SUPPORT_EMAIL = "piquecompanysuporte@gmail.com";

const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "ATENDIMENTO",
    links: [
      { label: "Ajuda", href: "/ajuda" },
      { label: "Perguntas frequentes", href: "/ajuda" },
      { label: "Guia de tamanhos", href: "/institucional/guia-de-tamanhos" },
      { label: "Trocas e devoluções", href: "/institucional/trocas-e-devolucoes" },
      { label: "Acompanhar meu pedido", href: "/institucional/pedidos-e-acompanhamento" },
      { label: "Cancelamentos", href: "/institucional/cancelamentos" },
      { label: "Entrega e frete", href: "/institucional/entrega-e-frete" },
      { label: "Fale conosco", href: `mailto:${SUPPORT_EMAIL}` },
    ],
  },
  {
    title: "SOBRE A PIQUE",
    links: [
      { label: "Sobre a PIQUE", href: "/institucional/sobre" },
      { label: "Seja membro", href: "/conta" },
      { label: "Criadores de conteúdo", href: "/institucional/criadores" },
    ],
  },
  {
    title: "INFORMAÇÕES",
    links: [
      { label: "Política de privacidade", href: "/institucional/politica-de-privacidade" },
      { label: "Termos de uso", href: "/institucional/termos-de-uso" },
      { label: "Política de cookies", href: "/institucional/politica-de-cookies" },
      { label: "Política de envio", href: "/institucional/politica-de-envio" },
      { label: "Política de trocas e devoluções", href: "/institucional/trocas-e-devolucoes" },
      { label: "Política de cancelamentos", href: "/institucional/cancelamentos" },
      { label: "Política de pedidos e acompanhamento", href: "/institucional/pedidos-e-acompanhamento" },
      { label: "Informações legais da empresa", href: "/institucional/informacoes-legais" },
    ],
  },
  {
    title: "PIQUE COMPANY",
    links: [
      { label: "Trabalhe conosco", href: "/institucional/trabalhe-conosco" },
      { label: "Seja parceiro", href: "/institucional/seja-parceiro" },
      { label: "Patrocínio", href: "/institucional/patrocinio" },
      { label: "Fornecedores", href: "/institucional/fornecedores" },
      { label: "Imprensa", href: "/institucional/imprensa" },
    ],
  },
];

const SOCIAL = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/qgdapique/",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@piquecompanysupor",
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16.6 5.82a4.28 4.28 0 0 1-3.14-1.4V15.4a5.4 5.4 0 1 1-4.65-5.35v2.6a2.9 2.9 0 1 0 2.05 2.77V2h2.6a4.28 4.28 0 0 0 1.86 3.53 4.25 4.25 0 0 0 2.71 1.02V9.2a6.8 6.8 0 0 1-1.43-.16Z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/PiqueCompany",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.9 2.25h3.07l-6.71 7.67 7.9 10.83h-6.19l-4.84-6.62-5.54 6.62H3.51l7.18-8.2L3.1 2.25h6.35l4.37 6.05Zm-1.08 16.7h1.7L7.28 3.98H5.44Z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer id="footer" className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        {/* Faixa de topo em uma linha só no desktop: marca, chamada da
            newsletter, campo e redes — separadas por filetes verticais. No
            celular tudo empilha e os filetes somem. */}
        <div className="flex flex-col gap-8 border-b border-white/10 py-10 lg:flex-row lg:items-center lg:gap-10">
          <Link href="/" className="shrink-0" aria-label="PIQUE, ir para a home">
            <Image src="/logo.png" alt="PIQUE" width={92} height={70} style={{ height: "auto" }} />
          </Link>

          <div className="shrink-0 lg:border-l lg:border-white/15 lg:pl-10">
            <div className="mb-1.5 text-sm font-extrabold tracking-[0.06em]">FIQUE À FRENTE</div>
            <p className="max-w-[32ch] text-[13px] leading-relaxed text-paper/55">
              Acesse antecipado aos próximos drops e novidades da PIQUE.
            </p>
          </div>

          <form className="flex w-full min-w-0 max-w-xl lg:flex-1">
            <label htmlFor="newsletter-email" className="sr-only">
              Seu e-mail para acesso antecipado
            </label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="Seu e-mail"
              className="min-w-0 flex-1 border border-white/20 border-r-0 bg-white/[0.03] px-4 py-3 text-sm outline-none transition-colors placeholder:text-paper/40 focus:border-paper/50"
            />
            <button
              type="submit"
              className="shrink-0 bg-paper px-7 py-3 text-[13px] font-bold tracking-[0.08em] text-ink transition-colors hover:bg-accent hover:text-paper"
            >
              ENVIAR
            </button>
          </form>

          <div className="flex shrink-0 gap-6 lg:border-l lg:border-white/15 lg:pl-10">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`PIQUE no ${s.label}`}
                className="text-paper/85 transition-colors hover:text-accent"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <div className="mb-5 flex items-center gap-2 text-sm font-extrabold tracking-[0.06em]">
                {column.title}
                <span aria-hidden="true" className="text-paper/40">
                  →
                </span>
              </div>
              <div className="flex flex-col gap-3 text-sm text-paper/60">
                {column.links.map((link) =>
                  link.href.startsWith("mailto:") ? (
                    <a key={link.label} href={link.href} className="transition-colors hover:text-paper">
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.label} href={link.href} className="transition-colors hover:text-paper">
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Copyright sozinho na esquerda; pagamento e compra segura andam
            juntos na direita, separados pelo mesmo filete vertical do topo. */}
        <div className="flex flex-col items-center gap-8 border-t border-white/10 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="order-2 text-xs text-paper/40 lg:order-1">
            © {new Date().getFullYear()} PIQUE. Todos os direitos reservados.
          </div>

          <div className="order-1 flex flex-col items-center gap-7 sm:flex-row sm:gap-8 lg:order-2">
            <div className="flex flex-col items-center gap-3">
              <span className="text-[11px] font-bold tracking-[0.14em] text-paper/70">FORMAS DE PAGAMENTO</span>
              <PaymentBrands />
            </div>

            <div className="flex items-center gap-3 sm:border-l sm:border-white/15 sm:pl-8">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                aria-hidden="true"
                className="shrink-0 text-paper/85"
              >
                <path d="M12 2.6l7.2 2.7v6c0 4.4-3 7.7-7.2 9.1-4.2-1.4-7.2-4.7-7.2-9.1v-6L12 2.6Z" />
                <rect x="9.1" y="11.2" width="5.8" height="4.6" rx="1" fill="currentColor" stroke="none" />
                <path d="M10.3 11.2v-1.4a1.7 1.7 0 0 1 3.4 0v1.4" />
              </svg>
              <div>
                <div className="text-[11px] font-bold tracking-[0.14em] text-paper/70">COMPRA SEGURA</div>
                <div className="text-xs text-paper/45">Seus dados protegidos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
