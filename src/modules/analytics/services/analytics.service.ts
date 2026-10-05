// src/modules/analytics/services/analytics.service.ts

import type {
  AnalyticsEventRow,
  AnalyticsRepository,
} from "../repositories/analytics.repository";

export class AnalyticsService {
  constructor(
    private repository: AnalyticsRepository,
  ) {}

  async listarUltimos30Dias(): Promise<AnalyticsEventRow[]> {
    return this.repository.listarUltimos30Dias();
  }
}