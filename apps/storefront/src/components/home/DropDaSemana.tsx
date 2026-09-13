import Link from "next/link";

type DropItem = {
  name: string;
  category: string;
  badge?: string;
};

// Dados de exemplo — no site real isso vem do módulo "Drop da Semana" do painel admin.
const ITEMS: DropItem[] = [
  { name: "MOLETOM STRUCTURAL", category: "Moletom", badge: "EDIÇÃO LIMITADA" },
  { name: "JAQUETA IMPULSO", category: "Jaqueta" },
  { name: "CAMISETA PADRÃO", category: "Camiseta" },
  { name: "CALÇA INCOMPARÁVEL", category: "Calça" },
];

export function DropDaSemana() {
  return (
    <section id="drop" className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-4 text-[13px] font-semibold tracking-[0.28em] text-paper/55">
              PRIMEIRA COLEÇÃO
            </div>
            <h2 className="font-display text-3xl tracking-tight sm:text-5xl">DROP DA SEMANA</h2>
          </div>
          <div className="max-w-[260px] text-right text-xs uppercase tracking-[0.08em] text-paper/55">
            peças ilustrativas — imagens e nomes finais em produção
          </div>
        </div>

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item) => (
            <div key={item.name}>
              <div className="relative flex aspect-[3/4] flex-col items-center justify-center gap-3.5 border border-dashed border-white/20 bg-[#161617]">
                {item.badge && (
                  <div className="absolute left-3.5 top-3.5 bg-accent px-2.5 py-1 text-[10px] font-bold tracking-[0.1em]">
                    {item.badge}
                  </div>
                )}
                <svg
                  width="52"
                  height="52"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="text-paper/35"
                >
                  <path
                    d="M4 7.2 L8.2 4 L10 5.6 L14 5.6 L15.8 4 L20 7.2 L17.8 10.4 L16 9.3 L16 20 L8 20 L8 9.3 L6.2 10.4 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.1"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-[11px] tracking-[0.08em] text-paper/50">[FOTO DO PRODUTO]</div>
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-3">
                <div>
                  <div className="text-[15px] font-bold">{item.name}</div>
                  <div className="mt-1 text-xs text-paper/45">{item.category}</div>
                </div>
                <div className="whitespace-nowrap text-sm font-semibold">[R$ —]</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Link
            href="/drops"
            className="border border-white/35 px-10 py-[18px] text-[13px] font-bold tracking-[0.14em] transition-colors hover:border-accent hover:text-accent"
          >
            VER COLEÇÃO COMPLETA
          </Link>
        </div>
      </div>
    </section>
  );
}
