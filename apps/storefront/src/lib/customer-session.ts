import "server-only";
import { cookies } from "next/headers";

const CUSTOMER_TOKEN_COOKIE = "piquestore_customer_session";

export async function getCustomerToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(CUSTOMER_TOKEN_COOKIE)?.value ?? null;
}

export async function setCustomerToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(CUSTOMER_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCustomerToken(): Promise<void> {
  const store = await cookies();
  store.delete(CUSTOMER_TOKEN_COOKIE);
}
