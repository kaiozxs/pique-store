import Image from "next/image";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm border border-border bg-surface p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        <div className="mb-8 text-center">
          <Image
            src="/logo.png"
            alt="PIQUE"
            width={96}
            height={73}
            style={{ height: "auto" }}
            className="mx-auto mb-3"
            priority
          />
          <div className="text-sm text-muted">Painel administrativo</div>
        </div>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
