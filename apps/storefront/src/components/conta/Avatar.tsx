/** Foto de perfil, ou as iniciais quando ainda não há foto. */
export function Avatar({
  foto,
  nome,
  tamanho = 56,
}: {
  foto: string | null;
  nome: string;
  tamanho?: number;
}) {
  const iniciais =
    (nome ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "P";

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border border-white/20 bg-white/[0.06]"
      style={{ width: tamanho, height: tamanho }}
    >
      {foto ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URL do próprio cliente
        <img src={foto} alt={`Foto de ${nome}`} className="h-full w-full object-cover" />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center font-display tracking-wide text-paper/70"
          style={{ fontSize: tamanho * 0.36 }}
        >
          {iniciais}
        </span>
      )}
    </div>
  );
}
