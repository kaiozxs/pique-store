"use client";

import { useRef, useState, useTransition } from "react";
import { Avatar } from "@/components/conta/Avatar";
import { updatePhotoAction } from "./actions";

const LADO = 256;

/** Recorta o centro em quadrado e reduz: a foto vira ~20 KB e cabe no banco. */
async function prepararFoto(arquivo: File): Promise<string> {
  const bitmap = await createImageBitmap(arquivo);
  const lado = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = LADO;
  canvas.height = LADO;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, (bitmap.width - lado) / 2, (bitmap.height - lado) / 2, lado, lado, 0, 0, LADO, LADO);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function PerfilIdentidade({
  foto,
  nome,
  id,
  email,
}: {
  foto: string | null;
  nome: string;
  id: string;
  email: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [previa, setPrevia] = useState<string | null>(foto);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  async function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    setErro(null);
    if (!arquivo.type.startsWith("image/")) return setErro("Escolha um arquivo de imagem.");
    try {
      const url = await prepararFoto(arquivo);
      setPrevia(url);
      iniciar(async () => {
        try {
          await updatePhotoAction(url);
        } catch {
          setPrevia(foto);
          setErro("Não deu pra salvar a foto agora. Tenta de novo.");
        }
      });
    } catch {
      setErro("Não consegui ler essa imagem. Tenta outra.");
    }
  }

  function remover() {
    setErro(null);
    setPrevia(null);
    iniciar(async () => {
      try {
        await updatePhotoAction(null);
      } catch {
        setPrevia(foto);
        setErro("Não deu pra remover agora.");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-6 border border-white/12 p-6">
      <div className={pendente ? "opacity-60" : ""}>
        <Avatar foto={previa} nome={nome} tamanho={96} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-2xl tracking-wide">{nome.toUpperCase()}</div>
        <div className="mt-1 truncate text-sm text-paper/55">{email}</div>
        <div className="mt-3 inline-block border border-white/20 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-paper/70">
          ID {id}
        </div>
      </div>
      <div className="flex flex-col gap-2 text-[12px] font-bold tracking-[0.1em]">
        <input ref={input} type="file" accept="image/*" onChange={escolher} className="sr-only" aria-label="Enviar foto de perfil" />
        <button type="button" onClick={() => input.current?.click()} disabled={pendente} className="toque border border-white/30 px-4 py-2.5 hover:border-white disabled:opacity-50">
          {previa ? "TROCAR FOTO" : "ADICIONAR FOTO"}
        </button>
        {previa && (
          <button type="button" onClick={remover} disabled={pendente} className="px-4 py-1 text-paper/50 hover:text-accent">
            REMOVER
          </button>
        )}
      </div>
      {erro && (
        <p role="alert" className="w-full text-[12px] text-red-400">
          {erro}
        </p>
      )}
    </div>
  );
}
