type Tip = {
  title: string;
  excerpt: string;
};

// Dados de exemplo — no site real isso vem do módulo "Dicas" do painel admin.
const TIPS: Tip[] = [
  {
    title: "Como cuidar do seu moletom premium",
    excerpt: "Lavagem, secagem e o que evitar para manter o acabamento por mais tempo.",
  },
  {
    title: "Guia de tamanhos PIQUE",
    excerpt: "Como usar a tabela de medidas para escolher o caimento certo.",
  },
  {
    title: "Por trás do Drop 001",
    excerpt: "A ideia, os materiais e o processo que viraram a primeira coleção.",
  },
];

export function DicasDestaque() {
  return (
    <section id="dicas" className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32">
        <div className="mb-14 text-[13px] font-semibold tracking-[0.28em] text-paper/55">DICAS</div>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {TIPS.map((tip) => (
            <article key={tip.title}>
              <div className="mb-5 aspect-video border border-dashed border-white/20 bg-[#161617]" />
              <h3 className="text-base font-bold leading-snug">{tip.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper/55">{tip.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
