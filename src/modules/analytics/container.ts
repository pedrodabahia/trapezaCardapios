// src/modules/analytics/container.ts

import { container } from "@/core/container";

import type { AnalyticsRepository } from "./repositories/analytics.repository";
import { SupabaseAnalyticsRepository } from "./repositories/supabase-analytics.repository";

import { AnalyticsService } from "./services/analytics.service";

declare module "@/core/container" {
  interface Cradle {
    analyticsRepository: AnalyticsRepository;
    analyticsService: AnalyticsService;
  }
}

container.register(
  "analyticsRepository",
  () => new SupabaseAnalyticsRepository(),
);

container.register(
  "analyticsService",
  (c) =>
    new AnalyticsService(
      c.resolve("analyticsRepository"),
    ),
);