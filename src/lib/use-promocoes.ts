import { useQuery } from "@tanstack/react-query";
import { listarPromocoes } from "@/modules/promocoes/controllers/promocao.controller";

/**
 * Uma única busca de promoções para a home inteira.
 * Mesma chave da página /promocoes e do PromocoesDestaque: o cache é compartilhado.
 */
export function usePromocoes() {
  return useQuery({
    queryKey: ["promocoes-lista"],
    queryFn: () => listarPromocoes({ data: { limite: 100 } }),
    staleTime: 30_000,
  });
}

export type PromocaoHome = NonNullable<
  ReturnType<typeof usePromocoes>["data"]
>[number];