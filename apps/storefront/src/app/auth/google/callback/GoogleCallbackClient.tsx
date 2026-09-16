"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { completeGoogleLoginAction } from "@/app/conta/actions";
import { getPostGoogleLoginRedirect } from "@/lib/google-auth";

export function GoogleCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const oauthError = searchParams.get("error");

    if (oauthError) {
      setError("Login com o Google cancelado.");
      return;
    }
    if (!code || !state) {
      setError("Faltam dados do Google pra concluir o login.");
      return;
    }

    completeGoogleLoginAction({ code, state }).then((result) => {
      if (!result.ok) {
        setError(result.error ?? "Não foi possível entrar com o Google.");
        return;
      }
      router.push(getPostGoogleLoginRedirect());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-ink px-6 text-center text-paper">
      {error ? (
        <>
          <p className="mb-6 text-sm font-semibold text-red-400">{error}</p>
          <Link
            href="/conta"
            className="border border-accent bg-accent px-8 py-4 text-[13px] font-bold tracking-[0.14em] transition-colors hover:bg-paper hover:text-ink"
          >
            VOLTAR PRA CONTA
          </Link>
        </>
      ) : (
        <p className="text-sm text-paper/60">Entrando com o Google...</p>
      )}
    </div>
  );
}
