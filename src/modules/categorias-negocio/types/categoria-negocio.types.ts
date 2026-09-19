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
  // null = é uma categoria PAI (nível principal). Preenchido = é uma
  // subcategoria, e o valor é o id da categoria pai dela.
  categoria_pai_id: string | null;
};

export type NovaCategoriaNegocioInput = Partial<
  Pick<CategoriaNegocioDb, "id" | "imagem_url" | "cor" | "ativo" | "ordem" | "categoria_pai_id">
> & {
  valor: string;
  label: string;
};
