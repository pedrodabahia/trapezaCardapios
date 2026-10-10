
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

export interface AnalyticsPromocaoRanking {
  promocaoId: string;
  titulo: string;
  empresaId: string;
  empresaNome: string;
  visualizacoes: number;
  cliquesOferta: number;
  cliquesWhatsApp: number;
}

export interface AnalyticsPromocoesResumo {
  visualizacoes: number;
  cliquesOfertas: number;
  cliquesWhatsApp: number;
  promocoes: AnalyticsPromocaoRanking[];
}

export interface AnalyticsRepository {
  obterResumoUltimos30Dias(): Promise<AnalyticsResumo>;

  obterResumoPromocoesUltimos30Dias(): Promise<AnalyticsPromocoesResumo>;
}