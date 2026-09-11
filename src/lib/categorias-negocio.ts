// Categorias de NEGÓCIO (o que a empresa vende/faz — ex: lanchonete,
// distribuidora), usadas na home pública pra busca/filtro por categoria e
// no painel (aba Config) pra empresa se autoclassificar. Isso é diferente
// das "categorias" do módulo de produtos (que são as categorias do
// cardápio de cada empresa, tipo "Bebidas", "Hot dogs").
export type CategoriaNegocio = {
  valor: string;
  label: string;
  imagem_url: string;
  cor: string;
};

export const CATEGORIAS_NEGOCIO: CategoriaNegocio[] = [

  {
    valor: "distribuidora",
    label: "Abasteça",
    imagem_url: "/armazem.png",
    cor: "#E8F8EC",
  },

  {
    valor: "lanchonete",
    label: "Peça um lanche",
    imagem_url: "/tenda.png",
    cor: "#FFF0DC",
  },

  {
    valor: "pizzaria",
    label: "Pizza",
    imagem_url: "/pizza.png",
    cor: "#FFE5E1",
  },

  {
    valor: "confeitaria",
    label: "Docinhos",
    imagem_url: "/bolo.png",
    cor: "#F8E8F5",
  },

  {
    valor: "restaurante",
    label: "Almoço",
    imagem_url: "/comida.png",
    cor: "#FFF4D6",
  },

  {
    valor: "acai",
    label: "Açaí",
    imagem_url: "/acai.png",
    cor: "#F3E8FF",
  },

  {
    valor: "barbearia",
    label: "Corte",
    imagem_url: "/barba.png",
    cor: "#EAE6FF",
  },

  {
    valor: "estetica",
    label: "Cuidados",
    imagem_url: "/makeover.png",
    cor: "#FFE8F0",
  },

];

export function labelCategoriaNegocio(valor: string | null | undefined): string | null {
  if (!valor) return null;
  return CATEGORIAS_NEGOCIO.find((c) => c.valor === valor)?.label ?? valor;
}

// Versão em lista, pra empresa que tem mais de uma categoria — devolve os
// labels na mesma ordem salva, ignorando valor que não existe mais na
// taxonomia (categoria antiga removida, por exemplo).
export function labelsCategoriasNegocio(valores: string[] | null | undefined): string[] {
  if (!valores || valores.length === 0) return [];
  return valores
    .map((v) => labelCategoriaNegocio(v))
    .filter((l): l is string => !!l);
}


