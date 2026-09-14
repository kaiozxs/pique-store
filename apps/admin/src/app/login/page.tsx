import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="text-lg font-bold tracking-tight text-ink">PIQUE</div>
          <div className="text-sm text-muted">Painel administrativo</div>
        </div>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
