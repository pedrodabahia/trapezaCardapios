
import { supabase } from "@/lib/supabase-client";

// ==========================================
// TIPOS DE EVENTOS
// ==========================================

export type AnalyticsEvent =
  | "page_view"
  | "company_view"
  | "search"
  | "search_result_click"
  | "whatsapp_click"
  | "phone_click"
  | "route_click";

type DeviceType =
  | "mobile"
  | "tablet"
  | "desktop"
  | "unknown";

// ==========================================
// SESSÃO ANÔNIMA
// ==========================================

// Identificador temporário mantido apenas em memória.
// Não utiliza cookies ou localStorage.

function getSessionId(): string {
  const key = "trapeza_analytics_session";

  try {
    let id = sessionStorage.getItem(key);

    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(key, id);
    }

    return id;
  } catch {
    return crypto.randomUUID();
  }
}

const sessionId = getSessionId();

// ==========================================
// IDENTIFICAÇÃO DO DISPOSITIVO
// ==========================================

function getDeviceType(): DeviceType {
  if (typeof window === "undefined") {
    return "unknown";
  }

  const width = window.innerWidth;

  if (width < 768) {
    return "mobile";
  }

  if (width < 1024) {
    return "tablet";
  }

  return "desktop";
}

// ==========================================
// REGISTRO DE EVENTOS
// ==========================================

interface TrackEventOptions {
  empresaId?: string;
  path?: string;
}

export async function trackEvent(
  eventName: AnalyticsEvent,
  options?: TrackEventOptions
): Promise<void> {
  // Verifica se o cliente Supabase existe.

  if (!supabase) {
    console.warn(
      "[Analytics] Cliente Supabase não configurado."
    );

    return;
  }

  try {
    const pagePath =
      options?.path ??
      (typeof window !== "undefined"
        ? window.location.pathname
        : "/");

    const referrer =
      typeof document !== "undefined" &&
      document.referrer
        ? new URL(document.referrer).origin
        : null;

    const { error } = await supabase.rpc(
      "registrar_analytics",
      {
        p_event_name: eventName,
        p_page_path: pagePath,
        p_session_id: sessionId,
        p_empresa_id: options?.empresaId ?? null,
        p_referrer: referrer,
        p_device_type: getDeviceType(),
      }
    );

    if (error) {
      console.warn(
        "[Analytics] Erro ao registrar evento:",
        error.message
      );
    }
  } catch (error) {
    console.warn(
      "[Analytics] Falha inesperada:",
      error
    );
  }
}

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

export function trackPageView(path?: string) {
  return trackEvent("page_view", { path });
}

export function trackCompanyView(empresaId: string) {
  return trackEvent("company_view", { empresaId });
}

export function trackWhatsAppClick(empresaId: string) {
  return trackEvent("whatsapp_click", { empresaId });
}

export function trackPhoneClick(empresaId: string) {
  return trackEvent("phone_click", { empresaId });
}

export function trackRouteClick(empresaId: string) {
  return trackEvent("route_click", { empresaId });
}

export function trackSearch() {
  return trackEvent("search");
}

export function trackSearchResultClick() {
  return trackEvent("search_result_click");
}

export type PromotionAnalyticsEvent =
  | "promotion_view"
  | "promotion_card_click"
  | "promotion_whatsapp_click";

interface TrackPromotionOptions {
  promocaoId: string;
  empresaId?: string;
  path?: string;
}

export async function trackPromotionEvent(
  eventName: PromotionAnalyticsEvent,
  options: TrackPromotionOptions
): Promise<void> {
  if (!supabase) return;

  try {
    const pagePath =
      options.path ??
      (typeof window !== "undefined"
        ? window.location.pathname
        : "/");

    const referrer =
      typeof document !== "undefined" && document.referrer
        ? new URL(document.referrer).origin
        : null;

    const { data,error } = await supabase.rpc(
      "registrar_analytics_promocao",
      {
        p_event_name: eventName,
        p_page_path: pagePath,
        p_session_id: sessionId,
        p_promocao_id: options.promocaoId,
        p_empresa_id: options.empresaId ?? null,
        p_referrer: referrer,
        p_device_type: getDeviceType(),
      }
    );

    if (error) {
      if (data === false) {
  console.warn(
    "[Analytics Promoções] O banco recusou o evento:",
    {
      eventName,
      promocaoId: options.promocaoId,
      empresaId: options.empresaId,
      pagePath,
    },
  );
}
      console.warn("[Analytics Promoções]", error.message);
    }
  } catch (error) {
    console.warn("[Analytics Promoções] Falha:", error);
  }
}

export function trackPromotionView(
  promocaoId: string,
  empresaId?: string
) {
  return trackPromotionEvent("promotion_view", {
    promocaoId,
    empresaId,
  });
}

export function trackPromotionCardClick(
  promocaoId: string,
  empresaId?: string
) {
  return trackPromotionEvent("promotion_card_click", {
    promocaoId,
    empresaId,
  });
}

export function trackPromotionWhatsAppClick(
  promocaoId: string,
  empresaId: string
) {
  return trackPromotionEvent("promotion_whatsapp_click", {
    promocaoId,
    empresaId,
  });
}
