import "server-only";
import { sdk } from "./sdk";

// Quem entra pelo login da loja não tem usuário admin no Medusa. O painel
// fala com o backend usando uma conta de serviço (ADMIN_SERVICE_EMAIL/
// ADMIN_SERVICE_PASSWORD, só no servidor) e é o painel que decide, pelo papel
// da pessoa, o que ela pode ver e fazer.
let cache: { token: string; ate: number } | null = null;

export async function tokenDeServico(): Promise<string | null> {
  if (cache && cache.ate > Date.now()) return cache.token;

  const email = process.env.ADMIN_SERVICE_EMAIL;
  const senha = process.env.ADMIN_SERVICE_PASSWORD;
  if (!email || !senha) return null;

  try {
    const token = await sdk.auth.login("user", "emailpass", { email, password: senha });
    if (typeof token !== "string") return null;
    // O JWT vale 24h; renova com folga.
    cache = { token, ate: Date.now() + 20 * 60 * 60 * 1000 };
    return token;
  } catch {
    return null;
  }
}
