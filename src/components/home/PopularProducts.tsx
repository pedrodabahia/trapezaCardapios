import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { brl } from "@/lib/format";
import type { TopProdutoPlataforma } from "@/lib/admin-server";

// Grade compacta com os produtos mais vendidos, cruzando várias empresas
// Trapeza ativas (o back-end já devolve isso ordenado por quantidade
// vendida — ver getTopProdutosPlataforma). Cada card leva direto pra
// página do produto, dentro do cardápio da empresa dele.
export function PopularProducts({ produtos }: { produtos: TopProdutoPlataforma[] }) {
  if (produtos.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-6">
      <h2 className="mb-2 font-display text-base font-bold">🔥 Mais procurados</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {produtos.slice(0, 8).map((p) => (
          <Link
            key={p.produtoId}
            to="/s/$slug/product/$id"
            params={{ slug: p.empresaSlug, id: p.produtoId }}
            className="group block"
          >
            <Card className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="aspect-square overflow-hidden bg-muted">
                {p.imagemUrl ? (
                  <img
                    src={p.imagemUrl}
                    alt={p.nome}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl">🛒</div>
                )}
              </div>
              <CardContent className="space-y-0.5 p-2.5">
                <h3 className="truncate text-xs font-semibold leading-tight">{p.nome}</h3>
                <p className="truncate text-[11px] text-muted-foreground">{p.empresaNome}</p>
                <p
                  className="text-xs font-bold"
                  style={{ color: "var(--tp-orange, #c65d3a)" }}
                >
                  {brl(p.precoAtual)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
