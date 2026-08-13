import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useEmpresaPublica, useProdutosPorEmpresa } from "@/lib/admin-store";

export const Route = createFileRoute("/s/$slug/search")({
  component: BuscaPagina,
});

function BuscaPagina() {
  const { slug } = Route.useParams();
  const { data: empresaCompleta } = useEmpresaPublica(slug);
  const produtos = useProdutosPorEmpresa(empresaCompleta);
  const [termo, setTermo] = useState("");

  const resultado = useMemo(() => {
    const t = termo.trim().toLowerCase();
    if (!t) return produtos;
    return produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(t) ||
        (p.descricao_curta ?? "").toLowerCase().includes(t) ||
        (p.descricao ?? "").toLowerCase().includes(t) ||
        p.ingredientes.some((i) => i.toLowerCase().includes(t)),
    );
  }, [produtos, termo]);

  if (!empresaCompleta) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <div className="flex h-12 items-center gap-3 rounded-full border border-brand-yellow/40 bg-white px-5 card-shadow">
        <SearchIcon className="h-5 w-5 text-brand-red" />
        <input
          autoFocus
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por nome, ingrediente ou categoria..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {resultado.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Nada encontrado{termo ? ` para "${termo}"` : ""}.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {resultado.map((p) => (
            <ProductCard key={p.id} produto={p} slug={slug} />
          ))}
        </div>
      )}
    </div>
  );
}
