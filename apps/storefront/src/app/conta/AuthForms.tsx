"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAction, registerAction } from "./actions";
import { startGoogleLogin } from "@/lib/google-auth";

const inputClass =
  "border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent";

// Mesma regra cobrada no servidor (registerAction) — mantém as duas em sync
// manualmente já que são arquivos "use client"/"use server" separados.
const STRONG_PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M6.5 6.7C3.9 8.3 2 12 2 12s4 7 11 7c2 0 3.7-.55 5.1-1.35M9.9 5.2A10.7 10.7 0 0 1 12 5c7 0 11 7 11 7a15.6 15.6 0 0 1-3.1 3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PasswordField({
  name,
  placeholder,
  value,
  onChange,
  minLength,
  hasError,
}: {
  name: string;
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
  minLength?: number;
  hasError?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={`flex items-center border bg-transparent focus-within:border-accent ${
        hasError ? "border-red-400" : "border-white/20"
      }`}
    >
      <input
        type={visible ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        required
        minLength={minLength}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="flex-1 bg-transparent px-4 py-3 text-sm outline-none"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Esconder senha" : "Mostrar senha"}
        className="px-3 text-paper/45 transition-colors hover:text-paper"
      >
        <EyeIcon open={visible} />
      </button>
    </div>
  );
}

function GoogleButton({ postLoginRedirect }: { postLoginRedirect: string }) {
  const [isPending, setIsPending] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Em caso de falha o botão precisa voltar ao normal e dizer o que houve.
  // Antes ele ficava preso em "REDIRECIONANDO..." pra sempre, porque a
  // promessa rejeitava sem ninguém ouvir e o estado nunca era desfeito.
  async function entrar() {
    setErro(null);
    setIsPending(true);
    try {
      await startGoogleLogin(postLoginRedirect);
      // Deu certo: o navegador está saindo desta página. O estado continua
      // travado de propósito, pra não piscar "entrar" durante a saída.
    } catch (e) {
      setIsPending(false);
      setErro(
        e instanceof Error && e.message
          ? `Não deu pra entrar com o Google: ${e.message}`
          : "Não deu pra entrar com o Google. Tenta de novo ou usa e-mail e senha."
      );
    }
  }

  return (
    <>
      {erro && <p className="mb-3 text-sm font-semibold text-red-400">{erro}</p>}
    <button
      type="button"
      disabled={isPending}
      onClick={entrar}
      className="flex w-full items-center justify-center gap-3 border border-white/25 bg-transparent px-8 py-3 text-[13px] font-bold tracking-[0.08em] text-paper transition-colors hover:border-white/50 disabled:opacity-60"
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
    </>
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
      <PasswordField name="password" placeholder="Senha" />
      <Link
        href="/conta/senha"
        className="-mt-1 self-end text-[12px] text-paper/45 underline underline-offset-4 transition-colors hover:text-accent"
      >
        Esqueceu a senha?
      </Link>
      {state?.error && <p className="text-sm font-semibold text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="btn-preenche mt-2 border border-accent px-8 py-3 text-[13px] font-bold tracking-[0.14em] disabled:opacity-60"
      >
        {isPending ? "ENTRANDO..." : "ENTRAR"}
      </button>
    </form>
  );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction, isPending] = useActionState(registerAction, undefined);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    if (state?.ok) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!STRONG_PASSWORD_RE.test(password)) {
      e.preventDefault();
      setClientError("A senha precisa ter pelo menos 8 caracteres, com letra maiúscula, minúscula e número.");
      return;
    }
    if (password !== confirmPassword) {
      e.preventDefault();
      setClientError("As senhas não coincidem.");
      return;
    }
    setClientError(null);
  }

  const error = clientError ?? state?.error;

  return (
    <form action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <input name="first_name" placeholder="Nome" required className={inputClass} />
        <input name="last_name" placeholder="Sobrenome" required className={inputClass} />
      </div>
      <input type="email" name="email" placeholder="E-mail" required className={inputClass} />
      <PasswordField
        name="password"
        placeholder="Senha"
        value={password}
        onChange={(v) => {
          setPassword(v);
          setClientError(null);
        }}
        minLength={8}
        hasError={!!clientError}
      />
      <p className="text-xs text-paper/45">Mínimo 8 caracteres, com letra maiúscula, minúscula e número.</p>
      <PasswordField
        name="password_confirmation"
        placeholder="Confirme a senha"
        value={confirmPassword}
        onChange={(v) => {
          setConfirmPassword(v);
          setClientError(null);
        }}
        hasError={!!clientError}
      />
      {error && <p className="text-sm font-semibold text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="btn-preenche mt-2 border border-accent px-8 py-3 text-[13px] font-bold tracking-[0.14em] disabled:opacity-60"
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
      {/* As abas não pareciam clicáveis: eram só duas palavras, uma vermelha e
          outra apagada. O saltinho no hover e o traço embaixo da ativa dizem
          onde dá pra clicar sem precisar escrever nada. */}
      <div className="mb-8 flex gap-6 text-[12px] font-semibold tracking-[0.1em]">
        {(
          [
            ["login", "ENTRAR"],
            ["register", "CRIAR CONTA"],
          ] as const
        ).map(([chave, rotulo]) => (
          <button
            key={chave}
            type="button"
            onClick={() => setTab(chave)}
            aria-pressed={tab === chave}
            className={`relative pb-1.5 transition-all duration-200 ease-out hover:-translate-y-0.5 ${
              tab === chave ? "text-accent" : "text-paper/40 hover:text-paper/75"
            }`}
          >
            {rotulo}
            <span
              aria-hidden="true"
              className={`absolute bottom-0 left-0 h-px w-full origin-left bg-accent transition-transform duration-200 ease-out ${
                tab === chave ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </button>
        ))}
      </div>
      {tab === "login" ? <LoginForm onSuccess={handleSuccess} /> : <RegisterForm onSuccess={handleSuccess} />}

      <div className="my-6 flex items-center gap-3 text-[11px] font-semibold tracking-[0.1em] text-paper/40">
        <div className="h-px flex-1 bg-white/15" />
        OU
        <div className="h-px flex-1 bg-white/15" />
      </div>

      <GoogleButton postLoginRedirect={postLoginRedirect} />
    </div>
  );
}