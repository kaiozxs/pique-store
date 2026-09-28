"use server";

import { revalidatePath } from "next/cache";
import { saveTrackingCode } from "@/lib/orders";

export async function saveTrackingCodeAction(orderId: string, codigo: string) {
  await saveTrackingCode(orderId, codigo);
  revalidatePath(`/pedidos/${orderId}`);
}
