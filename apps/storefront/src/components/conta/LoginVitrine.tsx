"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const SLIDES = [
  { src: "/images/hero-praia.jpg", frase: ["DA RUA PRA", "QUEM É DA RUA."] },
  { src: "/images/wab-modelo.jpg", frase: ["PRA QUEM TEM PIQUE.", "PRA QUEM FECHA COM A PIQUE."] },
];

/** Painel de imagem do login: troca de foto a cada 5s, com traços de progresso. */
export function LoginVitrine() {
  const [ativo, setAtivo] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setAtivo((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative hidden overflow-hidden rounded-2xl lg:order-2 lg:block">
      {SLIDES.map((s, i) => (
        <Image
          key={s.src}
          src={s.src}
          alt=""
          fill
          priority={i === 0}
          sizes="40vw"
          className={`object-cover transition-opacity duration-1000 ${i === ativo ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/45" />

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

      <div className="absolute inset-x-0 bottom-0 p-8 text-center">
        <p className="font-display text-[clamp(1.5rem,3.6vh,2.4rem)] leading-tight tracking-wide">
          {SLIDES[ativo].frase.map((l) => (
            <span key={l} className="block">
              {l}
            </span>
          ))}
        </p>
        <div className="mt-6 flex justify-center gap-2" aria-hidden="true">
          {SLIDES.map((_, i) => (
            <span key={i} className={`h-[3px] w-12 rounded-full transition-colors duration-500 ${i === ativo ? "bg-paper" : "bg-white/30"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
