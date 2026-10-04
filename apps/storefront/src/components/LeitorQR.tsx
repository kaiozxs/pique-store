"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

/** O QR pode trazer só o código ou um endereço que o contém. */
export function extrairCodigo(texto: string): string {
  const t = texto.trim();
  try {
    const url = new URL(t);
    const param = url.searchParams.get("codigo") ?? url.searchParams.get("code");
    if (param) return param.trim();
    const ultimo = url.pathname.split("/").filter(Boolean).pop();
    if (ultimo) return decodeURIComponent(ultimo);
  } catch {
    // não é endereço: vale o texto inteiro
  }
  return t;
}

/**
 * Leitura do QR da etiqueta pela câmera — celular e webcam.
 *
 * A imagem é analisada no próprio aparelho; nada é enviado a lugar nenhum
 * além do código lido, que segue para a mesma verificação do campo digitado.
 */
export function LeitorQR({ aoLer, aoFechar }: { aoLer: (codigo: string) => void; aoFechar: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let fluxo: MediaStream | null = null;
    let ativo = true;
    let raf = 0;
    const canvas = document.createElement("canvas");

    async function iniciar() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErro("Este navegador não permite usar a câmera. Digite o código.");
        return;
      }
      try {
        fluxo = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
      } catch (e) {
        const negado = e instanceof DOMException && e.name === "NotAllowedError";
        setErro(
          negado
            ? "Permissão da câmera negada. Libere o acesso no navegador ou digite o código."
            : "Não encontrei uma câmera disponível. Digite o código."
        );
        return;
      }
      if (!ativo || !video.current) {
        fluxo.getTracks().forEach((t) => t.stop());
        return;
      }
      video.current.srcObject = fluxo;
      await video.current.play().catch(() => {});

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      let ultimo = 0;
      const ler = (agora: number) => {
        raf = requestAnimationFrame(ler);
        const v = video.current;
        if (!ctx || !v || v.readyState < 2 || agora - ultimo < 120) return;
        ultimo = agora;
        canvas.width = v.videoWidth;
        canvas.height = v.videoHeight;
        ctx.drawImage(v, 0, 0);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const r = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
        if (r?.data) {
          cancelAnimationFrame(raf);
          aoLer(extrairCodigo(r.data));
        }
      };
      raf = requestAnimationFrame(ler);
    }
    iniciar();

    return () => {
      ativo = false;
      cancelAnimationFrame(raf);
      fluxo?.getTracks().forEach((t) => t.stop());
    };
  }, [aoLer]);

  return (
    <div className="mt-4 border border-white/15 p-3">
      {erro ? (
        <p role="alert" className="p-3 text-sm text-accent">
          {erro}
        </p>
      ) : (
        <div className="relative overflow-hidden bg-black">
          <video ref={video} playsInline muted className="aspect-[4/3] w-full object-cover" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-[18%] border-2 border-accent/80" />
        </div>
      )}
      <div className="mt-3 flex items-center justify-between gap-4 text-[12px]">
        <span className="text-paper/50">{erro ? "" : "Aponte para o QR da etiqueta."}</span>
        <button type="button" onClick={aoFechar} className="font-bold tracking-[0.1em] text-paper/70 hover:text-paper">
          FECHAR CÂMERA
        </button>
      </div>
    </div>
  );
}
