import Link from "next/link";

const SUPPORT_EMAIL = "piquecompanysuporte@gmail.com";

const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "ATENDIMENTO",
    links: [
      { label: "Ajuda", href: "/ajuda" },
      { label: "Perguntas frequentes", href: "/ajuda" },
      { label: "Guia de tamanhos", href: "/institucional/guia-de-tamanhos" },
      { label: "Trocas e devoluções", href: "/institucional/trocas-e-devolucoes" },
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

// Só as bandeiras que o checkout realmente aceita hoje (cartão via Mercado
// Pago). Pix e boleto ficam de fora de propósito: ainda não estão habilitados
// no Brick, e exibir o selo seria prometer o que a loja não faz.
const CARD_BRANDS = ["VISA", "MASTERCARD", "ELO", "AMEX"];

const SOCIAL = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/qgdapique/",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16.6 5.82a4.28 4.28 0 0 1-3.14-1.4V15.4a5.4 5.4 0 1 1-4.65-5.35v2.6a2.9 2.9 0 1 0 2.05 2.77V2h2.6a4.28 4.28 0 0 0 1.86 3.53 4.25 4.25 0 0 0 2.71 1.02V9.2a6.8 6.8 0 0 1-1.43-.16Z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/PiqueCompany",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.9 2.25h3.07l-6.71 7.67 7.9 10.83h-6.19l-4.84-6.62-5.54 6.62H3.51l7.18-8.2L3.1 2.25h6.35l4.37 6.05Zm-1.08 16.7h1.7L7.28 3.98H5.44Z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer id="footer" className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex flex-col gap-8 border-b border-white/10 py-12 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 text-sm font-extrabold tracking-[0.06em]">FIQUE À FRENTE</div>
            <p className="mb-5 max-w-[34ch] text-sm leading-relaxed text-paper/55">
              Acesso antecipado aos próximos drops e à narrativa visual da marca.
            </p>
            <form className="flex max-w-sm border-b border-paper/30">
              <label htmlFor="newsletter-email" className="sr-only">
                Seu e-mail para acesso antecipado
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="seu@email.com"
                className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-paper/40"
              />
              <button type="submit" className="px-1 py-3 text-[13px] font-bold tracking-[0.08em] text-accent">
                ENVIAR
              </button>
            </form>
          </div>

          <div className="flex gap-3">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`PIQUE no ${s.label}`}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black text-paper transition-colors hover:border-accent hover:text-accent"
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

        <div className="flex flex-col items-center gap-8 border-t border-white/10 py-8 lg:flex-row lg:justify-between">
          <div className="text-xs text-paper/40">
            © {new Date().getFullYear()} PIQUE. Todos os direitos reservados.
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
            <span className="text-[11px] font-bold tracking-[0.14em] text-paper/70">FORMAS DE PAGAMENTO</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {CARD_BRANDS.map((brand) => (
                <span
                  key={brand}
                  className="border border-white/20 px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] text-paper/75"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 lg:border-l lg:border-white/10 lg:pl-8">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
              className="text-accent"
            >
              <rect x="4" y="10.5" width="16" height="10.5" rx="2" />
              <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
            </svg>
            <div>
              <div className="text-[11px] font-bold tracking-[0.14em] text-paper/70">COMPRA SEGURA</div>
              <div className="text-xs text-paper/45">Seus dados protegidos</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
