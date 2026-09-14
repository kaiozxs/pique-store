import { listTipPosts } from "@/lib/dicas";
import { DicasClient } from "./DicasClient";

export default async function DicasPage() {
  const posts = await listTipPosts();
  return <DicasClient initial={posts} />;
}
