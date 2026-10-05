// src/modules/analytics/repositories/analytics.repository.ts

export interface AnalyticsEventRow {
  event_name: string;
  empresa_id: string | null;
  session_id: string;
  created_at: string;
}

export interface AnalyticsRepository {
  listarUltimos30Dias(): Promise<AnalyticsEventRow[]>;
}