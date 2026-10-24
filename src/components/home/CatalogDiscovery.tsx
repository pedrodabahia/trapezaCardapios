import { useMemo, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { brl } from "@/lib/format";
import type { ItemCatalogoHome } from "@/lib/admin-server";

type Props = {
  itens: ItemCatalogoHome[];
  cidade?: string | null;
  categoria?: string;
  tipo?: "produto" | "servico";
  titulo?: string;
  subtitulo?: string;
  limite?: number;
  urlVerMaisGeral?: boolean;
};

const CLASSE_LARGURA_CARD =
  "w-[155px] min-w-[155px] snap-start sm:w-[185px] sm:min-w-[185px] lg:w-[205px] lg:min-w-[205px]";

function selecionarDiversificados(
  itens: ItemCatalogoHome[],
  limite: number,
) {
  const restantes = [...itens];
  const selecionados: ItemCatalogoHome[] = [];
  const empresas = new Set<string>();

  while (restantes.length && selecionados.length < limite) {
    const index = restantes.findIndex(
      (item) => !empresas.has(item.empresaId),
    );

    const escolhido =
      index >= 0 ? restantes.splice(index, 1)[0] : restantes.shift()!;

    selecionados.push(escolhido);
    empresas.add(escolhido.empresaId);
  }

  return selecionados;
}

function CardVerMais({ textoTodos }: { textoTodos: string }) {
  return (
    <Card className="flex h-full min-h-[220px] w-full items-center justify-center border-dashed transition hover:border-orange-400 hover:bg-muted/50">
      <CardContent className="flex flex-col items-center gap-3 p-4 text-center">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl"
          aria-hidden="true"
        >
          →
        </span>

        <span className="text-sm font-semibold">Ver mais</span>

        <span className="text-xs text-muted-foreground">
          Todos os {textoTodos}
        </span>
      </CardContent>
    </Card>
  );
}

export function CatalogDiscovery({
  itens,
  cidade,
  categoria,
  tipo = "produto",
  titulo,
  subtitulo,
  limite = 10,
  urlVerMaisGeral = false,
}: Props) {
  const carrosselRef = useRef<HTMLDivElement>(null);

  const visiveis = useMemo(() => {
    const filtrados = itens.filter(
      (item) =>
        item.tipo === tipo &&
        (!cidade || item.empresaCidade === cidade) &&
        (!categoria || item.categoriasEmpresa?.includes(categoria)),
    );

    return selecionarDiversificados(filtrados, limite);
  }, [itens, cidade, categoria, tipo, limite]);

  if (visiveis.length < 2) return null;

  const heading =
    titulo ??
    (tipo === "servico"
      ? "Serviços para conhecer"
      : "Produtos para descobrir");

  const textoTodos = tipo === "servico" ? "serviços" : "produtos";

  function moverCarrossel(direcao: "esquerda" | "direita") {
    const carrossel = carrosselRef.current;
    if (!carrossel) return;

    carrossel.scrollBy({
      left:
        direcao === "direita"
          ? Math.max(carrossel.clientWidth * 0.8, 240)
          : -Math.max(carrossel.clientWidth * 0.8, 240),
      behavior: "smooth",
    });
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pt-5">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-base font-bold">{heading}</h2>

          <p className="mt-0.5 text-xs text-muted-foreground">
            {subtitulo ??
              "Descubra o que as empresas da cidade oferecem."}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => moverCarrossel("esquerda")}
            aria-label={`Ver itens anteriores: ${heading}`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span aria-hidden="true">‹</span>
          </button>

          <button
            type="button"
            onClick={() => moverCarrossel("direita")}
            aria-label={`Ver próximos itens: ${heading}`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>

      <div
        ref={carrosselRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3"
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
        aria-label={heading}
      >
        {visiveis.map((item) => (
          <Link
            key={item.id}
            to="/s/$slug/product/$id"
            params={{
              slug: item.empresaSlug,
              id: item.id,
            }}
            className={`group block ${CLASSE_LARGURA_CARD}`}
          >
            <Card className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="aspect-square overflow-hidden bg-muted">
                {item.imagemUrl ? (
                  <img
                    src={item.imagemUrl}
                    alt={item.nome}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="flex h-full items-center justify-center text-3xl"
                    aria-hidden="true"
                  >
                    {tipo === "servico" ? "🛠️" : "🛍️"}
                  </div>
                )}
              </div>

              <CardContent className="space-y-1 p-2.5">
                <h3 className="truncate text-xs font-semibold leading-tight">
                  {item.nome}
                </h3>

                <p className="truncate text-[11px] text-muted-foreground">
                  {item.empresaNome}
                </p>

                <p className="line-clamp-2 min-h-8 text-[11px] text-muted-foreground">
                  {item.descricaoCurta}
                </p>

                <p
                  className="text-xs font-bold"
                  style={{ color: "var(--tp-orange, #c65d3a)" }}
                >
                  {tipo === "servico" && item.preco <= 0
                    ? "Consultar valor"
                    : brl(item.preco)}

                  {item.precoAntigo != null &&
                  item.precoAntigo > item.preco ? (
                    <span className="ml-1 font-normal text-muted-foreground line-through">
                      {brl(item.precoAntigo)}
                    </span>
                  ) : null}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}

        {/* Card "Ver mais" no final do carrossel */}
        {urlVerMaisGeral ? (
          <Link
            to="/produtos"
            aria-label={`Ver todos os ${textoTodos}`}
            className={`flex items-center justify-center ${CLASSE_LARGURA_CARD}`}
          >
            <CardVerMais textoTodos={textoTodos} />
          </Link>
        ) : categoria ? (
          <Link
            to="/categoria/$valor"
            params={{ valor: categoria }}
            search={{ tipo }}
            aria-label={`Ver todos os ${textoTodos} da categoria`}
            className={`flex items-center justify-center ${CLASSE_LARGURA_CARD}`}
          >
            <CardVerMais textoTodos={textoTodos} />
          </Link>
        ) : null}
      </div>
    </section>
  );
}