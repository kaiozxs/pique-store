"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CATEGORIAS, MAIS_PROCURADOS, type CategoriaDeAjuda } from "@/content/ajuda";
import { INSTAGRAM_URL, INSTAGRAM_USUARIO, SUPPORT_EMAIL } from "@/content/contato";

type Faq = { title: string; items: { question: string; answer: string }[] };

function normalizar(t: string): string {
  return t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

const ICONES: Record<CategoriaDeAjuda["icone"], React.ReactNode> = {
  pedido: (
    <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Zm0 0 8 4.5m0 0 8-4.5M12 12v9" />
  ),
  entrega: (
    <>
      <path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7z" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </>
  ),
  troca: <path d="M4 9h13l-3-3M20 15H7l3 3" />,
  cancelamento: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m9 9 6 6m0-6-6 6" />
    </>
  ),
  produto: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.4 3 7.6 7.5 9.5 4.5-1.9 7.5-5.1 7.5-9.5V6L12 3Z" />
      <path d="m8.8 12.2 2.4 2.4 4.2-4.6" />
    </>
  ),
  conta: (
    <>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M4.5 20c.9-3.6 3.9-5.5 7.5-5.5s6.6 1.9 7.5 5.5" />
    </>
  ),
};

function Icone({ tipo }: { tipo: CategoriaDeAjuda["icone"] }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONES[tipo]}
    </svg>
  );
}

