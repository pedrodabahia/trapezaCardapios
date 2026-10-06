// src/modules/analytics/repositories/analytics.repository.ts

export interface AnalyticsEmpresaRanking {
  empresaId: string;
  total: number;
}

export interface AnalyticsResumo {
  pageViews: number;
  companyViews: number;
  whatsappClicks: number;
  visitantes: number;
  empresasMaisVistas: AnalyticsEmpresaRanking[];
  empresasMaisWhatsApp: AnalyticsEmpresaRanking[];
}

export interface AnalyticsRepository {
  obterResumoUltimos30Dias(): Promise<AnalyticsResumo>;
}