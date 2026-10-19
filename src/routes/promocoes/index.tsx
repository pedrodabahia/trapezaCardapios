import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search, Tag, Store } from "lucide-react";

import {
  listarPromocoes,
  listarCategoriasPromocao,
} from "@/modules/promocoes/controllers/promocao.controller";

import { getAnunciosHome } from "@/lib/admin-server";
import { PromoCarousel } from "@/components/home/PromoCarousel";
import { PromoCard } from "@/components/promocoes/Promocard";
import {
  calcularDesconto,
  registrarEvento,
} from "@/modules/promocoes/utils/promocao-utils.ts";

const SITE_URL = "https://trapeza.me";
const TITULO_PROMOCOES = "Ofertas e promoções em Posto da Mata | Trapeza";
const DESCRICAO_PROMOCOES = "Confira ofertas e promoções de lojas, restaurantes e serviços em Posto da Mata, Bahia. Compare preços e fale diretamente com as empresas pelo Trapeza.";

export const Route = createFileRoute("/promocoes/")({
  loader: async () => ({
    promocoes: await listarPromocoes({ data: { limite: 100 } }),
  }),
  head: () => ({
    meta: [
      { title: TITULO_PROMOCOES },
      { name: "description", content: DESCRICAO_PROMOCOES },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Trapeza" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:title", content: TITULO_PROMOCOES },
      { property: "og:description", content: DESCRICAO_PROMOCOES },
      { property: "og:url", content: `${SITE_URL}/promocoes` },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: TITULO_PROMOCOES },
      { name: "twitter:description", content: DESCRICAO_PROMOCOES },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/promocoes` }],
  }),
  component: PaginaPromocoes,
});

type PromocaoLista = Awaited<ReturnType<typeof listarPromocoes>>[number];
type Ordenacao = "relevancia" | "desconto" | "termina" | "preco";

const OPCOES_ORDEM: { valor: Ordenacao; label: string }[] = [
  { valor: "relevancia", label: "Em destaque" },
  { valor: "desconto", label: "Maior desconto" },
  { valor: "termina", label: "Termina primeiro" },
  { valor: "preco", label: "Menor preço" },
];

function percentual(p: PromocaoLista) {
  return calcularDesconto(p.preco_promocional, p.preco_anterior)?.percentual ?? 0;
}

function fimEmMs(p: PromocaoLista) {
  if (!p.fim_em) return Number.POSITIVE_INFINITY;
  const t = new Date(p.fim_em).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

function CarrosselOfertas({
  titulo,
  ofertas,
  descricao,
  origem,
}: {
  titulo: string;
  ofertas: PromocaoLista[];
  descricao?: string;
  origem: string;
}) {
  if (ofertas.length === 0) return null;

  return (
    <section className="mb-8 w-full min-w-0">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold sm:text-xl">{titulo}</h2>
          {descricao && (
            <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>
          )}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {ofertas.length} {ofertas.length === 1 ? "oferta" : "ofertas"}
        </span>
      </div>

      <div className="carrossel-sem-barra w-full min-w-0 snap-x snap-mandatory overflow-x-auto overscroll-x-contain pb-3">
        <div className="flex w-max gap-3 px-1 sm:gap-4">
          {ofertas.map((promocao) => (
            <PromoCard
              key={promocao.id}
              promocao={promocao}
              modo="carrossel"
              origem={origem}
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
          <PromoCard key={promocao.id} promocao={promocao} modo="grade" origem="lista" />
        ))}
      </div>
    </section>
  );
}

function PaginaPromocoes() {
  const loaderData = Route.useLoaderData();
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState<string | null>(null);
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("relevancia");

  useEffect(() => {
    registrarEvento("promo_lista_view");
  }, []);

  const {
    data: promocoes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["promocoes-lista"],
    queryFn: () => listarPromocoes({ data: { limite: 100 } }),
    initialData: loaderData.promocoes,
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
          a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR"),
      );
  }, [categorias, promocoes]);

  const promocoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    const filtradas = promocoes.filter((promocao) => {
      const textoBusca =
        `${promocao.titulo} ${promocao.empresa_nome}`.toLocaleLowerCase("pt-BR");
      const correspondeBusca = !termo || textoBusca.includes(termo);
      const correspondeCategoria =
        !categoriaSelecionada ||
        promocao.categoria_negocio_id === categoriaSelecionada;
      return correspondeBusca && correspondeCategoria;
    });

    const lista = [...filtradas];
    if (ordenacao === "desconto") {
      lista.sort((a, b) => percentual(b) - percentual(a));
    } else if (ordenacao === "termina") {
      lista.sort((a, b) => fimEmMs(a) - fimEmMs(b));
    } else if (ordenacao === "preco") {
      lista.sort(
        (a, b) =>
          (a.preco_promocional ?? Number.POSITIVE_INFINITY) -
          (b.preco_promocional ?? Number.POSITIVE_INFINITY),
      );
    }
    return lista;
  }, [promocoes, busca, categoriaSelecionada, ordenacao]);

  const destaques = useMemo(
    () => promocoesFiltradas.filter((promocao) => promocao.destaque),
    [promocoesFiltradas],
  );

  const ofertasPorEmpresa = useMemo(() => {
    const grupos = new Map<string, PromocaoLista[]>();

    for (const promocao of promocoesFiltradas) {
      const chave = promocao.empresa_slug || promocao.empresa_nome;
      if (!grupos.has(chave)) grupos.set(chave, []);
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
  const ordenado = ordenacao !== "relevancia";
  const totalOfertas = promocoesFiltradas.length;

  const layoutCompacto = totalOfertas <= 5;
  const layoutComCarrosseis = totalOfertas >= 10;

  // Quando a pessoa ordena, mostramos uma grade única na ordem escolhida.
  const usarGradeSimples = temFiltros || ordenado || layoutCompacto;

  const idsNosCarrosseis = useMemo(() => {
    const ids = new Set<string>();
    if (!layoutComCarrosseis || usarGradeSimples) return ids;

    destaques.forEach((oferta) => ids.add(oferta.id));

    for (const grupo of ofertasPorEmpresa) {
      const semDestaque = grupo.ofertas.filter((o) => !o.destaque);
      if (semDestaque.length >= 2) semDestaque.forEach((o) => ids.add(o.id));
    }
    return ids;
  }, [layoutComCarrosseis, usarGradeSimples, destaques, ofertasPorEmpresa]);

  const ofertasRestantes = useMemo(
    () => promocoesFiltradas.filter((p) => !idsNosCarrosseis.has(p.id)),
    [promocoesFiltradas, idsNosCarrosseis],
  );

  function limparFiltros() {
    setBusca("");
    setCategoriaSelecionada(null);
    setOrdenacao("relevancia");
  }

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
              Descontos dos negócios da sua região.
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
                onClick={() => {
                  setCategoriaSelecionada(null);
                  registrarEvento("promo_filtro", { tipo: "categoria", valor: "todas" });
                }}
                aria-pressed={categoriaSelecionada === null}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 ${
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
                  onClick={() => {
                    setCategoriaSelecionada((atual) =>
                      atual === categoria.id ? null : categoria.id,
                    );
                    registrarEvento("promo_filtro", {
                      tipo: "categoria",
                      valor: categoria.nome,
                    });
                  }}
                  aria-pressed={categoriaSelecionada === categoria.id}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 ${
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

      <div className="mb-5 flex w-full min-w-0 flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
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

        <div>
          <label htmlFor="ordenar-ofertas" className="sr-only">
            Ordenar ofertas
          </label>
          <select
            id="ordenar-ofertas"
            value={ordenacao}
            onChange={(event) => {
              const valor = event.target.value as Ordenacao;
              setOrdenacao(valor);
              registrarEvento("promo_filtro", { tipo: "ordem", valor });
            }}
            className="w-full rounded-xl border bg-background px-3 py-3 text-sm font-medium outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 sm:w-auto"
          >
            {OPCOES_ORDEM.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(temFiltros || ordenado) && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {totalOfertas}{" "}
            {totalOfertas === 1 ? "oferta encontrada" : "ofertas encontradas"}
          </p>
          <button
            type="button"
            onClick={limparFiltros}
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
          <p className="font-semibold">Não foi possível carregar as ofertas.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tente novamente em instantes.
          </p>
        </div>
      ) : totalOfertas === 0 ? (
        <div className="rounded-2xl border border-dashed px-5 py-14 text-center">
          <Tag size={32} className="mx-auto mb-3 text-muted-foreground" />
          <h2 className="font-semibold">
            {temFiltros
              ? "Nenhuma oferta nessa categoria hoje"
              : "Estamos preparando as primeiras ofertas"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {temFiltros
              ? "Tente outro termo ou veja todas as ofertas."
              : "Em breve, você encontrará novas oportunidades dos negócios da região."}
          </p>
          {temFiltros && (
            <button
              type="button"
              onClick={limparFiltros}
              className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Ver todas as ofertas
            </button>
          )}
        </div>
      ) : usarGradeSimples ? (
        <GradeOfertas
          ofertas={promocoesFiltradas}
          titulo={
            temFiltros
              ? "Resultados"
              : ordenado
                ? OPCOES_ORDEM.find((o) => o.valor === ordenacao)!.label
                : "Ofertas disponíveis"
          }
        />
      ) : layoutComCarrosseis ? (
        <>
          {destaques.length > 0 && (
            <CarrosselOfertas
              titulo="Ofertas em destaque"
              descricao="Selecionadas para você."
              ofertas={destaques}
              origem="lista_destaque"
            />
          )}

          {ofertasPorEmpresa.map((grupo) => {
            const semDestaque = grupo.ofertas.filter((o) => !o.destaque);
            if (semDestaque.length < 2) return null;
            return (
              <CarrosselOfertas
                key={grupo.chave}
                titulo={grupo.nome}
                descricao="Ofertas deste estabelecimento"
                ofertas={semDestaque}
                origem="lista_empresa"
              />
            );
          })}

          <GradeOfertas ofertas={ofertasRestantes} titulo="Mais ofertas" />
        </>
      ) : (
        <>
          {destaques.length > 0 && (
            <CarrosselOfertas
              titulo="Ofertas em destaque"
              ofertas={destaques}
              origem="lista_destaque"
            />
          )}
          <GradeOfertas ofertas={promocoesFiltradas} titulo="Todas as ofertas" />
        </>
      )}
    </main>
  );
}