import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  listEmpresasPublicas,
  getTopProdutosPlataforma,
  getAnunciosHome,
  buscarProdutosPlataforma,
} from "@/lib/admin-server";

import {
  labelsCategoriasNegocio,
  useCategoriasNegocio,
  CATEGORIAS_NEGOCIO,
} from "@/lib/categorias-negocio";

import { HomeHero, TODAS_CIDADES } from "@/components/home/HomeHero";
import { CategoryScroller, TODAS_CATEGORIAS } from "@/components/home/CategoryScroller";
import { PromoCarousel } from "@/components/home/PromoCarousel";
import { IntentCarousel } from "@/components/home/IntentCarousel";
import { PopularProducts } from "@/components/home/PopularProducts";
import { ExploreBusinesses } from "@/components/home/ExploreBusinesses";
import { BusinessSignupCTA } from "@/components/home/BusinessSignupCTA";
import { MobileBottomNav } from "@/components/home/MobileBottomNav";
import { PromocoesDestaque } from "@/components/home/PromocoesDestaque";
import { PromoBand, LojasComOfertas, PromoJsonLd } from "@/components/home/PromoBand";
import { LogoLoader } from "@/components/LogoLoader";
import { EmpresaCard } from "@/components/home/BusinessCard";

import { usePromocoes, type PromocaoHome } from "@/lib/use-promocoes";
import { calcularDesconto, diversificar, getUrgencia } from "@/modules/promocoes/utils/promocao-utils";

/* ------------------------------------------------------------------ */
/* SEO                                                                 */
/* ------------------------------------------------------------------ */

const SITE = "https://trapeza.me";
const TITULO_SEO = "Trapeza | Guia comercial e ofertas em Posto da Mata - BA";
const DESCRICAO_SEO =
  "Ofertas, lojas, restaurantes, pizzarias e serviços de Posto da Mata e região. Compare promoções e fale direto com a empresa pelo WhatsApp.";

export const Route = createFileRoute("/")({
  component: Landing,

  head: () => ({
    meta: [
      { title: TITULO_SEO },
      { name: "description", content: DESCRICAO_SEO },
      { name: "robots", content: "index, follow, max-image-preview:large" },

      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Trapeza" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:title", content: TITULO_SEO },
      { property: "og:description", content: DESCRICAO_SEO },
      { property: "og:url", content: `${SITE}/` },
      { property: "og:image", content: `${SITE}/og-trapeza.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Trapeza — guia comercial e ofertas de Posto da Mata e região" },

      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE}/og-trapeza.png` },
      { name: "twitter:title", content: TITULO_SEO },
      { name: "twitter:description", content: DESCRICAO_SEO },
    ],

    links: [
      { rel: "canonical", href: `${SITE}/` },
      { rel: "manifest", href: "/manifest.webmanifest?v=2" },
    ],

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Trapeza",
          alternateName: "Trapeza — Guia Comercial de Posto da Mata",
          url: `${SITE}/`,
          description: DESCRICAO_SEO,
          inLanguage: "pt-BR",
          areaServed: {
            "@type": "City",
            name: "Posto da Mata",
            containedInPlace: { "@type": "State", name: "Bahia" },
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Trapeza",
          url: `${SITE}/`,
          description: "Guia comercial local de Posto da Mata e região.",
          areaServed: "Posto da Mata, BA",
        }),
      },
    ],
  }),
});

/* ------------------------------------------------------------------ */
/* CONSTANTES                                                          */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 8;
const CATEGORIAS_INICIAIS = 8;
const CATEGORIAS_POR_CARGA = 8;

// Precisam ser iguais aos props do <PromocoesDestaque /> para não repetir ofertas.
const LIMITE_DESTAQUE = 10;
const MAX_POR_EMPRESA = 2;

const pct = (p: PromocaoHome) =>
  calcularDesconto(p.preco_promocional, p.preco_anterior)?.percentual ?? 0;

