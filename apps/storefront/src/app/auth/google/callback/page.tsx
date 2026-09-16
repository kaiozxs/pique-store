import type { Metadata } from "next";
import { Suspense } from "react";
import { GoogleCallbackClient } from "./GoogleCallbackClient";

export const metadata: Metadata = { title: "Entrando... — PIQUE" };

export default function GoogleCallbackPage() {
  return (
    <Suspense>
      <GoogleCallbackClient />
    </Suspense>
  );
}
