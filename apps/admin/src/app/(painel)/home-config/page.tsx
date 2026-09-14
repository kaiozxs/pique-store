import { getHomeSections } from "@/lib/home-config";
import { HomeConfigForm } from "./HomeConfigForm";

export default async function HomeConfigPage() {
  const sections = await getHomeSections();

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-ink">Home Configurável</h1>
      <HomeConfigForm initial={sections} />
    </div>
  );
}
