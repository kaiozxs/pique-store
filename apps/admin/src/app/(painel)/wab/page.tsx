import { getWabContent } from "@/lib/wab";
import { WabForm } from "./WabForm";

export default async function WabPage() {
  const content = await getWabContent();

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-ink">WAB</h1>
      <WabForm initial={content} />
    </div>
  );
}
