// CAMADA DE TIPOS (anuncios) — contratos de dado, sem lógica.
export type AnuncioHome = {
  id: string;
  titulo: string;
  subtitulo: string | null;
  imagem_url: string | null;
  // Pra onde o slide leva ao clicar: URL externa completa, ou um caminho
  // interno tipo /s/algum-slug ou /s/algum-slug/product/algum-id.
  link_url: string | null;
  ativo: boolean;
  ordem: number;
  criado_em?: string;
};

export type NovoAnuncioInput = Partial<Pick<AnuncioHome, "id" | "subtitulo" | "imagem_url" | "link_url" | "ativo" | "ordem">> & {
  titulo: string;
};
