import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listEmpresasPublicas, contarPedidosTotal } from "@/lib/admin-server";
import { Navbar } from "@/components/home/Navbar";
import { Hero } from "@/components/home/Hero";
import { SearchSection } from "@/components/home/SearchSection";
import { LocationSection, TODAS_CIDADES } from "@/components/home/LocationSection";
import { CategoriesSection, TODAS_CATEGORIAS } from "@/components/home/CategoriesSection";
import { FeaturedBusinesses } from "@/components/home/FeaturedBusinesses";
import { BusinessList } from "@/components/home/BusinessList";
import { BusinessCTA } from "@/components/home/BusinessCTA";
import { HowItWorks } from "@/components/home/HowItWorks";
import { AboutTrapeza } from "@/components/home/AboutTrapeza";
import { Stats } from "@/components/home/Stats";
import { FinalCTA } from "@/components/home/FinalCTA";

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

const PAGE_SIZE = 9;

function Landing() {
  const { data: empresas = [], isLoading } = useQuery({
    queryKey: ["empresas-publicas"],
    queryFn: () => listEmpresasPublicas({ data: {} as Record<string, never> }),
    staleTime: 30_000,
  });

  const { data: pedidosTotal } = useQuery({
    queryKey: ["pedidos-total-publico"],
    queryFn: () => contarPedidosTotal({ data: {} as Record<string, never> }),
    staleTime: 60_000,
  });

  const [busca, setBusca] = useState("");
  const [cidadeFiltro, setCidadeFiltro] = useState<string>(TODAS_CIDADES);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>(TODAS_CATEGORIAS);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Empresa Trapeza ou externa — as duas entram nos mesmos filtros e
  // seções; a única diferença é pra onde o card leva ao clicar (ver
  // BusinessCard).
  const cidades = useMemo(() => {
    const set = new Set<string>();
    for (const e of empresas) if (e.cidade) set.add(e.cidade);
    return Array.from(set).sort();
  }, [empresas]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return empresas.filter((e) => {
      if (cidadeFiltro !== TODAS_CIDADES && e.cidade !== cidadeFiltro) return false;
      if (categoriaFiltro !== TODAS_CATEGORIAS && e.categoria !== categoriaFiltro) return false;
      if (!termo) return true;
      return (
        e.nome.toLowerCase().includes(termo) ||
        (e.cidade ?? "").toLowerCase().includes(termo) ||
        (e.endereco ?? "").toLowerCase().includes(termo)
      );
    });
  }, [empresas, busca, cidadeFiltro, categoriaFiltro]);

  // Destaque é um campo controlado pelo super-admin no painel (não é
  // hardcoded por slug) — só cai pro "tem logo" como aproximação enquanto
  // nenhuma empresa foi marcada como destaque ainda.
  const destaques = useMemo(() => {
    const marcadas = empresas.filter((e) => e.destaque);
    const pool = marcadas.length > 0 ? marcadas : empresas.filter((e) => e.logo_url);
    return (pool.length > 0 ? pool : empresas).slice(0, 3);
  }, [empresas]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />

   {/*   <LocationSection
        cidades={cidades}
        cidadeAtual={cidadeFiltro !== TODAS_CIDADES ? cidadeFiltro : (cidades[0] ?? null)}
        cidadeFiltro={cidadeFiltro}
        onChange={setCidadeFiltro}
        totalEncontradas={filtradas.length}
      />
   */}
   
      <CategoriesSection categoriaFiltro={categoriaFiltro} onChange={setCategoriaFiltro} />



      <BusinessList
        empresas={filtradas}
        totalSemFiltro={empresas.length}
        visibleCount={visibleCount}
        onVerMais={() => setVisibleCount((v) => v + PAGE_SIZE)}
        isLoading={isLoading}
      />

      <BusinessCTA />
      <HowItWorks />
      <AboutTrapeza />
      {!isLoading && (
        <Stats
          empresasCount={empresas.length}
          cidadesCount={cidades.length}
          pedidosCount={pedidosTotal ?? null}
        />
      )}
      <FinalCTA />

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
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
    </div>
  );
}
