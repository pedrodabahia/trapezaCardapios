
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Tag } from "lucide-react";
import { listarPromocoes } from "@/modules/promocoes/controllers/promocao.controller";

type PromocoesDestaqueProps = {
  limite?: number;
  titulo?: string;
  subtitulo?: string;
  mostrarVerTodas?: boolean;
};

function formatarPreco(valor: number | null | undefined) {
  if (valor == null) return null;

  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function PromocoesDestaque({
  limite = 8,
  titulo = "🔥 Ofertas e Promoções",
  subtitulo = "Aproveite as ofertas dos negócios da sua região.",
  mostrarVerTodas = true,
}: PromocoesDestaqueProps) {
  const {
    data: promocoes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["promocoes-home", limite],
    queryFn: () => listarPromocoes({ data: { limite } }),
    staleTime: 30_000,
  });

  if (isLoading || isError || promocoes.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">{titulo}</h2>
          <p className="text-sm text-muted-foreground">{subtitulo}</p>
        </div>

        <Tag className="shrink-0 text-orange-600" size={22} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {promocoes.map((promocao) => {
          const precoAtual = formatarPreco(promocao.preco_promocional);
          const precoAnterior = formatarPreco(promocao.preco_anterior);

          return (
            <Link
              key={promocao.id}
              to="/promocoes/$slug"
              params={{ slug: promocao.slug }}
              className="group block min-w-0 overflow-hidden rounded-xl border bg-card transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                {promocao.imagem_url ? (
                  <img
                    src={promocao.imagem_url}
                    alt={promocao.titulo}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Tag size={36} className="text-muted-foreground" />
                  </div>
                )}

                {promocao.destaque && (
                  <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-1 text-[10px] font-bold text-black">
                    DESTAQUE
                  </span>
                )}
              </div>

              <div className="space-y-1 p-3">
                <h3 className="line-clamp-2 text-sm font-semibold">
                  {promocao.titulo}
                </h3>

                <p className="truncate text-xs text-muted-foreground">
                  {promocao.empresa_nome}
                </p>

                {precoAtual && (
                  <p className="text-base font-bold text-green-700">
                    {precoAtual}
                  </p>
                )}

                {precoAnterior && (
                  <p className="text-xs text-muted-foreground line-through">
                    {precoAnterior}
                  </p>
                )}

                <p className="pt-1 text-xs font-semibold text-orange-600">
                  Ver oferta →
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {mostrarVerTodas && (
        <Link
          to="/promocoes"
          className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition hover:bg-muted"
        >
          Ver todas as promoções
          <ArrowRight size={16} />
        </Link>
      )}
    </section>
  );
}