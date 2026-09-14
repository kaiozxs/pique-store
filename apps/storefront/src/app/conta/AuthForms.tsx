"use client";

import { useActionState, useState } from "react";
import { loginAction, registerAction } from "./actions";

const inputClass =
  "border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent";

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);
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

function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, undefined);
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

export function AuthForms() {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <div className="mx-auto max-w-sm">
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
      {tab === "login" ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}
