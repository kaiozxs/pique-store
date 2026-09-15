import { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

// Limitador simples em memória (por processo) — suficiente pra segurar
// scraping/abuso básico em rotas públicas sem estado (ex: consulta de
// autenticidade). Não substitui um rate limit de verdade (ex: no proxy/CDN)
// numa implantação com múltiplas instâncias, onde cada processo teria sua
// própria janela.
export function rateLimit({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>()

  return (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    const key = req.ip ?? "unknown"
    const now = Date.now()
    const entry = hits.get(key)

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    if (entry.count >= max) {
      res.status(429).json({ message: "Muitas requisições. Tente novamente em instantes." })
      return
    }

    entry.count += 1
    next()
  }
}
