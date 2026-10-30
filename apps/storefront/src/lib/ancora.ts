/** "2. Direito de arrependimento em compras online" → "direito-de-arrependimento-em-compras-online" */
export function ancora(titulo: string): string {
  return titulo
    .replace(/^\d+\.\s*/, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