export function CentralDeAjuda({ faq }: { faq: Faq[] }) {
  const [busca, setBusca] = useState("");
  const q = normalizar(busca);

  const resultados = useMemo(() => {
    if (!q) return null;
    const artigos = CATEGORIAS.flatMap((c) =>
      c.artigos
        .filter((a) => normalizar(`${a.titulo} ${c.nome} ${c.resumo}`).includes(q))
        .map((a) => ({ ...a, categoria: c.nome }))
    );
    const perguntas = faq.flatMap((cat) =>
      cat.items
        .filter((i) => normalizar(`${i.question} ${i.answer}`).includes(q))
        .map((i) => ({ ...i, categoria: cat.title }))
    );
    return { artigos, perguntas };
  }, [q, faq]);

  const total = resultados ? resultados.artigos.length + resultados.perguntas.length : 0;

  return (
    <div className="bg-ink text-paper">
      {/* Abertura: título grande, busca e uma foto, no estilo das centrais que o cliente curtiu. */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 lg:left-auto lg:w-[46%]">
          <Image
            src="/produtos/1789438791059-lifestyle-branca-01.png"
            alt=""
            fill
            priority
            className="object-cover object-[50%_16%]"
            sizes="(min-width: 1024px) 46vw, 100vw"
          />
          <div className="absolute inset-0 bg-ink/80 lg:hidden" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-ink via-ink/55 to-transparent lg:block" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-5 text-[13px] font-semibold tracking-[0.28em] text-accent">QG · ATENDIMENTO</div>
            <h1 className="font-display text-4xl leading-[1.05] tracking-wide sm:text-6xl">
              COMO PODEMOS
              <br />
              TE AJUDAR?
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-paper/70 sm:text-base">
              Tire suas dúvidas sobre pedidos, entregas, trocas e muito mais. Se não achar o que procura, fale com a gente.
            </p>

            <form
              role="search"
              onSubmit={(e) => e.preventDefault()}
              className="mt-9 flex max-w-xl border border-white/25 bg-ink/70 backdrop-blur focus-within:border-accent"
            >
              <label htmlFor="busca-ajuda" className="sr-only">
                Buscar uma dúvida ou tema
              </label>
              <input
                id="busca-ajuda"
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Busque por uma dúvida ou tema"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent px-5 py-4 text-sm outline-none placeholder:text-paper/45"
              />
              <button
                type="submit"
                className="btn-preenche border-l border-accent bg-accent px-6 text-[12px] font-bold tracking-[0.14em] text-paper"
              >
                PESQUISAR
              </button>
            </form>

            {!q && (
              <div className="mt-8">
                <div className="mb-3 text-[11px] font-bold tracking-[0.22em] text-paper/50">MAIS PROCURADOS</div>
                <ul className="flex flex-wrap gap-2.5">
                  {MAIS_PROCURADOS.map((a) => (
                    <li key={a.href}>
                      <Link
                        href={a.href}
                        className="block border border-white/20 px-4 py-2 text-xs font-semibold transition-colors hover:border-accent hover:text-accent"
                      >
                        {a.titulo}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 sm:py-16">
        {resultados ? (
          <section aria-live="polite">
            <h2 className="mb-6 font-display text-2xl tracking-wide sm:text-3xl">
              {total === 0 ? "NADA ENCONTRADO" : `${total} RESULTADO${total === 1 ? "" : "S"}`}
            </h2>
            {total === 0 ? (
              <p className="max-w-xl text-sm leading-relaxed text-paper/65">
                Não achamos nada para “{busca.trim()}”. Tente outras palavras ou escreva para{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent underline underline-offset-4">
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            ) : (
              <ul className="flex max-w-3xl flex-col divide-y divide-white/10 border-y border-white/10">
                {resultados.artigos.map((a) => (
                  <li key={a.href + a.titulo}>
                    <Link href={a.href} className="group flex items-center justify-between gap-4 py-4">
                      <span>
                        <span className="block text-sm font-semibold transition-colors group-hover:text-accent">{a.titulo}</span>
                        <span className="mt-1 block text-xs text-paper/50">{a.categoria}</span>
                      </span>
                      <span aria-hidden="true" className="text-accent">→</span>
                    </Link>
                  </li>
                ))}
                {resultados.perguntas.map((p) => (
                  <li key={p.question}>
                    <details className="group py-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                        <span>
                          {p.question}
                          <span className="mt-1 block text-xs font-normal text-paper/50">{p.categoria}</span>
                        </span>
                        <span className="text-accent transition-transform group-open:rotate-45">+</span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-paper/60">{p.answer}</p>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <>
            <section aria-labelledby="duvidas-frequentes">
              <h2 id="duvidas-frequentes" className="mb-8 font-display text-2xl tracking-wide sm:text-3xl">
                DÚVIDAS FREQUENTES
              </h2>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {CATEGORIAS.map((c) => (
                  <li key={c.id}>
                    <a
                      href={`#${c.id}`}
                      className="toque group flex h-full gap-5 border border-white/12 bg-white/[0.03] p-6 transition-colors hover:border-accent"
                    >
                      <span className="text-accent">
                        <Icone tipo={c.icone} />
                      </span>
                      <span>
                        <span className="block text-[15px] font-bold transition-colors group-hover:text-accent">{c.nome}</span>
                        <span className="mt-1.5 block text-xs leading-relaxed text-paper/55">{c.resumo}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <div className="mt-20 grid grid-cols-1 gap-x-16 gap-y-14 md:grid-cols-2">
              {CATEGORIAS.map((c) => (
                <section key={c.id} id={c.id} aria-labelledby={`t-${c.id}`} className="scroll-mt-28">
                  <h2 id={`t-${c.id}`} className="mb-5 font-display text-xl tracking-wide sm:text-2xl">
                    {c.nome.toUpperCase()}
                  </h2>
                  <ul className="flex flex-col gap-3">
                    {c.artigos.map((a) => (
                      <li key={a.href + a.titulo}>
                        <Link
                          href={a.href}
                          className="text-sm text-paper/80 underline decoration-white/25 underline-offset-[5px] transition-colors hover:text-accent hover:decoration-accent"
                        >
                          {a.titulo}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            {faq.length > 0 && (
              <section id="perguntas" className="mt-20 scroll-mt-28">
                <h2 className="mb-8 font-display text-2xl tracking-wide sm:text-3xl">PERGUNTAS FREQUENTES</h2>
                <div className="flex max-w-3xl flex-col gap-10">
                  {faq.map((cat) => (
                    <div key={cat.title}>
                      <h3 className="mb-4 text-sm font-extrabold tracking-[0.06em] text-paper/70">{cat.title.toUpperCase()}</h3>
                      <div className="flex flex-col divide-y divide-white/10 border-y border-white/10">
                        {cat.items.map((item) => (
                          <details key={item.question} className="group py-4">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                              {item.question}
                              <span className="text-accent transition-transform group-open:rotate-45">+</span>
                            </summary>
                            <p className="mt-3 text-sm leading-relaxed text-paper/60">{item.answer}</p>
                          </details>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Contato: só os canais que existem de verdade. */}
        <section aria-labelledby="contato" className="mt-24 border-t border-white/10 pt-16">
          <h2 id="contato" className="font-display text-2xl tracking-wide sm:text-3xl">
            AINDA PRECISA DE AJUDA?
          </h2>
          <p className="mt-3 max-w-xl text-sm text-paper/60">Escolha o canal que for melhor para você.</p>
          <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <li>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="toque group flex h-full flex-col items-start gap-3 border border-white/12 bg-white/[0.03] p-7 transition-colors hover:border-accent"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className="text-accent" aria-hidden="true">
                  <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
                  <path d="m3.5 7 8.5 6.5L20.5 7" />
                </svg>
                <span className="text-base font-bold">Nos envie um e-mail</span>
                <span className="break-all text-sm text-paper/60">{SUPPORT_EMAIL}</span>
                <span className="btn-preenche mt-2 border border-accent px-5 py-2.5 text-[12px] font-bold tracking-[0.14em]">ENVIAR E-MAIL →</span>
              </a>
            </li>
            <li>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="toque group flex h-full flex-col items-start gap-3 border border-white/12 bg-white/[0.03] p-7 transition-colors hover:border-accent"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4.2" />
                  <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
                </svg>
                <span className="text-base font-bold">Chame no Instagram</span>
                <span className="text-sm text-paper/60">{INSTAGRAM_USUARIO}</span>
                <span className="btn-preenche mt-2 border border-accent px-5 py-2.5 text-[12px] font-bold tracking-[0.14em]">ABRIR O INSTAGRAM →</span>
              </a>
            </li>
            <li>
              <Link
                href="/conta/pedidos"
                className="toque group flex h-full flex-col items-start gap-3 border border-white/12 bg-white/[0.03] p-7 transition-colors hover:border-accent"
              >
                <span className="text-accent">
                  <Icone tipo="pedido" />
                </span>
                <span className="text-base font-bold">Acompanhe seu pedido</span>
                <span className="text-sm text-paper/60">Status e código de rastreio, na sua conta.</span>
                <span className="btn-preenche mt-2 border border-accent px-5 py-2.5 text-[12px] font-bold tracking-[0.14em]">MEUS PEDIDOS →</span>
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
