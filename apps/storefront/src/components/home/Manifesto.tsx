const FRASE =
  "Elegância minimalista e vanguarda das ruas. Cada peça carrega o mesmo padrão — e o padrão é incomparável.";

/**
 * Frase de posicionamento em letra grande, que acende palavra por palavra
 * enquanto a pessoa rola. Dá à página um respiro de marca entre as peças e as
 * coleções, sem pedir clique nenhum.
 */
export function Manifesto() {
  const palavras = FRASE.split(" ");
  return (
    <section className="bg-ink text-paper">
      <div className="mx-auto max-w-5xl px-6 py-20 sm:px-8 sm:py-28 lg:py-32">
        <div className="mb-6 text-[13px] font-semibold tracking-[0.28em] text-accent">A PIQUE</div>
        <p className="font-display text-[clamp(1.9rem,4.6vw,3.6rem)] leading-[1.12] tracking-wide">
          {palavras.map((p, i) => (
            <span key={i} className="manifesto-palavra" style={{ ["--i" as string]: i }}>
              {p}{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
