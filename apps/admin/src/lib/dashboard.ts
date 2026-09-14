import "server-only";
import { sdk } from "./sdk";
import { authHeaders } from "./session";

export type DashboardPeriod = "7d" | "30d" | "90d";

export type DashboardMetrics = {
  period: DashboardPeriod;
  currency_code: string;
  total_revenue: number;
  order_count: number;
  average_order_value: number;
  revenue_by_day: { date: string; total: number }[];
};

export async function getDashboardMetrics(period: DashboardPeriod = "30d"): Promise<DashboardMetrics> {
  const headers = await authHeaders();
  return sdk.client.fetch<DashboardMetrics>("/admin/dashboard-metrics", {
    query: { period },
    headers,
    cache: "no-store",
  });
}
