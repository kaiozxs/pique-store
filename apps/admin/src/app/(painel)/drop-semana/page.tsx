import { getDropWeek } from "@/lib/drop-semana";
import { DropSemanaForm } from "./DropSemanaForm";

export default async function DropSemanaPage() {
  const { drop_week, items } = await getDropWeek();

  const initialItems = items
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((item) => item.product)
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl uppercase tracking-tight text-ink">Drop da Semana</h1>
      <DropSemanaForm
        initialTitle={drop_week?.title ?? ""}
        initialStatus={(drop_week?.status as "draft" | "published") ?? "draft"}
        initialItems={initialItems}
      />
    </div>
  );
}
