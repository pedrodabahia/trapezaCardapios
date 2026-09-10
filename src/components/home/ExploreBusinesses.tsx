import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { EmpresaCard } from "./BusinessCard";
import { BusinessCard } from "./BusinessCard";

const PAGE_SIZE = 8;

// Lista principal de descoberta — cards compactos em lista (não em cards
// grandes de grid), como no exemplo do briefing. Reaproveita o mesmo
// filtro de busca/cidade/categoria já calculado no componente pai.
export function ExploreBusinesses({
  empresas,
  totalSemFiltro,
  visibleCount,
  onVerMais,
  isLoading,
}: {
  empresas: EmpresaCard[];
  totalSemFiltro: number;
  visibleCount: number;
  onVerMais: () => void;
  isLoading: boolean;
}) {
  const visiveis = empresas.slice(0, visibleCount);
  const temMais = empresas.length > visibleCount;

  return (
    <section id="explore" className="mx-auto max-w-6xl px-4 pt-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-base font-bold">Explore lojas</h2>
      </div>

      {isLoading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Carregando...</p>
      ) : totalSemFiltro === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card py-10 text-center">
          <p className="font-display text-sm font-semibold">Estamos chegando aí.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Em breve você encontrará mais empresas no Trapeza.
          </p>
          <Link to="/painel/login">
            <Button
              size="sm"
              className="mt-3 rounded-full text-white"
              style={{ backgroundColor: "var(--tp-orange)" }}
            >
              Cadastre sua empresa
            </Button>
          </Link>
        </div>
      ) : empresas.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          Nenhuma empresa encontrada com esse filtro. Tenta ajustar a busca, a
          cidade ou a categoria.
        </p>
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            {visiveis.map((e) => (
              <BusinessCard key={e.id} empresa={e} variant="row" />
            ))}
          </div>
          {temMais && (
            <div className="mt-4 text-center">
              <Button size="sm" variant="outline" className="rounded-full" onClick={onVerMais}>
                Ver mais empresas
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
