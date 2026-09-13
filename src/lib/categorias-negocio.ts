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
    label: "Distribuidoras",
    imagem_url: "/distrib.png",
    cor: "#E8F8EC",
  },

  {
    valor: "lanchonete",
    label: "Lanchonetes",
    imagem_url: "/lanchonete.png",
    cor: "#FFF0DC",
  },

  {
    valor: "pizzaria",
    label: "Pizzarias",
    imagem_url: "/pizza.png",
    cor: "#FFE5E1",
  },

  {
    valor: "confeitaria",
    label: "Confeitarias",
    imagem_url: "/bolo.png",
    cor: "#F8E8F5",
  },

  {
    valor: "restaurante",
    label: "Restaurante",
    imagem_url: "/comida.png",
    cor: "#FFF4D6",
  },

  {
    valor: "sorvete",
    label: "Sorveteria/Açaí",
    imagem_url: "/sorvete.png",
    cor: "#F3E8FF",
  },

  {
    valor: "barbearia",
    label: "Barbearias",
    imagem_url: "/barba.png",
    cor: "#EAE6FF",
  },

  {
    valor: "estetica",
    label: "Estética/Beleza",
    imagem_url: "/lindo.png",
    cor: "#FFE8F0",
  },  
  
  {
    valor: "farmacia",
    label: "Farmácias",
    imagem_url: "/farmacia.png",
    cor: "#FFE8F0",
  },
  
  {
    valor: "mercado",
    label: "Mercados",
    imagem_url: "/carrinho-de-compras.png",
    cor: "#FFE8F0",
  },
  
  {
    valor: "servico",
    label: "Serviços",
    imagem_url: "/servico.png",
    cor: "#FFE8F0",
  },
  
  {
    valor: "taxi",
    label: "Taxi",
    imagem_url: "/taxi.png",
    cor: "#FFE8F0",
  },
    
  {
    valor: "mototaxi",
    label: "Moto-Taxi",
    imagem_url: "/mototaxi.png",
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


