"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoFocus
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-ink">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
