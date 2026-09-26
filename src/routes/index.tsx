import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  listEmpresasPublicas,
  getTopProdutosPlataforma,
  getConfigsEmpresas,
  getAnunciosHome,
  buscarProdutosPlataforma,
} from "@/lib/admin-server";

import { getHorarios, isStoreOpenNow } from "@/lib/admin-store";

import {
  labelsCategoriasNegocio,
  useCategoriasNegocio,
  CATEGORIAS_NEGOCIO,
} from "@/lib/categorias-negocio";

import {
  HomeHero,
  TODAS_CIDADES,
} from "@/components/home/HomeHero";

import {
  CategoryScroller,
  TODAS_CATEGORIAS,
} from "@/components/home/CategoryScroller";

import { PromoCarousel } from "@/components/home/PromoCarousel";
import { IntentCarousel } from "@/components/home/IntentCarousel";
import { PopularProducts } from "@/components/home/PopularProducts";
import { ExploreBusinesses } from "@/components/home/ExploreBusinesses";
import { BusinessSignupCTA } from "@/components/home/BusinessSignupCTA";
import { MobileBottomNav } from "@/components/home/MobileBottomNav";
import { LogoLoader } from "@/components/LogoLoader";
import { EmpresaCard } from "@/components/home/BusinessCard";

export const Route = createFileRoute("/")({
  component: Landing,

  head: () => ({
    meta: [
      {
        title:
          "Trapeza — Encontre empresas, produtos e lojas perto de você",
      },
      {
        name: "description",
        content:
          "Encontre empresas, lojas e produtos no Trapeza. Explore catálogos digitais e entre em contato diretamente com os negócios.",
      },
      {
        property: "og:title",
        content:
          "Trapeza — Encontre empresas, produtos e lojas perto de você",
      },
      {
        property: "og:description",
        content:
          "Encontre empresas, lojas e produtos no Trapeza. Explore catálogos digitais e entre em contato diretamente com os negócios.",
      },
    ],
  }),
});

const PAGE_SIZE = 8;

// Quantas categorias aparecem inicialmente.
const CATEGORIAS_INICIAIS = 8;

// Quantas categorias entram a cada carregamento.
const CATEGORIAS_POR_CARGA = 8;

