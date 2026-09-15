import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  listEmpresasPublicas,
  getTopProdutosPlataforma,
  getConfigsEmpresas,
  getAnunciosHome,
  buscarProdutosPlataforma,
} from "@/lib/admin-server";
import { getHorarios, isStoreOpenNow } from "@/lib/admin-store";
import { labelsCategoriasNegocio } from "@/lib/categorias-negocio";
import { HomeHero, TODAS_CIDADES } from "@/components/home/HomeHero";
import { CategoryScroller, TODAS_CATEGORIAS } from "@/components/home/CategoryScroller";
import { NearbyBusinesses } from "@/components/home/NearbyBusinesses";
import { PromoCarousel } from "@/components/home/PromoCarousel";
import { IntentCarousel } from "@/components/home/IntentCarousel";
import { PopularProducts } from "@/components/home/PopularProducts";
import { ExploreBusinesses } from "@/components/home/ExploreBusinesses";
import { BusinessCTASmall } from "@/components/home/BusinessCTASmall";
import { MobileBottomNav } from "@/components/home/MobileBottomNav";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Trapeza — Encontre empresas, produtos e lojas perto de você" },
      {
        name: "description",
        content:
          "Encontre empresas, lojas e produtos no Trapeza. Explore catálogos digitais e entre em contato diretamente com os negócios.",
      },
      { property: "og:title", content: "Trapeza — Encontre empresas, produtos e lojas perto de você" },
      {
        property: "og:description",
        content:
          "Encontre empresas, lojas e produtos no Trapeza. Explore catálogos digitais e entre em contato diretamente com os negócios.",
      },
    ],
  }),
});

const PAGE_SIZE = 8;

