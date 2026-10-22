import "server-only";
import { db, salesMetrics, type SalesMetrics } from "@pique/db";
import { exigirDono } from "./auth";

export type DashboardPeriod = "1d" | "7d" | "30d";
export type DashboardMetrics = SalesMetrics;
export type DashboardRangeQuery = { period: DashboardPeriod } | { start_date: string; end_date: string };

const DIAS: Record<DashboardPeriod, number> = { "1d": 1, "7d": 7, "30d": 30 };

/** Dia de hoje no fuso de São Paulo, como "YYYY-MM-DD". */
function hojeSP(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

function somarDias(dia: string, n: number): string {
  const d = new Date(`${dia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export async function getDashboardMetrics(range: DashboardRangeQuery): Promise<DashboardMetrics> {
  await exigirDono();
  const fim = "period" in range ? hojeSP() : range.end_date;
  const inicio = "period" in range ? somarDias(fim, -(DIAS[range.period] - 1)) : range.start_date;
  return salesMetrics(db(), { from: inicio, to: fim });
}
