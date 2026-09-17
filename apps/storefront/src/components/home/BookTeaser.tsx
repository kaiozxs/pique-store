import { getBookContent } from "@/lib/medusa";

export async function BookTeaser() {
  const book = await getBookContent();
  const revelado = book.status === "revelado";

  return (
    <section id="book" className="bg-paper text-ink">
      <div className="mx-auto max-w-7xl px-6 py-24 text-center sm:px-8 sm:py-32">
        <div className="mb-6 font-accent text-xl italic text-accent">
          {revelado ? "revelado" : "em construção"}
        </div>
        <h2 className="font-display text-4xl tracking-wide sm:text-6xl">
          {revelado && book.title ? book.title : "WAB"}
        </h2>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-ink/60">
          {revelado && book.body ? book.body : "Alguma coisa está sendo desenhada. Quando estiver pronta, você vai saber."}
        </p>
      </div>
    </section>
  );
}
