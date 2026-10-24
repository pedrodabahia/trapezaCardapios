import { createFileRoute, Link } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { getCategoriasNegocio } from "@/modules/categorias-negocio/controllers/categoria-negocio.controller";
import { listEmpresasPublicasPorCategorias } from "@/modules/empresas/controllers/empresa.controller";
import {
  buscarCategoriaProdutoPublica,
  listarCatalogoPorCategoriaProduto,
  listarCatalogoPorCategoriasNegocio,
} from "@/modules/produtos/controllers/produto.controller";
import { useCategoriasNegocio } from "@/lib/categorias-negocio";
import { BusinessCard } from "@/components/home/BusinessCard";
import { Card, CardContent } from "@/components/ui/card";
import { brl } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LogoLoader } from "@/components/LogoLoader";

const ITENS_POR_PAGINA = 80;
const SITE_URL = "https://trapeza.me";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// O parâmetro da URL pode ser o UUID de uma categoria de produto
// (?tipo=produto) ou o valor/slug de uma categoria de negócio.
function ehUuid(valor: string) {
  return UUID_REGEX.test(valor);
}

type TipoCatalogo = "produto" | "servico";

type Empresas = Awaited<ReturnType<typeof listEmpresasPublicasPorCategorias>>;

type ItemCatalogo = {
  produtoId: string;
  tipo: TipoCatalogo;
  nome: string;
  descricaoCurta: string | null;
  precoAtual: number;
  precoAntigo: number | null;
  imagemUrl: string | null;
  empresaId: string;
  empresaNome: string;
  empresaSlug: string;
  categoriaId: string | null;
  categoriaNome: string;
};

type GrupoCatalogo = {
  categoriaId: string | null;
  categoriaNome: string;
  itens: ItemCatalogo[];
};

export const Route = createFileRoute("/categoria/$valor")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { tipo?: TipoCatalogo } => ({
    tipo:
      search.tipo === "produto" || search.tipo === "servico"
        ? search.tipo
        : undefined,
  }),

  loaderDeps: ({ search }) => ({ tipo: search.tipo }),

  loader: async ({ params, deps }) => {
    const categorias = await getCategoriasNegocio({ data: {} });

    // Categoria de PRODUTO: só quando o parâmetro é um UUID.
    if (deps.tipo === "produto" && ehUuid(params.valor)) {
      const categoriaProduto = await buscarCategoriaProdutoPublica({
        data: { categoriaId: params.valor },
      }).catch(() => null);

      return {
        categorias,
        categoria: null,
        categoriaProduto,
        categoriasParaBusca: [] as string[],
        empresas: [] as Empresas,
      };
    }

    // Categoria de NEGÓCIO (empresas, produtos ou serviços).
    const categoria = categorias.find(
      (item) => item.valor === params.valor && item.ativo,
    );

    if (!categoria) {
      return {
        categorias,
        categoria: null,
        categoriaProduto: null,
        categoriasParaBusca: [] as string[],
        empresas: [] as Empresas,
      };
    }

    const categoriaPai = categoria.categoria_pai_id
      ? categorias.find((item) => item.id === categoria.categoria_pai_id)
      : categoria;

    const subcategorias = categoriaPai
      ? categorias.filter(
          (item) => item.categoria_pai_id === categoriaPai.id,
        )
      : [];

    const categoriasParaBusca = categoria.categoria_pai_id
      ? [categoria.valor]
      : [
          ...new Set([
            categoria.valor,
            ...subcategorias.map((item) => item.valor),
          ]),
        ];

    // No modo catálogo (produto/serviço) as empresas não são usadas,
    // então evitamos a consulta.
    const empresas: Empresas = deps.tipo
      ? ([] as Empresas)
      : await listEmpresasPublicasPorCategorias({
          data: {
            categorias: categoriasParaBusca,
            limit: ITENS_POR_PAGINA,
            offset: 0,
          },
        });

    return {
      categorias,
      categoria,
      categoriaProduto: null,
      categoriasParaBusca,
      empresas,
    };
  },

  head: ({ params, loaderData }) => {
    const categoria = loaderData?.categorias?.find(
      (item) => item.valor === params.valor && item.ativo,
    );

    const categoriaProduto = loaderData?.categoriaProduto;
    const ehCategoriaProduto = Boolean(categoriaProduto?.id === params.valor);
    const tituloCategoria = ehCategoriaProduto
      ? categoriaProduto?.nome ?? "Categoria"
      : categoria?.label ?? "Categoria";
    const categoriaExiste = Boolean(categoria || ehCategoriaProduto);
    const titulo = categoriaExiste
      ? `${tituloCategoria} em Posto da Mata - BA | Trapeza`
      : "Categoria não encontrada | Trapeza";

    const descricao = categoriaExiste
      ? `Encontre ${tituloCategoria.toLowerCase()} em Posto da Mata, Bahia. Veja empresas, produtos e serviços, conheça as opções e entre em contato pelo Trapeza.`
      : "Essa categoria não existe ou não está disponível no Trapeza.";

    const url = `${SITE_URL}/categoria/${encodeURIComponent(params.valor)}`;

    return {
      meta: [
        { title: titulo },
        { name: "description", content: descricao.slice(0, 160) },
        {
          name: "robots",
          content: categoriaExiste
            ? "index, follow, max-image-preview:large"
            : "noindex, follow",
        },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Trapeza" },
        { property: "og:locale", content: "pt_BR" },
        { property: "og:title", content: titulo },
        { property: "og:description", content: descricao.slice(0, 160) },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: titulo },
        { name: "twitter:description", content: descricao.slice(0, 160) },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },

  component: PaginaCategoria,
});

