import Link from "next/link";

export function Footer() {
  return (
    <footer id="footer" className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-24">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-white/10 pb-12 sm:flex-row sm:items-end">
          <div className="font-display text-4xl leading-none tracking-wide sm:text-6xl">PIQUE</div>
          <a
            href="#top"
            className="border border-accent bg-accent px-7 py-4 text-[13px] font-bold tracking-[0.12em] transition-colors hover:bg-paper hover:text-ink"
          >
            VOLTAR AO TOPO
          </a>
        </div>

        <div className="grid grid-cols-1 gap-12 py-14 sm:grid-cols-3">
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
              <Link href="/wab">WAB</Link>
              <Link href="/dicas">Dicas</Link>
              <Link href="/conta">Meus pedidos</Link>
              <Link href="/ajuda">Ajuda</Link>
              <Link href="/verifique">Verifique seu PIQUE</Link>
            </div>
          </div>

          <div>
            <div className="mb-4 text-sm font-extrabold tracking-[0.06em]">SOCIAL</div>
            <div className="flex flex-col gap-3 text-sm text-paper/70">
              <a href="#">Instagram</a>
              <a href="#">TikTok</a>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
          <div className="text-xs text-paper/40">© PIQUE {new Date().getFullYear()} — Todos os direitos reservados</div>
          <div className="text-xs font-bold tracking-[0.1em] text-accent">EM DESENVOLVIMENTO</div>
        </div>
      </div>
    </footer>
  );
}
