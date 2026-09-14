import { listFaqItems } from "@/lib/faq";
import { FaqClient } from "./FaqClient";

export default async function FaqPage() {
  const items = await listFaqItems();
  return <FaqClient initial={items} />;
}
