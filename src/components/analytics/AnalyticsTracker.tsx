
import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { trackEvent } from "@/lib/analytics";

export function AnalyticsTracker() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const ultimaRota = useRef<string | null>(null);

  useEffect(() => {
    if (ultimaRota.current === pathname) return;

    ultimaRota.current = pathname;

    void trackEvent("page_view", {
      path: pathname,
    });
  }, [pathname]);

  return null;
}