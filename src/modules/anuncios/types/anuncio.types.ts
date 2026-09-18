// CAMADA DE TIPOS (anuncios) — contratos de dado, sem lógica.
export type AnuncioHome = {
  id: string;
  titulo: string;
  subtitulo: string | null;
  imagem_url: string | null;
  // Pra onde o slide leva ao clicar: URL externa completa, ou um caminho
  // interno tipo /s/algum-slug ou /s/algum-slug/product/algum-id.
  link_url: string | null;
  // Cor de fundo do card (hex, ex: "#c65d3a"). Quando null, o carrossel
  // usa o gradiente padrão (trapeza-banner-gradient) da marca.
  cor_fundo: string | null;
  // Em qual carrossel da home esse anúncio aparece — ver POSICOES_CARROSSEL
  // em src/lib/anuncios-posicoes.ts pras posições disponíveis hoje.
  posicao: string;
  ativo: boolean;
  ordem: number;
  criado_em?: string;
};

export type NovoAnuncioInput = Partial<Pick<AnuncioHome, "id" | "subtitulo" | "imagem_url" | "link_url" | "cor_fundo" | "posicao" | "ativo" | "ordem">> & {
  titulo: string;
};
