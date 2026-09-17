import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { listEmpresasPublicas } from "@/lib/admin-server";
import { CATEGORIAS_NEGOCIO, useCategoriasNegocio, labelCategoriaNegocio } from "@/lib/categorias-negocio";
import { BusinessCard } from "@/components/home/BusinessCard";

// Página "todos os comércios da categoria X" — pra onde o clique num
// ícone de categoria da home leva. Mesmo card que já é usado nos
// carrosséis (BusinessCard variant="grid"), só que numa grade vertical
// (2 por linha) em vez de rolagem horizontal.
export const Route = createFileRoute("/categoria/$valor")({
  component: PaginaCategoria,
});

function PaginaCategoria() {
  const { valor } = Route.useParams();

  const { data: empresas = [], isLoading } = useQuery({
    queryKey: ["empresas-publicas"],
    queryFn: () => listEmpresasPublicas({ data: {} as Record<string, never> }),
    staleTime: 30_000,
  });

  const { data: categorias = CATEGORIAS_NEGOCIO } = useCategoriasNegocio();
  const categoria = categorias.find((c) => c.valor === valor);
  const label = labelCategoriaNegocio(valor, categorias) ?? valor;

  const empresasDaCategoria = useMemo(
    () => empresas.filter((e) => e.categorias?.includes(valor)),
    [empresas, valor],
  );

  return (
    <div className="trapeza-home min-h-screen bg-background pb-10">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link
            to="/"
            aria-label="Voltar"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            {categoria?.imagem_url && (
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: "var(--tp-cream, #fdf6ec)" }}
              >
                <img src={categoria.imagem_url} alt="" className="w-[55%]" />
              </span>
            )}
            <h1 className="font-display text-base font-bold">{label}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-4">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Carregando...</p>
        ) : empresasDaCategoria.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhuma empresa encontrada nessa categoria ainda.
          </p>
        ) : (
          <>
            <p className="pb-3 text-xs text-muted-foreground">
              {empresasDaCategoria.length}{" "}
              {empresasDaCategoria.length === 1 ? "empresa encontrada" : "empresas encontradas"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {empresasDaCategoria.map((e) => (
                <BusinessCard key={e.id} empresa={e} variant="grid" />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