function agruparItensPorCategoria(itens: ItemCatalogo[]): GrupoCatalogo[] {
  const grupos = new Map<string, GrupoCatalogo>();

  for (const item of itens) {
    const categoriaNome = item.categoriaNome?.trim() || "Outros";
    const categoriaId = item.categoriaId ?? null;
    const chave = categoriaId ?? categoriaNome.toLocaleLowerCase("pt-BR");

    const grupoExistente = grupos.get(chave);

    if (grupoExistente) {
      grupoExistente.itens.push(item);
      continue;
    }

    grupos.set(chave, {
      categoriaId,
      categoriaNome,
      itens: [item],
    });
  }

  return [...grupos.values()].sort((a, b) =>
    a.categoriaNome.localeCompare(b.categoriaNome, "pt-BR"),
  );
}

function CartaoCatalogo({ produto }: { produto: ItemCatalogo }) {
  return (
    <Link
      to="/s/$slug/product/$id"
      params={{
        slug: produto.empresaSlug,
        id: produto.produtoId,
      }}
      className="group block min-w-0"
    >
      <Card className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="aspect-square overflow-hidden bg-muted">
          {produto.imagemUrl ? (
            <img
              src={produto.imagemUrl}
              alt={produto.nome}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl">
              {produto.tipo === "servico" ? "🛠️" : "🛍️"}
            </div>
          )}
        </div>

        <CardContent className="space-y-1 p-2.5">
          <h3 className="truncate text-xs font-semibold">{produto.nome}</h3>

          <p className="truncate text-[11px] text-muted-foreground">
            {produto.empresaNome}
          </p>

          <p className="line-clamp-2 min-h-8 text-[11px] text-muted-foreground">
            {produto.descricaoCurta}
          </p>

          <p
            className="text-xs font-bold"
            style={{ color: "var(--tp-orange, #c65d3a)" }}
          >
            {produto.tipo === "servico" && produto.precoAtual <= 0
              ? "Consultar valor"
              : brl(produto.precoAtual)}

            {produto.precoAntigo != null &&
            produto.precoAntigo > produto.precoAtual ? (
              <span className="ml-1 font-normal text-muted-foreground line-through">
                {brl(produto.precoAntigo)}
              </span>
            ) : null}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function CarrosselCategoria({ grupo }: { grupo: GrupoCatalogo }) {
  const idCarrossel = `catalogo-${grupo.categoriaId ?? grupo.categoriaNome}`;

  return (
    <section aria-label={grupo.categoriaNome}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold">
            {grupo.categoriaNome}
          </h3>
          <p className="text-xs text-muted-foreground">
            {grupo.itens.length} {grupo.itens.length === 1 ? "item" : "itens"}
          </p>
        </div>

        <div className="hidden gap-1 sm:flex">
          <button
            type="button"
            aria-label={`Rolar ${grupo.categoriaNome} para a esquerda`}
            onClick={() =>
              document
                .getElementById(idCarrossel)
                ?.scrollBy({ left: -320, behavior: "smooth" })
            }
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label={`Rolar ${grupo.categoriaNome} para a direita`}
            onClick={() =>
              document
                .getElementById(idCarrossel)
                ?.scrollBy({ left: 320, behavior: "smooth" })
            }
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        id={idCarrossel}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3"
      >
        {grupo.itens.map((produto) => (
          <div
            key={`${produto.empresaId}-${produto.produtoId}`}
            className="w-[155px] shrink-0 snap-start sm:w-[190px]"
          >
            <CartaoCatalogo produto={produto} />
          </div>
        ))}
      </div>
    </section>
  );
}

function PaginaCategoria() {
  const { valor } = Route.useParams();
  const tipo: TipoCatalogo | undefined = Route.useSearch().tipo;

  const loaderData = Route.useLoaderData();

  const { data: categorias = loaderData.categorias } =
    useCategoriasNegocio();

  const categoriaClicada = categorias.find(
    (categoria) => categoria.valor === valor && categoria.ativo,
  );
  const categoriaProduto = loaderData.categoriaProduto;

  // UUID + tipo=produto: categoria de produto. Qualquer outro caso
  // usa a categoria de negócio.
  const ehCategoriaProduto = tipo === "produto" && ehUuid(valor);
  const categoriaValida = ehCategoriaProduto
    ? Boolean(categoriaProduto && categoriaProduto.id === valor)
    : Boolean(categoriaClicada);

  const categoriaPai = categoriaClicada?.categoria_pai_id
    ? categorias.find(
        (categoria) => categoria.id === categoriaClicada.categoria_pai_id,
      )
    : categoriaClicada;

  const subcategorias = useMemo(
    () =>
      categoriaPai
        ? categorias.filter(
            (categoria) =>
              categoria.categoria_pai_id === categoriaPai.id,
          )
        : [],
    [categorias, categoriaPai],
  );

  const categoriasParaBusca = useMemo(() => {
    if (!categoriaClicada) return [];

    if (categoriaClicada.categoria_pai_id) {
      return [categoriaClicada.valor];
    }

    return [
      ...new Set([
        categoriaClicada.valor,
        ...subcategorias.map((categoria) => categoria.valor),
      ]),
    ];
  }, [categoriaClicada, subcategorias]);

  const modoCatalogo = tipo === "produto" || tipo === "servico";

  const queryEmpresas = useInfiniteQuery({
    queryKey: ["empresas-publicas-categoria", valor, categoriasParaBusca],
    queryFn: ({ pageParam }) =>
      listEmpresasPublicasPorCategorias({
        data: {
          categorias: categoriasParaBusca,
          limit: ITENS_POR_PAGINA,
          offset: pageParam,
        },
      }),
    initialPageParam: 0,
    getNextPageParam: (ultimaPagina, todasPaginas) =>
      ultimaPagina.length < ITENS_POR_PAGINA
        ? undefined
        : todasPaginas.length * ITENS_POR_PAGINA,
    staleTime: 30_000,
    enabled: Boolean(
      categoriaClicada &&
        !modoCatalogo &&
        categoriasParaBusca.length > 0,
    ),
    initialData: () => {
      if (
        modoCatalogo ||
        loaderData.categoria?.valor !== valor ||
        JSON.stringify(loaderData.categoriasParaBusca) !==
          JSON.stringify(categoriasParaBusca)
      ) {
        return undefined;
      }

      return {
        pages: [loaderData.empresas],
        pageParams: [0] as number[],
      };
    },
  });

  const queryCatalogo = useInfiniteQuery({
    queryKey: [
      "catalogo-publico-categoria",
      valor,
      tipo,
      ehCategoriaProduto,
      categoriasParaBusca,
    ],
    queryFn: ({ pageParam }) => {
      // Categoria de produto (UUID).
      if (ehCategoriaProduto) {
        return listarCatalogoPorCategoriaProduto({
          data: {
            categoriaId: valor,
            tipo: "produto",
            limite: ITENS_POR_PAGINA,
            offset: pageParam,
          },
        });
      }

      // Categoria de negócio: produtos ou serviços.
      return listarCatalogoPorCategoriasNegocio({
        data: {
          categorias: categoriasParaBusca,
          tipo: tipo === "produto" ? "produto" : "servico",
          limite: ITENS_POR_PAGINA,
          offset: pageParam,
        },
      });
    },
    initialPageParam: 0,
    getNextPageParam: (ultimaPagina, todasPaginas) =>
      ultimaPagina.length < ITENS_POR_PAGINA
        ? undefined
        : todasPaginas.length * ITENS_POR_PAGINA,
    staleTime: 30_000,
    enabled: Boolean(
      ehCategoriaProduto
        ? categoriaProduto && categoriaProduto.id === valor
        : categoriaClicada && modoCatalogo && categoriasParaBusca.length > 0,
    ),
  });

  const empresas = queryEmpresas.data?.pages.flat() ?? [];
  const itensCatalogo = (queryCatalogo.data?.pages.flat() ??
    []) as ItemCatalogo[];

  const gruposCatalogo = useMemo(
    () => agruparItensPorCategoria(itensCatalogo),
    [itensCatalogo],
  );

  // A decisão considera as categorias distintas entre os itens carregados.
  const usarCarrosseis = gruposCatalogo.length > 2;

  const isLoading = modoCatalogo
    ? queryCatalogo.isLoading
    : queryEmpresas.isLoading;

  const isFetchingNextPage = modoCatalogo
    ? queryCatalogo.isFetchingNextPage
    : queryEmpresas.isFetchingNextPage;

  const fetchNextPage = modoCatalogo
    ? queryCatalogo.fetchNextPage
    : queryEmpresas.fetchNextPage;

  const hasNextPage = modoCatalogo
    ? queryCatalogo.hasNextPage
    : queryEmpresas.hasNextPage;

  const totalItens = modoCatalogo ? itensCatalogo.length : empresas.length;
  const titulo = ehCategoriaProduto
    ? categoriaProduto?.nome ?? "Categoria não encontrada"
    : categoriaClicada?.label ?? "Categoria não encontrada";

  const carregarMaisRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const elemento = carregarMaisRef.current;

    if (
      !elemento ||
      !hasNextPage ||
      isFetchingNextPage ||
      isLoading
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchNextPage();
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(elemento);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading]);

  const tituloConteudo = modoCatalogo
    ? tipo === "servico"
      ? "Serviços disponíveis"
      : "Produtos disponíveis"
    : "Empresas disponíveis";

  return (
    <div className="trapeza-home min-h-screen bg-background pb-10">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link
            to="/"
            aria-label="Voltar para o início"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>

          <div className="min-w-0">
            <h1 className="truncate font-display text-base font-bold">
              {titulo}
            </h1>

            {modoCatalogo && (
              <p className="text-[11px] text-muted-foreground">
                {tipo === "servico"
                  ? "Catálogo de serviços"
                  : "Catálogo de produtos"}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-5">
        {!categoriaValida ? (
          <section className="py-12 text-center">
            <h2 className="text-lg font-bold">Categoria não encontrada</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Essa categoria não existe ou não está disponível.
            </p>

            <Link
              to="/"
              className="mt-4 inline-block text-sm font-semibold underline"
            >
              Voltar para o início
            </Link>
          </section>
        ) : (
          <>
            <section className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Explore {titulo} em Posto da Mata
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {modoCatalogo
                  ? `Encontre ${
                      tipo === "servico" ? "serviços" : "produtos"
                    } oferecidos pelas empresas de ${titulo.toLowerCase()}. Consulte as opções e entre em contato diretamente com os estabelecimentos.`
                  : `Encontre empresas e serviços de ${titulo.toLowerCase()}. Consulte as opções disponíveis e entre em contato diretamente com os estabelecimentos.`}
              </p>

              {!ehCategoriaProduto && (
                <nav
                  aria-label="Categorias relacionadas"
                  className="mt-3 flex gap-2 overflow-x-auto pb-2 no-scrollbar"
                >
                  <FiltroCategoria
                    label="Todas"
                    valor={categoriaPai?.valor ?? valor}
                    ativo={valor === categoriaPai?.valor}
                    tipo={tipo}
                  />

                  {subcategorias.map((categoria) => (
                    <FiltroCategoria
                      key={categoria.id}
                      label={categoria.label}
                      valor={categoria.valor}
                      ativo={valor === categoria.valor}
                      tipo={tipo}
                    />
                  ))}
                </nav>
              )}

              {/* Alternância Produtos / Serviços / Empresas da categoria de negócio */}
              {modoCatalogo && !ehCategoriaProduto && (
                <div className="mt-4 flex gap-2">
                  <Link
                    to="/categoria/$valor"
                    params={{ valor }}
                    search={{ tipo: "produto" }}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition",
                      tipo === "produto"
                        ? "border-brand-brown bg-brand-brown text-white"
                        : "border-border bg-card hover:border-brand-brown/50",
                    )}
                  >
                    Produtos
                  </Link>

                  <Link
                    to="/categoria/$valor"
                    params={{ valor }}
                    search={{ tipo: "servico" }}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition",
                      tipo === "servico"
                        ? "border-brand-brown bg-brand-brown text-white"
                        : "border-border bg-card hover:border-brand-brown/50",
                    )}
                  >
                    Serviços
                  </Link>

                  <Link
                    to="/categoria/$valor"
                    params={{ valor }}
                    search={{ tipo: undefined }}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:border-brand-brown/50"
                  >
                    Empresas
                  </Link>
                </div>
              )}
            </section>

            <h2 className="mb-3 text-sm font-bold">{tituloConteudo}</h2>

            {isLoading ? (
              <div className="flex w-full justify-center py-10">
                <LogoLoader />
              </div>
            ) : totalItens === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {modoCatalogo
                  ? `Ainda não há ${
                      tipo === "servico" ? "serviços" : "produtos"
                    } disponíveis nessa categoria.`
                  : "Ainda não há empresas disponíveis nessa categoria."}
              </p>
            ) : (
              <>
                <p className="pb-3 text-xs text-muted-foreground">
                  {totalItens}{" "}
                  {totalItens === 1
                    ? "resultado carregado"
                    : "resultados carregados"}
                </p>

                {modoCatalogo ? (
                  usarCarrosseis ? (
                    <div className="space-y-7">
                      {gruposCatalogo.map((grupo) => (
                        <CarrosselCategoria
                          key={grupo.categoriaId ?? grupo.categoriaNome}
                          grupo={grupo}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {itensCatalogo.map((produto) => (
                        <CartaoCatalogo
                          key={`${produto.empresaId}-${produto.produtoId}`}
                          produto={produto}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {empresas.map((empresa) => (
                      <BusinessCard
                        key={empresa.id}
                        empresa={empresa}
                        variant="grid"
                      />
                    ))}
                  </div>
                )}

                <div ref={carregarMaisRef} className="py-8 text-center">
                  {isFetchingNextPage && (
                    <p className="text-sm text-muted-foreground">
                      Carregando mais{" "}
                      {modoCatalogo
                        ? tipo === "servico"
                          ? "serviços"
                          : "produtos"
                        : "empresas"}
                      ...
                    </p>
                  )}

                  {!hasNextPage && totalItens > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Você chegou ao fim.
                    </p>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function FiltroCategoria({
  label,
  valor,
  ativo,
  tipo,
}: {
  label: string;
  valor: string;
  ativo: boolean;
  tipo?: TipoCatalogo;
}) {
  return (
    <Link
      to="/categoria/$valor"
      params={{ valor }}
      search={{ tipo: tipo ?? undefined }}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
        ativo
          ? "border-brand-brown bg-brand-brown text-white"
          : "border-border bg-card text-foreground hover:border-brand-brown/50",
      )}
    >
      {label}
    </Link>
  );
}