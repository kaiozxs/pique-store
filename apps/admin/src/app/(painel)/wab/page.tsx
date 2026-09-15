import { getWabContent } from "@/lib/wab";
import { WabForm } from "./WabForm";

export default async function WabPage() {
  const content = await getWabContent();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl uppercase tracking-tight text-ink">WAB</h1>
      <WabForm initial={content} />
    </div>
  );
}
