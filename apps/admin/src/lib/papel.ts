export type Papel = "dono" | "lojista";

// O que cada papel enxerga. O lojista fica de fora da parte financeira
// (faturamento do dashboard) e da gestão de acessos.
const SO_DONO = new Set(["/", "/acessos"]);

export function podeAcessar(papel: Papel, rota: string): boolean {
  return papel === "dono" || !SO_DONO.has(rota);
}