function Landing() {
  const { data: empresas = [], isLoading } = useQuery({
    queryKey: ["empresas-publicas"],
    queryFn: () => listEmpresasPublicas({ data: {} as Record<string, never> }),
    staleTime: 30_000,
  });

  const { data: maisProcurados = [] } = useQuery({
    queryKey: ["top-produtos-plataforma"],
    queryFn: () => getTopProdutosPlataforma({ data: { limitePorEmpresa: 3 } }),
    staleTime: 60_000,
  });

  const { data: anunciosHome = [] } = useQuery({
    queryKey: ["anuncios-home"],
    queryFn: () => getAnunciosHome({ data: {} as Record<string, never> }),
    staleTime: 60_000,
  });

  const [busca, setBusca] = useState("");
  const [cidadeFiltro, setCidadeFiltro] = useState<string>(TODAS_CIDADES);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const cidades = useMemo(() => {
    const set = new Set<string>();
    for (const e of empresas) if (e.cidade) set.add(e.cidade);
    return Array.from(set).sort();
  }, [empresas]);

  // Empresas na cidade escolhida (aproximação de localização sem
  // geolocalização real) — base pra todos os carrosséis de intenção.
  const empresasDaCidade = useMemo(() => {
    if (cidadeFiltro === TODAS_CIDADES) return empresas;
    return empresas.filter((e) => e.cidade === cidadeFiltro);
  }, [empresas, cidadeFiltro]);

  const porCategoria = (valor: string) =>
    empresasDaCidade.filter((e) => e.categorias?.includes(valor));

  // "⚡ Peça rápido" — só empresas do PRÓPRIO sistema Trapeza (têm
  // catálogo/pedido de verdade; é a vitrine/isca pro sistema).
  const pecaRapido = useMemo(
    () => empresasDaCidade.filter((e) => e.tipo === "trapeza"),
    [empresasDaCidade],
  );

  // Carrosséis por intenção, derivados em memória da MESMA lista de
  // empresas já carregada (nenhuma query nova por bloco).
  const praMatarAFome = useMemo(
    () => empresasDaCidade.filter((e) => e.categorias?.some((c) => ["lanchonete", "restaurante", "pizzaria"].includes(c))),
    [empresasDaCidade],
  );
  const pizzarias = useMemo(() => porCategoria("pizzaria"), [empresasDaCidade]);
  const distribuidoras = useMemo(() => porCategoria("distribuidora"), [empresasDaCidade]);
  const doces = useMemo(
    () => empresasDaCidade.filter((e) => e.categorias?.some((c) => ["confeitaria", "sorvete"].includes(c))),
    [empresasDaCidade],
  );
  const visual = useMemo(() => porCategoria("barbearia"), [empresasDaCidade]);
  const cuidar = useMemo(() => porCategoria("estetica"), [empresasDaCidade]);

  // Config (horários) das empresas do "Peça rápido", pra calcular o selo
  // Aberto/Fechado. Só busca pros ids que estão na tela.
  const idsParaHorario = useMemo(() => pecaRapido.slice(0, 12).map((e) => e.id), [pecaRapido]);
  const { data: configsPorEmpresa = {} } = useQuery({
    queryKey: ["configs-empresas", idsParaHorario],
    queryFn: () => getConfigsEmpresas({ data: { empresaIds: idsParaHorario } }),
    enabled: idsParaHorario.length > 0,
    staleTime: 30_000,
  });
  const abertoPorEmpresa = useMemo(() => {
    const mapa: Record<string, boolean | undefined> = {};
    for (const id of idsParaHorario) {
      const cfg = configsPorEmpresa[id];
      mapa[id] = cfg ? isStoreOpenNow(getHorarios(cfg)) : undefined;
    }
    return mapa;
  }, [configsPorEmpresa, idsParaHorario]);

  // Resultados da busca, tipo Google: aparecem numa lista suspensa embaixo
  // do campo de busca (dentro do HomeHero), sem mexer em mais nada da
  // página. Casa por nome, categoria e tipo (trapeza/externa) — basta
  // digitar "h" pra começar a achar tudo que tem "h" em algum desses
  // campos, e vai afunilando conforme mais letras entram.



const resultadosBusca = useMemo(() => {
  const termo = busca.trim().toLowerCase();

  if (!termo) return [];

  return empresas
    .filter((e) => {
      const categoriasTexto = labelsCategoriasNegocio(e.categorias)
        .join(" ")
        .toLowerCase();

      const tipoTexto = e.tipo === "externa" ? "externa" : "trapeza";

      return (
        e.nome.toLowerCase().includes(termo) ||
        categoriasTexto.includes(termo) ||
        tipoTexto.includes(termo) ||
        (e.cidade ?? "").toLowerCase().includes(termo) ||
        (e.palavras_chave ?? "").toLowerCase().includes(termo)
      );
    })
    .slice(0, 8);
}, [empresas, busca]);  // Busca de PRODUTO ("digitei 'skol', onde vende?") cruza catálogo de
  // várias empresas ao mesmo tempo — isso é uma consulta no banco, então
  // usa um debounce de 300ms (espera parar de digitar) em vez de
  // disparar uma chamada a cada letra.
  const [buscaDebounced, setBuscaDebounced] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setBuscaDebounced(busca.trim()), 300);
    return () => clearTimeout(id);
  }, [busca]);

  const { data: resultadosProdutos = [] } = useQuery({
    queryKey: ["busca-produtos-plataforma", buscaDebounced],
    queryFn: () => buscarProdutosPlataforma({ data: { termo: buscaDebounced, limite: 8 } }),
    enabled: buscaDebounced.length > 0,
    staleTime: 15_000,
  });

  // "Descubra negócios da sua cidade" — só filtra por cidade. A busca NÃO
  // filtra mais essa seção (ela só alimenta a lista suspensa do HomeHero
  // agora) — por isso reaproveita direto o `empresasDaCidade` já calculado
  // acima pros carrosséis de intenção.

  function scrollToExplore() {
    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div id="topo" className="trapeza-home min-h-screen bg-background pb-16 md:pb-0">
      <link rel="manifest" href="/manifest.webmanifest?v=2"></link>
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

      <PromoCarousel anuncios={anunciosHome} />


      {/*!isLoading && (
        <NearbyBusinesses
          empresas={pecaRapido}
          abertoPorEmpresa={abertoPorEmpresa}
          onVerMais={scrollToExplore}
        />
      )*/}

      <IntentCarousel
        titulo="🍔 Pra matar a fome"
        subtitulo="Do lanche caprichado àquela pizza que salva a noite."
        empresas={praMatarAFome}
      />

      <PopularProducts produtos={maisProcurados} />

      <IntentCarousel
        titulo="🍕 Hoje merece uma pizza"
        subtitulo="Sextou ou não, pizza nunca precisa de motivo."
        empresas={pizzarias}
      />

      <IntentCarousel
        titulo="🥤 Pra reabastecer o estoque"
        subtitulo="Bebida acabou? O churrasco tá chegando? Reabastece aqui."
        empresas={distribuidoras}
      />

      <IntentCarousel
        titulo="🍰 Deu vontade de um doce"
        subtitulo="Porque às vezes o que falta é só um bolo. 😋"
        empresas={doces}
      />

      <IntentCarousel
        titulo="💇 Dar um trato no visual"
        subtitulo="Cabelo, barba e autoestima em dia."
        empresas={visual}
      />

      <IntentCarousel
        titulo="✨ Hora de se cuidar"
        subtitulo="Um tempinho pra você também entra na lista."
        empresas={cuidar}
      />

      {/*
        "Mais procurados": os 3 produtos mais vendidos de CADA empresa
        Trapeza ativa, misturados num ranking só (não inclui empresa
        externa, que não tem catálogo aqui). Vem de um endpoint novo
        (getTopProdutosPlataforma) que reaproveita a mesma lógica de
        "mais vendidos por empresa" já usada dentro do cardápio de cada
        uma. Some sozinha se não tiver produto vendido suficiente.
      */}

       

      <ExploreBusinesses
        empresas={empresasDaCidade}
        totalSemFiltro={empresas.length}
        visibleCount={visibleCount}
        onVerMais={() => setVisibleCount((v) => v + PAGE_SIZE)}
        isLoading={isLoading}
        categoriaSelecionada={null}
      />

      <BusinessCTASmall />

      <footer className="hidden border-t border-border bg-card md:block">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            <strong className="text-foreground">TRAPEZA</strong> · encontre
            empresas e produtos perto de você
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
