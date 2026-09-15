import { getBookContent } from "@/lib/book";
import { BookForm } from "./BookForm";

export default async function BookPage() {
  const content = await getBookContent();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl uppercase tracking-tight text-ink">Book</h1>
      <BookForm initial={content} />
    </div>
  );
}