function Landing() {
  /*
   * EMPRESAS
   */
  const {
    data: empresas = [],
    isLoading,
  } = useQuery({
    queryKey: ["empresas-publicas"],
    queryFn: () =>
      listEmpresasPublicas({
        data: {} as Record<string, never>,
      }),
    staleTime: 30_000,
  });

  /*
   * PRODUTOS MAIS PROCURADOS
   */
  const {
    data: maisProcurados = [],
  } = useQuery({
    queryKey: ["top-produtos-plataforma"],
    queryFn: () =>
      getTopProdutosPlataforma({
        data: {
          limitePorEmpresa: 4,
        },
      }),
    staleTime: 60_000,
  });

  /*
   * ANÚNCIOS
   */
  const {
    data: anunciosHome = [],
  } = useQuery({
    queryKey: ["anuncios-home"],
    queryFn: () =>
      getAnunciosHome({
        data: {},
      }),
    staleTime: 60_000,
  });

  /*
   * Filtra em memória os anúncios de cada posição.
   * Não cria novas consultas.
   */
  const anunciosPorPosicao = (valor: string) =>
    anunciosHome.filter(
      (a) => a.posicao === valor,
    );

  /*
   * BUSCA
   */
  const [busca, setBusca] = useState("");

  /*
   * CIDADE
   */
  const [cidadeFiltro, setCidadeFiltro] =
    useState<string>(TODAS_CIDADES);

  /*
   * PAGINAÇÃO DO EXPLORE
   */
  const [visibleCount, setVisibleCount] =
    useState(PAGE_SIZE);

  /*
   * CIDADES DISPONÍVEIS
   */
  const cidades = useMemo(() => {
    const set = new Set<string>();

    for (const empresa of empresas) {
      if (empresa.cidade) {
        set.add(empresa.cidade);
      }
    }

    return Array.from(set).sort();
  }, [empresas]);

  /*
   * EMPRESAS DA CIDADE SELECIONADA
   */
  const empresasDaCidade = useMemo(() => {
    if (cidadeFiltro === TODAS_CIDADES) {
      return empresas;
    }

    return empresas.filter(
      (empresa) =>
        empresa.cidade === cidadeFiltro,
    );
  }, [empresas, cidadeFiltro]);

  /*
   * EMPRESAS POR CATEGORIA
   */
  const porCategoria = (valor: string) =>
    empresasDaCidade.filter((empresa) =>
      empresa.categorias?.includes(valor),
    );

  /*
   * EMPRESAS DO PRÓPRIO TRAPEZA
   *
   * Usado pelo antigo "Peça rápido".
   */
  const pecaRapido = useMemo(
    () =>
      empresasDaCidade.filter(
        (empresa) =>
          empresa.tipo === "trapeza",
      ),
    [empresasDaCidade],
  );

  /*
   * PRA MATAR A FOME
   */
  const praMatarAFome = useMemo(
    () =>
      empresasDaCidade.filter((empresa) =>
        empresa.categorias?.some((categoria) =>
          [
            "lanchonete",
            "restaurante",
            "pizzaria",
          ].includes(categoria),
        ),
      ),
    [empresasDaCidade],
  );

  /*
   * HORÁRIOS DO PEÇA RÁPIDO
   */
  const idsParaHorario = useMemo(
    () =>
      pecaRapido
        .slice(0, 12)
        .map((empresa) => empresa.id),
    [pecaRapido],
  );

  const {
    data: configsPorEmpresa = {},
  } = useQuery({
    queryKey: [
      "configs-empresas",
      idsParaHorario,
    ],

    queryFn: () =>
      getConfigsEmpresas({
        data: {
          empresaIds: idsParaHorario,
        },
      }),

    enabled:
      idsParaHorario.length > 0,

    staleTime: 30_000,
  });

  const abertoPorEmpresa = useMemo(() => {
    const mapa: Record<
      string,
      boolean | undefined
    > = {};

    for (const id of idsParaHorario) {
      const cfg =
        configsPorEmpresa[id];

      mapa[id] = cfg
        ? isStoreOpenNow(
            getHorarios(cfg),
          )
        : undefined;
    }

    return mapa;
  }, [
    configsPorEmpresa,
    idsParaHorario,
  ]);

  /*
   * RESULTADOS DA BUSCA DE EMPRESAS
   */
  const resultadosBusca =
    useMemo<EmpresaCard[]>(() => {
      const termo =
        busca.trim().toLowerCase();

      if (!termo) {
        return [];
      }

      return empresas
        .filter((empresa) => {
          const categoriasTexto =
            labelsCategoriasNegocio(
              empresa.categorias,
            )
              .join(" ")
              .toLowerCase();

          const tipoTexto =
            empresa.tipo === "externa"
              ? "externa"
              : "trapeza";

          return (
            empresa.nome
              .toLowerCase()
              .includes(termo) ||
            categoriasTexto.includes(
              termo,
            ) ||
            tipoTexto.includes(termo) ||
            (empresa.cidade ?? "")
              .toLowerCase()
              .includes(termo) ||
            (empresa.palavras_chave ?? "")
              .toLowerCase()
              .includes(termo)
          );
        })
        .slice(0, 8);
    }, [empresas, busca]);

  /*
   * DEBOUNCE DA BUSCA DE PRODUTOS
   */
  const [
    buscaDebounced,
    setBuscaDebounced,
  ] = useState("");

  useEffect(() => {
    const id = setTimeout(() => {
      setBuscaDebounced(
        busca.trim(),
      );
    }, 300);

    return () => clearTimeout(id);
  }, [busca]);

  /*
   * RESULTADOS DE PRODUTOS
   */
  const {
    data: resultadosProdutos = [],
  } = useQuery({
    queryKey: [
      "busca-produtos-plataforma",
      buscaDebounced,
    ],

    queryFn: () =>
      buscarProdutosPlataforma({
        data: {
          termo: buscaDebounced,
          limite: 8,
        },
      }),

    enabled:
      buscaDebounced.length > 0,

    staleTime: 15_000,
  });

  /*
   * SCROLL PARA EXPLORAR
   */
  function scrollToExplore() {
    document
      .getElementById("explore")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  /*
   * CATEGORIAS
   */
  const {
    data: categorias = CATEGORIAS_NEGOCIO,
  } = useCategoriasNegocio();

  /*
   * LAZY RENDER DAS CATEGORIAS
   *
   * Não montamos todas as categorias
   * de uma vez.
   */
  const [
    categoriasVisiveis,
    setCategoriasVisiveis,
  ] = useState(
    CATEGORIAS_INICIAIS,
  );

  /*
   * Sentinela no final da lista.
   */
  const sentinelaCategoriasRef =
    useRef<HTMLDivElement>(null);

  /*
   * Categorias atualmente montadas.
   */
  const categoriasRenderizadas =
    useMemo(
      () =>
        categorias.slice(
          0,
          categoriasVisiveis,
        ),
      [
        categorias,
        categoriasVisiveis,
      ],
    );

  /*
   * CARREGAMENTO PROGRESSIVO
   *
   * Quando o usuário se aproxima
   * do final das categorias atuais,
   * libera mais 8.
   */
  useEffect(() => {
    const sentinela =
      sentinelaCategoriasRef.current;

    if (!sentinela) {
      return;
    }

    if (
      categoriasVisiveis >=
      categorias.length
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) {
            return;
          }

          setCategoriasVisiveis(
            (prev) => {
              if (
                prev >=
                categorias.length
              ) {
                return prev;
              }

              return Math.min(
                prev +
                  CATEGORIAS_POR_CARGA,
                categorias.length,
              );
            },
          );
        },
        {
          /*
           * Começa a carregar antes
           * do usuário chegar literalmente
           * no final.
           */
          rootMargin: "200px",
        },
      );

    observer.observe(sentinela);

    return () =>
      observer.disconnect();
  }, [
    categoriasVisiveis,
    categorias.length,
  ]);

  /*
   * Se a quantidade de categorias
   * mudar dinamicamente, garante que
   * nunca fique com 0 categorias.
   */
  useEffect(() => {
    if (
      categorias.length > 0 &&
      categoriasVisiveis === 0
    ) {
      setCategoriasVisiveis(
        Math.min(
          CATEGORIAS_INICIAIS,
          categorias.length,
        ),
      );
    }
  }, [
    categorias.length,
    categoriasVisiveis,
  ]);

  return (
    <div
      id="topo"
      className="trapeza-home min-h-screen bg-background pb-16 md:pb-0"
    >
      {/* LOADING */}
      {isLoading && (
        <div className="flex min-h-screen items-center justify-center">
          <LogoLoader size={120} />
        </div>
      )}

      <link
        rel="manifest"
        href="/manifest.webmanifest?v=2"
      />

      {/* HERO */}
      <HomeHero
        cidades={cidades}
        cidadeFiltro={cidadeFiltro}
        onChangeCidade={
          setCidadeFiltro
        }
        busca={busca}
        onBuscaChange={setBusca}
        resultadosBusca={
          resultadosBusca
        }
        resultadosProdutos={
          resultadosProdutos
        }
        totalLojas={
          empresas.length
        }
        onExplorar={
          scrollToExplore
        }
      />

      {/* CATEGORIAS PRINCIPAIS */}
      <CategoryScroller
        categoriaFiltro={
          TODAS_CATEGORIAS
        }
      />

      {/* ANÚNCIO 1 */}
      <PromoCarousel
        anuncios={anunciosPorPosicao("1")}
      />

      {/* 
        PEÇA RÁPIDO
        Mantido desativado como estava
        no seu código.
      */}

      {/* 
      <NearbyBusinesses
        empresas={pecaRapido}
        abertoPorEmpresa={abertoPorEmpresa}
        onVerMais={scrollToExplore}
      />
      */}

      {/* PRA MATAR A FOME */}
      <IntentCarousel
        titulo="🍔 Pra matar a fome"
        subtitulo="Do lanche caprichado àquela pizza que salva a noite."
        empresas={praMatarAFome}
      />

      {/* PRODUTOS MAIS PROCURADOS */}
      <PopularProducts
        produtos={maisProcurados}
        posicao={"1"}
      />

      {/* CTA PARA EMPRESAS */}
      <BusinessSignupCTA />

      {/* 
        CATEGORIAS DINÂMICAS

        Só as categorias liberadas
        são montadas.
      */}
      <section className="space-y-2">
        {categoriasRenderizadas.map(
          (cat, index) => {
            const empresasCategoria =
              porCategoria(
                cat.valor,
              );

            /*
             * Se não existe nenhuma empresa
             * naquela categoria, não monta
             * o carrossel.
             *
             * Isso evita blocos vazios.
             */
            if (
              empresasCategoria.length ===
              0
            ) {
              return null;
            }

            return (
              <div
                key={cat.id}
                className="overflow-hidden"
              >
                <IntentCarousel
                  titulo={cat.label.toUpperCase()}
                  subtitulo={`Encontre empresas de ${cat.label.toLowerCase()} perto de você.`}
                  empresas={
                    empresasCategoria
                  }
                />

                {/* 
                  A cada 6 categorias
                  tenta inserir anúncio da
                  posição 1.
                */}
                {(index + 1) % 6 ===
                  0 && (
                  <PromoCarousel
                    anuncios={anunciosPorPosicao(
                      "1",
                    )}
                  />
                )}
              </div>
            );
          },
        )}
      </section>

      {/* 
        SENTINELA

        Quando chegar perto daqui,
        o observer libera mais categorias.
      */}
      <div
        ref={sentinelaCategoriasRef}
        className="h-8 w-full"
        aria-hidden="true"
      />

      {/* 
        EXPLORAR TODOS OS NEGÓCIOS
      */}
      <ExploreBusinesses
        empresas={
          empresasDaCidade
        }
        totalSemFiltro={
          empresas.length
        }
        visibleCount={
          visibleCount
        }
        onVerMais={() =>
          setVisibleCount(
            (v) => v + PAGE_SIZE,
          )
        }
        isLoading={isLoading}
        categoriaSelecionada={
          null
        }
      />

      {/* FOOTER */}
      <footer className="hidden border-t border-border bg-card md:block">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            <strong className="text-foreground">
              TRAPEZA
            </strong>{" "}
            · encontre empresas e produtos
            perto de você
          </p>

          <div className="flex gap-4">
            <Link
              to="/painel/login"
              className="hover:underline"
            >
              Painel admin
            </Link>

            <Link
              to="/plataforma/login"
              className="hover:underline"
            >
              Plataforma
            </Link>
          </div>
        </div>
      </footer>

      {/* NAVEGAÇÃO MOBILE */}
      <MobileBottomNav />
    </div>
  );
}