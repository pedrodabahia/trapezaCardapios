import { adminClient } from "@/lib/supabase-server-auth";
import type {
  AnalyticsEventRow,
  AnalyticsRepository,
} from "./analytics.repository";

export class SupabaseAnalyticsRepository
  implements AnalyticsRepository
{
  async listarUltimos30Dias(): Promise<AnalyticsEventRow[]> {
    const supabase = adminClient();

    const { data, error } = await supabase
      .from("analytics_events")
      .select(
        "event_name, empresa_id, session_id, created_at",
      )
      .gte(
        "created_at",
        new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw new Error(
        `Erro ao listar analytics: ${error.message}`,
      );
    }

    return data ?? [];
  }
}