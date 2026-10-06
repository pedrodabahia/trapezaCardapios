// src/modules/analytics/controllers/analytics.controller.ts

import { createServerFn } from "@tanstack/react-start";
import { container } from "@/core/container";
import { authPlatform } from "@/core/auth/session";

import "../container";

export const listarAnalytics = createServerFn({
  method: "POST",
})
  .validator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    await authPlatform(data.token);

    const analyticsService =
      container.resolve("analyticsService");

    return analyticsService.obterResumoUltimos30Dias();
  });