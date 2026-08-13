import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import {
  useEmpresaPublica,
  useProdutosPorEmpresa,
  useCategoriaBySlug,
} from "@/lib/admin-store";

export const Route = createFileRoute("/s/$slug/category/$catSlug")({
  component: CategoriaPagina,
});

function CategoriaPagina() {
  const { slug, catSlug } = Route.useParams();
  const { data: empresaCompleta } = useEmpresaPublica(slug);
  const categoria = useCategoriaBySlug(empresaCompleta, catSlug);
  const produtos = useProdutosPorEmpresa(empresaCompleta, catSlug);

  if (!empresaCompleta) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <Link
        to="/s/$slug"
        params={{ slug }}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-brown"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="font-display text-2xl font-bold">
        {categoria ? `${categoria.emoji ?? ""} ${categoria.nome}` : "Categoria"}
      </h1>

      {produtos.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Nenhum produto nessa categoria ainda.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {produtos.map((p) => (
            <ProductCard key={p.id} produto={p} slug={slug} />
          ))}
        </div>
      )}
    </div>
  );
}
