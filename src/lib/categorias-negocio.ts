// Categorias de NEGÓCIO (o que a empresa vende/faz — ex: lanchonete,
// distribuidora), usadas na home pública pra busca/filtro por categoria e
// no painel (aba Config) pra empresa se autoclassificar. Isso é diferente
// das "categorias" do módulo de produtos (que são as categorias do
// cardápio de cada empresa, tipo "Bebidas", "Hot dogs").
export type CategoriaNegocio = {
  valor: string;
  label: string;
};

export const CATEGORIAS_NEGOCIO: CategoriaNegocio[] = [
  { valor: "distribuidora", label: "Distribuidoras" },
  { valor: "lanchonete", label: "Lanchonetes" },
  { valor: "pizzaria", label: "Pizzarias" },
  { valor: "mercado", label: "Mercados" },
  { valor: "confeitaria", label: "Confeitarias" },
  { valor: "outros", label: "Outros" },
];

export function labelCategoriaNegocio(valor: string | null | undefined): string | null {
  if (!valor) return null;
  return CATEGORIAS_NEGOCIO.find((c) => c.valor === valor)?.label ?? valor;
}


