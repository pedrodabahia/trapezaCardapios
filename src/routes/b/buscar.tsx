
import {
  createFileRoute,
  Link,
  useRouter,
} from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Package, Search, Store } from "lucide-react";

import {
  listEmpresasPublicas,
  buscarProdutosPlataforma,
} from "@/lib/admin-server";

import { labelsCategoriasNegocio } from "@/lib/categorias-negocio";
import { brl } from "@/lib/format";
import { BusinessCard } from "@/components/home/BusinessCard";

export const Route = createFileRoute("/b/buscar")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  component: BuscarPage,
});

function BuscarPage() {
  const router = useRouter();

  const { q } = Route.useSearch();
  const termo = q.trim();

  const termoBusca = termo.toLowerCase();

  // Busca produtos
  const {
    data: produtos = [],
    isLoading: carregandoProdutos,
    isError: erroProdutos,
  } = useQuery({
    queryKey: ["busca-produtos-global", termo],

    queryFn: () =>
      buscarProdutosPlataforma({
        data: {
          termo,
          limite: 30,
        },
      }),

    enabled: termo.length > 0,
    staleTime: 30_000,
  });

  // Busca empresas
  const {
    data: empresas = [],
    isLoading: carregandoEmpresas,
    isError: erroEmpresas,
  } = useQuery({
    queryKey: ["empresas-publicas"],
    queryFn: () =>
      listEmpresasPublicas({
        data: {} as Record<string, never>,
      }),
    staleTime: 30_000,
  });

  // Filtra empresas pelo termo pesquisado
  const empresasEncontradas = empresas.filter((empresa) => {
    if (!termoBusca) return false;

    const nome = empresa.nome?.toLowerCase() ?? "";
    const cidade = empresa.cidade?.toLowerCase() ?? "";

    const palavrasChave =
      empresa.palavras_chave?.toLowerCase() ?? "";

    const categorias = labelsCategoriasNegocio(
      empresa.categorias,
    )
      .join(" ")
      .toLowerCase();

    return (
      nome.includes(termoBusca) ||
      cidade.includes(termoBusca) ||
      palavrasChave.includes(termoBusca) ||
      categorias.includes(termoBusca)
    );
  });

  const carregando = carregandoProdutos || carregandoEmpresas;

  const encontrouResultados =
    produtos.length > 0 || empresasEncontradas.length > 0;

  return (
    <div className="min-h-screen bg-background">

      {/* CABEÇALHO */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">

          <button
            type="button"
            onClick={() => router.history.back()}
            aria-label="Voltar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background transition hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold sm:text-lg">
              Resultados para "{q}"
            </h1>
          </div>

        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">

        {!termo && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="mb-4 h-10 w-10 text-muted-foreground" />

            <h2 className="text-lg font-semibold">
              O que você está procurando?
            </h2>

            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Digite o nome de um produto, empresa ou categoria para encontrar resultados no Trapeza.
            </p>

            <Link
              to="/"
              className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Explorar empresas
            </Link>
          </div>
        )}

        {termo && (
          <div className="space-y-10">

            {/* PRODUTOS */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />

                <h2 className="text-lg font-bold">
                  Produtos
                </h2>

                {!carregandoProdutos && produtos.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({produtos.length})
                  </span>
                )}
              </div>

              {carregandoProdutos && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse overflow-hidden rounded-xl border border-border/60"
                    >
                      <div className="aspect-square bg-muted" />

                      <div className="space-y-2 p-3">
                        <div className="h-4 w-3/4 rounded bg-muted" />
                        <div className="h-3 w-1/2 rounded bg-muted" />
                        <div className="h-4 w-1/3 rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {erroProdutos && (
                <p className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                  Não foi possível carregar os produtos. Tente novamente.
                </p>
              )}

              {!carregandoProdutos &&
                !erroProdutos &&
                produtos.length === 0 && (
                  <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                    Nenhum produto encontrado para essa pesquisa.
                  </p>
                )}

              {!carregandoProdutos && produtos.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                  {produtos.map((produto) => (
                    <Link
                      key={`${produto.empresaId}-${produto.produtoId}`}
                      to="/s/$slug/product/$id"
                      params={{
                        slug: produto.empresaSlug,
                        id: String(produto.produtoId),
                      }}
                      className="group min-w-0 overflow-hidden rounded-xl border border-border/60 bg-card transition hover:border-border hover:shadow-md"
                    >
                      {produto.imagemUrl ? (
                        <img
                          src={produto.imagemUrl}
                          alt={produto.nome}
                          loading="lazy"
                          className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex aspect-square items-center justify-center bg-muted">
                          <Package className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      )}

                      <div className="space-y-1.5 p-3">
                        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
                          {produto.nome}
                        </h3>

                        <p className="truncate text-xs text-muted-foreground">
                          {produto.empresaNome}
                        </p>

                        <p className="text-base font-bold">
                          {brl(produto.precoAtual)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* EMPRESAS */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Store className="h-5 w-5 text-muted-foreground" />

                <h2 className="text-lg font-bold">
                  Empresas
                </h2>

                {!carregandoEmpresas && empresasEncontradas.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({empresasEncontradas.length})
                  </span>
                )}
              </div>

              {carregandoEmpresas && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-48 animate-pulse rounded-xl bg-muted"
                    />
                  ))}
                </div>
              )}

              {erroEmpresas && (
                <p className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                  Não foi possível carregar as empresas.
                </p>
              )}

              {!carregandoEmpresas &&
                !erroEmpresas &&
                empresasEncontradas.length === 0 && (
                  <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                    Nenhuma empresa relacionada encontrada.
                  </p>
                )}

              {!carregandoEmpresas && empresasEncontradas.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                  {empresasEncontradas.map((empresa) => (
                    <div
                      key={empresa.id}
                      className="min-w-0 w-full"
                    >
                      <BusinessCard
                        empresa={empresa}
                        variant="grid"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* NENHUM RESULTADO */}
            {!carregando &&
              !erroProdutos &&
              !erroEmpresas &&
              !encontrouResultados && (
                <div className="flex flex-col items-center py-10 text-center">
                  <Search className="mb-3 h-9 w-9 text-muted-foreground/50" />

                  <h2 className="font-semibold">
                    Não encontramos "{q}"
                  </h2>

                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Tente pesquisar com outro nome ou uma palavra mais simples.
                  </p>

                  <Link
                    to="/"
                    className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                  >
                    Explorar Trapeza
                  </Link>
                </div>
              )}

          </div>
        )}
      </main>
    </div>
  );
}