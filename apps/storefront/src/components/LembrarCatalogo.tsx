"use client";

import { useEffect } from "react";
import { salvarPreferencias } from "@/lib/consent";

/** Guarda a categoria e a ordenação escolhidas, se a pessoa permitiu. */
export function LembrarCatalogo({ categoria, ordem }: { categoria?: string; ordem?: string }) {
  useEffect(() => {
    salvarPreferencias({ categoria, ordem });
    const reaplicar = () => salvarPreferencias({ categoria, ordem });
    window.addEventListener("piquestore:consent", reaplicar);
    return () => window.removeEventListener("piquestore:consent", reaplicar);
  }, [categoria, ordem]);
  return null;
}
