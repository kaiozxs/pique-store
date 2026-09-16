"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction, registerAction } from "./actions";
import { startGoogleLogin } from "@/lib/google-auth";

const inputClass =
  "border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent";

function GoogleButton({ postLoginRedirect }: { postLoginRedirect: string }) {
  const [isPending, setIsPending] = useState(false);

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        setIsPending(true);
        startGoogleLogin(postLoginRedirect);
      }}
      className="flex items-center justify-center gap-3 border border-white/25 bg-transparent px-8 py-3 text-[13px] font-bold tracking-[0.08em] text-paper transition-colors hover:border-white/50 disabled:opacity-60"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.07 7.94-2.91l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.1A12 12 0 0 0 12 24Z"
        />
        <path fill="#FBBC05" d="M5.29 14.3A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.57.38-2.3V6.6H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.4Z" />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.6l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75Z"
        />
      </svg>
      {isPending ? "REDIRECIONANDO..." : "CONTINUAR COM O GOOGLE"}
    </button>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  useEffect(() => {
    if (state?.ok) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="email" name="email" placeholder="E-mail" required className={inputClass} />
      <input type="password" name="password" placeholder="Senha" required className={inputClass} />
      {state?.error && <p className="text-sm font-semibold text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="mt-2 border border-accent bg-accent px-8 py-3 text-[13px] font-bold tracking-[0.14em] text-paper transition-colors hover:bg-paper hover:text-ink disabled:opacity-60"
      >
        {isPending ? "ENTRANDO..." : "ENTRAR"}
      </button>
    </form>
  );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction, isPending] = useActionState(registerAction, undefined);

  useEffect(() => {
    if (state?.ok) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <input name="first_name" placeholder="Nome" required className={inputClass} />
        <input name="last_name" placeholder="Sobrenome" required className={inputClass} />
      </div>
      <input type="email" name="email" placeholder="E-mail" required className={inputClass} />
      <input type="password" name="password" placeholder="Senha" required minLength={8} className={inputClass} />
      {state?.error && <p className="text-sm font-semibold text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="mt-2 border border-accent bg-accent px-8 py-3 text-[13px] font-bold tracking-[0.14em] text-paper transition-colors hover:bg-paper hover:text-ink disabled:opacity-60"
      >
        {isPending ? "CRIANDO..." : "CRIAR CONTA"}
      </button>
    </form>
  );
}

export function AuthForms({
  onSuccess,
  postLoginRedirect = "/conta",
}: {
  // Sem onSuccess (uso padrão em /conta): recarrega a própria página, que já
  // troca sozinha pra tela de conta logada. Com onSuccess (uso dentro do
  // checkout): quem chamou decide o que fazer, sem sair da página.
  onSuccess?: () => void;
  postLoginRedirect?: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const handleSuccess = onSuccess ?? (() => router.refresh());

  return (
    <div className="mx-auto max-w-sm">
      <GoogleButton postLoginRedirect={postLoginRedirect} />

      <div className="my-6 flex items-center gap-3 text-[11px] font-semibold tracking-[0.1em] text-paper/40">
        <div className="h-px flex-1 bg-white/15" />
        OU
        <div className="h-px flex-1 bg-white/15" />
      </div>

      <div className="mb-8 flex gap-6 text-[12px] font-semibold tracking-[0.1em]">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={tab === "login" ? "text-accent" : "text-paper/40"}
        >
          ENTRAR
        </button>
        <button
          type="button"
          onClick={() => setTab("register")}
          className={tab === "register" ? "text-accent" : "text-paper/40"}
        >
          CRIAR CONTA
        </button>
      </div>
      {tab === "login" ? <LoginForm onSuccess={handleSuccess} /> : <RegisterForm onSuccess={handleSuccess} />}
    </div>
  );
}
