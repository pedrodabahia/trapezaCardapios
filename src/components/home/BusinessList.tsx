import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { EmpresaCard } from "./BusinessCard";
import { BusinessCard } from "./BusinessCard";

export function BusinessList({
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
    <section id="empresas" className="mx-auto max-w-6xl px-6 py-5">

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Carregando...</p>
      ) : totalSemFiltro === 0 ? (
        <Card className="mt-6">
          <CardContent className="space-y-3 py-12 text-center">
            <p className="font-display text-lg font-semibold">Estamos chegando aí.</p>
            <p className="text-sm text-muted-foreground">
              Em breve você encontrará mais empresas no Trapeza.
            </p>
            <Link to="/painel/login">
              <Button className="mt-2 rounded-full bg-brand-red text-white hover:bg-brand-red/90">
                Cadastre sua empresa
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : empresas.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Nenhuma empresa encontrada com esse filtro. Tenta ajustar a busca, a
          cidade ou a categoria.
        </p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visiveis.map((e) => (
              <BusinessCard key={e.id} empresa={e} />
            ))}
          </div>
          {temMais && (
            <div className="mt-8 text-center">
              <Button variant="outline" className="rounded-full" onClick={onVerMais}>
                Ver mais empresas
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
