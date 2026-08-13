import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { getCartStore } from "@/lib/store";
import { useEmpresaPublica, useProdutosPorEmpresa } from "@/lib/admin-store";

export const Route = createFileRoute("/s/$slug/favorites")({
  component: FavoritosPagina,
});

function FavoritosPagina() {
  const { slug } = Route.useParams();
  const { data: empresaCompleta } = useEmpresaPublica(slug);
  const produtos = useProdutosPorEmpresa(empresaCompleta);
  const { favorites } = getCartStore(slug)();
  const favoritos = produtos.filter((p) => favorites.includes(p.id));

  if (!empresaCompleta) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold">
        <Heart className="h-6 w-6 text-brand-red" /> Favoritos
      </h1>
      {favoritos.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Você ainda não favoritou nenhum produto. Toque no coraçãozinho de um
          produto pra guardar aqui.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favoritos.map((p) => (
            <ProductCard key={p.id} produto={p} slug={slug} />
          ))}
        </div>
      )}
    </div>
  );
}
