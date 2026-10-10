
import { adminClient } from "@/lib/supabase-server-auth";

import type {
  AnalyticsRepository,
  AnalyticsResumo,
  AnalyticsPromocoesResumo,
} from "./analytics.repository";

export class SupabaseAnalyticsRepository
  implements AnalyticsRepository
{
  async obterResumoUltimos30Dias(): Promise<AnalyticsResumo> {
    const supabase = adminClient();

    const { data, error } = await supabase.rpc(
      "get_analytics_30_days",
    );

    if (error) {
      throw new Error(
        `Erro ao carregar analytics: ${error.message}`,
      );
    }

    if (!data) {
      return {
        pageViews: 0,
        companyViews: 0,
        whatsappClicks: 0,
        visitantes: 0,
        empresasMaisVistas: [],
        empresasMaisWhatsApp: [],
      };
    }

    return {
      pageViews: Number(data.pageViews ?? 0),
      companyViews: Number(data.companyViews ?? 0),
      whatsappClicks: Number(data.whatsappClicks ?? 0),
      visitantes: Number(data.visitantes ?? 0),
      empresasMaisVistas: data.empresasMaisVistas ?? [],
      empresasMaisWhatsApp: data.empresasMaisWhatsApp ?? [],
    };
  }

  async obterResumoPromocoesUltimos30Dias(): Promise<AnalyticsPromocoesResumo> {
    const supabase = adminClient();

    const { data, error } = await supabase.rpc(
      "get_promotion_analytics_30_days",
    );

    if (error) {
      throw new Error(
        `Erro ao carregar analytics de promoções: ${error.message}`,
      );
    }

    if (!data) {
      return {
        visualizacoes: 0,
        cliquesOfertas: 0,
        cliquesWhatsApp: 0,
        promocoes: [],
      };
    }

    return {
      visualizacoes: Number(data.visualizacoes ?? 0),
      cliquesOfertas: Number(data.cliquesOfertas ?? 0),
      cliquesWhatsApp: Number(data.cliquesWhatsApp ?? 0),
      promocoes: data.promocoes ?? [],
    };
  }
}