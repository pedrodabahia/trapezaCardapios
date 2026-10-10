import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, Search, Tag, Store } from "lucide-react";

import {
  listarPromocoes,
  listarCategoriasPromocao,
} from "@/modules/promocoes/controllers/promocao.controller";

import { getAnunciosHome } from "@/lib/admin-server";
import { PromoCarousel } from "@/components/home/PromoCarousel";

export const Route = createFileRoute("/promocoes/")({
  component: PaginaPromocoes,
});

function formatarPreco(valor: number | null | undefined) {
  if (valor == null) return null;

  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

type PromocaoLista = Awaited<ReturnType<typeof listarPromocoes>>[number];

function OfertaCard({
  promocao,
  modo = "grade",
}: {
  promocao: PromocaoLista;
  modo?: "grade" | "carrossel";
}) {
  const precoAtual = formatarPreco(promocao.preco_promocional);
  const precoAnterior = formatarPreco(promocao.preco_anterior);

  const largura =
    modo === "carrossel"
      ? "w-[160px] sm:w-[200px] md:w-[220px]"
      : "w-full min-w-0";

  return (
    <Link
      to="/promocoes/$slug"
      params={{ slug: promocao.slug }}
      className={`group ${largura} shrink-0 overflow-hidden rounded-xl border bg-card transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {promocao.imagem_url ? (
          <img
            src={promocao.imagem_url}
            alt={promocao.titulo}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Tag size={34} className="text-muted-foreground" />
          </div>
        )}

        {promocao.destaque && (
          <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-1 text-[10px] font-bold text-black">
            DESTAQUE
          </span>
        )}
      </div>

      <div className="min-w-0 space-y-1.5 p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold">
          {promocao.titulo}
        </h3>

        <p className="truncate text-xs text-muted-foreground">
          {promocao.empresa_nome}
        </p>

        {precoAtual && (
          <p className="text-base font-bold text-green-700 dark:text-green-400">
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
}

function CarrosselOfertas({
  titulo,
  ofertas,
  descricao,
}: {
  titulo: string;
  ofertas: PromocaoLista[];
  descricao?: string;
}) {
  if (ofertas.length === 0) return null;

  return (
    <section className="mb-8 w-full min-w-0">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold sm:text-xl">
            {titulo}
          </h2>

          {descricao && (
            <p className="mt-1 text-sm text-muted-foreground">
              {descricao}
            </p>
          )}
        </div>

        <span className="shrink-0 text-xs text-muted-foreground">
          {ofertas.length} {ofertas.length === 1 ? "oferta" : "ofertas"}
        </span>
      </div>

      {/* A rolagem horizontal fica restrita a este contêiner. */}
      <div
  className="carrossel-sem-barra w-full min-w-0 overflow-x-auto overscroll-x-contain pb-3"
>
        <div className="flex w-max gap-3 px-1 sm:gap-4">
          {ofertas.map((promocao) => (
            <OfertaCard
              key={promocao.id}
              promocao={promocao}
              modo="carrossel"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function GradeOfertas({
  ofertas,
  titulo = "Todas as ofertas",
}: {
  ofertas: PromocaoLista[];
  titulo?: string;
}) {
  if (ofertas.length === 0) return null;

  return (
    <section className="mt-6 w-full min-w-0">
      <div className="mb-4 flex items-center gap-2">
        <Store size={20} className="shrink-0 text-orange-600" />
        <h2 className="font-display text-xl font-bold">{titulo}</h2>
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {ofertas.map((promocao) => (
          <OfertaCard
            key={promocao.id}
            promocao={promocao}
            modo="grade"
          />
        ))}
      </div>
    </section>
  );
}

function PaginaPromocoes() {
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState<string | null>(null);

  const {
    data: promocoes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["promocoes-lista"],
    queryFn: () => listarPromocoes({ data: { limite: 100 } }),
    staleTime: 30_000,
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["promocoes-categorias"],
    queryFn: () => listarCategoriasPromocao({ data: {} }),
    staleTime: 60_000,
  });

  const { data: anuncios = [] } = useQuery({
    queryKey: ["anuncios-home-promocoes"],
    queryFn: () => getAnunciosHome({ data: {} }),
    staleTime: 60_000,
  });

  // Mostra somente categorias ativas que tenham ofertas nesta listagem.
  const categoriasAtivas = useMemo(() => {
    const categoriasComOfertas = new Set(
      promocoes
        .map((promocao) => promocao.categoria_negocio_id)
        .filter((id): id is string => Boolean(id)),
    );

    return [...categorias]
      .filter(
        (categoria) =>
          categoria.ativo && categoriasComOfertas.has(categoria.id),
      )
      .sort(
        (a, b) =>
          a.ordem - b.ordem ||
          a.nome.localeCompare(b.nome, "pt-BR"),
      );
  }, [categorias, promocoes]);

  const promocoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    return promocoes.filter((promocao) => {
      const textoBusca =
        `${promocao.titulo} ${promocao.empresa_nome}`.toLocaleLowerCase(
          "pt-BR",
        );

      const correspondeBusca = !termo || textoBusca.includes(termo);

      const correspondeCategoria =
        !categoriaSelecionada ||
        promocao.categoria_negocio_id === categoriaSelecionada;

      return correspondeBusca && correspondeCategoria;
    });
  }, [promocoes, busca, categoriaSelecionada]);

  const destaques = useMemo(
    () => promocoesFiltradas.filter((promocao) => promocao.destaque),
    [promocoesFiltradas],
  );

  const ofertasPorEmpresa = useMemo(() => {
    const grupos = new Map<string, PromocaoLista[]>();

    for (const promocao of promocoesFiltradas) {
      const chave = promocao.empresa_slug || promocao.empresa_nome;

      if (!grupos.has(chave)) {
        grupos.set(chave, []);
      }

      grupos.get(chave)!.push(promocao);
    }

    return Array.from(grupos.entries()).map(([chave, ofertas]) => ({
      chave,
      nome: ofertas[0]?.empresa_nome || "Estabelecimento",
      ofertas,
    }));
  }, [promocoesFiltradas]);

  const anunciosTopo = useMemo(
    () => anuncios.filter((anuncio) => String(anuncio.posicao) === "1"),
    [anuncios],
  );

  const temFiltros = Boolean(busca.trim() || categoriaSelecionada);
  const totalOfertas = promocoesFiltradas.length;

  // Até cinco ofertas: grade simples.
  // A partir de dez: destaques e carrosséis por estabelecimento.
  const layoutCompacto = totalOfertas <= 5;
  const layoutComCarrosseis = totalOfertas >= 10;

  // Evita duplicar na grade as ofertas que já aparecem nos carrosséis.
  const idsNosCarrosseis = useMemo(() => {
    const ids = new Set<string>();

    if (!layoutComCarrosseis || temFiltros) {
      return ids;
    }

    destaques.forEach((oferta) => ids.add(oferta.id));

    for (const grupo of ofertasPorEmpresa) {
      const ofertasSemDestaques = grupo.ofertas.filter(
        (oferta) => !oferta.destaque,
      );

      if (ofertasSemDestaques.length >= 2) {
        ofertasSemDestaques.forEach((oferta) => ids.add(oferta.id));
      }
    }

    return ids;
  }, [
    layoutComCarrosseis,
    temFiltros,
    destaques,
    ofertasPorEmpresa,
  ]);

  const ofertasRestantes = useMemo(
    () =>
      promocoesFiltradas.filter(
        (promocao) => !idsNosCarrosseis.has(promocao.id),
      ),
    [promocoesFiltradas, idsNosCarrosseis],
  );

  return (
    <main className="mx-auto min-h-screen w-full min-w-0 max-w-6xl px-4 py-5 pb-24 sm:py-6">
      <Link
        to="/"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft size={18} />
        Voltar para o início
      </Link>

      <header className="mb-6 rounded-2xl bg-orange-50 p-5 dark:bg-orange-950/30 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
            <Tag size={25} />
          </div>

          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold sm:text-3xl">
              Ofertas e Promoções
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Descubra ofertas dos negócios da sua região.
            </p>
          </div>
        </div>
      </header>

      {anunciosTopo.length > 0 && (
        <div className="mb-7 w-full min-w-0">
          <PromoCarousel anuncios={anunciosTopo} />
        </div>
      )}

      {categoriasAtivas.length > 0 && (
        <section className="mb-6 w-full min-w-0">
          <h2 className="mb-3 font-display text-base font-bold">
            Explorar por categoria
          </h2>

          <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain pb-2">
            <div className="flex w-max gap-2 px-1">
              <button
                type="button"
                onClick={() => setCategoriaSelecionada(null)}
                aria-pressed={categoriaSelecionada === null}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                  categoriaSelecionada === null
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "bg-card hover:border-orange-400"
                }`}
              >
                Todas
              </button>

              {categoriasAtivas.map((categoria) => (
                <button
                  key={categoria.id}
                  type="button"
                  onClick={() =>
                    setCategoriaSelecionada((atual) =>
                      atual === categoria.id ? null : categoria.id,
                    )
                  }
                  aria-pressed={categoriaSelecionada === categoria.id}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                    categoriaSelecionada === categoria.id
                      ? "border-orange-500 bg-orange-500 text-white"
                      : "bg-card hover:border-orange-400"
                  }`}
                >
                  {categoria.emoji ? `${categoria.emoji} ` : ""}
                  {categoria.nome}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="relative mb-7 w-full min-w-0">
        <Search
          size={19}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />

        <input
          type="search"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar produto, oferta ou empresa..."
          className="w-full min-w-0 rounded-xl border bg-background py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      {temFiltros && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {totalOfertas}{" "}
            {totalOfertas === 1
              ? "oferta encontrada"
              : "ofertas encontradas"}
          </p>

          <button
            type="button"
            onClick={() => {
              setBusca("");
              setCategoriaSelecionada(null);
            }}
            className="text-sm font-semibold text-orange-600 hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {isLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Carregando ofertas...
        </p>
      ) : isError ? (
        <div className="py-12 text-center">
          <p className="font-semibold">
            Não foi possível carregar as ofertas.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tente novamente em instantes.
          </p>
        </div>
      ) : totalOfertas === 0 ? (
        <div className="rounded-2xl border border-dashed px-5 py-14 text-center">
          <Tag size={32} className="mx-auto mb-3 text-muted-foreground" />

          <h2 className="font-semibold">
            {temFiltros
              ? "Nenhuma oferta encontrada"
              : "Estamos preparando as primeiras ofertas"}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {temFiltros
              ? "Tente outro termo ou selecione uma categoria diferente."
              : "Em breve, você encontrará novas oportunidades dos negócios da região."}
          </p>

          {temFiltros && (
            <button
              type="button"
              onClick={() => {
                setBusca("");
                setCategoriaSelecionada(null);
              }}
              className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Ver todas as ofertas
            </button>
          )}
        </div>
      ) : temFiltros || layoutCompacto ? (
        <GradeOfertas
          ofertas={promocoesFiltradas}
          titulo={temFiltros ? "Resultados" : "Ofertas disponíveis"}
        />
      ) : layoutComCarrosseis ? (
        <>
          {destaques.length > 0 && (
            <CarrosselOfertas
              titulo="Ofertas em destaque"
              descricao="Confira as ofertas selecionadas para você."
              ofertas={destaques}
            />
          )}

          {ofertasPorEmpresa.map((grupo) => {
            const ofertasSemDestaques = grupo.ofertas.filter(
              (oferta) => !oferta.destaque,
            );

            if (ofertasSemDestaques.length < 2) {
              return null;
            }

            return (
              <CarrosselOfertas
                key={grupo.chave}
                titulo={grupo.nome}
                descricao="Ofertas deste estabelecimento"
                ofertas={ofertasSemDestaques}
              />
            );
          })}

          <GradeOfertas
            ofertas={ofertasRestantes}
            titulo="Mais ofertas"
          />
        </>
      ) : (
        <>
          {destaques.length > 0 && (
            <CarrosselOfertas
              titulo="Ofertas em destaque"
              ofertas={destaques}
            />
          )}

          <GradeOfertas
            ofertas={promocoesFiltradas}
            titulo="Todas as ofertas"
          />
        </>
      )}
    </main>
  );
}