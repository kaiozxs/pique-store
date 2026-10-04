/**
 * Consentimento de cookies (LGPD / orientação da ANPD).
 *
 * Quatro categorias. As essenciais (login, sacola, segurança) não dependem de
 * consentimento e não aparecem como opção — são necessárias ao serviço. As
 * demais só gravam algo depois de um "sim" explícito; antes de qualquer
 * escolha o padrão é não gravar. A escolha em si vale por 180 dias.
 */
export type Consentimento = {
  preferencias: boolean;
  analise: boolean;
  marketing: boolean;
};

export const COOKIE_CONSENTIMENTO = "piquestore_consent";
export const COOKIE_PREFERENCIAS = "piquestore_prefs";
const SEIS_MESES = 60 * 60 * 24 * 180;

function lerCookie(nome: string): string | null {
  if (typeof document === "undefined") return null;
  const par = document.cookie.split("; ").find((c) => c.startsWith(`${nome}=`));
  return par ? decodeURIComponent(par.slice(nome.length + 1)) : null;
}

function gravarCookie(nome: string, valor: string, segundos: number) {
  const seguro = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${nome}=${encodeURIComponent(valor)}; Path=/; Max-Age=${segundos}; SameSite=Lax${seguro}`;
}

export function lerConsentimento(): Consentimento | null {
  try {
    const bruto = lerCookie(COOKIE_CONSENTIMENTO);
    if (!bruto) return null;
    const c = JSON.parse(bruto);
    return { preferencias: !!c.preferencias, analise: !!c.analise, marketing: !!c.marketing };
  } catch {
    return null;
  }
}

export function salvarConsentimento(c: Consentimento) {
  gravarCookie(COOKIE_CONSENTIMENTO, JSON.stringify(c), SEIS_MESES);
  // Retirar o consentimento apaga o que já foi guardado nessa categoria.
  if (!c.preferencias) gravarCookie(COOKIE_PREFERENCIAS, "", 0);
  window.dispatchEvent(new Event("piquestore:consent"));
}

/** Grava as preferências de navegação só se a pessoa permitiu. */
export function salvarPreferencias(prefs: { categoria?: string; ordem?: string }) {
  if (!lerConsentimento()?.preferencias) return;
  gravarCookie(COOKIE_PREFERENCIAS, JSON.stringify(prefs), 60 * 60 * 24 * 90);
}
