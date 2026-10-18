
import { createFileRoute, Link } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { brl } from "@/lib/format";
import type { ProdutoCategoriaPlataforma } from "@/lib/admin-server";
import { listEmpresasPublicasPorCategorias } from "@/modules/empresas/controllers/empresa.controller";
import {
  CATEGORIAS_NEGOCIO,
  useCategoriasNegocio,
} from "@/lib/categorias-negocio";
import { BusinessCard } from "@/components/home/BusinessCard";
import { cn } from "@/lib/utils";
import { LogoLoader } from "@/components/LogoLoader";

const ITENS_POR_PAGINA = 10;
const SITE_URL = "https://trapeza.me";

export const Route = createFileRoute("/categoria/$valor")({
  head: ({ params }) => {
    const categoria = CATEGORIAS_NEGOCIO.find(
      (item) => item.valor === params.valor,
    );

    const tituloCategoria = categoria?.label ?? "Categoria";
    const titulo = `${tituloCategoria} em Posto da Mata | Trapeza`;

    const descricao = categoria
      ? `Encontre empresas, comércios e serviços de ${categoria.label} em Posto da Mata. Explore opções locais no Trapeza e encontre o que procura.`
      : "Encontre empresas, comércios e serviços em Posto da Mata no Trapeza.";

    const url = `${SITE_URL}/categoria/${encodeURIComponent(params.valor)}`;

    return {
      meta: [
        { title: titulo },
        {
          name: "description",
          content: descricao,
        },
        {
          name: "robots",
          content: categoria ? "index, follow" : "noindex, follow",
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "og:site_name",
          content: "Trapeza",
        },
        {
          property: "og:title",
          content: titulo,
        },
        {
          property: "og:description",
          content: descricao,
        },
        {
          property: "og:url",
          content: url,
        },
      ],
      links: [
        {
          rel: "canonical",
          href: url,
        },
      ],
    };
  },
  component: PaginaCategoria,
});

function PaginaCategoria() {
  const { valor } = Route.useParams();
  const { data: categorias = CATEGORIAS_NEGOCIO } =
    useCategoriasNegocio();

  const categoriaClicada = categorias.find(
    (categoria) => categoria.valor === valor,
  );

  const categoriaPai = categoriaClicada?.categoria_pai_id
    ? categorias.find(
        (categoria) =>
          categoria.id === categoriaClicada.categoria_pai_id,
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

  /*
   * Subcategoria: busca somente aquela subcategoria.
   * Categoria principal: inclui a própria categoria e as subcategorias,
   * preservando a compatibilidade com empresas cadastradas anteriormente.
   */
  const categoriasParaBusca = useMemo(() => {
    if (!categoriaClicada) {
      return [];
    }

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

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "empresas-publicas-categoria",
      valor,
      categoriasParaBusca,
    ],

    queryFn: ({ pageParam }) =>
      listEmpresasPublicasPorCategorias({
        data: {
          categorias: categoriasParaBusca,
          limit: ITENS_POR_PAGINA,
          offset: pageParam,
        },
      }),

    initialPageParam: 0,

    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < ITENS_POR_PAGINA
        ? undefined
        : allPages.length * ITENS_POR_PAGINA,

    staleTime: 30_000,
    enabled: Boolean(categoriaClicada && categoriasParaBusca.length > 0),
  });

  const empresas = data?.pages.flat() ?? [];
  const totalItens = empresas.length;

  const titulo = categoriaClicada?.label ?? "Categoria não encontrada";

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
          fetchNextPage();
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(elemento);

    return () => observer.disconnect();
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  ]);

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

          <h1 className="font-display text-base font-bold">
            {titulo}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-5">
        {!categoriaClicada ? (
          <section className="py-12 text-center">
            <h2 className="text-lg font-bold">
              Categoria não encontrada
            </h2>
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
                Encontre empresas e serviços de {titulo.toLowerCase()}.
                Consulte as opções disponíveis e entre em contato
                diretamente com os estabelecimentos.
              </p>

              <nav
                aria-label="Categorias relacionadas"
                className="mt-3 flex gap-2 overflow-x-auto pb-2 no-scrollbar"
              >
                <FiltroCategoria
                  label="Todas"
                  valor={categoriaPai?.valor ?? valor}
                  ativo={valor === categoriaPai?.valor}
                />

                {subcategorias.map((categoria) => (
                  <FiltroCategoria
                    key={categoria.id}
                    label={categoria.label}
                    valor={categoria.valor}
                    ativo={valor === categoria.valor}
                  />
                ))}
              </nav>
            </section>

            {isLoading ? (
              <div className="flex w-full justify-center py-10">
                <LogoLoader />
              </div>
            ) : totalItens === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Ainda não há empresas disponíveis nessa categoria.
              </p>
            ) : (
              <>
                <p className="pb-3 text-xs text-muted-foreground">
                  {totalItens}{" "}
                  {totalItens === 1
                    ? "resultado carregado"
                    : "resultados carregados"}
                </p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {empresas.map((empresa) => (
                    <BusinessCard
                      key={empresa.id}
                      empresa={empresa}
                      variant="grid"
                    />
                  ))}
                </div>

                <div
                  ref={carregarMaisRef}
                  className="py-8 text-center"
                >
                  {isFetchingNextPage && (
                    <p className="text-sm text-muted-foreground">
                      Carregando mais empresas...
                    </p>
                  )}

                  {!hasNextPage && empresas.length > 0 && (
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
}: {
  label: string;
  valor: string;
  ativo: boolean;
}) {
  return (
    <Link
      to="/categoria/$valor"
      params={{ valor }}
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

function ProdutoCard({
  produto,
}: {
  produto: ProdutoCategoriaPlataforma;
}) {
  return (
    <Link
      to="/s/$slug/product/$id"
      params={{
        slug: produto.empresaSlug,
        id: produto.produtoId,
      }}
      className="group block"
    >
      <Card className="h-full overflow-hidden transition group-hover:-translate-y-0.5 group-hover:shadow-md">
        <div className="aspect-square overflow-hidden bg-muted">
          {produto.imagemUrl ? (
            <img
              src={produto.imagemUrl}
              alt={produto.nome}
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50 text-3xl">
              🍽️
            </div>
          )}
        </div>

        <CardContent className="space-y-1 p-3">
          <h2 className="truncate text-sm font-bold">
            {produto.nome}
          </h2>

          <p className="truncate text-xs text-muted-foreground">
            {produto.empresaNome}
          </p>

          {produto.descricaoCurta && (
            <p className="line-clamp-2 text-[11px] text-muted-foreground">
              {produto.descricaoCurta}
            </p>
          )}

          <p className="text-sm font-extrabold text-brand-brown">
            {brl(produto.precoAtual)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
