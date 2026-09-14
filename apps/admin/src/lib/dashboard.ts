import "server-only";
import { sdk } from "./sdk";
import { authHeaders } from "./session";

export type DashboardPeriod = "1d" | "7d" | "30d";

export type DashboardMetrics = {
  start_date: string;
  end_date: string;
  currency_code: string;
  total_revenue: number;
  order_count: number;
  average_order_value: number;
  revenue_by_day: { date: string; total: number }[];
};

export type DashboardRangeQuery = { period: DashboardPeriod } | { start_date: string; end_date: string };

export async function getDashboardMetrics(range: DashboardRangeQuery): Promise<DashboardMetrics> {
  const headers = await authHeaders();
  return sdk.client.fetch<DashboardMetrics>("/admin/dashboard-metrics", {
    query: range,
    headers,
    cache: "no-store",
  });
}
