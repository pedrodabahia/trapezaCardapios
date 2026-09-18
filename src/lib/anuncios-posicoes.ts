// Posições de carrossel de propaganda disponíveis na home hoje (mesmo
// esquema usado no seletor de /plataforma/anuncios). Pra adicionar uma
// posição nova de verdade (um carrossel em outro lugar da página),
// precisa de uma mudança de código em routes/index.tsx — depois disso,
// os anúncios daquela posição já ficam 100% controláveis pelo painel,
// sem precisar mexer em código de novo.
export const POSICOES_CARROSSEL = [
  { valor: "1", label: "Posição 1 — Principal" },
  { valor: "2", label: "Posição 2 — Intermediário" },
  { valor: "3", label: "Posição 3 — Intermediário" },
  { valor: "4", label: "Posição 4 — Final" },
] as const;

export function labelPosicaoCarrossel(valor: string): string {
  return POSICOES_CARROSSEL.find((p) => p.valor === valor)?.label ?? valor;
}
