import Link from "next/link";

export function Footer() {
  return (
    <footer id="footer" className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-24">
        <div className="grid grid-cols-1 gap-12 border-b border-white/10 py-14 sm:grid-cols-2 lg:grid-cols-4">
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
              <button
                type="submit"
                className="px-1 py-3 text-[13px] font-bold tracking-[0.08em] text-accent"
              >
                ENVIAR
              </button>
            </form>
          </div>

          <div>
            <div className="mb-4 text-sm font-extrabold tracking-[0.06em]">NAVEGAÇÃO</div>
            <div className="flex flex-col gap-3 text-sm text-paper/70">
              <Link href="/drops">Drops</Link>
              <Link href="/book">WAB</Link>
              <Link href="/dicas">Dicas</Link>
              <Link href="/conta">Meus pedidos</Link>
              <Link href="/ajuda">Ajuda</Link>
            </div>
          </div>

          <div>
            <div className="mb-4 text-sm font-extrabold tracking-[0.06em]">INSTITUCIONAL</div>
            <div className="flex flex-col gap-3 text-sm text-paper/70">
              <a href="mailto:piquecompanysuporte@gmail.com">Fale conosco</a>
              <a href="mailto:piquecompanysuporte@gmail.com">Atendimento ao cliente</a>
              <Link href="/ajuda">Institucional</Link>
            </div>
          </div>

          <div>
            <div className="mb-4 text-sm font-extrabold tracking-[0.06em]">SOCIAL</div>
            <div className="flex flex-col gap-3 text-sm text-paper/70">
              <a href="https://www.instagram.com/qgdapique/" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
              <a href="https://www.tiktok.com/@piquecompanysupor" target="_blank" rel="noopener noreferrer">
                TikTok
              </a>
              <a href="https://x.com/PiqueCompany" target="_blank" rel="noopener noreferrer">
                X (Twitter)
              </a>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 border-t border-white/10 py-8">
          <a
            href="https://www.instagram.com/qgdapique/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="PIQUE no Instagram"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black text-paper transition-colors hover:border-accent hover:text-accent"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4.2" />
              <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a
            href="https://www.tiktok.com/@piquecompanysupor"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="PIQUE no TikTok"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black text-paper transition-colors hover:border-accent hover:text-accent"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M16.6 5.82a4.28 4.28 0 0 1-3.14-1.4V15.4a5.4 5.4 0 1 1-4.65-5.35v2.6a2.9 2.9 0 1 0 2.05 2.77V2h2.6a4.28 4.28 0 0 0 1.86 3.53 4.25 4.25 0 0 0 2.71 1.02V9.2a6.8 6.8 0 0 1-1.43-.16Z" />
            </svg>
          </a>
          <a
            href="https://x.com/PiqueCompany"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="PIQUE no X"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black text-paper transition-colors hover:border-accent hover:text-accent"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.9 2.25h3.07l-6.71 7.67 7.9 10.83h-6.19l-4.84-6.62-5.54 6.62H3.51l7.18-8.2L3.1 2.25h6.35l4.37 6.05Zm-1.08 16.7h1.7L7.28 3.98H5.44Z" />
            </svg>
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
          <div className="text-xs text-paper/40">© PIQUE {new Date().getFullYear()} — Todos os direitos reservados</div>
          <div className="text-xs font-bold tracking-[0.1em] text-accent">EM DESENVOLVIMENTO</div>
        </div>
      </div>
    </footer>
  );
}
