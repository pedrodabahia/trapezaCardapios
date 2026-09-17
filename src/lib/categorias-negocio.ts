// Categorias de NEGÓCIO (o que a empresa vende/faz — ex: lanchonete,
// distribuidora), usadas na home pública pra busca/filtro por categoria e
// no painel (aba Config) pra empresa se autoclassificar. Isso é diferente
// das "categorias" do módulo de produtos (que são as categorias do
// cardápio de cada empresa, tipo "Bebidas", "Hot dogs").
//
// A lista de verdade agora mora no banco (tabela categorias_negocio,
// gerenciável em /plataforma/categorias-negocio) — use o hook
// `useCategoriasNegocio()` abaixo pra pegar a lista atualizada. O array
// `CATEGORIAS_NEGOCIO` aqui embaixo virou só um FALLBACK/placeholder
// (mostra algo enquanto a consulta ao banco ainda não voltou, ou pros
// poucos lugares que ainda não foram religados na consulta) — não edite
// essa lista esperando que ela apareça em algum lugar; edite pelo painel.
import { useQuery } from "@tanstack/react-query";
import { getCategoriasNegocio } from "@/lib/admin-server";

export type CategoriaNegocio = {
  valor: string;
  label: string;
  imagem_url: string;
  cor: string;
};

// Busca a lista de categorias direto do banco (público, sem login) —
// use isso em qualquer componente que precise mostrar/filtrar categorias.
export function useCategoriasNegocio() {
  return useQuery({
    queryKey: ["categorias-negocio"],
    queryFn: () => getCategoriasNegocio({ data: {} as Record<string, never> }),
    staleTime: 60_000,
  });
}

export const CATEGORIAS_NEGOCIO: CategoriaNegocio[] = [

  {
    valor: "distribuidora",
    label: "Distribuidoras",
    imagem_url: "/icons/distrib.png",
    cor: "#E8F8EC",
  },

  {
    valor: "lanchonete",
    label: "Lanchonetes",
    imagem_url: "/icons/lanchonete.png",
    cor: "#FFF0DC",
  },

  {
    valor: "pizzaria",
    label: "Pizzarias",
    imagem_url: "/icons/pizza.png",
    cor: "#FFE5E1",
  },

  {
    valor: "confeitaria",
    label: "Confeitarias",
    imagem_url: "/icons/bolo.png",
    cor: "#F8E8F5",
  },

  {
    valor: "restaurante",
    label: "Restaurante",
    imagem_url: "/icons/comida.png",
    cor: "#FFF4D6",
  },

  {
    valor: "sorvete",
    label: "Sorveteria/Açaí",
    imagem_url: "/icons/sorvete.png",
    cor: "#F3E8FF",
  },

  {
    valor: "barbearia",
    label: "Barbearias",
    imagem_url: "/icons/barba.png",
    cor: "#EAE6FF",
  },

  {
    valor: "estetica",
    label: "Estética/Beleza",
    imagem_url: "/icons/lindo.png",
    cor: "#FFE8F0",
  },  
  
  {
    valor: "farmacia",
    label: "Farmácias",
    imagem_url: "/icons/farmacia.png",
    cor: "#FFE8F0",
  },
  
  {
    valor: "mercado",
    label: "Mercados",
    imagem_url: "/icons/carrinho-de-compras.png",
    cor: "#FFE8F0",
  },
  
  {
    valor: "servico",
    label: "Serviços",
    imagem_url: "/icons/servico.png",
    cor: "#FFE8F0",
  },
  
  {
    valor: "taxi",
    label: "Taxi",
    imagem_url: "/icons/taxi.png",
    cor: "#FFE8F0",
  },
    
  {
    valor: "mototaxi",
    label: "Moto-Taxi",
    imagem_url: "/icons/mototaxi.png",
    cor: "#FFE8F0",
  },

];

export function labelCategoriaNegocio(
  valor: string | null | undefined,
  lista: CategoriaNegocio[] = CATEGORIAS_NEGOCIO,
): string | null {
  if (!valor) return null;
  return lista.find((c) => c.valor === valor)?.label ?? valor;
}

// Versão em lista, pra empresa que tem mais de uma categoria — devolve os
// labels na mesma ordem salva, ignorando valor que não existe mais na
// taxonomia (categoria antiga removida, por exemplo).
export function labelsCategoriasNegocio(
  valores: string[] | null | undefined,
  lista: CategoriaNegocio[] = CATEGORIAS_NEGOCIO,
): string[] {
  if (!valores || valores.length === 0) return [];
  return valores
    .map((v) => labelCategoriaNegocio(v, lista))
    .filter((l): l is string => !!l);
}


