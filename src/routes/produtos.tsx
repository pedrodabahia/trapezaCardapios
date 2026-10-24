
import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { brl } from "@/lib/format";
import {
  listarCatalogoCompleto,
  type ItemCatalogoCompleto,
} from "@/lib/admin-server";

export const Route = createFileRoute("/produtos")({
  component: ProdutosPage,
});

const LIMITE_CARROSSEL = 10;

function ProdutosPage() {
  const [cidade, setCidade] = useState("");

  const {
    data: itens = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["catalogo-completo-produtos", cidade],
    queryFn: () =>
      listarCatalogoCompleto({
        data: { cidade: cidade || null },
      }),
  });

  const cidades = useMemo(
    () =>
      [
        ...new Set(
          itens
            .map((item) => item.empresaCidade)
            .filter((nome): nome is string => Boolean(nome)),
        ),
      ].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [itens],
  );


  const grupos = useMemo(() => {
    const mapa = new Map<string, ItemCatalogoCompleto[]>();

    for (const item of itens) {
      const chave = item.categoriaId ?? "sem-categoria";
      const nome = item.categoriaNome || "Outros";
      const grupo = mapa.get(chave) ?? [];

      grupo.push(item);
      mapa.set(chave, grupo);
    }

    return [...mapa.entries()]
      .map(([categoriaId, produtos]) => ({
        categoriaId,
        categoria: produtos[0]?.categoriaNome ?? "Outros",
        produtos,
      }))
      .sort((a, b) => a.categoria.localeCompare(b.categoria, "pt-BR"));
  }, [itens]);

  console.log(grupos)

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-12">
      <header className="py-8">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Voltar para o início
        </Link>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">
              🛍️ Produtos da região
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Descubra produtos das empresas da região, organizados por categoria.
            </p>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Filtrar por cidade</span>
            <select
              value={cidade}
              onChange={(event) => setCidade(event.target.value)}
              className="min-w-52 rounded-md border border-border bg-background px-3 py-2"
            >
              <option value="">Todas as cidades</option>
              {cidades.map((nome) => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {isPending && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Carregando produtos...
        </p>
      )}

      {isError && (
        <p className="py-12 text-center text-sm text-destructive">
          Não foi possível carregar os produtos. Tente novamente.
        </p>
      )}

      {!isPending && !isError && itens.length === 0 && (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="font-semibold">Nenhum produto encontrado.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tente selecionar outra cidade ou volte mais tarde.
          </p>
        </div>
      )}

      {!isPending && !isError && grupos.length > 0 && (
        <div className="space-y-9">
          {grupos.map((grupo) => (
            <CarrosselCategoria
              key={grupo.categoriaId}
              categoriaId={grupo.categoriaId}
              categoria={grupo.categoria}
              produtos={grupo.produtos}
            />
          ))}
        </div>
      )}
    </main>
  );
}

type CarrosselCategoriaProps = {
  categoriaId: string;
  categoria: string;
  produtos: ItemCatalogoCompleto[];
};

function CarrosselCategoria({
  categoriaId,
  categoria,
  produtos,
}: CarrosselCategoriaProps) {
  const carrosselRef = useRef<HTMLDivElement>(null);
  const visiveis = produtos.slice(0, LIMITE_CARROSSEL);

  function mover(direcao: "esquerda" | "direita") {
    const elemento = carrosselRef.current;
    if (!elemento) return;

    elemento.scrollBy({
      left:
        (direcao === "direita" ? 1 : -1) *
        Math.max(elemento.clientWidth * 0.8, 240),
      behavior: "smooth",
    });
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">{categoria}</h2>
          <p className="text-xs text-muted-foreground">
            {produtos.length}{" "}
            {produtos.length === 1 ? "produto" : "produtos"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => mover("esquerda")}
            aria-label={`Produtos anteriores de ${categoria}`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => mover("direita")}
            aria-label={`Próximos produtos de ${categoria}`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={carrosselRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {visiveis.map((item) => (
          <Link
            key={item.produtoId}
            to="/s/$slug/product/$id"
            params={{
              slug: item.empresaSlug,
              id: item.produtoId,
            }}
            className="group block w-[155px] min-w-[155px] snap-start sm:w-[185px] sm:min-w-[185px] lg:w-[205px] lg:min-w-[205px]"
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
                    🛍️
                  </div>
                )}
              </div>

              <CardContent className="space-y-1 p-2.5">
                <h3 className="truncate text-xs font-semibold">{item.nome}</h3>

                <p className="truncate text-[11px] text-muted-foreground">
                  {item.empresaNome}
                </p>

                <p className="line-clamp-2 min-h-8 text-[11px] text-muted-foreground">
                  {item.descricaoCurta || "Confira os detalhes do produto."}
                </p>

                <p
                  className="text-xs font-bold"
                  style={{ color: "var(--tp-orange, #c65d3a)" }}
                >
                  {brl(item.precoAtual)}
                  {item.precoAntigo != null &&
                  item.precoAntigo > item.precoAtual ? (
                    <span className="ml-1 font-normal text-muted-foreground line-through">
                      {brl(item.precoAntigo)}
                    </span>
                  ) : null}
                </p>
              </CardContent>
            </Card>
          </Link>

        ))}
                  {produtos.length > LIMITE_CARROSSEL && (
          <Link

              to="/categoria/$valor"
              params={{ valor: categoriaId }}
              search={{ tipo: "produto" }}
            className="
              flex
              w-40
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-border
              border-2
              border-orange-400
              bg-muted/30
              px-4
              text-center
              text-xs
              font-semibold
              text-orange-700
              transition
              hover:bg-muted
              active:scale-[0.98]
            "
          >
            Ver mais
            <span className="ml-1">→</span>
          </Link>
        )}

      </div>
    </section>
  );
}
