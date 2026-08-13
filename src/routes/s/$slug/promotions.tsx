import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { useEmpresaPublica, useProdutosPorEmpresa } from "@/lib/admin-store";

export const Route = createFileRoute("/s/$slug/promotions")({
  component: PromocoesPagina,
});

function PromocoesPagina() {
  const { slug } = Route.useParams();
  const { data: empresaCompleta } = useEmpresaPublica(slug);
  const produtos = useProdutosPorEmpresa(empresaCompleta);
  const promos = produtos.filter((p) => p.tag === "promocao");

  if (!empresaCompleta) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="font-display text-2xl font-bold">🔥 Promoções</h1>
      {promos.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Nenhuma promoção ativa no momento.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {promos.map((p) => (
            <ProductCard key={p.id} produto={p} slug={slug} />
          ))}
        </div>
      )}
    </div>
  );
}
