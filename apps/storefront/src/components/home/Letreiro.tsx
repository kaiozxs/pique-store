const FRASES = [
  "DA RUA PRA QUEM É DA RUA",
  "DROP 001",
  "PRA QUEM TEM PIQUE",
  "PARCELE EM ATÉ 12X",
  "PRA QUEM FECHA COM A PIQUE",
  "PEÇAS COM CÓDIGO DE AUTENTICIDADE",
];

/**
 * Faixa vermelha de letreiro, entre a abertura e as peças.
 *
 * É o recurso mais reconhecível do streetwear: corta a página com uma linha
 * de energia e carrega as frases da marca sem ocupar um bloco inteiro. O
 * conteúdo é repetido duas vezes e a faixa anda metade da largura, o que
 * fecha o laço sem emenda visível.
 */
export function Letreiro() {
  const linha = FRASES.flatMap((f) => [f, "✦"]);
  return (
    <div
      aria-hidden="true"
      className="faixa-letreiro-caixa overflow-hidden border-y border-black/30 bg-accent py-3 text-paper"
    >
      <div className="faixa-letreiro flex w-max gap-8 whitespace-nowrap font-display text-[15px] tracking-[0.14em] sm:text-lg">
        {[0, 1].map((copia) => (
          <div key={copia} className="flex gap-8">
            {linha.map((t, i) => (
              <span key={i} className={t === "✦" ? "text-black/55" : ""}>
                {t}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
