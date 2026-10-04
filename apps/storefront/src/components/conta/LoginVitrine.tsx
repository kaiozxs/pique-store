"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// Fotos em retrato (1024×1536) e a da WAB, enquadrada no rosto. `foco` é o
// ponto da foto que fica no centro do painel quando ela é cortada.
const SLIDES = [
  { src: "/images/login-wab.jpg", foco: "62% 40%", frase: ["PRA QUEM", "TEM PIQUE."] },
  { src: "/images/login-rua.jpg", foco: "50% 30%", frase: ["DA RUA PRA", "QUEM É DA RUA."] },
  { src: "/images/login-rio.jpg", foco: "50% 35%", frase: ["O PADRÃO É", "INCOMPARÁVEL."] },
];
const TEMPO = 5000;

/** Painel de fotos do login: três cenas em sequência, com traço de progresso. */
export function LoginVitrine() {
  const [ativo, setAtivo] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setAtivo((i) => (i + 1) % SLIDES.length), TEMPO);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative hidden overflow-hidden rounded-2xl bg-black lg:order-2 lg:block">
      {SLIDES.map((s, i) => (
        <div
          key={s.src}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === ativo ? "opacity-100" : "opacity-0"}`}
        >
          {/* Só a foto ativa anima, e a chave recomeça o movimento a cada volta. */}
          <div key={i === ativo ? `a-${ativo}` : `p-${i}`} className={i === ativo ? "login-zoom absolute inset-0" : "absolute inset-0"}>
            <Image
              src={s.src}
              alt=""
              fill
              priority={i === 0}
              quality={90}
              sizes="(min-width: 1024px) 560px, 0px"
              className="object-cover"
              style={{ objectPosition: s.foco }}
            />
          </div>
        </div>
      ))}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/50" />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-6">
        <Link href="/" aria-label="PIQUE, ir para a home">
          <Image src="/images/logo-horizontal.png" alt="PIQUE" width={96} height={40} className="h-10 w-auto" />
        </Link>
        <Link
          href="/"
          className="rounded-full bg-white/15 px-4 py-2 text-[12px] font-semibold tracking-[0.06em] backdrop-blur transition-colors hover:bg-white/25"
        >
          Voltar à loja →
        </Link>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-8">
        <p key={ativo} className="hero-sobe font-display text-[clamp(2rem,4.4vh,3.2rem)] leading-[1.02] tracking-wide">
          {SLIDES[ativo].frase.map((l, i) => (
            <span key={l} className={`block ${i === 1 ? "text-accent" : ""}`}>
              {l}
            </span>
          ))}
        </p>
        <div className="mt-7 flex items-center gap-2" aria-hidden="true">
          {SLIDES.map((_, i) => (
            <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
              {i < ativo && <span className="block h-full bg-paper" />}
              {i === ativo && <span key={ativo} className="login-traco block h-full bg-paper" />}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
