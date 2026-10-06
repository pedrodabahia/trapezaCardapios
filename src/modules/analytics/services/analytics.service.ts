// src/modules/analytics/services/analytics.service.ts

import type {
  AnalyticsRepository,
} from "../repositories/analytics.repository";

export class AnalyticsService {
  constructor(
    private repository: AnalyticsRepository,
  ) {}

  async obterResumoUltimos30Dias() {
    return this.repository.obterResumoUltimos30Dias();
  }
}