import "server-only";

/** O reCAPTCHA só liga quando as duas chaves existem; sem elas, o cadastro funciona como antes. */
export function recaptchaLigado(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && process.env.RECAPTCHA_SECRET_KEY);
}

/** Pergunta ao Google se o desafio resolvido no navegador é de verdade. */
export async function recaptchaValido(token: string | null | undefined): Promise<boolean> {
  if (!recaptchaLigado()) return true;
  if (!token) return false;
  try {
    const resposta = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET_KEY!, response: token }),
      signal: AbortSignal.timeout(8000),
    });
    const dados = (await resposta.json()) as { success?: boolean };
    return dados.success === true;
  } catch {
    // Google fora do ar: melhor barrar um cadastro do que deixar a porta aberta.
    return false;
  }
}
