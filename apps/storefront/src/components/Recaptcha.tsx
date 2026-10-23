"use client";

import { useEffect, useRef } from "react";

type Grecaptcha = {
  render: (el: HTMLElement, opcoes: Record<string, unknown>) => number;
  reset: (id?: number) => void;
};
declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
    __recaptchaPronto?: () => void;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

/** Caixa "Não sou um robô". `resetar` muda quando o servidor recusa, para pedir um desafio novo. */
export function Recaptcha({ onToken, resetar }: { onToken: (token: string | null) => void; resetar: number }) {
  const caixa = useRef<HTMLDivElement>(null);
  const idDoWidget = useRef<number | null>(null);

  useEffect(() => {
    if (!SITE_KEY) return;
    function desenhar() {
      if (!caixa.current || !window.grecaptcha || idDoWidget.current !== null) return;
      idDoWidget.current = window.grecaptcha.render(caixa.current, {
        sitekey: SITE_KEY,
        theme: "dark",
        callback: (t: string) => onToken(t),
        "expired-callback": () => onToken(null),
        "error-callback": () => onToken(null),
      });
    }
    if (window.grecaptcha?.render) {
      desenhar();
    } else {
      window.__recaptchaPronto = desenhar;
      if (!document.getElementById("script-recaptcha")) {
        const s = document.createElement("script");
        s.id = "script-recaptcha";
        s.src = "https://www.google.com/recaptcha/api.js?onload=__recaptchaPronto&render=explicit";
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (resetar > 0 && idDoWidget.current !== null) {
      window.grecaptcha?.reset(idDoWidget.current);
      onToken(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetar]);

  if (!SITE_KEY) return null;
  return <div ref={caixa} className="min-h-[78px]" />;
}
