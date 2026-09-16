// CAMADA DE TIPOS (categorias-negocio) — contratos de dado, sem lógica.
export type CategoriaNegocioDb = {
  id: string;
  valor: string;
  label: string;
  imagem_url: string | null;
  cor: string | null;
  ativo: boolean;
  ordem: number;
  criado_em?: string;
};

export type NovaCategoriaNegocioInput = Partial<
  Pick<CategoriaNegocioDb, "id" | "imagem_url" | "cor" | "ativo" | "ordem">
> & {
  valor: string;
  label: string;
};
