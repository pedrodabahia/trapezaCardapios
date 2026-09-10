// Categorias de NEGÓCIO (o que a empresa vende/faz — ex: lanchonete,
// distribuidora), usadas na home pública pra busca/filtro por categoria e
// no painel (aba Config) pra empresa se autoclassificar. Isso é diferente
// das "categorias" do módulo de produtos (que são as categorias do
// cardápio de cada empresa, tipo "Bebidas", "Hot dogs").
export type CategoriaNegocio = {
  valor: string;
  label: string;
  imagem_url: string;
};

export const CATEGORIAS_NEGOCIO: CategoriaNegocio[] = [
  { valor: "distribuidora", label: "Distribuidoras",imagem_url:  "/armazem.png"},
  { valor: "lanchonete", label: "Lanchonetes",imagem_url: "/tenda.png"},
  { valor: "pizzaria", label: "Pizzarias",imagem_url: "/pizza.png"},
  { valor: "confeitaria", label: "Confeitarias",imagem_url: "/bolo.png"},
  {valor: "restaurante", label: "Restaurante",imagem_url: "/comida.png"}


];

export function labelCategoriaNegocio(valor: string | null | undefined): string | null {
  if (!valor) return null;
  return CATEGORIAS_NEGOCIO.find((c) => c.valor === valor)?.label ?? valor;
}