function Landing() {
  /* DADOS ------------------------------------------------------------ */
  const { data: empresas = [], isLoading } = useQuery({
    queryKey: ["empresas-publicas"],
    queryFn: () => listEmpresasPublicas({ data: {} as Record<string, never> }),
    staleTime: 30_000,
  });

  const { data: maisProcurados = [] } = useQuery({
    queryKey: ["top-produtos-plataforma"],
    queryFn: () => getTopProdutosPlataforma({ data: { limitePorEmpresa: 4 } }),
    staleTime: 60_000,
  });

  const { data: anunciosHome = [] } = useQuery({
    queryKey: ["anuncios-home"],
    queryFn: () => getAnunciosHome({ data: {} }),
    staleTime: 60_000,
  });

  const { data: promocoes = [] } = usePromocoes();

  const anunciosPorPosicao = (valor: string) =>
    anunciosHome.filter((a) => String(a.posicao) === valor);

  /* ESTADO ----------------------------------------------------------- */
  const [busca, setBusca] = useState("");
  const [cidadeFiltro, setCidadeFiltro] = useState<string>(TODAS_CIDADES);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /* EMPRESAS --------------------------------------------------------- */
  const cidades = useMemo(() => {
    const set = new Set<string>();
    for (const empresa of empresas) if (empresa.cidade) set.add(empresa.cidade);
    return Array.from(set).sort();
  }, [empresas]);

  const empresasDaCidade = useMemo(
    () =>
      cidadeFiltro === TODAS_CIDADES
        ? empresas
        : empresas.filter((e) => e.cidade === cidadeFiltro),
    [empresas, cidadeFiltro],
  );

  const porCategoria = useCallback(
    (valor: string) => empresasDaCidade.filter((e) => e.categorias?.includes(valor)),
    [empresasDaCidade],
  );

  const praMatarAFome = useMemo(
    () =>
      empresasDaCidade.filter((e) =>
        e.categorias?.some((c) => ["lanchonete", "restaurante", "pizzaria"].includes(c)),
      ),
    [empresasDaCidade],
  );

  /* PROMOÇÕES: distribui sem repetir entre as faixas ------------------ */
  const blocosPromo = useMemo(() => {
    const destaque = diversificar(promocoes, MAX_POR_EMPRESA).slice(0, LIMITE_DESTAQUE);
    const usados = new Set(destaque.map((p) => p.id));

    // Prazo acabando: hoje ou amanhã
    const terminando = promocoes
      .filter((p) => {
        const u = getUrgencia(p.fim_em);
        return u === "Termina hoje" || u === "Termina amanhã";
      })
      .slice(0, 10);
    terminando.forEach((p) => usados.add(p.id));

    // Maiores descontos que ainda não apareceram
    const maiores = diversificar(
      promocoes.filter((p) => !usados.has(p.id) && pct(p) >= 10),
      MAX_POR_EMPRESA,
    ).slice(0, 10);
    maiores.forEach((p) => usados.add(p.id));

    // O que sobrou alimenta as faixas entre as categorias
    const sobra = promocoes.filter((p) => !usados.has(p.id));

    return { terminando, maiores, sobra };
  }, [promocoes]);

  // Faixa de promoções depois de cada bloco de categoria
  function promoAposCategoria(catId: string, catLabel: string, index: number) {
    const daCategoria = blocosPromo.sobra
      .filter((p) => p.categoria_negocio_id === catId)
      .slice(0, 10);

    if (daCategoria.length >= 2) {
      return (
        <PromoBand
          id={`ofertas-${catId}`}
          titulo={`Ofertas em ${catLabel}`}
          subtitulo="Promoções de empresas dessa categoria."
          ofertas={daCategoria}
          variante="suave"
          origem={`home_categoria_${catId}`}
        />
      );
    }

    // Sem oferta da categoria: a cada 3 blocos, uma faixa com o que sobrou
    const n = index + 1;
    const pool = blocosPromo.sobra;
    if (n % 3 === 0 && pool.length >= 3) {
      const tam = Math.min(8, pool.length);
      const inicio = ((n / 3 - 1) * tam) % pool.length;
      const fatia = [...pool, ...pool].slice(inicio, inicio + tam);
      return (
        <PromoBand
          id={`mais-ofertas-${n}`}
          titulo="Mais ofertas pra você"
          subtitulo="Descontos de lojas da cidade."
          ofertas={fatia}
          variante={(n / 3) % 2 === 1 ? "marca" : "suave"}
          origem={`home_mix_${n}`}
        />
      );
    }
    return null;
  }

  /* BUSCA ------------------------------------------------------------ */
  const resultadosBusca = useMemo<EmpresaCard[]>(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return [];

    return empresas
      .filter((empresa) => {
        const categoriasTexto = labelsCategoriasNegocio(empresa.categorias)
          .join(" ")
          .toLowerCase();
        const tipoTexto = empresa.tipo === "externa" ? "externa" : "trapeza";

        return (
          empresa.nome.toLowerCase().includes(termo) ||
          categoriasTexto.includes(termo) ||
          tipoTexto.includes(termo) ||
          (empresa.cidade ?? "").toLowerCase().includes(termo) ||
          (empresa.palavras_chave ?? "").toLowerCase().includes(termo)
        );
      })
      .slice(0, 8);
  }, [empresas, busca]);

  const [buscaDebounced, setBuscaDebounced] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setBuscaDebounced(busca.trim()), 300);
    return () => clearTimeout(id);
  }, [busca]);

  const { data: resultadosProdutos = [] } = useQuery({
    queryKey: ["busca-produtos-plataforma", buscaDebounced],
    queryFn: () =>
      buscarProdutosPlataforma({ data: { termo: buscaDebounced, limite: 8 } }),
    enabled: buscaDebounced.length > 0,
    staleTime: 15_000,
  });

  function scrollToExplore() {
    document
      .getElementById("explore")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* CATEGORIAS (carregamento progressivo) ----------------------------- */
  const { data: categorias = CATEGORIAS_NEGOCIO } = useCategoriasNegocio();
  const [categoriasVisiveis, setCategoriasVisiveis] = useState(CATEGORIAS_INICIAIS);
  const sentinelaCategoriasRef = useRef<HTMLDivElement>(null);

  const categoriasRenderizadas = useMemo(
    () =>
      categorias
        .slice(0, categoriasVisiveis)
        .filter((cat) => porCategoria(cat.valor).length > 0),
    [categorias, categoriasVisiveis, porCategoria],
  );

  useEffect(() => {
    const sentinela = sentinelaCategoriasRef.current;
    if (!sentinela) return;
    if (categoriasVisiveis >= categorias.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setCategoriasVisiveis((prev) =>
          prev >= categorias.length
            ? prev
            : Math.min(prev + CATEGORIAS_POR_CARGA, categorias.length),
        );
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinela);
    return () => observer.disconnect();
    // isLoading: a sentinela só existe depois que a página carrega
  }, [categoriasVisiveis, categorias.length, isLoading]);

  useEffect(() => {
    if (categorias.length > 0 && categoriasVisiveis === 0) {
      setCategoriasVisiveis(Math.min(CATEGORIAS_INICIAIS, categorias.length));
    }
  }, [categorias.length, categoriasVisiveis]);

  /* LOADER: aparece sozinho; quando carrega, a página entra normalmente */
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LogoLoader size={120} />
      </div>
    );
  }

  /* RENDER ----------------------------------------------------------- */
  return (
    <div id="topo" className="trapeza-home min-h-screen bg-background pb-16 md:pb-0">
      <HomeHero
        cidades={cidades}
        cidadeFiltro={cidadeFiltro}
        onChangeCidade={setCidadeFiltro}
        busca={busca}
        onBuscaChange={setBusca}
        resultadosBusca={resultadosBusca}
        resultadosProdutos={resultadosProdutos}
        totalLojas={empresas.length}
        onExplorar={scrollToExplore}
      />

      <CategoryScroller categoriaFiltro={TODAS_CATEGORIAS} />

        <>
          {/* Dados estruturados das ofertas para o Google */}
          <PromoJsonLd ofertas={promocoes} />

          {/* 1. Banner de anúncio principal (como era antes) */}
          <PromoCarousel anuncios={anunciosPorPosicao("1")} />

          {/* 2. Ofertas com filtro por categoria */}
          <PromocoesDestaque limite={LIMITE_DESTAQUE} maxPorEmpresa={MAX_POR_EMPRESA} />

          {/* 3. Urgência: só aparece se houver oferta acabando */}
          <PromoBand
            id="terminando"
            titulo="⏰ Acaba hoje e amanhã"
            subtitulo="Corre que o prazo está no fim."
            ofertas={blocosPromo.terminando}
            variante="urgente"
            origem="home_terminando"
          />

          {/* 4. Comida */}
          <IntentCarousel
            titulo="🍔 Pra matar a fome"
            subtitulo="Do lanche caprichado àquela pizza que salva a noite."
            empresas={praMatarAFome}
          />

          {/* 5. Quebra visual: maiores descontos */}
          {blocosPromo.maiores.length >= 3 && (
            <PromoBand
              id="maiores-descontos"
              titulo="💥 Maiores descontos"
              subtitulo="As economias mais fortes da região."
              ofertas={blocosPromo.maiores}
              variante="marca"
              origem="home_maiores_descontos"
            />
          )}

          {/* 6. Lojas com ofertas */}
          <LojasComOfertas empresas={empresasDaCidade} promocoes={promocoes} />

          {/* 7. Mais procurados */}
          <PopularProducts produtos={maisProcurados} posicao={"1"} />

          {/* 8. CTA para empresas */}
          <BusinessSignupCTA />

          {/* 9. Categorias, com ofertas e anúncios entre os blocos */}
          <section className="space-y-2">
            {categoriasRenderizadas.map((cat, index) => {
              const numeroCategoria = index + 1;

              return (
                <div key={cat.id} className="overflow-hidden">
                  <IntentCarousel
                    titulo={cat.label.toUpperCase()}
                    subtitulo={`Encontre empresas de ${cat.label.toLowerCase()} perto de você.`}
                    empresas={porCategoria(cat.valor)}
                    categoriaUrl={`/categoria/${cat.valor}`}
                    limite={20}
                  />

                  {promoAposCategoria(cat.id, cat.label, index)}

                  {numeroCategoria % 4 === 0 && (
                    <PromoCarousel
                      anuncios={anunciosPorPosicao(String(numeroCategoria / 4 + 1))}
                    />
                  )}
                </div>
              );
            })}
          </section>

          <div ref={sentinelaCategoriasRef} className="h-8 w-full" aria-hidden="true" />

          <ExploreBusinesses
            empresas={empresasDaCidade}
            totalSemFiltro={empresas.length}
            visibleCount={visibleCount}
            onVerMais={() => setVisibleCount((v) => v + PAGE_SIZE)}
            isLoading={isLoading}
            categoriaSelecionada={null}
          />
        </>

      <footer className="hidden border-t border-border bg-card md:block">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            <strong className="text-foreground">TRAPEZA</strong> · encontre empresas e
            produtos perto de você
          </p>

          <div className="flex gap-4">
            <Link to="/painel/login" className="hover:underline">
              Painel admin
            </Link>
            <Link to="/plataforma/login" className="hover:underline">
              Plataforma
            </Link>
          </div>
        </div>
      </footer>

      <MobileBottomNav />
    </div>
  );
}